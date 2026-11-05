/* support.js – trợ lý ảo, hỏi đáp, blog, đặt lịch, giới thiệu, tài khoản */
'use strict';
/* ---------- Trợ lý ảo ---------- */
function botReply(text) {
  const q = norm(text);
  const health = /(dau|nhuc|do mat|mat do|bi do|ngua|mo mat|nhin mo|kho mat|chay nuoc|sung|thuoc|benh|chan doan|tre em|thanh phan|di ung)/.test(q);
  if (health) return { html: 'Mình không chẩn đoán hay thay thế tư vấn y khoa. Với câu hỏi về tình trạng mắt, bạn nên gặp bác sĩ. Mình có thể chuyển câu hỏi này đến bác sĩ/dược sĩ của VisionEase qua <a href="hoi-dap.html">Góc hỏi đáp</a>.', escalate: true };
  if (/(doi tra|hoan tien|bao hanh|tra hang)/.test(q)) return { html: 'VisionEase hỗ trợ đổi trả trong 7 ngày kể từ khi nhận hàng. Bạn gửi yêu cầu trong mục <a href="tai-khoan.html#orders">Đơn hàng</a> kèm lý do và hình ảnh; nhân viên CSKH sẽ phản hồi trong 24 giờ.' };
  if (/(giao hang|van chuyen|ship|phi giao)/.test(q)) return { html: 'Phí giao hàng 30.000₫, miễn phí cho đơn từ 500.000₫.' };
  if (/(diem|tich diem|thanh vien|hoi vien)/.test(q)) return { html: 'Bạn tích 1 điểm cho mỗi 10.000₫ thực thanh toán (đã trừ giảm giá, không tính phí vận chuyển). Đủ 50 điểm đổi mã giảm 25.000₫ cho đơn từ 200.000₫ (mức demo). Điểm xem tại <a href="tai-khoan.html#points">Tài khoản</a>.' };
  if (/(dat lich|thu gong|cua hang|chi nhanh)/.test(q)) return { html: 'Bạn có thể đặt lịch đo mắt hoặc tư vấn chọn sản phẩm tại <a href="dat-lich.html">trang Đặt lịch</a>, chọn chi nhánh và khung giờ còn trống.' };
  if (/(thanh toan|cod|chuyen khoan|vi dien tu)/.test(q)) return { html: 'VisionEase hỗ trợ COD, chuyển khoản/QR và ví điện tử (VNPay, MoMo, ZaloPay).' };
  const need = /(hoc|sinh vien)/.test(q) ? 'hoc-tap' : /(van phong|di lam|cong so)/.test(q) ? 'van-phong' : /(game|choi)/.test(q) ? 'choi-game' : /(ban dem|khuya|dem)/.test(q) ? 'ban-dem' : null;
  if (need || /(kinh|gong|chon)/.test(q)) {
    const list = PRODUCTS.filter(p => p.type === 'kinh' && (!need || p.needs.includes(need))).slice(0, 2);
    const why = need ? 'phù hợp nhu cầu “' + NEEDS[need] + '”' : 'được nhiều khách quan tâm';
    return { html: 'Gợi ý ' + why + ':<br>' + list.map(p => `• <a href="chi-tiet-san-pham.html?id=${p.id}">${esc(p.name)}</a> (${fmt(p.price)}) – gọng ${p.material}, kiểu ${p.style.toLowerCase()}`).join('<br>') + '<br>' + FRAME_NOTE };
  }
  return { fallback: true, html: 'Mình chưa hiểu rõ câu hỏi. Bạn có thể hỏi về sản phẩm, giao hàng, đổi trả, tích điểm hoặc đặt lịch; hoặc đăng câu hỏi ở <a href="hoi-dap.html">Góc hỏi đáp</a> để chuyên gia hỗ trợ.' };
}
function initChat() {
  const body = $('#chatBody'), chat = $('#chat');
  const add = (html, me) => { const d = document.createElement('div'); d.className = 'msg ' + (me ? 'msg--me' : 'msg--bot'); d.innerHTML = html; body.appendChild(d); body.scrollTop = body.scrollHeight; };
  add('Xin chào! Mình là trợ lý ảo của VisionEase. Mình hỗ trợ chọn sản phẩm, đơn hàng và chính sách, nhưng không chẩn đoán bệnh về mắt.');
  const ask = t => { if (!t.trim()) return; add(esc(t), true); setTimeout(() => { let r; try { r = botReply(maskPII(t)); } catch (err) { r = { html: 'Trợ lý ảo tạm thời không khả dụng. Bạn vui lòng liên hệ CSKH qua <a href="hoi-dap.html">Góc hỏi đáp</a> hoặc hotline 1900 0000.' }; } add(r.html); }, 450); };
  $('#chatFab').onclick = () => { chat.classList.toggle('open'); if (chat.classList.contains('open')) $('#chatInput').focus(); };
  $('#chatClose').onclick = () => chat.classList.remove('open');
  $('#chatForm').onsubmit = e => { e.preventDefault(); const i = $('#chatInput'); ask(i.value); i.value = ''; };
  $$('#chatQuick button').forEach(b => b.onclick = () => ask(b.textContent));
}

/* ---------- Góc hỏi đáp ---------- */
const ROLE_CLS = { 'Trợ lý ảo': '', 'Bác sĩ': 'role--bs', 'Dược sĩ': 'role--ds', 'CSKH': 'role--cskh' };
function routeTicket(text) {
  const q = norm(text);
  if (/(don hang|giao hang|doi tra|hoan tien|bao hanh|diem|thanh toan|chinh sach|van chuyen)/.test(q)) return { to: 'CSKH', why: 'liên quan đơn hàng/chính sách' };
  if (/(nuoc mat|nho mat|thuoc|thanh phan|di ung|han dung|lieu)/.test(q)) return { to: 'Dược sĩ', why: 'liên quan sản phẩm nhỏ mắt/thành phần' };
  return { to: 'Bác sĩ', why: 'liên quan sức khỏe mắt' };
}
function assistantAnswer(text) {
  const r = botReply(maskPII(text)); /* NFR14: ẩn SĐT/email trước khi gửi cho AI */ let t = r.html.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
  if (r.fallback) t = 'Trợ lý ảo chưa chắc chắn về câu trả lời cho câu hỏi này. Nếu câu trả lời chưa hữu ích, bạn hãy chọn “Không hữu ích” để hệ thống chuyển câu hỏi đến chuyên gia phù hợp.';
  if (r.escalate) t = 'Mình không chẩn đoán hay thay thế tư vấn y khoa. Bạn có thể xem thêm bài viết hướng dẫn ở mục Mắt khỏe mỗi ngày và nên đi khám nếu triệu chứng kéo dài.';
  return t;
}

function pharmacistDemoAnswer(question) {
  const q = norm(question);
  if (/(nho mat|nuoc mat nhan tao|han dung|mo nap)/.test(q)) {
    return 'Dược sĩ: Hạn dùng sau khi mở chai có thể khác nhau theo từng loại và hãng. Bạn hãy ghi thời gian mở đầu và tuân theo hướng dẫn trên bao bì (thường là 28–30 ngày đối với sản phẩm nhiều liều, nhưng không áp dụng tự động cho mọi lọ thuốc). Nếu mắt đỏ đau, nhìn mờ hoặc khó chịu kéo dài, hãy ngừng dùng và gặp bác sĩ.';
  }
  if (/(thanh phan|di ung)/.test(q)) {
    return 'Dược sĩ: Bạn đọc kỹ thành phần hoạt chất và phụ gia trên bao bì, tránh sản phẩm đã từng gây kích ứng cho bạn. Khi gặp phản ứng sưng, đỏ, ngứa hoặc khó chịu, ngừng sử dụng và hỏi ý kiến bác sĩ/dược sĩ.';
  }
  return 'Dược sĩ: Thông tin dùng sản phẩm cần theo hướng dẫn trên bao bì và tình trạng sức khỏe cá nhân. Bạn nên kiểm tra liều dùng, hạn dùng và tương tác thuốc; nếu triệu chứng kéo dài hoặc nặng lên, hãy gặp bác sĩ.';
}
function initQA() {
  const all = () => mem.questions.filter(q => q.mine).concat(QA_SEED.map(s => mem.questions.find(q => q.id === s.id) || s));
  const draw = () => {
    const kw = norm($('#qaSearch').value || '');
    const list = all().filter(x => !kw || norm(x.q + ' ' + x.answers.map(a => a.text).join(' ')).includes(kw) );
    $('#qaList').innerHTML = list.length ? list.map(x => `<article class="qa-item" data-id="${x.id}"><h3>${esc(x.q)}</h3><div class="qa-meta">${esc(x.author)} · ${x.date}${x.hidden ? ' · (đã ẩn)' : ''}</div>
      ${x.answers.map(a => `<div class="answer"><span class="role ${ROLE_CLS[a.role] || ''}">${a.role}</span><div>${esc(a.text)}</div></div>`).join('')}
      ${x.ticket ? `<div class="ticket"><strong>Ticket ${x.ticket.id}</strong> đã chuyển đến <strong>${x.ticket.to}</strong> (${x.ticket.why}). Trạng thái: ${x.ticket.status}. Thời gian phản hồi dự kiến trong 24 giờ làm việc. ${x.ticket.status !== 'Đã trả lời' ? `<button class="link-btn" data-sim="${x.id}">Mô phỏng chuyên gia trả lời</button>` : ''}</div>` : ''}
      <div class="vote"><span>Câu trả lời có hữu ích không?</span>${x.voted ? `<span>Cảm ơn phản hồi của bạn.</span>` : `<button class="btn btn--ghost btn--sm" data-vote="up" data-id="${x.id}">👍 Hữu ích (${x.helpful})</button><button class="btn btn--ghost btn--sm" data-vote="down" data-id="${x.id}">👎 Không hữu ích (${x.unhelpful})</button>`}
      ${x.mine ? `<button class="link-btn" data-del="${x.id}">Xoá câu hỏi</button>` : ''}</div></article>`).join('') : '<div class="empty">Chưa có câu hỏi phù hợp. Hãy là người đầu tiên đặt câu hỏi!</div>';
  };
  draw();
  $('#qaSearch').addEventListener('input', draw);
  $('#qaForm').onsubmit = e => {
    e.preventDefault(); const t = $('#qaText').value.trim(), err = $('#qaForm .err');
    if (!mem.user) { toast('Vui lòng đăng nhập để đăng câu hỏi', true); openAuth(); return; }
    if (t.length < 10) { err.textContent = 'Câu hỏi cần ít nhất 10 ký tự'; return; } err.textContent = '';
    mem.questions.unshift({ id: 'u' + Date.now(), author: mem.user.name, date: new Date().toLocaleDateString('vi-VN'), q: t, mine: true, helpful: 0, unhelpful: 0, answers: [{ role: 'Trợ lý ảo', text: assistantAnswer(t) }] });
    save('questions'); $('#qaText').value = ''; draw(); toast('Đã đăng câu hỏi – trợ lý ảo đã trả lời');
  };
  $('#qaList').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const find = id => {
      let x = mem.questions.find(q => q.id === id);
      if (!x) { x = JSON.parse(JSON.stringify(QA_SEED.find(q => q.id === id))); mem.questions.push(x); }
      return x;
    };
    if (b.dataset.vote) {
      const x = find(b.dataset.id); x.voted = true;
      if (b.dataset.vote === 'up') x.helpful++;
      else {
        x.unhelpful++; const r = routeTicket(x.q); x.ticket = { id: 'TK' + String(Date.now()).slice(-6), to: r.to, why: r.why, status: 'Đã chuyển, chờ trả lời' };
        toast('Hệ thống đã phân tích câu hỏi và tạo ticket cho ' + r.to);
      }
      save('questions'); draw();
    } else if (b.dataset.sim) {
      const x = find(b.dataset.sim); const role = x.ticket.to;
      const specialistText = role === 'Dược sĩ' ? pharmacistDemoAnswer(x.q) : role === 'Bác sĩ' ? 'Bác sĩ: Thông tin này chỉ mang tính tham khảo. Nếu triệu chứng mắt kéo dài, tái phát hoặc ảnh hưởng thị lực, bạn nên đến cơ sở y tế để được thăm khám trực tiếp.' : 'Nhân viên CSKH đã tiếp nhận và sẽ liên hệ với bạn qua email để hỗ trợ cụ thể theo đơn hàng.';
      x.answers.push({ role, text: specialistText });
      x.ticket.status = 'Đã trả lời'; save('questions'); draw(); toast(role + ' đã trả lời câu hỏi của bạn (mô phỏng)');
    } else if (b.dataset.del) { mem.questions = mem.questions.filter(x => x.id !== b.dataset.del); save('questions'); draw(); toast('Đã xoá câu hỏi'); }
  });
}

/* ---------- Mắt khỏe mỗi ngày ---------- */
function initBlog() {
  let topic = 'Tất cả', kw = '';
  const topics = ['Tất cả', ...new Set(ARTICLES.map(a => a.topic))];
  $('#topics').innerHTML = topics.map(t => `<button class="chip" aria-pressed="${t === topic}" data-t="${t}">${t}</button>`).join('');
  const draw = () => {
    $$('#topics .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.t === topic));
    const list = ARTICLES.filter(a => (topic === 'Tất cả' || a.topic === topic) && (!kw || norm(a.title + a.sum).includes(norm(kw))));
    $('#posts').innerHTML = list.length ? list.map(a => `<article class="card post-card"><div class="post-card__cover"><img src="${IMG + a.image}" alt="" loading="lazy"></div><div class="post-card__body"><span class="meta">${a.topic} · ${a.time} đọc</span><h3>${esc(a.title)}</h3><p>${esc(a.sum)}</p><button class="link-btn" data-a="${a.id}" style="text-align:left">Đọc bài viết →</button></div></article>`).join('') : '<div class="empty" style="grid-column:1/-1">Không có bài viết phù hợp.</div>';
  };
  $('#topics').onclick = e => { const b = e.target.closest('.chip'); if (b) { topic = b.dataset.t; draw(); } };
  $('#blogSearch').oninput = e => { kw = e.target.value; draw(); };
  $('#posts').onclick = e => { const b = e.target.closest('[data-a]'); if (b) openArticle(b.dataset.a); };
  draw();
  if (qs().get('a')) openArticle(qs().get('a'));
}
function openArticle(id) {
  const a = ARTICLES.find(x => x.id === id); if (!a) return;
  showModal(`<article class="article"><span class="eyebrow">${a.topic} · ${a.time} đọc</span><h2>${esc(a.title)}</h2>${a.body.map(p => `<p>${esc(p)}</p>`).join('')}
    <p class="disclaimer">Nội dung mang tính tham khảo, không thay thế tư vấn y khoa.</p><h4 style="margin-top:16px">Sản phẩm liên quan</h4><div class="related-strip">${a.rel.map(i => { const p = byId(i); return `<a class="btn btn--ghost btn--sm" href="chi-tiet-san-pham.html?id=${p.id}">${esc(p.name)}</a>`; }).join('')}</div></article>`, true);
}

/* ---------- Đặt lịch ---------- */
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
const SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30'];
function dateKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function initBooking() {
  const sel = { branch: BRANCHES[0].id, date: null, time: null, edit: null };
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0); return d; });
  sel.date = dateKey(days[0]);
  $('#bBranch').innerHTML = BRANCHES.map(b => `<option value="${b.id}">${b.name} – ${b.area} (${b.hours})</option>`).join('');
  const drawDays = () => { $('#bDays').innerHTML = days.map(d => `<button type="button" class="chip" data-d="${dateKey(d)}" aria-pressed="${dateKey(d) === sel.date}">${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}</button>`).join(''); };
  const taken = (b, d, t) => hash(b + d + t) % 5 === 0 || mem.appts.some(a => a.branch === b && a.date === d && a.time === t && a.status !== 'Đã huỷ' && a.id !== sel.edit);
  const drawSlots = () => {
    const now = new Date();
    $('#bSlots').innerHTML = SLOT_TIMES.map(t => {
      const [h, m] = t.split(':').map(Number), dt = new Date(sel.date + 'T00:00:00'); dt.setHours(h, m);
      const dis = taken(sel.branch, sel.date, t) || dt - now < 2 * 3600e3;
      return `<button type="button" class="slot" data-t="${t}" aria-pressed="${sel.time === t}" ${dis ? 'disabled' : ''}>${t}</button>`;
    }).join('');
  };
  const drawMap = () => { const b = BRANCHES.find(x => x.id === sel.branch); $('#bMap').src = 'https://www.google.com/maps?q=' + encodeURIComponent(b.map) + '&output=embed'; $('#bAddr').textContent = b.name + ' – ' + b.area + ' · Mở cửa ' + b.hours; };
  const drawList = () => {
    const mine = mem.appts.filter(a => !mem.user || !a.user || a.user === mem.user.id);
    $('#bList').innerHTML = mine.length ? mine.map(a => { const b = BRANCHES.find(x => x.id === a.branch); return `<div class="appt"><div><strong>${a.date.split('-').reverse().join('/')} lúc ${a.time}</strong> · ${esc(b.name)}<br><span class="meta">${esc(a.purpose)} · Trạng thái: ${a.status}</span></div><div>${a.status === 'Đã xác nhận' ? `<button class="btn btn--ghost btn--sm" data-edit="${a.id}">Đổi lịch</button> <button class="btn btn--ghost btn--sm" data-cancel="${a.id}">Huỷ</button>` : ''}</div></div>`; }).join('') : '<div class="empty">Bạn chưa có lịch hẹn nào.</div>';
  };
  drawDays(); drawSlots(); drawMap(); drawList();
  $('#bBranch').onchange = e => { sel.branch = e.target.value; sel.time = null; drawSlots(); drawMap(); };
  $('#bDays').onclick = e => { const b = e.target.closest('[data-d]'); if (b) { sel.date = b.dataset.d; sel.time = null; drawDays(); drawSlots(); } };
  $('#bSlots').onclick = e => { const b = e.target.closest('.slot'); if (b && !b.disabled) { sel.time = b.dataset.t; drawSlots(); } };
  const u = mem.user; if (u) { $('#bName').value = u.name || ''; $('#bPhone').value = u.phone || ''; $('#bMail').value = u.email || ''; }
  $('#bForm').onsubmit = e => {
    e.preventDefault(); $$('#bForm .err').forEach(x => x.textContent = ''); let ok = true;
    const bad = (id, m) => { $('#' + id).parentElement.querySelector('.err').textContent = m; ok = false; };
    if (!$('#bName').value.trim()) bad('bName', 'Vui lòng nhập họ tên');
    if (!/^(\+?84|0)\d{9}$/.test($('#bPhone').value.trim())) bad('bPhone', 'Số điện thoại chưa hợp lệ');
    if ($('#bMail').value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#bMail').value)) bad('bMail', 'Email chưa hợp lệ');
    if (!sel.time) { $('#slotErr').textContent = 'Vui lòng chọn khung giờ còn trống'; ok = false; } else $('#slotErr').textContent = '';
    if (!ok) return;
    const data = { branch: sel.branch, date: sel.date, time: sel.time, purpose: $('#bPurpose').value, name: $('#bName').value.trim(), phone: $('#bPhone').value.trim(), email: $('#bMail').value.trim(), status: 'Đã xác nhận', user: mem.user ? mem.user.id : null };
    if (sel.edit) { Object.assign(mem.appts.find(a => a.id === sel.edit), data); sel.edit = null; $('#bSubmit').textContent = 'Xác nhận đặt lịch'; toast('Đã đổi lịch hẹn'); }
    else { mem.appts.unshift({ id: 'LH' + String(Date.now()).slice(-6), ...data }); toast('Đặt lịch thành công – email nhắc lịch sẽ gửi trước 24 giờ và 2 giờ'); }
    save('appts'); sel.time = null; drawSlots(); drawList();
  };
  $('#bList').onclick = e => {
    const c = e.target.closest('[data-cancel]'), ed = e.target.closest('[data-edit]');
    const withinRule = a => new Date(a.date + 'T00:00:00').setHours(...a.time.split(':').map(Number)) - Date.now() >= 2 * 3600e3;
    if (c) { const a = mem.appts.find(x => x.id === c.dataset.cancel); if (!withinRule(a)) { toast('Chỉ huỷ được trước giờ hẹn tối thiểu 2 giờ', true); return; } a.status = 'Đã huỷ'; save('appts'); drawSlots(); drawList(); toast('Đã huỷ lịch hẹn'); }
    if (ed) { const a = mem.appts.find(x => x.id === ed.dataset.edit); if (!withinRule(a)) { toast('Chỉ đổi lịch được trước giờ hẹn tối thiểu 2 giờ', true); return; } sel.edit = a.id; sel.branch = a.branch; $('#bBranch').value = a.branch; sel.time = null; $('#bPurpose').value = ['Đo mắt', 'Tư vấn sản phẩm'].includes(a.purpose) ? a.purpose : 'Đo mắt'; drawSlots(); drawMap(); $('#bSubmit').textContent = 'Lưu thay đổi lịch hẹn'; $('#bForm').scrollIntoView({ behavior: 'smooth' }); toast('Chọn ngày giờ mới rồi bấm “Lưu thay đổi”'); }
  };
}

/* ---------- Giới thiệu ---------- */
function initAbout() {
  $('#branches').innerHTML = BRANCHES.map(b => `<div class="card cat-card"><h3>${b.name}</h3><p>${b.area}<br>Giờ mở cửa: ${b.hours}</p><a href="dat-lich.html">Đặt lịch tại đây →</a></div>`).join('');
  if (location.hash) { const t = $(location.hash); if (t && t.tagName === 'DETAILS') t.open = true; } }

/* ---------- Tài khoản ---------- */
function initAccount() {
  const wrap = $('#accWrap');
  if (!mem.user) { wrap.innerHTML = '<div class="empty" style="margin:30px 0"><p>Vui lòng đăng nhập để xem hồ sơ, đơn hàng, lịch hẹn và điểm thưởng.</p><button class="btn" id="accLogin">Đăng nhập / Đăng ký</button></div>'; $('#accLogin').onclick = () => openAuth(); return; }
  let tab = (location.hash || '#profile').slice(1);
  const tabs = [['profile', 'Hồ sơ cá nhân'], ['orders', 'Đơn hàng'], ['appts', 'Lịch hẹn'], ['points', 'Điểm thưởng']];
  const myOrders = () => mem.orders.filter(o => o.user === mem.user.id || !o.user);
  const body = {
    profile: () => `<h2>Hồ sơ cá nhân</h2><form id="pfForm" class="panel"><div class="grid grid--2" style="gap:14px"><div class="field"><label for="pfName">Họ và tên</label><input class="input" id="pfName" value="${esc(mem.user.name)}"></div><div class="field"><label for="pfDob">Ngày sinh</label><input class="input" id="pfDob" type="date" value="${mem.user.dob || ''}"></div><div class="field"><label for="pfPhone">Số điện thoại</label><input class="input" id="pfPhone" value="${esc(mem.user.phone || '')}"></div><div class="field"><label for="pfMail">Email</label><input class="input" id="pfMail" value="${esc(mem.user.email || '')}"></div></div>
      <label class="check"><input type="checkbox" id="pfConsent" ${mem.user.emailConsent ? 'checked' : ''}> Đồng ý nhận email ưu đãi và nội dung chăm sóc mắt (có thể huỷ bất kỳ lúc nào)</label><button class="btn" type="submit" style="margin-top:12px">Lưu thay đổi</button></form>
      <h3 style="margin-top:26px">Sổ địa chỉ giao hàng</h3><div class="panel"><div id="addrList">${(mem.user.addresses || []).map((a, i) => `<div class="appt"><span>${esc(a.text)} ${a.def ? '<span class="pill pill--ok">Mặc định</span>' : ''}</span><span><button class="link-btn" data-adef="${i}">Đặt mặc định</button> · <button class="link-btn" data-aed="${i}">Sửa</button> · <button class="link-btn" data-adel="${i}">Xoá</button></span></div>`).join('') || '<p class="meta">Chưa có địa chỉ nào.</p>'}</div>
      <form id="addrForm" style="display:flex;gap:8px;margin-top:12px"><label class="sr-only" for="newAddr">Địa chỉ mới</label><input class="input" id="newAddr" placeholder="Thêm địa chỉ mới"><button class="btn btn--sm" type="submit">Thêm</button></form></div>
      <p style="margin-top:22px"><button class="btn btn--ghost btn--sm" id="logoutBtn">Đăng xuất</button> <button class="link-btn" id="delAcc" style="color:var(--danger)">Yêu cầu xoá tài khoản</button></p>`,
    orders: () => `<h2>Đơn hàng của tôi</h2>${myOrders().length ? myOrders().map(o => `<div class="panel" style="margin-bottom:14px"><div class="row"><strong>${o.id}</strong><span>${new Date(o.date).toLocaleDateString('vi-VN')}</span></div>
      <div class="progress" aria-label="Tiến trình theo dõi">${ORDER_STEPS.map((s, i) => { const current = o.status === 4 ? -1 : o.status; return `<i class="${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}" title="${esc(s)}"></i>`; }).join('')}</div><div class="meta"><strong>${o.status === 4 ? 'Đã huỷ' : ORDER_STEPS[o.status]}</strong> · Giao tận nơi · ${o.pay}</div>
      <ol class="order-track" aria-label="Chi tiết theo dõi đơn ${esc(o.id)}">${ORDER_STEPS.map((s, i) => { const current = o.status === 4 ? -1 : o.status; return `<li class="${i <= current ? 'done' : ''}"><span>${i + 1}</span><div><strong>${esc(s)}</strong><small>${o.status === 4 ? 'Đơn đã huỷ' : i === 0 ? 'Đơn đã được tạo' : i <= current ? 'Đã cập nhật trong hệ thống' : 'Chưa thực hiện'}</small></div></li>`; }).join('')}</ol>
      <ul style="margin:10px 0">${o.items.map(i => `<li>${esc(byId(i.id).name)} (${esc(i.color)}) × ${i.qty}</li>`).join('')}</ul><div class="row row--total"><span>Tổng</span><span>${fmt(o.totals.total)}</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${o.status < 1 ? `<button class="btn btn--ghost btn--sm" data-ocancel="${o.id}">Huỷ đơn</button>` : ''}${o.status < 3 ? `<button class="btn btn--ghost btn--sm" data-oadv="${o.id}">Mô phỏng: cập nhật trạng thái</button>` : ''}${o.status === 3 && !o.returned ? `<button class="btn btn--ghost btn--sm" data-oret="${o.id}">Yêu cầu đổi trả (trong 7 ngày)</button>` : ''}${o.returned ? '<span class="pill pill--low">Đã gửi yêu cầu đổi trả</span>' : ''}</div></div>`).join('') : '<div class="empty">Bạn chưa có đơn hàng nào. <a href="san-pham.html">Mua sắm ngay</a></div>'}`,
    appts: () => `<h2>Lịch hẹn của tôi</h2><div class="panel">${mem.appts.length ? mem.appts.map(a => { const b = BRANCHES.find(x => x.id === a.branch); return `<div class="appt"><div><strong>${a.date.split('-').reverse().join('/')} lúc ${a.time}</strong> · ${esc(b.name)}<br><span class="meta">${esc(a.purpose)} · ${a.status}</span></div></div>`; }).join('') : '<p class="meta">Chưa có lịch hẹn.</p>'}<p style="margin-top:12px"><a class="btn btn--sm" href="dat-lich.html">Đặt lịch mới / đổi lịch</a></p></div>`,
    points: () => `<h2>Điểm thưởng</h2><div class="panel"><p style="font-size:2rem;font-weight:800;color:var(--primary-dark);margin:0">${pointBalance()} điểm</p><p class="meta">Quy tắc demo: 1 điểm cho mỗi 10.000₫ thực thanh toán; 1 điểm = 500₫ khi dùng. Điểm cộng khi đơn hoàn tất.</p>
      <table class="tbl"><thead><tr><th>Ngày</th><th>Nội dung</th><th>Điểm</th></tr></thead><tbody>${mem.points.length ? mem.points.map(p => `<tr><td>${new Date(p.d).toLocaleDateString('vi-VN')}</td><td>${esc(p.note)}</td><td>${p.pts > 0 ? '+' : ''}${p.pts}</td></tr>`).join('') : '<tr><td colspan="3">Chưa có giao dịch điểm.</td></tr>'}</tbody></table></div>`
  };
  const draw = () => {
    wrap.innerHTML = `<div class="acc"><nav role="tablist" aria-label="Tài khoản">${tabs.map(t => `<button role="tab" data-tab="${t[0]}" aria-selected="${t[0] === tab}">${t[1]}</button>`).join('')}</nav><div id="accBody">${body[tab]()}</div></div>`;
    $$('[data-tab]', wrap).forEach(b => b.onclick = () => { tab = b.dataset.tab; history.replaceState(null, '', '#' + tab); draw(); });
    bind();
  };
  function bind() {
    const f = $('#pfForm'); if (f) f.onsubmit = e => { e.preventDefault(); Object.assign(mem.user, { name: $('#pfName').value.trim() || mem.user.name, dob: $('#pfDob').value, phone: $('#pfPhone').value.trim(), email: $('#pfMail').value.trim(), emailConsent: $('#pfConsent').checked }); saveUser(); toast('Đã lưu hồ sơ'); };
    const af = $('#addrForm'); if (af) af.onsubmit = e => { e.preventDefault(); const v = $('#newAddr').value.trim(); if (v.length < 8) { toast('Địa chỉ chưa đầy đủ', true); return; } mem.user.addresses = mem.user.addresses || []; mem.user.addresses.push({ text: v, def: !mem.user.addresses.length }); saveUser(); draw(); };
    $$('[data-adel]').forEach(b => b.onclick = () => { mem.user.addresses.splice(+b.dataset.adel, 1); if (mem.user.addresses.length && !mem.user.addresses.some(a => a.def)) mem.user.addresses[0].def = true; saveUser(); draw(); });
    $$('[data-adef]').forEach(b => b.onclick = () => { mem.user.addresses.forEach((a, i) => a.def = i === +b.dataset.adef); saveUser(); draw(); });
    $$('[data-aed]').forEach(b => b.onclick = () => { const i = +b.dataset.aed, v = prompt('Sửa địa chỉ', mem.user.addresses[i].text); if (v && v.trim().length >= 8) { mem.user.addresses[i].text = v.trim(); saveUser(); draw(); } });
    const lo = $('#logoutBtn'); if (lo) lo.onclick = logout;
    const da = $('#delAcc'); if (da) da.onclick = () => showModal('<h3>Xoá tài khoản?</h3><p>Dữ liệu cá nhân của bạn sẽ bị ẩn; các đơn hàng đã phát sinh được giữ lại theo quy định. Thao tác này không thể hoàn tác.</p><div style="display:flex;gap:10px"><button class="btn" id="confirmDel">Xác nhận xoá</button><button class="btn btn--ghost" data-modal-close>Huỷ</button></div>').querySelector('#confirmDel').addEventListener('click', () => { try { localStorage.removeItem('ve_user_' + mem.user.id); } catch (e) { /* bỏ qua */ } closeModal('modal'); logout(); });
    $$('[data-ocancel]').forEach(b => b.onclick = () => { mem.orders.find(o => o.id === b.dataset.ocancel).status = 4; save('orders'); toast('Đã huỷ đơn'); draw(); });
    $$('[data-oadv]').forEach(b => b.onclick = () => { const o = mem.orders.find(x => x.id === b.dataset.oadv); o.status++; if (o.status === 3 && o.user) { const pts = Math.floor((o.totals.sub - o.totals.discount - o.totals.ptsValue) / 10000); if (pts > 0) { mem.points.unshift({ d: new Date().toISOString(), pts, note: 'Tích điểm đơn ' + o.id }); save('points'); toast('+' + pts + ' điểm thưởng'); } } save('orders'); draw(); });
    $$('[data-oret]').forEach(b => b.onclick = () => { mem.orders.find(o => o.id === b.dataset.oret).returned = true; save('orders'); toast('Đã gửi yêu cầu đổi trả, CSKH sẽ phản hồi trong 24 giờ'); draw(); });
  }
  draw();
}
