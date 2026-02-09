(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  const closeMenu = () => {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.style.display = "none";
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  const openMenu = () => {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", "true");
    mobileMenu.style.display = "block";
    mobileMenu.setAttribute("aria-hidden", "false");
  };

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const expanded = burger.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });

    $$("#mobileMenu a").forEach(a => a.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => { if (window.innerWidth > 920) closeMenu(); });
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add("in");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  const toTop = $("#toTop");
  const onScroll = () => {
    if (!toTop) return;
    if (window.scrollY > 700) toTop.classList.add("show");
    else toTop.classList.remove("show");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const toast = $("#toast");
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  };

  const form = $("#quoteForm");
  const setErr = (name, msg) => {
    const el = document.querySelector(`.err[data-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };
  const clearAllErrs = () => ["name","email","phone","company","service","message"].forEach(k => setErr(k, ""));
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  if (form) {
    const handleSubmit = (e) => {
      e.preventDefault();
      clearAllErrs();

      const data = Object.fromEntries(new FormData(form).entries());
      let ok = true;

      if (!data.name || String(data.name).trim().length < 2) { setErr("name","Please enter your full name."); ok=false; }
      if (!data.email || !isEmail(String(data.email).trim())) { setErr("email","Please enter a valid email."); ok=false; }
      if (!data.phone || String(data.phone).trim().length < 7) { setErr("phone","Please enter a valid phone number."); ok=false; }
      if (!data.service || String(data.service).trim().length < 2) { setErr("service","Please select a service."); ok=false; }
      if (!data.message || String(data.message).trim().length < 10) { setErr("message","Please add a short message (min 10 characters)."); ok=false; }

      if (!ok) { showToast("Please fix the highlighted fields."); return; }

      // Use Formsubmit: the form's action points to https://formsubmit.co/sales@cloudsitc.com
      // Ensure helpful hidden fields exist (subject and captcha disabled)
      if (!form.querySelector('input[name="_subject"]')) {
        const subj = document.createElement('input'); subj.type = 'hidden'; subj.name = '_subject'; subj.value = `Quote request: ${data.service} — ${data.company || data.name}`; form.appendChild(subj);
      } else {
        form.querySelector('input[name="_subject"]').value = `Quote request: ${data.service} — ${data.company || data.name}`;
      }
      if (!form.querySelector('input[name="_captcha"]')) {
        const cap = document.createElement('input'); cap.type = 'hidden'; cap.name = '_captcha'; cap.value = 'false'; form.appendChild(cap);
      }

      showToast('Opening Formsubmit...');
      // Remove this handler to allow the native submit to proceed
      form.removeEventListener('submit', handleSubmit);
      form.submit();
    };

    form.addEventListener('submit', handleSubmit);
  }
})();
