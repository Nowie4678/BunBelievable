// ===== DATA =====
const menuItems = [
    {
        id: 1, cat: "burgers", name: "Classic Cheeseburger", desc: "Beef patty, American cheese, house sauce", price: 1100,
        img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=70&w=480&auto=format&fit=crop"
    },
    {
        id: 2, cat: "burgers", popular: true, name: "Double Stack", desc: "Two patties, double cheese, pickles", price: 1450, discount: 15,
        img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=70&w=480&auto=format&fit=crop"
    },
    {
        id: 3, cat: "burgers", name: "Bacon Smash", desc: "Crispy bacon, smashed patty, BBQ glaze", price: 1350,
        img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=70&w=480&auto=format&fit=crop"
    },
    {
        id: 4, cat: "sides", name: "House Fries", desc: "Double-cooked, finished with house sauce", price: 580,
        img: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=70&w=480&auto=format&fit=crop"
    },
    {
        id: 5, cat: "sides", popular: true, name: "Angry Fries", desc: "Spicy seasoning, chili mayo drizzle", price: 700,
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=70&w=480&auto=format&fit=crop"
    },
    {
        id: 6, cat: "shakes", name: "Oreo Shake", desc: "Thick vanilla shake loaded with Oreo", price: 800, discount: 10,
        img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=70&w=480&auto=format&fit=crop"
    }
];

const testimonials = [
    {
        quote: "Honestly, the name isn't clickbait. The original BunBelievable double beef patty was dripping with flavour. Fast WhatsApp delivery to Westlands too!",
        name: "Happy Customer", role: "Westlands", stars: 5,
        initials: "HC", color: "#d62828"
    },
    {
        quote: "Ordered via WhatsApp for lunch at the office and it arrived hot within 30 minutes. The Big Cheesy is a total masterpiece if you love melted cheese. 10/10!",
        name: "Office Lunch Fan", role: "WhatsApp Order", stars: 5,
        initials: "OL", color: "#b45309"
    },
    {
        quote: "Nice buns, Great meat is an understatement! The hot-headed bun actually has a real kick to it and those golden fries are purely addictive. Best burger in town.",
        name: "Burger Lover", role: "Regular Customer", stars: 5,
        initials: "BL", color: "#161210"
    }
];

let cart = [];
let currentTestimonial = 0;

const galleryColors = ["#d62828", "#f4b400", "#161210", "#a81d1d", "#6b6058", "#e9a08a", "#f0c08a", "#221b17"];
const galleryImages = [
    "https://unsplash.com/photos/1TkhHPOubu4/download?force=true&w=600",
    "https://unsplash.com/photos/69J94IO_X3o/download?force=true&w=600",
    "https://unsplash.com/photos/It3PCKwUIeg/download?force=true&w=600",
    "https://unsplash.com/photos/y7FOtb-2eAM/download?force=true&w=600",
    "https://unsplash.com/photos/fbr7RVySrgI/download?force=true&w=600",
    "https://unsplash.com/photos/_uju2LIPCSg/download?force=true&w=600",
    "https://unsplash.com/photos/1TkhHPOubu4/download?force=true&w=600", // repeat, replace later
    "https://unsplash.com/photos/69J94IO_X3o/download?force=true&w=600"   // repeat, replace later
];

// ===== HELPERS =====
function formatKsh(amount) {
    return "KSh " + amount.toLocaleString();
}

// ===== DISCOUNTS =====
// Item discount: add  discount: 15  (percent) to any menu item above.
// Promo codes: edit this list. Codes are not case-sensitive.
const promoCodes = {
    BUN10: { type: "percent", value: 10, label: "10% off your order" },
    WELCOME200: { type: "fixed", value: 200, label: "KSh 200 off your order" },
    // Holiday codes only work between start and end. "banner" shows on the hero while active.
    MASHUJAA20: { type: "percent", value: 20, label: "20% off your order", banner: "Mashujaa Day Special: 20% off", start: "2026-10-19", end: "2026-10-20" },
    JAMHURI15: { type: "percent", value: 15, label: "15% off your order", banner: "Jamhuri Day Treat: 15% off", start: "2026-12-11", end: "2026-12-12" },
    XMAS20: { type: "percent", value: 20, label: "20% off your order", banner: "Christmas Feast: 20% off", start: "2026-12-20", end: "2026-12-26" }
};
let appliedPromo = null;

// Price after the item's own discount, rounded to the nearest KSh 10
function getPrice(item) {
    if (!item.discount) return item.price;
    return Math.round(item.price * (1 - item.discount / 100) / 10) * 10;
}

function getTotals() {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    let discount = 0;
    if (appliedPromo) {
        discount = appliedPromo.type === "percent"
            ? Math.round(subtotal * appliedPromo.value / 100)
            : Math.min(appliedPromo.value, subtotal);
    }
    const afterDiscount = subtotal - discount;
    let delivery = 0;
    if (cart.length && getOrderType() === "delivery" && afterDiscount < FREE_DELIVERY_OVER) {
        delivery = deliveryZones[document.getElementById("deliveryZone").value] || 0;
    }
    return { subtotal, discount, delivery, total: afterDiscount + delivery };
}

function renderTotals() {
    const t = getTotals();
    document.getElementById("cartSubtotal").textContent = formatKsh(t.subtotal);
    document.getElementById("cartDiscountRow").style.display = t.discount > 0 ? "flex" : "none";
    document.getElementById("cartDiscount").textContent = "- " + formatKsh(t.discount);
    const showDelivery = cart.length > 0 && getOrderType() === "delivery";
    document.getElementById("cartDeliveryRow").style.display = showDelivery ? "flex" : "none";
    document.getElementById("cartDelivery").textContent = t.delivery > 0 ? formatKsh(t.delivery) : "Free";
    document.getElementById("cartTotal").textContent = formatKsh(t.total);
}

function setPromoMessage(text, ok) {
    const msg = document.getElementById("promoMessage");
    msg.textContent = text;
    msg.className = "promo-message " + (ok ? "ok" : "error");
}

function applyPromo() {
    const input = document.getElementById("promoInput");
    const code = input.value.trim().toUpperCase();
    if (!code) return setPromoMessage("Enter a promo code.", false);
    if (cart.length === 0) return setPromoMessage("Add something to your order first.", false);

    const promo = promoCodes[code];
    if (!promo || !isPromoActive(promo)) {
        appliedPromo = null;
        renderTotals();
        return setPromoMessage("That code isn't valid or has expired.", false);
    }
    appliedPromo = { code, ...promo };
    renderTotals();
    setPromoMessage(`Code ${code} applied: ${promo.label}`, true);
}

function resetPromo() {
    appliedPromo = null;
    document.getElementById("promoInput").value = "";
    document.getElementById("promoMessage").textContent = "";
}

// Diet / allergy labels (only shown when an item has diet or allergens set)
function renderTags(item) {
    const diet = (item.diet || []).map(d => `<span class="tag tag-diet">?? ${d}</span>`);
    const allergens = (item.allergens || []).map(a => `<span class="tag">${a}</span>`);
    const all = diet.concat(allergens).join("");
    return all ? `<div class="menu-tags">${all}</div>` : "";
}

// ===== SHOP SETTINGS (edit these) =====
const WHATSAPP_NUMBER = "254717218062";   // orders are sent to this WhatsApp number
const FREE_DELIVERY_OVER = 3000;          // free delivery above this amount (KSh)
const deliveryZones = {                   // delivery fee per area (KSh)
    "Downtown": 150, "Riverside": 200, "Westlands": 200,
    "Karen": 300, "Thika Road": 250, "Kilimani": 200
};

// Opening hours (24-hour clock, Nairobi time). Edit to match your real hours.
const OPENING_HOURS = { open: 10, close: 22 };

// ===== COOKIE / BROWSER-STORAGE CONSENT =====
// "all" = visitor accepted, "essential" = declined optional storage, null = not chosen yet
const CONSENT_KEY = "bb_consent";
function getConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
function canStore() { return getConsent() === "all"; }
function clearSaved() {
    try { ["bb_cart", "bb_customer", "bb_reviews"].forEach(k => localStorage.removeItem(k)); } catch (e) { }
}

// Events and holiday offers. Past dates hide automatically. Edit freely.
const events = [
    { date: "2026-10-20", title: "Mashujaa Day Special", text: "20% off your order all day.", code: "MASHUJAA20" },
    { date: "2026-10-31", title: "Halloween Burger Night", text: "Spooky specials at all locations. Come in costume!" },
    { date: "2026-12-12", title: "Jamhuri Day Treat", text: "15% off your order.", code: "JAMHURI15" },
    { date: "2026-12-25", title: "Christmas Feast", text: "Festive burgers and family combos. Order early!", code: "XMAS20" }
];

function todayStr() { return new Date().toLocaleDateString("en-CA"); }   // YYYY-MM-DD

function isPromoActive(p) {
    const t = todayStr();
    return (!p.start || t >= p.start) && (!p.end || t <= p.end);
}

function getOrderType() {
    return document.querySelector('input[name="orderType"]:checked').value;
}

function renderPromoBanner() {
    const el = document.getElementById("heroPromo");
    const active = Object.entries(promoCodes).filter(([, p]) => p.banner && isPromoActive(p));
    if (!active.length) return;
    el.textContent = `?? ${active[0][1].banner} - use code ${active[0][0]}`;
    el.style.display = "inline-block";
}

function renderEvents() {
    const grid = document.getElementById("eventsGrid");
    const upcoming = events.filter(e => e.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
    if (!upcoming.length) {
        grid.innerHTML = `<p class="events-empty">New events and offers coming soon!</p>`;
        return;
    }
    grid.innerHTML = upcoming.map(e => {
        const d = new Date(e.date + "T00:00:00");
        return `
    <div class="event-card">
      <div class="event-date"><strong>${d.getDate()}</strong><span>${d.toLocaleDateString("en-GB", { month: "short" })}</span></div>
      <div class="event-body">
        <h3>${e.title}</h3>
        <p>${e.text}</p>
        ${e.code ? `<span class="event-code">Code: ${e.code}</span>` : ""}
      </div>
    </div>`;
    }).join("");
}

function initOrderForm() {
    const zone = document.getElementById("deliveryZone");
    zone.innerHTML = Object.entries(deliveryZones)
        .map(([name, fee]) => `<option value="${name}">${name} (${formatKsh(fee)})</option>`).join("");
    document.getElementById("deliveryHint").textContent = `Free delivery on orders over ${formatKsh(FREE_DELIVERY_OVER)}.`;

    const sync = () => {
        document.getElementById("deliveryFields").style.display = getOrderType() === "delivery" ? "flex" : "none";
        renderTotals();
    };
    document.querySelectorAll('input[name="orderType"]').forEach(r => r.addEventListener("change", sync));
    zone.addEventListener("change", renderTotals);
    sync();
}

// Sends the order to the shop's WhatsApp with everything pre-filled
function placeOrder() {
    if (cart.length === 0) return;
    const type = getOrderType();
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const zone = document.getElementById("deliveryZone").value;
    const notes = document.getElementById("custNotes").value.trim();

    if (!name || phone.replace(/\D/g, "").length < 9) return alert("Please enter your name and a valid phone number.");
    if (type === "delivery" && !address) return alert("Please enter your delivery address.");

    saveCustomer(name, phone);
    const t = getTotals();
    const lines = cart.map(i => `${i.qty} x ${i.name} - ${formatKsh(i.price * i.qty)}`);
    const msg = [
        "*New BunBelievable order*", "",
        ...lines, "",
        `Subtotal: ${formatKsh(t.subtotal)}`,
        t.discount > 0 ? `Discount (${appliedPromo.code}): -${formatKsh(t.discount)}` : null,
        type === "delivery" ? `Delivery (${zone}): ${t.delivery > 0 ? formatKsh(t.delivery) : "Free"}` : null,
        `*Total: ${formatKsh(t.total)}*`, "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        type === "delivery" ? `Deliver to: ${address}, ${zone}` : "Pickup",
        notes ? `Notes: ${notes}` : null
    ].filter(l => l !== null).join("\n");

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    cart = [];
    resetPromo();
    updateCartUI();
    closeCart();
}

// ===== RENDER MENU =====
function renderMenu() {
    const grid = document.getElementById("menuGrid");
    const list = activeCat === "all" ? menuItems : menuItems.filter(i => i.cat === activeCat);
    grid.innerHTML = list.map(item => `
    <div class="menu-card">
      <div class="menu-card-img">
        ${item.discount ? `<span class="discount-badge">-${item.discount}%</span>` : ""}
        ${item.popular ? `<span class="popular-badge">?? Popular</span>` : ""}
        <img class="fade" src="${item.img}" alt="${item.name}" width="480" height="320" loading="lazy" decoding="async"
             onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
      </div>
      <div class="menu-card-body">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        ${renderTags(item)}
        <div class="menu-card-footer">
          <span class="menu-card-prices">${item.discount ? `<span class="price-old">${formatKsh(item.price)}</span>` : ""}<span class="menu-card-price">${formatKsh(getPrice(item))}</span></span>
          <button class="btn-order" data-id="${item.id}">Add to Order</button>
        </div>
      </div>
    </div>
  `).join("");

    grid.querySelectorAll(".btn-order").forEach(btn => {
        btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id)));
    });
}

// ===== CART LOGIC =====
function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, price: getPrice(item), qty: 1 });
    }
    updateCartUI();
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(id);
    } else {
        updateCartUI();
    }
}

function updateCartUI() {
    saveCart();
    const countEl = document.getElementById("cartCount");
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    countEl.textContent = totalQty;
    countEl.style.display = totalQty > 0 ? "flex" : "none";

    const itemsEl = document.getElementById("cartItems");

    if (cart.length === 0) {
        itemsEl.innerHTML = `<p class="cart-empty">Your order is empty. Add something tasty!</p>`;
        renderTotals();
        return;
    }

    itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>${formatKsh(item.price)}</span>
      </div>
      <div class="cart-qty">
        <button class="qty-btn" data-action="dec" data-id="${item.id}">?</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
      </div>
    </div>
  `).join("");

    renderTotals();

    itemsEl.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const delta = btn.dataset.action === "inc" ? 1 : -1;
            changeQty(id, delta);
        });
    });
}

function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartOverlay").classList.add("open");
}

function closeCart() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("open");
}

function initCart() {
    document.getElementById("cartToggle").addEventListener("click", openCart);
    document.getElementById("cartClose").addEventListener("click", closeCart);
    document.getElementById("cartOverlay").addEventListener("click", closeCart);

    document.getElementById("promoBtn").addEventListener("click", applyPromo);
    document.getElementById("promoInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyPromo();
    });

    document.getElementById("checkoutBtn").addEventListener("click", placeOrder);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
}

// ===== RENDER GALLERY =====
function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = galleryImages.map((src, i) => `
    <div style="background:${galleryColors[i]};overflow:hidden">
      <img src="${src}" alt="Food photo" loading="lazy"
           style="width:100%;height:100%;object-fit:cover;display:block"
           onerror="this.remove()">
    </div>
  `).join("");
}

// ===== TESTIMONIALS =====
function renderTestimonials() {
    const track = document.getElementById("testimonialTrack");
    const dotsEl = document.getElementById("tDots");

    track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${"?".repeat(t.stars)}${"?".repeat(5 - t.stars)}</div>
      <p class="testimonial-quote">"${t.quote}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar" style="background:${t.color}">${t.initials}</div>
        <div>
          <h4>${t.name}</h4>
          <span>${t.role}</span>
        </div>
      </div>
    </div>
  `).join("");

    dotsEl.innerHTML = testimonials.map((_, i) =>
        `<button class="t-dot${i === currentTestimonial ? " active" : ""}" data-index="${i}" aria-label="Show review ${i + 1}"></button>`
    ).join("");

    dotsEl.querySelectorAll(".t-dot").forEach(dot => {
        dot.addEventListener("click", () => goToTestimonial(parseInt(dot.dataset.index)));
    });

    updateTestimonialView();
}

function updateTestimonialView() {
    const track = document.getElementById("testimonialTrack");
    track.style.transform = `translateX(-${currentTestimonial * 100}%)`;
    track.style.transition = "transform .4s ease";

    document.querySelectorAll(".t-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentTestimonial);
    });
}

function goToTestimonial(index) {
    currentTestimonial = (index + testimonials.length) % testimonials.length;
    updateTestimonialView();
}

function initTestimonialControls() {
    document.getElementById("tPrev").addEventListener("click", () => goToTestimonial(currentTestimonial - 1));
    document.getElementById("tNext").addEventListener("click", () => goToTestimonial(currentTestimonial + 1));

    // Auto-rotate every 6 seconds
    setInterval(() => goToTestimonial(currentTestimonial + 1), 6000);
}

// ===== HEADER SCROLL EFFECT =====
function initHeaderScroll() {
    const header = document.getElementById("siteHeader");
    const toTop = document.getElementById("toTop");
    let ticking = false;
    const update = () => {
        const y = window.scrollY;
        header.classList.toggle("scrolled", y > 40);
        toTop.classList.toggle("show", y > 700);
        ticking = false;
    };
    // Throttled with requestAnimationFrame and passive, so scrolling stays smooth
    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    update();
}

// ===== MOBILE NAV TOGGLE =====
function initNavToggle() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
    // Close menu when a link is clicked
    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => nav.classList.remove("open"));
    });
}

// ===== NEWSLETTER FORM =====
function initNewsletterForm() {
    const form = document.getElementById("newsletterForm");
    const emailInput = document.getElementById("newsletterEmail");
    const message = document.getElementById("formMessage");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (!email || !email.includes("@")) {
            message.textContent = "Please enter a valid email address.";
            return;
        }

        message.textContent = `Thanks! ${email} has been added to our list ??`;
        form.reset();
    });
}

// ===== MENU FILTERS =====
let activeCat = "all";
function initMenuFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => btn.addEventListener("click", () => {
        activeCat = btn.dataset.cat;
        buttons.forEach(b => {
            const on = b === btn;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", on);
        });
        renderMenu();
    }));
}

// ===== OPEN / CLOSED STATUS =====
function fmtHour(h) { return (h % 12 || 12) + " " + (h >= 12 ? "PM" : "AM"); }

function getOpenStatus() {
    const [h, m] = new Date()
        .toLocaleTimeString("en-GB", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit", hour12: false })
        .split(":").map(Number);
    const mins = (h % 24) * 60 + m;
    const isOpen = mins >= OPENING_HOURS.open * 60 && mins < OPENING_HOURS.close * 60;
    return {
        isOpen,
        text: isOpen ? `Open now · closes ${fmtHour(OPENING_HOURS.close)}` : `Closed · opens ${fmtHour(OPENING_HOURS.open)}`
    };
}

function initOpenStatus() {
    const el = document.getElementById("openStatus");
    const render = () => {
        const s = getOpenStatus();
        el.className = "open-status " + (s.isOpen ? "open" : "closed");
        el.innerHTML = `<span class="dot"></span>${s.text}`;
    };
    render();
    setInterval(render, 60000);
}

// ===== FAQ =====
function renderFaq() {
    const zones = Object.entries(deliveryZones).map(([n, f]) => `${n} ${formatKsh(f)}`).join(", ");
    const faqs = [
        ["How do I order?", "Tap “Add to Order” on any item, choose delivery or pickup, add your details and tap “Send Order on WhatsApp”. Your order goes straight to our WhatsApp."],
        ["How much is delivery?", `Delivery fees: ${zones}. Orders over ${formatKsh(FREE_DELIVERY_OVER)} get free delivery, and pickup is always free.`],
        ["Do you have promo codes?", "Yes! Check Events & Offers for current codes and enter them in the Promo code box in your order."],
        ["I have a food allergy. What should I do?", "Please write it in the Notes box when you order so we can advise you before your food is prepared."],
        ["What are your opening hours?", `We’re open every day from ${fmtHour(OPENING_HOURS.open)} to ${fmtHour(OPENING_HOURS.close)}.`]
    ];
    document.getElementById("faqList").innerHTML = faqs
        .map(([q, a]) => `<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join("");
}

// ===== SAVE BASKET & DETAILS (only if the visitor accepted cookies) =====
function saveCart() {
    try {
        if (canStore() && cart.length) {
            localStorage.setItem("bb_cart", JSON.stringify(cart.map(i => ({ id: i.id, qty: i.qty }))));
        } else {
            localStorage.removeItem("bb_cart");
        }
    } catch (e) { }
}

function loadCart() {
    if (!canStore()) return;
    try {
        const saved = JSON.parse(localStorage.getItem("bb_cart") || "[]");
        saved.forEach(s => {
            const item = menuItems.find(i => i.id === s.id);
            if (item && s.qty > 0) cart.push({ ...item, price: getPrice(item), qty: Math.min(s.qty, 20) });
        });
    } catch (e) { }
}

function saveCustomer(name, phone) {
    if (!canStore()) return;
    try { localStorage.setItem("bb_customer", JSON.stringify({ name, phone })); } catch (e) { }
}

function prefillCustomer() {
    if (!canStore()) return;
    try {
        const c = JSON.parse(localStorage.getItem("bb_customer") || "null");
        if (c) {
            document.getElementById("custName").value = c.name || "";
            document.getElementById("custPhone").value = c.phone || "";
        }
    } catch (e) { }
}

// ===== COOKIE BANNER =====
function initCookies() {
    const banner = document.getElementById("cookieBanner");
    const show = () => { banner.hidden = false; document.body.classList.add("cookie-open"); };
    const hide = () => { banner.hidden = true; document.body.classList.remove("cookie-open"); };
    const choose = (value) => {
        try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { }
        if (value === "all") saveCart(); else clearSaved();
        hide();
    };
    document.getElementById("cookieAccept").addEventListener("click", () => choose("all"));
    document.getElementById("cookieEssential").addEventListener("click", () => choose("essential"));
    document.getElementById("cookieSettings").addEventListener("click", show);
    if (!getConsent()) show();
}

// ===== FADE-IN ON SCROLL =====
function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
    }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
    document.querySelectorAll("section:not(.hero) .container").forEach(el => {
        el.classList.add("reveal");
        io.observe(el);
    });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    renderMenu();
    renderGallery();
    renderTestimonials();
    initTestimonialControls();
    initHeaderScroll();
    initNavToggle();
    initNewsletterForm();
    initCart();
    initOrderForm();
    renderEvents();
    renderPromoBanner();
    initMenuFilters();
    renderFaq();
    initOpenStatus();
    initCookies();
    initReveal();
    prefillCustomer();
    loadCart();
    updateCartUI();
});


/* =====================================================================
   BUNNY, THE BUNBELIEVABLE CHATBOT
   Helps customers pick food and collects reviews. Uses the menu, cart,
   promos, events and delivery settings defined above, so it always
   matches the rest of the site. Keep this section at the END of the file.
   ===================================================================== */
(function () {
    'use strict';

    const CONFIG = {
        botName: 'Bunny',
        reviewEndpoint: '',   // optional: URL that accepts POST JSON {rating, comment, name}
        aiEndpoint: ''        // optional: YOUR server that calls Claude. Never put an API key in this file.
    };

    // How each menu item behaves in the finder (keyed by id from menuItems)
    const PROFILE = {
        1: { kind: 'burger', mood: 'classic' },
        2: { kind: 'burger', mood: 'big' },
        3: { kind: 'burger', mood: 'smoky' },
        4: { kind: 'side', spicy: false },
        5: { kind: 'side', spicy: true },
        6: { kind: 'shake' }
    };

    const el = {};
    let pending = null;
    let review = {};

    /* ---------- tiny helpers ---------- */
    function make(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }
    function byKind(kind, pred) {
        return menuItems.find(i => PROFILE[i.id] && PROFILE[i.id].kind === kind && (!pred || pred(PROFILE[i.id])));
    }
    // script.js injects testimonials as raw HTML, so clean anything a visitor types
    function esc(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function say(text, who) {
        el.log.appendChild(make('div', 'bb-msg ' + (who || 'bot'), text));
        el.log.scrollTop = el.log.scrollHeight;
    }
    function setChips(list) {
        el.chips.textContent = '';
        list.forEach(c => {
            const b = make('button', 'bb-chip', c.label);
            b.type = 'button';
            b.addEventListener('click', () => { say(c.label, 'user'); c.go(); });
            el.chips.appendChild(b);
        });
    }
    function showItem(it) {
        const card = make('div', 'bb-card');
        const img = make('img');
        img.src = it.img; img.alt = it.name; img.loading = 'lazy';
        card.appendChild(img);
        const body = make('div', 'bb-card-body');
        body.appendChild(make('h4', '', it.name));
        body.appendChild(make('p', '', it.desc));
        const foot = make('div', 'bb-card-foot');
        const prices = make('span');
        if (it.discount) prices.appendChild(make('span', 'bb-old', formatKsh(it.price)));
        prices.appendChild(make('span', 'bb-price', formatKsh(getPrice(it))));
        const add = make('button', 'bb-add', 'Add to order');
        add.type = 'button';
        add.addEventListener('click', () => { addToCart(it.id); say(it.name + ' added to your order ??'); });
        foot.appendChild(prices);
        foot.appendChild(add);
        body.appendChild(foot);
        card.appendChild(body);
        el.log.appendChild(card);
        el.log.scrollTop = el.log.scrollHeight;
    }

    /* ---------- home ---------- */
    function home() {
        pending = null;
        setChips([
            { label: '?? Help me choose', go: startFinder },
            { label: '? Leave a review', go: startReview },
            { label: '?? Deals', go: deals },
            { label: '?? Delivery info', go: delivery },
            { label: '?? Show menu', go: showMenu }
        ]);
    }
    function showMenu() {
        say('Here’s everything we’ve got:');
        menuItems.forEach(showItem);
        home();
    }
    function delivery() {
        const zones = Object.keys(deliveryZones).map(z => z + ' ' + formatKsh(deliveryZones[z])).join(', ');
        say('Delivery fees: ' + zones + '.\nFree delivery on orders over ' + formatKsh(FREE_DELIVERY_OVER) +
            '. Pickup is free. Add items to your order and tap “Send Order on WhatsApp”.');
        home();
    }
    function deals() {
        const lines = [];
        menuItems.filter(i => i.discount).forEach(i => {
            lines.push('• ' + i.name + ': ' + i.discount + '% off, now ' + formatKsh(getPrice(i)));
        });
        Object.keys(promoCodes).forEach(c => {
            if (isPromoActive(promoCodes[c])) lines.push('• Code ' + c + ': ' + promoCodes[c].label);
        });
        events.filter(e => e.date >= todayStr()).slice(0, 2).forEach(e => {
            lines.push('• Coming up (' + e.date + '): ' + e.title + (e.code ? ', code ' + e.code : ''));
        });
        say(lines.length ? 'Right now:\n' + lines.join('\n') : 'No special offers today, but check back soon!');
        home();
    }

    /* ---------- food finder ---------- */
    function startFinder() {
        say('What are you craving?');
        setChips([
            { label: 'A burger', go: () => askMood(b => recommend([b])) },
            { label: 'Fries', go: () => askSpice(f => recommend([f])) },
            { label: 'A shake', go: () => recommend([byKind('shake')]) },
            { label: 'Full meal', go: () => askMood(b => askSpice(f => recommend([b, f, byKind('shake')]))) }
        ]);
    }
    function askMood(next) {
        say('What’s your burger mood?');
        const pick = mood => () => next(byKind('burger', p => p.mood === mood));
        setChips([
            { label: 'Classic & simple', go: pick('classic') },
            { label: 'Big & stacked', go: pick('big') },
            { label: 'Smoky with bacon', go: pick('smoky') }
        ]);
    }
    function askSpice(next) {
        say('Fries: mild or spicy?');
        const pick = sp => () => next(byKind('side', p => p.spicy === sp));
        setChips([
            { label: 'Mild (House Fries)', go: pick(false) },
            { label: 'Spicy (Angry Fries)', go: pick(true) }
        ]);
    }
    function recommend(list) {
        list = list.filter(Boolean);
        say(list.length > 1 ? 'Here’s the meal I’d build for you:' : 'I’d go for this:');
        list.forEach(showItem);
        const chips = [];
        if (list.length > 1) {
            const total = list.reduce((s, i) => s + getPrice(i), 0);
            say('Together that’s ' + formatKsh(total) + ' before delivery.');
            chips.push({
                label: 'Add all to my order',
                go: () => { list.forEach(i => addToCart(i.id)); say('All added. Check your order when you’re ready. ??'); }
            });
        }
        chips.push({ label: 'Start over', go: startFinder }, { label: 'Leave a review', go: startReview });
        setChips(chips);
    }

    /* ---------- reviews ---------- */
    function startReview() {
        review = {};
        say('We’d love your feedback. How many stars?');
        setChips([5, 4, 3, 2, 1].map(n => ({
            label: '?'.repeat(n),
            go: () => { review.rating = n; askComment(); }
        })));
    }
    function askComment() {
        say('Thanks! Tell us what you had and how it was. Type your review below.');
        setChips([]);
        pending = text => { review.comment = text.slice(0, 400); askName(); };
    }
    function askName() {
        say('What name should we show? (or skip)');
        setChips([{ label: 'Skip', go: () => { review.name = 'Happy Customer'; submitReview(); } }]);
        pending = text => { review.name = text.slice(0, 30); submitReview(); };
    }
    function addToCarousel(r) {
        const words = r.name.trim().split(/\s+/);
        const initials = (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
        testimonials.push({
            quote: esc(r.comment), name: esc(r.name), role: 'Chat review',
            stars: r.rating, initials: esc(initials), color: '#d62828'
        });
    }
    function submitReview() {
        pending = null;
        if (canStore()) try {
            const all = JSON.parse(localStorage.getItem('bb_reviews') || '[]');
            all.push(review);
            localStorage.setItem('bb_reviews', JSON.stringify(all));
        } catch (e) { /* storage unavailable */ }

        addToCarousel(review);
        renderTestimonials();
        goToTestimonial(testimonials.length - 1);

        if (CONFIG.reviewEndpoint) {
            fetch(CONFIG.reviewEndpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review)
            }).then(() => say('Review sent. Thank you, ' + review.name + '! ??'))
                .catch(() => say('We couldn’t send your review just now. Please try again in a moment.'));
        } else {
            const msg = '*New BunBelievable review*\nRating: ' + review.rating + '/5\nFrom: ' + review.name + '\n' + review.comment;
            window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
            say('Thank you, ' + review.name + '! WhatsApp should open with your review ready. Tap send to finish. ??');
        }
        home();
    }

    /* ---------- free text ---------- */
    function understand(text) {
        const t = text.toLowerCase();
        if (/review|feedback|rate us|complain|compliment/.test(t)) return startReview();
        if (/deal|promo|offer|discount|code|special/.test(t)) return deals();
        if (/opening|closing|hours|what time|open now|are you open/.test(t)) {
            const s = getOpenStatus();
            say('We’re open every day, ' + fmtHour(OPENING_HOURS.open) + ' to ' + fmtHour(OPENING_HOURS.close) + '. Right now: ' + s.text + '.');
            return home();
        }
        if (/deliver|pickup|pick up|how long|fee/.test(t)) return delivery();
        if (/allerg|halal|vegan|vegetarian|veggie|gluten|nut|chicken|dairy/.test(t)) {
            say('Our burgers are all beef, and I don’t have full allergen details. Please put any allergies or dietary needs in the Notes box when you order and we’ll advise you.');
            return home();
        }
        if (/menu|price|cost|how much|everything/.test(t)) return showMenu();
        if (/bacon|smoky|bbq/.test(t)) return recommend([byKind('burger', p => p.mood === 'smoky')]);
        if (/spicy|hot|chili|kick/.test(t)) return recommend([byKind('side', p => p.spicy)]);
        if (/shake|drink|oreo|sweet|dessert/.test(t)) return recommend([byKind('shake')]);
        if (/cheap|budget|affordable|least/.test(t)) {
            const cheapest = menuItems.filter(i => PROFILE[i.id].kind === 'burger')
                .sort((a, b) => getPrice(a) - getPrice(b))[0];
            return recommend([cheapest]);
        }
        if (/big|huge|starv|very hungry|double|stack/.test(t)) return recommend([byKind('burger', p => p.mood === 'big')]);
        if (/choose|recommend|suggest|what should|help me|hungry|best|craving/.test(t)) return startFinder();
        if (/^(hi|hello|hey|sasa|mambo|niaje)/.test(t)) {
            say('Hi! I’m ' + CONFIG.botName + '. Want help picking something tasty or leaving a review?');
            return home();
        }
        if (CONFIG.aiEndpoint) return askAI(text);
        say('I can help you pick a burger, show deals, share delivery info or take a review. What would you like?');
        home();
    }
    function askAI(text) {
        say('…');
        const thinking = el.log.lastChild;
        fetch(CONFIG.aiEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, menu: menuItems })
        }).then(r => r.json())
            .then(d => { thinking.textContent = d.reply || 'Sorry, I didn’t catch that.'; home(); })
            .catch(() => { thinking.textContent = 'I’m having trouble connecting. Try the buttons below.'; home(); });
    }

    /* ---------- build UI ---------- */
    function build() {
        el.launcher = make('button', 'bb-launcher', '?? Chat with ' + CONFIG.botName);
        el.launcher.setAttribute('aria-expanded', 'false');

        el.panel = make('div', 'bb-panel');   // a div, NOT a section: style.css pads every <section> by 90px
        el.panel.setAttribute('role', 'dialog');
        el.panel.setAttribute('aria-label', 'BunBelievable chat');
        const head = make('div', 'bb-head');
        const title = make('div');
        title.appendChild(make('strong', '', CONFIG.botName + ' at BunBelievable'));
        title.appendChild(make('span', '', 'Find your food or leave a review'));
        el.close = make('button', 'bb-close', '?');
        el.close.setAttribute('aria-label', 'Close chat');
        head.appendChild(title);
        head.appendChild(el.close);

        el.log = make('div', 'bb-log');
        el.log.setAttribute('aria-live', 'polite');
        el.chips = make('div', 'bb-chips');
        el.form = make('form', 'bb-form');
        el.input = make('input', 'bb-input');
        el.input.type = 'text';
        el.input.placeholder = 'Type a message…';
        el.input.setAttribute('aria-label', 'Message');
        const send = make('button', 'bb-send', 'Send');
        send.type = 'submit';
        el.form.appendChild(el.input);
        el.form.appendChild(send);

        [head, el.log, el.chips, el.form].forEach(n => el.panel.appendChild(n));
        document.body.appendChild(el.panel);
        document.body.appendChild(el.launcher);
    }
    function openPanel() {
        el.panel.classList.add('open');
        el.launcher.setAttribute('aria-expanded', 'true');
        if (!el.log.childNodes.length) {
            say('Hi, I’m ' + CONFIG.botName + ' ?? I can help you pick the perfect meal or take your review.');
            home();
        }
        el.input.focus();
    }
    function closePanel() {
        el.panel.classList.remove('open');
        el.launcher.setAttribute('aria-expanded', 'false');
    }

    // Registered after the main DOMContentLoaded handler above, so the page is ready
    document.addEventListener('DOMContentLoaded', () => {
        build();

        // Show reviews this visitor left on earlier visits
        if (canStore()) try {
            const saved = JSON.parse(localStorage.getItem('bb_reviews') || '[]');
            if (saved.length) { saved.forEach(addToCarousel); renderTestimonials(); }
        } catch (e) { /* ignore */ }

        el.launcher.addEventListener('click', () => el.panel.classList.contains('open') ? closePanel() : openPanel());
        el.close.addEventListener('click', closePanel);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
        el.form.addEventListener('submit', e => {
            e.preventDefault();
            const text = el.input.value.trim();
            if (!text) return;
            el.input.value = '';
            say(text, 'user');
            if (pending) { const p = pending; pending = null; p(text); } else { understand(text); }
        });
    });
})();