/* ==========================================================
   CuDanDeals.vn – Header & Footer dùng chung
   Cách dùng: <body data-role="partner" data-active="voucher">
     <div id="cdd-header"></div> ... <div id="cdd-footer"></div>
     <script src="(đường dẫn)/js/layout.js"></script>
   data-role: public | resident | partner | admin
   ========================================================== */
(function () {
  // Tìm thư mục gốc dự án dựa vào vị trí file layout.js
  const me = document.currentScript.getAttribute('src');
  const ROOT = me.replace(/js\/layout\.js$/, '');
  window.CDD_ROOT = ROOT;   // dùng cho components.js (đường dẫn ảnh, link)

  const NAV = {
    // Khách chưa đăng nhập: menu trỏ tới các phần trong trang chủ
    public: [
      ['top', 'Trang chủ', 'index.html#top'],
      ['uu-dai', 'Ưu đãi', 'index.html#uu-dai'],
      ['cach-dung', 'Cách dùng', 'index.html#cach-dung'],
      ['danh-gia', 'Đánh giá', 'index.html#danh-gia'],
      ['doi-tac', 'Dành cho đối tác', 'index.html#doi-tac'],
      ['hoi-dap', 'Hỏi đáp', 'index.html#hoi-dap'],
    ],
    resident: [
      ['explore', 'Khám phá', 'pages/resident/explore.html'],
      ['wallet', 'Ví voucher', 'pages/resident/wallet.html', { count: 5 }],
      ['reviews', 'Đánh giá', 'pages/resident/my-reviews.html'],
      ['notifications', 'Thông báo', 'pages/common/notifications.html', { dot: true }],
    ],
    partner: [
      ['dashboard', 'Tổng quan', 'pages/partner/dashboard.html'],
      ['voucher', 'Voucher', 'pages/partner/voucher-list.html'],
      ['redeem', 'Xác nhận mã', 'pages/partner/confirm-redeem.html'],
      ['stats', 'Thống kê', 'pages/partner/statistics.html'],
      ['reviews', 'Đánh giá', 'pages/partner/reviews.html'],
    ],
    admin: [
      ['dashboard', 'Tổng quan', 'pages/admin/dashboard.html'],
      ['residents', 'Cư dân', 'pages/admin/residents.html'],
      ['partners', 'Đối tác', 'pages/admin/partners.html'],
      ['vouchers', 'Duyệt voucher', 'pages/admin/approve-vouchers.html'],
      ['areas', 'Khu dân cư', 'pages/admin/residential-areas.html'],
      ['categories', 'Ngành hàng', 'pages/admin/categories.html'],
      ['reports', 'Báo cáo', 'pages/admin/reports.html'],
    ],
  };

  const USER = {
    resident: { initials: 'HG', name: 'Hoàng Giang', meta: 'Khu dân cư Sunrise', cls: '' },
    partner:  { initials: 'SC', name: 'Sunrise Coffee & Tea', meta: 'Đối tác · Khu dân cư Sunrise', cls: 'orange' },
    admin:    { initials: 'AD', name: 'Admin BQL', meta: 'Ban quản lý', cls: '' },
  };

  const role = document.body.dataset.role || 'public';
  const active = document.body.dataset.active || '';
  const sub = { resident: 'ƯU ĐÃI CƯ DÂN', partner: 'KÊNH ĐỐI TÁC', admin: 'BAN QUẢN LÝ', public: 'ƯU ĐÃI CƯ DÂN' }[role];

  const links = (NAV[role] || []).map(([key, label, href, opt = {}]) =>
    `<a href="${ROOT}${href}" class="${key === active ? 'active' : ''}">${label}` +
    (opt.count ? `<span class="count">${opt.count}</span>` : '') +
    (opt.dot ? `<span class="dot"></span>` : '') + `</a>`).join('');

  const mobileLinks = (NAV[role] || []).map(([key, label, href]) =>
    `<li><a class="dropdown-item${key === active ? ' active' : ''}" href="${ROOT}${href}">${label}</a></li>`).join('');

  let right;
  if (role === 'public') {
    right = `<a href="${ROOT}login.html" class="btn btn-link text-decoration-none fw-semibold" style="color:var(--text)">Đăng nhập</a>
             <a href="${ROOT}register.html" class="btn btn-accent px-4">Đăng ký</a>`;
  } else {
    const u = USER[role];
    right = `<div class="dropdown">
        <a href="#" class="cdd-user" data-bs-toggle="dropdown" aria-expanded="false">
          <span class="cdd-avatar ${u.cls}">${u.initials}</span>
          <span><span class="name">${u.name}</span><span class="meta">${u.meta}</span></span>
          <i class="bi bi-chevron-down text-muted-2 small"></i>
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
          ${role === 'partner' ? `<li><a class="dropdown-item" href="${ROOT}pages/partner/store-profile.html"><i class="bi bi-shop me-2"></i>Hồ sơ cửa hàng</a></li>` : ''}
          <li><a class="dropdown-item" href="${ROOT}pages/common/profile.html?role=${role}"><i class="bi bi-person-gear me-2"></i>Tài khoản & mật khẩu</a></li>
          ${role !== 'resident' ? `<li><a class="dropdown-item" href="${ROOT}pages/common/notifications.html?role=${role}"><i class="bi bi-bell me-2"></i>Thông báo</a></li>` : ''}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="${ROOT}login.html"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a></li>
        </ul>
      </div>`;
  }

  const header = document.getElementById('cdd-header');
  if (header) header.outerHTML = `
  <header class="cdd-header">
    <div class="container container-cdd d-flex align-items-center justify-content-between gap-3">
      <div class="d-flex align-items-center gap-2">
        <div class="dropdown d-lg-none">
          <button class="btn btn-light btn-sm" data-bs-toggle="dropdown" aria-label="Menu"><i class="bi bi-list fs-5"></i></button>
          <ul class="dropdown-menu shadow-sm border-0">${mobileLinks}</ul>
        </div>
        <a href="${ROOT}index.html" class="cdd-logo">
          <span class="cdd-logo-icon"><i class="bi bi-ticket-perforated-fill"></i></span>
          <span><span class="cdd-logo-text">CuDanDeals<span class="vn">.vn</span></span><span class="cdd-logo-sub">${sub}</span></span>
        </a>
      </div>
      <nav class="cdd-nav">${links}</nav>
      <div class="d-flex align-items-center gap-2">${right}</div>
    </div>
  </header>`;

  // Trang chủ: tô sáng mục menu theo phần đang xem
  if (role === 'public' && document.getElementById('uu-dai')) {
    const navLinks = [...document.querySelectorAll('.cdd-nav a')];
    const ids = navLinks.map(a => a.hash.slice(1));
    const spy = () => {
      let cur = ids[0];
      ids.forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 120) cur = id; });
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = ids[ids.length - 1];
      navLinks.forEach(a => a.classList.toggle('active', a.hash === '#' + cur));
    };
    window.addEventListener('scroll', spy, { passive: true }); spy();
  }

  const footer = document.getElementById('cdd-footer');
  if (footer) footer.outerHTML = `
  <footer class="cdd-footer">
    <div class="container container-cdd">
      <div class="row g-4">
        <div class="col-md-5">
          <a href="${ROOT}index.html" class="cdd-logo mb-3 d-inline-flex">
            <span class="cdd-logo-icon"><i class="bi bi-ticket-perforated-fill"></i></span>
            <span class="cdd-logo-text">CuDanDeals<span class="vn">.vn</span></span>
          </a>
          <p class="mb-0">Kết nối cư dân với cửa hàng, dịch vụ gần nhà qua ưu đãi được Ban quản lý kiểm duyệt.</p>
        </div>
        <div class="col-6 col-md-3">
          <h6>Liên kết nhanh</h6>
          <a href="${ROOT}index.html">Trang chủ</a>
          <a href="${ROOT}index.html#uu-dai">Ưu đãi</a>
          <a href="${ROOT}index.html#doi-tac">Dành cho đối tác</a>
        </div>
        <div class="col-6 col-md-4">
          <h6>Hỗ trợ & Liên hệ</h6>
          <a href="#"><i class="bi bi-telephone me-2"></i>Hotline: 1900 8866</a>
          <a href="#"><i class="bi bi-envelope me-2"></i>hotro@cudandeals.vn</a>
        </div>
      </div>
      <div class="copy">© 2026 CuDanDeals.vn · Đồ án IE104 – Nhóm N13</div>
    </div>
  </footer>`;

  // Nạp hiệu ứng nhẹ dùng chung (js/effects.js)
  const fx = document.createElement('script'); fx.src = ROOT + 'js/effects.js'; document.body.appendChild(fx);
})();
