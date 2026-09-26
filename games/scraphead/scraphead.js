(() => {
  'use strict';

  // Paste the Steam store link here when the page goes live, e.g.
  // 'https://store.steampowered.com/app/1234560/SCRAPHEAD/'
  const STEAM_URL = '';

  document.documentElement.classList.add('js');
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message) {
    let el = $('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.append(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------- Steam links ---------- */
  $$('.js-steam').forEach(link => {
    if (STEAM_URL) {
      link.href = STEAM_URL;
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link.addEventListener('click', e => {
        e.preventDefault();
        toast('The Steam page is almost ready. Check back very soon!');
      });
    }
  });

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Loot marquees ---------- */
  const WEAPONS = [
    ['pistol', 'Bolt Pistol'], ['bat', 'Slugger Bat', 1], ['minigun', 'Minigun'], ['chainsaw', 'Chainsaw', 1],
    ['rocket', 'Scrap Rocket'], ['flamethrower', 'Flamethrower'], ['shuriken', 'Shurikens'], ['sword', 'Sword', 1],
    ['gravity_lance', 'Gravity Lance'], ['hand_cannon', 'Hand Cannon'], ['electric_baton', 'Electric Baton', 1],
    ['laser', 'Laser Gun'], ['nailgun', 'Nail Gun'], ['hammer', 'Hammer', 1], ['prism_repeater', 'Prism Repeater'],
    ['rifle', 'Marksman Rifle'], ['scrap_spear', 'Scrap Spear', 1], ['spore_caster', 'Spore Caster'],
    ['storm_coil', 'Storm Coil'], ['knife', 'Gutting Knife', 1], ['uzi', 'Uzi'], ['flintlock', 'Flintlock Pistol'],
    ['scrap_scythe', 'Scrap Sickle', 1], ['shotgun', 'Scrap Shotgun'],
  ];
  const TRINKETS = [
    ['field_weld', 'Duct Tape'], ['lucky_clover', 'Lucky Clover'], ['loaded_dice', 'Loaded Dice'],
    ['roller_skate', 'Roller Skate'], ['scrap_terrier', 'Scrap Terrier'], ['knuckle_wrap', 'Boxing Glove'],
    ['magpie_stone', 'Horseshoe Magnet'], ['lunch_tin', 'Lunch Tin'], ['bloodstone', 'Oil Can'],
    ['aegis_shard', 'Hubcap'], ['buzzbot', 'Buzzbot'], ['cinder_core', 'Pocket Lighter'],
    ['spark_plug', 'Spark Plug'], ['venom_heart', 'Venom Heart'], ['winter_bloom', 'Winter Bloom'],
    ['magnifying_glass', 'Magnifying Glass'], ['volatile_core', 'Gas Bottle'], ['rime_shard', 'Coolant Can'],
    ['lucky_washer', 'Lucky Washer'], ['pressure_gauge', 'Pressure Gauge'],
  ];

  function fillTrack(track, entries, build) {
    if (!track) return;
    // Two copies so the loop can slide exactly half its width and repeat seamlessly.
    for (let copy = 0; copy < 2; copy++) {
      const frag = document.createDocumentFragment();
      entries.forEach(entry => {
        const card = build(entry);
        if (copy) card.setAttribute('aria-hidden', 'true');
        frag.append(card);
      });
      track.append(frag);
    }
  }
  function itemCard(src, name, label, labelClass, extraClass) {
    const card = document.createElement('div');
    card.className = 'item' + (extraClass ? ' ' + extraClass : '');
    card.innerHTML = `<img src="${src}" alt="" loading="lazy" /><b>${name}</b><small class="${labelClass}">${label}</small>`;
    return card;
  }
  fillTrack($('#weapons-track'), WEAPONS, ([id, name, melee]) =>
    itemCard(`img/weapons/weapon-${id}.webp`, name, melee ? 'Melee' : 'Ranged', melee ? 'melee' : ''));
  fillTrack($('#trinkets-track'), TRINKETS, ([id, name]) =>
    itemCard(`img/trinkets/gem-${id}.webp`, name, 'Trinket', 'trinket', 'trinket'));

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Counters ---------- */
  const counters = $('.counters');
  if (counters && 'IntersectionObserver' in window && !reduceMotion) {
    const nums = $$('b[data-count]', counters);
    nums.forEach(b => { b.textContent = '0'; });
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / 1100, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        nums.forEach(b => { b.textContent = Math.round(eased * Number(b.dataset.count)); });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(counters);
  }

  /* ---------- Route map ---------- */
  const route = $('#route');
  const map = route && route.closest('.map');
  const robot = $('#route-robot');
  if (route && map && robot) {
    const nodes = $$('.node', route);
    const svgNS = 'http://www.w3.org/2000/svg';
    const lines = document.createElementNS(svgNS, 'svg');
    lines.classList.add('route-lines');
    lines.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svgNS, 'path');
    lines.append(path);
    route.prepend(lines);

    let active = 0;
    let holdUntil = 0;

    const centreOf = (btn, relativeTo) => {
      const b = btn.getBoundingClientRect();
      const r = relativeTo.getBoundingClientRect();
      return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2, top: b.top - r.top, r: b.width / 2 };
    };

    function drawLines() {
      const pts = nodes.map(n => centreOf($('.node-btn', n), route));
      let d = '';
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        // Trim each dash run so it stops at the circle rims.
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        const pad = a.r + 10;
        d += `M${a.x + dx / len * pad} ${a.y + dy / len * pad} L${b.x - dx / len * pad} ${b.y - dy / len * pad} `;
      }
      path.setAttribute('d', d);
    }

    function placeRobot(instant) {
      const c = centreOf($('.node-btn', nodes[active]), map);
      const w = robot.offsetWidth;
      const h = robot.offsetHeight;
      // The robot's feet sit at ~91% of the render height; stand it on top of the node ring.
      const x = c.x - w / 2;
      const y = c.top - 11 - h * 0.91 + 6;
      if (instant) robot.style.transition = 'none';
      robot.style.transform = `translate(${x}px, ${y}px)`;
      if (instant) { robot.offsetHeight; robot.style.transition = ''; }
      else if (!reduceMotion) {
        robot.classList.add('walking');
        clearTimeout(placeRobot.t);
        placeRobot.t = setTimeout(() => robot.classList.remove('walking'), 1000);
      }
      robot.classList.add('ready');
    }

    function setActive(i, instant) {
      active = (i + nodes.length) % nodes.length;
      nodes.forEach((n, k) => {
        n.classList.toggle('is-active', k === active);
        $('.node-btn', n).setAttribute('aria-pressed', String(k === active));
      });
      placeRobot(instant);
    }

    nodes.forEach((n, k) => {
      $('.node-btn', n).addEventListener('click', () => {
        holdUntil = performance.now() + 9000;
        setActive(k);
      });
    });

    let visible = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 }).observe(route);
    }
    if (!reduceMotion) {
      setInterval(() => {
        if (visible && performance.now() > holdUntil && !document.hidden) setActive(active + 1);
      }, 2600);
    }

    const relayout = () => { drawLines(); placeRobot(true); };
    addEventListener('resize', relayout);
    addEventListener('load', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    robot.complete ? setActive(0, true) : robot.addEventListener('load', () => setActive(0, true));
    drawLines();
  }

  /* ---------- Chassis picker ---------- */
  const cards = $$('.chassis-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => {
        const on = c === card;
        c.classList.toggle('is-picked', on);
        c.setAttribute('aria-checked', String(on));
      });
      card.classList.remove('hop');
      void card.offsetWidth;
      card.classList.add('hop');
    });
  });

  /* ---------- Hat locker ---------- */
  const hatRobot = $('#hat-robot');
  const hatGrid = $('#hat-grid');
  if (hatRobot && hatGrid) {
    const hatButtons = $$('button[data-hat]', hatGrid);
    let preloaded = false;
    const preload = () => {
      if (preloaded) return;
      preloaded = true;
      ['none', ...hatButtons.map(b => b.dataset.hat)].forEach(id => { new Image().src = `img/robot/wear-${id}.webp`; });
    };
    hatGrid.addEventListener('pointerenter', preload, { once: true });
    hatGrid.addEventListener('focusin', preload, { once: true });

    const wear = (id, name) => {
      hatButtons.forEach(b => b.setAttribute('aria-checked', String(b.dataset.hat === id)));
      hatRobot.src = `img/robot/wear-${id || 'none'}.webp`;
      hatRobot.alt = name ? `The Scraphead robot wearing the ${name} hat` : 'The Scraphead robot, hatless, aerial proudly on display';
      hatRobot.classList.remove('pop');
      void hatRobot.offsetWidth;
      hatRobot.classList.add('pop');
    };
    hatButtons.forEach(b => b.addEventListener('click', () => wear(b.dataset.hat, b.textContent.trim())));
    $('#hat-off').addEventListener('click', () => wear('', ''));
  }

  /* ---------- Scrap: click aliens (and the boss) ---------- */
  let scrap = 0;
  const scrapEl = $('#scrap');
  const hud = $('.scrap-hud');
  const quips = [
    'Nice shot!', 'Splat.', 'The Swarm felt that one.', 'Keep that up and you might save the planet.',
    'Scrap acquired.', 'Headshot! (It was mostly head.)',
  ];
  function floatText(text, x, y) {
    const pop = document.createElement('span');
    pop.className = 'pop-scrap';
    pop.textContent = text;
    pop.style.left = `${x}px`;
    pop.style.top = `${y}px`;
    document.body.append(pop);
    setTimeout(() => pop.remove(), 950);
  }
  function addScrap(amount) {
    const before = scrap;
    scrap += amount;
    if (scrapEl) scrapEl.textContent = scrap;
    if (hud) { hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); }
    return Math.floor(scrap / 25) > Math.floor(before / 25);
  }
  const centre = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  $$('.alien').forEach(alien => {
    alien.addEventListener('click', e => {
      if (alien.classList.contains('dead')) return;
      alien.classList.remove('respawn');
      alien.classList.add('dead');
      const [cx, cy] = centre(alien);
      floatText('+5', e.clientX || cx, e.clientY || cy);
      if (addScrap(5)) toast(`${scrap} scrap! ${quips[Math.floor(scrap / 25 - 1) % quips.length]}`);
      setTimeout(() => {
        alien.classList.remove('dead');
        alien.classList.add('respawn');
      }, 4200);
    });
  });

  // The Oxide Baron takes a few hits to go down.
  const boss = $('#boss-hit');
  const hpBar = $('#boss-hp');
  if (boss && hpBar) {
    let hp = 100;
    let down = false;
    boss.addEventListener('click', e => {
      if (down) return;
      const dmg = 9 + Math.floor(Math.random() * 7);
      hp = Math.max(0, hp - dmg);
      hpBar.style.width = `${hp}%`;
      const [cx, cy] = centre(boss);
      floatText(`-${dmg}`, e.clientX || cx, e.clientY || cy);
      boss.classList.remove('hit', 'back');
      void boss.offsetWidth;
      boss.classList.add('hit');
      setTimeout(() => boss.classList.remove('hit'), 120);
      if (hp > 0) return;
      down = true;
      boss.classList.add('down');
      addScrap(100);
      toast('Oxide Baron defeated! +100 scrap. (He\'ll be back.)');
      setTimeout(() => {
        hp = 100;
        hpBar.style.width = '100%';
        boss.classList.remove('down');
        boss.classList.add('back');
        down = false;
      }, 3200);
    });
  }

  /* ---------- Screenshot lightbox ---------- */
  const box = $('#lightbox');
  if (box && typeof box.showModal === 'function') {
    const boxImg = $('img', box);
    $$('.shot').forEach(shot => {
      shot.addEventListener('click', () => {
        const img = $('img', shot);
        boxImg.src = img.currentSrc || img.src;
        boxImg.alt = img.alt;
        box.showModal();
      });
    });
    $('.lb-close', box).addEventListener('click', () => box.close());
    box.addEventListener('click', e => { if (e.target === box) box.close(); });
  }
})();
