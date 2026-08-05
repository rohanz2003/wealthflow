import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RevealObserver() {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll(
      '.reveal:not(.reveal-visible), .reveal-scale:not(.reveal-visible), .reveal-left:not(.reveal-visible), .reveal-right:not(.reveal-visible)'
    );
    elements.forEach((el) => observer.observe(el));

    const timer = setTimeout(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('reveal-visible');
          observer.unobserve(el);
        }
      });
    }, 300);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return null;
}
