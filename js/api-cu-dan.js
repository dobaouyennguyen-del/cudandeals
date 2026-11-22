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
    .select('*, voucher(*, cua_hang(ten_cua_hang, dia_chi))')
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

/* ===== Hàm phụ cho chuyenVoucher ===== */
// loại ưu đãi trong database → type mà giao diện dùng
const LOAI = { giam_phan_tram: 'percent', giam_tien: 'amount', dong_gia: 'amount', tang_mon: 'gift' };

// '2026-12-31' → '31/12/2026'
function ddmmyyyy(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

// số ngày còn lại tính đến hết ngày ngay_ket_thuc (không có ngày kết thúc → coi như còn lâu)
function soNgayCon(iso) {
  if (!iso) return 999;
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  const homNay = new Date(); homNay.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d) - homNay) / 86400000);
}

// nhãn hiển thị trên thẻ: "GIẢM 30%", "GIẢM 50K", "MUA 1 TẶNG 1"...
function nhanGiam(r) {
  const gt = Number(r.gia_tri) || 0;
  const k = Math.round(gt / 1000) + 'K';
  if (r.loai_uu_dai === 'giam_phan_tram') return `GIẢM ${gt}%`;
  if (r.loai_uu_dai === 'giam_tien') return `GIẢM ${k}`;
  if (r.loai_uu_dai === 'dong_gia') return `ĐỒNG GIÁ ${k}`;
  return /mua\s*1\s*t[aặ]ng\s*1/i.test(r.tieu_de || '') ? 'MUA 1 TẶNG 1' : 'TẶNG QUÀ';
}

export function chuyenVoucher(r, luot, khu = {}) {
  const ch = r.cua_hang || {};
  const conNgay = soNgayCon(r.ngay_ket_thuc);
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
    daysLeft: Math.max(0, conNgay),
    holdHours: r.thoi_han_giu_cho_gio,
    // các trường giao diện còn cần (chưa có cột tương ứng thì dùng giá trị mặc định)
    time: r.khung_gio || 'Cả ngày',
    cond: typeof r.dieu_kien === 'string' ? r.dieu_kien : '',
    desc: r.mo_ta || '',
    conditions: Array.isArray(r.dieu_kien) ? r.dieu_kien : undefined,
    address: ch.dia_chi || '',
    img: r.anh || '',
    rating: Number(r.diem_danh_gia) || 0,
    reviews: Number(r.so_danh_gia) || 0,
    hot: false,
    status: conNgay < 0 ? 'expired' : 'active',
  };
}

/* ===== Bổ sung: nạp dữ liệu cho trang Khám phá + đưa hàm ra window ===== */
// luot_con_lai có thể trả về mảng {voucher_id, luot_con_lai}; chuẩn hóa về { id: số lượt }
function luotTheoId(ids, data) {
  const out = {};
  (Array.isArray(data) ? data : []).forEach((row, i) => {
    if (row && typeof row === 'object') {
      const id = row.voucher_id ?? row.id;
      const val = row.luot_con_lai ?? row.con_lai ?? Object.values(row).find((x) => typeof x === 'number');
      if (id !== undefined) out[id] = Number(val ?? 0);
    } else {
      out[ids[i]] = Number(row);
    }
  });
  return out;
}

// Tìm cột chứa tên ngành (tên cột khác nhau tùy bảng): thử tên quen thuộc, rồi cột có chữ ten/name, cuối cùng là cột chữ đầu tiên không phải id/icon
function tenNganh(r) {
  const quen = ['ten_nganh', 'ten_nganh_hang', 'ten', 'name', 'ten_danh_muc'].find((k) => r[k]);
  if (quen) return r[quen];
  const k2 = Object.keys(r).find((k) => typeof r[k] === 'string' && /ten|name|label/i.test(k));
  if (k2) return r[k2];
  const k3 = Object.keys(r).find((k) => typeof r[k] === 'string' && !/(^|_)id$|icon|bieu_tuong|mau|color|created|updated|ngay/i.test(k));
  return k3 ? r[k3] : '';
}

async function layNganhHang() {
  const { data, error } = await supabase.from('nganh_hang').select('*');
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.nganh_hang_id ?? r.id,
    name: tenNganh(r),
    icon: r.icon ?? r.bieu_tuong ?? 'bi-tag',
  }));
}

export async function taiDuLieuKhamPha() {
  const rows = await layDanhSachVoucher();
  const ids = rows.map((r) => r.voucher_id);
  const [luot, categories] = await Promise.all([ids.length ? layLuotConLai(ids) : [], layNganhHang()]);
  const map = luotTheoId(ids, luot);
  const D = window.CDD_DATA || (window.CDD_DATA = {});   // ghi vào CHÍNH đối tượng này, không tạo đối tượng mới
  D.vouchers = rows.map((r) => chuyenVoucher(r, map[r.voucher_id]));
  D.categories = categories;
  return D;
}

// Trang Chi tiết: nạp danh sách (cho mục "Ưu đãi khác") + một voucher theo id. Trả về null nếu không có/không được xem
export async function taiDuLieuChiTiet(id) {
  const D = await taiDuLieuKhamPha();
  const r = await layVoucher(id);
  if (!r) return null;
  const luot = await layLuotConLai([id]);
  const v = chuyenVoucher(r, luotTheoId([id], luot)[id]);
  const i = D.vouchers.findIndex((x) => x.id === v.id);
  if (i >= 0) D.vouchers[i] = v; else D.vouchers.push(v);
  return v;
}


/* ===== Trang Ví ===== */
// trạng thái mã trong database → tab trong Ví. Mã đã trả (da_tra) hoặc trạng thái khác thì không hiện
const NHOM_MA = { chua_dung: 'unused', het_han: 'expired', da_dung: 'used', da_su_dung: 'used' };

const hai = (n) => String(n).padStart(2, '0');
function ngayGio(iso) {            // '14:30 · 18/10/2026'
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d)) return '';
  return `${hai(d.getHours())}:${hai(d.getMinutes())} · ${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// voucher mà cư dân đã bấm Lưu (bảng voucher_da_luu, RLS chỉ trả của mình); lỗi thì bỏ qua, không làm hỏng cả trang Ví
async function layVoucherDaLuu() {
  try {
    const { data, error } = await supabase.from('voucher_da_luu').select('voucher_id');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('Chưa đọc được voucher đã lưu:', e.message || e);
    return [];
  }
}

// Trả về { saved, unused, used, expired } đúng dạng wallet.html đang dùng
export async function taiVi() {
  const [maRows, D, luu] = await Promise.all([layMaCuaToi(), taiDuLieuKhamPha(), layVoucherDaLuu()]);
  D.offVouchers = D.offVouchers || [];
  const tim = (id) => D.vouchers.find((x) => x.id === id) || D.offVouchers.find((x) => x.id === id);
  const wallet = { saved: [], unused: [], used: [], expired: [] };

  for (const m of maRows) {
    const nhom = NHOM_MA[m.trang_thai];
    if (!nhom) continue;
    const id = m.voucher_id;
    if (!tim(id)) {   // voucher không nằm trong danh sách Khám phá (đã hết hạn/ẩn): dựng từ dữ liệu đi kèm mã
      const r = m.voucher ? { voucher_id: id, ...m.voucher } : { voucher_id: id, tieu_de: 'Voucher không còn hiển thị' };
      D.offVouchers.push(chuyenVoucher(r, 0));
    }
    const base = { v: id, code: m.ma_code, maId: m.ma_uu_dai_id };
    if (nhom === 'unused') {
      const gio = m.han_giu_cho ? Math.ceil((new Date(m.han_giu_cho) - Date.now()) / 3600000) : 0;
      wallet.unused.push({ ...base, holdLeft: Math.max(0, gio) });
    } else if (nhom === 'used') {
      wallet.used.push({ ...base, usedAt: ngayGio(m.ngay_su_dung ?? m.ngay_dung ?? m.ngay_xac_nhan), saved: Number(m.so_tien_tiet_kiem) || 0 });
    } else {
      wallet.expired.push({ ...base, expiredAt: ddmmyyyy(m.han_giu_cho) });
    }
  }
  luu.forEach((x) => { if (tim(x.voucher_id)) wallet.saved.push({ v: x.voucher_id }); });
  return wallet;
}

// components.js và wallet.html gọi window.CDDApi.nhanMa / traMa / dichLoi
window.CDDApi = { nhanMa, traMa, dichLoi };
