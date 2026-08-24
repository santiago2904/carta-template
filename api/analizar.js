/* Proxy a la API de Anthropic. La API key vive SOLO aquí, como variable de
   entorno del servidor (ANTHROPIC_API_KEY), nunca en el navegador.

   Despliegue: Vercel lo detecta solo (carpeta /api = función Node, el resto del
   repo se sirve como estático). Sin dependencias: usa el fetch de Node 18+. */

var MODELO = "claude-opus-5";

var SYSTEM = [
  "Eres un terapeuta de pareja con veinte años de experiencia (enfoque Gottman",
  "y terapia centrada en las emociones). Vas a leer un cuestionario que Santiago",
  "preparó para Kata: estuvieron juntos, se separaron, y él quiere volver.",
  "",
  "El cuestionario tiene tres partes: (1) lo que Santiago espera de una relación,",
  "respondido por ella sobre sí misma; (2) lo que Santiago da, respondido por ella",
  "según lo que sintió de verdad; (3) textos libres de ella sobre qué no funcionó,",
  "qué no quiere repetir, qué le gustaba y cómo quiere vivir un vínculo hoy.",
  "",
  "Escribe un análisis dirigido a los dos, en español de Colombia, cálido pero",
  "profesional y directo. Reglas:",
  "- Sé honesto. Si las respuestas muestran que ella no está disponible o que las",
  "  expectativas no coinciden, dilo con respeto: tu trabajo no es empujar a que",
  "  vuelvan, es decir lo que las respuestas muestran.",
  "- No inventes: si un campo viene vacío o sin responder, nómbralo como un vacío",
  "  de información, no como un hallazgo.",
  "- Nada de culpar a nadie. Habla de dinámicas, no de defectos.",
  "- Concreto: los pasos deben ser acciones observables, no consejos genéricos.",
  "",
  "Formato de salida en Markdown simple (solo '## título', '- viñeta' y '**negrita**'),",
  "máximo 600 palabras, con estas secciones exactas:",
  "## Lo que veo",
  "## Dónde coinciden",
  "## Lo que hay que trabajar",
  "## Cómo empezar (4 pasos concretos)",
  "## Mi recomendación",
].join("\n");

function limpia(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max || 1500);
}

/* Arma el texto del caso aquí, en el servidor: el navegador solo manda datos. */
function armarCaso(datos) {
  var out = [];

  function bloque(titulo, items) {
    out.push("### " + titulo);
    (Array.isArray(items) ? items : []).slice(0, 40).forEach(function (it) {
      out.push(
        "- " +
          limpia(it && it.q, 200) +
          " → " +
          (limpia(it && it.a, 40) || "sin responder"),
      );
    });
    out.push("");
  }

  bloque(
    "Lo que Santiago espera (respondido por ella sobre sí misma)",
    datos.espero,
  );
  bloque(
    "Lo que Santiago da (respondido por ella según lo que sintió)",
    datos.doy,
  );

  out.push("### Respuestas abiertas de ella");
  [
    ["Qué cree que no funcionó", datos.noFunciono],
    ["Qué no quiere repetir", datos.noRepetir],
    ["Qué le gustaba de la relación", datos.leGustaba],
    ["Cómo quiere vivir un vínculo hoy", datos.comoQuiere],
    ["Qué le falta de Santiago / qué tendría que cambiar él", datos.faltaMi],
    ["Qué nos falta a los dos y cómo mejorarlo", datos.faltaNos],
  ].forEach(function (p) {
    out.push("- " + p[0] + ": " + (limpia(p[1], 2000) || "(vacío)"));
  });
  out.push("");
  out.push(
    "Respuesta de ella a la invitación de volver a intentarlo: " +
      (limpia(datos.invitacion, 60) || "sin responder"),
  );

  return out.join("\n");
}

async function pedir(key, body) {
  var r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  return {
    ok: r.ok,
    status: r.status,
    json: await r.json().catch(function () {
      return null;
    }),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  var key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Falta la variable ANTHROPIC_API_KEY" });
    return;
  }

  var datos = req.body;
  if (typeof datos === "string") {
    try {
      datos = JSON.parse(datos);
    } catch (e) {
      datos = null;
    }
  }
  if (!datos || typeof datos !== "object") {
    res.status(400).json({ error: "Cuerpo inválido" });
    return;
  }

  var body = {
    model: MODELO,
    max_tokens: 8000,
    output_config: { effort: "medium" },
    system: SYSTEM,
    messages: [{ role: "user", content: armarCaso(datos) }],
    // si la cuenta no tiene la beta habilitada, se reintenta sin esto
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  };

  try {
    var r = await pedir(key, body);

    if (!r.ok && r.status === 400) {
      delete body.betas;
      delete body.fallbacks;
      r = await pedir(key, body);
    }

    if (!r.ok) {
      res.status(502).json({
        error:
          (r.json && r.json.error && r.json.error.message) ||
          "La API respondió " + r.status,
      });
      return;
    }

    if (r.json.stop_reason === "refusal") {
      res.status(200).json({
        texto:
          "No pude generar el análisis esta vez. Intenten de nuevo o hablen esto " +
          "con alguien de confianza.",
      });
      return;
    }

    var texto = (r.json.content || [])
      .filter(function (b) {
        return b.type === "text";
      })
      .map(function (b) {
        return b.text;
      })
      .join("\n")
      .trim();

    res.status(200).json({ texto: texto || "La respuesta llegó vacía." });
  } catch (e) {
    res
      .status(502)
      .json({ error: "No se pudo contactar la API: " + e.message });
  }
}
