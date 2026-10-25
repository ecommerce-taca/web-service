import apiClient, { isMockMode } from '../../../../../../shared/utils/api-client';

export const shipmentApi = {
  /**
   * Lấy thông tin vận chuyển và tracking timeline của đơn hàng: GET /orders/{orderId}/shipment
   * Spec: shipment-docs §3.1
   * @param {string} orderId - ID đơn hàng
   */
  getOrderShipment: async (orderId) => {
    if (!isMockMode()) {
      try {
        const response = await apiClient.get(`/orders/${orderId}/shipment`);
        const data = response?.data?.data || response?.data;
        if (data) {
          return { data: { data } };
        }
      } catch (err) {
        // 404 SHIPMENT_NOT_FOUND nghĩa là đơn hàng chưa tạo vận đơn
        if (err?.response?.status === 404) {
          return { data: { data: null, notCreated: true } };
        }
        console.warn(`GET /orders/${orderId}/shipment failed`, err);
      }
    }

    // Mock Mode / Staging Fallback
    const mockShipment = {
      shipment_id: `shp-${orderId}`,
      order_id: String(orderId),
      shop_id: 'shop-01',
      carrier: 'GHN',
      carrier_name: 'Giao Hàng Nhanh (GHN Express)',
      tracking_code: `GHN${String(orderId).replace(/\D/g, '').padEnd(9, '240827')}`,
      status: 'IN_TRANSIT',
      shipping_fee: 30000,
      currency: 'VND',
      estimated_delivery: {
        min_date: '2026-09-01',
        max_date: '2026-09-03'
      },
      timeline: [
        {
          status: 'CREATED',
          occurred_at: '2026-08-28T14:30:00Z',
          source: 'SYSTEM',
          note: 'Đơn hàng đã được tiếp nhận và tạo vận đơn trên hệ thống GHN'
        },
        {
          status: 'PICKED_UP',
          occurred_at: '2026-08-29T08:15:00Z',
          source: 'CARRIER',
          note: 'Bưu tá đã nhận hàng tại kho người bán (Quận 1, TP.HCM)'
        },
        {
          status: 'IN_TRANSIT',
          occurred_at: '2026-08-29T16:45:00Z',
          source: 'CARRIER',
          note: 'Hàng đang được luân chuyển tại Trung tâm khai thác Tân Bình'
        }
      ],
      created_at: '2026-08-28T14:30:00Z'
    };

    return {
      data: {
        data: mockShipment
      }
    };
  }
};

export default shipmentApi;
