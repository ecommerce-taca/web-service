import { FEATURED_CATEGORIES } from '../constants/landingContent';
import { storeUrl } from '../constants/links';

export default function FeaturedCategoryGrid() {
  return (
    <section aria-labelledby="landing-cat-h" className="mx-auto max-w-[1200px] px-6 pb-20 pt-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="landing-cat-h" className="m-0 text-2xl font-extrabold">Danh mục nổi bật</h2>
        <a href={storeUrl('/category')} className="py-2.5 text-[15px] font-bold text-indigo-700 hover:text-indigo-800">
          Xem tất cả danh mục
        </a>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {FEATURED_CATEGORIES.map((category) => (
          <a
            key={category.slug}
            href={storeUrl(`/category/${category.slug}`)}
            className="lift reveal flex flex-col gap-3 rounded-2xl bg-slate-100 p-4 text-slate-900 no-underline"
          >
            <div
              className="zoom flex h-24 items-center justify-center rounded-xl"
              style={{ background: category.background }}
            >
              <svg aria-hidden="true" viewBox="0 0 120 80" width="120" height="80">
                <path d={category.back} fill={category.backColor} />
                <path d={category.front} fill={category.frontColor} />
                <path d={category.line} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[15px] font-bold">{category.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
