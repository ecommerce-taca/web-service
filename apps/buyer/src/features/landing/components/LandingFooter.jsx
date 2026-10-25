import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Banknote, Check, CreditCard, Landmark, Package, QrCode, Truck, Wallet, Zap } from 'lucide-react';
import {
  LEGAL_INFO,
  PAYMENT_PARTNERS,
  SECTION_IDS,
  SHIPPING_PARTNERS,
} from '../constants/landingContent';
import { TONES } from '../constants/tones';
import { tacaLogoUrl as tacaLogo } from '../assets/tacaLogo';

const PARTNER_ICONS = {
  wallet: Wallet,
  bank: Landmark,
  card: CreditCard,
  qr: QrCode,
  cod: Banknote,
  standard: Truck,
  express: Zap,
  economy: Package,
};

// Link tải app Android lấy từ biến môi trường; chưa cấu hình thì nút chưa dẫn đi đâu
const ANDROID_APP_URL = import.meta.env.VITE_ANDROID_APP_URL || '#android';

const footerLink = 'py-1.5 text-sm text-slate-600 no-underline hover:text-indigo-700';
const storeBadge =
  'store-badge inline-flex cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-white px-3.5 py-2.5 text-left text-slate-900 no-underline shadow-[inset_0_0_0_2px_#e2e8f0]';
const legalCard = 'flex flex-col gap-3.5 rounded-[20px] bg-white p-6 shadow-[inset_0_0_0_1.5px_#eef2ff]';

// Logo thương hiệu Android / Apple (lucide-react không có biểu tượng thương hiệu)
function AndroidMark() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="#3ddc84"
        d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="#0f172a"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      />
    </svg>
  );
}

function PartnerTiles({ partners }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {partners.map((partner) => {
        const Icon = PARTNER_ICONS[partner.id];
        const tone = TONES[partner.tone];
        return (
          <span
            key={partner.id}
            title={partner.label}
            className="partner inline-flex h-14 w-[104px] flex-col items-center justify-center gap-1 rounded-xl bg-white shadow-[inset_0_0_0_1.5px_#e2e8f0]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: tone.background }}>
              <Icon size={18} strokeWidth={2.2} color={tone.stroke} aria-hidden="true" />
            </span>
            <span className="text-[11px] font-bold text-slate-600">{partner.label}</span>
          </span>
        );
      })}
    </div>
  );
}

PartnerTiles.propTypes = {
  partners: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, tone: PropTypes.string.isRequired })
  ).isRequired,
};

export default function LandingFooter({ onOpenIosDialog }) {
  return (
    <footer className="bg-slate-50 text-slate-600">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8 px-6 pb-8 pt-14">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col items-center gap-2.5 self-start">
            <span className="inline-flex rounded-xl bg-white px-3.5 py-2.5">
              <img src={tacaLogo} alt="Taca" className="block h-8 w-auto" />
            </span>
            <span className="whitespace-nowrap text-center text-base font-bold leading-[1.45] tracking-[-0.01em] text-slate-900">
              Mua an tâm
              <br />
              Bán thuận lợi
            </span>
          </div>
        </div>
        <nav aria-label="Mua sắm" className="flex flex-col gap-1">
          <span className="pb-1.5 text-sm font-bold text-slate-900">Mua sắm</span>
          <Link to="/" className={footerLink}>Trang chủ cửa hàng</Link>
          <Link to="/category" className={footerLink}>Danh mục</Link>
          <Link to="/account/vouchers" className={footerLink}>Voucher</Link>
        </nav>
        <nav aria-label="Người bán" className="flex flex-col gap-1">
          <span className="pb-1.5 text-sm font-bold text-slate-900">Người bán</span>
          <a href={`#${SECTION_IDS.sell}`} className={footerLink}>Bán hàng cùng Taca</a>
          <a href={`#${SECTION_IDS.fees}`} className={footerLink}>Biểu phí</a>
          <Link to="/seller" className={footerLink}>Seller Center</Link>
        </nav>
        <nav aria-label="Hỗ trợ" className="flex flex-col gap-1">
          <span className="pb-1.5 text-sm font-bold text-slate-900">Hỗ trợ</span>
          <a href={`#${SECTION_IDS.faq}`} className={footerLink}>Trung tâm trợ giúp</a>
          <a href={`#${SECTION_IDS.faq}`} className={footerLink}>Đổi trả</a>
          <span className="py-1.5 text-sm text-slate-600">Điều khoản</span>
          <span className="py-1.5 text-sm text-slate-600">Bảo mật</span>
        </nav>
        <div className="flex flex-col items-start gap-2.5">
          <span className="pb-1.5 text-sm font-bold text-slate-900">Tải ứng dụng</span>
          <a href={ANDROID_APP_URL} className={storeBadge}>
            <AndroidMark />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-slate-500">Tải ứng dụng cho</span>
              <span className="text-[15px] font-bold">Android</span>
            </span>
          </a>
          <button type="button" onClick={onOpenIosDialog} aria-haspopup="dialog" className={storeBadge}>
            <AppleMark />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-slate-500">Sắp ra mắt trên</span>
              <span className="text-[15px] font-bold">iOS</span>
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 px-6 pb-6 pt-2">
        <div aria-label="Đối tác" className={legalCard}>
          <span className="text-sm font-bold text-slate-900">Đối tác thanh toán</span>
          <PartnerTiles partners={PAYMENT_PARTNERS} />
          <span className="text-sm font-bold text-slate-900">Đối tác vận chuyển</span>
          <PartnerTiles partners={SHIPPING_PARTNERS} />
        </div>
        <div aria-label="Giấy phép kinh doanh" className={legalCard}>
          <span className="text-sm font-bold text-slate-900">Giấy phép kinh doanh</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            {/* Logo mẫu: thay bằng logo chính thức và link hồ sơ từ online.gov.vn sau khi đăng ký */}
            <span
              aria-label="Đã đăng ký Bộ Công Thương"
              className="partner inline-flex items-center gap-2.5 rounded-xl bg-blue-50 py-2.5 pl-2.5 pr-3.5 shadow-[inset_0_0_0_1.5px_#bfdbfe]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-700">
                <Check size={20} strokeWidth={2.4} color="#ffffff" aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-tight text-blue-700">
                <span className="text-[15px] font-extrabold">ĐÃ ĐĂNG KÝ</span>
                <span className="text-xs font-bold">BỘ CÔNG THƯƠNG</span>
              </span>
            </span>
            <span className="max-w-[220px] text-xs leading-normal text-slate-500">
              Logo mẫu. Thay bằng logo chính thức từ online.gov.vn.
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.55] text-slate-600">
            <li>
              Giấy chứng nhận ĐKDN số <b className="text-slate-900">{LEGAL_INFO.businessRegistrationNumber}</b> do{' '}
              <b className="text-slate-900">{LEGAL_INFO.issuedBy}</b> cấp ngày{' '}
              <b className="text-slate-900">{LEGAL_INFO.issuedDate}</b>.
            </li>
            <li>
              Sàn giao dịch TMĐT đã đăng ký với Bộ Công Thương, mã hồ sơ{' '}
              <b className="text-slate-900">{LEGAL_INFO.ecommerceRegistrationCode}</b>.
            </li>
            <li>
              Người chịu trách nhiệm nội dung: <b className="text-slate-900">{LEGAL_INFO.contentOwner}</b>.
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-5 text-[13px] text-slate-500">{LEGAL_INFO.copyright}</div>
    </footer>
  );
}

LandingFooter.propTypes = {
  onOpenIosDialog: PropTypes.func.isRequired,
};
