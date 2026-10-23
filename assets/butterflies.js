/* KLM butterflies: the start-up swarm that reveals the logo, plus a few that drift past while scrolling */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var root = document.documentElement;
  var intro = $("#intro");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function heroGo() { root.classList.add("hero-go"); }

  function runIntro() {
    var stage = $("#intro-stage"), logo = $("#intro-logo"), tpl = $("#bfly-tpl");
    // big monitors scale the page with CSS zoom; work in the page's own pixels
    var Z = parseFloat(getComputedStyle(document.body).zoom) || 1;
    var W = innerWidth / Z, H = innerHeight / Z, small = W < 700;
    var cx = W / 2, cy = H / 2;
    var lw = Math.min(W * 0.8, 560), lh = lw / 2;
    var R = Math.hypot(W, H) * 0.62;
    var colors = [["#FD288D", "#FC73B1"], ["#D4096E", "#FD288D"], ["#FC73B1", "#FFD3E6"], ["#B48CF0", "#D6BCFA"], ["#FD288D", "#D6BCFA"], ["#E85AA0", "#FFC2DD"]];
    var n = small ? 16 : 26;
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var head = function (dx, dy) { return Math.atan2(dy, dx) * 180 / Math.PI + 90; };
    var tf = function (x, y, r) { return "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + r.toFixed(1) + "deg)"; };

    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "bf";
      el.appendChild(tpl.content.firstElementChild.cloneNode(true));
      var c = colors[i % colors.length];
      el.style.setProperty("--a", c[0]);
      el.style.setProperty("--b", c[1]);
      el.style.setProperty("--s", (small ? rnd(40, 70) : rnd(62, 118)) + "px");
      el.style.setProperty("--fd", rnd(0.13, 0.22) + "s");
      stage.appendChild(el);

      var a0 = (i / n) * Math.PI * 2 + rnd(-0.25, 0.25);
      var sx = cx + Math.cos(a0) * R, sy = cy + Math.sin(a0) * R;
      var hx = cx + rnd(-0.5, 0.5) * lw, hy = cy + rnd(-0.38, 0.5) * lh;
      // the midpoint swings off the straight line, so nobody flies like a dart
      var mx = (sx + hx) / 2 + rnd(-90, 90), my = (sy + hy) / 2 + rnd(-90, 90);
      var h2x = hx + rnd(-14, 14), h2y = hy + rnd(-10, 6);
      var oa = Math.atan2(hy - cy, hx - cx) + rnd(-0.5, 0.5) - 0.35;
      var ex = cx + Math.cos(oa) * R * 1.05, ey = cy + Math.sin(oa) * R * 1.05;
      var qx = (h2x + ex) / 2 + rnd(-70, 70), qy = (h2y + ey) / 2 + rnd(-70, 70);

      el.animate([
        { offset: 0, transform: tf(sx, sy, head(mx - sx, my - sy)) },
        { offset: 0.2, transform: tf(mx, my, head(hx - mx, hy - my)), easing: "cubic-bezier(.3,.7,.4,1)" },
        { offset: 0.4, transform: tf(hx, hy, rnd(-20, 20)) },
        { offset: 0.5, transform: tf(h2x, h2y, rnd(-20, 20)), easing: "cubic-bezier(.5,0,.8,.6)" },
        { offset: 0.74, transform: tf(qx, qy, head(qx - h2x, qy - h2y)) },
        { offset: 1, transform: tf(ex, ey, head(ex - qx, ey - qy)) }
      ], { duration: 2400, delay: rnd(0, 140), fill: "both" });
    }

    var done = false;
    function end(fast) {
      if (done) return;
      done = true;
      try { sessionStorage.setItem("klm_intro", "1"); } catch (e) {}
      var target = $(".zm-logo img");
      intro.classList.add("out");
      if (target && !fast) {
        // hand the logo to the header: animate from where it sits to the header's logo box
        var from = logo.getBoundingClientRect(), to = target.getBoundingClientRect();
        target.style.visibility = "hidden";
        logo.style.animation = "none";
        logo.style.opacity = "1";
        logo.style.clipPath = "none";
        logo.style.left = from.left / Z + "px";
        logo.style.top = from.top / Z + "px";
        logo.style.width = from.width / Z + "px";
        logo.style.transform = "none";
        logo.animate([
          { transform: "translate(0,0) scale(1)" },
          { transform: "translate(" + (to.left - from.left) / Z + "px," + (to.top - from.top) / Z + "px) scale(" + (to.width / from.width) + ")" }
        ], { duration: 780, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" });
        setTimeout(heroGo, 320);
        setTimeout(function () { target.style.visibility = ""; intro.remove(); }, 820);
      } else {
        heroGo();
        intro.style.transition = "opacity .35s";
        intro.style.opacity = "0";
        setTimeout(function () { intro.remove(); }, 380);
      }
    }
    setTimeout(function () { end(false); }, 2500);
    $(".intro-skip", intro).addEventListener("click", function () { end(true); });
    addEventListener("keydown", function () { end(true); }, { once: true });
  }


  if (!intro || root.classList.contains("intro-seen") || !intro.animate) {
    if (intro) intro.remove();
  } else {
    runIntro();
  }

  /* ---------- now and then, a butterfly crosses the screen while you scroll ---------- */
  var tpl = document.getElementById("bfly-tpl");
  if (reduce || !tpl || !document.body.animate) return;
  var COLORS = [["#FD288D", "#FC73B1"], ["#B48CF0", "#D6BCFA"], ["#FC73B1", "#FFD3E6"], ["#7C5CE6", "#B9A2F5"], ["#FFA94D", "#FFD8A8"]];
  var lastY = scrollY, travelled = 0, flying = 0, next = 1400 + Math.random() * 800;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var tpl0 = tpl.content.firstElementChild;

  function launch(dir) {
    if (flying >= (innerWidth < 700 ? 1 : 2) || document.hidden || $("#intro")) return;
    flying++;
    var W = innerWidth, H = innerHeight, small = W < 700;
    var el = document.createElement("div");
    el.className = "drifter";
    el.setAttribute("aria-hidden", "true");
    el.appendChild(tpl0.cloneNode(true));
    var c = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.setProperty("--a", c[0]); el.style.setProperty("--b", c[1]);
    el.style.setProperty("--s", (small ? rnd(26, 38) : rnd(34, 54)) + "px");
    el.style.setProperty("--fd", rnd(.14, .22) + "s");
    document.body.appendChild(el);
    var fromLeft = Math.random() < .5;
    var x0 = fromLeft ? -60 : W + 60, x1 = fromLeft ? W + 60 : -60;
    // scrolling down: they rise up the screen; scrolling up: they drift down
    var y0 = dir > 0 ? H * rnd(.65, .95) : H * rnd(.05, .35), y1 = dir > 0 ? H * rnd(.05, .35) : H * rnd(.65, .95);
    var pts = [], n = 6;
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI * rnd(1.5, 2.5)) * rnd(20, 60);
      pts.push([x, y]);
    }
    var frames = pts.map(function (p, i) {
      var q = pts[Math.min(i + 1, n)], pr = pts[Math.max(i - 1, 0)];
      var ang = Math.atan2(q[1] - pr[1], q[0] - pr[0]) * 180 / Math.PI + 90;
      return { offset: i / n, transform: "translate(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px) rotate(" + ang.toFixed(1) + "deg)" };
    });
    var a = el.animate(frames, { duration: rnd(4200, 6200), easing: "linear", fill: "both" });
    a.onfinish = function () { el.remove(); flying--; };
  }

  addEventListener("scroll", function () {
    var y = scrollY, d = y - lastY; lastY = y;
    travelled += Math.abs(d);
    if (travelled > next) { travelled = 0; next = innerHeight * (2 + Math.random() * 1.5); launch(d >= 0 ? 1 : -1); }
  }, { passive: true });
})();
