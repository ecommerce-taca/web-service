import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SellerHeader from './SellerHeader';
import SellerNav from './SellerNav';
import { getShopProfile } from '../../services/seller-shop.api';

export default function SellerLayout() {
  const location = useLocation();
  const isShell = location.pathname.startsWith('/seller');
  const buyerHomeUrl = isShell ? '/' : 'http://localhost:5173/';
  const buyerRegisterUrl = isShell ? '/account/seller-register' : 'http://localhost:5173/account/seller-register';

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchShopData = useCallback(async () => {
    try {
      const data = await getShopProfile();
      setShop(data);
    } catch (err) {
      console.warn('Lỗi kiểm tra hồ sơ shop:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    getShopProfile()
      .then((data) => {
        if (!ignore) {
          setShop(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('Lỗi kiểm tra hồ sơ shop:', err);
          setLoading(false);
        }
      });

    const handleKycUpdated = () => {
      getShopProfile().then((data) => {
        if (!ignore) setShop(data);
      });
    };

    window.addEventListener('taca:kyc_updated', handleKycUpdated);
    window.addEventListener('storage', handleKycUpdated);

    return () => {
      ignore = true;
      window.removeEventListener('taca:kyc_updated', handleKycUpdated);
      window.removeEventListener('storage', handleKycUpdated);
    };
  }, []);

  const kycStatus = shop?.kyc_status || 'NOT_REGISTERED';
  const isApproved = kycStatus === 'APPROVED';
  const isOnboarding = location.pathname.endsWith('/onboarding') || location.pathname.includes('/onboarding');

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Đang xác thực quyền truy cập Kênh Người Bán...</p>
        </div>
      </div>
    );
  }

  // Cho phép người bán có shop DRAFT, NEEDS_INFO hoặc REJECTED vào trang Onboarding để hoàn thiện hoặc chỉnh sửa hồ sơ
  const canAccessOnboarding = ['DRAFT', 'NEEDS_INFO', 'REJECTED'].includes(kycStatus) && isOnboarding;
  if (canAccessOnboarding) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
        <header className="bg-white border-b border-slate-200 h-[68px] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <span className="text-[26px] font-extrabold tracking-tight text-[#4F46E5] font-sans">
              taca
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              SELLER ONBOARDING
            </span>
          </div>
          <a
            href={buyerHomeUrl}
            className="text-[13px] font-semibold text-slate-600 hover:text-[#4F46E5] flex items-center gap-1.5 transition-colors no-underline"
          >
            <span>← Kênh người mua</span>
          </a>
        </header>
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    );
  }

  // Approval Gate: Nếu chưa được Admin phê duyệt, chặn vào Kênh Người Bán
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
        {/* Minimal Gate Header */}
        <header className="bg-white border-b border-slate-200 h-[68px] px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[26px] font-extrabold tracking-tight text-[#4F46E5] font-sans">
              taca
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              XÉT DUYỆT GIAN HÀNG
            </span>
          </div>

          <a
            href={buyerHomeUrl}
            className="text-[13px] font-semibold text-slate-600 hover:text-[#4F46E5] flex items-center gap-1.5 transition-colors no-underline"
          >
            <span>← Kênh người mua</span>
          </a>
        </header>

        {/* Main Gate Body */}
        <main className="flex-1 w-full max-w-[800px] mx-auto px-4 py-12 flex flex-col justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center">
            {kycStatus === 'PENDING' ? (
              <>
                <div className="w-20 h-20 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 text-amber-600 shadow-xs">
                  ⏳
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
                  Đang chờ Admin phê duyệt (Pending Review)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  Hồ sơ gian hàng đang được xét duyệt
                </h1>
                <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed mb-8">
                  Yêu cầu đăng ký người bán của bạn đã được gửi thành công tới Ban Quản Trị sàn Taca. 
                  Theo quy định hệ thống, <strong>chỉ sau khi Admin phê duyệt tài khoản</strong>, bạn mới có thể truy cập và sử dụng các tính năng của Kênh Người Bán.
                </p>

                {/* Shop summary card */}
                {shop && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 max-w-md mx-auto text-left mb-8 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Tên gian hàng:</span>
                      <span className="font-bold text-slate-800">{shop.name || 'Gian hàng mới'}</span>
                    </div>
                    {shop.business_name && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-slate-500 font-medium">Tên doanh nghiệp / Hộ KD:</span>
                        <span className="font-semibold text-slate-800">{shop.business_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Mã số thuế:</span>
                      <span className="font-mono font-semibold text-slate-800">{shop.tax_code_masked || shop.tax_code || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Trạng thái phê duyệt:</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Đang chờ xét duyệt
                      </span>
                    </div>
                  </div>
                )}

                {/* Flow Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <span className="font-bold block">1. Đăng ký tại Buyer</span>
                    <span className="text-[11px] text-emerald-700">✓ Đã nộp thành công</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs ring-2 ring-amber-400/30">
                    <span className="font-bold block">2. Admin phê duyệt</span>
                    <span className="text-[11px] text-amber-700">⏳ Đang xử lý hồ sơ</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs">
                    <span className="font-bold block">3. Kênh Người Bán</span>
                    <span className="text-[11px] text-slate-400">🔒 Mở sau khi duyệt</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={buyerHomeUrl}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs no-underline flex items-center justify-center gap-2"
                  >
                    <span>← Quay về Kênh Người Mua</span>
                  </a>
                  <button
                    type="button"
                    onClick={fetchShopData}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>⟳ Kiểm tra lại trạng thái</span>
                  </button>
                </div>
              </>
            ) : kycStatus === 'REJECTED' || kycStatus === 'NEEDS_INFO' ? (
              <>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xs ${
                  kycStatus === 'NEEDS_INFO'
                    ? 'bg-amber-50 border border-amber-200 text-amber-600'
                    : 'bg-rose-50 border border-rose-200 text-rose-600'
                }`}>
                  {kycStatus === 'NEEDS_INFO' ? '⚠️' : '✕'}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
                  kycStatus === 'NEEDS_INFO'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {kycStatus === 'NEEDS_INFO' ? 'Cần bổ sung thông tin (Needs Info)' : 'Hồ sơ bị từ chối (Rejected)'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  {kycStatus === 'NEEDS_INFO'
                    ? 'Hồ sơ gian hàng cần bổ sung thông tin'
                    : 'Hồ sơ đăng ký chưa được phê duyệt'}
                </h1>
                <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed mb-6">
                  Ban Quản Trị đã phản hồi về hồ sơ của bạn. Toàn bộ thông tin bạn đã nhập trước đó vẫn được lưu trữ nguyên vẹn dưới dạng Bản nháp (Draft). Bạn có thể truy cập trang Onboarding để cập nhật và gửi lại thẩm định.
                </p>

                {/* Hộp hiển thị lý do từ chối */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 max-w-lg mx-auto text-left mb-6 text-xs text-rose-900">
                  <span className="font-bold block mb-1">Lý do từ Ban Quản Trị:</span>
                  <p className="font-medium italic bg-white p-3 rounded-lg border border-rose-100 text-slate-800">
                    "{shop?.reject_reason || 'Tài liệu hoặc thông tin định danh chưa khớp với hồ sơ đăng ký. Vui lòng kiểm tra lại giấy tờ pháp lý.'}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={isShell ? '/seller/onboarding' : '/onboarding'}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-all shadow-xs no-underline flex items-center justify-center gap-2"
                  >
                    <span>Vào trang Onboarding chỉnh sửa & nộp lại →</span>
                  </a>
                  <a
                    href={buyerHomeUrl}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all no-underline"
                  >
                    ← Về Kênh Người Mua
                  </a>
                </div>
              </>
            ) : kycStatus === 'DRAFT' ? (
              <>
                <div className="w-20 h-20 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 text-[#4F46E5] shadow-xs">
                  📝
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-3">
                  Hoàn thiện hồ sơ (Onboarding)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  Gian hàng đang trong quá trình thiết lập
                </h1>
                <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed mb-8">
                  Gian hàng <strong>{shop?.name}</strong> đã được khởi tạo. Bạn cần hoàn tất tải lên CCCD, tài khoản ngân hàng và địa chỉ kho để gửi Ban Quản Trị phê duyệt.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={isShell ? '/seller/onboarding' : '/onboarding'}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-all shadow-xs no-underline flex items-center justify-center gap-2"
                  >
                    <span>Vào hoàn thiện hồ sơ Onboarding →</span>
                  </a>
                  <a
                    href={buyerHomeUrl}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all no-underline"
                  >
                    ← Về Kênh Người Mua
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 text-[#4F46E5] shadow-xs">
                  🏪
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-3">
                  Chưa đăng ký bán hàng
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  Bạn chưa đăng ký tài khoản Người Bán
                </h1>
                <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed mb-8">
                  Theo quy định hệ thống, thủ tục đăng ký người bán thực hiện tại <strong>Kênh Người Mua</strong>. Sau khi nộp đơn và được Admin phê duyệt, tài khoản của bạn mới có thể truy cập Kênh Người Bán.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={buyerRegisterUrl}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-all shadow-xs no-underline flex items-center justify-center gap-2"
                  >
                    <span>Đến trang Đăng ký Người Bán tại Buyer ↗</span>
                  </a>
                  <a
                    href={buyerHomeUrl}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all no-underline"
                  >
                    ← Về Kênh Người Mua
                  </a>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 px-6 lg:px-12 text-center text-[12px] text-slate-500">
          <p>© 2026 Taca Ecommerce System. Kênh Người Bán & Quản lý vận hành.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Unified Sticky Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white shadow-xs">
        <SellerHeader shopName={shop?.name} />
        <SellerNav />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <Outlet />
      </main>

      {/* Seller Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 lg:px-12 text-center text-[12px] text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Taca Ecommerce System. Kênh Người Bán & Quản lý vận hành đa dịch vụ.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-700 cursor-pointer">Chính sách người bán</span>
            <span className="hover:text-slate-700 cursor-pointer">Quy chế hoạt động</span>
            <span className="hover:text-slate-700 cursor-pointer">Hỗ trợ: 1900 6688</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
