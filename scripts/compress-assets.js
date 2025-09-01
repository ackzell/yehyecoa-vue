import fs from 'node:fs';
import path from 'node:path';
// scripts/compress-assets.js
import zlib from 'node:zlib';

const distDir = './dist';
const assetsDir = path.join(distDir, 'assets');

function compressFilesInDir(dir, dirName) {
  if (!fs.existsSync(dir))
    return;

  fs.readdirSync(dir)
    .filter(file => file.endsWith('.js') || file.endsWith('.css'))
    .forEach((file) => {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath);
      const compressed = zlib.gzipSync(content);
      fs.writeFileSync(`${filePath}.gz`, compressed);

      console.log(`Compressed ${dirName}/${file}: ${Math.round(content.length / 1024)}KB → ${Math.round(compressed.length / 1024)}KB`);
    });
}

// Compress files in both /dist and /dist/assets
compressFilesInDir(distDir, 'dist');
compressFilesInDir(assetsDir, 'assets');
