/* ==========================================================
   CuDanDeals.vn – Hiệu ứng nhẹ (không dùng thư viện – NFR-3)
   1. Hiện dần khi cuộn tới   2. Số liệu chạy từ 0
   3. Tự áp dụng cho nội dung render lại (lọc, chuyển tab)
   Tắt toàn bộ nếu người dùng bật "giảm chuyển động" trong hệ điều hành.
   (layout.js tự nạp file này – không cần thêm thẻ <script> ở từng trang)
   ========================================================== */
(function () {
  // ?fx=off: tắt hiệu ứng (dùng khi chụp trang bằng html.to.design để mọi phần đều hiện đủ)
  if (new URLSearchParams(location.search).get('fx') === 'off') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const SEL = '.page-head, .sec-head, .trust, .partner-cta, .cdd-card, .vcard, .cdd-table, .witem, .rv, .noti, .ai-box, .auth-card';
  const SKIP = '.modal, .offcanvas, .dropdown-menu, .action-card, .toast-container';
  const COUNT_SEL = '.kpi .num, .trust .n, .display-5';

  /* ---------- 1. Hiện dần ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    let i = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = Math.min(i++, 5) * 70 + 'ms';    // so le nhẹ trong cùng một lượt
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
      e.target.addEventListener('transitionend', () => { e.target.style.transitionDelay = ''; }, { once: true });
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });

  function prepare(root) {
    const els = [];
    if (root.matches && root.matches(SEL)) els.push(root);
    root.querySelectorAll && els.push(...root.querySelectorAll(SEL));
    els.forEach(el => {
      if (el.classList.contains('reveal') || el.closest(SKIP)) return;
      if (el.parentElement && el.parentElement.closest('.reveal:not(.in)')) return;   // không lồng hiệu ứng
      el.classList.add('reveal'); revealIO.observe(el);
    });
    root.querySelectorAll && root.querySelectorAll(COUNT_SEL).forEach(el => { if (!el.closest(SKIP)) countIO.observe(el); });
  }

  /* ---------- 2. Số chạy ---------- */
  function parse(txt) {
    const m = txt.match(/^(\D*)([\d.,]+)(.*)$/s); if (!m) return null;
    const raw = m[2];
    if (/^\d{1,3}(\.\d{3})+$/.test(raw)) return { pre: m[1], val: +raw.replace(/\./g, ''), dec: 0, thousands: true, post: m[3] };
    const d = (raw.split('.')[1] || '').length;
    return { pre: m[1], val: parseFloat(raw), dec: d, thousands: false, post: m[3] };
  }
  const fmt = (p, v) => p.pre + (p.thousands ? Math.round(v).toLocaleString('vi-VN') : v.toFixed(p.dec)) + p.post;
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return; countIO.unobserve(e.target);
      const node = [...e.target.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (!node || e.target.dataset.counted) return;
      const p = parse(node.textContent.trim()); if (!p || !p.val) return;
      e.target.dataset.counted = 1;
      const t0 = performance.now(), dur = 900;
      (function tick(t) {
        const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3);
        node.textContent = fmt(p, p.val * ease) + (node.textContent.endsWith(' ') ? ' ' : '');
        if (k < 1) requestAnimationFrame(tick); else node.textContent = fmt(p, p.val) + ' ';
      })(t0);
    });
  }, { threshold: 0.4 });

  /* ---------- 3. Nội dung render lại ---------- */
  function start() {
    document.documentElement.classList.add('fx');
    prepare(document.body);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) prepare(n); })))
      .observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
