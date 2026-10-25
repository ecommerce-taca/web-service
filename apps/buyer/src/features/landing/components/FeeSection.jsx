import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_CALCULATOR_PRICE,
  FEE_CATEGORIES,
  SECTION_IDS,
  WITHHOLDING_TAX_RATE,
} from '../constants/landingContent';
import { formatVnd } from '../utils/formatNumber';

const MAX_PRICE_DIGITS = 11;
const fieldClass = 'rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900';
const taxRateLabel = `${WITHHOLDING_TAX_RATE.toLocaleString('vi-VN')}%`;

function FeeRow({ title, hint, value, highlight }) {
  return (
    <div className="fee-row flex items-center justify-between gap-4 rounded-2xl px-[18px] py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-bold">{title}</span>
        <span className="text-sm text-slate-500">{hint}</span>
      </div>
      <span className={`whitespace-nowrap font-extrabold ${highlight ? 'grad-text text-xl' : 'text-base text-indigo-800'}`}>
        {value}
      </span>
    </div>
  );
}

// Biểu phí (SỐ LIỆU MẪU) và máy tính số tiền người bán thực nhận
export default function FeeSection() {
  const [categoryId, setCategoryId] = useState(FEE_CATEGORIES[0].id);
  const [price, setPrice] = useState(DEFAULT_CALCULATOR_PRICE);

  const category = FEE_CATEGORIES.find((item) => item.id === categoryId) ?? FEE_CATEGORIES[0];
  const commission = Math.round((price * category.rate) / 100);
  const tax = Math.round((price * WITHHOLDING_TAX_RATE) / 100);
  const net = Math.max(0, price - commission - tax);

  const handlePriceChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, MAX_PRICE_DIGITS);
    setPrice(parseInt(digits || '0', 10));
  };

  return (
    <section
      id={SECTION_IDS.fees}
      aria-labelledby="landing-fees-h"
      className="mx-auto max-w-[1200px] scroll-mt-20 px-6 pt-[88px]"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 id="landing-fees-h" className="reveal m-0 text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.02em]">
          Biểu phí bán hàng
        </h2>
        <p className="m-0 max-w-[520px] text-base leading-relaxed text-slate-600">
          Phí rõ ràng, chỉ trừ khi có đơn thành công. Không có phí mở shop hay phí duy trì hàng tháng.
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div className="reveal min-w-0 flex-[1_1_520px] rounded-3xl bg-slate-50 p-3">
          <FeeRow title="Mở shop & duy trì" hint="Đăng ký, vào Seller Center, đăng sản phẩm" value="0₫" highlight />
          <div className="px-[18px] pb-2 pt-4">
            <span className="text-base font-bold">Phí hoa hồng theo ngành hàng</span>
            <span className="block pt-0.5 text-sm text-slate-500">Tính trên giá bán của đơn thành công</span>
          </div>
          {FEE_CATEGORIES.map((item) => (
            <div key={item.id} className="fee-row flex items-center justify-between gap-4 rounded-[14px] py-3 pl-[30px] pr-[18px]">
              <span className="text-[15px] text-slate-700">{item.label}</span>
              <span className="text-base font-extrabold text-indigo-800">{item.rate}%</span>
            </div>
          ))}
          <FeeRow
            title="Thuế khấu trừ thay"
            hint="Taca kê khai và nộp thay hộ, cá nhân kinh doanh theo quy định"
            value={taxRateLabel}
          />
          <FeeRow
            title="Rút tiền về ngân hàng"
            hint="Sau khi KYC được duyệt, nhận trong 1–3 ngày làm việc"
            value="Miễn phí"
            highlight
          />
        </div>

        <div className="tint-soft reveal flex min-w-0 flex-[1_1_360px] flex-col gap-4 rounded-3xl p-7">
          <h3 className="m-0 text-xl font-extrabold">Bạn nhận được bao nhiêu?</h3>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="landing-fee-cat" className="text-sm font-bold">Ngành hàng</label>
            <select
              id="landing-fee-cat"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={`${fieldClass} text-[15px]`}
            >
              {FEE_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="landing-fee-price" className="text-sm font-bold">Giá bán (₫)</label>
            <input
              id="landing-fee-price"
              type="text"
              inputMode="numeric"
              value={price ? price.toLocaleString('vi-VN') : ''}
              onChange={handlePriceChange}
              className={`${fieldClass} text-base font-bold`}
            />
          </div>
          <div className="fee-out flex flex-col gap-2.5 rounded-2xl bg-white px-[18px] py-4" aria-live="polite">
            <div className="flex justify-between text-[15px] text-slate-700">
              <span>Phí hoa hồng ({category.rate}%)</span>
              <span className="num">−{formatVnd(commission)}</span>
            </div>
            <div className="flex justify-between text-[15px] text-slate-700">
              <span>Thuế khấu trừ ({taxRateLabel})</span>
              <span className="num">−{formatVnd(tax)}</span>
            </div>
            <div className="h-0.5 rounded-sm bg-slate-100" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] font-bold">Bạn nhận được</span>
              <span className="num grad-text text-[26px] font-extrabold">{formatVnd(net)}</span>
            </div>
          </div>
          <Link
            to="/account/seller-register"
            className="press grad-fill self-start rounded-xl px-[22px] py-3.5 text-[15px] font-bold no-underline"
          >
            Bắt đầu bán hàng
          </Link>
        </div>
      </div>
    </section>
  );
}
