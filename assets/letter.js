/* Motor de lectura: monta las páginas de window.LETTERS[0], anima el texto,
   maneja la navegación y avisa por push los hitos de lectura. */
(function () {
  var L = (window.LETTERS || [])[0];
  if (!L) return;

  document.body.classList.add("reading");
  document.title = "#" + L.n + " · " + L.title;

  var SP_ICON =
    '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.44c-.19.31-.59.41-.9.22-2.46-1.5-5.56-1.84-9.21-1.01-.35.08-.7-.14-.78-.49-.08-.35.14-.7.49-.78 4-.92 7.43-.52 10.19 1.16.31.19.41.6.21.9zm1.23-2.73c-.24.38-.74.5-1.12.27-2.81-1.73-7.1-2.23-10.42-1.22-.43.13-.88-.11-1.01-.54-.13-.43.11-.88.54-1.01 3.8-1.15 8.53-.59 11.76 1.39.38.23.5.74.25 1.11zm.11-2.84C14.7 8.87 9.4 8.69 6.3 9.63c-.51.15-1.05-.13-1.2-.64-.15-.51.13-1.05.64-1.2 3.56-1.08 9.42-.87 13.14 1.33.46.27.61.87.34 1.33-.27.45-.87.6-1.33.33z"/></svg>';

  var P = L.pages;
  var tag = "carta #" + L.n + " · " + L.title;
  var stage = document.getElementById("stage");
  var reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;

  // ---- hitos ----
  // Cada lectura nueva (pasado el cooldown de notify.js) vuelve a avisar,
  // con el número de vez para que se note cuándo la están releyendo.
  var vez = "";
  if (window.Notif.fresh("open:" + L.n)) {
    var n = window.Notif.bump("abrir:" + L.n);
    vez =
      n === 1
        ? "es la primera vez que la abre"
        : "🔁 relectura: la abre por " + n + ".ª vez";
    window.Notif.send("📖 Abrieron la carta #" + L.n, tag + "\n" + vez);
  }

  var halfAt = Math.ceil(P.length / 2); // en número de página (1-based)
  function trackProgress() {
    var page = i + 1;
    if (page >= halfAt && page < P.length && window.Notif.fresh("half:" + L.n)) {
      window.Notif.send(
        "👀 Va por la mitad de la carta #" + L.n,
        tag + "\npágina " + page + " de " + P.length + (vez ? "\n" + vez : ""),
      );
    }
    if (page === P.length && window.Notif.fresh("end:" + L.n)) {
      try {
        localStorage.setItem("leida:" + L.n, new Date().toISOString());
      } catch (e) {}
      var veces = window.Notif.bump("terminar:" + L.n);
      window.Notif.send(
        "💙 Terminó de leer la carta #" + L.n,
        tag +
          "\nleyó las " +
          P.length +
          " páginas" +
          (veces > 1 ? "\n🔁 la ha terminado " + veces + " veces" : ""),
      );
    }
  }

  // ---- construcción de páginas ----
  var cards = P.map(function (pg) {
    var c = document.createElement("div");
    c.className = "card" + (pg.cover ? " cover" : "");
    var w = document.createElement("div");
    w.className = "wrap";
    c.appendChild(w);

    if (pg.cover) {
      w.innerHTML =
        '<div class="heart">♥</div><h1>' +
        (L.coverTitle || "Para ti,<br>Kata") +
        '</h1><div class="sub">' +
        (L.coverSub || "una carta, página por página") +
        "</div>";
    } else {
      if (pg.eyebrow) {
        var e = document.createElement("div");
        e.className = "eyebrow";
        e.textContent = pg.eyebrow;
        w.appendChild(e);
      }
      pg.lines.forEach(function (ln) {
        var p = document.createElement("p");
        p.className = "tw " + ln[0];
        p.dataset.t = ln[1];
        w.appendChild(p);
      });
      if (pg.spotify && L.spotify) {
        var a = document.createElement("a");
        a.className = "spotify after";
        a.href = L.spotify;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = SP_ICON + " Escuchar la canción";
        a.addEventListener("click", function () {
          window.Notif.once(
            "song:" + L.n,
            "🎵 Abrió la canción de la carta #" + L.n,
            tag + "\n" + (L.song || ""),
          );
        });
        w.appendChild(a);
      }
    }
    stage.appendChild(c);
    return c;
  });

  // ---- máquina de escribir ----
  var i = 0,
    typing = false,
    skip = false,
    token = 0;
  var prevB = document.getElementById("prev"),
    nextB = document.getElementById("next");
  var count = document.getElementById("count"),
    pfill = document.getElementById("pfill");
  var hint = document.getElementById("hint");
  var sleep = function (ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  };
  var delayFor = function (ch) {
    if (".!?…".includes(ch)) return 240;
    if (",;:—".includes(ch)) return 130;
    return 18;
  };

  async function typeCard(c) {
    var my = ++token;
    typing = true;
    skip = false;
    var els = [].slice.call(c.querySelectorAll(".tw"));
    els.forEach(function (e) {
      e.textContent = "";
    });
    c.querySelectorAll(".after").forEach(function (e) {
      e.classList.remove("show");
    });
    if (reduced) {
      els.forEach(function (e) {
        e.textContent = e.dataset.t;
      });
      c.querySelectorAll(".after").forEach(function (e) {
        e.classList.add("show");
      });
      typing = false;
      return;
    }
    for (var k0 = 0; k0 < els.length; k0++) {
      var e = els[k0];
      e.classList.add("typing");
      var t = e.dataset.t;
      for (var k = 0; k < t.length; k++) {
        if (my !== token) return;
        if (skip) {
          e.textContent = t;
          break;
        }
        e.textContent = t.slice(0, k + 1);
        await sleep(delayFor(t[k]));
      }
      if (my !== token) return;
      e.textContent = t;
      e.classList.remove("typing");
      if (skip) {
        els.forEach(function (x) {
          x.textContent = x.dataset.t;
        });
        break;
      }
      await sleep(200);
    }
    if (my !== token) return;
    c.querySelectorAll(".after").forEach(function (e) {
      e.classList.add("show");
    });
    typing = false;
  }

  function render() {
    cards.forEach(function (c, n) {
      c.classList.toggle("active", n === i);
    });
    prevB.disabled = i === 0;
    nextB.disabled = i === P.length - 1;
    count.textContent = i + 1 + " / " + P.length;
    pfill.style.width = (i / (P.length - 1)) * 100 + "%";
    trackProgress();
    if (!P[i].cover) typeCard(cards[i]);
    else {
      typing = false;
      token++;
    }
  }
  function next() {
    if (typing) {
      skip = true;
      return;
    }
    if (i < P.length - 1) {
      i++;
      render();
    }
  }
  function prev() {
    if (i > 0) {
      i--;
      render();
    }
  }
  nextB.onclick = next;
  prevB.onclick = prev;
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  var canScroll = function (c) {
    return c.scrollHeight - c.clientHeight > 4;
  };
  var sx = 0,
    sy = 0;
  stage.addEventListener(
    "touchstart",
    function (e) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    },
    { passive: true },
  );
  stage.addEventListener(
    "touchend",
    function (e) {
      var dx = e.changedTouches[0].clientX - sx,
        dy = e.changedTouches[0].clientY - sy;
      var c = cards[i];
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        if (typing) skip = true; // tap = completar
        hint.classList.add("gone");
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 45) dx < 0 ? next() : prev();
      } else if (Math.abs(dy) > 45) {
        if (canScroll(c)) {
          var atTop = c.scrollTop <= 2,
            atBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 2;
          if (dy < 0 && atBottom) next();
          else if (dy > 0 && atTop) prev();
        } else {
          dy < 0 ? next() : prev();
        }
      }
      hint.classList.add("gone");
    },
    { passive: true },
  );
  stage.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    hint.classList.add("gone");
  });
  var wlock = false;
  stage.addEventListener(
    "wheel",
    function (e) {
      if (canScroll(cards[i])) return;
      if (wlock) return;
      wlock = true;
      setTimeout(function () {
        wlock = false;
      }, 650);
      e.deltaY > 0 ? next() : prev();
      hint.classList.add("gone");
    },
    { passive: true },
  );

  render();
})();
