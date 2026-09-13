import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const ShopHero = () => {
  return (
    <div className="bg-white p-6 border border-taca-primary rounded-[12px] flex items-center justify-between mb-6">
      {/* Left side: Logo and Info */}
      <div className="flex items-center gap-6">
        {/* Shop Logo placeholder */}
        <div className="w-[80px] h-[80px] bg-black text-white flex flex-col items-center justify-center rounded-[8px] flex-shrink-0 text-[10px] font-bold">
          <span>taca</span>
          <span>APPLE</span>
        </div>
        
        {/* Shop Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-taca-text-main m-0">
              Taca Apple Flagship Store
            </h1>
            <Badge variant="official" className="border border-taca-primary !rounded-[4px]">Official Store</Badge>
          </div>
          
          <div className="text-[14px] text-taca-text-muted flex items-center gap-2">
            <span>Hoạt động 5 phút trước</span>
          </div>
          
          <div className="text-[14px] text-taca-text-main font-medium flex flex-wrap items-center gap-4 mt-1">
            <span className="flex items-center gap-1">
              <span className="text-taca-sale font-bold">4.9 ★</span> Đánh giá
            </span>
            <span className="text-taca-border">|</span>
            <span>98% phản hồi</span>
            <span className="text-taca-border">|</span>
            <span>12.5k người theo dõi</span>
          </div>
        </div>
      </div>
      
      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" className="px-6 h-[40px] rounded-[8px] !border-taca-primary !text-taca-primary hover:!bg-taca-surface text-[14px] font-bold">
          Theo dõi
        </Button>
        <Button variant="primary" className="px-6 h-[40px] rounded-[8px] text-[14px] font-bold">
          Chat ngay
        </Button>
      </div>
    </div>
  );
};

export default ShopHero;
