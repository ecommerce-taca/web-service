import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

export default function FormSuccess({ title, message, tone = 'mint', action = null }) {
  const isOnWhite = tone === 'white';
  return (
    <div
      className={`form-done flex items-center gap-3.5 rounded-[18px] p-5 ${isOnWhite ? 'bg-white' : 'bg-emerald-50'}`}
      role="status"
    >
      <span
        className={`form-check flex h-11 w-11 flex-none items-center justify-center rounded-full ${isOnWhite ? 'bg-emerald-50' : 'bg-white'}`}
        aria-hidden="true"
      >
        <Check size={22} strokeWidth={2.6} color="#047857" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-base font-extrabold text-slate-900">{title}</span>
        <span className="text-sm text-slate-700">{message}</span>
      </div>
      {action}
    </div>
  );
}

FormSuccess.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['white', 'mint']),
  action: PropTypes.node,
};
