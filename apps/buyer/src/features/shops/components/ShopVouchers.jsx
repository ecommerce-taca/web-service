const ShopVouchers = () => {
  const vouchers = [
    { id: 1, title: 'Giảm 300K / đơn 10M' },
    { id: 2, title: 'Giảm 8% tối đa 1M' },
    { id: 3, title: 'Freeship 0Đ' },
  ];

  return (
    <div className="bg-[#f0f5ff] p-6 border border-[#d6e4ff] rounded-[12px] flex flex-col gap-4 mb-6">
      <h2 className="text-[16px] font-bold text-taca-text-main uppercase m-0">VOUCHER CỬA HÀNG</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {vouchers.map(voucher => (
          <div 
            key={voucher.id} 
            className="flex-shrink-0 flex items-center justify-between border border-taca-border rounded-[8px] bg-taca-surface w-[300px] h-[60px] px-4"
          >
            <span className="text-[14px] font-bold text-taca-text-main truncate pr-2">
              {voucher.title}
            </span>
            <button className="text-[12px] font-bold text-taca-primary hover:underline px-3 py-1 bg-white border border-taca-primary rounded-[4px]">
              Lưu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopVouchers;
