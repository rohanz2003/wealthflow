import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const REVEAL_SELECTOR = '.reveal:not(.reveal-visible), .reveal-scale:not(.reveal-visible), .reveal-left:not(.reveal-visible), .reveal-right:not(.reveal-visible)';

export default function RevealObserver() {
  const location = useLocation();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => io.observe(el));
    };

    observeAll();

    const fallback = setTimeout(() => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('reveal-visible');
        }
      });
    }, 1200);

    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(fallback);
    };
  }, [location.pathname]);

  return null;
}
