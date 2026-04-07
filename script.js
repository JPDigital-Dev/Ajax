const metrics = document.querySelectorAll(".metric");
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".nav-link");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll("[data-section]");
const hero = document.querySelector(".hero");
const heroCopy = document.querySelector(".hero-copy");
const heroPanel = document.querySelector(".showcase-panel");
const processFlow = document.querySelector("#process-flow");
const flowItems = processFlow ? [...processFlow.children] : [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let metricsAnimated = false;
let scrollAnimationFrame = null;
let processAnimated = false;

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
      metric.textContent = formatMetric(target * eased, target, suffix);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        metric.textContent = formatMetric(target, target, suffix);
      }
    };

    requestAnimationFrame(tick);
  });
};

if (window.AOS) {
  window.AOS.init({
    once: true,
    duration: 900,
    offset: 90,
    easing: "ease-out-cubic",
    disable: prefersReducedMotion,
  });
}

const heroObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateMetrics();
      heroObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

if (heroCopy) {
  heroObserver.observe(heroCopy);
}

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(entry.target.id);
    });
  },
  {
    threshold: 0.42,
    rootMargin: "-18% 0px -34% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const processObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || processAnimated) return;

      processAnimated = true;

      flowItems.forEach((item, index) => {
        window.setTimeout(() => {
          item.classList.add("is-visible");
        }, index * 180);
      });

      processObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

if (processFlow) {
  processObserver.observe(processFlow);
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const smoothScrollTo = (targetY) => {
  if (scrollAnimationFrame) {
    cancelAnimationFrame(scrollAnimationFrame);
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(1400, Math.max(700, Math.abs(distance) * 0.65));
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

    const headerOffset = header ? header.offsetHeight + 26 : 0;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
    smoothScrollTo(targetY);
    window.history.pushState(null, "", href);
  });
});

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const updateHeroParallax = () => {
  if (prefersReducedMotion || !hero || !heroPanel) return;

  const rect = hero.getBoundingClientRect();
  const progress = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
  heroPanel.style.transform = `translateY(${progress * 24}px)`;
};

const handleScroll = () => {
  updateHeaderState();
  updateHeroParallax();
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", updateHeroParallax);

if (prefersReducedMotion) {
  animateMetrics();
  flowItems.forEach((item) => item.classList.add("is-visible"));
}

handleScroll();
