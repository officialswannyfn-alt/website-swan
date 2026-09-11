(() => {
  // Set video to a local MP4/WebM path for reliable playback inside the popup.
  // These X previews have failed to embed; retain their links as a fallback.
  const previews = {
    image: { title: 'Image · MALI', image: 'images/Mali.png', alt: 'MALI — image commission example by Swan' },
    emote: { title: 'Emote Animation', video: '', embedEnabled: false, postUrl: 'https://x.com/Swan_Nsfw/status/2087918746241208388' },
    animation: { title: 'Full Animation', video: '', embedEnabled: false, postUrl: 'https://x.com/Swan_Nsfw/status/1970760902967234670' },
  };
  const dialog = document.getElementById('commission-preview');
  if (!dialog) return;
  const media = document.getElementById('preview-media');
  const status = document.getElementById('preview-status');
  const external = document.getElementById('preview-x-link');
  let widgetsPromise;
  let opening = 0;
  let previousOverflow = '';
  let trigger;

  function loadWidgets() {
    if (window.twttr?.widgets?.createTweet) return Promise.resolve(window.twttr);
    if (widgetsPromise) return widgetsPromise;
    widgetsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      const timeout = setTimeout(() => fail(), 15000);
      function fail() {
        clearTimeout(timeout);
        script.remove();
        reject(new Error('X embed could not load'));
      }
      script.onerror = fail;
      script.onload = () => {
        if (!window.twttr?.widgets?.createTweet) return fail();
        clearTimeout(timeout);
        resolve(window.twttr);
      };
      document.head.append(script);
    }).catch(error => { widgetsPromise = undefined; throw error; });
    return widgetsPromise;
  }

  async function openPreview(event) {
    const preview = previews[event.currentTarget.dataset.preview];
    if (!preview) return;
    trigger = event.currentTarget;
    const request = ++opening;
    document.getElementById('preview-title').textContent = preview.title;
    media.replaceChildren();
    status.textContent = '';
    external.hidden = true;
    external.removeAttribute('href');
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';

    if (preview.video) {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', preview.title + ' commission example');
      if (preview.postUrl) {
        external.href = preview.postUrl;
        external.hidden = false;
      }
      video.addEventListener('error', () => {
        if (request === opening) status.textContent = 'This video could not load. You can still watch the example on X.';
      });
      video.src = preview.video;
      media.append(video);
      return;
    }
    if (preview.image) {
      const img = document.createElement('img');
      img.alt = preview.alt;
      img.addEventListener('error', () => {
        if (request === opening) status.textContent = 'This preview could not load. Please try again.';
      });
      img.src = preview.image;
      media.append(img);
      return;
    }
    if (!preview.postUrl) {
      status.textContent = 'An animation sample will be available here soon. Message me to discuss your idea.';
      return;
    }
    const match = preview.postUrl.match(/^https:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(?:[\w]+|i\/web)\/status\/(\d+)(?:[/?#]|$)/);
    if (!match) {
      status.textContent = 'This animation preview is currently unavailable.';
      return;
    }
    external.href = preview.postUrl;
    external.hidden = false;
    if (preview.embedEnabled === false) {
      status.textContent = 'This animation is available on X. The embedded preview is currently unavailable; choose “Open on X” to watch it.';
      return;
    }
    status.textContent = 'Loading animation from X…';
    // Each opening gets its own container so late embeds cannot enter another preview.
    const container = document.createElement('div');
    container.className = 'preview-post';
    media.append(container);
    try {
      const twitter = await loadWidgets();
      if (request !== opening || !dialog.open) return;
      const rendered = await Promise.race([
        twitter.widgets.createTweet(match[1], container, { theme: 'dark', dnt: true, conversation: 'none', width: 550 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Embed timed out')), 20000)),
      ]);
      if (request !== opening || !dialog.open) return;
      if (!rendered) throw new Error('Post unavailable');
      status.textContent = 'Press play in the post to watch the animation.';
    } catch {
      if (request !== opening || !dialog.open) return;
      container.remove();
      status.textContent = 'X could not display this preview here. Use “Open on X” to view the post.';
    }
  }
  document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', openPreview));
  dialog.querySelector('.preview-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    ++opening;
    const video = media.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    media.replaceChildren(); // Removes the iframe and stops any playing video.
    document.body.style.overflow = previousOverflow;
    trigger?.focus();
  });
})();
