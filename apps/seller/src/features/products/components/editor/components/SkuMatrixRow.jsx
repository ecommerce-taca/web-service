import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Single SKU Matrix Row - memoized để tránh re-render hàng loạt khi gõ input
 */
function SkuMatrixRow({ sku, onUpdateCode, onUpdatePrice, onUpdateStock, onToggle }) {
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-3 px-4 font-semibold text-slate-800">
        <div>{sku.name}</div>
        {sku.attributes && Object.keys(sku.attributes).length > 0 && (
          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
            {Object.entries(sku.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <input
          type="text"
          required
          value={sku.code || ''}
          onChange={(e) => onUpdateCode(sku.id, e.target.value.toUpperCase())}
          placeholder="Mã SKU (VD: IP16-256-NAT)"
          className="w-full min-w-[140px] px-2.5 py-1.5 font-mono text-[11px] border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5] bg-white uppercase"
        />
      </td>
      <td className="py-3 px-4">
        <input
          type="text"
          value={sku.price}
          onChange={(e) => onUpdatePrice(sku.id, e.target.value)}
          onBlur={() => {
            const clean = String(sku.price).replace(/\D/g, '');
            if (clean) {
              onUpdatePrice(sku.id, Number(clean).toLocaleString('vi-VN'));
            }
          }}
          className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5]"
        />
      </td>
      <td className="py-3 px-4">
        <input
          type="number"
          value={sku.stock}
          onChange={(e) => onUpdateStock(sku.id, e.target.value)}
          className="w-16 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5]"
        />
      </td>
      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => onToggle(sku.id)}
          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-colors cursor-pointer ${
            sku.enabled
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-400 border border-slate-200'
          }`}
        >
          {sku.enabled ? 'ON' : 'OFF'}
        </button>
      </td>
    </tr>
  );
}

SkuMatrixRow.propTypes = {
  sku: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    code: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    enabled: PropTypes.bool,
    attributes: PropTypes.object,
  }).isRequired,
  onUpdateCode: PropTypes.func.isRequired,
  onUpdatePrice: PropTypes.func.isRequired,
  onUpdateStock: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default memo(SkuMatrixRow);
