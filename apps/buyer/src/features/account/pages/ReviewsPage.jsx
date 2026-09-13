import { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '../services/review.api';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import ReviewFormModal from '../components/ReviewFormModal';

const ReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = useCallback(async (tab) => {
    setLoading(true);
    try {
      let response;
      if (tab === 'pending') {
        response = await reviewApi.getPendingReviews();
      } else {
        response = await reviewApi.getCompletedReviews();
      }
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     
    fetchReviews(activeTab);
  }, [activeTab, fetchReviews]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        <h1 className="text-[20px] font-bold text-taca-text-main mb-6">Đánh giá của tôi</h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-taca-border mb-6">
          {[
            { id: 'pending', label: 'Chưa đánh giá' },
            { id: 'completed', label: 'Đã đánh giá' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[14px] font-semibold cursor-pointer border-b-2 transition-colors bg-transparent ${
                activeTab === tab.id
                  ? 'border-taca-primary text-taca-primary'
                  : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải đánh giá...</div>
          ) : reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="bg-white p-6 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-[80px] h-[80px] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {review.image ? (
                      <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">Hình SP</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-[14px] font-semibold text-taca-text-main m-0 mb-1">{review.name}</h4>
                    <p className="text-[12px] text-gray-500 m-0 mb-1">Phân loại hàng: {review.variant}</p>
                    <p className="text-[12px] text-gray-400 m-0 mb-2">Cung cấp bởi: {review.shop_name}</p>
                    
                    {activeTab === 'completed' && (
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-[16px] ${i < review.rating ? 'text-[#ff9d00]' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                        <p className="text-[13px] text-taca-text-main m-0 leading-relaxed mb-2">{review.content}</p>
                        
                        {/* Ảnh đính kèm */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.images.map((img, idx) => (
                              <img key={idx} src={img} alt="review" className="w-[60px] h-[60px] object-cover rounded border border-gray-200" />
                            ))}
                          </div>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {new Date(review.created_at).toLocaleString('vi-VN')}
                        </span>

                        {/* Người bán phản hồi */}
                        {review.seller_reply && (
                          <div className="mt-3 bg-white p-3 border border-gray-200 rounded-lg">
                            <p className="text-[12px] font-bold text-taca-text-main mb-1">Phản hồi của người bán:</p>
                            <p className="text-[12px] text-gray-600 m-0">{review.seller_reply}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start sm:items-center sm:justify-end mt-4 sm:mt-0 min-w-[120px]">
                    {activeTab === 'pending' ? (
                      <Button onClick={() => setSelectedReview(review)} className="w-full sm:w-auto !px-6 !rounded-lg text-[13px]">
                        Đánh giá
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full sm:w-auto !px-6 !rounded-lg text-[13px]">
                        Sửa đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              {activeTab === 'pending' ? 'Không có đơn hàng nào chờ đánh giá' : 'Bạn chưa có đánh giá nào'}
            </div>
          )}
        </div>
      </div>

      {selectedReview && (
        <ReviewFormModal 
          isOpen={!!selectedReview} 
          onClose={() => setSelectedReview(null)} 
          reviewItem={selectedReview}
          onSuccess={() => fetchReviews(activeTab)}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
