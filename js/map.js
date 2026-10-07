/* ==========================================================
   CuDanDeals.vn – Sơ đồ khu dân cư dùng chung (FR-3.6)
   Dùng ở: Khám phá › Bản đồ (explore-map.html) và Chi tiết voucher (voucher-detail.html)
   CDDMap.mount(el)        vẽ sơ đồ Khu Sunrise vào el (+ #pins, #me, #walkTag, #route)
   CDDMap.showRoute(shop)  vẽ đường đi bộ từ "Nhà bạn" tới cửa hàng, hiện nhãn "x phút"
   CDDMap.meters/minutes   khoảng cách & phút đi bộ ước tính
   Toạ độ theo khung 1000 × 620. Dữ liệu mẫu – Phase 3: đối tác chọn vị trí ở B-02,
   cư dân khai báo Tòa/Block trong hồ sơ.
   ========================================================== */
(function () {
  const COLORS = { coffee: '#B45309', food: '#EA580C', spa: '#DB2777', gym: '#2563EB', market: '#16A34A', edu: '#7C3AED', repair: '#475569' };
  const SH = (k) => 40 + (k - 1) * 114;                 // vị trí shophouse S1..S8
  const TOWERS = [['S1', 60, 70, 160], ['S2', 250, 80, 150], ['S3', 440, 70, 160], ['S4', 630, 80, 150], ['S5', 820, 70, 160]];
  const POS = {
    'Trà & Gốm Thảo Mộc': [SH(1) + 54, 458], 'Sunrise Coffee & Tea': [SH(2) + 54, 458], 'An Nhiên Spa': [SH(3) + 54, 458],
    'Cơm Niêu & Lẩu Nhà Làm': [SH(4) + 54, 458], 'Tiệm Bánh Mì Artisan': [SH(5) + 30, 458], 'The Coffee Corner': [SH(5) + 84, 412],   // 2 quán chung S5 → ghim xếp tầng
    'Góc Cà Phê Muối': [SH(7) + 54, 458], 'GreenMart Siêu Thị Sạch': [315, 230], 'Phở Bò Gia Truyền': [505, 230],
    'Morning Bakery & Coffee': [695, 230], 'Sunrise Fitness & Yoga': [125, 150],
  };
  const HOME = [125, 230];                              // chân Tòa S1 – tòa của cư dân
  const ROAD_TOP = 258, ROAD_LOW = 433, LANES = [25, 500, 975];   // 3 lối nối giữa 2 đường nội khu

  const len = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  // Đường đi bộ theo lối nội khu (chọn lối ngắn nhất); 1 đơn vị ≈ 0,5 m; đi bộ 75 m/phút
  function route([x, y]) {
    if (y > 400) return LANES.map(cx => [HOME, [HOME[0], ROAD_TOP], [cx, ROAD_TOP], [cx, ROAD_LOW], [x, ROAD_LOW], [x, y]])
      .reduce((a, b) => (len(b) < len(a) ? b : a));
    if (x === HOME[0]) return [HOME, [HOME[0] + 30, HOME[1] - 40], [x, y]];
    return [HOME, [HOME[0], ROAD_TOP], [x, ROAD_TOP], [x, y]];
  }
  const meters = (shop) => Math.round(len(route(POS[shop])) * 0.5 / 10) * 10;
  const minutes = (shop) => Math.max(1, Math.round(meters(shop) / 75));
  const pct = ([x, y]) => ({ left: x / 10 + '%', top: y / 6.2 + '%' });

  const SVG = `<svg viewBox="0 0 1000 620" aria-hidden="true">
    <defs>
      <pattern id="win" width="16" height="14" patternUnits="userSpaceOnUse"><rect x="3" y="3" width="9" height="7" rx="1.5" fill="#fff" opacity=".75"/></pattern>
      <pattern id="grass" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.3" fill="#C9E4CF"/></pattern>
    </defs>
    <rect width="1000" height="620" fill="#EAF3EC"/><rect width="1000" height="620" fill="url(#grass)"/>
    <rect x="0" y="548" width="1000" height="72" fill="#CBD5E1"/>
    <line x1="0" y1="584" x2="1000" y2="584" stroke="#fff" stroke-width="3" stroke-dasharray="22 16"/>
    <text x="30" y="608" class="lbl-sm" fill="#475569">ĐƯỜNG SUNRISE</text>
    <rect x="15" y="245" width="970" height="26" rx="13" fill="#E2E8F0"/>
    <rect x="15" y="420" width="970" height="26" rx="13" fill="#E2E8F0"/>
    <rect x="487" y="245" width="26" height="305" fill="#E2E8F0"/>
    <rect x="12" y="245" width="26" height="201" rx="13" fill="#E2E8F0"/>
    <rect x="962" y="245" width="26" height="201" rx="13" fill="#E2E8F0"/>
    <rect x="462" y="528" width="76" height="22" rx="4" fill="#64748B"/>
    <text x="500" y="543" text-anchor="middle" style="font:700 11px 'Be Vietnam Pro',sans-serif" fill="#fff">CỔNG CHÍNH</text>
    <rect x="40" y="285" width="425" height="122" rx="18" fill="#D5EBDA"/>
    <rect x="535" y="285" width="425" height="122" rx="18" fill="#D5EBDA"/>
    <ellipse cx="700" cy="346" rx="105" ry="38" fill="#BAE6FD" stroke="#7DD3FC" stroke-width="3"/>
    <text x="700" y="351" text-anchor="middle" class="lbl-sm" fill="#0369A1">Hồ bơi</text>
    <circle cx="215" cy="346" r="34" fill="#FDE68A" stroke="#FCD34D" stroke-width="3"/>
    <text x="215" y="350" text-anchor="middle" class="lbl-sm" fill="#92400E">Sân chơi</text>
    <g fill="#86C79A"><circle cx="90" cy="320" r="14"/><circle cx="118" cy="372" r="11"/><circle cx="330" cy="318" r="13"/><circle cx="405" cy="370" r="15"/><circle cx="580" cy="318" r="12"/><circle cx="870" cy="320" r="15"/><circle cx="915" cy="372" r="11"/><circle cx="836" cy="380" r="9"/></g>
    <text x="330" y="398" class="lbl-sm">Công viên nội khu</text>
    ${TOWERS.map(([n, x, y, h]) => `
      <rect class="tower" x="${x}" y="${y}" width="130" height="${h}" rx="10" fill="${n === 'S1' ? '#BFDBFE' : '#DBEAFE'}" stroke="${n === 'S1' ? '#2563EB' : '#93C5FD'}" stroke-width="${n === 'S1' ? 3 : 2}"/>
      <rect x="${x + 10}" y="${y + 34}" width="110" height="${h - 44}" fill="url(#win)"/>
      <text x="${x + 65}" y="${y + 24}" text-anchor="middle" class="lbl">Tòa ${n}</text>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `
      <rect x="${SH(i + 1)}" y="458" width="108" height="62" rx="6" fill="#FFF7ED" stroke="#FDBA74" stroke-width="2"/>
      <rect x="${SH(i + 1)}" y="458" width="108" height="12" rx="6" fill="#FED7AA"/>
      <text x="${SH(i + 1) + 54}" y="505" text-anchor="middle" class="lbl-sm" fill="#9A3412">Shophouse S${i + 1}</text>`).join('')}
    <polyline id="routeBg" points=""/><polyline id="route" points=""/>
  </svg>`;

  function mount(el) {
    el.classList.add('map');
    const h = pct(HOME);
    el.innerHTML = SVG + `<div id="pins"></div>
      <div class="me" id="me" style="left:${h.left};top:${h.top}"><div class="dot"></div><div class="lab">Nhà bạn · Tòa S1</div></div>
      <div class="walk-tag d-none" id="walkTag"></div>`;
  }

  function showRoute(shop) {
    const R = document.getElementById('route'), B = document.getElementById('routeBg'), T = document.getElementById('walkTag');
    if (!shop || !POS[shop]) { R.setAttribute('points', ''); B.setAttribute('points', ''); T.classList.add('d-none'); return; }
    const r = route(POS[shop]), pts = r.map(p => p.join(',')).join(' ');
    R.setAttribute('points', pts); B.setAttribute('points', pts);
    // nhãn "x phút" đặt giữa đoạn đường dài nhất, tránh đoạn sát dãy shophouse (đè lên ghim)
    let mid = r[0], best = -1;
    r.slice(1).forEach((p, i) => {
      if (p[1] > 420 && r[i][1] > 420) return;
      const d = Math.hypot(p[0] - r[i][0], p[1] - r[i][1]); if (d > best) { best = d; mid = [(p[0] + r[i][0]) / 2, (p[1] + r[i][1]) / 2]; }
    });
    T.style.left = Math.min(930, Math.max(70, mid[0])) / 10 + '%';   // không tràn mép bản đồ
    T.style.top = mid[1] / 6.2 + '%';
    T.innerHTML = `<i class="bi bi-person-walking"></i> ${minutes(shop)} phút`; T.classList.remove('d-none');
  }

  // Link chỉ đường Google Maps theo tên + địa chỉ cửa hàng (không cần API key)
  const directions = (shop, address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop + ', ' + address)}`;

  window.CDDMap = { COLORS, SH, POS, HOME, route, len, meters, minutes, pct, mount, showRoute, directions, has: (s) => !!POS[s] };
})();
