/* ui.js – tiện ích dùng chung: định dạng, lưu trữ, toast, modal, menu */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IMG = 'assets/images/';
/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu. */
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const NF = new Intl.NumberFormat('vi-VN');
/** Giá lưu dạng number, chỉ định dạng khi hiển thị. */
function formatPrice(price) { return NF.format(Math.round(price)) + '₫'; }
const fmt = formatPrice;
const byId = id => PRODUCTS.find(p => p.id === id);
const qs = () => new URLSearchParams(location.search);

/* ---------- Lưu trữ (localStorage, an toàn khi bị chặn) ---------- */
const Store = {
  get(k, d) { try { const v = localStorage.getItem('ve_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ve_' + k, JSON.stringify(v)); } catch (e) { /* bỏ qua khi bị chặn */ } }
};
const mem = {
  cart: Store.get('cart', []), user: Store.get('user', null), orders: Store.get('orders', []), appts: Store.get('appts', []),
  questions: Store.get('questions', []), reviews: Store.get('reviews', {}), points: Store.get('points', []),
  audit: Store.get('audit', []), admin: Store.get('admin', null), overrides: Store.get('overrides', {}),
  coupon: null, usePoints: false
};
const save = k => Store.set(k, mem[k]);

/** Áp dụng thay đổi do trang quản trị lưu lại (giá, tồn kho, ẩn sản phẩm). */
function applyOverrides() {
  PRODUCTS.forEach(p => {
    const o = mem.overrides[p.id]; if (!o) return;
    if (o.price) p.price = o.price;
    if (o.stock) p.stock = Object.assign({}, p.stock, o.stock);
    p.hidden = !!o.hidden;
  });
}
const visibleProducts = () => PRODUCTS.filter(p => !p.hidden);

/** Ghi nhật ký thao tác quản trị (NFR15). */
function logAudit(text) {
  mem.audit.unshift({ t: new Date().toISOString(), role: mem.admin ? mem.admin.role : '-', text });
  mem.audit = mem.audit.slice(0, 200); save('audit');
}

const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10.2L20 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6 8-6s7 1.5 8 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>'
};

/** Ẩn thông tin định danh (SĐT, email) trước khi gửi nội dung sang dịch vụ AI (NFR14). */
function maskPII(text) {
  return String(text).replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]').replace(/(\+?84|0)\d{9}/g, '[sđt]');
}

/* ---------- Toast: slide-in → hiển thị → slide-out ---------- */
function showToast(message, type) {
  type = type || 'success';
  let wrap = $('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div'); wrap.className = 'toast-wrap';
    wrap.setAttribute('role', 'status'); wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast toast--' + type; t.textContent = message; wrap.appendChild(t);
  setTimeout(() => { t.classList.add('toast--out'); t.addEventListener('animationend', () => t.remove(), { once: true }); }, 2600);
}
/** Bí danh ngắn: toast(msg) hoặc toast(msg, true) cho lỗi. */
const toast = (msg, err) => showToast(msg, err ? 'error' : 'success');

/* ---------- Modal: openModal(id) / closeModal(id) ---------- */
let lastFocus = null;
function openModal(id) {
  const m = document.getElementById(id); if (!m) return;
  lastFocus = document.activeElement; m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  const f = $('input,select,textarea,button:not(.modal__close)', m); if (f) f.focus();
}
function closeModal(id) {
  const m = document.getElementById(id || 'modal'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
  if (!$('.modal.open') && !$('.drawer.open')) document.body.classList.remove('no-scroll');
  if (lastFocus) lastFocus.focus();
}
/** Hiển thị modal động với nội dung HTML bất kỳ. */
function showModal(html, wide) {
  const box = $('#modalBox'); box.className = 'modal__box' + (wide ? ' modal__box--wide' : '');
  box.innerHTML = '<button class="icon-btn modal__close" data-modal-close aria-label="Đóng">' + ICON.close + '</button>' + html;
  openModal('modal'); return box;
}

/* ---------- Ngăn kéo giỏ hàng ---------- */
function openDrawer() { const d = $('#cartDrawer'); d.classList.add('open'); $('#overlay').classList.add('open'); d.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); renderCart(); }
function closeDrawer() { $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); if (!$('.modal.open')) document.body.classList.remove('no-scroll'); }

/* ---------- Menu mobile & cỡ chữ ---------- */
function toggleMobileMenu(force) {
  const nav = $('#nav'), open = typeof force === 'boolean' ? force : !nav.classList.contains('open');
  nav.classList.toggle('open', open); $('#menuBtn').setAttribute('aria-expanded', open);
}
const FONT_STEPS = [100, 112, 125];
function setFontSize(step) {
  step = Math.max(0, Math.min(FONT_STEPS.length - 1, step));
  document.documentElement.style.fontSize = FONT_STEPS[step] + '%'; Store.set('fs', step); return step;
}

/* ---------- Hiển thị sao, đánh giá, tồn kho ---------- */
function stars(v) {
  const r = Math.round(v);
  return '<span class="stars" role="img" aria-label="' + v.toFixed(1) + ' trên 5 sao">' + '★'.repeat(r) + '<span class="off">' + '★'.repeat(5 - r) + '</span></span>';
}
function reviewsOf(id) { return (mem.reviews[id] || []).concat(REVIEWS[id] || []); }
function ratingOf(id) { const r = reviewsOf(id); return r.length ? r.reduce((a, b) => a + b.s, 0) / r.length : 0; }
function totalStock(p) { return Object.values(p.stock).reduce((a, b) => a + b, 0); }
