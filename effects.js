const revealItems = document.querySelectorAll(".reveal");
const progressBar = document.getElementById("scroll-progress-bar");
const showcaseSteps = document.querySelectorAll(".showcase-step");
const showcaseVisual = document.getElementById("showcase-visual");
const showcaseTitle = document.getElementById("showcase-title");
const showcaseCopy = document.getElementById("showcase-copy");
const showcaseSection = document.getElementById("showcase");
const hero = document.querySelector(".hero-panel");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -70px 0px" },
);

revealItems.forEach((item) => revealObserver.observe(item));

function activateShowcaseStep(step) {
  showcaseSteps.forEach((card) => card.classList.remove("is-active"));
  step.classList.add("is-active");

  if (showcaseTitle) showcaseTitle.textContent = step.dataset.title || "";
  if (showcaseCopy) showcaseCopy.textContent = step.dataset.copy || "";
  if (showcaseVisual) {
    showcaseVisual.classList.remove(
      "theme-foundation",
      "theme-iterate",
      "theme-polish",
      "theme-impact",
    );
    showcaseVisual.classList.add(step.dataset.theme || "theme-foundation");
  }
}

if (showcaseSteps.length) {
  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateShowcaseStep(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "-38% 0px -38% 0px" },
  );
  showcaseSteps.forEach((step) => stepObserver.observe(step));
}

function updateScrollEffects() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(100, progress)}%`;

  if (!reduceMotion && hero) {
    const shift = Math.min(scrollTop * 0.08, 24);
    hero.style.transform = `translateY(${shift}px)`;
  }

  if (!reduceMotion && showcaseVisual && showcaseSection) {
    const rect = showcaseSection.getBoundingClientRect();
    const progressRaw = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const progressClamped = Math.max(0, Math.min(1, progressRaw));
    const floatY = Math.sin(progressClamped * Math.PI) * -10;
    showcaseVisual.style.transform = `translateY(${floatY}px)`;
  }
}

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
updateScrollEffects();
