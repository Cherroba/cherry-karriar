/* ========================================
   Cherry Karriarsida - JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation Toggle ---
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      mobileNav.classList.toggle('nav-open');
      document.body.style.overflow = mobileNav.classList.contains('nav-open') ? 'hidden' : '';
    });

    // Close menu when clicking a nav link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        mobileNav.classList.remove('nav-open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll-Triggered Animations (IntersectionObserver) ---
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
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all elements immediately
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }

  // --- Video Lazy Load ---
  const videoWrapper = document.getElementById('videoWrapper');

  if (videoWrapper) {
    videoWrapper.addEventListener('click', () => {
      const videoUrl = videoWrapper.getAttribute('data-video-url');
      if (videoUrl) {
        videoWrapper.innerHTML = `<iframe src="${videoUrl}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    });
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

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Header background on scroll ---
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      } else {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.05)';
      }
    }, { passive: true });
  }

  // --- Testimonial Card Swipe Dots (mobile) ---
  const teamGrid = document.querySelector('.team-grid');
  const teamDots = document.querySelectorAll('.team-dot');

  if (teamGrid && teamDots.length > 0) {
    teamGrid.addEventListener('scroll', function() {
      var scrollLeft = teamGrid.scrollLeft;
      var cardWidth = teamGrid.querySelector('.testimonial-card').offsetWidth + 16; // gap
      var activeIndex = Math.round(scrollLeft / cardWidth);
      teamDots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }, { passive: true });
  }

  // --- Rainbow Arc Values Section ---
  const valuesContainer = document.getElementById('valuesContainer');
  const valuesScene = document.getElementById('valuesScene');

  if (valuesContainer && valuesScene) {
    const arcValues = [
      { title: 'Fr\u00e5n ny \u2192 pro', desc: 'L\u00e4r dig snabbt. V\u00e4x \u00e4nnu snabbare. Vi ger dig verktygen \u2013 du s\u00e4tter takten.' },
      { title: 'Jobba. Ha kul. Repeat.', desc: 'Ett team som backar dig. Bra vibes. H\u00f6gt tempo. Alltid tillsammans.' },
      { title: 'M\u00e5nga m\u00f6jligheter', desc: 'Olika st\u00e4der. Olika pass. Flexibilitet n\u00e4r livet kr\u00e4ver det.' },
      { title: '100% tryggt', desc: 'Schyssta villkor. R\u00e4tt l\u00f6n. Inga konstigheter \u2013 bara trygghet.' },
      { title: 'Aldrig en tr\u00e5kig kv\u00e4ll', desc: 'Nya m\u00e4nniskor. Nya platser. Du \u00e4r mitt i allt som h\u00e4nder.' },
    ];

    const arcNodes = document.querySelectorAll('.arc-node');
    const centerText = document.getElementById('centerText');
    const centerTitle = document.getElementById('centerTitle');
    const centerDesc = document.getElementById('centerDesc');
    const scrollDots = document.querySelectorAll('.scroll-dot');
    const scrollHintEl = document.getElementById('scrollHint');
    const TOTAL = arcValues.length;

    function isMob() { return window.innerWidth <= 768; }

    // Desktop: arc positions
    function arcPosition(index) {
      var cx = valuesScene.offsetWidth / 2;
      var cy = valuesScene.offsetHeight * 0.60;
      var rx = 260, ry = 260;
      var angleDeg = 180 - (180 * index / (TOTAL - 1));
      var rad = angleDeg * Math.PI / 180;
      return { x: cx + rx * Math.cos(rad), y: cy - ry * Math.sin(rad) };
    }
    function desktopCenter() {
      return { x: valuesScene.offsetWidth / 2, y: valuesScene.offsetHeight * 0.38 };
    }

    // Mobile: horizontal row with gentle arc
    function mobileRowPosition(index) {
      var cx = valuesScene.offsetWidth / 2;
      var spacing = 56;
      var totalW = spacing * (TOTAL - 1);
      var startX = cx - totalW / 2;
      var x = startX + index * spacing;
      var normalizedPos = (index - (TOTAL - 1) / 2) / ((TOTAL - 1) / 2);
      var arcLift = 14 * (1 - normalizedPos * normalizedPos);
      var baseY = valuesScene.offsetHeight * 0.15;
      return { x: x, y: baseY - arcLift };
    }
    function mobileCenter() {
      return { x: valuesScene.offsetWidth / 2, y: valuesScene.offsetHeight * 0.26 };
    }

    var currentArcActive = -1;

    function updateArc(activeIndex) {
      if (activeIndex === currentArcActive) return;
      currentArcActive = activeIndex;

      var mobile = isMob();
      var nodeSize = mobile ? 44 : 60;
      var half = nodeSize / 2;
      var center = mobile ? mobileCenter() : desktopCenter();

      arcNodes.forEach(function(node, i) {
        node.classList.remove('active', 'dimmed', 'visited');
        if (i === activeIndex) {
          node.classList.add('active');
          node.style.left = (center.x - half) + 'px';
          node.style.top = (center.y - half) + 'px';
        } else {
          var pos = mobile ? mobileRowPosition(i) : arcPosition(i);
          node.style.left = (pos.x - half) + 'px';
          node.style.top = (pos.y - half) + 'px';
          if (activeIndex >= 0) {
            node.classList.add(i < activeIndex ? 'visited' : 'dimmed');
          }
        }
      });

      if (activeIndex >= 0 && activeIndex < TOTAL) {
        centerTitle.textContent = arcValues[activeIndex].title;
        centerDesc.textContent = arcValues[activeIndex].desc;
        centerText.classList.add('visible');
      } else {
        centerText.classList.remove('visible');
      }

      scrollDots.forEach(function(dot, i) {
        dot.classList.remove('active', 'visited');
        if (i === activeIndex) dot.classList.add('active');
        else if (activeIndex >= 0 && i < activeIndex) dot.classList.add('visited');
      });

      if (activeIndex >= 0 && scrollHintEl) scrollHintEl.classList.add('hidden');
      else if (scrollHintEl) scrollHintEl.classList.remove('hidden');
    }

    function initArcPositions() {
      arcNodes.forEach(function(n) { n.style.transition = 'none'; });
      currentArcActive = -2;
      updateArc(-1);
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          arcNodes.forEach(function(n) { n.style.transition = ''; });
        });
      });
    }

    function onArcScroll() {
      var rect = valuesContainer.getBoundingClientRect();
      var scrolled = -rect.top;
      var range = valuesContainer.offsetHeight - window.innerHeight;
      if (scrolled < 0) { updateArc(-1); return; }
      if (scrolled > range) return;
      var progress = scrolled / range;
      var intro = 0.10;
      var outro = 0.05;
      if (progress < intro) { updateArc(-1); return; }
      var p = (progress - intro) / (1 - intro - outro);
      var idx = Math.min(Math.floor(p * TOTAL), TOTAL - 1);
      updateArc(idx);
    }

    initArcPositions();
    window.addEventListener('scroll', onArcScroll, { passive: true });
    window.addEventListener('resize', function() { initArcPositions(); onArcScroll(); });
  }

});
