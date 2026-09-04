import { useState } from 'react';
import PropTypes from 'prop-types';

const ProductContentTabs = ({ description, reviewCount }) => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="bg-white border border-border">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          className={`flex-1 py-4 text-[16px] border-b-2 bg-white transition-colors ${
            activeTab === 'description'
              ? 'font-bold text-primary border-primary'
              : 'font-medium text-main border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('description')}
        >
          Mô tả
        </button>
        <button
          className={`flex-1 py-4 text-[16px] border-b-2 bg-white transition-colors ${
            activeTab === 'specs'
              ? 'font-bold text-primary border-primary'
              : 'font-medium text-main border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('specs')}
        >
          Thông số kỹ thuật
        </button>
        <button
          className={`flex-1 py-4 text-[16px] border-b-2 bg-white transition-colors ${
            activeTab === 'reviews'
              ? 'font-bold text-primary border-primary'
              : 'font-medium text-main border-transparent hover:text-primary'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          Đánh giá ({reviewCount})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 text-[14px] leading-relaxed text-main">
        {activeTab === 'description' && (
          <div className="whitespace-pre-line">
            {description || 'Không có mô tả cho sản phẩm này.'}
          </div>
        )}
        
        {activeTab === 'specs' && (
          <div className="flex flex-col gap-2 text-muted">
            {/* Giả lập phần thông số kỹ thuật */}
            <div className="grid grid-cols-3 border-b border-border py-2">
              <span className="font-medium text-main">Thương hiệu</span>
              <span className="col-span-2">Apple</span>
            </div>
            <div className="grid grid-cols-3 border-b border-border py-2">
              <span className="font-medium text-main">Xuất xứ</span>
              <span className="col-span-2">Mỹ</span>
            </div>
            <div className="grid grid-cols-3 border-b border-border py-2">
              <span className="font-medium text-main">Bảo hành</span>
              <span className="col-span-2">12 tháng chính hãng</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center text-muted py-4">
            Vui lòng xem chi tiết phần đánh giá bên dưới.
          </div>
        )}
      </div>
    </div>
  );
};

ProductContentTabs.propTypes = {
  description: PropTypes.string,
  reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ProductContentTabs;
