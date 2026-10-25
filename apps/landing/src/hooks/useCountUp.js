import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../utils/motion';

/**
 * Tiến độ đếm số từ 0 đến 1 (ease-out cubic) sau khi `active` bật.
 * Người dùng chọn giảm chuyển động sẽ thấy ngay giá trị cuối.
 */
export function useCountUp(active, duration = 1600) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) {
      setProgress(1);
      return undefined;
    }
    let frameId;
    const start = performance.now();
    const tick = (now) => {
      const ratio = Math.min(1, (now - start) / duration);
      setProgress(1 - Math.pow(1 - ratio, 3));
      if (ratio < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active, duration]);

  return progress;
}
