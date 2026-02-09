// three-hero.js (Hero polish)
// - Mouse tilt on laptop.avif
// - Scroll parallax for background hero images using CSS vars (works everywhere)

(() => {
  const laptop = document.getElementById("laptopImg");
  const mock = document.getElementById("laptopMock");
  const hero = document.getElementById("hero");
  const imgs = Array.from(document.querySelectorAll(".heroMedia__img"));

  if (!hero) return;

  // ===== Mouse tilt on laptop =====
  if (mock && laptop) {
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

    const onMove = (e) => {
      const r = mock.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      const rotY = clamp(x * 14, -10, 10);
      const rotX = clamp(-y * 10, -8, 8);

      laptop.style.transform =
        `perspective(1000px) rotateY(${rotY - 8}deg) rotateX(${rotX + 5}deg) translateY(-2px)`;
    };

    const onLeave = () => {
      laptop.style.transform = "perspective(1000px) rotateY(-10deg) rotateX(6deg)";
    };

    mock.addEventListener("mousemove", onMove);
    mock.addEventListener("mouseleave", onLeave);
  }

  // ===== Scroll parallax for hero background images =====
  const parallax = () => {
    const rect = hero.getBoundingClientRect();
    const max = hero.offsetHeight + window.innerHeight;
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / max));

    imgs.forEach((img, i) => {
      const strength = (i + 1) * 45;
      const x = Math.round(progress * strength);
      const y = Math.round(progress * strength * 0.75);

      img.style.setProperty("--px", `${x}px`);
      img.style.setProperty("--py", `${y}px`);
    });
  };

  window.addEventListener("scroll", parallax, { passive: true });
  parallax();
})();
