/* ============================================================
   EASTER EGGS — Alexander Barzik
   ============================================================
   1) Click Hero-Avatar  → Ask Alexander (AI chat)
   2) Click Cover-Edit   → Cycles through cover themes
   3) Konami Code        → Terminal with whoami + skills
   4) Click Brand logo   → Pixel scatter animation
   5) Click "Connect"    → Copy email
   ============================================================ */

(function(){

  // ===== 1) ASK ALEXANDER — AI CHAT =====================================

  // Build the panel
  const panel = document.createElement('div');
  panel.id = 'ask-panel';
  panel.innerHTML = `
    <div class="ap-head">
      <div class="ap-title">
        <div class="ap-av"></div>
        <div class="ap-id">
          <strong data-i18n="chat.title">Frag Alexander</strong>
          <span data-i18n="chat.subtitle">\u00b7 echt antwortet er auch (ok: KI tut\u2019s, mit seinen Daten)</span>
        </div>
      </div>
      <button class="ap-close" aria-label="Schlie\u00dfen" data-i18n-aria="chat.close" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="ap-body" id="ap-body">
      <div class="ap-msg ap-bot" data-i18n="chat.greeting">
        Hi \ud83d\udc4b Ich bin Alexander \u2014 bzw. ein KI-Modell, das mit meinen Daten gef\u00fcttert wurde.
        Frag was Du willst: KI, Immobilien, Studium, Bielefeld, Kaffee.
      </div>
      <div class="ap-suggest" id="ap-suggest"></div>
    </div>
    <form class="ap-form" id="ap-form" autocomplete="off">
      <input id="ap-input" placeholder="Frag mich was\u2026" data-i18n-placeholder="chat.placeholder" autocomplete="off" aria-label="Deine Frage" data-i18n-aria="chat.inputLabel">
      <button type="submit" aria-label="Senden" data-i18n-aria="chat.send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </button>
    </form>
  `;
  document.body.appendChild(panel);

  const apBody = panel.querySelector('#ap-body');
  const apForm = panel.querySelector('#ap-form');
  const apInput = panel.querySelector('#ap-input');
  const apClose = panel.querySelector('.ap-close');
  const apSuggest = panel.querySelector('#ap-suggest');

  // Build suggestion chips from translations
  function buildChips(){
    apSuggest.innerHTML =
      '<button class="ap-chip" data-chip="1"></button>' +
      '<button class="ap-chip" data-chip="2"></button>' +
      '<button class="ap-chip" data-chip="3"></button>';
    apSuggest.querySelectorAll('.ap-chip').forEach(function(c){
      var n = c.getAttribute('data-chip');
      c.textContent = T('chat.chip' + n);
      c.setAttribute('data-q', T('chat.chip' + n + 'q'));
    });
  }
  buildChips();

  function openAsk(){
    panel.classList.add('open');
    setTimeout(() => apInput.focus(), 280);
  }
  function closeAsk(){ panel.classList.remove('open'); }

  apClose.addEventListener('click', closeAsk);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && panel.classList.contains('open')) closeAsk();
  });

  async function sendQuestion(q){
    if(!q || !q.trim()) return;
    apInput.value = '';

    // Hide suggestions after first question
    const sug = apBody.querySelector('.ap-suggest');
    if(sug) sug.remove();

    const userMsg = document.createElement('div');
    userMsg.className = 'ap-msg ap-user';
    userMsg.textContent = q;
    apBody.appendChild(userMsg);

    const thinking = document.createElement('div');
    thinking.className = 'ap-msg ap-bot ap-thinking';
    thinking.innerHTML = '<span></span><span></span><span></span>';
    apBody.appendChild(thinking);
    apBody.scrollTop = apBody.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, system: T('chat.systemPrompt') })
      });
      const data = await res.json();
      thinking.remove();
      if(data.error){
        const errMsg = document.createElement('div');
        errMsg.className = 'ap-msg ap-bot';
        errMsg.textContent = data.error;
        apBody.appendChild(errMsg);
      } else {
        const botMsg = document.createElement('div');
        botMsg.className = 'ap-msg ap-bot';
        botMsg.textContent = data.response;
        apBody.appendChild(botMsg);
      }
    } catch(err) {
      thinking.remove();
      const errMsg = document.createElement('div');
      errMsg.className = 'ap-msg ap-bot';
      errMsg.innerHTML = T('chat.error');
      apBody.appendChild(errMsg);
    }
    apBody.scrollTop = apBody.scrollHeight;
  }

  apForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendQuestion(apInput.value);
  });

  // Suggestion chips
  apBody.addEventListener('click', (e) => {
    const chip = e.target.closest('.ap-chip');
    if(chip) sendQuestion(chip.dataset.q);
  });

  // Trigger: clicking the hero avatar
  document.addEventListener('click', (e) => {
    const av = e.target.closest('.hero-avatar');
    if(av){ e.preventDefault(); openAsk(); }
  });

  // Trigger: clicking "Vernetzen" / "Connect" button → copy email
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="connect"]');
    if(!btn) return;
    if(btn.classList.contains('ap-close') || btn.closest('.mh-condensed')) return;
    e.preventDefault();
    if(navigator.clipboard){
      navigator.clipboard.writeText('mail@alexanderbarzik.de');
      const h = document.createElement('span');
      h.textContent = T('hint.emailCopied');
      h.style.cssText = 'position:absolute;top:-32px;left:50%;transform:translateX(-50%) translateY(6px);background:#0E1517;color:#fff;font-size:12px;font-weight:600;padding:5px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .25s,transform .25s;z-index:60;box-shadow:0 4px 12px rgba(0,0,0,.2)';
      const wrap = btn.parentElement;
      if(getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
      wrap.appendChild(h);
      requestAnimationFrame(() => { h.style.opacity = '1'; h.style.transform = 'translateX(-50%) translateY(0)'; });
      setTimeout(() => { h.style.opacity = '0'; setTimeout(() => h.remove(), 250); }, 2000);
    }
  });

  // Update chat panel on language change
  document.addEventListener('langchange', function(){
    buildChips();
  });


  // ===== 2) COVER THEME CYCLE =====================================
  const PIXEL_B = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g fill='rgba(255,255,255,0.16)'><circle cx='12' cy='8' r='3'/><circle cx='12' cy='18' r='3'/><circle cx='12' cy='28' r='3'/><circle cx='12' cy='38' r='3'/><circle cx='12' cy='48' r='3'/><circle cx='12' cy='58' r='3'/><circle cx='22' cy='28' r='3'/><circle cx='32' cy='28' r='3'/><circle cx='42' cy='33' r='3'/><circle cx='42' cy='43' r='3'/><circle cx='42' cy='53' r='3'/><circle cx='32' cy='58' r='3'/><circle cx='22' cy='58' r='3'/></g></svg>\")";
  const COVERS = [
    // 0 — Default: Brand Blue
    null,
    // 1 — Studio: Dark warm with rust accent
    `${PIXEL_B} right 32px center / auto 85% no-repeat, radial-gradient(ellipse at 80% 30%, rgba(196,74,43,.5) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, #1A1815 0%, #2A2520 40%, #0E0D0B 100%)`,
    // 2 — FHDW: Purple academic
    `${PIXEL_B} right 32px center / auto 85% no-repeat, radial-gradient(ellipse at 30% 70%, #5C2D8C 0%, #3A1B5B 40%, #1A0D2E 100%)`,
    // 3 — PropTech: Teal/green
    `${PIXEL_B} right 32px center / auto 85% no-repeat, radial-gradient(ellipse at 30% 70%, #01754F 0%, #004D35 40%, #001D15 100%)`,
    // 4 — Sunrise: Warm gold
    `${PIXEL_B} right 32px center / auto 85% no-repeat, radial-gradient(ellipse at 30% 70%, #915907 0%, #6B4106 40%, #2A1A03 100%)`,
    // 5 — Night: Deep dark
    `${PIXEL_B} right 32px center / auto 85% no-repeat, radial-gradient(ellipse at 30% 70%, #1a2744 0%, #0f1a30 40%, #070d1a 100%)`
  ];
  let coverIdx = 0;
  const heroCover = document.querySelector('.hero-cover');
  const coverEdit = document.querySelector('.cover-edit');
  if(heroCover && coverEdit){
    heroCover.style.transition = 'background .6s ease';
    coverEdit.addEventListener('click', (e) => {
      e.preventDefault();
      coverIdx = (coverIdx + 1) % COVERS.length;
      if(COVERS[coverIdx] === null){
        heroCover.style.background = '';
      } else {
        heroCover.style.background = COVERS[coverIdx];
      }
    });
  }


  // ===== 3) KONAMI CODE → TERMINAL =====================================
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', (e) => {
    const expected = KONAMI[konamiIdx];
    if(e.key === expected || e.key.toLowerCase() === expected.toLowerCase()){
      konamiIdx++;
      if(konamiIdx === KONAMI.length){
        konamiIdx = 0;
        openTerminal();
      }
    } else {
      konamiIdx = 0;
    }
  });

  // Terminal overlay
  const term = document.createElement('div');
  term.id = 'terminal-overlay';
  term.innerHTML = `
    <div class="term-window">
      <div class="term-bar">
        <button class="term-dot term-close" aria-label="Close" data-i18n-aria="terminal.close"></button>
        <span class="term-dot dot-min"></span>
        <span class="term-dot dot-max"></span>
        <span class="term-title">alex@barzik-studio \u2014 zsh</span>
      </div>
      <div class="term-body" id="term-body"></div>
    </div>
  `;
  document.body.appendChild(term);
  const termBody = term.querySelector('#term-body');
  const termClose = term.querySelector('.term-close');

  termClose.addEventListener('click', closeTerminal);
  term.addEventListener('click', (e) => {
    if(e.target === term) closeTerminal();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && term.classList.contains('open')) closeTerminal();
  });

  function closeTerminal(){ term.classList.remove('open'); }

  // Build terminal lines lazily so they pick up current language
  function getTermLines(){
    return [
      { p: '$ ', t: 'whoami' },
      { t: 'alexander.barzik' },
      { t: '' },
      { p: '$ ', t: 'cat ~/.about' },
      { t: T('terminal.line.about1') },
      { t: T('terminal.line.about2') },
      { t: T('terminal.line.about3') },
      { t: '' },
      { p: '$ ', t: 'ls ~/.skills/' },
      { t: T('terminal.line.skills1') },
      { t: T('terminal.line.skills2') },
      { t: T('terminal.line.skills3') },
      { t: '' },
      { p: '$ ', t: 'history | tail -3' },
      { t: T('terminal.line.history1') },
      { t: T('terminal.line.history2') },
      { t: T('terminal.line.history3') },
      { t: '' },
      { p: '$ ', t: '_', blink: true }
    ];
  }

  let isTyping = false;
  async function openTerminal(){
    if(isTyping) return;
    isTyping = true;
    termBody.innerHTML = '';
    term.classList.add('open');
    const lines = getTermLines();
    for(const line of lines){
      if(!term.classList.contains('open')) break;
      await typeLine(line);
    }
    isTyping = false;
  }

  function typeLine(line){
    return new Promise(resolve => {
      const row = document.createElement('div');
      row.className = 'term-row';
      if(line.p){
        const prompt = document.createElement('span');
        prompt.className = 'term-prompt';
        prompt.textContent = line.p;
        row.appendChild(prompt);
      }
      const text = document.createElement('span');
      text.className = 'term-text';
      if(line.blink) text.classList.add('term-cursor');
      row.appendChild(text);
      termBody.appendChild(row);
      termBody.scrollTop = termBody.scrollHeight;

      const str = line.t;
      let i = 0;
      const speed = line.p ? 50 : 8;
      function step(){
        if(!term.classList.contains('open')){ resolve(); return; }
        if(i < str.length){
          text.textContent += str[i];
          i++;
          setTimeout(step, speed + Math.random() * (line.p ? 30 : 10));
        } else {
          setTimeout(resolve, line.p ? 200 : 50);
        }
      }
      step();
    });
  }


  // ===== 4) LOGO SCATTER ANIMATION =====================================
  const brand = document.querySelector('.brand');
  if(brand){
    brand.style.cursor = 'pointer';
    brand.setAttribute('tabindex', '0');
    brand.setAttribute('role', 'button');
    brand.setAttribute('aria-label', 'barzik');
    let scattering = false;
    function scatter(){
      if(scattering) return;
      scattering = true;
      const circles = brand.querySelectorAll('svg circle');
      circles.forEach((c, i) => {
        const x = (Math.random() - 0.5) * 24;
        const y = (Math.random() - 0.5) * 24;
        const r = (Math.random() - 0.5) * 90;
        c.style.transition = 'transform .35s cubic-bezier(.3,1.7,.5,1)';
        c.style.transformOrigin = '50% 50%';
        c.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
      });
      setTimeout(() => {
        circles.forEach((c, i) => {
          setTimeout(() => {
            c.style.transform = '';
          }, i * 25);
        });
        setTimeout(() => { scattering = false; }, 400 + circles.length * 25);
      }, 350);
    }
    brand.addEventListener('click', scatter);
    brand.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); scatter(); }
    });
  }

})();
