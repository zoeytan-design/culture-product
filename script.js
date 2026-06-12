/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光  —  Stage Snap v6
   Fixes:
   1. Collection → no ghost frame on exit
   2. Contact animation plays only once per entry
   3. Going backwards (up) works cleanly
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── PRODUCTS ──────────────────────────────────────── */
  const PRODUCTS = [
    { name:'Blue Begonia',         cn:'湛藍海棠', num:'01',
      desc:'A calm blue glass coaster inspired by the classic begonia motif.',
      motif:'Begonia flower',        color:'Translucent blue',  meaning:'Elegance and domestic memory', accent:'#79B7D8' },
    { name:'Prosperity Peony',     cn:'富貴牡丹', num:'02',
      desc:'A warm terracotta glass coaster inspired by peony-like floral forms.',
      motif:'Peony-inspired flower', color:'Terracotta coral',  meaning:'Blessing and richness',        accent:'#D98372' },
    { name:'Verdant Vine Blossom', cn:'青藤團花', num:'03',
      desc:'A muted green glass coaster inspired by vine ornaments and floral medallions.',
      motif:'Vine and floral medallion', color:'Moss green',    meaning:'Growth and continuity',        accent:'#8BAA78' },
    { name:'Golden Apricot Bloom', cn:'金杏花窗', num:'04',
      desc:'A honey yellow glass coaster inspired by four-petal blossoms and tile geometry.',
      motif:'Four-petal blossom',    color:'Honey yellow',      meaning:'Warmth and memory',            accent:'#D8B45C' },
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  const qs  = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => window.gsap;
  function hexRgba(hex, a) {
    return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
  }

  /* ─── STEP TABLE ────────────────────────────────────────
     step  scene        sub   what happens
     0     hero         –     page load entrance
     1     value        0     visual + header appear
     2     value        1     label 1 slides in
     3     value        2     label 2 slides in
     4     value        3     label 3 slides in
     5     collection   0     Blue Begonia
     6     collection   1     Prosperity Peony
     7     collection   2     Verdant Vine
     8     collection   3     Golden Apricot
     9     material     0     Frosted Glass
     10    material     1     Tile Pattern
     11    material     2     Boxes
     12    material     3     Gold Foil
     13    contact      –     final CTA
  ──────────────────────────────────────────────────────── */
  const STEPS = [
    { scene:'hero' },
    { scene:'value',      sub:0 },
    { scene:'value',      sub:1 },
    { scene:'value',      sub:2 },
    { scene:'value',      sub:3 },
    { scene:'collection', sub:0 },
    { scene:'collection', sub:1 },
    { scene:'collection', sub:2 },
    { scene:'collection', sub:3 },
    { scene:'material',   sub:0 },
    { scene:'material',   sub:1 },
    { scene:'material',   sub:2 },
    { scene:'material',   sub:3 },
    { scene:'contact' },
  ];
  const LAST = STEPS.length - 1;

  const SCENE_EL = {
    hero:       () => qs('#scene-hero'),
    value:      () => qs('#scene-value'),
    collection: () => qs('#scene-collection'),
    material:   () => qs('#scene-material'),
    contact:    () => qs('#scene-contact'),
  };

  /* ─── STATE ─────────────────────────────────────────── */
  let current  = 0;
  let busy     = false;
  let lastTime = 0;
  const COOLDOWN = 680;

  /* ─── PIP BAR ───────────────────────────────────────── */
  function buildPips() {
    const bar = qs('#pipBar');
    if (!bar) return;
    STEPS.forEach((_, i) => {
      const p = document.createElement('span');
      p.className = 'stage-pip' + (i === 0 ? ' active' : '');
      bar.appendChild(p);
    });
  }
  function updatePips() {
    qsa('.stage-pip').forEach((p, i) => p.classList.toggle('active', i === current));
  }

  /* ═══════════════════════════════════════════════════════
     SCENE RESET FUNCTIONS
     Called BEFORE a scene becomes visible again (re-entry).
     They put every animated element back to its start state
     so animations always play from a clean slate.
  ═══════════════════════════════════════════════════════ */

  function resetValue() {
    const vis = qs('.value-visual-center');
    const lbl = qs('.value-label');
    const ttl = qs('.value-title');
    const pts = [qs('.value-point-1'), qs('.value-point-2'), qs('.value-point-3')];
    if (!G()) return;
    G().set(vis, { opacity:0, scale:0.94, filter:'blur(10px)' });
    G().set([lbl, ttl], { opacity:0, y:28 });
    G().set(pts, { opacity:0, x:28 });
  }

  function resetCollection() {
    // Remove .active from all frames, add to frame 0 silently
    const frames = qsa('.product-frame');
    frames.forEach(f => f.classList.remove('active'));
    // Don't add active here — playCollection will do it
    collCurrent = -1;
    // Reset text elements
    const textIds = ['collectionNum','collectionName','collectionCn',
                     'collectionDesc','metaMotif','metaColor','metaMeaning'];
    if (G()) G().set(textIds.map(id => qs('#'+id)).filter(Boolean), { opacity:0, y:0 });
    qsa('.pdot').forEach((d, i) => d.classList.toggle('active', i === 0));
  }

  function resetMaterial() {
    matCurrent = -1;
    MAT.forEach(m => {
      const v = qs(m.vis), c = qs(m.cop);
      if (G()) {
        if (v) G().set(v, { opacity:0, scale:0.93, filter:'blur(10px)' });
        if (c) G().set(c, { opacity:0, y:22 });
      } else {
        if (v) v.style.opacity = '0';
        if (c) c.style.opacity = '0';
      }
    });
    qsa('.mprog').forEach((m, i) => m.classList.toggle('active', i === 0));
  }

  function resetContact() {
    const els = [qs('.c-label'), qs('.c-title'), qs('.c-copy'),
                 qs('.c-actions'), qs('.c-links')].filter(Boolean);
    if (G()) G().set(els, { opacity:0, y:18 });
    else els.forEach(el => { el.style.opacity='0'; el.style.transform='translateY(18px)'; });
    contactPlayed = false;
  }

  /* ═══════════════════════════════════════════════════════
     SCENE SWITCH
     Fades fromEl out, then fades toEl in.
     Reset the incoming scene BEFORE it becomes visible.
  ═══════════════════════════════════════════════════════ */
  function switchScene(toName, fromName, onReady) {
    if (toName === fromName) { onReady(); return; }

    const toEl   = SCENE_EL[toName]  && SCENE_EL[toName]();
    const fromEl = SCENE_EL[fromName] && SCENE_EL[fromName]();
    if (!toEl) { onReady(); return; }

    // Reset destination scene to initial state before showing it
    const resets = { value: resetValue, collection: resetCollection,
                     material: resetMaterial, contact: resetContact };
    if (resets[toName]) resets[toName]();

    // Prepare destination: invisible but in DOM
    toEl.style.opacity      = '0';
    toEl.style.pointerEvents = 'none';
    toEl.classList.add('active');

    const finish = () => {
      // Hide source
      if (fromEl) {
        fromEl.classList.remove('active');
        fromEl.style.opacity = '';
        fromEl.style.pointerEvents = '';
      }
      toEl.style.opacity = '';
      toEl.style.pointerEvents = '';
      onReady();
    };

    if (G() && !reduced) {
      // Fade out from, then fade in to
      if (fromEl && fromEl.classList.contains('active')) {
        G().to(fromEl, {
          opacity: 0, duration: 0.3, ease: 'power2.in',
          onComplete: () => {
            fromEl.style.opacity = '';
            G().fromTo(toEl, { opacity:0 }, {
              opacity: 1, duration: 0.4, ease: 'power2.out',
              onComplete: finish
            });
          }
        });
      } else {
        G().fromTo(toEl, { opacity:0 }, {
          opacity: 1, duration: 0.4, ease: 'power2.out',
          onComplete: finish
        });
      }
    } else {
      if (fromEl) { fromEl.style.opacity='0'; }
      toEl.style.opacity = '1';
      finish();
    }
  }

  /* ═══════════════════════════════════════════════════════
     PLAY FUNCTIONS — called after scene is visible
  ═══════════════════════════════════════════════════════ */

  // ── VALUE ──
  function playValue(sub, dir) {
    const vis = qs('.value-visual-center');
    const lbl = qs('.value-label');
    const ttl = qs('.value-title');
    const pts = [qs('.value-point-1'), qs('.value-point-2'), qs('.value-point-3')];
    if (!G() || reduced) {
      [vis,lbl,ttl].forEach(el => { if(el) { el.style.opacity='1'; el.style.transform='none'; el.style.filter=''; }});
      pts.slice(0, sub + (sub > 0 ? 0 : 1)).forEach(p => { if(p) { p.style.opacity='1'; p.style.transform='none'; }});
      return;
    }
    const D = 0.65;
    if (sub === 0) {
      // First sub: show visual + header
      G().to(vis, { opacity:1, scale:1, filter:'blur(0px)', duration:D, ease:'power2.out' });
      G().to(lbl, { opacity:1, y:0, duration:D*0.8 }, '<0.1');
      G().to(ttl, { opacity:1, y:0, duration:D, ease:'power3.out' }, '<0.05');
    } else {
      // Each subsequent sub reveals ONE label
      // Going forward: slide in; going backward: the previous label was already
      // visible (we only animate the one that changes)
      const pt = pts[sub - 1];
      if (pt) {
        if (dir >= 0) {
          // Forward: slide in from right
          G().fromTo(pt, { opacity:0, x:28 }, { opacity:1, x:0, duration:D, ease:'power2.out' });
        } else {
          // Backward: hide this label (we're going back to sub-1)
          G().to(pt, { opacity:0, x:28, duration:D * 0.45, ease:'power2.in' });
        }
      }
    }
  }

  // ── COLLECTION ──
  let collCurrent = -1;

  function playCollection(sub) {
    const frames  = qsa('.product-frame');
    const p       = PRODUCTS[sub];
    const bg      = qs('#collectionBg');

    // Swap image frame
    if (collCurrent >= 0 && collCurrent !== sub) {
      frames[collCurrent].classList.remove('active');
    }
    frames[sub].classList.add('active');

    // Background glow
    if (bg) bg.style.background =
      `radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(p.accent, 0.16)} 0%, transparent 62%)`;

    // Text swap
    const textIds = ['collectionNum','collectionName','collectionCn',
                     'collectionDesc','metaMotif','metaColor','metaMeaning'];
    const vals    = [p.num+' / 04', p.name, p.cn, p.desc, p.motif, p.color, p.meaning];
    const textEls = textIds.map(id => qs('#'+id)).filter(Boolean);

    const doSwap = () => {
      textIds.forEach((id, i) => { const el=qs('#'+id); if(el) el.textContent=vals[i]; });
      if (G() && !reduced) {
        G().to(textEls, { opacity:1, y:0, duration:0.5, ease:'power2.out', stagger:0.04 });
      } else {
        textEls.forEach(el => { el.style.opacity='1'; el.style.transform='none'; });
      }
    };

    if (G() && !reduced && collCurrent >= 0 && collCurrent !== sub) {
      // Fade out old text first
      G().to(textEls, { opacity:0, y:8, duration:0.2, ease:'power2.in', onComplete: doSwap });
    } else {
      // First entry or same product: set hidden then animate in
      if (G()) G().set(textEls, { opacity:0, y:0 });
      doSwap();
    }

    qsa('.pdot').forEach((d, i) => d.classList.toggle('active', i === sub));
    collCurrent = sub;
  }

  // ── MATERIAL ──
  const MAT = [
    { vis:'.material-visual-1', cop:'.material-copy-1' },
    { vis:'.material-visual-2', cop:'.material-copy-2' },
    { vis:'.material-visual-3', cop:'.material-copy-3' },
    { vis:'.material-visual-4', cop:'.material-copy-4' },
  ];
  let matCurrent = -1;

  function playMaterial(sub) {
    const newVis = qs(MAT[sub].vis);
    const newCop = qs(MAT[sub].cop);
    const D = 0.6;

    // Hide previous stage
    if (matCurrent >= 0 && matCurrent !== sub) {
      const oldVis = qs(MAT[matCurrent].vis);
      const oldCop = qs(MAT[matCurrent].cop);
      if (G() && !reduced) {
        if (oldVis) G().to(oldVis, { opacity:0, scale:1.04, duration:0.4, ease:'power2.in' });
        if (oldCop) G().to(oldCop, { opacity:0, y:-14,     duration:0.3, ease:'power2.in' });
      } else {
        if (oldVis) oldVis.style.opacity = '0';
        if (oldCop) oldCop.style.opacity = '0';
      }
    }

    const delay = matCurrent >= 0 ? 0.2 : 0;
    if (G() && !reduced) {
      if (newVis) G().fromTo(newVis,
        { opacity:0, scale:0.93, filter:'blur(10px)' },
        { opacity:1, scale:1,    filter:'blur(0px)', duration:D, delay, ease:'power2.out' });
      if (newCop) G().fromTo(newCop,
        { opacity:0, y:22 },
        { opacity:1, y:0,   duration:D*0.85, delay: delay+0.14, ease:'power2.out' });
    } else {
      if (newVis) newVis.style.opacity = '1';
      if (newCop) newCop.style.opacity = '1';
    }

    qsa('.mprog').forEach((m, i) => m.classList.toggle('active', i === sub));
    matCurrent = sub;
  }

  // ── CONTACT ──
  // Guard: only animate on first entry from another scene, never re-animate
  let contactPlayed = false;

  function playContact() {
    if (contactPlayed) return;
    contactPlayed = true;

    const lbl     = qs('.c-label');
    const title   = qs('.c-title');
    const copy    = qs('.c-copy');
    const actions = qs('.c-actions');
    const links   = qs('.c-links');

    if (!G() || reduced) {
      [lbl,copy,actions,links].forEach(el => { if(el) { el.style.opacity='1'; el.style.transform='none'; }});
      if (title) { title.style.opacity='1'; title.style.transform='none'; }
      return;
    }
    const tl = G().timeline({ delay: 0.1 });
    if (lbl)     tl.fromTo(lbl,     { opacity:0, y:14  }, { opacity:1, y:0,     duration:0.55 }, 0);
    if (title)   tl.fromTo(title,   { opacity:0, y:'80%' }, { opacity:1, y:'0%', duration:0.95, ease:'power3.out' }, 0.1);
    if (copy)    tl.fromTo(copy,    { opacity:0, y:18  }, { opacity:1, y:0,     duration:0.55 }, 0.4);
    if (actions) tl.fromTo(actions, { opacity:0, y:18  }, { opacity:1, y:0,     duration:0.55 }, 0.52);
    if (links)   tl.fromTo(links,   { opacity:0, y:18  }, { opacity:1, y:0,     duration:0.55 }, 0.64);
  }

  /* ═══════════════════════════════════════════════════════
     MAIN goTo — the single entry point for all navigation
  ═══════════════════════════════════════════════════════ */
  function goTo(next, dir) {
    if (busy) return;
    const now = Date.now();
    if (now - lastTime < COOLDOWN) return;
    lastTime = now;

    next = Math.max(0, Math.min(LAST, next));
    if (next === current) return;

    busy = true;

    const fromStep  = STEPS[current];
    const toStep    = STEPS[next];
    const fromScene = fromStep.scene;
    const toScene   = toStep.scene;

    current = next; // update immediately so re-entrant calls see correct state
    updatePips();

    if (fromScene === toScene) {
      // ── Same scene: just play the sub-animation ──
      const s = toStep;
      if (s.scene === 'value')      playValue(s.sub, dir);
      if (s.scene === 'collection') playCollection(s.sub);
      if (s.scene === 'material')   playMaterial(s.sub);
      busy = false; // same-scene transitions are fast, unlock immediately
      lastTime = now; // keep cooldown
      setTimeout(() => { busy = false; }, COOLDOWN);
    } else {
      // ── Different scene: cross-fade then play ──
      switchScene(toScene, fromScene, () => {
        const s = toStep;
        if (s.scene === 'value')      playValue(s.sub, dir);
        if (s.scene === 'collection') playCollection(s.sub);
        if (s.scene === 'material')   playMaterial(s.sub);
        if (s.scene === 'contact')    playContact();
        setTimeout(() => { busy = false; }, COOLDOWN);
      });
    }
  }

  /* ─── INPUT ──────────────────────────────────────────── */
  let touchY0  = 0;
  let wheelAcc = 0;

  window.addEventListener('wheel', e => {
    e.preventDefault();
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 50) return;
    const dir = wheelAcc > 0 ? 1 : -1;
    wheelAcc = 0;
    goTo(current + dir, dir);
  }, { passive: false });

  window.addEventListener('touchstart', e => {
    touchY0 = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    const dy = touchY0 - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    const dir = dy > 0 ? 1 : -1;
    goTo(current + dir, dir);
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current+1,  1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current-1, -1); }
  });

  /* ─── NAV CLICKS ─────────────────────────────────────── */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-goto]');
    if (!el) return;
    e.preventDefault();
    const target = el.dataset.goto;
    const idx = STEPS.findIndex(s => s.scene === target);
    if (idx < 0) return;
    const dir = idx > current ? 1 : -1;
    // Nav bypasses busy/cooldown
    busy = false; lastTime = 0;
    goTo(idx, dir);
    qs('#mobileMenu').classList.remove('open');
  });

  /* ─── HERO ENTRANCE ──────────────────────────────────── */
  function heroEntrance() {
    const sec = qs('#scene-hero');
    if (!sec || !G() || reduced) return;
    const label  = qs('.s1-label',   sec);
    const title  = qs('.s1-title',   sec);
    const lines  = qsa('.split-line', sec);
    const sub    = qs('.s1-sub',     sec);
    const acts   = qs('.s1-actions', sec);
    const visual = qs('.s1-visual',  sec);
    G().set([label, sub, acts], { opacity:0, y:22 });
    G().set(visual, { opacity:0, scale:0.93, filter:'blur(8px)' });
    lines.forEach(l => G().set(l.querySelector('span'), { y:'106%', opacity:0 }));
    if (title) G().set(title, { y:'106%', opacity:0, filter:'blur(4px)' });
    const tl = G().timeline({ delay: 0.3 });
    tl.to(label, { opacity:1, y:0, duration:0.65, ease:'power2.out' });
    if (title) tl.to(title, { y:'0%', opacity:1, filter:'blur(0px)', duration:1.1, ease:'power3.out' }, '-=0.25');
    lines.forEach((line, i) => {
      const inner = line.querySelector('span');
      tl.to(inner, { y:'0%', opacity:1, duration:0.9, ease:'power3.out' }, `-=${i===0?0.55:0.72}`);
    });
    tl.to(visual,  { opacity:1, scale:1, filter:'blur(0px)', duration:1.0, ease:'power2.out' }, '-=0.7');
    tl.to(sub,     { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.5');
    tl.to(acts,    { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.45');
  }

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    // Show only hero; hide everything else
    qsa('.scene').forEach(s => {
      const isHero = s.id === 'scene-hero';
      s.classList.toggle('active', isHero);
      s.style.opacity      = isHero ? '1' : '0';
      s.style.pointerEvents = isHero ? '' : 'none';
    });

    // Pre-hide material layers
    if (G()) {
      MAT.forEach(m => {
        const v = qs(m.vis), c = qs(m.cop);
        if (v) G().set(v, { opacity:0 });
        if (c) G().set(c, { opacity:0 });
      });
    }

    // Pre-hide contact elements so they're ready for animation
    resetContact();

    qsa('img').forEach(img => img.addEventListener('error', () => img.style.display='none'));
    const hb = qs('#hamburger'), mm = qs('#mobileMenu');
    if (hb) hb.addEventListener('click', () => mm.classList.toggle('open'));

    buildPips();
    heroEntrance();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
