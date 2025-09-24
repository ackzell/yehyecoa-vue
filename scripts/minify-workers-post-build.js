import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';
import { minify } from 'terser';

async function minifyWorkers() {
  const workerFiles = glob.sync('dist/**/*.worker*.js');

  for (const file of workerFiles) {
    console.warn(`Processing ${file}...`);
    const originalCode = readFileSync(file, 'utf8');
    const originalSize = (originalCode.length / 1024 / 1024).toFixed(2);

    const result = await minify(originalCode, {
      compress: {
        drop_console: false,
        drop_debugger: true,
        passes: 3,
        unsafe: false,
      },
      mangle: true,
      format: {
        comments: false,
      },
    });

    if (result.code) {
      writeFileSync(file, result.code);
      const newSize = (result.code.length / 1024 / 1024).toFixed(2);
      console.warn(`✓ ${file}: ${originalSize}MB → ${newSize}MB`);
    }
  }
}

minifyWorkers().catch(console.error);
