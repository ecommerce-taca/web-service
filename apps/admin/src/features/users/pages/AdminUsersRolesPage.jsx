import { useState } from 'react';
import { Check } from 'lucide-react';
import { updateUserRole, updateUserStatus } from '../../../services/admin-kyc.api';

const INITIAL_USERS = [
  {
    id: '01912f31-7a1b-7c12-9c55-8b1c34a6d921',
    full_name: 'Nguyễn Minh Anh',
    email: 'minhanh@example.com',
    phone: '+84901234567',
    roles: ['BUYER', 'SELLER'],
    status: 'ACTIVE',
    created_at: '2026-08-30T09:00:00Z',
  },
  {
    id: '01912f53-7a1b-7c12-9c55-8b1c34a6d921',
    full_name: 'Trần Hoàng',
    email: 'admin@taca.vn',
    phone: '+84909888999',
    roles: ['ADMIN', 'SUPER_ADMIN', 'RISK_MANAGER'],
    status: 'ACTIVE',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: '01912f31-7a1b-7c12-9c55-8b1c34a6d925',
    full_name: 'Lê Văn Cường',
    email: 'cuong.le@example.com',
    phone: '+84912345678',
    roles: ['BUYER'],
    status: 'SUSPENDED',
    created_at: '2026-09-12T11:20:00Z',
  },
];

export default function AdminUsersRolesPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const reason = newStatus === 'SUSPENDED' ? 'Khóa tạm thời do nghi vấn bảo mật' : 'Mở khóa tài khoản';
    setLoading(true);
    try {
      await updateUserStatus(user.id, { status: newStatus, reason });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      showToast(`Đã cập nhật trạng thái user thành ${newStatus}`);
    } catch (err) {
      alert(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user, roleToToggle) => {
    const hasRole = user.roles.includes(roleToToggle);
    const action = hasRole ? 'REVOKE' : 'GRANT';
    setLoading(true);
    try {
      await updateUserRole(user.id, {
        action,
        role: roleToToggle,
        reason: `${action === 'GRANT' ? 'Cấp' : 'Thu hồi'} quyền ${roleToToggle}`,
      });
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== user.id) return u;
          const updatedRoles = hasRole
            ? u.roles.filter((r) => r !== roleToToggle)
            : [...u.roles, roleToToggle];
          return { ...u, roles: updatedRoles };
        })
      );
      showToast(`Đã ${action === 'GRANT' ? 'cấp' : 'thu hồi'} role ${roleToToggle}`);
    } catch (err) {
      alert(err.message || 'Cập nhật role thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-[13px] font-bold shadow-xs animate-in fade-in duration-150 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-black text-slate-900 tracking-tight">
              Quản lý Người dùng & Phân quyền (RBAC)
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Tra cứu tài khoản, gán thẩm quyền quản trị và thực hiện đình chỉ theo chính sách sàn.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-6">NGƯỜI DÙNG</th>
                <th className="py-3 px-4">LIÊN HỆ</th>
                <th className="py-3 px-4">ROLES HIỆN TẠI</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{user.full_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{user.id}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-700">
                    <div>{user.email}</div>
                    <div className="text-[11px] text-slate-400">{user.phone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            r.includes('ADMIN')
                              ? 'bg-blue-100 text-blue-800'
                              : r === 'SELLER'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {user.status === 'ACTIVE' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800">
                        SUSPENDED
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleToggleRole(user, 'SELLER_STAFF')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {user.roles.includes('SELLER_STAFF') ? '- Staff' : '+ Staff'}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        user.status === 'ACTIVE'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Khóa user' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
