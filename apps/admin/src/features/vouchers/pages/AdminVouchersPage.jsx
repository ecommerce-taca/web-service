import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Ban, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { adminVoucherApi } from '../../../services/admin-voucher.api';
import PlatformVoucherModal from '../components/PlatformVoucherModal';
import StepUpMfaModal from '../../../components/common/StepUpMfaModal';

export default function AdminVouchersPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [meta, setMeta] = useState({
    active_count: 0,
    freeship_count: 0,
    total_redemptions: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  // Deactivate state
  const [deactivatingVoucher, setDeactivatingVoucher] = useState(null);
  const [isMfaDeactivateOpen, setIsMfaDeactivateOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const params = {
      code: searchQuery.trim(),
    };

    if (activeTab === 'ACTIVE' || activeTab === 'EXPIRED' || activeTab === 'INACTIVE') {
      params.status = activeTab;
    } else if (activeTab === 'FREESHIP') {
      params.scope = 'FREESHIP';
      params.status = 'ACTIVE';
    }

    adminVoucherApi
      .getAdminVouchers(params)
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          setVouchers(res.data);
        }
        if (res?.meta) {
          setMeta(res.meta);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Lỗi tải danh sách voucher:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, searchQuery, reloadTrigger]);

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (voucher) => {
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedVoucher, isEditing) => {
    setNotice(
      isEditing
        ? `Đã cập nhật thành công voucher ${savedVoucher.code}!`
        : `Đã phát hành thành công voucher toàn sàn ${savedVoucher.code}!`
    );
    setTimeout(() => setNotice(''), 4000);
    setReloadTrigger((v) => v + 1);
  };

  const handlePromptDeactivate = (voucher) => {
    setDeactivatingVoucher(voucher);
    setIsMfaDeactivateOpen(true);
  };

  const executeDeactivate = async (stepUpToken) => {
    if (!deactivatingVoucher) return;
    try {
      await adminVoucherApi.deleteAdminVoucher(
        deactivatingVoucher.voucher_id,
        { version: deactivatingVoucher.version || 1 },
        stepUpToken
      );
      setNotice(`Đã ngừng hoạt động voucher ${deactivatingVoucher.code}!`);
      setTimeout(() => setNotice(''), 4000);
      setReloadTrigger((v) => v + 1);
    } catch (err) {
      console.warn('Lỗi ngừng voucher:', err);
    } finally {
      setDeactivatingVoucher(null);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ACTIVE', label: 'Đang phát hành' },
    { key: 'FREESHIP', label: 'Freeship sàn' },
    { key: 'EXPIRED', label: 'Đã hết hạn' },
    { key: 'INACTIVE', label: 'Đã ngừng' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
            Platform Vouchers
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Quản lý mã giảm giá toàn sàn (PLATFORM) và trợ giá vận chuyển (FREESHIP).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
            Quyền: VOUCHER_MANAGE · 2FA ON
          </span>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[13px] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tạo voucher toàn sàn</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ĐANG HOẠT ĐỘNG</span>
          <div className="text-[26px] font-black text-blue-600 mt-2">
            {meta.active_count || vouchers.filter((v) => v.status === 'ACTIVE').length}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">Mã toàn sàn & freeship</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">VOUCHER FREESHIP</span>
          <div className="text-[26px] font-black text-emerald-600 mt-2">
            {meta.freeship_count || vouchers.filter((v) => v.scope === 'FREESHIP' && v.status === 'ACTIVE').length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">Trợ giá vận chuyển</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LƯỢT ÁP DỤNG</span>
          <div className="text-[26px] font-black text-indigo-600 mt-2">
            {(meta.total_redemptions || 0).toLocaleString('vi-VN')}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">Tổng lượt checkout</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">QUY CHUẨN BACKEND</span>
          <div className="text-[26px] font-black text-slate-900 mt-2">
            v1 3-Slot
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 mt-1 inline-block">Platform · Shop · Freeship</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="admin-voucher-search"
              name="adminVoucherSearch"
              type="text"
              aria-label="Tìm kiếm mã voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mã voucher..."
              className="pl-9 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 w-56"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-[13px] font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" aria-hidden="true" />
            <span>Đang tải danh sách voucher toàn sàn...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-[13px] space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
            <div className="font-bold text-slate-700">Không tìm thấy voucher nào</div>
            <div className="text-[12px]">Thử thay đổi bộ lọc hoặc tạo voucher mới.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-6">MÃ VOUCHER</th>
                  <th className="py-3 px-6">TIÊU ĐỀ & ĐIỀU KIỆN</th>
                  <th className="py-3 px-6 text-right">MỨC GIẢM</th>
                  <th className="py-3 px-6 text-center">TIẾN ĐỘ SỬ DỤNG</th>
                  <th className="py-3 px-6 text-center">HIỆU LỰC</th>
                  <th className="py-3 px-6 text-center">TRẠNG THÁI</th>
                  <th className="py-3 px-6 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vouchers.map((v) => {
                  const isFreeship = v.scope === 'FREESHIP';
                  const usagePct = v.usage_limit > 0 ? Math.round(((v.used_count || 0) / v.usage_limit) * 100) : 0;
                  const isActive = v.status === 'ACTIVE';

                  return (
                    <tr key={v.voucher_id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code + Scope Badge */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-blue-600 text-[14px]">
                            {v.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              isFreeship
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {v.scope}
                          </span>
                        </div>
                      </td>

                      {/* Title & Min Order */}
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-800">{v.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Đơn tối thiểu: {Number(v.min_order).toLocaleString('vi-VN')}₫
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-6 text-right font-black text-slate-900">
                        {v.discount_type === 'PERCENT'
                          ? `Giảm ${v.value}%`
                          : `Giảm ${Number(v.value).toLocaleString('vi-VN')}₫`}
                      </td>

                      {/* Usage Progress */}
                      <td className="py-3.5 px-6">
                        <div className="max-w-[120px] mx-auto space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <span>{v.used_count || 0}</span>
                            <span className="text-slate-400">/ {v.usage_limit}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                usagePct >= 100 ? 'bg-rose-500' : usagePct > 80 ? 'bg-amber-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(usagePct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Validity Period */}
                      <td className="py-3.5 px-6 text-center text-slate-500 text-[11px]">
                        <div>{new Date(v.starts_at).toLocaleDateString('vi-VN')}</div>
                        <div className="text-slate-400">→ {new Date(v.expires_at).toLocaleDateString('vi-VN')}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            v.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.status === 'EXPIRED'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {v.status === 'ACTIVE' ? 'Đang chạy' : v.status === 'EXPIRED' ? 'Hết hạn' : 'Đã ngừng'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(v)}
                            title="Chỉnh sửa voucher"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => handlePromptDeactivate(v)}
                              title="Ngừng phát hành sớm"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Ban className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal (MISS-011) */}
      <PlatformVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        voucher={editingVoucher}
        onSuccess={handleModalSuccess}
      />

      {/* Step-Up MFA for Deactivation */}
      <StepUpMfaModal
        isOpen={isMfaDeactivateOpen}
        title="Xác thực Ngừng Phát Hành Voucher"
        description={`Thao tác dừng sớm voucher ${deactivatingVoucher?.code || ''} yêu cầu xác thực 2FA Step-Up (§3.8 order-commerce.md). Vui lòng nhập mã OTP để tiếp tục.`}
        onClose={() => {
          setIsMfaDeactivateOpen(false);
          setDeactivatingVoucher(null);
        }}
        onSuccess={(stepUpToken) => {
          setIsMfaDeactivateOpen(false);
          executeDeactivate(stepUpToken);
        }}
      />
    </div>
  );
}
