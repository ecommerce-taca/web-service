import PropTypes from 'prop-types';
import { RotateCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { TONES } from '../constants/tones';
import { tacaLogoUrl as tacaLogo } from '../assets/tacaLogo';

const CHIPS = [
  { id: 'genuine', Icon: ShieldCheck, tone: 'emerald', label: 'Hàng chính hãng', position: 'left-[2%] top-[10%]' },
  { id: 'modern', Icon: Sparkles, tone: 'indigo', label: 'Hiện đại', position: 'right-0 top-[18%]' },
  { id: 'nationwide', Icon: Truck, tone: 'blue', label: 'Giao toàn quốc', position: 'left-0 bottom-[16%]' },
  { id: 'refund', Icon: RotateCcw, tone: 'orange', label: 'Hoàn tiền nếu hàng giả', caption: 'Cam kết', position: 'right-[2%] bottom-[6%]' },
];

const ORBIT_DOTS = [
  'left-1/2 -top-1.5 h-3 w-3 bg-[#4f46e5]',
  '-right-1.5 top-1/2 h-2.5 w-2.5 bg-[#10b981]',
  '-bottom-[5px] left-[30%] h-2.5 w-2.5 bg-[#f97316]',
  '-left-[5px] top-[40%] h-2 w-2 bg-[#0a68ff]',
];

/**
 * Minh họa thương hiệu ở hero. `activeIndex` (1–4) làm nổi chip tương ứng với khối chữ đang hiện,
 * 0 nghĩa là chưa cuộn tới khối nào.
 */
export default function HeroArt({ activeIndex, onLeft }) {
  const chipState = (index) => {
    if (!activeIndex) return '';
    return activeIndex === index ? 'lit' : 'dim';
  };

  return (
    <div
      className={`hero-art relative min-h-[460px] min-w-0 ${onLeft ? 'side-left' : ''}`}
      role="img"
      aria-label="Taca: hàng chính hãng, hiện đại, giao toàn quốc, hoàn tiền nếu hàng giả"
    >
      <div
        className="art-blob absolute inset-x-[4%] inset-y-[6%]"
        style={{
          borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%',
          background:
            'radial-gradient(circle at 25% 30%, rgba(79,70,229,.22), transparent 55%), radial-gradient(circle at 75% 25%, rgba(10,104,255,.18), transparent 55%), radial-gradient(circle at 70% 80%, rgba(16,185,129,.2), transparent 55%), radial-gradient(circle at 25% 80%, rgba(249,115,22,.18), transparent 55%)',
        }}
      />
      <div className="art-orbit absolute left-1/2 top-1/2 -ml-[170px] -mt-[170px] h-[340px] w-[340px] rounded-full border-2 border-dashed border-indigo-600/20">
        {ORBIT_DOTS.map((dotClass) => (
          <span key={dotClass} className={`absolute rounded-full ${dotClass}`} />
        ))}
      </div>
      <div
        className={`art-core absolute left-1/2 top-1/2 -ml-[116px] -mt-[78px] flex w-[232px] flex-col items-center gap-3.5 rounded-[32px] bg-white px-6 pb-[22px] pt-7 shadow-[inset_0_0_0_2px_#eef2ff] ${activeIndex ? 'dim' : ''}`}
      >
        <img src={tacaLogo} alt="" className="block h-auto w-[184px]" />
        <span className="h-1.5 w-[120px] rounded-full bg-gradient-to-r from-[#4f46e5] via-[#10b981] to-[#f97316]" />
        <span className="text-[13px] font-bold tracking-[.02em] text-slate-600">Mua an tâm · Bán thuận lợi</span>
      </div>
      {CHIPS.map(({ id, Icon, tone, label, caption, position }, index) => (
        <div
          key={id}
          className={`art-chip art-chip-${index + 1} absolute inline-flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-white py-2.5 pl-2.5 pr-3.5 text-sm font-bold text-slate-900 shadow-[inset_0_0_0_1.5px_#eef2ff] ${position} ${chipState(index + 1)}`}
        >
          <span
            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px]"
            style={{ background: TONES[tone].background }}
          >
            <Icon size={20} strokeWidth={2.2} color={TONES[tone].stroke} aria-hidden="true" />
          </span>
          {caption ? (
            <span className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-500">{caption}</span>
              <span>{label}</span>
            </span>
          ) : (
            label
          )}
        </div>
      ))}
    </div>
  );
}

HeroArt.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  onLeft: PropTypes.bool.isRequired,
};
