import { useState } from 'react';
import PropTypes from 'prop-types';

const ProductContentTabs = ({ description, reviewCount, brand, attributes = [] }) => {
  const [activeTab, setActiveTab] = useState('description');

  const specRows = [
    ...(brand ? [{ label: 'Thương hiệu', value: brand }] : []),
    ...(Array.isArray(attributes)
      ? attributes
          .map((attr) => ({
            label: attr.label || attr.key,
            value: Array.isArray(attr.values)
              ? attr.values.join(', ')
              : Array.isArray(attr.allowed_values)
              ? attr.allowed_values.join(', ')
              : attr.value,
          }))
          .filter((row) => row.label && row.value)
      : []),
  ];

  return (
    <div className="bg-white rounded-card border border-taca-border overflow-hidden shadow-brand">
      {/* Tab Navigation */}
      <div className="flex border-b border-taca-border overflow-x-auto" role="tablist">
        <button
          className={`flex-1 min-w-[120px] px-3 py-4 text-[14px] sm:text-[16px] border-b-[3px] bg-white transition-colors cursor-pointer ${
            activeTab === 'description'
              ? 'font-bold text-taca-primary border-taca-primary'
              : 'font-semibold text-taca-text-main border-transparent hover:text-taca-primary'
          }`}
          onClick={() => setActiveTab('description')}
        >
          Mô tả
        </button>
        <button
          className={`flex-1 min-w-[150px] px-3 py-4 text-[14px] sm:text-[16px] border-b-[3px] bg-white transition-colors cursor-pointer ${
            activeTab === 'specs'
              ? 'font-bold text-taca-primary border-taca-primary'
              : 'font-semibold text-taca-text-main border-transparent hover:text-taca-primary'
          }`}
          onClick={() => setActiveTab('specs')}
        >
          Thông số kỹ thuật
        </button>
        <button
          className={`flex-1 min-w-[130px] px-3 py-4 text-[14px] sm:text-[16px] border-b-[3px] bg-white transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'font-bold text-taca-primary border-taca-primary'
              : 'font-semibold text-taca-text-main border-transparent hover:text-taca-primary'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          Đánh giá ({reviewCount})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 text-[14px] leading-relaxed text-taca-text-main">
        {activeTab === 'description' && (
          <div className="whitespace-pre-line text-[15px] leading-7">
            {description || 'Không có mô tả cho sản phẩm này.'}
          </div>
        )}
        
        {activeTab === 'specs' && (
          <div className="flex flex-col gap-2 text-taca-text-muted">
            {specRows.length > 0 ? (
              specRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 border-b border-taca-border py-3">
                  <span className="font-semibold text-taca-text-main">{row.label}</span>
                  <span className="col-span-2">{row.value}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-taca-text-muted py-6 font-medium">
                Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center text-taca-text-muted py-8 font-medium">
            Vui lòng xem chi tiết phần đánh giá bên dưới.
          </div>
        )}
      </div>
    </div>
  );
};

ProductContentTabs.propTypes = {
  description: PropTypes.string,
  reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  brand: PropTypes.string,
  attributes: PropTypes.arrayOf(PropTypes.object),
};

export default ProductContentTabs;
