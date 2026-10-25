import { CreditCard, ShieldCheck, Star, Truck } from 'lucide-react';
import { TRUST_ITEMS } from '../constants/landingContent';
import { SPECTRUM_STROKE } from '../constants/tones';

const TRUST_ICONS = {
  payment: CreditCard,
  verified: ShieldCheck,
  tracking: Truck,
  reviews: Star,
};

export default function TrustStrip() {
  return (
    <section aria-label="Cam kết" className="tint-trust">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-8 gap-y-4 p-6">
        {TRUST_ITEMS.map((item) => {
          const Icon = TRUST_ICONS[item.id];
          return (
            <div key={item.id} className="trust-item flex items-center gap-3">
              <Icon size={28} strokeWidth={1.8} stroke={SPECTRUM_STROKE} aria-hidden="true" />
              <div>
                <div className="text-[15px] font-bold">{item.title}</div>
                <div className="text-[13px] text-slate-700">{item.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
