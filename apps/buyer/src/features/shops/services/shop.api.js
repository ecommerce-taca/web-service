import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY_FOLLOWING = 'taca_user_following_shops';

const DEFAULT_DEMO_SHOPS = {
  '01912f31-7a1b-7c12-9c55-8b1c34a6d921': {
    id: '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
    name: 'Taca Apple Flagship Store',
    slug: 'taca-apple-official',
    business_name: 'Apple Vietnam LLC',
    description: 'Gian hàng chính hãng ủy quyền cao cấp của Apple trên Taca Marketplace',
    logo_url: '',
    rating: 4.9,
    rating_count: 3240,
    response_rate: '98%',
    response_time: 'Hoạt động 5 phút trước',
    is_official: true,
    base_followers_count: 12500,
    products_count: 128,
  },
  '01912f31-7a1b-7c12-9c55-8b1c34a6d922': {
    id: '01912f31-7a1b-7c12-9c55-8b1c34a6d922',
    name: 'Anker Official Flagship Store',
    slug: 'anker-vietnam-official',
    business_name: 'Anker Innovations Vietnam',
    description: 'Thương hiệu phụ kiện số 1 thế giới về công nghệ sạc nhanh GaN và âm thanh Soundcore',
    logo_url: '',
    rating: 4.8,
    rating_count: 8900,
    response_rate: '99%',
    response_time: 'Hoạt động 2 phút trước',
    is_official: true,
    base_followers_count: 85200,
    products_count: 245,
  },
  '01912f31-7a1b-7c12-9c55-8b1c34a6d923': {
    id: '01912f31-7a1b-7c12-9c55-8b1c34a6d923',
    name: 'Sony Official Store',
    slug: 'sony-vietnam-store',
    business_name: 'Sony Electronics Vietnam',
    description: 'Âm thanh chất lượng cao, máy ảnh Alpha và thiết bị giải trí đỉnh cao',
    logo_url: '',
    rating: 4.9,
    rating_count: 4200,
    response_rate: '97%',
    response_time: 'Hoạt động 10 phút trước',
    is_official: true,
    base_followers_count: 45600,
    products_count: 96,
  },
};

const getLocalFollowingList = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLLOWING);
    if (!raw) {
      // Khởi tạo mặc định follow Apple store
      const initial = [
        {
          shop_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
          shop_name: 'Taca Apple Flagship Store',
          slug: 'taca-apple-official',
          rating: 4.9,
          followers_count: 12500,
          is_official: true,
          followed_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY_FOLLOWING, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalFollowingList = (list) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_FOLLOWING, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('taca:following_updated', { detail: list }));
  } catch (e) {
    console.error('Failed to save following list to localStorage', e);
  }
};

export const shopApi = {
  /**
   * #41 POST /shops/{shopId}/follow (§2.41 auth-user.md)
   * Theo dõi một gian hàng
   */
  followShop: async (shopId) => {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200));
      const list = getLocalFollowingList();
      const existing = list.find((item) => item.shop_id === shopId);
      const targetShop = DEFAULT_DEMO_SHOPS[shopId] || {
        id: shopId,
        name: 'Gian hàng đối tác Taca',
        slug: 'shop-' + shopId,
        rating: 4.8,
        is_official: false,
        base_followers_count: 100,
      };

      if (!existing) {
        const item = {
          shop_id: shopId,
          shop_name: targetShop.name,
          slug: targetShop.slug,
          rating: targetShop.rating,
          followers_count: (targetShop.base_followers_count || 100) + 1,
          is_official: targetShop.is_official || false,
          followed_at: new Date().toISOString(),
        };
        list.push(item);
        saveLocalFollowingList(list);
      }
      return {
        success: true,
        code: 200,
        data: {
          shop_id: shopId,
          followed_at: new Date().toISOString(),
        },
      };
    }
    const response = await apiClient.post(`/shops/${shopId}/follow`);
    return response;
  },

  /**
   * #42 DELETE /shops/{shopId}/follow (§2.42 auth-user.md)
   * Bỏ theo dõi một gian hàng
   */
  unfollowShop: async (shopId) => {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200));
      const list = getLocalFollowingList();
      const filtered = list.filter((item) => item.shop_id !== shopId);
      saveLocalFollowingList(filtered);
      return {
        success: true,
        code: 200,
        data: {
          shop_id: shopId,
          unfollowed_at: new Date().toISOString(),
        },
      };
    }
    const response = await apiClient.delete(`/shops/${shopId}/follow`);
    return response;
  },

  /**
   * #43 GET /users/me/following (§2.43 auth-user.md)
   * Lấy danh sách các gian hàng người dùng hiện tại đang theo dõi
   */
  getFollowingShops: async (params = { page: 1, size: 20, sort: 'created_at,desc' }) => {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150));
      const list = getLocalFollowingList();
      return {
        success: true,
        code: 200,
        data: list,
        meta: {
          page: Number(params.page) || 1,
          size: Number(params.size) || 20,
          total: list.length,
          total_pages: Math.ceil(list.length / (params.size || 20)) || 1,
        },
      };
    }
    const response = await apiClient.get('/users/me/following', { params });
    return response;
  },

  /**
   * #44 GET /shops/{shopId}/followers/count (§2.44 auth-user.md)
   * Lấy số lượng người theo dõi của gian hàng
   */
  getShopFollowerCount: async (shopId) => {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 100));
      const targetShop = DEFAULT_DEMO_SHOPS[shopId] || { base_followers_count: 12500 };
      const list = getLocalFollowingList();
      const isFollowing = list.some((item) => item.shop_id === shopId);
      const count = (targetShop.base_followers_count || 12500) + (isFollowing ? 1 : 0);
      return {
        success: true,
        code: 200,
        data: {
          shop_id: shopId,
          followers_count: count,
        },
      };
    }
    const response = await apiClient.get(`/shops/${shopId}/followers/count`);
    return response;
  },

  /**
   * #45 GET /shops/{shopId} (§2.45 auth-user.md)
   * Lấy chi tiết hồ sơ công khai của gian hàng
   */
  getShopProfile: async (shopIdOrSlug) => {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150));
      const found =
        DEFAULT_DEMO_SHOPS[shopIdOrSlug] ||
        Object.values(DEFAULT_DEMO_SHOPS).find((s) => s.slug === shopIdOrSlug) || {
          id: shopIdOrSlug,
          name: 'Taca Apple Flagship Store',
          slug: 'taca-apple-official',
          business_name: 'Apple Vietnam LLC',
          description: 'Gian hàng chính hãng ủy quyền cao cấp của Apple trên Taca Marketplace',
          logo_url: '',
          rating: 4.9,
          rating_count: 3240,
          response_rate: '98%',
          response_time: 'Hoạt động 5 phút trước',
          is_official: true,
          base_followers_count: 12500,
          products_count: 128,
        };

      const list = getLocalFollowingList();
      const isFollowing = list.some((item) => item.shop_id === found.id);
      const followersCount = (found.base_followers_count || 12500) + (isFollowing ? 1 : 0);

      return {
        success: true,
        code: 200,
        data: {
          ...found,
          followers_count: followersCount,
          is_following: isFollowing,
        },
      };
    }
    const response = await apiClient.get(`/shops/${shopIdOrSlug}`);
    return response;
  },

  /**
   * Alias cho getShopProfile
   */
  getShopDetail: async (shopIdOrSlug) => {
    return shopApi.getShopProfile(shopIdOrSlug);
  },
};

export default shopApi;
