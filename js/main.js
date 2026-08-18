/* =========================================================
   HULLOR — main.js
   পণ্য রেন্ডার, কার্ট সিস্টেম, চেকআউট ও হিরো স্লাইডার
   ========================================================= */

// ⚠️ গুরুত্বপূর্ণ: এখানে আপনার Google Apps Script Web App URL বসান।
// README.md এ ধাপে ধাপে দেখানো আছে কীভাবে এই URL তৈরি করবেন।
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo5w43jvLEB7boUn3LEmA9_lI-oRbTGtXUZ1lsEv7uMNsccDT0Gm3S5n9KaPsg-FNE/exec";

// হোয়াটসঅ্যাপ নম্বর (৮৮ কান্ট্রি কোডসহ, প্রথমে ০ ছাড়া)
const WHATSAPP_NUMBER = "8801863709122";
const STORE_PHONE_DISPLAY = "০১৮৬৩৭-০৯১২২";

// ------- state -------
let cart = loadCart();
let activeCategory = "all";
let selectedSizeByProduct = {};

// ------- helpers -------
const bdt = (n) => "৳" + n.toLocaleString("bn-BD");
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function bnDigits(n) {
  const map = { 0: "০", 1: "১", 2: "২", 3: "৩", 4: "৪", 5: "৫", 6: "৬", 7: "৭", 8: "৮", 9: "৯" };
  return String(n).replace(/[0-9]/g, (d) => map[d]);
}

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// প্রতিটি হোয়াটসঅ্যাপ বাটনের নিজস্ব উদ্দেশ্য অনুযায়ী আলাদা বার্তা
const WA_MESSAGES = {
  order: "আসসালামু আলাইকুম, আমি HULLOR থেকে একটি অর্ডার করতে চাই।",
  track: "আসসালামু আলাইকুম, আমি আমার HULLOR অর্ডারটি ট্র্যাক করতে চাই।\nঅর্ডার আইডি / মোবাইল নম্বর: ",
  return: "আসসালামু আলাইকুম, আমি একটি HULLOR পণ্য রিটার্ন/এক্সচেঞ্জ করতে চাই।\nঅর্ডার আইডি: \nকারণ: ",
  support: "আসসালামু আলাইকুম, HULLOR সম্পর্কে আমার কিছু জিজ্ঞাসা আছে।",
};

/* =========================================================
   কার্ট পার্সিস্ট (localStorage) — পেজ পরিবর্তন করলেও কার্ট থেকে যাবে
   ========================================================= */
function loadCart() {
  try {
    const raw = localStorage.getItem("hullor_cart");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveCart() {
  try {
    localStorage.setItem("hullor_cart", JSON.stringify(cart));
  } catch (e) {
    /* localStorage অনুপলব্ধ হলেও সাইট চলবে, শুধু কার্ট পেজ পরিবর্তনে ধরে রাখবে না */
  }
}

/* =========================================================
   হিরো ইমেজ স্লাইডার (৩টি ছবি)
   ========================================================= */
const HERO_SLIDES = [
  { image: "/images/hero_slider_punjabi.jpg", title: "নতুন পাঞ্জাবি কালেকশন", link: "/shop?category=punjabi" },
  { image: "/images/hero_slider_shirt.jpg", title: "সিগনেচার শার্ট সিরিজ", link: "/shop?category=shirt" },
  { image: "/images/hero_slider_dropshoulder.jpg", title: "ট্রেন্ডি ড্রপ শোল্ডার", link: "/shop?category=dropshoulder" },
];
let heroSlideIndex = 0;
let heroSlideTimer = null;

function initHeroSlider() {
  const wrap = $("#heroSlider");
  if (!wrap) return;

  const track = $("#heroSlideTrack");
  const dotsWrap = $("#heroSlideDots");
  const titleEl = $("#heroSlideTitle");

  track.innerHTML = HERO_SLIDES.map(
    (s, i) =>
      `<a class="hero-slide" data-i="${i}" href="${s.link || "/shop"}"><img src="${s.image}" alt="${s.title}" draggable="false" onerror="this.src='/images/logo.jpg'"></a>`
  ).join("");

  dotsWrap.innerHTML = HERO_SLIDES.map(
    (_, i) => `<button class="hero-dot ${i === 0 ? "active" : ""}" data-i="${i}" aria-label="স্লাইড ${bnDigits(i + 1)}"></button>`
  ).join("");

  titleEl.textContent = HERO_SLIDES[0].title;
  titleEl.href = HERO_SLIDES[0].link || "/shop";

  $$(".hero-dot", dotsWrap).forEach((dot) => {
    dot.addEventListener("click", () => goToHeroSlide(Number(dot.dataset.i)));
  });

  wireHeroSwipe(track);
  startHeroAutoplay();
}

/* ম্যানুয়াল সোয়াইপ/ড্র্যাগ (টাচ ও মাউস দুটোতেই কাজ করে) —
   ছোট নড়াচড়া = ট্যাপ (স্লাইডের লিংকে চলে যাবে), বড় নড়াচড়া = সোয়াইপ (স্লাইড বদলাবে, লিংকে যাবে না) */
function wireHeroSwipe(track) {
  const SWIPE_THRESHOLD = 45;
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  let moved = false;

  const onStart = (x) => {
    dragging = true;
    moved = false;
    startX = x;
    currentX = x;
    clearInterval(heroSlideTimer);
  };
  const onMove = (x) => {
    if (!dragging) return;
    currentX = x;
    if (Math.abs(currentX - startX) > 8) moved = true;
  };
  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    const delta = currentX - startX;
    if (delta > SWIPE_THRESHOLD) {
      goToHeroSlide((heroSlideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    } else if (delta < -SWIPE_THRESHOLD) {
      goToHeroSlide((heroSlideIndex + 1) % HERO_SLIDES.length);
    } else {
      startHeroAutoplay();
    }
  };

  track.addEventListener("touchstart", (e) => onStart(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", onEnd);

  track.addEventListener("mousedown", (e) => {
    e.preventDefault();
    onStart(e.clientX);
  });
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onEnd);

  // সোয়াইপ হয়ে থাকলে (moved === true) স্লাইডের লিংকে ক্লিক-নেভিগেশন আটকে দেওয়া হচ্ছে
  $$(".hero-slide", track).forEach((a) => {
    a.addEventListener("click", (e) => {
      if (moved) e.preventDefault();
    });
  });
}

function goToHeroSlide(i) {
  heroSlideIndex = i;
  const track = $("#heroSlideTrack");
  track.style.transform = `translateX(-${i * 100}%)`;
  $$(".hero-dot").forEach((d) => d.classList.toggle("active", Number(d.dataset.i) === i));
  const titleEl = $("#heroSlideTitle");
  titleEl.textContent = HERO_SLIDES[i].title;
  titleEl.href = HERO_SLIDES[i].link || "/shop";
  restartHeroAutoplay();
}

function startHeroAutoplay() {
  heroSlideTimer = setInterval(() => {
    goToHeroSlide((heroSlideIndex + 1) % HERO_SLIDES.length);
  }, 4200);
}
function restartHeroAutoplay() {
  clearInterval(heroSlideTimer);
  startHeroAutoplay();
}

/* =========================================================
   ক্যাটাগরি ট্যাব রেন্ডার (শুধু শপ পেজে)
   ========================================================= */
/* =========================================================
   ক্যাটাগরি URL সিঙ্ক — /shop?category=shirt এর মতো লিংক শেয়ারযোগ্য করার জন্য
   ========================================================= */
function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category");
  if (cat && CATEGORIES.some((c) => c.id === cat)) return cat;
  return "all";
}

function setCategoryInURL(cat) {
  const url = new URL(window.location.href);
  if (cat === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", cat);
  }
  window.history.replaceState({}, "", url.pathname + url.search);
}

function renderCategoryTabs() {
  const wrap = $("#catTabs");
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map(
    (c) => `<button class="cat-tab ${c.id === activeCategory ? "active" : ""}" data-cat="${c.id}">${c.name}</button>`
  ).join("");
  $$(".cat-tab", wrap).forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      setCategoryInURL(activeCategory);
      renderCategoryTabs();
      renderProducts();
    });
  });
}

/* =========================================================
   প্রোডাক্ট কার্ড HTML
   ========================================================= */
function productCardHTML(p) {
  const catName = CATEGORIES.find((c) => c.id === p.category)?.name || "";
  const selectedSize = selectedSizeByProduct[p.id];
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : null;
  return `
    <div class="p-card" data-id="${p.id}">
      <div class="p-media" data-role="view" style="cursor:pointer;">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='/images/logo.jpg'">
        ${discount ? `<span class="p-badge">${bnDigits(discount)}% ছাড়</span>` : ""}
      </div>
      <div class="p-body">
        <span class="p-cat">${catName}</span>
        <h3 class="p-name" data-role="view" style="cursor:pointer;">${p.name}</h3>
        <span class="p-code">কোড: ${p.code}</span>
        <div class="p-price-row">
          <span class="p-price">${bdt(p.price)}</span>
          ${p.oldPrice ? `<span class="p-price-old">${bdt(p.oldPrice)}</span>` : ""}
        </div>
        <div class="p-sizes" data-role="sizes">
          ${p.sizes
            .map(
              (s) =>
                `<button type="button" class="size-chip ${selectedSize === s ? "selected" : ""}" data-size="${s}">${s}</button>`
            )
            .join("")}
        </div>
        <div class="p-dashline"></div>
        <div class="p-btn-row">
          <button class="btn-view-details" data-role="view">বিস্তারিত দেখুন</button>
          <button class="add-cart-btn" data-role="add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            কার্টে যোগ করুন
          </button>
        </div>
      </div>
    </div>`;
}

function wireProductCard(card) {
  const id = card.dataset.id;
  $$(".size-chip", card).forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedSizeByProduct[id] = chip.dataset.size;
      $$(".size-chip", card).forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
    });
  });
  $('[data-role="add"]', card).addEventListener("click", () => addToCart(id));
  $$('[data-role="view"]', card).forEach((el) => el.addEventListener("click", () => openProductModal(id)));
}

/* =========================================================
   ওভারলে ম্যানেজার — বডি স্ক্রল লক + মোবাইল ব্যাক বাটনে শুধু ডায়ালগ বন্ধ হবে,
   পেজ থেকে বের হয়ে যাবে না
   ========================================================= */
let historyPushedForOverlay = false;
let overlayReleaseTimer = null;

function anyOverlayOpen() {
  return (
    $("#cartDrawer")?.classList.contains("open") ||
    $("#checkoutModal")?.classList.contains("open") ||
    $("#productModal")?.classList.contains("open")
  );
}

function syncOverlayState() {
  const isOpen = anyOverlayOpen();
  document.body.classList.toggle("scroll-lock", isOpen);

  if (isOpen) {
    if (overlayReleaseTimer) {
      clearTimeout(overlayReleaseTimer);
      overlayReleaseTimer = null;
    }
    if (!historyPushedForOverlay) {
      history.pushState({ hullorOverlay: true }, "");
      historyPushedForOverlay = true;
    }
  } else {
    // সাথে সাথে হিস্ট্রি স্টেট সরানো হচ্ছে না — যদি একই মুহূর্তে অন্য একটা ওভারলে খোলে
    // (যেমন প্রোডাক্ট মোডাল থেকে কার্ট ড্রয়ারে ট্রানজিশন), তাহলে এই রিলিজ বাতিল হয়ে যাবে
    overlayReleaseTimer = setTimeout(() => {
      overlayReleaseTimer = null;
      if (historyPushedForOverlay) {
        historyPushedForOverlay = false;
        if (history.state && history.state.hullorOverlay) {
          history.back();
        }
      }
    }, 0);
  }
}

function closeAllOverlaysSilently() {
  $("#cartDrawer")?.classList.remove("open");
  $("#checkoutModal")?.classList.remove("open");
  $("#productModal")?.classList.remove("open");
  $("#overlay")?.classList.remove("open");
  document.body.classList.remove("scroll-lock");
}

window.addEventListener("popstate", () => {
  // ব্যাক বাটনে চাপলে খোলা ড্রয়ার/মোডাল বন্ধ হয়ে যাবে, পেজ থেকে বের হবে না
  if (historyPushedForOverlay) {
    historyPushedForOverlay = false;
    if (overlayReleaseTimer) {
      clearTimeout(overlayReleaseTimer);
      overlayReleaseTimer = null;
    }
    closeAllOverlaysSilently();
  }
});

/* =========================================================
   প্রোডাক্ট ডিটেইলস (কুইক-ভিউ) মোডাল — প্রতিটি পণ্যের নিজস্ব বিস্তারিত তথ্য
   ========================================================= */
let activeModalProductId = null;

function openProductModal(productId) {
  const modal = $("#productModal");
  if (!modal) return;
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return;

  activeModalProductId = productId;
  const catName = CATEGORIES.find((c) => c.id === p.category)?.name || "";
  const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : null;
  const selectedSize = selectedSizeByProduct[p.id];

  $("#pmImage").src = p.image;
  $("#pmImage").alt = p.name;
  $("#pmCat").textContent = catName;
  $("#pmName").textContent = p.name;
  $("#pmCode").textContent = "কোড: " + p.code;
  $("#pmPrice").textContent = bdt(p.price);
  $("#pmOldPrice").textContent = p.oldPrice ? bdt(p.oldPrice) : "";
  $("#pmOldPrice").style.display = p.oldPrice ? "inline" : "none";
  $("#pmBadge").textContent = discount ? `${bnDigits(discount)}% ছাড়` : "";
  $("#pmBadge").style.display = discount ? "inline-flex" : "none";
  $("#pmDesc").textContent = p.desc || "";

  $("#pmSpecs").innerHTML = `
    ${p.fabric ? `<div class="pm-spec-row"><span>ফেব্রিক</span><b>${p.fabric}</b></div>` : ""}
    ${p.fit ? `<div class="pm-spec-row"><span>ফিট</span><b>${p.fit}</b></div>` : ""}
    ${p.care ? `<div class="pm-spec-row"><span>কেয়ার নির্দেশনা</span><b>${p.care}</b></div>` : ""}
    <div class="pm-spec-row"><span>ডেলিভারি</span><b>ফ্রি (সারা বাংলাদেশ)</b></div>
    <div class="pm-spec-row"><span>পেমেন্ট</span><b>ক্যাশ অন ডেলিভারি</b></div>
  `;

  $("#pmSizes").innerHTML = p.sizes
    .map((s) => `<button type="button" class="size-chip ${selectedSize === s ? "selected" : ""}" data-size="${s}">${s}</button>`)
    .join("");
  $$(".size-chip", $("#pmSizes")).forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedSizeByProduct[p.id] = chip.dataset.size;
      $$(".size-chip", $("#pmSizes")).forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      // কার্ডেও সিলেকশন সিঙ্ক করুন
      const card = document.querySelector(`.p-card[data-id="${p.id}"]`);
      if (card) {
        $$(".size-chip", card).forEach((c) => c.classList.toggle("selected", c.dataset.size === chip.dataset.size));
      }
    });
  });

  modal.classList.add("open");
  $("#overlay")?.classList.add("open");
  $("#cartDrawer")?.classList.remove("open");
  syncOverlayState();
}

function closeProductModal() {
  $("#productModal")?.classList.remove("open");
  $("#overlay")?.classList.remove("open");
  syncOverlayState();
}

/* =========================================================
   শপ পেজ — সম্পূর্ণ গ্রিড (ক্যাটাগরি ফিল্টারসহ)
   ========================================================= */
function renderProducts() {
  const grid = $("#productGrid");
  if (!grid) return;
  const list = activeCategory === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
  grid.innerHTML = list.map(productCardHTML).join("");
  $$(".p-card", grid).forEach(wireProductCard);
}

/* =========================================================
   হোম পেজ — ফিচার্ড প্রোডাক্ট
   ========================================================= */
function renderFeaturedProducts() {
  const grid = $("#featuredGrid");
  if (!grid) return;
  const list = PRODUCTS.filter((p) => p.featured);
  grid.innerHTML = list.map(productCardHTML).join("");
  $$(".p-card", grid).forEach(wireProductCard);
}

/* =========================================================
   কার্ট লজিক
   ========================================================= */
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const size = selectedSizeByProduct[productId];

  if (!size) {
    showToast("দয়া করে প্রথমে একটি সাইজ বেছে নিন", true);
    return false;
  }

  const existing = cart.find((i) => i.id === productId && i.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty: 1,
    });
  }
  saveCart();
  renderCart();
  updateCartCount();
  openCart();
  return true;
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartCount();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartCount();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}
function cartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function updateCartCount() {
  const el = $("#cartCount");
  if (!el) return;
  el.textContent = bnDigits(cartCount());
  el.style.display = cartCount() > 0 ? "flex" : "none";
}

function renderCart() {
  const body = $("#drawerBody");
  const foot = $("#drawerFoot");
  if (!body || !foot) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>আপনার কার্ট এখনো খালি</p>
      </div>`;
    foot.innerHTML = "";
    return;
  }

  body.innerHTML = cart
    .map(
      (item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/logo.jpg'">
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-meta">সাইজ: ${item.size} • কোড: ${item.code}</p>
        <div class="qty-stepper">
          <button data-act="dec" data-idx="${idx}">−</button>
          <span>${bnDigits(item.qty)}</span>
          <button data-act="inc" data-idx="${idx}">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">${bdt(item.price * item.qty)}</span>
        <button class="remove-btn" data-act="remove" data-idx="${idx}">সরান</button>
      </div>
    </div>`
    )
    .join("");

  $$("[data-act]", body).forEach((btn) => {
    const idx = Number(btn.dataset.idx);
    btn.addEventListener("click", () => {
      if (btn.dataset.act === "inc") changeQty(idx, 1);
      if (btn.dataset.act === "dec") changeQty(idx, -1);
      if (btn.dataset.act === "remove") removeItem(idx);
    });
  });

  foot.innerHTML = `
    <div class="summary-row"><span>সাবটোটাল</span><b>${bdt(cartTotal())}</b></div>
    <div class="summary-row"><span>ডেলিভারি চার্জ</span><b>ফ্রি (সারা বাংলাদেশ)</b></div>
    <div class="summary-total"><span>সর্বমোট</span><span>${bdt(cartTotal())}</span></div>
    <button class="btn btn-gold btn-full" id="checkoutBtn">চেকআউট করুন</button>
  `;
  $("#checkoutBtn").addEventListener("click", () => {
    closeCart();
    openCheckout();
  });
}

/* =========================================================
   ড্রয়ার / মোডাল টগল
   ========================================================= */
function openCart() {
  closeProductModal();
  $("#overlay")?.classList.add("open");
  $("#cartDrawer")?.classList.add("open");
  syncOverlayState();
}
function closeCart() {
  $("#overlay")?.classList.remove("open");
  $("#cartDrawer")?.classList.remove("open");
  syncOverlayState();
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("চেকআউট করার আগে কার্টে পণ্য যোগ করুন", true);
    return;
  }
  closeProductModal();
  renderOrderSummary();
  $("#checkoutModal")?.classList.add("open");
  $("#overlay")?.classList.add("open");
  syncOverlayState();
}
function closeCheckout() {
  $("#checkoutModal")?.classList.remove("open");
  $("#overlay")?.classList.remove("open");
  syncOverlayState();
}

function renderOrderSummary() {
  const box = $("#orderSummaryBox");
  if (!box) return;
  box.innerHTML =
    cart
      .map(
        (i) =>
          `<div class="summary-row"><span>${i.name} (${i.size}) × ${bnDigits(i.qty)}</span><b>${bdt(i.price * i.qty)}</b></div>`
      )
      .join("") +
    `<div class="summary-row"><span>ডেলিভারি চার্জ</span><b>ফ্রি</b></div>
     <div class="summary-total"><span>সর্বমোট</span><span>${bdt(cartTotal())}</span></div>`;
}

/* =========================================================
   টোস্ট
   ========================================================= */
function showToast(msg, isWarning = false) {
  const wrap = $("#toastWrap");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.style.borderColor = isWarning ? "var(--danger)" : "var(--gold)";
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* =========================================================
   চেকআউট ফর্ম সাবমিট
   ========================================================= */
function validatePhone(phone) {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^01[3-9]\d{8}$/.test(cleaned);
}

function generateOrderId() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HL-${stamp}-${rand}`;
}

function submitOrder(e) {
  e.preventDefault();

  const name = $("#custName").value.trim();
  const phone = $("#custPhone").value.trim();
  const district = $("#custDistrict").value.trim();
  const address = $("#custAddress").value.trim();
  const note = $("#custNote").value.trim();

  let valid = true;
  if (!name) { $("#errName").textContent = "নাম আবশ্যক"; valid = false; } else { $("#errName").textContent = ""; }
  if (!validatePhone(phone)) { $("#errPhone").textContent = "সঠিক মোবাইল নম্বর দিন (উদাহরণ: 01XXXXXXXXX)"; valid = false; } else { $("#errPhone").textContent = ""; }
  if (!district) { $("#errDistrict").textContent = "জেলার নাম আবশ্যক"; valid = false; } else { $("#errDistrict").textContent = ""; }
  if (!address) { $("#errAddress").textContent = "সম্পূর্ণ ঠিকানা আবশ্যক"; valid = false; } else { $("#errAddress").textContent = ""; }

  if (!valid) return;

  const orderId = generateOrderId();
  const productsStr = cart.map((i) => `${i.name} (${i.code}) | সাইজ:${i.size} | পরিমাণ:${i.qty} | ${i.price * i.qty}৳`).join("  ||  ");
  const productCodesStr = cart.map((i) => `${i.code} (x${i.qty})`).join(", ");

  const payload = { orderId, name, phone, district, address, note, products: productsStr, productCodes: productCodesStr, total: cartTotal() };

  const submitBtn = $("#submitOrderBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "অর্ডার পাঠানো হচ্ছে...";

  // no-cors মোডে রেসপন্স পড়া যায় না (opaque), তাই fetch শেষ হওয়ার জন্য অপেক্ষা না করে
  // ব্যাকগ্রাউন্ডে পাঠিয়ে সাথে সাথেই সাকসেস দেখানো হচ্ছে — এতে অর্ডার কনফার্মেশন অনেক দ্রুত হয়।
  if (!APPS_SCRIPT_URL.includes("আপনার_ডিপ্লয়মেন্ট_আইডি")) {
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Order sync failed:", err));
  } else {
    console.warn("APPS_SCRIPT_URL সেট করা হয়নি — js/main.js ফাইলে URL বসান। README.md দেখুন।");
  }

  showSuccess(orderId, payload);
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  $("#checkoutForm").reset();
  submitBtn.disabled = false;
  submitBtn.textContent = "অর্ডার কনফার্ম করুন";
}

function showSuccess(orderId, payload) {
  $("#checkoutFormView").style.display = "none";
  $("#successView").style.display = "block";
  $("#successOrderId").textContent = orderId;

  const waText =
    `HULLOR — নতুন অর্ডার\n` +
    `অর্ডার আইডি: ${orderId}\n` +
    `নাম: ${payload.name}\n` +
    `মোবাইল: ${payload.phone}\n` +
    `ঠিকানা: ${payload.address}, ${payload.district}\n` +
    `পণ্য: ${payload.products}\n` +
    `সর্বমোট: ${payload.total}৳ (ক্যাশ অন ডেলিভারি)`;

  const waBtn = $("#successWhatsappBtn");
  if (waBtn) waBtn.href = waLink(waText);
}

/* =========================================================
   ইনিট
   ========================================================= */
function init() {
  // whatsapp লিংক বসানো (যেখানেই data-wa-order আছে) — প্রতিটি বাটনের নিজস্ব উদ্দেশ্য অনুযায়ী আলাদা মেসেজ
  $$("[data-wa-order]").forEach((a) => {
    const purpose = a.dataset.waOrder || "order";
    const msg = WA_MESSAGES[purpose] || WA_MESSAGES.order;
    a.href = waLink(msg);
  });
  const topbarPhone = $("#topbarPhone");
  if (topbarPhone) topbarPhone.textContent = STORE_PHONE_DISPLAY;
  const topbarPhone2 = $("#topbarPhone2");
  if (topbarPhone2) topbarPhone2.textContent = STORE_PHONE_DISPLAY;

  activeCategory = getCategoryFromURL();

  initHeroSlider();
  renderCategoryTabs();
  renderProducts();
  renderFeaturedProducts();
  renderCart();
  updateCartCount();

  $("#cartIconBtn")?.addEventListener("click", openCart);
  $("#drawerCloseBtn")?.addEventListener("click", closeCart);
  $("#overlay")?.addEventListener("click", () => {
    closeCart();
    closeCheckout();
    closeProductModal();
  });

  $("#modalCloseBtn")?.addEventListener("click", closeCheckout);
  $("#checkoutForm")?.addEventListener("submit", submitOrder);

  $("#pmCloseBtn")?.addEventListener("click", closeProductModal);
  $("#pmAddCartBtn")?.addEventListener("click", () => {
    if (!activeModalProductId) return;
    // addToCart() নিজেই সফল হলে openCart() কল করে, যা প্রোডাক্ট মোডাল বন্ধ করে দেয়।
    // সাইজ বাছাই না করলে addToCart() false রিটার্ন করে এবং মোডাল খোলাই থাকে —
    // যাতে ইউজার এরর দেখে সাইজ বেছে আবার চেষ্টা করতে পারে।
    addToCart(activeModalProductId);
  });

  $("#menuToggle")?.addEventListener("click", () => {
    $("#navLinks").classList.toggle("open");
  });
  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => $("#navLinks")?.classList.remove("open"))
  );

  $("#successCloseBtn")?.addEventListener("click", () => {
    closeCheckout();
    $("#checkoutFormView").style.display = "block";
    $("#successView").style.display = "none";
  });

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = bnDigits(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", init);