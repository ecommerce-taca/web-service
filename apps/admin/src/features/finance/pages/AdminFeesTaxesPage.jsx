import { useState, useEffect } from 'react';
import { Plus, Check, Edit2 } from 'lucide-react';
import { adminFinanceApi } from '../../../services/admin-finance.api';
import CreateFeeRuleModal from '../components/CreateFeeRuleModal';

export default function AdminFeesTaxesPage() {
  const [fees, setFees] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const loadFeeData = async () => {
    try {
      const feeRes = await adminFinanceApi.getFees();
      if (feeRes?.data) {
        setFees(feeRes.data);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu phí:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFeeData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveRule = (ruleId) => {
    setFees((prev) =>
      prev.map((r) =>
        r.version_id === ruleId
          ? { ...r, status: 'ACTIVE', status_label: 'Hoạt động' }
          : r
      )
    );
    setNotice(`Đã phê duyệt quy tắc biểu phí #${ruleId}!`);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header - Khớp Penpot Board Taca Admin / Fees / Taxes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
            Fees / Taxes
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Cấu hình commission, phí thanh toán, VAT và trợ giá.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
            Quyền: FINANCE_OPS · 2FA ON
          </span>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[13px] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tạo biểu phí</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* 4 Metric Cards - Khớp Penpot Board Taca Admin / Fees / Taxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DOANH THU PHÍ</span>
          <div className="text-[26px] font-black text-slate-900 mt-2">
            846 tỷ ₫
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">↑ +12,2% MoM</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">COMMISSION TB</span>
          <div className="text-[26px] font-black text-indigo-600 mt-2">
            5,8%
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">↑ +0,2 điểm</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TRỢ GIÁ</span>
          <div className="text-[26px] font-black text-amber-600 mt-2">
            62,4 tỷ ₫
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">7,4% phí</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">QUY TẮC HIỆU LỰC</span>
          <div className="text-[26px] font-black text-slate-900 mt-2">
            128
          </div>
          <span className="text-[11px] font-semibold text-rose-500 mt-1 inline-block">6 sắp hết hạn</span>
        </div>
      </div>

      {/* Fee and Tax Rules Table - Khớp Penpot Board Taca Admin / Fees / Taxes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              Fee and tax rules
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Quy tắc tỷ lệ hoa hồng, phí thanh toán và VAT theo phiên bản (Effective-dated)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-6">QUY TẮC</th>
                <th className="py-3 px-6">PHẠM VI</th>
                <th className="py-3 px-6 text-right">COMMISSION</th>
                <th className="py-3 px-6 text-right">PAYMENT</th>
                <th className="py-3 px-6 text-right">VAT</th>
                <th className="py-3 px-6 text-center">HIỆU LỰC</th>
                <th className="py-3 px-6 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-6 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {fees.map((rule) => {
                const isApproved = rule.status === 'ACTIVE';
                const isPending = rule.status === 'PENDING';
                return (
                  <tr key={rule.version_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div>{rule.name}</div>
                      <div className="text-[11px] font-normal text-slate-400 font-mono">{rule.version_id}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700">
                      <span className="font-medium text-slate-800">{rule.scope_label || rule.scope}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-indigo-600">
                      {(rule.rate_bps / 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-700">
                      {((rule.payment_rate_bps || 150) / 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-700">
                      {((rule.vat_rate_bps || 1000) / 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-6 text-center text-slate-600 font-medium">
                      {rule.effective_range || `${new Date(rule.effective_from).toLocaleDateString('vi-VN')}`}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {rule.status_label || (isApproved ? 'Hoạt động' : isPending ? 'Chờ duyệt' : 'Bản nháp')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleApproveRule(rule.version_id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Duyệt
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" aria-hidden="true" />
                          <span>Sửa</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Biểu Phí */}
      <CreateFeeRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadFeeData();
          setNotice('Đã tạo thành công quy tắc biểu phí mới!');
          setTimeout(() => setNotice(''), 4000);
        }}
      />
    </div>
  );
}
