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
  "El cuestionario tiene cuatro partes, todas respondidas por ella: (1) lo que",
  "vivió con él — evidencia de lo que él daba de verdad; (2) cómo funciona ella",
  "en una relación, en conductas concretas; (3) dónde está hoy: disposición y",
  "ritmo; (4) textos libres sobre qué no funcionó, qué no quiere repetir, qué le",
  "gustaba, cómo quiere un vínculo hoy y qué necesitaría para volver a confiar.",
  "",
  "Cómo leerlo: en cada bloque de escala la primera opción es la más favorable y",
  "la última la menos. 'No sabría decir' o 'no sé todavía' son falta de datos, no",
  "una respuesta negativa. El bloque 3 es el que manda para el ritmo del plan, y",
  "los textos libres pesan más que las escalas: ahí está lo que ella pide de",
  "verdad. Si un patrón aparece en las escalas y ella lo nombra en los textos,",
  "eso es lo prioritario del plan.",
  "",
  "Escribe un análisis dirigido a los dos, en español de Colombia, cálido pero",
  "profesional y directo.",
  "",
  "TU ENCARGO: la pregunta que te hacen no es SI deberían volver, es CÓMO se",
  "reconstruye. Trabajas sobre la premisa de que los dos quieren intentarlo de",
  "nuevo, y tu tarea es trazar el camino. Reglas:",
  "- Nunca emitas un veredicto de que no deberían volver, ni sugieras cerrar la",
  "  puerta, ni pongas el análisis en modo 'evaluación de viabilidad'.",
  "- Cuando algo se vea difícil, no lo conviertas en una conclusión negativa:",
  "  tradúcelo en un requisito concreto. En vez de 'esto no va a funcionar', di",
  "  'para que esto funcione hace falta X, y así se logra'.",
  "- Si en sus textos ella dice que hoy necesita tiempo o que no está lista, no la",
  "  presiones ni le pidas una decisión: el plan entonces es el camino al ritmo",
  "  que ella misma describió, empezando por lo que sí está dispuesta a hacer.",
  "- No inventes: si un campo viene vacío o sin responder, nómbralo como un vacío",
  "  de información, no como un hallazgo.",
  "- Nada de culpar a nadie. Habla de dinámicas, no de defectos.",
  "- Concreto: los pasos deben ser acciones observables, no consejos genéricos.",
  "",
  "Formato de salida en Markdown simple (solo '## título', '- viñeta' y '**negrita**'),",
  "máximo 600 palabras, con estas secciones exactas:",
  "## Lo que veo",
  "## La base que ya tienen",
  "## Lo que hay que reparar",
  "## El plan para volver (4 pasos concretos)",
  "## Por dónde empezar esta semana",
].join("\n");

function limpia(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max || 1500);
}

/* Arma el texto del caso aquí, en el servidor: el navegador solo manda datos.
   Es genérico a propósito — si el cuestionario cambia en preguntas.js, esto no
   se toca. */
function armarCaso(datos) {
  var out = [];

  (Array.isArray(datos.bloques) ? datos.bloques : [])
    .slice(0, 6)
    .forEach(function (b) {
      out.push("### " + (limpia(b && b.titulo, 120) || "Bloque"));
      if (b && Array.isArray(b.escala)) {
        out.push(
          "(escala, de la más favorable a la menos: " +
            b.escala
              .slice(0, 6)
              .map(function (e) {
                return limpia(e, 40);
              })
              .join(" / ") +
            ")",
        );
      }
      (b && Array.isArray(b.respuestas) ? b.respuestas : [])
        .slice(0, 40)
        .forEach(function (it) {
          out.push(
            "- " +
              limpia(it && it.q, 220) +
              " → " +
              (limpia(it && it.a, 40) || "sin responder"),
          );
        });
      out.push("");
    });

  out.push("### Respuestas abiertas de ella");
  (Array.isArray(datos.textos) ? datos.textos : [])
    .slice(0, 12)
    .forEach(function (t) {
      out.push(
        "- " +
          limpia(t && t.p, 220) +
          "\n  " +
          (limpia(t && t.r, 2000) || "(vacío)"),
      );
    });

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
