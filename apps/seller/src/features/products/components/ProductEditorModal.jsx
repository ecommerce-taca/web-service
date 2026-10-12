import { useState, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import sellerProductApi, { calculateFileSha256 } from '../services/seller-product.api';

// Subcomponents & Utilities
import { generateCartesianCombinations, generateSkusFromCombos } from './editor/utils/skuGenerator';
import BasicInfoStep from './editor/steps/BasicInfoStep';
import AttributesStep from './editor/steps/AttributesStep';
import SkuMatrixStep from './editor/steps/SkuMatrixStep';
import ShippingStep from './editor/steps/ShippingStep';
import AddAttributeModal from './editor/components/AddAttributeModal';

/**
 * Inner Form: Quản lý toàn bộ state và điều phối các step của modal soạn thảo sản phẩm.
 * Được mount với key duy nhất để khởi tạo state mà không cần gọi setState trong useEffect.
 */
function ProductEditorForm({ product, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [spuName, setSpuName] = useState(product ? (product.title || product.name || '') : '');
  const [category, setCategory] = useState(
    product ? (product.primary_category_id || product.category_name || 'dien-thoai') : 'dien-thoai'
  );
  const [brand, setBrand] = useState(product ? (product.brand || '') : '');
  const [spuCode, setSpuCode] = useState(product ? (product.spu_code || product.code || '') : 'SPU-NEW');
  const [description, setDescription] = useState(product ? (product.description || '') : '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Quản lý ảnh sản phẩm và S3 Presigned URL (#15, #16)
  const [images, setImages] = useState(
    product?.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80']
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  // Khởi tạo thuộc tính
  const [attributes, setAttributes] = useState(() => {
    if (product?.attribute_definitions && product.attribute_definitions.length > 0) {
      return product.attribute_definitions.map((a, idx) => ({
        id: idx + 1,
        name: a.name,
        display_as: a.display_as || 'PLAIN',
        values: a.values || []
      }));
    }
    return [
      { id: 1, name: 'Dung lượng', display_as: 'PLAIN', values: ['256GB', '512GB', '1TB'] },
      { id: 2, name: 'Màu sắc', display_as: 'COLOR_SWATCH', values: ['Titan tự nhiên', 'Titan đen'] },
      { id: 3, name: 'Kết nối', display_as: 'PLAIN', values: ['Wi-Fi', '5G'] }
    ];
  });

  const [newValueInputs, setNewValueInputs] = useState({});
  const [isAddAttrModalOpen, setIsAddAttrModalOpen] = useState(false);

  // Sinh Cartesian Product từ các thuộc tính
  const generatedCombinations = useMemo(() => {
    return generateCartesianCombinations(attributes);
  }, [attributes]);

  // Khởi tạo danh sách SKU
  const [skus, setSkus] = useState(() => {
    if (product?.skus && product.skus.length > 0) {
      return product.skus.map((s, idx) => ({
        id: s.id || `sku-${idx + 1}`,
        code: s.sku_code || `SKU-${idx + 1}`,
        name: Object.values(s.attributes || {}).join(' / ') || s.name || `Biến thể ${idx + 1}`,
        price: s.price?.sale_price ? Number(s.price.sale_price).toLocaleString('vi-VN') : '29.490.000',
        stock: s.stock_display ?? 20,
        enabled: s.status !== 'INACTIVE',
        attributes: s.attributes || {}
      }));
    }
    return [
      { id: 'sku-1', code: 'IP16-256-NAT-WF', name: '256GB / Titan tự nhiên / Wi-Fi', price: '29.490.000', stock: 38, enabled: true, attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan tự nhiên', 'Kết nối': 'Wi-Fi' } },
      { id: 'sku-2', code: 'IP16-256-NAT-5G', name: '256GB / Titan tự nhiên / 5G', price: '31.490.000', stock: 24, enabled: true, attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan tự nhiên', 'Kết nối': '5G' } },
      { id: 'sku-3', code: 'IP16-512-BLK-WF', name: '512GB / Titan đen / Wi-Fi', price: '35.990.000', stock: 18, enabled: true, attributes: { 'Dung lượng': '512GB', 'Màu sắc': 'Titan đen', 'Kết nối': 'Wi-Fi' } },
      { id: 'sku-4', code: 'IP16-512-BLK-5G', name: '512GB / Titan đen / 5G', price: '37.990.000', stock: 12, enabled: true, attributes: { 'Dung lượng': '512GB', 'Màu sắc': 'Titan đen', 'Kết nối': '5G' } },
    ];
  });

  // State hỗ trợ cập nhật hàng loạt cho SKU
  const [bulkPriceInput, setBulkPriceInput] = useState('');
  const [bulkStockInput, setBulkStockInput] = useState('');

  // Callbacks tối ưu kết hợp với SkuMatrixRow memoization
  const handleUpdateSkuCode = useCallback((skuId, val) => {
    setSkus(prev => prev.map(s => s.id === skuId ? { ...s, code: val } : s));
  }, []);

  const handleUpdateSkuPrice = useCallback((skuId, val) => {
    setSkus(prev => prev.map(s => s.id === skuId ? { ...s, price: val } : s));
  }, []);

  const handleUpdateSkuStock = useCallback((skuId, val) => {
    setSkus(prev => prev.map(s => s.id === skuId ? { ...s, stock: Number(val) || 0 } : s));
  }, []);

  const handleToggleSku = useCallback((skuId) => {
    setSkus(prev => prev.map(s => s.id === skuId ? { ...s, enabled: !s.enabled } : s));
  }, []);

  const handleRegenerateSkus = () => {
    const newSkus = generateSkusFromCombos(generatedCombinations, skus, spuCode);
    setSkus(newSkus);
    setNotification(`✓ Đã sinh lại ${newSkus.length} SKU từ ${generatedCombinations.length} tổ hợp thuộc tính!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApplyBulkPrice = () => {
    if (!bulkPriceInput.trim()) return;
    const clean = bulkPriceInput.replace(/\D/g, '');
    if (!clean) return;
    const formatted = Number(clean).toLocaleString('vi-VN');
    setSkus(skus.map(s => ({ ...s, price: formatted })));
    setNotification('✓ Đã áp dụng giá bán cho tất cả SKU!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleApplyBulkStock = () => {
    const num = Number(bulkStockInput);
    if (isNaN(num)) return;
    setSkus(skus.map(s => ({ ...s, stock: num })));
    setNotification('✓ Đã áp dụng số lượng tồn kho cho tất cả SKU!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleToggleAllSkus = (enable) => {
    setSkus(skus.map(s => ({ ...s, enabled: enable })));
  };

  const handleNextStep = () => {
    if (step === 2) {
      // Khi từ bước 2 sang bước 3: tự động sinh lại bảng SKU nếu chưa có hoặc tổ hợp thay đổi
      if (generatedCombinations.length > 0 && skus.length !== generatedCombinations.length) {
        const synched = generateSkusFromCombos(generatedCombinations, skus, spuCode);
        setSkus(synched);
      }
    }
    setStep(step + 1);
  };

  const handleAddValue = (attrId) => {
    const val = (newValueInputs[attrId] || '').trim();
    if (!val) return;
    setAttributes(attributes.map(a => 
      a.id === attrId && !a.values.includes(val)
        ? { ...a, values: [...a.values, val] }
        : a
    ));
    setNewValueInputs({ ...newValueInputs, [attrId]: '' });
  };

  const handleRemoveValue = (attrId, valToRemove) => {
    setAttributes(attributes.map(a => 
      a.id === attrId ? { ...a, values: a.values.filter(v => v !== valToRemove) } : a
    ));
  };

  const handleAddNewAttribute = ({ name, display_as, values }) => {
    const newId = attributes.length + 1;
    setAttributes([
      ...attributes,
      {
        id: newId,
        name,
        display_as,
        values
      }
    ]);
    setIsAddAttrModalOpen(false);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const targetId = product?.id || product?.productId || 'spu-draft';
      const fileHash = await calculateFileSha256(file);
      const isFirstImage = images.length === 0;

      // 1. Xin presigned upload URL từ S3 qua Service API (§3.2 #15)
      const res = await sellerProductApi.getMediaUploadUrl(targetId, {
        scope: 'SPU',
        sku_id: null,
        file_name: file.name,
        content_type: file.type || 'image/jpeg',
        size_bytes: file.size,
        sha256: fileHash,
        is_cover: isFirstImage
      });
      const mediaData = res?.data || {};

      // 2. Xác nhận tải lên thành công qua Service API (§3.2 #16)
      await sellerProductApi.completeMediaUpload(targetId, {
        media_id: mediaData.media_id,
        object_key: mediaData.object_key || mediaData.file_key,
        sha256: fileHash
      });

      // Tạo preview hiển thị ngay trên UI
      const previewUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, previewUrl]);
    } catch (err) {
      alert(`Không thể tải ảnh: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveDraft = async () => {
    if (!spuName.trim()) {
      alert('Vui lòng nhập tên sản phẩm (SPU)!');
      return;
    }

    try {
      setLoading(true);
      const targetId = product?.id || product?.productId || `spu-${Date.now()}`;

      const formattedSkus = skus.map(s => ({
        sku_code: s.code?.trim() || `SKU-${s.id}`,
        name: s.name,
        attributes: s.attributes || {},
        price: {
          base_price: Number(String(s.price).replace(/\D/g, '')) || 0,
          sale_price: Number(String(s.price).replace(/\D/g, '')) || 0,
          currency: 'VND'
        },
        stock_display: Number(s.stock) || 0,
        tax_rate_bps: 1000,
        status: s.enabled ? 'ACTIVE' : 'INACTIVE'
      }));

      const prices = formattedSkus.map(s => s.price.sale_price).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;

      const attrDefs = attributes.map(a => ({
        name: a.name,
        display_as: a.display_as || 'PLAIN',
        values: a.values || []
      }));

      if (product) {
        await sellerProductApi.updateProduct(targetId, {
          title: spuName.trim(),
          spu_code: spuCode.trim(),
          slug: spuCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          brand: brand.trim(),
          primary_category_id: category,
          description: description.trim(),
          images,
          price_summary: { min_price: minPrice, max_price: maxPrice, currency: 'VND' },
          version: product.version || 1
        });
        await sellerProductApi.replaceSkus(targetId, {
          attribute_definitions: attrDefs,
          skus: formattedSkus,
          version: product.version || 1
        });
        if (category) {
          await sellerProductApi.assignCategories(targetId, {
            primary_category_id: category,
            secondary_category_ids: [],
            version: (product.version || 1) + 1
          });
        }
      } else {
        const createRes = await sellerProductApi.createProductDraft({
          title: spuName.trim(),
          spu_code: spuCode.trim() || `SPU-${Date.now()}`,
          slug: (spuCode || spuName).toLowerCase().replace(/[^a-z0-9]/g, '-'),
          brand: brand.trim(),
          primary_category_id: category,
          description: description.trim(),
          images,
          price_summary: { min_price: minPrice, max_price: maxPrice, currency: 'VND' },
          attribute_definitions: attrDefs,
          skus: formattedSkus
        });
        const newId = createRes?.data?.id || createRes?.data?.productId;
        if (newId) {
          await sellerProductApi.replaceSkus(newId, {
            attribute_definitions: attrDefs,
            skus: formattedSkus,
            version: 1
          });
          if (category) {
            await sellerProductApi.assignCategories(newId, {
              primary_category_id: category,
              secondary_category_ids: [],
              version: 2
            });
          }
        }
      }
      setNotification('Đã lưu bản nháp thành công!');
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    } catch (err) {
      if (err?.response?.status === 401) {
        window.dispatchEvent(new Event('auth:required'));
        alert('Phiên đăng nhập chưa được xác thực (401 Unauthorized). Vui lòng đăng nhập tài khoản Người bán!');
      } else {
        alert(`Lỗi khi lưu bản nháp: ${err?.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!spuName.trim()) {
      alert('Vui lòng nhập tên sản phẩm trước khi đăng bán!');
      return;
    }

    try {
      setLoading(true);
      const targetId = product?.id || product?.productId || `spu-${Date.now()}`;

      const formattedSkus = skus.map(s => ({
        sku_code: s.code?.trim() || `SKU-${s.id}`,
        name: s.name,
        attributes: s.attributes || {},
        price: {
          base_price: Number(String(s.price).replace(/\D/g, '')) || 0,
          sale_price: Number(String(s.price).replace(/\D/g, '')) || 0,
          currency: 'VND'
        },
        stock_display: Number(s.stock) || 0,
        tax_rate_bps: 1000,
        status: s.enabled ? 'ACTIVE' : 'INACTIVE'
      }));

      const activeSkus = formattedSkus.filter(s => s.status === 'ACTIVE');
      const prices = (activeSkus.length > 0 ? activeSkus : formattedSkus).map(s => s.price.sale_price).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;

      const attrDefs = attributes.map(a => ({
        name: a.name,
        display_as: a.display_as || 'PLAIN',
        values: a.values || []
      }));

      if (product) {
        await sellerProductApi.updateProduct(targetId, {
          title: spuName.trim(),
          spu_code: spuCode.trim(),
          slug: spuCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          brand: brand.trim(),
          primary_category_id: category,
          description: description.trim(),
          images,
          price_summary: { min_price: minPrice, max_price: maxPrice, currency: 'VND' },
          version: product.version || 1
        });
        await sellerProductApi.replaceSkus(targetId, {
          attribute_definitions: attrDefs,
          skus: formattedSkus,
          version: product.version || 1
        });
        if (category) {
          await sellerProductApi.assignCategories(targetId, {
            primary_category_id: category,
            secondary_category_ids: [],
            version: (product.version || 1) + 1
          });
        }
        await sellerProductApi.publishProduct(targetId, (product.version || 1) + 2);
      } else {
        const createRes = await sellerProductApi.createProductDraft({
          title: spuName.trim(),
          spu_code: spuCode.trim() || `SPU-${Date.now()}`,
          slug: (spuCode || spuName).toLowerCase().replace(/[^a-z0-9]/g, '-'),
          brand: brand.trim(),
          primary_category_id: category,
          description: description.trim(),
          images,
          price_summary: { min_price: minPrice, max_price: maxPrice, currency: 'VND' },
          attribute_definitions: attrDefs,
          skus: formattedSkus
        });
        const newId = createRes?.data?.id || createRes?.data?.productId;
        if (newId) {
          await sellerProductApi.replaceSkus(newId, {
            attribute_definitions: attrDefs,
            skus: formattedSkus,
            version: 1
          });
          if (category) {
            await sellerProductApi.assignCategories(newId, {
              primary_category_id: category,
              secondary_category_ids: [],
              version: 2
            });
          }
          await sellerProductApi.publishProduct(newId, 3);
        }
      }

      setNotification('Đăng bán sản phẩm thành công! Sản phẩm đã hiển thị công khai.');
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1200);
    } catch (err) {
      if (err?.response?.status === 401) {
        window.dispatchEvent(new Event('auth:required'));
        alert('Phiên đăng nhập chưa được xác thực (401 Unauthorized). Vui lòng đăng nhập tài khoản Người bán!');
      } else {
        alert(`Không thể đăng bán: ${err?.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[920px] max-h-[92vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 tracking-tight uppercase">
            {product ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Tạo SPU và các biến thể SKU bán hàng
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-xl font-bold cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* 4 Steps bar (Khớp Penpot) */}
      <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-[12px] font-semibold text-slate-500">
        {[
          { num: 1, title: 'Thông tin cơ bản' },
          { num: 2, title: 'Phân loại SKU' },
          { num: 3, title: 'Giá & kho' },
          { num: 4, title: 'Vận chuyển' }
        ].map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`pb-1 flex items-center gap-1.5 cursor-pointer ${
              step === s.num ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'hover:text-slate-700'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              step === s.num ? 'bg-[#4F46E5] text-white font-bold' : 'bg-slate-100'
            }`}>
              {s.num}
            </span>
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Body Steps */}
      <div className="p-8 overflow-y-auto space-y-8 text-[13px] flex-1">
        {step === 1 && (
          <BasicInfoStep
            spuName={spuName}
            setSpuName={setSpuName}
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            spuCode={spuCode}
            setSpuCode={setSpuCode}
            description={description}
            setDescription={setDescription}
            images={images}
            uploadingImage={uploadingImage}
            imageInputRef={imageInputRef}
            onUploadImage={handleUploadImage}
            onRemoveImage={handleRemoveImage}
          />
        )}

        {step === 2 && (
          <AttributesStep
            attributes={attributes}
            newValueInputs={newValueInputs}
            setNewValueInputs={setNewValueInputs}
            onAddValue={handleAddValue}
            onRemoveValue={handleRemoveValue}
            onOpenAddAttrModal={() => setIsAddAttrModalOpen(true)}
            onRegenerateSkus={handleRegenerateSkus}
            combosCount={generatedCombinations.length}
          />
        )}

        {step === 3 && (
          <SkuMatrixStep
            skus={skus}
            bulkPriceInput={bulkPriceInput}
            setBulkPriceInput={setBulkPriceInput}
            bulkStockInput={bulkStockInput}
            setBulkStockInput={setBulkStockInput}
            onApplyBulkPrice={handleApplyBulkPrice}
            onApplyBulkStock={handleApplyBulkStock}
            onToggleAllSkus={handleToggleAllSkus}
            onRegenerateSkus={handleRegenerateSkus}
            combosCount={generatedCombinations.length}
            onUpdateSkuCode={handleUpdateSkuCode}
            onUpdateSkuPrice={handleUpdateSkuPrice}
            onUpdateSkuStock={handleUpdateSkuStock}
            onToggleSku={handleToggleSku}
          />
        )}

        {step === 4 && <ShippingStep />}

        {notification && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[#4F46E5] font-semibold text-center animate-in fade-in">
            ✓ {notification}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <button
          type="button"
          disabled={loading}
          onClick={handleSaveDraft}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-[13px] transition-colors cursor-pointer disabled:opacity-50"
        >
          Lưu bản nháp
        </button>
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-[13px] font-semibold cursor-pointer"
            >
              ← Quay lại
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handlePublish}
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold text-[13px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng bán ngay'}
            </button>
          )}
        </div>
      </div>

      {/* Overlay / Add SKU attribute Modal (Khớp Penpot) */}
      <AddAttributeModal
        isOpen={isAddAttrModalOpen}
        onClose={() => setIsAddAttrModalOpen(false)}
        onAddAttribute={handleAddNewAttribute}
      />
    </div>
  );
}

ProductEditorForm.propTypes = {
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

/**
 * Outer Modal Wrapper: Kiểm tra isOpen và mount form với key để reset state sạch sẽ.
 */
export default function ProductEditorModal({ isOpen, product = null, onClose, onSave }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <ProductEditorForm
        key={product ? (product.id || product.productId) : 'new-product'}
        product={product}
        onClose={onClose}
        onSave={onSave}
      />
    </div>,
    document.body
  );
}

ProductEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};
