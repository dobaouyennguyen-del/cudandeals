-- =====================================================================
-- CuDanDeals.vn - Ham nhan ma va tra lai ma (BR-2 den BR-10)
-- Cach chay: Supabase > SQL Editor > New query > dan toan bo file > Run.
-- Trinh duyet goi: supabase.rpc('nhan_ma', { p_voucher_id: '...' })
--                  supabase.rpc('tra_ma',  { p_ma_uu_dai_id: '...' })
-- Chua co quy tac cho sau khi tra ma (nhom chua ban).
-- =====================================================================

-- ---------- 1. Nhan ma (giu cho) ----------
create or replace function public.nhan_ma(p_voucher_id uuid)
returns public.ma_uu_dai
language plpgsql
security definer          -- chay voi quyen chu so huu ham, bo qua RLS: moi kiem tra nam trong ham nay
set search_path = ''      -- bat buoc voi security definer, tranh bi danh lua ten bang
as $$
declare
  v_uid       uuid := auth.uid();
  v_nguoi     public.nguoi_dung%rowtype;
  v_voucher   public.voucher%rowtype;
  v_da_dung   integer;
  v_dang_giu  integer;
  v_con_lai   integer;
  v_cuoi_ngay timestamptz;
  v_han       timestamptz;
  v_ma        public.ma_uu_dai%rowtype;
  v_code      text;
  v_lan       integer := 0;
begin
  -- 0. Phai dang nhap
  if v_uid is null then
    raise exception 'Can dang nhap de nhan ma' using errcode = 'P0001';
  end if;

  -- BR-10: chi cu dan dang hoat dong moi nhan duoc ma
  select * into v_nguoi from public.nguoi_dung where user_id = v_uid;
  if not found or v_nguoi.vai_tro <> 'cu_dan' then
    raise exception 'Chi tai khoan cu dan moi nhan duoc ma' using errcode = 'P0001';
  end if;
  if v_nguoi.trang_thai = 'bi_khoa' then
    raise exception 'Tai khoan dang bi khoa' using errcode = 'P0001';
  end if;

  -- BR-9: khoa dong voucher. Hai nguoi cung bam se xep hang, nguoi sau doi nguoi truoc xong.
  select * into v_voucher from public.voucher where voucher_id = p_voucher_id for update;
  if not found then
    raise exception 'Khong tim thay voucher' using errcode = 'P0001';
  end if;

  -- Voucher phai dang chay va con trong thoi gian ap dung (BR-13)
  if v_voucher.trang_thai <> 'dang_chay' then
    raise exception 'Voucher hien khong nhan duoc' using errcode = 'P0001';
  end if;
  if v_voucher.ngay_bat_dau is not null and current_date < v_voucher.ngay_bat_dau then
    raise exception 'Voucher chua den ngay ap dung' using errcode = 'P0001';
  end if;
  if v_voucher.ngay_ket_thuc is not null and current_date > v_voucher.ngay_ket_thuc then
    raise exception 'Voucher da het han' using errcode = 'P0001';
  end if;

  -- BR-12: voucher rieng khu chi danh cho cu dan cua khu do
  if v_voucher.pham_vi = 'rieng_khu'
     and v_voucher.khu_dan_cu_id is distinct from v_nguoi.khu_dan_cu_id then
    raise exception 'Voucher chi danh cho cu dan khu khac' using errcode = 'P0001';
  end if;

  -- Don ma qua han giu cho cua chinh nguoi nay (neu khong, chi muc BR-2 se chan nham)
  update public.ma_uu_dai
     set trang_thai = 'het_han'
   where cu_dan_id = v_uid and trang_thai = 'chua_dung' and han_giu_cho <= now();

  -- BR-2: da giu ma con han cua voucher nay thi khong nhan them
  if exists (select 1 from public.ma_uu_dai
              where cu_dan_id = v_uid and voucher_id = p_voucher_id
                and trang_thai = 'chua_dung') then
    raise exception 'Ban da giu ma cua voucher nay' using errcode = 'P0001';
  end if;

  -- BR-3: toi da 10 ma chua dung va chua het han giu cho
  if (select count(*) from public.ma_uu_dai
       where cu_dan_id = v_uid and trang_thai = 'chua_dung') >= 10 then
    raise exception 'Ban dang giu toi da 10 ma chua dung' using errcode = 'P0001';
  end if;

  -- BR-5, BR-6: luot con lai = toi da - da dung - dang giu con han
  select count(*) filter (where trang_thai = 'da_dung'),
         count(*) filter (where trang_thai = 'chua_dung' and han_giu_cho > now())
    into v_da_dung, v_dang_giu
    from public.ma_uu_dai where voucher_id = p_voucher_id;
  v_con_lai := v_voucher.so_luot_toi_da - v_da_dung - v_dang_giu;
  if v_con_lai <= 0 then
    raise exception 'Voucher da het luot' using errcode = 'P0001';
  end if;

  -- BR-4: han giu cho = bay gio + thoi han do doi tac dat, khong vuot het ngay cuoi cua voucher
  v_han := now() + make_interval(hours => v_voucher.thoi_han_giu_cho_gio);
  if v_voucher.ngay_ket_thuc is not null then
    v_cuoi_ngay := ((v_voucher.ngay_ket_thuc + 1)::timestamp) at time zone 'Asia/Ho_Chi_Minh';
    v_han := least(v_han, v_cuoi_ngay);
  end if;

  -- Sinh ma dang CDD-XXXXXXXX, thu lai neu trung (cot ma_code la unique)
  loop
    v_code := 'CDD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (select 1 from public.ma_uu_dai where ma_code = v_code);
    v_lan := v_lan + 1;
    if v_lan > 10 then
      raise exception 'Khong sinh duoc ma, thu lai' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.ma_uu_dai (ma_code, cu_dan_id, voucher_id, han_giu_cho)
  values (v_code, v_uid, p_voucher_id, v_han)
  returning * into v_ma;

  return v_ma;
end;
$$;

-- ---------- 2. Tra lai ma (BR-7) ----------
create or replace function public.tra_ma(p_ma_uu_dai_id uuid)
returns public.ma_uu_dai
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_ma  public.ma_uu_dai%rowtype;
begin
  if v_uid is null then
    raise exception 'Can dang nhap' using errcode = 'P0001';
  end if;

  -- Khoa dong ma; dieu kien cu_dan_id = v_uid dam bao chi tra duoc ma cua chinh minh
  select * into v_ma from public.ma_uu_dai
   where ma_uu_dai_id = p_ma_uu_dai_id and cu_dan_id = v_uid for update;
  if not found then
    raise exception 'Khong tim thay ma' using errcode = 'P0001';
  end if;
  if v_ma.trang_thai <> 'chua_dung' then
    raise exception 'Chi tra lai duoc ma chua dung' using errcode = 'P0001';
  end if;
  if v_ma.han_giu_cho <= now() then
    update public.ma_uu_dai set trang_thai = 'het_han' where ma_uu_dai_id = v_ma.ma_uu_dai_id;
    raise exception 'Ma da het han giu cho' using errcode = 'P0001';
  end if;

  update public.ma_uu_dai set trang_thai = 'da_tra'
   where ma_uu_dai_id = v_ma.ma_uu_dai_id
   returning * into v_ma;
  return v_ma;
end;
$$;

-- ---------- 3. Quyen goi ham ----------
-- Mac dinh Postgres cho moi nguoi goi ham. Thu hoi, chi de nguoi da dang nhap goi.
revoke execute on function public.nhan_ma(uuid) from public, anon;
revoke execute on function public.tra_ma(uuid)  from public, anon;
grant  execute on function public.nhan_ma(uuid) to authenticated;
grant  execute on function public.tra_ma(uuid)  to authenticated;
