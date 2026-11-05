/* cart.js – giỏ hàng, đăng nhập, đặt hàng */
'use strict';
/* ---------- Giỏ hàng ---------- */
function getCart() { return mem.cart; }
function saveCart() { save('cart'); updateCartCount(); }
function cartCount() { return mem.cart.reduce((a, b) => a + b.qty, 0); }
/** Cập nhật số lượng trên biểu tượng giỏ hàng, kèm hiệu ứng nảy khi bump = true. */
function updateCartCount(bump) {
  const b = $('#cartBadge'); if (!b) return;
  b.textContent = cartCount(); b.style.display = cartCount() ? 'grid' : 'none';
  if (bump === true) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}
const updateBadge = updateCartCount;
function addToCart(productId, color, qty) {
  const p = byId(productId); if (!p) return;
  color = color || p.colors[0].name; qty = qty || 1;
  if (totalStock(p) === 0) { showToast('Sản phẩm tạm hết hàng', 'error'); return; }
  const it = mem.cart.find(i => i.id === productId && i.color === color);
  if (it) it.qty = Math.min(20, it.qty + qty); else mem.cart.push({ id: productId, color, qty });
  saveCart(); updateCartCount(true); showToast('Đã thêm “' + p.name + '” vào giỏ hàng');
  if ($('#cartDrawer.open')) renderCart();
}
function removeFromCart(productId, color) {
  mem.cart = mem.cart.filter(i => !(i.id === productId && (color === undefined || i.color === color)));
  saveCart(); renderAllCart();
}
function updateCartQuantity(productId, quantity, color) {
  const it = mem.cart.find(i => i.id === productId && (color === undefined || i.color === color)); if (!it) return;
  if (quantity <= 0) { removeFromCart(productId, color); return; }
  it.qty = Math.max(1, Math.min(20, quantity)); saveCart(); renderAllCart();
}
function getCartTotal(delivery) { return calcTotals(delivery || 'home').total; }
/** Vẽ lại mọi nơi hiển thị giỏ hàng (ngăn kéo và trang giỏ hàng). */
function renderAllCart() { renderCart(); if (document.body.dataset.page === 'cart') renderCartPage(); }
function pointBalance() { return mem.points.reduce((a, b) => a + b.pts, 0); }
function calcTotals(delivery) {
  const sub = mem.cart.reduce((a, i) => a + byId(i.id).price * i.qty, 0);
  let discount = 0, ship = sub === 0 ? 0 : (sub >= 500000 ? 0 : 30000);
  if (mem.coupon === 'VISION10') discount += Math.round(sub * 0.1);
  if (mem.coupon === 'FREESHIP') ship = 0;
  let pts = 0;
  if (mem.usePoints && mem.user) { pts = Math.min(pointBalance(), Math.floor((sub - discount) / 500)); }
  const ptsValue = pts * 500;
  return { sub, discount, ship, pts, ptsValue, total: Math.max(0, sub - discount - ptsValue + ship) };
}
function renderCart() {
  const body = $('#cartBody'), foot = $('#cartFoot');
  if (!mem.cart.length) {
    body.innerHTML = '<div class="empty" style="margin-top:20px"><p>Chưa có sản phẩm nào trong giỏ hàng.</p><a class="btn btn--sm" href="san-pham.html">Tiếp tục mua sắm</a></div>'; foot.innerHTML = ''; return;
  }
  body.innerHTML = mem.cart.map((i, idx) => {
    const p = byId(i.id), c = p.colors.find(c => c.name === i.color) || p.colors[0];
    return `<div class="cart-item"><img src="${IMG + c.img}" alt="${esc(p.name)}"><div><h4>${esc(p.name)}</h4><div class="meta">Màu: ${esc(c.name)} · ${fmt(p.price)}</div>
      <div class="qty" style="margin-top:6px"><button data-qty="${idx}" data-d="-1" aria-label="Giảm số lượng">−</button><input value="${i.qty}" readonly aria-label="Số lượng"><button data-qty="${idx}" data-d="1" aria-label="Tăng số lượng">+</button></div></div>
      <div style="text-align:right"><strong>${fmt(p.price * i.qty)}</strong><br><button class="link-btn" data-rm="${idx}">Xoá</button></div></div>`;
  }).join('') + '<p style="text-align:right;margin-top:8px"><button class="link-btn" id="clearCart">Xoá tất cả</button></p>';
  const t = calcTotals('home');
  foot.innerHTML = `<div class="field field--row"><input class="input" id="couponInput" placeholder="Mã ưu đãi (VISION10, FREESHIP)" value="${mem.coupon || ''}"><button class="btn btn--sm btn--ghost" id="couponBtn">Áp dụng</button></div>
    ${mem.user ? `<label class="check"><input type="checkbox" id="usePts" ${mem.usePoints ? 'checked' : ''}> Dùng điểm thưởng (${pointBalance()} điểm = ${fmt(pointBalance() * 500)})</label>` : '<p class="meta">Đăng nhập để tích và dùng điểm thưởng.</p>'}
    <div class="row"><span>Tạm tính</span><span>${fmt(t.sub)}</span></div>
    ${t.discount ? `<div class="row"><span>Mã ưu đãi</span><span>−${fmt(t.discount)}</span></div>` : ''}
    ${t.ptsValue ? `<div class="row"><span>Điểm thưởng</span><span>−${fmt(t.ptsValue)}</span></div>` : ''}
    <div class="row"><span>Phí giao hàng (từ 500.000₫ miễn phí)</span><span>${fmt(t.ship)}</span></div>
    <div class="row row--total"><span>Tổng cộng</span><span>${fmt(t.total)}</span></div>
    <a class="btn btn--block" href="gio-hang.html" style="margin-top:12px">Đặt hàng</a>`;
}

/* ---------- Đăng nhập / đăng ký ---------- */
function openAuth(tab) {
  tab = tab || 'login';
  const box = showModal(`<div class="tabs" role="tablist"><button role="tab" aria-selected="${tab === 'login'}" data-authtab="login">Đăng nhập</button><button role="tab" aria-selected="${tab === 'register'}" data-authtab="register">Đăng ký</button></div>
  <form id="authForm" novalidate>
    ${tab === 'register' ? '<div class="field"><label for="aName">Họ và tên <span class="required">*</span></label><input class="input" id="aName" required aria-required="true"><span class="err"></span></div>' : ''}
    <div class="field"><label for="aId">Số điện thoại hoặc email <span class="required">*</span></label><input class="input" id="aId" required aria-required="true"><span class="err"></span></div>
    <div class="field"><label for="aPw">Mật khẩu (tối thiểu 6 ký tự) <span class="required">*</span></label><input class="input" id="aPw" type="password" required aria-required="true"><span class="err"></span></div>
    ${tab === 'register' ? '<div class="field"><label for="aOtp">Mã OTP (demo: 123456) <span class="required">*</span></label><input class="input" id="aOtp" inputmode="numeric" maxlength="6" required aria-required="true"><span class="err"></span></div>' : ''}
    <button class="btn btn--block" type="submit">${tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
    ${tab === 'login' ? '<p class="meta" style="margin-top:10px"><button type="button" class="link-btn" id="forgotBtn">Quên mật khẩu?</button> · Bạn cũng có thể mua hàng mà không cần đăng nhập.</p>' : ''}
  </form>`);
  $$('[data-authtab]', box).forEach(b => b.onclick = () => openAuth(b.dataset.authtab));
  const fb = $('#forgotBtn', box); if (fb) fb.onclick = () => toast('Demo: mã OTP đặt lại mật khẩu đã được gửi (123456).');
  $('#authForm', box).onsubmit = e => {
    e.preventDefault();
    const id = $('#aId').value.trim(), pw = $('#aPw').value, errs = $$('.err', box); errs.forEach(x => x.textContent = '');
    let ok = true;
    const setErr = (el, m) => { el.parentElement.querySelector('.err').textContent = m; ok = false; };
    if (tab === 'register' && !$('#aName').value.trim()) setErr($('#aName'), 'Vui lòng nhập họ tên');
    if (!/^(\+?84|0)\d{9}$/.test(id) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) setErr($('#aId'), 'Nhập số điện thoại (10 số) hoặc email hợp lệ');
    if (pw.length < 6) setErr($('#aPw'), 'Mật khẩu cần tối thiểu 6 ký tự');
    if (tab === 'register' && $('#aOtp').value !== '123456') setErr($('#aOtp'), 'OTP demo là 123456');
    if (!ok) return;
    const prev = Store.get('user_' + id, null);
    mem.user = prev || { name: tab === 'register' ? $('#aName').value.trim() : 'Khách hàng VisionEase', id, phone: /@/.test(id) ? '' : id, email: /@/.test(id) ? id : '', dob: '', addresses: [], emailConsent: false };
    save('user'); Store.set('user_' + id, mem.user);
    closeModal('modal'); refreshUser(); toast('Xin chào ' + mem.user.name);
    if (document.body.dataset.page === 'account') initAccount();
  };
}
function saveUser() { save('user'); if (mem.user) Store.set('user_' + mem.user.id, mem.user); }
function logout() { mem.user = null; save('user'); mem.usePoints = false; refreshUser(); toast('Đã đăng xuất'); if (document.body.dataset.page === 'account') initAccount(); }
function refreshUser() { const b = $('#userBtn'); if (b) b.title = mem.user ? mem.user.name : 'Đăng nhập'; }


/* ---------- Trang giỏ hàng & thanh toán (3 bước, khách vãng lai được phép) ---------- */
const ORDER_STEPS = ['Chờ xác nhận', 'Đóng gói', 'Đang giao / Sẵn sàng nhận', 'Hoàn tất'];
const CO = { step: 1, info: {}, delivery: 'home', store: 'q1', pay: 'COD', consent: false, done: null };
const CO_STEPS = ['Giỏ hàng', 'Thông tin & nhận hàng', 'Thanh toán & xác nhận'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, PHONE_RE = /^(\+?84|0)\d{9}$/;

function summaryHTML(t) {
  return `<div class="row"><span>Tạm tính</span><span>${fmt(t.sub)}</span></div>${t.discount ? `<div class="row"><span>Mã ưu đãi</span><span>−${fmt(t.discount)}</span></div>` : ''}${t.ptsValue ? `<div class="row"><span>Điểm thưởng</span><span>−${fmt(t.ptsValue)}</span></div>` : ''}<div class="row"><span>Phí giao hàng</span><span>${t.ship ? fmt(t.ship) : 'Miễn phí'}</span></div><div class="row row--total"><span>Tổng cộng</span><span>${fmt(t.total)}</span></div>`;
}
function renderCartPage() {
  const root = $('#coWrap'); if (!root) return;
  if (CO.done) {
    root.innerHTML = `<div class="panel success"><h2>Đặt hàng thành công</h2><p>Mã đơn của bạn: <strong>${CO.done.id}</strong>. Chúng tôi sẽ gửi thông báo qua email khi đơn thay đổi trạng thái.</p>
      ${mem.user ? '<p class="meta">Điểm thưởng sẽ được cộng khi đơn hoàn tất.</p>' : '<p class="meta">Đăng nhập để tích điểm cho các đơn sau.</p>'}
      <div class="panel order-tracking-summary" style="margin-top:18px"><h3>Theo dõi đơn hàng</h3><div class="progress" aria-label="Tiến trình đơn hàng">${ORDER_STEPS.map(s => `<i class="${s === ORDER_STEPS[0] ? 'done current' : ''}" title="${esc(s)}"></i>`).join('')}</div><div class="row"><strong>Trạng thái hiện tại</strong><span>${ORDER_STEPS[0]}</span></div><ol class="order-track">${ORDER_STEPS.map((s, i) => `<li class="${i === 0 ? 'done' : ''}"><span>${i + 1}</span><div><strong>${esc(s)}</strong><small>${i === 0 ? 'Đơn vừa được tạo' : 'Chưa thực hiện'}</small></div></li>`).join('')}</ol></div>
      <div class="btn-row"><a class="btn" href="tai-khoan.html#orders">Xem đơn hàng</a><a class="btn btn--ghost" href="san-pham.html">Tiếp tục mua sắm</a></div></div>`; return;
  }
  if (!mem.cart.length) {
    root.innerHTML = '<div class="empty"><p>Chưa có sản phẩm nào trong giỏ hàng.</p><a class="btn" href="san-pham.html">Tiếp tục mua sắm</a></div>'; return;
  }
  const u = mem.user || {}, info = Object.assign({ name: u.name || '', phone: u.phone || '', email: u.email || '', addr: (u.addresses && u.addresses[0] && u.addresses[0].text) || '' }, CO.info);
  const t = calcTotals(CO.delivery);
  const stepper = `<ol class="stepper" aria-label="Các bước đặt hàng">${CO_STEPS.map((s, i) => `<li class="${i + 1 < CO.step ? 'done' : ''} ${i + 1 === CO.step ? 'current' : ''}" ${i + 1 === CO.step ? 'aria-current="step"' : ''}><span>${i + 1}</span>${s}</li>`).join('')}</ol>`;
  let main = '';
  if (CO.step === 1) {
    main = mem.cart.map((i, idx) => {
      const p = byId(i.id), c = p.colors.find(c => c.name === i.color) || p.colors[0];
      return `<div class="cart-item"><img src="${IMG + c.img}" alt="${esc(p.name)}"><div><h4>${esc(p.name)}</h4><div class="meta">Màu: ${esc(c.name)} · ${fmt(p.price)}</div>
        <div class="qty" style="margin-top:6px"><button data-pq="${idx}" data-d="-1" aria-label="Giảm số lượng">−</button><input value="${i.qty}" readonly aria-label="Số lượng"><button data-pq="${idx}" data-d="1" aria-label="Tăng số lượng">+</button></div></div>
        <div style="text-align:right"><strong>${fmt(p.price * i.qty)}</strong><br><button class="link-btn" data-prm="${idx}">Xoá</button></div></div>`;
    }).join('') + `<div class="field field--row" style="margin-top:14px"><input class="input" id="couponInput2" placeholder="Mã ưu đãi (VISION10, FREESHIP)" value="${mem.coupon || ''}" aria-label="Mã ưu đãi"><button class="btn btn--sm btn--ghost" id="couponBtn2">Áp dụng</button></div>
      ${mem.user ? `<label class="check"><input type="checkbox" id="usePts2" ${mem.usePoints ? 'checked' : ''}> Dùng điểm thưởng (${pointBalance()} điểm = ${fmt(pointBalance() * 500)})</label>` : '<p class="meta">Bạn có thể mua hàng không cần tài khoản. <button class="link-btn" id="coLogin">Đăng nhập</button> để tích và dùng điểm thưởng.</p>'}`;
  } else if (CO.step === 2) {
    main = `<form id="coForm" novalidate class="panel">
      <div class="field"><label for="coName">Họ và tên</label><input class="input" id="coName" autocomplete="name" value="${esc(info.name)}"><span class="err"></span></div>
      <div class="grid grid--2" style="gap:12px"><div class="field"><label for="coPhone">Số điện thoại</label><input class="input" id="coPhone" inputmode="tel" autocomplete="tel" value="${esc(info.phone)}"><span class="err"></span></div>
      <div class="field"><label for="coMail">Email</label><input class="input" id="coMail" type="email" autocomplete="email" value="${esc(info.email)}"><span class="err"></span></div></div>
      <fieldset class="fs"><legend>Hình thức nhận hàng</legend>
        <label class="radio-card"><input type="radio" name="dl" value="home" checked><span><strong>Giao tận nơi</strong><br><span class="meta">Phí 30.000₫, miễn phí từ 500.000₫</span></span></label></fieldset>
      <div class="field" id="addrBox"><label for="coAddr">Địa chỉ giao hàng</label><input class="input" id="coAddr" autocomplete="street-address" value="${esc(info.addr)}"><span class="err"></span></div>
      <div class="btn-row"><button type="button" class="btn btn--ghost" id="coBack">Quay lại</button><button class="btn" type="submit">Tiếp tục</button></div></form>`;
  } else {
    main = `<form id="coPay" novalidate class="panel">
      <fieldset class="fs"><legend>Phương thức thanh toán</legend>
        ${['COD|Thanh toán khi nhận hàng (COD)', 'Chuyển khoản/QR|Chuyển khoản / QR', 'Ví điện tử|Ví điện tử (VNPay, MoMo, ZaloPay – demo)'].map(x => { const [v, l] = x.split('|'); return `<label class="radio-card"><input type="radio" name="pay" value="${v}" ${CO.pay === v ? 'checked' : ''}><span>${l}</span></label>`; }).join('')}</fieldset>
      <h3>Xác nhận thông tin</h3>
      <p style="color:var(--ink)">${esc(info.name)} · ${esc(info.phone)}${info.email ? ' · ' + esc(info.email) : ''}<br>Giao đến: ${esc(info.addr)}</p>
      <label class="check"><input type="checkbox" id="coConsent" ${CO.consent ? 'checked' : ''}> Tôi đồng ý nhận email ưu đãi và nội dung chăm sóc mắt (không bắt buộc, có thể huỷ bất kỳ lúc nào)</label>
      <div class="btn-row"><button type="button" class="btn btn--ghost" id="coBack">Quay lại</button><button class="btn" type="submit">Xác nhận đặt hàng</button></div></form>`;
  }
  const side = `<aside class="panel co-side" aria-label="Tóm tắt đơn hàng"><h3>Tóm tắt đơn hàng</h3>${summaryHTML(t)}
    ${CO.step === 1 ? '<button class="btn btn--block" id="coNext" style="margin-top:12px">Tiếp tục</button><p style="text-align:center;margin:10px 0 0"><a href="san-pham.html">Tiếp tục mua sắm</a></p>' : ''}</aside>`;
  root.innerHTML = stepper + `<div class="co-grid"><div class="co-main">${main}</div>${side}</div>`;
  bindCartPage();
}
function bindCartPage() {
  const root = $('#coWrap'), go = n => { CO.step = n; renderCartPage(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  $$('[data-pq]', root).forEach(b => b.onclick = () => { const it = mem.cart[+b.dataset.pq]; updateCartQuantity(it.id, it.qty + +b.dataset.d, it.color); });
  $$('[data-prm]', root).forEach(b => b.onclick = () => { const it = mem.cart[+b.dataset.prm]; removeFromCart(it.id, it.color); });
  const cb = $('#couponBtn2', root); if (cb) cb.onclick = () => { const v = $('#couponInput2').value.trim().toUpperCase(); if (!v) mem.coupon = null; else if (COUPONS[v]) { mem.coupon = v; showToast('Đã áp dụng: ' + COUPONS[v].label); } else showToast('Mã ưu đãi không hợp lệ', 'error'); renderCartPage(); };
  const up = $('#usePts2', root); if (up) up.onchange = () => { mem.usePoints = up.checked; renderCartPage(); };
  const lg = $('#coLogin', root); if (lg) lg.onclick = () => openAuth();
  const nx = $('#coNext', root); if (nx) nx.onclick = () => go(2);
  const bk = $('#coBack', root); if (bk) bk.onclick = () => go(CO.step - 1);
  const f = $('#coForm', root);
  if (f) {
    $$('input[name=dl]', f).forEach(r => r.onchange = () => { CO.delivery = r.value; CO.info = { name: $('#coName').value, phone: $('#coPhone').value, email: $('#coMail').value, addr: $('#coAddr').value }; renderCartPage(); });
    f.onsubmit = e => {
      e.preventDefault(); $$('.err', f).forEach(x => x.textContent = ''); let ok = true;
      const bad = (id, m) => { const el = $('#' + id); el.parentElement.querySelector('.err').textContent = m; el.setAttribute('aria-invalid', 'true'); if (ok) el.focus(); ok = false; };
      if (!$('#coName').value.trim()) bad('coName', 'Vui lòng nhập họ tên');
      if (!PHONE_RE.test($('#coPhone').value.trim())) bad('coPhone', 'Số điện thoại chưa hợp lệ (10 số)');
      if ($('#coMail').value && !EMAIL_RE.test($('#coMail').value)) bad('coMail', 'Email chưa hợp lệ');
      if (CO.delivery === 'home' && $('#coAddr').value.trim().length < 8) bad('coAddr', 'Vui lòng nhập địa chỉ đầy đủ');
      if (!ok) return;
      CO.info = { name: $('#coName').value.trim(), phone: $('#coPhone').value.trim(), email: $('#coMail').value.trim(), addr: $('#coAddr').value.trim() };
      CO.delivery = 'home'; go(3);
    };
  }
  const pf = $('#coPay', root);
  if (pf) pf.onsubmit = e => {
    e.preventDefault(); CO.pay = $('input[name=pay]:checked', pf).value; CO.consent = $('#coConsent').checked;
    const t = calcTotals(CO.delivery), i = CO.info;
    const order = { id: 'VE' + String(Date.now()).slice(-8), date: new Date().toISOString(), items: mem.cart.map(x => ({ ...x, price: byId(x.id).price })), delivery: CO.delivery, store: CO.store, addr: i.addr, name: i.name, phone: i.phone, email: i.email, pay: CO.pay, totals: t, status: 0, user: mem.user ? mem.user.id : null, returned: false };
    mem.orders.unshift(order); save('orders');
    if (mem.user && t.pts) mem.points.unshift({ d: order.date, pts: -t.pts, note: 'Dùng điểm cho đơn ' + order.id });
    if (mem.user && CO.consent) { mem.user.emailConsent = true; saveUser(); }
    save('points'); mem.cart = []; mem.coupon = null; mem.usePoints = false; saveCart();
    CO.done = order; CO.step = 1; renderCartPage(); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}
function initCartPage() { renderCartPage(); }
