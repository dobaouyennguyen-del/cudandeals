-- CuDanDeals.vn - Kiem thu RLS tren 6 tai khoan mau (chay sau 04_rls.sql)
-- Chay tung khoi mot trong SQL Editor; moi khoi tu rollback nen khong doi du lieu.
-- Cac phep xem voucher bo qua voucher co tieu de bat dau bang [THU] (du lieu cua bai thuc hanh khac).
--
-- Tai khoan                  Vai tro      Khu / cua hang          UUID
-- hoanggiang@gmail.com       Cu dan       Sunrise                 db5d9a9e-77a2-4ee0-9e7b-292aa33fe27c
-- minhtu@gmail.com           Cu dan       Sunrise                 613c0fdf-108e-47e0-ade8-a75d99f6f1d0
-- thanhha@gmail.com          Cu dan       Green Park              993856af-8723-41cc-9157-b057a459ae39
-- sunrisecoffee@gmail.com    Doi tac      Sunrise Coffee & Tea    b32375a7-76ea-4e42-8751-42a3c17092a1
-- artisanbakery@gmail.com    Doi tac      Tiem Banh Mi Artisan    07f9527e-3f6c-40d4-9596-1078112bc55c
-- bql.sunrise@gmail.com      Ban quan ly  Sunrise                 56c1c382-4fa1-4ea5-b03e-6f9f16392089


-- ===== 1. Quy tac xem voucher =====

-- Bai 1.1 Cu dan Sunrise (hoanggiang)
-- Mong doi: 4 dong - Giam 30% toan menu do uong, Giam 20% do uong cuoi tuan, Mua 1 tang 1 Latte size M, Tang 1 banh sung bo.
begin;
set local request.jwt.claims = '{"sub":"db5d9a9e-77a2-4ee0-9e7b-292aa33fe27c","role":"authenticated"}';
set local role authenticated;
select tieu_de, pham_vi, khu_dan_cu_id, trang_thai
  from public.voucher
 where tieu_de not like '[THU]%'
 order by tieu_de;
rollback;

-- Bai 1.2 Cu dan cung khu (minhtu)
-- Mong doi: giong bai 1.1.
begin;
set local request.jwt.claims = '{"sub":"613c0fdf-108e-47e0-ade8-a75d99f6f1d0","role":"authenticated"}';
set local role authenticated;
select tieu_de, pham_vi, khu_dan_cu_id, trang_thai
  from public.voucher
 where tieu_de not like '[THU]%'
 order by tieu_de;
rollback;

-- Bai 1.3 Cu dan Green Park (thanhha)
-- Mong doi: 3 dong - Giam 15% banh mi buoi sang, Giam 20% do uong cuoi tuan, Mua 1 tang 1 Latte size M.
begin;
set local request.jwt.claims = '{"sub":"993856af-8723-41cc-9157-b057a459ae39","role":"authenticated"}';
set local role authenticated;
select tieu_de, pham_vi, khu_dan_cu_id, trang_thai
  from public.voucher
 where tieu_de not like '[THU]%'
 order by tieu_de;
rollback;

-- Bai 1.4 Doi tac Sunrise Coffee & Tea (sunrisecoffee)
-- Mong doi: 6 dong, deu cua Sunrise Coffee & Tea, gom ca cho_duyet, tam_tat, het_han.
begin;
set local request.jwt.claims = '{"sub":"b32375a7-76ea-4e42-8751-42a3c17092a1","role":"authenticated"}';
set local role authenticated;
select tieu_de, pham_vi, khu_dan_cu_id, trang_thai
  from public.voucher
 where tieu_de not like '[THU]%'
 order by tieu_de;
rollback;

-- Bai 1.5 Doi tac Tiem Banh Mi Artisan (artisanbakery)
-- Mong doi: 3 dong, deu cua Tiem Banh Mi Artisan.
begin;
set local request.jwt.claims = '{"sub":"07f9527e-3f6c-40d4-9596-1078112bc55c","role":"authenticated"}';
set local role authenticated;
select tieu_de, pham_vi, khu_dan_cu_id, trang_thai
  from public.voucher
 where tieu_de not like '[THU]%'
 order by tieu_de;
rollback;

-- Bai 1.6 Ban quan ly (bql.sunrise)
-- Mong doi: 9.
begin;
set local request.jwt.claims = '{"sub":"56c1c382-4fa1-4ea5-b03e-6f9f16392089","role":"authenticated"}';
set local role authenticated;
select count(*)
  from public.voucher
 where tieu_de not like '[THU]%';
rollback;


-- ===== 2. Quy tac xem cua hang =====

-- Bai 2.1 Cu dan (hoanggiang)
-- Mong doi: 2 dong - Sunrise Coffee & Tea va Tiem Banh Mi Artisan, cung da_duyet.
begin;
set local request.jwt.claims = '{"sub":"db5d9a9e-77a2-4ee0-9e7b-292aa33fe27c","role":"authenticated"}';
set local role authenticated;
select ten_cua_hang, trang_thai_duyet from public.cua_hang;
rollback;

-- Bai 2.2 Doi tac (sunrisecoffee)
-- Mong doi: 2 dong da_duyet.
begin;
set local request.jwt.claims = '{"sub":"b32375a7-76ea-4e42-8751-42a3c17092a1","role":"authenticated"}';
set local role authenticated;
select ten_cua_hang, trang_thai_duyet from public.cua_hang;
rollback;

-- Bai 2.3 Ban quan ly (bql.sunrise)
-- Mong doi: 2 dong da_duyet.
begin;
set local request.jwt.claims = '{"sub":"56c1c382-4fa1-4ea5-b03e-6f9f16392089","role":"authenticated"}';
set local role authenticated;
select ten_cua_hang, trang_thai_duyet from public.cua_hang;
rollback;


-- ===== 3. Quy tac xem ma uu dai (trang Vi) =====

-- Bai 3.1 Cu dan chi thay ma cua minh (hoanggiang)
-- Mong doi: chi cac ma co cu_dan_id la db5d9a9e-77a2-4ee0-9e7b-292aa33fe27c (gom CDD-HG2026-001).
begin;
set local request.jwt.claims = '{"sub":"db5d9a9e-77a2-4ee0-9e7b-292aa33fe27c","role":"authenticated"}';
set local role authenticated;
select ma_code, cu_dan_id from public.ma_uu_dai;
rollback;

-- Bai 3.2 Cu dan chua co ma (minhtu)
-- Mong doi: 0 dong.
begin;
set local request.jwt.claims = '{"sub":"613c0fdf-108e-47e0-ade8-a75d99f6f1d0","role":"authenticated"}';
set local role authenticated;
select ma_code, cu_dan_id from public.ma_uu_dai;
rollback;

-- Bai 3.3 Cu dan khu khac (thanhha)
-- Mong doi: 1 dong CDD-TH2026-001.
begin;
set local request.jwt.claims = '{"sub":"993856af-8723-41cc-9157-b057a459ae39","role":"authenticated"}';
set local role authenticated;
select ma_code, cu_dan_id from public.ma_uu_dai;
rollback;

-- Bai 3.4 Doi tac chi thay ma thuoc voucher cua cua hang minh (artisanbakery)
-- Mong doi: 1 dong CDD-TH2026-001; khong thay CDD-HG2026-001.
begin;
set local request.jwt.claims = '{"sub":"07f9527e-3f6c-40d4-9596-1078112bc55c","role":"authenticated"}';
set local role authenticated;
select ma_code, cu_dan_id from public.ma_uu_dai;
rollback;


-- ===== 4. Quy tac them voucher cua doi tac =====

-- Bai 4.1 Them voucher cho_duyet cho cua hang cua minh (sunrisecoffee)
-- Mong doi: tra ve 1 dong "Thu RLS" - cho_duyet.
begin;
set local request.jwt.claims = '{"sub":"b32375a7-76ea-4e42-8751-42a3c17092a1","role":"authenticated"}';
set local role authenticated;
insert into public.voucher (cua_hang_id, tieu_de, loai_uu_dai, pham_vi, so_luot_toi_da, trang_thai)
select cua_hang_id, 'Thu RLS', 'giam_phan_tram', 'cong_khai', 10, 'cho_duyet'
  from public.cua_hang
 where ten_cua_hang = 'Sunrise Coffee & Tea'
returning voucher_id, tieu_de, trang_thai;
rollback;

-- Bai 4.2 Them voucher dang_chay (sunrisecoffee)
-- Mong doi: loi new row violates row-level security policy for table "voucher".
begin;
set local request.jwt.claims = '{"sub":"b32375a7-76ea-4e42-8751-42a3c17092a1","role":"authenticated"}';
set local role authenticated;
insert into public.voucher (cua_hang_id, tieu_de, loai_uu_dai, pham_vi, so_luot_toi_da, trang_thai)
select cua_hang_id, 'Thu RLS 2', 'giam_phan_tram', 'cong_khai', 10, 'dang_chay'
  from public.cua_hang
 where ten_cua_hang = 'Sunrise Coffee & Tea';
rollback;

-- Bai 4.3 Them voucher vao cua hang cua nguoi khac (artisanbakery them vao Sunrise Coffee & Tea)
-- Mong doi: loi new row violates row-level security policy for table "voucher".
begin;
set local request.jwt.claims = '{"sub":"07f9527e-3f6c-40d4-9596-1078112bc55c","role":"authenticated"}';
set local role authenticated;
insert into public.voucher (cua_hang_id, tieu_de, loai_uu_dai, pham_vi, so_luot_toi_da, trang_thai)
select cua_hang_id, 'Thu RLS 3', 'giam_phan_tram', 'cong_khai', 10, 'cho_duyet'
  from public.cua_hang
 where ten_cua_hang = 'Sunrise Coffee & Tea';
rollback;


-- ===== 5. Quy tac sua voucher =====

-- Bai 5.1 Ban quan ly sua duoc voucher (bql.sunrise)
-- Mong doi: tra ve 1 dong.
begin;
set local request.jwt.claims = '{"sub":"56c1c382-4fa1-4ea5-b03e-6f9f16392089","role":"authenticated"}';
set local role authenticated;
update public.voucher
   set trang_thai = trang_thai
 where tieu_de = 'Combo bánh + cà phê chỉ 59K'
returning voucher_id, tieu_de, trang_thai;
rollback;

-- Bai 5.2 Doi tac khong sua duoc voucher cua cua hang khac (artisanbakery)
-- Mong doi: 0 dong.
begin;
set local request.jwt.claims = '{"sub":"07f9527e-3f6c-40d4-9596-1078112bc55c","role":"authenticated"}';
set local role authenticated;
update public.voucher
   set trang_thai = trang_thai
 where tieu_de = 'Combo bánh + cà phê chỉ 59K'
returning voucher_id, tieu_de, trang_thai;
rollback;

-- Bai 5.3 Cu dan khong sua duoc voucher (hoanggiang)
-- Mong doi: 0 dong.
begin;
set local request.jwt.claims = '{"sub":"db5d9a9e-77a2-4ee0-9e7b-292aa33fe27c","role":"authenticated"}';
set local role authenticated;
update public.voucher
   set trang_thai = trang_thai
 where tieu_de = 'Giảm 30% toàn menu đồ uống'
returning voucher_id, tieu_de, trang_thai;
rollback;


-- ===== 6. Doi tac tu duyet voucher cua minh =====

-- Bai 6.1 Doi tac chuyen voucher cho_duyet sang dang_chay (sunrisecoffee)
-- Mong doi: bi chan - loi "Doi tac chi duoc bat hoac tat voucher da duyet".
begin;
set local request.jwt.claims = '{"sub":"b32375a7-76ea-4e42-8751-42a3c17092a1","role":"authenticated"}';
set local role authenticated;
update public.voucher
   set trang_thai = 'dang_chay'
 where tieu_de = 'Combo bánh + cà phê chỉ 59K'
returning voucher_id, tieu_de, trang_thai;
rollback;
