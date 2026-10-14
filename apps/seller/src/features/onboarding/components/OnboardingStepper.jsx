import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

/**
 * Stepper Header hiển thị 4 bước thiết lập gian hàng
 */
export default function OnboardingStepper({ stepsList, stepStatuses, currentStep, onSelectStep }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stepsList.map((step) => {
          const isCompleted = stepStatuses[step.key];
          const isActive = currentStep === step.key;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelectStep(step.key)}
              className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                isActive
                  ? 'bg-indigo-50/70 border-[#4F46E5] shadow-xs'
                  : isCompleted
                  ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 opacity-80'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 text-white" aria-hidden="true" /> : step.number}
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{step.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

OnboardingStepper.propTypes = {
  stepsList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      desc: PropTypes.string.isRequired,
    })
  ).isRequired,
  stepStatuses: PropTypes.objectOf(PropTypes.bool).isRequired,
  currentStep: PropTypes.string.isRequired,
  onSelectStep: PropTypes.func.isRequired,
};
