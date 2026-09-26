(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 90}ms`;
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Mascot ---------- */
  const mascot = $('#mascot');
  if (mascot) {
    const svg = $('svg', mascot);
    const pupils = $$('.pupil', mascot);
    const face = $('#face');
    const mouth = $('#mouth');
    const bubble = $('#bubble');
    if (reduceMotion && svg.pauseAnimations) svg.pauseAnimations();

    // Eyes follow the pointer. Face shifts a touch too, so it feels round.
    let targetX = 0, targetY = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      pupils.forEach(p => p.setAttribute('transform', `translate(${x * 2.2} ${y * 2.2})`));
      face.setAttribute('transform', `translate(${x * 1.1} ${y * 0.8})`);
      raf = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width * 0.46;
      const cy = r.top + r.height * 0.5;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const pull = Math.min(len / 320, 1);
      targetX = dx / len * pull;
      targetY = dy / len * pull;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });

    // Poke it.
    const lines = [
      'Hello!', "I'm a planet. And a fruit.", 'Go play SCRAPHEAD!', 'Ripe and ready.', 'Hehe, that tickles.',
      'Please do not eat me.', 'Juicy games inside!', 'Boing!', 'Wishlist SCRAPHEAD, pretty please?',
    ];
    let line = 0, hideTimer;
    const smile = 'M45 60 Q51 66 57 59';
    const gasp = 'M47 60 Q51 67 55 60 Q51 57 47 60';
    const say = text => {
      bubble.textContent = text;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => bubble.classList.remove('show'), 2400);
    };
    mascot.addEventListener('click', () => {
      mascot.classList.remove('boing');
      void mascot.offsetWidth;
      mascot.classList.add('boing');
      mouth.setAttribute('d', gasp);
      setTimeout(() => mouth.setAttribute('d', smile), 450);
      say(lines[line++ % lines.length]);
    });
    setTimeout(() => say('Hello!'), 900);
  }

  /* ---------- Featured game card tilt ---------- */
  const feature = $('#scraphead-card');
  if (feature && !reduceMotion && matchMedia('(hover: hover)').matches) {
    feature.addEventListener('pointermove', e => {
      const r = feature.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      feature.style.transform = `perspective(1400px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-4px)`;
    });
    feature.addEventListener('pointerleave', () => { feature.style.transform = ''; });
  }
})();
