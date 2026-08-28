import React from 'react';

interface SembunyiLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export const SembunyiLogo: React.FC<SembunyiLogoProps> = ({
  className = 'w-10 h-10',
  variant = 'auto',
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        {/* Outer Circular Border */}
        <circle
          cx="100"
          cy="100"
          r="92"
          stroke="currentColor"
          strokeWidth="4.5"
          fill="currentColor"
          fillOpacity="0.05"
        />

        {/* Primary English Brand Text: sembunyi. */}
        <text
          x="100"
          y="92"
          textAnchor="middle"
          fill="currentColor"
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 900,
            fontSize: '31px',
            letterSpacing: '-0.8px',
          }}
        >
          sembunyi.
        </text>

        {/* Crisp Horizontal Divider Line Under sembunyi. */}
        <line
          x1="28"
          y1="105"
          x2="172"
          y2="105"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Jawi / Arabic Script: سمبوپي / سمبوني */}
        <text
          x="100"
          y="142"
          textAnchor="middle"
          fill="currentColor"
          style={{
            fontFamily: "'Traditional Arabic', 'Amiri', 'Noto Naskh Arabic', 'Scheherazade New', 'Geeza Pro', serif",
            fontWeight: 800,
            fontSize: '34px',
            letterSpacing: '1px',
          }}
        >
          سمبوپي
        </text>

        {/* Subtitle: coffee & eatery */}
        <text
          x="100"
          y="166"
          textAnchor="middle"
          fill="currentColor"
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 700,
            fontSize: '13.5px',
            letterSpacing: '0.6px',
          }}
        >
          coffee & eatery
        </text>
      </svg>
    </div>
  );
};
