(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Sketch / final slider ---------- */
  const compare = $('#compare');
  if (compare) {
    const input = $('input', compare);
    let touched = false;
    const set = v => compare.style.setProperty('--pos', `${v}%`);
    input.addEventListener('input', () => { touched = true; set(input.value); });

    // A little sweep on load so people notice they can drag it.
    if (!reduceMotion) {
      const keys = [[0, 50], [900, 82], [1900, 18], [2800, 50]];
      const start = performance.now() + 600;
      const tick = now => {
        if (touched) return;
        const t = now - start;
        if (t < 0) return requestAnimationFrame(tick);
        let i = keys.findIndex(([at]) => at > t);
        if (i === -1) { set(50); input.value = 50; return; }
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
        const k = (t - t0) / (t1 - t0);
        const eased = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const v = v0 + (v1 - v0) * eased;
        set(v); input.value = v;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------- Robot walks the trail as you read ---------- */
  const story = $('#story');
  const trail = $('.trail');
  const robot = $('#trail-robot');
  if (story && trail && robot) {
    let stopTimer;
    const place = () => {
      const r = trail.getBoundingClientRect();
      const progress = Math.min(Math.max((innerHeight * 0.45 - r.top) / r.height, 0), 1);
      robot.style.top = `${progress * (r.height - robot.offsetHeight)}px`;
    };
    addEventListener('scroll', () => {
      place();
      if (reduceMotion) return;
      robot.classList.add('walking');
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => robot.classList.remove('walking'), 160);
    }, { passive: true });
    addEventListener('resize', place);
    addEventListener('load', place);
    place();
  }
})();
