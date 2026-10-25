import { SECTION_IDS } from '../constants/landingContent';
import { storeUrl } from '../constants/links';

const BUYER_POINTS = [
  'Tìm và lọc theo từ khóa, danh mục, giá',
  'Áp voucher của sàn hoặc của shop',
  'Đăng nhập khi thêm vào giỏ và thanh toán',
];

const SELLER_POINTS = [
  'Quản lý sản phẩm, tồn kho, đơn hàng ở một nơi',
  'Tạo voucher riêng cho shop',
  'Theo dõi doanh thu và rút tiền về ngân hàng',
];

const primaryButton = 'press grad-fill rounded-xl px-[22px] py-3.5 text-[15px] font-bold no-underline';
const secondaryButton = 'press rounded-xl bg-white px-[22px] py-3.5 text-[15px] font-bold text-slate-900 no-underline';

function PointList({ points }) {
  return (
    <ul className="m-0 flex flex-col gap-2 pl-5 text-base leading-normal text-slate-700">
      {points.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  );
}

export default function AudiencePaths() {
  return (
    <section id={SECTION_IDS.shop} className="mx-auto max-w-[1200px] px-6 pb-10 pt-20">
      <h2 className="reveal m-0 mb-3 text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.02em]">
        Bạn đến Taca để làm gì?
      </h2>
      <p className="m-0 mb-8 text-[17px] text-slate-600">Chọn một lối vào. Bạn có thể làm cả hai bằng một tài khoản.</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        <article className="lift reveal flex flex-col gap-4 rounded-3xl bg-indigo-50 p-8">
          <h3 className="m-0 text-[26px] font-extrabold tracking-[-0.01em]">Người mua: vào xem ngay</h3>
          <PointList points={BUYER_POINTS} />
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <a href={storeUrl('/')} className={primaryButton}>Vào cửa hàng</a>
            <a href={storeUrl('/')} className={secondaryButton}>Tạo tài khoản</a>
          </div>
        </article>
        <article className="lift reveal flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-orange-50 to-emerald-50 p-8 text-slate-900">
          <h3 className="m-0 text-[26px] font-extrabold tracking-[-0.01em]">Người bán: mở shop</h3>
          <PointList points={SELLER_POINTS} />
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <a href={storeUrl('/account/seller-register')} className={primaryButton}>Bắt đầu bán hàng</a>
            <a href={`#${SECTION_IDS.sell}`} className={secondaryButton}>Tìm hiểu thêm</a>
          </div>
        </article>
      </div>
    </section>
  );
}
