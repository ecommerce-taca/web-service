import { Camera, CheckCircle2 } from 'lucide-react';

/**
 * Step 4: Vận chuyển, SLA & Thư viện ảnh sản phẩm
 */
export default function ShippingStep() {
  return (
    <div className="space-y-6">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block">
        VẬN CHUYỂN & HÌNH ẢNH SẢN PHẨM
      </span>
      <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
        <Camera className="w-10 h-10 mx-auto text-slate-400" aria-hidden="true" />
        <div className="text-[13px] font-semibold text-slate-700">
          Kéo thả hình ảnh bìa và thư viện sản phẩm vào đây
        </div>
        <div className="text-[11px] text-slate-400">
          Hỗ trợ JPG, PNG, WEBP tối đa 5MB. Ảnh đầu tiên sẽ là ảnh bìa đại diện.
        </div>
      </div>

      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[12px] text-emerald-800 font-medium flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <span>Không cần duyệt — sản phẩm hiển thị ngay sau khi người bán đăng bán.</span>
      </div>
    </div>
  );
}
