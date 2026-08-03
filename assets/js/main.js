/**
 * MAHESH KUMAR — DEVOPS ARCHITECT PORTFOLIO
 * main.js — Vanilla JS: animations, interactions, scroll behavior
 */

(function () {
  'use strict';

  /* =========================================================
     UTILITY HELPERS
     ========================================================= */

  /**
   * Query a single element
   * @param {string} selector
   * @param {Element} [ctx=document]
   * @returns {Element|null}
   */
  const $ = (selector, ctx = document) => ctx.querySelector(selector);

  /**
   * Query all elements
   * @param {string} selector
   * @param {Element} [ctx=document]
   * @returns {NodeList}
   */
  const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);

  /**
   * Throttle a function to fire at most once per `limit` ms
   * @param {Function} fn
   * @param {number} limit
   * @returns {Function}
   */
  function throttle(fn, limit) {
    let inThrottle = false;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  /* =========================================================
     NAVBAR — SCROLL SHRINK & ACTIVE LINKS
     ========================================================= */

  const navbar   = $('#navbar');
  const navLinks = $$('.nav-link');

  /**
   * Add/remove .scrolled class on navbar based on scroll position.
   * Also update the active nav link based on visible section.
   */
  function handleNavbarScroll() {
    if (!navbar) return;

    // Shrink navbar
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active section link
    updateActiveNavLink();
  }

  /**
   * Determine which section is currently in view and mark the
   * corresponding nav link as active.
   */
  function updateActiveNavLink() {
    const sections = $$('section[id]');
    const scrollMid = window.scrollY + window.innerHeight / 3;

    let currentId = '';

    sections.forEach((section) => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', throttle(handleNavbarScroll, 80), { passive: true });
  // Run once on load
  handleNavbarScroll();

  /* =========================================================
     SMOOTH SCROLL — NAV LINKS
     ========================================================= */

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = $(href);
        if (target) {
          const navHeight = navbar ? navbar.offsetHeight : 68;
          const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });

  // Also handle hero logo link
  const logoLink = $('.nav-logo');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================================================
     MOBILE HAMBURGER MENU
     ========================================================= */

  const hamburger = $('#hamburger');
  const navMenu   = $('#nav-menu');

  function openMobileMenu() {
    if (!hamburger || !navMenu) return;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!hamburger || !navMenu) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    const isOpen = hamburger && hamburger.classList.contains('open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (
      navMenu &&
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // Close mobile menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* =========================================================
     TYPING ANIMATION — HERO ROLE SUBTITLE
     ========================================================= */

  const roles = [
    'DevOps Architect',
    'Cloud Infrastructure Engineer',
    'Platform Engineering Lead',
    'Kubernetes Specialist',
  ];

  const typingTextEl   = $('#typing-text');
  const typingCursorEl = $('#typing-cursor');

  if (typingTextEl) {
    let roleIndex   = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let typingTimer = null;

    /** Speeds (ms) */
    const TYPE_SPEED   = 75;
    const DELETE_SPEED = 38;
    const PAUSE_END    = 2200; // pause at end of word
    const PAUSE_START  = 400;  // pause before typing next word

    function type() {
      const current = roles[roleIndex];

      if (isDeleting) {
        // Remove a character
        charIndex--;
        typingTextEl.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          roleIndex  = (roleIndex + 1) % roles.length;
          typingTimer = setTimeout(type, PAUSE_START);
          return;
        }
        typingTimer = setTimeout(type, DELETE_SPEED);
      } else {
        // Add a character
        charIndex++;
        typingTextEl.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          isDeleting  = true;
          typingTimer = setTimeout(type, PAUSE_END);
          return;
        }
        typingTimer = setTimeout(type, TYPE_SPEED);
      }
    }

    // Start after a short delay so page feels loaded
    setTimeout(type, 900);
  }

  /* =========================================================
     SCROLL REVEAL — INTERSECTION OBSERVER
     ========================================================= */

  const revealElements = $$('.reveal');

  if ('IntersectionObserver' in window && revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after revealing — fire once
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show all without animation
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* =========================================================
     COUNTER ANIMATION — STAT CARDS
     ========================================================= */

  const statNumbers = $$('.stat-number[data-target]');

  /**
   * Animate a number counting up from 0 to target.
   * @param {Element} el
   * @param {number} target
   * @param {number} duration ms
   */
  function animateCounter(el, target, duration = 1600) {
    const start     = performance.now();
    const startVal  = 0;

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window && statNumbers.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            animateCounter(el, target);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  /* =========================================================
     ACCORDION — CLIENT EXPERIENCE CARDS
     ========================================================= */

  /**
   * Toggle an experience client card open/closed.
   * Called from inline onclick in HTML.
   * @param {Element} headerEl — the .client-card-header element
   */
  window.toggleCard = function toggleCard(headerEl) {
    const card   = headerEl.closest('.client-card');
    const body   = card ? card.querySelector('.client-card-body') : null;
    const btn    = card ? card.querySelector('.toggle-btn') : null;

    if (!body || !btn) return;

    const isOpen = !body.classList.contains('collapsed');

    if (isOpen) {
      body.classList.add('collapsed');
      btn.classList.add('collapsed');
      btn.setAttribute('aria-label', 'Expand card');
    } else {
      body.classList.remove('collapsed');
      btn.classList.remove('collapsed');
      btn.setAttribute('aria-label', 'Collapse card');
    }
  };

  /* =========================================================
     HERO CTA — SMOOTH SCROLL TO #PROJECTS
     ========================================================= */

  const viewWorkBtn = $('a[href="#projects"].btn-primary');
  if (viewWorkBtn) {
    viewWorkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $('#projects');
      if (target) {
        const navHeight = navbar ? navbar.offsetHeight : 68;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  /* =========================================================
     TEAL GLOW CURSOR EFFECT ON PROJECT CARDS
     (Subtle mouse-tracking tilt/glow — desktop only)
     ========================================================= */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const projectCards = $$('.project-card');

    projectCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const tiltX  = ((y - cy) / cy) * 4;   // max 4deg
        const tiltY  = ((cx - x) / cx) * 4;   // max 4deg

        card.style.transform = `translateY(-6px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

        // Dynamic glow based on mouse position
        const glowX = ((x / rect.width)  * 100).toFixed(1);
        const glowY = ((y / rect.height) * 100).toFixed(1);
        card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0,212,170,0.07) 0%, rgba(255,255,255,0.04) 60%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.background = '';
      });
    });
  }

  /* =========================================================
     STAT CARD HOVER — TEAL GLOW RIPPLE
     ========================================================= */

  const statCards = $$('.stat-card');

  statCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const num = card.querySelector('.stat-number');
      if (num) num.style.textShadow = '0 0 24px rgba(0, 212, 170, 0.5)';
    });

    card.addEventListener('mouseleave', () => {
      const num = card.querySelector('.stat-number');
      if (num) num.style.textShadow = '';
    });
  });

  /* =========================================================
     CONTACT CARD — KEYBOARD ACCESSIBILITY
     ========================================================= */

  const contactCards = $$('.contact-card:not(.no-link)');

  contactCards.forEach((card) => {
    if (card.tagName.toLowerCase() === 'a') return; // already a link
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* =========================================================
     PERFORMANCE — PAGE VISIBILITY
     ========================================================= */

  // Pause float animations when tab is not visible
  document.addEventListener('visibilitychange', () => {
    const badges = $$('.badge');
    badges.forEach((b) => {
      b.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });

  /* =========================================================
     INIT LOG
     ========================================================= */

  console.log(
    '%c MK Portfolio %c v1.0 ',
    'background:#00d4aa;color:#0d1117;font-weight:700;font-size:14px;padding:4px 8px;border-radius:4px 0 0 4px;',
    'background:#161b22;color:#00d4aa;font-weight:500;font-size:14px;padding:4px 8px;border-radius:0 4px 4px 0;border:1px solid #00d4aa;'
  );

})();
