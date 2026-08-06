/* Fondo con íconos flotantes (palmera, sushi, avión, ola, corazón).
   Inyecta los símbolos SVG y los coloca en #bg. */
(function () {
  var DEFS =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<symbol id="ic-palm" viewBox="0 0 24 24">' +
    '<path d="M14.4 9.6c-1.7 3.3-2.4 6.9-2.2 11.4"/>' +
    '<path d="M14.5 8.6C11.5 6.3 7.6 7.1 5 10.6c2.6-1.6 5-1.8 7-.6"/>' +
    '<path d="M14.5 8.6c3-2.3 6.4-1.5 8.5 2-2.3-1.6-4.5-1.8-6.3-.6"/>' +
    '<path d="M14.5 8.6C13.4 5.5 11 3.7 7.3 3.7c2.9.9 4.8 2.5 5.7 4.6"/>' +
    '<path d="M14.5 8.6c1.6-2.8 4.3-4 7.6-3.5-2.8.4-4.8 1.7-5.9 3.6"/>' +
    '<circle cx="13.2" cy="10.7" r=".6"/><circle cx="15.6" cy="10.4" r=".6"/>' +
    "</symbol>" +
    '<symbol id="ic-sushi" viewBox="0 0 24 24">' +
    '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="6.4"/>' +
    '<circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="7.9" r="1.1"/>' +
    '<circle cx="8.6" cy="14" r="1.1"/><circle cx="15.4" cy="14" r="1.1"/>' +
    "</symbol>" +
    '<symbol id="ic-plane" viewBox="0 0 24 24">' +
    '<path d="M12 2.4c.95 0 1.6 1.15 1.6 2.6v3.7l6.9 4.1v2.1l-6.9-2.2v3.9l2.5 1.85v1.55L12 19.1l-4.1.9v-1.55L10.4 16.6v-3.9L3.5 14.9v-2.1l6.9-4.1V5c0-1.45.65-2.6 1.6-2.6z"/>' +
    "</symbol>" +
    '<symbol id="ic-wave" viewBox="0 0 24 24">' +
    '<path d="M2.5 12.6C4.2 8 8 5.4 12.2 6c3.1.45 4.8 2.6 4.5 4.75-.3 1.95-2.25 3.1-4 2.5-1.35-.5-1.9-1.95-1.25-3"/>' +
    '<path d="M2 17.4c1.6 0 2.3-1.2 3.9-1.2s2.3 1.2 3.9 1.2 2.3-1.2 3.9-1.2 2.3 1.2 3.9 1.2 2.3-1.2 3.9-1.2"/>' +
    '<path d="M4.6 20.8c1.5 0 2.1-1 3.6-1s2.1 1 3.6 1 2.1-1 3.6-1 2.1 1 3.6 1"/>' +
    "</symbol>" +
    '<symbol id="ic-heart" viewBox="0 0 24 24">' +
    '<path d="M12 20.4S3.5 15.2 3.5 9.4A4.65 4.65 0 0 1 12 6.8a4.65 4.65 0 0 1 8.5 2.6c0 5.8-8.5 11-8.5 11z"/>' +
    "</symbol></defs></svg>";

  // [icono, left%, top%, tamaño, rotación, opacidad, duración, tono claro]
  var ICONS = [
    ["palm", 5, 8, 86, -6, 0.16, 16, 0],
    ["heart", 87, 7, 60, 10, 0.18, 19, 1],
    ["wave", 74, 18, 92, 0, 0.14, 21, 0],
    ["sushi", 9, 28, 70, 6, 0.16, 18, 1],
    ["plane", 89, 38, 58, -6, 0.16, 15, 0],
    ["heart", 6, 45, 58, -8, 0.18, 20, 1],
    ["palm", 86, 58, 80, 8, 0.14, 17, 0],
    ["sushi", 7, 68, 66, 0, 0.16, 22, 1],
    ["plane", 77, 73, 56, -6, 0.15, 16, 0],
    ["wave", 16, 85, 72, 8, 0.15, 19, 1],
    ["heart", 49, 90, 54, 0, 0.13, 18, 0],
    ["sushi", 47, 3, 56, 6, 0.14, 20, 1],
    ["plane", 30, 60, 52, 12, 0.1, 23, 0],
    ["wave", 63, 47, 62, 0, 0.09, 17, 1],
    ["heart", 60, 12, 46, -8, 0.12, 15, 0],
    ["palm", 24, 21, 58, -6, 0.12, 21, 1],
    ["sushi", 83, 52, 60, 6, 0.17, 18, 0],
  ];

  document.body.insertAdjacentHTML("afterbegin", DEFS);
  var bg = document.getElementById("bg");
  if (!bg) {
    bg = document.createElement("div");
    bg.className = "bg";
    bg.id = "bg";
    document.body.insertAdjacentElement("afterbegin", bg);
  }
  ICONS.forEach(function (spec, n) {
    var t = spec[0];
    var d = document.createElement("div");
    d.className = "ic" + (spec[7] ? " g" : "");
    d.style.cssText =
      "left:" +
      spec[1] +
      "%;top:" +
      spec[2] +
      "%;width:" +
      spec[3] +
      "px;height:" +
      spec[3] +
      "px;opacity:" +
      spec[5] +
      ";--r:" +
      spec[4] +
      "deg;animation-duration:" +
      spec[6] +
      "s;animation-delay:-" +
      n +
      "s";
    d.innerHTML = '<svg viewBox="0 0 24 24"><use href="#ic-' + t + '"/></svg>';
    bg.appendChild(d);
  });
})();
