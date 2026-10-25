import { useState, useEffect, useCallback } from 'react';
import { Tag, CheckCircle2, AlertCircle, Sparkles, Clock, ShoppingBag } from 'lucide-react';
import VoucherCard from '../components/VoucherCard';
import { voucherApi } from '../services/voucher.api';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';

const TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Taca', value: 'TACA' },
  { label: 'Cửa hàng', value: 'SHOP' },
  { label: 'Lịch sử đã dùng', value: 'REDEMPTIONS' }
];

const VouchersPage = () => {
  const [activeTab, setActiveTab] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkCode, setCheckCode] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const fetchVouchers = useCallback(async (provider) => {
    setLoading(true);
    try {
      if (provider === 'REDEMPTIONS') {
        const res = await voucherApi.getVoucherRedemptions();
        const items = res?.data?.data || [];
        setRedemptions(items);
        setTotalSaved(res?.meta?.total_saved || 0);
      } else {
        const response = await voucherApi.getVouchers({ provider: provider || undefined });
        const items = response?.data?.data || [];
        setVouchers(items);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers(activeTab);
  }, [activeTab, fetchVouchers]);

  const handleValidateVoucher = async (e) => {
    e?.preventDefault();
    if (!checkCode.trim()) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await voucherApi.validateVoucher(checkCode.trim());
      const data = res?.data || res;
      setCheckResult(data);
    } catch (error) {
      setCheckResult({
        valid: false,
        message: error.message || 'Không thể kiểm tra mã vào lúc này'
      });
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-bold text-taca-text-main m-0 flex items-center gap-2">
            <Tag className="w-5 h-5 text-taca-primary" />
            <span>Kho Voucher</span>
          </h1>
        </div>

        {/* Kiểm tra mã Voucher (Thay thế form Lưu voucher giả lập trước đây) */}
        <div className="bg-gradient-to-r from-indigo-50/70 to-slate-50 p-6 rounded-2xl border border-indigo-100/80 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <p className="text-[14px] text-taca-text-main font-bold m-0 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Kiểm tra mã ưu đãi
              </p>
              <p className="text-[12px] text-slate-500 m-0 mt-0.5">
                Nhập mã voucher để kiểm tra mức giảm giá và điều kiện áp dụng trước khi mua hàng.
              </p>
            </div>
          </div>

          <form onSubmit={handleValidateVoucher} className="flex flex-col sm:flex-row gap-3">
            <Input 
              value={checkCode}
              onChange={(e) => setCheckCode(e.target.value)}
              placeholder="Nhập mã voucher (ví dụ: TACA200K, FREESHIP50K...)"
              className="flex-1 !rounded-xl !bg-white"
            />
            <Button 
              type="submit" 
              disabled={checkLoading || !checkCode.trim()} 
              className="!px-6 !py-0 h-[44px] !rounded-xl whitespace-nowrap font-bold"
            >
              {checkLoading ? 'Đang kiểm tra...' : 'Kiểm tra'}
            </Button>
          </form>

          {/* Kết quả kiểm tra */}
          {checkResult && (
            <div className={`p-4 rounded-xl text-[13px] flex items-start gap-3 border ${
              checkResult.valid 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {checkResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {checkResult.valid ? (
                  <div>
                    <p className="font-bold m-0 text-emerald-800">
                      Mã hợp lệ: Giảm {checkResult.discount_amount ? `${checkResult.discount_amount.toLocaleString('vi-VN')} ₫` : `${checkResult.value}%`}
                    </p>
                    <p className="m-0 mt-0.5 text-[12px] text-emerald-700">
                      Áp dụng cho đơn từ {checkResult.min_order ? `${checkResult.min_order.toLocaleString('vi-VN')} ₫` : '0 ₫'} · HSD: {checkResult.expires_at ? new Date(checkResult.expires_at).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold m-0 text-rose-800">Mã không hợp lệ</p>
                    <p className="m-0 mt-0.5 text-[12px] text-rose-700">
                      {checkResult.message || checkResult.reason || 'Mã không tồn tại hoặc đã hết lượt sử dụng.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-taca-border mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-[14px] font-semibold cursor-pointer border-b-2 transition-colors bg-transparent whitespace-nowrap ${
                activeTab === tab.value
                  ? 'border-taca-primary text-taca-primary'
                  : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Nội dung danh sách */}
        {activeTab === 'REDEMPTIONS' ? (
          <div className="space-y-6">
            {/* Banner tổng số tiền đã tiết kiệm */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[13px] text-emerald-100 font-medium">Tổng tiền tiết kiệm được từ Voucher</span>
                <h3 className="text-[28px] font-black text-white m-0 tracking-tight">
                  {totalSaved.toLocaleString('vi-VN')} ₫
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-4 py-2 rounded-xl text-[13px] font-bold">
                <ShoppingBag className="w-4 h-4" />
                <span>{redemptions.length} lượt đã dùng</span>
              </div>
            </div>

            {/* Danh sách đã dùng */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-slate-400">Đang tải lịch sử sử dụng...</div>
              ) : redemptions.length > 0 ? (
                redemptions.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-xs transition-shadow">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[14px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.scope}
                        </span>
                        {item.shop_name && (
                          <span className="text-[12px] text-slate-500">· {item.shop_name}</span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-400 m-0 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Đơn hàng #{item.order_id} · {new Date(item.redeemed_at).toLocaleString('vi-VN')}</span>
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-[15px] font-bold text-emerald-600">
                        -{Number(item.discount_amount || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Bạn chưa có lượt sử dụng voucher nào
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Danh sách Voucher khả dụng */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-500">Đang tải voucher...</div>
            ) : vouchers.length > 0 ? (
              vouchers.map((voucher) => (
                <VoucherCard key={voucher.id || voucher.code} voucher={voucher} onCopy={() => {}} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Chưa có voucher nào trong mục này
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default VouchersPage;
