const ShopVouchers = () => {
  const vouchers = [
    { id: 1, title: 'Giảm 300K / đơn 10M' },
    { id: 2, title: 'Giảm 8% tối đa 1M' },
    { id: 3, title: 'Freeship 0Đ' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 border border-taca-border rounded-card flex flex-col gap-brand-4 mb-6 shadow-brand">
      <h2 className="text-[16px] font-bold text-taca-text-main uppercase m-0">VOUCHER CỬA HÀNG</h2>
      
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {vouchers.map(voucher => (
          <div 
            key={voucher.id} 
            className="flex-shrink-0 flex items-center justify-between border border-taca-border rounded-control bg-taca-primary-light/40 w-[280px] sm:w-[300px] min-h-[64px] px-4"
          >
            <span className="text-[14px] font-bold text-taca-text-main truncate pr-2">
              {voucher.title}
            </span>
            <button type="button" className="text-[12px] font-bold text-white hover:bg-taca-primary-hover px-3 py-2 bg-taca-primary border border-taca-primary rounded-control cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-taca-primary/30 shrink-0">
              Lưu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopVouchers;
