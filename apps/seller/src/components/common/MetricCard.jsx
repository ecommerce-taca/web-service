import PropTypes from 'prop-types';

export default function MetricCard({ label, value, trend, isPositive, isWarning, subtitle }) {
  const getTrendColor = () => {
    if (isWarning) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (isPositive) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="bg-white rounded-card border border-taca-border p-4 sm:p-5 shadow-brand hover:shadow-brand-md transition-shadow min-h-[112px]">
      <div className="text-caption font-bold text-taca-text-muted tracking-wide uppercase">
        {label}
      </div>
      <div className="text-[24px] sm:text-heading font-extrabold text-taca-text-main mt-2 tracking-tight break-words">
        {value}
      </div>
      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {trend && (
            <span
              className={`text-caption font-semibold px-2 py-0.5 rounded-control border max-w-full break-words ${getTrendColor()}`}
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
