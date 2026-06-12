/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光  —  Snap Scroll v4
   每滾一下切換一個 stage，不跟手
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── PRODUCT DATA ──────────────────────────────────── */
  const PRODUCTS = [
    { name:'Blue Begonia',         cn:'湛藍海棠', num:'01',
      desc:'A calm blue glass coaster inspired by the classic begonia motif.',
      motif:'Begonia flower',      color:'Translucent blue',  meaning:'Elegance and domestic memory', accent:'#79B7D8' },
    { name:'Prosperity Peony',     cn:'富貴牡丹', num:'02',
      desc:'A warm terracotta glass coaster inspired by peony-like floral forms.',
      motif:'Peony-inspired flower', color:'Terracotta coral', meaning:'Blessing and richness',       accent:'#D98372' },
    { name:'Verdant Vine Blossom', cn:'青藤團花', num:'03',
      desc:'A muted green glass coaster inspired by vine ornaments and floral medallions.',
      motif:'Vine and floral medallion', color:'Moss green',  meaning:'Growth and continuity',        accent:'#8BAA78' },
    { name:'Golden Apricot Bloom', cn:'金杏花窗', num:'04',
      desc:'A honey yellow glass coaster inspired by four-petal blossoms and tile geometry.',
      motif:'Four-petal blossom',  color:'Honey yellow',      meaning:'Warmth and memory',            accent:'#D8B45C' },
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  const qs  = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function hexRgba(hex, a) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }
  function handleMissingImages() {
    qsa('img').forEach(img => img.addEventListener('error', () => img.style.display='none'));
  }

  /* ─── NAV ───────────────────────────────────────────── */
  function initNav() {
    const nav=qs('#nav'), hamburger=qs('#hamburger'), mobile=qs('#mobileMenu');
    window.addEventListener('scroll', ()=>nav.classList.toggle('scrolled', window.scrollY>50), {passive:true});
    hamburger.addEventListener('click', ()=>mobile.classList.toggle('open'));
    qsa('a', mobile).forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
    document.addEventListener('click', e=>{
      const a=e.target.closest('a[href^="#"]');
      if(!a) return;
      const t=qs(a.getAttribute('href'));
      if(!t) return;
      e.preventDefault();
      t.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  /* ══════════════════════════════════════════════════════
     SNAP ENGINE
     ══════════════════════════════════════════════════════

     Architecture:
     - Hero: normal scroll section (100vh)
     - Value / Collection / Material: each is position:fixed,
       full-screen overlay, shown one at a time
     - Contact: normal scroll section at the bottom

     Global stage map:
       1 = value-scene (visual + title appear)
       2 = value pt1
       3 = value pt2
       4 = value pt3
       5 = collection p0
       6 = collection p1
       7 = collection p2
       8 = collection p3
       9 = material s0
      10 = material s1
      11 = material s2
      12 = material s3
      13 = exit → contact

     While in stages 1–12 the page scroll is locked.
     Each wheel tick / arrow key advances or retreats one step.
  */

  const FIRST_SNAP = 1;
  const LAST_SNAP  = 12;
  const ANIM_MS    = 680;   // transition duration
  const COOLDOWN   = 750;   // minimum ms between snaps

  let stage      = 0;       // current stage (0 = hero, before snap)
  let locked     = false;   // true while snap sequence active
  let animating  = false;   // true during a transition
  let lastSnap   = 0;       // timestamp of last snap

  // Which pinned "scene" each stage belongs to
  function sceneOf(s) {
    if (s >= 1 && s <= 4)  return 'value';
    if (s >= 5 && s <= 8)  return 'collection';
    if (s >= 9 && s <= 12) return 'material';
    return null;
  }

  /* ─── LOCK / UNLOCK PAGE SCROLL ─────────────────────── */
  let savedScrollY = 0;
  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    // Keep the page visually in place
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${savedScrollY}px`;
    document.body.style.width    = '100%';
  }
  function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, savedScrollY);
  }

  /* ─── PINNED SCENE OVERLAY MANAGEMENT ───────────────── */
  // All three pinned scenes sit in HTML as normal flow wrappers
  // with height:0 + overflow:hidden when inactive.
  // When active they become fixed overlays on top of the frozen page.

  const SCENES = ['scene-value','scene-collection','scene-material'];
  let activeScene = null;

  function showScene(id) {
    if (activeScene === id) return;
    if (activeScene) hideScene(activeScene, false);
    activeScene = id;
    const wrapper = qs(`#${id}`);
    const scene   = wrapper && wrapper.querySelector('.pinned-scene');
    if (!wrapper || !scene) return;

    wrapper.style.position = 'fixed';
    wrapper.style.inset    = '0';
    wrapper.style.zIndex   = '50';
    wrapper.style.height   = '100vh';
    scene.style.display    = 'flex';

    if (window.gsap) gsap.fromTo(scene, {opacity:0}, {opacity:1, duration:0.4, ease:'power2.out'});
    else scene.style.opacity = '1';
  }

  function hideScene(id, animate=true) {
    const wrapper = qs(`#${id}`);
    const scene   = wrapper && wrapper.querySelector('.pinned-scene');
    if (!wrapper || !scene) return;

    const done = () => {
      wrapper.style.position = '';
      wrapper.style.inset    = '';
      wrapper.style.zIndex   = '';
      wrapper.style.height   = '0';
      scene.style.display    = 'none';
      scene.style.opacity    = '';
    };

    if (window.gsap && animate) gsap.to(scene, {opacity:0, duration:0.3, ease:'power2.in', onComplete:done});
    else done();
  }

  /* ─── ENTER / EXIT SNAP MODE ─────────────────────────── */
  function enterSnap() {
    if (locked) return;
    locked = true;
    lockScroll();
    // Start at first stage
    goTo(FIRST_SNAP, false);
  }

  function exitSnap(forward) {
    // Animate out current scene then unlock
    if (activeScene) {
      const scene = qs(`#${activeScene} .pinned-scene`);
      if (scene && window.gsap) {
        gsap.to(scene, { opacity:0, duration:0.4, ease:'power2.in', onComplete:finish });
      } else { finish(); }
    } else { finish(); }

    function finish() {
      if (activeScene) hideScene(activeScene, false);
      activeScene = null;
      locked = false;
      unlockScroll();

      if (forward) {
        // Scroll to contact
        const contact = qs('#scene-contact');
        if (contact) {
          // Release at the top of contact section
          const y = contact.getBoundingClientRect().top + window.scrollY - 64;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        // Scroll back to hero
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  /* ─── DIRECTION HANDLER ──────────────────────────────── */
  function advance(dir) {
    const now = Date.now();
    if (animating)                 return;
    if (now - lastSnap < COOLDOWN) return;
    lastSnap = now;

    const next = stage + dir;

    if (next < FIRST_SNAP) { exitSnap(false); return; }
    if (next > LAST_SNAP)  { exitSnap(true);  return; }

    goTo(next, true);
  }

  /* ─── GO TO A SPECIFIC STAGE ─────────────────────────── */
  function goTo(s, animate) {
    const prev  = stage;
    stage       = s;
    const scene = sceneOf(s);
    if (scene) showScene(`scene-${scene}`);

    animating = true;
    playStage(s, animate, () => { animating = false; });
    updateDots();
  }

  /* ─── PER-STAGE ANIMATION ────────────────────────────── */
  // Value elements (cached once)
  let V = null;
  function cV() {
    if (V) return;
    V = {
      visual: qs('.value-visual-center'),
      label:  qs('.value-label'),
      title:  qs('.value-title'),
      pt1:    qs('.value-point-1'),
      pt2:    qs('.value-point-2'),
      pt3:    qs('.value-point-3'),
    };
    // Set all invisible at start
    if (window.gsap) {
      gsap.set([V.visual], {opacity:0, scale:0.94, filter:'blur(12px)'});
      gsap.set([V.label, V.title], {opacity:0, y:32});
      gsap.set([V.pt1, V.pt2, V.pt3], {opacity:0, x:28});
    }
  }

  let collCurrent = -1;
  let matCurrent  = -1;

  function playStage(s, animate, done) {
    if (!window.gsap || prefersReduced) { instSnapState(s); done(); return; }
    const D = ANIM_MS / 1000;

    /* VALUE */
    if (s === 1) {
      cV();
      const tl = gsap.timeline({onComplete:done});
      tl.to(V.visual, {opacity:1, scale:1, filter:'blur(0px)', duration:D*0.85, ease:'power2.out'}, 0);
      tl.to(V.label,  {opacity:1, y:0, duration:D*0.7}, 0.1);
      tl.to(V.title,  {opacity:1, y:0, duration:D*0.9, ease:'power3.out'}, 0.15);
    } else if (s === 2) {
      cV(); gsap.set(V.pt1, {opacity:0, x:28});
      gsap.to(V.pt1, {opacity:1, x:0, duration:D, ease:'power2.out', onComplete:done});
    } else if (s === 3) {
      cV(); gsap.set(V.pt2, {opacity:0, x:28});
      gsap.to(V.pt2, {opacity:1, x:0, duration:D, ease:'power2.out', onComplete:done});
    } else if (s === 4) {
      cV(); gsap.set(V.pt3, {opacity:0, x:28});
      gsap.to(V.pt3, {opacity:1, x:0, duration:D, ease:'power2.out', onComplete:done});

    /* COLLECTION */
    } else if (s >= 5 && s <= 8) {
      const idx = s - 5;
      if (collCurrent === -1) {
        // First time entering collection: entrance animation
        const collText = qs('.collection-text');
        const frame0   = qs('.pf-0');
        gsap.set(collText, {opacity:0, x:32});
        gsap.set(frame0,   {opacity:0, scale:0.9});
        gsap.to(collText, {opacity:1, x:0, duration:D, ease:'power2.out'});
        gsap.to(frame0,   {opacity:1, scale:1, duration:D, ease:'power2.out'});
      }
      setCollection(idx, done);

    /* MATERIAL */
    } else if (s >= 9 && s <= 12) {
      const idx = s - 9;
      setMaterial(idx, done);
    } else {
      done();
    }
  }

  /* ─── COLLECTION SWITCHER ───────────────────────────── */
  function setCollection(idx, done) {
    const frames    = qsa('.product-frame');
    const bg        = qs('#collectionBg');
    const numEl     = qs('#collectionNum');
    const nameEl    = qs('#collectionName');
    const cnEl      = qs('#collectionCn');
    const descEl    = qs('#collectionDesc');
    const motifEl   = qs('#metaMotif');
    const colorEl   = qs('#metaColor');
    const meaningEl = qs('#metaMeaning');
    const p         = PRODUCTS[idx];

    if (collCurrent !== -1 && collCurrent !== idx) {
      frames[collCurrent].classList.remove('active');
    }
    frames[idx].classList.add('active');
    if (bg) bg.style.background = `radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(p.accent,0.17)} 0%, transparent 62%)`;

    const textEls = [numEl, nameEl, cnEl, descEl, motifEl, colorEl, meaningEl].filter(Boolean);
    const doText = () => {
      numEl.textContent     = `${p.num} / 04`;
      nameEl.textContent    = p.name;
      cnEl.textContent      = p.cn;
      descEl.textContent    = p.desc;
      motifEl.textContent   = p.motif;
      colorEl.textContent   = p.color;
      meaningEl.textContent = p.meaning;
      gsap.to(textEls, {opacity:1, y:0, duration:0.55, ease:'power2.out', stagger:0.04, onComplete:done});
    };
    if (collCurrent !== -1 && collCurrent !== idx) {
      gsap.to(textEls, {opacity:0, y:10, duration:0.22, ease:'power2.in', onComplete:doText});
    } else {
      gsap.set(textEls, {opacity:0});
      doText();
    }
    collCurrent = idx;
  }

  /* ─── MATERIAL SWITCHER ─────────────────────────────── */
  const MAT = [
    {vis:'.material-visual-1', cop:'.material-copy-1'},
    {vis:'.material-visual-2', cop:'.material-copy-2'},
    {vis:'.material-visual-3', cop:'.material-copy-3'},
    {vis:'.material-visual-4', cop:'.material-copy-4'},
  ];

  function setMaterial(idx, done) {
    const D = ANIM_MS / 1000;
    const newVis = qs(MAT[idx].vis);
    const newCop = qs(MAT[idx].cop);

    if (matCurrent >= 0 && matCurrent !== idx) {
      const oldVis = qs(MAT[matCurrent].vis);
      const oldCop = qs(MAT[matCurrent].cop);
      if (oldVis) gsap.to(oldVis, {opacity:0, scale:1.05, duration:0.45, ease:'power2.in'});
      if (oldCop) gsap.to(oldCop, {opacity:0, y:-16,     duration:0.35, ease:'power2.in'});
    }

    const delay = matCurrent >= 0 ? 0.25 : 0;
    if (newVis) gsap.fromTo(newVis,
      {opacity:0, scale:0.93, filter:'blur(12px)'},
      {opacity:1, scale:1,    filter:'blur(0px)', duration:D*0.9, delay, ease:'power2.out'});
    if (newCop) gsap.fromTo(newCop,
      {opacity:0, y:24},
      {opacity:1, y:0, duration:D*0.75, delay: delay+0.15, ease:'power2.out', onComplete:done});
    else setTimeout(done, (delay + D*0.9)*1000);

    matCurrent = idx;
    qsa('.mprog').forEach((m,i)=>m.classList.toggle('active', i===idx));
  }

  /* ─── NO-ANIMATION INSTANT STATES ───────────────────── */
  function instSnapState(s) {
    if (s >= 1 && s <= 4) {
      cV();
      [V.visual, V.label, V.title].forEach(el=>{if(el){el.style.opacity='1';el.style.transform='none';el.style.filter='';}});
      if (s>=2 && V.pt1) {V.pt1.style.opacity='1';V.pt1.style.transform='none';}
      if (s>=3 && V.pt2) {V.pt2.style.opacity='1';V.pt2.style.transform='none';}
      if (s>=4 && V.pt3) {V.pt3.style.opacity='1';V.pt3.style.transform='none';}
    }
    if (s>=5 && s<=8) {
      const idx=s-5; const frames=qsa('.product-frame'); const p=PRODUCTS[idx];
      frames.forEach((f,i)=>f.classList.toggle('active',i===idx));
      const bg=qs('#collectionBg');
      if(bg) bg.style.background=`radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(p.accent,0.17)} 0%, transparent 62%)`;
      const numEl=qs('#collectionNum'),nameEl=qs('#collectionName'),cnEl=qs('#collectionCn'),
            descEl=qs('#collectionDesc'),motifEl=qs('#metaMotif'),colorEl=qs('#metaColor'),meaningEl=qs('#metaMeaning');
      if(numEl) numEl.textContent=`${p.num} / 04`; if(nameEl) nameEl.textContent=p.name;
      if(cnEl) cnEl.textContent=p.cn; if(descEl) descEl.textContent=p.desc;
      if(motifEl) motifEl.textContent=p.motif; if(colorEl) colorEl.textContent=p.color;
      if(meaningEl) meaningEl.textContent=p.meaning;
      collCurrent=idx;
    }
    if (s>=9 && s<=12) {
      const idx=s-9;
      MAT.forEach((m,i)=>{
        const v=qs(m.vis), c=qs(m.cop);
        if(v) v.style.opacity= i===idx?'1':'0';
        if(c) c.style.opacity= i===idx?'1':'0';
      });
      qsa('.mprog').forEach((m,i)=>m.classList.toggle('active',i===idx));
      matCurrent=idx;
    }
  }

  /* ─── UPDATE DOTS ────────────────────────────────────── */
  function updateDots() {
    const colIdx = (stage>=5&&stage<=8) ? stage-5 : -1;
    qsa('.pdot').forEach((d,i)=>d.classList.toggle('active', i===colIdx));
    const matIdx = (stage>=9&&stage<=12) ? stage-9 : -1;
    qsa('.mprog').forEach((m,i)=>m.classList.toggle('active', i===matIdx));
  }

  /* ─── WHEEL / TOUCH / KEY LISTENERS ─────────────────── */
  let touchY0 = 0;

  window.addEventListener('wheel', e => {
    if (!locked) {
      // Check if hero has scrolled out → enter snap
      const hero = qs('#scene-hero');
      if (!hero) return;
      if (e.deltaY > 0 && hero.getBoundingClientRect().bottom <= 10) {
        e.preventDefault();
        enterSnap();
      }
      return;
    }
    e.preventDefault();
    advance(e.deltaY > 0 ? 1 : -1);
  }, {passive:false});

  window.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, {passive:true});
  window.addEventListener('touchend', e => {
    const dy = touchY0 - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    if (!locked) {
      const hero = qs('#scene-hero');
      if (!hero) return;
      if (dy > 0 && hero.getBoundingClientRect().bottom <= 10) enterSnap();
      return;
    }
    advance(dy > 0 ? 1 : -1);
  }, {passive:true});

  document.addEventListener('keydown', e => {
    if (!locked) return;
    if (e.key==='ArrowDown'||e.key==='PageDown') { e.preventDefault(); advance(1); }
    if (e.key==='ArrowUp'  ||e.key==='PageUp')   { e.preventDefault(); advance(-1); }
  });

  /* ─── HERO ENTRANCE ──────────────────────────────────── */
  function initHeroEntrance() {
    const section = qs('.scene-hero');
    if (!section || !window.gsap) return;
    const label=qs('.s1-label',section), title=qs('.s1-title',section),
          lines=qsa('.split-line',section), sub=qs('.s1-sub',section),
          actions=qs('.s1-actions',section), visual=qs('.s1-visual',section);
    if (prefersReduced) {
      [label,sub,actions,visual].forEach(el=>{if(el){el.style.opacity='1';el.style.transform='none';}});
      if(title){title.style.opacity='1';title.style.transform='none';}
      lines.forEach(l=>{const s=l.querySelector('span');if(s){s.style.opacity='1';s.style.transform='none';}});
      return;
    }
    gsap.set([label,sub,actions],{opacity:0,y:22});
    gsap.set(visual,{opacity:0,scale:0.93,filter:'blur(8px)'});
    lines.forEach(l=>gsap.set(l.querySelector('span'),{y:'106%',opacity:0}));
    if(title) gsap.set(title,{y:'106%',opacity:0,filter:'blur(4px)'});
    const tl=gsap.timeline({delay:0.25});
    tl.to(label,{opacity:1,y:0,duration:0.65,ease:'power2.out'});
    if(title) tl.to(title,{y:'0%',opacity:1,filter:'blur(0px)',duration:1.1,ease:'power3.out'},'-=0.25');
    lines.forEach((line,i)=>{
      const inner=line.querySelector('span');
      tl.to(inner,{y:'0%',opacity:1,duration:0.9,ease:'power3.out'},`-=${i===0?0.55:0.72}`);
    });
    tl.to(visual,{opacity:1,scale:1,filter:'blur(0px)',duration:1.0,ease:'power2.out'},'-=0.7');
    tl.to(sub,{opacity:1,y:0,duration:0.7,ease:'power2.out'},'-=0.5');
    tl.to(actions,{opacity:1,y:0,duration:0.7,ease:'power2.out'},'-=0.45');
  }

  /* ─── CONTACT REVEAL ─────────────────────────────────── */
  function initContactReveal() {
    const section=qs('#scene-contact');
    if(!section||!window.gsap) return;
    const title=qs('.c-title',section), label=qs('.c-label',section),
          copy=qs('.c-copy',section), actions=qs('.c-actions',section), links=qs('.c-links',section);
    const io=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting) return;
      const tl=gsap.timeline();
      if(label) tl.fromTo(label,{opacity:0,y:14},{opacity:1,y:0,duration:0.6},0);
      if(title) tl.fromTo(title,{y:'106%',opacity:0,filter:'blur(5px)'},{y:'0%',opacity:1,filter:'blur(0px)',duration:1.05,ease:'power3.out'},0.1);
      if(copy)    tl.to(copy,   {opacity:1,y:0,duration:0.7,ease:'power2.out',onStart(){copy.style.transition='none';}},0.52);
      if(actions) tl.to(actions,{opacity:1,y:0,duration:0.7,ease:'power2.out',onStart(){actions.style.transition='none';}},0.66);
      if(links)   tl.to(links,  {opacity:1,y:0,duration:0.7,ease:'power2.out',onStart(){links.style.transition='none';}},0.80);
      io.disconnect();
    },{threshold:0.15});
    io.observe(section);
  }

  /* ─── INITIAL DOM SETUP ──────────────────────────────── */
  function setupDOM() {
    // All three snap-scene wrappers: hide completely
    ['scene-value','scene-collection','scene-material'].forEach(id=>{
      const wrapper=qs(`#${id}`);
      if(!wrapper) return;
      // Collapse so it takes no space
      wrapper.style.height   = '0';
      wrapper.style.overflow = 'hidden';
      // The inner pinned-scene: hide
      const scene=wrapper.querySelector('.pinned-scene');
      if(scene) { scene.style.display='none'; scene.style.opacity='0'; }
    });

    // Set initial states for all animated elements (opacity:0)
    if (window.gsap) {
      // material visuals & copies all hidden
      ['.material-visual-1','.material-visual-2','.material-visual-3','.material-visual-4',
       '.material-copy-1','.material-copy-2','.material-copy-3','.material-copy-4'].forEach(sel=>{
        const el=qs(sel); if(el) gsap.set(el,{opacity:0});
      });
    }
  }

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    handleMissingImages();
    initNav();
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    setupDOM();
    initHeroEntrance();
    initContactReveal();
    // Reduced-motion: skip snap entirely, show everything
    if (prefersReduced) {
      ['scene-value','scene-collection','scene-material'].forEach(id=>{
        const w=qs(`#${id}`); if(!w) return;
        w.style.height='auto'; w.style.overflow='';
        const s=w.querySelector('.pinned-scene');
        if(s){ s.style.display='flex'; s.style.opacity='1'; }
      });
      instSnapState(4); instSnapState(8); instSnapState(12);
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
