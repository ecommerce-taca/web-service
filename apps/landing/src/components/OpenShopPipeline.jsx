import { useCallback, useEffect, useRef, useState } from 'react';
import { Landmark, PackagePlus, ShieldCheck, Store, Warehouse } from 'lucide-react';
import { OPEN_SHOP_STEPS } from '../constants/landingContent';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { prefersReducedMotion } from '../utils/motion';

const STEP_ICONS = {
  profile: Store,
  kyc: ShieldCheck,
  warehouse: Warehouse,
  bank: Landmark,
  product: PackagePlus,
};

const STEP_INTERVAL_MS = 700;

// Quy trình mở shop sáng lần lượt từng bước khi cuộn tới; di chuột vào để phát lại
export default function OpenShopPipeline() {
  const [pipeRef, inView] = useInViewOnce(0.4);
  const [completedSteps, setCompletedSteps] = useState(0);
  const timerRef = useRef(null);
  const totalSteps = OPEN_SHOP_STEPS.length;

  const play = useCallback(() => {
    clearInterval(timerRef.current);
    if (prefersReducedMotion()) {
      setCompletedSteps(totalSteps);
      return;
    }
    let step = 0;
    setCompletedSteps(0);
    timerRef.current = setInterval(() => {
      step += 1;
      setCompletedSteps(step);
      if (step >= totalSteps) clearInterval(timerRef.current);
    }, STEP_INTERVAL_MS);
  }, [totalSteps]);

  useEffect(() => {
    if (inView) play();
  }, [inView, play]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleMouseEnter = () => {
    if (completedSteps >= totalSteps) play();
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="m-0 text-[22px] font-extrabold">Mở shop trong 5 bước</h3>
      <ol
        ref={pipeRef}
        className="pipe m-0 grid list-none grid-cols-5 gap-0 p-0"
        aria-label="Quy trình mở shop"
        onMouseEnter={handleMouseEnter}
      >
        {OPEN_SHOP_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step.id];
          const state = index < completedSteps ? 'done' : index === completedSteps ? 'current' : 'todo';
          return (
            <li
              key={step.id}
              className={`pipe-step flex min-w-0 flex-col gap-3.5 ${state} ${index === totalSteps - 1 ? 'last' : ''}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <div className="pipe-row flex items-center">
                <span className="pipe-node" aria-hidden="true">
                  <Icon size={24} strokeWidth={2} />
                </span>
                <span className="pipe-line" aria-hidden="true">
                  <span className="pipe-fill" />
                </span>
              </div>
              <div className="pipe-card mr-3.5 flex flex-col gap-1.5 rounded-2xl bg-white p-[18px]">
                <span className="text-[17px] font-extrabold">{step.title}</span>
                <span className="text-sm leading-normal text-slate-600">{step.description}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
