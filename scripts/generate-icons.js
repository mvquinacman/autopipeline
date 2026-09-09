import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG template with automotive badge styling
const createSvg = (size, isMaskable = false) => {
  const padding = isMaskable ? Math.round(size * 0.15) : Math.round(size * 0.05);
  const innerSize = size - padding * 2;
  const radius = isMaskable ? 0 : Math.round(size * 0.22);
  const fontSize = Math.round(innerSize * 0.46);
  const subFontSize = Math.round(innerSize * 0.12);

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E4FD6" />
        <stop offset="100%" stop-color="#0F1826" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#189A5A" />
        <stop offset="100%" stop-color="#2E7BD6" />
      </linearGradient>
    </defs>
    
    <!-- Background Card -->
    <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${radius}" fill="url(#bgGrad)" />
    
    <!-- Speed Chevron Accent Line -->
    <path d="M ${padding + innerSize * 0.2} ${padding + innerSize * 0.24} L ${padding + innerSize * 0.8} ${padding + innerSize * 0.24} L ${padding + innerSize * 0.74} ${padding + innerSize * 0.28} L ${padding + innerSize * 0.26} ${padding + innerSize * 0.28} Z" fill="url(#accentGrad)" opacity="0.9" />

    <!-- AP Automotive Monogram -->
    <text x="${size / 2}" y="${size / 2 + fontSize * 0.24}" 
          font-family="'Barlow Condensed', 'Inter', -apple-system, sans-serif" 
          font-weight="800" 
          font-size="${fontSize}" 
          fill="#FFFFFF" 
          text-anchor="middle" 
          letter-spacing="${Math.round(size * 0.02)}">AP</text>
    
    <!-- Automotive Subtitle -->
    <text x="${size / 2}" y="${size / 2 + fontSize * 0.62}" 
          font-family="'Inter', -apple-system, sans-serif" 
          font-weight="700" 
          font-size="${subFontSize}" 
          fill="#93C5FD" 
          text-anchor="middle" 
          letter-spacing="${Math.round(size * 0.04)}">AUTOPIPELINE</text>
          
    <!-- Dynamic Indicator dots -->
    <circle cx="${size / 2 - innerSize * 0.18}" cy="${padding + innerSize * 0.82}" r="${Math.max(2, size * 0.015)}" fill="#189A5A" />
    <circle cx="${size / 2}" cy="${padding + innerSize * 0.82}" r="${Math.max(2, size * 0.015)}" fill="#E8A013" />
    <circle cx="${size / 2 + innerSize * 0.18}" cy="${padding + innerSize * 0.82}" r="${Math.max(2, size * 0.015)}" fill="#2E7BD6" />
  </svg>
  `;
};

async function generate() {
  // 192x192
  await sharp(Buffer.from(createSvg(192, false)))
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512
  await sharp(Buffer.from(createSvg(512, false)))
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 512x512 maskable (with safe zone margin)
  await sharp(Buffer.from(createSvg(512, true)))
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
  console.log('Created maskable-icon-512x512.png');

  // apple-touch-icon 180x180
  await sharp(Buffer.from(createSvg(180, false)))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), createSvg(64, false));
  console.log('Created favicon.svg');
}

generate().catch(console.error);
