/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光  —  Pinned Scroll Edition
   script.js
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── PRODUCT DATA ──────────────────────────────────── */
  const PRODUCTS = [
    {
      name: 'Blue Begonia',
      nameEN: 'Blue Begonia / 湛藍海棠',
      cn: '湛藍海棠',
      num: '01',
      desc: 'A calm blue glass coaster inspired by the classic begonia motif.',
      motif: 'Begonia flower',
      color: 'Translucent blue',
      meaning: 'Elegance and domestic memory',
      accent: '#79B7D8',
    },
    {
      name: 'Prosperity Peony',
      nameEN: 'Prosperity Peony / 富貴牡丹',
      cn: '富貴牡丹',
      num: '02',
      desc: 'A warm terracotta glass coaster inspired by peony-like floral forms.',
      motif: 'Peony-inspired flower',
      color: 'Terracotta coral',
      meaning: 'Blessing and richness',
      accent: '#D98372',
    },
    {
      name: 'Verdant Vine Blossom',
      nameEN: 'Verdant Vine Blossom / 青藤團花',
      cn: '青藤團花',
      num: '03',
      desc: 'A muted green glass coaster inspired by vine ornaments and floral medallions.',
      motif: 'Vine and floral medallion',
      color: 'Moss green',
      meaning: 'Growth and continuity',
      accent: '#8BAA78',
    },
    {
      name: 'Golden Apricot Bloom',
      nameEN: 'Golden Apricot Bloom / 金杏花窗',
      cn: '金杏花窗',
      num: '04',
      desc: 'A honey yellow glass coaster inspired by four-petal blossoms and tile geometry.',
      motif: 'Four-petal blossom',
      color: 'Honey yellow',
      meaning: 'Warmth and memory',
      accent: '#D8B45C',
    },
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  const qs  = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexRgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ─── HANDLE MISSING IMAGES ─────────────────────────── */
  function handleMissingImages() {
    qsa('img').forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
      });
    });
  }

  /* ─── NAV ───────────────────────────────────────────── */
  function initNav() {
    const nav = qs('#nav');
    const hamburger = qs('#hamburger');
    const mobile = qs('#mobileMenu');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    hamburger.addEventListener('click', () => mobile.classList.toggle('open'));
    qsa('a', mobile).forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));

    // Smooth scroll
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ─── MASKED TEXT REVEAL (GSAP or CSS fallback) ──────── */
  function revealMasked(el, delay) {
    delay = delay || 0;
    if (!el) return;
    if (window.gsap) {
      gsap.fromTo(el,
        { y: '100%', opacity: 0, filter: 'blur(6px)' },
        { y: '0%', opacity: 1, filter: 'blur(0px)', duration: 1.1, delay, ease: 'power3.out' }
      );
    } else {
      setTimeout(() => el.classList.add('revealed'), delay * 1000);
    }
  }

  function revealSplitLines(lines, baseDelay) {
    baseDelay = baseDelay || 0;
    lines.forEach((line, i) => {
      const inner = line.querySelector('span');
      if (!inner) return;
      if (window.gsap) {
        gsap.fromTo(inner,
          { y: '105%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.9, delay: baseDelay + i * 0.12, ease: 'power3.out' }
        );
      } else {
        setTimeout(() => inner.classList.add('revealed'), (baseDelay + i * 0.15) * 1000);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 01 — HERO PIN
     ═══════════════════════════════════════════════════════ */
  function initHeroPin() {
    const wrapper = qs('#scene-hero');
    const section = wrapper.querySelector('.scene-hero');
    if (!section) return;

    if (prefersReduced) {
      // Just reveal immediately
      revealMasked(qs('.s1-title', section));
      revealSplitLines(qsa('.split-line', section));
      qsa('.s1-sub,.s1-actions,.s1-label,.s1-visual', section).forEach(el => {
        if(el) { el.style.opacity='1'; el.style.transform='none'; }
      });
      return;
    }

    if (!window.gsap || !window.ScrollTrigger) {
      initHeroFallback(section);
      return;
    }

    // Initial hidden states
    const label   = qs('.s1-label', section);
    const title   = qs('.s1-title', section);
    const lines   = qsa('.split-line', section);
    const sub     = qs('.s1-sub', section);
    const actions = qs('.s1-actions', section);
    const visual  = qs('.s1-visual', section);

    gsap.set([label, sub, actions], { opacity: 0, y: 20 });
    gsap.set(visual, { opacity: 0, scale: 0.92, filter: 'blur(8px)' });
    lines.forEach(l => gsap.set(l.querySelector('span'), { y: '105%', opacity: 0 }));
    if (title) gsap.set(title, { y: '100%', opacity: 0 });

    // Scene entrance — play on page load (hero is first section)
    const tl = gsap.timeline({ delay: 0.3 });

    // Stage 1: label
    tl.to(label, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
    // Stage 2: title masked reveal
    if (title) tl.to(title, { y: '0%', opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }, '-=0.3');
    // Stage 3: tagline lines
    lines.forEach((line, i) => {
      const inner = line.querySelector('span');
      tl.to(inner, { y: '0%', opacity: 1, duration: 0.9, ease: 'power3.out' }, `-=${i === 0 ? 0.5 : 0.7}`);
    });
    // Stage 4: visual
    tl.to(visual, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out' }, '-=0.7');
    // Stage 5: sub + actions
    tl.to(sub, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5');
    tl.to(actions, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4');
  }

  function initHeroFallback(section) {
    const els = qsa('.s1-label,.s1-sub,.s1-actions,.s1-visual', section);
    els.forEach((el, i) => {
      el.style.transition = `opacity 0.8s ease ${i*0.15}s, transform 0.8s ease ${i*0.15}s`;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }));
    });
    revealMasked(qs('.s1-title', section));
    revealSplitLines(qsa('.split-line', section), 0.4);
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 02 — PRODUCT VALUE PIN
     ═══════════════════════════════════════════════════════ */
  function initProductValuePin() {
    const wrapper = qs('#scene-value');
    const section = wrapper.querySelector('.scene-value');
    if (!section || !window.gsap || !window.ScrollTrigger || prefersReduced) {
      // Fallback: reveal on scroll intersection
      initValueFallback(section);
      return;
    }

    const title   = qs('.s2-title', section);
    const label   = qs('.s2-label', section);
    const visual  = qs('.s2-visual', section);
    const cards   = qsa('.s2-point', section);

    // Set wrapper scroll height
    wrapper.style.height = '250vh';

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=250%',
        pin: section,
        pinSpacing: false,
        scrub: 0.8,
        anticipatePin: 1,
      }
    });

    // Stage 1: label + title
    tl.fromTo(label, { opacity:0, y:15 }, { opacity:1, y:0, duration:0.15 }, 0);
    tl.fromTo(title, { y:'100%', opacity:0, filter:'blur(6px)' },
                     { y:'0%', opacity:1, filter:'blur(0px)', duration:0.2 }, 0.05);
    tl.fromTo(visual, { opacity:0, scale:0.92 }, { opacity:1, scale:1, duration:0.2 }, 0);

    // Stages 2–4: cards stagger
    cards.forEach((card, i) => {
      const start = 0.3 + i * 0.2;
      tl.fromTo(card,
        { opacity:0, x:24 },
        { opacity:1, x:0, duration:0.18 },
        start
      );
    });

    // Hold then fade out
    tl.to([title, label, visual, ...cards], { opacity:0, duration:0.1 }, 0.95);
  }

  function initValueFallback(section) {
    if (!section) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        revealMasked(qs('.s2-title', section));
        qsa('.s2-label, .s2-visual', section).forEach((el, i) => {
          if(el){ el.style.transition=`opacity 0.7s ease ${i*0.1}s`; el.style.opacity='1'; }
        });
        qsa('.s2-point', section).forEach((card, i) => {
          card.style.transitionDelay = `${0.2 + i * 0.15}s`;
          card.classList.add('revealed');
        });
        io.disconnect();
      });
    }, { threshold: 0.2 });
    if (section) io.observe(section);
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 03 — COLLECTION SHOWCASE PIN
     ═══════════════════════════════════════════════════════ */
  function initCollectionShowcasePin() {
    const wrapper = qs('#scene-collection');
    const section = wrapper.querySelector('.scene-collection');
    if (!section) return;

    const frames   = qsa('.product-frame', section);
    const dots     = qsa('.pdot', section);
    const bg       = qs('#collectionBg');
    const numEl    = qs('#collectionNum');
    const nameEl   = qs('#collectionName');
    const cnEl     = qs('#collectionCn');
    const descEl   = qs('#collectionDesc');
    const motifEl  = qs('#metaMotif');
    const colorEl  = qs('#metaColor');
    const meaningEl= qs('#metaMeaning');

    let current = 0;

    function setProduct(idx, animate) {
      if (idx === current && animate) return;
      const p = PRODUCTS[idx];

      // Image frames
      frames[current].classList.remove('active');
      frames[idx].classList.add('active');

      // Dots
      dots[current].classList.remove('active');
      dots[idx].classList.add('active');

      // Background glow
      if (bg) {
        bg.style.background = `radial-gradient(ellipse 70% 60% at 28% 50%, ${hexRgba(p.accent, 0.18)} 0%, transparent 65%)`;
      }

      // Update text
      const fade = animate ? 0.25 : 0;
      function swapText() {
        numEl.textContent    = `${p.num} / 04`;
        nameEl.textContent   = p.name;
        cnEl.textContent     = p.cn;
        descEl.textContent   = p.desc;
        motifEl.textContent  = p.motif;
        colorEl.textContent  = p.color;
        meaningEl.textContent = p.meaning;
      }

      if (window.gsap && animate) {
        gsap.to([numEl, nameEl, cnEl, descEl, motifEl, colorEl, meaningEl], {
          opacity: 0, y: 8, duration: fade, ease: 'power2.in',
          onComplete: () => {
            swapText();
            gsap.to([numEl, nameEl, cnEl, descEl, motifEl, colorEl, meaningEl], {
              opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.04
            });
          }
        });
      } else {
        swapText();
      }

      current = idx;
    }

    // Init background
    if (bg) {
      bg.style.background = `radial-gradient(ellipse 70% 60% at 28% 50%, ${hexRgba(PRODUCTS[0].accent, 0.18)} 0%, transparent 65%)`;
    }

    if (!window.gsap || !window.ScrollTrigger || prefersReduced) {
      // Auto-advance fallback
      let i = 0;
      setInterval(() => {
        i = (i + 1) % PRODUCTS.length;
        setProduct(i, true);
      }, 3000);
      return;
    }

    // GSAP pinned scroll — each product gets ~60vh of scroll
    const scrollBudget = window.innerHeight * (PRODUCTS.length + 1);
    wrapper.style.height = scrollBudget + 'px';

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: `+=${scrollBudget}`,
      pin: section,
      pinSpacing: false,
      anticipatePin: 1,
      scrub: 0.5,
      onUpdate(self) {
        const p = self.progress; // 0–1
        // Divide into 4 equal segments, last one stays on product 4
        const idx = Math.min(PRODUCTS.length - 1, Math.floor(p * PRODUCTS.length));
        if (idx !== current) setProduct(idx, true);
      }
    });

    // Entrance animation for the first product
    const firstFrame = frames[0];
    const collectionText = qs('.collection-text', section);
    gsap.fromTo(firstFrame, { opacity:0, scale:0.88 }, { opacity:1, scale:1, duration:1, ease:'power2.out',
      scrollTrigger: { trigger: wrapper, start:'top 80%', once:true }
    });
    gsap.fromTo(collectionText, { opacity:0, x:30 }, { opacity:1, x:0, duration:1, ease:'power2.out',
      scrollTrigger: { trigger: wrapper, start:'top 80%', once:true }
    });
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 04 — MATERIAL & PACKAGING PIN
     ═══════════════════════════════════════════════════════ */
  function initMaterialPackagingPin() {
    const wrapper = qs('#scene-material');
    const section = wrapper.querySelector('.scene-material');
    if (!section) return;

    const stages  = qsa('.material-stage', section);
    const mprogs  = qsa('.mprog', section);
    let currentStage = 0;

    function setStage(idx) {
      if (idx === currentStage) return;
      stages[currentStage].classList.remove('ms-active');
      mprogs[currentStage].classList.remove('active');
      currentStage = Math.max(0, Math.min(stages.length - 1, idx));
      stages[currentStage].classList.add('ms-active');
      mprogs[currentStage].classList.add('active');

      // Reveal masked text in new stage
      const heading = stages[currentStage].querySelector('.masked-text__inner');
      if (heading && window.gsap) {
        gsap.fromTo(heading, { y:'100%', opacity:0 }, { y:'0%', opacity:1, duration:0.9, ease:'power3.out' });
      } else if (heading) {
        heading.classList.add('revealed');
      }
    }

    if (!window.gsap || !window.ScrollTrigger || prefersReduced) {
      // Initial reveal for stage 0
      const h0 = stages[0].querySelector('.masked-text__inner');
      if (h0) setTimeout(() => h0.classList.add('revealed'), 300);

      // Auto-advance fallback
      let i = 0;
      setInterval(() => {
        i = (i + 1) % stages.length;
        setStage(i);
      }, 3200);
      return;
    }

    const scrollBudget = window.innerHeight * (stages.length + 1);
    wrapper.style.height = scrollBudget + 'px';

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: `+=${scrollBudget}`,
      pin: section,
      pinSpacing: false,
      anticipatePin: 1,
      scrub: 0.5,
      onUpdate(self) {
        const idx = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
        setStage(idx);
      }
    });

    // Entrance reveal for stage 0
    const h0 = stages[0].querySelector('.masked-text__inner');
    if (h0) {
      gsap.fromTo(h0, { y:'100%', opacity:0 },
        { y:'0%', opacity:1, duration:1, ease:'power3.out',
          scrollTrigger: { trigger: wrapper, start:'top 75%', once:true }
        }
      );
    }

    // Stage 2: boxes stagger entrance
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      onEnter() {
        gsap.from('.pkg-box', { opacity:0, y:30, stagger:0.1, duration:0.7, ease:'power2.out', delay:0.3 });
      },
      once: true,
    });
  }

  /* ═══════════════════════════════════════════════════════
     CONTACT SECTION REVEALS
     ═══════════════════════════════════════════════════════ */
  function initContactReveal() {
    const section = qs('#scene-contact');
    if (!section) return;

    const title   = qs('.c-title', section);
    const label   = qs('.c-label', section);
    const copy    = qs('.c-copy', section);
    const actions = qs('.c-actions', section);
    const links   = qs('.c-links', section);

    if (!window.gsap || !window.ScrollTrigger || prefersReduced) {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        if (label) label.style.opacity = '1';
        if (title) title.classList.add('revealed');
        [copy, actions, links].forEach(el => { if(el) el.classList.add('revealed'); });
        io.disconnect();
      }, { threshold: 0.15 });
      io.observe(section);
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        once: true,
      }
    });

    if (label) tl.fromTo(label, { opacity:0, y:12 }, { opacity:1, y:0, duration:0.6 }, 0);
    if (title) tl.fromTo(title, { y:'100%', opacity:0, filter:'blur(6px)' },
                                 { y:'0%', opacity:1, filter:'blur(0px)', duration:1.0, ease:'power3.out' }, 0.1);
    if (copy)    tl.to(copy,    { opacity:1, y:0, duration:0.7, ease:'power2.out', onStart:()=>copy.style.transition='none' }, 0.5);
    if (actions) tl.to(actions, { opacity:1, y:0, duration:0.7, ease:'power2.out', onStart:()=>actions.style.transition='none' }, 0.65);
    if (links)   tl.to(links,   { opacity:1, y:0, duration:0.7, ease:'power2.out', onStart:()=>links.style.transition='none' }, 0.8);
  }

  /* ─── TEXT REVEALS (generic scroll-triggered) ────────── */
  function initTextReveals() {
    if (!window.gsap || !window.ScrollTrigger || prefersReduced) return;
    gsap.registerPlugin(ScrollTrigger);
    // Any .masked-text__inner not already handled
    qsa('.masked-text__inner:not(.s1-title):not(.s2-title):not(.c-title)').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter() {
          gsap.fromTo(el, { y:'100%', opacity:0 }, { y:'0%', opacity:1, duration:0.9, ease:'power3.out' });
        }
      });
    });
  }

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    handleMissingImages();
    initNav();

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    initHeroPin();
    initProductValuePin();
    initCollectionShowcasePin();
    initMaterialPackagingPin();
    initTextReveals();
    initContactReveal();

    // Refresh ScrollTrigger after fonts + layout settle
    if (window.ScrollTrigger) {
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
