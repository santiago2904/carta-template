/* Notificaciones push con ntfy.sh
   1) Instala la app "ntfy" (iOS/Android) o abre https://ntfy.sh
   2) Suscríbete EXACTAMENTE a este tema:                                   */
window.NTFY_TOPIC = "carta-kata-santi-4t7wq9"; // <- cámbialo por algo único tuyo

(function () {
  var ctx = "";

  // contexto del visitante (dispositivo + ubicación aproximada), una sola vez
  var ready = (async function () {
    var lines = [
      "📱 " + navigator.userAgent,
      "🖥️ " +
        (screen.width || "?") +
        "x" +
        (screen.height || "?") +
        " · " +
        (navigator.language || ""),
      "🕒 " + new Date().toLocaleString("es-CO"),
    ];
    try {
      var j = await (await fetch("https://ipwho.is/")).json();
      if (j && j.success !== false) {
        var geo = [j.city, j.region, j.country].filter(Boolean).join(", ");
        if (j.connection && j.connection.isp) geo += " · " + j.connection.isp;
        if (j.ip) geo += " · IP " + j.ip;
        lines.unshift("📍 " + geo);
      }
    } catch (e) {}
    ctx = lines.join("\n");
  })();

  // Se publica en modo JSON (no por headers): los headers HTTP solo admiten
  // ASCII y los títulos llevan emojis y tildes, que hacían fallar el envío.
  function post(title, body, priority) {
    if (!window.NTFY_TOPIC) return;
    try {
      fetch("https://ntfy.sh/", {
        method: "POST",
        body: JSON.stringify({
          topic: window.NTFY_TOPIC,
          title: title,
          message: body,
          priority: priority === "high" ? 4 : 3,
          tags: ["heart"],
        }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  // espera el contexto como máximo 2.5s para no retrasar el aviso
  function withCtx(fn) {
    var done = false;
    var go = function () {
      if (!done) {
        done = true;
        fn(ctx);
      }
    };
    ready.then(go, go);
    setTimeout(go, 2500);
  }

  // Sin ventanas de tiempo: cada vez que abre la página cuenta como lectura
  // nueva y te llega el aviso. Lo único que no se repite es el mismo hito
  // dentro de la misma carga (para no avisar dos veces si va y vuelve entre
  // páginas de la carta).
  var enEstaCarga = {};

  window.Notif = {
    send: function (title, extra, priority) {
      withCtx(function (c) {
        post(title, (extra ? extra + "\n\n" : "") + c, priority || "high");
      });
    },

    // ¿es la primera vez que pasa este hito en esta carga? true = avisa
    fresh: function (key) {
      if (enEstaCarga[key]) return false;
      enEstaCarga[key] = 1;
      return true;
    },

    // contador de veces que ocurre algo (p. ej. aperturas de una carta)
    bump: function (key) {
      var n = 1;
      try {
        n = parseInt(localStorage.getItem("cont:" + key) || "0", 10) + 1;
        localStorage.setItem("cont:" + key, String(n));
      } catch (e) {}
      return n;
    },

    once: function (key, title, extra, priority) {
      if (window.Notif.fresh(key)) window.Notif.send(title, extra, priority);
    },
  };
})();
