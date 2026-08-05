import { useId } from 'react';

export default function Logo({ size = 36, withText = true, className = '', textClassName = '' }) {
  const uid = useId();
  const gradientId = `wflogo-${uid.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="relative inline-flex shrink-0">
        <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6554ff" />
              <stop offset="1" stopColor="#d9167a" />
            </linearGradient>
          </defs>
          <rect x="1.5" y="1.5" width="61" height="61" rx="17" fill={`url(#${gradientId})`} />
          <path
            d="M17 44 L24 27 L32 16 L40 27 L47 44"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText && (
        <span className={`ml-2.5 text-lg font-extrabold tracking-tight text-gray-900 dark:text-white ${textClassName}`}>
          Wealth<span className="text-gradient">Flow</span>
        </span>
      )}
    </span>
  );
}
