/* admin.js – trang quản trị demo, phân quyền theo vai trò (NFR13, NFR15) */
'use strict';
const ROLES = {
  QL: { name: 'Quản lý', tabs: ['overview', 'products', 'stock', 'orders', 'appts', 'qa', 'audit'] },
  NV: { name: 'Nhân viên bán hàng', tabs: ['overview', 'stock', 'orders', 'appts'] },
  CG: { name: 'Bác sĩ / Dược sĩ', tabs: ['qa'] }
};
const TAB_LABEL = { overview: 'Tổng quan', products: 'Sản phẩm', stock: 'Tồn kho', orders: 'Đơn hàng', appts: 'Lịch hẹn', qa: 'Hỏi đáp & ticket', audit: 'Nhật ký' };

function initAdmin() {
  const root = $('#adminWrap');
  if (!mem.admin) { renderAdminLogin(root); return; }
  const role = ROLES[mem.admin.role]; let tab = role.tabs.includes((location.hash || '').slice(1)) ? location.hash.slice(1) : role.tabs[0];
  const lowStock = () => PRODUCTS.flatMap(p => BRANCHES.filter(b => p.stock[b.id] < 5).map(b => ({ p, b, q: p.stock[b.id] })));
  const views = {
    overview: () => {
      const rev = mem.orders.filter(o => o.status !== 4).reduce((a, o) => a + o.totals.total, 0);
      const stat = (n, l) => `<div class="kpi"><strong>${n}</strong><span>${l}</span></div>`;
      return `<div class="kpis">${stat(mem.orders.length, 'Đơn hàng')}${stat(mem.orders.filter(o => o.status === 0).length, 'Chờ xác nhận')}${stat(formatPrice(rev), 'Doanh thu (không tính đơn huỷ)')}${stat(mem.appts.filter(a => a.status !== 'Đã huỷ').length, 'Lịch hẹn')}${stat(lowStock().length, 'Cảnh báo tồn kho thấp')}</div>
        <p class="meta">Số liệu lấy từ dữ liệu demo lưu trong trình duyệt của bạn.</p>`;
    },
    products: () => `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sản phẩm</th><th>Giá (₫)</th><th>Hiển thị</th><th></th></tr></thead><tbody>${PRODUCTS.map(p => `<tr><td>${esc(p.name)}</td><td><label class="sr-only" for="pr_${p.id}">Giá ${esc(p.name)}</label><input class="input" id="pr_${p.id}" type="number" min="1000" step="1000" value="${p.price}" style="width:130px"></td><td><label class="check"><input type="checkbox" id="vis_${p.id}" ${p.hidden ? '' : 'checked'}> Hiện</label></td><td><button class="btn btn--sm" data-psave="${p.id}">Lưu</button></td></tr>`).join('')}</tbody></table></div>`,
    stock: () => `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sản phẩm</th>${BRANCHES.map(b => `<th>${esc(b.name)}</th>`).join('')}</tr></thead><tbody>${PRODUCTS.map(p => `<tr><td>${esc(p.name)}</td>${BRANCHES.map(b => `<td><label class="sr-only" for="st_${p.id}_${b.id}">Tồn ${esc(p.name)} ${esc(b.name)}</label><input class="input ${p.stock[b.id] < 5 ? 'input--warn' : ''}" id="st_${p.id}_${b.id}" type="number" min="0" value="${p.stock[b.id]}" style="width:80px" ${mem.admin.role === 'QL' || mem.admin.role === 'NV' ? '' : 'disabled'}>${p.stock[b.id] < 5 ? '<small class="warn-txt"> Sắp hết</small>' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p><button class="btn" id="stockSave">Lưu tồn kho</button></p>`,
    orders: () => mem.orders.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Khách</th><th>Tổng</th><th>Nhận hàng</th><th>Trạng thái</th></tr></thead><tbody>${mem.orders.map(o => `<tr><td>${o.id}</td><td>${esc(o.name)}<br><small class="meta">${esc(o.phone)}</small></td><td>${formatPrice(o.totals.total)}</td><td>Giao tận nơi</td><td><label class="sr-only" for="os_${o.id}">Trạng thái đơn ${o.id}</label><select class="select" id="os_${o.id}" data-ostatus="${o.id}">${ORDER_STEPS.concat(['Đã huỷ']).map((s, i) => `<option value="${i}" ${o.status === i ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Chưa có đơn hàng nào. Hãy đặt thử một đơn ở trang giỏ hàng.</div>',
    appts: () => mem.appts.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã</th><th>Cửa hàng</th><th>Thời gian</th><th>Mục đích</th><th>Trạng thái</th></tr></thead><tbody>${mem.appts.map(a => `<tr><td>${a.id}</td><td>${esc((BRANCHES.find(b => b.id === a.branch) || {}).name || a.branch)}</td><td>${esc(a.date)} ${esc(a.time)}</td><td>${esc(a.purpose || '')}</td><td>${esc(a.status || 'Đã đặt')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Chưa có lịch hẹn nào.</div>',
    qa: () => {
      const tickets = mem.questions.filter(q => q.ticket && (mem.admin.role === 'QL' || q.ticket.to === (mem.admin.role === 'CG' ? 'Bác sĩ' : '')) || (mem.admin.role === 'CG' && q.ticket && q.ticket.to === 'Dược sĩ'));
      return tickets.length ? tickets.map(q => `<div class="panel" style="margin-bottom:12px"><div class="row"><strong>${q.ticket.id} → ${esc(q.ticket.to)}</strong><span class="pill pill--low">${esc(q.ticket.status)}</span></div><p>${esc(maskPII(q.q))}</p><small class="meta">${esc(q.ticket.why)}</small>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><label class="sr-only" for="rp_${q.id}">Nội dung trả lời</label><input class="input" id="rp_${q.id}" placeholder="Nhập câu trả lời…" style="flex:1;min-width:200px"><button class="btn btn--sm" data-reply="${q.id}">Trả lời</button>
        ${mem.admin.role === 'QL' ? ['CSKH', 'Bác sĩ', 'Dược sĩ'].filter(r => r !== q.ticket.to).map(r => `<button class="btn btn--sm btn--ghost" data-fwd="${q.id}" data-to="${r}">Chuyển ${r}</button>`).join('') : ''}</div></div>`).join('') : '<div class="empty">Chưa có ticket nào. Ticket được tạo khi khách bấm “Không hữu ích” ở Góc hỏi đáp.</div>';
    },
    audit: () => mem.audit.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Thời gian</th><th>Vai trò</th><th>Thao tác</th></tr></thead><tbody>${mem.audit.map(a => `<tr><td>${new Date(a.t).toLocaleString('vi-VN')}</td><td>${esc(a.role)}</td><td>${esc(a.text)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Chưa có thao tác nào được ghi nhận.</div>'
  };
  const draw = () => {
    root.innerHTML = `<div class="row" style="margin-bottom:14px"><p style="margin:0">Đăng nhập với vai trò <strong>${role.name}</strong></p><button class="btn btn--ghost btn--sm" id="admOut">Đăng xuất</button></div>
      <div class="tabs" role="tablist" aria-label="Quản trị">${role.tabs.map(t => `<button role="tab" data-t="${t}" aria-selected="${t === tab}">${TAB_LABEL[t]}</button>`).join('')}</div><div class="adm-body">${views[tab]()}</div>`;
    $$('[data-t]', root).forEach(b => b.onclick = () => { tab = b.dataset.t; history.replaceState(null, '', '#' + tab); draw(); });
    $('#admOut').onclick = () => { logAudit('Đăng xuất'); mem.admin = null; save('admin'); initAdmin(); };
    $$('[data-psave]', root).forEach(b => b.onclick = () => {
      const id = b.dataset.psave, price = +$('#pr_' + id).value, hidden = !$('#vis_' + id).checked;
      if (!(price >= 1000)) { showToast('Giá không hợp lệ', 'error'); return; }
      mem.overrides[id] = Object.assign(mem.overrides[id] || {}, { price, hidden }); save('overrides'); applyOverrides();
      logAudit('Cập nhật sản phẩm ' + id + ': giá ' + formatPrice(price) + (hidden ? ', ẩn' : ', hiện')); showToast('Đã lưu sản phẩm'); draw();
    });
    const ss = $('#stockSave'); if (ss) ss.onclick = () => {
      PRODUCTS.forEach(p => { const st = {}; BRANCHES.forEach(b => { st[b.id] = Math.max(0, parseInt($('#st_' + p.id + '_' + b.id).value, 10) || 0); }); mem.overrides[p.id] = Object.assign(mem.overrides[p.id] || {}, { stock: st }); });
      save('overrides'); applyOverrides(); logAudit('Cập nhật tồn kho'); showToast('Đã lưu tồn kho'); draw();
    };
    $$('[data-ostatus]', root).forEach(s => s.onchange = () => { const o = mem.orders.find(x => x.id === s.dataset.ostatus); o.status = +s.value; save('orders'); logAudit('Đơn ' + o.id + ' → ' + (ORDER_STEPS.concat(['Đã huỷ'])[o.status])); showToast('Đã cập nhật trạng thái đơn'); });
    $$('[data-reply]', root).forEach(b => b.onclick = () => {
      const q = mem.questions.find(x => x.id === b.dataset.reply), v = $('#rp_' + q.id).value.trim();
      if (v.length < 5) { showToast('Vui lòng nhập câu trả lời', 'error'); return; }
      const r = mem.admin.role === 'CG' ? q.ticket.to : (q.ticket.to || 'CSKH');
      q.answers.push({ role: r, text: v }); q.ticket.status = 'Đã trả lời'; save('questions'); logAudit('Trả lời ticket ' + q.ticket.id); showToast('Đã gửi câu trả lời'); draw();
    });
    $$('[data-fwd]', root).forEach(b => b.onclick = () => { const q = mem.questions.find(x => x.id === b.dataset.fwd); q.ticket.to = b.dataset.to; q.ticket.status = 'Đã chuyển, chờ trả lời'; save('questions'); logAudit('Chuyển ticket ' + q.ticket.id + ' cho ' + b.dataset.to); showToast('Đã chuyển ticket'); draw(); });
  };
  draw();
}
function renderAdminLogin(root) {
  root.innerHTML = `<form class="panel" id="admForm" style="max-width:440px" novalidate><h2 style="font-size:1.3rem">Đăng nhập quản trị (demo)</h2>
    <p class="meta">Chỉ dành cho nhân sự VisionEase. Mỗi vai trò chỉ thấy chức năng được cấp quyền.</p>
    <div class="field"><label for="admRole">Vai trò</label><select class="select" id="admRole">${Object.keys(ROLES).map(k => `<option value="${k}">${ROLES[k].name}</option>`).join('')}</select></div>
    <div class="field" id="otpBox"><label for="admOtp">Mã OTP (demo: 123456, bắt buộc với Quản lý)</label><input class="input" id="admOtp" inputmode="numeric" maxlength="6"><span class="err"></span></div>
    <button class="btn btn--block" type="submit">Đăng nhập</button></form>`;
  $('#admRole').onchange = e => { $('#otpBox').hidden = e.target.value !== 'QL'; };
  $('#admForm').onsubmit = e => {
    e.preventDefault(); const r = $('#admRole').value;
    if (r === 'QL' && $('#admOtp').value !== '123456') { $('.err', root).textContent = 'OTP demo là 123456'; return; }
    mem.admin = { role: r }; save('admin'); logAudit('Đăng nhập'); initAdmin();
  };
}
