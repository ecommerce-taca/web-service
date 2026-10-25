import { Link } from 'react-router-dom';
import SellerResultsCard from './SellerResultsCard';
import PlatformStats from './PlatformStats';
import OpenShopPipeline from './OpenShopPipeline';
import { SECTION_IDS } from '../constants/landingContent';

export default function SellerSection() {
  return (
    <section id={SECTION_IDS.sell} aria-labelledby="landing-sell-h" className="tint-seller text-slate-900">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-[88px]">
        <div className="flex flex-wrap items-center gap-12">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
            <h2 id="landing-sell-h" className="m-0 text-[clamp(30px,4vw,48px)] font-extrabold leading-[1.1] tracking-[-0.02em]">
              Bán hàng cùng Taca
            </h2>
            <p className="m-0 text-[17px] leading-relaxed text-slate-700">
              Tạo shop và vào Seller Center ngay sau khi đăng ký. Hoàn tất KYC để đăng bán sản phẩm và rút tiền.
              Shop của bạn đến được người mua trên cả nước.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/account/seller-register" className="press grad-fill rounded-xl px-6 py-[15px] text-base font-bold no-underline">
                Bắt đầu bán hàng
              </Link>
              <a
                href={`#${SECTION_IDS.fees}`}
                className="press rounded-xl bg-white px-6 py-[15px] text-base font-bold text-slate-900 no-underline"
              >
                Xem biểu phí
              </a>
            </div>
          </div>
          <SellerResultsCard />
        </div>
        <PlatformStats />
        <OpenShopPipeline />
      </div>
    </section>
  );
}
