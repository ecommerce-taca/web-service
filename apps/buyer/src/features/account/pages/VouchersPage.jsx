import { useState, useEffect, useCallback } from 'react';
import VoucherCard from '../components/VoucherCard';
import { voucherApi } from '../services/voucher.api';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';

const TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Taca', value: 'TACA' },
  { label: 'Cửa hàng', value: 'SHOP' }
];

const VouchersPage = () => {
  const [activeTab, setActiveTab] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveCode, setSaveCode] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchVouchers = useCallback(async (provider) => {
    setLoading(true);
    try {
      const response = await voucherApi.getVouchers({ provider });
      const items = response.data.data || [];
      setVouchers(items);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     
    fetchVouchers(activeTab);
  }, [activeTab, fetchVouchers]);

  const handleSaveVoucher = async (e) => {
    e?.preventDefault();
    if (!saveCode) return;
    setSaveLoading(true);
    try {
      await voucherApi.saveVoucher(saveCode);
      alert('Lưu mã voucher thành công!');
      setSaveCode('');
      fetchVouchers(activeTab);
    } catch (error) {
      alert(error.message || 'Có lỗi xảy ra khi lưu mã');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 md:p-8 flex-1">
        <h1 className="text-[20px] font-bold text-taca-text-main mb-6">Kho Voucher</h1>

        {/* Thêm voucher */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <p className="text-[14px] text-taca-text-main font-semibold whitespace-nowrap m-0">Mã Voucher</p>
          <form onSubmit={handleSaveVoucher} className="flex flex-1 w-full gap-3">
            <Input 
              value={saveCode}
              onChange={(e) => setSaveCode(e.target.value)}
              placeholder="Nhập mã voucher tại đây"
              className="flex-1 !rounded-lg"
            />
            <Button 
              type="submit" 
              disabled={saveLoading || !saveCode} 
              className="!px-6 !py-0 h-[44px] !rounded-lg whitespace-nowrap"
            >
              {saveLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-taca-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-[14px] font-semibold cursor-pointer border-b-2 transition-colors bg-transparent ${
                activeTab === tab.value
                  ? 'border-taca-primary text-taca-primary'
                  : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Danh sách Voucher */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Đang tải voucher...</div>
          ) : vouchers.length > 0 ? (
            vouchers.map(voucher => (
              <VoucherCard key={voucher.id} voucher={voucher} onSave={() => {}} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Chưa có voucher nào
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VouchersPage;
