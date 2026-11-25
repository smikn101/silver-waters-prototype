/* Silver Waters: Prototype v10
   Small, dependency-free behaviours. Everything works without this file (content is plain HTML);
   the script only adds: smart header, count-up numbers, scroll-driven tabs and moon phases,
   curtain footer and the Start with a conversation shader. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  doc.classList.add('js');

  /* ------------------------------------------------------------------
     1. Smart header: tint after 40px, hide on scroll down, show on scroll up
     ------------------------------------------------------------------ */
  var header = $('.site-header');
  var menuToggle = $('#menu-toggle');
  var lastY = window.scrollY, downTravel = 0, hidden = false;

  function setHidden(h) {
    if (h === hidden || !header) return;
    hidden = h;
    header.classList.toggle('is-hidden', h);
  }
  function updateHeader() {
    if (!header) return;
    var y = Math.max(0, window.scrollY);
    header.classList.toggle('is-tinted', y > 40);
    var dy = y - lastY;
    lastY = y;
    if ((menuToggle && menuToggle.checked) || y <= 100) { downTravel = 0; setHidden(false); return; }
    if (dy > 0) { downTravel += dy; if (downTravel > 10) setHidden(true); }
    else if (dy < 0) { downTravel = 0; setHidden(false); }
  }
  if (header) {
    header.addEventListener('focusin', function () { setHidden(false); });
    if (menuToggle) menuToggle.addEventListener('change', function () { setHidden(false); });
  }

  /* ------------------------------------------------------------------
     2. Count-up numbers
     ------------------------------------------------------------------ */
  var counters = $$('[data-count]').map(function (el) {
    var text = el.textContent.trim();
    var m = /^(\D*?)(\d[\d,]*)(?:\.(\d+))?(\D*)$/.exec(text);
    if (!m) return null;
    var hasCommas = m[2].indexOf(',') > -1;
    return {
      el: el, text: text, prefix: m[1], suffix: m[4],
      value: parseFloat(m[2].replace(/,/g, '') + (m[3] ? '.' + m[3] : '')),
      decimals: m[3] ? m[3].length : 0, commas: hasCommas, done: false
    };
  }).filter(Boolean);

  function formatCount(c, v) {
    var s = v.toFixed(c.decimals);
    if (c.commas) {
      var p = s.split('.');
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = p.join('.');
    }
    return c.prefix + s + c.suffix;
  }
  function runCount(c, delay) {
    var dur = 1600;
    window.setTimeout(function () {
      var t0 = performance.now();
      (function tick(now) {
        var t = clamp((now - t0) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        c.el.textContent = formatCount(c, c.value * eased);
        if (t < 1) requestAnimationFrame(tick); else c.el.textContent = c.text;
      })(t0);
    }, delay);
  }
  counters.forEach(function (c) {
    c.el.setAttribute('role', 'img');
    c.el.setAttribute('aria-label', c.text);
  });
  if (counters.length && !reduceQuery.matches && 'IntersectionObserver' in window) {
    counters.forEach(function (c) { c.el.textContent = formatCount(c, 0); });
    var countObserver = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var c = counters.filter(function (x) { return x.el === entry.target; })[0];
        if (!c || c.done) return;
        c.done = true;
        countObserver.unobserve(entry.target);
        runCount(c, n * 150);
        n++;
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { countObserver.observe(c.el); });
  }

  /* ------------------------------------------------------------------
     3. Services: tabs step through as the section holds still
     ------------------------------------------------------------------ */
  var services = $('.services');
  var radios = services ? $$('.tab-input', services) : [];
  var pinQuery = window.matchMedia('(min-width: 64rem) and (min-height: 42rem)');
  var lockUntil = 0;

  function pinProgress(track) {
    var r = track.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  function scrollToStep(track, i, steps) {
    var r = track.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var top = window.scrollY + r.top + ((i + 0.5) / steps) * span;
    lockUntil = performance.now() + 900;
    window.scrollTo({ top: top, behavior: reduceQuery.matches ? 'auto' : 'smooth' });
    window.setTimeout(updateServices, 950);
  }
  function updateServices() {
    if (!services) return;
    var pinned = pinQuery.matches;
    services.classList.toggle('is-pinned', pinned);
    if (!pinned) { tabLabels.forEach(function (l) { l.style.removeProperty('--fill'); }); return; }
    if (performance.now() < lockUntil) return;
    var raw = pinProgress(services) * radios.length;
    var i = Math.min(radios.length - 1, Math.floor(raw));
    if (!radios[i].checked) radios[i].checked = true;
    setFill(i, clamp(raw - i));
  }
  var tabLabels = services ? $$('.tab-label', services) : [];
  function setFill(active, f) {
    tabLabels.forEach(function (l, k) { l.style.setProperty('--fill', k === active ? f.toFixed(3) : (k < active ? 1 : 0)); });
  }
  radios.forEach(function (r, i) {
    r.addEventListener('change', function () {
      if (r.checked && services.classList.contains('is-pinned')) scrollToStep(services, i, radios.length);
    });
  });

  /* ------------------------------------------------------------------
     4. How a session works: moon phases fill as you scroll
     ------------------------------------------------------------------ */
  var session = $('.session-track');
  var steps = session ? $$('.steps li', session) : [];
  var lit = steps.map(function (li) { return $('.moon-lit', li); });

  function phasePath(f) {
    var c = 24, r = 17;
    if (f <= 0.001) return '';
    if (f >= 0.999) return 'M' + c + ' ' + (c - r) + 'A' + r + ' ' + r + ' 0 1 1 ' + c + ' ' + (c + r) + 'A' + r + ' ' + r + ' 0 1 1 ' + c + ' ' + (c - r) + 'Z';
    var rx = Math.abs(1 - 2 * f) * r, sw = f < 0.5 ? 0 : 1;
    return 'M' + c + ' ' + (c - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + c + ' ' + (c + r) + 'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + sw + ' ' + c + ' ' + (c - r) + 'Z';
  }
  var ease = function (t) { return t * t * (3 - 2 * t); };
  function updateSession() {
    if (!session || !steps.length) return;
    var pinned = pinQuery.matches;
    session.classList.toggle('is-pinned', pinned);
    var p;
    if (pinned) p = pinProgress(session);
    else {
      var r = session.getBoundingClientRect();
      p = clamp((window.innerHeight * 0.85 - r.top) / (r.height * 0.9));
    }
    var fills = [0.25 * ease(clamp(p / 0.2)), 0.5 * ease(clamp((p - 0.2) / 0.35)), ease(clamp((p - 0.55) / 0.4))];
    var active = p < 0.2 ? 0 : (p < 0.55 ? 1 : 2);
    lit.forEach(function (path, i) { if (path) path.setAttribute('d', phasePath(fills[i])); });
    steps.forEach(function (li, i) { li.classList.toggle('is-active', i === active); });
  }

  /* ------------------------------------------------------------------
     5. Curtain footer: content lifts off and uncovers a fixed footer
     ------------------------------------------------------------------ */
  var footer = $('#site-footer');
  var footerInner = footer ? $('.footer-inner', footer) : null;
  var curtainOn = false;

  function measureFooter() {
    if (!footer) return;
    doc.classList.remove('js-curtain');
    var h = footer.offsetHeight;
    curtainOn = h < window.innerHeight;
    if (curtainOn) {
      doc.style.setProperty('--footer-h', h + 'px');
      doc.classList.add('js-curtain');
    } else {
      doc.style.removeProperty('--footer-h');
      if (footerInner) { footerInner.style.transform = ''; footerInner.style.opacity = ''; }
    }
    updateCurtain();
  }
  function updateCurtain() {
    if (!curtainOn || !footerInner) return;
    var h = footer.offsetHeight;
    var docH = doc.scrollHeight;
    var progress = clamp((window.scrollY + window.innerHeight - (docH - h)) / h);
    if (reduceQuery.matches) { footerInner.style.transform = ''; footerInner.style.opacity = ''; return; }
    footerInner.style.transform = 'translateY(' + (60 * (1 - progress)).toFixed(1) + 'px)';
    footerInner.style.opacity = (0.3 + 0.7 * progress).toFixed(3);
  }
  if (footer) {
    footer.addEventListener('focusin', function () {
      if (curtainOn) window.scrollTo(0, doc.scrollHeight);
    });
  }

  /* ------------------------------------------------------------------
     One scroll listener, one requestAnimationFrame
     ------------------------------------------------------------------ */
  var ticking = false;
  var who = $('.who');
  function updateParallax() {
    if (!who || reduceQuery.matches) return;
    var r = who.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
    var off = r.top + r.height / 2 - window.innerHeight / 2;
    who.style.setProperty('--parallax', (-off * 0.45).toFixed(1) + 'px');
  }
  function onFrame() {
    ticking = false;
    updateParallax();
    updateHeader();
    updateServices();
    updateSession();
    updateCurtain();
  }
  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', function () { measureFooter(); requestFrame(); });
  window.addEventListener('load', function () { measureFooter(); requestFrame(); });
  if (pinQuery.addEventListener) pinQuery.addEventListener('change', requestFrame);
  measureFooter();
  requestFrame();

  /* ------------------------------------------------------------------
     6. Wave edges (hero divider and footer): a slow rolling swell.
     Two sine components, one travelling, one drifting back, so the crest
     rises and falls instead of sliding sideways.
     ------------------------------------------------------------------ */
  function waveY(x, t, m, a) {
    var s1 = Math.sin(2 * Math.PI * x / 1100 - t * 0.45);
    var s2 = Math.sin(2 * Math.PI * x / 560 - t * 0.7 + 1.1);
    return m + a * (0.72 * s1 + 0.28 * s2);
  }
  var waves = $$('svg[data-wave]').map(function (svg) {
    var fillEl = $('.wave-fill', svg), dotEl = $('.wave-dots', svg);
    return { svg: svg, fill: fillEl, dots: dotEl, m: +svg.dataset.m, a: +svg.dataset.a, off: +svg.dataset.dots,
             close: svg.dataset.wave === 'down' ? ' L1440,140 L0,140 Z' : ' L1440,0 L0,0 Z', on: false };
  });
  function drawWave(w, t) {
    var f = 'M', d = 'M';
    for (var x = 0; x <= 1440; x += 12) {
      var y = waveY(x, t, w.m, w.a);
      f += (x ? ' L' : '') + x + ',' + y.toFixed(1);
      d += (x ? ' L' : '') + x + ',' + (y + w.off).toFixed(1);
    }
    w.fill.setAttribute('d', f + w.close);
    w.dots.setAttribute('d', d);
    w.dots.style.strokeDashoffset = (-t * 9).toFixed(1);
  }
  if (waves.length && !reduceQuery.matches) {
    var waveLast = 0;
    var waveLoop = function (now) {
      requestAnimationFrame(waveLoop);
      if (now - waveLast < 33 || document.hidden) return;
      waveLast = now;
      waves.forEach(function (w) { if (w.on) drawWave(w, now / 1000); });
    };
    if ('IntersectionObserver' in window) {
      var wo = new IntersectionObserver(function (es) {
        es.forEach(function (e) { waves.forEach(function (w) { if (w.svg === e.target) w.on = e.isIntersecting; }); });
      });
      waves.forEach(function (w) { wo.observe(w.svg); });
    } else { waves.forEach(function (w) { w.on = true; }); }
    requestAnimationFrame(waveLoop);
  }

  /* ------------------------------------------------------------------
     7. Start with a conversation: pointillist rings (WebGL), pushed away from the pointer
     ------------------------------------------------------------------ */
  var cta = $('.cta');
  var canvas = cta ? $('.cta-canvas', cta) : null;
  if (!canvas) return;

  var gl = null;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); } catch (e) { gl = null; }
  if (!gl) return;

  var vert = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
  var frag = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec3 uSilver;uniform vec3 uGold;uniform vec4 uDrops[10];',
    'void main(){',
    '  vec2 p=(gl_FragCoord.xy-0.5*uRes)/uRes.y;',
    '  float h=0.0;',
    '  for(int i=0;i<10;i++){',
    '    vec4 dr=uDrops[i]; float age=uTime-dr.z;',
    '    if(age>0.0&&age<16.0){',
    '      vec2 dv=p-(dr.xy-0.5*uRes)/uRes.y; float dd=length(dv);',
    '      float R=age*0.1; float e=dd-R;',
    '      float env=exp(-e*e/0.012)*exp(-age*0.16)*dr.w/(1.0+dd*1.2);',
    '      h+=sin(e*38.0)*env;',
    '      p+=dv/(dd+0.0001)*sin(e*38.0)*env*0.02;',
    '    }',
    '  }',
    '  float r=length(p); float a=atan(p.y,p.x);',
    '  float N=34.0; float rr=r*N; float ring=floor(rr); float fr=fract(rr);',
    '  float rad=(ring+0.5)/N;',
    '  float dir=mod(ring,2.0)<1.0?1.0:-1.0;',
    '  float aa=a;',
    '  float cnt=max(6.0,floor(6.2831853*rad*N));',
    '  float cell=fract(aa/6.2831853*cnt);',
    '  vec2 q=vec2(cell-0.5,fr-0.5);',
    '  float dist=length(q);',
    '  float size=0.128+0.04*sin(ring*1.7);',
    '  float dotm=smoothstep(size,size-0.09,dist);',
    '  float rays=0.62+0.38*sin(a*18.0+ring*0.2);',
    '  float fade=1.0-0.45*smoothstep(0.5,1.7,rad);',
    '  float quiet=mix(0.28,1.0,smoothstep(0.18,0.62,length(p*vec2(0.62,1.5))));',
    '  float alpha=dotm*fade*quiet*rays*0.9*(1.0+0.9*clamp(h,-0.5,0.8));',
    '  alpha=clamp(alpha,0.0,1.0);',
    '  vec3 col=mod(ring,3.0)<1.0?uGold:uSilver;',
    '  gl_FragColor=vec4(col*alpha,alpha);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = compile(gl.VERTEX_SHADER, vert), fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  var U = {
    res: gl.getUniformLocation(prog, 'uRes'), time: gl.getUniformLocation(prog, 'uTime'),
    drops: gl.getUniformLocation(prog, 'uDrops[0]'), silver: gl.getUniformLocation(prog, 'uSilver'),
    gold: gl.getUniformLocation(prog, 'uGold')
  };
  function hexToRgb(hex) {
    hex = hex.trim().replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (x) { return x + x; }).join('');
    var n = parseInt(hex.slice(0, 6), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  var styles = getComputedStyle(doc);
  var silver = hexToRgb(styles.getPropertyValue('--secondary-brand-1') || '#DDE6EE');
  var gold = hexToRgb(styles.getPropertyValue('--primary-brand-1') || '#C8A46B');
  gl.uniform3fv(U.silver, silver);
  gl.uniform3fv(U.gold, gold);

  var W = 1, H = 1, running = false, visible = false, rafId = 0, lastDraw = 0;
  var drops = new Float32Array(40), dropIdx = 0, lastDrop = { x: -1e4, y: -1e4, t: 0 };
  for (var di = 0; di < 10; di++) drops[di * 4 + 2] = -100;
  function addDrop(x, y, t, amp) {
    drops[dropIdx * 4] = x; drops[dropIdx * 4 + 1] = y; drops[dropIdx * 4 + 2] = t; drops[dropIdx * 4 + 3] = amp;
    dropIdx = (dropIdx + 1) % 10;
  }
  var nextAuto = 1.2;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.res, W, H);
  }
  function draw(t) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.time, t);
    gl.uniform4fv(U.drops, drops);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (now - lastDraw < 33) return; // about 30fps
    lastDraw = now;
    var t = now / 1000;
    if (t > nextAuto) { // a gentle drop now and then, so the surface is never dead
      addDrop(W * (0.15 + 0.7 * Math.random()), H * (0.15 + 0.7 * Math.random()), t, 0.5 + Math.random() * 0.5);
      nextAuto = t + 1.2 + Math.random() * 5.5;
    }
    draw(t);
  }
  function start() { if (!running && visible && !document.hidden && !reduceQuery.matches) { running = true; rafId = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  function pointerDrop(e, force) {
    var r = canvas.getBoundingClientRect(), dpr = W / r.width;
    var x = (e.clientX - r.left) * dpr, y = (r.height - (e.clientY - r.top)) * dpr;
    var t = performance.now() / 1000;
    var moved = Math.hypot(x - lastDrop.x, y - lastDrop.y) / H;
    if (force || (moved > 0.12 && t - lastDrop.t > 0.35)) {
      addDrop(x, y, t, force ? 1.1 : 0.8);
      lastDrop.x = x; lastDrop.y = y; lastDrop.t = t;
    }
  }
  cta.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch' && running) pointerDrop(e, false); });
  cta.addEventListener('pointerdown', function (e) { if (running) pointerDrop(e, true); });

  resize();
  cta.classList.add('gl-on');
  resize();
  if (reduceQuery.matches) draw(4.0); // one still frame
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { resize(); if (!running) draw(reduceQuery.matches ? 4.0 : lastDraw / 1000); }).observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0 }).observe(cta);
  } else { visible = true; start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  draw(4.0);
})();
