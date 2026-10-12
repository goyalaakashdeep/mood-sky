// Inner Sky site: the sky changes with each section, stars fade at dawn,
// videos play only while on screen.
(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement.style;

  // sky palettes per section (top, middle, low, glow, stars)
  var SKIES = {
    night:    ['#0b1028', '#24214a', '#3d2f5e', 'rgba(140,120,220,.18)', 1],
    twilight: ['#1a1840', '#4a3a72', '#8a5a7c', 'rgba(240,150,140,.22)', .6],
    dusk:     ['#2a2152', '#7a4f78', '#d48a6a', 'rgba(246,170,110,.30)', .3],
    golden:   ['#3b2d5c', '#a86b6b', '#f0b46a', 'rgba(255,214,130,.42)', .08],
    storm:    ['#14172a', '#2c3048', '#4a4f68', 'rgba(150,160,200,.12)', .2],
    calm:     ['#162044', '#3a4a7c', '#7a86b0', 'rgba(170,190,240,.22)', .45]
  };
  function setSky(name) {
    var s = SKIES[name] || SKIES.night;
    root.setProperty('--sky-top', s[0]);
    root.setProperty('--sky-mid', s[1]);
    root.setProperty('--sky-low', s[2]);
    root.setProperty('--glow', s[3]);
    root.setProperty('--stars', s[4]);
  }
  setSky('night');

  var sections = document.querySelectorAll('[data-sky]');
  if ('IntersectionObserver' in window) {
    var skyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setSky(e.target.getAttribute('data-sky')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { skyObs.observe(s); });

    // entrance
    var riseObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); riseObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rise').forEach(function (el) { riseObs.observe(el); });

    // videos: play while visible, pause otherwise (saves battery); never autoplay with reduced motion
    var vidObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (reduce) return;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: .25 });
    document.querySelectorAll('video[data-auto]').forEach(function (v) {
      v.muted = true; v.playsInline = true;
      if (reduce) { v.controls = true; v.removeAttribute('autoplay'); }
      vidObs.observe(v);
    });
  } else {
    document.querySelectorAll('.rise').forEach(function (el) { el.classList.add('in'); });
  }

  // stars
  var c = document.querySelector('canvas.stars');
  if (c && c.getContext) {
    var ctx = c.getContext('2d'), stars = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / 5200);
      stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * w, y: Math.random() * h * .8, r: Math.random() < .12 ? 1.4 : .8, p: Math.random() * 6.28, s: .4 + Math.random() * 1.2 });
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i], a = reduce ? .7 : .45 + .45 * Math.sin(st.p + t / 1000 * st.s);
        ctx.globalAlpha = a; ctx.fillStyle = '#fffaf0';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); window.addEventListener('resize', size); requestAnimationFrame(draw);
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
