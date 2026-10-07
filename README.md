# CuDanDeals.vn – Frontend (Phase 2: giao diện)

HTML + CSS + JavaScript + **Bootstrap 5** (đúng NFR-6). Dữ liệu hiện là **dữ liệu mẫu** (`js/mock-data.js`) — Phase 3 thay bằng Firebase.
Mở file `.html` bằng Chrome để xem (cần Internet để tải Bootstrap, icon, font, Chart.js, qrcode.js từ CDN).
**Tài liệu thiết kế (Link Design – mốc M1):** `design/index.html` – Design Hub gồm màu, chữ, thành phần, sitemap, luồng chính và thư viện toàn bộ màn hình.
**Ảnh toàn bộ màn hình:** mở `design/capture.html` bằng Chrome (trên GitHub Pages) → *Bắt đầu chụp* → tải file ZIP → kéo ảnh vào Figma.
**Khi chụp bằng html.to.design:** thêm `fx=off` vào link (VD `index.html?fx=off`, `wallet.html?tab=used&fx=off`) để tắt hiệu ứng hiện dần, tránh phần chưa cuộn tới bị trống.

## Cấu trúc
```
css/style.css        Design tokens (xanh #2563EB, cam #EA580C, Be Vietnam Pro) + thành phần dùng chung
js/layout.js         Header/footer theo vai trò: <body data-role="public|resident|partner|admin" data-active="...">
js/mock-data.js      Dữ liệu mẫu (cùng cấu trúc Firestore dự kiến)
js/components.js     Thẻ voucher, popup mã ưu đãi, hộp xác nhận, toast
js/charts.js         Cấu hình biểu đồ Chart.js dùng chung
js/map.js            Sơ đồ khu dân cư + đường đi bộ + link chỉ đường (FR-3.6) dùng chung
design/              Design Hub (index.html), công cụ chụp màn hình (capture.html), danh sách màn (screens.js)
assets/img/          Ảnh minh họa đã nén (~70KB/ảnh, NFR-3)
```

## Danh sách màn hình (27 màn + popup)
| Mã | Màn | File | Trạng thái để chụp (html.to.design) |
|---|---|---|---|
| P-01 | Trang chủ | `index.html` | |
| P-02 | Đăng nhập | `login.html` | `?next=deal` (yêu cầu đăng nhập) · `?google=new` (email Google chưa đăng ký) |
| P-03 | Đăng ký | `register.html` | `?step=2&role=resident` · `?step=2&role=partner` |
| P-04 | Quên mật khẩu | `forgot-password.html` | `?sent=1` |
| R-01 | Khám phá ưu đãi | `pages/resident/explore.html` | ngăn kéo tóm tắt khi rê chuột: `?hover=v1` · hiện hết 15 thẻ (bỏ nút Xem thêm): `?all=1` · lọc nhanh: `?quick=exp3` · bộ lọc trên điện thoại: `?filter=open` |
| R-01b | Khám phá – chế độ Bản đồ (FR-3.6) | `pages/resident/explore-map.html` | chọn sẵn quán: `?shop=Phở Bò Gia Truyền` · nút "Danh sách \| Bản đồ" chuyển qua lại với R-01 |
| R-02 | Chi tiết voucher (có sơ đồ vị trí quán, phút đi bộ, Chỉ đường) | `pages/resident/voucher-detail.html` | `?id=v1` · popup mã: `?id=v1&code=1` · mở từ Ví: `&from=wallet` · hết mã `?id=v16` · hết hạn `?id=v90` · bị gỡ `?id=v91` (dải ảnh chạy ngang tự tắt khi có `fx=off`) |
| R-03 | Ví voucher (vé nằm ngang, "Bạn đã tiết kiệm được" FR-3.9; bấm dòng → chi tiết; mở sẵn chi tiết tiết kiệm `?savings=open`) | `pages/resident/wallet.html` | `?tab=saved|unused|used|expired` · popup đánh giá: `?tab=used&review=1` |
| R-04 | Đánh giá của tôi | `pages/resident/my-reviews.html` | |
| B-00/01 | Tổng quan đối tác | `pages/partner/dashboard.html` | chờ duyệt: `?pending=1` |
| B-02 | Hồ sơ cửa hàng | `pages/partner/store-profile.html` | |
| B-03 | Danh sách voucher | `pages/partner/voucher-list.html` | `?tab=pending|active|paused|soldout|expired|removed` |
| B-04 | Tạo voucher (AI) | `pages/partner/create-voucher.html` | bấm "Tự động điền form" |
| B-05 | Xác nhận mã | `pages/partner/confirm-redeem.html` | `?result=ok` · `?result=fail` |
| B-06 | Thống kê hiệu quả | `pages/partner/statistics.html` | |
| B-07 | Đánh giá từ cư dân | `pages/partner/reviews.html` | |
| A-01 | Tổng quan BQL | `pages/admin/dashboard.html` | |
| A-02 | Quản lý cư dân | `pages/admin/residents.html` | |
| A-03 | Quản lý & duyệt đối tác | `pages/admin/partners.html` | `?tab=pending` · hồ sơ: `?review=pt3` |
| A-04 | Duyệt / gỡ voucher | `pages/admin/approve-vouchers.html` | |
| A-05 | Báo cáo & thống kê | `pages/admin/reports.html` | |
| A-06 | Quản lý khu dân cư | `pages/admin/residential-areas.html` | |
| A-07 | Quản lý ngành hàng | `pages/admin/categories.html` | |
| C-01 | Hồ sơ cá nhân / Tài khoản & mật khẩu | `pages/common/profile.html` | `?role=partner|admin` · popup đổi mật khẩu: `?pw=1` |
| C-02 | Thông báo | `pages/common/notifications.html` | `?role=partner|admin` |

## Mã demo ở B-05
`CDD-HG2026-001` hợp lệ (xác nhận lần 2 sẽ báo đã dùng) · `CDD-MT2026-002` đã dùng · `CDD-HG2026-009` hết hạn

## Việc của Phase 3
Firebase Auth (đăng ký/đăng nhập/quên mật khẩu), Firestore thay `mock-data.js`, phân quyền theo vai trò (`js/auth.js`),
Cloud Function gọi AI cho FR-5.1 (không để API key ở trình duyệt – NFR-4), quét QR bằng camera (FR-2.8).
