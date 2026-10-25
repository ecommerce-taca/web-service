import { useEffect, useState } from 'react';

const SCROLLED_OFFSET = 40;
const MINI_SEARCH_OFFSET = 520;
const ACTIVE_SECTION_OFFSET = 160;

/**
 * Trạng thái header theo vị trí cuộn: thu nhỏ header, hiện ô tìm kiếm nhỏ và
 * gạch chân mục đang xem.
 */
export function useLandingScroll(sectionIds) {
  const [state, setState] = useState({ isScrolled: false, showMiniSearch: false, activeSection: '' });

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      let activeSection = '';
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top < ACTIVE_SECTION_OFFSET) activeSection = id;
      });
      const next = {
        isScrolled: scrollY > SCROLLED_OFFSET,
        showMiniSearch: scrollY > MINI_SEARCH_OFFSET,
        activeSection,
      };
      setState((previous) =>
        previous.isScrolled === next.isScrolled &&
        previous.showMiniSearch === next.showMiniSearch &&
        previous.activeSection === next.activeSection
          ? previous
          : next
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [sectionIds]);

  return state;
}
