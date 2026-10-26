-- =====================================================================
-- CuDanDeals.vn - Ham xac nhan ma da dung (BR-8) va tinh luot con lai (BR-5)
-- Cach chay: Supabase > SQL Editor > New query > dan toan bo file > Run.
-- Phai chay SAU 01_schema.sql va 02_ham_nhan_ma.sql.
-- Trinh duyet goi:
--   supabase.rpc('xac_nhan_ma', { p_ma_code: 'CDD-XXXXXXXX', p_tong_hoa_don: 120000, p_so_tien_tiet_kiem: 20000 })
--   supabase.rpc('luot_con_lai', { p_voucher_ids: ['<voucher_id>', ...] })
-- =====================================================================

-- ---------- 1. Xac nhan ma da dung (BR-8) ----------
-- Chi doi tac so huu cua hang cua voucher moi duoc xac nhan.
create or replace function public.xac_nhan_ma(
  p_ma_code           text,
  p_tong_hoa_don      numeric default null,
  p_so_tien_tiet_kiem numeric default null
)
returns public.ma_uu_dai
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_nguoi     public.nguoi_dung%rowtype;
  v_cua_hang  uuid;
  v_ma        public.ma_uu_dai%rowtype;
  v_cua_hang_voucher uuid;
begin
  if v_uid is null then
    raise exception 'Can dang nhap de xac nhan ma' using errcode = 'P0001';
  end if;

  -- Phai la doi tac dang hoat dong
  select * into v_nguoi from public.nguoi_dung where user_id = v_uid;
  if not found or v_nguoi.vai_tro <> 'doi_tac' then
    raise exception 'Chi tai khoan doi tac moi xac nhan duoc ma' using errcode = 'P0001';
  end if;
  if v_nguoi.trang_thai = 'bi_khoa' then
    raise exception 'Tai khoan dang bi khoa' using errcode = 'P0001';
  end if;

  -- Cua hang cua doi tac phai da duoc duyet
  select cua_hang_id into v_cua_hang
    from public.cua_hang
   where chu_so_huu_id = v_uid and trang_thai_duyet = 'da_duyet';
  if v_cua_hang is null then
    raise exception 'Cua hang chua duoc duyet' using errcode = 'P0001';
  end if;

  if p_tong_hoa_don is not null and p_tong_hoa_don < 0 then
    raise exception 'Tong hoa don khong hop le' using errcode = 'P0001';
  end if;
  if p_so_tien_tiet_kiem is not null and p_so_tien_tiet_kiem < 0 then
    raise exception 'So tien tiet kiem khong hop le' using errcode = 'P0001';
  end if;

  -- Khoa dong ma de hai nguoi khong cung xac nhan mot ma
  select * into v_ma
    from public.ma_uu_dai
   where ma_code = upper(trim(p_ma_code))
     for update;
  if not found then
    raise exception 'Khong tim thay ma' using errcode = 'P0001';
  end if;

  -- BR-8: ma phai thuoc voucher cua cua hang nay
  select cua_hang_id into v_cua_hang_voucher
    from public.voucher where voucher_id = v_ma.voucher_id;
  if v_cua_hang_voucher is distinct from v_cua_hang then
    raise exception 'Ma khong thuoc cua hang cua ban' using errcode = 'P0001';
  end if;

  if v_ma.trang_thai = 'da_dung' then
    raise exception 'Ma da duoc su dung' using errcode = 'P0001';
  end if;
  if v_ma.trang_thai <> 'chua_dung' then
    raise exception 'Ma khong con hieu luc' using errcode = 'P0001';
  end if;
  if v_ma.han_giu_cho <= now() then
    raise exception 'Ma da het han giu cho' using errcode = 'P0001';
  end if;

  update public.ma_uu_dai
     set trang_thai        = 'da_dung',
         thoi_diem_dung    = now(),
         tong_hoa_don      = p_tong_hoa_don,
         so_tien_tiet_kiem = p_so_tien_tiet_kiem
   where ma_uu_dai_id = v_ma.ma_uu_dai_id
   returning * into v_ma;

  return v_ma;
end;
$$;

-- ---------- 2. Luot con lai (BR-5) ----------
-- con lai = so_luot_toi_da - ma da_dung - ma chua_dung con han giu cho
-- Nhan mot mang voucher_id de danh sach voucher chi can goi 1 lan.
-- Chi tra ve voucher ma nguoi goi duoc phep thay: dang chay / het luot,
-- hoac voucher cua cua hang minh, hoac nguoi goi la ban quan ly.
create or replace function public.luot_con_lai(p_voucher_ids uuid[])
returns table (voucher_id uuid, luot_con_lai integer)
language sql
stable
security definer
set search_path = ''
as $$
  select v.voucher_id,
         greatest(
           v.so_luot_toi_da
           - count(m.ma_uu_dai_id) filter (where m.trang_thai = 'da_dung')
           - count(m.ma_uu_dai_id) filter (where m.trang_thai = 'chua_dung' and m.han_giu_cho > now()),
           0
         )::integer
    from public.voucher v
    left join public.ma_uu_dai m on m.voucher_id = v.voucher_id
   where v.voucher_id = any (p_voucher_ids)
     and (
           v.trang_thai in ('dang_chay', 'het_luot')
        or exists (select 1 from public.cua_hang c
                    where c.cua_hang_id = v.cua_hang_id
                      and c.chu_so_huu_id = (select auth.uid()))
        or exists (select 1 from public.nguoi_dung n
                    where n.user_id = (select auth.uid())
                      and n.vai_tro = 'ban_quan_ly')
         )
   group by v.voucher_id, v.so_luot_toi_da;
$$;

-- ---------- 3. Quyen goi ham ----------
revoke execute on function public.xac_nhan_ma(text, numeric, numeric) from public, anon;
revoke execute on function public.luot_con_lai(uuid[])                from public, anon;
grant  execute on function public.xac_nhan_ma(text, numeric, numeric) to authenticated;
grant  execute on function public.luot_con_lai(uuid[])                to authenticated;
