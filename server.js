import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const baseDir = __dirname;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.wasm': 'application/wasm',
};

// Helper to check if client accepts gzip
function acceptsGzip(req) {
  return req.headers['accept-encoding']?.includes('gzip') || false;
}

// Helper to serve gzipped file if it exists
function tryServeGzipped(req, res, filePath, contentType) {
  const gzipPath = `${filePath}.gz`;
  if (acceptsGzip(req) && fs.existsSync(gzipPath)) {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Encoding': 'gzip',
    });
    fs.createReadStream(gzipPath).pipe(res);
    return true;
  }
  return false;
}

// Load index.html once at startup for instant serving
const indexPath = path.join(baseDir, 'index.html');
let indexHTML = '';
let indexHTMLGzipped = null;
try {
  indexHTML = fs.readFileSync(indexPath, 'utf-8');
  indexHTMLGzipped = zlib.gzipSync(indexHTML);
  console.warn('[startup] Loaded index.html into memory.');
}
catch (err) {
  console.error('[startup] Could not read index.html:', err);
}

// HTTP server
const server = http.createServer((req, res) => {
  // Strip query string/hash
  const cleanUrl = req.url.split('?')[0].split('#')[0];
  const filePath = path.join(baseDir, cleanUrl);

  // Serve preloaded index.html instantly for root
  if (cleanUrl === '/' || cleanUrl === '') {
    if (acceptsGzip(req) && indexHTMLGzipped) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Encoding': 'gzip',
      });
      res.end(indexHTMLGzipped);
    }
    else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHTML);
    }
    return;
  }

  // Prevent directory traversal
  if (!filePath.startsWith(baseDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Serve static files or SPA fallback
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback: serve cached index.html
      if (acceptsGzip(req) && indexHTMLGzipped) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Encoding': 'gzip',
        });
        res.end(indexHTMLGzipped);
      }
      else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexHTML);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Try to serve pre-compressed version first
    if (tryServeGzipped(req, res, filePath, contentType)) {
      return;
    }

    // Fall back to original file
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.warn('\n[shutdown] Closing server...');
  server.close(() => {
    console.warn('[shutdown] Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.warn(`Server running at http://localhost:${PORT}`);
});
