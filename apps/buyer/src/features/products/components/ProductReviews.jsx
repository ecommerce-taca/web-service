import PropTypes from 'prop-types';

const ProductReviews = ({ rating, reviewCount }) => {
  // Mock data based on Penpot design
  const filters = ["Tất cả", "5 sao", "Có hình ảnh", "Đã mua hàng"];
  
  const ratingDistribution = [
    { stars: 5, percentage: 88 },
    { stars: 4, percentage: 8 },
    { stars: 3, percentage: 2 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 }
  ];

  const mockReviews = [
    {
      id: 1,
      author: "Nguyễn M. A.",
      rating: 5,
      verified: true,
      variant: "Phiên bản 256GB - Titan tự nhiên",
      comment: "Máy đẹp, nguyên seal và giao hàng siêu nhanh. Đóng gói rất cẩn thận, mình rất yên tâm khi mua hàng ở Taca.",
      images: [1, 2, 3],
      helpful: 128
    }
  ];

  return (
    <div className="bg-white p-6 border border-taca-border flex flex-col gap-6">
      <h2 className="text-[16px] font-bold text-taca-text-main uppercase">ĐÁNH GIÁ & NHẬN XÉT</h2>
      
      {/* Overview */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-[48px] font-extrabold text-taca-text-main leading-none">{rating}</span>
          <span className="text-[20px] text-taca-warning tracking-widest mt-1">★★★★★</span>
          <span className="text-[12px] text-taca-text-muted mt-2">{reviewCount} đánh giá đã xác thực</span>
        </div>
        
        {/* Progress bars */}
        <div className="flex-1 flex flex-col gap-2">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-[12px] font-medium text-taca-text-main">
              <span>{item.stars} ★</span>
              <div className="flex-1 h-[8px] bg-taca-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-main" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="w-[30px] text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mt-2">
        <span className="text-[14px] font-bold text-taca-text-main">Lọc đánh giá</span>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <button 
              key={filter}
              className={`px-4 py-2 border text-[14px] rounded-[8px] transition-colors ${
                index === 0 
                  ? 'border-taca-primary text-taca-primary font-bold bg-indigo-50' 
                  : 'border-taca-border text-taca-text-main bg-white hover:border-taca-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-t border-taca-border my-2" />

      {/* Review List */}
      <div className="flex flex-col gap-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-taca-text-main">{review.author}</span>
                <span className="text-[12px] text-taca-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
            </div>
            
            <div className="text-[12px] text-taca-text-muted flex items-center gap-1">
              {review.verified && <span className="text-taca-primary font-bold">✓ Đã mua hàng</span>}
              <span>· {review.variant}</span>
            </div>
            
            <p className="text-[14px] text-taca-text-main leading-relaxed">
              {review.comment}
            </p>
            
            {/* Photos */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {review.images.map((img) => (
                  <div key={img} className="w-[80px] h-[80px] bg-taca-surface flex-shrink-0 flex items-center justify-center text-[10px] text-taca-text-muted">
                    Photo {img}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-6 text-[12px] text-taca-text-muted mt-1">
              <button className="hover:text-taca-primary">👍 Hữu ích ({review.helpful})</button>
              <button className="hover:text-taca-primary">💬 Bình luận</button>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All */}
      <button className="w-full py-3 mt-2 text-[14px] font-bold text-taca-primary border border-taca-border rounded-[8px] hover:bg-taca-surface transition-colors">
        Xem tất cả nhận xét
      </button>
    </div>
  );
};

ProductReviews.propTypes = {
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ProductReviews;
