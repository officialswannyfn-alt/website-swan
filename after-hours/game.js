/* After Hours engine. Story and giveaway settings live in story.js; you shouldn't need to edit this file. */
(() => {
  const S = window.AFTER_HOURS;
  if (!S || window.openAfterHours) return;

  const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
  let root, art, artBoth, speakerEl, textEl, choicesEl, nextBtn, trigger, typing;
  let state;

  const el = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  };
  const fill = text => String(text).replaceAll('{name}', state?.name || 'you');

  // Prize code: same recipe as check-code.cjs, so Swan can verify it.
  async function prizeCode(handle, route) {
    const data = new TextEncoder().encode(`after-hours|${S.season}|${handle.toLowerCase()}|${route}`);
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
    const hex = [...hash.slice(0, 4)].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `${route.toUpperCase()}-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
  }

  function build() {
    root = el('dialog', 'ah');
    root.setAttribute('aria-label', S.title);
    root.innerHTML = `
      <div class="ah-frame">
        <div class="ah-art"><div class="ah-both"><img alt=""><img alt=""></div><img class="ah-portrait" alt=""></div>
        <div class="ah-side">
          <header class="ah-top"><span class="ah-title"></span><button type="button" class="ah-close">Close</button></header>
          <div class="ah-stage" aria-live="polite"></div>
        </div>
      </div>`;
    document.body.append(root);
    art = root.querySelector('.ah-portrait');
    artBoth = root.querySelector('.ah-both');
    const [a, b] = artBoth.querySelectorAll('img');
    a.src = S.characters.kitty.poses.default;
    b.src = S.characters.miyabi.poses.default;
    root.querySelector('.ah-title').textContent = S.title;
    root.querySelector('.ah-close').addEventListener('click', () => root.close());
    root.addEventListener('close', () => { document.documentElement.style.overflow = ''; trigger?.focus?.(); });
  }

  function stage() { return root.querySelector('.ah-stage'); }

  function showArt(who, pose) {
    if (!who) { art.hidden = true; artBoth.hidden = false; return; }
    const c = S.characters[who];
    const src = c.poses[pose] || c.poses[state.pose?.[who]] || c.poses.default;
    if (pose && c.poses[pose]) state.pose = { ...state.pose, [who]: pose };
    artBoth.hidden = true; art.hidden = false;
    if (!art.src.endsWith(src)) {
      art.classList.add('ah-swap');
      const img = new Image();
      img.onload = img.onerror = () => { art.src = src; art.alt = c.name; art.classList.remove('ah-swap'); };
      img.src = src;
    }
  }

  // ---------- Title screen ----------
  function titleScreen() {
    state = { name: '', handle: '', route: null, love: 0, pose: {} };
    showArt(null);
    const s = stage();
    s.replaceChildren();
    const box = el('div', 'ah-card');
    box.append(el('p', 'ah-kicker', 'You found a secret.'), el('h2', '', S.title));
    box.append(el('p', 'ah-muted', 'A tiny dating sim hidden in Swan\'s site. About ten minutes. Choose carefully.'));
    if (S.giveawayOpen) {
      box.append(el('p', 'ah-prize', `The first person to reach a true ending and DM Swan their code wins ${S.prize}.`));
    }
    const form = el('form', 'ah-form');
    const label = el('label', '', S.giveawayOpen ? 'Your X handle (it goes into your prize code)' : 'What should they call you?');
    const input = el('input');
    input.name = 'handle'; input.autocomplete = 'off'; input.spellcheck = false; input.maxLength = 16;
    input.placeholder = S.giveawayOpen ? '@yourname' : 'Your name';
    label.htmlFor = input.id = 'ah-handle';
    const err = el('p', 'ah-error');
    err.setAttribute('role', 'alert');
    const go = el('button', 'button', 'Start');
    go.type = 'submit';
    form.append(label, input, err, go);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const raw = input.value.trim().replace(/^@/, '');
      if (S.giveawayOpen && !HANDLE_RE.test(raw)) { err.textContent = 'Enter a real X handle: letters, numbers and _ only.'; input.focus(); return; }
      if (!raw) { err.textContent = 'Give them a name to call you.'; input.focus(); return; }
      state.handle = raw;
      state.name = raw.slice(0, 20);
      run('intro');
    });
    box.append(form);
    s.append(box);
    setTimeout(() => input.focus(), 50);
  }

  // ---------- Playing ----------
  // Go to a named scene from story.js.
  function run(sceneId) {
    const steps = S.scenes[sceneId];
    if (!steps) return titleScreen();
    if (sceneId.startsWith('kitty')) state.route = 'kitty';
    if (sceneId.startsWith('miyabi')) state.route = 'miyabi';
    play(steps);
  }

  // Play a list of steps in order, then call onDone.
  function play(steps, onDone) {
    let i = 0;
    const next = () => {
      if (i >= steps.length) return onDone && onDone();
      const step = steps[i++];
      if (step.goto) return run(step.goto);
      if (step.ending) return finish(step.ending);
      if (step.choose) return choose(step.choose, next);
      line(step, next);
    };
    next();
  }

  function dialogShell() {
    clearInterval(typing);
    const s = stage();
    s.replaceChildren();
    const box = el('div', 'ah-box');
    speakerEl = el('p', 'ah-speaker');
    textEl = el('p', 'ah-text');
    choicesEl = el('div', 'ah-choices');
    box.append(speakerEl, textEl, choicesEl);
    s.append(box);
    return box;
  }

  function line(step, done) {
    const box = dialogShell();
    if (step.say) showArt(step.say, step.pose);
    else if (state.route) showArt(state.route);
    speakerEl.textContent = step.say ? S.characters[step.say].name : '';
    speakerEl.hidden = !step.say;
    textEl.classList.toggle('ah-narration', !step.say);
    const full = fill(step.text);
    state.last = { say: step.say, text: full };
    let n = 0;
    textEl.textContent = '';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) n = full.length;
    textEl.textContent = full.slice(0, n);
    typing = setInterval(() => {
      n += 2;
      textEl.textContent = full.slice(0, n);
      if (n >= full.length) clearInterval(typing);
    }, 18);
    nextBtn = el('button', 'ah-next', 'Next');
    nextBtn.type = 'button';
    let advanced = false; // a fast double-click must not skip the next step
    nextBtn.addEventListener('click', () => {
      if (advanced) return;
      if (textEl.textContent.length < full.length) { clearInterval(typing); textEl.textContent = full; return; }
      advanced = true;
      done();
    });
    box.append(nextBtn);
    box.addEventListener('click', e => { if (e.target === box || e.target === textEl) nextBtn.click(); });
    nextBtn.focus();
  }

  function choose(options, done) {
    const box = dialogShell();
    nextBtn = null;
    // Keep the last line on screen so the player can see what they're answering.
    const last = state.last || {};
    speakerEl.textContent = last.say ? S.characters[last.say].name : '';
    speakerEl.hidden = !last.say;
    textEl.textContent = last.text || 'What do you do?';
    textEl.classList.toggle('ah-narration', !last.say);
    let picked = false;
    options.forEach(opt => {
      const b = el('button', 'ah-choice', fill(opt.text));
      b.type = 'button';
      b.addEventListener('click', () => {
        if (picked) return;
        picked = true;
        state.love += opt.love || 0;
        if (opt.goto) return run(opt.goto);
        play(opt.reply || [], done);
      });
      choicesEl.append(b);
    });
    box.querySelector('.ah-choice')?.focus();
  }

  function finish(route) {
    const kind = state.love >= S.endings.true ? 'true' : state.love >= S.endings.okay ? 'okay' : 'bad';
    const ending = S.results[route][kind];
    play(ending.lines, () => endScreen(route, kind, ending.title));
  }

  async function endScreen(route, kind, title) {
    const s = stage();
    s.replaceChildren();
    const box = el('div', 'ah-card');
    const names = { true: 'True ending', okay: 'Okay ending', bad: 'Bad ending' };
    box.append(el('p', 'ah-kicker', `${names[kind]} · ${S.characters[route].name}`), el('h2', '', title));
    if (kind === 'true') {
      if (S.giveawayOpen) {
        let code = '';
        try { code = await prizeCode(state.handle, route); } catch { code = ''; }
        if (code) {
          const c = el('div', 'ah-code');
          c.append(el('span', '', 'Your prize code'), el('strong', '', code), el('small', '', `For @${state.handle}`));
          box.append(c);
          const p = el('p', 'ah-muted', '');
          p.append('Screenshot this and DM the code to ');
          const a = el('a', 'link', '@Swan_Nsfw');
          a.href = S.contact; a.target = '_blank'; a.rel = 'noopener noreferrer';
          p.append(a, '. First valid DM wins. Codes only work for the handle you entered.');
          box.append(p);
        } else {
          box.append(el('p', 'ah-muted', 'Your browser couldn\'t make a code here. Open the site over https and play again.'));
        }
      } else {
        box.append(el('p', 'ah-muted', 'Someone already claimed the prize, but this ending is all yours. Thanks for playing.'));
      }
    } else {
      box.append(el('p', 'ah-muted', kind === 'okay'
        ? 'Close. There\'s a better ending if you really pay attention to what they care about.'
        : 'Ouch. Try again, and listen to what they actually want.'));
    }
    const actions = el('div', 'intro-actions');
    const again = el('button', 'button', 'Play again');
    again.type = 'button';
    again.addEventListener('click', titleScreen);
    const close = el('button', 'button quiet', 'Close');
    close.type = 'button';
    close.addEventListener('click', () => root.close());
    actions.append(again, close);
    box.append(actions);
    s.append(box);
    again.focus();
  }

  window.openAfterHours = from => {
    trigger = from || document.activeElement;
    if (!root) build();
    titleScreen();
    root.showModal();
    document.documentElement.style.overflow = 'hidden';
  };
})();
