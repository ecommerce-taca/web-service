import PropTypes from 'prop-types';

export default function MetricCard({ label, value, trend, isPositive, isWarning, subtitle }) {
  const getTrendColor = () => {
    if (isWarning) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (isPositive) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
        {label}
      </div>
      <div className="text-[26px] font-extrabold text-slate-900 mt-2 tracking-tight">
        {value}
      </div>
      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5">
          {trend && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getTrendColor()}`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.string,
  isPositive: PropTypes.bool,
  isWarning: PropTypes.bool,
  subtitle: PropTypes.string,
};
