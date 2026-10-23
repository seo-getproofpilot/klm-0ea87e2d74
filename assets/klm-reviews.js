/* Shows real Google reviews from reviews.js; with none yet, the "leave a review" card stays front and center */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var list = (window.KLM_REVIEWS || []).filter(function (r) { return r && r.text; });
  if (list.length) {
    var avg = list.reduce(function (s, r) { return s + (+r.stars || 5); }, 0) / list.length;
    $("#rev-score").textContent = avg.toFixed(1) + " stars from " + list.length + " Google review" + (list.length > 1 ? "s" : "");
    $("#rev-cards").innerHTML = list.slice(0, 6).map(function (r) {
      var n = Math.round(+r.stars || 5);
      return '<figure class="rev-q"><span class="st" aria-label="' + n + ' out of 5 stars">' + "★".repeat(n) + "</span><blockquote>" + esc(r.text) + "</blockquote><figcaption>" + esc(r.name || "Google reviewer") + (r.when ? " · " + esc(r.when) : "") + "</figcaption></figure>";
    }).join("");
    $("#rev-wall").hidden = false;
    $("#rev-invite").classList.add("compact");
  }
  var mock = $(".rev-card-mock");
  if (!mock) return;
  if (!("IntersectionObserver" in window)) { mock.classList.add("go"); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); mock.classList.add("go"); } }, { threshold: .4 });
  io.observe(mock);
})();
