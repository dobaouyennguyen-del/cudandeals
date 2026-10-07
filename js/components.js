/* ==========================================================
   CuDanDeals.vn – Thành phần giao diện dùng chung
   Cần load SAU layout.js và mock-data.js
   ========================================================== */
window.CDD = (function () {
  const ROOT = window.CDD_ROOT || '';
  const IMG = ROOT + 'assets/img/';
  const D = window.CDD_DATA || {};
  const saved = new Set(['v1', 'v4']);         // demo: voucher đã lưu (FR-3.3)

  const stars = (n) => Array.from({ length: 5 }, (_, i) =>
    `<i class="bi ${i < Math.round(n) ? 'bi-star-fill' : 'bi-star'}"></i>`).join('');

  const scopeTag = (v) => v.scope === 'area'
    ? `<span class="tag tag-primary"><i class="bi bi-buildings"></i>Riêng khu Sunrise</span>`
    : `<span class="tag tag-muted"><i class="bi bi-globe2"></i>Công khai</span>`;

  const findVoucher = (id) => (D.vouchers || []).find(v => v.id === id);

  /* ---------- Thẻ voucher (R-01, P-01) ---------- */
  function voucherCard(v, opt = {}) {
    const isSaved = saved.has(v.id);
    const link = opt.guest ? ROOT + 'login.html?next=deal' : `${ROOT}pages/resident/voucher-detail.html?id=${v.id}`;
    return `
    <article class="vcard">
      <a href="${link}" class="vcard-img">
        <img src="${IMG}${v.img}" alt="${v.shop}" loading="lazy">
        <span class="vcard-disc">${v.badge}</span>
        ${v.hot ? '<span class="vcard-hot">Nổi bật</span>' : ''}
        <span class="vcard-scope">${scopeTag(v)}</span>
      </a>
      <div class="vcard-body">
        <div class="vcard-shop text-truncate mb-1">${v.shop}</div>
        <a href="${link}" class="vcard-title">${v.title}</a>
        <div class="vcard-meta"><span class="rating">${stars(v.rating)}</span> ${v.rating} <span class="text-muted-2">(${v.reviews})</span></div>
        <div class="vcard-meta text-muted-2"><i class="bi bi-geo-alt"></i>${v.address}</div>
        <div class="vcard-meta"><span class="${v.daysLeft <= 3 ? 'text-accent fw-semibold' : 'text-muted-2'}"><i class="bi bi-clock"></i>Còn ${v.daysLeft} ngày</span>
          <span class="ms-auto text-muted-2">Còn ${v.left} mã</span></div>
        ${opt.guest ? '' : `        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-sm btn-save ${isSaved ? 'saved' : ''}" data-save="${v.id}" title="Lưu để xem sau">
            <i class="bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i><span>${isSaved ? 'Đã lưu' : 'Lưu'}</span></button>
          <button class="btn btn-sm btn-accent flex-fill" data-code="${v.id}"><i class="bi bi-ticket-perforated"></i>Nhận mã</button>
        </div>`}
      </div>
    </article>`;
  }

  /* ---------- Popup mã ưu đãi (R-02b) – FR-3.4, FR-3.7 ---------- */
  function ensureCodeModal() {
    if (document.getElementById('codeModal')) return;
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal fade" id="codeModal" tabindex="-1" aria-labelledby="codeModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content code-modal">
          <button type="button" class="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Đóng"></button>
          <div class="text-center">
            <div class="code-icon"><i class="bi bi-ticket-perforated-fill"></i></div>
            <h2 id="codeModalTitle" class="h4 fw-bold mb-1">Mã ưu đãi của bạn</h2>
            <p class="text-muted-2 small-2 mb-3">Mã đã được lưu vào <b>Ví voucher</b></p>
          </div>
          <div class="code-box">
            <div class="vcard-shop" id="cmShop"></div>
            <div class="fw-bold mb-3" id="cmTitle"></div>
            <div id="cmQr" class="qr"></div>
            <div class="code-text"><span id="cmCode">CDD-HG2026-001</span>
              <button class="btn btn-sm btn-light-primary" id="cmCopy"><i class="bi bi-copy"></i>Sao chép</button></div>
            <div class="small-2 text-muted-2 mt-2"><i class="bi bi-clock me-1"></i>Hết hạn: <span id="cmEnd"></span></div>
          </div>
          <div class="note note-info mt-3"><i class="bi bi-info-circle"></i><span>Đưa mã hoặc mã QR cho nhân viên tại quầy để được áp dụng. Mỗi mã chỉ dùng được <b>1 lần</b>.</span></div>
          <div class="d-flex gap-2 mt-3">
            <a href="${ROOT}pages/resident/wallet.html" class="btn btn-outline-primary flex-fill">Xem trong ví</a>
            <button class="btn btn-primary flex-fill" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>`);
    document.getElementById('cmCopy').addEventListener('click', (e) => {
      navigator.clipboard && navigator.clipboard.writeText(document.getElementById('cmCode').textContent);
      e.currentTarget.innerHTML = '<i class="bi bi-check2"></i>Đã chép';
    });
  }

  function showCode(id, code) {
    const v = findVoucher(id) || {};
    ensureCodeModal();
    code = code || 'CDD-' + (v.id || 'X').toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('cmShop').textContent = v.shop || '';
    document.getElementById('cmTitle').textContent = v.title || '';
    document.getElementById('cmCode').textContent = code;
    document.getElementById('cmEnd').textContent = v.end || '';
    document.getElementById('cmCopy').innerHTML = '<i class="bi bi-copy"></i>Sao chép';
    const qr = document.getElementById('cmQr'); qr.innerHTML = '';
    if (window.QRCode) new QRCode(qr, { text: code, width: 148, height: 148 });   // qrcode.js (FR-3.7)
    else qr.innerHTML = '<i class="bi bi-qr-code" style="font-size:120px;line-height:1"></i>';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('codeModal')).show();
    saved.add(id);
  }

  /* ---------- Khung chờ tải (skeleton) – Phase 3: hiện trong lúc đọc Firestore ---------- */
  function skeleton(el, n = 6, colClass = 'col-md-6 col-xl-4') {
    el.innerHTML = Array.from({ length: n }, () => `<div class="${colClass}"><div class="skel-card" aria-hidden="true">
      <div class="skel ph"></div><div class="skel skel-line" style="width:40%"></div><div class="skel skel-line" style="width:85%"></div>
      <div class="skel skel-line" style="width:60%"></div><div class="skel skel-line mb-3" style="width:calc(100% - 32px);height:34px"></div></div></div>`).join('');
  }
  function skeletonRows(tbody, n = 5, cols = 8) {
    tbody.innerHTML = Array.from({ length: n }, () => `<tr>${Array.from({ length: cols }, (_, i) => `<td><div class="skel" style="height:14px;width:${i ? 60 : 85}%"></div></td>`).join('')}</tr>`).join('');
  }

  /* ---------- Thông báo nhỏ (toast) ---------- */
  function toast(msg) {
    let t = document.getElementById('cddToast');
    if (!t) {
      document.body.insertAdjacentHTML('beforeend', `<div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="cddToast" class="toast align-items-center text-bg-dark border-0" role="status"><div class="d-flex">
        <div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div></div>`);
      t = document.getElementById('cddToast');
    }
    t.querySelector('.toast-body').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(t, { delay: 2200 }).show();
  }


  /* ---------- Hộp xác nhận (có thể bắt buộc nhập lý do) – dùng cho Admin ---------- */
  function confirmBox({ title, message, okText = 'Xác nhận', okClass = 'btn-primary', reasonLabel = '', requireReason = false, icon = 'bi-question-circle', tone = 'primary' }) {
    return new Promise((resolve) => {
      let m = document.getElementById('cddConfirm');
      if (!m) {
        document.body.insertAdjacentHTML('beforeend', `
        <div class="modal fade" id="cddConfirm" tabindex="-1" aria-labelledby="cfTitle" aria-hidden="true"><div class="modal-dialog modal-dialog-centered">
          <div class="modal-content code-modal">
            <div class="d-flex gap-3 align-items-start mb-3"><span class="kpi"><span class="ic" id="cfIcon"></span></span>
              <div><h2 class="h5 fw-bold mb-1" id="cfTitle"></h2><p class="text-muted-2 small-2 mb-0" id="cfMsg"></p></div></div>
            <div id="cfReasonWrap"><label class="form-label" for="cfReason" id="cfReasonLabel"></label>
              <textarea class="form-control mb-1" id="cfReason" rows="3" placeholder="Nhập lý do (sẽ gửi thông báo cho người liên quan)"></textarea>
              <div class="invalid-feedback">Vui lòng nhập lý do.</div></div>
            <div class="d-flex justify-content-end gap-2 mt-3"><button class="btn btn-light px-4" data-bs-dismiss="modal">Hủy</button><button class="btn px-4" id="cfOk"></button></div>
          </div></div></div>`);
        m = document.getElementById('cddConfirm');
      }
      const tones = { primary: 'ic-blue', danger: '', success: 'ic-green', warning: 'ic-amber' };
      const ic = document.getElementById('cfIcon');
      ic.className = 'ic ' + (tones[tone] || '');
      ic.style.cssText = tone === 'danger' ? 'background:var(--danger-soft);color:var(--danger)' : '';
      ic.innerHTML = `<i class="bi ${icon}"></i>`;
      document.getElementById('cfTitle').textContent = title;
      document.getElementById('cfMsg').innerHTML = message || '';
      document.getElementById('cfReasonWrap').classList.toggle('d-none', !reasonLabel);
      document.getElementById('cfReasonLabel').innerHTML = reasonLabel + (requireReason ? ' <span class="req">*</span>' : '');
      const ta = document.getElementById('cfReason'); ta.value = ''; ta.classList.remove('is-invalid');
      const ok = document.getElementById('cfOk'); ok.className = 'btn px-4 ' + okClass; ok.textContent = okText;
      const modal = bootstrap.Modal.getOrCreateInstance(m);
      let done = false;
      ok.onclick = () => {
        if (requireReason && !ta.value.trim()) { ta.classList.add('is-invalid'); return; }
        done = true; modal.hide(); resolve({ ok: true, reason: ta.value.trim() });
      };
      m.addEventListener('hidden.bs.modal', () => { if (!done) resolve({ ok: false }); }, { once: true });
      modal.show();
    });
  }

  /* ---------- Xử lý nút Lưu / Nhận mã (dùng chung) ---------- */
  document.addEventListener('click', (e) => {
    if (document.body.dataset.role === 'public' && e.target.closest('[data-save],[data-code]')) {
      location.href = ROOT + 'login.html?next=deal'; return;             // phải đăng nhập mới lưu / nhận mã
    }
    const s = e.target.closest('[data-save]');
    if (s) {
      const id = s.dataset.save, on = !saved.has(id);
      on ? saved.add(id) : saved.delete(id);
      s.classList.toggle('saved', on);
      s.querySelector('i').className = 'bi ' + (on ? 'bi-bookmark-fill' : 'bi-bookmark');
      s.querySelector('span').textContent = on ? 'Đã lưu' : 'Lưu';
      toast(on ? 'Đã lưu voucher vào danh sách đã lưu' : 'Đã bỏ lưu voucher');
    }
    const c = e.target.closest('[data-code]');
    if (c) showCode(c.dataset.code);
  });

  const isSaved = (id) => saved.has(id);
  return { stars, scopeTag, voucherCard, showCode, toast, skeleton, skeletonRows, confirm: confirmBox, findVoucher, isSaved, IMG, ROOT, D };
})();
