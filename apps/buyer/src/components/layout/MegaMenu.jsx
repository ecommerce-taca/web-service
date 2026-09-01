import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MEGA_MENU_DATA } from '../../constants/megaMenuData';

const MegaMenu = ({ isOpen }) => {
  const [activeCategoryId, setActiveCategoryId] = useState(MEGA_MENU_DATA[0].id);

  if (!isOpen) return null;

  const activeCategory = MEGA_MENU_DATA.find((c) => c.id === activeCategoryId);

  return (
    <div className="absolute top-[42px] left-0 w-[840px] min-h-[460px] bg-white rounded-xl shadow-xl flex z-50 border border-taca-border/30 overflow-hidden cursor-default">
      {/* Left Sidebar (Category Rail) */}
      <div className="w-[260px] bg-white border-r border-taca-border/30 py-4 flex flex-col">
        {MEGA_MENU_DATA.map((cat) => {
          const isActive = cat.id === activeCategoryId;
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
                <span className={`text-[12px] ${isActive ? 'text-taca-primary' : 'text-taca-text-muted'}`}>
                  {cat.icon}
                </span>
                <span className={`text-[13px] font-semibold ${isActive ? 'text-taca-primary' : 'text-taca-text-main'}`}>
                  {cat.title}
                </span>
              </div>
              <span className={`text-[12px] ${isActive ? 'text-taca-primary' : 'text-gray-300'}`}>
                ›
              </span>
            </div>
          );
        })}
      </div>

      {/* Right Content */}
      <div className="flex-1 bg-white relative flex flex-col">
        {activeCategory ? (
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-taca-border/30">
              <h3 className="text-[16px] font-bold text-taca-text-main flex items-center gap-2">
                <span className="text-[12px] text-taca-text-main">{activeCategory.icon}</span>
                {activeCategory.title}
              </h3>
              <Link to={`/category/${activeCategory.id}`} className="text-[13px] font-semibold text-taca-primary no-underline hover:underline">
                Xem tất cả →
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
            <div className="mt-8 bg-[#f4f7ff] rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-4 text-[13px] font-bold text-taca-primary">
                <span>✓ Chính hãng 100%</span>
                <span>⚡ Giao nhanh 2H</span>
                <span>↺ Đổi trả 30 ngày</span>
              </div>
              <div className="text-[12px] text-taca-text-muted">
                Taca bảo vệ người mua trong mọi giao dịch.
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
