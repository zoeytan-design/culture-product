/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光  —  Stage Snap v5
   Single full-screen stage. One wheel/swipe = one step.
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── PRODUCT DATA ──────────────────────────────────── */
  const PRODUCTS = [
    { name:'Blue Begonia',         cn:'湛藍海棠', num:'01', desc:'A calm blue glass coaster inspired by the classic begonia motif.',                              motif:'Begonia flower',          color:'Translucent blue',  meaning:'Elegance and domestic memory', accent:'#79B7D8' },
    { name:'Prosperity Peony',     cn:'富貴牡丹', num:'02', desc:'A warm terracotta glass coaster inspired by peony-like floral forms.',                          motif:'Peony-inspired flower',   color:'Terracotta coral',  meaning:'Blessing and richness',        accent:'#D98372' },
    { name:'Verdant Vine Blossom', cn:'青藤團花', num:'03', desc:'A muted green glass coaster inspired by vine ornaments and floral medallions.',                 motif:'Vine and floral medallion',color:'Moss green',       meaning:'Growth and continuity',        accent:'#8BAA78' },
    { name:'Golden Apricot Bloom', cn:'金杏花窗', num:'04', desc:'A honey yellow glass coaster inspired by four-petal blossoms and tile geometry.',               motif:'Four-petal blossom',      color:'Honey yellow',      meaning:'Warmth and memory',            accent:'#D8B45C' },
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  const qs  = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => window.gsap;
  function hexRgba(hex, a) {
    return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
  }

  /* ══════════════════════════════════════════════════════
     STAGE DEFINITION
     Every scene is a slide in the deck.
     Scenes with sub-steps expand into multiple steps.

     Step list (flat):
       0  hero
       1  value-1   (visual + title)
       2  value-2   (pt1)
       3  value-3   (pt2)
       4  value-4   (pt3)
       5  coll-0    (Blue Begonia)
       6  coll-1    (Peony)
       7  coll-2    (Vine)
       8  coll-3    (Apricot)
       9  mat-0     (frosted glass)
      10  mat-1     (tile pattern)
      11  mat-2     (boxes)
      12  mat-3     (gold foil)
      13  contact
  ══════════════════════════════════════════════════════ */
  const STEPS = [
    { scene:'hero'       },
    { scene:'value',  sub:0 },
    { scene:'value',  sub:1 },
    { scene:'value',  sub:2 },
    { scene:'value',  sub:3 },
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

  const SCENE_IDS = {
    hero:       'scene-hero',
    value:      'scene-value',
    collection: 'scene-collection',
    material:   'scene-material',
    contact:    'scene-contact',
  };

  let current   = 0;    // current step index
  let busy      = false;// true during transition
  let lastTime  = 0;    // timestamp of last step change (debounce)
  const COOLDOWN = 700; // ms

  /* ─── PIP BAR ───────────────────────────────────────── */
  function buildPips() {
    const bar = qs('#pipBar');
    if (!bar) return;
    STEPS.forEach((_, i) => {
      const pip = document.createElement('span');
      pip.className = 'stage-pip' + (i === 0 ? ' active' : '');
      pip.dataset.step = i;
      bar.appendChild(pip);
    });
  }
  function updatePips() {
    qsa('.stage-pip').forEach((p, i) => p.classList.toggle('active', i === current));
  }

  /* ─── SCENE SWITCHING ───────────────────────────────── */
  let currentSceneName = 'hero';

  // Show a scene instantly (no animation between scenes — scene transition
  // is handled by GSAP opacity on the .scene element itself)
  function switchScene(toName, fromName, onReady) {
    if (toName === fromName) { onReady(); return; }

    const toEl   = qs('#' + SCENE_IDS[toName]);
    const fromEl = qs('#' + SCENE_IDS[fromName]);
    if (!toEl) { onReady(); return; }

    // Make target visible but transparent so GSAP can fade it in
    toEl.style.opacity     = '0';
    toEl.style.pointerEvents = 'none';
    toEl.classList.add('active');

    const doSwitch = () => {
      if (fromEl) {
        fromEl.classList.remove('active');
        fromEl.style.opacity = '';
        fromEl.style.pointerEvents = '';
      }
      currentSceneName = toName;
      onReady();
    };

    if (G() && !reduced) {
      G().fromTo(toEl, { opacity: 0 }, {
        opacity: 1, duration: 0.45, ease: 'power2.inOut',
        onComplete: () => {
          toEl.style.opacity = '';
          toEl.style.pointerEvents = '';
          doSwitch();
        }
      });
    } else {
      toEl.style.opacity = '1';
      toEl.style.pointerEvents = '';
      doSwitch();
    }
  }

  /* ─── STEP ANIMATIONS ───────────────────────────────── */

  // ─ VALUE
  let vInited = false;
  function playValue(sub, dir) {
    const vis  = qs('.value-visual-center');
    const lbl  = qs('.value-label');
    const ttl  = qs('.value-title');
    const pts  = [qs('.value-point-1'), qs('.value-point-2'), qs('.value-point-3')];

    if (!vInited) {
      // First time: set all to hidden
      if (G()) {
        G().set(vis,  { opacity:0, scale:0.94, filter:'blur(10px)' });
        G().set([lbl, ttl], { opacity:0, y:28 });
        G().set(pts,  { opacity:0, x:28 });
      }
      vInited = true;
    }

    if (!G() || reduced) {
      // Instant show everything up to sub
      [vis,lbl,ttl].forEach(el=>{if(el){el.style.opacity='1';el.style.transform='none';el.style.filter='';}});
      pts.forEach((p,i)=>{ if(p && i<sub) { p.style.opacity='1'; p.style.transform='none'; } });
      return;
    }

    const D = 0.65;
    if (sub === 0) {
      // Scene just appeared — animate visual + header in
      G().to(vis, { opacity:1, scale:1, filter:'blur(0px)', duration:D, ease:'power2.out' });
      G().to(lbl, { opacity:1, y:0, duration:D*0.8 }, '<0.1');
      G().to(ttl, { opacity:1, y:0, duration:D,     ease:'power3.out' }, '<0.05');
    } else {
      // Reveal one label item
      const pt = pts[sub - 1];
      if (pt) {
        if (dir > 0) G().fromTo(pt, { opacity:0, x:28 }, { opacity:1, x:0, duration:D, ease:'power2.out' });
        else         G().to(pt, { opacity:0, x:28, duration:D*0.5, ease:'power2.in' });
      }
    }
  }

  function exitValue() {
    // Called when leaving value scene entirely
    if (!G() || reduced) return;
    const vis = qs('.value-visual-center');
    const lbl = qs('.value-label'), ttl = qs('.value-title');
    const pts = [qs('.value-point-1'),qs('.value-point-2'),qs('.value-point-3')];
    vInited = false; // reset so re-entry works
    G().set([vis,lbl,ttl,...pts], { opacity:0, x:0, y:28, scale:0.94, filter:'blur(10px)' });
    [vis,lbl,ttl,...pts].forEach(el=>{ if(el){ el.style.transform=''; el.style.filter=''; } });
  }

  // ─ COLLECTION
  let collCurrent = -1;

  function playCollection(sub, isFirstEntry) {
    const frames = qsa('.product-frame');
    const p = PRODUCTS[sub];
    const bg = qs('#collectionBg');

    // Switch frame
    if (collCurrent >= 0 && collCurrent !== sub) frames[collCurrent].classList.remove('active');
    frames[sub].classList.add('active');
    if (bg) bg.style.background = `radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(p.accent,0.16)} 0%, transparent 62%)`;

    // Text swap
    const ids = { collectionNum:p.num+' / 04', collectionName:p.name, collectionCn:p.cn,
                  collectionDesc:p.desc, metaMotif:p.motif, metaColor:p.color, metaMeaning:p.meaning };
    const textEls = Object.keys(ids).map(id=>qs('#'+id)).filter(Boolean);

    const doSwap = () => {
      Object.entries(ids).forEach(([id,val])=>{ const el=qs('#'+id); if(el) el.textContent=val; });
      if (G()&&!reduced) G().to(textEls,{opacity:1,y:0,duration:0.5,ease:'power2.out',stagger:0.04});
      else textEls.forEach(el=>{el.style.opacity='1';el.style.transform='none';});
    };

    if (G()&&!reduced && collCurrent>=0 && collCurrent!==sub) {
      G().to(textEls,{opacity:0,y:8,duration:0.2,ease:'power2.in',onComplete:doSwap});
    } else {
      if (G()) G().set(textEls,{opacity:0,y:0});
      doSwap();
    }

    // Dots
    qsa('.pdot').forEach((d,i)=>d.classList.toggle('active',i===sub));
    collCurrent = sub;
  }

  function exitCollection() {
    collCurrent = -1;
    const frames = qsa('.product-frame');
    frames.forEach(f=>f.classList.remove('active'));
    frames[0].classList.add('active'); // reset to first for re-entry
    qsa('.pdot').forEach((d,i)=>d.classList.toggle('active',i===0));
    // Reset text opacity so re-entry animates cleanly
    const ids = ['collectionNum','collectionName','collectionCn','collectionDesc','metaMotif','metaColor','metaMeaning'];
    if (G()) G().set(ids.map(id=>qs('#'+id)).filter(Boolean),{opacity:0,y:0});
  }

  // ─ MATERIAL
  const MAT = [
    {vis:'.material-visual-1',cop:'.material-copy-1'},
    {vis:'.material-visual-2',cop:'.material-copy-2'},
    {vis:'.material-visual-3',cop:'.material-copy-3'},
    {vis:'.material-visual-4',cop:'.material-copy-4'},
  ];
  let matCurrent = -1;

  function playMaterial(sub) {
    const newVis = qs(MAT[sub].vis);
    const newCop = qs(MAT[sub].cop);
    const D = 0.6;

    if (matCurrent >= 0 && matCurrent !== sub) {
      const oldVis = qs(MAT[matCurrent].vis);
      const oldCop = qs(MAT[matCurrent].cop);
      if (G()&&!reduced) {
        if (oldVis) G().to(oldVis,{opacity:0,scale:1.04,duration:0.42,ease:'power2.in'});
        if (oldCop) G().to(oldCop,{opacity:0,y:-14,duration:0.32,ease:'power2.in'});
      } else {
        if(oldVis) oldVis.style.opacity='0';
        if(oldCop) oldCop.style.opacity='0';
      }
    }

    const delay = matCurrent>=0 ? 0.22 : 0;
    if (G()&&!reduced) {
      if(newVis) G().fromTo(newVis,{opacity:0,scale:0.93,filter:'blur(10px)'},{opacity:1,scale:1,filter:'blur(0px)',duration:D,delay,ease:'power2.out'});
      if(newCop) G().fromTo(newCop,{opacity:0,y:22},{opacity:1,y:0,duration:D*0.85,delay:delay+0.14,ease:'power2.out'});
    } else {
      if(newVis) {newVis.style.opacity='1';}
      if(newCop) {newCop.style.opacity='1';}
    }

    qsa('.mprog').forEach((m,i)=>m.classList.toggle('active',i===sub));
    matCurrent = sub;
  }

  function exitMaterial() {
    matCurrent = -1;
    MAT.forEach(m=>{
      const v=qs(m.vis),c=qs(m.cop);
      if(v) { v.style.opacity='0'; if(G()) G().set(v,{opacity:0,scale:0.93,filter:'blur(10px)'}); }
      if(c) { c.style.opacity='0'; if(G()) G().set(c,{opacity:0,y:22}); }
    });
  }

  // ─ CONTACT
  function playContact(isEntry) {
    if (!isEntry) return;
    const lbl     = qs('.c-label');
    const title   = qs('.c-title');
    const copy    = qs('.c-copy');
    const actions = qs('.c-actions');
    const links   = qs('.c-links');
    if (!G()||reduced) {
      [lbl,copy,actions,links].forEach(el=>{if(el){el.style.opacity='1';el.style.transform='none';}});
      if(title){title.style.opacity='1';title.style.transform='none';}
      return;
    }
    const tl = G().timeline();
    if(lbl)     tl.fromTo(lbl,    {opacity:0,y:14},{opacity:1,y:0,duration:0.6},0);
    if(title)   tl.fromTo(title,  {opacity:0,y:'80%'},{opacity:1,y:'0%',duration:1,ease:'power3.out'},0.1);
    if(copy)    tl.fromTo(copy,   {opacity:0,y:18},{opacity:1,y:0,duration:0.6},0.45);
    if(actions) tl.fromTo(actions,{opacity:0,y:18},{opacity:1,y:0,duration:0.6},0.58);
    if(links)   tl.fromTo(links,  {opacity:0,y:18},{opacity:1,y:0,duration:0.6},0.70);
  }

  /* ─── MAIN STEP FUNCTION ─────────────────────────────── */
  function goTo(nextStep, dir) {
    if (busy) return;
    const now = Date.now();
    if (now - lastTime < COOLDOWN) return;
    lastTime = now;

    nextStep = Math.max(0, Math.min(STEPS.length - 1, nextStep));
    if (nextStep === current) return;

    busy = true;

    const fromStep = STEPS[current];
    const toStep   = STEPS[nextStep];
    const fromScene = fromStep.scene;
    const toScene   = toStep.scene;

    // Handle "exit" from previous scene when changing scenes
    const onLeave = () => {
      if (fromScene !== toScene) {
        if (fromScene === 'value')      exitValue();
        if (fromScene === 'collection') exitCollection();
        if (fromScene === 'material')   exitMaterial();
      }
    };

    switchScene(toScene, fromScene, () => {
      // Now play the internal step animation
      const s = toStep;
      if (s.scene === 'value')      playValue(s.sub, dir);
      if (s.scene === 'collection') playCollection(s.sub, fromScene !== 'collection');
      if (s.scene === 'material')   playMaterial(s.sub);
      if (s.scene === 'contact')    playContact(fromScene !== 'contact');
      // Hero has no sub-animation needed after the entrance
    });

    onLeave();
    current = nextStep;
    updatePips();

    // Unlock after cooldown
    setTimeout(() => { busy = false; }, COOLDOWN);
  }

  /* ─── INPUT HANDLERS ─────────────────────────────────── */
  let touchY0 = 0;
  let wheelAcc = 0; // accumulate small trackpad deltas

  window.addEventListener('wheel', e => {
    e.preventDefault();
    // Accumulate delta to handle trackpad
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 40) return; // wait for enough movement
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
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(current + 1, 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); goTo(current - 1, -1); }
  });

  /* ─── NAV LINKS WITH data-goto ──────────────────────── */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-goto]');
    if (!el) return;
    e.preventDefault();
    const target = el.dataset.goto;
    // Find first step that belongs to this scene
    const idx = STEPS.findIndex(s => s.scene === target);
    if (idx >= 0) {
      const dir = idx > current ? 1 : -1;
      // Jump directly: bypass busy/cooldown for nav clicks
      busy = false;
      lastTime = 0;
      goTo(idx, dir);
    }
    qs('#mobileMenu').classList.remove('open');
  });

  /* ─── HERO ENTRANCE ANIMATION ───────────────────────── */
  function heroEntrance() {
    const section = qs('#scene-hero');
    if (!section || !G() || reduced) return;

    const label  = qs('.s1-label', section);
    const title  = qs('.s1-title', section);
    const lines  = qsa('.split-line', section);
    const sub    = qs('.s1-sub',   section);
    const acts   = qs('.s1-actions', section);
    const visual = qs('.s1-visual',  section);

    G().set([label,sub,acts], {opacity:0,y:22});
    G().set(visual, {opacity:0,scale:0.93,filter:'blur(8px)'});
    lines.forEach(l => G().set(l.querySelector('span'), {y:'106%',opacity:0}));
    if (title) G().set(title, {y:'106%',opacity:0,filter:'blur(4px)'});

    const tl = G().timeline({delay:0.3});
    tl.to(label,  {opacity:1,y:0,duration:0.65,ease:'power2.out'});
    if(title) tl.to(title, {y:'0%',opacity:1,filter:'blur(0px)',duration:1.1,ease:'power3.out'},'-=0.25');
    lines.forEach((line,i)=>{
      const inner=line.querySelector('span');
      tl.to(inner, {y:'0%',opacity:1,duration:0.9,ease:'power3.out'}, `-=${i===0?0.55:0.72}`);
    });
    tl.to(visual,  {opacity:1,scale:1,filter:'blur(0px)',duration:1.0,ease:'power2.out'},'-=0.7');
    tl.to(sub,     {opacity:1,y:0,duration:0.7,ease:'power2.out'},'-=0.5');
    tl.to(acts,    {opacity:1,y:0,duration:0.7,ease:'power2.out'},'-=0.45');
  }

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    // Hide all scenes except hero at start
    qsa('.scene').forEach(s => {
      if (s.id === 'scene-hero') {
        s.classList.add('active');
        s.style.opacity = '1';
      } else {
        s.classList.remove('active');
        s.style.opacity = '0';
        s.style.pointerEvents = 'none';
      }
    });

    // Pre-hide material elements
    if (G()) {
      MAT.forEach(m=>{
        const v=qs(m.vis),c=qs(m.cop);
        if(v) G().set(v,{opacity:0});
        if(c) G().set(c,{opacity:0});
      });
    }

    // Missing images
    qsa('img').forEach(img => img.addEventListener('error', ()=>img.style.display='none'));

    // Nav hamburger
    const hamburger = qs('#hamburger'), mobile = qs('#mobileMenu');
    if(hamburger) hamburger.addEventListener('click', ()=>mobile.classList.toggle('open'));

    buildPips();
    heroEntrance();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
