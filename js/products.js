/* products.js – thẻ sản phẩm, danh sách, chi tiết, tìm kiếm */
'use strict';
/* ---------- Thẻ sản phẩm ---------- */
function productCard(p) {
  const out = totalStock(p) === 0, r = ratingOf(p.id), n = reviewsOf(p.id).length;
  return `<article class="card product-card"><a class="product-card__img" href="chi-tiet-san-pham.html?id=${p.id}" aria-label="${esc(p.name)}">
    <img src="${IMG + p.colors[0].img}" alt="${esc(p.name)}" loading="lazy">${p.oldPrice ? '<span class="tag tag--sale">Giảm giá</span>' : (p.type === 'kinh' ? '<span class="tag">Kính 0 độ</span>' : '')}</a>
    <div class="product-card__body"><span class="meta">${GROUPS[p.group]}</span><h3><a href="chi-tiet-san-pham.html?id=${p.id}">${esc(p.name)}</a></h3>
    <div>${stars(r)} <span class="meta">(${n})</span></div>
    <div class="price">${fmt(p.price)}${p.oldPrice ? `<del>${fmt(p.oldPrice)}</del>` : ''}</div>
    <div class="product-card__foot"><a class="btn btn--ghost" href="chi-tiet-san-pham.html?id=${p.id}">Xem chi tiết</a>
    <button class="btn" data-add="${p.id}" ${out ? 'disabled' : ''}>${out ? 'Hết hàng' : 'Thêm vào giỏ'}</button></div></div></article>`;
}

/* ---------- Tìm kiếm (header) ---------- */
function initSearch() {
  const form = $('#searchForm'), input = $('#searchInput'), box = $('#suggest');
  input.addEventListener('input', () => {
    const q = norm(input.value.trim()); if (!q) { box.classList.remove('open'); return; }
    const hits = visibleProducts().filter(p => norm(p.name + ' ' + p.material + ' ' + p.style + ' ' + p.needs.map(n => NEEDS[n]).join(' ')).includes(q)).slice(0, 5);
    box.innerHTML = hits.length ? hits.map(p => `<a href="chi-tiet-san-pham.html?id=${p.id}"><img src="${IMG + p.colors[0].img}" alt=""><span>${esc(p.name)}<br><small class="meta">${fmt(p.price)}</small></span></a>`).join('') : '<a href="#" onclick="return false">Không có gợi ý phù hợp</a>';
    box.classList.add('open');
  });
  document.addEventListener('click', e => { if (!form.contains(e.target)) box.classList.remove('open'); });
  form.onsubmit = e => { e.preventDefault(); location.href = 'san-pham.html?q=' + encodeURIComponent(input.value.trim()); };
}

/* ---------- Trang chủ ---------- */
function initHome() {
  const featured = visibleProducts().slice().sort((a, b) => b.sold - a.sold).slice(0, 4);
  $('#featured').innerHTML = featured.map(productCard).join('');
  $('#homeArticles').innerHTML = ARTICLES.slice(0, 3).map(a => `<article class="card post-card"><div class="post-card__cover"><img src="${IMG + a.image}" alt="" loading="lazy"></div><div class="post-card__body"><span class="meta">${a.topic} · ${a.time} đọc</span><h3>${esc(a.title)}</h3><p>${esc(a.sum)}</p><a href="mat-khoe.html?a=${a.id}">Đọc bài viết →</a></div></article>`).join('');
  const slides = $$('.slide'), dots = $('.slider__dots'); let cur = 0, timer;
  slides.forEach((s, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (i + 1)); b.onclick = () => go(i, true); dots.appendChild(b); });
  function go(i, manual) { cur = (i + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('active', k === cur)); $$('button', dots).forEach((b, k) => b.classList.toggle('active', k === cur)); if (manual) { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5000); } }
  go(0); timer = setInterval(() => go(cur + 1), 5000);
}

/* ---------- Danh sách sản phẩm: tìm kiếm / lọc / sắp xếp / hiển thị ---------- */
function searchProducts(query, list) {
  list = list || visibleProducts(); const q = norm(query || '').trim(); if (!q) return list;
  return list.filter(p => norm(p.name + ' ' + p.desc + ' ' + p.material + ' ' + p.style + ' ' + p.needs.map(n => NEEDS[n]).join(' ') + ' ' + GROUPS[p.group]).includes(q));
}
/** Lọc theo nhóm, nhu cầu, kiểu dáng, màu, khoảng giá, đánh giá tối thiểu, cửa hàng còn hàng. */
function filterProducts(list, f) {
  return list.filter(p => {
    if (f.group.length && !f.group.includes(p.group)) return false;
    if (f.need.length && !f.need.some(n => p.needs.includes(n))) return false;
    if (f.style.length && !f.style.includes(p.style)) return false;
    if (f.color.length && !p.colors.some(c => f.color.includes(c.name))) return false;
    if (f.price === 'lt100' && p.price >= 100000) return false;
    if (f.price === '100-500' && (p.price < 100000 || p.price > 500000)) return false;
    if (f.price === 'gt500' && p.price <= 500000) return false;
    if (f.rating && ratingOf(p.id) < f.rating) return false;
    if (f.store && !(p.stock[f.store] > 0)) return false;
    return true;
  });
}
function sortProducts(list, key) {
  const fn = { new: (a, b) => b.added.localeCompare(a.added), asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, pop: (a, b) => b.sold - a.sold }[key] || ((a, b) => b.sold - a.sold);
  return list.slice().sort(fn);
}
/** Hiển thị danh sách; state = 'loading' | 'error' | undefined. */
function renderProducts(list, state, target) {
  const grid = target || $('#productGrid'); if (!grid) return;
  if (state === 'loading') { grid.innerHTML = Array(6).fill('<div class="card skeleton-card" aria-hidden="true"><div class="skeleton sk-img"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line sk-short"></div></div>').join(''); grid.setAttribute('aria-busy', 'true'); return; }
  grid.removeAttribute('aria-busy');
  if (state === 'error') { grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><p>Có lỗi xảy ra. Vui lòng thử lại.</p><button class="btn btn--sm" id="retryBtn">Thử lại</button></div>'; return; }
  grid.innerHTML = list.length ? list.map(productCard).join('') : '<div class="empty" style="grid-column:1/-1"><p>Không tìm thấy sản phẩm phù hợp.</p><button class="btn btn--sm btn--ghost" id="resetEmpty">Xoá bộ lọc</button></div>';
}
function initProducts() {
  const st = { q: qs().get('q') || '', group: [], need: [], style: [], color: [], price: 'all', rating: 0, store: '', sort: 'pop' };
  if (qs().get('group')) st.group = [qs().get('group')];
  if (qs().get('need')) st.need = [qs().get('need')];
  const styles = [...new Set(PRODUCTS.map(p => p.style))], colors = [...new Set(PRODUCTS.flatMap(p => p.colors.map(c => c.name)).filter(c => c !== 'Mặc định'))];
  const cbs = (name, items, labelFn) => items.map(v => `<label class="check"><input type="checkbox" name="${name}" value="${esc(v)}"> ${esc(labelFn ? labelFn(v) : v)}</label>`).join('');
  $('#filters').innerHTML = `<h3>Nhóm sản phẩm</h3>${cbs('group', Object.keys(GROUPS), k => GROUPS[k])}
    <h3>Nhu cầu sử dụng</h3>${cbs('need', Object.keys(NEEDS), k => NEEDS[k])}
    <h3>Khoảng giá</h3>${[['all', 'Tất cả'], ['lt100', 'Dưới 100.000₫'], ['100-500', '100.000₫ – 500.000₫'], ['gt500', 'Trên 500.000₫']].map(([v, l]) => `<label class="check"><input type="radio" name="price" value="${v}" ${v === 'all' ? 'checked' : ''}> ${l}</label>`).join('')}
    <h3>Đánh giá</h3>${[[0, 'Tất cả'], [4.5, 'Từ 4,5 sao'], [5, 'Chỉ 5 sao']].map(([v, l]) => `<label class="check"><input type="radio" name="rating" value="${v}" ${v === 0 ? 'checked' : ''}> ${l}</label>`).join('')}
    <h3>Kiểu dáng</h3>${cbs('style', styles.filter(s => !['Phụ kiện', 'Dung dịch nhỏ mắt', 'Chườm ấm/lạnh', 'Miếng dán gel'].includes(s)))}
    <h3>Màu gọng</h3>${cbs('color', colors.filter(c => !/Lọ|Hộp|Xanh navy/.test(c) || c === 'Xanh navy'))}
    <h3>Còn hàng tại cửa hàng</h3><select class="select" id="fStore" aria-label="Cửa hàng còn hàng"><option value="">Tất cả cửa hàng</option>${BRANCHES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}</select>
    <p style="margin:14px 0 0"><button class="btn btn--ghost btn--sm btn--block" id="resetF">Xoá bộ lọc</button></p>`;
  const apply = () => {
    try {
      const list = sortProducts(filterProducts(searchProducts(st.q), st), st.sort);
      $('#count').textContent = list.length + ' sản phẩm' + (st.q ? ' cho “' + st.q + '”' : '');
      renderProducts(list);
    } catch (err) { renderProducts([], 'error'); }
  };
  const reset = () => { st.group = []; st.need = []; st.style = []; st.color = []; st.price = 'all'; st.rating = 0; st.store = ''; st.q = ''; $('#pageSearch').value = ''; $$('#filters input[type=checkbox]').forEach(i => i.checked = false); $('#filters input[name=price][value=all]').checked = true; $('#filters input[name=rating][value="0"]').checked = true; $('#fStore').value = ''; apply(); };
  $('#filters').addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'price') st.price = t.value;
    else if (t.name === 'rating') st.rating = +t.value;
    else if (t.id === 'fStore') st.store = t.value;
    else if (t.type === 'checkbox') st[t.name] = $$('input[name=' + t.name + ']:checked', $('#filters')).map(i => i.value);
    apply();
  });
  $('#productGrid').addEventListener('click', e => { if (e.target.id === 'resetEmpty') reset(); if (e.target.id === 'retryBtn') apply(); });
  $('#resetF').onclick = reset;
  $('#sort').onchange = e => { st.sort = e.target.value; apply(); };
  $('#pageSearch').value = st.q;
  $('#pageSearch').addEventListener('input', e => { st.q = e.target.value; apply(); });
  st.group.forEach(g => { const i = $('input[name=group][value=' + g + ']'); if (i) i.checked = true; });
  st.need.forEach(g => { const i = $('input[name=need][value=' + g + ']'); if (i) i.checked = true; });
  $('#filterToggle').onclick = () => { const o = $('#filters').classList.toggle('open'); $('#filterToggle').setAttribute('aria-expanded', o); };
  renderProducts([], 'loading'); setTimeout(apply, 350); /* mô phỏng thời gian tải dữ liệu */
}

/* ---------- Chi tiết sản phẩm ---------- */
function initDetail() { renderProductDetail(byId(qs().get('id'))); }
function renderProductDetail(p) {
  if (!p || p.hidden) { $('#pdWrap').innerHTML = '<div class="empty"><p>Có lỗi xảy ra. Vui lòng thử lại.</p><a class="btn btn--sm" href="san-pham.html">Xem tất cả sản phẩm</a></div>'; return; }
 document.title = p.name + ' – VisionEase';
  let color = p.colors[0], qty = 1;
  const r = ratingOf(p.id), n = reviewsOf(p.id).length;
  $('#pdCrumb').innerHTML = `<a href="index.html">Trang chủ</a> / <a href="san-pham.html">Sản phẩm</a> / ${esc(p.name)}`;
  const stockPill = q => q === 0 ? '<span class="pill pill--out">Hết hàng · 0</span>' : q < 5 ? `<span class="pill pill--low">Sắp hết · còn ${q}</span>` : `<span class="pill pill--ok">Còn hàng · còn ${q}</span>`;
  $('#pdWrap').innerHTML = `<div><div class="pd__main"><img id="pdImg" src="${IMG + color.img}" alt="${esc(p.name)}"></div><div class="pd__thumbs" id="thumbs"></div></div>
  <div><span class="eyebrow">${GROUPS[p.group]}</span><h1 style="font-size:1.8rem">${esc(p.name)}</h1>
    <div>${stars(r)} <span class="meta">${r ? r.toFixed(1) : '–'} · ${n} đánh giá · đã bán ${p.sold}</span></div>
    <div class="pd__price">${fmt(p.price)}${p.oldPrice ? `<del>${fmt(p.oldPrice)}</del>` : ''}</div>
    <p>${esc(p.desc)}</p>
    <div class="field"><label>Biến thể: <span id="colorName">${esc(color.name)}</span></label><div class="swatches" id="swatches"></div></div>
    <div class="product-stock-summary ${totalStock(p) ? 'in-stock' : 'out-of-stock'}"><strong>${totalStock(p) ? 'Còn hàng' : 'Hết hàng'}</strong><span>Tổng tồn kho: ${totalStock(p)} sản phẩm</span></div>
    <div class="field"><label>Số lượng</label><div class="qty"><button id="qMinus" aria-label="Giảm">−</button><input id="qInput" value="1" aria-label="Số lượng" inputmode="numeric"><button id="qPlus" aria-label="Tăng">+</button></div></div>
    <div class="pd__actions"><button class="btn" id="addBtn" ${totalStock(p) ? '' : 'disabled'}>Thêm vào giỏ hàng</button><button class="btn btn--ghost" id="buyBtn" ${totalStock(p) ? '' : 'disabled'}>Mua ngay</button><a class="btn btn--ghost" href="dat-lich.html">Đặt lịch thử tại cửa hàng</a></div>
    <dl class="facts"><div><dt>Chất liệu</dt><dd>${esc(p.material)}</dd></div><div><dt>Kiểu dáng</dt><dd>${esc(p.style)}</dd></div><div><dt>Nhu cầu phù hợp</dt><dd>${p.needs.map(x => NEEDS[x]).join(', ')}</dd></div><div><dt>Nguồn gốc</dt><dd>${esc(p.origin)}</dd></div>${p.declared ? '<div><dt>Giấy công bố</dt><dd>Có – <a href="#" id="declLink">xem giấy công bố (bản demo)</a></dd></div>' : ''}</dl></div>`;
  const drawVariants = () => {
    $('#swatches').innerHTML = p.colors.map(c => `<button class="swatch" data-c="${esc(c.name)}" aria-pressed="${c === color}"><i style="background:${c.hex}"></i>${esc(c.name)}</button>`).join('');
    $('#thumbs').innerHTML = p.colors.map(c => `<button data-c="${esc(c.name)}" class="${c === color ? 'active' : ''}" aria-label="${esc(c.name)}"><img src="${IMG + c.img}" alt=""></button>`).join('');
    const im = $('#pdImg'); im.classList.add('fade'); setTimeout(() => { im.src = IMG + color.img; im.classList.remove('fade'); }, 140); $('#colorName').textContent = color.name;
  };
  drawVariants();
  $('#pdWrap').addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (b) { color = p.colors.find(c => c.name === b.dataset.c); drawVariants(); }
    if (e.target.id === 'declLink') { e.preventDefault(); showModal('<h3>Giấy công bố sản phẩm</h3><p>Đây là prototype: giấy công bố thật của nhà sản xuất sẽ được tải lên và hiển thị tại đây khi website vận hành.</p>'); }
  });
  const qi = $('#qInput'); const setQ = v => { qty = Math.max(1, Math.min(Math.max(totalStock(p), 1), v || 1)); qi.value = qty; };
  $('#qMinus').onclick = () => setQ(qty - 1); $('#qPlus').onclick = () => setQ(qty + 1); qi.onchange = () => setQ(parseInt(qi.value, 10));
  $('#addBtn').onclick = () => addToCart(p.id, color.name, qty);
  $('#buyBtn').onclick = () => { addToCart(p.id, color.name, qty); location.href = 'gio-hang.html'; };

  const panels = {
    desc: `<ul>${p.uses.map(u => `<li style="padding:4px 0">• ${esc(u)}</li>`).join('')}</ul>`,
    guide: `<h3>Hướng dẫn sử dụng</h3><p>${esc(p.guide)}</p><h3>Giới hạn sử dụng</h3><p>${esc(p.limits)}</p><p class="disclaimer">Thông tin chỉ mang tính tham khảo, không thay thế tư vấn của bác sĩ. Có thắc mắc? <a href="hoi-dap.html">Hỏi chuyên gia</a>.</p>`,
    stock: `<p>Tồn kho theo cửa hàng để tham khảo.</p><ul class="stock-list">${BRANCHES.map(b => `<li><span>${b.name} – ${b.area}</span>${stockPill(p.stock[b.id])}</li>`).join('')}</ul>`
  };
  const reviewsPanel = () => {
    const all = reviewsOf(p.id), filt = $('#starFilter') ? $('#starFilter').value : 'all', rs = all.filter(x => filt === 'all' || x.s === +filt);
    return `<div class="rating-sum"><div><strong>${r ? r.toFixed(1) : '–'}</strong><br>${stars(r)}<br><span class="meta">${all.length} đánh giá</span></div>
      <div><label class="sr-only" for="starFilter">Lọc theo số sao</label><select class="select" id="starFilter"><option value="all">Tất cả số sao</option>${[5, 4, 3, 2, 1].map(s => `<option value="${s}" ${filt == s ? 'selected' : ''}>${s} sao</option>`).join('')}</select></div>
      <button class="btn btn--sm" id="writeReview">Viết đánh giá</button></div>
      ${rs.length ? rs.map(x => `<div class="review"><div class="review__head"><span class="avatar">${esc(x.n[0])}</span><strong>${esc(x.n)}</strong>${stars(x.s)}<span class="verified">✔ Đã mua hàng</span><span class="meta">${x.d}</span></div><p style="margin:8px 0 0">${esc(x.t)}</p></div>`).join('') : '<div class="empty">Chưa có đánh giá phù hợp.</div>'}`;
  };
  const showTab = k => {
    $$('#pdTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === k));
    $('#pdPanel').innerHTML = k === 'reviews' ? reviewsPanel() : panels[k];
    if (k === 'reviews') {
      $('#starFilter').onchange = () => showTab('reviews');
      $('#writeReview').onclick = writeReview;
    }
  };
  $$('#pdTabs button').forEach(b => b.onclick = () => showTab(b.dataset.t));
  showTab(location.hash === '#reviews' ? 'reviews' : 'desc');

  function writeReview() {
    if (!mem.user) { toast('Vui lòng đăng nhập để đánh giá', true); openAuth(); return; }
    const bought = mem.orders.some(o => o.user === mem.user.id && o.items.some(i => i.id === p.id));
    if (!bought) { showModal('<h3>Chỉ khách đã mua mới đánh giá được</h3><p>Để bảo đảm đánh giá đáng tin cậy, VisionEase chỉ nhận đánh giá từ khách đã mua sản phẩm này.</p><p class="meta">Gợi ý khi demo: đăng nhập, đặt một đơn có sản phẩm này rồi quay lại viết đánh giá.</p>'); return; }
    let star = 5;
    const box = showModal(`<h3>Đánh giá “${esc(p.name)}”</h3><form id="rvForm"><div class="field"><label>Số sao</label><div class="star-input" id="starIn">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" class="on" aria-label="${i} sao">★</button>`).join('')}</div></div>
      <div class="field"><label for="rvText">Nhận xét</label><textarea class="textarea" id="rvText" required></textarea><span class="err"></span></div><button class="btn btn--block" type="submit">Gửi đánh giá</button></form>`);
    $('#starIn', box).onclick = e => { const b = e.target.closest('button'); if (!b) return; star = +b.dataset.s; $$('#starIn button', box).forEach((x, i) => x.classList.toggle('on', i < star)); };
    $('#rvForm', box).onsubmit = e => {
      e.preventDefault(); const t = $('#rvText', box).value.trim();
      if (t.length < 10) { $('.err', box).textContent = 'Nhận xét cần ít nhất 10 ký tự'; return; }
      (mem.reviews[p.id] = mem.reviews[p.id] || []).unshift({ n: mem.user.name, s: star, t, d: new Date().toLocaleDateString('vi-VN') }); save('reviews');
      closeModal('modal'); toast('Cảm ơn bạn đã đánh giá'); showTab('reviews');
    };
  }
  const rel = [...new Set(p.related)].map(byId).filter(Boolean);
  const same = visibleProducts().filter(x => x.id !== p.id && !rel.includes(x) && x.needs.some(n => p.needs.includes(n)) && x.group === p.group).slice(0, 4 - rel.length);
  $('#related').innerHTML = rel.map(x => productCard(x).replace('<article class="card product-card">', '<article class="card product-card"><div class="meta" style="padding:8px 16px 0">Mua kèm gợi ý</div>')).concat(same.map(productCard)).join('');
}
