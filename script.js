const metrics = document.querySelectorAll(".metric");
const heroVisual = document.querySelector(".command-center");
const header = document.querySelector(".site-header");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
let metricsAnimated = false;
let scrollAnimationFrame = null;

const formatMetric = (value, target, suffix) => {
  const decimals = target.toString().includes(".") ? target.toString().split(".")[1].length : 0;
  return `${value.toFixed(decimals)}${suffix}`;
};

const animateMetrics = () => {
  if (metricsAnimated) return;
  metricsAnimated = true;

  metrics.forEach((metric) => {
    const target = Number(metric.dataset.count);
    const suffix = metric.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      metric.textContent = formatMetric(current, target, suffix);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        metric.textContent = formatMetric(target, target, suffix);
      }
    };

    requestAnimationFrame(tick);
  });
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.AOS) {
  window.AOS.init({
    once: true,
    duration: 900,
    offset: 80,
    easing: "ease-out-cubic",
    mirror: false,
    disable: prefersReducedMotion,
  });
}

const heroObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateMetrics();
        heroObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.35,
  }
);

const heroCopy = document.querySelector(".hero-copy");

if (heroCopy) {
  heroObserver.observe(heroCopy);
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const smoothScrollTo = (targetY) => {
  if (scrollAnimationFrame) {
    cancelAnimationFrame(scrollAnimationFrame);
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(1400, Math.max(700, Math.abs(distance) * 0.6));
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(step);
      return;
    }

    scrollAnimationFrame = null;
  };

  scrollAnimationFrame = requestAnimationFrame(step);
};

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();

    const headerOffset = header ? header.offsetHeight + 28 : 0;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
    smoothScrollTo(targetY);
    window.history.pushState(null, "", href);
  });
});

if (!prefersReducedMotion && heroVisual) {
  const updateParallax = () => {
    const offset = Math.min(window.scrollY * 0.08, 32);
    heroVisual.style.transform = `translateY(${offset}px)`;
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}

if (prefersReducedMotion) {
  animateMetrics();
}
