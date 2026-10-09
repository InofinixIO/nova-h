import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distServer = path.join(__dirname, 'dist', 'server.cjs');

// In production, Cloud Run environment, or when pre-bundled server exists (and not explicitly development)
if (process.env.NODE_ENV === 'production' || process.env.K_SERVICE || (fs.existsSync(distServer) && process.env.NODE_ENV !== 'development')) {
  if (fs.existsSync(distServer)) {
    await import('./dist/server.cjs');
  } else {
    const { startServer } = await import('./src/server.ts');
    await startServer();
  }
} else {
  const { startServer } = await import('./src/server.ts');
  await startServer();
}
