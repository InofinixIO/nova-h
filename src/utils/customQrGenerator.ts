import QRCode from 'qrcode';

export interface ThemedQrOptions {
  darkColor?: string;       // Outer ring, alignment ring & data dots (default #005C5E)
  eyeCenterColor?: string;  // Center circle of eyes (default #008A8F)
  bgColor?: string;         // Background color (default #ffffff)
  margin?: number;          // Module quiet zone margin (default 3)
  dotScale?: number;        // Dot radius multiplier (default 0.44)
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;           // Target pixel width for PNG
}

// Alignment pattern centers per QR version specification
function getAlignmentPatternCenters(version: number): Array<{ row: number; col: number }> {
  if (version <= 1) return [];
  const PATTERNS: number[][] = [
    [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
    [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66],
    [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78],
    [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90]
  ];
  const pos = PATTERNS[version] || [];
  const coords: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < pos.length; r++) {
    for (let c = 0; c < pos.length; c++) {
      const row = pos[r];
      const col = pos[c];
      // Exclude positions overlapping with the 3 main finder patterns
      if (row === 6 && col === 6) continue;
      if (row === 6 && col === pos[pos.length - 1]) continue;
      if (row === pos[pos.length - 1] && col === 6) continue;
      coords.push({ row, col });
    }
  }
  return coords;
}

/**
 * Generate a custom themed QR Code SVG matching the teal circular dot and eye ring design
 */
export function generateThemedQrSvg(text: string, options: ThemedQrOptions = {}): string {
  const {
    darkColor = '#005C5E',
    eyeCenterColor = '#008A8F',
    bgColor = '#ffffff',
    margin = 3,
    dotScale = 0.44,
    errorCorrectionLevel = 'M'
  } = options;

  const qr = QRCode.create(text, { errorCorrectionLevel });
  const size = qr.modules.size;
  const cellSize = 10;
  const totalSize = (size + margin * 2) * cellSize;

  // 1. Finder pattern module boundary check (8x8 including separator)
  const isFinder = (row: number, col: number) => {
    if (row <= 7 && col <= 7) return true;                  // Top-left
    if (row <= 7 && col >= size - 8) return true;           // Top-right
    if (row >= size - 8 && col <= 7) return true;           // Bottom-left
    return false;
  };

  // 2. Alignment pattern boundary check (5x5 around center)
  const alignmentCenters = getAlignmentPatternCenters(qr.version);
  const isAlignment = (row: number, col: number) => {
    for (const ac of alignmentCenters) {
      if (Math.abs(row - ac.row) <= 2 && Math.abs(col - ac.col) <= 2) {
        return true;
      }
    }
    return false;
  };

  let elements = '';

  // Data modules as smooth circles
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinder(r, c) || isAlignment(r, c)) continue;
      if (qr.modules.get(r, c)) {
        const cx = (margin + c + 0.5) * cellSize;
        const cy = (margin + r + 0.5) * cellSize;
        elements += `<circle cx="${cx}" cy="${cy}" r="${cellSize * dotScale}" fill="${darkColor}" />\n`;
      }
    }
  }

  // Three large corner Finder patterns (top-left, top-right, bottom-left)
  const finderCenters = [
    { r: 3, c: 3 },
    { r: 3, c: size - 4 },
    { r: size - 4, c: 3 }
  ];

  finderCenters.forEach((fc) => {
    const cx = (margin + fc.c + 0.5) * cellSize;
    const cy = (margin + fc.r + 0.5) * cellSize;
    // Outer concentric ring: radius 3.0 modules, stroke-width 1.0 module (covers radius 2.5 to 3.5 = 7 modules wide)
    elements += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 3.0}" fill="none" stroke="${darkColor}" stroke-width="${cellSize}" />\n`;
    // Inner cyan dot: radius 1.5 modules (covers 3x3 inner square)
    elements += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 1.5}" fill="${eyeCenterColor}" />\n`;
  });

  // Alignment patterns: circular ring + inner dot
  alignmentCenters.forEach((ac) => {
    const cx = (margin + ac.col + 0.5) * cellSize;
    const cy = (margin + ac.row + 0.5) * cellSize;
    // Outer ring: radius 2.0 modules, stroke 0.95 modules
    elements += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 2.0}" fill="none" stroke="${darkColor}" stroke-width="${cellSize * 0.95}" />\n`;
    // Inner cyan dot: radius 0.65 modules
    elements += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.65}" fill="${eyeCenterColor}" />\n`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
  <rect width="100%" height="100%" fill="${bgColor}" />
  ${elements}
</svg>`;
}

/**
 * Generate a high-resolution PNG data URL from the custom themed SVG
 */
export async function generateThemedQrPng(text: string, options: ThemedQrOptions = {}): Promise<string> {
  const targetWidth = options.width || 1024;
  const svgString = generateThemedQrSvg(text, options);

  if (typeof window === 'undefined') {
    return '';
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetWidth;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to create canvas context'));
        return;
      }

      // Smooth anti-aliased rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetWidth);
      URL.revokeObjectURL(url);

      const pngDataUrl = canvas.toDataURL('image/png');
      resolve(pngDataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
