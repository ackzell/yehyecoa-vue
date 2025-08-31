import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

// SSE clients
const clients = [];

// Load index.html once at startup for instant serving
const indexPath = path.join(baseDir, 'index.html');
let indexHTML = '';
try {
  indexHTML = fs.readFileSync(indexPath, 'utf-8');
  console.log('[startup] Loaded index.html into memory.');
}
catch (err) {
  console.error('[startup] Could not read index.html:', err);
}

// SSE helpers
function sendSSE(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcasFilesChanged(lessonName, files) {
  clients.forEach((client) => {
    sendSSE(client, 'filesChanged', { lessonName, files });
  });
}

// Watch the JSON file for changes
fs.watch(path.join(baseDir, 'yv-lesson.json'), () => {
  sendFileContents();
});

const excludeFiles = [
  'yv-lesson.json',
  'index.html',
  'server.js',
  'favicon.ico',
  'lessonFile.vue',
];

const excludeFolders = [
  'assets',
];
// Function to send file contents to clients
function sendFileContents() {
  const lessonFilePath = path.join(baseDir, 'yv-lesson.json');
  const lessonFileContent = fs.readFileSync(lessonFilePath, 'utf-8');
  const yvLesson = JSON.parse(lessonFileContent);
  const lessonName = yvLesson.lessonName;

  const files = {};
  const fileNames = fs.readdirSync(baseDir);
  fileNames.forEach((fileName) => {
    const filePath = path.join(baseDir, fileName);
    if (excludeFiles.includes(fileName) || excludeFolders.includes(path.basename(filePath))) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    files[fileName] = content;
  });

  broadcasFilesChanged(lessonName, files);
}

// HTTP server
const server = http.createServer((req, res) => {
  // SSE endpoint
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('\n');
    clients.push(res);

    console.log('[SSE] Client connected');
    sendFileContents();

    req.on('close', () => {
      console.log('[SSE] Client disconnected');
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
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexHTML);
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
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHTML);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
