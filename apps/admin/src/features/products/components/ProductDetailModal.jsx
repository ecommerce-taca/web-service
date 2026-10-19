import { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import {
  X,
  Store,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Barcode,
  CheckCircle2,
  Clock,
  Layers,
  Unlock,
  Ban,
  Loader2,
} from 'lucide-react';

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onBlock,
  onUnblock,
}) {
  const [unblocking, setUnblocking] = useState(false);
  const [unblockReason, setUnblockReason] = useState('');
  const [showUnblockPrompt, setShowUnblockPrompt] = useState(false);

  if (!isOpen || !product) return null;

  const isBlocked = product.status === 'BLOCKED';

  const handleConfirmUnblock = async () => {
    try {
      setUnblocking(true);
      await onUnblock({
        productId: product.product_id,
        version: product.version || 1,
        reason: unblockReason.trim() || 'Đã xác minh và gỡ bỏ khóa an toàn về trạng thái INACTIVE',
      });
      setShowUnblockPrompt(false);
      setUnblockReason('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setUnblocking(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {product.spu_code || product.product_id}
            </span>
            <div className="flex items-center gap-2">
              {product.status === 'ACTIVE' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đang bán (ACTIVE)
                </span>
              )}
              {product.status === 'BLOCKED' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <ShieldAlert className="w-3.5 h-3.5" /> Đã khóa (BLOCKED)
                </span>
              )}
              {product.status === 'INACTIVE' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Tạm ẩn (INACTIVE)
                </span>
              )}
              {product.status === 'DRAFT' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Bản nháp (DRAFT)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Block Reason Banner */}
          {isBlocked && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Lý do khóa kiểm duyệt (Post-publication block):
              </div>
              <p className="text-sm font-medium">
                {product.block_reason || 'Vi phạm chính sách sàn thương mại điện tử.'}
              </p>
            </div>
          )}

          {/* Basic Info & Media */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {product.cover_media?.url && (
              <img
                src={product.cover_media.url}
                alt={product.title}
                className="w-28 h-28 object-cover rounded-xl border border-slate-200 shrink-0 shadow-xs"
              />
            )}
            <div className="space-y-2 flex-1">
              <h2 className="text-base font-bold text-slate-900 leading-snug">{product.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  {product.shop_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {product.category_name || product.category_id}
                </span>
                <span>•</span>
                <span>Version: <strong className="font-mono">{product.version}</strong></span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="text-sm font-bold text-[#0A68FF]">
                  {product.price_summary?.sale_price
                    ? `${Number(product.price_summary.sale_price).toLocaleString('vi-VN')} ₫`
                    : '---'}
                </div>
                {product.price_summary?.base_price && product.price_summary.base_price > product.price_summary.sale_price && (
                  <span className="text-xs text-slate-400 line-through">
                    {Number(product.price_summary.base_price).toLocaleString('vi-VN')} ₫
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Shop Projection & Risk Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Hồ sơ Shop & KYC (Auth-User Projection)
              </div>
              <div className="text-xs space-y-1 text-slate-600">
                <div>Shop ID: <span className="font-mono text-slate-800">{product.shop_id}</span></div>
                <div>Trạng thái gian hàng: <strong className="text-emerald-700">{product.shop_projection?.status || 'ACTIVE'}</strong></div>
                <div>Thẩm định KYC: <strong className="text-blue-700">{product.shop_projection?.kyc_status || 'APPROVED'}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Tín hiệu giám sát rủi ro (Risk Signals)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.risk_signals && product.risk_signals.length > 0 ? (
                  product.risk_signals.map((sig, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100/70 text-amber-900 border border-amber-200"
                    >
                      {sig}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Không có tín hiệu rủi ro phát hiện.</span>
                )}
              </div>
            </div>
          </div>

          {/* SKU Matrix Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-slate-500" />
                Danh sách biến thể SKU ({product.skus?.length || 0})
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Mã SKU</th>
                    <th className="px-4 py-2.5">Thuộc tính phân loại</th>
                    <th className="px-4 py-2.5 text-right">Tồn kho</th>
                    <th className="px-4 py-2.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.skus && product.skus.length > 0 ? (
                    product.skus.map((sku) => (
                      <tr key={sku.sku_id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-mono font-medium text-slate-900">
                          {sku.seller_sku || sku.sku_id}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {sku.attributes
                            ? Object.entries(sku.attributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' | ')
                            : 'Mặc định'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-800">
                          {sku.stock_display?.available_qty_snapshot ?? 0}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {sku.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                        Không có SKU nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit History Log */}
          {product.audit_summary && product.audit_summary.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                Lịch sử kiểm toán (Audit Summary)
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                {product.audit_summary.map((audit, idx) => (
                  <div key={idx} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 uppercase px-1.5 py-0.5 rounded bg-slate-200 text-[10px]">
                        {audit.action}
                      </span>
                      <span>bởi <strong className="text-slate-700">{audit.actor}</strong></span>
                      {audit.reason && <span className="text-slate-500">({audit.reason})</span>}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(audit.occurred_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unblock prompt inside drawer */}
          {showUnblockPrompt && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                <Unlock className="w-4 h-4 text-blue-600" />
                Xác nhận mở khóa sản phẩm về trạng thái INACTIVE
              </div>
              <p className="text-xs text-blue-800">
                Theo đặc tả §3.3, sản phẩm sau khi mở khóa sẽ trở về trạng thái <code>INACTIVE</code> để Người bán tự kiểm tra lại nội dung trước khi xuất bản lại.
              </p>
              <input
                type="text"
                value={unblockReason}
                onChange={(e) => setUnblockReason(e.target.value)}
                placeholder="Lý do mở khóa (ví dụ: Shop đã chỉnh sửa bỏ claim y tế)..."
                className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnblockPrompt(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnblock}
                  disabled={unblocking}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  {unblocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  Xác nhận mở khóa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            ID: <span className="font-mono">{product.product_id}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Đóng lại
            </button>

            {isBlocked ? (
              <button
                type="button"
                onClick={() => setShowUnblockPrompt(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                Mở khóa an toàn (INACTIVE)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBlock(product);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                Khóa vi phạm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

ProductDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    product_id: PropTypes.string,
    title: PropTypes.string,
    spu_code: PropTypes.string,
    status: PropTypes.string,
    shop_id: PropTypes.string,
    shop_name: PropTypes.string,
    category_id: PropTypes.string,
    category_name: PropTypes.string,
    version: PropTypes.number,
    price_summary: PropTypes.object,
    cover_media: PropTypes.object,
    shop_projection: PropTypes.object,
    risk_signals: PropTypes.array,
    skus: PropTypes.array,
    audit_summary: PropTypes.array,
    block_reason: PropTypes.string,
  }),
  onBlock: PropTypes.func.isRequired,
  onUnblock: PropTypes.func.isRequired,
};
