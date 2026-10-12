import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/hooks/useCart';
import { useAuth } from '../../auth/hooks/useAuth';
import { addressApi } from '../../account/services/address.api';
import { orderApi } from '../../account/services/order.api';
import { formatPhoneDisplay } from '../../../../../../shared/utils/phone';
import DeliveryAddressModal from '../components/DeliveryAddressModal';
import ApplyVoucherModal from '../components/ApplyVoucherModal';
import VnpayQrModal from '../components/VnpayQrModal';
import { Button } from '@taca/ui-components';
import { Check } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // KHÔNG gọi clearCart sau khi mua hàng để giữ nguyên giỏ hàng theo yêu cầu
  const { selectedItems, items: cartItems } = useCart();

  // Danh sách sản phẩm thanh toán
  const items = selectedItems.length > 0 ? selectedItems : cartItems;

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderNote, setOrderNote] = useState('');

  // Modals state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isVnpayModalOpen, setIsVnpayModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tính tiền cơ bản
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 5000000 || subtotal === 0 ? 0 : 30000;

  // Quản lý voucher linh hoạt (có thể bỏ chọn / xóa dấu tick)
  const [selectedShopVoucher, setSelectedShopVoucher] = useState(() => {
    if (subtotal >= 10000000) {
      return {
        id: 'SHOP_DISCOUNT_APPLE300K',
        code: 'APPLE300K',
        title: 'Giảm 300.000 ₫',
        discount_amount: 300000,
        provider: 'SHOP'
      };
    }
    return null;
  });

  const [selectedTacaVoucher, setSelectedTacaVoucher] = useState(() => {
    if (subtotal >= 5000000) {
      return {
        id: 'TACA_DISCOUNT_TACA200K',
        code: 'TACA200K',
        title: 'Giảm 200.000 ₫ toàn sàn',
        discount_amount: 200000,
        provider: 'TACA'
      };
    }
    return null;
  });

  // Tải danh sách địa chỉ đã lưu trong account (gọi ngay khi mount)
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await addressApi.getAddresses();
      const list = res.data?.data || res.data || [];
      setAddresses(list);
      if (list.length > 0) {
        setSelectedAddress(prev => prev || list.find(a => a.is_default) || list[0]);
      }
    } catch (e) {
      console.error('Failed to load saved addresses', e);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Giảm giá tính động dựa trên voucher đang được chọn thực tế
  const shopDiscount = selectedShopVoucher ? (selectedShopVoucher.discount_amount || 0) : 0;
  const tacaDiscount = selectedTacaVoucher ? (selectedTacaVoucher.discount_amount || 0) : 0;
  const total = Math.max(0, subtotal + shippingFee - shopDiscount - tacaDiscount);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert('Không có sản phẩm nào để thanh toán!');
      navigate('/cart');
      return;
    }

    if (paymentMethod === 'VNPAY QR') {
      setIsVnpayModalOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await orderApi.createOrder({
        items,
        total,
        shipping_fee: shippingFee,
        discount_amount: shopDiscount + tacaDiscount,
        voucher_codes: [selectedShopVoucher?.code, selectedTacaVoucher?.code].filter(Boolean),
        payment_method: 'COD',
        shipping_address: selectedAddress
      });
      // KHÔNG gọi clearCart() để giỏ hàng vẫn còn sau khi mua hàng
      navigate('/account/orders');
    } catch (e) {
      console.error('Failed to create order', e);
      alert('Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVnpaySuccess = async () => {
    setIsVnpayModalOpen(false);
    try {
      setIsSubmitting(true);
      await orderApi.createOrder({
        items,
        total,
        shipping_fee: shippingFee,
        discount_amount: shopDiscount + tacaDiscount,
        voucher_codes: [selectedShopVoucher?.code, selectedTacaVoucher?.code].filter(Boolean),
        payment_method: 'VNPAY QR',
        shipping_address: selectedAddress
      });
      // KHÔNG gọi clearCart() để giỏ hàng vẫn còn sau khi mua hàng
      navigate('/account/orders');
    } catch (e) {
      console.error('Failed to create order via VNPAY', e);
      alert('Đã thanh toán nhưng chưa lưu đơn hàng, vui lòng liên hệ hỗ trợ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thông tin địa chỉ hiển thị
  const recipientName = selectedAddress?.recipient || selectedAddress?.recipient_name || selectedAddress?.name || user?.full_name || 'Khách hàng';
  const recipientPhone = formatPhoneDisplay(selectedAddress?.phone || user?.phone || '0909123456');
  const recipientFullAddress = selectedAddress
    ? [
        selectedAddress.line1 || selectedAddress.detail_address || selectedAddress.address,
        selectedAddress.line2,
        selectedAddress.ward || selectedAddress.ward_name,
        selectedAddress.province || selectedAddress.province_name
      ].filter(Boolean).join(', ')
    : '28 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';

  return (
    <div className="bg-taca-surface min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[13px] text-taca-text-muted">
        <Link to="/" className="hover:text-taca-primary text-inherit no-underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/cart" className="hover:text-taca-primary text-inherit no-underline">Giỏ hàng</Link>
        <span className="mx-2">/</span>
        <span className="text-taca-text-main font-semibold">Thanh toán</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <h1 className="text-2xl font-bold text-taca-text-main mb-6">Thanh toán</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column */}
          <div className="flex-1 space-y-6 w-full">
            
            {/* 1. Địa chỉ nhận hàng */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-taca-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[14px] font-extrabold text-taca-text-main uppercase">1. ĐỊA CHỈ NHẬN HÀNG</h2>
                <button 
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="bg-white border border-taca-border rounded-lg px-4 py-1.5 text-[12px] font-bold text-taca-primary hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Thay đổi
                </button>
              </div>

              <div className="mt-2 text-[13px]">
                <p className="font-bold text-taca-text-main">
                  {recipientName} • <span className="font-bold text-taca-text-main">{recipientPhone}</span>
                </p>
                <p className="font-medium text-taca-text-muted mt-1 leading-relaxed">
                  {recipientFullAddress}
                </p>
              </div>
            </div>

            {/* 2. Sản phẩm & Vận chuyển */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-taca-border">
              <h2 className="text-[14px] font-extrabold text-taca-text-main uppercase mb-6">2. SẢN PHẨM & VẬN CHUYỂN</h2>
              
              <div className="space-y-6">
                {items.length === 0 ? (
                  <p className="text-sm text-taca-text-muted">Chưa có sản phẩm nào được chọn.</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex items-start justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="w-20 h-20 bg-slate-50 rounded-lg flex-shrink-0 overflow-hidden border border-taca-border">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-4 flex flex-col pt-1">
                          <h3 className="text-[13px] font-bold text-taca-text-main line-clamp-2 leading-snug">{item.name}</h3>
                          <p className="text-[11px] font-medium text-taca-text-muted mt-1">{item.variant} - SL: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-[13px] font-extrabold text-taca-sale pt-1 flex-shrink-0 ml-4">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-taca-border">
                <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1.5">
                  {shippingFee === 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Miễn phí vận chuyển tiêu chuẩn toàn quốc</span>
                    </>
                  ) : (
                    'Phí vận chuyển tiêu chuẩn: 30.000 ₫'
                  )}
                </p>
              </div>
            </div>

            {/* 3. Phương thức thanh toán - Đã XÓA Thẻ quốc tế theo yêu cầu */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-taca-border">
              <h2 className="text-[14px] font-extrabold text-taca-text-main uppercase mb-4">3. PHƯƠNG THỨC THANH TOÁN</h2>
              <div className="flex flex-wrap gap-4">
                {['COD', 'VNPAY QR'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-5 py-2.5 border rounded-lg flex items-center transition-colors cursor-pointer ${
                      paymentMethod === method 
                        ? 'border-taca-primary bg-indigo-50/50 text-taca-primary font-bold' 
                        : 'border-taca-border bg-white text-taca-text-muted hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full mr-2.5 flex items-center justify-center border ${
                      paymentMethod === method ? 'border-taca-primary' : 'border-slate-300'
                    }`}>
                      {paymentMethod === method && <span className="w-2 h-2 bg-taca-primary rounded-full"></span>}
                    </span>
                    <span className="text-[13px] font-medium">{method}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label htmlFor="order-notes" className="text-[12px] font-bold text-taca-text-main block mb-2">Lời nhắn cho người bán</label>
                <textarea 
                  id="order-notes"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Nhập ghi chú giao hàng hoặc dặn dò shop..."
                  className="w-full border border-taca-border bg-white rounded-lg p-3 text-[12px] font-medium text-taca-text-main focus:outline-none focus:ring-1 focus:ring-taca-primary focus:border-taca-primary resize-none"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] bg-white rounded-lg p-6 shadow-sm border border-taca-border flex flex-col flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[14px] font-extrabold text-taca-text-main uppercase">ĐƠN HÀNG CỦA BẠN</h2>
              <button 
                type="button"
                onClick={() => setIsVoucherModalOpen(true)}
                className="text-taca-primary border border-taca-border rounded-lg px-3 py-1 text-[11px] font-bold hover:bg-indigo-50 transition-colors cursor-pointer bg-transparent"
              >
                {(selectedShopVoucher || selectedTacaVoucher) ? 'Đổi voucher' : 'Chọn voucher'}
              </button>
            </div>
            
            <div className="space-y-3 mb-6 text-[13px]">
              <div className="flex justify-between">
                <span className="text-taca-text-muted">Tạm tính ({items.length} món)</span>
                <span className="font-bold text-taca-text-main">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-taca-text-muted">Phí vận chuyển</span>
                <span className="font-bold text-taca-text-main">
                  {shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                </span>
              </div>
              {shopDiscount > 0 && selectedShopVoucher && (
                <div className="flex justify-between text-taca-sale">
                  <span>Shop • {selectedShopVoucher.code}</span>
                  <span className="font-bold">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopDiscount)}</span>
                </div>
              )}
              {tacaDiscount > 0 && selectedTacaVoucher && (
                <div className="flex justify-between text-taca-primary">
                  <span>Taca • {selectedTacaVoucher.code}</span>
                  <span className="font-bold">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tacaDiscount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-taca-border pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-extrabold text-taca-text-main">Tổng thanh toán</span>
                <span className="text-[20px] font-extrabold text-taca-sale">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>

            <Button 
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={items.length === 0 || isSubmitting}
              className="w-full h-12 text-[14px] font-bold rounded-[8px] uppercase tracking-wider"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
            </Button>
            
            <p className="text-[11px] font-medium text-taca-text-muted text-center mt-4">
              Bằng việc đặt hàng, bạn đồng ý với Điều khoản Taca và Chính sách bảo vệ người mua.
            </p>
          </div>
        </div>
      </div>

      {/* Modal chọn địa chỉ nhận hàng đã lưu */}
      <DeliveryAddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          setIsAddressModalOpen(false);
        }}
        onAddressCreated={(newAddr) => {
          fetchAddresses();
          if (newAddr) setSelectedAddress(newAddr);
        }}
      />


      {/* Modal chọn voucher (duy nhất 1 thanh cuộn, cho phép bỏ tick / chọn lại) */}
      <ApplyVoucherModal 
        isOpen={isVoucherModalOpen} 
        onClose={() => setIsVoucherModalOpen(false)}
        selectedShopVoucher={selectedShopVoucher}
        selectedTacaVoucher={selectedTacaVoucher}
        subtotal={subtotal}
        onApplyVouchers={({ shopVoucher, tacaVoucher }) => {
          setSelectedShopVoucher(shopVoucher);
          setSelectedTacaVoucher(tacaVoucher);
        }}
      />

      {/* Modal mã QR VNPAY */}
      <VnpayQrModal 
        isOpen={isVnpayModalOpen} 
        onClose={() => setIsVnpayModalOpen(false)} 
        onSuccess={handleVnpaySuccess}
        amount={total} 
      />
    </div>
  );
}
