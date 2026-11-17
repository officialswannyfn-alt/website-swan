(() => {
  // ---------- Age gate (shared by every page) ----------
  let verified = false;
  try { verified = localStorage.getItem('ageVerified') === 'true'; } catch {}
  if (!verified) {
    const gate = document.createElement('div');
    gate.className = 'age-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'age-title');
    gate.innerHTML = '<div class="age-gate-box"><span class="wordmark">Swan<span>3D art</span></span>'
      + '<h2 id="age-title">This site is 18+</h2>'
      + '<p>It contains adult artwork. By entering, you confirm you are at least 18 years old.</p>'
      + '<div class="intro-actions"><button type="button" class="button" id="btn-yes">I\'m 18 or older</button>'
      + '<button type="button" class="button quiet" id="btn-no">Leave</button></div></div>';
    const pageContent = [...document.body.children].filter(el => el.tagName !== 'SCRIPT');
    document.body.append(gate);
    pageContent.forEach(el => el.inert = true);
    document.documentElement.style.overflow = 'hidden';
    const yes = gate.querySelector('#btn-yes');
    const no = gate.querySelector('#btn-no');
    yes.focus();
    gate.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      (document.activeElement === yes ? no : yes).focus();
    });
    yes.addEventListener('click', () => {
      try { localStorage.setItem('ageVerified', 'true'); } catch {}
      gate.remove();
      document.documentElement.style.overflow = '';
      pageContent.forEach(el => el.inert = false);
    });
    no.addEventListener('click', () => location.replace('https://www.google.com'));
  }

  document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');

  // ---------- On the desk: data-stage fills the progress text and bar ----------
  document.querySelectorAll('.desk[data-stage]').forEach(desk => {
    const steps = (desk.dataset.steps || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!steps.length) return;
    const stage = Math.min(Math.max(Number(desk.dataset.stage) || 1, 1), steps.length);
    const text = desk.querySelector('.desk-text');
    if (text) {
      const strong = document.createElement('strong');
      strong.textContent = steps[stage - 1];
      text.replaceChildren(`Step ${stage} of ${steps.length}: `, strong);
    }
    desk.querySelector('.desk-bar')?.style.setProperty('--progress', (stage / steps.length * 100) + '%');
  });

  // ---------- Lightbox for any .work-grid ----------
  const items = [...document.querySelectorAll('.work-grid [data-full]')];
  if (items.length) {
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Artwork viewer');
    box.innerHTML = '<button type="button" class="lightbox-close">Close</button><figure><img alt=""></figure>'
      + '<div class="lightbox-bar"><span class="count"></span><button type="button" data-step="-1">← Prev</button>'
      + '<button type="button" data-step="1">Next →</button></div>';
    document.body.append(box);
    const img = box.querySelector('img');
    const count = box.querySelector('.count');
    const [prev, next] = box.querySelectorAll('[data-step]');
    let index = 0, trigger;
    const show = i => {
      index = i;
      const thumb = items[i].querySelector('img');
      img.src = items[i].dataset.full;
      img.alt = thumb?.alt || '';
      const title = items[i].closest('figure')?.querySelector('figcaption strong')?.textContent;
      count.textContent = `${title ? title + '  ·  ' : ''}${i + 1} / ${items.length}`;
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
    };
    items.forEach((item, i) => item.addEventListener('click', () => {
      trigger = item; show(i); box.showModal();
      document.documentElement.style.overflow = 'hidden';
    }));
    box.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(index + Number(b.dataset.step))));
    box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
    box.addEventListener('click', e => { if (e.target === box || e.target.tagName === 'FIGURE') box.close(); });
    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' && index > 0) show(index - 1);
      if (e.key === 'ArrowRight' && index < items.length - 1) show(index + 1);
    });
    box.addEventListener('close', () => { document.documentElement.style.overflow = ''; img.removeAttribute('src'); trigger?.focus(); });
  }

  // Five footer-logo presses reveal KITTY. Keep the header logo as the home link.
  const footerLogo = document.querySelector('.site-footer .wordmark');
  if (footerLogo) {
    const secretButton = document.createElement('button');
    secretButton.type = 'button';
    secretButton.className = 'wordmark kitty-trigger';
    secretButton.setAttribute('aria-label', 'Swan');
    secretButton.append(...footerLogo.childNodes);
    footerLogo.replaceWith(secretButton);
    let presses = 0;
    let kittyPopup;

    secretButton.addEventListener('click', () => {
      if (kittyPopup || ++presses < 5) return;
      presses = 0;
      const popup = document.createElement('aside');
      popup.className = 'kitty-popup';
      popup.setAttribute('aria-label', 'KITTY video');
      const video = document.createElement('video');
      video.src = 'images/kitty%20(1).mp4';
      video.setAttribute('aria-label', 'KITTY');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'kitty-close';
      close.setAttribute('aria-label', 'Close KITTY video');
      close.textContent = '×';
      const message = document.createElement('p');
      message.className = 'kitty-message';
      message.setAttribute('role', 'status');
      popup.append(video, close, message);
      kittyPopup = popup;
      document.body.append(popup);

      function dismiss() {
        if (kittyPopup !== popup) return;
        const restoreFocus = popup.contains(document.activeElement);
        kittyPopup = undefined;
        video.pause();
        video.removeAttribute('src');
        video.load();
        popup.remove();
        document.removeEventListener('keydown', onKeydown);
        if (restoreFocus) secretButton.focus();
      }
      function onKeydown(event) {
        if (event.key === 'Escape' && !document.querySelector('dialog[open]')) dismiss();
      }
      close.addEventListener('click', dismiss);
      // Watching KITTY to the very end unlocks the After Hours dating sim.
      video.addEventListener('ended', () => {
        if (kittyPopup !== popup) return;
        const invite = document.createElement('button');
        invite.type = 'button';
        invite.className = 'kitty-invite';
        invite.textContent = 'KITTY wants to hang out after hours ♡';
        invite.addEventListener('click', () => {
          dismiss();
          loadAfterHours().then(() => window.openAfterHours(secretButton)).catch(() => {
            alert('After Hours could not load. Check your connection and try again.');
          });
        });
        message.replaceChildren(invite);
        invite.focus();
      });
      video.addEventListener('error', () => {
        if (kittyPopup === popup) message.textContent = 'KITTY could not load. Close and try again.';
      });
      document.addEventListener('keydown', onKeydown);
      // Called directly from the fifth press so browsers can allow audio playback.
      video.play().catch(() => {
        if (kittyPopup === popup && !video.error) message.textContent = 'Press play to watch KITTY.';
      });
      video.addEventListener('playing', () => { message.textContent = ''; });
    });
  }

  // Loads the After Hours game files only when someone unlocks it.
  let afterHoursLoading;
  function loadAfterHours() {
    if (window.openAfterHours) return Promise.resolve();
    if (afterHoursLoading) return afterHoursLoading;
    const load = (tag, attrs) => new Promise((resolve, reject) => {
      const node = Object.assign(document.createElement(tag), attrs);
      node.onload = resolve;
      node.onerror = reject;
      document.head.append(node);
    });
    afterHoursLoading = load('link', { rel: 'stylesheet', href: 'after-hours/game.css' })
      .then(() => load('script', { src: 'after-hours/story.js' }))
      .then(() => load('script', { src: 'after-hours/game.js' }))
      .catch(error => { afterHoursLoading = undefined; throw error; });
    return afterHoursLoading;
  }
})();
