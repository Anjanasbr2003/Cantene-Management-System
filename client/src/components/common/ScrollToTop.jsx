import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Smoothly scrolls to the top of the viewport on route transitions
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smoothly scroll window to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
