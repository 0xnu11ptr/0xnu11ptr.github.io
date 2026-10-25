(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover)').matches;

  // tilt + light spot on cards and the dossier
  document.querySelectorAll('.tilt').forEach(function (card) {
    if (reduce) return;
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      card.style.transform = 'rotateY(' + (x - .5) * 12 + 'deg) rotateX(' + (.5 - y) * 12 + 'deg)';
      card.style.setProperty('--hx', x * 100 + '%');
      card.style.setProperty('--hy', y * 100 + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.transform = '';
    });
  });

  // flashlight that follows the cursor
  var root = document.documentElement;
  addEventListener('pointermove', function (e) {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  // magnifying glass that reveals the hidden clues in the hero
  var hero = document.querySelector('.hero');
  if (hero && finePointer) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--lx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--ly', (e.clientY - r.top) + 'px');
      hero.classList.add('lens-on');
    });
    hero.addEventListener('pointerleave', function () {
      hero.classList.remove('lens-on');
      hero.style.setProperty('--lx', '-999px');
      hero.style.setProperty('--ly', '-999px');
    });
  }

  // red strings between the pins on the evidence board
  var board = document.getElementById('board');
  if (board) {
    var svg = board.querySelector('.strings');
    var drawStrings = function () {
      var b = board.getBoundingClientRect();
      var pts = Array.prototype.map.call(board.querySelectorAll('.pin'), function (p) {
        var r = p.getBoundingClientRect();
        return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
      });
      var d = '';
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], c = pts[i];
        var mx = (a[0] + c[0]) / 2;
        var my = (a[1] + c[1]) / 2 + Math.min(60, Math.hypot(c[0] - a[0], c[1] - a[1]) * .12);
        d += 'M' + a[0] + ' ' + a[1] + ' Q' + mx + ' ' + my + ' ' + c[0] + ' ' + c[1] + ' ';
      }
      svg.setAttribute('viewBox', '0 0 ' + b.width + ' ' + b.height);
      svg.innerHTML = '<path d="' + d + '"/>';
    };
    drawStrings();
    addEventListener('resize', drawStrings);
    addEventListener('load', drawStrings);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawStrings);
  }

  // reveal on scroll
  var items = document.querySelectorAll('.section-head, .about-grid, .card-row > *, .st-card, .timeline > li, .post-card, .contact-box');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // local time in Laghouat (UTC+1)
  var clock = document.getElementById('clock');
  if (clock) {
    var tick = function () {
      var d = new Date(Date.now() + 3600000);
      clock.textContent = 'LGH ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
    };
    tick();
    setInterval(tick, 15000);
  }

  // rain
  var c = document.getElementById('rain');
  if (!c || reduce) return;
  var ctx = c.getContext('2d');
  var drops = [];
  var dpr = Math.min(devicePixelRatio || 1, 2);
  var resize = function () {
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
  };
  resize();
  addEventListener('resize', resize);
  var count = Math.min(120, Math.round(innerWidth / 12));
  for (var i = 0; i < count; i++) {
    drops.push({
      x: Math.random() * c.width, y: Math.random() * c.height,
      l: (Math.random() * 14 + 8) * dpr,
      v: (Math.random() * 6 + 7) * dpr,
      a: Math.random() * .22 + .06
    });
  }
  (function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = dpr;
    drops.forEach(function (d) {
      d.y += d.v; d.x -= d.v * .18;
      if (d.y > c.height) { d.y = -d.l; d.x = Math.random() * (c.width + 200); }
      ctx.strokeStyle = 'rgba(201,204,209,' + d.a + ')';
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * .18, d.y - d.l); ctx.stroke();
    });
    requestAnimationFrame(frame);
  })();
})();
