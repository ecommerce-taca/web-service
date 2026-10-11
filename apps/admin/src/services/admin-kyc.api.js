import apiClient, { isMockMode } from '../../../../shared/utils/api-client';

const MOCK_KYC_QUEUE = [
  {
    shop_id: 'mock-kyc-pending-001',
    shop_name: 'Taca Digital Store',
    business_name: 'CÔNG TY TNHH TACA DIGITAL',
    owner_user_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d001',
    kyc_case_id: 'kyc-case-mock-001',
    business_type: 'Pháp nhân',
    tax_code_masked: '0318429081',
    risk_level: 'HIGH',
    risk_label: 'Rủi ro cao',
    risk_signal: 'Tín hiệu: IP trùng 2 shop bị khóa · Ngân hàng xác minh hợp lệ.',
    status: 'PENDING',
    submitted_at: '2026-10-11T09:35:00Z',
    document_count: 3,
    age_hours: 2.5,
    legal_rep: 'NGUYỄN MINH ANH',
    address: '28 Nguyễn Huệ, Quận 1, TP.HCM',
    bank_account: 'Vietcombank •••• 4838',
    documents: [
      {
        id: 'doc-001',
        document_type: 'BUSINESS_REGISTRATION',
        title: 'Giấy đăng ký kinh doanh.pdf',
        file_name: 'Giấy đăng ký kinh doanh.pdf',
        content_type: 'application/pdf',
        size_bytes: 5242880,
        status: 'VERIFIED',
        download_url: 'https://example.com/docs/gpdkkd.pdf',
      },
      {
        id: 'doc-002',
        document_type: 'IDENTITY_FRONT',
        title: 'CCCD người đại diện.jpg',
        file_name: 'CCCD người đại diện.jpg',
        content_type: 'image/jpeg',
        size_bytes: 2097152,
        status: 'VERIFIED',
        download_url: 'https://example.com/docs/cccd.jpg',
      },
      {
        id: 'doc-003',
        document_type: 'BANK_STATEMENT',
        title: 'Xác nhận tài khoản ngân hàng.pdf',
        file_name: 'Xác nhận tài khoản ngân hàng.pdf',
        content_type: 'application/pdf',
        size_bytes: 1048576,
        status: 'VERIFIED',
        download_url: 'https://example.com/docs/bank.pdf',
      },
    ],
  },
  {
    shop_id: 'mock-kyc-approved-002',
    shop_name: 'Taca Apple Flagship Store',
    business_name: 'CÔNG TY CP THƯƠNG MẠI CÔNG NGHỆ TACA',
    owner_user_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d002',
    kyc_case_id: 'kyc-case-mock-002',
    business_type: 'Pháp nhân',
    tax_code_masked: '0108923412',
    risk_level: 'LOW',
    risk_label: 'Rủi ro thấp',
    risk_signal: 'Doanh nghiệp uy tín · Không ghi nhận vi phạm chính sách.',
    status: 'APPROVED',
    submitted_at: '2026-10-10T14:20:00Z',
    document_count: 4,
    age_hours: 24.0,
    legal_rep: 'TRẦN THỊ MAI HƯƠNG',
    address: '15 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
    bank_account: 'MB Bank •••• 9999',
    documents: [
      {
        id: 'doc-004',
        document_type: 'BUSINESS_REGISTRATION',
        title: 'Giấy phép kinh doanh phân phối Apple.pdf',
        file_name: 'Giấy phép kinh doanh phân phối Apple.pdf',
        content_type: 'application/pdf',
        size_bytes: 3145728,
        status: 'VERIFIED',
        download_url: 'https://example.com/docs/apple_license.pdf',
      },
    ],
  },
  {
    shop_id: 'mock-kyc-needsinfo-003',
    shop_name: 'Gia Dụng Xanh Minh Phát',
    business_name: 'HỘ KINH DOANH MINH PHÁT',
    owner_user_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d003',
    kyc_case_id: 'kyc-case-mock-003',
    business_type: 'Cá nhân',
    tax_code_masked: '8392019481',
    risk_level: 'MEDIUM',
    risk_label: 'Rủi ro trung bình',
    risk_signal: 'Thiếu sao kê tài khoản ngân hàng khớp tên chủ hộ.',
    status: 'NEEDS_INFO',
    submitted_at: '2026-10-11T08:10:00Z',
    document_count: 2,
    age_hours: 4.0,
    legal_rep: 'LÊ MINH PHÁT',
    address: '104 Hoàng Diệu, Phường 12, Quận 4, TP.HCM',
    bank_account: 'Techcombank •••• 1289',
    documents: [
      {
        id: 'doc-005',
        document_type: 'IDENTITY_FRONT',
        title: 'CCCD chủ hộ kinh doanh.jpg',
        file_name: 'CCCD chủ hộ kinh doanh.jpg',
        content_type: 'image/jpeg',
        size_bytes: 1843200,
        status: 'VERIFIED',
        download_url: 'https://example.com/docs/cccd_minhphat.jpg',
      },
    ],
  },
];

const MOCK_METRICS = {
  pending_count: 1,
  pending_today: 1,
  verified_count: 48216,
  verified_rate: '96,4% shop',
  high_risk_count: 62,
  temp_locked_count: 18,
  sla_avg: '3h 24m',
  sla_diff: '−18 phút',
};

const STORAGE_KEY_QUEUE = 'taca_admin_kyc_queue';
const STORAGE_KEY_SELLER_SHOP = 'taca_seller_shop_data';
const STORAGE_KEY_SELLER_ONBOARDING = 'taca_seller_onboarding_data';
const STORAGE_KEY_REGISTERED_LIST = 'taca_registered_sellers_list';

const getStoredQueue = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
    let queue = raw ? JSON.parse(raw) : [...MOCK_KYC_QUEUE];

    // 1. Kiểm tra danh sách seller đăng ký từ Buyer (taca_registered_sellers_list)
    const rawRegisteredList = localStorage.getItem(STORAGE_KEY_REGISTERED_LIST);
    if (rawRegisteredList) {
      const regList = JSON.parse(rawRegisteredList);
      if (Array.isArray(regList)) {
        regList.forEach((regItem) => {
          const idx = queue.findIndex((q) => q.shop_id === regItem.shop_id);
          if (idx >= 0) {
            queue[idx] = { ...queue[idx], ...regItem };
          } else {
            queue.unshift(regItem);
          }
        });
      }
    }

    // 2. Kiểm tra nếu Seller đã submit shop mới vào localStorage (taca_seller_shop_data)
    const rawShop = localStorage.getItem(STORAGE_KEY_SELLER_SHOP);
    if (rawShop) {
      const sellerShop = JSON.parse(rawShop);
      const inQueueIdx = queue.findIndex((q) => q.shop_id === sellerShop.id);
      if (inQueueIdx >= 0) {
        queue[inQueueIdx].status = sellerShop.kyc_status || queue[inQueueIdx].status;
        queue[inQueueIdx].shop_name = sellerShop.name || queue[inQueueIdx].shop_name;
      } else if (sellerShop.kyc_status === 'PENDING') {
        queue.unshift({
          shop_id: sellerShop.id,
          shop_name: sellerShop.name,
          business_name: sellerShop.business_name || sellerShop.name,
          owner_user_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
          kyc_case_id: `kyc-case-${Date.now().toString(36)}`,
          business_type: sellerShop.business_name ? 'Pháp nhân' : 'Cá nhân',
          tax_code_masked: sellerShop.tax_code_masked || sellerShop.tax_code || '0312345678',
          risk_level: 'MEDIUM',
          risk_label: 'Rủi ro trung bình',
          risk_signal: 'Hồ sơ mới gửi từ Kênh Người Mua. Đang chờ Admin phê duyệt tài khoản.',
          status: 'PENDING',
          submitted_at: sellerShop.updated_at || new Date().toISOString(),
          document_count: 3,
          age_hours: 0.1,
          legal_rep: sellerShop.warehouse_summary?.contact_name || sellerShop.business_name || 'Người bán mới',
          address: `${sellerShop.warehouse_summary?.line1 || '28 Nguyễn Huệ'}, ${sellerShop.warehouse_summary?.district || 'Quận 1'}, ${sellerShop.warehouse_summary?.province || 'TP.HCM'}`,
          bank_account: `${sellerShop.bank_summary?.bank_name || 'Vietcombank'} •••• ${sellerShop.bank_summary?.account_number_masked?.slice(-4) || '8888'}`,
          documents: [
            {
              id: 'doc-auto-01',
              document_type: 'BUSINESS_REGISTRATION',
              title: 'Giấy phép đăng ký kinh doanh.pdf',
              file_name: 'Giấy phép đăng ký kinh doanh.pdf',
              content_type: 'application/pdf',
              size_bytes: 3145728,
              status: 'VERIFIED',
              download_url: 'https://example.com/docs/gpdkkd.pdf',
            },
            {
              id: 'doc-auto-02',
              document_type: 'IDENTITY_FRONT',
              title: 'CCCD người đại diện.jpg',
              file_name: 'CCCD người đại diện.jpg',
              content_type: 'image/jpeg',
              size_bytes: 1843200,
              status: 'VERIFIED',
              download_url: 'https://example.com/docs/cccd.jpg',
            },
          ],
        });
      }
    }

    // Đảm bảo lưu lại hàng đợi hợp nhất
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
    return queue;
  } catch (e) {
    console.error('Lỗi đọc hàng đợi KYC:', e);
    return [...MOCK_KYC_QUEUE];
  }
};

const saveStoredQueue = (queue) => {
  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Lỗi lưu hàng đợi KYC:', e);
  }
};

export const getKycQueue = async (params = {}) => {
  const { status = 'ALL', page = 1, size = 20, q = '' } = params;

  if (isMockMode()) {
    await new Promise((res) => setTimeout(res, 200));
    const allQueue = getStoredQueue();
    let filtered = [...allQueue];

    if (status && status !== 'ALL') {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.shop_name.toLowerCase().includes(query) ||
          item.tax_code_masked.includes(query) ||
          item.legal_rep.toLowerCase().includes(query)
      );
    }

    const counts = {
      PENDING: allQueue.filter((i) => i.status === 'PENDING').length,
      NEEDS_INFO: allQueue.filter((i) => i.status === 'NEEDS_INFO').length,
      APPROVED: allQueue.filter((i) => i.status === 'APPROVED').length,
      REJECTED: allQueue.filter((i) => i.status === 'REJECTED').length,
      ALL: allQueue.length,
    };

    const metrics = {
      ...MOCK_METRICS,
      pending_count: counts.PENDING,
      verified_count: counts.APPROVED,
    };

    return {
      data: filtered,
      meta: {
        page,
        size,
        total: filtered.length,
        total_pages: Math.ceil(filtered.length / size) || 1,
        metrics,
        counts,
      },
    };
  }

  try {
    const queryParams = { page, size };
    if (status && status !== 'ALL') queryParams.status = status;
    if (q) queryParams.q = q;

    const response = await apiClient.get('/admin/shops/kyc', { params: queryParams });
    return response;
  } catch (err) {
    console.warn('[AdminKycApi] getKycQueue remote error, returning mock fallback:', err);
    return {
      data: getStoredQueue(),
      meta: { page: 1, size: 20, total: MOCK_KYC_QUEUE.length, total_pages: 1, metrics: MOCK_METRICS },
    };
  }
};

export const getKycDetail = async (shopId) => {
  if (isMockMode()) {
    await new Promise((res) => setTimeout(res, 150));
    const queue = getStoredQueue();
    const item = queue.find((q) => q.shop_id === shopId) || queue[0];
    return {
      data: {
        shop: {
          id: item.shop_id,
          name: item.shop_name,
          business_name: item.business_name,
          tax_code_masked: item.tax_code_masked,
          status: item.status === 'APPROVED' ? 'ACTIVE' : 'DRAFT',
        },
        kyc_case: {
          id: item.kyc_case_id,
          status: item.status,
          risk_level: item.risk_level,
          risk_signal: item.risk_signal,
          submitted_at: item.submitted_at,
          legal_rep: item.legal_rep,
          address: item.address,
          bank_account: item.bank_account,
          documents: item.documents,
        },
      },
      meta: { request_id: 'req-' + Date.now() },
    };
  }

  try {
    const response = await apiClient.get(`/admin/shops/${shopId}/kyc`);
    return response;
  } catch (err) {
    console.warn('[AdminKycApi] getKycDetail fallback:', err);
    const queue = getStoredQueue();
    const item = queue[0];
    return {
      data: {
        shop: { id: shopId, name: item.shop_name, business_name: item.business_name, tax_code_masked: item.tax_code_masked },
        kyc_case: { id: item.kyc_case_id, status: item.status, documents: item.documents, risk_signal: item.risk_signal },
      },
    };
  }
};

export const reviewKyc = async (shopId, { decision, reason = '' }) => {
  if (!['APPROVED', 'NEEDS_INFO', 'REJECTED'].includes(decision)) {
    throw new Error('Quyết định không hợp lệ. Chỉ chấp nhận APPROVED, NEEDS_INFO hoặc REJECTED.');
  }

  if (['NEEDS_INFO', 'REJECTED'].includes(decision) && (!reason || reason.trim().length < 10)) {
    throw new Error('Vui lòng nhập lý do tối thiểu 10 ký tự cho quyết định này.');
  }

  if (isMockMode()) {
    await new Promise((res) => setTimeout(res, 400));
    const queue = getStoredQueue();
    const target = queue.find((q) => q.shop_id === shopId);
    if (target) {
      target.status = decision;
      saveStoredQueue(queue);
    }

    // Đồng bộ trực tiếp vào dữ liệu của Seller
    try {
      // 1. Đồng bộ theo user_id nếu có
      if (target?.owner_user_id) {
        const userShopKey = `${STORAGE_KEY_SELLER_SHOP}_${target.owner_user_id}`;
        const rawUserShop = localStorage.getItem(userShopKey);
        if (rawUserShop) {
          const uShop = JSON.parse(rawUserShop);
          uShop.kyc_status = decision;
          uShop.reject_reason = reason || '';
          if (decision === 'APPROVED') {
            uShop.status = 'ACTIVE';
            delete uShop.reject_reason;
          } else {
            uShop.status = 'DRAFT';
          }
          localStorage.setItem(userShopKey, JSON.stringify(uShop));
        }

        const userOnboardingKey = `${STORAGE_KEY_SELLER_ONBOARDING}_${target.owner_user_id}`;
        const rawUserOnboarding = localStorage.getItem(userOnboardingKey);
        if (rawUserOnboarding) {
          const uOnb = JSON.parse(rawUserOnboarding);
          uOnb.kyc_status = decision;
          uOnb.reject_reason = reason || '';
          if (decision === 'APPROVED') {
            uOnb.shop_status = 'ACTIVE';
            uOnb.blockers = [];
          } else if (decision === 'NEEDS_INFO') {
            uOnb.shop_status = 'DRAFT';
            uOnb.blockers = [reason || 'Cần bổ sung tài liệu KYC theo yêu cầu của BQT'];
          } else if (decision === 'REJECTED') {
            uOnb.shop_status = 'DRAFT';
            uOnb.blockers = [reason || 'Hồ sơ KYC bị từ chối'];
          }
          localStorage.setItem(userOnboardingKey, JSON.stringify(uOnb));
        }
      }

      // 2. Đồng bộ shop key dùng chung
      const rawShop = localStorage.getItem(STORAGE_KEY_SELLER_SHOP);
      if (rawShop) {
        const shop = JSON.parse(rawShop);
        if (shop.id === shopId || (target?.owner_user_id && shop.owner_user_id === target.owner_user_id)) {
          shop.kyc_status = decision;
          shop.reject_reason = reason || '';
          if (decision === 'APPROVED') {
            shop.status = 'ACTIVE';
            delete shop.reject_reason;
          } else {
            shop.status = 'DRAFT';
          }
          localStorage.setItem(STORAGE_KEY_SELLER_SHOP, JSON.stringify(shop));
        }
      }

      const rawOnboarding = localStorage.getItem(STORAGE_KEY_SELLER_ONBOARDING);
      if (rawOnboarding) {
        const onboarding = JSON.parse(rawOnboarding);
        if (onboarding.shop_id === shopId) {
          onboarding.kyc_status = decision;
          onboarding.reject_reason = reason || '';
          if (decision === 'APPROVED') {
            onboarding.shop_status = 'ACTIVE';
            onboarding.blockers = [];
          } else if (decision === 'NEEDS_INFO') {
            onboarding.shop_status = 'DRAFT';
            onboarding.blockers = [reason || 'Cần bổ sung tài liệu KYC theo yêu cầu của BQT'];
          } else if (decision === 'REJECTED') {
            onboarding.shop_status = 'DRAFT';
            onboarding.blockers = [reason || 'Hồ sơ KYC bị từ chối'];
          }
          localStorage.setItem(STORAGE_KEY_SELLER_ONBOARDING, JSON.stringify(onboarding));
        }
      }

      // 3. Cấp role SELLER cho tài khoản người dùng khi APPROVED (§2.31)
      if (decision === 'APPROVED') {
        const rawUser = localStorage.getItem('taca_user');
        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            const currentRoles = Array.isArray(u.roles) ? u.roles : ['BUYER'];
            if (!currentRoles.includes('SELLER')) {
              u.roles = [...currentRoles, 'SELLER'];
              localStorage.setItem('taca_user', JSON.stringify(u));
            }
          } catch (e) {
            console.warn('Lỗi cập nhật role SELLER:', e);
          }
        }
      }

      // 4. Đồng bộ danh sách registered list
      const rawReg = localStorage.getItem(STORAGE_KEY_REGISTERED_LIST);
      if (rawReg) {
        try {
          const regList = JSON.parse(rawReg);
          if (Array.isArray(regList)) {
            const idx = regList.findIndex((r) => r.shop_id === shopId);
            if (idx >= 0) {
              regList[idx].status = decision === 'APPROVED' ? 'ACTIVE' : 'DRAFT';
              regList[idx].kyc_status = decision;
              regList[idx].reject_reason = reason || '';
              localStorage.setItem(STORAGE_KEY_REGISTERED_LIST, JSON.stringify(regList));
            }
          }
        } catch (e) {
          console.warn('Lỗi đồng bộ registered list:', e);
        }
      }

      // 5. Phát sự kiện toàn cục để Seller Portal nhận ngay lập tức
      window.dispatchEvent(new CustomEvent('taca:kyc_updated', {
        detail: { shopId, decision, reason, owner_user_id: target?.owner_user_id },
      }));

      try {
        const bc = new BroadcastChannel('taca_marketplace_channel');
        bc.postMessage({ type: 'KYC_REVIEWED', shopId, decision, reason, owner_user_id: target?.owner_user_id });
        bc.close();
      } catch {
        // fallback
      }
    } catch (syncErr) {
      console.warn('Lỗi đồng bộ sang Seller storage:', syncErr);
    }

    return {
      data: {
        shop_id: shopId,
        decision,
        reason,
        reviewed_at: new Date().toISOString(),
      },
      meta: { request_id: 'req-' + Date.now() },
    };
  }

  try {
    const response = await apiClient.post(`/admin/shops/${shopId}/kyc/review`, {
      decision,
      reason: reason.trim(),
    });
    return response?.data || response;
  } catch (err) {
    console.error('[AdminKycApi] reviewKyc failed:', err);
    throw err;
  }
};

export const getUserRoles = async (userId) => {
  if (isMockMode()) {
    return {
      data: {
        user_id: userId,
        assignments: [
          { role: 'BUYER', scope_type: 'GLOBAL', granted_at: '2026-08-30T09:00:00Z' },
          { role: 'SELLER', scope_type: 'SHOP', granted_at: '2026-09-01T10:00:00Z' },
        ],
      },
    };
  }
  return apiClient.get(`/admin/users/${userId}/roles`);
};

export const updateUserRole = async (userId, { action, role, shop_id = null, reason = '' }) => {
  if (isMockMode()) {
    return { data: { success: true, user_id: userId, role, action } };
  }
  return apiClient.patch(`/admin/users/${userId}/roles`, {
    action,
    role,
    shop_id,
    reason,
  });
};

export const updateUserStatus = async (userId, { status, reason = '' }) => {
  if (isMockMode()) {
    return { data: { success: true, user_id: userId, status, reason } };
  }
  return apiClient.patch(`/admin/users/${userId}/status`, {
    status,
    reason,
  });
};
