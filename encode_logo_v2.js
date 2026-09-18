const blueSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#gradBlue)" />
  <g transform="translate(-12, 0)">
    <text x="128" y="180" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="160" fill="white" text-anchor="middle">N</text>
    <circle cx="196" cy="172" r="16" fill="#ef4444" />
  </g>
</svg>`;

console.log("data:image/svg+xml;base64," + Buffer.from(blueSvg).toString('base64'));
