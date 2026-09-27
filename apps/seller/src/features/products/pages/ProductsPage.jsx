import { useState } from 'react';
import MetricCard from '../../../components/common/MetricCard';
import StatusBadge from '../../../components/common/StatusBadge';
import ProductEditorModal from '../components/ProductEditorModal';
import { SELLER_MOCK_DATA } from '../../../services/seller.mock';

export default function ProductsPage() {
  const { products } = SELLER_MOCK_DATA;
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedSpuId, setExpandedSpuId] = useState(null);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'active', label: 'Đang bán' },
    { id: 'out_of_stock', label: 'Hết hàng' },
    { id: 'hidden', label: 'Tạm ẩn' },
  ];

  const filteredItems = products.items.filter((item) => {
    if (activeTab === 'active' && item.status_type !== 'active') return false;
    if (activeTab === 'out_of_stock' && item.status_type !== 'out_of_stock') return false;
    if (activeTab === 'hidden' && item.status_type !== 'hidden') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Quản lý SPU, biến thể SKU, tồn kho, giá và trạng thái hiển thị.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditorOpen(true)}
          className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span>＋</span>
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.metrics.map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.value}
            trend={m.trend}
            isPositive={m.isPositive}
            isWarning={m.isWarning}
          />
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Tìm tên SPU, mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#4F46E5] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Excel Import / Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('Chức năng nhập file Excel danh mục SPU / SKU')}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>📄</span>
            <span>Nhập Excel</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Đã xuất danh sách sản phẩm thành công!')}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* SPU & SKU Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-6">SẢN PHẨM / SPU</th>
                <th className="py-3.5 px-6">GIÁ BÁN</th>
                <th className="py-3.5 px-6">TỒN KHO</th>
                <th className="py-3.5 px-6">ĐÃ BÁN</th>
                <th className="py-3.5 px-6">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((spu) => {
                const isExpanded = expandedSpuId === spu.id;
                return (
                  <tr key={spu.id} className="group hover:bg-slate-50/40 transition-colors">
                    {/* SPU column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={spu.image}
                          alt={spu.name}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-[14px]">
                            {spu.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {spu.code}
                          </div>
                          <div className="text-[11px] text-[#4F46E5] font-medium mt-1">
                            {spu.variants_desc}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price Range */}
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      {spu.price_range}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6">
                      <span className={`font-bold ${spu.stock === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {spu.stock}
                      </span>
                    </td>

                    {/* Sold */}
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {spu.sold}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={spu.status} type={spu.status_type} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setExpandedSpuId(isExpanded ? null : spu.id)}
                          className="text-[12px] font-semibold text-slate-600 hover:text-slate-900"
                        >
                          {isExpanded ? 'Thu gọn ▴' : 'Xem SKU ▾'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditorOpen(true)}
                          className="text-[12px] font-semibold text-[#4F46E5] hover:underline"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product SPU/SKU Editor Modal */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
