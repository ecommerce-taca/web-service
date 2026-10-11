import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { registerSeller, getSellerRegistrationStatus, fetchSellerRegistrationStatus } from '../services/seller-register.api';

const getSellerUrl = (path = '/seller') => {
  if (typeof window !== 'undefined' && window.location.port === '5174') {
    return `http://${window.location.hostname}:5173${path}`;
  }
  return path;
};

export default function SellerRegisterPage() {
  const { user, openAuthModal } = useAuth();
  const [form, setForm] = useState({
    name: '',
    business_name: '',
    tax_code: '',
    slug: '',
    description: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState(() => getSellerRegistrationStatus(user?.id));

  useEffect(() => {
    let ignore = false;
    const initialStatus = getSellerRegistrationStatus(user?.id);
    setRegistrationStatus(initialStatus);
    if (initialStatus?.shop) {
      const s = initialStatus.shop;
      setForm((prev) => ({
        ...prev,
        name: s.name || prev.name,
        business_name: s.business_name || prev.business_name,
        tax_code: s.tax_code || prev.tax_code,
        slug: s.slug || prev.slug,
        description: s.description || prev.description,
      }));
    }

    fetchSellerRegistrationStatus(user?.id)
      .then((status) => {
        if (!ignore && status) {
          setRegistrationStatus(status);
          if (status.shop) {
            const s = status.shop;
            setForm((prev) => ({
              ...prev,
              name: s.name || prev.name,
              business_name: s.business_name || prev.business_name,
              tax_code: s.tax_code || prev.tax_code,
              slug: s.slug || prev.slug,
              description: s.description || prev.description,
            }));
          }
        }
      })
      .catch((err) => {
        console.warn('Lỗi kiểm tra trạng thái seller từ API:', err);
      });

    return () => {
      ignore = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const handleKycUpdated = () => {
      setRegistrationStatus(getSellerRegistrationStatus(user?.id));
      fetchSellerRegistrationStatus(user?.id).then((status) => {
        if (status) setRegistrationStatus(status);
      });
    };

    window.addEventListener('taca:kyc_updated', handleKycUpdated);
    window.addEventListener('storage', handleKycUpdated);

    return () => {
      window.removeEventListener('taca:kyc_updated', handleKycUpdated);
      window.removeEventListener('storage', handleKycUpdated);
    };
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản và Quy chế hoạt động người bán.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await registerSeller({
        name: form.name.trim(),
        business_name: form.business_name.trim(),
        tax_code: form.tax_code.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
      });
      setRegistrationStatus(getSellerRegistrationStatus(user?.id));
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
        err?.message ||
        'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (val) => {
    if (!val) return 'Mới gửi';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? 'Mới gửi' : d.toLocaleString('vi-VN');
    } catch {
      return 'Mới gửi';
    }
  };

  // 1. Trường hợp chưa đăng nhập
  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0A68FF] border border-blue-200 flex items-center justify-center text-3xl mx-auto shadow-2xs">
          🏪
        </div>
        <h2 className="text-[20px] font-extrabold text-slate-900">
          Đăng ký Bán hàng cùng Taca
        </h2>
        <p className="text-[13px] text-slate-500 max-w-md mx-auto">
          Vui lòng đăng nhập bằng tài khoản Buyer của bạn trước khi đăng ký mở gian hàng.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal()}
          className="px-6 py-2.5 bg-[#0A68FF] hover:bg-[#0855D2] text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // 2. Trường hợp chưa xác thực email
  if (user.email_verified === false) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-3xl mx-auto shadow-2xs">
          ✉
        </div>
        <h2 className="text-[20px] font-extrabold text-slate-900">
          Yêu cầu xác thực Email
        </h2>
        <p className="text-[13px] text-slate-500 max-w-md mx-auto">
          Theo quy định bảo mật hệ thống, tài khoản của bạn cần hoàn tất xác thực email (<strong>{user.email}</strong>) trước khi đăng ký trở thành Người Bán.
        </p>
        <p className="text-[12px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 inline-block">
          Vui lòng kiểm tra hộp thư đến hoặc nhấn vào đường dẫn xác thực được gửi tới email của bạn.
        </p>
      </div>
    );
  }

  // 3. Trường hợp vừa tạo Shop và đang ở trạng thái DRAFT (Cần vào Seller Onboarding hoàn thành KYC)
  if (registrationStatus.hasShop && registrationStatus.kycStatus === 'DRAFT') {
    const shop = registrationStatus.shop;
    return (
      <div className="p-8 space-y-6">
        <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[16px] font-extrabold text-slate-900">
                  Gian hàng đã được tạo thành công!
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                  DRAFT
                </span>
              </div>
              <p className="text-[12px] text-slate-600 mt-1">
                Thông tin cơ bản đã được lưu. Bước tiếp theo: vui lòng truy cập Kênh Người Bán để hoàn thiện thủ tục Onboarding (Tải lên CCCD 2 mặt, Giấy phép kinh doanh, Tài khoản ngân hàng và Địa chỉ kho) trước khi gửi thẩm định.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-indigo-100 text-[12px] space-y-1.5 font-medium text-slate-700">
            <div><strong>Tên gian hàng:</strong> {shop?.name}</div>
            <div><strong>Pháp nhân / Đơn vị:</strong> {shop?.business_name}</div>
            <div><strong>Mã số thuế:</strong> {shop?.tax_code_masked || shop?.tax_code}</div>
            <div><strong>Thời gian tạo:</strong> {formatDateTime(shop?.created_at)}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[12px] text-slate-600 text-center sm:text-left">
            Tiếp tục đến trang Onboarding để hoàn tất các bước và gửi duyệt.
          </span>
          <a
            href={getSellerUrl('/seller/onboarding')}
            className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors no-underline inline-flex items-center gap-1.5"
          >
            <span>Đến Kênh Người Bán hoàn tất hồ sơ →</span>
          </a>
        </div>
      </div>
    );
  }

  // 4. Trường hợp đã đăng ký và đang chờ duyệt (PENDING)
  if (registrationStatus.hasShop && registrationStatus.kycStatus === 'PENDING') {
    const shop = registrationStatus.shop;
    return (
      <div className="p-8 space-y-6">
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              ⏳
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[16px] font-extrabold text-slate-900">
                  Hồ sơ gian hàng đang chờ Admin phê duyệt
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  PENDING
                </span>
              </div>
              <p className="text-[12px] text-slate-600 mt-1">
                Hồ sơ đăng ký của bạn đã được gửi thành công đến Ban Quản trị (Admin). Sau khi Quản trị viên thẩm định và phê duyệt, bạn mới có thể truy cập Kênh Người Bán.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 text-[12px] space-y-1.5 font-medium text-slate-700">
            <div><strong>Tên gian hàng:</strong> {shop?.name}</div>
            <div><strong>Pháp nhân / Đơn vị:</strong> {shop?.business_name}</div>
            <div><strong>Mã số thuế:</strong> {shop?.tax_code_masked || shop?.tax_code}</div>
            <div><strong>Thời gian gửi:</strong> {formatDateTime(shop?.updated_at || shop?.created_at)}</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-500 text-center">
          Trạng thái sẽ tự động được cập nhật tại trang này ngay khi Quản trị viên duyệt hồ sơ của bạn.
        </div>
      </div>
    );
  }

  // 4.1. Trường hợp hồ sơ bị từ chối (REJECTED) hoặc cần bổ sung (NEEDS_INFO)
  if (registrationStatus.hasShop && (registrationStatus.kycStatus === 'REJECTED' || registrationStatus.kycStatus === 'NEEDS_INFO')) {
    const shop = registrationStatus.shop;
    const isNeedsInfo = registrationStatus.kycStatus === 'NEEDS_INFO';
    return (
      <div className="p-8 space-y-6">
        <div className={`p-6 rounded-2xl border space-y-4 text-center sm:text-left ${
          isNeedsInfo ? 'bg-amber-50/70 border-amber-200' : 'bg-rose-50/70 border-rose-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-white border flex items-center justify-center text-2xl shadow-xs shrink-0 ${
              isNeedsInfo ? 'border-amber-200 text-amber-600' : 'border-rose-200 text-rose-600'
            }`}>
              {isNeedsInfo ? '⚠️' : '✕'}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[16px] font-extrabold text-slate-900">
                  {isNeedsInfo ? 'Hồ sơ người bán cần bổ sung thông tin' : 'Hồ sơ đăng ký người bán chưa được phê duyệt'}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isNeedsInfo ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {registrationStatus.kycStatus}
                </span>
              </div>
              <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                Ban Quản Trị đã phản hồi về hồ sơ của bạn. Toàn bộ thông tin bạn đã thiết lập trước đó (Hồ sơ, 3 giấy tờ KYC, Kho hàng, Ngân hàng) vẫn được <strong>bảo toàn nguyên vẹn dưới dạng Bản nháp (Draft)</strong>. Bạn không cần đăng ký lại từ đầu!
              </p>
            </div>
          </div>

          {/* Khối lý do từ chối từ Ban Quản Trị */}
          <div className="bg-white p-4 rounded-xl border border-rose-100 text-[12px] space-y-2 text-slate-800">
            <div className="font-bold text-rose-700 flex items-center gap-1.5">
              <span>Lý do phản hồi từ Ban Quản Trị:</span>
            </div>
            <p className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-rose-900 font-medium italic">
              "{shop?.reject_reason || 'Tài liệu định danh hoặc thông tin kho hàng chưa khớp yêu cầu thẩm định. Vui lòng kiểm tra lại.'}"
            </p>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div><strong>Tên gian hàng:</strong> {shop?.name}</div>
              <div><strong>Pháp nhân:</strong> {shop?.business_name}</div>
              <div><strong>Mã số thuế:</strong> {shop?.tax_code_masked || shop?.tax_code}</div>
              <div><strong>Thời gian gửi:</strong> {formatDateTime(shop?.updated_at || shop?.created_at)}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[12px] text-slate-600 text-center sm:text-left">
            Truy cập trang Onboarding để xem lại bản nháp, thay thế giấy tờ cần thiết và gửi lại thẩm định.
          </span>
          <a
            href={getSellerUrl('/seller/onboarding')}
            className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors no-underline inline-flex items-center gap-1.5"
          >
            <span>Vào Kênh Người Bán chỉnh sửa & nộp lại →</span>
          </a>
        </div>
      </div>
    );
  }

  // 4.2. Trường hợp đã được phê duyệt (APPROVED)
  if (registrationStatus.hasShop && registrationStatus.kycStatus === 'APPROVED') {
    const shop = registrationStatus.shop;
    return (
      <div className="p-8 space-y-6 text-center">
        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 tracking-wider">
              ĐÃ PHÊ DUYỆT
            </span>
            <h2 className="text-[20px] font-black text-slate-900 mt-2">
              Gian hàng {shop?.name} đã sẵn sàng!
            </h2>
            <p className="text-[13px] text-slate-600 mt-1">
              Quản trị viên đã phê duyệt tài khoản người bán của bạn. Bạn có thể truy cập Kênh Người Bán ngay bây giờ để quản lý sản phẩm và đơn hàng.
            </p>
          </div>
          <a
            href={getSellerUrl('/seller')}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors no-underline"
          >
            <span>Vào Kênh Người Bán →</span>
          </a>
        </div>
      </div>
    );
  }

  // 5. Form đăng ký mới (chưa có shop hoặc nộp lại)
  return (
    <div className="p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
          Đăng ký trở thành Người Bán (Kênh Người Bán)
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Cung cấp thông tin gian hàng và mã số thuế để bắt đầu kinh doanh trên nền tảng Taca.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[12px] text-rose-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-[13px] max-w-2xl">
        {/* Tên gian hàng */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
            Tên hiển thị gian hàng <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="VD: Taca Digital Store, Gia Dụng Xanh..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A68FF]"
          />
        </div>

        {/* Tên pháp nhân */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
            Tên doanh nghiệp / Hộ kinh doanh đại diện <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            placeholder="VD: CÔNG TY TNHH TACA DIGITAL hoặc HỘ KINH DOANH MINH ANH"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A68FF]"
          />
        </div>

        {/* Mã số thuế */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
            Mã số thuế doanh nghiệp / hộ kinh doanh <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            name="tax_code"
            value={form.tax_code}
            onChange={handleChange}
            placeholder="VD: 0318429081 (10-14 chữ số)"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A68FF] font-mono"
          />
        </div>

        {/* Đường dẫn tùy chỉnh */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
            Đường dẫn gian hàng (Slug - Tùy chọn)
          </label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="VD: taca-digital-store"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A68FF] font-mono text-[12px]"
          />
        </div>

        {/* Giới thiệu */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
            Giới thiệu gian hàng
          </label>
          <textarea
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả ngành hàng, sản phẩm chủ lực và cam kết chất lượng..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#0A68FF]"
          />
        </div>

        {/* Checkbox điều khoản */}
        <label className="flex items-start gap-2.5 cursor-pointer text-[12px] text-slate-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
          />
          <span>
            Tôi cam kết các thông tin khai báo trên là chính xác và đồng ý tuân thủ{' '}
            <span className="text-blue-600 font-semibold underline">Quy chế hoạt động Người Bán Taca</span>.
          </span>
        </label>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#0A68FF] hover:bg-[#0855D2] text-white rounded-xl font-bold text-[13px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ đăng ký Người Bán'}
          </button>
        </div>
      </form>
    </div>
  );
}
