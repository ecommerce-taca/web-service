import { useState } from 'react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import CreateVoucherModal from '../components/CreateVoucherModal';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

export default function VouchersPage() {
  const { vouchers } = SELLER_MOCK_DATA;
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'active', label: 'Đang chạy' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
    { id: 'expired', label: 'Đã kết thúc' },
  ];

  const filteredVouchers = vouchers.items.filter((item) => {
    if (activeTab === 'active' && item.status_type !== 'active') return false;
    if (activeTab === 'upcoming' && item.status_type !== 'upcoming') return false;
    if (activeTab === 'expired' && item.status_type !== 'expired') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span>＋</span>
          <span>Tạo voucher</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {vouchers.metrics.map((m) => (
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
            onClick={() => alert('Bộ lọc theo đối tượng người dùng, ngân sách')}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors"
          >
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
              {filteredVouchers.map((v) => {
                const percentUsed = Math.round((v.used / v.total) * 100);
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
                        {v.used.toLocaleString()} / {v.total.toLocaleString()}
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
                        onClick={() => alert(`Chỉnh sửa voucher ${v.code}`)}
                        className="text-[12px] font-semibold text-[#4F46E5] hover:underline"
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
      </div>

      {/* Create Voucher Modal */}
      <CreateVoucherModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
