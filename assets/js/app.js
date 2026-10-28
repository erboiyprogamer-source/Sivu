/* Pizzeria Albert – sivun toiminnallisuus (ei riippuvuuksia Leafletia lukuun ottamatta) */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const euro = new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR" });
  const fmt = (n) => euro.format(n);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const MENU = window.ALBERT_MENU || [];
  const PHONE = "(06) 557 6310";
  const ALBERT = [63.0020671, 23.8162725];

  /* ---------------------------------------------------------
     Aukioloajat (Europe/Helsinki). Indeksi 0 = maanantai.
     --------------------------------------------------------- */
  const DAYS = ["Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"];
  const HOURS = [
    ["10:30", "22:00"], ["10:30", "22:00"], ["10:30", "22:00"], ["10:30", "22:00"],
    ["10:30", "23:00"], ["10:30", "23:00"], ["10:30", "22:00"]
  ];
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const dot = (t) => t.replace(":", ".");

  function helsinkiNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Helsinki", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
    return { day, min: Number(get("hour")) * 60 + Number(get("minute")) };
  }

  function openStatus() {
    const { day, min } = helsinkiNow();
    const [o, c] = HOURS[day];
    const open = toMin(o), close = toMin(c);
    if (min >= open && min < close) {
      const left = close - min;
      return { open: true, day, short: left <= 45 ? "Sulkeutuu pian" : "Avoinna nyt", long: left <= 45 ? `Sulkeutuu pian – klo ${dot(c)}` : `Avoinna nyt · sulkee klo ${dot(c)}` };
    }
    if (min < open) return { open: false, day, short: `Aukeaa ${dot(o)}`, long: `Suljettu · aukeaa tänään klo ${dot(o)}` };
    const next = HOURS[(day + 1) % 7][0];
    return { open: false, day, short: "Suljettu", long: `Suljettu · aukeaa huomenna klo ${dot(next)}` };
  }

  function renderHours() {
    const st = openStatus();
    $$("[data-open-pill]").forEach((el) => {
      el.classList.toggle("is-open", st.open);
      el.classList.toggle("is-closed", !st.open);
      $("[data-open-text]", el).textContent = st.short;
    });
    const [o, c] = HOURS[st.day];
    const th = $("[data-today-hours]");
    if (th) th.textContent = `${dot(o)}–${dot(c)}`;
    const ts = $("[data-today-status]");
    if (ts) {
      ts.textContent = st.long;
      ts.className = "info-sub " + (st.open ? "is-open" : "is-closed");
    }
    const table = $("[data-hours]");
    if (table) {
      table.innerHTML = DAYS.map((d, i) =>
        `<tr class="${i === st.day ? "today" : ""}"><td>${d}</td><td>${dot(HOURS[i][0])}–${dot(HOURS[i][1])}</td></tr>`
      ).join("");
    }
    const popupStatus = $("[data-popup-status]");
    if (popupStatus) popupStatus.textContent = st.long;
    return st;
  }

  /* ---------------------------------------------------------
     Header: mobiilivalikko + aktiivinen osio
     --------------------------------------------------------- */
  function initHeader() {
    const toggle = $(".nav-toggle");
    const nav = $("#paanavi");
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Sulje valikko" : "Avaa valikko");
      nav.classList.toggle("open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

    const links = new Map($$("a", nav).map((a) => [a.getAttribute("href").slice(1), a]));
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        const a = links.get(en.target.id);
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------------------------------------------------------
     Tilauslista
     --------------------------------------------------------- */
  const STORE_KEY = "albert-tilauslista";
  const cart = {
    items: [],
    load() {
      try { this.items = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { this.items = []; }
    },
    save() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.items)); } catch (e) { /* yksityinen selaus tms. */ }
    },
    add(item) {
      const key = `${item.name}|${item.size || ""}|${item.note || ""}`;
      const found = this.items.find((i) => i.key === key);
      if (found) found.qty += 1; else this.items.push({ ...item, key, qty: 1 });
      this.save(); renderCart(true);
      toast(`<b>${esc(item.name)}</b> lisätty listalle`);
    },
    change(key, delta) {
      const it = this.items.find((i) => i.key === key);
      if (!it) return;
      it.qty += delta;
      if (it.qty <= 0) this.items = this.items.filter((i) => i !== it);
      this.save(); renderCart();
    },
    clear() { this.items = []; this.save(); renderCart(); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + i.qty * i.price, 0); }
  };

  function renderCart(bump) {
    const n = cart.count();
    const fab = $(".cart-fab");
    fab.classList.toggle("show", n > 0);
    const cnt = $("[data-cart-count]");
    cnt.textContent = n;
    if (bump) { cnt.classList.remove("bump"); void cnt.offsetWidth; cnt.classList.add("bump"); }
    $("[data-cart-fab-total]").textContent = n ? fmt(cart.total()) : "";
    $("[data-cart-total]").textContent = fmt(cart.total());
    $("[data-cart-empty]").hidden = n > 0;
    $("[data-cart-list]").innerHTML = cart.items.map((i) => `
      <li class="cart-item">
        <h3>${esc(i.name)}</h3>
        <span class="line-price">${fmt(i.price * i.qty)}</span>
        <p>${esc([i.size, i.note].filter(Boolean).join(" · ") || fmt(i.price))}</p>
        <div class="qty">
          <button data-qty="-1" data-key="${esc(i.key)}" aria-label="Vähennä: ${esc(i.name)}">−</button>
          <span aria-label="Määrä">${i.qty}</span>
          <button data-qty="1" data-key="${esc(i.key)}" aria-label="Lisää: ${esc(i.name)}">+</button>
        </div>
      </li>`).join("");
  }

  function cartText() {
    const lines = cart.items.map((i) => `${i.qty} × ${i.name}${i.size ? ` (${i.size.toLowerCase()})` : ""}${i.note ? ` – ${i.note}` : ""}  ${fmt(i.price * i.qty)}`);
    return `Tilaus – Pizzeria Albert\n${lines.join("\n")}\nYhteensä ${fmt(cart.total())}`;
  }

  function initCart() {
    cart.load();
    renderCart();
    const drawer = $("#tilauslista");
    const backdrop = $(".drawer-backdrop");
    const fab = $("[data-cart-open]");
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      backdrop.hidden = false;
      fab.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setTimeout(() => drawer.focus(), 50);
    };
    const close = () => {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      backdrop.hidden = true;
      fab.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };
    fab.addEventListener("click", open);
    $$("[data-cart-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) close(); });

    $("[data-cart-list]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-qty]");
      if (b) cart.change(b.dataset.key, Number(b.dataset.qty));
    });
    $("[data-cart-clear]").addEventListener("click", () => cart.clear());
    $("[data-cart-copy]").addEventListener("click", async () => {
      if (!cart.count()) return toast("Lista on tyhjä");
      try { await navigator.clipboard.writeText(cartText()); toast("Lista kopioitu leikepöydälle"); }
      catch (e) { toast("Kopiointi ei onnistunut tässä selaimessa"); }
    });

    // Hintapainikkeet missä tahansa sivulla
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]");
      if (!b) return;
      cart.add({ name: b.dataset.name, size: b.dataset.size || "", price: Number(b.dataset.price) });
      b.classList.remove("added"); void b.offsetWidth; b.classList.add("added");
    });
  }

  let toastTimer;
  function toast(html) {
    const t = $("[data-toast]");
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------------------------------------------------
     Ruokalista
     --------------------------------------------------------- */
  const TAGS = [
    { id: "kebab", label: "Kebabliha", test: (t) => /kebab/.test(t) },
    { id: "kana", label: "Kana", test: (t) => /kana|pollo|pariloitu kana/.test(t) },
    { id: "aura", label: "Aurajuusto", test: (t) => /aurajuusto/.test(t) },
    { id: "poro", label: "Savuporo", test: (t) => /savuporo/.test(t) },
    { id: "meri", label: "Merenelävät", test: (t) => /tonnikala|katkarapu|simpukka/.test(t) },
    { id: "tulinen", label: "Tulinen", test: (t) => /jalapeno|chili|pepperoni/.test(t) },
    { id: "kasvis", label: "Kasvis", test: (t, cat) => cat !== "juomat" && !/kinkku|jauheliha|salami|pepperoni|kebab|kana|pollo|pekoni|savuporo|tonnikala|katkarapu|simpukka|makkara|nakit|pihvi|lihapull/.test(t) }
  ];
  // Kapealla näytöllä aloitetaan pizzoista, ettei koko 68 tuotteen lista veny loputtomiin
  const narrow = window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
  const state = { tab: narrow ? "pizzat" : "kaikki", tags: new Set(), q: "" };

  function itemTags(item, catId) {
    const t = `${item.name} ${item.desc}`.toLowerCase();
    return TAGS.filter((tag) => tag.test(t, catId)).map((tag) => tag.id);
  }

  function priceButtons(item, cat) {
    return item.prices.map((p, i) => {
      const size = cat.sizes.length > 1 ? cat.sizes[i] : "";
      const label = size === "Normaali" ? "Norm." : size;
      return `<button class="price-btn" data-add data-name="${esc(item.name)}" data-size="${esc(size)}" data-price="${p}"
        aria-label="Lisää ${esc(item.name)}${size ? " " + size.toLowerCase() : ""} tilauslistaan, ${fmt(p)}">
        <small>${esc(label || "Lisää")}</small><b>${fmt(p)}</b></button>`;
    }).join("");
  }

  function highlight(text, q) {
    if (!q) return esc(text);
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  function renderMenu() {
    const list = $("[data-menu-list]");
    const q = state.q.trim().toLowerCase();
    let html = "";
    let shown = 0;
    const cats = state.tab === "kaikki" ? MENU : MENU.filter((c) => c.id === state.tab);

    cats.forEach((cat) => {
      const items = cat.items.filter((it) => {
        if (q && !`${it.name} ${it.desc}`.toLowerCase().includes(q)) return false;
        if (state.tags.size) {
          const tags = itemTags(it, cat.id);
          for (const t of state.tags) if (!tags.includes(t)) return false;
        }
        return true;
      });
      if (!items.length) return;
      shown += items.length;
      if (state.tab === "kaikki") html += `<h3 class="menu-cat-title">${esc(cat.name)} <small>${items.length} kpl</small></h3>`;
      html += items.map((it) => `
        <div class="item">
          <div class="item-name">${highlight(it.name, q)}${it.badge ? `<span class="item-badge">${esc(it.badge)}</span>` : ""}</div>
          <div class="item-prices">${priceButtons(it, cat)}</div>
          <p class="item-desc">${highlight(it.desc, q)}</p>
        </div>`).join("");
    });

    list.innerHTML = html;
    $("[data-menu-empty]").hidden = shown > 0;
    const activeCat = MENU.find((c) => c.id === state.tab);
    const note = $("[data-menu-note]");
    note.textContent = activeCat ? activeCat.note : MENU[0].note;
    if (state.tab !== "kaikki" && state.tab !== "pizzat") note.textContent = activeCat.note || "";
  }

  function initMenu() {
    const tabs = $("[data-menu-tabs]");
    const all = [{ id: "kaikki", name: "Kaikki", n: MENU.reduce((s, c) => s + c.items.length, 0) }]
      .concat(MENU.map((c) => ({ id: c.id, name: c.name, n: c.items.length })));
    tabs.innerHTML = all.map((t) =>
      `<button class="tab" role="tab" aria-selected="${t.id === state.tab}" data-tab="${t.id}">${esc(t.name)} <small>${t.n}</small></button>`
    ).join("");
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (!b) return;
      state.tab = b.dataset.tab;
      $$(".tab", tabs).forEach((t) => t.setAttribute("aria-selected", String(t === b)));
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      renderMenu();
    });

    const chips = $("[data-menu-chips]");
    chips.innerHTML = TAGS.map((t) => `<button class="chip" aria-pressed="false" data-tag="${t.id}">${esc(t.label)}</button>`).join("");
    chips.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tag]");
      if (!b) return;
      const on = !state.tags.has(b.dataset.tag);
      if (on) state.tags.add(b.dataset.tag); else state.tags.delete(b.dataset.tag);
      b.setAttribute("aria-pressed", String(on));
      renderMenu();
    });

    let timer;
    $("[data-menu-search]").addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.q = e.target.value; renderMenu(); }, 120);
    });
    renderMenu();
  }

  /* ---------------------------------------------------------
     Suosikit
     --------------------------------------------------------- */
  const FAVS = [
    { name: "Erikoispizza", badge: "Suosituin", img: "assets/img/pizza-kana.webp", blurb: "Kebabliha, ranskalaiset, salaatti, tomaatti ja talon kastike – pizzana. Nuorten ehdoton ykkönen." },
    { name: "Rullakebab", badge: "Kakkossuosikki", img: "assets/img/rullakebab.webp", blurb: "Uunituore leipä täynnä kebablihaa, salaattia, kurkkua, sipulia, tomaattia ja kastiketta." },
    { name: "Alajärvipizza", badge: "Paikallinen klassikko", img: "assets/img/pizza-taytteet.webp", blurb: "Kinkku, ananas ja tuplakebabliha. Kotikaupungin nimikkopizza." },
    { name: "Hawaiji", badge: "Talon aurapizza", img: "assets/img/pizza-rustiikki.webp", blurb: "Kinkku, ananas ja aurajuusto – Albertin pitkäaikainen suosikki." },
    { name: "Albert Special Kebab", badge: "Albertin oma", img: "assets/img/kebab-ranskalaiset.webp", blurb: "Riisi ja lohkoperunat samalla lautasella, päällä reilusti kebablihaa ja kastiketta." }
  ];

  function findItem(name) {
    for (const cat of MENU) {
      const it = cat.items.find((i) => i.name === name);
      if (it) return { it, cat };
    }
    return null;
  }

  function initFavs() {
    const grid = $("[data-favs]");
    grid.innerHTML = FAVS.map((f, idx) => {
      const found = findItem(f.name);
      if (!found) return "";
      const { it, cat } = found;
      return `
        <article class="fav">
          <div class="fav-media">
            <img src="${f.img}" alt="" loading="lazy" width="1000" height="750">
            <span class="fav-badge">${esc(f.badge)}</span>
            <span class="fav-rank" aria-hidden="true">${String(idx + 1).padStart(2, "0")}</span>
          </div>
          <div class="fav-body">
            <h3>${esc(it.name)}</h3>
            <p>${esc(f.blurb)}</p>
            <div class="fav-foot">
              <span class="fav-foot-label">Lisää listalle</span>
              <div class="item-prices">${priceButtons(it, cat)}</div>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  /* ---------------------------------------------------------
     Fantasia-rakentaja
     --------------------------------------------------------- */
  const TOPPINGS = [
    { id: "kinkku", label: "Kinkku", color: "#f2a3a6", shape: "square" },
    { id: "jauheliha", label: "Jauheliha", color: "#7a4a2a", shape: "crumble" },
    { id: "salami", label: "Salami", color: "#b8352b", shape: "disc" },
    { id: "pepperonimakkara", label: "Pepperoni", color: "#a3261a", shape: "disc" },
    { id: "kebabliha", label: "Kebabliha", color: "#8b5a2b", shape: "strip" },
    { id: "kana", label: "Kana", color: "#e3bf8f", shape: "chunk" },
    { id: "pekoni", label: "Pekoni", color: "#c8553d", shape: "bacon" },
    { id: "savuporo", label: "Savuporo", color: "#5b2e1f", shape: "strip" },
    { id: "tonnikala", label: "Tonnikala", color: "#cdbb9c", shape: "chunk" },
    { id: "katkarapu", label: "Katkarapu", color: "#f49a7a", shape: "shrimp" },
    { id: "simpukka", label: "Simpukka", color: "#3b3b46", shape: "shell" },
    { id: "ananas", label: "Ananas", color: "#f8d44c", shape: "wedge" },
    { id: "herkkusieni", label: "Herkkusieni", color: "#d9c4a6", shape: "mushroom" },
    { id: "paprika", label: "Paprika", color: "#3c9a3c", shape: "arc" },
    { id: "sipuli", label: "Sipuli", color: "#b07aa1", shape: "ring" },
    { id: "oliivi", label: "Oliivi", color: "#26221f", shape: "ring" },
    { id: "tomaatti", label: "Tomaatti", color: "#e0362a", shape: "tomato" },
    { id: "jalapeno", label: "Jalapeño", color: "#4caf50", shape: "ring" },
    { id: "chili", label: "Chili", color: "#d62d20", shape: "sliver" },
    { id: "aurajuusto", label: "Aurajuusto", color: "#e7edf2", shape: "crumble" },
    { id: "fetajuusto", label: "Fetajuusto", color: "#fbfaf3", shape: "cube" },
    { id: "kananmuna", label: "Kananmuna", color: "#fffdf4", shape: "egg" }
  ];
  const FANTASIA_PRICE = (findItem("Fantasia") || { it: { prices: [13.3, 33] } }).it.prices;
  const fant = { sel: [], size: 0, seed: 1 };

  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function shapeSVG(t, x, y, rot, r) {
    const c = t.color;
    const g = (inner) => `<g class="topping-piece" style="animation-delay:${(r() * 0.25).toFixed(2)}s" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})">${inner}</g>`;
    switch (t.shape) {
      case "disc": return g(`<circle r="15" fill="${c}" stroke="#6d150d" stroke-width="2"/><circle cx="-5" cy="-3" r="2" fill="#f1c9a5" opacity=".8"/><circle cx="4" cy="5" r="1.8" fill="#f1c9a5" opacity=".8"/><circle cx="5" cy="-6" r="1.5" fill="#f1c9a5" opacity=".7"/>`);
      case "square": return g(`<rect x="-11" y="-9" width="22" height="18" rx="4" fill="${c}" stroke="#c97479" stroke-width="1.5"/>`);
      case "cube": return g(`<rect x="-7" y="-7" width="14" height="14" rx="3" fill="${c}" stroke="#d8d4c4" stroke-width="1.5"/>`);
      case "crumble": return g(`<circle r="5" fill="${c}"/><circle cx="7" cy="3" r="3.6" fill="${c}"/><circle cx="-6" cy="4" r="3.2" fill="${c}"/><circle cx="2" cy="-6" r="3" fill="${c}"/>`);
      case "strip": return g(`<rect x="-15" y="-4.5" width="30" height="9" rx="4.5" fill="${c}"/><rect x="-11" y="-1.5" width="20" height="2" rx="1" fill="#000" opacity=".18"/>`);
      case "chunk": return g(`<path d="M-10 -4 Q-6 -11 3 -9 Q11 -6 10 2 Q8 10 -2 9 Q-11 7 -10 -4Z" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/>`);
      case "bacon": return g(`<path d="M-16 -3 Q-8 -9 0 -3 T16 -3 L16 4 Q8 -2 0 4 T-16 4Z" fill="${c}"/><path d="M-14 0 Q-7 -5 0 0 T14 0" stroke="#f3c2b0" stroke-width="2" fill="none"/>`);
      case "shrimp": return g(`<path d="M-9 4 A10 10 0 1 1 9 4" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-9 4 A10 10 0 1 1 9 4" stroke="#fff" stroke-width="1" stroke-dasharray="2 4" fill="none" opacity=".6"/>`);
      case "shell": return g(`<ellipse rx="11" ry="7" fill="${c}"/><ellipse rx="7" ry="3.5" fill="#f2b28c"/>`);
      case "wedge": return g(`<path d="M0 -11 L10 8 L-10 8Z" fill="${c}" stroke="#d9a90f" stroke-width="2" stroke-linejoin="round"/>`);
      case "mushroom": return g(`<path d="M-12 1 A12 11 0 0 1 12 1Z" fill="${c}" stroke="#a88b66" stroke-width="1.5"/><rect x="-4" y="0" width="8" height="10" rx="3" fill="#efe3cf" stroke="#a88b66" stroke-width="1.2"/>`);
      case "arc": return g(`<path d="M-12 4 Q0 -10 12 4" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      case "ring": return g(`<circle r="9" fill="none" stroke="${c}" stroke-width="4.5"/>${t.id === "jalapeno" ? `<circle r="2" cx="2" cy="-2" fill="#f5f0c8"/><circle r="1.6" cx="-3" cy="2" fill="#f5f0c8"/>` : ""}`);
      case "tomato": return g(`<circle r="14" fill="${c}" stroke="#a51f16" stroke-width="2"/><circle r="9" fill="#f26a55"/><circle cx="-3" cy="-2" r="1.6" fill="#ffe1a8"/><circle cx="3" cy="2" r="1.6" fill="#ffe1a8"/><circle cx="2" cy="-4" r="1.4" fill="#ffe1a8"/>`);
      case "sliver": return g(`<path d="M-9 0 Q0 -6 9 0 Q0 3 -9 0Z" fill="${c}"/>`);
      case "egg": return g(`<path d="M-13 0 Q-12 -11 0 -10 Q13 -10 12 1 Q11 12 -1 11 Q-14 10 -13 0Z" fill="${c}"/><circle r="5.5" fill="#f6b51e"/>`);
      default: return g(`<circle r="8" fill="${c}"/>`);
    }
  }

  function renderFantasia() {
    const host = $("[data-fantasia-toppings]");
    const r = rng(fant.seed * 9973 + fant.sel.length);
    const placed = [];
    let out = "";
    fant.sel.forEach((id, ti) => {
      const t = TOPPINGS.find((x) => x.id === id);
      const count = t.shape === "crumble" ? 14 : t.shape === "cube" || t.shape === "sliver" ? 11 : 9;
      for (let n = 0; n < count; n++) {
        let x, y, tries = 0;
        do {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 128;
          x = 200 + Math.cos(a) * d; y = 200 + Math.sin(a) * d; tries++;
        } while (tries < 30 && placed.some((p) => (p[0] - x) ** 2 + (p[1] - y) ** 2 < 420));
        placed.push([x, y]);
        out += shapeSVG(t, x, y, r() * 360, r);
      }
      void ti;
    });
    host.innerHTML = out;

    const n = fant.sel.length;
    $("[data-fantasia-count]").textContent = n;
    $$(".topping").forEach((b) => {
      const on = fant.sel.includes(b.dataset.top);
      b.setAttribute("aria-pressed", String(on));
      b.disabled = !on && n >= 4;
    });
    $("[data-fantasia-add]").disabled = n === 0;

    const labels = fant.sel.map((id) => TOPPINGS.find((t) => t.id === id).label.toLowerCase());
    let cap = n ? `Fantasia: ${labels.join(", ")}` : "Valitse neljä täytettä →";
    if (n < 4 && n > 0) cap += ` (+${4 - n})`;
    const twin = matchingPizza(fant.sel);
    if (twin) cap += ` – psst, tämä löytyy listalta nimellä ${twin}!`;
    $("[data-fantasia-caption]").textContent = cap;
  }

  function matchingPizza(sel) {
    if (sel.length < 2) return "";
    const pizzat = MENU.find((c) => c.id === "pizzat");
    if (!pizzat) return "";
    const key = [...sel].sort().join(",");
    const hit = pizzat.items.find((p) => p.desc.split(",").map((s) => s.trim()).filter(Boolean).sort().join(",") === key);
    return hit ? hit.name : "";
  }

  function initFantasia() {
    const box = $("[data-fantasia-options]");
    box.innerHTML = TOPPINGS.map((t) =>
      `<button class="topping" aria-pressed="false" data-top="${t.id}"><span class="sw" style="background:${t.color}"></span>${esc(t.label)}</button>`
    ).join("");
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-top]");
      if (!b || b.disabled) return;
      const id = b.dataset.top;
      if (fant.sel.includes(id)) fant.sel = fant.sel.filter((x) => x !== id);
      else if (fant.sel.length < 4) fant.sel.push(id);
      renderFantasia();
    });

    $$(".size-toggle [data-size]").forEach((b) => {
      b.innerHTML = `${b.dataset.size === "0" ? "Normaali" : "Perhe"} <b>${fmt(FANTASIA_PRICE[Number(b.dataset.size)])}</b>`;
      b.addEventListener("click", () => {
        fant.size = Number(b.dataset.size);
        $$(".size-toggle [data-size]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      });
    });

    $("[data-fantasia-random]").addEventListener("click", () => {
      const pool = TOPPINGS.map((t) => t.id);
      const r = rng(Date.now());
      fant.sel = [];
      while (fant.sel.length < 4) {
        const pick = pool[Math.floor(r() * pool.length)];
        if (!fant.sel.includes(pick)) fant.sel.push(pick);
      }
      fant.seed = Math.floor(r() * 1000);
      renderFantasia();
    });

    $("[data-fantasia-add]").addEventListener("click", () => {
      if (!fant.sel.length) return;
      const labels = fant.sel.map((id) => TOPPINGS.find((t) => t.id === id).label.toLowerCase());
      cart.add({ name: "Fantasia", size: fant.size ? "Perhe" : "Normaali", note: labels.join(", "), price: FANTASIA_PRICE[fant.size] });
    });
    renderFantasia();
  }

  /* ---------------------------------------------------------
     Galleria / lightbox
     --------------------------------------------------------- */
  function initGallery() {
    const dlg = $("[data-lightbox]");
    if (!dlg || typeof dlg.showModal !== "function") return;
    const img = $("[data-lightbox-img]");
    const cap = $("[data-lightbox-cap]");
    $("[data-gallery]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-full]");
      if (!b) return;
      img.src = b.dataset.full;
      img.alt = $("img", b).alt;
      cap.textContent = $("span", b).textContent;
      dlg.showModal();
    });
    $("[data-lightbox-close]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------------------------------------------------------
     Kartta (Leaflet + OpenStreetMap)
     --------------------------------------------------------- */
  const POIS = [
    { name: "Aalto-keskus & kaupungintalo", ll: [62.9996742, 23.8223892] },
    { name: "Alajärven kirkko", ll: [63.0004185, 23.8254207] },
    { name: "Kaupunginkirjasto", ll: [62.9991618, 23.8239416] },
    { name: "Nelimarkka-museo", ll: [63.015022, 23.8350243] }
  ];

  function haversine(a, b) {
    const R = 6371, toR = (d) => d * Math.PI / 180;
    const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const fmtKm = (km) => km < 1 ? `${Math.round(km * 1000 / 10) * 10} m` : `${km.toLocaleString("fi-FI", { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
  function fmtMin(min) {
    const m = Math.max(1, Math.round(min));
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  }

  function routeLinks() {
    const [lat, lon] = ALBERT;
    const set = (k, url) => { const a = $(`[data-route="${k}"]`); if (a) a.href = url; };
    set("google", `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
    set("apple", `https://maps.apple.com/?daddr=${lat},${lon}&q=Pizzeria%20Albert`);
    set("waze", `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`);
  }

  function initNearbyList(onPick) {
    const ul = $("[data-nearby]");
    ul.innerHTML = POIS.map((p, i) => {
      const km = haversine(ALBERT, p.ll) * 1.3;
      return `<li><button data-poi="${i}"><span>${esc(p.name)}</span><b>${fmtKm(km)} · ${fmtMin(km / 5 * 60)} kävellen</b></button></li>`;
    }).join("");
    ul.addEventListener("click", (e) => {
      const b = e.target.closest("[data-poi]");
      if (!b) return;
      $$("button", ul).forEach((x) => x.classList.toggle("is-active", x === b));
      onPick(POIS[Number(b.dataset.poi)]);
    });
  }

  function initMap() {
    routeLinks();
    const el = $("#kartta");
    if (!el) return;
    if (typeof window.L === "undefined") {
      el.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;text-align:center;color:#fff8ec">
        <p>Karttaa ei voitu ladata.<br><a href="https://www.openstreetmap.org/?mlat=${ALBERT[0]}&mlon=${ALBERT[1]}#map=17/${ALBERT[0]}/${ALBERT[1]}" target="_blank" rel="noopener">Avaa sijainti OpenStreetMapissa →</a></p></div>`;
      initNearbyList(() => {});
      return;
    }
    const L = window.L;
    const mobile = L.Browser.mobile;
    const map = L.map(el, { scrollWheelZoom: false, dragging: !mobile, tap: !mobile, zoomControl: true }).setView(ALBERT, 16);
    map.zoomControl.setPosition("bottomright");

    // "Tumma" on sama OSM-pohja CSS-suodattimella, joten erillistä API-avainta ei tarvita
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>-tekijät" });
    const layers = {
      kartta: osm,
      tumma: osm,
      ilmakuva: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Kuvat &copy; Esri, Maxar, Earthstar Geographics" })
    };
    let current = layers.kartta.addTo(map);
    $$(".map-layers [data-layer]").forEach((b) => b.addEventListener("click", () => {
      const next = layers[b.dataset.layer];
      if (next !== current) { map.removeLayer(current); current = next.addTo(map); }
      el.classList.toggle("map-dark", b.dataset.layer === "tumma");
      $$(".map-layers [data-layer]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    }));

    const pin = L.divIcon({
      className: "albert-pin",
      html: '<span class="pin-pulse"></span><span class="pin-body"></span><span class="pin-pizza"></span>',
      iconSize: [56, 70], iconAnchor: [28, 68], popupAnchor: [0, -64]
    });
    const marker = L.marker(ALBERT, { icon: pin, title: "Pizzeria Albert", alt: "Pizzeria Albert", riseOnHover: true }).addTo(map);
    marker.bindPopup(`<strong>Pizzeria Albert</strong>Järvikatu 3 B, 62900 Alajärvi<br>
      <span data-popup-status></span><br>
      <a href="tel:+35865576310">${PHONE}</a> · <a href="https://www.google.com/maps/dir/?api=1&destination=${ALBERT[0]},${ALBERT[1]}" target="_blank" rel="noopener">Reittiohjeet →</a>`, { autoPan: false });
    marker.on("popupopen", renderHours);
    if (el.clientWidth > 520) setTimeout(() => marker.openPopup(), 400);

    // Rullazoomi / vetäminen vasta klikkauksen jälkeen, ettei sivun vieritys jumitu karttaan
    const hint = $("[data-map-hint]");
    if (mobile) hint.textContent = "Napauta karttaa liikuttaaksesi sitä";
    map.on("click focus", () => {
      map.scrollWheelZoom.enable();
      if (mobile) map.dragging.enable();
      hint.classList.add("hide");
    });
    el.addEventListener("mouseleave", () => { if (!mobile) { map.scrollWheelZoom.disable(); hint.classList.remove("hide"); } });

    const overlay = L.layerGroup().addTo(map);
    const showLine = (from, label, iconClass) => {
      overlay.clearLayers();
      L.marker(from, { icon: L.divIcon({ className: iconClass, iconSize: iconClass === "me-pin" ? [20, 20] : [16, 16] }) }).addTo(overlay).bindTooltip(label, { direction: "top", offset: [0, -10] });
      const line = L.polyline([from, ALBERT], { color: "#d7261e", weight: 4, dashArray: "8 10", opacity: .9 }).addTo(overlay);
      const km = haversine(from, ALBERT);
      line.bindTooltip(fmtKm(km * 1.3), { permanent: true, direction: "center", className: "dist-label" });
      map.flyToBounds(L.latLngBounds([from, ALBERT]).pad(0.35), { duration: .8, maxZoom: 17 });
      return km;
    };

    initNearbyList((poi) => { marker.closePopup(); showLine(poi.ll, poi.name, "poi-pin"); });

    $("[data-map-recenter]").addEventListener("click", () => {
      overlay.clearLayers();
      $$("[data-nearby] button").forEach((x) => x.classList.remove("is-active"));
      map.flyTo(ALBERT, 16, { duration: .8 });
      setTimeout(() => marker.openPopup(), 850);
    });

    const locBtn = $("[data-locate]");
    const err = $("[data-locate-error]");
    locBtn.addEventListener("click", () => {
      err.hidden = true;
      if (!("geolocation" in navigator)) { err.textContent = "Selaimesi ei tue sijainnin hakua."; err.hidden = false; return; }
      locBtn.disabled = true;
      locBtn.lastChild.textContent = "Haetaan sijaintia…";
      navigator.geolocation.getCurrentPosition((pos) => {
        locBtn.disabled = false;
        locBtn.lastChild.textContent = "Päivitä sijaintini";
        const me = [pos.coords.latitude, pos.coords.longitude];
        marker.closePopup();
        const km = showLine(me, "Sinä olet tässä", "me-pin");
        const road = km * 1.3;
        $("[data-distance]").hidden = false;
        $("[data-distance-km]").innerHTML = `Albertiin <span>${fmtKm(road)}</span>`;
        $("[data-eta-walk]").textContent = road > 60 ? "–" : fmtMin(road / 5 * 60);
        $("[data-eta-bike]").textContent = road > 120 ? "–" : fmtMin(road / 16 * 60);
        $("[data-eta-car]").textContent = fmtMin(road / (road < 5 ? 35 : 75) * 60);
      }, (e) => {
        locBtn.disabled = false;
        locBtn.lastChild.textContent = "Kuinka kaukana olen?";
        err.textContent = e.code === 1 ? "Sijainnin käyttö estettiin. Salli sijainti selaimen asetuksista ja yritä uudelleen." : "Sijaintia ei saatu juuri nyt. Yritä hetken päästä uudelleen.";
        err.hidden = false;
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    });

    // Kartan koko voi muuttua, kun fontit/kuvat latautuvat
    window.addEventListener("load", () => map.invalidateSize());
  }

  /* ---------------------------------------------------------
     Käynnistys
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
    initHeader();
    renderHours();
    setInterval(renderHours, 60 * 1000);
    initCart();
    initFavs();
    initMenu();
    initFantasia();
    initGallery();
    initMap();
  });
})();
