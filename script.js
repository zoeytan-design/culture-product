/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光  —  Pinned Scroll v3
   script.js
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── PRODUCT DATA ──────────────────────────────────── */
  const PRODUCTS = [
    { name:'Blue Begonia',        cn:'湛藍海棠', num:'01',
      desc:'A calm blue glass coaster inspired by the classic begonia motif.',
      motif:'Begonia flower',     color:'Translucent blue',     meaning:'Elegance and domestic memory', accent:'#79B7D8' },
    { name:'Prosperity Peony',    cn:'富貴牡丹', num:'02',
      desc:'A warm terracotta glass coaster inspired by peony-like floral forms.',
      motif:'Peony-inspired flower', color:'Terracotta coral',  meaning:'Blessing and richness',        accent:'#D98372' },
    { name:'Verdant Vine Blossom',cn:'青藤團花', num:'03',
      desc:'A muted green glass coaster inspired by vine ornaments and floral medallions.',
      motif:'Vine and floral medallion', color:'Moss green',    meaning:'Growth and continuity',        accent:'#8BAA78' },
    { name:'Golden Apricot Bloom',cn:'金杏花窗', num:'04',
      desc:'A honey yellow glass coaster inspired by four-petal blossoms and tile geometry.',
      motif:'Four-petal blossom', color:'Honey yellow',         meaning:'Warmth and memory',            accent:'#D8B45C' },
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  const qs  = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexRgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ─── MISSING IMAGES ────────────────────────────────── */
  function handleMissingImages() {
    qsa('img').forEach(img => img.addEventListener('error', () => { img.style.display = 'none'; }));
  }

  /* ─── NAV ───────────────────────────────────────────── */
  function initNav() {
    const nav = qs('#nav'), hamburger = qs('#hamburger'), mobile = qs('#mobileMenu');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
    hamburger.addEventListener('click', () => mobile.classList.toggle('open'));
    qsa('a', mobile).forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const t = qs(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 01 — HERO  (enter animation on page load)
     ═══════════════════════════════════════════════════════ */
  function initHeroPin() {
    const wrapper = qs('#scene-hero');
    const section = wrapper && wrapper.querySelector('.scene-hero');
    if (!section) return;

    const label   = qs('.s1-label', section);
    const title   = qs('.s1-title', section);
    const lines   = qsa('.split-line', section);
    const sub     = qs('.s1-sub', section);
    const actions = qs('.s1-actions', section);
    const visual  = qs('.s1-visual', section);

    if (prefersReduced || !window.gsap) {
      // Instant reveal
      [label, sub, actions, visual].forEach(el => { if(el) { el.style.opacity='1'; el.style.transform='none'; } });
      if (title) { title.style.opacity='1'; title.style.transform='none'; }
      lines.forEach(l => { const s = l.querySelector('span'); if(s) { s.style.opacity='1'; s.style.transform='none'; } });
      return;
    }

    gsap.set([label, sub, actions], { opacity:0, y:22 });
    gsap.set(visual, { opacity:0, scale:0.93, filter:'blur(8px)' });
    lines.forEach(l => gsap.set(l.querySelector('span'), { y:'106%', opacity:0 }));
    if (title) gsap.set(title, { y:'106%', opacity:0, filter:'blur(4px)' });

    const tl = gsap.timeline({ delay: 0.25 });
    tl.to(label, { opacity:1, y:0, duration:0.65, ease:'power2.out' });
    if (title) tl.to(title, { y:'0%', opacity:1, filter:'blur(0px)', duration:1.1, ease:'power3.out' }, '-=0.25');
    lines.forEach((line, i) => {
      const inner = line.querySelector('span');
      tl.to(inner, { y:'0%', opacity:1, duration:0.9, ease:'power3.out' }, `-=${i===0 ? 0.55 : 0.72}`);
    });
    tl.to(visual,  { opacity:1, scale:1, filter:'blur(0px)', duration:1.0, ease:'power2.out' }, '-=0.7');
    tl.to(sub,     { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.5');
    tl.to(actions, { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.45');
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 02 — PRODUCT VALUE  (+=420%, enter/display/hold/exit)
     ═══════════════════════════════════════════════════════ */
  function initProductValuePin() {
    const wrapper = qs('#scene-value');
    const section = wrapper && wrapper.querySelector('.scene-value');
    if (!section) return;

    const visual  = qs('.value-visual-center', section);
    const header  = qs('.value-header', section);
    const label   = qs('.value-label', section);
    const title   = qs('.value-title', section);
    const pt1     = qs('.value-point-1', section);
    const pt2     = qs('.value-point-2', section);
    const pt3     = qs('.value-point-3', section);

    if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
      // Fallback: reveal on scroll
      [visual, header, pt1, pt2, pt3].forEach(el => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Initial state — everything hidden
    gsap.set(visual, { opacity:0, scale:0.94, filter:'blur(12px)' });
    gsap.set([label, title], { opacity:0, y:36 });
    gsap.set([pt1, pt2, pt3], { opacity:0, x:28 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=420%',
        pin: section,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
      }
    });

    // 0%–18%: visual + title appear together
    tl.to(visual, { opacity:1, scale:1, filter:'blur(0px)', duration:0.18 }, 0);
    tl.to(label,  { opacity:1, y:0, duration:0.14 }, 0.04);
    tl.to(title,  { opacity:1, y:0, duration:0.18 }, 0.06);

    // 20%–38%: Frosted Glass
    tl.to(pt1, { opacity:1, x:0, duration:0.15 }, 0.22);

    // 38%–58%: Tile Motif
    tl.to(pt2, { opacity:1, x:0, duration:0.15 }, 0.42);

    // 58%–78%: Gift Ready
    tl.to(pt3, { opacity:1, x:0, duration:0.15 }, 0.62);

    // 78%–100%: HOLD — entire completed scene stays visible
    tl.to({}, { duration: 0.22 });

    // Exit: all fade out at the very end
    tl.to([visual, label, title, pt1, pt2, pt3], { opacity:0, duration:0.08 }, '>');
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 03 — COLLECTION SHOWCASE  (+=650%)
     ═══════════════════════════════════════════════════════ */
  function initCollectionShowcasePin() {
    const wrapper = qs('#scene-collection');
    const section = wrapper && wrapper.querySelector('.scene-collection');
    if (!section) return;

    const frames    = qsa('.product-frame', section);
    const dots      = qsa('.pdot', section);
    const bg        = qs('#collectionBg');
    const numEl     = qs('#collectionNum');
    const nameEl    = qs('#collectionName');
    const cnEl      = qs('#collectionCn');
    const descEl    = qs('#collectionDesc');
    const motifEl   = qs('#metaMotif');
    const colorEl   = qs('#metaColor');
    const meaningEl = qs('#metaMeaning');
    const collText  = qs('.collection-text', section);
    let current     = 0;

    function setProduct(idx, animate) {
      if (idx === current && animate) return;
      const p = PRODUCTS[idx];
      frames[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = idx;
      frames[current].classList.add('active');
      dots[current].classList.add('active');
      if (bg) bg.style.background = `radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(p.accent, 0.16)} 0%, transparent 62%)`;

      function swap() {
        numEl.textContent     = `${p.num} / 04`;
        nameEl.textContent    = p.name;
        cnEl.textContent      = p.cn;
        descEl.textContent    = p.desc;
        motifEl.textContent   = p.motif;
        colorEl.textContent   = p.color;
        meaningEl.textContent = p.meaning;
      }
      if (window.gsap && animate) {
        gsap.to([numEl, nameEl, cnEl, descEl, motifEl, colorEl, meaningEl], {
          opacity:0, y:10, duration:0.22, ease:'power2.in',
          onComplete: () => {
            swap();
            gsap.to([numEl, nameEl, cnEl, descEl, motifEl, colorEl, meaningEl], {
              opacity:1, y:0, duration:0.55, ease:'power2.out', stagger:0.04
            });
          }
        });
      } else { swap(); }
    }

    // Init background
    if (bg) bg.style.background = `radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(PRODUCTS[0].accent, 0.16)} 0%, transparent 62%)`;

    if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
      let i = 0;
      setInterval(() => { i = (i+1) % PRODUCTS.length; setProduct(i, true); }, 3200);
      return;
    }

    const vph = window.innerHeight;
    wrapper.style.height = `${vph * 6.5}px`;   // ~650%

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: `+=${vph * 6.5}`,
      pin: section,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.6,
      onUpdate(self) {
        const idx = Math.min(PRODUCTS.length - 1, Math.floor(self.progress * PRODUCTS.length));
        if (idx !== current) setProduct(idx, true);
      }
    });

    // Entrance reveal
    gsap.fromTo(frames[0], { opacity:0, scale:0.9 }, { opacity:1, scale:1, duration:1, ease:'power2.out',
      scrollTrigger: { trigger: wrapper, start:'top 75%', once:true }
    });
    gsap.fromTo(collText, { opacity:0, x:32 }, { opacity:1, x:0, duration:1, ease:'power2.out',
      scrollTrigger: { trigger: wrapper, start:'top 75%', once:true }
    });
  }

  /* ═══════════════════════════════════════════════════════
     SCENE 04 — MATERIAL & PACKAGING  (+=520%, fixed text panel)
     Images animate. Text stays fixed. Layout never jumps.
     ═══════════════════════════════════════════════════════ */
  function initMaterialPackagingPin() {
    const wrapper = qs('#scene-material');
    const section = wrapper && wrapper.querySelector('.scene-material');
    if (!section) return;

    const vis1  = qs('.material-visual-1', section);
    const vis2  = qs('.material-visual-2', section);
    const vis3  = qs('.material-visual-3', section);
    const vis4  = qs('.material-visual-4', section);
    const cop1  = qs('.material-copy-1', section);
    const cop2  = qs('.material-copy-2', section);
    const cop3  = qs('.material-copy-3', section);
    const cop4  = qs('.material-copy-4', section);
    const mprogs = qsa('.mprog', section);

    function setProgress(idx) {
      mprogs.forEach((m, i) => m.classList.toggle('active', i === idx));
    }

    if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
      // Show stage 1 immediately
      gsap.set([vis1, cop1], { opacity:1 });
      setProgress(0);
      // Auto-advance fallback
      const stages = [[vis1,cop1],[vis2,cop2],[vis3,cop3],[vis4,cop4]];
      let i = 0;
      setInterval(() => {
        gsap.set(stages[i], { opacity:0 });
        i = (i+1) % stages.length;
        gsap.set(stages[i], { opacity:1 });
        setProgress(i);
      }, 3000);
      return;
    }

    // ── Initial states: all hidden ──
    gsap.set([vis1, vis2, vis3, vis4], { opacity:0 });
    gsap.set([cop1, cop2, cop3, cop4], { opacity:0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=520%',
        pin: section,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate(self) {
          // Update progress dots from scrub progress
          const idx = Math.min(3, Math.floor(self.progress * 4));
          setProgress(idx);
        }
      }
    });

    /* ── STAGE 1: Frosted glass material ──
       0%–22%: enter */
    tl.fromTo(vis1, { opacity:0, scale:0.9,  filter:'blur(14px)' },
                    { opacity:1, scale:1,    filter:'blur(0px)', duration:1 }, 0);
    tl.fromTo(cop1, { opacity:0, y:28 },
                    { opacity:1, y:0, duration:0.7 }, 0.2);
    // hold
    tl.to({}, { duration: 0.55 });

    /* ── STAGE 2: Printed tile pattern ──
       ~27%–50% */
    tl.to(vis1, { opacity:0, scale:1.04, duration:0.55 });
    tl.to(cop1, { opacity:0, y:-20, duration:0.4 }, '<');
    tl.fromTo(vis2, { opacity:0, scale:0.94 },
                    { opacity:1, scale:1, duration:0.8 }, '<');
    tl.fromTo(cop2, { opacity:0, y:28 },
                    { opacity:1, y:0, duration:0.7 }, '>-0.4');
    // hold
    tl.to({}, { duration: 0.55 });

    /* ── STAGE 3: Color-matched boxes ──
       ~50%–75% */
    tl.to(vis2, { opacity:0, scale:1.04, duration:0.55 });
    tl.to(cop2, { opacity:0, y:-20, duration:0.4 }, '<');
    tl.fromTo(vis3, { opacity:0, scale:0.94 },
                    { opacity:1, scale:1, duration:0.8 }, '<');
    tl.fromTo(cop3, { opacity:0, y:28 },
                    { opacity:1, y:0, duration:0.7 }, '>-0.4');
    // Boxes stagger (within the same scrub)
    const boxes = qsa('.pkg-box', section);
    boxes.forEach((b, i) => {
      gsap.set(b, { opacity:0, y:18 });
      tl.to(b, { opacity:1, y:0, duration:0.3 }, `>-${0.55 - i * 0.08}`);
    });
    // hold
    tl.to({}, { duration: 0.55 });

    /* ── STAGE 4: Gold foil detail ──
       ~75%–100% */
    tl.to(vis3, { opacity:0, scale:1.04, duration:0.55 });
    tl.to(cop3, { opacity:0, y:-20, duration:0.4 }, '<');
    tl.fromTo(vis4, { opacity:0, scale:0.94 },
                    { opacity:1, scale:1, duration:0.8 }, '<');
    tl.fromTo(cop4, { opacity:0, y:28 },
                    { opacity:1, y:0, duration:0.7 }, '>-0.4');
    // hold at end
    tl.to({}, { duration: 0.8 });
  }

  /* ═══════════════════════════════════════════════════════
     CONTACT REVEAL
     ═══════════════════════════════════════════════════════ */
  function initContactReveal() {
    const section = qs('#scene-contact');
    if (!section) return;

    const title   = qs('.c-title',   section);
    const label   = qs('.c-label',   section);
    const copy    = qs('.c-copy',    section);
    const actions = qs('.c-actions', section);
    const links   = qs('.c-links',   section);

    if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        if (label) label.style.opacity = '1';
        if (title) title.classList.add('revealed');
        [copy, actions, links].forEach(el => { if(el) el.classList.add('revealed'); });
        io.disconnect();
      }, { threshold: 0.12 });
      io.observe(section);
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 72%', once: true }
    });
    if (label) tl.fromTo(label, { opacity:0, y:14 }, { opacity:1, y:0, duration:0.6 }, 0);
    if (title) tl.fromTo(title, { y:'106%', opacity:0, filter:'blur(5px)' },
                                 { y:'0%', opacity:1, filter:'blur(0px)', duration:1.05, ease:'power3.out' }, 0.1);
    if (copy)    tl.to(copy,    { opacity:1, y:0, duration:0.7, ease:'power2.out', onStart(){ copy.style.transition='none'; }    }, 0.52);
    if (actions) tl.to(actions, { opacity:1, y:0, duration:0.7, ease:'power2.out', onStart(){ actions.style.transition='none'; } }, 0.66);
    if (links)   tl.to(links,   { opacity:1, y:0, duration:0.7, ease:'power2.out', onStart(){ links.style.transition='none'; }   }, 0.80);
  }

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    handleMissingImages();
    initNav();
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    initHeroPin();
    initProductValuePin();
    initCollectionShowcasePin();
    initMaterialPackagingPin();
    initContactReveal();

    if (window.ScrollTrigger) {
      window.addEventListener('load', () => { ScrollTrigger.refresh(); });
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
