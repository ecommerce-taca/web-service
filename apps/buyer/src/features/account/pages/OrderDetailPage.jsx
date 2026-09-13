import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../services/order.api';
import Button from '../../../../../../shared/ui-components/src/components/Button';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderApi.getOrderDetail(id);
      setOrder(response.data.data || response.data);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
     
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  if (loading) {
    return <div className="p-8 text-center text-taca-text-muted">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center text-taca-sale">
        <p className="mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
        <Link to="/account/orders" className="text-taca-primary hover:underline">Quay lại danh sách đơn hàng</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1 max-w-[1200px] w-full mx-auto">
        <Link to="/account/orders" className="text-gray-500 hover:text-taca-text-main text-[13px] mb-6 inline-block">
          Tài khoản / Đơn mua / #{id}
        </Link>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-extrabold text-taca-text-main m-0 uppercase mb-1">
              ĐƠN HÀNG #{id}
            </h1>
            <p className="text-[13px] text-gray-500 m-0">Đặt lúc: 14:22 - 24/08/2024</p>
          </div>
          <div className="border border-[#00cba9] text-[#00cba9] text-[12px] font-bold px-6 py-1.5 rounded-full uppercase">
            {order.status === 'COMPLETED' ? 'ĐÃ GIAO' : order.status === 'SHIPPING' ? 'ĐANG GIAO' : order.status}
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-[#a7a0ec] bg-[#f8f7ff] rounded-lg p-8 mb-8 relative">
          <div className="flex justify-between relative z-10">
            {/* Timeline Steps */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-[#00cba9] rounded-sm mb-2"></div>
              <p className="text-[12px] font-bold text-taca-text-main m-0">Đã đặt</p>
              <p className="text-[11px] text-gray-500 m-0">24/08 14:22</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-[#00cba9] rounded-sm mb-2"></div>
              <p className="text-[12px] font-bold text-taca-text-main m-0">Đã xác nhận</p>
              <p className="text-[11px] text-gray-500 m-0">24/08 14:38</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-[#00cba9] rounded-sm mb-2"></div>
              <p className="text-[12px] font-bold text-taca-text-main m-0">Đang giao</p>
              <p className="text-[11px] text-gray-500 m-0">27/08 07:42</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-[#00cba9] rounded-sm mb-2"></div>
              <p className="text-[12px] font-bold text-taca-text-main m-0">Đã giao</p>
              <p className="text-[11px] text-gray-500 m-0">27/08 09:18</p>
            </div>
          </div>
          {/* Progress Bar Background */}
          <div className="absolute top-[40px] left-[10%] right-[10%] h-[3px] bg-[#00cba9] z-0"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* SẢN PHẨM */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[14px] font-bold text-taca-text-main uppercase m-0">SẢN PHẨM</h2>
                <button className="border border-gray-200 text-taca-text-main text-[12px] font-bold px-4 py-1.5 rounded hover:bg-gray-50 transition-colors">
                  Chat với shop
                </button>
              </div>
              
              <div className="flex flex-col gap-6">
                {(order.order_items || []).map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-[100px] h-[100px] bg-[#f4f7ff] rounded flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">SKU Image</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-[14px] font-semibold text-taca-text-main m-0 mb-1">{item.product_name}</h4>
                      <p className="text-[12px] text-gray-500 m-0">{item.variant_name} · SKU: P16PM-256-NAT · x{item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[16px] font-bold text-taca-sale">{(item.unit_price * item.quantity).toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ĐỊA CHỈ NHẬN HÀNG */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-[14px] font-bold text-taca-text-main uppercase mb-4 m-0">ĐỊA CHỈ NHẬN HÀNG</h2>
              <div className="text-[14px] text-taca-text-main leading-relaxed">
                <span className="font-semibold">{order.shipping_address?.name || 'Nguyễn Minh Anh'}</span> - {order.shipping_address?.phone || '0909 123 456'}<br />
                {order.shipping_address?.detail_address || '28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM'}
              </div>
            </div>

            {/* THÔNG TIN VẬN CHUYỂN */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-[14px] font-bold text-taca-text-main uppercase mb-4 m-0">THÔNG TIN VẬN CHUYỂN</h2>
              <div className="text-[13px] text-taca-text-main mb-6">
                <p className="m-0 mb-1">GHN Express - Mã vận đơn: GHN240827881</p>
                <p className="m-0 text-gray-500">Đã giao lúc 09:18 - 27/08/2024</p>
              </div>
              <button className="border border-gray-200 text-taca-text-main text-[13px] font-bold px-6 py-2 rounded hover:bg-gray-50 transition-colors">
                Theo dõi vận chuyển
              </button>
            </div>

            {/* HỖ TRỢ */}
            <div className="border border-gray-200 rounded-lg p-6 flex justify-between items-center">
              <div className="text-[14px] text-taca-text-main font-semibold">
                Cần hỗ trợ? Đổi trả / Hoàn tiền trong 7 ngày
              </div>
              <button className="border border-gray-200 text-taca-text-main text-[13px] font-bold px-6 py-2 rounded hover:bg-gray-50 transition-colors">
                Yêu cầu hỗ trợ
              </button>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* THANH TOÁN */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-[14px] font-bold text-taca-text-main uppercase mb-6 m-0">THANH TOÁN</h2>
              
              <div className="flex flex-col gap-4 text-[13px] mb-6">
                <div className="flex justify-between items-center text-taca-text-main">
                  <span>Tạm tính</span>
                  <span className="font-bold">{(order.total_amount || 29490000).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center text-taca-text-main">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold">0 đ</span>
                </div>
                <div className="flex justify-between items-center text-taca-text-main">
                  <span>Voucher cửa hàng</span>
                  <span className="font-bold text-[#00cba9]">-300.000 đ</span>
                </div>
                <div className="flex justify-between items-center text-taca-text-main">
                  <span>Voucher Taca</span>
                  <span className="font-bold">0 đ</span>
                </div>
              </div>

              <hr className="border-t border-gray-200 mb-6" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-[14px] font-bold uppercase text-taca-text-main">TỔNG CỘNG</span>
                <span className="text-[20px] font-bold text-taca-sale">29.190.000 đ</span>
              </div>

              <p className="text-[13px] text-[#00cba9] mb-6">
                Thanh toán COD - Đã thanh toán
              </p>

              <Button className="w-full !py-3 font-bold text-[14px]">
                Đánh giá sản phẩm
              </Button>
            </div>

            {/* MUA LẠI NHANH */}
            <div className="border border-[#a7a0ec] bg-[#f8f7ff] rounded-lg p-6">
              <h2 className="text-[14px] font-bold text-taca-primary uppercase mb-4 m-0">MUA LẠI NHANH</h2>
              <div className="mb-6">
                <p className="text-[13px] text-taca-text-main m-0 mb-1 font-semibold">Phiên bản SKU vẫn còn hàng</p>
                <p className="text-[13px] text-gray-500 m-0">Giá hiện tại: 29.490.000 đ</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 !py-2 text-[13px] font-bold">
                  Mua lại
                </Button>
                <button className="flex-1 border border-white bg-white text-taca-text-main text-[13px] font-bold py-2 rounded hover:bg-gray-50 transition-colors">
                  Xem sản phẩm
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
