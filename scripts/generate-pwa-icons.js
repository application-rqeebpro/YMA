import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

async function generateIcons() {
  const svgPath = path.join(process.cwd(), 'public', 'logo.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('logo.svg not found!');
    return;
  }

  const svgBuffer = fs.readFileSync(svgPath);
  const img = await loadImage(svgBuffer);

  const targets = [
    { size: 192, filename: 'pwa-192x192.png' },
    { size: 512, filename: 'pwa-512x512.png' },
    { size: 512, filename: 'pwa-maskable-512x512.png', padding: 40 },
    { size: 180, filename: 'apple-touch-icon.png' },
  ];

  for (const { size, filename, padding = 0 } of targets) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background white fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw SVG image centered with optional padding
    const drawSize = size - (padding * 2);
    ctx.drawImage(img, padding, padding, drawSize, drawSize);

    const outPath = path.join(process.cwd(), 'public', filename);
    const buf = await canvas.encode('png');
    fs.writeFileSync(outPath, buf);
    console.log(`Generated ${filename} (${size}x${size})`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating PWA icons:', err);
  process.exit(1);
});
