import { ChevronDown, CreditCard, Search, Truck } from 'lucide-react';
import { BUYING_STEPS } from '../constants/landingContent';
import { SPECTRUM_STROKE } from '../constants/tones';

const STEP_ICONS = {
  find: Search,
  pay: CreditCard,
  track: Truck,
};

// Thẻ chỉ hiện tiêu đề; mô tả trượt mở khi hover, chạm hoặc focus bằng bàn phím
export default function BuyingSteps() {
  return (
    <section aria-labelledby="landing-how-h" className="bg-slate-50">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 id="landing-how-h" className="reveal m-0 mb-8 text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.02em]">
          Mua hàng trong 3 bước
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-6 p-0">
          {BUYING_STEPS.map((step) => {
            const Icon = STEP_ICONS[step.id];
            const descriptionId = `landing-step-${step.id}`;
            return (
              <li key={step.id} className="lift reveal step rounded-[20px] bg-white py-6 pl-5 pr-6">
                <h3 className="m-0 text-[19px] font-extrabold">
                  <button type="button" className="step-head" aria-describedby={descriptionId}>
                    <span className="step-ico flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-violet-50" aria-hidden="true">
                      <Icon size={24} strokeWidth={2} stroke={SPECTRUM_STROKE} />
                    </span>
                    <span className="grad-text">{step.title}</span>
                    <span className="step-chev ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-100" aria-hidden="true">
                      <ChevronDown size={16} strokeWidth={2.4} color="#4f46e5" />
                    </span>
                  </button>
                </h3>
                <div className="step-body">
                  <div>
                    <p id={descriptionId} className="m-0 pt-3.5 text-[15px] leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
