/* ========================================
   Cherry Karriarsida - JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

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

    window.addEventListener('scroll', onHeroScroll, { passive: true });
    onHeroScroll();
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
      // Skip testimonial cards on desktop — handled by scroll-driven fade
      if (isDesktop && el.classList.contains('testimonial-card')) return;
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

      function onDesktopTeamScroll() {
        var rect = teamContainerDesktop.getBoundingClientRect();
        var scrolled = -rect.top;
        var range = teamContainerDesktop.offsetHeight - window.innerHeight;

        if (scrolled < 0 || scrolled > range) {
          desktopCards.forEach(function(card) {
            card.classList.remove('team-visible', 'team-exit');
          });
          return;
        }

        var progress = scrolled / range; // 0 to 1
        // 0–0.3: fade in, 0.3–0.85: hold, 0.85–1.0: fade out
        if (progress < 0.3) {
          desktopCards.forEach(function(card) {
            card.classList.add('team-visible');
            card.classList.remove('team-exit');
          });
        } else if (progress > 0.85) {
          desktopCards.forEach(function(card) {
            card.classList.remove('team-visible');
            card.classList.add('team-exit');
          });
        } else {
          desktopCards.forEach(function(card) {
            card.classList.add('team-visible');
            card.classList.remove('team-exit');
          });
        }
      }

      window.addEventListener('scroll', onDesktopTeamScroll, { passive: true });
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

      function onDesktopJobsScroll() {
        var rect = jobsContainerDesktop.getBoundingClientRect();
        var scrolled = -rect.top;
        var range = jobsContainerDesktop.offsetHeight - window.innerHeight;

        if (scrolled < 0) {
          desktopJobCards.forEach(function(card) {
            card.classList.remove('jobs-visible');
          });
          if (jobsCta) jobsCta.classList.remove('jobs-visible');
          return;
        }

        // Fade in and stay visible
        desktopJobCards.forEach(function(card) {
          card.classList.add('jobs-visible');
        });
        if (jobsCta) jobsCta.classList.add('jobs-visible');
      }

      window.addEventListener('scroll', onDesktopJobsScroll, { passive: true });
      onDesktopJobsScroll();
    }
  }

  // --- Mobile: scroll-driven jobs cards ---
  var jobsContainer = document.getElementById('jobsContainer');
  var jobCards = document.querySelectorAll('.job-card[data-job]');
  var currentJobCard = -1;

  function updateJobCard(index) {
    if (index === currentJobCard) return;
    currentJobCard = index;

    jobCards.forEach(function(card, i) {
      card.classList.remove('card-active', 'card-exit');
      if (index >= 0) {
        if (i === index) {
          card.classList.add('card-active');
        } else if (i < index) {
          card.classList.add('card-exit');
        }
      }
    });
  }

  function onJobsScroll() {
    if (!jobsContainer || window.innerWidth > 768) return;
    var rect = jobsContainer.getBoundingClientRect();
    var scrolled = -rect.top;
    var range = jobsContainer.offsetHeight - window.innerHeight;
    if (scrolled < 0) { updateJobCard(-1); return; }
    if (scrolled > range) { return; }

    var progress = scrolled / range;
    var intro = 0.1;
    var total = jobCards.length;

    if (progress < intro) {
      updateJobCard(-1);
    } else {
      var p = (progress - intro) / (1 - intro);
      var idx = Math.min(Math.floor(p * total), total - 1);
      updateJobCard(idx);
    }
  }

  if (jobsContainer && jobCards.length > 0 && window.innerWidth <= 768) {
    updateJobCard(-1);
    window.addEventListener('scroll', onJobsScroll, { passive: true });
    window.addEventListener('resize', function() {
      if (window.innerWidth <= 768) {
        onJobsScroll();
      }
    });
  }

  // --- Desktop: scroll-driven video fade in/out ---
  if (isDesktop) {
    var videoContainerDesktop = document.getElementById('videoContainer');
    var videoSection = document.querySelector('.video-section');

    if (videoContainerDesktop && videoSection) {
      videoSection.classList.add('video-fade');

      function onDesktopVideoScroll() {
        var rect = videoContainerDesktop.getBoundingClientRect();
        var scrolled = -rect.top;
        var range = videoContainerDesktop.offsetHeight - window.innerHeight;

        if (scrolled < 0 || scrolled > range) {
          videoSection.classList.remove('video-visible', 'video-exit');
          return;
        }

        var progress = scrolled / range;
        if (progress < 0.2) {
          videoSection.classList.add('video-visible');
          videoSection.classList.remove('video-exit');
        } else if (progress > 0.85) {
          videoSection.classList.remove('video-visible');
          videoSection.classList.add('video-exit');
        } else {
          videoSection.classList.add('video-visible');
          videoSection.classList.remove('video-exit');
        }
      }

      window.addEventListener('scroll', onDesktopVideoScroll, { passive: true });
      onDesktopVideoScroll();
    }
  }

  // --- Desktop: scroll-driven social fade in (no fade out — last section) ---
  if (isDesktop) {
    var socialContainerDesktop = document.getElementById('socialContainer');
    var socialSection = document.querySelector('.social-section');

    if (socialContainerDesktop && socialSection) {
      socialSection.classList.add('social-fade');

      function onDesktopSocialScroll() {
        var rect = socialContainerDesktop.getBoundingClientRect();
        var scrolled = -rect.top;

        if (scrolled < 0) {
          socialSection.classList.remove('social-visible');
          return;
        }

        socialSection.classList.add('social-visible');
      }

      window.addEventListener('scroll', onDesktopSocialScroll, { passive: true });
      onDesktopSocialScroll();
    }
  }


  // --- Mobile: scroll-driven social fade in ---
  var socialContainerMobile = document.getElementById('socialContainer');
  var socialSectionMobile = document.querySelector('.social-section');

  if (socialContainerMobile && socialSectionMobile && window.innerWidth <= 768) {
    socialSectionMobile.classList.add('social-fade');

    function onMobileSocialScroll() {
      if (window.innerWidth > 768) return;
      var rect = socialContainerMobile.getBoundingClientRect();
      var scrolled = -rect.top;

      if (scrolled < 0) {
        socialSectionMobile.classList.remove('social-visible');
        return;
      }

      socialSectionMobile.classList.add('social-visible');
    }

    window.addEventListener('scroll', onMobileSocialScroll, { passive: true });
    onMobileSocialScroll();
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

  // --- Testimonial Cards: scroll-driven on mobile ---
  var teamContainer = document.getElementById('teamContainer');
  var teamCards = document.querySelectorAll('.testimonial-card[data-card]');
  var teamDots = document.querySelectorAll('.team-dot');
  var currentTeamCard = -1;

  function updateTeamCard(index) {
    if (index === currentTeamCard) return;
    currentTeamCard = index;

    teamCards.forEach(function(card, i) {
      card.classList.remove('card-active', 'card-exit');
      if (index >= 0) {
        if (i === index) {
          card.classList.add('card-active');
        } else if (i < index) {
          card.classList.add('card-exit');
        }
      }
    });

    teamDots.forEach(function(dot, i) {
      dot.classList.toggle('active', index >= 0 && i === index);
    });
  }

  function onTeamScroll() {
    if (!teamContainer || window.innerWidth > 768) return;
    var rect = teamContainer.getBoundingClientRect();
    var scrolled = -rect.top;
    var range = teamContainer.offsetHeight - window.innerHeight;
    if (scrolled < 0) { updateTeamCard(-1); return; }
    if (scrolled > range) return;

    var progress = scrolled / range; // 0 to 1
    // 0–0.1: empty intro, 0.1–0.8: cycle cards, 0.8–1.0: empty outro
    var intro = 0.1;
    var outro = 0.2;
    var total = teamCards.length;

    if (progress < intro) {
      updateTeamCard(-1);
    } else if (progress > (1 - outro)) {
      updateTeamCard(total);
    } else {
      var p = (progress - intro) / (1 - intro - outro);
      var idx = Math.min(Math.floor(p * total), total - 1);
      updateTeamCard(idx);
    }
  }

  if (teamContainer && teamCards.length > 0 && window.innerWidth <= 768) {
    updateTeamCard(-1);
    window.addEventListener('scroll', onTeamScroll, { passive: true });
    window.addEventListener('resize', function() {
      if (window.innerWidth <= 768) {
        onTeamScroll();
      }
    });
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
