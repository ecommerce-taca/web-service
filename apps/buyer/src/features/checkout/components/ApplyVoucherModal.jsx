import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from '@taca/ui-components';
import { Check, Ticket, AlertCircle, Truck } from 'lucide-react';
import { voucherApi } from '../../account/services/voucher.api';

export default function ApplyVoucherModal({ 
  isOpen, 
  onClose, 
  selectedShopVoucher = null, 
  selectedTacaVoucher = null,
  selectedFreeshipVoucher = null,
  onApplyVouchers,
  subtotal = 0,
  shippingFee = 30000
}) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [codeMessage, setCodeMessage] = useState(null);

  // Trạng thái tạm thời khi người dùng đang chọn trong modal
  const [tempShopVoucher, setTempShopVoucher] = useState(selectedShopVoucher);
  const [tempTacaVoucher, setTempTacaVoucher] = useState(selectedTacaVoucher);
  const [tempFreeshipVoucher, setTempFreeshipVoucher] = useState(selectedFreeshipVoucher);

  // Đồng bộ lại lựa chọn khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTempShopVoucher(selectedShopVoucher);
      setTempTacaVoucher(selectedTacaVoucher);
      setTempFreeshipVoucher(selectedFreeshipVoucher);
      setInputCode('');
      setCodeMessage(null);

      // Tải danh sách voucher khả dụng từ API
      setLoading(true);
      voucherApi.getVouchers({ status: 'ACTIVE' })
        .then(res => {
          const list = res.data?.data || res.data || [];
          setVouchers(list);
        })
        .catch(err => {
          console.error('Lỗi tải voucher:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, selectedShopVoucher, selectedTacaVoucher, selectedFreeshipVoucher]);

  // Phân loại voucher theo 3 slots chuẩn Backend: SHOP, PLATFORM, FREESHIP
  const shopVouchers = useMemo(() => {
    return vouchers.filter(v => v.provider === 'SHOP' || v.scope === 'SHOP');
  }, [vouchers]);

  const tacaVouchers = useMemo(() => {
    return vouchers.filter(v => 
      (v.provider === 'TACA' || v.scope === 'PLATFORM') && 
      v.type !== 'SHIPPING' && 
      v.scope !== 'FREESHIP'
    );
  }, [vouchers]);

  const freeshipVouchers = useMemo(() => {
    return vouchers.filter(v => 
      v.type === 'SHIPPING' || 
      v.scope === 'FREESHIP' || 
      v.code?.toUpperCase().includes('FREESHIP')
    );
  }, [vouchers]);

  // Toggle chọn hoặc BỎ CHỌN (bấm xóa đi dấu tick) voucher cửa hàng
  const handleToggleShopVoucher = (voucher) => {
    if (tempShopVoucher && (tempShopVoucher.id === voucher.id || tempShopVoucher.code === voucher.code)) {
      setTempShopVoucher(null); // Bỏ tick chọn
    } else {
      setTempShopVoucher(voucher); // Đánh dấu tick
    }
  };

  // Toggle chọn hoặc BỎ CHỌN (bấm xóa đi dấu tick) voucher Taca sàn
  const handleToggleTacaVoucher = (voucher) => {
    if (tempTacaVoucher && (tempTacaVoucher.id === voucher.id || tempTacaVoucher.code === voucher.code)) {
      setTempTacaVoucher(null); // Bỏ tick chọn
    } else {
      setTempTacaVoucher(voucher); // Đánh dấu tick
    }
  };

  // Toggle chọn hoặc BỎ CHỌN voucher miễn phí vận chuyển
  const handleToggleFreeshipVoucher = (voucher) => {
    if (tempFreeshipVoucher && (tempFreeshipVoucher.id === voucher.id || tempFreeshipVoucher.code === voucher.code)) {
      setTempFreeshipVoucher(null); // Bỏ tick chọn
    } else {
      setTempFreeshipVoucher(voucher); // Đánh dấu tick
    }
  };

  // Xử lý nhập mã voucher thủ công
  const handleApplyInputCode = () => {
    if (!inputCode.trim()) return;
    const cleanCode = inputCode.trim().toUpperCase();
    const found = vouchers.find(v => v.code?.toUpperCase() === cleanCode);

    if (!found) {
      setCodeMessage({ type: 'error', text: 'Mã voucher không tồn tại hoặc đã hết hạn.' });
      return;
    }

    if (found.min_order_value && subtotal < found.min_order_value) {
      setCodeMessage({ 
        type: 'error', 
        text: `Đơn hàng chưa đạt giá trị tối thiểu ${new Intl.NumberFormat('vi-VN').format(found.min_order_value)} ₫ để dùng mã này.` 
      });
      return;
    }

    const isShipping = found.type === 'SHIPPING' || found.scope === 'FREESHIP' || found.code?.toUpperCase().includes('FREESHIP');
    if (isShipping) {
      setTempFreeshipVoucher(found);
      setCodeMessage({ type: 'success', text: `Đã áp dụng mã miễn phí vận chuyển ${found.code}!` });
    } else if (found.provider === 'SHOP' || found.scope === 'SHOP') {
      setTempShopVoucher(found);
      setCodeMessage({ type: 'success', text: `Đã áp dụng mã giảm giá cửa hàng ${found.code}!` });
    } else {
      setTempTacaVoucher(found);
      setCodeMessage({ type: 'success', text: `Đã áp dụng mã giảm giá Taca ${found.code}!` });
    }
  };

  // Tính tổng số tiền tiết kiệm trên cả 3 slots
  const totalSavings = useMemo(() => {
    let savings = 0;
    if (tempShopVoucher) {
      savings += tempShopVoucher.discount_amount || 0;
    }
    if (tempTacaVoucher) {
      savings += tempTacaVoucher.discount_amount || 0;
    }
    if (tempFreeshipVoucher) {
      const freeshipDiscount = tempFreeshipVoucher.discount_amount || 0;
      savings += Math.min(shippingFee, freeshipDiscount);
    }
    return savings;
  }, [tempShopVoucher, tempTacaVoucher, tempFreeshipVoucher, shippingFee]);

  const selectedCount = (tempShopVoucher ? 1 : 0) + (tempTacaVoucher ? 1 : 0) + (tempFreeshipVoucher ? 1 : 0);

  const handleConfirm = () => {
    if (onApplyVouchers) {
      onApplyVouchers({
        shopVoucher: tempShopVoucher,
        tacaVoucher: tempTacaVoucher,
        freeshipVoucher: tempFreeshipVoucher
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CHỌN VOUCHER GIẢM GIÁ" width="max-w-2xl">
      <div className="p-2 sm:p-4">
        <p className="text-[12px] text-taca-text-muted mb-4 leading-relaxed">
          Áp dụng tối đa 3 loại voucher theo cơ chế Multi-slot: 1 Voucher Cửa hàng + 1 Voucher Toàn sàn + 1 Mã Miễn phí vận chuyển.
        </p>
        
        {/* Nhập mã voucher */}
        <div className="mb-6">
          <label htmlFor="voucher-code-input" className="font-bold text-taca-text-main mb-2 text-[12px] block uppercase tracking-wider">
            Nhập mã voucher
          </label>
          <div className="flex gap-2">
            <input 
              id="voucher-code-input"
              type="text" 
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setCodeMessage(null);
              }}
              placeholder="VD: APPLE300K, TACA200K, FREESHIP50K..." 
              className="flex-1 border border-taca-border rounded-lg px-3.5 py-2.5 text-[13px] uppercase font-bold focus:outline-none focus:border-taca-primary" 
            />
            <Button 
              type="button"
              variant="primary" 
              onClick={handleApplyInputCode}
              className="h-10 px-5 text-[13px] font-bold rounded-lg"
            >
              Áp dụng
            </Button>
          </div>
          {codeMessage && (
            <p className={`text-[12px] mt-1.5 flex items-center gap-1 font-medium ${
              codeMessage.type === 'error' ? 'text-taca-sale' : 'text-emerald-600'
            }`}>
              <AlertCircle size={13} />
              {codeMessage.text}
            </p>
          )}
        </div>

        {/* Danh sách Voucher - Duy nhất 1 thanh cuộn sạch sẽ */}
        <div className="space-y-6 max-h-[420px] overflow-y-auto pr-1">
          {/* 1. Voucher Cửa hàng (Slot SHOP) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-taca-text-main text-[13px] uppercase tracking-wide flex items-center gap-1.5">
                <Ticket size={15} className="text-taca-sale" />
                VOUCHER CỬA HÀNG (TỐI ĐA 1)
              </h4>
              {tempShopVoucher && (
                <button 
                  type="button"
                  onClick={() => setTempShopVoucher(null)}
                  className="text-[11px] font-semibold text-taca-sale hover:underline cursor-pointer bg-transparent"
                >
                  Bỏ chọn voucher shop
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-[12px] text-taca-text-muted py-2">Đang tải mã giảm giá...</p>
            ) : shopVouchers.length === 0 ? (
              <p className="text-[12px] text-taca-text-muted py-2">Không có voucher cửa hàng nào.</p>
            ) : (
              <div className="space-y-3">
                {shopVouchers.map(v => {
                  const isChecked = tempShopVoucher?.id === v.id || tempShopVoucher?.code === v.code;
                  const isEligible = !v.min_order_value || subtotal >= v.min_order_value;

                  return (
                    <div 
                      key={v.id} 
                      onClick={() => isEligible && handleToggleShopVoucher(v)}
                      className={`flex border rounded-xl overflow-hidden transition-all cursor-pointer select-none ${
                        !isEligible 
                          ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : isChecked
                            ? 'border-taca-sale bg-rose-50/30 shadow-xs'
                            : 'border-taca-border bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="w-28 bg-[#FFF5F5] border-r border-dashed border-red-200 flex flex-col items-center justify-center p-3 text-center shrink-0">
                        <span className="font-extrabold text-[16px] text-taca-sale leading-tight">
                          {new Intl.NumberFormat('vi-VN').format(v.discount_amount || 0)} ₫
                        </span>
                        <span className="text-[10px] font-bold text-taca-sale mt-0.5">SHOP</span>
                      </div>
                      
                      <div className="flex-1 p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-taca-text-main text-[13px]">{v.title}</p>
                          <p className="text-[11px] text-taca-text-muted mt-0.5">{v.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-extrabold text-taca-sale bg-rose-100/60 px-1.5 py-0.5 rounded">
                              {v.code}
                            </span>
                            {isEligible ? (
                              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đủ điều kiện
                              </span>
                            ) : (
                              <span className="text-[11px] text-taca-sale font-medium">Chưa đủ đơn tối thiểu</span>
                            )}
                          </div>
                        </div>

                        {/* Checkbox toggle: bấm xóa hoặc chọn lại dấu tick */}
                        <div 
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked 
                              ? 'border-taca-sale bg-taca-sale text-white' 
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Voucher Taca Toàn sàn (Slot PLATFORM) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-taca-text-main text-[13px] uppercase tracking-wide flex items-center gap-1.5">
                <Ticket size={15} className="text-taca-primary" />
                VOUCHER TACA TOÀN SÀN (TỐI ĐA 1)
              </h4>
              {tempTacaVoucher && (
                <button 
                  type="button"
                  onClick={() => setTempTacaVoucher(null)}
                  className="text-[11px] font-semibold text-taca-primary hover:underline cursor-pointer bg-transparent"
                >
                  Bỏ chọn voucher Taca
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-[12px] text-taca-text-muted py-2">Đang tải mã giảm giá...</p>
            ) : tacaVouchers.length === 0 ? (
              <p className="text-[12px] text-taca-text-muted py-2">Không có voucher Taca nào.</p>
            ) : (
              <div className="space-y-3">
                {tacaVouchers.map(v => {
                  const isChecked = tempTacaVoucher?.id === v.id || tempTacaVoucher?.code === v.code;
                  const isEligible = !v.min_order_value || subtotal >= v.min_order_value;

                  return (
                    <div 
                      key={v.id} 
                      onClick={() => isEligible && handleToggleTacaVoucher(v)}
                      className={`flex border rounded-xl overflow-hidden transition-all cursor-pointer select-none ${
                        !isEligible 
                          ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : isChecked
                            ? 'border-taca-primary bg-indigo-50/40 shadow-xs'
                            : 'border-taca-border bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="w-28 bg-[#F5F3FF] border-r border-dashed border-indigo-200 flex flex-col items-center justify-center p-3 text-center shrink-0">
                        <span className="font-extrabold text-[16px] text-taca-primary leading-tight">
                          {new Intl.NumberFormat('vi-VN').format(v.discount_amount || 0)} ₫
                        </span>
                        <span className="text-[10px] font-bold text-taca-primary mt-0.5">TACA</span>
                      </div>
                      
                      <div className="flex-1 p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-taca-text-main text-[13px]">{v.title}</p>
                          <p className="text-[11px] text-taca-text-muted mt-0.5">{v.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-extrabold text-taca-primary bg-indigo-100/70 px-1.5 py-0.5 rounded">
                              {v.code}
                            </span>
                            {isEligible ? (
                              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đủ điều kiện
                              </span>
                            ) : (
                              <span className="text-[11px] text-taca-sale font-medium">Chưa đủ đơn tối thiểu</span>
                            )}
                          </div>
                        </div>

                        {/* Checkbox toggle: bấm xóa hoặc chọn lại dấu tick */}
                        <div 
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked 
                              ? 'border-taca-primary bg-taca-primary text-white' 
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Mã Miễn phí vận chuyển (Slot FREESHIP) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-taca-text-main text-[13px] uppercase tracking-wide flex items-center gap-1.5">
                <Truck size={15} className="text-emerald-600" />
                MÃ MIỄN PHÍ VẬN CHUYỂN (TỐI ĐA 1)
              </h4>
              {tempFreeshipVoucher && (
                <button 
                  type="button"
                  onClick={() => setTempFreeshipVoucher(null)}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer bg-transparent"
                >
                  Bỏ chọn mã freeship
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-[12px] text-taca-text-muted py-2">Đang tải mã giảm giá...</p>
            ) : freeshipVouchers.length === 0 ? (
              <p className="text-[12px] text-taca-text-muted py-2">Không có mã miễn phí vận chuyển nào.</p>
            ) : (
              <div className="space-y-3">
                {freeshipVouchers.map(v => {
                  const isChecked = tempFreeshipVoucher?.id === v.id || tempFreeshipVoucher?.code === v.code;
                  const isEligible = !v.min_order_value || subtotal >= v.min_order_value;

                  return (
                    <div 
                      key={v.id} 
                      onClick={() => isEligible && handleToggleFreeshipVoucher(v)}
                      className={`flex border rounded-xl overflow-hidden transition-all cursor-pointer select-none ${
                        !isEligible 
                          ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : isChecked
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                            : 'border-taca-border bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="w-28 bg-[#ECFDF5] border-r border-dashed border-emerald-200 flex flex-col items-center justify-center p-3 text-center shrink-0">
                        <span className="font-extrabold text-[16px] text-emerald-600 leading-tight">
                          {new Intl.NumberFormat('vi-VN').format(v.discount_amount || 0)} ₫
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 mt-0.5">FREESHIP</span>
                      </div>
                      
                      <div className="flex-1 p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-taca-text-main text-[13px]">{v.title}</p>
                          <p className="text-[11px] text-taca-text-muted mt-0.5">{v.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                              {v.code}
                            </span>
                            {isEligible ? (
                              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đủ điều kiện
                              </span>
                            ) : (
                              <span className="text-[11px] text-taca-sale font-medium">Chưa đủ đơn tối thiểu</span>
                            )}
                          </div>
                        </div>

                        {/* Checkbox toggle: bấm xóa hoặc chọn lại dấu tick */}
                        <div 
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked 
                              ? 'border-emerald-600 bg-emerald-600 text-white' 
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Thanh tóm tắt và nút Xác nhận áp dụng */}
        <div className="mt-6 pt-4 border-t border-taca-border flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-taca-text-main text-[13px]">
              {selectedCount > 0 ? `${selectedCount} voucher đã chọn (tối đa 3)` : 'Chưa chọn voucher nào'}
            </p>
            {totalSavings > 0 ? (
              <p className="font-extrabold text-emerald-600 text-[14px] mt-0.5">
                Tiết kiệm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSavings)}
              </p>
            ) : (
              <p className="text-[12px] text-taca-text-muted mt-0.5">Không áp dụng giảm giá</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {(tempShopVoucher || tempTacaVoucher || tempFreeshipVoucher) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setTempShopVoucher(null);
                  setTempTacaVoucher(null);
                  setTempFreeshipVoucher(null);
                }}
                className="h-11 px-4 text-[13px] rounded-lg"
              >
                Bỏ chọn hết
              </Button>
            )}
            <Button 
              variant="primary"
              onClick={handleConfirm}
              className="h-11 px-6 text-[13px] font-bold rounded-lg"
            >
              Áp dụng voucher
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

ApplyVoucherModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedShopVoucher: PropTypes.object,
  selectedTacaVoucher: PropTypes.object,
  selectedFreeshipVoucher: PropTypes.object,
  onApplyVouchers: PropTypes.func,
  subtotal: PropTypes.number,
  shippingFee: PropTypes.number,
};
