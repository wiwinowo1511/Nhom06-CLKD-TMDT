/* main.js – bố cục dùng chung và khởi tạo trang */
'use strict';
/* ---------- Layout dùng chung ---------- */
const NAV = [
  ['index.html', 'Trang chủ', 'home'], ['gioi-thieu.html', 'Giới thiệu', 'about'], ['san-pham.html', 'Sản phẩm', 'products'],
  ['hoi-dap.html', 'Góc hỏi đáp', 'qa'], ['mat-khoe.html', 'Mắt khỏe mỗi ngày', 'blog'], ['dat-lich.html', 'Đặt lịch', 'book']
];

function renderLayout() {
  const page = document.body.dataset.page;
  const header = document.createElement('div');
  header.innerHTML = `
  <div class="notice">Prototype học thuật – dữ liệu sản phẩm, đánh giá và cửa hàng chỉ mang tính minh họa.</div>
  <header class="site-header"><div class="container header__inner">
    <a class="brand" href="index.html" aria-label="VisionEase – Trang chủ"><img src="${IMG}logo-mark.png" alt="VisionEase"></a>
    <nav class="nav" id="nav" aria-label="Điều hướng chính">${NAV.map(n => `<a href="${n[0]}"${n[2] === page ? ' aria-current="page"' : ''}>${n[1]}</a>`).join('')}</nav>
    <div class="header__tools">
      <form class="search-box" role="search" id="searchForm" autocomplete="off">${ICON.search}
        <label class="sr-only" for="searchInput">Tìm sản phẩm</label>
        <input id="searchInput" type="search" placeholder="Tìm sản phẩm, nhu cầu…"><div class="suggest" id="suggest"></div></form>
      <div class="fs-ctl" role="group" aria-label="Cỡ chữ"><button id="fsDown" aria-label="Giảm cỡ chữ">A−</button><button id="fsUp" aria-label="Tăng cỡ chữ">A+</button></div>
      <button class="icon-btn" id="userBtn" aria-label="Tài khoản">${ICON.user}</button>
      <button class="icon-btn" id="cartBtn" aria-label="Giỏ hàng">${ICON.cart}<span class="badge" id="cartBadge">0</span></button>
      <button class="icon-btn menu-toggle" id="menuBtn" aria-label="Mở menu" aria-expanded="false">${ICON.menu}</button>
    </div></div></header>`;
  document.body.prepend(...header.childNodes);

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="container"><div class="footer__grid">
    <div><span class="footer__logo"><img src="${IMG}logo.png" alt="VisionEase"></span>
      <p>Kính lọc ánh sáng xanh 0 độ và sản phẩm thư giãn mắt dành cho người thường xuyên dùng màn hình. Mua online, nhận và thử tại cửa hàng.</p></div>
    <div><h4>Liên kết nhanh</h4><ul>${NAV.map(n => `<li><a href="${n[0]}">${n[1]}</a></li>`).join('')}</ul></div>
    <div><h4>Chính sách</h4><ul><li><a href="gioi-thieu.html#chinh-sach">Chính sách bảo mật</a></li><li><a href="gioi-thieu.html#chinh-sach">Vận chuyển &amp; nhận hàng</a></li><li><a href="gioi-thieu.html#chinh-sach">Đổi trả trong 7 ngày</a></li><li><a href="tai-khoan.html">Tài khoản &amp; đơn hàng</a></li><li><a href="quan-tri.html">Quản trị (demo)</a></li></ul></div>
    <div><h4>Liên hệ</h4><ul>    <li>Email: visionease.cskh@gmail.com</li><li>Hotline: 1900 0000 (minh họa)</li><li>TP. Hồ Chí Minh</li></ul>
      <form class="news-form" id="newsForm"><label class="sr-only" for="newsMail">Email nhận ưu đãi</label><input id="newsMail" type="email" placeholder="Email nhận ưu đãi" required><button class="btn btn--sm btn--light" type="submit">Đăng ký</button></form>
      <p class="news-note">Chỉ gửi email khi bạn đồng ý; có thể huỷ đăng ký bất kỳ lúc nào.</p></div>
  </div><div class="footer__bottom"><span>© 2026 VisionEase – sản phẩm học tập, môn Chiến lược kinh doanh thương mại điện tử.</span><span>Thông tin trên website không thay thế tư vấn của bác sĩ. Thông báo website với Bộ Công Thương: minh họa, chưa đăng ký.</span></div></div>`;
  document.body.appendChild(footer);

  const extra = document.createElement('div');
  extra.innerHTML = `
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="cartDrawer" aria-label="Giỏ hàng" aria-hidden="true">
    <div class="drawer__head row"><h3 style="margin:0">Giỏ hàng</h3><button class="icon-btn" data-close aria-label="Đóng giỏ hàng">${ICON.close}</button></div>
    <div class="drawer__body" id="cartBody"></div><div class="drawer__foot" id="cartFoot"></div></aside>
  <div class="modal" id="modal" role="dialog" aria-modal="true" aria-hidden="true"><div class="modal__box" id="modalBox"></div></div>
  <button class="chat-fab" id="chatFab" aria-label="Mở trợ lý ảo">${ICON.chat}</button>
  <section class="chat" id="chat" aria-label="Trợ lý ảo VisionEase">
    <div class="chat__head"><div><strong>Trợ lý ảo VisionEase</strong><small>Hỗ trợ chọn sản phẩm, đơn hàng, chính sách</small></div><button class="icon-btn" id="chatClose" style="color:#fff" aria-label="Đóng">${ICON.close}</button></div>
    <div class="chat__body" id="chatBody"></div>
    <div class="quick" id="chatQuick"><button>Chọn kính khi làm việc văn phòng</button><button>Đổi trả thế nào?</button><button>Cách tích điểm</button><button>Mắt hay đỏ, cần hỏi chuyên gia</button></div>
    <form class="chat__form" id="chatForm"><label class="sr-only" for="chatInput">Nhập câu hỏi</label><input id="chatInput" placeholder="Nhập câu hỏi…" autocomplete="off"><button class="btn btn--sm" type="submit">Gửi</button></form>
  </section>`;
  while (extra.firstChild) document.body.appendChild(extra.firstChild);
}


/* ---------- Khởi tạo ---------- */
function init() {
  applyOverrides(); renderLayout(); updateCartCount(); refreshUser(); initSearch(); initChat();
  setFontSize(Store.get('fs', 0));
  const page = document.body.dataset.page, hdr = $('.site-header');
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#menuBtn').onclick = () => toggleMobileMenu();
  $('#nav').addEventListener('click', e => { if (e.target.closest('a')) toggleMobileMenu(false); });
  $('#cartBtn').onclick = () => { page === 'cart' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : openDrawer(); };
  $('#userBtn').onclick = () => { if (mem.user) location.href = 'tai-khoan.html'; else openAuth(); };
  $('#fsUp').onclick = () => setFontSize(Store.get('fs', 0) + 1);
  $('#fsDown').onclick = () => setFontSize(Store.get('fs', 0) - 1);
  $('#overlay').onclick = closeDrawer;
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-modal-close]')) closeModal('modal'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal('modal'); closeDrawer(); toggleMobileMenu(false); $('#chat').classList.remove('open'); } });
  $('#cartDrawer').addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-close]')) closeDrawer();
    const q = t.closest('[data-qty]'); if (q) { const it = mem.cart[+q.dataset.qty]; updateCartQuantity(it.id, it.qty + +q.dataset.d, it.color); }
    const r = t.closest('[data-rm]'); if (r) { const it = mem.cart[+r.dataset.rm]; removeFromCart(it.id, it.color); }
    if (t.id === 'clearCart') { mem.cart = []; saveCart(); renderCart(); }
    if (t.id === 'couponBtn') { const v = $('#couponInput').value.trim().toUpperCase(); if (!v) { mem.coupon = null; } else if (COUPONS[v]) { mem.coupon = v; showToast('Đã áp dụng: ' + COUPONS[v].label); } else { showToast('Mã ưu đãi không hợp lệ', 'error'); } renderCart(); }
    if (t.id === 'usePts') { mem.usePoints = t.checked; renderCart(); }
  });
  document.addEventListener('click', e => { const a = e.target.closest('[data-add]'); if (a) { const p = byId(a.dataset.add); addToCart(p.id, p.colors[0].name, 1); } });
  $('#newsForm').onsubmit = e => { e.preventDefault(); showToast('Cảm ơn bạn! Email xác nhận đã được gửi (demo).'); e.target.reset(); };
  const fn = { home: initHome, products: initProducts, detail: initDetail, cart: initCartPage, qa: initQA, blog: initBlog, book: initBooking, about: initAbout, account: initAccount, admin: typeof initAdmin === 'function' ? initAdmin : null }[page];
  try { if (fn) fn(); } catch (err) { console.error(err); showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error'); }
}
document.addEventListener('DOMContentLoaded', init);
