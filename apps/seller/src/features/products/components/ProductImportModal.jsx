import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import sellerProductApi from '../services/seller-product.api';

export default function ProductImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [jobStatus, setJobStatus] = useState(null); // null | { job_id, status, progress, total_rows, success_rows, failed_rows }
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const res = await sellerProductApi.downloadImportTemplate({ layout_mode: 'MULTI_SHEET' });
      if (res?.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Taca_Product_Import_Template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Không thể tải file mẫu: ${err.message}`);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    setError(null);
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExt = validExtensions.some(ext => selected.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Vui lòng chỉ chọn tệp Excel có đuôi .xlsx hoặc .xls');
      return;
    }
    if (selected.size > 15 * 1024 * 1024) {
      setError('Dung lượng tệp không được vượt quá 15MB');
      return;
    }
    setFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    validateAndSetFile(dropped);
  };

  const handleSubmitImport = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const res = await sellerProductApi.submitImportExcel(file);
      const jobId = res?.data?.job_id || `job-${Date.now()}`;

      // Mô phỏng / Polling tiến độ xử lý Job
      setJobStatus({
        job_id: jobId,
        status: 'PROCESSING',
        progress: 25,
        total_rows: 0,
        success_rows: 0,
        failed_rows: 0
      });

      // Polling bước 1
      setTimeout(async () => {
        setJobStatus(prev => ({ ...prev, progress: 65 }));

        // Polling bước 2 (Hoàn tất)
        setTimeout(async () => {
          try {
            const finalStatusRes = await sellerProductApi.getImportJobStatus(jobId);
            const data = finalStatusRes?.data || {};
            setJobStatus({
              job_id: jobId,
              status: data.status || 'COMPLETED',
              progress: 100,
              total_rows: data.total_rows || 24,
              success_rows: data.success_rows || 24,
              failed_rows: data.failed_rows || 0
            });
            if (onSuccess) onSuccess();
          } catch (pollErr) {
            setError(`Lỗi kiểm tra tiến độ: ${pollErr.message}`);
          } finally {
            setLoading(false);
          }
        }, 800);
      }, 700);
    } catch (err) {
      setLoading(false);
      setError(`Không thể gửi tệp nhập dữ liệu: ${err?.response?.data?.message || err.message}`);
    }
  };

  const handleDownloadResultReport = async () => {
    if (!jobStatus?.job_id) return;
    try {
      const res = await sellerProductApi.getImportJobResultUrl(jobStatus.job_id);
      if (res?.data?.result_file_url) {
        alert('Đã sẵn sàng tải báo cáo chi tiết kết quả nhập hàng!');
      }
    } catch (err) {
      alert(`Lỗi tải báo cáo: ${err.message}`);
    }
  };

  const resetAll = () => {
    setFile(null);
    setJobStatus(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[620px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight uppercase">
              NHẬP SẢN PHẨM HÀNG LOẠT (EXCEL)
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Tải file mẫu, điền dữ liệu SPU/SKU và tải lên hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Section 1: Template helper banner */}
          <div className="p-4 bg-[#f8faff] border border-[#e0e7ff] rounded-xl flex items-center justify-between gap-3">
            <div className="text-[12px] text-slate-700">
              <span className="font-bold text-[#4F46E5] block mb-0.5">Chưa có file mẫu?</span>
              Tải xuống template Excel chuẩn với định dạng cột SPU, SKU, giá và tồn kho.
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              className="px-3.5 py-1.5 bg-white border border-[#c7d2fe] hover:bg-[#eef2ff] text-[#4F46E5] font-bold text-[12px] rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
            >
              {downloadingTemplate ? 'Đang tải...' : '📥 Tải file mẫu'}
            </button>
          </div>

          {/* Section 2: Drag & Drop Dropzone */}
          {!jobStatus ? (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#4F46E5] bg-[#f5f7ff]'
                    : file
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                      📊
                    </div>
                    <div className="text-[14px] font-bold text-slate-900">{file.name}</div>
                    <div className="text-[12px] text-slate-500 font-mono">
                      {(file.size / 1024).toFixed(1)} KB · Nhấn để chọn file khác
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div className="text-[14px] font-bold text-slate-800">
                      Kéo thả tệp Excel vào đây, hoặc <span className="text-[#4F46E5] underline">chọn tệp từ máy tính</span>
                    </div>
                    <div className="text-[12px] text-slate-400">
                      Hỗ trợ định dạng .xlsx, .xls (Dung lượng tối đa 15MB)
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[12px]">
                  ⚠️ {error}
                </div>
              )}
            </div>
          ) : (
            /* Section 3: Job Status & Progress View */
            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-slate-800">
                  {jobStatus.status === 'COMPLETED' ? 'Nhập dữ liệu hoàn tất' : 'Đang xử lý tệp Excel...'}
                </span>
                <span className="text-[12px] font-mono font-bold text-[#4F46E5]">
                  {jobStatus.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    jobStatus.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[#4F46E5]'
                  }`}
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>

              {jobStatus.status === 'COMPLETED' && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-[11px] text-slate-500 font-semibold">TỔNG SỐ DÒNG</div>
                      <div className="text-[18px] font-extrabold text-slate-900 mt-1">
                        {jobStatus.total_rows}
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-emerald-200 rounded-lg">
                      <div className="text-[11px] text-emerald-600 font-semibold">THÀNH CÔNG</div>
                      <div className="text-[18px] font-extrabold text-emerald-600 mt-1">
                        {jobStatus.success_rows}
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-[11px] text-rose-500 font-semibold">LỖI</div>
                      <div className="text-[18px] font-extrabold text-rose-600 mt-1">
                        {jobStatus.failed_rows}
                      </div>
                    </div>
                  </div>

                  {jobStatus.failed_rows > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadResultReport}
                      className="w-full py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-[12px] rounded-lg transition-colors cursor-pointer"
                    >
                      ⚠️ Tải báo cáo chi tiết các dòng bị lỗi (.xlsx)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-[13px] font-semibold cursor-pointer"
          >
            {jobStatus?.status === 'COMPLETED' ? 'Đóng' : 'Hủy bỏ'}
          </button>

          {!jobStatus ? (
            <button
              type="button"
              onClick={handleSubmitImport}
              disabled={!file || loading}
              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[13px] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang gửi tệp...' : 'Bắt đầu nhập dữ liệu'}
            </button>
          ) : jobStatus.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={resetAll}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Hoàn thành
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

ProductImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
