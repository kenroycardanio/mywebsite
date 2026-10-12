(function () {
  "use strict";
  var doc = document.documentElement;
  var params = new URLSearchParams(location.search);
  var SHOT = params.has("shot");                       // screenshot mode: everything visible, no motion
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STILL = SHOT || REDUCED;
  doc.classList.add("js");
  if (SHOT) doc.classList.add("shot-mode");
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- clock (Manila time) ---- */
  var clock = document.querySelector("[data-clock]");
  var foot = document.querySelector("[data-clock-foot]");
  function paint() {
    var t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Manila" }).format(new Date());
    if (clock) clock.innerHTML = '<span class="dot"></span>' + t + " · Calamba";
    if (foot) foot.textContent = "Local time " + t + " PHT";
  }
  paint(); setInterval(paint, 30000);

  /* ---- marquee: duplicate once for a seamless loop ---- */
  var track = document.querySelector(".marquee .track");
  if (track && !REDUCED) track.innerHTML += track.innerHTML;

  /* ---- typed capability line ---- */
  var typed = document.querySelector("[data-typed]");
  var words = ["Application Development", "Workflow Automation", "Systems Integration", "Business Process Improvement", "AI-Assisted Development", "Information & Data Management", "Testing & Refinement"];
  if (typed && !STILL) {
    var wi = 0, ci = words[0].length, del = true;
    setTimeout(function tick() {
      var w = words[wi];
      if (del) { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; } }
      else { ci++; if (ci >= words[wi].length) { del = true; typed.textContent = words[wi]; return setTimeout(tick, 1900); } }
      typed.textContent = words[wi].slice(0, Math.max(ci, 0));
      setTimeout(tick, del ? 28 : 55);
    }, 4200);
  }

  /* ---- scroll reveal ---- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  // stagger siblings
  reveals.forEach(function (el) {
    var sib = [].slice.call(el.parentNode.children).filter(function (c) { return c.classList.contains("reveal"); });
    var i = sib.indexOf(el); if (i > 0) el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
  });
  if (STILL || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    // safety net: never leave content hidden
    setTimeout(function () { reveals.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }); }, 2500);
  }

  /* ---- nav highlight ---- */
  var links = [].slice.call(document.querySelectorAll(".site-header nav a"));
  if ("IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-current", l.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute("href")); if (s) nio.observe(s); });
  }

  /* ---- scroll progress + timeline draw + hero parallax ---- */
  var bar = document.querySelector(".progress span");
  var tl = document.querySelector("[data-timeline]");
  var photo = document.querySelector("[data-parallax]");
  function onScroll() {
    var h = doc.scrollHeight - innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")";
    if (tl) {
      var r = tl.getBoundingClientRect();
      var p = STILL ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
      tl.style.setProperty("--tl", p.toFixed(3));
    }
    if (photo && !STILL && scrollY < innerHeight) photo.style.transform = "translateY(" + scrollY * 0.12 + "px)";
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- pointer effects (desktop only) ---- */
  if (fine && !STILL) {
    doc.classList.add("has-pointer");
    var glow = document.querySelector(".cursor-glow");
    var gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy;
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; glow.style.transform = "translate(" + gx + "px," + gy + "px)"; requestAnimationFrame(loop); })();

    // spotlight + tilt cards
    [].slice.call(document.querySelectorAll(".card")).forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
        if (c.classList.contains("tilt")) {
          var rx = (y / r.height - 0.5) * -8, ry = (x / r.width - 0.5) * 8;
          c.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateZ(0)";
        }
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });

    // magnetic buttons
    [].slice.call(document.querySelectorAll(".magnetic")).forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + x * 0.25 + "px," + y * 0.35 + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transition = "transform .5s cubic-bezier(.2,.8,.2,1)"; b.style.transform = ""; setTimeout(function () { b.style.transition = ""; }, 500); });
    });
  }

  /* ---- copy email ---- */
  var copy = document.querySelector("[data-copy]");
  if (copy) copy.addEventListener("click", function () {
    var v = copy.getAttribute("data-copy");
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () {
      copy.textContent = "Copied ✓"; copy.classList.add("done");
      setTimeout(function () { copy.textContent = "Copy email"; copy.classList.remove("done"); }, 1800);
    }, function () { location.href = "mailto:" + v; });
  });

  /* ---- particle constellation field ---- */
  var cv = document.getElementById("field");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2), W, H, pts = [], mouse = { x: -999, y: -999 };
    function size() {
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 14000)); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.4 + 0.4, h: Math.random() < 0.5 ? "94,240,255" : "139,92,255" });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!STILL) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        var dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = dxm * dxm + dym * dym;
        if (dm < 22000 && !STILL) { p.x += dxm * 0.004; p.y += dym * 0.004; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 13000) { ctx.strokeStyle = "rgba(" + p.h + "," + (0.16 * (1 - d / 13000)).toFixed(3) + ")"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        ctx.fillStyle = "rgba(" + p.h + ",.7)"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      if (!STILL && !document.hidden) requestAnimationFrame(draw);
    }
    size(); draw();
    addEventListener("resize", function () { size(); if (STILL) draw(); });
    addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener("visibilitychange", function () { if (!document.hidden && !STILL) requestAnimationFrame(draw); });
  }
})();

/* =================== v3 additions =================== */
(function () {
  "use strict";
  var doc = document.documentElement;
  var SHOT = new URLSearchParams(location.search).has("shot");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STILL = SHOT || REDUCED;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.connection && navigator.connection.saveData);
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* ---- boot loader: ~1.1s, skippable, once per session, off for ?shot / reduced motion ---- */
  var boot = $("#boot");
  if (boot) {
    var seen = false; try { seen = sessionStorage.getItem("kenBoot") === "1"; } catch (e) {}
    if (STILL || seen) { boot.remove(); }
    else {
      var end = function () { if (!boot) return; boot.classList.add("done"); var b = boot; boot = null; setTimeout(function () { b.remove(); }, 400); try { sessionStorage.setItem("kenBoot", "1"); } catch (e) {} };
      setTimeout(end, 1100);
      ["keydown", "pointerdown", "wheel", "touchstart"].forEach(function (ev) { addEventListener(ev, end, { once: true, passive: true }); });
    }
  }

  /* ---- 3D wireframe globe (canvas, no library). Lives inside the masked ring group ---- */
  var gc = $("[data-globe]");
  if (gc && gc.getContext) {
    var g = gc.getContext("2d"), gd = Math.min(devicePixelRatio || 1, 2), GW, GH, rot = 0.6, visible = true;
    var pts = [], lat, lon;
    for (lat = -75; lat <= 75; lat += 15) for (lon = 0; lon < 360; lon += 12) pts.push([lat, lon]);
    var nodes = []; for (var n = 0; n < 14; n++) nodes.push([Math.random() * 140 - 70, Math.random() * 360]);
    function gsize() { var r = gc.getBoundingClientRect(); GW = r.width; GH = r.height; gc.width = GW * gd; gc.height = GH * gd; g.setTransform(gd, 0, 0, gd, 0, 0); }
    function proj(la, lo, R, cx, cy) {
      var a = la * Math.PI / 180, b = (lo * Math.PI / 180) + rot, tilt = -0.35;
      var x = Math.cos(a) * Math.sin(b), y = Math.sin(a), z = Math.cos(a) * Math.cos(b);
      var y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
      return [cx + x * R, cy - y2 * R, z2];
    }
    function gdraw() {
      g.clearRect(0, 0, GW, GH);
      var R = GW * 0.42, cx = GW / 2, cy = GH * 0.42;
      for (var i = 0; i < pts.length; i++) {
        var p = proj(pts[i][0], pts[i][1], R, cx, cy);
        var al = p[2] > 0 ? 0.55 * p[2] + 0.1 : 0.08;
        g.fillStyle = "rgba(94,240,255," + al.toFixed(2) + ")"; g.fillRect(p[0], p[1], 1.8, 1.8);
      }
      var P = nodes.map(function (q) { return proj(q[0], q[1], R, cx, cy); });
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        if (P[a][2] < 0 || P[b][2] < 0) continue;
        var dx = P[a][0] - P[b][0], dy = P[a][1] - P[b][1];
        if (dx * dx + dy * dy < R * R * 0.5) { g.strokeStyle = "rgba(139,92,255,.35)"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(P[a][0], P[a][1]); g.lineTo(P[b][0], P[b][1]); g.stroke(); }
      }
      P.forEach(function (p) { if (p[2] > 0) { g.fillStyle = "rgba(255,77,141,.9)"; g.beginPath(); g.arc(p[0], p[1], 2.2, 0, 6.283); g.fill(); } });
    }
    gsize(); gdraw();
    addEventListener("resize", function () { gsize(); gdraw(); });
    if (!STILL && !lowPower) {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) requestAnimationFrame(gloop); }).observe(gc);
      var last = 0;
      var gloop = function (t) { if (!visible || document.hidden) return; if (t - last > 33) { rot += 0.006; gdraw(); last = t; } requestAnimationFrame(gloop); };
      requestAnimationFrame(gloop);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) requestAnimationFrame(gloop); });
    }
  }

  /* ---- pause CSS animations in sections that are off-screen ---- */
  if (!STILL && "IntersectionObserver" in window) {
    var po = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle("paused", !e.isIntersecting); }); }, { rootMargin: "100px" });
    $$(".hero, .marquee, .systems, .proof, .hire").forEach(function (s) { po.observe(s); });
  }

  /* ---- decode effect on section labels when they enter ---- */
  var glyphs = "01<>/\\{}[]#$%&*+=";
  function decode(el) {
    var span = el.querySelector("span"), textNode = span ? span.nextSibling : el.firstChild;
    if (!textNode || textNode.nodeType !== 3) return;
    var final = textNode.nodeValue, f = 0, total = 18;
    el.classList.add("decoding");
    (function step() {
      f++;
      textNode.nodeValue = final.replace(/\S/g, function (c, i) { return i / final.length < f / total ? c : glyphs[(Math.random() * glyphs.length) | 0]; });
      if (f < total) requestAnimationFrame(step); else { textNode.nodeValue = final; el.classList.remove("decoding"); }
    })();
  }
  if (!STILL && "IntersectionObserver" in window) {
    var dio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { decode(e.target); dio.unobserve(e.target); } }); }, { threshold: 0.6 });
    $$(".label").forEach(function (l) { dio.observe(l); });
  }

  /* ---- HUD counters (real numbers only) ---- */
  if (!STILL && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, from = +(el.dataset.from || 0), t0 = performance.now();
        (function f(t) { var k = Math.min(1, (t - t0) / 1100); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(f); })(t0);
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (c) { cio.observe(c); });
  }

  /* ---- terminal ---- */
  var out = $("[data-term-out]"), form = $("[data-term-form]"), input = $("[data-term-input]");
  var R = {
    "ken --help": ['<span class="dim">commands: --skills · --offers · --process · --background · --hire · clear</span>'],
    "ken --skills": ['<span class="hl">8 capabilities</span>', "01 Application Development", "02 Workflow Automation", "03 Systems Integration", "04 Business Process Improvement", "05 AI-Assisted Development", "06 Information and Data Management", "07 Business Tools and Operational Solutions", "08 Testing, Troubleshooting, and Refinement"],
    "ken --offers": ['<span class="hl">One useful task. Proof you can see. Pay for the finished job.</span>', "· School ID-sheet automation", "· QR enrollment verification", "· Sales, expenses & stock setup", "· Scoped website or app", '<span class="dim">Scoped and priced before work starts.</span>'],
    "ken --process": ["01 Understand  → the need, the workflow, the people", "02 Design      → a practical approach", "03 Develop     → build, configure, connect", "04 Refine      → test, troubleshoot, improve"],
    "ken --background": ["2024–now   General manager, Prints & Beyond", "2019–now   Life planner, AIA Philippines", "2021–2023  General manager, Bamboo Groove Restobar", "2013–2019  Books and audit", "2008–2013  Cashier, assistant, clerk", '<span class="dim">Cebu Institute of Technology – University. Management accounting.</span>'],
    "ken --hire": ['<span class="hl">Open to full-time roles.</span>', 'email  <a href="mailto:kcardanio@gmail.com?subject=Professional%20Opportunities">kcardanio@gmail.com</a>', 'call   <a href="tel:+639488548171">+63 948 854 8171</a>', "where  Calamba, Misamis Occidental"]
  };
  var alias = { help: "ken --help", skills: "ken --skills", offers: "ken --offers", process: "ken --process", background: "ken --background", hire: "ken --hire", contact: "ken --hire" };
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function run(cmd) {
    if (!out) return;
    cmd = cmd.trim().toLowerCase().replace(/\s+/g, " ");
    if (!cmd) return;
    if (cmd === "clear") { out.innerHTML = ""; return; }
    var key = R[cmd] ? cmd : alias[cmd.replace(/^ken\s*/, "").replace(/^-+/, "")];
    var p = document.createElement("p"); p.innerHTML = '<span class="pr">ken@calamba:~$</span>' + esc(cmd); out.appendChild(p);
    var lines = key ? R[key] : ['<span class="dim">command not found: ' + esc(cmd) + " · try ken --help</span>"];
    lines.forEach(function (l, i) {
      setTimeout(function () { var q = document.createElement("p"); q.innerHTML = l; out.appendChild(q); out.scrollTop = out.scrollHeight; }, STILL ? 0 : i * 45);
    });
    out.scrollTop = out.scrollHeight;
  }
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); run(input.value); input.value = ""; });
  $$("[data-cmd]").forEach(function (b) { b.addEventListener("click", function () { run(b.dataset.cmd); }); });
  if (SHOT) { run("ken --skills"); out.scrollTop = 0; }

  /* ---- command palette (Ctrl/Cmd + K) ---- */
  var pal = $("[data-palette]"), pin = $("[data-pal-input]"), plist = $("[data-pal-list]"), sel = 0, opener = null;
  var items = [
    ["Work with me", "#work"], ["Capabilities", "#capabilities"], ["How I connect systems", "#systems"], ["Proof you can see", "#proof"],
    ["How I solve problems", "#approach"], ["Professional background", "#background"], ["Terminal", "#terminal"], ["Hire me", "#hire"],
    ["Email Ken", "mailto:kcardanio@gmail.com?subject=Professional%20Opportunities"], ["Call Ken", "tel:+639488548171"],
    ["Copy email address", "copy"], ["Run: ken --skills", "cmd:ken --skills"], ["Run: ken --hire", "cmd:ken --hire"]
  ];
  var filtered = items;
  function render() {
    var q = (pin.value || "").toLowerCase();
    filtered = items.filter(function (it) { return it[0].toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(filtered.length - 1, 0));
    plist.innerHTML = filtered.map(function (it, i) {
      var kind = it[1].indexOf("#") === 0 ? "jump" : it[1].indexOf("cmd:") === 0 ? "run" : it[1] === "copy" ? "copy" : "open";
      return '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span>' + it[0] + "</span><span>" + kind + "</span></li>";
    }).join("") || '<li aria-selected="false"><span>No match</span><span></span></li>';
  }
  function openPal() { if (!pal) return; opener = document.activeElement; pal.hidden = false; pin.value = ""; sel = 0; render(); pin.focus(); }
  function closePal() { if (!pal || pal.hidden) return; pal.hidden = true; if (opener && opener.focus) opener.focus(); }
  function exec(it) {
    if (!it) return; closePal(); var a = it[1];
    if (a.indexOf("#") === 0) { var t = $(a); if (t) t.scrollIntoView({ behavior: STILL ? "auto" : "smooth" }); }
    else if (a.indexOf("cmd:") === 0) { var ts = $("#terminal"); if (ts) ts.scrollIntoView({ behavior: STILL ? "auto" : "smooth" }); run(a.slice(4)); }
    else if (a === "copy") { if (navigator.clipboard) navigator.clipboard.writeText("kcardanio@gmail.com"); }
    else location.href = a;
  }
  if (pal) {
    addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
      if (pal.hidden) return;
      if (e.key === "Escape") closePal();
      else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(filtered.length, 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(filtered.length, 1); render(); }
      else if (e.key === "Enter") { e.preventDefault(); exec(filtered[sel]); }
      else if (e.key === "Tab") { e.preventDefault(); pin.focus(); }
    });
    pin.addEventListener("input", function () { sel = 0; render(); });
    plist.addEventListener("click", function (e) { var li = e.target.closest("li[data-i]"); if (li) exec(filtered[+li.dataset.i]); });
    $$("[data-palette-open]").forEach(function (b) { b.addEventListener("click", openPal); });
    $$("[data-palette-close]").forEach(function (b) { b.addEventListener("click", closePal); });
  }

  /* ---- smooth custom cursor (desktop, fine pointer only) ---- */
  if (fine && !STILL) {
    var dot = $(".cursor-dot"), ring = $(".cursor-ring"), mx = -100, my = -100, rx = -100, ry = -100;
    doc.style.cursor = "";
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = "translate(" + mx + "px," + my + "px)"; }, { passive: true });
    (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = "translate(" + rx + "px," + ry + "px)"; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", function (e) { ring.classList.toggle("hot", !!e.target.closest("a,button,input,[data-cmd]")); });
  }
})();

/* =================== Photoshop + CSV ID-sheet illustration (sample data only) =================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-idflow]");
  if (!root) return;
  var SHOT = new URLSearchParams(location.search).has("shot");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var REC = [
    ["Juan Dela Cruz", "0001", "Grade 7"], ["Maria Santos", "0002", "Grade 7"], ["Jose Reyes", "0003", "Grade 8"], ["Ana Garcia", "0004", "Grade 8"],
    ["Mark Bautista", "0005", "Grade 9"], ["Liza Mendoza", "0006", "Grade 9"], ["Paolo Ramos", "0007", "Grade 10"], ["Carla Diaz", "0008", "Grade 10"]
  ];
  var SIL = '<svg viewBox="0 0 30 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="30" height="40" fill="#d7deef"/><circle cx="15" cy="15" r="7.5" fill="#8a95b8"/><path d="M1 40c0-9.5 6.3-15 14-15s14 5.5 14 15z" fill="#8a95b8"/></svg>';
  function qr(seed) {
    var s = seed * 7919 + 13, o = '<svg viewBox="0 0 11 11" shape-rendering="crispEdges" aria-hidden="true"><rect width="11" height="11" fill="#fff"/>';
    function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    [[0, 0], [8, 0], [0, 8]].forEach(function (f) { o += '<rect x="' + f[0] + '" y="' + f[1] + '" width="3" height="3" fill="#000"/><rect x="' + (f[0] + 1) + '" y="' + (f[1] + 1) + '" width="1" height="1" fill="#fff"/>'; });
    for (var y = 0; y < 11; y++) for (var x = 0; x < 11; x++) { if ((x < 4 && y < 4) || (x > 6 && y < 4) || (x < 4 && y > 6)) continue; if (r() > 0.52) o += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#000"/>'; }
    return o + "</svg>";
  }
  var card = function (i) {
    return '<div class="idc2"><div class="hd"><span class="em"></span><span class="inst">SAMPLE<br>ACADEMY</span><span class="em"></span></div><div class="acc"></div>' +
      '<div class="rw"><div class="pho">' + SIL + '</div><div class="qr2">' + qr(i + 2) + '</div></div>' +
      '<div class="nb ph2">Name</div><div class="bc"></div><div class="idn ph2">ID No.</div><div class="grd ph2">Grade</div>' +
      '<div class="tm"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
  };
  var cards8 = ""; for (var c = 0; c < 8; c++) cards8 += card(c);
  root.innerHTML =
    '<div class="psw">' +
      '<div class="ps-menu"><span class="app"></span><span data-m="file">File</span><span>Edit</span><span data-m="image">Image</span><span>Layer</span><span>Type</span><span>Select</span><span>Filter</span><span>View</span><span>Window</span></div>' +
      '<div class="ps-main"><div class="ps-tools"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="ps-canvas"><div class="ps-paper">' + cards8 + '</div></div></div>' +
      '<div class="ps-status"><span>print-sheet.psd @ 300 ppi · 8 cards</span><b data-log>Ready</b></div>' +
      '<div class="ps-ov ps-dd" data-o="dd"><p>New…</p><p>Open…</p><p>Save</p><hr><p data-k="scripts">Scripts <span>▸</span></p><hr><p>Print…</p></div>' +
      '<div class="ps-ov ps-sub" data-o="sub"><p>Image Processor…</p><p data-k="script">Fill ID Sheet (CSV)…</p><p>Browse…</p></div>' +
      '<div class="ps-ov ps-dlg" data-o="dlg"><div class="ps-ttl">Select CSV/TXT File</div><div class="ps-bd">' +
        '<div class="ps-row"><span class="ps-field" data-k="field">No file selected</span><span class="ps-btn" data-k="browse">Browse…</span></div>' +
        '<div class="ps-pick" data-k="pick"><p>photos/</p><p data-k="csv">students.csv</p><p>template.psd</p></div>' +
        '<div class="ps-foot"><span class="ps-btn">Cancel</span><span class="ps-btn pri" data-k="run">Run</span></div></div></div>' +
      '<div class="ps-ov ps-tmp" data-o="tmp"><div class="ps-ttl" data-k="tmpttl">photo_tmp.jpg</div><div class="tb" data-k="tmpbody"></div></div>' +
      '<div class="ps-ov ps-alert" data-o="alert"><div class="ps-ttl">Script Alert</div><div class="ps-bd"><span class="ps-done">Done · 8 IDs · 300 ppi</span>' +
        '<ul class="ps-log"><li>Read students.csv (8 records)</li><li>Filled text fields × 8</li><li>Placed cropped photos × 8</li><li>Generated &amp; placed QR codes × 8</li></ul>' +
        '<div class="ps-foot"><span class="ps-btn pri" data-k="ok">OK</span></div></div></div>' +
      '<div class="ps-ov ps-isz" data-o="isz"><div class="ps-ttl">Image Size</div><div class="ps-bd"><div class="ps-kv"><span>Width</span><b>A4 sheet</b></div><div class="ps-kv"><span>Layout</span><b>8 cards · 2 × 4</b></div><div class="ps-kv hl"><span>Resolution</span><b>300 Pixels/Inch</b></div></div></div>' +
      '<div class="ps-badge" data-k="badge">✓ Print-ready · 8 IDs · 300 ppi</div>' +
      '<svg class="ps-cur" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 10-6.5 1.4L16 21l-3 1.4-3.6-7.6L4 19z" fill="#fff" stroke="#05060d" stroke-width="1.4" stroke-linejoin="round"/></svg>' +
    '</div>';

  function q(s) { return root.querySelector(s); }
  var O = {}; [].slice.call(root.querySelectorAll("[data-o]")).forEach(function (e) { O[e.dataset.o] = e; });
  var K = {}; [].slice.call(root.querySelectorAll("[data-k]")).forEach(function (e) { K[e.dataset.k] = e; });
  var mFile = q('[data-m="file"]'), mImage = q('[data-m="image"]'), log = q("[data-log]"), cur = q(".ps-cur");
  var canvas = q(".ps-canvas"), paper = q(".ps-paper");
  var C = [].slice.call(root.querySelectorAll(".idc2")).map(function (el) {
    return { el: el, pho: el.querySelector(".pho"), qr: el.querySelector(".qr2"), nb: el.querySelector(".nb"), bc: el.querySelector(".bc"), idn: el.querySelector(".idn"), grd: el.querySelector(".grd") };
  });
  var TMP_PHOTO = SIL.replace('preserveAspectRatio="xMidYMid slice"', "") + '<span class="crop"></span>';

  // ---- timeline (seconds) ----
  var DUR = [1.25, 1.0, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55], START = [], t = 4.15;
  DUR.forEach(function (d) { START.push(t); t += d; });
  var CARDS_END = t, T_ALERT = CARDS_END + 0.15, T_OK = T_ALERT + 0.75, T_ISZ0 = T_OK + 0.2, T_ISZ1 = T_ISZ0 + 1.2, LOOP = T_ISZ1 + 1.4;

  function rel(el) { var a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { x: a.left - b.left + a.width * 0.55, y: a.top - b.top + a.height * 0.6 }; }
  function ease(k) { k = Math.max(0, Math.min(1, k)); return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  // cursor keyframes: [time, element or point]
  function curPos(tt) {
    var W = root.clientWidth, H = root.clientHeight;
    var keys = [[0.3, { x: W * 0.6, y: H * 0.8 }], [0.95, mFile], [1.4, K.scripts], [1.85, K.script], [2.5, K.browse], [3.1, K.csv], [3.7, K.run], [4.1, K.run],
                [T_ALERT, { x: W * 0.7, y: H * 0.85 }], [T_OK - 0.05, K.ok], [T_OK + 0.3, K.ok], [T_ISZ0 + 0.3, mImage], [LOOP, mImage]];
    for (var i = 0; i < keys.length - 1; i++) {
      if (tt >= keys[i][0] && tt < keys[i + 1][0]) {
        var a = keys[i][1].nodeType ? rel(keys[i][1]) : keys[i][1], b = keys[i + 1][1].nodeType ? rel(keys[i + 1][1]) : keys[i + 1][1];
        var k = ease((tt - keys[i][0]) / Math.min(0.45, keys[i + 1][0] - keys[i][0]));
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      }
    }
    return { x: W * 0.6, y: H * 0.8 };
  }
  function set(el, cls, on) { if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on); }
  function txt(el, v) { if (el.textContent !== v) el.textContent = v; }
  var lastTmp = "";

  function render(tt) {
    // menus and dialogs
    set(mFile, "on", tt >= 1.0 && tt < 1.95);
    set(O.dd, "in", tt >= 1.0 && tt < 1.95);
    set(K.scripts, "on", tt >= 1.4 && tt < 1.95);
    set(O.sub, "in", tt >= 1.45 && tt < 1.95);
    set(K.script, "on", tt >= 1.8 && tt < 1.95);
    set(O.dlg, "in", tt >= 2.05 && tt < 4.0);
    set(K.browse, "press", tt >= 2.55 && tt < 2.72);
    set(K.pick, "in", tt >= 2.7 && tt < 3.35);
    set(K.csv, "on", tt >= 3.1 && tt < 3.35);
    set(K.field, "f", tt >= 3.3);
    txt(K.field, tt >= 3.3 ? "…/data/students.csv" : "No file selected");
    set(K.run, "press", tt >= 3.75 && tt < 3.92);
    set(O.alert, "in", tt >= T_ALERT && tt < T_OK + 0.12);
    set(K.ok, "press", tt >= T_OK && tt < T_OK + 0.14);
    set(mImage, "on", tt >= T_ISZ0 && tt < T_ISZ1);
    set(O.isz, "in", tt >= T_ISZ0 && tt < T_ISZ1);
    set(K.badge, "in", tt >= T_ISZ1 && tt < LOOP - 0.2);

    // cards
    var active = -1, tmp = "";
    C.forEach(function (c, i) {
      var s = START[i], d = DUR[i], k = (tt - s) / d;
      var hasText = tt >= s, hasPhoto = tt >= s + d * 0.6, hasQR = tt >= s + d * 0.95;
      if (k >= 0 && k < 1) { active = i; tmp = k >= 0.22 && k < 0.6 ? "photo" : k >= 0.62 && k < 0.95 ? "qr" : ""; }
      set(c.el, "act", k >= 0 && k < 1);
      txt(c.nb, hasText ? REC[i][0] : "Name"); set(c.nb, "ph2", !hasText); set(c.nb, "pop", k >= 0 && k < 0.2);
      txt(c.idn, hasText ? "ID " + REC[i][1] : "ID No."); set(c.idn, "ph2", !hasText); set(c.idn, "pop", k >= 0 && k < 0.2);
      txt(c.grd, hasText ? REC[i][2] : "Grade"); set(c.grd, "ph2", !hasText); set(c.grd, "pop", k >= 0 && k < 0.2);
      set(c.bc, "f", hasText); set(c.pho, "f", hasPhoto); set(c.qr, "f", hasQR);
    });
    // temp document flash
    set(O.tmp, "in", !!tmp);
    set(O.tmp, "low", active >= 0 && active < 4);
    if (tmp && tmp !== lastTmp) {
      txt(K.tmpttl, tmp === "photo" ? "photo_tmp.jpg · crop" : "qr_tmp.png");
      K.tmpbody.innerHTML = tmp === "photo" ? TMP_PHOTO : qr(active + 2);
    }
    lastTmp = tmp;
    // status log
    var L = tt < 1.0 ? "Ready" : tt < 2.05 ? "File › Scripts" : tt < 4.0 ? "Select CSV/TXT File" :
      active >= 0 ? "Card " + (active + 1) + "/8 · " + (tmp === "photo" ? "photo" : tmp === "qr" ? "QR code" : "text") :
      tt < T_OK + 0.12 ? "Done · 8 IDs" : tt < T_ISZ1 ? "Image › Image Size · 300 ppi" : "Print-ready";
    txt(log, L);
    // cursor
    var p = curPos(tt);
    cur.style.transform = "translate(" + p.x + "px," + p.y + "px)";
    cur.style.opacity = (tt > 0.3 && tt < 4.15) || (tt > T_ALERT && tt < T_ISZ1) ? 1 : 0;
    // phone: zoom onto the active card
    var narrow = root.clientWidth <= 560;
    if (narrow && active >= 0) {
      var el = C[active].el, cw = canvas.clientWidth, ch = canvas.clientHeight;
      var sc = Math.min(3, (ch * 0.8) / el.offsetHeight);
      var ox = paper.offsetLeft, oy = paper.offsetTop;
      var x = cw / 2 - (el.offsetLeft + el.offsetWidth / 2) * sc - ox, y = ch / 2 - (el.offsetTop + el.offsetHeight / 2) * sc - oy;
      paper.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
    } else paper.style.transform = "";
  }

  window.__idflowRender = render;
  var acc = 0, t0 = null, visible = false;
  window.__idflowRestart = function () { acc = 0; t0 = null; };
  if (SHOT) { render(START[3] + DUR[3] * 0.4); return; }
  if (REDUCED) { render(LOOP - 0.5); return; }
  function loop(now) {
    if (!visible || document.hidden) { t0 = null; return; }
    if (t0 === null) t0 = now - acc * 1000;
    acc = ((now - t0) / 1000) % LOOP;
    render(acc);
    requestAnimationFrame(loop);
  }
  render(0);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = visible; visible = e[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(root);
  else { visible = true; requestAnimationFrame(loop); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) requestAnimationFrame(loop); });
  addEventListener("resize", function () { render(acc); });
})();

/* =================== Student Verify illustration (sample data only) =================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-svflow]");
  if (!root) return;
  var SHOT = new URLSearchParams(location.search).has("shot");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SIL = '<svg viewBox="0 0 30 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="30" height="30" fill="#d7deef"/><circle cx="15" cy="12" r="6" fill="#8a95b8"/><path d="M3 31c0-7.5 5.4-12 12-12s12 4.5 12 12z" fill="#8a95b8"/></svg>';
  var QR = (function () {
    var s = 77, o = '<svg viewBox="0 0 11 11" shape-rendering="crispEdges" aria-hidden="true"><rect width="11" height="11" fill="#fff"/>';
    function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    [[0, 0], [8, 0], [0, 8]].forEach(function (f) { o += '<rect x="' + f[0] + '" y="' + f[1] + '" width="3" height="3" fill="#000"/><rect x="' + (f[0] + 1) + '" y="' + (f[1] + 1) + '" width="1" height="1" fill="#fff"/>'; });
    for (var y = 0; y < 11; y++) for (var x = 0; x < 11; x++) { if ((x < 4 && y < 4) || (x > 6 && y < 4) || (x < 4 && y > 6)) continue; if (r() > 0.5) o += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#000"/>'; }
    return o + "</svg>";
  })();
  var URL_T = "https://script.google.com/macros/s/AKfy…sample…/exec";
  var kv = [["Grade", "Grade 8"], ["Section", "Section A"], ["Birthday", "Jan 1, 2012"], ["Age", "14"], ["Gender", "Male"], ["Adviser", "Ms. Sample Teacher"], ["School year", "2026–2027"], ["ID validity", "Valid until Jun 2027"]];
  root.innerHTML =
    '<div class="sv-wrap"><div class="sv-phone"><div class="sv-scr">' +
      '<div class="sv-sb"><span>8:15</span><span>▂▄▆ ◔</span></div>' +
      // camera
      '<div class="sv-s sv-cam" data-s="0"><p class="hint">Point the camera at a QR code</p>' +
        '<div class="sv-hand"><div class="sv-id"><div class="hd"><span class="em"></span><span class="inst">SAMPLE<br>ACADEMY</span><span class="em"></span></div>' +
        '<div class="ph">' + SIL + '</div><div class="nm">JUAN DELA CRUZ</div><div class="qr">' + QR + '</div><div class="ln"><i></i><i></i><i></i></div></div></div>' +
        '<div class="sv-target"></div><div class="sv-laser"></div><p class="sv-lock">QR code detected</p></div>' +
      // result
      '<div class="sv-s sv-res" data-s="1"><div class="sv-bar">Scan</div><p class="lbl">URL</p><p class="ts">Oct 12, 2026 · 8:15 AM</p><p class="url">' + URL_T + '</p>' +
        '<div class="sv-btns"><span data-b="open"><b></b>Open</span><span><b></b>Share</span><span><b></b>Copy</span></div></div>' +
      // browser + profile
      '<div class="sv-s sv-brw" data-s="2"><div class="sv-addr"><div class="box">script.google.com/macros/s/AKfy…/exec</div><span class="sv-prog"></span></div>' +
        '<div class="sv-banner">This application was created by a Google Apps Script user</div>' +
        '<div class="sv-view"><div class="sv-page">' +
          '<div class="sv-hdr" data-b="hdr"><span class="sv-tap">TAP FOR ANNOUNCEMENTS</span><div class="em"></div><div class="sch">SAMPLE ACADEMY</div><div class="ad">123 Sample Street, Sample City</div><div class="ad">School ID: 000000</div><div class="ti">STUDENT VERIFICATION</div></div>' +
          '<div class="sv-ann"><div class="c"><div class="t">School announcements <b data-b="x">×</b></div><span class="ac">ACTIVE</span><h5>Smart Student ID Cards</h5><p>New ID cards with QR verification are being released this week. (Sample bulletin)</p></div></div>' +
          '<div class="sv-prof"><div class="sv-ava">' + SIL + '</div><div class="n">JUAN DELA CRUZ</div><div class="lrn">LRN 1234 5678 9012</div><span class="sv-pill">ENROLLED</span><div class="sy">School Year 2026–2027</div></div>' +
          '<div class="sv-kv">' + kv.map(function (r) { return "<p><span>" + r[0] + "</span><b>" + r[1] + "</b></p>"; }).join("") + "</div>" +
          '<div class="sv-emg"><div class="eh">IN CASE OF EMERGENCY – PARENT / GUARDIAN</div><p><span>Name</span><b>Maria Dela Cruz</b></p><p><span>Contact</span><b>0900 000 0000</b></p><p><span>Address</span><b>Sample City</b></p></div>' +
          '<div class="sv-foot">School Head: <b>Dr. Sample Principal</b><small>Live from school records · Oct 12, 2026 8:15 AM</small></div>' +
        '</div></div><div class="sv-skel"><i></i><i></i><i></i><i></i><i></i></div></div>' +
      '<span class="sv-tapfx"></span>' +
    '</div></div>' +
    '<div class="sv-bts"><h4>Behind the scenes</h4><ol class="sv-steps"><li><b>QR on the ID</b><span>Links to the web app</span></li><li><b>Apps Script web app</b><span>Opens in the phone browser</span></li><li><b>Google Sheet lookup</b><span>Reads the live school record</span></li><li><b>Profile page</b><span>Status and details</span></li></ol></div></div>';

  function q(s) { return root.querySelector(s); }
  var scr = q(".sv-scr"), S = [].slice.call(root.querySelectorAll("[data-s]")), sb = q(".sv-sb");
  var target = q(".sv-target"), laser = q(".sv-laser"), lock = q(".sv-lock"), qrEl = q(".sv-id .qr"), hand = q(".sv-hand");
  var openB = q('[data-b="open"]'), hdr = q('[data-b="hdr"]'), xB = q('[data-b="x"]'), tapLbl = q(".sv-tap"), ann = q(".sv-ann");
  var prog = q(".sv-prog"), skel = q(".sv-skel"), view = q(".sv-view"), page = q(".sv-page"), fx = q(".sv-tapfx");
  var steps = [].slice.call(root.querySelectorAll(".sv-steps li"));
  var pk = document.createElement("span"); pk.className = "sv-pk"; q(".sv-steps").appendChild(pk);

  var LOOP = 16.6, T_RES = 3.0, T_OPEN = 4.4, T_BRW = 5.0, T_PAGE = 6.4, T_D0 = 7.8, T_D1 = 11.2, T_U0 = 11.8, T_U1 = 13.2, T_HDR = 13.6, T_X = 15.4;
  function ease(k) { k = Math.max(0, Math.min(1, k)); return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function rr(el) { var a = el.getBoundingClientRect(), b = scr.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
  function set(el, c, on) { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); }
  var lastTap = -1;
  function tap(el, id) {
    if (lastTap === id) return; lastTap = id;
    var r = rr(el); fx.style.left = r.x + r.w / 2 + "px"; fx.style.top = r.y + r.h / 2 + "px";
    fx.classList.remove("go"); void fx.offsetWidth; fx.classList.add("go");
  }

  function render(t) {
    var scrn = t < T_RES ? 0 : t < T_BRW ? 1 : 2;
    S.forEach(function (s, i) { set(s, "in", i === scrn); });
    set(sb, "dark", scrn === 2);
    // camera: target locks onto the QR (bottom-left of the card) while the laser sweeps
    if (scrn === 0) {
      hand.style.transform = "rotate(" + (-4 + Math.sin(t * 2.2) * 1.2) + "deg) translateY(" + Math.sin(t * 1.7) * 3 + "px)";
      var qrR = rr(qrEl), k = ease((t - 0.5) / 1.4);
      var big = { x: 47, y: 140, w: 140, h: 140 }, small = { x: qrR.x - 6, y: qrR.y - 6, w: qrR.w + 12, h: qrR.h + 12 };
      var x = big.x + (small.x - big.x) * k, y = big.y + (small.y - big.y) * k, w = big.w + (small.w - big.w) * k, h = big.h + (small.h - big.h) * k;
      target.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px";
      var ly = y + h * (0.5 + 0.48 * Math.sin(t * 6));
      laser.style.cssText = "left:" + (x + 3) + "px;width:" + (w - 6) + "px;top:" + ly + "px";
      set(lock, "in", t >= 2.0);
    }
    // scan result: tap Open
    set(openB, "press", t >= T_OPEN && t < T_OPEN + 0.25);
    if (t >= T_OPEN && t < T_OPEN + 0.3) tap(openB, 1);
    // browser load
    prog.style.transform = "scaleX(" + (t < T_BRW ? 0 : Math.min(1, (t - T_BRW) / (T_PAGE - T_BRW - 0.1))).toFixed(3) + ")";
    prog.style.opacity = t < T_PAGE + 0.2 ? 1 : 0;
    skel.style.opacity = t < T_PAGE ? 1 : 0;
    // announcements
    var annOpen = t >= T_HDR + 0.1 && t < T_X + 0.1;
    set(ann, "open", annOpen);
    var lbl = annOpen ? "TAP TO HIDE" : "TAP FOR ANNOUNCEMENTS"; if (tapLbl.textContent !== lbl) tapLbl.textContent = lbl;
    if (t >= T_HDR && t < T_HDR + 0.3) tap(tapLbl, 2);
    if (t >= T_X && t < T_X + 0.3) tap(xB, 3);
    if (t < 1) lastTap = -1;
    // auto-scroll down, then back up
    var max = Math.max(0, page.offsetHeight - view.clientHeight + 6), y2 = 0;
    if (t >= T_D0 && t < T_U0) y2 = max * ease((t - T_D0) / (T_D1 - T_D0));
    else if (t >= T_U0 && t < T_U1) y2 = max * (1 - ease((t - T_U0) / (T_U1 - T_U0)));
    page.style.transform = "translateY(" + (-y2).toFixed(1) + "px)";
    // behind the scenes
    var st = t < T_RES ? 0 : t < T_BRW ? 1 : t < T_PAGE ? 2 : 3;
    steps.forEach(function (li, i) { set(li, "on", i === st); });
    var a = steps[st], b = steps[Math.min(3, st + 1)];
    var segStart = [0, T_RES, T_BRW, T_PAGE][st], segEnd = [T_RES, T_BRW, T_PAGE, T_PAGE + 1][st];
    var kk = st === 3 ? 0 : ease((t - segStart) / (segEnd - segStart));
    var horiz = root.clientWidth < 520;
    if (horiz) { pk.style.transform = "translate(" + (a.offsetLeft + (b.offsetLeft - a.offsetLeft) * kk) + "px,0)"; }
    else { pk.style.transform = "translate(0," + (a.offsetTop + 6 + (b.offsetTop - a.offsetTop) * kk) + "px)"; }
  }

  var acc = 0, t0 = null, visible = false;
  window.__svRestart = function () { acc = 0; t0 = null; };
  if (SHOT || REDUCED) { render(T_PAGE + 0.8); return; }
  function loop(now) {
    if (!visible || document.hidden) { t0 = null; return; }
    if (t0 === null) t0 = now - acc * 1000;
    acc = ((now - t0) / 1000) % LOOP;
    render(acc);
    requestAnimationFrame(loop);
  }
  render(0);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = visible; visible = e[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(root);
  else { visible = true; requestAnimationFrame(loop); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) requestAnimationFrame(loop); });
})();

/* =================== POS + accounting illustration (sample data only) =================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-acflow]");
  if (!root) return;
  var SHOT = new URLSearchParams(location.search).has("shot");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ITEMS = { mug: ["Mug print", 150], tee: ["T-shirt sublimation", 350], lam: ["ID lamination", 25], lan: ["Lanyard", 60], pvc: ["PVC ID", 80], pho: ["Photo print", 20] };
  var SALES = [
    { s: 0.2, e: 2.6, cust: "Walk-in", ev: [[0.4, "mug", 1], [0.85, "mug", 1], [1.3, "lan", 1]], charge: 1.85, saved: 2.0 },
    { s: 2.7, e: 4.9, cust: "Sample School · on account", ev: [[3.1, "lam", 10], [3.6, "lan", 10]], charge: 4.1, saved: 4.25 },
    { s: 5.0, e: 6.4, cust: "Walk-in", ev: [[5.3, "tee", 1]], charge: 5.75, saved: 5.9 }
  ];
  var TABS = [["pos", "POS", 0], ["dash", "Dashboard", 7.8], ["inv", "Inventory", 9.8], ["pur", "Purchasing", 11.7], ["cus", "Customers", 13.4], ["bil", "Billing / Statements", 15.0], ["sub", "Subscriptions", 16.7]];
  var LOOP = 18.6, G0 = 6.4, G1 = 7.8;
  function peso(n) { return "₱" + n.toLocaleString("en-US"); }
  var html =
    '<div class="acw"><div class="ac-top"><b>Sample Shop · Accounting</b><span>Oct 12, 2026</span></div><div class="ac-body"><div class="ac-side">' +
    TABS.map(function (t) { return '<span data-tab="' + t[0] + '"><i></i>' + t[1] + "</span>"; }).join("") + '</div><div class="ac-main">' +
    // POS
    '<div class="ac-p" data-p="pos"><div class="pos"><div class="pos-items">' +
      Object.keys(ITEMS).map(function (k) { return '<span data-it="' + k + '">' + ITEMS[k][0] + "<b>" + peso(ITEMS[k][1]) + "</b></span>"; }).join("") +
    '</div><div class="cart"><div class="cu">Customer: <b data-cu>Walk-in</b></div><ul data-cart></ul><div class="tot"><span>Total</span><span data-tot>₱0</span></div><span class="charge" data-charge>Charge ₱0</span></div></div>' +
    '<div class="saved" data-saved>✓ Sale saved<small data-savedtx></small></div>' +
    '<div class="gen" data-gen><div class="gen-box"><h6>Generating… 3 sales today</h6><p data-g="0">Stock <b>●</b></p><p data-g="1">Customers <b>●</b></p><p data-g="2">Billing <b>●</b></p><p data-g="3">Statements <b>●</b></p></div></div></div>' +
    // Dashboard
    '<div class="ac-p" data-p="dash"><p class="ac-h">Dashboard <small>today</small></p><div class="kpis"><div class="kpi main"><span>Sales today</span><b data-kpi>₱0</b></div><div class="kpi"><span>Transactions</span><b>3</b></div><div class="kpi"><span>On account</span><b>₱850</b></div></div>' +
      '<div class="chart"><i style="--h:40%"></i><i style="--h:62%"></i><i style="--h:48%"></i><i style="--h:70%"></i><i style="--h:55%"></i><i style="--h:66%"></i><i class="today" style="--h:84%" data-bar></i></div><div class="chart-l"><span>Mon</span><span>Today</span></div>' +
      '<div class="alert" data-alert>⚠ <span><b>Low stock:</b> Lanyards (3 left), Mug blanks (10 left)</span><span class="rb">Reorder</span></div></div>' +
    // Inventory
    '<div class="ac-p" data-p="inv"><p class="ac-h">Inventory <small>after today’s sales</small></p><div class="tbl2"><div class="r hd"><span>Item</span><span>Level</span><span>On hand</span></div>' +
      [["Mug blanks", 12, 10, "low"], ["Lanyards", 14, 3, "low"], ["Lamination pouches", 40, 30, ""], ["T-shirt blanks", 8, 7, ""]].map(function (r, i) {
        return '<div class="r" data-inv="' + i + '" data-a="' + r[1] + '" data-b="' + r[2] + '" data-low="' + r[3] + '"><span>' + r[0] + '</span><span class="lvl"><i></i></span><span class="tag2" data-q>' + r[1] + "</span></div>";
      }).join("") + '</div><div class="alert fade" data-at="1.0" style="margin-top:8px">⚠ <span><b>Reorder suggested</b> for 2 items below their reorder level</span><span class="rb">Reorder</span></div></div>' +
    // Purchasing
    '<div class="ac-p" data-p="pur"><p class="ac-h">Purchasing <small>PO-0001 · draft</small></p><div class="doc fade in" data-at="0"><div class="dh">Purchase order · Sample Supplier<span>Auto-drafted</span></div>' +
      '<p class="fade" data-at="0.4"><span>Lanyards × 50</span><span>low stock</span></p><p class="fade" data-at="0.8"><span>Mug blanks × 24</span><span>low stock</span></p><p class="dt fade" data-at="1.1"><span>Status</span><span>Draft · ready to send</span></p></div></div>' +
    // Customers
    '<div class="ac-p" data-p="cus"><p class="ac-h">Customers <small>3 accounts</small></p><div class="tbl2"><div class="r hd"><span>Customer</span><span>Latest</span><span>Balance</span></div>' +
      '<div class="r"><span>Walk-in</span><span>2 sales today</span><span class="tag2 grn">Paid</span></div>' +
      '<div class="r" data-hl><span>Sample School</span><span class="fade" data-at="0.5">+ ₱850 today</span><span class="tag2 red">₱850</span></div>' +
      '<div class="r"><span>Sample Office</span><span>Subscription</span><span class="tag2">₱0</span></div></div></div>' +
    // Billing
    '<div class="ac-p" data-p="bil"><p class="ac-h">Billing / Statements <small>INV-0001</small></p><div class="doc"><div class="dh">Invoice · Sample School<span>Oct 12, 2026</span></div>' +
      '<p class="fade" data-at="0.2"><span>ID lamination × 10</span><span>₱250</span></p><p class="fade" data-at="0.45"><span>Lanyard × 10</span><span>₱600</span></p><p class="dt fade" data-at="0.7"><span>Total due</span><span>₱850</span></p>' +
      '<span class="stamp fade" data-at="1.0">STATEMENT UPDATED</span></div></div>' +
    // Subscriptions
    '<div class="ac-p" data-p="sub"><p class="ac-h">Subscriptions <small>recurring</small></p><div class="tbl2"><div class="r hd"><span>Customer · plan</span><span>Amount</span><span>Next due</span></div>' +
      '<div class="r hl fade" data-at="0.2"><span>Sample Office · Monthly ID printing</span><span>₱1,200 / mo</span><span class="tag2">Nov 1</span></div></div>' +
      '<p class="fade" data-at="0.7" style="margin:10px 2px 0;font-size:10px;color:#a9b1cc">Next billing run creates the invoice and updates the statement.</p></div>' +
    '<span class="pk2"></span><span class="pk2"></span><span class="pk2"></span><span class="pk2"></span>' +
    '</div></div><div class="ac-foot"><span>Sample Shop · sample figures</span><b data-log>POS · ready</b></div>' +
    '<svg class="ac-cur" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l15 10-6.5 1.4L16 21l-3 1.4-3.6-7.6L4 19z" fill="#fff" stroke="#05060d" stroke-width="1.4" stroke-linejoin="round"/></svg></div>';
  root.innerHTML = html;

  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  var P = {}; qa("[data-p]").forEach(function (e) { P[e.dataset.p] = e; });
  var T = {}; qa("[data-tab]").forEach(function (e) { T[e.dataset.tab] = e; });
  var IT = {}; qa("[data-it]").forEach(function (e) { IT[e.dataset.it] = e; });
  var side = q(".ac-side"), cart = q("[data-cart]"), tot = q("[data-tot]"), chg = q("[data-charge]"), cu = q("[data-cu]");
  var saved = q("[data-saved]"), savedtx = q("[data-savedtx]"), gen = q("[data-gen]"), G = qa("[data-g]"), pks = qa(".pk2");
  var kpi = q("[data-kpi]"), bar = q("[data-bar]"), alertD = q("[data-alert]"), log = q("[data-log]"), cur = q(".ac-cur"), main = q(".ac-main");
  var invRows = qa("[data-inv]"), hlCus = q("[data-hl]");
  function ease(k) { k = Math.max(0, Math.min(1, k)); return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function set(el, c, on) { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); }
  function txt(el, v) { if (el.textContent !== v) el.textContent = v; }
  function rel(el) { var a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { x: a.left - b.left + a.width * 0.5, y: a.top - b.top + a.height * 0.55 }; }

  // cursor keyframes
  var CK = [];
  SALES.forEach(function (s) { s.ev.forEach(function (e) { CK.push([e[0], IT[e[1]]]); }); CK.push([s.charge, chg]); });
  TABS.slice(1).forEach(function (t) { CK.push([t[2], T[t[0]]]); });
  CK.sort(function (a, b) { return a[0] - b[0]; });
  function curPos(t) {
    if (t < CK[0][0]) return rel(CK[0][1]);
    for (var i = 0; i < CK.length - 1; i++) if (t >= CK[i][0] && t < CK[i + 1][0]) {
      var a = rel(CK[i][1]), b = rel(CK[i + 1][1]), d = CK[i + 1][0] - CK[i][0];
      var k = ease((t - CK[i][0] - Math.max(0, d - 0.45)) / Math.min(0.45, d));
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
    return rel(CK[CK.length - 1][1]);
  }
  var lastSig = "";
  function render(t) {
    // active tab
    var ti = 0; TABS.forEach(function (tb, i) { if (t >= tb[2]) ti = i; });
    var tab = TABS[ti], tStart = tab[2];
    TABS.forEach(function (tb, i) { set(T[tb[0]], "on", i === ti); set(P[tb[0]], "in", i === ti); });
    if (side.scrollWidth > side.clientWidth) { var el = T[tab[0]]; var target = Math.max(0, el.offsetLeft - 8); side.scrollLeft = target; }
    // POS: cart state
    var sale = null; SALES.forEach(function (s) { if (t >= s.s && t < s.e) sale = s; });
    var lines = {}, sum = 0, order = [];
    if (sale) sale.ev.forEach(function (e) { if (t >= e[0]) { if (!lines[e[1]]) { lines[e[1]] = 0; order.push(e[1]); } lines[e[1]] += e[2]; } });
    order.forEach(function (k) { sum += lines[k] * ITEMS[k][1]; });
    var sig = order.map(function (k) { return k + lines[k]; }).join(",");
    if (sig !== lastSig) { cart.innerHTML = order.map(function (k) { return "<li><span>" + ITEMS[k][0] + " × " + lines[k] + "</span><b>" + peso(lines[k] * ITEMS[k][1]) + "</b></li>"; }).join(""); lastSig = sig; }
    txt(tot, peso(sum)); txt(chg, "Charge " + peso(sum)); txt(cu, sale ? sale.cust : "Walk-in");
    Object.keys(IT).forEach(function (k) { var on = false; SALES.forEach(function (s) { s.ev.forEach(function (e) { if (e[1] === k && t >= e[0] && t < e[0] + 0.18) on = true; }); }); set(IT[k], "press", on); });
    var cp = false, sv = null; SALES.forEach(function (s, i) { if (t >= s.charge && t < s.charge + 0.18) cp = true; if (t >= s.saved && t < s.e) sv = i; });
    set(chg, "press", cp); set(saved, "in", sv !== null);
    if (sv !== null) txt(savedtx, "Sale " + (sv + 1) + " · " + peso([360, 850, 350][sv]));
    // generating
    set(gen, "in", t >= G0 && t < G1);
    G.forEach(function (g, i) { set(g, "ok", t >= G0 + 0.3 + i * 0.25); });
    var dests = [T.inv, T.cus, T.bil, T.bil];
    pks.forEach(function (p, i) {
      var k = (t - G0 - 0.15 - i * 0.25) / 0.5;
      if (k > 0 && k < 1) { var a = rel(main), b = rel(dests[i]), e2 = ease(k); p.style.opacity = 1; p.style.transform = "translate(" + (a.x + (b.x - a.x) * e2) + "px," + (a.y + (b.y - a.y) * e2) + "px)"; }
      else p.style.opacity = 0;
    });
    ["inv", "cus", "bil"].forEach(function (k, i) { set(T[k], "ping", t >= G0 + 0.6 + i * 0.25 && t < G1 + 0.2); });
    // dashboard
    var dk = ease((t - TABS[1][2] - 0.2) / 1.1);
    txt(kpi, peso(Math.round(1560 * dk)));
    bar.style.transform = "scaleY(" + (0.15 + 0.85 * dk).toFixed(3) + ")";
    set(alertD, "in", t >= TABS[1][2] + 1.1);
    // inventory levels
    invRows.forEach(function (r) {
      var after = t >= TABS[2][2] + 0.4, v = after ? +r.dataset.b : +r.dataset.a;
      r.querySelector(".lvl i").style.setProperty("--w", Math.round(v / 50 * 100) + "%");
      txt(r.querySelector("[data-q]"), String(v));
      var low = after && r.dataset.low === "low"; set(r, "low", low); set(r.querySelector("[data-q]"), "red", low);
    });
    set(hlCus, "hl", t >= TABS[4][2] + 0.5);
    // timed fades inside the active panel
    qa("[data-at]").forEach(function (e) { var pnl = e.closest("[data-p]"); var st = TABS.filter(function (x) { return x[0] === pnl.dataset.p; })[0][2]; set(e, "in", pnl === P[tab[0]] && t >= st + +e.dataset.at); });
    // footer log
    txt(log, t < G0 ? (sale ? "POS · sale " + (SALES.indexOf(sale) + 1) + " of 3" : "POS · ready") : t < G1 ? "Updating stock, customers, billing, statements…" : tab[1] + " · updated from today’s sales");
    // cursor
    var p = curPos(t); cur.style.transform = "translate(" + p.x + "px," + p.y + "px)";
    cur.style.opacity = t > 0.15 && !(t >= G0 && t < G1 - 0.3) ? 1 : 0;
  }
  var acc = 0, t0 = null, visible = false;
  window.__acRestart = function () { acc = 0; t0 = null; };
  if (SHOT || REDUCED) { render(TABS[2][2] - 0.1); return; }
  function loop(now) {
    if (!visible || document.hidden) { t0 = null; return; }
    if (t0 === null) t0 = now - acc * 1000;
    acc = ((now - t0) / 1000) % LOOP;
    render(acc);
    requestAnimationFrame(loop);
  }
  render(0);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = visible; visible = e[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(root);
  else { visible = true; requestAnimationFrame(loop); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) requestAnimationFrame(loop); });
})();

/* =================== Messenger assistant illustration (sample chat) =================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-msflow]");
  if (!root) return;
  var SHOT = new URLSearchParams(location.search).has("shot");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // [kind, show-at, hide-at (typing only), html]
  var CHAT = [
    ["u", 0.3, 0, "Hi! Are you open Saturday?"],
    ["t", 0.7, 1.3],
    ["b", 1.3, 0, "Hi! 👋 Thanks for messaging Sample Business. Yes, we’re open Saturday, 9 AM–3 PM."],
    ["c", 1.5, 0, "<span>Services</span><span>Hours</span><span>Book a call</span>"],
    ["u", 2.6, 0, "Can you do this for a group of 20?"],
    ["t", 3.0, 4.6],
    ["b", 4.6, 0, "Yes, we can arrange a group session for 20. Group pricing is quoted on request after a short consult. Want to book a call?<br><span class=\"ms-src\">source: services.json</span>"],
    ["c", 4.8, 0, '<span data-tap="book">Book a call</span><span>Ask another question</span>'],
    ["u", 6.4, 0, "Book a call"],
    ["t", 6.8, 7.4],
    ["b", 7.4, 0, "Great! Pick a time for a 15-minute call:"],
    ["c", 7.6, 0, '<span data-tap="slot">Sat 10:00 AM</span><span>Sat 1:00 PM</span><span>Mon 9:00 AM</span>'],
    ["u", 8.8, 0, "Sat 10:00 AM"],
    ["t", 9.2, 9.8],
    ["k", 9.8, 0, '<div class="bh">✓ Booked</div><p><span>With</span><b>Sample Business</b></p><p><span>Date</span><b>Sat, Oct 17</b></p><p><span>Time</span><b>10:00 AM</b></p><span class="jn">Join call</span>']
  ];
  var LOOP = 17.4;
  var chatHtml = CHAT.map(function (c, i) {
    if (c[0] === "t") return '<div class="ms-typ" data-c="' + i + '"><i></i><i></i><i></i></div>';
    if (c[0] === "c") return '<div class="ms-chips" data-c="' + i + '">' + c[3] + "</div>";
    if (c[0] === "k") return '<div class="ms-bk" data-c="' + i + '">' + c[3] + "</div>";
    return '<div class="ms-m ' + (c[0] === "u" ? "ms-u" : "ms-b") + '" data-c="' + i + '">' + c[3] + "</div>";
  }).join("");
  root.innerHTML =
    '<div class="sv-wrap"><div class="sv-phone"><div class="sv-scr">' +
      '<div class="sv-sb dark"><span>9:41</span><span>▂▄▆ ◔</span></div>' +
      '<div class="ms-top"><span class="ms-av">SB</span><div><b>Sample Business</b><small>● Typically replies instantly</small></div></div>' +
      '<div class="ms-view"><div class="ms-list">' + chatHtml + "</div></div>" +
      '<div class="ms-comp"><span>Aa</span><i></i></div><span class="sv-tapfx"></span>' +
    "</div></div>" +
    '<div class="ms-bts"><h4>Behind the scenes</h4>' +
      '<div class="ms-st" data-st="0"><i></i><div><b>Canned replies</b><span>Instant greeting and quick replies</span></div></div>' +
      '<div class="ms-st" data-st="1"><i></i><div><b>Gemini AI</b><span>Answers free-text questions from your dataset</span></div></div>' +
      '<div class="ms-ds" data-ds><p>Your dataset <em>🔒 You control this</em></p><ul><li>faq.json</li><li data-hl>services.json</li><li>policies.json</li></ul></div>' +
      '<div class="ms-st" data-st="2"><i></i><div><b>Booking</b><span>Offers time slots and confirms</span></div></div>' +
      '<div class="ms-st" data-st="3"><i></i><div><b>Automation</b><ul class="ms-auto"><li>Booking saved</li><li>Calendar event created</li><li>Call link created</li><li>Owner notified</li></ul></div></div>' +
      '<div class="ms-toast" data-toast><span class="ms-av">SB</span><div><small>Owner’s phone · now</small><b>New booking: Sat 10:00 AM</b><span>Group enquiry · call link sent</span></div></div>' +
    "</div></div>";

  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  var items = qa("[data-c]"), steps = qa("[data-st]"), ds = q("[data-ds]"), dsHl = q("[data-hl]"), autos = qa(".ms-auto li"), toast = q("[data-toast]");
  var fx = q(".sv-tapfx"), scr = q(".sv-scr"), tapBook = q('[data-tap="book"]'), tapSlot = q('[data-tap="slot"]');
  function set(el, c, on) { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); }
  var lastTap = -1;
  function tap(el, id) {
    if (lastTap === id) return; lastTap = id;
    var a = el.getBoundingClientRect(), b = scr.getBoundingClientRect();
    fx.style.left = a.left - b.left + a.width / 2 + "px"; fx.style.top = a.top - b.top + a.height / 2 + "px";
    fx.classList.remove("go"); void fx.offsetWidth; fx.classList.add("go");
  }
  var AUTO = [10.3, 10.9, 11.5, 12.1];
  function render(t) {
    items.forEach(function (el, i) { var c = CHAT[i]; set(el, "in", t >= c[1] && (!c[2] || t < c[2])); });
    set(tapBook, "press", t >= 6.15 && t < 6.45); set(tapSlot, "press", t >= 8.55 && t < 8.85);
    if (t >= 6.15 && t < 6.4) tap(tapBook, 1);
    if (t >= 8.55 && t < 8.8) tap(tapSlot, 2);
    if (t < 1) lastTap = -1;
    var st = t < 2.6 ? 0 : t < 6.2 ? 1 : t < 10.2 ? 2 : 3;
    steps.forEach(function (s, i) { set(s, "on", i === st && t >= 0.3); });
    set(ds, "in", t >= 3.0);
    set(dsHl, "hl", t >= 3.4 && t < 6.2);
    autos.forEach(function (li, i) { set(li, "ok", t >= AUTO[i]); });
    set(toast, "in", t >= 12.1 && t < LOOP - 0.3);
  }
  var acc = 0, t0 = null, visible = false;
  window.__msRestart = function () { acc = 0; t0 = null; };
  if (SHOT || REDUCED) { render(13.0); return; }
  function loop(now) {
    if (!visible || document.hidden) { t0 = null; return; }
    if (t0 === null) t0 = now - acc * 1000;
    acc = ((now - t0) / 1000) % LOOP;
    render(acc);
    requestAnimationFrame(loop);
  }
  render(0);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = visible; visible = e[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(root);
  else { visible = true; requestAnimationFrame(loop); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) requestAnimationFrame(loop); });
})();

/* =================== Threadkeeper concept illustration (sample data) =================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-tkflow]");
  if (!root) return;
  var SHOT = new URLSearchParams(location.search).has("shot");
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOOP = 14;
  var CK = '<span class="tk-ck"><svg viewBox="0 0 12 12"><path d="M2.5 6.3l2.4 2.4 4.6-5"/></svg></span>';
  function row(cls, title, sub, chips) {
    return '<div class="tk-row ' + cls + '">' + CK + '<div class="tk-tx"><b>' + title + "</b><small>" + sub + '</small><div class="tk-chips">' + chips + "</div></div></div>";
  }
  function wait(cls, ini, bg, who, what, n, unit, nudge) {
    return '<div class="tk-row tk-wait ' + cls + '"><span class="tk-av" style="background:' + bg + '">' + ini + '</span><div class="tk-tx"><b>' + who + "</b><small>" + what + "</small>" + (nudge ? '<span class="tk-nudge" data-nudge>Nudge on Viber</span>' : "") + '</div><div class="tk-age">' + n + "<small>" + unit + "</small></div></div>";
  }
  root.innerHTML =
    '<div class="sv-wrap"><div class="sv-phone"><div class="sv-scr tk-scr">' +
      '<div class="sv-sb dark"><span>9:41</span><span>▂▄▆ ◔</span></div>' +
      '<div class="tk-top"><div class="tk-brand"><span class="tk-logo">✓</span>Threadkeeper</div><p class="tk-ttl" data-ttl>Follow-ups</p>' +
        '<div class="tk-stats"><span><b data-open>5</b>Open</span><span><b>1</b>Overdue</span><span><b data-done>2</b>Done today</span></div></div>' +
      '<div class="tk-view">' +
        '<div class="tk-pane" data-pane="0"><p class="tk-sec">Due this week</p>' +
          row("new", "Send quotation to Maria Santos", "Santos Bakeshop · tarpaulin + flyers", '<span class="tk-c due">Due Thu</span><span class="tk-c ch">Viber</span><span class="tk-c rem">⏰ Wed 4 PM</span>') +
          row("", "Call back Liza Cruz re: delivery date", "Cruz Hardware · promised on call Mon", '<span class="tk-c od">Overdue 1d</span><span class="tk-c ch">Phone</span>') +
          row("", "Share revised menu PDF with Paolo Garcia", "Kusina ni Lola · Messenger", '<span class="tk-c due">Today 3 PM</span><span class="tk-c rem">⏰ 2:30 PM</span>') +
          row("", "Confirm event date with Ana Dizon", "Dizon Events · email", '<span class="tk-c">Fri</span><span class="tk-c ch">Email</span>') +
        "</div>" +
        '<div class="tk-pane" data-pane="1"><p class="tk-sec">Waiting on · 3 people</p>' +
          wait("hot", "JR", "#3b6ef5", "Jun Reyes", "Reyes Trading · invoice approval", "3", "days", true) +
          wait("", "CM", "#22b36b", "Carlo Mendoza", "Mendoza Auto Supply · signed PO", "1", "day", false) +
          wait("", "BV", "#e2558a", "Bea Villanueva", "Villanueva Catering · final headcount", "5", "hrs", false) +
        "</div>" +
      "</div>" +
      '<span class="tk-fab" data-fab>+</span>' +
      '<div class="tk-nav"><span data-nav="0"><i></i>Follow-ups</span><span data-nav="1"><i></i>Waiting on</span><span><i></i>Done</span></div>' +
      '<div class="tk-dim" data-dim></div>' +
      '<div class="tk-sheet" data-sheet><h5>New commitment</h5><div class="tk-inp"><span data-typed></span><em></em></div>' +
        '<div class="tk-f">Person<b data-f="0">Maria Santos</b></div><div class="tk-f">Due<b data-f="1">Thu, Oct 15</b></div><div class="tk-f">Channel<b data-f="2">Viber</b></div><div class="tk-f">Remind me<b data-f="3">Wed 4 PM</b></div>' +
        '<div class="tk-save" data-save>Save commitment</div></div>' +
      '<div class="tk-toast" data-toast><span class="tk-logo">✓</span><div><b data-tb></b><small data-ts></small></div></div>' +
      '<span class="tk-burst" data-burst></span><span class="sv-tapfx" data-tap></span>' +
    "</div></div>" +
    '<div class="ms-bts"><h4>The flow</h4><span class="tk-concept">Concept · product design</span>' +
      '<div class="ms-st" data-st="0"><i></i><div><b>Capture</b><span>Log a promise in seconds: who, when, which channel</span></div></div>' +
      '<div class="ms-st" data-st="1"><i></i><div><b>Follow up</b><span>Reminders and overdue flags before anything slips</span></div></div>' +
      '<div class="ms-st" data-st="2"><i></i><div><b>Waiting on</b><span>See who owes you a reply, and for how long</span></div></div>' +
      '<div class="ms-st" data-st="3"><i></i><div><b>Done</b><span>Check it off and keep score</span></div></div>' +
    "</div></div>";

  function q(s) { return root.querySelector(s); }
  function qa(s) { return [].slice.call(root.querySelectorAll(s)); }
  function set(el, c, on) { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); }
  var scr = q(".sv-scr"), panes = qa("[data-pane]"), navs = qa("[data-nav]"), steps = qa("[data-st]"), fields = qa("[data-f]");
  var fab = q("[data-fab]"), dim = q("[data-dim]"), sheet = q("[data-sheet]"), typed = q("[data-typed]"), save = q("[data-save]");
  var toast = q("[data-toast]"), tb = q("[data-tb]"), ts = q("[data-ts]"), ttl = q("[data-ttl]"), openN = q("[data-open]"), doneN = q("[data-done]");
  var newRow = q(".tk-row.new"), nudge = q("[data-nudge]"), burst = q("[data-burst]"), fx = q("[data-tap]");
  var TEXT = "Send quotation to Maria Santos by Thu";
  // [time, element getter] taps
  var TAPS = [[0.7, fab], [3.3, save], [6.9, navs[1]], [8.5, nudge], [10.3, navs[0]], [11.0, newRow.querySelector(".tk-ck")]];
  function pulse(el, target, t, t0, dur) {
    var k = (t - t0) / dur;
    if (k < 0 || k > 1) { el.style.opacity = 0; return false; }
    var a = target.getBoundingClientRect(), b = scr.getBoundingClientRect();
    el.style.left = a.left - b.left + a.width / 2 + "px"; el.style.top = a.top - b.top + a.height / 2 + "px";
    el.style.opacity = (1 - k).toFixed(3); el.style.transform = "scale(" + (0.4 + k).toFixed(3) + ")";
    return true;
  }
  var lastToast = "";
  function render(t) {
    var tab = t >= 6.9 && t < 10.3 ? 1 : 0;
    panes.forEach(function (p, i) { set(p, "on", i === tab); });
    navs.forEach(function (n, i) { set(n, "on", i === tab); });
    ttl.textContent = tab ? "Waiting on" : "Follow-ups";
    set(fab, "press", t >= 0.6 && t < 0.85); set(fab, "hide", (t >= 0.85 && t < 3.6) || tab === 1);
    var sh = t >= 0.85 && t < 3.55;
    set(dim, "in", sh); set(sheet, "in", sh);
    var n = Math.max(0, Math.min(TEXT.length, Math.floor((t - 1.1) / 0.035)));
    typed.textContent = TEXT.slice(0, n);
    fields.forEach(function (f, i) { set(f, "set", t >= 2.5 + i * 0.18); });
    set(save, "press", t >= 3.2 && t < 3.4);
    var added = t >= 3.6, done = t >= 11.05, gone = t >= 12.1;
    set(newRow, "in", added); set(newRow, "done", done); set(newRow, "gone", gone);
    set(nudge, "press", t >= 8.4 && t < 8.6); set(nudge, "sent", t >= 8.6);
    nudge.textContent = t >= 8.6 ? "✓ Nudge sent" : "Nudge on Viber";
    var o = added ? (done ? 5 : 6) : 5, d = done ? 3 : 2;
    if (openN.textContent !== String(o)) { openN.textContent = o; }
    if (doneN.textContent !== String(d)) { doneN.textContent = d; }
    set(openN, "bump", (t >= 3.6 && t < 4.1) || (t >= 11.05 && t < 11.55));
    set(doneN, "bump", t >= 11.05 && t < 11.55);
    var T = t >= 4.6 && t < 6.6 ? ["Reminder · 2:30 PM", "Share revised menu PDF with Paolo Garcia"] :
            t >= 8.7 && t < 10.1 ? ["Nudge sent to Jun Reyes", "“Hi Jun, following up on the invoice approval 🙏”"] :
            t >= 11.4 && t < 13.6 ? ["Done · 3 today", "Quotation sent to Maria Santos"] : null;
    set(toast, "in", !!T);
    if (T && lastToast !== T[0]) { lastToast = T[0]; tb.textContent = T[0]; ts.textContent = T[1]; }
    var st = t < 3.6 ? 0 : t < 6.9 ? 1 : t < 10.3 ? 2 : 3;
    steps.forEach(function (s, i) { set(s, "on", i === st); });
    var on = false;
    TAPS.forEach(function (p) { if (!on) on = pulse(fx, p[1], t, p[0] - 0.1, 0.45); });
    if (!pulse(burst, newRow.querySelector(".tk-ck"), t, 11.05, 0.6)) burst.style.opacity = 0;
  }
  window.__tkRender = render; window.__tkLoop = LOOP;
  if (SHOT || REDUCED) { render(11.3); return; }
  var acc = 0, t0 = null, visible = false;
  function loop(now) {
    if (!visible || document.hidden) { t0 = null; return; }
    if (t0 === null) t0 = now - acc * 1000;
    acc = ((now - t0) / 1000) % LOOP;
    render(acc);
    requestAnimationFrame(loop);
  }
  render(0);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var was = visible; visible = e[0].isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(root);
  else { visible = true; requestAnimationFrame(loop); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) requestAnimationFrame(loop); });
})();
