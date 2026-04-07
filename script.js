const revealElements = document.querySelectorAll(".reveal");
const metrics = document.querySelectorAll(".metric");
const heroVisual = document.querySelector(".command-center");
let metricsAnimated = false;

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

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      if (entry.target.classList.contains("hero-copy")) {
        animateMetrics();
      }

      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && heroVisual) {
  const updateParallax = () => {
    const offset = Math.min(window.scrollY * 0.08, 32);
    heroVisual.style.transform = `translateY(${offset}px)`;
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}
