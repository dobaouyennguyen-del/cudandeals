-- CuDanDeals.vn - Row Level Security theo ma tran phan quyen
-- Chay sau: schema, ham nhan ma, ham xac nhan ma va luot con lai. Co the chay lai nhieu lan.

-- Ham tro giup
create or replace function public.la_ban_quan_ly()
 returns boolean
 language sql
 stable security definer
 set search_path to ''
as $function$
  select exists (
    select 1 from public.nguoi_dung
     where user_id = (select auth.uid())
       and vai_tro = 'ban_quan_ly'
       and trang_thai = 'hoat_dong'
  );
$function$;

create or replace function public.cua_hang_cua_toi(p_chi_da_duyet boolean default false)
 returns uuid
 language sql
 stable security definer
 set search_path to ''
as $function$
  select c.cua_hang_id
    from public.cua_hang c
    join public.nguoi_dung n on n.user_id = c.chu_so_huu_id
   where c.chu_so_huu_id = (select auth.uid())
     and (not p_chi_da_duyet
          or (c.trang_thai_duyet = 'da_duyet' and n.trang_thai = 'hoat_dong'));
$function$;

create or replace function public.rls_vai_tro()
returns text language sql stable security definer set search_path = '' as $$
  select vai_tro from public.nguoi_dung
   where user_id = (select auth.uid()) and trang_thai = 'hoat_dong'
$$;

create or replace function public.rls_khu()
returns text language sql stable security definer set search_path = '' as $$
  select khu_dan_cu_id from public.nguoi_dung where user_id = (select auth.uid())
$$;

create or replace function public.rls_cua_hang()
returns uuid language sql stable security definer set search_path = '' as $$
  select cua_hang_id from public.cua_hang where chu_so_huu_id = (select auth.uid())
$$;

create or replace function public.rls_da_nhan_hoac_luu(p_voucher_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ma_uu_dai
                  where voucher_id = p_voucher_id and cu_dan_id = (select auth.uid()))
      or exists (select 1 from public.voucher_da_luu
                  where voucher_id = p_voucher_id and cu_dan_id = (select auth.uid()))
$$;

create or replace function public.rls_voucher_cua_toi(p_voucher_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.voucher v
                  where v.voucher_id = p_voucher_id
                    and v.cua_hang_id = public.rls_cua_hang())
$$;

create or replace function public.rls_ma_cua_toi(p_ma_uu_dai_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ma_uu_dai
                  where ma_uu_dai_id = p_ma_uu_dai_id and cu_dan_id = (select auth.uid()))
$$;

create or replace function public.rls_ma_da_dung_cua_toi(p_ma_uu_dai_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ma_uu_dai
                  where ma_uu_dai_id = p_ma_uu_dai_id
                    and cu_dan_id = (select auth.uid()) and trang_thai = 'da_dung')
$$;

create or replace function public.rls_ma_thuoc_cua_hang_toi(p_ma_uu_dai_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.ma_uu_dai m
                   join public.voucher v on v.voucher_id = m.voucher_id
                  where m.ma_uu_dai_id = p_ma_uu_dai_id
                    and v.cua_hang_id = public.rls_cua_hang())
$$;

-- Ham nghiep vu
create or replace function public.bat_tat_voucher(p_voucher_id uuid, p_bat boolean)
 returns voucher
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_cua_hang uuid := public.cua_hang_cua_toi(true);
  v_voucher  public.voucher%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Can dang nhap' using errcode = 'P0001';
  end if;
  if v_cua_hang is null then
    raise exception 'Cua hang chua duoc duyet' using errcode = 'P0001';
  end if;

  select * into v_voucher from public.voucher
   where voucher_id = p_voucher_id and cua_hang_id = v_cua_hang
     for update;
  if not found then
    raise exception 'Khong tim thay voucher' using errcode = 'P0001';
  end if;
  if v_voucher.trang_thai not in ('dang_chay', 'tam_tat') then
    raise exception 'Chi bat tat duoc voucher dang chay hoac tam tat' using errcode = 'P0001';
  end if;

  update public.voucher
     set trang_thai = case when p_bat then 'dang_chay' else 'tam_tat' end
   where voucher_id = p_voucher_id
   returning * into v_voucher;
  return v_voucher;
end;
$function$;

create or replace function public.khoa_tai_khoan(p_user_id uuid, p_khoa boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select public.rls_vai_tro()) is distinct from 'ban_quan_ly' then
    raise exception 'Chi Ban quan ly moi khoa duoc tai khoan' using errcode = 'P0001';
  end if;
  update public.nguoi_dung
     set trang_thai = case when p_khoa then 'bi_khoa' else 'hoat_dong' end
   where user_id = p_user_id and vai_tro <> 'ban_quan_ly';
  if not found then
    raise exception 'Khong tim thay tai khoan hoac khong duoc khoa tai khoan nay' using errcode = 'P0001';
  end if;
end;
$$;

-- Ham trigger
create or replace function public.bao_ve_cap_nhat_cua_hang()
returns trigger language plpgsql set search_path = '' as $$
begin
  if public.rls_vai_tro() = 'doi_tac' then
    if new.trang_thai_duyet is distinct from old.trang_thai_duyet
       or new.ly_do_tu_choi   is distinct from old.ly_do_tu_choi
       or new.chu_so_huu_id   is distinct from old.chu_so_huu_id
       or new.ngay_dang_ky    is distinct from old.ngay_dang_ky then
      raise exception 'Doi tac khong duoc sua trang thai duyet cua ho so' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.bao_ve_cap_nhat_voucher()
returns trigger language plpgsql set search_path = '' as $$
begin
  if public.rls_vai_tro() = 'doi_tac' then
    if new.cua_hang_id is distinct from old.cua_hang_id
       or new.ngay_duyet is distinct from old.ngay_duyet
       or new.ngay_tao   is distinct from old.ngay_tao then
      raise exception 'Doi tac khong duoc sua cua hang hoac ngay duyet cua voucher' using errcode = 'P0001';
    end if;
    if new.trang_thai is distinct from old.trang_thai
       and not ((old.trang_thai = 'dang_chay' and new.trang_thai = 'tam_tat')
             or (old.trang_thai = 'tam_tat'   and new.trang_thai = 'dang_chay')) then
      raise exception 'Doi tac chi duoc bat hoac tat voucher da duyet' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.rls_chan_tai_khoan_bi_khoa()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is not null and exists (
       select 1 from public.nguoi_dung
        where user_id = (select auth.uid()) and trang_thai = 'bi_khoa') then
    raise exception 'Tai khoan dang bi khoa' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function public.bao_ve_cap_nhat_danh_gia()
returns trigger language plpgsql set search_path = '' as $$
declare v_vai_tro text := public.rls_vai_tro();
begin
  if new.ma_uu_dai_id is distinct from old.ma_uu_dai_id then
    raise exception 'Khong duoc doi ma cua danh gia' using errcode = 'P0001';
  end if;
  if v_vai_tro = 'cu_dan' then
    if new.phan_hoi is distinct from old.phan_hoi or new.ngay_phan_hoi is distinct from old.ngay_phan_hoi then
      raise exception 'Cu dan khong duoc sua phan hoi cua doi tac' using errcode = 'P0001';
    end if;
  elsif v_vai_tro = 'doi_tac' then
    if new.so_sao is distinct from old.so_sao or new.noi_dung is distinct from old.noi_dung
       or new.ngay_danh_gia is distinct from old.ngay_danh_gia then
      raise exception 'Doi tac khong duoc sua noi dung danh gia' using errcode = 'P0001';
    end if;
    if old.phan_hoi is not null then
      raise exception 'Moi danh gia chi duoc phan hoi mot lan' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- Quyen goi ham
revoke execute on function public.rls_vai_tro()                   from public, anon;
revoke execute on function public.rls_khu()                       from public, anon;
revoke execute on function public.rls_cua_hang()                  from public, anon;
revoke execute on function public.rls_da_nhan_hoac_luu(uuid)      from public, anon;
revoke execute on function public.rls_voucher_cua_toi(uuid)       from public, anon;
revoke execute on function public.rls_ma_cua_toi(uuid)            from public, anon;
revoke execute on function public.rls_ma_da_dung_cua_toi(uuid)    from public, anon;
revoke execute on function public.rls_ma_thuoc_cua_hang_toi(uuid) from public, anon;
revoke execute on function public.khoa_tai_khoan(uuid, boolean)   from public, anon;

grant execute on function public.rls_vai_tro()                    to authenticated;
grant execute on function public.rls_khu()                        to authenticated;
grant execute on function public.rls_cua_hang()                   to authenticated;
grant execute on function public.rls_da_nhan_hoac_luu(uuid)       to authenticated;
grant execute on function public.rls_voucher_cua_toi(uuid)        to authenticated;
grant execute on function public.rls_ma_cua_toi(uuid)             to authenticated;
grant execute on function public.rls_ma_da_dung_cua_toi(uuid)     to authenticated;
grant execute on function public.rls_ma_thuoc_cua_hang_toi(uuid)  to authenticated;
grant execute on function public.khoa_tai_khoan(uuid, boolean)    to authenticated;

-- Policy: nguoi_dung
drop policy if exists "bql doc nguoi dung" on public.nguoi_dung;
create policy "bql doc nguoi dung" on public.nguoi_dung for select to authenticated
  using ((select public.rls_vai_tro()) = 'ban_quan_ly');

-- Policy: cua_hang
drop policy if exists "ban quan ly doc cua hang" on public.cua_hang;
create policy "ban quan ly doc cua hang" on public.cua_hang for select to authenticated
  using ((select public.la_ban_quan_ly()));

drop policy if exists "ban quan ly sua cua hang" on public.cua_hang;
create policy "ban quan ly sua cua hang" on public.cua_hang for update to authenticated
  using ((select public.la_ban_quan_ly()))
  with check ((select public.la_ban_quan_ly()));

drop policy if exists "doi tac doc cua hang cua minh" on public.cua_hang;
create policy "doi tac doc cua hang cua minh" on public.cua_hang for select to authenticated
  using (chu_so_huu_id = (select auth.uid()));

drop policy if exists "doi tac tao cua hang cua minh" on public.cua_hang;
create policy "doi tac tao cua hang cua minh" on public.cua_hang for insert to authenticated
  with check (
    chu_so_huu_id = (select auth.uid())
    and trang_thai_duyet = 'cho_duyet'
    and exists (select 1 from public.nguoi_dung
                 where user_id = (select auth.uid()) and vai_tro = 'doi_tac')
  );

drop policy if exists "cu dan xem cua hang da duyet" on public.cua_hang;
create policy "cu dan xem cua hang da duyet" on public.cua_hang for select to authenticated
  using (trang_thai_duyet = 'da_duyet');

drop policy if exists "doi tac sua cua hang cua minh" on public.cua_hang;
create policy "doi tac sua cua hang cua minh" on public.cua_hang for update to authenticated
  using ((select public.rls_vai_tro()) = 'doi_tac' and chu_so_huu_id = (select auth.uid()))
  with check ((select public.rls_vai_tro()) = 'doi_tac' and chu_so_huu_id = (select auth.uid()));

-- Policy: voucher
drop policy if exists "ban quan ly doc voucher" on public.voucher;
create policy "ban quan ly doc voucher" on public.voucher for select to authenticated
  using ((select public.la_ban_quan_ly()));

drop policy if exists "ban quan ly sua voucher" on public.voucher;
create policy "ban quan ly sua voucher" on public.voucher for update to authenticated
  using ((select public.la_ban_quan_ly()))
  with check ((select public.la_ban_quan_ly()));

drop policy if exists "doi tac doc voucher cua minh" on public.voucher;
create policy "doi tac doc voucher cua minh" on public.voucher for select to authenticated
  using (cua_hang_id = (select public.cua_hang_cua_toi()));

drop policy if exists "doi tac tao voucher cho duyet" on public.voucher;
create policy "doi tac tao voucher cho duyet" on public.voucher for insert to authenticated
  with check (
    cua_hang_id = (select public.cua_hang_cua_toi(true))
    and trang_thai = 'cho_duyet'
    and ngay_duyet is null
  );

drop policy if exists "cu dan xem voucher dang hien" on public.voucher;
create policy "cu dan xem voucher dang hien" on public.voucher for select to authenticated
  using (
    (select public.rls_vai_tro()) = 'cu_dan'
    and trang_thai in ('dang_chay', 'het_luot')
    and (ngay_bat_dau  is null or ngay_bat_dau  <= current_date)
    and (ngay_ket_thuc is null or ngay_ket_thuc >= current_date)
    and (pham_vi = 'cong_khai' or khu_dan_cu_id = (select public.rls_khu()))
  );

drop policy if exists "cu dan xem voucher da nhan hoac luu" on public.voucher;
create policy "cu dan xem voucher da nhan hoac luu" on public.voucher for select to authenticated
  using ((select public.rls_vai_tro()) = 'cu_dan' and public.rls_da_nhan_hoac_luu(voucher_id));

drop policy if exists "doi tac sua voucher cua minh" on public.voucher;
create policy "doi tac sua voucher cua minh" on public.voucher for update to authenticated
  using ((select public.rls_vai_tro()) = 'doi_tac'
         and cua_hang_id = (select public.rls_cua_hang()))
  with check ((select public.rls_vai_tro()) = 'doi_tac'
         and cua_hang_id = (select public.rls_cua_hang()));

-- Policy: voucher_da_luu
drop policy if exists "cu dan xem voucher da luu" on public.voucher_da_luu;
create policy "cu dan xem voucher da luu" on public.voucher_da_luu for select to authenticated
  using ((select public.rls_vai_tro()) = 'cu_dan' and cu_dan_id = (select auth.uid()));

drop policy if exists "cu dan luu voucher" on public.voucher_da_luu;
create policy "cu dan luu voucher" on public.voucher_da_luu for insert to authenticated
  with check ((select public.rls_vai_tro()) = 'cu_dan' and cu_dan_id = (select auth.uid()));

drop policy if exists "cu dan bo luu voucher" on public.voucher_da_luu;
create policy "cu dan bo luu voucher" on public.voucher_da_luu for delete to authenticated
  using ((select public.rls_vai_tro()) = 'cu_dan' and cu_dan_id = (select auth.uid()));

-- Policy: ma_uu_dai
drop policy if exists "doi tac doc ma cua cua hang minh" on public.ma_uu_dai;
create policy "doi tac doc ma cua cua hang minh" on public.ma_uu_dai for select to authenticated
  using (exists (select 1 from public.voucher v
                  where v.voucher_id = ma_uu_dai.voucher_id
                    and v.cua_hang_id = (select public.cua_hang_cua_toi())));

drop policy if exists "cu dan xem ma cua minh" on public.ma_uu_dai;
create policy "cu dan xem ma cua minh" on public.ma_uu_dai for select to authenticated
  using (cu_dan_id = (select auth.uid()));

-- Policy: danh_gia
drop policy if exists "moi nguoi xem danh gia" on public.danh_gia;
create policy "moi nguoi xem danh gia" on public.danh_gia for select to authenticated
  using (true);

drop policy if exists "cu dan danh gia ma da dung" on public.danh_gia;
create policy "cu dan danh gia ma da dung" on public.danh_gia for insert to authenticated
  with check ((select public.rls_vai_tro()) = 'cu_dan' and public.rls_ma_da_dung_cua_toi(ma_uu_dai_id));

drop policy if exists "cu dan sua danh gia cua minh" on public.danh_gia;
create policy "cu dan sua danh gia cua minh" on public.danh_gia for update to authenticated
  using ((select public.rls_vai_tro()) = 'cu_dan' and public.rls_ma_cua_toi(ma_uu_dai_id))
  with check ((select public.rls_vai_tro()) = 'cu_dan' and public.rls_ma_cua_toi(ma_uu_dai_id));

drop policy if exists "cu dan xoa danh gia cua minh" on public.danh_gia;
create policy "cu dan xoa danh gia cua minh" on public.danh_gia for delete to authenticated
  using ((select public.rls_vai_tro()) = 'cu_dan' and public.rls_ma_cua_toi(ma_uu_dai_id));

drop policy if exists "doi tac phan hoi danh gia" on public.danh_gia;
create policy "doi tac phan hoi danh gia" on public.danh_gia for update to authenticated
  using ((select public.rls_vai_tro()) = 'doi_tac' and public.rls_ma_thuoc_cua_hang_toi(ma_uu_dai_id))
  with check ((select public.rls_vai_tro()) = 'doi_tac' and public.rls_ma_thuoc_cua_hang_toi(ma_uu_dai_id));

-- Policy: thong_bao
drop policy if exists "xem thong bao cua minh" on public.thong_bao;
create policy "xem thong bao cua minh" on public.thong_bao for select to authenticated
  using (nguoi_nhan_id = (select auth.uid()));

drop policy if exists "danh dau da doc" on public.thong_bao;
create policy "danh dau da doc" on public.thong_bao for update to authenticated
  using (nguoi_nhan_id = (select auth.uid()))
  with check (nguoi_nhan_id = (select auth.uid()));
revoke update on public.thong_bao from authenticated, anon;
grant  update (da_doc) on public.thong_bao to authenticated;

drop policy if exists "bql tao thong bao" on public.thong_bao;
create policy "bql tao thong bao" on public.thong_bao for insert to authenticated
  with check ((select public.rls_vai_tro()) = 'ban_quan_ly');

-- Trigger
drop trigger if exists bao_ve_cap_nhat_cua_hang on public.cua_hang;
create trigger bao_ve_cap_nhat_cua_hang before update on public.cua_hang
  for each row execute function public.bao_ve_cap_nhat_cua_hang();

drop trigger if exists bao_ve_cap_nhat_voucher on public.voucher;
create trigger bao_ve_cap_nhat_voucher before update on public.voucher
  for each row execute function public.bao_ve_cap_nhat_voucher();

drop trigger if exists rls_chan_tai_khoan_bi_khoa on public.voucher;
create trigger rls_chan_tai_khoan_bi_khoa before insert or update on public.voucher
  for each row execute function public.rls_chan_tai_khoan_bi_khoa();

drop trigger if exists bao_ve_cap_nhat_danh_gia on public.danh_gia;
create trigger bao_ve_cap_nhat_danh_gia before update on public.danh_gia
  for each row execute function public.bao_ve_cap_nhat_danh_gia();
