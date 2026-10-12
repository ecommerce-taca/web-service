import { useState } from 'react';
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

const MegaMenu = ({ isOpen }) => {
  const [activeCategoryId, setActiveCategoryId] = useState(MEGA_MENU_DATA[0].id);

  if (!isOpen) return null;

  const activeCategory = MEGA_MENU_DATA.find((c) => c.id === activeCategoryId);
  const ActiveIcon = activeCategory ? (CATEGORY_ICONS[activeCategory.id] || Sparkles) : Sparkles;

  return (
    <div className="absolute top-[42px] left-0 w-[820px] min-h-[452px] bg-white rounded-[20px] shadow-xl flex z-50 border border-taca-border/30 overflow-hidden cursor-default">
      {/* Left Sidebar (Category Rail) */}
      <div className="w-[256px] bg-white border-r border-taca-border/30 py-4 flex flex-col">
        {MEGA_MENU_DATA.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          const IconComponent = CATEGORY_ICONS[cat.id] || Sparkles;
          return (
            <div
              key={cat.id}
              className={`relative flex items-center justify-between px-5 py-3 cursor-pointer transition-colors ${
                isActive ? 'bg-[#f8f9fa]' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setActiveCategoryId(cat.id)}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-taca-primary rounded-r-sm" />
              )}
              
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-taca-primary' : 'text-taca-text-muted'}`} />
                <span className={`text-[13px] font-semibold ${isActive ? 'text-taca-primary' : 'text-taca-text-main'}`}>
                  {cat.title}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-taca-primary' : 'text-gray-300'}`} />
            </div>
          );
        })}
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-white relative flex flex-col">
        {activeCategory ? (
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-taca-border/30">
              <h3 className="text-[16px] font-bold text-taca-text-main flex items-center gap-2.5">
                <ActiveIcon className="w-4 h-4 text-taca-primary" />
                <span>{activeCategory.title}</span>
              </h3>
              <Link to={`/category/${activeCategory.id}`} className="text-[13px] font-semibold text-taca-primary no-underline hover:underline flex items-center gap-1">
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 flex-1">
              {activeCategory.subCategories && activeCategory.subCategories.length > 0 ? (
                activeCategory.subCategories.map((sub, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    <h4 className="text-[14px] font-bold text-taca-text-main">{sub.title}</h4>
                    <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                      {sub.items.map((item, i) => (
                        <li key={i}>
                          <Link to={item.path} className="text-[13px] text-taca-text-muted no-underline hover:text-taca-primary transition-colors">
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-[13px] text-gray-400 italic">
                  Danh mục này đang được cập nhật...
                </div>
              )}
            </div>

            {/* Trust Strip */}
            <div className="mt-8 bg-[#f4f7ff] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-5 text-[12px] font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Chính hãng 100%
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Giao nhanh 2H
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  Đổi trả 30 ngày
                </span>
              </div>
              <div className="text-[11px] text-taca-text-muted">
                Taca bảo vệ người mua trong mọi giao dịch với chính sách cam kết chất lượng.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Chọn một danh mục để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
