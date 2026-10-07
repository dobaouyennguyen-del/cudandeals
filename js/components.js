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

  const findVoucher = (id) => (D.vouchers || []).find(v => v.id === id) || (D.offVouchers || []).find(v => v.id === id);
  const isOut = (v) => v.total && v.left <= 0;          // đã phát hết lượt (FR-2.4)

  /* ---------- Thẻ voucher (R-01, P-01) ----------
     - Rê chuột: thẻ phóng to, ngăn kéo tóm tắt (điều kiện, khung giờ, hạn dùng, số người đã nhận) trượt ra dưới thẻ
     - Điện thoại (không có hover): tóm tắt điều kiện hiện thành 1 dòng trong thẻ
     - Thanh "còn bao nhiêu mã" chạy khi thẻ hiện ra; ≤ 3 ngày: chấm đỏ nhấp nháy "sắp hết hạn" */
  function voucherCard(v, opt = {}) {
    const isSaved = saved.has(v.id);
    const link = opt.guest ? ROOT + 'login.html?next=deal' : `${ROOT}pages/resident/voucher-detail.html?id=${v.id}`;
    const out = isOut(v);
    const urgent = !out && v.daysLeft <= 3;
    const ratio = v.total ? (v.left <= 0 ? 0 : Math.max(4, Math.round(v.left / v.total * 100))) : 0;
    const low = v.total && v.left / v.total <= 0.2;
    // Ngăn kéo tóm tắt: trượt ra dưới thẻ khi rê chuột (không che ảnh)
    const more = v.cond ? `
      <div class="vcard-more" aria-hidden="true">
        <div><i class="bi bi-receipt"></i><span>${v.cond}</span></div>
        <div><i class="bi bi-clock-history"></i><span>${v.time}</span></div>
        <div><i class="bi bi-calendar-event"></i><span>Đến ${v.end}</span></div>
        ${v.total ? `<div><i class="bi bi-people"></i><span>${v.total - v.left} người đã nhận</span></div>` : ''}
      </div>` : '';
    const delay = ((parseInt(v.id.replace(/\D/g, '')) || 0) * 0.9 % 5).toFixed(1);   // so le ánh sáng trên nhãn giảm giá
    return `
    <article class="vcard${v.hot && !out ? ' hot' : ''}${out ? ' soldout' : ''}">
      <a href="${link}" class="vcard-img">
        <img src="${IMG}${v.img}" alt="${v.shop}" loading="lazy">
        <span class="vcard-disc" style="--d:${delay}s">${v.badge}</span>
        ${v.hot ? '<span class="vcard-hot">Nổi bật</span>' : ''}
        <span class="vcard-scope">${scopeTag(v)}</span>
        ${out ? '<span class="vcard-out"><i class="bi bi-slash-circle"></i>Đã hết mã</span>' : ''}
      </a>
      <div class="vcard-body">
        <div class="vcard-shop text-truncate mb-1">${v.shop}</div>
        <a href="${link}" class="vcard-title">${v.title}</a>
        <div class="vcard-meta"><span class="rating">${stars(v.rating)}</span> ${v.rating} <span class="text-muted-2">(${v.reviews})</span></div>
        <div class="vcard-meta text-muted-2"><i class="bi bi-geo-alt"></i>${v.address}</div>
        ${v.cond ? `<div class="vcard-meta vcard-cond text-muted-2"><i class="bi bi-receipt"></i>${v.cond} · ${v.time}</div>` : ''}
        <div class="vcard-meta vcard-due">${out ? `<span class="text-muted-2 fw-semibold"><i class="bi bi-slash-circle"></i>Đã phát hết ${v.total} mã</span>` : urgent
          ? `<span class="text-accent fw-semibold d-inline-flex align-items-center"><span class="pulse-dot"></span>Còn ${v.daysLeft} ngày</span>`
          : `<span class="text-muted-2"><i class="bi bi-clock"></i>Còn ${v.daysLeft} ngày</span>`}
          ${out ? '' : `<span class="ms-auto ${low ? 'text-accent fw-semibold' : 'text-muted-2'}">Còn ${v.left}${v.total ? '/' + v.total : ''} mã</span>`}</div>
        ${v.total ? `<div class="vstock${low ? ' low' : ''}" role="progressbar" aria-label="Số mã còn lại" aria-valuenow="${v.left}" aria-valuemin="0" aria-valuemax="${v.total}"><span style="--w:${ratio}%"></span></div>` : ''}
        ${opt.guest ? '' : `        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-sm btn-save ${isSaved ? 'saved' : ''}" data-save="${v.id}" title="Lưu để xem sau">
            <i class="bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i><span>${isSaved ? 'Đã lưu' : 'Lưu'}</span></button>
          ${out ? `<button class="btn btn-sm btn-light flex-fill" disabled aria-disabled="true"><i class="bi bi-slash-circle"></i>Đã hết mã</button>`
                : `<button class="btn btn-sm btn-accent flex-fill" data-code="${v.id}"><i class="bi bi-ticket-perforated"></i>Nhận mã</button>`}
        </div>`}
      </div>${more}
    </article>`;
  }

  /* ---------- Popup mã ưu đãi dạng "tấm vé" (R-02b) – FR-3.4, FR-3.7 ----------
     showCode(id)            → vừa bấm "Nhận mã": "Đã nhận mã!", mã chạy kiểu quay số, đóng dấu ĐÃ NHẬN, gợi ý số tiền tiết kiệm
     showCode(id, code)      → xem lại mã đã có (Ví voucher › Xem mã): hiện mã ngay, không chạy hiệu ứng
     showCode(id, code, { fresh: true }) → ép hiện như vừa nhận (dùng để chụp giao diện) */
  // Cuống vé: mức ưu đãi + màu theo loại (cam giảm %, xanh dương giảm tiền, xanh lá tặng món)
  function stubOf(v) {
    if (v.type === 'amount') return { big: v.badge.replace('GIẢM ', ''), sm: 'GIẢM TIỀN', cls: 'amount' };
    if (v.type === 'gift') return /MUA 1 TẶNG 1/.test(v.badge) ? { big: '1+1', sm: 'TẶNG', cls: 'gift' } : { big: 'QUÀ', sm: 'TẶNG KÈM', cls: 'gift' };
    return { big: (v.badge || '').replace('GIẢM ', ''), sm: 'GIẢM', cls: '' };
  }
  // Ước tính tiền tiết kiệm (Phase 3: số thật lấy từ hóa đơn khi đối tác xác nhận mã – FR-3.9)
  const BILL = { coffee: 65000, food: 120000, spa: 200000, gym: 400000, market: 160000 };
  const GIFT = { coffee: 45000, food: 35000, spa: 60000, gym: 100000, market: 30000 };
  function estSave(v) {
    if (v.type === 'amount') return (parseInt(v.badge.replace(/\D/g, '')) || 0) * 1000;
    if (v.type === 'gift') return GIFT[v.cat] || 30000;
    return Math.round((v.pct || 0) / 100 * (BILL[v.cat] || 100000) / 500) * 500;
  }
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('fx') === 'off';

  function rollCode(el, code, done) {                // mã chạy như máy quay số rồi chốt từng ký tự
    el.innerHTML = [...code].map(ch => `<span>${ch === '-' ? '-' : ''}</span>`).join('');
    const spans = [...el.children], POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    if (still()) { spans.forEach((sp, i) => sp.textContent = code[i]); return done(); }
    let i = 0;
    const roll = setInterval(() => spans.forEach((sp, k) => { if (k >= i && code[k] !== '-') sp.textContent = POOL[Math.random() * POOL.length | 0]; }), 45);
    const lock = setInterval(() => {
      spans[i].textContent = code[i]; spans[i].classList.add('lock'); i++;
      if (i >= code.length) { clearInterval(roll); clearInterval(lock); done(); }
    }, 55);
  }

  function showCode(id, code, opt = {}) {
    const v = findVoucher(id) || {};
    if (!code && isOut(v)) { toast('Voucher này đã phát hết mã'); return; }   // FR-3.4: không cho nhận khi hết lượt
    const fresh = opt.fresh ?? !code;
    code = code || `CDD-HG2026-${String(30 + (Math.random() * 900 | 0)).padStart(3, '0')}`;
    const st = stubOf(v), money = (n) => n.toLocaleString('vi-VN') + 'đ';
    document.getElementById('claimOv')?.remove();
    const last = document.activeElement;
    const ov = document.createElement('div');
    ov.className = 'claim-ov'; ov.id = 'claimOv';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'claimTitle');
    ov.innerHTML = `<div class="claim-card">
      <div class="claim-head">
        <div class="ok${fresh ? '' : ' view'}"><i class="bi ${fresh ? 'bi-check-lg' : 'bi-ticket-perforated-fill'}"></i></div>
        <h3 id="claimTitle">${fresh ? 'Đã nhận mã!' : 'Mã ưu đãi của bạn'}</h3>
        <div class="small" style="opacity:.85">${fresh ? 'Mã đã được lưu vào Ví voucher của bạn' : 'Đưa mã này cho nhân viên tại quầy'}</div>
      </div>
      <div class="claim-tkw"><div class="claim-tk">
        <div class="claim-stub ${st.cls}">
          <div class="big">${st.big}</div><div class="sm">${st.sm}</div><div class="sm mt-2" style="opacity:.85">HSD ${v.end || ''}</div>
          <span class="stamp${fresh ? '' : ' on'}">ĐÃ NHẬN</span>
        </div>
        <div class="claim-body">
          <div><div class="vcard-shop">${v.shop || ''}</div><div class="fw-bold">${v.title || ''}</div></div>
          <div class="small-2 text-muted-2">Mã ưu đãi của bạn</div>
          <div class="slot-wrap"><div class="slot" aria-live="polite"></div>
            <button type="button" class="slot-copy" title="Sao chép mã" aria-label="Sao chép mã"><i class="bi bi-copy"></i></button></div>
          <div class="qr-row${fresh ? '' : ' show'}"><div class="qr"></div>
            <div class="small-2 text-muted-2">Đưa <b class="text-body">mã</b> hoặc <b class="text-body">QR</b> cho nhân viên tại quầy. Mỗi mã dùng <b class="text-body">1 lần</b>.</div></div>
        </div>
      </div></div>
      ${fresh && v.cat ? `<div class="save-hint"><i class="bi bi-piggy-bank me-1"></i>Dùng mã này bạn tiết kiệm khoảng <b>${money(estSave(v))}</b> – sẽ cộng vào "Bạn đã tiết kiệm được"</div>` : ''}
      <div class="d-flex gap-2 justify-content-center mt-3">
        ${/wallet\.html/.test(location.pathname) ? '' : `<a class="btn btn-light px-4" href="${ROOT}pages/resident/wallet.html?tab=unused"><i class="bi bi-wallet2"></i>Xem trong Ví</a>`}
        <button type="button" class="btn btn-accent px-4 claim-close">${fresh ? 'Xong' : 'Đóng'}</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    const slot = ov.querySelector('.slot'), qrBox = ov.querySelector('.qr');
    const drawQr = () => { if (window.QRCode) new QRCode(qrBox, { text: code, width: 74, height: 74 }); else qrBox.innerHTML = '<i class="bi bi-qr-code fs-1"></i>'; };   // qrcode.js (FR-3.7)
    const close = () => {
      ov.classList.add('closing'); document.removeEventListener('keydown', key);
      setTimeout(() => { ov.remove(); document.body.style.overflow = ''; last && last.focus && last.focus(); }, 220);
    };
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('.claim-close')) close(); });
    ov.querySelector('.slot-copy').addEventListener('click', (e) => {
      navigator.clipboard && navigator.clipboard.writeText(code);
      e.currentTarget.innerHTML = '<i class="bi bi-check2"></i>'; toast('Đã sao chép mã ' + code);
    });
    if (fresh) {
      setTimeout(() => rollCode(slot, code, () => {
        ov.querySelector('.stamp').classList.add('slam'); drawQr();
        setTimeout(() => { ov.querySelector('.qr-row').classList.add('show'); const h = ov.querySelector('.save-hint'); if (h) h.classList.add('show'); }, 250);
        if (navigator.vibrate) navigator.vibrate([20, 40, 30]);
      }), still() ? 0 : 450);
    } else { slot.innerHTML = [...code].map(ch => `<span>${ch}</span>`).join(''); drawQr(); }
    ov.querySelector('.claim-close').focus();
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
      s.classList.remove('pop'); void s.offsetWidth; if (on) s.classList.add('pop');   // icon nảy khi lưu
      s.querySelector('i').className = 'bi ' + (on ? 'bi-bookmark-fill' : 'bi-bookmark');
      s.querySelector('span').textContent = on ? 'Đã lưu' : 'Lưu';
      toast(on ? 'Đã lưu voucher vào danh sách đã lưu' : 'Đã bỏ lưu voucher');
    }
    const c = e.target.closest('[data-code]');
    if (c) showCode(c.dataset.code);
  });

  const isSaved = (id) => saved.has(id);

  // ---- Kiểm tra mật khẩu (FR-1.1, FR-1.3): tối thiểu 8 ký tự, có chữ cái và chữ số ----
  // Không bắt buộc chữ hoa / ký tự đặc biệt (ưu tiên độ dài – theo khuyến nghị NIST SP 800-63B); có thì được tính "Mạnh"
  const PW_RULES = [
    ['len', 'Ít nhất 8 ký tự', v => v.length >= 8],
    ['letter', 'Có chữ cái', v => /[a-zA-ZÀ-ỹ]/.test(v)],
    ['num', 'Có chữ số', v => /\d/.test(v)],
  ];
  const pwOk = (v) => PW_RULES.every(r => r[2](v || ''));
  function pwLevel(v) {
    if (!v) return 0;
    if (!pwOk(v)) return 1;
    const extra = (v.length >= 12) + (/[^a-zA-Z0-9]/.test(v) || (/[a-z]/.test(v) && /[A-Z]/.test(v)));
    return extra ? 3 : 2;
  }
  function pwMeter(input) {
    const box = document.createElement('div');
    box.className = 'pw-meter'; box.dataset.level = 0;
    box.innerHTML = `<div class="pw-top"><div class="pw-bar"><span></span><span></span><span></span></div><span class="pw-label" aria-live="polite"></span></div>
      <ul class="pw-rules">${PW_RULES.map(r => `<li data-r="${r[0]}"><i class="bi bi-circle"></i>${r[1]}</li>`).join('')}</ul>`;
    input.insertAdjacentElement('afterend', box);
    const update = () => {
      const v = input.value, lv = pwLevel(v);
      box.dataset.level = lv;
      box.querySelector('.pw-label').textContent = ['', 'Yếu', 'Trung bình', 'Mạnh'][lv];
      box.querySelectorAll('li').forEach((li, i) => {
        const ok = PW_RULES[i][2](v); li.classList.toggle('ok', ok);
        li.firstElementChild.className = 'bi ' + (ok ? 'bi-check-circle-fill' : box.classList.contains('warn') ? 'bi-x-circle' : 'bi-circle');
      });
      if (pwOk(v)) { box.classList.remove('warn'); input.classList.remove('is-invalid'); }
    };
    input.addEventListener('input', update);
    input._pw = { warn() { box.classList.add('warn'); input.classList.add('is-invalid'); update(); } };
    return input._pw;
  }
  return { stars, scopeTag, voucherCard, isOut, showCode, stubOf, estSave, toast, skeleton, skeletonRows, confirm: confirmBox, findVoucher, isSaved, pwOk, pwMeter, IMG, ROOT, D };
})();
