import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';

export default function AdminFeesTaxesPage() {
  const [fees, setFees] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [newRateBps, setNewRateBps] = useState('500'); // 5.00%
  const [newTaxBps, setNewTaxBps] = useState('100'); // 1.00%
  const [scope, setScope] = useState('PLATFORM');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-01');
  const [stepUpToken, setStepUpToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      adminFinanceApi.getFees(),
      adminFinanceApi.getTaxes()
    ]).then(([feeRes, taxRes]) => {
      if (!isMounted) return;
      if (feeRes.status === 'fulfilled' && feeRes.value?.data) {
        setFees(feeRes.value.data);
      }
      if (taxRes.status === 'fulfilled' && taxRes.value?.data) {
        setTaxes(taxRes.value.data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminFinanceApi.updateFees({
        scope,
        rate_bps: Number(newRateBps),
        effective_from: new Date(effectiveDate).toISOString(),
        note: `Cập nhật phí sàn ${scope} ngày ${effectiveDate}`
      }, stepUpToken);

      setNotice('Đã tạo thành công phiên bản phí hoa hồng mới (Effective-dated)!');
      setTimeout(() => setNotice(''), 4000);
      const updated = await adminFinanceApi.getFees();
      if (updated?.data) setFees(updated.data);
    } catch (err) {
      console.warn('Lỗi cập nhật phí:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTax = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminFinanceApi.updateTaxes({
        tax_rate_bps: Number(newTaxBps),
        effective_from: new Date(effectiveDate).toISOString()
      }, stepUpToken);

      setNotice('Đã cập nhật thành công tỷ lệ khấu trừ thuế sàn!');
      setTimeout(() => setNotice(''), 4000);
      const updated = await adminFinanceApi.getTaxes();
      if (updated?.data) setTaxes(updated.data);
    } catch (err) {
      console.warn('Lỗi cập nhật thuế:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
            Cấu hình Phí sàn & Thuế (Fees & Taxes)
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Quy định tỷ lệ hoa hồng sàn (commission), thuế khấu trừ và cơ chế quản lý phiên bản theo thời gian hiệu lực.
          </p>
        </div>
        <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          Quyền: FINANCE_OPS + 2FA
        </span>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid: 2 Tables for Commission and Tax Rules - Khớp Penpot Board Table / Fee and tax rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Commission Rules (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
                  LỊCH SỬ CẤU HÌNH PHÍ HOA HỒNG SÀN
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Append-only, áp dụng tự động cho các đơn hàng phát sinh sau ngày hiệu lực</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-6">MÃ PHIÊN BẢN</th>
                    <th className="py-3 px-6">PHẠM VI</th>
                    <th className="py-3 px-6">MỨC PHÍ</th>
                    <th className="py-3 px-6">NGÀY HIỆU LỰC</th>
                    <th className="py-3 px-6">GHI CHÚ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.map((f) => (
                    <tr key={f.version_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{f.version_id}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                          {f.scope}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-extrabold text-[#0A68FF]">
                        {(f.rate_bps / 100).toFixed(2)} %
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-medium">
                        {new Date(f.effective_from).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-[12px]">{f.note || 'Mặc định'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form thêm mức phí mới */}
          <form onSubmit={handleUpdateFee} className="p-6 border-t border-slate-200 bg-slate-50/30 space-y-4">
            <span className="text-[12px] font-bold text-slate-800 uppercase block">Thiết lập tỷ lệ hoa hồng mới</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="commission-rate" className="text-[11px] font-bold text-slate-600 block mb-1">MỨC PHÍ (%)</label>
                <div className="relative">
                  <input
                    id="commission-rate"
                    type="number"
                    step="0.01"
                    value={Number(newRateBps) / 100}
                    onChange={(e) => setNewRateBps(String(Math.round(Number(e.target.value) * 100)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] font-bold bg-white"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold text-[12px]">%</span>
                </div>
              </div>
              <div>
                <label htmlFor="commission-scope" className="text-[11px] font-bold text-slate-600 block mb-1">PHẠM VI</label>
                <select
                  id="commission-scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] font-semibold bg-white"
                >
                  <option value="PLATFORM">TOÀN SÀN (PLATFORM)</option>
                  <option value="CATEGORY">NGÀNH HÀNG (CATEGORY)</option>
                </select>
              </div>
              <div>
                <label htmlFor="effective-date" className="text-[11px] font-bold text-slate-600 block mb-1">NGÀY BẮT ĐẦU HIỆU LỰC</label>
                <input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <input
                type="password"
                placeholder="Mã 2FA (nếu có)"
                value={stepUpToken}
                onChange={(e) => setStepUpToken(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-[12px] bg-white max-w-[180px]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0A68FF] hover:bg-blue-600 text-white rounded-lg font-bold text-[12px] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Đang lưu...' : '+ Ban hành phiên bản mới'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Tax Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
                QUY ĐỊNH THUẾ KHẤU TRỪ TẠI NGUỒN
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Khấu trừ tự động vào doanh thu của Shop</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-6">MÃ CẤU HÌNH</th>
                    <th className="py-3 px-6">TỶ LỆ KHẤU TRỪ</th>
                    <th className="py-3 px-6">HIỆU LỰC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxes.map((t) => (
                    <tr key={t.version_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{t.version_id}</td>
                      <td className="py-3.5 px-6 font-extrabold text-slate-900">
                        {(t.tax_rate_bps / 100).toFixed(2)} %
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-medium">
                        {new Date(t.effective_from).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form cập nhật thuế */}
          <form onSubmit={handleUpdateTax} className="p-6 border-t border-slate-200 bg-slate-50/30 space-y-4">
            <span className="text-[12px] font-bold text-slate-800 uppercase block">Cập nhật mức thuế</span>
            <div>
              <label htmlFor="tax-rate" className="text-[11px] font-bold text-slate-600 block mb-1">TỶ LỆ KHẤU TRỪ (%)</label>
              <div className="relative">
                <input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  value={Number(newTaxBps) / 100}
                  onChange={(e) => setNewTaxBps(String(Math.round(Number(e.target.value) * 100)))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] font-bold bg-white"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-bold text-[12px]">%</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[12px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Lưu tỷ lệ thuế mới
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
