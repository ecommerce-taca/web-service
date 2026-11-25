import { CheckCircle2, Info } from 'lucide-react';

/**
 * Step 4: Xác nhận thông tin & Điều kiện xuất bản sản phẩm
 */
export default function ShippingStep() {
  return (
    <div className="space-y-6">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block">
        XÁC NHẬN & ĐIỀU KIỆN XUẤT BẢN
      </span>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-[#4F46E5]" aria-hidden="true" />
          <span>Điều kiện để đăng bán (Publish) trên hệ thống:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Đã nhập đầy đủ tên sản phẩm (SPU) và chọn danh mục chính đang hoạt động.</li>
          <li>Có ít nhất 1 ảnh bìa sản phẩm đã tải lên thành công ở Bước 1.</li>
          <li>Có ít nhất 1 biến thể SKU đang hoạt động với mức giá VND hợp lệ.</li>
          <li>Gian hàng đã hoàn tất xác minh KYC (APPROVED) và không bị tạm ngưng.</li>
        </ul>
      </div>

      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[12px] text-emerald-800 font-medium flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <span>Không cần duyệt thủ công — sản phẩm hiển thị ngay sau khi người bán đăng bán.</span>
      </div>
    </div>
  );
}
