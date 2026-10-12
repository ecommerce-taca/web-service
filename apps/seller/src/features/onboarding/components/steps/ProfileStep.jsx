import PropTypes from 'prop-types';

/**
 * Step 1: Thông tin hồ sơ gian hàng (Tên, Tên công ty, MST, Mô tả)
 */
export default function ProfileStep({ profileForm, setProfileForm, onSaveProfile, saving }) {
  return (
    <form onSubmit={onSaveProfile} className="space-y-6 text-[13px] max-w-3xl">
      <div>
        <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
          BƯỚC 1: THÔNG TIN HỒ SƠ GIAN HÀNG
        </h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Cập nhật tên thương hiệu, tên pháp lý doanh nghiệp và mã số thuế (PUT /seller/onboarding/profile).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tên gian hàng *
          </label>
          <input
            type="text"
            required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Tên công ty / Hộ kinh doanh *
          </label>
          <input
            type="text"
            required
            value={profileForm.business_name}
            onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            Mã số thuế doanh nghiệp * (10–14 chữ số)
          </label>
          <input
            type="text"
            required
            value={profileForm.tax_code}
            onChange={(e) => setProfileForm({ ...profileForm, tax_code: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
          Mô tả gian hàng
        </label>
        <textarea
          rows={4}
          value={profileForm.description}
          onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#4F46E5]"
        />
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu & Tiếp tục sang KYC →'}
        </button>
      </div>
    </form>
  );
}

ProfileStep.propTypes = {
  profileForm: PropTypes.shape({
    name: PropTypes.string.isRequired,
    business_name: PropTypes.string.isRequired,
    tax_code: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  setProfileForm: PropTypes.func.isRequired,
  onSaveProfile: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
};
