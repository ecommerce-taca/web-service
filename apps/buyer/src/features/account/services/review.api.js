import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY = 'taca_buyer_submitted_reviews';

const getStoredSubmittedReviews = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse buyer reviews from localStorage', e);
    return [];
  }
};

const saveStoredSubmittedReviews = (reviews) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save buyer reviews to localStorage', e);
  }
};

// Initial default reviews for fallback / mock mode
const DEFAULT_PRODUCT_REVIEWS = [
  {
    review_id: 'rv-01912fd0',
    product_id: 'PROD_1',
    sku_id: 'sku-01912f33',
    variant_label: 'Titan tự nhiên - 256GB',
    rating: 5,
    comment: 'Máy đẹp, nguyên seal và giao hàng siêu nhanh. Đóng gói rất cẩn thận, mình rất yên tâm khi mua hàng ở Taca.',
    media: [
      { media_id: 'rm-1', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80', type: 'IMAGE', status: 'READY' }
    ],
    author: { display_name: 'Nguyễn M. A', avatar_url: null },
    is_verified_purchase: true,
    seller_reply: {
      content: 'Cảm ơn bạn đã tin tưởng và ủng hộ Taca Mall. Chúc bạn có trải nghiệm tuyệt vời cùng sản phẩm!',
      replied_at: '2026-08-28T02:00:00Z'
    },
    created_at: '2026-08-27T10:00:00Z',
    edited_at: null
  },
  {
    review_id: 'rv-01912fd1',
    product_id: 'PROD_1',
    sku_id: 'sku-01912f34',
    variant_label: 'Titan Đen - 512GB',
    rating: 5,
    comment: 'Chất lượng xuất sắc, đúng chuẩn Apple chính hãng VNA. Sẽ tiếp tục ủng hộ shop.',
    media: [],
    author: { display_name: 'Trần V. B', avatar_url: null },
    is_verified_purchase: true,
    seller_reply: null,
    created_at: '2026-08-26T14:20:00Z',
    edited_at: null
  },
  {
    review_id: 'rv-01912fd2',
    product_id: 'PROD_1',
    sku_id: 'sku-01912f33',
    variant_label: 'Titan Tự Nhiên - 256GB',
    rating: 4,
    comment: 'Sản phẩm tốt, nhân viên tư vấn nhiệt tình. Thời gian giao hàng hơi chậm hơn 1 ngày do mưa.',
    media: [],
    author: { display_name: 'Lê T. C', avatar_url: null },
    is_verified_purchase: true,
    seller_reply: {
      content: 'Dạ shop rất xin lỗi vì sự bất tiện về thời tiết giao hàng, shop đã ghi nhận để cải thiện dịch vụ ạ!',
      replied_at: '2026-08-27T08:00:00Z'
    },
    created_at: '2026-08-25T09:15:00Z',
    edited_at: null
  }
];

export const reviewApi = {
  /**
   * Lấy danh sách đánh giá công khai của sản phẩm: GET /products/{productId}/reviews
   * Spec: rating-comment-docs §3.1
   * @param {string} productId
   * @param {Object} params - { rating, with_media, page, size, sort }
   */
  getProductReviews: async (productId, params = {}) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get(`/products/${productId}/reviews`, { params });
        const resData = response?.data?.data || response?.data;
        if (resData) {
          return {
            data: {
              aggregate: resData.aggregate || {
                avg: 4.8,
                count: (resData.reviews || []).length,
                distribution: { '1': 0, '2': 0, '3': 1, '4': 2, '5': 10 }
              },
              reviews: resData.reviews || []
            },
            meta: response?.meta || { total: (resData.reviews || []).length }
          };
        }
      } catch (err) {
        console.warn(`API Gateway GET /products/${productId}/reviews failed, falling back to local reviews`, err);
      }
    }

    // Mock Mode / Fallback
    const localSubmitted = getStoredSubmittedReviews().filter(r => r.product_id === String(productId));
    let allReviews = [...localSubmitted, ...DEFAULT_PRODUCT_REVIEWS];

    // Filter by rating if provided
    if (params.rating) {
      allReviews = allReviews.filter(r => Number(r.rating) === Number(params.rating));
    }
    // Filter with_media
    if (params.with_media) {
      allReviews = allReviews.filter(r => r.media && r.media.length > 0);
    }

    const count = allReviews.length;
    const avg = count > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : '5.0';

    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    allReviews.forEach(r => {
      const star = String(r.rating);
      if (distribution[star] !== undefined) {
        distribution[star] += 1;
      }
    });

    return {
      data: {
        aggregate: {
          avg: Number(avg),
          count,
          distribution
        },
        reviews: allReviews
      },
      meta: {
        page: params.page || 1,
        size: params.size || 20,
        total: count,
        total_pages: 1
      }
    };
  },

  /**
   * Gửi đánh giá sản phẩm đã mua: POST /products/{productId}/reviews
   * Spec: rating-comment-docs §3.2
   * @param {string} productId - ID của sản phẩm
   * @param {Object} reviewData - { order_id, sku_id, rating, comment, media_ids }
   */
  submitReview: async (productId, reviewData) => {
    const cleanPayload = {
      order_id: String(reviewData.order_id || ''),
      sku_id: String(reviewData.sku_id || 'DEFAULT'),
      rating: Number(reviewData.rating || 5),
      comment: String(reviewData.comment || reviewData.content || ''),
      media_ids: Array.isArray(reviewData.media_ids) ? reviewData.media_ids : []
    };

    if (!isMockMode()) {
      const response = await apiClient.post(`/products/${productId}/reviews`, cleanPayload);
      const submittedRecord = {
        review_id: response?.data?.data?.review_id || `rv-${Date.now()}`,
        product_id: String(productId),
        order_id: cleanPayload.order_id,
        sku_id: cleanPayload.sku_id,
        rating: cleanPayload.rating,
        comment: cleanPayload.comment,
        variant_label: reviewData.variant_label || 'Tiêu chuẩn',
        product_name: reviewData.product_name || 'Sản phẩm đã mua',
        product_image: reviewData.product_image || '',
        shop_name: reviewData.shop_name || 'Gian hàng Taca',
        author: { display_name: 'Tôi (Đã xác thực)', avatar_url: null },
        is_verified_purchase: true,
        created_at: new Date().toISOString()
      };
      const stored = getStoredSubmittedReviews();
      saveStoredSubmittedReviews([submittedRecord, ...stored]);
      return response;
    }

    // Mock Mode
    const newReview = {
      review_id: `rv-${Date.now()}`,
      product_id: String(productId),
      order_id: cleanPayload.order_id,
      sku_id: cleanPayload.sku_id,
      rating: cleanPayload.rating,
      comment: cleanPayload.comment,
      variant_label: reviewData.variant_label || 'Tiêu chuẩn',
      product_name: reviewData.product_name || 'Sản phẩm đã mua',
      product_image: reviewData.product_image || '',
      shop_name: reviewData.shop_name || 'Gian hàng Taca',
      author: { display_name: 'Tôi (Đã xác thực)', avatar_url: null },
      is_verified_purchase: true,
      created_at: new Date().toISOString()
    };

    const stored = getStoredSubmittedReviews();
    saveStoredSubmittedReviews([newReview, ...stored]);

    return {
      data: {
        data: newReview
      },
      meta: { request_id: `req-${Date.now()}` }
    };
  },

  /**
   * Lấy danh sách đánh giá của buyer lưu trữ local / client
   */
  getClientSubmittedReviews: () => {
    return getStoredSubmittedReviews();
  }
};

export default reviewApi;
