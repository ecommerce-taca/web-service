import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Search } from 'lucide-react';
import { SECTION_IDS } from '../constants/landingContent';
import tacaLogo from '../assets/taca-logo.png';
import { searchUrl, storeUrl } from '../constants/links';

const SHOP_LINKS = [
  { to: '/category/dien-thoai', title: 'Điện thoại & Máy tính bảng', hint: 'Chính hãng từ shop xác minh' },
  { to: '/category/laptop', title: 'Laptop & Máy tính', hint: 'Làm việc, học tập, gaming' },
  { to: '/category/gia-dung', title: 'Nhà cửa & Đời sống', hint: 'Đồ gia dụng, trang trí' },
];

function NavChevron() {
  return <ChevronDown className="nav-chev" size={14} strokeWidth={2.4} aria-hidden="true" />;
}

export default function LandingHeader({ activeSection, isScrolled, showMiniSearch }) {
  const [miniQuery, setMiniQuery] = useState('');

  const handleMiniSearch = (event) => {
    event.preventDefault();
    const keyword = miniQuery.trim();
    window.location.assign(searchUrl(keyword));
  };

  const navClass = (sectionId) => `nav-link ${activeSection === sectionId ? 'active' : ''}`;

  return (
    <header className={`site-head sticky top-0 z-50 ${isScrolled ? 'scrolled' : ''}`}>
      <div className="spectrum-bar" aria-hidden="true" />
      <div className="head-in mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-3 px-6 py-4 md:gap-x-6">
        <a href={`#${SECTION_IDS.top}`} aria-label="Taca, trang chủ" className="inline-flex items-center py-1">
          <img className="head-logo block w-auto" src={tacaLogo} alt="Taca" />
        </a>

        <nav
          aria-label="Chính"
          className="order-last -mx-3 flex w-full flex-nowrap items-center gap-x-1.5 overflow-x-auto md:order-none md:mx-0 md:w-auto md:flex-auto md:flex-wrap md:gap-y-1 md:overflow-visible"
        >
          <div className="nav-item">
            <a className={navClass(SECTION_IDS.shop)} href={`#${SECTION_IDS.shop}`}>
              Mua sắm
              <NavChevron />
            </a>
            <div className="nav-panel grid min-w-[500px] grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="px-3 pb-1.5 pt-1 text-[13px] font-bold text-slate-500">Danh mục nổi bật</span>
                {SHOP_LINKS.map((link) => (
                  <a key={link.to} className="panel-link" href={storeUrl(link.to)}>
                    <span className="text-[15px] font-bold">{link.title}</span>
                    <span className="text-[13px] font-normal text-slate-500">{link.hint}</span>
                  </a>
                ))}
                <a className="panel-link" href={storeUrl('/category')}>
                  <span className="text-[15px] font-bold text-indigo-700">Xem tất cả danh mục</span>
                  <span className="text-[13px] font-normal text-slate-500">Tìm theo nhu cầu của bạn</span>
                </a>
              </div>
              <div className="flex flex-col gap-2.5">
                <a
                  href={storeUrl('/')}
                  className="flex flex-col gap-1 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-4 text-slate-900 no-underline"
                >
                  <span className="text-base font-extrabold text-rose-700">Flash sale</span>
                  <span className="text-[13px] text-slate-600">Giá tốt mỗi ngày, số lượng có hạn</span>
                </a>
                <a
                  href={storeUrl('/account/vouchers')}
                  className="flex flex-col gap-1 rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 p-4 text-slate-900 no-underline"
                >
                  <span className="text-base font-extrabold text-indigo-700">Voucher</span>
                  <span className="text-[13px] text-slate-600">Mã giảm giá của sàn và của shop</span>
                </a>
              </div>
            </div>
          </div>

          <div className="nav-item">
            <a className={navClass(SECTION_IDS.sell)} href={`#${SECTION_IDS.sell}`}>
              Bán hàng cùng Taca
              <NavChevron />
            </a>
            <div className="nav-panel flex min-w-[320px] flex-col gap-0.5">
              <a className="panel-link" href={`#${SECTION_IDS.sell}`}>
                <span className="text-[15px] font-bold">Vì sao bán trên Taca</span>
                <span className="text-[13px] font-normal text-slate-500">Tiếp cận người mua trên cả nước</span>
              </a>
              <a className="panel-link" href={`#${SECTION_IDS.fees}`}>
                <span className="text-[15px] font-bold">Biểu phí</span>
                <span className="text-[13px] font-normal text-slate-500">Hoa hồng, thuế và rút tiền</span>
              </a>
              <a
                href={storeUrl('/account/seller-register')}
                className="press grad-fill mt-2 rounded-xl px-[18px] py-3 text-center text-[15px] font-bold no-underline"
              >
                Mở shop ngay
              </a>
            </div>
          </div>

          <div className="nav-item">
            <a className={navClass(SECTION_IDS.faq)} href={`#${SECTION_IDS.faq}`}>
              Hỗ trợ
              <NavChevron />
            </a>
            <div className="nav-panel flex min-w-[300px] flex-col gap-0.5">
              <a className="panel-link" href={`#${SECTION_IDS.faq}`}>
                <span className="text-[15px] font-bold">Câu hỏi thường gặp</span>
                <span className="text-[13px] font-normal text-slate-500">Mua hàng, thanh toán, mở shop</span>
              </a>
              <a className="panel-link" href={`#${SECTION_IDS.faq}`}>
                <span className="text-[15px] font-bold">Đổi trả &amp; hoàn tiền</span>
                <span className="text-[13px] font-normal text-slate-500">Chính sách và cách gửi yêu cầu</span>
              </a>
              <a className="panel-link" href="#ask">
                <span className="text-[15px] font-bold">Liên hệ hỗ trợ</span>
                <span className="text-[13px] font-normal text-slate-500">[HOTLINE] · [EMAIL HỖ TRỢ]</span>
              </a>
            </div>
          </div>
        </nav>

        {showMiniSearch && (
          <form
            className="mini-search hidden min-w-[180px] md:flex flex-[0_1_280px] items-center gap-1.5 rounded-xl bg-slate-100 py-1 pl-3 pr-1"
            role="search"
            onSubmit={handleMiniSearch}
          >
            <label htmlFor="landing-mini-q" className="sr-only">Tìm sản phẩm</label>
            <input
              id="landing-mini-q"
              type="search"
              value={miniQuery}
              onChange={(event) => setMiniQuery(event.target.value)}
              placeholder="Tìm sản phẩm…"
              className="min-w-0 flex-auto border-0 bg-transparent py-2 text-sm text-slate-900 outline-none"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="press grad-fill flex h-9 w-9 cursor-pointer items-center justify-center rounded-[9px] border-0"
            >
              <Search size={16} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </form>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-3 md:ml-0">
          {/* Đăng nhập/đăng ký nằm ở cửa hàng (modal của buyer), landing chỉ dẫn sang đó */}
          <a
            href={storeUrl('/')}
            className="press rounded-[10px] px-2 py-3 text-[15px] font-semibold text-slate-900 no-underline sm:px-4"
          >
            Đăng nhập
          </a>
          <a
            href={storeUrl('/')}
            className="press grad-fill rounded-[10px] px-4 py-3 text-[15px] font-bold no-underline sm:px-5"
          >
            Đăng ký
          </a>
        </div>
      </div>
    </header>
  );
}

LandingHeader.propTypes = {
  activeSection: PropTypes.string.isRequired,
  isScrolled: PropTypes.bool.isRequired,
  showMiniSearch: PropTypes.bool.isRequired,
};
