import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  FileText,
  BadgeCheck,
  AlertTriangle,
  CreditCard,
  Truck,
  Lock,
  CheckCircle2,
} from 'lucide-react';

/**
 * Modal hiển thị toàn văn Quy chế hoạt động sàn Thương mại Điện tử Taca dành cho Người bán.
 */
export default function SellerPolicyModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  const handleAgreeAndClose = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-policy-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#0A68FF]" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="seller-policy-title"
                className="text-[16px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight"
              >
                QUY CHẾ HOẠT ĐỘNG NGƯỜI BÁN TACA
              </h2>
              <p className="text-[12px] text-slate-500">
                Áp dụng cho toàn bộ Nhà Bán Hàng tham gia kinh doanh trên Sàn TMĐT Taca · Bản cập nhật 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[13px] text-slate-600 leading-relaxed">
          {/* Lời mở đầu */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#0A68FF] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Quy chế này quy định quyền, trách nhiệm, nguyên tắc vận hành và chế tài xử lý áp dụng cho các tổ chức, hộ kinh doanh và cá nhân đăng ký mở gian hàng kinh doanh trên Nền tảng Thương mại Điện tử Taca. Khi nhấn nút đăng ký, Người bán được hiểu là đã đọc, hiểu và cam kết tuân thủ toàn bộ các điều khoản dưới đây.
            </span>
          </div>

          {/* Điều 1 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <h3>ĐIỀU 1. ĐIỀU KIỆN MỞ GIAN HÀNG & THẨM ĐỊNH KYC PHÁP LÝ</h3>
            </div>
            <p>
              1.1. Người bán phải đủ 18 tuổi, có đầy đủ năng lực hành vi dân sự theo quy định của pháp luật Việt Nam, có mã số thuế cá nhân hoặc mã số doanh nghiệp hợp lệ.
            </p>
            <p>
              1.2. Mọi gian hàng mới đều bắt buộc hoàn thành quy trình <strong>Định danh Người bán (KYC) 4 bước</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-700">
              <li><strong>Bước 1 (Hồ sơ)</strong>: Cung cấp Tên gian hàng, Tên doanh nghiệp/Hộ kinh doanh và Mã số thuế (MST) 10–14 số.</li>
              <li><strong>Bước 2 (Giấy tờ pháp lý ĐKKD)</strong>: Tải lên tệp tài liệu Giấy chứng nhận đăng ký kinh doanh doanh nghiệp hoặc Giấy chứng nhận đăng ký hộ kinh doanh cá thể (định dạng PDF/JPG/PNG, tối đa 10MB) có mã băm SHA-256 xác thực.</li>
              <li><strong>Bước 3 (Địa chỉ Kho lấy hàng)</strong>: Khai báo địa chỉ kho hàng và thông tin người liên hệ để đơn vị vận chuyển tiếp nhận kiện hàng.</li>
              <li><strong>Bước 4 (Tài khoản Ngân hàng)</strong>: Thiết lập thông tin ngân hàng thụ hưởng chính chủ để nhận dòng tiền rút ví (Payout).</li>
            </ul>
            <p>
              1.3. Ban quản trị sàn Taca sẽ thẩm định và phản hồi trạng thái hồ sơ trong vòng 24 giờ làm việc. Chỉ gian hàng đạt trạng thái <code>APPROVED</code> mới được phép mở bán công khai sản phẩm.
            </p>
          </section>

          {/* Điều 2 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <h3>ĐIỀU 2. DANH MỤC HÀNG HÓA & TIÊU CHUẨN SẢN PHẨM (SPU/SKU)</h3>
            </div>
            <p>
              2.1. <strong>Nghiêm cấm kinh doanh</strong>: Hàng giả, hàng nhái, hàng vi phạm quyền sở hữu trí tuệ, văn hóa phẩm đồi trụy, vũ khí, chất cháy nổ, động vật quý hiếm và tất cả các mặt hàng cấm kinh doanh theo quy định hiện hành.
            </p>
            <p>
              2.2. <strong>Quy chuẩn thông tin sản phẩm</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-700">
              <li>Mỗi sản phẩm SPU phải có tối thiểu 1 mã SKU hoạt động, có hình ảnh thực tế chất lượng cao, mô tả đúng công năng, xuất xứ và quy cách.</li>
              <li>Giá niêm yết trên sàn là giá Việt Nam Đồng (VND), <strong>đã bao gồm thuế giá trị gia tăng (VAT)</strong> theo thuế suất ngành hàng (<code>tax_rate_bps</code>).</li>
              <li>Sản phẩm vi phạm chính sách sẽ bị Quản trị viên xử lý khóa (<code>BLOCKED</code>) và thông báo lý do xử lý cụ thể.</li>
            </ul>
          </section>

          {/* Điều 3 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
              <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
              <h3>ĐIỀU 3. THANH TOÁN, ĐỐI SOÁT & DÒNG TIỀN VÍ NGƯỜI BÁN</h3>
            </div>
            <p>
              3.1. Sàn Taca hỗ trợ phương thức thanh toán trực tuyến qua <strong>Cổng VNPAY Gateway (Sandbox / VNPAY QR)</strong> và phương thức thanh toán khi nhận hàng (COD).
            </p>
            <p>
              3.2. Tiền bán hàng của mỗi đơn hàng sau khi hoàn tất thành công (không có tranh chấp hoặc khiếu nại đổi trả) sẽ được tự động cộng vào <strong>Số dư khả dụng trong Ví Người Bán (Seller Wallet)</strong>.
            </p>
            <p>
              3.3. Người bán có thể tạo lệnh rút tiền (Payout/Withdraw) về tài khoản ngân hàng thụ hưởng đã xác thực (Hỗ trợ tài khoản đối soát VNPAY Sandbox - Ngân hàng Quốc Dân NCB). Lệnh rút tiền được kiểm tra hạn mức số dư khả dụng tức thời.
            </p>
          </section>

          {/* Điều 4 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <h3>ĐIỀU 4. XỬ LÝ ĐƠN HÀNG, ĐÓNG GÓI & VẬN CHUYỂN (SLA)</h3>
            </div>
            <p>
              4.1. Người bán có nghĩa vụ xác nhận đơn hàng trong vòng <strong>24 giờ</strong> và chuẩn bị đóng gói hàng hóa đúng quy cách theo chuẩn an toàn vận chuyển.
            </p>
            <p>
              4.2. Thời gian bàn giao kiện hàng cho đối tác vận chuyển không được vượt quá <strong>48 giờ</strong> kể từ lúc khách hàng đặt đơn.
            </p>
            <p>
              4.3. Trường hợp Người bán tự ý hủy đơn hàng do khai báo sai tồn kho hoặc giao trễ nhiều lần sẽ bị trừ điểm đánh giá gian hàng và giới hạn lưu lượng tiếp cận khách hàng.
            </p>
          </section>

          {/* Điều 5 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <h3>ĐIỀU 5. BẢO MẬT DỮ LIỆU & CHẾ TÀI XỬ LÝ VI PHẠM</h3>
            </div>
            <p>
              5.1. Người bán cam kết bảo mật tuyệt đối dữ liệu cá nhân của Người mua (Họ tên, Số điện thoại, Địa chỉ giao hàng), không được sao chép, mua bán hoặc sử dụng cho bất kỳ mục đích nào ngoài việc thực hiện giao hàng.
            </p>
            <p>
              5.2. Các hành vi gian lận (đặt đơn ảo, tự đánh giá ảo, lừa đảo khách hàng chuyển khoản ngoài sàn) sẽ bị xử lý nghiêm khắc: Tạm đóng băng ví thanh toán, đình chỉ hoạt động gian hàng vĩnh viễn (<code>SUSPENDED</code>) và chuyển giao cơ quan pháp luật có thẩm quyền khi cần thiết.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[12px] text-slate-500 text-center sm:text-left">
            Bằng việc đồng ý, bạn xác nhận chấp thuận mọi điều khoản quy chế hoạt động của Sàn TMĐT Taca.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Đóng lại
            </button>
            <button
              type="button"
              onClick={handleAgreeAndClose}
              className="flex-1 sm:flex-initial px-5 py-2 bg-[#0A68FF] hover:bg-[#0855D2] text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Tôi đã đọc và đồng ý</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

SellerPolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func,
};
