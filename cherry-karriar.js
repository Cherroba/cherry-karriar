/* ========================================
   Cherry Karriarsida - JavaScript
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

  // --- Shared horizontal swipe helper ---
  // Locks direction early, preventDefault for horizontal to stop page scroll,
  // falls back to native vertical scroll if user swipes up/down.
  function setupSwipe(opts) {
    var el = opts.element;
    if (!el) return;
    var startX = 0, startY = 0;
    var lockedDir = null; // null | 'h' | 'v'
    var HORIZ_THRESHOLD = 40;
    var LOCK_THRESHOLD = 8;

    el.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lockedDir = null;
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      if (!opts.isActive()) return;
      if (lockedDir === 'v') return; // already decided vertical — let browser scroll
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (!lockedDir) {
        if (Math.abs(dx) > LOCK_THRESHOLD || Math.abs(dy) > LOCK_THRESHOLD) {
          lockedDir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        }
      }
      if (lockedDir === 'h') {
        // Prevent the page from scrolling vertically during a horizontal swipe
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    el.addEventListener('touchend', function(e) {
      if (!opts.isActive() || lockedDir !== 'h') return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < HORIZ_THRESHOLD) return;
      var idx = opts.getIndex();
      var total = opts.total();
      if (dx < 0 && idx < total - 1) {
        opts.onChange(idx + 1);
      } else if (dx > 0 && idx > 0) {
        opts.onChange(idx - 1);
      }
    }, { passive: true });

    el.addEventListener('touchcancel', function() {
      lockedDir = null;
    }, { passive: true });
  }

  // --- Hero parallax fade on scroll ---
  var heroWrapper = document.getElementById('heroWrapper');
  var heroContent = document.querySelector('.hero-content');
  var heroSection = document.querySelector('.hero');

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

      var progress = scrolled / range; // 0 to 1
      // Content fades up and scales down slightly
      var opacity = 1 - progress * 1.5; // fades fully before end
      var translateY = -progress * 60; // moves up
      var scale = 1 - progress * 0.08; // subtle shrink
      // Background gets slightly blurred
      var blur = progress * 6;

      heroContent.style.opacity = Math.max(0, opacity);
      heroContent.style.transform = 'translateY(' + translateY + 'px) scale(' + scale + ')';
      heroSection.style.filter = 'blur(' + blur + 'px)';
    }

    window.addEventListener('scroll', rafThrottle(onHeroScroll), { passive: true });
    onHeroScroll();
  }

  // --- Staggered text fade-in for all sections ---
  // Targets: values heading, video heading/subtext, team heading/subtext, jobs heading/subtext
  var fadeSections = [
    { container: '#valuesContainer', selectors: ['.values-heading h2', '.values-heading p'] },
    { container: '#videoContainer', selectors: ['.video-section .section-heading', '.video-section .section-subtext', '.video-section .video-wrapper'] },
    { container: '#teamContainer', selectors: ['.team-section .section-heading', '.team-section .section-subtext'] },
    { container: '#jobsContainer', selectors: ['.jobs-section .section-heading', '.jobs-section .section-subtext'] },
    { container: '#socialContainer', selectors: ['.social-section h3'] }
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

  // Single scroll handler for all section text fades
  function onSectionTextScroll() {
    var fadeEls = document.querySelectorAll('.section-text-fade');
    fadeEls.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      // Match the section-fade trigger (0.6) so all titles fade in consistently
      // when they're actually entering the viewport, instead of pre-faded off-screen.
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
      // Show after scrolling past hero
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

  // Scroll indicators are always visible (CSS animation only, no JS hide)

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
  const isDesktop = window.innerWidth > 768;
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

    animatedElements.forEach(el => {
      // Skip cards on desktop — they're driven by their own scroll-fade handlers
      // (testimonial-card → team-fade, job-card → jobs-fade)
      if (isDesktop && (el.classList.contains('testimonial-card') || el.classList.contains('job-card'))) return;
      observer.observe(el);
    });
  } else {
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }

  // --- Desktop: scroll-driven testimonial fade in/out ---
  if (isDesktop) {
    var teamContainerDesktop = document.getElementById('teamContainer');
    var desktopCards = document.querySelectorAll('.testimonial-card[data-card]');

    if (teamContainerDesktop && desktopCards.length > 0) {
      // Add team-fade class to enable scroll-driven animation
      desktopCards.forEach(function(card) {
        card.classList.add('team-fade');
      });

      var teamSection = teamContainerDesktop.querySelector('.team-section');

      function onDesktopTeamScroll() {
        var rect = teamSection.getBoundingClientRect();
        var ih = window.innerHeight;

        // Not yet entered (section top still well below the viewport)
        if (rect.top > ih * 0.6) {
          desktopCards.forEach(function(card) {
            card.classList.remove('team-visible', 'team-exit');
          });
          return;
        }
        // Mostly past — fade out as section leaves to the top
        if (rect.top < -ih * 0.5) {
          desktopCards.forEach(function(card) {
            card.classList.remove('team-visible');
            card.classList.add('team-exit');
          });
          return;
        }
        // In view — visible
        desktopCards.forEach(function(card) {
          card.classList.add('team-visible');
          card.classList.remove('team-exit');
        });
      }

      window.addEventListener('scroll', rafThrottle(onDesktopTeamScroll), { passive: true });
      onDesktopTeamScroll();
    }
  }

  // --- Desktop: scroll-driven jobs fade in (no fade out — buttons must stay clickable) ---
  if (isDesktop) {
    var jobsContainerDesktop = document.getElementById('jobsContainer');
    var desktopJobCards = document.querySelectorAll('.job-card[data-job]');
    var jobsCta = document.querySelector('.jobs-cta');

    if (jobsContainerDesktop && desktopJobCards.length > 0) {
      desktopJobCards.forEach(function(card) {
        card.classList.add('jobs-fade');
      });
      if (jobsCta) jobsCta.classList.add('jobs-fade');

      var jobsSection = jobsContainerDesktop.querySelector('.jobs-section');

      function onDesktopJobsScroll() {
        var rect = jobsSection.getBoundingClientRect();
        var ih = window.innerHeight;

        if (rect.top > ih * 0.6) {
          desktopJobCards.forEach(function(card) {
            card.classList.remove('jobs-visible');
          });
          if (jobsCta) jobsCta.classList.remove('jobs-visible');
          return;
        }

        // Fade in and stay visible (no exit — CTA must stay clickable)
        desktopJobCards.forEach(function(card) {
          card.classList.add('jobs-visible');
        });
        if (jobsCta) jobsCta.classList.add('jobs-visible');
      }

      window.addEventListener('scroll', rafThrottle(onDesktopJobsScroll), { passive: true });
      onDesktopJobsScroll();
    }
  }

  // --- Mobile scroll-snap carousel: wire dots to track current card ---
  // Uses native CSS scroll-snap for swipe/scroll; IntersectionObserver
  // marks the dot of whichever card is currently centered in the strip.
  function wireCarouselDots(carouselEl, cardSel, dotSel) {
    if (!carouselEl) return;
    var cards = carouselEl.querySelectorAll(cardSel);
    var dots = document.querySelectorAll(dotSel);
    if (!cards.length || !dots.length || !('IntersectionObserver' in window)) return;

    function setActive(idx) {
      dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    }

    var io = new IntersectionObserver(function(entries) {
      // Pick the most-visible entry this tick
      var best = null;
      entries.forEach(function(e) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      });
      if (best && best.intersectionRatio >= 0.6) {
        var idx = Array.prototype.indexOf.call(cards, best.target);
        if (idx >= 0) setActive(idx);
      }
    }, { root: carouselEl, threshold: [0.6, 0.9] });

    cards.forEach(function(c) { io.observe(c); });

    // Click a dot → scroll to the matching card
    dots.forEach(function(dot, i) {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', function() {
        var card = cards[i];
        if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });

    setActive(0);
  }

  if (window.innerWidth <= 768) {
    wireCarouselDots(document.querySelector('.jobs-preview'), '.job-card[data-job]', '.jobs-dot');
  }

  // --- Desktop: scroll-driven video fade in/out ---
  if (isDesktop) {
    var videoContainerDesktop = document.getElementById('videoContainer');
    var videoSection = document.querySelector('.video-section');

    if (videoContainerDesktop && videoSection) {
      videoSection.classList.add('video-fade');

      function onDesktopVideoScroll() {
        var rect = videoSection.getBoundingClientRect();
        var ih = window.innerHeight;

        if (rect.top > ih * 0.6) {
          videoSection.classList.remove('video-visible', 'video-exit');
          return;
        }
        if (rect.top < -ih * 0.5) {
          videoSection.classList.remove('video-visible');
          videoSection.classList.add('video-exit');
          return;
        }
        videoSection.classList.add('video-visible');
        videoSection.classList.remove('video-exit');
      }

      window.addEventListener('scroll', rafThrottle(onDesktopVideoScroll), { passive: true });
      onDesktopVideoScroll();
    }
  }

  // --- Social fade in (works for both desktop and mobile — section is
  //     normal-flow on mobile too, so the same section-rect trigger applies) ---
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
    window.addEventListener('scroll', rafThrottle(() => {
      if (window.scrollY > 50) {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      } else {
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.05)';
      }
    }), { passive: true });
  }

  // --- Mobile testimonials carousel dots (shares wireCarouselDots above) ---
  if (window.innerWidth <= 768) {
    wireCarouselDots(document.querySelector('.team-grid'), '.testimonial-card[data-card]', '.team-dot');
  }

  // --- Rainbow Arc Values Section ---
  const valuesContainer = document.getElementById('valuesContainer');
  const valuesScene = document.getElementById('valuesScene');

  if (valuesContainer && valuesScene) {
    const arcValues = [
      { title: 'Fr\u00e5n ny \u2013 till pro', desc: 'Ingen tidigare erfarenhet kr\u00e4vs. Vi erbjuder en kvalitativ utbildning.' },
      { title: 'Jobba. Utvecklas. P\u00e5verka.', desc: 'M\u00f6jlighet att v\u00e4xa och utvecklas med bolaget.' },
      { title: 'M\u00e5nga m\u00f6jligheter', desc: 'Arbeta i olika st\u00e4der. Flexibilitet vid flytt.' },
      { title: '100% tryggt', desc: 'Kollektivavtal med schyssta villkor. R\u00e4tt l\u00f6n. Trivsel och trygghet.' },
      { title: 'Alltid en rolig kv\u00e4ll', desc: 'Nya m\u00e4nniskor. Nya platser. Du \u00e4r mitt i allt som h\u00e4nder.' },
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
      var cy = valuesScene.offsetHeight * 0.45;
      var rx = 260, ry = 260;
      var angleDeg = 180 - (180 * index / (TOTAL - 1));
      var rad = angleDeg * Math.PI / 180;
      return { x: cx + rx * Math.cos(rad), y: cy - ry * Math.sin(rad) };
    }
    function desktopCenter() {
      return { x: valuesScene.offsetWidth / 2, y: valuesScene.offsetHeight * 0.25 };
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

    var valuesSwipeActive = false;

    function onArcScroll() {
      var rect = valuesContainer.getBoundingClientRect();
      var scrolled = -rect.top;

      // Both mobile and desktop: show first value when section enters view,
      // user navigates manually (swipe on mobile, click on desktop)
      if (scrolled < 0) {
        valuesSwipeActive = false;
        updateArc(-1);
        return;
      }
      if (!valuesSwipeActive) {
        valuesSwipeActive = true;
        updateArc(0);
      }
    }

    initArcPositions();
    window.addEventListener('scroll', rafThrottle(onArcScroll), { passive: true });
    window.addEventListener('resize', function() { initArcPositions(); onArcScroll(); });

    // Update scroll-hint text based on viewport (click on desktop, swipe on mobile)
    if (scrollHintEl) {
      scrollHintEl.textContent = isMob() ? 'Swipa för att utforska' : 'Klicka för att utforska';
      window.addEventListener('resize', function() {
        scrollHintEl.textContent = isMob() ? 'Swipa för att utforska' : 'Klicka för att utforska';
      });
    }

    // Click handlers for arc nodes and dots (desktop & mobile)
    arcNodes.forEach(function(node, i) {
      node.addEventListener('click', function() {
        if (!valuesSwipeActive) valuesSwipeActive = true;
        updateArc(i);
      });
    });
    scrollDots.forEach(function(dot, i) {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', function() {
        if (!valuesSwipeActive) valuesSwipeActive = true;
        updateArc(i);
      });
    });

    // Mobile: swipe handling for values
    if (window.innerWidth <= 768) {
      setupSwipe({
        element: valuesContainer.querySelector('.values-sticky'),
        isActive: function() { return valuesSwipeActive; },
        getIndex: function() { return currentArcActive; },
        total: function() { return TOTAL; },
        onChange: updateArc
      });
    }
  }

});
