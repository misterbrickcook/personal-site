/* ============================================================
   INTERACTIONS — functional + subtle visual feedback
   ============================================================
   Principle: never open mailto popup. Copy email instead.
   Discovery-based easter eggs live in easter-eggs.js.
   ============================================================ */

(function(){
  var EMAIL = 'mail@alexanderbarzik.de';

  // ===== HELPERS =====

  // Copy email + show inline hint near element
  function copyEmail(el){
    if(navigator.clipboard){
      navigator.clipboard.writeText(EMAIL);
      hint(el, T('hint.emailCopied'));
    } else {
      hint(el, EMAIL, 2500);
    }
  }

  // Hint positioned via body (avoids overflow/z-index clipping)
  function hint(el, text, duration){
    duration = duration || 2000;
    var existing = el._hint;
    if(existing && existing.parentNode) existing.remove();

    var h = document.createElement('span');
    h.textContent = text;
    h.style.cssText = 'position:fixed;background:#0E1517;color:#fff;font-size:12px;font-weight:600;padding:5px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .25s,transform .25s;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);transform:translateY(4px)';
    document.body.appendChild(h);
    el._hint = h;

    var rect = el.getBoundingClientRect();
    var hW = h.offsetWidth;
    var hH = h.offsetHeight;
    var left = rect.left + rect.width / 2 - hW / 2;
    // keep on screen horizontally
    if(left < 8) left = 8;
    if(left + hW > window.innerWidth - 8) left = window.innerWidth - 8 - hW;
    h.style.left = left + 'px';
    // show below if no room above
    if(rect.top < hH + 12){
      h.style.top = (rect.bottom + 8) + 'px';
    } else {
      h.style.top = (rect.top - hH - 8) + 'px';
    }

    requestAnimationFrame(function(){
      h.style.opacity = '1';
      h.style.transform = 'translateY(0)';
    });
    setTimeout(function(){
      h.style.opacity = '0';
      h.style.transform = 'translateY(4px)';
      setTimeout(function(){ h.remove(); }, 250);
    }, duration);
  }

  // Brief scale pop
  function pop(el){
    el.style.transition = 'transform .18s cubic-bezier(.3,1.7,.5,1)';
    el.style.transform = 'scale(1.06)';
    setTimeout(function(){
      el.style.transition = 'transform .3s ease';
      el.style.transform = '';
    }, 180);
  }

  // Count-up animation for a number inside a .lbl element
  function countUp(el){
    if(el.dataset.counted) return;
    el.dataset.counted = '1';
    var text = el.textContent;
    var match = text.match(/^([\d.,+]+)/);
    if(!match) return;
    var raw = match[1].replace('+', '');
    var hasPlus = match[1].includes('+');
    var suffix = text.slice(match[0].length);
    var isFloat = raw.includes(',');
    var target = parseFloat(raw.replace('.', '').replace(',', '.'));
    if(isNaN(target)) return;
    var start = 0;
    var steps = 30;
    var i = 0;
    function tick(){
      i++;
      var progress = i / steps;
      // ease-out
      var ease = 1 - Math.pow(1 - progress, 3);
      var val = Math.round(target * ease);
      if(isFloat){
        val = (target * ease).toFixed(1).replace('.', ',');
      }
      el.textContent = (hasPlus ? '+' : '') + val + suffix;
      if(i < steps) requestAnimationFrame(tick);
      else el.textContent = text; // restore exact original
    }
    el.textContent = (hasPlus ? '+' : '') + '0' + suffix;
    requestAnimationFrame(tick);
  }

  // Scroll to a section by heading text (card h2)
  function scrollToSection(name){
    var cards = document.querySelectorAll('.card-head h2');
    for(var i = 0; i < cards.length; i++){
      if(cards[i].textContent.trim().toLowerCase().includes(name)){
        cards[i].closest('.card').scrollIntoView({behavior:'smooth', block:'start'});
        return true;
      }
    }
    return false;
  }

  // Smooth scroll to contact widget in sidebar
  function scrollToContact(){
    var contact = document.querySelector('.promo');
    if(contact){
      contact.scrollIntoView({behavior: 'smooth', block: 'center'});
      contact.style.transition = 'box-shadow .3s';
      contact.style.boxShadow = '0 0 0 3px var(--blue)';
      setTimeout(function(){
        contact.style.boxShadow = '';
      }, 1500);
    }
  }

  // Switch active nav item visually
  function activateNav(el, container){
    container.querySelectorAll('.nav-item, .bn-item').forEach(function(n){
      n.classList.remove('active');
    });
    el.classList.add('active');
  }

  function openAsk(){
    var p = document.querySelector('#ask-panel');
    if(p) p.classList.add('open');
    setTimeout(function(){
      var inp = document.querySelector('#ap-input');
      if(inp) inp.focus();
    }, 280);
  }


  // ===== ANALYTICS COUNT-UP ON SCROLL =====
  var analyticsObserved = false;
  function observeAnalytics(){
    if(analyticsObserved) return;
    var cells = document.querySelectorAll('.an-cell .lbl');
    if(!cells.length) return;
    if(!('IntersectionObserver' in window)){
      // Fallback: just leave numbers as-is
      return;
    }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.5});
    cells.forEach(function(c){ observer.observe(c); });
    analyticsObserved = true;
  }
  observeAnalytics();


  // ===== FOCUS ITEMS — FADE IN ON SCROLL =====
  (function(){
    var items = document.querySelectorAll('.focus-item');
    if(!items.length) return;
    if(!('IntersectionObserver' in window)){
      items.forEach(function(i){ i.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold: 0.3});
    items.forEach(function(i){ obs.observe(i); });
  })();


  // ===== SITE SEARCH =====
  var searchInput = document.getElementById('desktop-search');
  var searchResults = document.getElementById('search-results');

  // Build search index from page sections
  function buildIndex(){
    var index = [];
    // Cards with headings
    document.querySelectorAll('.card').forEach(function(card){
      var h = card.querySelector('.card-head h2');
      if(!h) return;
      var title = h.textContent.trim();
      var body = (card.querySelector('.card-body') || {}).textContent || '';
      body = body.replace(/\s+/g, ' ').trim();
      index.push({ title: title, snippet: body.slice(0, 120), el: card });
    });
    // Hero
    var hero = document.querySelector('.hero');
    if(hero){
      index.push({ title: T('search.profile'), snippet: T('search.profileSnippet'), el: hero });
    }
    // Studio card
    var studio = document.querySelector('.studio-card');
    if(studio){
      index.push({ title: 'BARZIK STUDIO', snippet: T('search.studioSnippet'), el: studio });
    }
    // Focus items
    document.querySelectorAll('.focus-item').forEach(function(fi){
      var t = (fi.querySelector('.focus-title') || {}).textContent || '';
      var d = (fi.querySelector('.focus-desc') || {}).textContent || '';
      var activeLabel = T('focus.active');
      index.push({ title: t.replace(new RegExp(activeLabel, 'g'), '').trim(), snippet: d.trim(), el: fi });
    });
    // Sidecard contact
    var promo = document.querySelector('.promo');
    if(promo){
      index.push({ title: T('search.contact'), snippet: T('search.contactSnippet'), el: promo });
    }
    return index;
  }

  var siteIndex = buildIndex();

  // Rebuild index on language change
  document.addEventListener('langchange', function(){ siteIndex = buildIndex(); });

  function renderResults(query){
    if(!query || query.length < 2){
      searchResults.classList.remove('open');
      searchResults.innerHTML = '';
      return;
    }
    var q = query.toLowerCase();
    var matches = siteIndex.filter(function(item){
      return item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q);
    });

    var html = '';
    if(matches.length){
      matches.forEach(function(m, i){
        html += '<div class="sr-item" data-idx="' + i + '">'
          + '<div class="sr-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div>'
          + '<div class="sr-text"><div class="sr-title">' + m.title + '</div>'
          + '<div class="sr-sub">' + m.snippet.slice(0, 80) + '</div></div></div>';
      });
    } else {
      html += '<div class="sr-empty">' + T('search.noResults', {q: query}) + '</div>';
    }
    // Always show "Frag Alexander" option
    html += '<div class="sr-item sr-ask">'
      + '<div class="sr-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z"/></svg></div>'
      + '<div class="sr-text"><div class="sr-title">' + T('search.askAlexander', {q: query}) + '</div></div></div>';

    searchResults.innerHTML = html;
    searchResults.classList.add('open');

    // Bind click on results
    searchResults.querySelectorAll('.sr-item').forEach(function(item, idx){
      item.addEventListener('click', function(){
        if(item.classList.contains('sr-ask')){
          openAsk();
          setTimeout(function(){
            var inp = document.querySelector('#ap-input');
            if(inp){ inp.value = query; inp.focus(); }
          }, 400);
        } else {
          var dataIdx = parseInt(item.getAttribute('data-idx'));
          if(matches[dataIdx] && matches[dataIdx].el){
            matches[dataIdx].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            matches[dataIdx].el.style.transition = 'box-shadow .3s';
            matches[dataIdx].el.style.boxShadow = '0 0 0 3px var(--blue)';
            setTimeout(function(){ matches[dataIdx].el.style.boxShadow = ''; }, 1500);
          }
        }
        searchResults.classList.remove('open');
        searchInput.value = '';
        searchInput.blur();
      });
    });
  }

  if(searchInput && searchResults){
    // Prevent the old click handler from opening AI chat
    searchInput.addEventListener('click', function(e){ e.stopPropagation(); });
    searchInput.addEventListener('input', function(){ renderResults(searchInput.value.trim()); });
    searchInput.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        searchResults.classList.remove('open');
        searchInput.blur();
      }
      if(e.key === 'Enter'){
        e.preventDefault();
        var q = searchInput.value.trim();
        if(q){
          openAsk();
          setTimeout(function(){
            var inp = document.querySelector('#ap-input');
            if(inp){ inp.value = q; inp.focus(); }
          }, 400);
          searchResults.classList.remove('open');
          searchInput.value = '';
        }
      }
    });
    // Close on outside click
    document.addEventListener('click', function(e){
      if(!e.target.closest('.search-desktop')){
        searchResults.classList.remove('open');
      }
    });
  }


  // ===== CLICK HANDLER =====
  document.addEventListener('click', function(e){

    // ---- MAILTO LINKS → copy email instead of opening mail client ----
    var mailLink = e.target.closest('a[href^="mailto:"]');
    if(mailLink){
      e.preventDefault();
      copyEmail(mailLink);
      return;
    }

    // ---- TOPBAR NAV ----
    var nav = e.target.closest('.topbar .nav-item');
    if(nav && nav.classList.contains('nav-lang')) return; // handled by i18n.js
    if(nav){
      e.preventDefault();
      activateNav(nav, nav.closest('.nav-icons'));
      var action = nav.getAttribute('data-action');
      if(action === 'home') window.scrollTo({top:0, behavior:'smooth'});
      else if(action === 'network') scrollToSection(T('interests.title').toLowerCase());
      else if(action === 'jobs') scrollToSection(T('exp.title').toLowerCase());
      else if(action === 'messaging') copyEmail(nav);
      else if(action === 'notifications') openAsk();
      return;
    }

    // ---- MOBILE BOTTOM NAV ----
    var bn = e.target.closest('.bottom-nav .bn-item');
    if(bn){
      e.preventDefault();
      activateNav(bn, bn.closest('.bn-row'));
      var action = bn.getAttribute('data-action');
      if(action === 'home') window.scrollTo({top:0, behavior:'smooth'});
      else if(action === 'network') scrollToSection(T('interests.title').toLowerCase());
      else if(action === 'notifications') openAsk();
      else if(action === 'jobs') scrollToSection(T('exp.title').toLowerCase());
      return;
    }

    // ---- "ICH" me-area ----
    if(e.target.closest('.nav-me')){
      e.preventDefault();
      openAsk();
      return;
    }

    // ---- MOBILE HEADER ICONS ----
    if(e.target.closest('.mobile-header .mh-icon')){
      var targetIcon = e.target.closest('.mh-icon');
      var parent = targetIcon.parentElement;
      var icons = parent.querySelectorAll('.mh-icon');
      e.preventDefault();
      if(icons[0] === targetIcon) openAsk();
      else copyEmail(targetIcon);
      return;
    }

    // ---- DESKTOP SEARCH → focus input (search logic handles the rest) ----
    if(e.target.closest('.search-desktop')){
      e.preventDefault();
      var si = document.getElementById('desktop-search');
      if(si) si.focus();
      return;
    }

    // ---- MOBILE SEARCH → AI Chat (no room for dropdown) ----
    if(e.target.closest('.mh-search')){
      e.preventDefault();
      openAsk();
      return;
    }

    // ---- HERO BUTTONS ----
    var heroBtn = e.target.closest('.hero-actions button');
    if(heroBtn){
      var heroAction = heroBtn.getAttribute('data-action');
      if(heroAction === 'message'){
        e.preventDefault();
        copyEmail(heroBtn);
        return;
      }
      if(heroAction === 'more'){
        e.preventDefault();
        scrollToContact();
        return;
      }
    }

    // ---- ANALYTICS CELLS — trigger count-up on click too ----
    var an = e.target.closest('.an-cell');
    if(an){
      e.preventDefault();
      var lbl2 = an.querySelector('.lbl');
      if(lbl2){ lbl2.dataset.counted = ''; countUp(lbl2); }
      return;
    }

    // ---- "218 Kontakte" / "312 Follower" → scroll to contact ----
    if(e.target.matches && e.target.matches('.hero .meta a') && e.target.getAttribute('href') === '#'){
      e.preventDefault();
      scrollToContact();
      return;
    }

    // ---- SKILLS → AI chat with prefill ----
    var skillRow = e.target.closest('.skill-row');
    if(skillRow){
      e.preventDefault();
      var skillName = (skillRow.querySelector('.skill-name') || {}).textContent || '';
      skillName = skillName.trim();
      if(skillName){
        openAsk();
        setTimeout(function(){
          var input = document.querySelector('#ap-input');
          if(input){
            input.value = T('prefill.skill', {name: skillName});
            input.focus();
          }
        }, 400);
      }
      return;
    }

    // ---- CARD FOOT "Alle anzeigen" → contextual action ----
    var cardFoot = e.target.closest('.card-foot');
    if(cardFoot){
      e.preventDefault();
      var footSpan = cardFoot.querySelector('[data-i18n="skills.showAll"]');
      if(footSpan){
        openAsk();
        setTimeout(function(){
          var input = document.querySelector('#ap-input');
          if(input){
            input.value = T('prefill.allSkills');
            input.focus();
          }
        }, 400);
      } else {
        pop(cardFoot);
      }
      return;
    }

    // ---- INTEREST TABS — toggle + switch panels ----
    var tab = e.target.closest('.interest-tabs .it');
    if(tab){
      e.preventDefault();
      tab.parentElement.querySelectorAll('.it').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var idx = tab.getAttribute('data-tab');
      var card = tab.closest('.card');
      if(card && idx !== null){
        card.querySelectorAll('.companies-grid[data-panel]').forEach(function(p){
          p.style.display = p.getAttribute('data-panel') === idx ? '' : 'none';
        });
      }
      return;
    }

    // ---- FOLLOW / UNFOLLOW — visual toggle ----
    var followBtn = e.target.closest('.ci-follow');
    if(followBtn){
      e.preventDefault();
      var isFollowing = followBtn.getAttribute('data-state') === 'following';
      if(isFollowing){
        followBtn.setAttribute('data-state', 'follow');
        followBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg> ' + T('interests.follow');
      } else {
        followBtn.setAttribute('data-state', 'following');
        followBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/></svg> ' + T('interests.following');
      }
      pop(followBtn);
      return;
    }

    // ---- FOCUS ITEMS → AI chat with topic ----
    var focusItem = e.target.closest('.focus-item');
    if(focusItem){
      e.preventDefault();
      var topic = (focusItem.querySelector('.focus-title') || {}).textContent || '';
      topic = topic.trim();
      if(topic){
        openAsk();
        setTimeout(function(){
          var input = document.querySelector('#ap-input');
          if(input){
            input.value = T('prefill.focus', {name: topic});
            input.focus();
          }
        }, 400);
      }
      return;
    }

    // ---- SHARE button — copy link ----
    var ib = e.target.closest('.icon-btn');
    if(ib){
      e.preventDefault();
      var ibI18n = ib.getAttribute('data-i18n-aria') || '';
      if(ibI18n === 'share.label' && navigator.clipboard){
        navigator.clipboard.writeText(window.location.href.split('#')[0]);
        hint(ib, T('hint.linkCopied'));
      }
      pop(ib);
      return;
    }

    // ---- FOOTER LINKS (dummy #) — just ignore ----
    var footerLink = e.target.closest('.footer-links a');
    if(footerLink && footerLink.getAttribute('href') === '#'){
      e.preventDefault();
      return;
    }

    // ---- SIDECARD FOOT "Alle anzeigen" → scroll to contact ----
    if(e.target.closest('.sidecard-foot')){
      e.preventDefault();
      scrollToContact();
      return;
    }

    // ---- Open status → scroll to contact ----
    if(e.target.closest('.role-open')){
      e.preventDefault();
      scrollToContact();
      return;
    }
  });

})();
