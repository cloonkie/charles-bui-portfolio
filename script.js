const currentFile = window.location.pathname.split('/').pop() || 'index.html';

// Resume tabs
document.querySelectorAll('.resume-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.resume-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.resume-tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentFile) link.classList.add('active');
});

(function () {
  const finePointer = window.matchMedia('(any-pointer: fine)').matches;
  const coarseOnly = window.matchMedia('(pointer: coarse)').matches && !finePointer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (coarseOnly || reducedMotion) return;

  const dot = document.createElement('div');
  const label = document.createElement('div');
  const pen = document.createElement('div');

  dot.className = 'custom-cursor-dot';
  label.className = 'custom-cursor-label';
  pen.className = 'custom-cursor-pen';
  dot.setAttribute('aria-hidden', 'true');
  label.setAttribute('aria-hidden', 'true');
  pen.setAttribute('aria-hidden', 'true');
  pen.innerHTML = [
    '<svg viewBox="0 0 24 24">',
    '<path d="M12 20h9"/>',
    '<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    '</svg>',
  ].join('');

  document.documentElement.classList.add('custom-cursor-enabled');
  document.body.append(dot, label, pen);

  let mouseX = -100;
  let mouseY = -100;

  const interactiveSelector = [
    '[data-cursor]',
    '[data-cursor-toggle]',
    'a[href]',
    'button',
    '[role="button"]',
    'input[type="button"]',
    'input[type="submit"]',
    'select',
    'summary',
    '.book-page',
  ].join(',');

  const penSelector = '[data-cursor="pen"], textarea, [contenteditable="true"]';
  const contrastSelector = '[data-cursor-contrast]';

  function getLabelText(element) {
    const toggle = element.closest('[data-cursor-toggle]');
    if (toggle) {
      return toggle.getAttribute('aria-pressed') === 'true' ? 'off' : 'on';
    }

    const explicit = element.closest('[data-cursor]');
    if (explicit) {
      const value = explicit.getAttribute('data-cursor');
      if (value === '' || value === 'pen') return null;
      if (value === 'expand-collapse') {
        return explicit.getAttribute('aria-expanded') === 'true' ? 'collapse' : 'expand';
      }
      return value;
    }

    if (element.closest('select')) return 'select';
    if (element.closest('.book-page')) return 'expand';

    const link = element.closest('a[href]');
    if (link) {
      const url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin ? 'open' : 'visit';
    }

    return 'view';
  }

  function syncState(target) {
    const element = target instanceof Element
      ? target
      : document.elementFromPoint(mouseX, mouseY);

    const contrast = element && element.closest(contrastSelector);
    document.body.classList.toggle('custom-cursor-contrast', Boolean(contrast));

    const penTarget = element && element.closest(penSelector);
    document.body.classList.toggle('custom-cursor-pen-mode', Boolean(penTarget));
    if (penTarget) {
      document.body.classList.remove('custom-cursor-hover');
      return;
    }

    const interactive = element && element.closest(interactiveSelector);
    if (!interactive) {
      document.body.classList.remove('custom-cursor-hover');
      return;
    }

    const text = getLabelText(interactive);
    if (text === null) {
      document.body.classList.remove('custom-cursor-hover');
      return;
    }

    label.textContent = text;
    document.body.classList.add('custom-cursor-hover');
  }

  function moveCursor(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.opacity = '';
    syncState(event.target);
  }

  function render() {
    const transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    dot.style.transform = transform;
    label.style.transform = transform;
    pen.style.transform = transform;
    window.requestAnimationFrame(render);
  }

  window.refreshCustomCursor = syncState;

  document.addEventListener('pointermove', moveCursor, { passive: true, capture: true });
  document.addEventListener('wheel', moveCursor, { passive: true, capture: true });
  document.addEventListener('pointerdown', function () {
    document.body.classList.add('custom-cursor-clicking');
  }, { passive: true });

  function endClick() {
    document.body.classList.remove('custom-cursor-clicking');
    syncState();
  }

  document.addEventListener('pointerup', endClick, { passive: true });
  document.addEventListener('pointercancel', endClick, { passive: true });
  document.addEventListener('mouseleave', function () {
    dot.style.opacity = '0';
    document.body.classList.remove('custom-cursor-contrast');
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity = '';
    syncState();
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) syncState();
  });

  render();
})();
