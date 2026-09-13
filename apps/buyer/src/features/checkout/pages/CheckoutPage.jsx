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
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[13px] text-slate-500">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">Thanh toán</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Thanh toán</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Địa chỉ nhận hàng */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-[14px] font-extrabold text-slate-900 uppercase">1 ĐỊA CHỈ NHẬN HÀNG</h2>
                <button 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-[12px] font-bold text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  Thay đổi
                </button>
              </div>
              <div className="mt-2">
                <p className="text-[13px] font-bold text-slate-900">Nguyễn Minh Anh • 0909 123 456</p>
                <p className="text-[11px] font-medium text-slate-600 mt-1">28 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM</p>
              </div>
            </div>

            {/* 2. Sản phẩm & Vận chuyển */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="text-[14px] font-extrabold text-slate-900 uppercase mb-6">2 SẢN PHẨM & VẬN CHUYỂN</h2>
              
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-24 h-24 bg-indigo-50 rounded-lg flex-shrink-0">
                        {/* Image placeholder */}
                      </div>
                      <div className="ml-4 flex flex-col pt-1">
                        <h3 className="text-[12px] font-extrabold text-slate-900 line-clamp-2">{item.name}</h3>
                        <p className="text-[10px] font-medium text-slate-600 mt-1">{item.variant} - SL {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-[13px] font-extrabold text-rose-600 pt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-[12px] font-bold text-emerald-600">
                  Giao tiêu chuẩn • Nhận 30/08 - 01/09 • Miễn phí
                </p>
              </div>
            </div>

            {/* 3. Phương thức thanh toán */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h2 className="text-[14px] font-extrabold text-slate-900 uppercase mb-4">3 PHƯƠNG THỨC THANH TOÁN</h2>
              <div className="flex flex-wrap gap-4">
                {['COD', 'VNPAY QR', 'Thẻ quốc tế'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2 border rounded-lg flex items-center transition-colors ${
                      paymentMethod === method 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center border ${
                      paymentMethod === method ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentMethod === method && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>}
                    </span>
                    <span className="text-[11px] font-bold">{method === 'COD' ? '● ' : (paymentMethod === method ? '● ' : '○ ')}{method}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-[12px] font-bold text-slate-900 mb-3">Lời nhắn cho người bán</h3>
                <textarea 
                  placeholder="Nhập ghi chú giao hàng..."
                  className="w-full border border-slate-200 bg-white rounded-lg p-3 text-[11px] font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 resize-none"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[14px] font-extrabold text-slate-900 uppercase">ĐƠN HÀNG CỦA BẠN</h2>
              <button 
                onClick={() => setIsVoucherModalOpen(true)}
                className="text-indigo-600 border border-slate-200 rounded-lg px-4 py-1.5 text-[11px] font-bold hover:bg-indigo-50 transition-colors"
              >
                Đổi voucher
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-[11px] font-medium text-slate-600">Tạm tính ({items.length})</span>
                <span className="text-[11px] font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] font-medium text-slate-600">Phí vận chuyển</span>
                <span className="text-[11px] font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] font-medium text-rose-600">Shop • APPLE300K</span>
                <span className="text-[11px] font-bold text-rose-600">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] font-medium text-indigo-600">Taca • TACA200K</span>
                <span className="text-[11px] font-bold text-indigo-600">- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tacaDiscount)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-extrabold text-slate-900">Tổng thanh toán</span>
                <span className="text-[18px] font-extrabold text-rose-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold py-3.5 rounded-lg transition-colors uppercase"
            >
              Đặt hàng
            </button>
            
            <p className="text-[10px] font-medium text-slate-500 text-center mt-4">
              Bằng việc đặt hàng, bạn đồng ý với Điều khoản Taca và Chính sách bảo vệ người mua.
            </p>
          </div>
        </div>
      </div>

      <DeliveryAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
      <ApplyVoucherModal isOpen={isVoucherModalOpen} onClose={() => setIsVoucherModalOpen(false)} />
      <VnpayQrModal isOpen={isVnpayModalOpen} onClose={() => setIsVnpayModalOpen(false)} amount={total} />
    </div>
  );
}
