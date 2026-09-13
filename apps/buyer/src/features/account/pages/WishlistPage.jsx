import ProductCard from '../../products/components/ProductCard';

const DUMMY_WISHLIST = [
  {
    id: '1',
    name: 'iPhone 16 Pro Max 256GB',
    price: 29490000,
    originalPrice: 34990000,
    rating: 4.8,
    sold: 1200,
    sku: 'TACA-IP16PM-256',
    discount: 16
  },
  {
    id: '2',
    name: 'Tai nghe chụp tai Sony WH-1000XM5',
    price: 7490000,
    originalPrice: 8990000,
    rating: 4.9,
    sold: 450,
    sku: 'TACA-SNY-WH1000XM5',
    discount: 8
  },
  {
    id: '3',
    name: 'MacBook Pro 14 M3 Pro 18GB 512GB',
    price: 48990000,
    originalPrice: 50990000,
    rating: 5.0,
    sold: 210,
    sku: 'TACA-MBP14-M3P',
    discount: 12
  },
];

const WishlistPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[20px] font-extrabold text-taca-text-main m-0">
          SẢN PHẨM YÊU THÍCH <span className="text-gray-400 font-normal text-[14px] ml-2">24 sản phẩm</span>
        </h2>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm trong yêu thích" 
            className="pl-8 pr-4 py-2 border border-taca-border rounded-lg text-[13px] outline-none focus:border-taca-primary w-[240px]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button className="px-4 py-1.5 border border-taca-primary text-taca-primary rounded-full text-[13px] font-semibold bg-blue-50">
          Tất cả 24
        </button>
        <button className="px-4 py-1.5 border border-taca-border text-taca-text-main rounded-full text-[13px] hover:bg-gray-50 transition-colors">
          Đang giảm giá 8
        </button>
        <button className="px-4 py-1.5 border border-taca-border text-taca-text-main rounded-full text-[13px] hover:bg-gray-50 transition-colors">
          Sắp hết hàng 2
        </button>
        <button className="px-4 py-1.5 border border-taca-border text-taca-text-main rounded-full text-[13px] hover:bg-gray-50 transition-colors">
          Theo bộ sưu tập
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {DUMMY_WISHLIST.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      
      {DUMMY_WISHLIST.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Chưa có sản phẩm nào trong danh sách yêu thích
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
