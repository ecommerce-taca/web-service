import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

const MOCK_PAYMENTS_KEY = 'taca_mock_payments';

const getStoredMockPayments = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(MOCK_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse mock payments from sessionStorage', e);
    return {};
  }
};

const saveStoredMockPayment = (paymentId, data) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredMockPayments();
    current[paymentId] = { ...current[paymentId], ...data };
    sessionStorage.setItem(MOCK_PAYMENTS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save mock payment to sessionStorage', e);
  }
};

export const paymentApi = {
  /**
   * Lấy trạng thái giao dịch thanh toán: GET /payments/{paymentId}
   * Tuân thủ contract payment-wallet-service §3.2
   * @param {string} paymentId - ID của giao dịch thanh toán
   * @returns {Promise<{ data: { payment_id, order_id, method, amount, status, payment_url, qr_payload, expires_at } }>}
   */
  getPaymentStatus: async (paymentId) => {
    if (!paymentId) {
      throw new Error('paymentId is required');
    }

    if (!isMockMode()) {
      const response = await apiClient.get(`/payments/${paymentId}`);
      const data = response?.data?.data || response?.data || response;
      return { data: { data } };
    }

    // Mock handler chuẩn Backend payment-wallet spec
    const stored = getStoredMockPayments();
    let payment = stored[paymentId];

    if (!payment) {
      payment = {
        payment_id: paymentId,
        order_id: `ord-${paymentId.replace('pay-', '')}`,
        method: 'VNPAY',
        amount: 25000000,
        status: 'PENDING',
        payment_url: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=25000000&vnp_TxnRef=${paymentId}`,
        qr_payload: `00020101021238580010A00000072701280006970454011400011234567890208QRIBFTTA53037045408250000005802VN6304${paymentId}`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        poll_count: 0
      };
      saveStoredMockPayment(paymentId, payment);
    }

    return {
      data: {
        data: payment
      }
    };
  },

  /**
   * Cập nhật giả lập trạng thái thanh toán thành công (chỉ cho phép trong môi trường Mock/Dev khi người dùng bấm "Tôi đã thanh toán")
   * @param {string} paymentId
   */
  confirmMockPaymentSuccess: async (paymentId) => {
    if (!paymentId) return;
    if (!isMockMode()) {
      console.warn('confirmMockPaymentSuccess chỉ được phép trong chế độ Mock');
      return { data: { success: false, message: 'Simulation not allowed in live mode' } };
    }

    const stored = getStoredMockPayments();
    const payment = stored[paymentId] || {
      payment_id: paymentId,
      method: 'VNPAY',
      status: 'PENDING',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    payment.status = 'SUCCESS';
    payment.paid_at = new Date().toISOString();
    payment.bankCode = 'NCB';
    payment.bank_code = 'NCB';
    payment.transactionNo = `VNP${Date.now().toString().slice(-8)}`;
    payment.provider_ref_masked = `VNP****${Date.now().toString().slice(-4)}`;
    saveStoredMockPayment(paymentId, payment);
    return { data: { success: true, status: 'SUCCESS', bankCode: 'NCB' } };
  }
};

export default paymentApi;
