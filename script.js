/**
 * NOIRE — Frontend Script (Backend-Integrated)
 * Covers: Auth state, Product loading from API, Cart, Checkout,
 *         Custom cursor, Loader, Scroll reveal, Parallax, Counters,
 *         Scarcity indicators, Form validation, Marquee, Newsletter
 */

'use strict';

/* ═══════════════════════════════════════
   CONSTANTS & CONFIG
═══════════════════════════════════════ */
const API    = 'https://noire-backend-i2bq.onrender.com/';
const TOKEN  = () => localStorage.getItem('noire_token');
const USER   = () => JSON.parse(localStorage.getItem('noire_user') || 'null');
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const raf = requestAnimationFrame.bind(window);

/* ═══════════════════════════════════════
   1. AUTH STATE — update nav on every load
═══════════════════════════════════════ */
function initAuth() {
  const user       = USER();
  const guestNav   = $('#nav-auth-guest');
  const userNav    = $('#nav-auth-user');
  const userNameEl = $('#nav-user-name');

  if (user && TOKEN()) {
    // Logged in
    if (guestNav)   { guestNav.style.display = 'flex'; guestNav.style.display = 'none'; }
    if (userNav)    { userNav.style.display = 'flex'; }
    if (userNameEl) { userNameEl.textContent = user.name.split(' ')[0]; }
  } else {
    // Guest
    if (guestNav) { guestNav.style.display = 'flex'; }
    if (userNav)  { userNav.style.display  = 'none'; }
  }
}

/* ═══════════════════════════════════════
   2. TOAST NOTIFICATION
═══════════════════════════════════════ */
function showToast(msg, dur = 3200) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), dur);
}

/* ═══════════════════════════════════════
   3. LOADER
═══════════════════════════════════════ */
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;
  document.body.classList.add('loading');
  const minTime = 1800;
  const start   = Date.now();

  window.addEventListener('load', () => {
    const wait = Math.max(0, minTime - (Date.now() - start));
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

  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  const dot  = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  let mX = 0, mY = 0, rX = 0, rY = 0;

  document.addEventListener('mousemove', (e) => {
    mX = e.clientX; mY = e.clientY;
    dot.style.left = mX + 'px';
    dot.style.top  = mY + 'px';
  });

  (function trackRing() {
    rX += (mX - rX) * 0.12;
    rY += (mY - rY) * 0.12;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';
    raf(trackRing);
  })();

  const hoverSel = 'a, button, .product-card, .tool-swatch, input, textarea, select';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

/* ═══════════════════════════════════════
   5. NAVBAR
═══════════════════════════════════════ */
function initNavbar() {
  const nav       = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu?.setAttribute('aria-hidden', !open);
  });

  $$('.mobile-link').forEach(l => {
    l.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scroll
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
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
  const targets = $$('.reveal-item, .reveal-text');
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

  targets.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════
   7. PARALLAX (hero)
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
  const parse = (str) => {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    const sfx = str.replace(/[0-9. ]/g, '');
    return { num, sfx };
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const { num, sfx } = parse(el.textContent);
      if (isNaN(num)) return;
      const isDec = num % 1 !== 0;
      const start = performance.now();
      const dur   = 1600;
      (function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
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
        navLinks.forEach(l => {
          l.style.color = l.getAttribute('href') === `#${entry.target.id}`
            ? 'var(--gold)' : '';
        });
      }
    });
  }, { threshold: 0.5 });
  $$('section[id]').forEach(s => observer.observe(s));
}

/* ═══════════════════════════════════════
   10. CUSTOM CANVAS — swatch picker
═══════════════════════════════════════ */
function initCustomCanvas() {
  const swatches = $$('.tool-swatch');
  const teePath  = $('.tee-svg path');
  const map = {
    'swatch-black': '#1a1a1a',
    'swatch-white': '#f0f0e8',
    'swatch-gold':  '#c9a84c',
    'swatch-cream': '#e8d8bc',
  };
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      const key = [...sw.classList].find(c => map[c]);
      if (teePath && key) teePath.style.stroke = map[key];
    });
  });
}

/* ═══════════════════════════════════════
   11. SCARCITY COUNTER (UI only)
═══════════════════════════════════════ */
function initScarcity() {
  $$('.stock-indicator.low').forEach(el => {
    let count = parseInt(el.textContent.match(/\d+/)?.[0]) || 3;
    function tick() {
      if (count <= 1) return;
      const delay = 50000 + Math.random() * 70000;
      setTimeout(() => {
        count--;
        const dot = el.querySelector('.stock-dot');
        el.innerHTML = '';
        if (dot) el.appendChild(dot);
        el.appendChild(document.createTextNode(` Only ${count} left`));
        if (count <= 2) el.style.color = '#d46e6e';
        tick();
      }, delay);
    }
    tick();
  });
}

/* ═══════════════════════════════════════
   12. CART STATE
   Persisted in localStorage. Product data
   from API when available.
═══════════════════════════════════════ */
const Cart = {
  _key: 'noire_cart',
  items: [],

  load() {
    try { this.items = JSON.parse(localStorage.getItem(this._key) || '[]'); }
    catch { this.items = []; }
  },

  save() {
    localStorage.setItem(this._key, JSON.stringify(this.items));
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) { existing.qty++; }
    else { this.items.push({ ...product, qty: 1 }); }
    this.save();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  clear() {
    this.items = [];
    localStorage.removeItem(this._key);
  },

  total()     { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  count()     { return this.items.reduce((s, i) => s + i.qty, 0); },
  isEmpty()   { return this.items.length === 0; },
};

/* ── Render cart drawer ──────────────────────────────────────── */
function renderCart() {
  const itemsEl = $('#cart-items');
  const totalEl = $('#cart-total-price');
  const countEl = $('#cart-count');
  if (!itemsEl) return;

  const count = Cart.count();
  if (countEl) {
    countEl.textContent = count;
    countEl.classList.toggle('visible', count > 0);
  }
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
    btn.addEventListener('click', () => {
      Cart.remove(btn.dataset.remove);
      renderCart();
    });
  });
}

/* ═══════════════════════════════════════
   13. CART DRAWER — open/close
═══════════════════════════════════════ */
function initCart() {
  Cart.load();
  renderCart();

  const cartBtn     = $('#cart-btn');
  const cartClose   = $('#cart-close');
  const cartDrawer  = $('#cart-drawer');
  const cartOverlay = $('#cart-overlay');

  const openCart = () => {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('visible');
    document.body.style.overflow = '';
  };

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  // Add to cart (delegated)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;

    const { id, name, price } = btn.dataset;
    Cart.add({ id, name, price: parseFloat(price) });
    renderCart();

    // Button feedback
    const original = btn.textContent.trim();
    btn.textContent = '✓ Added';
    btn.style.background = 'var(--gold)';
    setTimeout(() => { btn.textContent = original; btn.style.background = ''; }, 1600);
    showToast(`"${name}" added to your cart`);
  });
}

/* ═══════════════════════════════════════
   14. CHECKOUT FLOW
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

  const openCheckout = () => {
    if (Cart.isEmpty()) { showToast('Your cart is empty'); return; }

    // Pre-fill from logged-in user
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

    // Populate order summary
    const summaryEl = $('#co-summary-items');
    const totalEl   = $('#co-total');
    if (summaryEl) {
      summaryEl.innerHTML = Cart.items.map(i =>
        `<div style="display:flex;justify-content:space-between;">
          <span>${i.name} ×${i.qty}</span>
          <span style="color:var(--gold);">$${(i.price * i.qty).toFixed(2)}</span>
        </div>`
      ).join('');
    }
    if (totalEl) totalEl.textContent = `$${Cart.total().toFixed(2)}`;

    // Reset success/error
    if (successEl) successEl.style.display = 'none';
    if (errorEl)   errorEl.style.display   = 'none';
    if (checkoutForm) checkoutForm.style.display = 'flex';

    if (checkoutOverlay) {
      checkoutOverlay.style.display = 'flex';
      document.body.style.overflow  = 'hidden';
      // Close cart drawer
      $('#cart-drawer')?.classList.remove('open');
      $('#cart-overlay')?.classList.remove('visible');
    }
  };

  const closeCheckout = () => {
    if (checkoutOverlay) checkoutOverlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  checkoutBtn?.addEventListener('click', openCheckout);
  checkoutClose?.addEventListener('click', closeCheckout);
  checkoutOverlay?.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckout();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && checkoutOverlay?.style.display === 'flex') closeCheckout();
  });

  /* ── Submit order ─────────────────────────────────────────── */
  checkoutForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.style.display = 'none';

    const token = TOKEN();
    const user  = USER();

    // If not logged in, redirect to login
    if (!token || !user) {
      if (guestMsg) guestMsg.style.display = 'block';
      guestMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const name    = $('#co-name')?.value.trim()    || '';
    const email   = $('#co-email')?.value.trim()   || '';
    const address = $('#co-address')?.value.trim() || '';
    const notes   = $('#co-notes')?.value.trim()   || '';

    // Validate
    let ok = true;
    [
      ['co-name',    'co-name-err',  !name || name.length < 2,           'Full name is required'],
      ['co-email',   'co-email-err', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Valid email required'],
      ['co-address', 'co-addr-err',  !address || address.length < 10,    'Full address required (min. 10 chars)'],
    ].forEach(([inputId, errId, condition, msg]) => {
      const input  = $(`#${inputId}`);
      const errEl  = $(`#${errId}`);
      if (condition) {
        if (input)  input.style.borderColor  = '#d46e6e';
        if (errEl)  errEl.textContent = msg;
        ok = false;
      } else {
        if (input)  input.style.borderColor  = '';
        if (errEl)  errEl.textContent = '';
      }
    });
    if (!ok) return;

    // Map cart items to API format
    const items = Cart.items.map(i => ({
      product_id: i.id,
      quantity:   i.qty,
    }));

    // Loading state
    const submitBtn  = $('#co-submit');
    const submitText = $('#co-submit-text');
    const submitSpin = $('#co-spin');
    if (submitBtn)  submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Placing Order...';
    if (submitSpin) submitSpin.style.display = 'inline-block';

    try {
      const res  = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          shipping_name:    name,
          shipping_email:   email,
          shipping_address: address,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (errorEl) {
          errorEl.textContent = data.error || 'Order failed. Please try again.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Success
      if (checkoutForm) checkoutForm.style.display  = 'none';
      if (successEl)    successEl.style.display     = 'block';
      Cart.clear();
      renderCart();
      showToast('Order placed successfully! 🎉', 5000);

    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Network error. Please check your connection.';
        errorEl.style.display = 'block';
      }
    } finally {
      if (submitBtn)  submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Place Order';
      if (submitSpin) submitSpin.style.display = 'none';
    }
  });
}

/* ═══════════════════════════════════════
   15. LOAD PRODUCTS FROM API
   Fetches featured products and renders
   them into the grid, replacing static HTML
═══════════════════════════════════════ */
async function loadProductsFromAPI() {
  const grid = $('#products-grid');
  if (!grid) return;

  try {
    const res  = await fetch(`${API}/products/featured`);
    if (!res.ok) return; // fall back to static HTML on failure

    const { products } = await res.json();
    if (!products || products.length === 0) return;

    const BADGE_MAP = {
      is_limited: '<span class="badge-limited">Limited Drop</span>',
    };

    grid.innerHTML = products.map((p, i) => {
      const isFeatured = i === 1; // Make second card "featured" for layout
      const stockClass = p.stock <= 5 ? 'low' : '';
      const stockText  = p.stock <= 5
        ? `<span class="stock-dot"></span> Only ${p.stock} left`
        : `<span class="stock-dot ok"></span> In Stock`;

      let badges = '';
      if (p.is_limited) badges += '<span class="badge-limited">Limited Drop</span>';
      if (i === 0) badges += '<span class="badge-new">New Season</span>';
      if (i === 1) badges += '<span class="badge-bestseller">Bestseller</span>';

      return `
        <article class="product-card reveal-item"
                 data-id="${p.id}"
                 data-name="${p.name.replace(/"/g, '&quot;')}"
                 data-price="${p.price}">
          <div class="product-image${isFeatured ? ' featured' : ''}">
            <div class="product-img-placeholder p${(i % 4) + 1}"
                 style="${p.image_url ? `background-image:url(${p.image_url});background-size:cover;background-position:center;` : ''}">
              ${!p.image_url ? `<div class="product-silhouette ${['tee','hoodie','cargo','bomber'][i % 4]}"></div>` : ''}
            </div>
            <div class="product-badges">${badges}</div>
            <div class="product-hover-overlay">
              <button class="btn-add-to-cart"
                      data-id="${p.id}"
                      data-name="${p.name.replace(/"/g, '&quot;')}"
                      data-price="${p.price}"
                      aria-label="Add ${p.name} to cart">
                Add to Cart
              </button>
              <button class="btn-quick-view" aria-label="Quick view ${p.name}">Quick View</button>
            </div>
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span class="product-category">${p.category}</span>
              <span class="stock-indicator ${stockClass}">${stockText}</span>
            </div>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price-row">
              <span class="product-price">$${Number(p.price).toFixed(0)}</span>
              <div class="product-stars" aria-label="Rated 5 stars">★★★★★</div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Re-attach scroll reveal to new cards
    $$('.product-card.reveal-item', grid).forEach(card => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(card);
    });

  } catch (err) {
    // Silently fall back — static HTML products remain visible
    console.warn('[NOIRE] Could not load products from API, using static fallback.', err);
  }
}

/* ═══════════════════════════════════════
   16. CONTACT FORM VALIDATION
═══════════════════════════════════════ */
function initContactForm() {
  const form      = $('#contact-form');
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

  const validate = (field) => {
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
    const fnameEl = $('#fname');
    const emailEl = $('#email');
    if (fnameEl && !fnameEl.value) fnameEl.value = user.name;
    if (emailEl && !emailEl.value) emailEl.value = user.email;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields   = $$('input, textarea, select', form);
    const allValid = fields.map(f => validate(f)).every(Boolean);
    if (!allValid) return;

    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.textContent = 'Sending...';
    if (loader)    loader.classList.add('visible');

    await new Promise(r => setTimeout(r, 2200));

    if (loader)    loader.classList.remove('visible');
    if (btnText)   btnText.textContent = 'Message Sent ✓';
    if (submitBtn) submitBtn.style.background = 'var(--gold)';
    form.reset();
    $$('.field-error', form).forEach(el => el.textContent = '');
    showToast('Your vision has been received. We\'ll reply within 24 hours.', 5000);

    setTimeout(() => {
      if (btnText)   btnText.textContent = 'Send My Vision';
      if (submitBtn) { submitBtn.style.background = ''; submitBtn.disabled = false; }
    }, 4000);
  });
}

/* ═══════════════════════════════════════
   17. NEWSLETTER FORM
═══════════════════════════════════════ */
function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;

  const msg = $('#newsletter-msg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#newsletter-email')?.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (msg) { msg.textContent = 'Please enter a valid email.'; msg.style.color = '#d46e6e'; }
      return;
    }
    const btn = form.querySelector('button');
    if (btn) { btn.textContent = '...'; btn.disabled = true; }
    await new Promise(r => setTimeout(r, 1200));
    if (msg) { msg.textContent = 'Welcome to the inner circle.'; msg.style.color = 'var(--gold)'; }
    const input = $('#newsletter-email');
    if (input) input.value = '';
    if (btn) { btn.textContent = '✓'; btn.disabled = false; }
  });
}

/* ═══════════════════════════════════════
   18. QUICK VIEW (tooltip-style)
═══════════════════════════════════════ */
function initQuickView() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-quick-view')) return;
    const card = e.target.closest('.product-card');
    if (!card) return;
    showToast(`${card.dataset.name} — $${card.dataset.price}`);
  });
}

/* ═══════════════════════════════════════
   INIT — Run all modules on DOM ready
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
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

  // Load live products from API (gracefully degrades to static)
  loadProductsFromAPI();
});
