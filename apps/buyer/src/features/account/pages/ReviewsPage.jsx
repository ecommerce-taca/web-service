import { useState } from 'react';

const DUMMY_REVIEWS = [
  {
    id: 'R1',
    productName: 'Tai nghe chụp tai Sony WH-1000XM5',
    variant: 'Đen',
    date: '27/08/2026',
    status: 'pending' // pending or completed
  },
  {
    id: 'R2',
    productName: 'iPhone 16 Pro Max 256GB',
    variant: 'Titan tự nhiên',
    date: '15/08/2026',
    status: 'completed',
    rating: 5,
    comment: 'Sản phẩm tuyệt vời, giao hàng nhanh chóng, đóng gói cẩn thận.'
  }
];

const ReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('Chưa đánh giá');

  const filteredReviews = DUMMY_REVIEWS.filter(r => 
    activeTab === 'Chưa đánh giá' ? r.status === 'pending' : r.status === 'completed'
  );

  return (
    <div>
      <h2 className="text-[20px] font-extrabold text-taca-text-main m-0 mb-6">Đánh giá của tôi</h2>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-taca-border mb-6">
        {['Chưa đánh giá', 'Đã đánh giá'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[14px] font-semibold cursor-pointer border-b-2 transition-colors bg-transparent ${
              activeTab === tab
                ? 'border-taca-primary text-taca-primary'
                : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-white p-6 border border-taca-border rounded-[12px]">
              <div className="flex gap-4">
                <div className="w-[80px] h-[80px] bg-[#f4f7ff] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Hình SP</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-[14px] font-semibold text-taca-text-main m-0 mb-1">{review.productName}</h4>
                  <p className="text-[12px] text-gray-500 m-0 mb-2">Phân loại hàng: {review.variant}</p>
                  
                  {review.status === 'completed' && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-[14px] ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <p className="text-[13px] text-taca-text-main m-0">{review.comment}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  {review.status === 'pending' ? (
                    <button className="bg-taca-primary text-white font-bold text-[13px] px-6 py-2 rounded-lg hover:bg-taca-primary-hover transition-colors">
                      Đánh giá
                    </button>
                  ) : (
                    <button className="border border-taca-border bg-white text-taca-text-main font-bold text-[13px] px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Sửa đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {activeTab === 'Chưa đánh giá' ? 'Không có đơn hàng nào chờ đánh giá' : 'Bạn chưa có đánh giá nào'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
