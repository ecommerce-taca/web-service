import { Link, useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import SortBar from '../components/SortBar';
import ProductCard from '../../products/components/ProductCard';

// Mock Data cho lưới sản phẩm
const SEARCH_MOCK_DATA = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max',
    price: 29490000,
    rating: 4.6,
    soldCount: 120,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    price: 27990000,
    rating: 4.7,
    soldCount: 194,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5',
    price: 7490000,
    rating: 4.8,
    soldCount: 268,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 4,
    name: 'Xiaomi Robot Vacuum',
    price: 8990000,
    rating: 4.9,
    soldCount: 342,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 5,
    name: 'Kindle Paperwhite',
    price: 3990000,
    rating: 4.6,
    soldCount: 416,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 6,
    name: 'JBL Flip 6',
    price: 2490000,
    rating: 4.7,
    soldCount: 490,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 7,
    name: 'Galaxy Tab S9',
    price: 16990000,
    rating: 4.8,
    soldCount: 564,
    tags: ['Chính hãng', 'Freeship']
  },
  {
    id: 8,
    name: 'Logitech MX Keys',
    price: 2190000,
    rating: 4.9,
    soldCount: 638,
    tags: ['Chính hãng', 'Freeship']
  }
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <div className="max-w-[1440px] mx-auto px-[80px] py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[12px] font-semibold text-taca-text-muted mb-6">
        <Link to="/" className="text-taca-text-muted no-underline hover:text-taca-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-taca-text-main">Kết quả tìm kiếm</span>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-[24px] font-extrabold text-taca-text-main m-0 mb-1">
          {query ? (
            <>Kết quả tìm kiếm cho <span className="text-taca-primary">"{query}"</span></>
          ) : (
            'Tất cả sản phẩm'
          )}
        </h1>
        <div className="text-[14px] text-taca-text-muted">
          {SEARCH_MOCK_DATA.length} sản phẩm
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <div className="w-[240px] flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Right Content */}
        <div className="flex-1">
          <SortBar />
          
          <div className="grid grid-cols-4 gap-6">
            {SEARCH_MOCK_DATA.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                rating={product.rating}
                soldCount={product.soldCount}
                tags={product.tags}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
