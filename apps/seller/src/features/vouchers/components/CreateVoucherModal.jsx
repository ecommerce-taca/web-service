import { useState } from 'react';
import PropTypes from 'prop-types';

export default function CreateVoucherModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('Ưu đãi khách mới');
  const [code, setCode] = useState('WELCOME300K');
  const [discountType, setDiscountType] = useState('FIXED');
  const [discountValue, setDiscountValue] = useState('300.000 ₫');
  const [minOrder, setMinOrder] = useState('10.000.000 ₫');
  const [budget, setBudget] = useState('100.000.000 ₫ / 1.000');
  const [dateRange, setDateRange] = useState('20/08/2026 – 31/08/2026');
  const [scope, setScope] = useState('ALL');
  const [targetAudience, setTargetAudience] = useState('CUSTOM_USERS'); // ALL, GROUP, CUSTOM_USERS
  const [selectedUsers, ] = useState(['Nguyễn Minh Anh', 'Trần Thu Hà', 'Lê Phương Thảo']);
  const [notification, setNotification] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification('Tạo voucher thành công! Voucher đã kích hoạt theo đối tượng chỉ định.');
    setTimeout(() => {
      if (onCreate) {
        onCreate({
          name,
          code,
          discountType,
          discountValue,
          minOrder,
          selectedUsers,
        });
      }
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[620px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 tracking-tight uppercase">
              TẠO VOUCHER CỬA HÀNG
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Thiết lập mã khuyến mãi và chỉ định đối tượng áp dụng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-[13px]">
          {/* Program name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Tên chương trình *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Voucher code */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Mã voucher *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 font-mono font-bold border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Type & Discount Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Loại giảm giá
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="FIXED">Giảm số tiền cố định</option>
                <option value="PERCENT">Giảm theo % giá trị đơn</option>
                <option value="SHIPPING">Miễn phí vận chuyển</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mức giảm
              </label>
              <input
                type="text"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Min order & Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Đơn tối thiểu
              </label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Ngân sách / Lượt dùng
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Validity period */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Thời gian áp dụng
            </label>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Scope selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
              Phạm vi áp dụng
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScope('ALL')}
                className={`px-4 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
                  scope === 'ALL'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Toàn shop
              </button>
              <button
                type="button"
                onClick={() => setScope('SPECIFIC_SPU')}
                className={`px-4 py-2 rounded-lg border text-[12px] font-semibold transition-colors ${
                  scope === 'SPECIFIC_SPU'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                SPU đã chọn
              </button>
            </div>
          </div>

          {/* Target Audience (Matching Penpot design: Select voucher users) */}
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-[13px] font-bold text-slate-900 mb-2">
              Đối tượng khách hàng
            </label>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTargetAudience('ALL')}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${
                  targetAudience === 'ALL'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('GROUP')}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${
                  targetAudience === 'GROUP'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Nhóm KH
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('CUSTOM_USERS')}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors ${
                  targetAudience === 'CUSTOM_USERS'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Chọn người dùng
              </button>
            </div>

            {targetAudience === 'CUSTOM_USERS' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[13px]">
                    {selectedUsers.length} người dùng đã chọn
                  </span>
                  <button
                    type="button"
                    onClick={() => alert('Mở danh sách khách hàng để chọn User ID')}
                    className="text-[12px] font-semibold text-[#4F46E5] hover:underline"
                  >
                    Chọn / sửa
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedUsers.map((u) => (
                    <span
                      key={u}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 shadow-2xs"
                    >
                      {u}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-indigo-50 text-[#4F46E5] font-bold text-[11px] rounded">
                    ＋1
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Áp dụng theo User ID, không phụ thuộc thiết bị.
                </p>
              </div>
            )}

            {/* Privacy notice banner */}
            <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[12px] text-amber-900 font-medium flex items-center gap-2">
              <span>🔒</span>
              <span>Chỉ người dùng được chọn mới nhìn thấy và áp dụng voucher.</span>
            </div>
          </div>

          {notification && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-[#4F46E5] font-semibold text-center text-[12px] animate-in fade-in">
              ✓ {notification}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-[12px] transition-colors"
            >
              Lưu nháp
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[12px] font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors"
              >
                Tạo voucher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateVoucherModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
};
