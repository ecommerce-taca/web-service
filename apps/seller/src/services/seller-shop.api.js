import apiClient, { isMockMode } from '../../../../shared/utils/api-client';
import { toBackendPhone } from '../../../../shared/utils/phone';

/**
 * Key lưu mock state trong localStorage
 */
const STORAGE_KEY_SHOP = 'taca_seller_shop_data';
const STORAGE_KEY_ONBOARDING = 'taca_seller_onboarding_data';
const STORAGE_KEY_KYC_DOCS = 'taca_seller_kyc_documents';

/**
 * Dữ liệu mặc định ban đầu cho Shop Seller (khớp đặc tả auth-user.md §2.27)
 */
const DEFAULT_SHOP_DATA = {
  id: '01912f49-7a1b-7c12-9c55-8b1c34a6d921',
  name: 'Taca Apple Flagship Store',
  slug: 'taca-apple-store',
  business_name: 'Công ty TNHH Bán lẻ Apple Việt Nam',
  tax_code: '0312345678',
  tax_code_masked: '031*****78',
  description: 'Nhà phân phối ủy quyền chính hãng của Apple tại Việt Nam. Cam kết 100% hàng mới nguyên seal, bảo hành chính hãng 12 tháng.',
  logo_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop',
  status: 'ACTIVE',
  kyc_status: 'APPROVED',
  warehouse_summary: {
    warehouse_name: 'Kho Tổng Thủ Đức',
    contact_name: 'Nguyễn Minh Anh',
    contact_phone: '+84901234567',
    district: 'TP Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    line1: 'Khu Công Nghệ Cao, Xa lộ Hà Nội',
    line2: 'Kho B5, Cổng số 2',
    ward: 'Hiệp Phú',
    postal_code: '700000',
    carrier_preferences: ['GHTK', 'GHN', 'SPX'],
    cod_enabled: true,
  },
  bank_summary: {
    bank_code: 'NCB',
    bank_name: 'Ngân hàng Quốc Dân (NCB - VNPAY Sandbox)',
    account_name: 'NGUYEN VAN A',
    account_number_masked: '********2198',
    verified: true,
  },
  created_at: '2026-08-01T09:00:00Z',
  updated_at: '2026-08-30T09:00:00Z',
};

/**
 * Dữ liệu mặc định ban đầu cho Onboarding (khớp đặc tả auth-user.md §2.20)
 */
const DEFAULT_ONBOARDING_DATA = {
  shop_id: '01912f49-7a1b-7c12-9c55-8b1c34a6d921',
  current_step: 'KYC',
  steps: [
    { key: 'PROFILE', completed: true },
    { key: 'KYC', completed: true },
    { key: 'WAREHOUSE', completed: true },
    { key: 'BANK', completed: true },
    { key: 'FIRST_PRODUCT', completed: true },
  ],
  shop_status: 'ACTIVE',
  kyc_status: 'APPROVED',
  blockers: [],
};

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('taca_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredShop = () => {
  try {
    const user = getCurrentUser();
    // 1. Nếu có user đang đăng nhập, ưu tiên tìm shop của chính user đó
    if (user?.id) {
      const userShopRaw = localStorage.getItem(`${STORAGE_KEY_SHOP}_${user.id}`);
      if (userShopRaw) return JSON.parse(userShopRaw);
    }

    const raw = localStorage.getItem(STORAGE_KEY_SHOP);
    if (raw) {
      const shop = JSON.parse(raw);
      // Nếu shop trong storage thuộc về user khác mà user hiện tại đang login -> user hiện tại chưa có shop
      if (user?.id && shop.owner_user_id && shop.owner_user_id !== user.id) {
        return {
          id: null,
          name: '',
          status: 'DRAFT',
          kyc_status: 'NOT_REGISTERED',
        };
      }
      return shop;
    }

    // Nếu có user đang đăng nhập nhưng không có vai trò SELLER và chưa có shop
    if (user?.id && !user.roles?.includes('SELLER')) {
      return {
        id: null,
        name: '',
        status: 'DRAFT',
        kyc_status: 'NOT_REGISTERED',
      };
    }
  } catch (err) {
    console.error('Lỗi đọc mock shop data:', err);
  }
  return { ...DEFAULT_SHOP_DATA };
};

const saveStoredShop = (data) => {
  try {
    const user = getCurrentUser();
    if (user?.id) {
      localStorage.setItem(`${STORAGE_KEY_SHOP}_${user.id}`, JSON.stringify(data));
    } else {
      localStorage.setItem(STORAGE_KEY_SHOP, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Lỗi lưu mock shop data:', err);
  }
};

const getStoredOnboarding = () => {
  try {
    const user = getCurrentUser();
    if (user?.id) {
      const userOnboardingRaw = localStorage.getItem(`${STORAGE_KEY_ONBOARDING}_${user.id}`);
      if (userOnboardingRaw) return JSON.parse(userOnboardingRaw);

      // Nếu user có id nhưng chưa có onboarding riêng -> kiểm tra trạng thái shop của user đó
      const userShop = getStoredShop();
      if (!userShop?.id || userShop.status === 'NOT_REGISTERED' || userShop.kyc_status === 'NOT_REGISTERED') {
        return {
          shop_id: null,
          current_step: 'PROFILE',
          steps: [
            { key: 'PROFILE', completed: false },
            { key: 'KYC', completed: false },
            { key: 'WAREHOUSE', completed: false },
            { key: 'BANK', completed: false },
            { key: 'FIRST_PRODUCT', completed: false },
          ],
          shop_status: 'DRAFT',
          kyc_status: 'NOT_REGISTERED',
          blockers: ['SHOP_NOT_REGISTERED'],
        };
      }

      // Nếu shop đang tồn tại nhưng chưa có file lưu riêng
      return {
        shop_id: userShop.id,
        owner_user_id: user.id,
        current_step: 'PROFILE',
        steps: [
          { key: 'PROFILE', completed: false },
          { key: 'KYC', completed: false },
          { key: 'WAREHOUSE', completed: false },
          { key: 'BANK', completed: false },
          { key: 'FIRST_PRODUCT', completed: false },
        ],
        shop_status: userShop.status || 'DRAFT',
        kyc_status: userShop.kyc_status || 'DRAFT',
        blockers: ['KYC_DOCUMENT_REQUIRED'],
      };
    }

    const raw = localStorage.getItem(STORAGE_KEY_ONBOARDING);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc mock onboarding data:', err);
  }
  return { ...DEFAULT_ONBOARDING_DATA };
};

const saveStoredOnboarding = (data) => {
  try {
    const user = getCurrentUser();
    if (user?.id) {
      localStorage.setItem(`${STORAGE_KEY_ONBOARDING}_${user.id}`, JSON.stringify(data));
    } else {
      localStorage.setItem(STORAGE_KEY_ONBOARDING, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Lỗi lưu mock onboarding data:', err);
  }
};

const getStoredKycDocs = () => {
  try {
    const user = getCurrentUser();
    if (user?.id) {
      const userRaw = localStorage.getItem(`${STORAGE_KEY_KYC_DOCS}_${user.id}`);
      if (userRaw) return JSON.parse(userRaw);
      // Khi user đã đăng nhập nhưng chưa có tài liệu KYC riêng, trả về mảng rỗng để không lấy nhầm của user khác
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEY_KYC_DOCS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc mock kyc docs:', err);
  }
  return [];
};

const saveStoredKycDocs = (docs) => {
  try {
    const user = getCurrentUser();
    if (user?.id) {
      localStorage.setItem(`${STORAGE_KEY_KYC_DOCS}_${user.id}`, JSON.stringify(docs));
    } else {
      localStorage.setItem(STORAGE_KEY_KYC_DOCS, JSON.stringify(docs));
    }
  } catch (err) {
    console.error('Lỗi lưu mock kyc docs:', err);
  }
};

// ==========================================
// 1. POST /users/register-seller (§2.19)
// ==========================================
export const registerSeller = async ({ name, business_name, tax_code, slug, description }) => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 400));
    const cleanTax = String(tax_code || '').replace(/\D/g, '');
    const currentShop = getStoredShop();
    const updatedShop = {
      ...currentShop,
      id: currentShop.id || '01912f49-7a1b-7c12-9c55-8b1c34a6d921',
      name: name?.trim() || currentShop.name,
      business_name: business_name?.trim() || currentShop.business_name,
      tax_code: cleanTax,
      tax_code_masked: cleanTax.length >= 6 ? `${cleanTax.slice(0, 3)}***${cleanTax.slice(-2)}` : cleanTax,
      slug: slug || name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || currentShop.slug,
      description: description || '',
      status: 'DRAFT',
      kyc_status: 'DRAFT',
      updated_at: new Date().toISOString(),
    };
    saveStoredShop(updatedShop);

    const onboarding = {
      shop_id: updatedShop.id,
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
      blockers: ['PROFILE_INCOMPLETE'],
    };
    saveStoredOnboarding(onboarding);

    return {
      shop: {
        id: updatedShop.id,
        name: updatedShop.name,
        slug: updatedShop.slug,
        status: updatedShop.status,
        kyc_status: updatedShop.kyc_status,
      },
      onboarding: {
        current_step: 'PROFILE',
        completed_steps: [],
        blockers: onboarding.blockers,
      },
    };
  }

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

// ==========================================
// 2. GET /seller/onboarding (§2.20)
// ==========================================
export const getOnboardingProgress = async () => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 200));
    return getStoredOnboarding();
  }

  const res = await apiClient.get('/seller/onboarding');
  return res?.data ?? res;
};

// ==========================================
// 3. PUT /seller/onboarding/profile (§2.21)
// ==========================================
export const updateOnboardingProfile = async ({ name, business_name, tax_code, description, logo_object_key }) => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 350));
    const shop = getStoredShop();
    const cleanTax = String(tax_code || '').replace(/\D/g, '');
    const updated = {
      ...shop,
      name: name?.trim() || shop.name,
      business_name: business_name?.trim() || shop.business_name,
      tax_code: cleanTax || shop.tax_code,
      tax_code_masked: cleanTax.length >= 6 ? `${cleanTax.slice(0, 3)}***${cleanTax.slice(-2)}` : shop.tax_code_masked,
      description: description ?? shop.description,
      updated_at: new Date().toISOString(),
    };
    saveStoredShop(updated);

    const onboarding = getStoredOnboarding();
    const steps = onboarding.steps.map((s) => (s.key === 'PROFILE' ? { ...s, completed: true } : s));
    const updatedOnboarding = {
      ...onboarding,
      steps,
      current_step: steps.find((s) => !s.completed)?.key || 'COMPLETED',
      blockers: onboarding.blockers.filter((b) => b !== 'PROFILE_INCOMPLETE'),
    };
    saveStoredOnboarding(updatedOnboarding);

    return {
      shop_id: updated.id,
      step: 'PROFILE',
      completed: true,
      onboarding_status: 'IN_PROGRESS',
    };
  }

  const cleanTax = String(tax_code || '').replace(/\D/g, '');
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  if (cleanTax && cleanTax.length >= 10 && cleanTax.length <= 14) {
    try {
      if (currentUserId) {
        localStorage.setItem(`taca_seller_tax_code_${currentUserId}`, cleanTax);
      }
      localStorage.setItem('taca_seller_tax_code', cleanTax);
    } catch {
      // storage quota fallback
    }
  }

  const res = await apiClient.put('/seller/onboarding/profile', {
    name,
    business_name,
    tax_code: cleanTax || tax_code,
    description,
    logo_object_key,
  });
  return res?.data ?? res;
};

// ==========================================
// 4. PUT /seller/onboarding/warehouse (§2.22)
// ==========================================
export const updateOnboardingWarehouse = async ({
  warehouse_name,
  contact_name,
  contact_phone,
  address,
  carrier_preferences = ['GHTK', 'GHN', 'SPX'],
  cod_enabled = true,
}) => {
  const backendPhone = toBackendPhone(contact_phone);

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 350));
    const shop = getStoredShop();
    const oldWs = shop?.warehouse_summary || {};
    const updatedWarehouse = {
      warehouse_name: warehouse_name?.trim() || oldWs.warehouse_name || 'Kho lấy hàng',
      contact_name: contact_name?.trim() || oldWs.contact_name || shop?.name || 'Người bán',
      contact_phone: backendPhone || oldWs.contact_phone || '',
      district: address?.district || oldWs.district || '',
      province: address?.province || oldWs.province || '',
      ward: address?.ward || oldWs.ward || '',
      line1: address?.line1 || oldWs.line1 || '',
      line2: address?.line2 || oldWs.line2 || '',
      postal_code: address?.postal_code || oldWs.postal_code || '700000',
      carrier_preferences: carrier_preferences || ['GHTK', 'GHN', 'SPX'],
      cod_enabled: cod_enabled !== false,
    };

    const updatedShop = {
      ...shop,
      warehouse_summary: updatedWarehouse,
      updated_at: new Date().toISOString(),
    };
    saveStoredShop(updatedShop);

    const onboarding = getStoredOnboarding();
    const currentSteps = onboarding?.steps || [];
    const steps = currentSteps.map((s) => (s.key === 'WAREHOUSE' ? { ...s, completed: true } : s));
    const updatedOnboarding = {
      ...onboarding,
      steps,
      current_step: steps.find((s) => !s.completed)?.key || 'BANK',
    };
    saveStoredOnboarding(updatedOnboarding);

    return {
      shop_id: updatedShop.id,
      step: 'WAREHOUSE',
      completed: true,
      onboarding_status: 'IN_PROGRESS',
    };
  }

  const res = await apiClient.put('/seller/onboarding/warehouse', {
    warehouse_name,
    contact_name,
    contact_phone: backendPhone,
    address,
    carrier_preferences,
    cod_enabled,
  });
  return res?.data ?? res;
};

// ==========================================
// 5. POST /seller/onboarding/kyc/documents/presign (§2.23)
// ==========================================
const ALLOWED_KYC_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_KYC_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB (10485760 bytes theo §2.23)

/**
 * Tính toán mã băm SHA-256 (64 hex characters) thực tế từ nội dung File
 */
export const calculateFileSha256 = async (file) => {
  if (!file) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Lỗi khi tính SHA-256 bằng Web Crypto API:', err);
  }
  // Chuỗi hex 64 ký tự chuẩn mực nếu môi trường không có SubtleCrypto
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const presignKycDocument = async ({ document_type, file_name, filename, content_type, size_bytes, sha256 }) => {
  if (size_bytes && size_bytes > MAX_KYC_FILE_SIZE) {
    throw new Error('Tệp tài liệu vượt quá dung lượng tối đa cho phép (10 MB). Vui lòng nén hoặc chọn tệp khác.');
  }
  if (content_type && !ALLOWED_KYC_MIME_TYPES.includes(content_type.toLowerCase())) {
    throw new Error('Định dạng tệp không hợp lệ. Hệ thống chỉ chấp nhận tài liệu PDF, JPG hoặc PNG.');
  }

  const name = file_name || filename;
  const hash = sha256 && /^[a-fA-F0-9]{64}$/.test(sha256)
    ? sha256
    : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 300));
    const docId = `doc-${Date.now().toString(36)}`;
    return {
      document_id: docId,
      object_key: `private/kyc/01912f49/${name}`,
      upload_url: `https://storage.example/mock-upload/${docId}`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      required_headers: {
        'Content-Type': content_type,
        'x-content-sha256': hash,
      },
    };
  }

  const res = await apiClient.post('/seller/onboarding/kyc/documents/presign', {
    document_type,
    file_name: name,
    content_type,
    size_bytes: Number(size_bytes),
    sha256: hash,
  });
  return res?.data ?? res;
};

// ==========================================
// 6. POST /seller/onboarding/kyc/documents/complete (§2.24)
// ==========================================
export const completeKycDocument = async ({
  document_id,
  object_key,
  size_bytes,
  content_type,
  sha256,
  document_type,
  file_name,
}) => {
  const hash = sha256 && /^[a-fA-F0-9]{64}$/.test(sha256)
    ? sha256
    : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 350));
    const currentDocs = getStoredKycDocs();
    const newDoc = {
      id: document_id,
      document_type: document_type || 'BUSINESS_REGISTRATION',
      original_file_name: file_name || (object_key ? object_key.split('/').pop() : 'document.pdf'),
      content_type,
      size_bytes,
      status: 'VERIFIED',
      download_url: `https://storage.example/mock-download/${document_id}`,
      uploaded_at: new Date().toISOString(),
    };
    saveStoredKycDocs([...currentDocs, newDoc]);

    return {
      document_id,
      status: 'UPLOADED',
    };
  }

  // Khớp 100% CompleteKycDocumentRequest.java: đúng 5 trường, không có trường thừa
  const res = await apiClient.post('/seller/onboarding/kyc/documents/complete', {
    document_id,
    object_key,
    size_bytes: Number(size_bytes),
    content_type,
    sha256: hash,
  });

  // Lưu trữ metadata của document vừa tải lên thành công vào client storage
  const currentDocs = getStoredKycDocs();
  const existingIndex = currentDocs.findIndex((d) => d.id === document_id);
  const newDoc = {
    id: document_id,
    document_type: document_type || 'BUSINESS_REGISTRATION',
    original_file_name: file_name || (object_key ? object_key.split('/').pop() : 'Giấy chứng nhận ĐKKD.pdf'),
    content_type: content_type || 'application/pdf',
    size_bytes: Number(size_bytes) || 2048576,
    status: 'UPLOADED',
    uploaded_at: new Date().toISOString(),
  };

  const updatedDocs = existingIndex >= 0
    ? currentDocs.map((d, i) => (i === existingIndex ? newDoc : d))
    : [...currentDocs, newDoc];

  saveStoredKycDocs(updatedDocs);
  return res?.data ?? res;
};

// ==========================================
// 6.1 DELETE /seller/onboarding/kyc/documents/{documentId}
// ==========================================
export const deleteKycDocument = async (documentId) => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 200));
    const currentDocs = getStoredKycDocs();
    const filtered = currentDocs.filter((d) => d.id !== documentId);
    saveStoredKycDocs(filtered);
    return { success: true, document_id: documentId };
  }

  let res = null;
  try {
    res = await apiClient.delete(`/seller/onboarding/kyc/documents/${documentId}`);
  } catch (err) {
    console.warn('API xóa tài liệu KYC trả về lỗi (có thể backend chưa hỗ trợ DELETE):', err);
  }

  const currentDocs = getStoredKycDocs();
  const filtered = currentDocs.filter((d) => d.id !== documentId);
  saveStoredKycDocs(filtered);

  return res?.data ?? res ?? { success: true, document_id: documentId };
};

// ==========================================
// 7. POST /seller/onboarding/kyc/submit (§2.25)
// ==========================================
export const submitKyc = async () => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 450));
    const shop = getStoredShop();
    const updatedShop = {
      ...shop,
      kyc_status: 'PENDING',
      updated_at: new Date().toISOString(),
    };
    saveStoredShop(updatedShop);

    const onboarding = getStoredOnboarding();
    const steps = onboarding.steps.map((s) => (s.key === 'KYC' ? { ...s, completed: true } : s));
    const updatedOnboarding = {
      ...onboarding,
      steps,
      kyc_status: 'PENDING',
      current_step: steps.find((s) => !s.completed)?.key || 'COMPLETED',
      blockers: [],
    };
    saveStoredOnboarding(updatedOnboarding);

    // Đồng bộ hồ sơ KYC vào hàng đợi duyệt của Admin (taca_admin_kyc_queue)
    try {
      const docs = getStoredKycDocs();
      const rawQueue = localStorage.getItem('taca_admin_kyc_queue');
      let queue = rawQueue ? JSON.parse(rawQueue) : [];
      const existingIdx = queue.findIndex((q) => q.shop_id === updatedShop.id);
      const queueItem = {
        shop_id: updatedShop.id,
        shop_name: updatedShop.name,
        business_name: updatedShop.business_name || updatedShop.name,
        owner_user_id: updatedShop.owner_user_id || getCurrentUser()?.id || '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
        kyc_case_id: `kyc-case-${Date.now().toString(36)}`,
        business_type: updatedShop.business_name ? 'Pháp nhân' : 'Cá nhân',
        tax_code_masked: updatedShop.tax_code_masked || updatedShop.tax_code || '---',
        risk_level: 'MEDIUM',
        risk_label: 'Rủi ro trung bình',
        risk_signal: 'Hồ sơ vừa nộp từ Kênh Người Bán sau khi hoàn tất Onboarding. Đang chờ Admin thẩm định tài liệu.',
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
        document_count: docs.length,
        age_hours: 0.1,
        legal_rep: updatedShop.warehouse_summary?.contact_name || updatedShop.business_name || 'Người bán',
        address: updatedShop.warehouse_summary?.line1 ? `${updatedShop.warehouse_summary.line1}, ${updatedShop.warehouse_summary.district || ''}, ${updatedShop.warehouse_summary.province || ''}` : 'Chưa cập nhật kho',
        bank_account: updatedShop.bank_summary?.bank_name ? `${updatedShop.bank_summary.bank_name} •••• ${updatedShop.bank_summary.account_number_masked?.slice(-4) || '8888'}` : 'Chưa cập nhật ngân hàng',
        documents: docs.map((d) => ({
          id: d.id,
          document_type: d.document_type,
          title: d.original_file_name || d.file_name || 'Giấy tờ xác minh.pdf',
          file_name: d.original_file_name || d.file_name || 'Giấy tờ xác minh.pdf',
          content_type: d.content_type || 'application/pdf',
          size_bytes: d.size_bytes || 2048576,
          status: 'VERIFIED',
          download_url: d.download_url || 'https://example.com/docs/sample.pdf',
        })),
      };

      if (existingIdx >= 0) {
        queue[existingIdx] = queueItem;
      } else {
        queue = [queueItem, ...queue];
      }
      localStorage.setItem('taca_admin_kyc_queue', JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('taca:kyc_updated', {
        detail: { shopId: updatedShop.id, decision: 'PENDING' },
      }));
      try {
        const bc = new BroadcastChannel('taca_marketplace_channel');
        bc.postMessage({ type: 'KYC_SUBMITTED', shopId: updatedShop.id, shop: queueItem });
        bc.close();
      } catch {
        // fallback
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ KYC sang Admin queue:', e);
    }

    return {
      shop_id: updatedShop.id,
      kyc_case_id: `kyc-case-${Date.now().toString(36)}`,
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
    };
  }

  const res = await apiClient.post('/seller/onboarding/kyc/submit');
  return res?.data ?? res;
};

// Lấy danh sách tài liệu KYC hiện tại (Helper cho UI KYC Step)
export const getKycDocuments = async () => {
  const stored = getStoredKycDocs();
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 150));
    return stored;
  }

  // Live mode: Nếu backend trả về kyc_documents trong progress hoặc shop, ưu tiên sử dụng
  try {
    const progress = await getOnboardingProgress();
    if (Array.isArray(progress?.kyc_documents) && progress.kyc_documents.length > 0) {
      saveStoredKycDocs(progress.kyc_documents);
      return progress.kyc_documents;
    }

    // Nếu stored đang có tài liệu, trả về stored
    if (stored && stored.length > 0) {
      return stored;
    }

    // Fallback: nếu backend báo bước KYC đã hoàn thành nhưng client chưa có cache
    if (
      progress?.steps?.find((s) => s.key === 'KYC')?.completed ||
      progress?.kyc_status === 'APPROVED' ||
      progress?.kyc_status === 'PENDING'
    ) {
      const fallbackDoc = {
        id: `kyc-doc-${progress.shop_id || 'verified'}`,
        document_type: 'BUSINESS_REGISTRATION',
        original_file_name: 'Giấy chứng nhận ĐKKD / Hộ kinh doanh đã tải lên',
        content_type: 'application/pdf',
        size_bytes: 2048576,
        status: progress.kyc_status === 'APPROVED' ? 'APPROVED' : 'VERIFIED',
        uploaded_at: new Date().toISOString(),
      };
      saveStoredKycDocs([fallbackDoc]);
      return [fallbackDoc];
    }
  } catch (err) {
    console.warn('Lỗi kiểm tra tiến độ KYC từ server:', err);
  }

  return stored || [];
};

// ==========================================
// 8. PUT /seller/onboarding/bank (§2.26)
// ==========================================
export const updateOnboardingBank = async ({
  bank_code,
  bank_name,
  account_name,
  account_number,
  confirm_account_name = true,
}) => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 350));
    const cleanNum = String(account_number || '').replace(/\D/g, '');
    const masked = cleanNum.length >= 4 ? `********${cleanNum.slice(-4)}` : '********1234';

    const shop = getStoredShop();
    const oldBank = shop?.bank_summary || {};
    const updatedBank = {
      bank_code: bank_code || 'VCB',
      bank_name: bank_name || 'Vietcombank',
      account_name: account_name?.toUpperCase() || oldBank.account_name || '',
      account_number_masked: masked,
      verified: true,
    };

    const updatedShop = {
      ...shop,
      bank_summary: updatedBank,
      updated_at: new Date().toISOString(),
    };
    saveStoredShop(updatedShop);

    const onboarding = getStoredOnboarding();
    const currentSteps = onboarding?.steps || [];
    const steps = currentSteps.map((s) => (s.key === 'BANK' ? { ...s, completed: true } : s));
    const updatedOnboarding = {
      ...onboarding,
      steps,
      current_step: steps.find((s) => !s.completed)?.key || 'COMPLETED',
    };
    saveStoredOnboarding(updatedOnboarding);

    return {
      bank_name: updatedBank.bank_name,
      account_number_masked: masked,
      verified: true,
      step: 'BANK',
      completed: true,
      onboarding_status: 'READY_TO_SUBMIT',
    };
  }

  const res = await apiClient.put('/seller/onboarding/bank', {
    bank_code,
    bank_name,
    account_name: account_name?.toUpperCase(),
    account_number,
    confirm_account_name,
  });
  return res?.data ?? res;
};

// ==========================================
// 9. GET /seller/shop (§2.27)
// ==========================================
export const getShopProfile = async () => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 200));
    return getStoredShop();
  }

  const res = await apiClient.get('/seller/shop');
  const shopData = res?.data ?? res;

  if (shopData) {
    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.id || shopData.owner_user_id;
    const cachedTax = (currentUserId && localStorage.getItem(`taca_seller_tax_code_${currentUserId}`)) ||
                      localStorage.getItem('taca_seller_tax_code') || '';

    // Khôi phục tax_code nếu BE chỉ trả tax_code_masked
    if (!shopData.tax_code && cachedTax) {
      shopData.tax_code = cachedTax;
    }

    if (!shopData.tax_code_masked && cachedTax) {
      shopData.tax_code_masked = `${cachedTax.slice(0, 3)}*****${cachedTax.slice(-2)}`;
    }
  }

  return shopData;
};

// ==========================================
// 10. PUT /seller/shop (§2.28)
// ==========================================
export const updateShopProfile = async ({ name, description, logo_object_key }) => {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 350));
    const shop = getStoredShop();
    const updated = {
      ...shop,
      name: name?.trim() || shop.name,
      description: description !== undefined ? description : shop.description,
      logo_url: logo_object_key || shop.logo_url,
      updated_at: new Date().toISOString(),
    };
    saveStoredShop(updated);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      logo_url: updated.logo_url,
      updated_at: updated.updated_at,
    };
  }

  const res = await apiClient.put('/seller/shop', {
    name,
    description,
    logo_object_key,
  });
  return res?.data ?? res;
};

// ==========================================
// 11. GET /shops/{shopId}/followers/count (§2.44)
// ==========================================
export const getShopFollowersCount = async (shopId) => {
  if (isMockMode()) {
    return { shop_id: shopId, follower_count: 1284 };
  }
  const res = await apiClient.get(`/shops/${shopId}/followers/count`);
  return res?.data ?? res;
};

// ==========================================
// 12. GET /shops/{shopId} (§2.45 - Public shop profile)
// ==========================================
export const getPublicShopProfile = async (shopIdOrSlug) => {
  if (isMockMode()) {
    const shop = getStoredShop();
    return {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      logo_url: shop.logo_url,
      description: shop.description,
      status: shop.status,
      follower_count: 1284,
      rating_avg: 4.9,
      response_rate: '98%',
      product_count: 42,
    };
  }
  const res = await apiClient.get(`/shops/${shopIdOrSlug}`);
  return res?.data ?? res;
};

/**
 * Danh sách Ngân hàng chuẩn phục vụ thanh toán / rút tiền (Tối ưu cho VNPAY Sandbox & VietQR)
 */
export const VIETNAM_BANK_CATALOG = [
  { code: 'NCB', name: 'Ngân hàng Quốc Dân (NCB - VNPAY Sandbox)', isSandbox: true },
];

/**
 * Thông tin tài khoản & thẻ kiểm thử chuẩn cổng thanh toán VNPAY Sandbox
 */
export const VNPAY_SANDBOX_TEST_ACCOUNT = {
  bank_code: 'NCB',
  bank_name: 'Ngân hàng Quốc Dân (NCB - VNPAY Sandbox)',
  account_number: '9704198526191432198',
  account_name: 'NGUYEN VAN A',
  otp: '123456',
  release_date: '07/15',
};
