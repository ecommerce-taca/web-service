import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, CheckCircle2 } from 'lucide-react';
import sellerProductApi from '../services/seller-product.api';

// Subcomponents & Utilities
import { generateCartesianCombinations, generateSkusFromCombos, generateSkuCode, hasCombinationsChanged } from './editor/utils/skuGenerator';
import BasicInfoStep from './editor/steps/BasicInfoStep';
import AttributesStep from './editor/steps/AttributesStep';
import SkuMatrixStep from './editor/steps/SkuMatrixStep';
import ShippingStep from './editor/steps/ShippingStep';
import AddAttributeModal from './editor/components/AddAttributeModal';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateSafeSlug(text) {
  if (!text || typeof text !== 'string') return `spu-${Date.now()}`;
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `spu-${Date.now()}`;
}

function flattenCategoryTree(nodes, prefix = '') {
  let result = [];
  if (!Array.isArray(nodes)) return result;
  for (const node of nodes) {
    if (!node) continue;
    const catId = node.category_id || node.id || node._id;
    if (!catId) continue;
    const currentPath = prefix ? `${prefix} › ${node.name}` : node.name;
    result.push({
      category_id: String(catId),
      name: node.name,
      slug: node.slug,
      label: currentPath,
    });
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      result = result.concat(flattenCategoryTree(node.children, currentPath));
    }
  }
  return result;
}

const COMMON_ATTR_KEYS = {
  'màu sắc': 'color',
  'màu': 'color',
  'dung lượng': 'storage',
  'kích thước': 'size',
  'size': 'size',
  'kích cỡ': 'size',
  'bộ nhớ': 'memory',
  'ram': 'ram',
  'ssd': 'ssd',
  'kết nối': 'connectivity',
  'chất liệu': 'material',
  'phiên bản': 'version'
};

const getAttrKey = (name, idx) => {
  if (!name) return `attr_${idx + 1}`;
  const normalized = name.toLowerCase().trim();
  if (COMMON_ATTR_KEYS[normalized]) return COMMON_ATTR_KEYS[normalized];
  const slug = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || `attr_${idx + 1}`;
};

/**
 * Inner Form: Quản lý toàn bộ state và điều phối các step của modal soạn thảo sản phẩm.
 * Được mount với key duy nhất để khởi tạo state mà không cần gọi setState trong useEffect.
 */
function ProductEditorForm({ product, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [spuName, setSpuName] = useState(product ? (product.title || product.name || '') : '');
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const flattenedCategories = useMemo(() => {
    return flattenCategoryTree(categoriesList);
  }, [categoriesList]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await sellerProductApi.getCategories();
        const raw = res?.data?.data ?? res?.data ?? res;
        const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
        if (isMounted && Array.isArray(data)) {
          setCategoriesList(data);
        }
      } catch (err) {
        console.error('Không thể tải danh mục sản phẩm:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultCategory = useMemo(() => {
    // 1. Khi sửa sản phẩm:
    if (product) {
      const initialCatId = product.primary_category_id || product.category_id;
      // Nếu đã có primary_category_id là UUID hợp lệ, giữ nguyên
      if (initialCatId && UUID_REGEX.test(initialCatId)) {
        return initialCatId;
      }
      // Nếu có primary_category_id (dạng slug) hoặc category_name, đối chiếu trong cây danh mục
      if (flattenedCategories.length > 0) {
        const searchKey = initialCatId || '';
        const match = flattenedCategories.find(
          (c) =>
            (searchKey && (c.category_id === searchKey || c.slug === searchKey)) ||
            (product.category_name && (c.name === product.category_name || c.label === product.category_name || c.label?.includes(product.category_name)))
        );
        if (match && UUID_REGEX.test(match.category_id)) {
          return match.category_id;
        }
      }
    }

    // 2. Khi tạo sản phẩm mới hoặc chưa khớp danh mục sản phẩm:
    if (flattenedCategories.length > 0) {
      const defaultMatch = flattenedCategories.find(
        (c) => c.slug === 'dien-thoai' && UUID_REGEX.test(c.category_id)
      );
      if (defaultMatch) {
        return defaultMatch.category_id;
      }
      const firstValid = flattenedCategories.find((c) => UUID_REGEX.test(c.category_id));
      if (firstValid) {
        return firstValid.category_id;
      }
    }

    return '';
  }, [flattenedCategories, product]);

  // Derived state: ưu tiên lựa chọn chủ động của người dùng (kể cả khi người dùng chủ động chọn rỗng),
  // ngược lại dùng category mặc định đã được suy diễn
  const category = selectedCategory !== null ? selectedCategory : defaultCategory;

  const setCategory = useCallback((newCategory) => {
    if (!newCategory || UUID_REGEX.test(newCategory)) {
      setSelectedCategory(newCategory);
      return;
    }
    // Đảm bảo không lưu slug, luôn phân giải về category_id UUID
    const matched = flattenedCategories.find((c) => c.slug === newCategory || c.category_id === newCategory);
    if (matched && UUID_REGEX.test(matched.category_id)) {
      setSelectedCategory(matched.category_id);
    }
  }, [flattenedCategories]);

  const [brand, setBrand] = useState(product ? (product.brand || '') : '');
  const [spuCode, setSpuCode] = useState(product ? (product.spu_code || product.code || '') : 'SPU-NEW');
  const [skuPrefix, setSkuPrefix] = useState(product ? (product.spu_code || product.code || 'SPU') : 'SPU');
  const [isMultiVariant, setIsMultiVariant] = useState(() => {
    if (product?.attribute_definitions && product.attribute_definitions.length > 0) return true;
    if (product?.skus && product.skus.length > 1) return true;
    return true;
  });
  const [singleSkuCode, setSingleSkuCode] = useState(
    product?.skus?.[0]?.sku_code || (product?.spu_code ? `${product.spu_code}-DEFAULT` : 'SPU-DEFAULT')
  );
  const [singleSkuPrice, setSingleSkuPrice] = useState(
    product?.skus?.[0]?.price?.sale_price
      ? Number(product.skus[0].price.sale_price).toLocaleString('vi-VN')
      : '29.490.000'
  );
  const [singleSkuStock, setSingleSkuStock] = useState(
    product?.skus?.[0]?.stock_display ?? 50
  );
  const [currentProduct, setCurrentProduct] = useState(product);
  const [currentVersion, setCurrentVersion] = useState(() => Number(product?.version) || 1);
  const [description, setDescription] = useState(product ? (product.description || '') : '');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Quản lý ảnh sản phẩm và S3 Presigned URL (#15, #16)
  const [images, setImages] = useState(() => {
    if (product?.media && Array.isArray(product.media) && product.media.length > 0) {
      return product.media
        .map(m => m.url || m.public_url)
        .filter(Boolean);
    }
    if (product?.images && Array.isArray(product.images)) {
      return product.images
        .map(img => typeof img === 'string' ? img : (img.url || img.public_url))
        .filter(img => Boolean(img) && !img.includes('unsplash.com'));
    }
    return [];
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  // Khởi tạo thuộc tính
  const [attributes, setAttributes] = useState(() => {
    if (product?.attribute_definitions && product.attribute_definitions.length > 0) {
      return product.attribute_definitions.map((a, idx) => ({
        id: idx + 1,
        key: a.key,
        name: a.name || a.label || `attr_${idx + 1}`,
        label: a.label || a.name || `attr_${idx + 1}`,
        display_as: a.display_as || 'PLAIN',
        values: a.values || a.allowed_values || []
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

  // Khởi tạo danh sách SKU trực tiếp từ tổ hợp hoặc sản phẩm
  const [skus, setSkus] = useState(() => {
    if (product?.skus && product.skus.length > 0) {
      return product.skus.map((s, idx) => {
        const customCode = s.seller_sku || s.sku_code || `SKU-${idx + 1}`;
        return {
          id: s.id || s.sku_id || `sku-${idx + 1}`,
          code: customCode,
          seller_sku: customCode,
          name: s.name || Object.values(s.attributes || {}).join(' / ') || `Biến thể ${idx + 1}`,
          price: s.price?.sale_price
            ? Number(s.price.sale_price).toLocaleString('vi-VN')
            : (s.price_override ? Number(s.price_override).toLocaleString('vi-VN') : '29.490.000'),
          stock: s.stock_display ?? s.stock ?? 20,
          enabled: s.status !== 'INACTIVE',
          attributes: s.attributes || {}
        };
      });
    }
    // Khởi tạo trực tiếp từ Cartesian Product ban đầu thay vì hardcode 4 dòng
    const initialCombos = generateCartesianCombinations([
      { id: 1, name: 'Dung lượng', display_as: 'PLAIN', values: ['256GB', '512GB', '1TB'] },
      { id: 2, name: 'Màu sắc', display_as: 'COLOR_SWATCH', values: ['Titan tự nhiên', 'Titan đen'] },
      { id: 3, name: 'Kết nối', display_as: 'PLAIN', values: ['Wi-Fi', '5G'] }
    ]);
    return generateSkusFromCombos(initialCombos, [], product?.spu_code || 'SPU', '29.490.000', 30);
  });

  // State hỗ trợ cập nhật hàng loạt cho SKU
  const [bulkPriceInput, setBulkPriceInput] = useState('');
  const [bulkStockInput, setBulkStockInput] = useState('');

  // Callbacks tối ưu kết hợp với SkuMatrixRow memoization
  const handleUpdateSkuCode = useCallback((skuId, val) => {
    setSkus(prev => prev.map(s => s.id === skuId ? { ...s, code: val, seller_sku: val } : s));
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
    if (!isMultiVariant) {
      const code = singleSkuCode || `${spuCode}-DEFAULT`;
      const single = [
        {
          id: 'sku-single',
          code,
          seller_sku: code,
          name: 'Tiêu chuẩn',
          price: singleSkuPrice,
          stock: Number(singleSkuStock) || 0,
          enabled: true,
          attributes: {}
        }
      ];
      setSkus(single);
      setNotification('Đã đồng bộ sản phẩm đơn tiêu chuẩn (1 SKU)!');
    } else {
      const newSkus = generateSkusFromCombos(generatedCombinations, skus, skuPrefix || spuCode);
      setSkus(newSkus);
      setNotification(`Đã sinh lại ${newSkus.length} biến thể SKU từ ${generatedCombinations.length} tổ hợp thuộc tính!`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFormatAllSkuCodes = () => {
    const formatted = skus.map((s, idx) => {
      const code = generateSkuCode(skuPrefix || spuCode, s.attributes, idx);
      return {
        ...s,
        code,
        seller_sku: code
      };
    });
    setSkus(formatted);
    setNotification('Đã tự động chuẩn hóa toàn bộ mã SKU theo tiền tố!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleApplyBulkPrice = () => {
    if (!bulkPriceInput.trim()) return;
    const clean = bulkPriceInput.replace(/\D/g, '');
    if (!clean) return;
    const formatted = Number(clean).toLocaleString('vi-VN');
    setSkus(skus.map(s => ({ ...s, price: formatted })));
    setNotification('Đã áp dụng giá bán cho tất cả SKU!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleApplyBulkStock = () => {
    const num = Number(bulkStockInput);
    if (isNaN(num)) return;
    setSkus(skus.map(s => ({ ...s, stock: num })));
    setNotification('Đã áp dụng số lượng tồn kho cho tất cả SKU!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleToggleAllSkus = (enable) => {
    setSkus(skus.map(s => ({ ...s, enabled: enable })));
  };

  const handleGoToStep = (targetStep) => {
    if (targetStep === 3) {
      if (!isMultiVariant) {
        setSkus([
          {
            id: 'sku-single',
            code: singleSkuCode || `${spuCode}-DEFAULT`,
            name: 'Tiêu chuẩn',
            price: singleSkuPrice,
            stock: Number(singleSkuStock) || 0,
            enabled: true,
            attributes: {}
          }
        ]);
      } else if (hasCombinationsChanged(generatedCombinations, skus)) {
        const synched = generateSkusFromCombos(generatedCombinations, skus, skuPrefix || spuCode);
        setSkus(synched);
      }
    }
    setStep(targetStep);
  };

  const handleNextStep = () => {
    handleGoToStep(step + 1);
  };

  const handleAddValue = (attrId, directVal = null) => {
    const val = (directVal || newValueInputs[attrId] || '').trim();
    if (!val) return;
    const updatedAttrs = attributes.map(a => 
      a.id === attrId && !a.values.includes(val)
        ? { ...a, values: [...a.values, val] }
        : a
    );
    setAttributes(updatedAttrs);
    if (!directVal) {
      setNewValueInputs({ ...newValueInputs, [attrId]: '' });
    }

    // Reactive: Tự động cập nhật ma trận SKU ngay lập tức
    if (isMultiVariant) {
      const newCombos = generateCartesianCombinations(updatedAttrs);
      const synched = generateSkusFromCombos(newCombos, skus, skuPrefix || spuCode);
      setSkus(synched);
    }
  };

  const handleRemoveValue = (attrId, valToRemove) => {
    const updatedAttrs = attributes.map(a => 
      a.id === attrId ? { ...a, values: a.values.filter(v => v !== valToRemove) } : a
    );
    setAttributes(updatedAttrs);

    // Reactive: Tự động cập nhật ma trận SKU ngay lập tức
    if (isMultiVariant) {
      const newCombos = generateCartesianCombinations(updatedAttrs);
      const synched = generateSkusFromCombos(newCombos, skus, skuPrefix || spuCode);
      setSkus(synched);
    }
  };

  const handleRemoveAttribute = (attrId) => {
    const updatedAttrs = attributes.filter(a => a.id !== attrId);
    setAttributes(updatedAttrs);

    // Reactive: Tự động cập nhật ma trận SKU ngay lập tức
    if (isMultiVariant) {
      const newCombos = generateCartesianCombinations(updatedAttrs);
      const synched = generateSkusFromCombos(newCombos, skus, skuPrefix || spuCode);
      setSkus(synched);
    }
  };

  const handleAddNewAttribute = ({ name, display_as, values }) => {
    const newId = attributes.length + 1;
    const updatedAttrs = [
      ...attributes,
      {
        id: newId,
        name,
        display_as,
        values
      }
    ];
    setAttributes(updatedAttrs);
    setIsAddAttrModalOpen(false);

    // Reactive: Tự động cập nhật ma trận SKU ngay lập tức
    if (isMultiVariant) {
      const newCombos = generateCartesianCombinations(updatedAttrs);
      const synched = generateSkusFromCombos(newCombos, skus, skuPrefix || spuCode);
      setSkus(synched);
    }
  };


  /**
   * Chuẩn hóa ma trận SKU và Attribute Definitions theo đúng DTO và schema của Backend
   */
  const buildSkuPayload = () => {
    // 1. Chuẩn hóa Attribute Definitions theo đặc tả BE (§2.2 & §3.2)
    // Nếu single variant (!isMultiVariant), attribute_definitions phải là mảng rỗng
    const attrDefs = isMultiVariant
      ? attributes.map((a, idx) => {
          const key = a.key || getAttrKey(a.name || a.label, idx);
          const rawVals = a.allowed_values || a.values || [];
          const vals = rawVals.map(v => String(v).trim()).filter(Boolean);
          const uniqueVals = Array.from(new Set(vals));
          return {
            key,
            label: (a.name || a.label || `Thuộc tính ${idx + 1}`).trim(),
            type: 'ENUM',
            is_variant_dimension: true,
            allowed_values: uniqueVals.length > 0 ? uniqueVals : ['Default'],
            display_as: a.display_as === 'COLOR_SWATCH' ? 'COLOR_SWATCH' : (a.display_as === 'IMAGE_THUMB' ? 'IMAGE_THUMB' : 'PLAIN'),
            sort_order: idx + 1,
            ...(a.value_meta ? { value_meta: a.value_meta } : {})
          };
        })
      : [];

    // 2. Chuẩn hóa SKUs theo đúng SkuItemDto của Backend (loại bỏ field dư thừa: sku_code, name, price, stock_display)
    const seenSellerSkus = new Set();
    const formattedSkus = skus.map((s, idx) => {
      let skuCode = (s.seller_sku || s.code || '').trim();
      if (!skuCode) {
        skuCode = `${(spuCode || 'SKU').toUpperCase()}-${idx + 1}`;
      }
      let finalSkuCode = skuCode;
      let suffix = 1;
      while (seenSellerSkus.has(finalSkuCode)) {
        finalSkuCode = `${skuCode}-${suffix++}`;
      }
      seenSellerSkus.add(finalSkuCode);

      const priceNum = Math.round(Number(String(s.price).replace(/\D/g, ''))) || 0;

      const mappedAttrs = {};
      if (isMultiVariant) {
        if (s.attributes) {
          Object.entries(s.attributes).forEach(([k, v]) => {
            const matchedDef = attrDefs.find(d => d.label === k || d.key === k || d.name === k);
            if (matchedDef) {
              mappedAttrs[matchedDef.key] = String(v).trim();
            }
          });
        }
        // Đảm bảo mọi variant dimension bắt buộc đều có mặt trong attributes của SKU
        attrDefs.forEach(def => {
          if (def.is_variant_dimension && !mappedAttrs[def.key]) {
            mappedAttrs[def.key] = def.allowed_values?.[0] || 'Default';
          }
        });
      }

      const item = {
        seller_sku: finalSkuCode,
        attributes: mappedAttrs,
        status: s.enabled === false ? 'INACTIVE' : 'ACTIVE',
      };

      if (priceNum > 0) {
        item.price_override = priceNum;
      }

      // Chỉ gửi sku_id khi cập nhật sản phẩm đã tồn tại và ID là UUIDv7 hợp lệ
      const rawId = s.sku_id || s.id;
      const activeProd = currentProduct || product;
      if (activeProd && rawId && UUID_REGEX.test(rawId)) {
        item.sku_id = rawId;
      }

      return item;
    });

    return { attrDefs, formattedSkus };
  };

  /**
   * Đảm bảo SPU Draft đã tồn tại trên Backend trước khi upload media.
   * Backend Catalog yêu cầu product phải tồn tại trong DB mới cấp presigned upload URL (§3.2 #15).
   */
  const ensureProductDraft = async () => {
    const activeProd = currentProduct || product;
    const existingId = activeProd?.product_id || activeProd?.id || activeProd?.productId;
    if (existingId && UUID_REGEX.test(existingId)) {
      return { productId: existingId, version: currentVersion };
    }

    if (!spuName.trim()) {
      throw new Error('Vui lòng nhập Tên sản phẩm (SPU) ở Bước 1 trước khi tải ảnh lên.');
    }

    const activeSkus = skus.filter(s => s.enabled !== false);
    const prices = (activeSkus.length > 0 ? activeSkus : skus)
      .map(s => Math.round(Number(String(s.price).replace(/\D/g, '')) || 0))
      .filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const safeBasePrice = minPrice > 0 ? minPrice : 10000;
    const priceSummary = {
      base_price: safeBasePrice,
      ...(minPrice > 0 ? { sale_price: minPrice } : {}),
      currency: 'VND'
    };

    const createRes = await sellerProductApi.createProductDraft({
      title: spuName.trim(),
      slug: generateSafeSlug(spuCode || spuName),
      brand: brand.trim(),
      description: description.trim(),
      price_summary: priceSummary
    });

    const createdProduct = createRes?.data || createRes;
    const newId = createdProduct?.product_id || createdProduct?.id || createdProduct?.productId;
    let nextVersion = Number(createdProduct?.version) || 1;

    if (category && UUID_REGEX.test(category)) {
      const assignRes = await sellerProductApi.assignCategories(newId, {
        primary_category_id: category,
        secondary_category_ids: [],
        version: nextVersion
      });
      const assignData = assignRes?.data || assignRes;
      nextVersion = Number(assignData?.version) || (nextVersion + 1);
    }

    setCurrentProduct(createdProduct);
    setCurrentVersion(nextVersion);
    if (onSave) onSave();

    return { productId: newId, version: nextVersion };
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const { productId } = await ensureProductDraft();
      const isFirstImage = images.length === 0;

      // Upload binary lên S3 qua presigned URL và hoàn tất với Backend (§3.2 #15, #16)
      const mediaResult = await sellerProductApi.uploadProductMedia(productId, file, {
        is_cover: isFirstImage,
        scope: 'SPU'
      });

      const displayUrl = mediaResult.public_url || URL.createObjectURL(file);
      setImages(prev => [...prev, displayUrl]);
      setNotification('Tải ảnh sản phẩm thành công!');
      setTimeout(() => setNotification(null), 2500);
    } catch (err) {
      if (err?.response?.status === 401) {
        window.dispatchEvent(new Event('auth:required'));
        alert('Phiên đăng nhập chưa được xác thực (401 Unauthorized). Vui lòng đăng nhập tài khoản Người bán!');
      } else {
        alert(`Không thể tải ảnh: ${err?.response?.data?.message || err.message}`);
      }
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
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

    if (!category || !UUID_REGEX.test(category)) {
      alert('Vui lòng chọn danh mục chính hợp lệ cho sản phẩm trước khi lưu nháp!');
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      const activeProd = currentProduct || product;
      const targetId = activeProd?.product_id || activeProd?.id || activeProd?.productId;

      const { attrDefs, formattedSkus } = buildSkuPayload();

      const activeSkus = skus.filter(s => s.enabled !== false);
      const prices = (activeSkus.length > 0 ? activeSkus : skus)
        .map(s => Math.round(Number(String(s.price).replace(/\D/g, '')) || 0))
        .filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const safeBasePrice = minPrice > 0 ? minPrice : 10000;
      const priceSummary = {
        base_price: safeBasePrice,
        ...(minPrice > 0 ? { sale_price: minPrice } : {}),
        currency: 'VND'
      };

      if (targetId && UUID_REGEX.test(targetId)) {
        // Cập nhật SPU cơ bản theo DTO (§3.2 PATCH /seller/products/{id})
        let ver = currentVersion;
        const updateRes = await sellerProductApi.updateProduct(targetId, {
          version: ver,
          title: spuName.trim(),
          slug: generateSafeSlug(spuCode || spuName),
          brand: brand.trim(),
          description: description.trim(),
          price_summary: priceSummary
        });
        const updateData = updateRes?.data || updateRes;
        ver = Number(updateData?.version) || (ver + 1);

        // Gán danh mục (§3.2 PUT /seller/products/{id}/categories)
        if (category) {
          const assignRes = await sellerProductApi.assignCategories(targetId, {
            primary_category_id: category,
            secondary_category_ids: [],
            version: ver
          });
          const assignData = assignRes?.data || assignRes;
          ver = Number(assignData?.version) || (ver + 1);
        }

        // Cập nhật ma trận SKU (§3.2 PUT /seller/products/{id}/skus)
        await sellerProductApi.replaceSkus(targetId, {
          attribute_definitions: attrDefs,
          skus: formattedSkus,
          version: ver
        });
        ver = ver + 1;
        setCurrentVersion(ver);
      } else {
        // Tạo mới SPU Draft theo DTO thuần túy BE (§3.2 POST /seller/products)
        const createRes = await sellerProductApi.createProductDraft({
          title: spuName.trim(),
          slug: generateSafeSlug(spuCode || spuName),
          brand: brand.trim(),
          description: description.trim(),
          price_summary: priceSummary
        });

        const createdProduct = createRes?.data || createRes;
        const newId = createdProduct?.product_id || createdProduct?.id || createdProduct?.productId;
        let ver = Number(createdProduct?.version) || 1;
        if (newId) {
          if (category) {
            const assignRes = await sellerProductApi.assignCategories(newId, {
              primary_category_id: category,
              secondary_category_ids: [],
              version: ver
            });
            const assignData = assignRes?.data || assignRes;
            ver = Number(assignData?.version) || (ver + 1);
          }

          await sellerProductApi.replaceSkus(newId, {
            attribute_definitions: attrDefs,
            skus: formattedSkus,
            version: ver
          });
          ver = ver + 1;
          setCurrentProduct(createdProduct);
          setCurrentVersion(ver);
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

    if (!category || !UUID_REGEX.test(category)) {
      alert('Vui lòng chọn danh mục chính hợp lệ cho sản phẩm trước khi xuất bản!');
      setStep(1);
      return;
    }

    if (images.length === 0) {
      alert('Vui lòng tải lên ít nhất một ảnh bìa sản phẩm (bước 1) trước khi xuất bản!');
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      const activeProd = currentProduct || product;
      const targetId = activeProd?.product_id || activeProd?.id || activeProd?.productId;

      const { attrDefs, formattedSkus } = buildSkuPayload();

      const activeSkus = skus.filter(s => s.enabled !== false);
      const prices = (activeSkus.length > 0 ? activeSkus : skus)
        .map(s => Math.round(Number(String(s.price).replace(/\D/g, '')) || 0))
        .filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const safeBasePrice = minPrice > 0 ? minPrice : 10000;
      const priceSummary = {
        base_price: safeBasePrice,
        ...(minPrice > 0 ? { sale_price: minPrice } : {}),
        currency: 'VND'
      };

      if (targetId && UUID_REGEX.test(targetId)) {
        // Cập nhật SPU cơ bản theo DTO (§3.2 PATCH /seller/products/{id})
        let ver = currentVersion;
        const updateRes = await sellerProductApi.updateProduct(targetId, {
          version: ver,
          title: spuName.trim(),
          slug: generateSafeSlug(spuCode || spuName),
          brand: brand.trim(),
          description: description.trim(),
          price_summary: priceSummary
        });
        const updateData = updateRes?.data || updateRes;
        ver = Number(updateData?.version) || (ver + 1);

        // Gán danh mục (§3.2 PUT /seller/products/{id}/categories)
        if (category) {
          const assignRes = await sellerProductApi.assignCategories(targetId, {
            primary_category_id: category,
            secondary_category_ids: [],
            version: ver
          });
          const assignData = assignRes?.data || assignRes;
          ver = Number(assignData?.version) || (ver + 1);
        }

        // Cập nhật ma trận SKU (§3.2 PUT /seller/products/{id}/skus)
        await sellerProductApi.replaceSkus(targetId, {
          attribute_definitions: attrDefs,
          skus: formattedSkus,
          version: ver
        });
        // replaceSkus thực hiện atomicCasUpdate nên product version tăng thêm 1
        ver = ver + 1;
        setCurrentVersion(ver);

        // Xuất bản sản phẩm (§3.2 POST /seller/products/{id}/publish)
        await sellerProductApi.publishProduct(targetId, ver);
      } else {
        // Tạo mới SPU Draft theo DTO thuần túy BE (§3.2 POST /seller/products)
        const createRes = await sellerProductApi.createProductDraft({
          title: spuName.trim(),
          slug: generateSafeSlug(spuCode || spuName),
          brand: brand.trim(),
          description: description.trim(),
          price_summary: priceSummary
        });

        const createdProduct = createRes?.data || createRes;
        const newId = createdProduct?.product_id || createdProduct?.id || createdProduct?.productId;
        let ver = Number(createdProduct?.version) || 1;
        if (newId) {
          if (category) {
            const assignRes = await sellerProductApi.assignCategories(newId, {
              primary_category_id: category,
              secondary_category_ids: [],
              version: ver
            });
            const assignData = assignRes?.data || assignRes;
            ver = Number(assignData?.version) || (ver + 1);
          }

          await sellerProductApi.replaceSkus(newId, {
            attribute_definitions: attrDefs,
            skus: formattedSkus,
            version: ver
          });
          ver = ver + 1;
          setCurrentProduct(createdProduct);
          setCurrentVersion(ver);

          await sellerProductApi.publishProduct(newId, ver);
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
    <div className="relative my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[920px] max-h-[90vh] flex flex-col overflow-hidden">
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
          aria-label="Đóng"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
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
            onClick={() => handleGoToStep(s.num)}
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
            categories={flattenedCategories}
            loadingCategories={loadingCategories}
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
            isMultiVariant={isMultiVariant}
            setIsMultiVariant={(multi) => {
              setIsMultiVariant(multi);
              if (!multi) {
                setSkus([
                  {
                    id: 'sku-single',
                    code: singleSkuCode || `${spuCode}-DEFAULT`,
                    name: 'Tiêu chuẩn',
                    price: singleSkuPrice,
                    stock: Number(singleSkuStock) || 0,
                    enabled: true,
                    attributes: {}
                  }
                ]);
              } else {
                const synched = generateSkusFromCombos(generatedCombinations, skus, skuPrefix || spuCode);
                setSkus(synched);
              }
            }}
            skuPrefix={skuPrefix}
            setSkuPrefix={setSkuPrefix}
            singleSkuCode={singleSkuCode}
            setSingleSkuCode={setSingleSkuCode}
            singleSkuPrice={singleSkuPrice}
            setSingleSkuPrice={setSingleSkuPrice}
            singleSkuStock={singleSkuStock}
            setSingleSkuStock={setSingleSkuStock}
          />
        )}

        {step === 2 && (
          <AttributesStep
            attributes={attributes}
            newValueInputs={newValueInputs}
            setNewValueInputs={setNewValueInputs}
            onAddValue={handleAddValue}
            onRemoveValue={handleRemoveValue}
            onRemoveAttribute={handleRemoveAttribute}
            onOpenAddAttrModal={() => setIsAddAttrModalOpen(true)}
            onAddAttribute={handleAddNewAttribute}
            combosCount={generatedCombinations.length}
            combinations={generatedCombinations}
          />
        )}

        {step === 3 && (
          <SkuMatrixStep
            skus={skus}
            skuPrefix={skuPrefix}
            bulkPriceInput={bulkPriceInput}
            setBulkPriceInput={setBulkPriceInput}
            bulkStockInput={bulkStockInput}
            setBulkStockInput={setBulkStockInput}
            onApplyBulkPrice={handleApplyBulkPrice}
            onApplyBulkStock={handleApplyBulkStock}
            onToggleAllSkus={handleToggleAllSkus}
            onRegenerateSkus={handleRegenerateSkus}
            onFormatAllSkuCodes={handleFormatAllSkuCodes}
            combosCount={generatedCombinations.length}
            onUpdateSkuCode={handleUpdateSkuCode}
            onUpdateSkuPrice={handleUpdateSkuPrice}
            onUpdateSkuStock={handleUpdateSkuStock}
            onToggleSku={handleToggleSku}
          />
        )}

        {step === 4 && <ShippingStep />}

        {notification && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[#4F46E5] font-semibold text-center animate-in fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4F46E5]" aria-hidden="true" />
            <span>{notification}</span>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <ProductEditorForm
        key={product ? (product.product_id || product.id || product.productId) : 'new-product'}
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
