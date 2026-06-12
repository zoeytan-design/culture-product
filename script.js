/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光 — Stable Stage Snap v9
   Placeholder removed version
   Material stage changed from 4 steps to 3 steps
   Packaging is now one single image
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── PRODUCTS ──────────────────────────────────────── */
  const PRODUCTS = [
    {
      name: 'Blue Begonia',
      cn: '湛藍海棠',
      num: '01',
      desc: 'A calm blue glass coaster inspired by the classic begonia motif.',
      motif: 'Begonia flower',
      color: 'Translucent blue',
      meaning: 'Elegance and domestic memory',
      accent: '#79B7D8'
    },
    {
      name: 'Prosperity Peony',
      cn: '富貴牡丹',
      num: '02',
      desc: 'A warm terracotta glass coaster inspired by peony-like floral forms.',
      motif: 'Peony-inspired flower',
      color: 'Terracotta coral',
      meaning: 'Blessing and richness',
      accent: '#D98372'
    },
    {
      name: 'Verdant Vine Blossom',
      cn: '青藤團花',
      num: '03',
      desc: 'A muted green glass coaster inspired by vine ornaments and floral medallions.',
      motif: 'Vine and floral medallion',
      color: 'Moss green',
      meaning: 'Growth and continuity',
      accent: '#8BAA78'
    },
    {
      name: 'Golden Apricot Bloom',
      cn: '金杏花窗',
      num: '04',
      desc: 'A honey yellow glass coaster inspired by four-petal blossoms and tile geometry.',
      motif: 'Four-petal blossom',
      color: 'Honey yellow',
      meaning: 'Warmth and memory',
      accent: '#D8B45C'
    }
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  const qs = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => window.gsap;

  function clean(list) {
    return list.flat().filter(Boolean);
  }

  function hexRgba(hex, a) {
    return `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;
  }

  /* ─── STEP TABLE ────────────────────────────────────── */
  const STEPS = [
    { scene: 'hero' },

    { scene: 'value', sub: 0 },
    { scene: 'value', sub: 1 },
    { scene: 'value', sub: 2 },
    { scene: 'value', sub: 3 },

    { scene: 'collection', sub: 0 },
    { scene: 'collection', sub: 1 },
    { scene: 'collection', sub: 2 },
    { scene: 'collection', sub: 3 },

    { scene: 'material', sub: 0 },
    { scene: 'material', sub: 1 },
    { scene: 'material', sub: 2 },

    { scene: 'shop' },

    { scene: 'contact' }
  ];

  const LAST = STEPS.length - 1;

  const SCENE_EL = {
    hero: () => qs('#scene-hero'),
    value: () => qs('#scene-value'),
    collection: () => qs('#scene-collection'),
    material: () => qs('#scene-material'),
    shop: () => qs('#scene-shop'),
    contact: () => qs('#scene-contact')
  };

  const MAT = [
    { vis: '.material-visual-1', cop: '.material-copy-1' },
    { vis: '.material-visual-2', cop: '.material-copy-2' },
    { vis: '.material-visual-3', cop: '.material-copy-3' }
  ];

  /* ─── STATE ─────────────────────────────────────────── */
  let current = 0;
  let busy = false;
  let lastTime = 0;
  let collCurrent = -1;
  let matCurrent = -1;
  let contactPlayed = false;

  const COOLDOWN = 850;

  /* ─── PIP BAR ───────────────────────────────────────── */
  const SCENE_ORDER = ['hero', 'value', 'collection', 'material', 'shop', 'contact'];

  function buildPips() {
    const bar = qs('#pipBar');
    if (!bar) return;

    bar.innerHTML = '';

    SCENE_ORDER.forEach((_, i) => {
      const p = document.createElement('span');
      p.className = 'stage-pip' + (i === 0 ? ' active' : '');
      bar.appendChild(p);
    });
  }

  function updatePips() {
    const currentScene = STEPS[current].scene;
    const sceneIdx = SCENE_ORDER.indexOf(currentScene);
    qsa('.stage-pip').forEach((p, i) => {
      p.classList.toggle('active', i === sceneIdx);
    });
  }

  /* ═══════════════════════════════════════════════════════
     RESET / RENDER HELPERS
  ═══════════════════════════════════════════════════════ */

  function resetHero() {
    const sec = qs('#scene-hero');
    if (!sec) return;

    const label = qs('.s1-label', sec);
    const title = qs('.s1-title', sec);
    const lines = qsa('.split-line', sec);
    const sub = qs('.s1-sub', sec);
    const acts = qs('.s1-actions', sec);
    const visual = qs('.s1-visual', sec);
    const inners = lines.map(l => l.querySelector('span')).filter(Boolean);

    if (G() && !reduced) {
      G().killTweensOf(clean([label, title, inners, sub, acts, visual]));
      G().set(clean([label, sub, acts]), { opacity: 0, y: 22 });
      G().set(visual, { opacity: 0, scale: 0.94 });
      G().set(inners, { y: '106%', opacity: 0 });
      if (title) G().set(title, { y: '106%', opacity: 0 });
    } else {
      clean([label, sub, acts, visual, title, inners]).forEach(el => {
        el.style.opacity = '0';
      });
    }
  }

  function heroEntrance() {
    const sec = qs('#scene-hero');
    if (!sec || !G() || reduced) return;

    const label = qs('.s1-label', sec);
    const title = qs('.s1-title', sec);
    const lines = qsa('.split-line', sec);
    const sub = qs('.s1-sub', sec);
    const acts = qs('.s1-actions', sec);
    const visual = qs('.s1-visual', sec);
    const inners = lines.map(line => line.querySelector('span')).filter(Boolean);

    resetHero();

    const tl = G().timeline({ delay: 0.18 });

    if (label) {
      tl.to(label, {
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: 'power2.out'
      });
    }

    if (title) {
      tl.to(title, {
        y: '0%',
        opacity: 1,
        duration: 1.08,
        ease: 'power3.out'
      }, '-=0.18');
    }

    inners.forEach((inner, i) => {
      tl.to(inner, {
        y: '0%',
        opacity: 1,
        duration: 0.92,
        ease: 'power3.out'
      }, i === 0 ? '-=0.42' : '-=0.58');
    });

    if (visual) {
      tl.to(visual, {
        opacity: 1,
        scale: 1,
        duration: 0.95,
        ease: 'power2.out'
      }, '-=0.55');
    }

    if (sub) {
      tl.to(sub, {
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: 'power2.out'
      }, '-=0.42');
    }

    if (acts) {
      tl.to(acts, {
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: 'power2.out'
      }, '-=0.38');
    }
  }

  function renderValueState(sub, animate) {
    const vis = qs('.value-visual-center');
    const lbl = qs('.value-label');
    const ttl = qs('.value-title');
    const pts = [
      qs('.value-point-1'),
      qs('.value-point-2'),
      qs('.value-point-3')
    ];

    const baseEls = clean([vis, lbl, ttl]);
    const visiblePts = pts.filter((_, i) => i < sub).filter(Boolean);
    const hiddenPts = pts.filter((_, i) => i >= sub).filter(Boolean);
    const allEls = clean([baseEls, pts]);

    if (G() && !reduced) {
      G().killTweensOf(allEls);

      G().set(baseEls, {
        opacity: 1,
        y: 0,
        scale: 1
      });

      G().set(visiblePts, {
        opacity: 1,
        x: 0
      });

      G().set(hiddenPts, {
        opacity: 0,
        x: 28
      });

      if (animate) {
        G().fromTo(baseEls,
          {
            opacity: 0,
            y: 18,
            scale: 0.98
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.78,
            ease: 'power2.out',
            stagger: 0.06,
            overwrite: 'auto'
          }
        );

        if (visiblePts.length) {
          G().fromTo(visiblePts,
            {
              opacity: 0,
              x: 24
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.08,
              delay: 0.16,
              overwrite: 'auto'
            }
          );
        }
      }
    } else {
      baseEls.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      pts.forEach((pt, i) => {
        if (!pt) return;
        pt.style.opacity = i < sub ? '1' : '0';
        pt.style.transform = i < sub ? 'none' : 'translateX(28px)';
      });
    }
  }

  function playValue(sub, dir) {
    const vis = qs('.value-visual-center');
    const lbl = qs('.value-label');
    const ttl = qs('.value-title');
    const pts = [
      qs('.value-point-1'),
      qs('.value-point-2'),
      qs('.value-point-3')
    ];

    const baseEls = clean([vis, lbl, ttl]);
    const allEls = clean([baseEls, pts]);

    if (G() && !reduced) {
      G().killTweensOf(allEls);

      G().set(baseEls, {
        opacity: 1,
        y: 0,
        scale: 1
      });

      pts.forEach((pt, i) => {
        if (!pt) return;

        const shouldShow = i < sub;
        const isChangingForward = dir >= 0 && i === sub - 1;
        const isChangingBackward = dir < 0 && i === sub;

        if (isChangingForward) {
          G().fromTo(pt,
            {
              opacity: 0,
              x: 30
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.72,
              ease: 'power2.out',
              overwrite: 'auto'
            }
          );
        } else if (isChangingBackward) {
          G().to(pt, {
            opacity: 0,
            x: 30,
            duration: 0.45,
            ease: 'power2.in',
            overwrite: 'auto'
          });
        } else {
          G().set(pt, {
            opacity: shouldShow ? 1 : 0,
            x: shouldShow ? 0 : 28
          });
        }
      });
    } else {
      baseEls.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

      pts.forEach((pt, i) => {
        if (!pt) return;
        pt.style.opacity = i < sub ? '1' : '0';
        pt.style.transform = i < sub ? 'none' : 'translateX(28px)';
      });
    }
  }

  function renderCollectionState(sub, animate) {
    const frames = qsa('.product-frame');
    const p = PRODUCTS[sub];
    const bg = qs('#collectionBg');

    if (!p) return;

    const textIds = [
      'collectionNum',
      'collectionName',
      'collectionCn',
      'collectionDesc',
      'metaMotif',
      'metaColor',
      'metaMeaning'
    ];

    const vals = [
      p.num + ' / 04',
      p.name,
      p.cn,
      p.desc,
      p.motif,
      p.color,
      p.meaning
    ];

    const textEls = textIds.map(id => qs('#' + id)).filter(Boolean);

    function applyText() {
      textIds.forEach((id, i) => {
        const el = qs('#' + id);
        if (el) el.textContent = vals[i];
      });
    }

    if (bg) {
      bg.style.background = `radial-gradient(ellipse 75% 65% at 28% 50%, ${hexRgba(p.accent, 0.16)} 0%, transparent 62%)`;
    }

    if (G() && !reduced) {
      G().killTweensOf(clean([frames, bg, textEls]));

      frames.forEach((frame, i) => {
        frame.classList.toggle('active', i === sub);

        G().to(frame, {
          autoAlpha: i === sub ? 1 : 0,
          scale: i === sub ? 1 : 0.96,
          rotation: i === sub ? 0 : -1.5,
          duration: animate ? 0.68 : 0,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      if (animate && collCurrent >= 0 && collCurrent !== sub) {
        G().to(textEls, {
          opacity: 0,
          y: 8,
          duration: 0.28,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            applyText();

            G().fromTo(textEls,
              {
                opacity: 0,
                y: 10
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.62,
                ease: 'power2.out',
                stagger: 0.05,
                overwrite: 'auto'
              }
            );
          }
        });
      } else {
        applyText();

        G().set(textEls, {
          opacity: 1,
          y: 0
        });

        if (animate) {
          G().fromTo(textEls,
            {
              opacity: 0,
              y: 10
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.62,
              ease: 'power2.out',
              stagger: 0.05,
              overwrite: 'auto'
            }
          );
        }
      }
    } else {
      frames.forEach((frame, i) => {
        frame.classList.toggle('active', i === sub);
        frame.style.opacity = i === sub ? '1' : '0';
        frame.style.visibility = i === sub ? 'visible' : 'hidden';
      });

      applyText();

      textEls.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }

    qsa('.pdot').forEach((d, i) => {
      d.classList.toggle('active', i === sub);
    });

    collCurrent = sub;
  }

  function playCollection(sub) {
    renderCollectionState(sub, true);
  }

  function renderMaterialState(sub, animate) {
    const allVis = MAT.map(m => qs(m.vis)).filter(Boolean);
    const allCop = MAT.map(m => qs(m.cop)).filter(Boolean);
    const target = MAT[sub];

    if (!target) return;

    if (G() && !reduced) {
      G().killTweensOf(clean([allVis, allCop]));

      MAT.forEach((m, i) => {
        const v = qs(m.vis);
        const c = qs(m.cop);
        const isActive = i === sub;

        if (v) {
          v.classList.toggle('active', isActive);

          G().to(v, {
            autoAlpha: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.97,
            y: isActive ? 0 : 10,
            duration: animate ? 0.72 : 0,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        if (c) {
          c.classList.toggle('active', isActive);

          G().to(c, {
            autoAlpha: isActive ? 1 : 0,
            y: isActive ? 0 : 16,
            duration: animate ? 0.62 : 0,
            ease: 'power2.out',
            overwrite: 'auto',
            delay: isActive && animate ? 0.08 : 0
          });
        }
      });
    } else {
      MAT.forEach((m, i) => {
        const v = qs(m.vis);
        const c = qs(m.cop);
        const isActive = i === sub;

        if (v) {
          v.classList.toggle('active', isActive);
          v.style.opacity = isActive ? '1' : '0';
          v.style.visibility = isActive ? 'visible' : 'hidden';
        }

        if (c) {
          c.classList.toggle('active', isActive);
          c.style.opacity = isActive ? '1' : '0';
          c.style.visibility = isActive ? 'visible' : 'hidden';
          c.style.transform = isActive ? 'none' : 'translateY(16px)';
        }
      });
    }

    qsa('.mprog').forEach((m, i) => {
      m.classList.toggle('active', i === sub);
    });

    matCurrent = sub;
  }

  function playMaterial(sub) {
    renderMaterialState(sub, true);
  }

  function resetContact() {
    const els = clean([
      qs('.c-label'),
      qs('.c-title'),
      qs('.c-copy'),
      qs('.c-actions'),
      qs('.c-links')
    ]);

    contactPlayed = false;

    if (G() && !reduced) {
      G().killTweensOf(els);
      G().set(els, {
        opacity: 0,
        y: 18
      });
    } else {
      els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
      });
    }
  }

  function playContact() {
    if (contactPlayed) return;
    contactPlayed = true;

    const lbl = qs('.c-label');
    const title = qs('.c-title');
    const copy = qs('.c-copy');
    const actions = qs('.c-actions');
    const links = qs('.c-links');

    const els = clean([lbl, title, copy, actions, links]);

    if (!G() || reduced) {
      els.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    G().killTweensOf(els);

    const tl = G().timeline({ delay: 0.08 });

    if (lbl) {
      tl.fromTo(lbl,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.65 },
        0
      );
    }

    if (title) {
      tl.fromTo(title,
        { opacity: 0, y: '70%' },
        { opacity: 1, y: '0%', duration: 1.08, ease: 'power3.out' },
        0.08
      );
    }

    if (copy) {
      tl.fromTo(copy,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65 },
        0.44
      );
    }

    if (actions) {
      tl.fromTo(actions,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65 },
        0.6
      );
    }

    if (links) {
      tl.fromTo(links,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65 },
        0.76
      );
    }
  }

  function prepareTargetState(step) {
    if (!step) return;

    if (step.scene === 'hero') {
      resetHero();
    }

    if (step.scene === 'value') {
      renderValueState(step.sub, false);
    }

    if (step.scene === 'collection') {
      renderCollectionState(step.sub, false);
    }

    if (step.scene === 'material') {
      renderMaterialState(step.sub, false);
    }

    if (step.scene === 'contact') {
      resetContact();
    }
  }

  /* ═══════════════════════════════════════════════════════
     SCENE SWITCH
  ═══════════════════════════════════════════════════════ */

  function switchScene(toName, fromName, onReady) {
    if (toName === fromName) {
      onReady();
      return;
    }

    const toEl = SCENE_EL[toName] && SCENE_EL[toName]();
    const fromEl = SCENE_EL[fromName] && SCENE_EL[fromName]();

    if (!toEl) {
      onReady();
      return;
    }

    if (!G() || reduced) {
      if (fromEl) {
        fromEl.classList.remove('active');
        fromEl.style.opacity = '0';
        fromEl.style.visibility = 'hidden';
        fromEl.style.pointerEvents = 'none';
      }

      toEl.classList.add('active');
      toEl.style.opacity = '1';
      toEl.style.visibility = 'visible';
      toEl.style.pointerEvents = 'auto';

      onReady();
      return;
    }

    const gsap = G();

    gsap.killTweensOf(clean([fromEl, toEl]));

    gsap.set(toEl, {
      autoAlpha: 0,
      pointerEvents: 'none',
      zIndex: 2
    });

    toEl.classList.add('active');

    const tl = gsap.timeline({
      defaults: {
        overwrite: 'auto'
      },
      onComplete: () => {
        if (fromEl) {
          fromEl.classList.remove('active');

          gsap.set(fromEl, {
            autoAlpha: 0,
            pointerEvents: 'none',
            zIndex: 0
          });
        }

        gsap.set(toEl, {
          autoAlpha: 1,
          pointerEvents: 'auto',
          zIndex: 3
        });

        onReady();
      }
    });

    if (fromEl && fromEl.classList.contains('active')) {
      tl.to(fromEl, {
        autoAlpha: 0,
        duration: 0.42,
        ease: 'power2.inOut'
      }, 0);
    }

    tl.to(toEl, {
      autoAlpha: 1,
      duration: 0.62,
      ease: 'power2.out'
    }, fromEl ? 0.12 : 0);
  }

  /* ═══════════════════════════════════════════════════════
     MAIN NAVIGATION
  ═══════════════════════════════════════════════════════ */

  function unlockAfterCooldown() {
    setTimeout(() => {
      busy = false;
    }, COOLDOWN);
  }

  function goTo(next, dir) {
    if (busy) return;

    const now = Date.now();

    if (now - lastTime < COOLDOWN) return;

    lastTime = now;

    next = Math.max(0, Math.min(LAST, next));

    if (next === current) return;

    busy = true;

    const fromStep = STEPS[current];
    const toStep = STEPS[next];

    const fromScene = fromStep.scene;
    const toScene = toStep.scene;

    current = next;

    updatePips();

    if (fromScene === toScene) {
      if (toScene === 'value') {
        playValue(toStep.sub, dir);
      }

      if (toScene === 'collection') {
        playCollection(toStep.sub);
      }

      if (toScene === 'material') {
        playMaterial(toStep.sub);
      }

      unlockAfterCooldown();
      return;
    }

    prepareTargetState(toStep);

    switchScene(toScene, fromScene, () => {
      if (toScene === 'hero') {
        heroEntrance();
      }

      if (toScene === 'value') {
        renderValueState(toStep.sub, true);
      }

      if (toScene === 'collection') {
        renderCollectionState(toStep.sub, true);
      }

      if (toScene === 'material') {
        renderMaterialState(toStep.sub, true);
      }

      if (toScene === 'contact') {
        playContact();
      }

      unlockAfterCooldown();
    });
  }

  /* ─── INPUT ──────────────────────────────────────────── */

  let touchY0 = 0;
  let wheelAcc = 0;
  let wheelTimer = null;

  window.addEventListener('wheel', e => {
    e.preventDefault();

    wheelAcc += e.deltaY;

    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAcc = 0; }, 300);

    if (Math.abs(wheelAcc) < 40) return;

    const dir = wheelAcc > 0 ? 1 : -1;
    wheelAcc = 0;

    goTo(current + dir, dir);
  }, {
    passive: false
  });

  window.addEventListener('touchstart', e => {
    touchY0 = e.touches[0].clientY;
  }, {
    passive: true
  });

  window.addEventListener('touchend', e => {
    const dy = touchY0 - e.changedTouches[0].clientY;

    if (Math.abs(dy) < 40) return;

    const dir = dy > 0 ? 1 : -1;

    goTo(current + dir, dir);
  }, {
    passive: true
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(current + 1, 1);
    }

    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1, -1);
    }

    if (e.key === 'Home') {
      e.preventDefault();

      busy = false;
      lastTime = 0;

      goTo(0, -1);
    }
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

    busy = false;
    lastTime = 0;

    goTo(idx, dir);

    const mobileMenu = qs('#mobileMenu');

    if (mobileMenu) {
      mobileMenu.classList.remove('open');
    }
  });

  /* ─── INIT ───────────────────────────────────────────── */

  function init() {
    if (G()) {
      G().defaults({
        overwrite: 'auto'
      });
    }

    qsa('.scene').forEach(scene => {
      const isHero = scene.id === 'scene-hero';

      scene.classList.toggle('active', isHero);

      if (G() && !reduced) {
        G().set(scene, {
          autoAlpha: isHero ? 1 : 0,
          pointerEvents: isHero ? 'auto' : 'none',
          zIndex: isHero ? 3 : 0
        });
      } else {
        scene.style.opacity = isHero ? '1' : '0';
        scene.style.visibility = isHero ? 'visible' : 'hidden';
        scene.style.pointerEvents = isHero ? 'auto' : 'none';
      }
    });

    renderValueState(0, false);
    renderCollectionState(0, false);
    renderMaterialState(0, false);
    resetContact();

    const hb = qs('#hamburger');
    const mm = qs('#mobileMenu');

    if (hb && mm) {
      hb.addEventListener('click', () => {
        mm.classList.toggle('open');
      });
    }

    buildPips();
    heroEntrance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ═══ CART LOGIC ══════════════════════════════════════════ */
(function () {
  const PRICE = 800;
  let cart = {}; // { productId: { name, img, qty } }

  const cartBtn     = document.getElementById('cartBtn');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartItems   = document.getElementById('cartItems');
  const cartCount   = document.getElementById('cartCount');
  const cartItemCount = document.getElementById('cartItemCount');
  const cartSubtotal  = document.getElementById('cartSubtotal');

  const PRODUCT_NAMES = {
    'blue-begonia':    'Blue Begonia',
    'prosperity-peony':'Prosperity Peony',
    'verdant-vine':    'Verdant Vine',
    'golden-apricot':  'Golden Apricot'
  };

  const PRODUCT_IMGS = {
    'blue-begonia':    'assets/blue-begonia.png',
    'prosperity-peony':'assets/prosperity-peony.png',
    'verdant-vine':    'assets/verdant-vine.png',
    'golden-apricot':  'assets/golden-apricot.png'
  };

  /* Open / close drawer */
  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  /* Update cart count badge */
  function updateBadge() {
    const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = total;
    cartItemCount.textContent = total;
    if (total > 0) {
      cartCount.classList.add('visible');
    } else {
      cartCount.classList.remove('visible');
    }
    const subtotal = Object.values(cart).reduce((s, i) => s + i.qty * PRICE, 0);
    cartSubtotal.textContent = 'NT$ ' + subtotal.toLocaleString();
  }

  /* Render cart items */
  function renderCart() {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      return;
    }

    cartItems.innerHTML = keys.map(id => {
      const item = cart[id];
      return `
        <div class="cart-item" data-id="${id}">
          <div class="cart-item__img">
            <img src="${PRODUCT_IMGS[id]}" alt="${item.name}" />
          </div>
          <div class="cart-item__info">
            <p class="cart-item__name">${item.name}</p>
            <p class="cart-item__price">NT$ ${PRICE.toLocaleString()}</p>
            <div class="cart-item__qty">
              <button class="qty-btn cart-qty-minus">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn cart-qty-plus">+</button>
            </div>
          </div>
          <button class="cart-item__remove" data-id="${id}" aria-label="Remove">✕</button>
        </div>
      `;
    }).join('');

    /* Qty and remove events inside drawer */
    cartItems.querySelectorAll('.cart-item').forEach(row => {
      const id = row.dataset.id;

      row.querySelector('.cart-qty-minus').addEventListener('click', () => {
        if (cart[id].qty > 1) {
          cart[id].qty--;
        } else {
          delete cart[id];
        }
        renderCart();
        updateBadge();
      });

      row.querySelector('.cart-qty-plus').addEventListener('click', () => {
        cart[id].qty++;
        renderCart();
        updateBadge();
      });

      row.querySelector('.cart-item__remove').addEventListener('click', () => {
        delete cart[id];
        renderCart();
        updateBadge();
      });
    });
  }

  /* Add to cart — wire up all product cards */
  document.querySelectorAll('.product-card').forEach(card => {
    const id    = card.dataset.product;
    const minus = card.querySelector('.qty-minus');
    const plus  = card.querySelector('.qty-plus');
    const qtyEl = card.querySelector('.qty-val');
    const addBtn= card.querySelector('.product-card__add');
    const toast = card.querySelector('.product-card__toast');
    let qty = 1;

    minus.addEventListener('click', () => {
      if (qty > 1) { qty--; qtyEl.textContent = qty; }
    });

    plus.addEventListener('click', () => {
      qty++;
      qtyEl.textContent = qty;
    });

    addBtn.addEventListener('click', () => {
      if (cart[id]) {
        cart[id].qty += qty;
      } else {
        cart[id] = { name: PRODUCT_NAMES[id], qty };
      }

      updateBadge();
      renderCart();

      /* Toast */
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);

      /* Reset qty */
      qty = 1;
      qtyEl.textContent = 1;
    });
  });
})();
