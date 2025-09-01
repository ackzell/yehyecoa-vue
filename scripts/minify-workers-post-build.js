import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';
// scripts/minify-workers-post-build.js
import { minify } from 'terser';

async function minifyWorkers() {
  const workerFiles = glob.sync('dist/**/*.worker*.js');

  for (const file of workerFiles) {
    console.log(`Processing ${file}...`);
    const originalCode = readFileSync(file, 'utf8');
    const originalSize = (originalCode.length / 1024 / 1024).toFixed(2);

    const result = await minify(originalCode, {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
        unsafe: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    });

    if (result.code) {
      writeFileSync(file, result.code);
      const newSize = (result.code.length / 1024 / 1024).toFixed(2);
      console.log(`✓ ${file}: ${originalSize}MB → ${newSize}MB`);
    }
  }
}

minifyWorkers().catch(console.error);
