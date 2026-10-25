// Tính URL logo theo chính module này thay vì origin của trang, để ảnh vẫn hiện khi buyer chạy
// như remote trong shell (local: shell ở :5173, buyer ở :5174).
export const tacaLogoUrl = new URL('./taca-logo.png', import.meta.url).href;
