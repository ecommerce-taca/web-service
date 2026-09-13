import apiClient from '../../../../../../shared/utils/api-client';

const USE_MOCK = false;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_REVIEWS = {
  pending: [
    {
      id: 'ORDER_ITEM_1',
      product_id: 'PROD_1',
      name: 'Điện thoại iPhone 16 Pro Max 256GB',
      image: 'https://via.placeholder.com/200',
      variant: 'Titan Tự Nhiên',
      order_date: '2026-08-10T10:00:00Z',
      shop_name: 'Apple Flagship Store'
    },
    {
      id: 'ORDER_ITEM_2',
      product_id: 'PROD_2',
      name: 'Tai nghe Bluetooth Apple AirPods Pro 2',
      image: 'https://via.placeholder.com/200',
      variant: 'Trắng',
      order_date: '2026-08-05T14:30:00Z',
      shop_name: 'Apple Flagship Store'
    }
  ],
  completed: [
    {
      id: 'REV_1',
      product_id: 'PROD_3',
      name: 'Ốp lưng iPhone 16 Pro Max Magsafe Silicone',
      image: 'https://via.placeholder.com/200',
      variant: 'Đen',
      shop_name: 'Taca Mall',
      rating: 5,
      content: 'Sản phẩm chính hãng, ốp rất đẹp và nam châm hút chặt. Giao hàng cực nhanh!',
      images: ['https://via.placeholder.com/200', 'https://via.placeholder.com/200'],
      created_at: '2026-08-01T09:15:00Z',
      seller_reply: 'Cảm ơn bạn đã tin tưởng và ủng hộ Taca Mall. Chúc bạn một ngày vui vẻ!'
    }
  ]
};

export const reviewApi = {
  getPendingReviews: async (params = {}) => {
    if (USE_MOCK) {
      await delay(800);
      return {
        data: {
          data: MOCK_REVIEWS.pending,
          total: MOCK_REVIEWS.pending.length
        }
      };
    }
    return apiClient.get('/users/me/reviews/pending', { params });
  },

  getCompletedReviews: async (params = {}) => {
    if (USE_MOCK) {
      await delay(800);
      return {
        data: {
          data: MOCK_REVIEWS.completed,
          total: MOCK_REVIEWS.completed.length
        }
      };
    }
    return apiClient.get('/users/me/reviews/completed', { params });
  },

  submitReview: async (reviewData) => {
    if (USE_MOCK) {
      await delay(1000);
      return { data: { success: true } };
    }
    return apiClient.post('/reviews', reviewData);
  }
};
