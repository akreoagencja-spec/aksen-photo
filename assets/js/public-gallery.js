/**
 * Aksen Atelier public gallery lightbox.
 * 0 dependencies. Nothing runs on Picu collection pages.
 * Without JavaScript each gallery image remains a normal link.
 */
(() => {
  "use strict";

  let dialog = null;
  let photo = null;
  let caption = null;
  let links = [];
  let current = -1;
  let lastFocus = null;
  let startX = null;

  const make = (name, className, value) => {
    const el = document.createElement(name);
    el.className = className;
    if (value) el.textContent = value;
    return el;
  };

  const updatePhoto = () => {
    if (!dialog || current < 0 || current >= links.length) return;
    const link = links[current];
    const img = link.querySelector("img");
    const figcaption = link.closest("figure")?.querySelector("figcaption");
    const src = link.getAttribute("href");

    if (!src || !/^https?:\/\//i.test(src)) return;

    photo.src = src;
    photo.alt = img?.alt || "Zdjęcie z portfolio Aksen Photo";
    caption.textContent = figcaption?.textContent?.trim() || "";
    dialog.querySelector("[data-gallery-count]").textContent =
      (current + 1) + " / " + links.length;

    dialog.querySelector("[data-gallery-prev]").disabled = current === 0;
    dialog.querySelector("[data-gallery-next]").disabled = current === links.length - 1;
  };

  const step = (offset) => {
    const next = current + offset;
    if (next < 0 || next >= links.length) return;
    current = next;
    updatePhoto();
  };

  const initialize = () => {
    if (dialog) return true;
    const test = document.createElement("dialog");
    if (typeof test.showModal !== "function") return false;

    dialog = make("dialog", "aksen-gallery-dialog");
    dialog.setAttribute("aria-label", "Podgląd zdjęć Aksen Photo");

    const toolbar = make("div", "aksen-gallery-dialog__toolbar");
    const count = make("span", "aksen-gallery-dialog__count");
    count.dataset.galleryCount = "true";
    const close = make("button", "aksen-gallery-dialog__close", "Zamknij ×");
    close.type = "button";
    close.setAttribute("aria-label", "Zamknij zdjęcie");
    close.addEventListener("click", () => dialog.close());
    toolbar.append(count, close);

    const view = make("figure", "aksen-gallery-dialog__figure");
    photo = make("img", "aksen-gallery-dialog__image");
    photo.alt = "";
    caption = make("figcaption", "aksen-gallery-dialog__caption");
    view.append(photo, caption);

    const controls = make("div", "aksen-gallery-dialog__controls");
    const prev = make("button", "", "← Poprzednie");
    prev.type = "button";
    prev.dataset.galleryPrev = "true";
    prev.addEventListener("click", () => step(-1));
    const next = make("button", "", "Następne →");
    next.type = "button";
    next.dataset.galleryNext = "true";
    next.addEventListener("click", () => step(1));
    controls.append(prev, next);

    dialog.append(toolbar, view, controls);
    document.body.append(dialog);

    dialog.addEventListener("close", () => {
      photo.removeAttribute("src");
      if (lastFocus?.isConnected) lastFocus.focus();
      lastFocus = null;
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    });

    dialog.addEventListener("touchstart", (event) => {
      startX = event.changedTouches?.[0]?.clientX ?? null;
    }, { passive: true });

    dialog.addEventListener("touchend", (event) => {
      if (startX === null) return;
      const endX = event.changedTouches?.[0]?.clientX ?? startX;
      const delta = endX - startX;
      if (Math.abs(delta) > 65) step(delta > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });

    return true;
  };

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("a[data-ap-gallery-image]")
      : null;
    if (!target) return;
    const gallery = target.closest("[data-aksen-public-gallery]");
    if (!gallery || !initialize()) return;

    links = Array.from(gallery.querySelectorAll("a[data-ap-gallery-image]"));
    current = links.indexOf(target);
    if (current < 0) return;
    event.preventDefault();
    lastFocus = target;
    updatePhoto();
    dialog.showModal();
  });
})();
