/* ============================================================
   i18n ENGINE — language detection, DOM translation, toggle
   ============================================================ */
(function(){
  var STORE_KEY = 'lang';
  var DEFAULT = 'de';
  var SUPPORTED = ['de', 'en'];

  // Detect language: URL param > localStorage > default
  function detectLang(){
    var params = new URLSearchParams(window.location.search);
    var p = params.get('lang');
    if(p && SUPPORTED.indexOf(p) !== -1){
      localStorage.setItem(STORE_KEY, p);
      return p;
    }
    var stored = localStorage.getItem(STORE_KEY);
    if(stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    return DEFAULT;
  }

  var currentLang = detectLang();

  // T(key, {var: val}) — get translation
  window.T = function(key, vars){
    var dict = (window.TRANSLATIONS || {})[currentLang] || {};
    var str = dict[key];
    if(str === undefined){
      var fb = (window.TRANSLATIONS || {})['de'] || {};
      str = fb[key] || key;
    }
    if(vars){
      Object.keys(vars).forEach(function(k){
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  };

  window.getLang = function(){ return currentLang; };

  // Apply all translations to DOM
  function applyDOM(){
    document.documentElement.lang = currentLang;

    // data-i18n → textContent (skip elements with data-duration-since)
    document.querySelectorAll('[data-i18n]:not([data-duration-since])').forEach(function(el){
      el.textContent = T(el.getAttribute('data-i18n'));
    });

    // data-i18n-html → innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){
      el.innerHTML = T(el.getAttribute('data-i18n-html'));
    });

    // data-i18n-placeholder → placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      el.placeholder = T(el.getAttribute('data-i18n-placeholder'));
    });

    // data-i18n-aria → aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el){
      el.setAttribute('aria-label', T(el.getAttribute('data-i18n-aria')));
    });

    // Toggle button text
    document.querySelectorAll('.lang-toggle').forEach(function(btn){
      btn.textContent = currentLang === 'de' ? 'EN' : 'DE';
    });

    // Follow buttons — restore from data-state
    document.querySelectorAll('[data-action="follow"]').forEach(function(btn){
      var state = btn.getAttribute('data-state');
      var svg_follow = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg> ';
      var svg_following = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/></svg> ';
      if(state === 'following'){
        btn.innerHTML = svg_following + T('interests.following');
      } else {
        btn.innerHTML = svg_follow + T('interests.follow');
      }
    });

    // Durations
    applyDurations();

    // Remove FOUC class
    document.documentElement.classList.remove('i18n-loading');
  }

  // Compute and append duration strings
  function applyDurations(){
    var yrLabel = T('duration.yr');
    var moLabel = T('duration.mo');
    function format(years, months){
      var y = years === 0 ? '' : years + yrLabel;
      var m = months === 0 ? '' : months + moLabel;
      return [y, m].filter(Boolean).join(' ');
    }
    document.querySelectorAll('[data-duration-since]').forEach(function(el){
      var since = el.getAttribute('data-duration-since');
      var key = el.getAttribute('data-i18n');
      if(!key) return;
      var base = T(key);
      var start = new Date(since);
      var now = new Date();
      var months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if(now.getDate() < start.getDate()) months--;
      if(months < 0) months = 0;
      var y = Math.floor(months / 12);
      var m = months % 12;
      var dur = format(y, m);
      el.textContent = base + (dur ? ' \u00b7 ' + dur : '');
    });
  }

  // Toggle language
  function toggleLang(){
    currentLang = currentLang === 'de' ? 'en' : 'de';
    localStorage.setItem(STORE_KEY, currentLang);
    applyDOM();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
  }

  // Bind toggle buttons
  document.addEventListener('click', function(e){
    if(e.target.closest('.lang-toggle') || e.target.closest('.nav-lang')){
      e.preventDefault();
      toggleLang();
    }
  });

  // Initial apply
  applyDOM();

  // Dispatch initial event so other scripts can set up
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
})();
