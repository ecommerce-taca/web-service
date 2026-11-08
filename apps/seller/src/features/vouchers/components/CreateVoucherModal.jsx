import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Lock, CheckCircle2, Percent, Coins, Truck, Shuffle } from 'lucide-react';

// Gợi ý chương trình nhanh: bấm 1 cái điền cả Tên + Mã
const PROGRAM_SUGGESTIONS = [
  { name: 'Ưu đãi khách mới', code: 'WELCOME50K', type: 'FIXED', value: '50.000 ₫', minOrder: '200.000 ₫', limit: 500, days: 15 },
  { name: 'Freeship đơn đầu', code: 'FREESHIP', type: 'SHIPPING', value: '25.000 ₫', minOrder: '99.000 ₫', limit: 300, days: 7 },
  { name: 'Flash Sale cuối tuần', code: 'WEEKEND15', type: 'PERCENT', value: '15%', minOrder: '250.000 ₫', limit: 200, days: 3 },
  { name: 'Tri ân khách quen', code: 'VIP100K', type: 'FIXED', value: '100.000 ₫', minOrder: '499.000 ₫', limit: 100, days: 30 },
  { name: 'Siêu sale tháng này', code: 'MEGASALE', type: 'PERCENT', value: '20%', minOrder: '300.000 ₫', limit: 1000, days: 7 },
];

// Presets mức giảm
const DISCOUNT_BOXES = {
  FIXED: ['20.000 ₫', '30.000 ₫', '50.000 ₫', '100.000 ₫', '200.000 ₫', '300.000 ₫', '500.000 ₫'],
  PERCENT: ['5%', '10%', '15%', '20%', '30%', '50%'],
  SHIPPING: ['15.000 ₫', '25.000 ₫', '30.000 ₫', 'Tối đa 50.000 ₫', '100% Freeship'],
};

// Presets đơn tối thiểu
const MIN_ORDER_BOXES = ['0 ₫', '99.000 ₫', '199.000 ₫', '299.000 ₫', '499.000 ₫', '999.000 ₫', '10.000.000 ₫'];

// Presets lượt dùng
const USAGE_LIMIT_BOXES = [50, 100, 200, 500, 1000, 2000, 'Không giới hạn'];

// Presets thời hạn
const DURATION_BOXES = [
  { label: '3 ngày', days: 3 },
  { label: '7 ngày', days: 7 },
  { label: '15 ngày', days: 15 },
  { label: '30 ngày', days: 30 },
  { label: 'Đến cuối tháng', days: 'END_OF_MONTH' },
];

function calculateDateRange(days) {
  const start = new Date();
  let end = new Date();
  if (days === 'END_OF_MONTH') {
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  } else {
    end.setDate(start.getDate() + (Number(days) || 7));
  }
  const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

function generateRandomCode(prefix = 'TACA') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${rand}`;
}

export default function CreateVoucherModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('Ưu đãi khách mới');
  const [code, setCode] = useState('WELCOME300K');
  const [discountType, setDiscountType] = useState('FIXED');
  const [discountValue, setDiscountValue] = useState('300.000 ₫');
  const [minOrder, setMinOrder] = useState('10.000.000 ₫');
  const [usageLimit, setUsageLimit] = useState(1000);
  const [dateRange, setDateRange] = useState('20/08/2026 – 31/08/2026');
  const [scope, setScope] = useState('ALL');
  const [targetAudience, setTargetAudience] = useState('CUSTOM_USERS');
  const [selectedUsers] = useState(['Nguyễn Minh Anh', 'Trần Thu Hà', 'Lê Phương Thảo']);
  const [notification, setNotification] = useState(null);

  // Ngân sách ước tính
  const estimatedBudget = useMemo(() => {
    if (usageLimit === 'Không giới hạn') return 'Không giới hạn';
    const num = Number(usageLimit) || 1000;
    const rawVal = Number(String(discountValue).replace(/\D/g, '')) || 0;
    if (discountType === 'PERCENT') {
      return `${num.toLocaleString('vi-VN')} lượt`;
    }
    const total = rawVal * num;
    return `${total.toLocaleString('vi-VN')} ₫ / ${num.toLocaleString('vi-VN')}`;
  }, [discountValue, usageLimit, discountType]);

  if (!isOpen) return null;

  // Bấm chọn gợi ý chương trình
  const handleSelectProgram = (sug) => {
    setName(sug.name);
    setCode(sug.code);
    setDiscountType(sug.type);
    setDiscountValue(sug.value);
    setMinOrder(sug.minOrder);
    setUsageLimit(sug.limit);
    setDateRange(calculateDateRange(sug.days));
  };

  const handleSelectType = (type) => {
    setDiscountType(type);
    if (type === 'PERCENT') {
      setDiscountValue('15%');
    } else if (type === 'SHIPPING') {
      setDiscountValue('25.000 ₫');
    } else {
      setDiscountValue('50.000 ₫');
    }
  };

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
          budget: estimatedBudget,
          usageLimit: usageLimit === 'Không giới hạn' ? 999999 : Number(usageLimit),
          dateRange,
          scope,
          targetAudience,
          selectedUsers,
        });
      }
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Chuẩn Penpot */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight uppercase">
              TẠO VOUCHER CỬA HÀNG
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Thiết lập mã khuyến mãi và chỉ định đối tượng áp dụng
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-[13px]">

          {/* 1. TÊN CHƯƠNG TRÌNH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Tên chương trình *
              </label>
              <span className="text-[11px] text-slate-400 font-normal">Chọn gợi ý hoặc tự nhập</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên chương trình khuyến mãi..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] text-xs font-medium"
            />
            {/* Box chọn gợi ý nhanh */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PROGRAM_SUGGESTIONS.map((sug) => {
                const isSelected = name === sug.name;
                return (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => handleSelectProgram(sug)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-bold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{sug.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MÃ VOUCHER */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Mã voucher *
              </label>
              <button
                type="button"
                onClick={() => setCode(generateRandomCode('VOUCHER'))}
                className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3 h-3" aria-hidden="true" />
                <span>Đổi mã ngẫu nhiên</span>
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: WELCOME300K"
              className="w-full px-3 py-2 font-mono font-bold border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] text-xs uppercase tracking-wider"
            />
          </div>

          {/* 3. LOẠI GIẢM GIÁ (3 Box lựa chọn trực quan) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Loại giảm giá *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'FIXED', label: 'Giảm số tiền', icon: Coins },
                { id: 'PERCENT', label: 'Giảm theo %', icon: Percent },
                { id: 'SHIPPING', label: 'Freeship', icon: Truck },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = discountType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectType(item.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-[#4F46E5] bg-indigo-50/70 text-[#4F46E5] ring-2 ring-[#4F46E5]/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#4F46E5]' : 'text-slate-500'}`} aria-hidden="true" />
                    <span className="text-[12px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. MỨC GIẢM & ĐƠN TỐI THIỂU (2 Cột với Box chọn nhanh) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Cột Mức giảm */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mức giảm *
              </label>
              <input
                type="text"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] text-xs bg-white mb-1.5"
              />
              {/* Box mức giảm */}
              <div className="flex flex-wrap gap-1">
                {(DISCOUNT_BOXES[discountType] || DISCOUNT_BOXES.FIXED).map((preset) => {
                  const isSelected = discountValue === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDiscountValue(preset)}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4F46E5] bg-[#4F46E5] text-white font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cột Đơn tối thiểu */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Đơn tối thiểu *
              </label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] text-xs bg-white mb-1.5"
              />
              {/* Box đơn tối thiểu */}
              <div className="flex flex-wrap gap-1">
                {MIN_ORDER_BOXES.map((preset) => {
                  const isSelected = minOrder === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMinOrder(preset)}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4F46E5] bg-[#4F46E5] text-white font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. NGÂN SÁCH / LƯỢT DÙNG & THỜI GIAN ÁP DỤNG (2 Cột với Box chọn nhanh) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Cột Lượt dùng */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Ngân sách / Lượt dùng *
                </label>
              </div>
              <input
                type="text"
                value={estimatedBudget}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = Number(val.replace(/\D/g, ''));
                  if (num) setUsageLimit(num);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] text-xs bg-white mb-1.5"
              />
              {/* Box lượt dùng */}
              <div className="flex flex-wrap gap-1">
                {USAGE_LIMIT_BOXES.map((cnt) => {
                  const isSelected = usageLimit === cnt;
                  return (
                    <button
                      key={String(cnt)}
                      type="button"
                      onClick={() => setUsageLimit(cnt)}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4F46E5] bg-[#4F46E5] text-white font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {typeof cnt === 'number' ? `${cnt.toLocaleString('vi-VN')} lượt` : cnt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cột Thời gian áp dụng */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Thời gian áp dụng *
                </label>
              </div>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#4F46E5] text-xs bg-white font-mono mb-1.5"
              />
              {/* Box thời hạn */}
              <div className="flex flex-wrap gap-1">
                {DURATION_BOXES.map((dur) => (
                  <button
                    key={dur.label}
                    type="button"
                    onClick={() => setDateRange(calculateDateRange(dur.days))}
                    className="px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:border-slate-300"
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. PHẠM VI ÁP DỤNG */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Phạm vi áp dụng *
            </label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setScope('ALL')}
                className={`px-4 py-2 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer ${
                  scope === 'ALL'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Toàn shop
              </button>
              <button
                type="button"
                onClick={() => setScope('SPECIFIC_SPU')}
                className={`px-4 py-2 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer ${
                  scope === 'SPECIFIC_SPU'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                SPU đã chọn
              </button>
            </div>
          </div>

          {/* 7. ĐỐI TƯỢNG KHÁCH HÀNG */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block text-[12px] font-bold text-slate-900 uppercase mb-2">
              Đối tượng khách hàng
            </label>
            <div className="flex items-center gap-2 mb-2.5">
              <button
                type="button"
                onClick={() => setTargetAudience('ALL')}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer ${
                  targetAudience === 'ALL'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('GROUP')}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer ${
                  targetAudience === 'GROUP'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Nhóm KH
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('CUSTOM_USERS')}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer ${
                  targetAudience === 'CUSTOM_USERS'
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Chọn người dùng
              </button>
            </div>

            {targetAudience === 'CUSTOM_USERS' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[12px]">
                    {selectedUsers.length} người dùng đã chọn
                  </span>
                  <button
                    type="button"
                    onClick={() => alert('Mở danh sách khách hàng để chọn User ID')}
                    className="text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    Chọn / sửa
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedUsers.map((u) => (
                    <span
                      key={u}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800 shadow-2xs"
                    >
                      {u}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-indigo-50 text-[#4F46E5] font-bold text-[10px] rounded">
                    +1
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Áp dụng theo User ID, không phụ thuộc thiết bị.
                </p>
              </div>
            )}

            <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-medium flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
              <span>Chỉ người dùng được chọn mới nhìn thấy và áp dụng voucher.</span>
            </div>
          </div>

          {notification && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[#4F46E5] font-semibold text-center text-[12px] animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4F46E5]" aria-hidden="true" />
              <span>{notification}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-[12px] transition-colors cursor-pointer"
            >
              Lưu nháp
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-[12px] font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[12px] shadow-sm transition-colors cursor-pointer"
              >
                Tạo voucher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

CreateVoucherModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
};
