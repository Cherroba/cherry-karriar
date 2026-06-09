/* ========================================
   Cherry "Om Cherry" Page - JavaScript
   Editorial / long-form storytelling page. Mirrors the karriär patterns:
   rafThrottle, hero parallax, back-to-top, hamburger, animate-on-scroll IO,
   section text fades, unified social fade.
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll handler throttle: coalesce work to one update per frame ---
  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { fn(); ticking = false; });
    };
  }

  // --- Hero parallax fade on scroll (typographic hero) ---
  var heroWrapper = document.getElementById('heroWrapper');
  var heroContent = document.querySelector('.om-hero-content');
  var heroSection = document.querySelector('.om-hero');

  if (heroWrapper && heroContent && heroSection) {
    function onHeroScroll() {
      var rect = heroWrapper.getBoundingClientRect();
      var scrolled = -rect.top;
      var range = heroWrapper.offsetHeight - window.innerHeight;

      if (scrolled <= 0) {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0) scale(1)';
        heroSection.style.filter = '';
        return;
      }
      if (scrolled > range) return;

      var progress = scrolled / range;
      var opacity = 1 - progress * 1.5;
      var translateY = -progress * 60;
      var scale = 1 - progress * 0.08;
      var blur = progress * 4;

      heroContent.style.opacity = Math.max(0, opacity);
      heroContent.style.transform = 'translateY(' + translateY + 'px) scale(' + scale + ')';
      heroSection.style.filter = 'blur(' + blur + 'px)';
    }

    window.addEventListener('scroll', rafThrottle(onHeroScroll), { passive: true });
    onHeroScroll();
  }

  // --- Staggered text fade-in for the intro block + social heading ---
  var fadeSections = [
    { container: '#intro',             selectors: ['.om-intro-lead', '.om-intro-body'] },
    { container: '#socialContainer',   selectors: ['.social-section h3'] }
  ];

  fadeSections.forEach(function(cfg) {
    var container = document.querySelector(cfg.container);
    if (!container) return;
    cfg.selectors.forEach(function(sel, i) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.classList.add('section-text-fade');
      el.setAttribute('data-fade-delay', String(i));
    });
  });

  function onSectionTextScroll() {
    var fadeEls = document.querySelectorAll('.section-text-fade');
    fadeEls.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.6) {
        el.classList.add('fade-visible');
      }
    });
  }
  window.addEventListener('scroll', rafThrottle(onSectionTextScroll), { passive: true });
  onSectionTextScroll();

  // --- Back to top button ---
  var backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    function onBackToTopScroll() {
      if (window.scrollY > window.innerHeight) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', rafThrottle(onBackToTopScroll), { passive: true });
    onBackToTopScroll();

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Mobile Navigation Toggle ---
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      mobileNav.classList.toggle('nav-open');
      document.body.style.overflow = mobileNav.classList.contains('nav-open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileNav.classList.remove('nav-open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll-Triggered Animations (IntersectionObserver) ---
  // Each .chapter has .animate-on-scroll — the editorial chapters fade in
  // as the user scrolls them into view.
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.40,
      rootMargin: '0px 0px -60px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }

  // --- Social fade in (unified handler, works on all viewports) ---
  var socialSection = document.querySelector('.social-section');
  if (socialSection) {
    socialSection.classList.add('social-fade');

    function onSocialScroll() {
      var rect = socialSection.getBoundingClientRect();
      var ih = window.innerHeight;
      if (rect.top > ih * 0.6) {
        socialSection.classList.remove('social-visible');
        return;
      }
      socialSection.classList.add('social-visible');
    }

    window.addEventListener('scroll', rafThrottle(onSocialScroll), { passive: true });
    onSocialScroll();
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 60;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // --- Header border on scroll ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', rafThrottle(() => {
      if (window.scrollY > 50) {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      } else {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.05)';
      }
    }), { passive: true });
  }

});
