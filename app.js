(function () {
  const cfg = window.BF_CONFIG || {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── оплата: ссылка или форма GetCourse ── */
  const widgets = cfg.WIDGETS || {};
  const sheet = document.getElementById("sheet-pay");
  const mount = document.getElementById("gc-mount");
  const payTitle = document.getElementById("pay-title");
  let openKey = "";

  function closePay() {
    if (!sheet) return;
    sheet.classList.remove("on");
    sheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sheet-lock");
  }

  function mountWidget(key) {
    const w = widgets[key];
    if (!w || !mount) return;
    if (openKey === key && mount.querySelector("script, iframe")) {
      document.dispatchEvent(new Event("StartWidget" + w.hash));
      return;
    }
    mount.replaceChildren();
    openKey = key;
    const script = document.createElement("script");
    script.id = w.hash;
    script.src = w.src;
    script.onload = () => document.dispatchEvent(new Event("StartWidget" + w.hash));
    mount.appendChild(script);
  }

  function openPay(key) {
    const w = widgets[key];
    if (!sheet || !w) return;
    if (payTitle) payTitle.textContent = w.title || "Оплата";
    sheet.classList.add("on");
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("sheet-lock");
    mountWidget(key);
    const closeBtn = sheet.querySelector(".sheet-x");
    if (closeBtn) closeBtn.focus();
  }

  if (sheet) {
    sheet.addEventListener("click", (e) => {
      if (e.target === sheet) closePay();
    });
    sheet.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closePay);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePay();
    });
  }

  document.querySelectorAll("[data-pay]").forEach((a) => {
    const key = a.dataset.pay;
    const url = (cfg.PAY && cfg.PAY[key]) || "";
    if (url) {
      a.href = url;
      a.rel = "noopener";
      return;
    }
    a.href = "#";
    a.addEventListener("click", (e) => {
      if (!widgets[key]) {
        e.preventDefault();
        a.classList.add("btn-wait");
        setTimeout(() => a.classList.remove("btn-wait"), 1200);
        return;
      }
      e.preventDefault();
      openPay(key);
    });
  });
  document.querySelectorAll("[data-old]").forEach((el) => {
    const v = (cfg.OLD_PRICE && cfg.OLD_PRICE[el.dataset.old]) || "";
    if (v) {
      el.textContent = v;
      el.hidden = false;
    }
  });

  /* ── трекинг: просмотр + клики по оплате (как в landing_coda) ── */
  const SRC_KEY = "bf_traffic_source";
  const VID_KEY = "bf_visitor_id";
  function visitorId() {
    try {
      let id = localStorage.getItem(VID_KEY) || "";
      if (!id) {
        id = (crypto.randomUUID && crypto.randomUUID()) ||
          "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(VID_KEY, id);
      }
      return id;
    } catch { return "anon"; }
  }
  function normSrc(raw) {
    return String(raw || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  }
  function source() {
    try {
      const sp = new URLSearchParams(location.search);
      const s = normSrc(sp.get("src") || sp.get("utm_source"));
      if (s) localStorage.setItem(SRC_KEY, s);
      return s || localStorage.getItem(SRC_KEY) || "";
    } catch { return ""; }
  }
  function track(event, extra) {
    const url = cfg.TRACK_URL;
    if (!url) return;
    const q = new URLSearchParams({ e: event, vid: visitorId() });
    const s = source();
    if (s) q.set("src", s);
    if (extra) q.set("course", extra);
    const px = new Image(1, 1);
    px.referrerPolicy = "no-referrer";
    px.src = url + (url.includes("?") ? "&" : "?") + q.toString();
  }
  try {
    if (!sessionStorage.getItem("bf_view_sent")) {
      sessionStorage.setItem("bf_view_sent", "1");
      track("view");
    }
  } catch { track("view"); }
  document.querySelectorAll("[data-pay]").forEach((a) =>
    a.addEventListener("click", () => track("pay_open", a.dataset.pay))
  );

  /* ── обратный отсчёт до конца акции ── */
  const cd = document.getElementById("cd");
  const cdNum = document.getElementById("cd-num");
  const end = cfg.BF_END ? new Date(cfg.BF_END).getTime() : 0;
  function tick() {
    if (!end || !cdNum) return;
    const left = end - Date.now();
    if (left <= 0) { cd.hidden = true; return; }
    const d = Math.floor(left / 864e5);
    const h = Math.floor((left % 864e5) / 36e5);
    const m = Math.floor((left % 36e5) / 6e4);
    cdNum.textContent = d > 0
      ? `${d} дн ${h} ч ${m} мин`
      : `${h} ч ${m} мин`;
    cd.hidden = false;
  }
  tick();
  setInterval(tick, 30000);

  /* ── reveal-анимации ── */
  const revealNodes = document.querySelectorAll(
    ".card, .person, .about-body, .bf-pill, .hero-h, .hero-sub, .hero-cta, .stage, .final-actions .chip"
  );
  if (!reduced && "IntersectionObserver" in window) {
    revealNodes.forEach((n, i) => {
      n.classList.add("reveal");
      n.style.setProperty("--d", `${(i % 4) * 70}ms`);
    });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    revealNodes.forEach((n) => io.observe(n));
  }

  /* ── параллакс плавающих карточек (только десктоп, только мышь) ── */
  const stage = document.querySelector(".hero-stage");
  const floats = document.querySelectorAll(".fl");
  if (!reduced && stage && window.matchMedia("(pointer: fine)").matches) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      floats.forEach((el, i) => {
        const k = (i % 2 ? -1 : 1) * (8 + i * 4);
        el.style.translate = `${x * k}px ${y * k}px`;
      });
    });
    stage.addEventListener("pointerleave", () => {
      floats.forEach((el) => { el.style.translate = "0px 0px"; });
    });
  }

  /* ── липкая мобильная плашка: после первого экрана ── */
  const mobBar = document.getElementById("mobBar");
  const final = document.getElementById("final");
  if (mobBar && window.matchMedia("(max-width: 780px)").matches) {
    let past = false;
    function onScroll() {
      const show = window.scrollY > window.innerHeight * 0.8;
      if (show !== past) {
        past = show;
        mobBar.classList.toggle("on", show);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    // прячем, когда виден финальный призыв — там свои кнопки
    if (final && "IntersectionObserver" in window) {
      new IntersectionObserver((en) => {
        if (en[0].isIntersecting) mobBar.classList.remove("on");
        else if (past) mobBar.classList.add("on");
      }, { threshold: 0.2 }).observe(final);
    }
  }
})();
