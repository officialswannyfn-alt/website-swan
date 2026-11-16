(() => {
  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-toggle');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');
  // Five footer-logo presses reveal KITTY. Keep the header logo as the home link.
  const footerLogo = document.querySelector('.site-footer .brand');
  if (footerLogo) {
    const secretButton = document.createElement('button');
    secretButton.type = 'button';
    secretButton.className = 'brand kitty-trigger';
    secretButton.setAttribute('aria-label', 'SWAN NSFW');
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
      video.addEventListener('ended', dismiss);
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
  // The original gallery owns its existing age prompt; other routes share this one.
  if (!document.body.classList.contains('gallery-page')) {
    let verified = false;
    try { verified = localStorage.getItem('ageVerified') === 'true'; } catch {}
    let modal = document.getElementById('age-warning');
    if (!modal && !verified) {
      modal = document.createElement('div');
      modal.id = 'age-warning'; modal.className = 'age-modal';
      modal.innerHTML = '<div class="age-modal-content"><div class="sh"><span class="sl">Before you enter</span><h2 class="st">18+ Content</h2></div><p style="color:var(--muted);line-height:1.6;margin:20px 0">This website contains adult content. By entering, you confirm that you are at least 18 years of age.</p><div style="display:flex;gap:14px;flex-wrap:wrap"><button id="btn-yes" class="btn-p">Yes, I am 18+</button><button id="btn-no" class="btn-g">No, exit</button></div></div>';
      document.body.append(modal);
    }
    if (modal) {
      modal.classList.toggle('hidden', verified);
      if (!verified) {
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Age confirmation');
        const pageContent = [...document.body.children].filter(el => el !== modal && el.tagName !== 'SCRIPT');
        pageContent.forEach(el => el.inert = true);
        document.body.style.overflow = 'hidden';
        const yes = document.getElementById('btn-yes');
        const no = document.getElementById('btn-no');
        yes.focus();
        modal.addEventListener('keydown', event => {
          if (event.key !== 'Tab') return;
          event.preventDefault();
          (document.activeElement === yes ? no : yes).focus();
        });
        yes.addEventListener('click', () => {
          try { localStorage.setItem('ageVerified', 'true'); } catch {}
          modal.classList.add('hidden'); document.body.style.overflow = '';
          pageContent.forEach(el => el.inert = false);
          document.querySelector('.brand')?.focus();
        });
        no.addEventListener('click', () => location.replace('https://www.google.com'));
      }
    }
  }
})();

// "On the desk" progress: data-stage on .wip-section marks steps done/current.
document.querySelectorAll('.wip-section').forEach(section => {
  const stage = Number(section.dataset.stage) || 1;
  section.querySelectorAll('.wip-steps li').forEach((step, i) => {
    if (i + 1 < stage) step.classList.add('done');
    else if (i + 1 === stage) { step.classList.add('current'); step.setAttribute('aria-current', 'step'); }
  });
});
