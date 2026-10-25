import AskQuestionForm from './AskQuestionForm';
import { FAQS, SECTION_IDS } from '../constants/landingContent';

export default function FaqSection() {
  return (
    <section id={SECTION_IDS.faq} aria-labelledby="landing-faq-h" className="mx-auto max-w-[1200px] px-6 py-[88px]">
      <h2 id="landing-faq-h" className="reveal m-0 mb-6 text-[clamp(28px,3.4vw,40px)] font-extrabold tracking-[-0.02em]">
        Câu hỏi thường gặp
      </h2>
      <div className="flex flex-col gap-3">
        {FAQS.map((faq) => (
          <details key={faq.question} className="rounded-2xl bg-slate-100 px-6">
            <summary className="flex min-h-11 items-center justify-between gap-4 py-5 text-[17px] font-bold">
              {faq.question}
              <span className="faq-plus grad-text text-2xl font-bold" aria-hidden="true">+</span>
            </summary>
            <p className="m-0 mb-5 text-[15px] leading-relaxed text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      <AskQuestionForm />
    </section>
  );
}
