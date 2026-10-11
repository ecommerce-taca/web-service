import { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import sellerProductApi from '../services/seller-product.api';

/**
 * Inner Form: Quản lý toàn bộ state và logic của form.
 * Được mount với key duy nhất để khởi tạo state mà không cần gọi setState trong useEffect.
 */
function ProductEditorForm({ product, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [spuName, setSpuName] = useState(product ? (product.title || product.name || '') : '');
  const [category, setCategory] = useState(product ? (product.category_name || 'Điện thoại › Apple › iPhone') : 'Điện thoại › Apple › iPhone');
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
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('PLAIN');
  const [newAttrValues, setNewAttrValues] = useState([]);
  const [tempValueInput, setTempValueInput] = useState('');

  // Sinh Cartesian Product từ các thuộc tính
  const generatedCombinations = useMemo(() => {
    const validAttrs = attributes.filter(a => a.values && a.values.length > 0);
    if (validAttrs.length === 0) return [];

    let combos = [{}];
    validAttrs.forEach(attr => {
      const nextCombos = [];
      combos.forEach(combo => {
        attr.values.forEach(val => {
          nextCombos.push({ ...combo, [attr.name]: val });
        });
      });
      combos = nextCombos;
    });

    return combos;
  }, [attributes]);

  // Hàm sinh danh sách SKU từ các tổ hợp thuộc tính Cartesian Product
  const generateSkusFromCombos = (combos, existingSkus = [], currentSpuCode = 'SPU') => {
    if (!combos || combos.length === 0) {
      return [
        {
          id: 'sku-default',
          code: `${currentSpuCode || 'SPU'}-DEFAULT`,
          name: 'Tiêu chuẩn',
          price: '29.490.000',
          stock: 50,
          enabled: true,
          attributes: {}
        }
      ];
    }

    return combos.map((combo, idx) => {
      // Tìm SKU cũ khớp chính xác tổ hợp thuộc tính
      const matchOld = existingSkus.find(old => {
        const oldAttrs = old.attributes || {};
        const comboKeys = Object.keys(combo);
        const oldKeys = Object.keys(oldAttrs);
        if (comboKeys.length !== oldKeys.length) return false;
        return comboKeys.every(k => oldAttrs[k] === combo[k]);
      });

      if (matchOld) {
        return matchOld;
      }

      // Tạo mã SKU gợi ý từ spuCode + combo values
      const cleanParts = Object.values(combo).map(val =>
        String(val)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
      ).filter(Boolean);

      const prefix = (currentSpuCode || 'SKU').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const code = [prefix, ...cleanParts].join('-') || `SKU-${idx + 1}`;
      const name = Object.values(combo).join(' / ');
      const defaultPrice = existingSkus[0]?.price || '29.490.000';
      const defaultStock = existingSkus[0]?.stock ?? 20;

      return {
        id: `sku-gen-${idx + 1}-${Date.now().toString(36)}`,
        code,
        name,
        price: defaultPrice,
        stock: defaultStock,
        enabled: true,
        attributes: { ...combo }
      };
    });
  };

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

  const handleUpdateSkuCode = (skuId, val) => {
    setSkus(skus.map(s => s.id === skuId ? { ...s, code: val } : s));
  };

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

  const handleToggleSku = (skuId) => {
    setSkus(skus.map(s => s.id === skuId ? { ...s, enabled: !s.enabled } : s));
  };

  const handleUpdateSkuPrice = (skuId, val) => {
    setSkus(skus.map(s => s.id === skuId ? { ...s, price: val } : s));
  };

  const handleUpdateSkuStock = (skuId, val) => {
    setSkus(skus.map(s => s.id === skuId ? { ...s, stock: Number(val) || 0 } : s));
  };

  const handleAddNewAttribute = () => {
    if (!newAttrName.trim() || newAttrValues.length === 0) return;
    const newId = attributes.length + 1;
    setAttributes([
      ...attributes,
      {
        id: newId,
        name: newAttrName.trim(),
        display_as: newAttrType,
        values: newAttrValues
      }
    ]);
    setNewAttrName('');
    setNewAttrValues([]);
    setIsAddAttrModalOpen(false);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const targetId = product?.id || product?.productId || 'spu-draft';
      // 1. Xin presigned upload URL từ S3 qua Service API (#15)
      const res = await sellerProductApi.getMediaUploadUrl(targetId, {
        file_name: file.name,
        content_type: file.type || 'image/jpeg',
        file_size: file.size
      });
      const mediaData = res?.data || {};

      // 2. Xác nhận tải lên thành công qua Service API (#16)
      await sellerProductApi.completeMediaUpload(targetId, {
        media_id: mediaData.media_id,
        upload_key: mediaData.file_key
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
        await sellerProductApi.publishProduct(targetId, (product.version || 1) + 1);
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
          await sellerProductApi.publishProduct(newId, 1);
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
        {/* STEP 1: SPU Details */}
        {step === 1 && (
          <div className="space-y-6">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block">
              THÔNG TIN SPU
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Tên sản phẩm (SPU) *
                </label>
                <input
                  type="text"
                  value={spuName}
                  placeholder="Ví dụ: iPhone 16 Pro Max"
                  onChange={(e) => setSpuName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Danh mục
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  value={brand}
                  placeholder="Apple, Samsung, Sony..."
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mã SPU
                </label>
                <input
                  type="text"
                  value={spuCode}
                  onChange={(e) => setSpuCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows={3}
                value={description}
                placeholder="Mô tả công năng, thông số kỹ thuật, chế độ bảo hành..."
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Media Upload Section (#15, #16 S3 Presigned URL) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Hình ảnh sản phẩm (S3 Media)
                </label>
                <span className="text-[11px] text-slate-400">
                  Ảnh đầu tiên làm ảnh bìa · Tối đa 8 ảnh
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#4F46E5] text-white text-[10px] font-bold rounded shadow-xs">
                        Ảnh bìa
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Nút Upload qua Presigned S3 */}
                {images.length < 8 && (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#4F46E5] hover:bg-[#f8faff] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all"
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <span className="text-[12px] text-[#4F46E5] font-semibold animate-pulse">
                        Đang tải...
                      </span>
                    ) : (
                      <>
                        <span className="text-xl text-slate-400 mb-1">📷</span>
                        <span className="text-[11px] font-bold text-slate-700">Tải ảnh lên</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">S3 Presigned</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SKU Attributes */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight uppercase">
                THUỘC TÍNH SKU
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Tạo thuộc tính linh hoạt theo từng ngành hàng — không giới hạn màu sắc hoặc kích thước.
              </p>
            </div>

            <div className="space-y-3">
              {attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">⋮⋮</span>
                    <span className="font-bold text-slate-800 text-[13px]">
                      {attr.id} · {attr.name}
                    </span>
                    {attr.display_as === 'COLOR_SWATCH' && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                        Màu sắc
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {attr.values.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 shadow-2xs"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(attr.id, val)}
                          className="text-slate-400 hover:text-rose-500 text-xs font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {/* Add value mini-input */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="＋ Giá trị"
                        value={newValueInputs[attr.id] || ''}
                        onChange={(e) => setNewValueInputs({ ...newValueInputs, [attr.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddValue(attr.id);
                          }
                        }}
                        className="w-24 px-2 py-1 bg-white border border-dashed border-slate-300 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:border-[#4F46E5]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddValue(attr.id)}
                        className="text-[11px] font-bold text-[#4F46E5] px-1 hover:underline cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[12px] pt-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAddAttrModalOpen(true)}
                className="font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                ＋ Thêm thuộc tính
              </button>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">
                  {attributes.length} thuộc tính · <strong className="text-slate-900">{generatedCombinations.length}</strong> tổ hợp SKU
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateSkus}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span>Sinh bảng SKU từ {generatedCombinations.length} tổ hợp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SKU Matrix Table */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  BIẾN THỂ ĐA THUỘC TÍNH (SKU MATRIX)
                </span>
                <p className="text-[12px] text-slate-500">
                  Thiết lập mã SKU, giá bán, tồn kho cho từng biến thể tổ hợp thuộc tính.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRegenerateSkus}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 rounded-lg font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>Sinh lại bảng ({generatedCombinations.length} tổ hợp)</span>
              </button>
            </div>

            {/* Bulk update toolbar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[12px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-700">Áp dụng hàng loạt:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Giá bán chung (₫)"
                    value={bulkPriceInput}
                    onChange={(e) => setBulkPriceInput(e.target.value)}
                    className="w-28 px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkPrice}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Gán giá
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Kho chung"
                    value={bulkStockInput}
                    onChange={(e) => setBulkStockInput(e.target.value)}
                    className="w-20 px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkStock}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Gán kho
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllSkus(true)}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Bật tất cả
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllSkus(false)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Tắt tất cả
                </button>
              </div>
            </div>

            {/* Cảnh báo khi tắt toàn bộ SKU */}
            {skus.every(s => !s.enabled) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[12px] text-amber-800">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>Tất cả biến thể SKU đang bị <strong>TẮT (OFF)</strong> nên giá ngoài danh mục hiển thị 0 ₫. Bấm <strong>Bật tất cả</strong> để kích hoạt!</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAllSkus(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Bật tất cả ngay
                </button>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">BIẾN THỂ ĐA THUỘC TÍNH</th>
                    <th className="py-2.5 px-4">MÃ SKU *</th>
                    <th className="py-2.5 px-4">GIÁ BÁN (₫)</th>
                    <th className="py-2.5 px-4">TỒN KHO</th>
                    <th className="py-2.5 px-4 text-center">HIỂN THỊ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skus.map((sku) => (
                    <tr key={sku.id} className="hover:bg-slate-50/60">
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
                          value={sku.code}
                          onChange={(e) => handleUpdateSkuCode(sku.id, e.target.value)}
                          placeholder="Mã SKU (VD: IP16-256-NAT)"
                          className="w-full min-w-[140px] px-2.5 py-1.5 font-mono text-[11px] border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5] bg-white"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={sku.price}
                          onChange={(e) => handleUpdateSkuPrice(sku.id, e.target.value)}
                          onBlur={() => {
                            const clean = String(sku.price).replace(/\D/g, '');
                            if (clean) {
                              handleUpdateSkuPrice(sku.id, Number(clean).toLocaleString('vi-VN'));
                            }
                          }}
                          className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={sku.stock}
                          onChange={(e) => handleUpdateSkuStock(sku.id, e.target.value)}
                          className="w-16 px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-[#4F46E5]"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSku(sku.id)}
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
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
                Tổng cộng: <strong className="text-slate-900">{skus.length}</strong> biến thể SKU
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Shipping & SLA */}
        {step === 4 && (
          <div className="space-y-6">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block">
              VẬN CHUYỂN & HÌNH ẢNH SẢN PHẨM
            </span>
            <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
              <span className="text-3xl block">📷</span>
              <div className="text-[13px] font-semibold text-slate-700">
                Kéo thả hình ảnh bìa và thư viện sản phẩm vào đây
              </div>
              <div className="text-[11px] text-slate-400">
                Hỗ trợ JPG, PNG, WEBP tối đa 5MB. Ảnh đầu tiên sẽ là ảnh bìa đại diện.
              </div>
            </div>

            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[12px] text-emerald-800 font-medium flex items-center gap-2">
              <span>✓</span>
              <span>Không cần duyệt — sản phẩm hiển thị ngay sau khi người bán đăng bán.</span>
            </div>
          </div>
        )}

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
      {isAddAttrModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-[520px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-[16px] font-bold text-slate-900 uppercase">
                THÊM THUỘC TÍNH SKU
              </h4>
              <button
                type="button"
                onClick={() => setIsAddAttrModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Tên thuộc tính *
              </label>
              <input
                type="text"
                value={newAttrName}
                placeholder="Ví dụ: Chất liệu, Phiên bản, Kết nối..."
                onChange={(e) => setNewAttrName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Kiểu hiển thị
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PLAIN', label: 'Văn bản' },
                  { id: 'COLOR_SWATCH', label: 'Màu sắc' },
                  { id: 'IMAGE_THUMB', label: 'Hình ảnh' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setNewAttrType(type.id)}
                    className={`py-2 px-3 text-[12px] font-semibold rounded-lg border cursor-pointer ${
                      newAttrType === type.id 
                        ? 'bg-[#f4f7ff] border-[#4F46E5] text-[#4F46E5]' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                Giá trị thuộc tính *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempValueInput}
                  placeholder="Nhập giá trị rồi nhấn Enter"
                  onChange={(e) => setTempValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tempValueInput.trim()) {
                        setNewAttrValues([...newAttrValues, tempValueInput.trim()]);
                        setTempValueInput('');
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tempValueInput.trim()) {
                      setNewAttrValues([...newAttrValues, tempValueInput.trim()]);
                      setTempValueInput('');
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[12px] rounded-lg cursor-pointer transition-colors"
                >
                  Thêm
                </button>
              </div>

              {/* Tag list */}
              <div className="flex flex-wrap gap-2 pt-1">
                {newAttrValues.map((val, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 shadow-2xs"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => setNewAttrValues(newAttrValues.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              ✓ SKU matrix sẽ tự tạo lại theo mọi tổ hợp thuộc tính.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddAttrModalOpen(false)}
                className="px-4 py-2 text-slate-600 text-[13px] font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddNewAttribute}
                disabled={!newAttrName.trim() || newAttrValues.length === 0}
                className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13px] rounded-lg cursor-pointer disabled:opacity-50"
              >
                Thêm thuộc tính
              </button>
            </div>
          </div>
        </div>
      )}
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
