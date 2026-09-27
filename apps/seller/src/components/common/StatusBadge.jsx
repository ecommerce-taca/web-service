import PropTypes from 'prop-types';

export default function StatusBadge({ status, type }) {
  const getBadgeStyle = () => {
    switch (type) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'preparing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipping':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'active':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'out_of_stock':
      case 'warning':
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'upcoming':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.string,
};
