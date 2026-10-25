import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import FormSuccess from './FormSuccess';
import { EMAIL_PATTERN, SECTION_IDS } from '../constants/landingContent';
import { prefersReducedMotion } from '../utils/motion';

const FOCUS_DELAY_MS = 450;
const DEFAULT_HINT = 'Chúng tôi chỉ dùng thông tin này để thông báo về phiên bản iOS.';
const ERROR_HINTS = {
  name: 'Vui lòng nhập họ và tên.',
  email: 'Email chưa đúng định dạng, ví dụ: ten@gmail.com',
  consent: 'Vui lòng đồng ý nhận email thông báo.',
};
const inputClass = 'rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900';

const validate = ({ name, email, consent }) => {
  if (!name) return 'name';
  if (!EMAIL_PATTERN.test(email)) return 'email';
  if (!consent) return 'consent';
  return null;
};

// Khối đăng ký nhận thông báo khi có app iOS (hiện sau khi khách bấm Đồng ý ở popup).
// Chưa có API backend cho danh sách chờ iOS nên form chỉ xác thực và báo thành công phía client.
export default function IosNotifyBlock({ scrollRequest }) {
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const [errorField, setErrorField] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    const timer = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [scrollRequest]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget.elements;
    const values = {
      name: form.namedItem('name').value.trim(),
      email: form.namedItem('email').value.trim(),
      consent: form.namedItem('consent').checked,
    };
    const invalidField = validate(values);
    if (invalidField) {
      // Bỏ trạng thái lỗi một khung hình rồi đặt lại để hiệu ứng rung chạy lại khi bấm gửi lần nữa
      setErrorField(null);
      requestAnimationFrame(() => setErrorField(invalidField));
      return;
    }
    setErrorField(null);
    setSubmitted({ name: values.name, email: values.email });
  };

  const invalid = (field) => (errorField === field ? 'true' : 'false');

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.iosNotify}
      aria-labelledby="landing-notify-h"
      className="notify-block mx-auto max-w-[1200px] scroll-mt-24 px-6 pt-[88px]"
    >
      <div className="flex flex-wrap items-start gap-x-12 gap-y-8 rounded-[28px] bg-white p-10 shadow-[inset_0_0_0_2px_#eef2ff]">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
          <h2 id="landing-notify-h" className="m-0 text-[28px] font-extrabold tracking-[-0.02em]">
            Nhận thông báo khi Taca có trên iOS
          </h2>
          <p className="m-0 text-base leading-relaxed text-slate-700">
            Điền thông tin bên dưới. Chúng tôi sẽ gửi một email duy nhất ngay khi ứng dụng Taca có mặt trên App Store.
          </p>
        </div>
        <div className="min-w-0 flex-[1_1_420px]">
          {submitted ? (
            <FormSuccess
              title={`Cảm ơn ${submitted.name}, bạn đã đăng ký thành công`}
              message={`Chúng tôi sẽ gửi thông báo tới ${submitted.email} ngay khi Taca có trên App Store.`}
            />
          ) : (
            <form className="landing-form flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="landing-n-name" className="text-sm font-bold text-slate-900">Họ và tên</label>
                <input
                  ref={nameRef}
                  id="landing-n-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-invalid={invalid('name')}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="landing-n-email" className="text-sm font-bold text-slate-900">Email</label>
                <input
                  id="landing-n-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ten@gmail.com"
                  aria-invalid={invalid('email')}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="landing-n-phone" className="text-sm font-bold text-slate-900">
                  Số điện thoại <span className="font-normal text-slate-500">(không bắt buộc)</span>
                </label>
                <input id="landing-n-phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-normal text-slate-700">
                <input
                  name="consent"
                  type="checkbox"
                  aria-invalid={invalid('consent')}
                  className="mt-px h-5 w-5 flex-none accent-indigo-600"
                />
                Tôi đồng ý nhận email từ Taca về việc phát hành ứng dụng iOS.
              </label>
              <span role="status" className={`text-[13px] ${errorField ? 'text-rose-700' : 'text-slate-500'}`}>
                {errorField ? ERROR_HINTS[errorField] : DEFAULT_HINT}
              </span>
              <button
                type="submit"
                className="press grad-fill cursor-pointer self-start rounded-xl border-0 px-6 py-3.5 text-[15px] font-bold"
              >
                Đăng ký nhận thông báo
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

IosNotifyBlock.propTypes = {
  scrollRequest: PropTypes.number.isRequired,
};
