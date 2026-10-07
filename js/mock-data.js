/* ==========================================================
   CuDanDeals.vn – DỮ LIỆU MẪU (chỉ dùng cho giai đoạn giao diện)
   Phase 3 sẽ thay bằng dữ liệu đọc từ Firestore với cùng cấu trúc
   (xem mục 11 – Firebase Data Models trong CUDANDEALS_PROJECT_SUMMARY.md)
   ========================================================== */
window.CDD_DATA = {
  currentUser: { name: 'Hoàng Giang', initials: 'HG', area: 'sunrise', areaName: 'Khu dân cư Sunrise', email: 'hoanggiang@gmail.com', phone: '0912 345 678' },

  // residentialAreas – FR-4.3
  areas: [
    { id: 'sunrise',   name: 'Khu dân cư Sunrise',    address: 'Nguyễn Hữu Thọ, Quận 7, TP.HCM',  residents: 1247 },
    { id: 'greenpark', name: 'Khu dân cư Green Park', address: 'Phạm Văn Đồng, Thủ Đức, TP.HCM',   residents: 856 },
    { id: 'riverside', name: 'Khu dân cư Riverside',  address: 'Bến Vân Đồn, Quận 4, TP.HCM',      residents: 642 },
  ],

  // categories – FR-4.6
  categories: [
    { id: 'food',   name: 'Ẩm thực',          icon: 'bi-egg-fried' },
    { id: 'coffee', name: 'Cà phê & Đồ uống', icon: 'bi-cup-hot' },
    { id: 'spa',    name: 'Spa & Làm đẹp',    icon: 'bi-flower1' },
    { id: 'gym',    name: 'Thể thao & Gym',   icon: 'bi-bicycle' },
    { id: 'edu',    name: 'Giáo dục',         icon: 'bi-book' },
    { id: 'repair', name: 'Sửa chữa',         icon: 'bi-tools' },
    { id: 'market', name: 'Siêu thị',         icon: 'bi-basket' },
  ],

  // vouchers – scope: 'area' (riêng khu) | 'public' (công khai) – FR-2.2, FR-3.1
  vouchers: [
    { id: 'v1',  shop: 'Sunrise Coffee & Tea',   cat: 'coffee', img: 'coffee-barista.jpg', badge: 'GIẢM 30%',  title: 'Giảm 30% toàn menu đồ uống', scope: 'area',   address: 'Shophouse S2, Khu dân cư Sunrise', end: '31/12/2026', daysLeft: 3,  left: 14, rating: 4.8, reviews: 234, hot: true,
      desc: 'Giảm 30% toàn bộ đồ uống. Áp dụng 7h–10h sáng và 14h–17h chiều hằng ngày.', conditions: ['Chỉ dành cho cư dân Khu dân cư Sunrise', 'Hiệu lực 01/10/2026 – 31/12/2026', 'Mỗi cư dân 1 mã/ngày', 'Không áp dụng cùng khuyến mãi khác'] },
    { id: 'v2',  shop: 'Tiệm Bánh Mì Artisan',   cat: 'food',   img: 'bakery.jpg',         badge: 'TẶNG MÓN',  title: 'Tặng 1 bánh sừng bò cho hóa đơn từ 100.000đ', scope: 'area', address: 'Shophouse S5, Khu dân cư Sunrise', end: '15/11/2026', daysLeft: 5, left: 22, rating: 4.7, reviews: 95 },
    { id: 'v3',  shop: 'Phở Bò Gia Truyền',      cat: 'food',   img: 'pho.jpg',            badge: 'GIẢM 20%',  title: 'Giảm 20% tô đặc biệt cho cư dân', scope: 'public', address: 'Tầng trệt Tòa S3, Sunrise', end: '20/11/2026', daysLeft: 7, left: 8, rating: 4.9, reviews: 210 },
    { id: 'v4',  shop: 'An Nhiên Spa',           cat: 'spa',    img: 'spa.jpg',            badge: 'GIẢM 40%',  title: 'Giảm 40% gói gội đầu dưỡng sinh', scope: 'area', address: 'Shophouse S3, Khu dân cư Sunrise', end: '30/11/2026', daysLeft: 2, left: 5, rating: 4.9, reviews: 41, hot: true },
    { id: 'v5',  shop: 'Sunrise Fitness & Yoga', cat: 'gym',    img: 'gym.jpg',            badge: 'GIẢM 50%',  title: 'Giảm 50% tháng đầu tập luyện', scope: 'public', address: 'Tầng 3 Tòa S1, Sunrise', end: '31/12/2026', daysLeft: 6, left: 30, rating: 4.6, reviews: 58 },
    { id: 'v6',  shop: 'GreenMart Siêu Thị Sạch', cat: 'market', img: 'minimart.jpg',      badge: 'GIẢM 50K',  title: 'Giảm 50.000đ cho đơn từ 200.000đ', scope: 'area', address: 'Tầng trệt Tòa S2, Sunrise', end: '25/11/2026', daysLeft: 10, left: 40, rating: 4.7, reviews: 48 },
    { id: 'v7',  shop: 'Cơm Niêu & Lẩu Nhà Làm', cat: 'food',   img: 'com-nieu.jpg',       badge: 'GIẢM 15%',  title: 'Giảm 15% tổng hóa đơn bàn gia đình', scope: 'public', address: 'Shophouse S4, Khu dân cư Sunrise', end: '10/12/2026', daysLeft: 4, left: 18, rating: 4.5, reviews: 77 },
    { id: 'v8',  shop: 'Trà & Gốm Thảo Mộc',     cat: 'coffee', img: 'tea-shop.jpg',       badge: 'MUA 1 TẶNG 1', title: 'Mua 1 tặng 1 trà hoa quả', scope: 'area', address: 'Shophouse S1, Khu dân cư Sunrise', end: '05/12/2026', daysLeft: 8, left: 25, rating: 4.6, reviews: 33 },
    { id: 'v9',  shop: 'The Coffee Corner',      cat: 'coffee', img: 'coffee-seating.jpg', badge: 'GIẢM 20%',  title: 'Giảm 20% các món đá xay', scope: 'public', address: 'Shophouse S5, Khu dân cư Sunrise', end: '12/12/2026', daysLeft: 5, left: 12, rating: 4.4, reviews: 62 },
  ],

  // reviews – FR-7.1, FR-7.2, FR-7.3
  reviews: [
    { voucher: 'v1', name: 'Minh Tú', initials: 'MT', stars: 5, date: '15/10/2026', text: 'Cà phê ngon, nhân viên nhiệt tình. Mã áp dụng nhanh, không phải chờ.', reply: 'Cảm ơn bạn đã ủng hộ quán! Hẹn gặp lại bạn.' },
    { voucher: 'v1', name: 'Thanh Hà', initials: 'TH', stars: 4, date: '12/10/2026', text: 'Đồ uống ổn, giờ cao điểm hơi đông nên chờ lâu một chút.' },
    { voucher: 'v1', name: 'Văn Nam',  initials: 'VN', stars: 5, date: '08/10/2026', text: 'Không gian đẹp, giảm 30% rất hời cho cư dân trong khu.' },
  ],

  // Voucher của đối tác Sunrise Coffee & Tea – FR-2.3
  // status: pending (chờ duyệt) | active (đang chạy) | paused (tạm tắt) | expired (hết hạn) | soldout (hết lượt) | removed (bị gỡ)
  partnerVouchers: [
    { id: 'p1', img: 'coffee-barista.jpg', title: 'Giảm 30% toàn menu đồ uống', scope: 'area',   start: '01/10/2026', end: '31/12/2026', max: 150, received: 45, used: 23, status: 'active' },
    { id: 'p2', img: 'coffee-drinks.jpg',  title: 'Mua 1 tặng 1 Latte size M',  scope: 'public', start: '15/10/2026', end: '15/11/2026', max: 100, received: 32, used: 18, status: 'active' },
    { id: 'p3', img: 'coffee-service.jpg', title: 'Combo bánh + cà phê chỉ 59K', scope: 'area',  start: '20/10/2026', end: '20/12/2026', max: 80,  received: 0,  used: 0,  status: 'pending' },
    { id: 'p4', img: 'coffee-seating.jpg', title: 'Giảm 20% đồ uống cuối tuần', scope: 'public', start: '01/09/2026', end: '30/11/2026', max: 60,  received: 60, used: 41, status: 'soldout' },
    { id: 'p5', img: 'coffee-front.jpg',   title: 'Free size up buổi sáng',     scope: 'area',   start: '01/10/2026', end: '30/11/2026', max: 120, received: 12, used: 5,  status: 'paused' },
    { id: 'p6', img: 'coffee-counter.jpg', title: 'Giảm 15% cho hóa đơn từ 200K', scope: 'public', start: '01/08/2026', end: '30/09/2026', max: 100, received: 88, used: 61, status: 'expired' },
    { id: 'p7', img: 'tea-shop.jpg',       title: 'Tặng topping khi mua 2 ly',   scope: 'area',   start: '01/10/2026', end: '31/10/2026', max: 50,  received: 9,  used: 2,  status: 'removed', note: 'Nội dung ưu đãi không đúng thực tế' },
  ],

  // Lịch sử xác nhận mã (redemptions) – FR-2.5
  redemptions: [
    { name: 'Hoàng Giang', initials: 'HG', voucher: 'Giảm 30% toàn menu đồ uống', code: 'CDD-HG2026-001', time: '5 phút trước' },
    { name: 'Minh Tú',     initials: 'MT', voucher: 'Mua 1 tặng 1 Latte size M',  code: 'CDD-MT2026-002', time: '15 phút trước' },
    { name: 'Văn Nam',     initials: 'VN', voucher: 'Giảm 30% toàn menu đồ uống', code: 'CDD-VN2026-003', time: '1 giờ trước' },
  ],

  // ===== Dữ liệu Admin =====
  // users (role resident) – FR-4.3 xem theo khu, FR-4.5 khóa/mở khóa
  residents: [
    { name: 'Hoàng Giang', initials: 'HG', email: 'hoanggiang@gmail.com', phone: '0912 345 678', area: 'Khu dân cư Sunrise', joined: '02/10/2026', received: 12, used: 5, status: 'active' },
    { name: 'Minh Tú',     initials: 'MT', email: 'minhtu@gmail.com',     phone: '0988 765 432', area: 'Khu dân cư Sunrise', joined: '28/09/2026', received: 8,  used: 6, status: 'active' },
    { name: 'Thanh Hà',    initials: 'TH', email: 'thanhha@gmail.com',    phone: '0903 112 233', area: 'Khu dân cư Green Park', joined: '25/09/2026', received: 15, used: 9, status: 'active' },
    { name: 'Quang Dũng',  initials: 'QD', email: 'dungquang@yahoo.com',  phone: '0945 889 900', area: 'Khu dân cư Sunrise', joined: '20/09/2026', received: 42, used: 0, status: 'locked', reason: 'Nhận mã hàng loạt nhưng không sử dụng (spam)' },
    { name: 'Lan Ngọc',    initials: 'LN', email: 'lanngoc@gmail.com',    phone: '0976 223 344', area: 'Khu dân cư Riverside', joined: '18/09/2026', received: 5,  used: 3, status: 'active' },
    { name: 'Văn Nam',     initials: 'VN', email: 'vannam@gmail.com',     phone: '0938 456 789', area: 'Khu dân cư Sunrise', joined: '15/09/2026', received: 9,  used: 7, status: 'active' },
  ],

  // partners – FR-4.1 duyệt hồ sơ, FR-4.4 khóa/mở khóa
  // owner/ownerPhone/email: người đại diện (lưu ở users), phone: hotline cửa hàng (công khai)
  partners: [
    { id: 'pt1', owner: 'Nguyễn Thu Trang', ownerPhone: '0909 123 456', email: 'sunrisecoffee@gmail.com', name: 'Sunrise Coffee & Tea', img: 'coffee-barista.jpg', cat: 'Cà phê & Đồ uống', address: 'Shophouse S2, Khu dân cư Sunrise', phone: '0909 123 456', area: 'Khu dân cư Sunrise', registered: '18/09/2026', vouchers: 4, rating: 4.8, status: 'approved' },
    { id: 'pt2', owner: 'Lê Văn Phúc', ownerPhone: '0918 776 543', email: 'artisanbakery@gmail.com', name: 'Tiệm Bánh Mì Artisan', img: 'bakery.jpg', cat: 'Ẩm thực', address: 'Shophouse S5, Khu dân cư Sunrise', phone: '0918 776 543', area: 'Khu dân cư Sunrise', registered: '20/09/2026', vouchers: 3, rating: 4.7, status: 'approved' },
    { id: 'pt3', owner: 'Trần Minh Khoa', ownerPhone: '0907 334 556', email: 'pizzahouse.sunrise@gmail.com', name: 'The Pizza House', img: 'com-nieu.jpg', cat: 'Ẩm thực', address: 'Shophouse S8, Khu dân cư Sunrise', phone: '0907 334 556', area: 'Khu dân cư Sunrise', registered: '19/10/2026', vouchers: 0, rating: null, status: 'pending', desc: 'Pizza nướng củi kiểu Ý, phục vụ tại chỗ và giao tận căn hộ trong khu.' },
    { id: 'pt4', owner: 'Phạm Quốc Bảo', ownerPhone: '0933 221 144', email: 'gymelite@gmail.com', name: 'Gym Elite Fitness', img: 'gym.jpg', cat: 'Thể thao & Gym', address: 'Tầng 3 Tòa S1, Khu dân cư Sunrise', phone: '0933 221 144', area: 'Khu dân cư Sunrise', registered: '18/10/2026', vouchers: 0, rating: null, status: 'pending', desc: 'Phòng gym và yoga với huấn luyện viên cá nhân.' },
    { id: 'pt5', owner: 'Đỗ Thị Lan', ownerPhone: '0977 110 220', email: 'minimart24h@gmail.com', name: 'Mini Mart 24h', img: 'minimart.jpg', cat: 'Siêu thị', address: 'Tầng trệt Tòa G2, Khu dân cư Green Park', phone: '0977 110 220', area: 'Khu dân cư Green Park', registered: '17/10/2026', vouchers: 0, rating: null, status: 'pending', desc: 'Cửa hàng tiện lợi mở cửa 24/7.' },
    { id: 'pt6', owner: 'Vũ Hải Đăng', ownerPhone: '0933 221 145', email: 'giatlasachnhanh@gmail.com', name: 'Giặt Là Sạch Nhanh', img: 'coffee-front.jpg', cat: 'Sửa chữa', address: 'Shophouse S12, Khu dân cư Sunrise', phone: '0933 221 144', area: 'Khu dân cư Sunrise', registered: '05/09/2026', vouchers: 1, rating: 4.2, status: 'locked', reason: 'Nhiều phản ánh không áp dụng đúng ưu đãi' },
    { id: 'pt7', owner: 'Hồ Ngọc Mai', ownerPhone: '0911 000 111', email: 'spatocdep@gmail.com', name: 'Spa Tóc Đẹp', img: 'spa.jpg', cat: 'Spa & Làm đẹp', address: 'Ngoài khu dân cư', phone: '0911 000 111', area: '—', registered: '10/10/2026', vouchers: 0, rating: null, status: 'rejected', reason: 'Địa chỉ không nằm gần khu dân cư được hỗ trợ' },
  ],

  // Voucher chờ Admin duyệt – FR-4.2
  reviewVouchers: [
    { id: 'rv1', shop: 'Sunrise Coffee & Tea', img: 'coffee-service.jpg', title: 'Combo bánh + cà phê chỉ 59K', type: 'Đồng giá', value: '59.000đ', scope: 'area', start: '20/10/2026', end: '20/12/2026', max: 80, cat: 'Cà phê & Đồ uống', sent: '10:30 hôm nay', conditions: 'Áp dụng 7h–10h sáng · Mỗi cư dân 1 mã/ngày', status: 'pending', ai: true },
    { id: 'rv2', shop: 'Tiệm Bánh Mì Artisan', img: 'bakery.jpg', title: 'Tặng 1 bánh croissant cho hóa đơn từ 100K', type: 'Tặng món', value: '1 croissant', scope: 'area', start: '22/10/2026', end: '30/11/2026', max: 100, cat: 'Ẩm thực', sent: '09:15 hôm nay', conditions: 'Hóa đơn từ 100.000đ', status: 'pending' },
    { id: 'rv3', shop: 'An Nhiên Spa', img: 'spa.jpg', title: 'Gội đầu dưỡng sinh chỉ 99K', type: 'Đồng giá', value: '99.000đ', scope: 'public', start: '25/10/2026', end: '31/12/2026', max: 50, cat: 'Spa & Làm đẹp', sent: 'Hôm qua 16:45', conditions: 'Đặt lịch trước 1 ngày', status: 'pending' },
    { id: 'rv4', shop: 'GreenMart Siêu Thị Sạch', img: 'minimart.jpg', title: 'Giảm 50.000đ cho đơn từ 200.000đ', type: 'Giảm tiền', value: '50.000đ', scope: 'area', start: '01/10/2026', end: '25/11/2026', max: 200, cat: 'Siêu thị', sent: '30/09/2026', conditions: 'Đơn từ 200.000đ', status: 'approved' },
    { id: 'rv5', shop: 'Sunrise Coffee & Tea', img: 'tea-shop.jpg', title: 'Tặng topping khi mua 2 ly', type: 'Tặng món', value: 'Topping', scope: 'area', start: '01/10/2026', end: '31/10/2026', max: 50, cat: 'Cà phê & Đồ uống', sent: '29/09/2026', conditions: 'Mua từ 2 ly', status: 'removed', reason: 'Nội dung ưu đãi không đúng thực tế' },
    { id: 'rv6', shop: 'Phở Bò Gia Truyền', img: 'pho.jpg', title: 'Giảm 90% tô phở', type: 'Giảm %', value: '90%', scope: 'public', start: '01/10/2026', end: '31/12/2026', max: 1000, cat: 'Ẩm thực', sent: '28/09/2026', conditions: '—', status: 'rejected', reason: 'Mức giảm không thực tế, cần xác minh với cửa hàng' },
  ],
};
