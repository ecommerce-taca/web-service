import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const STORAGE_KEY_SHOP = 'taca_seller_shop_data';
const STORAGE_KEY_ONBOARDING = 'taca_seller_onboarding_data';

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('taca_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Đọc trạng thái đăng ký Seller của Buyer hiện tại từ localStorage
 */
export const getSellerRegistrationStatus = (targetUserId) => {
  try {
    const user = targetUserId ? { id: targetUserId } : getCurrentUser();
    if (!user?.id) {
      return { hasShop: false, shop: null, kycStatus: 'NOT_REGISTERED', status: null };
    }

    const userShopKey = `${STORAGE_KEY_SHOP}_${user.id}`;
    const rawUserShop = localStorage.getItem(userShopKey);
    let shop = rawUserShop ? JSON.parse(rawUserShop) : null;

    if (!shop) {
      const rawShop = localStorage.getItem(STORAGE_KEY_SHOP);
      if (rawShop) {
        const parsed = JSON.parse(rawShop);
        if (parsed.owner_user_id === user.id) {
          shop = parsed;
        }
      }
    }

    if (shop) {
      return {
        hasShop: true,
        shop,
        kycStatus: shop.kyc_status || 'PENDING',
        status: shop.status || 'DRAFT',
      };
    }
  } catch (err) {
    console.error('Lỗi đọc seller registration status:', err);
  }
  return { hasShop: false, shop: null, kycStatus: 'NOT_REGISTERED', status: null };
};

/**
 * Lấy trạng thái đăng ký Seller bất đồng bộ (tương thích cả Mock lẫn Live API Gateway)
 */
export const fetchSellerRegistrationStatus = async (targetUserId) => {
  if (isMockMode()) {
    return getSellerRegistrationStatus(targetUserId);
  }

  try {
    const res = await apiClient.get('/seller/shop');
    const shop = res?.data || res;
    if (shop && shop.id) {
      const user = targetUserId ? { id: targetUserId } : getCurrentUser();
      if (user?.id) {
        localStorage.setItem(`${STORAGE_KEY_SHOP}_${user.id}`, JSON.stringify(shop));
      }
      return {
        hasShop: true,
        shop,
        kycStatus: shop.kyc_status || 'PENDING',
        status: shop.status || 'DRAFT',
      };
    }
    return { hasShop: false, shop: null, kycStatus: 'NOT_REGISTERED', status: null };
  } catch (err) {
    if (err?.response?.status === 404 || err?.response?.status === 403) {
      return { hasShop: false, shop: null, kycStatus: 'NOT_REGISTERED', status: null };
    }
    return getSellerRegistrationStatus(targetUserId);
  }
};

/**
 * POST /users/register-seller (§2.19)
 * Quyền: Authenticated + email verified
 */
export const registerSeller = async ({ name, business_name, tax_code, slug, description }) => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 450));

    const shopId = `01912f49-${Date.now().toString(16).slice(-4)}-7c12-9c55-8b1c34a6d921`;
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.id || `user-${Date.now().toString(16)}`;

    const newShop = {
      id: shopId,
      owner_user_id: currentUserId,
      name,
      slug: generatedSlug,
      business_name,
      tax_code,
      tax_code_masked: tax_code ? `${tax_code.slice(0, 3)}*****${tax_code.slice(-2)}` : '031*****78',
      description: description || '',
      status: 'DRAFT',
      kyc_status: 'DRAFT', // Khởi tạo DRAFT, chờ người bán vào Kênh Người Bán hoàn thành Onboarding KYC
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      warehouse_summary: null,
      bank_summary: null,
    };

    // 1. Lưu shop gắn liền với user_id của tài khoản hiện tại
    localStorage.setItem(`${STORAGE_KEY_SHOP}_${currentUserId}`, JSON.stringify(newShop));
    localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(newShop));

    // 2. Khởi tạo onboarding progress 5 bước (§2.20)
    const newOnboarding = {
      shop_id: shopId,
      owner_user_id: currentUserId,
      current_step: 'PROFILE',
      steps: [
        { key: 'PROFILE', completed: false },
        { key: 'KYC', completed: false },
        { key: 'WAREHOUSE', completed: false },
        { key: 'BANK', completed: false },
        { key: 'FIRST_PRODUCT', completed: false },
      ],
      shop_status: 'DRAFT',
      kyc_status: 'DRAFT',
      blockers: ['KYC_DOCUMENT_REQUIRED'],
    };
    localStorage.setItem(`${STORAGE_KEY_ONBOARDING}_${currentUserId}`, JSON.stringify(newOnboarding));
    localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(newOnboarding));

    // Xóa tài liệu KYC cũ nếu có để người bán upload mới từ đầu
    localStorage.removeItem(`taca_seller_kyc_documents_${currentUserId}`);
    localStorage.removeItem('taca_seller_kyc_documents');

    // Phát sự kiện cập nhật trạng thái
    window.dispatchEvent(new CustomEvent('taca:kyc_updated', {
      detail: { shopId, decision: 'DRAFT', shop: newShop },
    }));

    try {
      const bc = new BroadcastChannel('taca_marketplace_channel');
      bc.postMessage({ type: 'SHOP_REGISTERED', shopId, shop: newShop });
      bc.close();
    } catch {
      // BroadcastChannel fallback
    }

    return {
      data: {
        shop: {
          id: shopId,
          name,
          slug: generatedSlug,
          status: 'DRAFT',
          kyc_status: 'DRAFT',
        },
        onboarding: newOnboarding,
      },
    };
  }

  // Live API call khi kết nối Backend thực tế
  const res = await apiClient.post('/users/register-seller', {
    name,
    business_name,
    tax_code,
    slug,
    description,
  });

  const payload = res?.data || res;
  const shopData = payload?.shop || payload;
  const cleanTax = String(tax_code || '').replace(/\D/g, '');
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || shopData?.owner_user_id;

  if (cleanTax) {
    try {
      if (currentUserId) {
        localStorage.setItem(`taca_seller_tax_code_${currentUserId}`, cleanTax);
      }
      localStorage.setItem('taca_seller_tax_code', cleanTax);
    } catch {
      // storage quota fallback
    }
  }

  if (shopData?.id) {
    const enrichedShop = {
      ...shopData,
      tax_code: cleanTax || shopData.tax_code,
      tax_code_masked: cleanTax ? `${cleanTax.slice(0, 3)}*****${cleanTax.slice(-2)}` : (shopData.tax_code_masked || ''),
    };
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEY_SHOP}_${currentUserId}`, JSON.stringify(enrichedShop));
    }
    localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(enrichedShop));
  }

  return payload;
};
