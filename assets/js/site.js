/** Aksen Atelier: optional presentation enhancements; never handles Picu/private gallery assets. */
(() => {
  'use strict';
  const closeMenu = () => {
    const details = document.querySelector('.ap-mobile[open]');
    if (details) details.open = false;
  };
  document.querySelectorAll('.ap-mobile__list a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Group adjacent publicly displayed author images without rewriting text.
  const content = document.querySelector('.ap-article__body');
  if (!content) return;
  const children = Array.from(content.children);
  let group = null;
  for (const node of children) {
    const isPhoto = node.matches?.('figure.aksen-import-photo');
    if (isPhoto) {
      if (!group) {
        group = document.createElement('div');
        group.className = 'ap-gallery-group';
        content.insertBefore(group, node);
      }
      group.appendChild(node);
    } else {
      group = null;
    }
  }
  const images = Array.from(content.querySelectorAll('figure.aksen-import-photo img'))
    .filter((img) => /^https:\/\/(?:test\.)?aksen-photo\.pl\/wp-content\/uploads\//.test(img.currentSrc || img.src));
  if (!images.length) return;
  const viewer = document.createElement('div');
  viewer.className = 'ap-lightbox';
  viewer.hidden = true;
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Podgląd zdjęcia');
  viewer.innerHTML = '<button class="ap-lightbox__close" type="button" aria-label="Zamknij">×</button>' +
    '<button class="ap-lightbox__prev" type="button" aria-label="Poprzednie zdjęcie">‹</button>' +
    '<img alt="" decoding="async">' +
    '<button class="ap-lightbox__next" type="button" aria-label="Następne zdjęcie">›</button>';
  document.body.appendChild(viewer);
  const preview = viewer.querySelector('img');
  const close = viewer.querySelector('.ap-lightbox__close');
  const previous = viewer.querySelector('.ap-lightbox__prev');
  const next = viewer.querySelector('.ap-lightbox__next');
  let current = 0;
  let lastFocus = null;
  const show = (index) => {
    current = (index + images.length) % images.length;
    preview.src = images[current].getAttribute('src') || images[current].src;
    preview.alt = images[current].alt || '';
  };
  const exit = () => {
    viewer.hidden = true;
    preview.removeAttribute('src');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };
  images.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Powiększ zdjęcie ${i + 1} z ${images.length}`);
    const open = () => {
      lastFocus = document.activeElement;
      show(i);
      viewer.hidden = false;
      document.body.style.overflow = 'hidden';
      close.focus();
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
  close.addEventListener('click', exit);
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) exit();
  });
  document.addEventListener('keydown', (event) => {
    if (viewer.hidden) return;
    if (event.key === 'Escape') exit();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
})();

