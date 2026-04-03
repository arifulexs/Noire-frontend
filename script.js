/**
 * NOIRE — Main Frontend Script (Fully Integrated)
 *
 * Modules:
 *  1.  Auth state (nav shows Sign In / Account based on login)
 *  2.  Toast notifications
 *  3.  Loading screen
 *  4.  Custom cursor
 *  5.  Navbar (scroll, hamburger, smooth scroll)
 *  6.  Scroll reveal (IntersectionObserver)
 *  7.  Parallax (hero)
 *  8.  Counter animation
 *  9.  Scroll spy (active nav highlight)
 * 10.  Custom canvas swatch picker
 * 11.  Scarcity counter (live UI ticker)
 * 12.  Cart (localStorage — works without login)
 * 13.  Cart drawer (open/close/render)
 * 14.  Coupon validation (real API call)
 * 15.  Checkout modal (real API order placement)
 * 16.  Load products from API (replaces static HTML)
 * 17.  Contact / inquiry form → routes to Messages
 * 18.  Newsletter form
 * 19.  Quick view
 * 20.  Post-login redirect helper
 */

'use strict';

/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */

/**
 * IMPORTANT FOR DEPLOYMENT:
 * In development this works as-is (Express serves both API + frontend).
 * After deploying to Render + Vercel, change this one line:
 *   const API = 'https://YOUR-APP-NAME.onrender.com/api';
 */
const API   = 'https://noire-backend-i2bq.onrender.com/';
const TOKEN = () => localStorage.getItem('noire_token');
const USER  = () => { try { return JSON.parse(localStorage.getItem('noire_user') || 'null'); } catch { return null; } };

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const raf = requestAnimationFrame.bind(window);

/* ═══════════════════════════════════════
   1. AUTH STATE
═══════════════════════════════════════ */
function initAuth() {
  const user      = USER();
  const guestNav  = $('#nav-auth-guest');
  const userNav   = $('#nav-auth-user');
  const nameEl    = $('#nav-user-name');

  if (user && TOKEN()) {
    guestNav?.style && (guestNav.style.display = 'none');
    userNav?.style  && (userNav.style.display  = 'flex');
    if (nameEl) nameEl.textContent = user.name.split(' ')[0];
  } else {
    guestNav?.style && (guestNav.style.display = 'flex');
    userNav?.style  && (userNav.style.display  = 'none');
  }
}

/* ═══════════════════════════════════════
   2. TOAST
═══════════════════════════════════════ */
function showToast(msg, dur = 3200) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), dur);
}

/* ═══════════════════════════════════════
   3. LOADER
═══════════════════════════════════════ */
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;
  document.body.classList.add('loading');
  const start = Date.now();

  window.addEventListener('load', () => {
    const wait = Math.max(0, 1800 - (Date.now() - start));
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, wait);
  });
}

/* ═══════════════════════════════════════
   4. CUSTOM CURSOR
═══════════════════════════════════════ */
function initCursor() {
  const cursor = $('#custom-cursor');
  if (!cursor) return;

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  const dot  = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  let mX = 0, mY = 0, rX = 0, rY = 0;

  document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    dot.style.left = mX + 'px'; dot.style.top = mY + 'px';
  });

  (function track() {
    rX += (mX - rX) * 0.12; rY += (mY - rY) * 0.12;
    ring.style.left = rX + 'px'; ring.style.top = rY + 'px';
    raf(track);
  })();

  const hovers = 'a, button, .product-card, .tool-swatch, input, textarea, select, label';
  document.addEventListener('mouseover', e => { if (e.target.closest(hovers)) document.body.classList.add('cursor-hover'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(hovers)) document.body.classList.remove('cursor-hover'); });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

/* ═══════════════════════════════════════
   5. NAVBAR
═══════════════════════════════════════ */
function initNavbar() {
  const nav        = $('#navbar');
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!nav) return;

  // Scroll → sticky style
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu?.setAttribute('aria-hidden', String(!open));
  });

  // Close mobile menu on link click
  $$('.mobile-link').forEach(l => l.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  }));

  // Smooth scroll for same-page anchor links only
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.length > 1) {
        const target = $(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });
}

/* ═══════════════════════════════════════
   6. SCROLL REVEAL
═══════════════════════════════════════ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children]
        .filter(c => c.classList.contains('reveal-item') || c.classList.contains('reveal-text'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.min(idx * 80, 400));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal-item, .reveal-text').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   7. PARALLAX
═══════════════════════════════════════ */
function initParallax() {
  const heroContent = $('.hero-content');
  const heroImage   = $('.hero-image-frame');
  if (!heroContent) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      raf(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroContent.style.transform = `translateY(${y * 0.08}px)`;
          if (heroImage) heroImage.style.transform = `translateY(${y * 0.12}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════
   8. COUNTER ANIMATION
═══════════════════════════════════════ */
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent;
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
      const sfx = raw.replace(/[0-9. ]/g, '');
      if (isNaN(num)) return;
      const isDec  = num % 1 !== 0;
      const dur    = 1600;
      const start  = performance.now();
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = (isDec ? (num * e).toFixed(1) : Math.floor(num * e)) + sfx;
        if (t < 1) raf(tick);
        else el.textContent = (isDec ? num.toFixed(1) : num) + sfx;
      })(start);
      observer.unobserve(el);
    });
  }, { threshold: 0.8 });
  $$('.stat-num, .snum').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   9. SCROLL SPY
═══════════════════════════════════════ */
function initScrollSpy() {
  const navLinks = $$('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.style.color = (l.getAttribute('href') === `#${id}`) ? 'var(--gold)' : '';
        });
      }
    });
  }, { threshold: 0.5 });
  $$('section[id]').forEach(s => observer.observe(s));
}

/* ═══════════════════════════════════════
   10. CUSTOM CANVAS SWATCH PICKER
═══════════════════════════════════════ */
function initCustomCanvas() {
  const swatches = $$('.tool-swatch');
  const teePath  = $('.tee-svg path');
  const colorMap = {
    'swatch-black': '#1a1a1a',
    'swatch-white': '#f0f0e8',
    'swatch-gold':  '#c9a84c',
    'swatch-cream': '#e8d8bc',
  };
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      const key = [...sw.classList].find(c => colorMap[c]);
      if (teePath && key) teePath.style.stroke = colorMap[key];
    });
  });
}

/* ═══════════════════════════════════════
   11. SCARCITY COUNTER (purely UI)
═══════════════════════════════════════ */
function initScarcity() {
  $$('.stock-indicator.low').forEach(el => {
    let count = parseInt(el.textContent.match(/\d+/)?.[0]) || 3;
    const tick = () => {
      if (count <= 1) return;
      setTimeout(() => {
        count--;
        const dot = el.querySelector('.stock-dot');
        el.innerHTML = '';
        if (dot) el.appendChild(dot);
        el.appendChild(document.createTextNode(` Only ${count} left`));
        if (count <= 2) el.style.color = '#d46e6e';
        tick();
      }, 50000 + Math.random() * 70000);
    };
    tick();
  });
}

/* ═══════════════════════════════════════
   12. CART STATE
═══════════════════════════════════════ */
const Cart = {
  _key: 'noire_cart',
  items: [],

  load() {
    try { this.items = JSON.parse(localStorage.getItem(this._key) || '[]'); }
    catch { this.items = []; }
  },

  save() { localStorage.setItem(this._key, JSON.stringify(this.items)); },

  add(product) {
    const existing = this.items.find(i => String(i.id) === String(product.id));
    if (existing) existing.qty++;
    else this.items.push({ id: String(product.id), name: product.name, price: Number(product.price), image_url: product.image_url || '', qty: 1 });
    this.save();
  },

  remove(id) { this.items = this.items.filter(i => String(i.id) !== String(id)); this.save(); },
  clear()    { this.items = []; localStorage.removeItem(this._key); },
  total()    { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count()    { return this.items.reduce((s, i) => s + i.qty, 0); },
  isEmpty()  { return this.items.length === 0; },
};

/* ═══════════════════════════════════════
   13. CART DRAWER
═══════════════════════════════════════ */
function renderCart() {
  const itemsEl = $('#cart-items');
  const totalEl = $('#cart-total-price');
  const countEl = $('#cart-count');
  if (!itemsEl) return;

  const count = Cart.count();
  if (countEl) { countEl.textContent = count; countEl.classList.toggle('visible', count > 0); }
  if (totalEl) totalEl.textContent = `$${Cart.total().toFixed(2)}`;

  if (Cart.isEmpty()) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    return;
  }

  itemsEl.innerHTML = Cart.items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img" style="${item.image_url ? `background-image:url(${item.image_url});background-size:cover;background-position:center;` : ''}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">
          ${item.name}
          ${item.qty > 1 ? `<span style="color:var(--gray-light);font-size:12px;"> ×${item.qty}</span>` : ''}
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="cart-item-remove" data-remove="${item.id}" aria-label="Remove ${item.name}">Remove</button>
      </div>
    </div>
  `).join('');

  $$('[data-remove]', itemsEl).forEach(btn => {
    btn.addEventListener('click', () => { Cart.remove(btn.dataset.remove); renderCart(); });
  });
}

function initCart() {
  Cart.load();
  renderCart();

  const cartBtn     = $('#cart-btn');
  const cartClose   = $('#cart-close');
  const cartDrawer  = $('#cart-drawer');
  const cartOverlay = $('#cart-overlay');

  const openCart  = () => { cartDrawer?.classList.add('open'); cartOverlay?.classList.add('visible'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { cartDrawer?.classList.remove('open'); cartOverlay?.classList.remove('visible'); document.body.style.overflow = ''; };

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  // Add-to-cart (event delegation — works for both static and API-rendered cards)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;
    const { id, name, price } = btn.dataset;
    Cart.add({ id, name, price });
    renderCart();
    const orig = btn.textContent.trim();
    btn.textContent = '✓ Added';
    btn.style.background = 'var(--gold)';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1600);
    showToast(`"${name}" added to your cart`);
  });
}

/* ═══════════════════════════════════════
   14. COUPON VALIDATION
   Called by the Apply button in checkout
═══════════════════════════════════════ */
let _appliedCoupon = null; // { code, discount_amount, new_total, message }

async function applyCoupon() {
  const code    = $('#co-coupon')?.value.trim().toUpperCase();
  const msgEl   = $('#co-coupon-msg');
  const totalEl = $('#co-total');

  if (!code) {
    if (msgEl) { msgEl.textContent = 'Please enter a coupon code.'; msgEl.style.color = '#d46e6e'; }
    return;
  }

  // Reset
  _appliedCoupon = null;
  if (msgEl) { msgEl.textContent = 'Checking…'; msgEl.style.color = 'var(--gray-light)'; }

  const token = TOKEN();
  if (!token) {
    if (msgEl) { msgEl.textContent = 'Please sign in to use a coupon.'; msgEl.style.color = '#d46e6e'; }
    return;
  }

  try {
    const res  = await fetch(`${API}/coupons/validate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ code, order_total: Cart.total() }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      if (msgEl) { msgEl.textContent = data.error || 'Invalid coupon.'; msgEl.style.color = '#d46e6e'; }
      return;
    }

    // Store and update summary display
    _appliedCoupon = data;
    if (msgEl) { msgEl.textContent = data.message; msgEl.style.color = '#9edcad'; }
    if (totalEl) {
      totalEl.innerHTML = `
        <span style="text-decoration:line-through;font-size:14px;color:var(--gray-light);margin-right:6px;">$${Cart.total().toFixed(2)}</span>
        $${data.new_total.toFixed(2)}`;
    }

    // Show discount line in summary
    const summaryEl = $('#co-summary-items');
    if (summaryEl) {
      // Remove any existing discount line
      const prev = summaryEl.querySelector('.discount-line');
      if (prev) prev.remove();
      const line = document.createElement('div');
      line.className = 'discount-line';
      line.style.cssText = 'display:flex;justify-content:space-between;color:#9edcad;font-size:13px;';
      line.innerHTML = `<span>Discount (${data.code})</span><span>−$${data.discount_amount.toFixed(2)}</span>`;
      summaryEl.appendChild(line);
    }

  } catch {
    if (msgEl) { msgEl.textContent = 'Network error. Please try again.'; msgEl.style.color = '#d46e6e'; }
  }
}

// Make it globally accessible for the onclick attribute
window.applyCoupon = applyCoupon;

/* ═══════════════════════════════════════
   15. CHECKOUT MODAL
═══════════════════════════════════════ */
function initCheckout() {
  const checkoutBtn     = $('#btn-checkout');
  const checkoutOverlay = $('#checkout-overlay');
  const checkoutClose   = $('#checkout-close');
  const checkoutForm    = $('#checkout-form');
  const guestMsg        = $('#checkout-guest-msg');
  const successEl       = $('#co-success');
  const errorEl         = $('#co-error-msg');
  if (!checkoutBtn) return;

  /* ── Open ──────────────────────────────────────────────────── */
  const openCheckout = () => {
    if (Cart.isEmpty()) { showToast('Your cart is empty — add something first'); return; }

    _appliedCoupon = null;
    const couponInput = $('#co-coupon');
    const couponMsg   = $('#co-coupon-msg');
    if (couponInput) couponInput.value = '';
    if (couponMsg)   couponMsg.textContent = '';

    // Pre-fill from session
    const user = USER();
    if (user) {
      const nameEl  = $('#co-name');
      const emailEl = $('#co-email');
      if (nameEl  && !nameEl.value)  nameEl.value  = user.name;
      if (emailEl && !emailEl.value) emailEl.value = user.email;
      if (guestMsg) guestMsg.style.display = 'none';
    } else {
      if (guestMsg) guestMsg.style.display = 'block';
    }

    // Populate summary
    const summaryEl = $('#co-summary-items');
    const totalEl   = $('#co-total');
    if (summaryEl) {
      summaryEl.innerHTML = Cart.items.map(i =>
        `<div style="display:flex;justify-content:space-between;font-size:13px;">
          <span style="color:#e8e8e0;">${i.name} ×${i.qty}</span>
          <span style="color:#c9a84c;">$${(i.price * i.qty).toFixed(2)}</span>
        </div>`
      ).join('');
    }
    if (totalEl) totalEl.textContent = `$${Cart.total().toFixed(2)}`;

    // Reset form state
    if (successEl)    successEl.style.display    = 'none';
    if (errorEl)      errorEl.style.display      = 'none';
    if (checkoutForm) checkoutForm.style.display = 'flex';

    // Open overlay, close cart drawer
    checkoutOverlay.style.display = 'flex';
    document.body.style.overflow  = 'hidden';
    $('#cart-drawer')?.classList.remove('open');
    $('#cart-overlay')?.classList.remove('visible');
  };

  const closeCheckout = () => {
    checkoutOverlay.style.display = 'none';
    document.body.style.overflow  = '';
  };

  checkoutBtn.addEventListener('click', openCheckout);
  checkoutClose?.addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', e => { if (e.target === checkoutOverlay) closeCheckout(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && checkoutOverlay.style.display === 'flex') closeCheckout();
  });

  /* ── Submit ────────────────────────────────────────────────── */
  checkoutForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (errorEl) errorEl.style.display = 'none';

    const token = TOKEN();
    const user  = USER();

    // Must be logged in
    if (!token || !user) {
      if (guestMsg) guestMsg.style.display = 'block';
      guestMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const name    = $('#co-name')?.value.trim()    || '';
    const email   = $('#co-email')?.value.trim()   || '';
    const address = $('#co-address')?.value.trim() || '';
    const notes   = $('#co-notes')?.value.trim()   || '';

    // Validate fields
    let ok = true;
    [
      ['co-name',    'co-name-err',  !name || name.length < 2,                          'Full name is required'],
      ['co-email',   'co-email-err', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),         'Valid email required'],
      ['co-address', 'co-addr-err',  !address || address.length < 10,                   'Full address required (min. 10 characters)'],
    ].forEach(([id, errId, fail, msg]) => {
      const input = $(`#${id}`);
      const errEl = $(`#${errId}`);
      if (fail) { if (input) input.style.borderColor = '#d46e6e'; if (errEl) errEl.textContent = msg; ok = false; }
      else       { if (input) input.style.borderColor = '';        if (errEl) errEl.textContent = ''; }
    });
    if (!ok) return;

    // Build payload — include coupon if applied
    const payload = {
      items:            Cart.items.map(i => ({ product_id: i.id, quantity: i.qty })),
      shipping_name:    name,
      shipping_email:   email,
      shipping_address: address,
      notes,
      coupon_code:      _appliedCoupon?.code    || null,
      discount_amount:  _appliedCoupon?.discount_amount || 0,
    };

    // Loading state
    const btn  = $('#co-submit');
    const text = $('#co-submit-text');
    const spin = $('#co-spin');
    if (btn)  btn.disabled        = true;
    if (text) text.textContent    = 'Placing Order…';
    if (spin) spin.style.display  = 'inline-block';

    try {
      const res  = await fetch(`${API}/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (errorEl) { errorEl.textContent = data.error || 'Order failed. Please try again.'; errorEl.style.display = 'block'; }
        return;
      }

      // Order placed successfully
      if (checkoutForm) checkoutForm.style.display = 'none';
      if (successEl)    successEl.style.display    = 'block';
      Cart.clear();
      _appliedCoupon = null;
      renderCart();
      showToast('Order placed successfully! 🎉 Check your dashboard for tracking.', 5000);

    } catch {
      if (errorEl) { errorEl.textContent = 'Network error. Please check your connection.'; errorEl.style.display = 'block'; }
    } finally {
      if (btn)  btn.disabled       = false;
      if (text) text.textContent   = 'Place Order';
      if (spin) spin.style.display = 'none';
    }
  });
}

/* ═══════════════════════════════════════
   16. LOAD PRODUCTS FROM API
   Replaces the static product grid with
   real data. Falls back silently on error.
═══════════════════════════════════════ */
async function loadProductsFromAPI() {
  const grid = $('#products-grid');
  if (!grid) return;

  try {
    const res  = await fetch(`${API}/products/featured`);
    if (!res.ok) return;
    const { products } = await res.json();
    if (!products || products.length === 0) return;

    grid.innerHTML = products.map((p, i) => {
      const outOfStock = p.stock === 0;
      const stockHTML  = outOfStock
        ? '<span class="stock-indicator low"><span class="stock-dot"></span> Sold Out</span>'
        : p.stock <= 5
          ? `<span class="stock-indicator low"><span class="stock-dot"></span> Only ${p.stock} left</span>`
          : '<span class="stock-indicator"><span class="stock-dot ok"></span> In Stock</span>';

      let badges = '';
      if (p.is_limited) badges += '<span class="badge-limited">Limited Drop</span>';
      if (i === 0)      badges += '<span class="badge-new">New Season</span>';
      if (i === 1)      badges += '<span class="badge-bestseller">Bestseller</span>';

      const imgStyle = p.image_url
        ? `background-image:url(${p.image_url});background-size:cover;background-position:center;`
        : '';
      const silhouette = !p.image_url
        ? `<div class="product-silhouette ${['tee','hoodie','cargo','bomber'][i % 4]}"></div>` : '';

      return `
        <article class="product-card reveal-item" data-id="${p.id}" data-name="${p.name.replace(/"/g,'&quot;')}" data-price="${p.price}">
          <div class="product-image${i === 1 ? ' featured' : ''}">
            <div class="product-img-placeholder p${(i % 4) + 1}" style="${imgStyle}">${silhouette}</div>
            <div class="product-badges">${badges}</div>
            <div class="product-hover-overlay">
              <button class="btn-add-to-cart"
                data-id="${p.id}"
                data-name="${p.name.replace(/"/g,'&quot;')}"
                data-price="${p.price}"
                ${outOfStock ? 'disabled' : ''}
                aria-label="Add ${p.name} to cart">
                ${outOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button class="btn-quick-view" data-id="${p.id}" aria-label="View ${p.name} in collection">Quick View</button>
            </div>
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span class="product-category">${p.category}</span>
              ${stockHTML}
            </div>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price-row">
              <span class="product-price">$${Number(p.price).toFixed(0)}</span>
              <div class="product-stars" aria-label="Rated 5 stars">★★★★★</div>
            </div>
          </div>
        </article>`;
    }).join('');

    // Re-observe new cards for scroll reveal
    $$('.product-card.reveal-item', grid).forEach(card => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
      }, { threshold: 0.1 });
      obs.observe(card);
    });

  } catch (err) {
    // Silently degrade — static placeholder cards remain
    console.warn('[NOIRE] API product load failed, using static fallback:', err.message);
  }
}

/* ═══════════════════════════════════════
   17. CONTACT / INQUIRY FORM
   Instead of simulating, this opens the
   messages page if logged in, or routes
   to sign up first.
═══════════════════════════════════════ */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const submitBtn = $('#form-submit-btn');
  const loader    = submitBtn?.querySelector('.btn-loader');
  const btnText   = submitBtn?.querySelector('.btn-text');

  const validators = {
    fname:    v => v.trim().length >= 2 ? '' : 'Please enter your full name',
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email',
    interest: v => v ? '' : 'Please select a category',
    message:  v => v.trim().length >= 10 ? '' : 'Please describe your vision (min. 10 characters)',
  };

  const validate = field => {
    const fn  = validators[field.name || field.id];
    if (!fn) return true;
    const err = fn(field.value);
    const errEl = field.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = err;
    field.classList.toggle('error', !!err);
    return !err;
  };

  $$('input, textarea, select', form).forEach(f => {
    f.addEventListener('blur', () => validate(f));
    f.addEventListener('input', () => { if (f.classList.contains('error')) validate(f); });
  });

  // Pre-fill if logged in
  const user = USER();
  if (user) {
    const fn = $('#fname'), em = $('#email');
    if (fn && !fn.value) fn.value = user.name;
    if (em && !em.value) em.value = user.email;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const allValid = $$('input, textarea, select', form).map(f => validate(f)).every(Boolean);
    if (!allValid) return;

    const token   = TOKEN();
    const message = $('#message')?.value.trim() || '';
    const interest = $('#interest')?.value || '';
    const subject  = `Inquiry: ${interest || 'Custom Design'}`;

    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.textContent = 'Sending…';
    if (loader)    loader.classList.add('visible');

    try {
      if (token) {
        // User is logged in — create a real conversation
        const res = await fetch(`${API}/messages/conversations`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ subject, message }),
        });
        const data = await res.json();

        if (loader) loader.classList.remove('visible');
        if (btnText) btnText.textContent = 'Sent! Redirecting…';
        if (submitBtn) submitBtn.style.background = 'var(--gold)';
        form.reset();
        showToast('Your message was sent! Redirecting to Messages…', 4000);

        // Redirect to messages with the new conversation open
        const convId = data.conversation?.id;
        setTimeout(() => {
          window.location.href = `/messages.html${convId ? `?conv=${convId}` : ''}`;
        }, 1500);

      } else {
        // Not logged in — short delay then redirect to sign up
        await new Promise(r => setTimeout(r, 1000));
        if (loader)  loader.classList.remove('visible');
        if (btnText) btnText.textContent = 'Sign in to continue';
        showToast('Please sign in to send a message', 3000);
        setTimeout(() => {
          window.location.href = '/signup.html';
        }, 1600);
      }
    } catch {
      if (loader)    loader.classList.remove('visible');
      if (btnText)   btnText.textContent = 'Send My Vision';
      if (submitBtn) submitBtn.disabled = false;
      showToast('Network error. Please try again.', 3000);
    } finally {
      // Don't re-enable until the redirect happens; reset if no redirect
      setTimeout(() => {
        if (btnText && btnText.textContent === 'Sent! Redirecting…') return;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.background = ''; }
        if (btnText)   btnText.textContent = 'Send My Vision';
      }, 5000);
    }
  });
}

/* ═══════════════════════════════════════
   18. NEWSLETTER
═══════════════════════════════════════ */
function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;
  const msg = $('#newsletter-msg');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#newsletter-email')?.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (msg) { msg.textContent = 'Please enter a valid email.'; msg.style.color = '#d46e6e'; }
      return;
    }
    const btn = form.querySelector('button');
    if (btn) { btn.textContent = '…'; btn.disabled = true; }
    await new Promise(r => setTimeout(r, 1000));
    if (msg) { msg.textContent = 'Welcome to the inner circle.'; msg.style.color = 'var(--gold)'; }
    const input = $('#newsletter-email');
    if (input) input.value = '';
    if (btn) { btn.textContent = '✓'; btn.disabled = false; }
  });
}

/* ═══════════════════════════════════════
   19. QUICK VIEW → goes to collection page
═══════════════════════════════════════ */
function initQuickView() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-quick-view');
    if (!btn) return;
    // Navigate to collection page — product detail would open there
    window.location.href = '/collection.html';
  });
}

/* ═══════════════════════════════════════
   20. POST-LOGIN REDIRECT HELPER
   If user lands on this page after being
   sent to login, send them back.
═══════════════════════════════════════ */
function handlePostLoginRedirect() {
  const user = USER();
  if (!user) return;
  const dest = localStorage.getItem('post_login_redirect');
  if (dest) {
    localStorage.removeItem('post_login_redirect');
    // Only redirect if we're not already there
    if (window.location.pathname !== dest) {
      window.location.href = dest;
    }
  }
}

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  handlePostLoginRedirect();
  initLoader();
  initAuth();
  initCursor();
  initNavbar();
  initScrollReveal();
  initCart();
  initCheckout();
  initParallax();
  initCounters();
  initScrollSpy();
  initCustomCanvas();
  initScarcity();
  initContactForm();
  initNewsletter();
  initQuickView();

  // Load live products from API (degrades to static HTML if API unreachable)
  loadProductsFromAPI();
});
