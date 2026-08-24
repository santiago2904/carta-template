/* Página /preguntas.

   El cuestionario está diseñado con criterio clínico (Gottman / EFT), no como
   lista de rasgos. Tres decisiones que importan si alguien lo edita:

   1. Nada de preguntas de rasgo ("¿eres humilde?", "¿tratas bien a la gente?").
      Se contestan "sí" siempre y no dan información. Todo va en conducta
      observable ("cuando algo se daña, ¿te resulta fácil reconocer tu parte?").
   2. Bloque 1 pregunta por lo que YA pasó (evidencia), bloque 2 por cómo
      funciona ella en una relación, bloque 3 por su disposición hoy — que es lo
      que de verdad predice si un plan puede funcionar.
   3. Nada está formulado en negativo/invertido: en las tres escalas la primera
      opción es siempre la más favorable, para que el agente no tenga que
      adivinar la dirección de cada ítem.

   Los 19 "espero" y 16 "doy" originales siguen cubiertos; lo que se agrupó fue
   lo que medía lo mismo (tranquila + dar paz + no agrandar los problemas +
   poder hablar con calma = manejo del conflicto). */
(function () {
  var FREC = ["casi siempre", "a veces", "casi nunca", "no sabría decir"];
  var HOY = ["sí", "creo que sí", "no sé todavía", "hoy no"];

  var BLOQUES = [
    {
      id: "qViviste",
      titulo: "Lo que viviste conmigo",
      escala: FREC,
      items: [
        ["paz", "Cuando estábamos juntos, ¿te sentías tranquila conmigo?"],
        [
          "atento",
          "¿Sentías que me daba cuenta de cómo estabas sin que tuvieras que decírmelo?",
        ],
        ["amor", "¿Te sentías querida de una forma que de verdad te llegaba?"],
        [
          "tu-lugar",
          "¿Sentías que tenías un lugar claro en mi vida, por delante de otras cosas?",
        ],
        [
          "su-gente",
          "¿Sentías que yo hacía el esfuerzo de estar con tu familia y tus amigos?",
        ],
        [
          "libertad",
          "¿Sentías que podías tener tu vida propia sin que yo lo tomara mal?",
        ],
        [
          "espacio",
          "¿Sentías que yo respetaba tu espacio cuando necesitabas estar sola?",
        ],
        [
          "sincero",
          "¿Sentías que te decía las cosas de frente, incluso las incómodas?",
        ],
        ["comunico", "¿Sentías que te contaba lo que me pasaba por dentro?"],
        ["sensible", "¿Podías ver cuándo algo me dolía de verdad?"],
        [
          "decir-sin-crecer",
          "¿Podías decirme que algo te molestaba sin que se volviera un problema más grande?",
        ],
        [
          "reparar",
          "Después de una pelea, ¿lográbamos volver a estar bien en poco tiempo?",
        ],
        [
          "aprendo",
          "Cuando te molestaba algo de cómo yo te hablaba, ¿veías que yo lo intentaba cambiar?",
        ],
        [
          "apoyo",
          "Cuando necesitabas algo, ¿sentías que podías contar conmigo?",
        ],
      ],
    },
    {
      id: "qTu",
      titulo: "Cómo funcionas tú en una relación",
      escala: FREC,
      items: [
        [
          "dice-cuando-pasa",
          "Cuando algo te molesta, ¿logras decirlo en el momento en vez de guardártelo?",
        ],
        [
          "conflicto",
          "En una discusión, ¿logras quedarte en el tema sin que se abra a otras cosas?",
        ],
        [
          "reconoce",
          "Cuando algo se daña, ¿te resulta fácil reconocer tu parte?",
        ],
        [
          "lado-bueno",
          "Cuando algo sale mal, ¿tiendes a buscar la salida antes que lo peor?",
        ],
        ["sincera", "¿Dices lo que piensas aunque incomode?"],
        [
          "beneficio-duda",
          "¿Sueles darle a la gente el beneficio de la duda antes de asumir lo malo?",
        ],
        [
          "acompana",
          "Cuando alguien que quieres está bajoneado, ¿te sale acercarte y quedarte ahí?",
        ],
        [
          "proyectos",
          "¿Te interesa de verdad lo que la otra persona está construyendo?",
        ],
        ["familia", "¿La familia es una parte importante de tu vida?"],
        [
          "amigos",
          "¿Te sientes cómoda metiéndote en el grupo de amigos de tu pareja?",
        ],
        ["planes", "¿Te prende hacer planes nuevos, incluso los improvisados?"],
        [
          "vida-propia",
          "¿Tienes tu vida y tus cosas andando, aparte de la relación?",
        ],
        ["carino", "¿Te sale demostrar cariño con facilidad?"],
        ["detalles", "¿Te fijas en los detalles de lo que le gusta al otro?"],
      ],
    },
    {
      id: "qHoy",
      titulo: "Dónde estás hoy",
      escala: HOY,
      items: [
        ["queda-algo", "¿Sientes que entre nosotros todavía queda algo?"],
        [
          "intentar",
          "¿Te gustaría volver a intentarlo si las cosas cambiaran de verdad?",
        ],
        [
          "hablar-lo-que-paso",
          "¿Estarías dispuesta a hablar de lo que pasó, aunque sea incómodo?",
        ],
        ["creo-cambio", "¿Crees que yo puedo cambiar lo que haya que cambiar?"],
        [
          "avisar",
          "¿Estarías dispuesta a decirme en el momento cuando algo te incomode?",
        ],
        [
          "planes-juntos",
          "¿Te gustaría que volviéramos a hacer planes juntos: viajes, parches, familia?",
        ],
        ["tiempo", "¿Necesitas tiempo antes de cualquier paso?"],
      ],
    },
  ];

  var TEXTOS = [
    ["noFunciono", "¿Qué crees que fue lo que no funcionó entre nosotros?"],
    [
      "noRepetir",
      "¿Qué es lo que no quieres repetir, ni conmigo ni con nadie?",
    ],
    ["leGustaba", "¿Qué te gustaba de nuestra relación?"],
    [
      "comoQuiere",
      "¿Cómo quieres tener una relación o sostener un vínculo con alguien ahora mismo?",
    ],
    ["paraConfiar", "¿Qué necesitarías ver de mí para volver a confiar?"],
    ["faltaMi", "¿Qué te falta de mí, o qué tendría que cambiar yo?"],
    ["faltaNos", "¿Qué nos falta a los dos, y cómo lo mejoramos?"],
  ];

  var KEY = "preguntas:v2";

  var estado = {};
  try {
    estado = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch (e) {}

  function guardar() {
    try {
      localStorage.setItem(KEY, JSON.stringify(estado));
    } catch (e) {}
  }

  var total = BLOQUES.reduce(function (n, b) {
    return n + b.items.length;
  }, 0);

  if (window.Notif.fresh("preguntas")) {
    var visitas = window.Notif.bump("preguntas");
    window.Notif.send(
      "❓ Entró a las preguntas",
      total + " preguntas" + (visitas > 1 ? "\n🔁 visita n.º " + visitas : ""),
    );
  }

  /* pinta un bloque dentro de su <div id>, con su propia escala */
  function render(bloque) {
    var host = document.getElementById(bloque.id);
    bloque.items.forEach(function (it, i) {
      var key = it[0];

      var q = document.createElement("div");
      q.className = "q";

      var t = document.createElement("div");
      t.className = "q-t";
      t.textContent = i + 1 + ". " + it[1];
      q.appendChild(t);

      var ops = document.createElement("div");
      ops.className = "ops";
      bloque.escala.forEach(function (op) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "op" + (estado[key] === op ? " on" : "");
        b.textContent = op;
        b.addEventListener("click", function () {
          estado[key] = op;
          guardar();
          Array.prototype.forEach.call(ops.children, function (o) {
            o.classList.toggle("on", o === b);
          });
          contar();
        });
        ops.appendChild(b);
      });
      q.appendChild(ops);
      host.appendChild(q);
    });
  }

  BLOQUES.forEach(render);

  /* textos libres: se guardan mientras escribe */
  TEXTOS.forEach(function (t) {
    var el = document.getElementById(t[0]);
    el.value = estado[t[0]] || "";
    el.addEventListener("input", function () {
      estado[t[0]] = el.value;
      guardar();
    });
  });

  var cnt = document.getElementById("cnt");
  var fill = document.getElementById("pfill");

  function respondidas() {
    var n = 0;
    BLOQUES.forEach(function (b) {
      b.items.forEach(function (it) {
        if (estado[it[0]]) n++;
      });
    });
    return n;
  }

  function contar() {
    var n = respondidas();
    cnt.textContent = n + " / " + total + " respondidas";
    fill.style.width = (n / total) * 100 + "%";
  }
  contar();

  /* --- envío + análisis --- */
  var send = document.getElementById("send");
  var msg = document.getElementById("sendMsg");

  /* lo que se manda al agente (y, en texto, al push) */
  function payload() {
    return {
      bloques: BLOQUES.map(function (b) {
        return {
          titulo: b.titulo,
          escala: b.escala,
          respuestas: b.items.map(function (it) {
            return { q: it[1], a: estado[it[0]] || "" };
          }),
        };
      }),
      textos: TEXTOS.map(function (t) {
        return { p: t[1], r: estado[t[0]] || "" };
      }),
    };
  }

  function resumen() {
    var lineas = [];
    BLOQUES.forEach(function (b) {
      lineas.push(b.titulo.toUpperCase());
      b.items.forEach(function (it) {
        lineas.push("· " + it[0] + ": " + (estado[it[0]] || "—"));
      });
      lineas.push("");
    });
    TEXTOS.forEach(function (t) {
      if (estado[t[0]]) lineas.push(t[0] + ": " + estado[t[0]]);
    });
    return lineas.join("\n");
  }

  send.addEventListener("click", async function () {
    send.disabled = true;
    send.textContent = "enviando…";

    window.Notif.send(
      "📝 Kata respondió las preguntas",
      respondidas() + "/" + total + " respondidas\n\n" + resumen(),
    );
    msg.textContent = "Ya me llegaron tus respuestas. Gracias ♥";
    send.textContent = "enviado ♥";

    try {
      var r = await fetch("/api/analizar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload()),
      });
      var j = await r.json();
      if (!r.ok || !j.texto) throw new Error(j.error || "respuesta inesperada");

      window.Notif.send("🧠 Análisis del terapeuta", j.texto.slice(0, 3000));
    } catch (e) {
      /* el análisis es solo para mí: si falla, ella no se entera */
      window.Notif.send("⚠️ El análisis falló", String(e.message || e));
    }
  });
})();
