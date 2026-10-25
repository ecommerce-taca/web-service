import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Star, Check, ThumbsUp, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { reviewApi } from '../../account/services/review.api';

const ProductReviews = ({ productId, rating, reviewCount }) => {
  const [reviews, setReviews] = useState([]);
  const [aggregate, setAggregate] = useState({
    avg: Number(rating) || 5.0,
    count: Number(reviewCount) || 0,
    distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  });
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null); // null = all, 1..5
  const [withMediaOnly, setWithMediaOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await reviewApi.getProductReviews(productId, {
        rating: selectedRating,
        with_media: withMediaOnly ? true : undefined,
        page,
        size: 10
      });

      const resData = res?.data || {};
      const reviewList = resData.reviews || [];
      const agg = resData.aggregate || {
        avg: Number(rating) || 5.0,
        count: reviewList.length,
        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': reviewList.length }
      };

      setReviews(reviewList);
      setAggregate(agg);
      setTotalCount(res?.meta?.total || reviewList.length);
    } catch (err) {
      console.error('Failed to load reviews for product', productId, err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, selectedRating, withMediaOnly, page, rating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Compute percentages for distribution
  const totalReviewsForDist = aggregate.count || 1;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const starCount = aggregate.distribution ? (aggregate.distribution[String(stars)] || 0) : 0;
    const percentage = Math.round((starCount / totalReviewsForDist) * 100);
    return {
      stars,
      count: starCount,
      percentage: Math.min(100, Math.max(0, percentage))
    };
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-[12px] border border-taca-border flex flex-col gap-8">
      <div className="flex justify-between items-center border-b border-taca-border pb-4">
        <h2 className="text-[16px] font-bold text-taca-text-main uppercase tracking-wide">
          ĐÁNH GIÁ & NHẬN XÉT ({aggregate.count || reviewCount || 0})
        </h2>
      </div>

      {/* Overview & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center min-w-[120px] text-center">
            <span className="text-[44px] font-extrabold text-taca-sale leading-none">
              {aggregate.avg ? Number(aggregate.avg).toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(aggregate.avg) || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[12px] text-taca-text-muted mt-2">
              {aggregate.count || reviewCount || 0} đánh giá đã xác thực
            </span>
          </div>

          {/* Progress bars */}
          <div className="flex flex-col gap-2 w-full sm:w-[200px]">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-[12px] font-medium text-taca-text-main">
                <span className="flex items-center gap-1 w-8">
                  <span>{item.stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-[8px] bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-[36px] text-right text-slate-500">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 lg:items-end">
          <span className="text-[13px] font-bold text-taca-text-main">Lọc đánh giá</span>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => {
                setSelectedRating(null);
                setWithMediaOnly(false);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 border text-[13px] rounded-lg transition-colors cursor-pointer ${
                selectedRating === null && !withMediaOnly
                  ? 'border-taca-primary text-taca-primary font-bold bg-indigo-50/70'
                  : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
              }`}
            >
              Tất cả
            </button>

            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setSelectedRating(star);
                  setWithMediaOnly(false);
                  setPage(1);
                }}
                className={`px-3 py-1.5 border text-[13px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedRating === star
                    ? 'border-taca-primary text-taca-primary font-bold bg-indigo-50/70'
                    : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                }`}
              >
                <span>{star} sao</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setWithMediaOnly(!withMediaOnly);
                setPage(1);
              }}
              className={`px-3 py-1.5 border text-[13px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                withMediaOnly
                  ? 'border-taca-primary text-taca-primary font-bold bg-indigo-50/70'
                  : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Có hình ảnh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="flex flex-col gap-6 pt-2">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Đang tải đánh giá sản phẩm...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.review_id || review.id} className="flex flex-col gap-3 pb-6 border-b border-slate-100 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px] font-bold text-taca-text-main">
                    {review.author?.display_name || 'Khách hàng Taca'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.created_at && (
                  <span className="text-[12px] text-slate-400">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              <div className="text-[12px] text-taca-text-muted flex items-center gap-2">
                {review.is_verified_purchase && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Đã mua hàng
                  </span>
                )}
                {review.variant_label && (
                  <span className="text-slate-500">· Phân loại: {review.variant_label}</span>
                )}
              </div>

              <p className="text-[14px] text-taca-text-main leading-relaxed m-0">
                {review.comment}
              </p>

              {/* Photos */}
              {review.media && review.media.length > 0 && (
                <div className="flex gap-2.5 overflow-x-auto py-1">
                  {review.media.map((item, idx) => {
                    const url = typeof item === 'string' ? item : item.url;
                    return (
                      <div
                        key={idx}
                        className="w-[88px] h-[88px] rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50"
                      >
                        <img
                          src={url}
                          alt="Review media"
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Seller reply */}
              {review.seller_reply && (
                <div className="mt-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-taca-primary" />
                      Phản hồi từ người bán
                    </span>
                    {review.seller_reply.replied_at && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(review.seller_reply.replied_at).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-600 m-0">
                    {typeof review.seller_reply === 'string' ? review.seller_reply : review.seller_reply.content}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-[12px] text-taca-text-muted mt-1">
                <button
                  type="button"
                  className="hover:text-taca-primary flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-0 p-0 text-slate-500"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Hữu ích</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            Chưa có đánh giá nào phù hợp với bộ lọc đã chọn
          </div>
        )}
      </div>

      {/* Pagination controls if more items */}
      {totalCount > 10 && (
        <div className="flex justify-center items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-[13px] text-slate-500">Trang {page}</span>
          <button
            type="button"
            disabled={page * 10 >= totalCount}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

ProductReviews.propTypes = {
  productId: PropTypes.string,
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ProductReviews;
