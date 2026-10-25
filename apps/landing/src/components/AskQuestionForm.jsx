import { useState } from 'react';
import FormSuccess from './FormSuccess';
import {
  EMAIL_PATTERN,
  QUESTION_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  QUESTION_TOPICS,
} from '../constants/landingContent';

const DEFAULT_HINT = 'Thông tin chỉ dùng để trả lời câu hỏi của bạn.';
const ERROR_HINTS = {
  name: 'Vui lòng nhập họ và tên.',
  email: 'Email chưa đúng định dạng, ví dụ: ten@gmail.com',
  question: `Vui lòng nhập câu hỏi (ít nhất ${QUESTION_MIN_LENGTH} ký tự).`,
};
const fieldClass = 'rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900';

const validate = ({ name, email, question }) => {
  if (!name) return 'name';
  if (!EMAIL_PATTERN.test(email)) return 'email';
  if (question.length < QUESTION_MIN_LENGTH) return 'question';
  return null;
};

// Form "Chưa tìm thấy câu trả lời?". Chưa có API backend nhận câu hỏi nên form chỉ xác thực
// và báo thành công phía client.
export default function AskQuestionForm() {
  const [errorField, setErrorField] = useState(null);
  const [questionLength, setQuestionLength] = useState(0);
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget.elements;
    const values = {
      name: form.namedItem('name').value.trim(),
      email: form.namedItem('email').value.trim(),
      question: form.namedItem('question').value.trim(),
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

  const handleAskAgain = () => {
    setSubmitted(null);
    setQuestionLength(0);
  };

  const invalid = (field) => (errorField === field ? 'true' : 'false');

  return (
    <div id="ask" className="tint-soft reveal mt-8 flex scroll-mt-24 flex-col gap-[18px] rounded-3xl p-8">
      <div className="flex flex-col gap-1.5">
        <h3 className="m-0 text-[22px] font-extrabold">Chưa tìm thấy câu trả lời?</h3>
        <p className="m-0 text-[15px] leading-relaxed text-slate-700">
          Gửi câu hỏi cho đội ngũ Taca. Chúng tôi sẽ trả lời qua email của bạn.
        </p>
      </div>
      {submitted ? (
        <FormSuccess
          tone="white"
          title={`Đã gửi câu hỏi. Cảm ơn ${submitted.name}!`}
          message={`Chúng tôi sẽ trả lời tới ${submitted.email} sớm nhất có thể.`}
          action={
            <button
              type="button"
              onClick={handleAskAgain}
              className="press ml-auto cursor-pointer whitespace-nowrap rounded-[10px] border-0 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-900"
            >
              Hỏi thêm
            </button>
          }
        />
      ) : (
        <form className="landing-form flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="landing-q-name" className="text-sm font-bold">Họ và tên</label>
              <input id="landing-q-name" name="name" type="text" autoComplete="name" required aria-invalid={invalid('name')} className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="landing-q-email" className="text-sm font-bold">Email</label>
              <input
                id="landing-q-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="ten@gmail.com"
                aria-invalid={invalid('email')}
                className={fieldClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="landing-q-topic" className="text-sm font-bold">Chủ đề</label>
            <select id="landing-q-topic" name="topic" className={fieldClass}>
              {QUESTION_TOPICS.map((topic) => (
                <option key={topic.value} value={topic.value}>{topic.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="landing-q-text" className="text-sm font-bold">Câu hỏi của bạn</label>
              <span className="num text-xs text-slate-500">{questionLength}/{QUESTION_MAX_LENGTH}</span>
            </div>
            <textarea
              id="landing-q-text"
              name="question"
              rows={4}
              maxLength={QUESTION_MAX_LENGTH}
              required
              onInput={(event) => setQuestionLength(event.currentTarget.value.length)}
              aria-invalid={invalid('question')}
              placeholder="Ví dụ: Tôi có thể đổi địa chỉ giao hàng sau khi đặt không?"
              className={`${fieldClass} min-h-[110px] resize-y leading-normal`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <span role="status" className={`text-[13px] ${errorField ? 'text-rose-700' : 'text-slate-500'}`}>
              {errorField ? ERROR_HINTS[errorField] : DEFAULT_HINT}
            </span>
            <button
              type="submit"
              className="press grad-fill ml-auto cursor-pointer rounded-xl border-0 px-6 py-3.5 text-[15px] font-bold"
            >
              Gửi câu hỏi
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
