import VoucherCard from '../components/VoucherCard';

const DUMMY_VOUCHERS = [
  {
    id: 'VOUCHER1',
    discount: '30K',
    type: 'shipping',
    title: 'Mã Miễn Phí Vận Chuyển',
    minOrder: 150000,
    expiry: '31/12/2026'
  },
  {
    id: 'VOUCHER2',
    discount: '10%',
    type: 'discount',
    title: 'Giảm 10% Tối đa 50K',
    minOrder: 200000,
    expiry: '31/12/2026'
  },
  {
    id: 'VOUCHER3',
    discount: '100K',
    type: 'discount',
    title: 'Giảm 100K Cho Đơn Điện Tử',
    minOrder: 2000000,
    expiry: '15/09/2026'
  }
];

const VouchersPage = () => {
  return (
    <div>
      <h2 className="text-[20px] font-extrabold text-taca-text-main m-0 mb-6 flex justify-between items-center">
        <span>Voucher của tôi</span>
        <button className="text-[14px] text-taca-primary font-semibold cursor-pointer hover:underline bg-transparent border-none">
          Nhập mã voucher
        </button>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DUMMY_VOUCHERS.map(voucher => (
          <VoucherCard key={voucher.id} voucher={voucher} />
        ))}
      </div>
    </div>
  );
};

export default VouchersPage;
