const tealSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="gradTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#005C5E" />
      <stop offset="100%" stop-color="#008A8F" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#gradTeal)" />
  <g transform="translate(-20, 0)">    
    <text x="128" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="160" fill="white" text-anchor="middle">N</text>
    <circle cx="210" cy="172" r="16" fill="#ef4444" />
  </g>
</svg>`;

const slateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="gradSlate" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#gradSlate)" />
  <g transform="translate(-20, 0)">    
    <text x="128" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="160" fill="white" text-anchor="middle">N</text>
    <circle cx="210" cy="172" r="16" fill="#ef4444" />
  </g>
</svg>`;

const blueSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#gradBlue)" />
  <g transform="translate(-20, 0)">    
    <text x="128" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="160" fill="white" text-anchor="middle">N</text>
    <circle cx="210" cy="172" r="16" fill="#ef4444" />
  </g>
</svg>`;

console.log("TEAL:");
console.log("data:image/svg+xml;base64," + Buffer.from(tealSvg).toString('base64'));
console.log("\nSLATE:");
console.log("data:image/svg+xml;base64," + Buffer.from(slateSvg).toString('base64'));
console.log("\nBLUE:");
console.log("data:image/svg+xml;base64," + Buffer.from(blueSvg).toString('base64'));
