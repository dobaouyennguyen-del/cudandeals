/* ==========================================================
   CuDanDeals.vn – Danh sách màn hình (dùng chung cho Design Hub & công cụ chụp ảnh)
   path: tính từ thư mục gốc dự án · mode: 'full' = chụp cả trang, 'view' = chỉ khung nhìn (popup, ngăn kéo)
   mobile: true = chụp thêm bản điện thoại 390px
   ========================================================== */
window.CDD_SCREENS = [
  { group: '1. Public', role: 'Khách', items: [
    { code: 'P-01', name: 'Trang chủ', path: 'index.html', fr: 'Giới thiệu, ưu đãi nổi bật', mobile: true },
    { code: 'P-02', name: 'Đăng nhập', path: 'login.html', fr: 'FR-1.1, FR-1.6', states: [
      { code: 'P-02b', name: 'Yêu cầu đăng nhập', path: 'login.html?next=deal' },
      { code: 'P-02c', name: 'Google chưa đăng ký', path: 'login.html?google=new' }] },
    { code: 'P-03', name: 'Đăng ký', path: 'register.html', fr: 'FR-1.1, FR-1.2, FR-2.1', states: [
      { code: 'P-03b', name: 'Đăng ký cư dân', path: 'register.html?step=2&role=resident' },
      { code: 'P-03c', name: 'Đăng ký đối tác', path: 'register.html?step=2&role=partner' }] },
    { code: 'P-04', name: 'Quên mật khẩu', path: 'forgot-password.html', fr: 'FR-1.3', states: [
      { code: 'P-04b', name: 'Đã gửi email', path: 'forgot-password.html?sent=1' }] },
  ]},
  { group: '2. Cư dân', role: 'Cư dân', items: [
    { code: 'R-01', name: 'Khám phá – Danh sách', path: 'pages/resident/explore.html', fr: 'FR-3.1, 3.5, 3.8', mobile: true, states: [
      { code: 'R-01c', name: 'Tóm tắt khi rê chuột', path: 'pages/resident/explore.html?hover=v1' },
      { code: 'R-01d', name: 'Đang lọc nhanh', path: 'pages/resident/explore.html?quick=exp3' },
      { code: 'R-01e', name: 'Bộ lọc trên điện thoại', path: 'pages/resident/explore.html?filter=open', mode: 'view', width: 390 }] },
    { code: 'R-01b', name: 'Khám phá – Bản đồ', path: 'pages/resident/explore-map.html', fr: 'FR-3.6', states: [
      { code: 'R-01f', name: 'Bản đồ – chọn quán', path: 'pages/resident/explore-map.html?shop=' + encodeURIComponent('Phở Bò Gia Truyền') }] },
    { code: 'R-02', name: 'Chi tiết voucher', path: 'pages/resident/voucher-detail.html?id=v1', fr: 'FR-3.2, 3.3, 3.4, 3.6, 7.3', mobile: true, states: [
      { code: 'R-02b', name: 'Popup nhận mã', path: 'pages/resident/voucher-detail.html?id=v1&code=1', mode: 'view' },
      { code: 'R-02c', name: 'Voucher đã hết mã', path: 'pages/resident/voucher-detail.html?id=v16' },
      { code: 'R-02d', name: 'Voucher hết hạn', path: 'pages/resident/voucher-detail.html?id=v90' },
      { code: 'R-02e', name: 'Voucher bị gỡ', path: 'pages/resident/voucher-detail.html?id=v91' }] },
    { code: 'R-03', name: 'Ví voucher', path: 'pages/resident/wallet.html?tab=unused', fr: 'FR-3.3, 3.4, 3.7, 3.9', mobile: true, states: [
      { code: 'R-03b', name: 'Chi tiết tiết kiệm', path: 'pages/resident/wallet.html?tab=unused&savings=open' },
      { code: 'R-03c', name: 'Tab Đã lưu', path: 'pages/resident/wallet.html?tab=saved' },
      { code: 'R-03d', name: 'Tab Đã dùng', path: 'pages/resident/wallet.html?tab=used' },
      { code: 'R-03e', name: 'Tab Hết hạn', path: 'pages/resident/wallet.html?tab=expired' },
      { code: 'R-03f', name: 'Popup đánh giá', path: 'pages/resident/wallet.html?tab=used&review=1', mode: 'view' }] },
    { code: 'R-04', name: 'Đánh giá của tôi', path: 'pages/resident/my-reviews.html', fr: 'FR-7.1' },
  ]},
  { group: '3. Đối tác', role: 'Đối tác', items: [
    { code: 'B-01', name: 'Tổng quan', path: 'pages/partner/dashboard.html', fr: 'FR-2.3, 2.7', states: [
      { code: 'B-00', name: 'Hồ sơ chờ duyệt', path: 'pages/partner/dashboard.html?pending=1' }] },
    { code: 'B-02', name: 'Hồ sơ cửa hàng', path: 'pages/partner/store-profile.html', fr: 'FR-2.1' },
    { code: 'B-03', name: 'Danh sách voucher', path: 'pages/partner/voucher-list.html', fr: 'FR-2.3, 2.4', states: [
      { code: 'B-03b', name: 'Voucher chờ duyệt', path: 'pages/partner/voucher-list.html?tab=pending' }] },
    { code: 'B-04', name: 'Tạo voucher (AI)', path: 'pages/partner/create-voucher.html', fr: 'FR-2.2, 2.4, 5.1' },
    { code: 'B-05', name: 'Xác nhận mã', path: 'pages/partner/confirm-redeem.html', fr: 'FR-2.5, 2.8', mobile: true, states: [
      { code: 'B-05b', name: 'Mã hợp lệ', path: 'pages/partner/confirm-redeem.html?result=ok' },
      { code: 'B-05c', name: 'Mã không hợp lệ', path: 'pages/partner/confirm-redeem.html?result=fail' }] },
    { code: 'B-06', name: 'Thống kê hiệu quả', path: 'pages/partner/statistics.html', fr: 'FR-2.7' },
    { code: 'B-07', name: 'Đánh giá từ cư dân', path: 'pages/partner/reviews.html', fr: 'FR-7.2' },
  ]},
  { group: '4. Ban quản lý', role: 'Ban quản lý', items: [
    { code: 'A-01', name: 'Tổng quan BQL', path: 'pages/admin/dashboard.html', fr: 'Tổng hợp' },
    { code: 'A-02', name: 'Quản lý cư dân', path: 'pages/admin/residents.html', fr: 'FR-4.3, 4.5' },
    { code: 'A-03', name: 'Quản lý & duyệt đối tác', path: 'pages/admin/partners.html', fr: 'FR-4.1, 4.4', states: [
      { code: 'A-03b', name: 'Đối tác chờ duyệt', path: 'pages/admin/partners.html?tab=pending' },
      { code: 'A-03c', name: 'Xem hồ sơ để duyệt', path: 'pages/admin/partners.html?review=pt3', mode: 'view' }] },
    { code: 'A-04', name: 'Duyệt / gỡ voucher', path: 'pages/admin/approve-vouchers.html', fr: 'FR-4.2' },
    { code: 'A-05', name: 'Báo cáo & thống kê', path: 'pages/admin/reports.html', fr: 'Báo cáo' },
    { code: 'A-06', name: 'Quản lý khu dân cư', path: 'pages/admin/residential-areas.html', fr: 'FR-4.3' },
    { code: 'A-07', name: 'Quản lý ngành hàng', path: 'pages/admin/categories.html', fr: 'FR-4.6' },
  ]},
  { group: '5. Dùng chung', role: 'Mọi vai trò', items: [
    { code: 'C-01', name: 'Tài khoản & mật khẩu', path: 'pages/common/profile.html', fr: 'FR-1.3, 1.4', states: [
      { code: 'C-01b', name: 'Tài khoản đối tác', path: 'pages/common/profile.html?role=partner' },
      { code: 'C-01c', name: 'Tài khoản BQL', path: 'pages/common/profile.html?role=admin' },
      { code: 'C-01d', name: 'Popup đổi mật khẩu', path: 'pages/common/profile.html?pw=1', mode: 'view' }] },
    { code: 'C-02', name: 'Thông báo', path: 'pages/common/notifications.html', fr: 'FR-6.1', states: [
      { code: 'C-02b', name: 'Thông báo đối tác', path: 'pages/common/notifications.html?role=partner' },
      { code: 'C-02c', name: 'Thông báo BQL', path: 'pages/common/notifications.html?role=admin' }] },
  ]},
];
// Thêm fx=off (tắt hiệu ứng hiện dần) khi mở để chụp
window.CDD_FX = (p) => p + (p.includes('?') ? '&' : '?') + 'fx=off';
