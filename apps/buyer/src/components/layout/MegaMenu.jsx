import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  Home,
  Tv,
  BookOpen,
  Shirt,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { MEGA_MENU_DATA } from '../../constants/megaMenuData';

const CATEGORY_ICONS = {
  'dien-thoai-tablet': Smartphone,
  'laptop-may-tinh': Laptop,
  'nha-cua-doi-song': Home,
  'tv-dien-may': Tv,
  'nha-sach-taca': BookOpen,
  'thoi-trang': Shirt,
  'lam-dep-suc-khoe': Sparkles,
};

const MegaMenu = ({ isOpen, onClose }) => {
  const [activeCategoryId, setActiveCategoryId] = useState(MEGA_MENU_DATA[0].id);

  if (!isOpen) return null;

  const activeCategory = MEGA_MENU_DATA.find((c) => c.id === activeCategoryId);
  const ActiveIcon = activeCategory ? (CATEGORY_ICONS[activeCategory.id] || Sparkles) : Sparkles;

  return (
    <div
      role="region"
      aria-label="Danh mục sản phẩm mở rộng"
      className="absolute top-[42px] left-0 w-[min(820px,calc(100vw-32px))] min-h-[440px] max-h-[560px] bg-white rounded-2xl shadow-2xl flex z-50 border border-slate-200/90 overflow-hidden cursor-default transition-all"
    >
      {/* Left Sidebar (Category Rail) */}
      <div className="w-[210px] sm:w-[250px] bg-slate-50/70 border-r border-slate-200/70 py-3 flex flex-col shrink-0 overflow-y-auto">
        {MEGA_MENU_DATA.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const IconComponent = CATEGORY_ICONS[cat.id] || Sparkles;
          return (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              className={`relative flex items-center justify-between px-3.5 sm:px-5 py-2.5 cursor-pointer transition-colors select-none ${
                isActive
                  ? 'bg-white text-taca-primary font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
              onMouseEnter={() => setActiveCategoryId(cat.id)}
              onClick={() => setActiveCategoryId(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCategoryId(cat.id);
                }
              }}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-taca-primary rounded-r-sm" />
              )}

              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-taca-primary' : 'text-slate-400'}`} />
                <span className="text-[13px] truncate">
                  {cat.title}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-taca-primary' : 'text-slate-300'}`} />
            </div>
          );
        })}
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-white relative flex flex-col min-w-0 overflow-y-auto">
        {activeCategory ? (
          <div className="p-5 sm:p-7 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <h3 className="text-[15px] sm:text-[16px] font-bold text-slate-900 flex items-center gap-2.5 m-0">
                  <ActiveIcon className="w-4 h-4 text-taca-primary shrink-0" />
                  <span>{activeCategory.title}</span>
                </h3>
                <Link
                  to={`/category/${activeCategory.id}`}
                  onClick={onClose}
                  className="text-[12px] sm:text-[13px] font-semibold text-taca-primary no-underline hover:underline flex items-center gap-1 group"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                  activeCategory.subCategories.map((sub, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 m-0">{sub.title}</h4>
                      <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                        {sub.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              to={item.path}
                              onClick={onClose}
                              className="text-[12px] sm:text-[13px] text-slate-600 no-underline hover:text-taca-primary transition-colors block py-0.5"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-[13px] text-slate-400 italic py-4">
                    Danh mục này đang được cập nhật thêm...
                  </div>
                )}
              </div>
            </div>

            {/* Trust Strip */}
            <div className="mt-6 bg-[#f4f7ff] rounded-xl p-3.5 flex flex-col gap-1.5 border border-indigo-100/60">
              <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-[12px] font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  Chính hãng 100%
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  Giao nhanh 2H
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  Đổi trả 30 ngày
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Taca bảo vệ người mua trong mọi giao dịch với chính sách cam kết chất lượng.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Chọn một danh mục để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
};

MegaMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

MegaMenu.defaultProps = {
  onClose: () => {},
};

export default MegaMenu;
