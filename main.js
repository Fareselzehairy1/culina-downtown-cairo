/* =========================================================
   CULINA — main.js
   Parallax hero · 3D station carousel · reveals · booking
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------
     1 · PRELOADER
  --------------------------------------------------- */
  const preloader = $('#preloader');
  if (preloader) {
    const t0 = Date.now();
    const hide = () => {
      const wait = Math.max(0, 1500 - (Date.now() - t0));
      setTimeout(() => preloader.classList.add('done'), wait);
    };
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    setTimeout(() => preloader.classList.add('done'), 5000); // safety
  }

  /* ---------------------------------------------------
     2 · NAVIGATION
  --------------------------------------------------- */
  const nav    = $('#nav');
  const burger = $('#navBurger');
  const links  = $('#navLinks');

  const onScrollNav = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    $$('a', links).forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }));
  }

  // active link tracking
  const sectionIds = ['home', 'buffet', 'events', 'reviews', 'reserve'];
  const navAnchors = $$('.nav-links a[href^="#"]');
  const trackActive = () => {
    const y = window.scrollY + 160;
    let current = 'home';
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) current = id;
    });
    navAnchors.forEach(a =>
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current && !a.classList.contains('nav-cta'))
    );
  };

  /* ---------------------------------------------------
     3 · HERO — stars, windows, reflection, parallax
  --------------------------------------------------- */
  // twinkling stars
  const starsBox = $('#stars');
  if (starsBox) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 95; i++) {
      const s = document.createElement('i');
      s.style.left = (Math.random() * 100).toFixed(2) + '%';
      s.style.top  = (Math.random() * 58).toFixed(2) + '%';
      const sz = (1 + Math.random() * 1.8).toFixed(1);
      s.style.width = s.style.height = sz + 'px';
      s.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
      s.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + 's';
      frag.appendChild(s);
    }
    starsBox.appendChild(frag);
  }

  // twinkling city windows
  const winGroup = $('#windows');
  if (winGroup) {
    const NS = 'http://www.w3.org/2000/svg';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 420; i++) {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', (Math.random() * 1440).toFixed(1));
      r.setAttribute('y', (46 + Math.random() * 266).toFixed(1));
      r.setAttribute('width',  (2.5 + Math.random() * 3).toFixed(1));
      r.setAttribute('height', (3.5 + Math.random() * 4).toFixed(1));
      r.style.animationDelay = (-Math.random() * 5.5).toFixed(2) + 's';
      r.style.animationDuration = (4 + Math.random() * 4).toFixed(2) + 's';
      frag.appendChild(r);
    }
    winGroup.appendChild(frag);
  }

  // clone skyline into the reflection
  const skyline = $('#skyline');
  const reflTarget = $('#reflTarget');
  if (skyline && reflTarget) {
    const clone = skyline.cloneNode(true);
    clone.removeAttribute('id');
    $$('[id]', clone).forEach(el => el.removeAttribute('id'));
    reflTarget.appendChild(clone);
  }

  // parallax (scroll + pointer)
  const hero = $('.hero');
  const layers = hero ? $$('[data-depth]', hero) : [];
  const content = $('.hero-content');
  let px = 0, py = 0;          // pointer −1..1
  let scrollY = window.scrollY;
  let rafId = null;

  const renderParallax = () => {
    rafId = null;
    if (!hero) return;
    const hRect = hero.getBoundingClientRect();
    const visible = hRect.bottom > 0;

    if (visible) {
      layers.forEach(el => {
        const d = parseFloat(el.dataset.depth) || 0;
        const isContent = el === content;
        const ty = scrollY * d * (isContent ? 0.05 : 0.010) + py * d * 0.25;
        const tx = px * d * 0.5;
        el.style.setProperty('--px', tx.toFixed(2) + 'px');
        el.style.setProperty('--py', ty.toFixed(2) + 'px');
      });
      if (content) {
        const fade = Math.min(1, Math.max(0, 1 - scrollY / (hero.offsetHeight * 0.55)));
        content.style.opacity = fade.toFixed(3);
        const cue = $('.scroll-cue');
        if (cue) cue.style.opacity = fade.toFixed(3);
      }
    }
  };
  const requestParallax = () => { if (rafId == null) rafId = requestAnimationFrame(renderParallax); };

  window.addEventListener('scroll', () => { scrollY = window.scrollY; onScrollNav(); trackActive(); requestParallax(); }, { passive: true });
  window.addEventListener('resize', requestParallax, { passive: true });

  if (!reduced && hero) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      py = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      requestParallax();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { px = 0; py = 0; requestParallax(); }, { passive: true });
  }
  onScrollNav(); trackActive(); requestParallax();

  /* ---------------------------------------------------
     4 · REVEAL ON SCROLL
  --------------------------------------------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------------------------------------------------
     5 · 3D STATION CAROUSEL
  --------------------------------------------------- */
  const stage    = $('#stage');
  const stations = $$('.station', stage || document);
  const dotsBox  = $('#stageDots');
  const N = stations.length;
  let active = 0;
  let autoTimer = null;

  if (stage && N) {
    const dots = [];
    if (dotsBox) {
      stations.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Station ' + (i + 1));
        b.addEventListener('click', () => { go(i); restart(); });
        dotsBox.appendChild(b);
        dots.push(b);
      });
    }

    const spacing = () => Math.max(178, Math.min(330, stage.clientWidth * 0.33));

    const layout = () => {
      const sp = spacing();
      stations.forEach((el, i) => {
        let d = i - active;
        if (d >  N / 2) d -= N;
        if (d < -N / 2) d += N;
        const ad = Math.abs(d);
        const x  = d * sp;
        const z  = -ad * 150;
        const ry = -d * 36;
        const sc = d === 0 ? 1 : 0.93;
        el.style.transform =
          'translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + ry + 'deg) scale(' + sc + ')';
        el.style.opacity   = ad > 2 ? '0' : String(1 - ad * 0.12);
        el.style.zIndex    = String(30 - ad);
        el.style.pointerEvents = ad <= 1 ? 'auto' : 'none';
        el.setAttribute('aria-hidden', ad === 0 ? 'false' : 'true');
        el.classList.toggle('is-active', d === 0);
      });
      dots.forEach((b, i) => {
        b.classList.toggle('on', i === active);
        b.setAttribute('aria-selected', String(i === active));
      });
    };

    function go(i) {
      active = ((i % N) + N) % N;
      layout();
    }
    const next = () => go(active + 1);
    const prev = () => go(active - 1);

    $('#stageNext') && $('#stageNext').addEventListener('click', () => { next(); restart(); });
    $('#stagePrev') && $('#stagePrev').addEventListener('click', () => { prev(); restart(); });

    // keyboard
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { next(); restart(); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { prev(); restart(); e.preventDefault(); }
    });

    // drag / swipe
    let startX = null, dragging = false;
    stage.addEventListener('pointerdown', e => {
      startX = e.clientX; dragging = true;
      stage.style.userSelect = 'none';
      try{ stage.setPointerCapture(e.pointerId); }catch(_){}
    });
    stage.addEventListener('pointerup', e => {
      if (dragging && startX != null) {
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 55) { dx < 0 ? next() : prev(); restart(); }
      }
      dragging = false; startX = null;
      stage.style.userSelect = '';
      try{ stage.releasePointerCapture(e.pointerId); }catch(_){}
    });
    stage.addEventListener('pointercancel', () => { dragging = false; startX = null; stage.style.userSelect = ''; });

    // autoplay (pauses on hover / focus / hidden tab)
    const start = () => { if (!reduced) autoTimer = setInterval(next, 5200); };
    const stop  = () => { clearInterval(autoTimer); autoTimer = null; };
    const restart = () => { stop(); start(); };
    stage.addEventListener('pointerenter', stop);
    stage.addEventListener('pointerleave', start);
    stage.addEventListener('focusin', stop);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

    window.addEventListener('resize', layout, { passive: true });
    layout();
    start();
  }

  /* ---------------------------------------------------
     6 · REVIEWS ROTATOR
  --------------------------------------------------- */
  const quotes = $$('.quote');
  const qDots  = $('#quoteDots');
  if (quotes.length && qDots) {
    let qi = 0, qTimer = null;
    const qDotsEls = quotes.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Review ' + (i + 1));
      b.addEventListener('click', () => { showQuote(i); qRestart(); });
      qDots.appendChild(b);
      return b;
    });
    function showQuote(i) {
      qi = i;
      quotes.forEach((q, k) => q.classList.toggle('is-active', k === qi));
      qDotsEls.forEach((b, k) => b.classList.toggle('on', k === qi));
    }
    const qRestart = () => { clearInterval(qTimer); if (!reduced) qTimer = setInterval(() => showQuote((qi + 1) % quotes.length), 6500); };
    showQuote(0); qRestart();
  }

  /* ---------------------------------------------------
     7 · RESERVATION FORM
  --------------------------------------------------- */
  const form = $('#reserveForm');
  if (form) {
    const dateInput = $('#fDate');
    if (dateInput) {
      const t = new Date();
      const iso = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      dateInput.min = iso;
    }

    const fields = $$('.field', form);
    const clearErr = el => el.closest('.field') && el.closest('.field').classList.remove('invalid');
    fields.forEach(f => {
      const ctl = $('input,select,textarea', f);
      if (ctl) { ctl.addEventListener('input', () => clearErr(ctl)); ctl.addEventListener('change', () => clearErr(ctl)); }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstBad = null;
      ['fName', 'fPhone', 'fDate', 'fTime', 'fGuests'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const wrap = el.closest('.field');
        const bad = !el.checkValidity();
        wrap && wrap.classList.toggle('invalid', bad);
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) {
        firstBad.focus({ preventScroll: false });
        form.classList.add('was-validated');
        return;
      }

      const val = id => (document.getElementById(id) || {}).value || '';
      const table = (form.querySelector('input[name="table"]:checked') || {}).value || 'Window Seat';
      const data = {
        name:    val('fName').trim(),
        phone:   val('fPhone').trim(),
        date:    val('fDate'),
        time:    val('fTime'),
        guests:  val('fGuests'),
        table:   table,
        occasion:val('fOccasion'),
        notes:   val('fNotes').trim()
      };

      const prettyDate = data.date
        ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

      // summary card
      const sum = $('#modalSummary');
      if (sum) {
        const rows = [
          ['Name', data.name],
          ['Date', prettyDate],
          ['Time', data.time],
          ['Guests', data.guests],
          ['Table', data.table]
        ];
        if (data.occasion) rows.push(['Occasion', data.occasion]);
        sum.innerHTML = rows.map(r =>
          '<li><span>' + r[0] + '</span><strong>' + String(r[1]).replace(/[<>&]/g, '') + '</strong></li>'
        ).join('');
      }

      // WhatsApp deep link
      const msg =
        'Hello Culina! I would like to confirm my reservation.%0A' +
        'Name: ' + encodeURIComponent(data.name) + '%0A' +
        'Date: ' + encodeURIComponent(prettyDate) + '%0A' +
        'Time: ' + encodeURIComponent(data.time) + '%0A' +
        'Guests: ' + encodeURIComponent(data.guests) + '%0A' +
        'Table: ' + encodeURIComponent(data.table) +
        (data.occasion ? '%0AOccasion: ' + encodeURIComponent(data.occasion) : '');
      const whats = $('#modalWhats');
      if (whats) whats.href = 'https://wa.me/201277233582?text=' + msg;

      openModal();
    });
  }

  /* ---------------------------------------------------
     8 · MODAL
  --------------------------------------------------- */
  const modal = $('#modal');
  const openModal = () => {
    if (!modal) return;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    $('#modalDone') && $('#modalDone').focus();
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 550);
  };
  if (modal) {
    $('#modalClose') && $('#modalClose').addEventListener('click', closeModal);
    $('#modalDone')  && $('#modalDone').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  /* ---------------------------------------------------
     9 · MISC
  --------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
