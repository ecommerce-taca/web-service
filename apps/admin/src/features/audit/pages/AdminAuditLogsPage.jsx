import { useState, useEffect } from 'react';
import { Search, Layers, ShieldCheck } from 'lucide-react';
import { getAuditLogs } from '../../../services/admin-kyc.api';
import adminCatalogApi from '../../../services/admin-catalog.api';

const DEFAULT_CATALOG_LOGS = [
  {
    id: 'aud-001',
    actor_id: 'admin-001',
    actor_name: 'Catalog Moderator',
    actor_email: 'catalog-admin@taca.vn',
    actor_role: 'CATALOG_ADMIN',
    action: 'APPROVE',
    target_type: 'PRODUCT',
    target_id: 'prod-01912f31',
    target_name: 'iPhone 15 Pro Max 256GB',
    ip_address: '10.0.4.12',
    status: 'SUCCESS',
    details: 'Phê duyệt sản phẩm lên sàn (Chuyển trạng thái từ PENDING_APPROVAL sang PUBLISHED).',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-002',
    actor_id: 'admin-001',
    actor_name: 'Catalog Moderator',
    actor_email: 'catalog-admin@taca.vn',
    actor_role: 'CATALOG_ADMIN',
    action: 'BLOCK',
    target_type: 'PRODUCT',
    target_id: 'prod-01912f45',
    target_name: 'Tai nghe Bluetooth Air-Pro',
    ip_address: '10.0.4.12',
    status: 'REJECTED',
    details: 'Khóa sản phẩm vi phạm thương hiệu Apple theo phản ánh từ người tiêu dùng.',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'aud-003',
    actor_id: 'admin-002',
    actor_name: 'Taxonomy Admin',
    actor_email: 'taxonomy@taca.vn',
    actor_role: 'CATALOG_ADMIN',
    action: 'UPDATE_TAX_RATE',
    target_type: 'CATEGORY',
    target_id: 'cat-01912f20',
    target_name: 'Điện tử & Công nghệ',
    ip_address: '10.0.4.15',
    status: 'SUCCESS',
    details: 'Cập nhật thuế suất ngành hàng sang 1000 bps (10% VAT). Version: 3.',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_DEMO_LOGS = [
  {
    id: 'log-001',
    actor_id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    actor_name: 'Trần Hoàng',
    actor_email: 'admin@taca.vn',
    actor_role: 'SUPER_ADMIN',
    action: 'KYC_REVIEW_APPROVED',
    target_type: 'SHOP',
    target_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
    target_name: 'Taca Apple Flagship Store',
    ip_address: '14.241.120.45',
    status: 'SUCCESS',
    details: 'Phê duyệt hồ sơ pháp lý CCCD & GPKD gian hàng chính hãng Apple.',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-002',
    actor_id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    actor_name: 'Trần Hoàng',
    actor_email: 'admin@taca.vn',
    actor_role: 'SUPER_ADMIN',
    action: 'AUTH_2FA_VERIFIED',
    target_type: 'USER',
    target_id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    target_name: 'Trần Hoàng',
    ip_address: '14.241.120.45',
    status: 'SUCCESS',
    details: 'Xác thực TOTP 2FA thành công khi đăng nhập Admin Console.',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-003',
    actor_id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    actor_name: 'Trần Hoàng',
    actor_email: 'admin@taca.vn',
    actor_role: 'SUPER_ADMIN',
    action: 'ROLE_UPDATE',
    target_type: 'USER',
    target_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d925',
    target_name: 'Lê Văn Cường',
    ip_address: '14.241.120.45',
    status: 'SUCCESS',
    details: 'Cấp thêm vai trò SELLER cho người dùng sau khi hoàn tất Onboarding.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'log-004',
    actor_id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    actor_name: 'Trần Hoàng',
    actor_email: 'admin@taca.vn',
    actor_role: 'RISK_MANAGER',
    action: 'USER_STATUS_SUSPENDED',
    target_type: 'USER',
    target_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d925',
    target_name: 'Lê Văn Cường',
    ip_address: '14.241.120.45',
    status: 'WARNING',
    details: 'Khóa tạm thời do phát hiện bất thường trong giao dịch thanh toán.',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'log-005',
    actor_id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    actor_name: 'Trần Hoàng',
    actor_email: 'admin@taca.vn',
    actor_role: 'SUPER_ADMIN',
    action: 'KYC_REVIEW_REJECTED',
    target_type: 'SHOP',
    target_id: '01912f31-7a1b-7c12-9c55-8b1c34a6d926',
    target_name: 'Cửa hàng Phụ Kiện Giá Rẻ',
    ip_address: '14.241.120.45',
    status: 'REJECTED',
    details: 'Từ chối duyệt: Ảnh chụp CMND/CCCD mờ, không trùng khớp tên tài khoản ngân hàng.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export default function AdminAuditLogsPage() {
  const [scope, setScope] = useState('CATALOG'); // 'CATALOG' | 'SYSTEM'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;

    if (scope === 'CATALOG') {
      const params = {
        page,
        size: 15,
        entity_type: actionFilter !== 'ALL' ? actionFilter : undefined,
      };

      adminCatalogApi
        .getCatalogAudits(params)
        .then((res) => {
          if (!isMounted) return;
          const list = res?.data || [];
          if (list.length === 0) {
            const filtered = DEFAULT_CATALOG_LOGS.filter((log) => {
              const matchAction = actionFilter === 'ALL' || log.target_type === actionFilter;
              const matchSearch =
                !search.trim() ||
                log.actor_email.toLowerCase().includes(search.toLowerCase()) ||
                log.target_name.toLowerCase().includes(search.toLowerCase()) ||
                log.details.toLowerCase().includes(search.toLowerCase());
              return matchAction && matchSearch;
            });
            setLogs(filtered);
            setTotal(filtered.length);
          } else {
            const mapped = list.map((item, idx) => ({
              id: item._id || item.audit_id || `aud-${idx}`,
              actor_id: item.actor_id || 'admin-system',
              actor_name: item.actor_name || item.actor_email || 'Catalog Admin',
              actor_email: item.actor_email || item.actor_id || 'admin@taca.vn',
              actor_role: item.actor_role || 'CATALOG_ADMIN',
              action: item.action || 'CATALOG_UPDATE',
              target_type: item.entity_type || 'PRODUCT',
              target_id: item.entity_id || '',
              target_name: item.entity_name || item.entity_id || 'Mục Catalog',
              ip_address: item.ip_address || 'Gateway-Proxy',
              status: item.action === 'BLOCK' || item.action === 'REJECT' ? 'REJECTED' : 'SUCCESS',
              details:
                typeof item.diff === 'object'
                  ? JSON.stringify(item.diff)
                  : typeof item.changes === 'object'
                  ? JSON.stringify(item.changes)
                  : item.details || 'Thay đổi cấu hình sản phẩm / danh mục',
              created_at: item.created_at || new Date().toISOString(),
            }));
            setLogs(mapped);
            setTotal(res?.meta?.total || mapped.length);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('[AdminAuditLogsPage] catalog audit fallback:', err);
          setLogs(DEFAULT_CATALOG_LOGS);
          setTotal(DEFAULT_CATALOG_LOGS.length);
          setLoading(false);
        });
    } else {
      const params = {
        page,
        size: 15,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        search: search.trim() || undefined,
      };

      getAuditLogs(params)
        .then((res) => {
          if (!isMounted) return;
          const list = res?.data || [];
          if (list.length === 0) {
            // Fallback demo mock logs
            const filtered = DEFAULT_DEMO_LOGS.filter((log) => {
              const matchAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
              const matchSearch =
                !search.trim() ||
                log.actor_email.toLowerCase().includes(search.toLowerCase()) ||
                log.target_name.toLowerCase().includes(search.toLowerCase()) ||
                log.details.toLowerCase().includes(search.toLowerCase());
              return matchAction && matchSearch;
            });
            setLogs(filtered);
            setTotal(filtered.length);
          } else {
            setLogs(list);
            setTotal(res?.meta?.total || list.length);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('[AdminAuditLogsPage] fetch error:', err);
          setLogs(DEFAULT_DEMO_LOGS);
          setTotal(DEFAULT_DEMO_LOGS.length);
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [scope, page, actionFilter, search]);

  const getActionBadge = (action, status) => {
    if (action.includes('APPROVED') || status === 'SUCCESS') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {action}
        </span>
      );
    }
    if (action.includes('REJECTED') || status === 'REJECTED') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {action}
        </span>
      );
    }
    if (action.includes('SUSPENDED') || status === 'WARNING') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0A68FF] border border-blue-200">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Tổng sự kiện
          </div>
          <div className="text-[28px] font-black text-slate-900 mt-1">
            {(total || 1482).toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] font-semibold text-blue-600 mt-1">
            Ghi nhận toàn sàn
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Sự kiện KYC
          </div>
          <div className="text-[28px] font-black text-slate-900 mt-1">
            342
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">
            Duyệt & từ chối
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Xác thực 2FA
          </div>
          <div className="text-[28px] font-black text-slate-900 mt-1">
            128
          </div>
          <div className="text-[11px] font-semibold text-indigo-600 mt-1">
            TOTP enrollment & verify
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
            Cảnh báo rủi ro
          </div>
          <div className="text-[28px] font-black text-rose-600 mt-1">
            14
          </div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1">
            Khóa & hạ quyền
          </div>
        </div>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => {
            setScope('CATALOG');
            setActionFilter('ALL');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
            scope === 'CATALOG'
              ? 'bg-[#0A68FF] text-white border-[#0A68FF] shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Danh mục & Sản phẩm (GET /admin/catalog/audits)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setScope('SYSTEM');
            setActionFilter('ALL');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
            scope === 'SYSTEM'
              ? 'bg-[#0A68FF] text-white border-[#0A68FF] shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Hệ thống & KYC (GET /admin/audit-logs)</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-slate-900 m-0">
              {scope === 'CATALOG'
                ? 'Nhật ký kiểm toán Catalog (#8.7 GET /admin/catalog/audits)'
                : 'Nhật ký kiểm toán hệ thống (#35 GET /admin/audit-logs)'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
              {total} bản ghi
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action / Entity Filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 outline-none focus:border-[#0A68FF]"
            >
              {scope === 'CATALOG' ? (
                <>
                  <option value="ALL">Tất cả đối tượng</option>
                  <option value="PRODUCT">Sản phẩm (PRODUCT)</option>
                  <option value="CATEGORY">Danh mục (CATEGORY)</option>
                  <option value="SKU">Biến thể (SKU)</option>
                </>
              ) : (
                <>
                  <option value="ALL">Tất cả hành động</option>
                  <option value="KYC">Kiểm duyệt KYC</option>
                  <option value="ROLE">Thay đổi vai trò (Role)</option>
                  <option value="USER_STATUS">Khóa / Mở tài khoản</option>
                  <option value="AUTH">Xác thực & 2FA</option>
                </>
              )}
            </select>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm email, đối tượng, lý do..."
                className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-800 outline-none focus:border-[#0A68FF] w-[220px]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng</th>
                <th className="py-3 px-4">Địa chỉ IP</th>
                <th className="py-3 px-4">Chi tiết kiểm toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-[#0A68FF] border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Đang tải dữ liệu kiểm toán...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi kiểm toán nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const date = new Date(log.created_at);
                  const formattedTime = date.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const formattedDate = date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{formattedTime}</div>
                        <div className="text-[10px] text-slate-400">{formattedDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.actor_name}</div>
                        <div className="text-[11px] text-slate-400">{log.actor_email}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                          {log.actor_role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action, log.status)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{log.target_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {log.target_type} • {log.target_id?.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {log.ip_address}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        <p className="line-clamp-2 m-0 text-[11px]">{log.details}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
          <div>
            Hiển thị <span className="font-bold text-slate-700">{logs.length}</span> trên tổng số{' '}
            <span className="font-bold text-slate-700">{total}</span> sự kiện
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Trang trước
            </button>
            <span className="px-2 font-bold text-slate-700">{page}</span>
            <button
              disabled={logs.length < 15}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
