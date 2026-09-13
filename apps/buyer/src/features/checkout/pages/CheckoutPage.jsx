import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DeliveryAddressModal from '../components/DeliveryAddressModal';
import ApplyVoucherModal from '../components/ApplyVoucherModal';
import VnpayQrModal from '../components/VnpayQrModal';

const mockCheckoutItems = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max 256GB',
    variant: 'Titan tự nhiên',
    quantity: 1,
    price: 29490000,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    name: 'Sony WH-1000XM5',
    variant: 'Đen',
    quantity: 1,
    price: 7490000,
    image: 'https://via.placeholder.com/150',
  }
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items] = useState(mockCheckoutItems);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Modals state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isVnpayModalOpen, setIsVnpayModalOpen] = useState(false);

  const subtotal = 36980000;
  const shippingFee = 0;
  const shopDiscount = 300000;
  const tacaDiscount = 200000;
  const total = subtotal + shippingFee - shopDiscount - tacaDiscount;

  const handlePlaceOrder = () => {
    if (paymentMethod === 'VNPAY QR') {
      setIsVnpayModalOpen(true);
    } else {
      // Simulate order success
      alert('Đặt hàng thành công!');
      navigate('/account/orders');
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Thanh toán</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Địa chỉ nhận hàng */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-lg text-gray-900 uppercase">1 ĐỊA CHỈ NHẬN HÀNG</h2>
                <button 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-primary font-medium hover:text-primary-dark border border-gray-200 rounded-lg px-4 py-2 text-sm"
                >
                  Thay đổi
                </button>
              </div>
              <div className="mt-2">
                <p className="font-bold text-gray-900">Nguyễn Minh Anh • 0909 123 456</p>
                <p className="text-gray-600 mt-1">28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM</p>
              </div>
            </div>

            {/* 2. Sản phẩm & Vận chuyển */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg text-gray-900 uppercase mb-6">2 SẢN PHẨM & VẬN CHUYỂN</h2>
              
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                        {/* Image placeholder */}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.variant} - SL {item.quantity}</p>
                      </div>
                    </div>
                    <div className="font-bold text-[#E53935]">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-[#00C853] font-medium text-sm">
                  Giao tiêu chuẩn • Nhận 30/08 - 01/09 • Miễn phí
                </p>
              </div>
            </div>

            {/* 3. Phương thức thanh toán */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-lg text-gray-900 uppercase mb-4">3 PHƯƠNG THỨC THANH TOÁN</h2>
              <div className="flex flex-wrap gap-4">
                {['COD', 'VNPAY QR', 'Thẻ quốc tế'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2 border rounded-lg flex items-center text-sm font-medium transition-colors ${
                      paymentMethod === method 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center border ${
                      paymentMethod === method ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {paymentMethod === method && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
                    </span>
                    {method}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Lời nhắn cho người bán</h3>
                <textarea 
                  placeholder="Nhập ghi chú giao hàng..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-gray-900 uppercase">ĐƠN HÀNG CỦA BẠN</h2>
                <button 
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="text-primary border border-primary/30 rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-primary/5"
                >
                  Đổi voucher
                </button>
              </div>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({items.length})</span>
                  <span className="font-medium text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E53935]">Shop • APPLE300K</span>
                  <span className="font-medium text-[#E53935]">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">Taca • TACA200K</span>
                  <span className="font-medium text-primary">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tacaDiscount)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="font-bold text-2xl text-[#E53935]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors"
              >
                Đặt hàng
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với Điều khoản Taca và Chính sách bảo vệ người mua.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DeliveryAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
      <ApplyVoucherModal isOpen={isVoucherModalOpen} onClose={() => setIsVoucherModalOpen(false)} />
      <VnpayQrModal isOpen={isVnpayModalOpen} onClose={() => setIsVnpayModalOpen(false)} amount={total} />
    </div>
  );
}
