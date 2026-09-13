import ProductCard from '../../products/components/ProductCard';

const ShopProductList = () => {
  const products = [
    {
      id: 1,
      name: 'iPhone 16 Pro Max',
      price: 29490000,
      rating: 4.6,
      soldCount: 120,
      isOfficial: true,
      image: null // Fallback to SKU box
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      price: 27990000,
      rating: 4.7,
      soldCount: 194,
      isOfficial: true,
      image: null
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      price: 7490000,
      rating: 4.8,
      soldCount: 268,
      isOfficial: true,
      image: null
    },
    {
      id: 4,
      name: 'Xiaomi Robot Vacuum',
      price: 8990000,
      rating: 4.9,
      soldCount: 342,
      isOfficial: true,
      image: null
    },
    {
      id: 5,
      name: 'Kindle Paperwhite',
      price: 3990000,
      rating: 4.6,
      soldCount: 416,
      isOfficial: true,
      image: null
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[20px] font-bold text-taca-text-main m-0">Sản phẩm nổi bật</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            rating={product.rating}
            soldCount={product.soldCount}
            isOfficial={product.isOfficial}
            image={product.image}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopProductList;
