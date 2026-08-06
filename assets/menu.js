/* Menú: lista las cartas registradas en window.LETTERS, de la más nueva a la
   más vieja, y avisa por push cuando alguien entra. */
(function () {
  var list = (window.LETTERS || []).slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  if (window.Notif.fresh("menu")) {
    var visitas = window.Notif.bump("menu");
    window.Notif.send(
      "💌 Entraron al menú de cartas",
      list.length +
        " cartas disponibles" +
        (visitas > 1 ? "\n🔁 visita n.º " + visitas : ""),
    );
  }

  var el = document.getElementById("letterList");
  el.innerHTML = list
    .map(function (L) {
      var leida = null;
      try {
        leida = localStorage.getItem("leida:" + L.n);
      } catch (e) {}
      return (
        '<a class="card-link" href="' +
        L.file +
        '">' +
        '<div class="no">carta #' +
        L.n +
        "</div>" +
        '<div class="tt">' +
        L.title +
        "</div>" +
        '<div class="dt">' +
        L.dateLabel +
        "</div>" +
        (L.teaser ? '<div class="dt">' + L.teaser + "</div>" : "") +
        '<div class="st">' +
        (leida ? "✓ ya la leíste · ábrela otra vez" : "toca para leerla") +
        "</div>" +
        "</a>"
      );
    })
    .join("");
})();
