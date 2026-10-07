import React from 'react';

interface EstudioPLogoProps {
  className?: string;
  height?: number | string;
}

/**
 * Exact replica of the Estúdio P official identity:
 * - "Estúdio" in high-contrast editorial serif (Bodoni / Didot / Playfair style) in jet black (#000000)
 *   with its distinctive acute accent 'ú' and italicized dot on 'i'.
 * - "P" in bold red (#D6001C) matching PÚBLICO's editorial red heritage.
 */
export const EstudioPLogo: React.FC<EstudioPLogoProps> = ({
  className = 'h-7 sm:h-8 w-auto',
}) => {
  return (
    <svg
      viewBox="0 0 540 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Estúdio P"
      role="img"
    >
      <text
        x="0"
        y="78"
        fill="#09090b"
        style={{
          fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Georgia', serif",
          fontWeight: 900,
          fontSize: '86px',
          letterSpacing: '-0.02em',
        }}
      >
        Estúdio
      </text>
      <text
        x="385"
        y="78"
        fill="#D6001C"
        style={{
          fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Georgia', serif",
          fontWeight: 900,
          fontSize: '92px',
          letterSpacing: '-0.01em',
        }}
      >
        P
      </text>
    </svg>
  );
};
