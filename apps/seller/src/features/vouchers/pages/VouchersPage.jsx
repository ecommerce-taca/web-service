import { useState, useEffect, useCallback } from 'react';
import { X, Ticket } from 'lucide-react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import CreateVoucherModal from '../components/CreateVoucherModal';
import {
  getSellerVouchers,
  createSellerVoucher,
} from '../services/seller-voucher.api';

export default function VouchersPage() {
  const [vouchersData, setVouchersData] = useState({ metrics: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSellerVouchers({
        status: activeTab,
        search: searchQuery,
      });
      setVouchersData(data);
    } catch (err) {
      console.warn('Lỗi tải danh sách vouchers:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVouchers();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchVouchers]);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'active', label: 'Đang chạy' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
    { id: 'expired', label: 'Đã kết thúc' },
  ];

  const handleCreateVoucher = async (formData) => {
    try {
      await createSellerVoucher(formData);
      setFeedback({
        type: 'success',
        text: `Đã tạo thành công voucher "${formData.code || 'Mới'}" cho gian hàng!`,
      });
      fetchVouchers();
    } catch {
      setFeedback({ type: 'error', text: 'Có lỗi xảy ra khi tạo voucher mới!' });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Khuyến mãi & Voucher
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Tạo mã giảm giá theo cửa hàng, sản phẩm, khách hàng và thời gian áp dụng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>＋</span>
          <span>Tạo voucher</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-[13px] font-semibold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Đóng thông báo"
            className="text-slate-400 hover:text-slate-600 p-1 ml-3"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(vouchersData.metrics || []).map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.value}
            trend={m.trend}
            isPositive={m.isPositive}
          />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#4F46E5] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Tìm mã voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setFeedback({ type: 'info', text: 'Bộ lọc nâng cao theo đối tượng và ngân sách đang được áp dụng.' })}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-[13px]">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Đang tải danh sách voucher...</p>
          </div>
        ) : (vouchersData.items || []).length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-[13px]">
            <Ticket className="w-10 h-10 mx-auto mb-2 text-slate-300" aria-hidden="true" />
            <p className="font-semibold text-slate-700">Chưa có voucher nào</p>
            <p className="text-[12px] text-slate-400 mt-1">Bấm nút Tạo voucher phía trên để thiết lập ưu đãi mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">MÃ / TÊN</th>
                  <th className="py-3.5 px-6">LOẠI</th>
                  <th className="py-3.5 px-6">MỨC GIẢM</th>
                  <th className="py-3.5 px-6">ĐIỀU KIỆN</th>
                  <th className="py-3.5 px-6">ĐÃ DÙNG / TỔNG</th>
                  <th className="py-3.5 px-6">THỜI GIAN</th>
                  <th className="py-3.5 px-6">TRẠNG THÁI</th>
                  <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(vouchersData.items || []).map((v) => {
                  const usedCount = typeof v.used === 'number' ? v.used : 0;
                  const totalCount = typeof v.total === 'number' && v.total > 0 ? v.total : 1000;
                  const percentUsed = Math.min(100, Math.round((usedCount / totalCount) * 100));
                  return (
                    <tr key={v.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-900 text-[14px]">
                          {v.code}
                        </div>
                        <div className="text-[12px] text-slate-500 mt-0.5">
                          {v.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {v.type}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-[#4F46E5]">
                        {v.discount}
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-[12px]">
                        {v.condition}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">
                          {usedCount.toLocaleString()} / {totalCount.toLocaleString()}
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            style={{ width: `${percentUsed}%` }}
                            className="h-full bg-[#4F46E5] rounded-full"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-[12px] font-medium">
                        {v.time_range}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={v.status} type={v.status_type} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setFeedback({ type: 'info', text: `Đang mở trình biên tập cấu hình cho voucher ${v.code}` })}
                          className="text-[12px] font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Voucher Modal */}
      <CreateVoucherModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateVoucher}
      />
    </div>
  );
}
