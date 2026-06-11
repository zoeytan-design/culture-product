/* ══════════════════════════════════════════════════════
   Tile & Trace｜花磚流光
   script.js
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── PRODUCT DATA ──────────────────────────────────── */
  const PRODUCTS = [
    {
      id: 'blue-begonia',
      num: '01',
      name: 'Blue Begonia',
      cn: '湛藍海棠',
      color: '#79B7D8',
      desc: 'A calm translucent blue glass coaster inspired by the classic begonia motif in Taiwanese floral tiles.',
      motif: 'Begonia-inspired floral tile',
      colorStory: 'Translucent blue',
      meaning: 'Elegance, clarity, and domestic memory',
      material: 'Traditional ceramic tile motif becomes a minimal printed glass pattern.',
    },
    {
      id: 'prosperity-peony',
      num: '02',
      name: 'Prosperity Peony',
      cn: '富貴牡丹',
      color: '#D98372',
      desc: 'A warm terracotta glass coaster inspired by peony-like floral forms, symbolizing blessing and richness.',
      motif: 'Peony-inspired floral structure',
      colorStory: 'Translucent terracotta coral',
      meaning: 'Blessing, richness, and celebration',
      material: 'A traditional floral symbol becomes a warm modern glass object.',
    },
    {
      id: 'verdant-vine',
      num: '03',
      name: 'Verdant Vine Blossom',
      cn: '青藤團花',
      color: '#8BAA78',
      desc: 'A muted green glass coaster inspired by vine ornaments and floral medallions, expressing growth and continuity.',
      motif: 'Vine ornaments and floral medallion',
      colorStory: 'Translucent moss green',
      meaning: 'Growth, continuity, and quiet beauty',
      material: 'Decorative vine details are simplified into delicate printed linework.',
    },
    {
      id: 'golden-apricot',
      num: '04',
      name: 'Golden Apricot Bloom',
      cn: '金杏花窗',
      color: '#D8B45C',
      desc: 'A honey yellow glass coaster inspired by four-petal blossoms and old-house tile geometry.',
      motif: 'Four-petal blossom and tile geometry',
      colorStory: 'Translucent honey yellow',
      meaning: 'Warmth, memory, and gentle rhythm',
      material: 'Old-house tile geometry becomes a light and playful glass pattern.',
    },
  ];

  /* ─── HELPERS ───────────────────────────────────────── */
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }
  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ─── NAVIGATION ────────────────────────────────────── */
  function initNav() {
    const nav = qs('#nav');
    const hamburger = qs('#hamburger');
    const mobileMenu = qs('#mobileMenu');

    // Scrolled state
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // Mobile hamburger
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    qsa('a', mobileMenu).forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });

    // Smooth scroll for all nav/CTA anchor links
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ─── FADE-UP OBSERVER ──────────────────────────────── */
  function initFadeUp() {
    const items = qsa('.fade-up');
    if (!items.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings in the same parent
        const siblings = qsa('.fade-up', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, idx * 80);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ─── SHOWCASE (PINNED PRODUCT SCROLL) ──────────────── */
  function initShowcase() {
    const pin      = qs('#showcasePin');
    const spacer   = qs('#showcaseSpacer');
    const bg       = qs('#showcaseBg');
    const panels   = qsa('.showcase__panel');
    const dots     = qsa('.showcase__dot');
    const nameEl   = qs('#showcaseName');
    const cnEl     = qs('#showcaseCn');
    const descEl   = qs('#showcaseDesc');
    const numEl    = qs('#showcaseNum');

    if (!pin) return;

    let current = 0;

    function goTo(idx) {
      if (idx === current) return;
      panels[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = idx;
      panels[current].classList.add('active');
      dots[current].classList.add('active');

      const p = PRODUCTS[current];

      // Animate text out then in
      nameEl.style.opacity = '0';
      nameEl.style.transform = 'translateY(10px)';
      cnEl.style.opacity   = '0';
      descEl.style.opacity = '0';
      numEl.style.opacity  = '0';

      setTimeout(() => {
        nameEl.textContent = p.name;
        cnEl.textContent   = p.cn;
        descEl.textContent = p.desc;
        numEl.textContent  = p.num;

        nameEl.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        nameEl.style.opacity    = '1';
        nameEl.style.transform  = 'translateY(0)';
        cnEl.style.transition   = 'opacity 0.55s ease 0.08s';
        cnEl.style.opacity      = '1';
        descEl.style.transition = 'opacity 0.55s ease 0.14s';
        descEl.style.opacity    = '1';
        numEl.style.transition  = 'opacity 0.4s ease';
        numEl.style.opacity     = '1';
      }, 200);

      // Background glow
      bg.style.background = `radial-gradient(ellipse at 30% 50%, ${hexToRgba(p.color, 0.15)} 0%, transparent 60%)`;
    }

    // Initialize background
    bg.style.background = `radial-gradient(ellipse at 30% 50%, ${hexToRgba(PRODUCTS[0].color, 0.15)} 0%, transparent 60%)`;

    // Dot click
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    // GSAP scroll-driven if available
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Spacer height = 3× viewport so there's room to scroll through 4 products
      const sectionHeight = window.innerHeight * 3.5;
      spacer.style.height = sectionHeight + 'px';

      ScrollTrigger.create({
        trigger: qs('#showcase'),
        start: 'top top',
        end: `+=${sectionHeight}`,
        pin: pin,
        pinSpacing: false,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress; // 0 – 1
          const idx = Math.min(
            PRODUCTS.length - 1,
            Math.floor(progress * PRODUCTS.length)
          );
          if (idx !== current) goTo(idx);
        },
      });

      // Floating product image
      gsap.to('.showcase__visual', {
        y: -12,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    } else {
      // Fallback: auto-advance every 3 seconds
      spacer.style.height = '0';
      let autoIdx = 0;
      setInterval(() => {
        autoIdx = (autoIdx + 1) % PRODUCTS.length;
        goTo(autoIdx);
      }, 3200);
    }
  }

  /* ─── COLLECTION HOVER GLOW ─────────────────────────── */
  function initCollectionGlow() {
    qsa('.collection__item').forEach(item => {
      const color = item.dataset.color;
      if (!color) return;
      item.addEventListener('mouseenter', () => {
        item.querySelector('.collection__img-wrap').style.boxShadow =
          `0 12px 40px ${hexToRgba(color, 0.3)}`;
      });
      item.addEventListener('mouseleave', () => {
        item.querySelector('.collection__img-wrap').style.boxShadow = '';
      });
      // Click → scroll to showcase
      item.addEventListener('click', () => {
        const showcase = qs('#showcase');
        if (showcase) showcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ─── VALUE CARD GLOW ───────────────────────────────── */
  function initValueGlow() {
    qsa('.value__card').forEach(card => {
      const color = card.dataset.glow;
      if (!color) return;
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = `0 20px 60px ${hexToRgba(color, 0.22)}`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '';
      });
    });
  }

  /* ─── INTERACTIVE PATTERN STORY ─────────────────────── */
  function initPatternStory() {
    const tabs   = qsa('.ps-tab');
    const inner  = qs('#psCardInner');
    const glow   = qs('#psGlow');
    if (!inner || !glow) return;

    function renderCard(product) {
      inner.innerHTML = `
        <div class="ps-entry">
          <h4>Motif</h4>
          <p>${product.motif}</p>
        </div>
        <div class="ps-entry">
          <h4>Color</h4>
          <p>${product.colorStory}</p>
        </div>
        <div class="ps-entry">
          <h4>Cultural Meaning</h4>
          <p>${product.meaning}</p>
        </div>
        <div class="ps-entry">
          <h4>Material Transformation</h4>
          <p>${product.material}</p>
        </div>
      `;
      glow.style.background = product.color;
    }

    function switchTo(id) {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return;

      // Update tabs
      tabs.forEach(t => t.classList.toggle('active', t.dataset.product === id));

      // Fade out
      inner.classList.add('fading');
      setTimeout(() => {
        renderCard(product);
        inner.classList.remove('fading');
      }, 350);
    }

    // Initialize
    renderCard(PRODUCTS[0]);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTo(tab.dataset.product));
    });
  }

  /* ─── GSAP SCROLL REVEALS ────────────────────────────── */
  function initGsapReveals() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Cultural step numbers animate in sequence
    const steps = qsa('.cultural__step-num');
    steps.forEach((num, i) => {
      ScrollTrigger.create({
        trigger: num,
        start: 'top 88%',
        onEnter: () => {
          gsap.fromTo(num,
            { scale: 0.7, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, delay: i * 0.12, ease: 'back.out(1.4)' }
          );
        },
        once: true,
      });
    });

    // Packaging boxes stagger
    const boxes = qsa('.packaging__box');
    boxes.forEach((box, i) => {
      gsap.fromTo(box,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: box, start: 'top 88%', once: true },
        }
      );
    });

    // Hero glow parallax
    const glows = qsa('.hero__glow');
    glows.forEach((g, i) => {
      gsap.to(g, {
        y: i % 2 === 0 ? -60 : 60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ─── PACKAGING BOX HOVER TOOLTIP ───────────────────── */
  function initPackagingHover() {
    qsa('.packaging__box').forEach(box => {
      const color = box.closest('.packaging__box-inner--blue')  ? '#79B7D8'
                  : box.querySelector('.packaging__box-inner--coral')  ? '#D98372'
                  : box.querySelector('.packaging__box-inner--green')  ? '#8BAA78'
                  : box.querySelector('.packaging__box-inner--yellow') ? '#D8B45C'
                  : null;
    });
  }

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    initNav();
    initFadeUp();
    initCollectionGlow();
    initValueGlow();
    initPatternStory();
    initGsapReveals();
    initShowcase();
    initPackagingHover();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
