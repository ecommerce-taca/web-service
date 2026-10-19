import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getKycQueue } from '../../../services/admin-kyc.api';
import KycReviewModal from '../components/KycReviewModal';

export default function AdminKycPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [queue, setQueue] = useState([]);
  const [metrics, setMetrics] = useState({
    pending_count: 284,
    pending_today: 48,
    verified_count: 48216,
    verified_rate: '96,4% shop',
    high_risk_count: 62,
    temp_locked_count: 18,
    sla_avg: '3h 24m',
    sla_diff: '−18 phút',
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getKycQueue({ status: activeTab, q: searchQuery })
      .then((res) => {
        if (!isMounted) return;
        setQueue(res.data || []);
        if (res.meta?.metrics) {
          setMetrics(res.meta.metrics);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[AdminKycPage] fetchQueue error:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, searchQuery, reloadTrigger]);

  // Lắng nghe sự kiện đồng bộ tự động từ Buyer / Seller mà không thay đổi UI
  useEffect(() => {
    const handleReload = () => {
      setReloadTrigger((v) => v + 1);
    };

    window.addEventListener('taca:kyc_updated', handleReload);
    window.addEventListener('storage', handleReload);
    window.addEventListener('focus', handleReload);

    return () => {
      window.removeEventListener('taca:kyc_updated', handleReload);
      window.removeEventListener('storage', handleReload);
      window.removeEventListener('focus', handleReload);
    };
  }, []);

  const handleOpenReview = (item) => {
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  const handleDecisionSuccess = (shopId, decision) => {
    setQueue((prev) =>
      prev.map((item) => (item.shop_id === shopId ? { ...item, status: decision } : item))
    );
    setReloadTrigger((v) => v + 1);
  };

  const tabs = [
    { key: 'PENDING', label: 'Chờ duyệt', count: 284 },
    { key: 'NEEDS_INFO', label: 'Cần bổ sung', count: 18 },
    { key: 'APPROVED', label: 'Đã duyệt', count: 48216 },
    { key: 'REJECTED', label: 'Từ chối', count: 42 },
    { key: 'ALL', label: 'Tất cả' },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards matching Penpot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chờ KYC */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Chờ KYC
          </div>
          <div className="text-[28px] font-black text-slate-900 mt-1">
            {metrics.pending_count}
          </div>
          <div className="text-[11px] font-semibold text-blue-600 mt-1 flex items-center gap-1">
            <span>+{metrics.pending_today}</span>
            <span className="text-slate-400 font-normal">hôm nay</span>
          </div>
        </div>

        {/* Card 2: Đã xác minh */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Đã xác minh
          </div>
          <div className="text-[28px] font-black text-slate-900 mt-1">
            {metrics.verified_count.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">
            {metrics.verified_rate}
          </div>
        </div>

        {/* Card 3: Rủi ro cao */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Rủi ro cao
          </div>
          <div className="text-[28px] font-black text-rose-600 mt-1">
            {metrics.high_risk_count}
          </div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
            <span>Khóa tạm {metrics.temp_locked_count}</span>
          </div>
        </div>

        {/* Card 4: SLA trung bình */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            SLA trung bình
          </div>
          <div className="text-[28px] font-black text-slate-900 mt-1">
            {metrics.sla_avg}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">
            {metrics.sla_diff}
          </div>
        </div>
      </div>

      {/* Main Table Container matching Penpot */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Header & Tabs */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>KYC review queue</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {queue.length} hồ sơ
              </span>
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Hàng đợi xử lý hồ sơ đăng ký gian hàng và xác minh danh tính người bán.
            </p>
          </div>

          {/* Search & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]">⌕</span>
              <input
                id="admin-kyc-search"
                name="adminKycSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc tên shop, MST..."
                aria-label="Lọc tên shop hoặc mã số thuế"
                className="pl-7 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0A68FF] w-48"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-[13px] font-medium animate-pulse">
            Đang tải danh sách hàng đợi KYC...
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-[13px] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" aria-hidden="true" />
            <div className="font-bold text-slate-700">Hàng đợi trống</div>
            <div className="text-[12px]">Hiện không có hồ sơ nào thuộc trạng thái này.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-6">CỬA HÀNG</th>
                  <th className="py-3 px-4">LOẠI</th>
                  <th className="py-3 px-4">MST / CCCD</th>
                  <th className="py-3 px-4">RỦI RO</th>
                  <th className="py-3 px-4">NỘP LÚC</th>
                  <th className="py-3 px-6 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item) => (
                  <tr key={item.shop_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Shop Name */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.shop_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.legal_rep}</div>
                    </td>

                    {/* Business Type */}
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {item.business_type}
                    </td>

                    {/* Tax Code */}
                    <td className="py-4 px-4 font-mono text-slate-800 font-semibold">
                      {item.tax_code_masked || item.tax_code || '---'}
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-4">
                      {item.risk_level === 'HIGH' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                          Rủi ro cao
                        </span>
                      ) : item.risk_level === 'MEDIUM' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          Rủi ro TB
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Thấp
                        </span>
                      )}
                    </td>

                    {/* Submitted At */}
                    <td className="py-4 px-4 text-slate-500 text-[12px]">
                      {new Date(item.submitted_at).toLocaleDateString('vi-VN')}
                      <span className="block text-[10px] text-slate-400">
                        {item.age_hours ? `${item.age_hours}h trước` : ''}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0A68FF] hover:bg-[#0855D2] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Xem xét KYC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewOpen && (
        <KycReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          item={selectedItem}
          onDecisionSuccess={handleDecisionSuccess}
        />
      )}
    </div>
  );
}
