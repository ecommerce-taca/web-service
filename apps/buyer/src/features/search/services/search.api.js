import apiClient, { isMockMode, createResponseEnvelope, unwrapApiResponse } from '../../../../../../shared/utils/api-client';
import { PRODUCTS_CATALOG, CATEGORIES_TREE } from '../../products/services/product.api';

/**
 * Service tìm kiếm & gợi ý tức thì (Search & Suggestion Service)
 * Khớp chuẩn tài liệu search-docs/docs/api/search.md §1.1 và §1.2
 */
export const searchApi = {
  /**
   * Gợi ý từ khóa & sản phẩm tức thì: GET /search/suggest?q=... (MISS-001)
   * @param {string} query - Từ khóa tìm kiếm (tối thiểu 2 ký tự)
   * @param {Object} options - { signal?: AbortSignal }
   * @returns {Promise<{ data: { keywords: string[], categories: Array<{ id: string, name: string }>, topProducts: Array<{ id: string|number, title: string, price: number, thumbnail: string }> } }>}
   */
  getSuggestions: async (query, options = {}) => {
    const trimmed = (query || '').trim();
    if (!trimmed || trimmed.length < 2) {
      return createResponseEnvelope({
        keywords: [],
        categories: [],
        topProducts: []
      });
    }

    if (!isMockMode()) {
      try {
        const response = await apiClient.get('/search/suggest', {
          params: { q: trimmed },
          signal: options.signal
        });
        const unwrapped = unwrapApiResponse(response);
        if (unwrapped && (unwrapped.keywords || unwrapped.topProducts || unwrapped.categories)) {
          return createResponseEnvelope({
            keywords: unwrapped.keywords || [],
            categories: unwrapped.categories || [],
            topProducts: unwrapped.topProducts || []
          });
        }
      } catch (err) {
        // Nếu bị hủy bởi new keystroke thì rethrow để caller bỏ qua
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          throw err;
        }
        console.warn('GET /search/suggest failed, falling back to client mock suggestion', err);
      }
    }

    // Client-side Mock Fallback khi offline hoặc test
    const qLower = trimmed.toLowerCase();

    // 1. Tìm các category liên quan
    const matchedCategories = [];
    const traverseCategories = (list) => {
      for (const cat of list) {
        if (cat.name.toLowerCase().includes(qLower) || qLower.includes(cat.name.toLowerCase())) {
          matchedCategories.push({
            id: cat.id || cat.slug,
            name: cat.name,
            slug: cat.slug
          });
        }
        if (cat.children && Array.isArray(cat.children)) {
          traverseCategories(cat.children);
        }
      }
    };
    traverseCategories(CATEGORIES_TREE);

    // 2. Tìm các sản phẩm liên quan
    const matchedProducts = PRODUCTS_CATALOG.filter((item) => {
      const titleMatch = (item.title || item.name || '').toLowerCase().includes(qLower);
      const brandMatch = (item.brand || '').toLowerCase().includes(qLower);
      const tagMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(qLower));
      return titleMatch || brandMatch || tagMatch;
    });

    // 3. Xây dựng danh sách keywords gợi ý thông minh
    const keywordSet = new Set();
    // Keyword nguyên bản
    keywordSet.add(trimmed);

    // Thêm các biến thể từ khóa từ sản phẩm khớp
    matchedProducts.slice(0, 4).forEach((p) => {
      const pTitle = p.title || p.name || '';
      if (pTitle.toLowerCase().includes(qLower)) {
        // Lấy cụm từ ngắn gọn
        const words = pTitle.split(/\s+/).slice(0, 5).join(' ');
        keywordSet.add(words.toLowerCase());
      }
    });

    if (keywordSet.size < 4 && matchedCategories.length > 0) {
      matchedCategories.slice(0, 2).forEach((c) => {
        keywordSet.add(`${trimmed} ${c.name.toLowerCase()}`);
      });
    }

    const keywords = Array.from(keywordSet).slice(0, 5);

    // 4. Chuẩn hóa topProducts theo contract spec §1.1
    const topProducts = matchedProducts.slice(0, 4).map((p) => ({
      id: p.id,
      title: p.title || p.name,
      price: p.price || (p.price_summary && p.price_summary.min_price) || 0,
      thumbnail: (p.images && p.images[0]) || p.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
      rating: p.rating || 5.0
    }));

    return createResponseEnvelope({
      keywords,
      categories: matchedCategories.slice(0, 3),
      topProducts
    });
  }
};

export default searchApi;
