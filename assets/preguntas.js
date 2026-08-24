/* Página /preguntas: lo que espero, lo que doy, lo que no funcionó y lo que
   ella quiere hoy. Al final envía todo por push y le pide a Claude (vía
   /api/analizar, que guarda la API key en el servidor) un análisis de
   terapeuta de pareja. */
(function () {
  var ESPERO = [
    ["tranquila", "¿Te consideras una persona tranquila?"],
    ["paz", "¿Sientes que me puedes dar paz?"],
    ["apoyo-bajon", "¿Estarías ahí en mis días bajoneados?"],
    ["apoyo-proyectos", "¿Te sumarías a mis proyectos?"],
    ["familiar", "¿Eres de familia?"],
    ["mis-amigos", "¿Te gusta parchar con mis amigos?"],
    ["viajar", "¿Te gusta viajar?"],
    ["sincera", "¿Eres sincera conmigo, incluso cuando incomoda?"],
    ["lado-bueno", "¿Le ves el lado bueno a las cosas?"],
    ["independiente", "¿Eres independiente?"],
    ["trabajadora", "¿Eres trabajadora?"],
    ["amorosa", "¿Eres amorosa?"],
    ["atenta", "¿Eres atenta con los detalles?"],
    ["me-cuenta", "¿Me contarías cuando algo te pasa, sin guardártelo?"],
    ["hablar-tranquilo", "¿Crees que podemos hablar de todo con calma?"],
    ["problemas", "¿Podemos resolver los problemas sin agrandarlos?"],
    ["planes", "¿Te copias para todo tipo de planes?"],
    ["humilde", "¿Te consideras humilde?"],
    ["trato", "¿Tratas bien a las personas?"],
  ];

  var DOY = [
    ["tranquilidad", "¿Sientes que te doy tranquilidad?"],
    ["me-preocupo", "¿Sientes que me preocupo por ti?"],
    ["amor", "¿Sientes que te doy amor?"],
    ["union", "¿Sientes que te doy unión?"],
    ["su-gente", "¿Sientes que me integro con tu familia y tus amigos?"],
    ["viajes", "¿Sabes que quiero viajar contigo?"],
    ["celos", "¿Sientes que no soy celoso?"],
    ["libertad", "¿Sientes que te doy libertad?"],
    ["sincero", "¿Sientes que soy sincero?"],
    ["sensible", "¿Sientes que soy sensible?"],
    ["comunico", "¿Sientes que te comunico mis cosas?"],
    ["aprendo", "¿Sientes que aprendo a comunicarme contigo?"],
    ["atento", "¿Sientes que soy atento con lo que te gusta?"],
    ["apoyo", "¿Sientes que soy un apoyo para lo que necesites?"],
    ["tu-lugar", "¿Sientes que te doy tu lugar en mi vida?"],
    ["intenso", "¿Sientes que no soy intenso?"],
  ];

  var LIBRES = [
    "noFunciono",
    "noRepetir",
    "leGustaba",
    "comoQuiere",
    "faltaMi",
    "faltaNos",
  ];
  var OPCIONES = ["sí", "más o menos", "todavía no"];
  var KEY = "preguntas:v1";

  var estado = {};
  try {
    estado = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch (e) {}

  function guardar() {
    try {
      localStorage.setItem(KEY, JSON.stringify(estado));
    } catch (e) {}
  }

  if (window.Notif.fresh("preguntas")) {
    var visitas = window.Notif.bump("preguntas");
    window.Notif.send(
      "❓ Entró a las preguntas",
      ESPERO.length +
        DOY.length +
        " preguntas" +
        (visitas > 1 ? "\n🔁 visita n.º " + visitas : ""),
    );
  }

  /* pinta un bloque de preguntas dentro de su <div id> */
  function render(id, items) {
    var host = document.getElementById(id);
    items.forEach(function (it, i) {
      var key = it[0],
        texto = it[1];

      var q = document.createElement("div");
      q.className = "q";

      var t = document.createElement("div");
      t.className = "q-t";
      t.textContent = i + 1 + ". " + texto;
      q.appendChild(t);

      var ops = document.createElement("div");
      ops.className = "ops";
      OPCIONES.forEach(function (op) {
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

  render("qEspero", ESPERO);
  render("qDoy", DOY);

  /* textos libres: se guardan mientras escribe */
  LIBRES.forEach(function (id) {
    var el = document.getElementById(id);
    el.value = estado[id] || "";
    el.addEventListener("input", function () {
      estado[id] = el.value;
      guardar();
    });
  });

  /* respuesta a la invitación */
  var invBtns = document.querySelectorAll("#invita .op");
  Array.prototype.forEach.call(invBtns, function (b) {
    if (estado.invitacion === b.dataset.v) b.classList.add("on");
    b.addEventListener("click", function () {
      estado.invitacion = b.dataset.v;
      guardar();
      Array.prototype.forEach.call(invBtns, function (o) {
        o.classList.toggle("on", o === b);
      });
      window.Notif.send(
        "💙 Kata respondió a la invitación",
        "¿Empezamos otra vez? → " + b.dataset.v,
      );
    });
  });

  var total = ESPERO.length + DOY.length;
  var cnt = document.getElementById("cnt");
  var fill = document.getElementById("pfill");

  function respondidas() {
    return ESPERO.concat(DOY).filter(function (it) {
      return estado[it[0]];
    }).length;
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
  var box = document.getElementById("analisis");
  var txt = document.getElementById("analisisTxt");

  function resumen() {
    var lineas = [];
    function bloque(titulo, items) {
      lineas.push(titulo);
      items.forEach(function (it) {
        lineas.push("· " + it[0] + ": " + (estado[it[0]] || "—"));
      });
      lineas.push("");
    }
    bloque("LO QUE ESPERO", ESPERO);
    bloque("LO QUE DOY", DOY);
    LIBRES.forEach(function (id) {
      if (estado[id]) lineas.push(id + ": " + estado[id]);
    });
    lineas.push("");
    lineas.push(
      "¿Empezamos otra vez? → " + (estado.invitacion || "sin responder"),
    );
    return lineas.join("\n");
  }

  function datosParaAnalisis() {
    function pares(items) {
      return items.map(function (it) {
        return { q: it[1], a: estado[it[0]] || "" };
      });
    }
    var d = {
      espero: pares(ESPERO),
      doy: pares(DOY),
      invitacion: estado.invitacion,
    };
    LIBRES.forEach(function (id) {
      d[id] = estado[id] || "";
    });
    return d;
  }

  /* markdown mínimo: ## título, - viñeta, **negrita** */
  function pintar(md) {
    txt.innerHTML = "";
    md.split("\n").forEach(function (linea) {
      var l = linea.trim();
      if (!l) return;
      var el;
      if (l.indexOf("## ") === 0) {
        el = document.createElement("h3");
        l = l.slice(3);
      } else if (l.indexOf("- ") === 0 || l.indexOf("* ") === 0) {
        el = document.createElement("p");
        el.className = "bullet";
        l = l.slice(2);
      } else {
        el = document.createElement("p");
      }
      l.split(/\*\*/).forEach(function (parte, i) {
        if (!parte) return;
        if (i % 2) {
          var b = document.createElement("strong");
          b.textContent = parte;
          el.appendChild(b);
        } else {
          el.appendChild(document.createTextNode(parte));
        }
      });
      txt.appendChild(el);
    });
    box.hidden = false;
  }

  send.addEventListener("click", async function () {
    send.disabled = true;
    send.textContent = "enviando…";

    window.Notif.send(
      "📝 Kata respondió las preguntas",
      respondidas() + "/" + total + " respondidas\n\n" + resumen(),
    );
    msg.textContent = "Ya me llegaron tus respuestas. Ahora el análisis…";
    send.textContent = "leyendo tus respuestas…";

    try {
      var r = await fetch("/api/analizar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(datosParaAnalisis()),
      });
      var j = await r.json();
      if (!r.ok || !j.texto) throw new Error(j.error || "respuesta inesperada");

      pintar(j.texto);
      box.scrollIntoView({ behavior: "smooth", block: "start" });
      msg.textContent =
        "Listo: el análisis quedó abajo, y también me llegó a mí.";
      send.textContent = "enviado ♥";
      window.Notif.send("🧠 Análisis del terapeuta", j.texto.slice(0, 3000));
    } catch (e) {
      msg.textContent =
        "Tus respuestas ya me llegaron, pero el análisis no se pudo generar (" +
        e.message +
        "). Se puede intentar de nuevo.";
      send.disabled = false;
      send.textContent = "intentar el análisis otra vez";
    }
  });
})();
