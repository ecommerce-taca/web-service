import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      {/* Top Header */}
      <div className="py-4 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between gap-8">
          <div className="text-primary m-0 font-extrabold text-[24px]">
            <h2>TACA</h2>
          </div>
          
          <div className="flex-1 max-w-[600px]">
            <div className="flex items-center border border-border rounded-none bg-white h-[40px] focus-within:border-primary">
              <span className="px-2 text-muted text-[16px]">⌕</span>
              <input 
                type="text" 
                placeholder="Bạn tìm gì hôm nay? (iPhone 16...)" 
                className="flex-1 border-none outline-none h-full font-sans text-[14px] text-main bg-transparent placeholder:text-muted" 
              />
              <button className="h-full px-4 bg-surface border-none border-l border-border text-main font-sans font-bold text-[12px] cursor-pointer hover:text-primary transition-colors">
                Tìm kiếm
              </button>
            </div>
          </div>
          
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-1 cursor-pointer text-muted hover:text-primary transition-colors">
              <span className="text-[20px]">⌖</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium leading-tight">Giao đến:</span>
                <span className="text-[14px] font-bold text-main leading-tight">Quận 1, TP.HCM</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 cursor-pointer text-muted hover:text-primary transition-colors">
              <span className="text-[20px]">♙</span>
              <span className="text-[14px] font-bold text-main">Minh Anh ▾</span>
            </div>
            
            <div className="flex items-center gap-1 cursor-pointer text-muted hover:text-primary transition-colors relative">
              <span className="text-[20px]">▣</span>
              <span className="text-[14px] font-bold text-main">Giỏ hàng</span>
              <span className="absolute -top-2 -right-3 bg-sale text-white text-[10px] font-bold px-[6px] py-[2px] rounded-[10px]">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header (simplified for now) */}
      <div className="py-3 md:hidden">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between gap-4">
          <div className="text-primary m-0 font-extrabold text-[20px]">
            <h2>TACA</h2>
          </div>
          <div className="flex-1">
             <div className="flex items-center border border-border bg-surface h-[36px] px-2 w-full">
                <span className="text-muted mr-2">⌕</span>
                <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none w-full text-[13px]" />
             </div>
          </div>
          <div className="relative text-main text-[20px]">
             ▣ <span className="absolute -top-1 -right-2 bg-sale text-white text-[9px] font-bold px-[4px] py-[1px] rounded-[10px]">2</span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-surface hidden md:block">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center gap-8">
          <button className="flex items-center gap-1 bg-transparent border-none py-2 font-bold text-[14px] text-main cursor-pointer hover:text-primary transition-colors">
            ≡ Taca Mega Menu
          </button>
          <nav className="flex gap-4">
            <Link to="/category/dien-thoai" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Điện thoại</Link>
            <Link to="/category/laptop" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Laptop</Link>
            <Link to="/category/nha-sach" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Nhà sách</Link>
            <Link to="/category/gia-dung" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Gia dụng</Link>
            <Link to="/category/lam-dep" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Làm đẹp</Link>
            <Link to="/category/thoi-trang" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Thời trang</Link>
            <Link to="/category/voucher" className="text-[14px] text-main font-medium py-2 hover:text-primary transition-colors">Voucher</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
