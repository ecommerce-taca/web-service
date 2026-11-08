import PropTypes from 'prop-types';
import { Package } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Package,
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có dữ liệu nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`.trim()}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-bold text-taca-text-main m-0">{title}</h3>
      {description && (
        <p className="text-[13px] text-taca-text-muted max-w-sm m-0 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;

