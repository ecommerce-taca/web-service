import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Truck, 
  CreditCard, 
  Clock, 
  PackageCheck, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MessageSquare, 
  Package, 
  RotateCcw
} from 'lucide-react';
import { orderApi } from '../services/order.api';
import { shipmentApi } from '../services/shipment.api';
import { unwrapApiResponse } from '../../../../../../shared/utils/api-client';
import { Button } from '@taca/ui-components';
import { formatPhoneDisplay } from '../../../../../../shared/utils/phone';
import { getOrderStatusInfo } from '../utils/orderStatus';
import { useCart } from '../../cart/hooks/useCart';
import VnpayQrModal from '../../checkout/components/VnpayQrModal';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reordering, setReordering] = useState(false);
  const [isVnpayModalOpen, setIsVnpayModalOpen] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, shipmentRes] = await Promise.allSettled([
        orderApi.getOrderDetail(id),
        shipmentApi.getOrderShipment(id)
      ]);

      if (orderRes.status === 'fulfilled') {
        const orderData = unwrapApiResponse(orderRes.value);
        if (orderData) {
          setOrder(orderData);
        } else {
          throw new Error('Không thể tải chi tiết đơn hàng');
        }
      } else {
        throw new Error(orderRes.reason?.message || 'Không thể tải chi tiết đơn hàng');
      }

      if (shipmentRes.status === 'fulfilled') {
        setShipment(unwrapApiResponse(shipmentRes.value) || null);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleReorder = async () => {
    if (!order || !order.order_items) return;
    setReordering(true);
    try {
      for (const item of order.order_items) {
        addToCart({
          id: item.product_id || `prod_${item.product_name}`,
          name: item.product_name,
          price: item.unit_price,
          image: item.product_image,
          variant: item.variant_name,
          quantity: item.quantity,
          selected: true
        });
      }
      navigate('/cart');
    } catch (e) {
      console.error('Reorder error:', e);
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <div className="w-8 h-8 border-3 border-taca-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[14px]">Đang tải chi tiết đơn hàng #{id}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">
          {error || 'Không tìm thấy thông tin đơn hàng'}
        </h3>
        <Link 
          to="/account/orders" 
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-taca-primary text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đơn hàng</span>
        </Link>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const isCancelled = order.status === 'CANCELLED';

  // Timeline steps computation
  const timelineSteps = [
    { title: 'Đặt hàng thành công', time: order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : '27/08 10:30', isPassed: true, icon: Clock },
    { title: 'Đã xác nhận đơn', time: order.confirmed_at || '27/08 10:45', isPassed: order.status !== 'PENDING' && !isCancelled, icon: PackageCheck },
    { title: 'Đang vận chuyển', time: order.shipping_at || (order.status === 'SHIPPING' || order.status === 'COMPLETED' ? '28/08 08:15' : ''), isPassed: order.status === 'SHIPPING' || order.status === 'COMPLETED', icon: Truck },
    { title: isCancelled ? 'Đã hủy đơn' : 'Giao thành công', time: order.completed_at || (order.status === 'COMPLETED' ? '29/08 14:20' : ''), isPassed: order.status === 'COMPLETED' || isCancelled, icon: isCancelled ? AlertCircle : CheckCircle2 },
  ];

  const totalItemCount = (order.order_items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = order.total_amount || 0;
  const shippingFee = order.shipping_fee ?? 0;
  const discountAmount = order.discount_amount ?? 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1 max-w-[1200px] w-full mx-auto space-y-6">
        
        {/* Top Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <Link 
              to="/account/orders" 
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-taca-primary text-[13px] font-medium transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tất cả đơn mua</span>
            </Link>
            <div className="flex items-center gap-3 pt-1">
              <h1 className="text-[20px] font-extrabold text-slate-900 m-0 uppercase">
                ĐƠN HÀNG #{order.id}
              </h1>
            </div>
            {order.created_at && (
              <p className="text-[12px] text-slate-400 m-0">
                Thời gian đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[13px] font-bold ${statusInfo.colorClass}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {timelineSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all shadow-xs ${
                    step.isPassed 
                      ? isCancelled && idx === 3
                        ? 'bg-rose-500 text-white'
                        : 'bg-indigo-600 text-white' 
                      : 'bg-white text-slate-300 border border-slate-200'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <p className={`text-[13px] font-bold m-0 ${step.isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.title}
                  </p>
                  {step.time && (
                    <p className="text-[11px] text-slate-400 mt-0.5 m-0 font-medium">
                      {step.time}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column (8 Cols) */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* 1. Danh sách sản phẩm */}
            <div className="border border-slate-200/90 rounded-2xl p-6 space-y-5 bg-white">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-taca-primary" />
                  <span className="font-bold text-[14px] text-slate-900">
                    {order.shop?.name || 'Gian hàng Taca'}
                  </span>
                  <span className="text-slate-400 text-[12px]">({totalItemCount} sản phẩm)</span>
                </div>
                <button 
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-taca-primary hover:border-taca-primary text-[12px] font-medium transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat với shop</span>
                </button>
              </div>

              <div className="space-y-4">
                {(order.order_items || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {/* Fixed dimensions for product image to avoid container blowing up */}
                    <div className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.product_image ? (
                        <img 
                          src={item.product_image} 
                          alt={item.product_name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-[14px] font-bold text-slate-900 mb-1 leading-snug line-clamp-2">
                        {item.product_name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap text-[12px]">
                        {item.variant_name && (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.variant_name}
                          </span>
                        )}
                        <span className="text-slate-400">Số lượng: x{item.quantity}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 whitespace-nowrap">
                      <span className="text-[15px] font-bold text-slate-900">
                        {((item.unit_price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} ₫
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-slate-400 mt-0.5 mb-0">
                          {(item.unit_price || 0).toLocaleString('vi-VN')} ₫ / món
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Địa chỉ nhận hàng & Vận chuyển */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Địa chỉ nhận hàng */}
              <div className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-[13px] uppercase">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Địa chỉ nhận hàng</span>
                </div>
                <div className="text-[13px] text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 m-0">
                    {order.shipping_address?.name || 'Nguyễn Minh Anh'}
                  </p>
                  <p className="text-slate-500 mt-0.5 mb-1">
                    {formatPhoneDisplay(order.shipping_address?.phone) || '0909 123 456'}
                  </p>
                  <p className="text-slate-700 m-0">
                    {order.shipping_address?.detail_address || '28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM'}
                  </p>
                </div>
              </div>

              {/* Thông tin vận chuyển & Tracking timeline */}
              <div className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between text-slate-900 font-bold text-[13px] uppercase pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Thông tin vận chuyển</span>
                  </div>
                  {shipment?.status && (
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full lowercase first-letter:uppercase">
                      {shipment.status}
                    </span>
                  )}
                </div>

                {shipment ? (
                  <div className="text-[13px] text-slate-600 space-y-3">
                    <div>
                      <p className="font-bold text-slate-900 m-0">
                        {shipment.carrier_name || (shipment.carrier === 'GHN' ? 'Giao Hàng Nhanh (GHN Express)' : shipment.carrier)}
                      </p>
                      {shipment.tracking_code && (
                        <p className="text-slate-500 mt-0.5 mb-1 font-mono text-[12px]">
                          Mã vận đơn: <span className="text-indigo-600 font-bold">{shipment.tracking_code}</span>
                        </p>
                      )}
                      {shipment.estimated_delivery && (
                        <p className="text-emerald-700 text-[12px] bg-emerald-50 px-2 py-1 rounded-md font-medium mt-1">
                          Dự kiến giao: {shipment.estimated_delivery.min_date} — {shipment.estimated_delivery.max_date}
                        </p>
                      )}
                    </div>

                    {/* Timeline các mốc vận chuyển */}
                    {shipment.timeline && shipment.timeline.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-2.5">
                        <p className="text-[12px] font-bold text-slate-800 m-0">Tiến trình giao hàng:</p>
                        <div className="space-y-2">
                          {shipment.timeline.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-[12px]">
                              <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 m-0">{step.note || step.status}</p>
                                {step.occurred_at && (
                                  <p className="text-[11px] text-slate-400 m-0">
                                    {new Date(step.occurred_at).toLocaleString('vi-VN')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[13px] text-slate-500 py-2">
                    <p className="m-0 font-medium text-slate-700">Người bán đang chuẩn bị hàng</p>
                    <p className="m-0 text-[12px] text-slate-400 mt-0.5">Mã vận đơn sẽ được cập nhật ngay khi bàn giao cho đơn vị vận chuyển.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Chính sách hỗ trợ */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Bảo vệ toàn diện bởi Taca Guarantee · Hỗ trợ đổi trả miễn phí trong 7 ngày</span>
              </div>
              <button 
                type="button"
                className="text-[12px] font-bold text-taca-primary hover:underline whitespace-nowrap cursor-pointer"
              >
                Gửi yêu cầu hỗ trợ
              </button>
            </div>

          </div>

          {/* Right Column (4 Cols) */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Tóm tắt thanh toán */}
            <div className="border border-slate-200/90 rounded-2xl p-6 bg-white space-y-5">
              <h3 className="text-[14px] font-bold text-slate-900 uppercase m-0 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-taca-primary" />
                <span>Chi tiết thanh toán</span>
              </h3>

              <div className="space-y-3 text-[13px] text-slate-600 pt-1">
                <div className="flex justify-between items-center">
                  <span>Tổng tiền hàng</span>
                  <span className="font-semibold text-slate-900 whitespace-nowrap">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-slate-900 whitespace-nowrap">
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>Voucher giảm giá</span>
                    <span className="whitespace-nowrap">-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row xl:flex-col 2xl:flex-row justify-between items-start sm:items-center xl:items-start 2xl:items-center gap-1.5">
                <span className="text-[13px] font-bold uppercase text-slate-800 whitespace-nowrap">Tổng thanh toán</span>
                <span className="text-[20px] font-black text-taca-sale whitespace-nowrap tracking-tight">
                  {finalTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[12px] text-slate-600 flex flex-col gap-1.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Phương thức:</span>
                  <strong className="text-slate-900">
                    {order.payment_method === 'VNPAY' || order.payment_method === 'VNPAY QR' ? 'VNPAY QR' : 'Thanh toán khi nhận hàng (COD)'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trạng thái:</span>
                  {order.payment_status === 'SUCCESS' ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      Đã thanh toán
                    </span>
                  ) : order.status === 'PENDING_PAYMENT' || order.payment_status === 'PENDING' ? (
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      Chờ thanh toán
                    </span>
                  ) : (
                    <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {order.payment_status || 'Chưa thanh toán'}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2.5">
                {(order.status === 'PENDING_PAYMENT' || (order.payment_status === 'PENDING' && order.status !== 'CANCELLED')) && (
                  <Button 
                    variant="primary" 
                    className="w-full !py-2.5 font-bold text-[13px] rounded-xl cursor-pointer bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center gap-2 shadow-xs"
                    onClick={() => setIsVnpayModalOpen(true)}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Thanh toán ngay bằng VNPAY QR</span>
                  </Button>
                )}

                {order.status === 'COMPLETED' && (
                  <Button 
                    variant="primary" 
                    className="w-full !py-2.5 font-bold text-[13px] rounded-xl cursor-pointer"
                    onClick={() => navigate('/account/reviews')}
                  >
                    Đánh giá sản phẩm
                  </Button>
                )}
                
                <button
                  type="button"
                  disabled={reordering}
                  onClick={handleReorder}
                  className="w-full py-2.5 rounded-xl border border-taca-primary text-taca-primary hover:bg-taca-primary/5 font-bold text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{reordering ? 'Đang thêm giỏ hàng...' : 'Mua lại đơn hàng này'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal thanh toán lại VNPAY QR */}
      <VnpayQrModal
        isOpen={isVnpayModalOpen}
        onClose={() => setIsVnpayModalOpen(false)}
        paymentId={order.payment_id || `pay-${order.id}`}
        orderId={order.id}
        amount={finalTotal}
        expiresAt={order.expires_at || order.reservation_expires_at}
        onPaymentSuccess={async () => {
          await orderApi.markOrderPaid(order.id, order.payment_id || `pay-${order.id}`);
          setIsVnpayModalOpen(false);
          fetchOrderDetail();
        }}
      />
    </div>
  );
};

export default OrderDetailPage;
