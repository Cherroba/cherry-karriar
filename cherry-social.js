/* ========================================
   <cherry-social> — shared social section component
   Used on cherry-karriar.html and cherry-om.html. Renders the
   "Följ oss" section (links + TikTok embed) and wires the mobile
   native-app deep-link behavior. Uses Light DOM so the existing
   .social-* CSS in cherry-karriar.css continues to apply unchanged.
   ======================================== */

(function () {
  // The shared markup — kept byte-for-byte identical to the previous inline
  // version on both pages so the design doesn't change.
  var TEMPLATE_HTML = [
    '<div class="social-scroll-container" id="socialContainer">',
    '  <section class="social-section" id="social">',
    '    <h3>Följ oss</h3>',
    '    <div class="social-icons">',
    '      <a href="https://www.instagram.com/cherryspelgladje/"',
    '         data-app="instagram://user?username=cherryspelgladje"',
    '         target="_blank" rel="noopener" aria-label="Instagram">',
    '        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>',
    '        </svg>',
    '      </a>',
    '      <a href="https://se.linkedin.com/company/cherry-spelgl%C3%A4dje-ab"',
    '         data-app="linkedin://company/cherry-spelgl%C3%A4dje-ab"',
    '         target="_blank" rel="noopener" aria-label="LinkedIn">',
    '        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>',
    '        </svg>',
    '      </a>',
    '      <a href="https://www.facebook.com/cherryspelgladje/"',
    '         data-app="fb://facewebmodal/f?href=https%3A%2F%2Fwww.facebook.com%2Fcherryspelgladje%2F"',
    '         target="_blank" rel="noopener" aria-label="Facebook">',
    '        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '          <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>',
    '        </svg>',
    '      </a>',
    '      <a href="#" rel="noopener" aria-label="X (kommer snart)">',
    '        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
    '        </svg>',
    '      </a>',
    '    </div>',
    '    <div class="tiktok-feed">',
    '      <div class="elfsight-app-815ac92f-7e68-4890-80a8-ed0c57846b64" data-elfsight-app-lazy></div>',
    '    </div>',
    '  </section>',
    '</div>'
  ].join('\n');

  // Tracks whether we've injected the Elfsight loader yet (only need it once
  // per page even if there are multiple <cherry-social> instances).
  var elfsightLoaded = false;
  function injectElfsightScript() {
    if (elfsightLoaded) return;
    elfsightLoaded = true;
    var s = document.createElement('script');
    s.src = 'https://elfsightcdn.com/platform.js';
    s.async = true;
    document.head.appendChild(s);
  }

  // Mobile native-app deep-link handler. The href stays the public web URL
  // so desktop opens the page in a new tab. On a phone we try the app
  // scheme first; if the app isn't installed we open the web URL as a
  // fallback after a short timeout. The visibility check suppresses the
  // fallback when the OS successfully switched to the app.
  function wireAppLinks(root) {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;
    root.querySelectorAll('.social-icons a[data-app]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var appUrl = link.getAttribute('data-app');
        var webUrl = link.getAttribute('href');
        if (!appUrl || !webUrl || webUrl === '#') return;
        e.preventDefault();
        var start = Date.now();
        window.location.href = appUrl;
        setTimeout(function () {
          if (Date.now() - start < 1600 && document.visibilityState !== 'hidden') {
            window.open(webUrl, '_blank', 'noopener');
          }
        }, 800);
      });
    });
  }

  class CherrySocial extends HTMLElement {
    connectedCallback() {
      // Render into Light DOM so the page's existing .social-* CSS applies
      // unchanged — no Shadow DOM, no scoping surprises.
      this.innerHTML = TEMPLATE_HTML;
      injectElfsightScript();
      wireAppLinks(this);
    }
  }

  if (!customElements.get('cherry-social')) {
    customElements.define('cherry-social', CherrySocial);
  }
})();
