-- =====================================================================
-- CuDanDeals.vn - Luoc do co so du lieu (Supabase / Postgres)
-- Nhom N13, IE104. Ban dau: 27/10/2026.
-- Cach chay: Supabase > SQL Editor > New query > dan toan bo file > Run.
-- Ten bang va cot dung snake_case khong dau (Postgres tu doi chu hoa
-- thanh chu thuong, nen camelCase cua ERD duoc doi: hoTen -> ho_ten).
-- =====================================================================

-- ---------- 1. Danh muc ----------
create table public.khu_dan_cu (
  khu_dan_cu_id text primary key,              -- ma ngan, vi du: sunrise
  ten_khu       text not null,
  dia_chi       text,
  ngay_tao      timestamptz not null default now()
);

create table public.nganh_hang (
  nganh_hang_id text primary key,              -- vi du: coffee
  ten_nganh     text not null,
  icon          text
);

-- ---------- 2. Nguoi dung (ho so, gan voi tai khoan dang nhap cua Supabase) ----------
create table public.nguoi_dung (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  ho_ten              text,
  anh_dai_dien        text,
  email               text unique,
  so_dien_thoai       text,
  vai_tro             text not null default 'cu_dan'
                      check (vai_tro in ('cu_dan', 'doi_tac', 'ban_quan_ly')),
  trang_thai          text not null default 'hoat_dong'
                      check (trang_thai in ('hoat_dong', 'bi_khoa')),
  khu_dan_cu_id       text references public.khu_dan_cu (khu_dan_cu_id),
  xem_thong_bao_luc   timestamptz,
  ngay_tao            timestamptz not null default now()
);

-- ---------- 3. Cua hang ----------
create table public.cua_hang (
  cua_hang_id         uuid primary key default gen_random_uuid(),
  chu_so_huu_id       uuid not null unique references public.nguoi_dung (user_id),
  nganh_hang_id       text references public.nganh_hang (nganh_hang_id),
  ten_cua_hang        text not null,
  dia_chi             text,
  hotline             text,
  ten_nguoi_dai_dien  text,
  sdt_nguoi_dai_dien  text,
  mo_ta               text,
  anh                 text,
  vi_do               double precision,
  kinh_do             double precision,
  trang_thai_duyet    text not null default 'cho_duyet'
                      check (trang_thai_duyet in ('cho_duyet', 'da_duyet', 'tu_choi')),
  ly_do_tu_choi       text,
  ngay_dang_ky        timestamptz not null default now()
);

-- ---------- 4. Voucher ----------
create table public.voucher (
  voucher_id            uuid primary key default gen_random_uuid(),
  cua_hang_id           uuid not null references public.cua_hang (cua_hang_id),
  nganh_hang_id         text references public.nganh_hang (nganh_hang_id),  -- BR-11: co the khac nganh cua cua hang
  khu_dan_cu_id         text references public.khu_dan_cu (khu_dan_cu_id),
  pham_vi               text not null default 'cong_khai'
                        check (pham_vi in ('cong_khai', 'rieng_khu')),
  tieu_de               text not null,
  mo_ta                 text,
  dieu_kien             text,
  loai_uu_dai           text check (loai_uu_dai in ('giam_phan_tram', 'giam_tien', 'tang_mon', 'dong_gia')),
  gia_tri               numeric,
  ngay_bat_dau          date,
  ngay_ket_thuc         date,
  so_luot_toi_da        integer not null check (so_luot_toi_da > 0),
  thoi_han_giu_cho_gio  integer not null default 48
                        check (thoi_han_giu_cho_gio between 6 and 72),      -- do doi tac dat (gioi han 6-72h la de xuat, can chot)
  trang_thai            text not null default 'cho_duyet'
                        check (trang_thai in ('cho_duyet', 'dang_chay', 'tam_tat', 'het_han', 'het_luot', 'bi_go', 'tu_choi')),
  dia_chi_chi_nhanh     text,
  tao_bang_ai           boolean not null default false,
  anh                   text,
  ngay_duyet            timestamptz,
  ngay_tao              timestamptz not null default now(),
  -- voucher rieng khu bat buoc co khu; voucher cong khai khong gan khu
  constraint voucher_pham_vi_khu check (
    (pham_vi = 'rieng_khu' and khu_dan_cu_id is not null)
    or (pham_vi = 'cong_khai' and khu_dan_cu_id is null)
  )
);
-- Luu y: khong luu so_luot_da_nhan. So luot con lai duoc tinh (BR-5):
--   con lai = so_luot_toi_da - so ma da_dung - so ma chua_dung chua het han giu cho

-- ---------- 5. Hanh dong cua cu dan ----------
create table public.voucher_da_luu (
  cu_dan_id   uuid not null references public.nguoi_dung (user_id) on delete cascade,
  voucher_id  uuid not null references public.voucher (voucher_id) on delete cascade,
  ngay_luu    timestamptz not null default now(),
  primary key (cu_dan_id, voucher_id)          -- FR-3.3: moi cu dan luu 1 lan cho moi voucher
);

create table public.ma_uu_dai (
  ma_uu_dai_id      uuid primary key default gen_random_uuid(),
  ma_code           text not null unique,      -- vi du CDD-HG2026-001, sinh o ham nhan ma
  cu_dan_id         uuid not null references public.nguoi_dung (user_id),
  voucher_id        uuid not null references public.voucher (voucher_id),
  ngay_nhan         timestamptz not null default now(),
  han_giu_cho       timestamptz not null,      -- BR-4: ngay_nhan + thoi han giu cho, khong vuot han voucher
  trang_thai        text not null default 'chua_dung'
                    check (trang_thai in ('chua_dung', 'da_dung', 'het_han', 'da_tra')),
  thoi_diem_dung    timestamptz,
  tong_hoa_don      numeric,
  so_tien_tiet_kiem numeric
);
-- BR-2: moi cu dan chi co 1 ma dang hoat dong cho moi voucher
create unique index ma_uu_dai_mot_ma_dang_giu
  on public.ma_uu_dai (cu_dan_id, voucher_id)
  where trang_thai = 'chua_dung';
create index ma_uu_dai_theo_voucher on public.ma_uu_dai (voucher_id, trang_thai);
create index ma_uu_dai_theo_cu_dan on public.ma_uu_dai (cu_dan_id, trang_thai);

create table public.danh_gia (
  danh_gia_id   uuid primary key default gen_random_uuid(),
  ma_uu_dai_id  uuid not null unique references public.ma_uu_dai (ma_uu_dai_id),  -- FR-7.1
  so_sao        integer not null check (so_sao between 1 and 5),
  noi_dung      text,
  ngay_danh_gia timestamptz not null default now(),
  phan_hoi      text,
  ngay_phan_hoi timestamptz
);

create table public.thong_bao (
  thong_bao_id  uuid primary key default gen_random_uuid(),
  nguoi_nhan_id uuid not null references public.nguoi_dung (user_id) on delete cascade,
  loai          text check (loai in ('voucher_moi', 'sap_het_han', 'ho_so_duyet', 'ho_so_moi')),
  noi_dung      text,
  lien_ket      text,
  da_doc        boolean not null default false,
  thoi_gian     timestamptz not null default now()
);

-- ---------- 6. Tu tao ho so khi co nguoi dang ky ----------
-- Trinh duyet gui kem thong tin khi dang ky (options.data):
--   ho_ten, vai_tro ('cu_dan' | 'doi_tac'), khu_dan_cu_id, so_dien_thoai
-- Vai tro ban_quan_ly KHONG the tu chon: chi gan thu cong trong SQL Editor.
create or replace function public.tao_ho_so_nguoi_dung()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.nguoi_dung (user_id, email, ho_ten, so_dien_thoai, vai_tro, khu_dan_cu_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'ho_ten',
    new.raw_user_meta_data ->> 'so_dien_thoai',
    case when new.raw_user_meta_data ->> 'vai_tro' = 'doi_tac' then 'doi_tac' else 'cu_dan' end,
    nullif(new.raw_user_meta_data ->> 'khu_dan_cu_id', '')
  );
  return new;
end;
$$;

create trigger khi_dang_ky_tao_ho_so
  after insert on auth.users
  for each row execute function public.tao_ho_so_nguoi_dung();

-- ---------- 7. Bao mat co ban (RLS) ----------
-- Day chi la muc toi thieu de dang ky/dang nhap chay duoc.
-- Cac quy tac con lai viet theo ma tran phan quyen (muc 9.1), viec cua Thanh Thao.
alter table public.khu_dan_cu     enable row level security;
alter table public.nganh_hang     enable row level security;
alter table public.nguoi_dung     enable row level security;
alter table public.cua_hang       enable row level security;
alter table public.voucher        enable row level security;
alter table public.voucher_da_luu enable row level security;
alter table public.ma_uu_dai      enable row level security;
alter table public.danh_gia       enable row level security;
alter table public.thong_bao      enable row level security;

-- Danh sach khu va nganh: ai cung doc duoc (can cho man dang ky)
create policy "doc khu dan cu" on public.khu_dan_cu for select to anon, authenticated using (true);
create policy "doc nganh hang" on public.nganh_hang for select to anon, authenticated using (true);

-- Moi nguoi doc va sua ho so cua chinh minh
create policy "doc ho so cua minh" on public.nguoi_dung for select to authenticated
  using (user_id = (select auth.uid()));
create policy "sua ho so cua minh" on public.nguoi_dung for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Chan tu nang quyen: nguoi dung chi duoc sua cac cot ho so, khong sua vai_tro, trang_thai, email
revoke update on public.nguoi_dung from authenticated, anon;
grant update (ho_ten, anh_dai_dien, so_dien_thoai, khu_dan_cu_id, xem_thong_bao_luc)
  on public.nguoi_dung to authenticated;
