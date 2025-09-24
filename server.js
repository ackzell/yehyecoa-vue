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

// SSE clients
const clients = [];

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

// SSE helpers
function sendSSE(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcastFilesChanged(lessonName, files, error = null) {
  clients.forEach((client) => {
    sendSSE(client, 'filesChanged', { lessonName, files, error });
  });
}

// Watch for yv-lesson.json changes (including creation/deletion)
let watcher = null;

function setupWatcher() {
  // Clean up existing watcher
  if (watcher) {
    watcher.close();
  }

  try {
    // Watch the directory for the specific file
    watcher = fs.watch(baseDir, (eventType, filename) => {
      if (filename === 'yv-lesson.json') {
        console.warn(`[watcher] yv-lesson.json ${eventType}`);
        sendFileContents();
      }
    });
    console.warn('[watcher] File watcher established');
  }
  catch (err) {
    console.error('[watcher] Failed to setup file watcher:', err);
  }
}

// Initialize watcher
setupWatcher();

const excludeFiles = [
  'yv-lesson.json',
  'index.html',
  'server.js',
  'favicon.ico',
  'lessonFile.vue',
  'server.js.gz',
];

const excludeFolders = [
  'assets',
];

// Function to send file contents to clients
function sendFileContents() {
  let lessonName = null;
  let error = null;

  // Try to read and parse the lesson file
  try {
    const lessonFilePath = path.join(baseDir, 'yv-lesson.json');
    if (fs.existsSync(lessonFilePath)) {
      const lessonFileContent = fs.readFileSync(lessonFilePath, 'utf-8');
      const yvLesson = JSON.parse(lessonFileContent);
      lessonName = yvLesson.lessonName;
      console.warn(`[files] Lesson file found: ${lessonName}`);
    }
    else {
      error = 'yv-lesson.json not found';
      console.warn('[files] yv-lesson.json not found, continuing with other files');
    }
  }
  catch (err) {
    error = `Failed to read or parse yv-lesson.json: ${err.message}`;
    console.error('[files]', error);
  }

  // Always gather other files regardless of lesson file status
  const files = {};
  try {
    const fileNames = fs.readdirSync(baseDir);
    fileNames.forEach((fileName) => {
      const filePath = path.join(baseDir, fileName);

      // Skip excluded files and folders
      if (excludeFiles.includes(fileName) || excludeFolders.includes(path.basename(filePath))) {
        return;
      }

      // Check if it's a file (not a directory)
      try {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          files[fileName] = content;
        }
      }
      catch (fileErr) {
        console.warn(`[files] Could not read file ${fileName}:`, fileErr.message);
      }
    });

    console.warn(`[files] Sending ${Object.keys(files).length} files to clients`);
  }
  catch (dirErr) {
    console.error('[files] Could not read directory:', dirErr.message);
    error = error ? `${error}; Directory read failed: ${dirErr.message}` : `Directory read failed: ${dirErr.message}`;
  }

  // Broadcast to all clients with current state
  broadcastFilesChanged(lessonName, files, error);
}

// HTTP server
const server = http.createServer((req, res) => {
  // SSE endpoint
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('\n');
    clients.push(res);

    console.warn('[SSE] Client connected');
    sendFileContents();

    req.on('close', () => {
      console.warn('[SSE] Client disconnected');
      const idx = clients.indexOf(res);
      if (idx !== -1)
        clients.splice(idx, 1);
    });
    return;
  }

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
  if (watcher) {
    watcher.close();
  }
  server.close(() => {
    console.warn('[shutdown] Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.warn(`Server running at http://localhost:${PORT}`);
});
