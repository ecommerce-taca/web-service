import { useEffect, useRef, useState } from 'react';

/**
 * Trả về `true` từ lần đầu phần tử lọt vào khung nhìn (chỉ kích hoạt một lần).
 */
export function useInViewOnce(threshold = 0.35) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return undefined;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}
