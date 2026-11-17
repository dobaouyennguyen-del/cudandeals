// js/api-cu-dan.js
import { supabase } from './supabase-config.js';

// Trang Khám phá: voucher cư dân được phép thấy (RLS tự lọc khu, trạng thái, thời hạn)
export async function layDanhSachVoucher() {
  const { data, error } = await supabase
    .from('voucher')
    .select('*, cua_hang(ten_cua_hang, dia_chi)')
    .order('ngay_ket_thuc');
  if (error) throw error;
  return data;
}

// Số lượt còn lại cho một danh sách voucher
export async function layLuotConLai(ids) {
  const { data, error } = await supabase.rpc('luot_con_lai', { p_voucher_ids: ids });
  if (error) throw error;
  return data; // [{ voucher_id, luot_con_lai }, ...]
}

// Trang Chi tiết: đọc một voucher theo id
export async function layVoucher(voucherId) {
  const { data, error } = await supabase
    .from('voucher')
    .select('*, cua_hang(ten_cua_hang, dia_chi, hotline)')
    .eq('voucher_id', voucherId)
    .maybeSingle();
  if (error) throw error;
  return data; // null nếu không tồn tại hoặc cư dân không được phép xem
}

export async function nhanMa(voucherId) {
  const { data, error } = await supabase.rpc('nhan_ma', { p_voucher_id: voucherId });
  if (error) throw error;
  return data;
}

// Trang Ví: mã của chính người dùng (RLS chỉ trả mã của mình), kèm voucher và cửa hàng
export async function layMaCuaToi() {
  const { data, error } = await supabase
    .from('ma_uu_dai')
    .select('*, voucher(tieu_de, loai_uu_dai, gia_tri, anh, cua_hang(ten_cua_hang, dia_chi))')
    .order('ngay_nhan', { ascending: false });
  if (error) throw error;
  return data;
}

export async function traMa(maId) {
  const { data, error } = await supabase.rpc('tra_ma', { p_ma_uu_dai_id: maId });
  if (error) throw error;
  return data;
}

const LOI = [
  ['Ban da giu ma cua voucher nay', 'Bạn đã giữ mã của voucher này. Xem trong Ví voucher.'],
  ['Voucher da het luot', 'Voucher đã hết lượt nhận.'],
  ['Voucher hien khong nhan duoc', 'Voucher hiện không nhận được mã.'],
  ['Ban dang giu toi da 10 ma chua dung', 'Bạn đang giữ tối đa 10 mã chưa dùng. Hãy dùng hoặc trả bớt mã.'],
  // ... các lỗi còn lại của nhan_ma và tra_ma
];
export function dichLoi(err) {
  const msg = (err && err.message) || '';
  const t = LOI.find(([khoa]) => msg.includes(khoa));
  return t ? t[1] : 'Có lỗi xảy ra. Vui lòng thử lại.';
}

export function chuyenVoucher(r, luot, khu = {}) {
  const ch = r.cua_hang || {};
  return {
    id: r.voucher_id,
    type: LOAI[r.loai_uu_dai] || 'gift',
    pct: r.loai_uu_dai === 'giam_phan_tram' ? Number(r.gia_tri) : 0,
    total: r.so_luot_toi_da,
    left: luot ?? 0,
    shop: ch.ten_cua_hang || '',
    cat: r.nganh_hang_id,
    badge: nhanGiam(r),
    title: r.tieu_de,
    scope: r.pham_vi === 'rieng_khu' ? 'area' : 'public',
    end: ddmmyyyy(r.ngay_ket_thuc),
    daysLeft: soNgayCon(r.ngay_ket_thuc),
    holdHours: r.thoi_han_giu_cho_gio,
    // ... các trường còn lại (địa chỉ, điều kiện, mô tả)
  };
}
