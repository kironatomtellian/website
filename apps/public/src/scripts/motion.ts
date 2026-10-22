/**
 * Site-wide motion. Everything is opt-in through data attributes, so pages
 * only describe what moves:
 *
 *   data-split          heading whose words rise in one by one
 *   data-stagger        children fade up in sequence
 *   data-wipe           image frame that opens from the bottom
 *   data-parallax="n"   element drifts at n × scroll speed
 *   data-count          number counts up from zero
 *   data-draw           rule or line that draws from left to right
 *   data-cursor="Play"  shows a round label that follows the pointer
 *
 * Nothing here runs when the visitor prefers reduced motion; the CSS then
 * shows every element in its final state.
 */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = "1";
  let i = 0;
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(part);
            continue;
          }
          const outer = document.createElement("span");
          outer.className = "split-w";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--i", String(i++));
          outer.append(inner);
          frag.append(outer);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    }
  };
  walk(el);
}

function indexChildren(el: HTMLElement) {
  [...el.children].forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(Math.min(i, 12))));
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count ?? el.textContent);
  if (!Number.isFinite(target)) return;
  const start = performance.now();
  const dur = 1400;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-visible", "is-in");
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      }
    },
    { threshold: 0, rootMargin: "0px 0px -8% 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-split]").forEach(splitWords);
  document.querySelectorAll<HTMLElement>("[data-stagger]").forEach(indexChildren);
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    el.dataset.count ??= el.textContent?.trim() ?? "0";
    el.textContent = "0";
  });
  document
    .querySelectorAll<HTMLElement>(".reveal, .reveal-stagger, [data-split], [data-stagger], [data-wipe], [data-count], [data-draw], [data-fade]")
    .forEach((el) => io.observe(el));
}

function initParallax() {
  const items = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
  if (!items.length) return;
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    for (const el of items) {
      const box = (el.parentElement ?? el).getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) continue;
      const speed = Number(el.dataset.parallax) || 0.15;
      const offset = (box.top + box.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.12)`;
    }
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  update();
  window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
}

/** The nav slides away while reading down and comes back on the way up. */
function initNavHide() {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (!nav) return;
  let last = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const open = nav.getAttribute("data-open") === "true";
      nav.classList.toggle("is-hidden", !open && y > 400 && y > last + 4);
      if (y < last - 4) nav.classList.remove("is-hidden");
      last = y;
    },
    { passive: true },
  );
}

function initCursor() {
  if (!finePointer) return;
  const dot = document.querySelector<HTMLElement>("[data-cursor-dot]");
  if (!dot) return;
  const label = dot.querySelector("span")!;
  let x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
    dot.classList.toggle("is-on", Boolean(target));
    if (target) label.textContent = target.dataset.cursor ?? "";
  });
  document.addEventListener("pointerleave", () => dot.classList.remove("is-on"));
  const loop = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    dot.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/** Big links lean a little towards the pointer. */
function initMagnets() {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
    const strength = Number(el.dataset.magnet) || 0.25;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

/** Images follow the pointer slightly inside their frame. */
function initTilt() {
  if (!finePointer) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    const img = el.querySelector<HTMLElement>("img");
    if (!img) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = `scale(1.08) translate(${px * -12}px, ${py * -12}px)`;
    });
    el.addEventListener("pointerleave", () => (img.style.transform = ""));
  });
}

if (reduce) {
  document.querySelectorAll("[data-count]").forEach((el) => el.classList.add("is-in"));
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => el.classList.add("is-visible"));
} else {
  initReveals();
  initParallax();
  initProgress();
  initNavHide();
  initCursor();
  initMagnets();
  initTilt();
}
