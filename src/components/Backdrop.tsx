import React from 'react';

// Blurred patches in the Portuguese flag's colors; the glass surfaces frost over them
const ORBS = [
  { color: '#046A38', size: 320, pos: { top: -90, right: -110 }, blur: 46, opacity: 0.85 },
  { color: '#DA291C', size: 260, pos: { top: 330, left: -130 }, blur: 50, opacity: 0.8 },
  { color: '#FFE900', size: 300, pos: { bottom: 20, right: -120 }, blur: 55, opacity: 0.75 },
];

export const Backdrop: React.FC = () => (
  <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="relative h-full max-w-md mx-auto">
      {ORBS.map(({ color, size, pos, blur, opacity }) => (
        <div
          key={color}
          className="absolute rounded-full dark:opacity-50!"
          style={{ ...pos, width: size, height: size, background: color, filter: `blur(${blur}px)`, opacity }}
        />
      ))}
    </div>
  </div>
);

export default Backdrop;
