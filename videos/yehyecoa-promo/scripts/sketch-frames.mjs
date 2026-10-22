// Writes the sketch-pass poses: one static sub-composition per storyboard frame
// (compositions/frames/NN-*.html) and an index.html that mounts them at their planned starts.
// Static layouts only — motion is added in the build pass.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FONTS = `
  @font-face { font-family: "Work Sans"; font-weight: 400; src: url("assets/fonts/work-sans-400.woff2") format("woff2"); }
  @font-face { font-family: "Work Sans"; font-weight: 500; src: url("assets/fonts/work-sans-500.woff2") format("woff2"); }
  @font-face { font-family: "Work Sans"; font-weight: 600; src: url("assets/fonts/work-sans-600.woff2") format("woff2"); }
  @font-face { font-family: "Work Sans"; font-weight: 700; src: url("assets/fonts/work-sans-700.woff2") format("woff2"); }
  @font-face { font-family: "Space Mono"; font-weight: 400; src: url("assets/fonts/space-mono-400.woff2") format("woff2"); }
  @font-face { font-family: "Space Mono"; font-weight: 700; src: url("assets/fonts/space-mono-700.woff2") format("woff2"); }`;

// Shared atoms from frame.md (broadside remixed onto the yehyecoa brand).
const BASE = (id, register) => `
  #root { position: absolute; inset: 0; }
  #${id}-ground { position: absolute; inset: 0; container-type: size; overflow: hidden;
    background: ${register === 'orange' ? '#e4007c' : '#0b0c07'};
    color: ${register === 'orange' ? '#0b0c07' : '#f5f5f5'};
    font-family: "Work Sans", sans-serif; }
  #${id}-ground .kicker { font-family: "Space Mono", monospace; font-size: 0.9cqw; letter-spacing: 0.14em;
    text-transform: uppercase; color: ${register === 'orange' ? 'rgba(17,17,17,0.55)' : '#e4007c'}; }
  #${id}-ground .rule { width: 36px; height: 2px; background: ${register === 'orange' ? '#0b0c07' : '#e4007c'}; }
  #${id}-ground .accent { color: #e4007c; }
  #${id}-ground .muted { color: #a7a4a3; }
  #${id}-ground .shot { display: block; border: 1px solid #282627; object-fit: cover; }
  #${id}-ground .tag { font-family: "Space Mono", monospace; font-size: 0.8cqw; letter-spacing: 0.14em;
    text-transform: uppercase; color: #a7a4a3; }
  #${id}-ground .bullets { list-style: none; display: flex; flex-direction: column; gap: 1cqw; }
  #${id}-ground .bullets li { font-size: 1.8cqw; line-height: 1.3; }
  #${id}-ground .bullets li::before { content: "/ "; font-family: "Space Mono", monospace; color: #e4007c; }`;

const frames = [
  {
    n: '01', slug: 'hook-word', start: 0, dur: 9, register: 'dark',
    css: `
  .f1-wrap { position: absolute; left: 5.5cqw; right: 5.5cqw; top: 0; bottom: 0; display: flex; align-items: center; gap: 6cqw; }
  .f1-word { flex: 1.1; }
  .f1-word .kicker { margin-bottom: 1.6cqw; }
  .f1-title { font-size: 10.5cqw; font-weight: 700; line-height: 0.88; letter-spacing: -0.04em; color: #e4007c; }
  .f1-say { font-family: "Space Mono", monospace; font-size: 1.6cqw; margin-top: 2cqw; color: #a7a4a3; letter-spacing: 0.04em; }
  .f1-stack { flex: 1; display: flex; flex-direction: column; gap: 0.6cqw; }
  .f1-stack div { font-size: 5.4cqw; font-weight: 700; line-height: 1.0; letter-spacing: -0.03em; }`,
    html: `
    <div class="f1-wrap">
      <div class="f1-word">
        <div class="kicker">No. 01 &middot; Nahuatl</div>
        <div class="f1-title">yehyecoa</div>
        <div class="f1-say">yeh-yeh-CO-ah</div>
      </div>
      <div class="f1-stack">
        <div style="opacity:0.22">to try.</div>
        <div style="opacity:0.5">to experiment.</div>
        <div>to rehearse.</div>
      </div>
    </div>`,
  },
  {
    n: '02', slug: 'promise-focus', start: 9, dur: 14, register: 'dark',
    css: `
  .f2-text { position: absolute; left: 5.5cqw; top: 50%; transform: translateY(-50%); width: 34cqw; display: flex; flex-direction: column; gap: 2cqw; }
  .f2-head { font-size: 5.6cqw; font-weight: 700; line-height: 0.95; letter-spacing: -0.03em; }
  .f2-shot { position: absolute; right: 5.5cqw; top: 50%; transform: translateY(-50%); width: 52cqw; height: 29.25cqw; }`,
    html: `
    <div class="f2-text">
      <div class="kicker">A Vue playground</div>
      <div class="f2-head">minus the <span class="accent">noise.</span></div>
      <ul class="bullets">
        <li>no version pickers</li>
        <li>no compiled output</li>
        <li>just you and your code</li>
      </ul>
    </div>
    <img class="shot f2-shot" src="capture/screenshots/focus-hero.png" alt="" />`,
  },
  {
    n: '03', slug: 'console-layouts', start: 23, dur: 11, register: 'dark',
    css: `
  .f3-shot { position: absolute; left: 5.5cqw; top: 50%; transform: translateY(-50%); width: 56cqw; height: 31.5cqw; }
  .f3-text { position: absolute; right: 5.5cqw; top: 50%; transform: translateY(-50%); width: 28cqw; display: flex; flex-direction: column; gap: 1.6cqw; }
  .f3-head { font-size: 4.5cqw; font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; }
  .f3-sub { font-size: 2.4cqw; font-weight: 600; line-height: 1.2; color: #a7a4a3; }`,
    html: `
    <img class="shot f3-shot" src="capture/screenshots/console-log-output.png" alt="" />
    <div class="f3-text">
      <div class="kicker">Built in</div>
      <div class="f3-head">see every <span class="accent">log.</span></div>
      <div class="f3-sub">arrange it your way.</div>
    </div>`,
  },
  {
    n: '04', slug: 'together', start: 34, dur: 20, register: 'dark',
    css: `
  .f4-head { position: absolute; left: 5.5cqw; top: 5.5cqw; display: flex; flex-direction: column; gap: 1cqw; }
  .f4-title { font-size: 4.5cqw; font-weight: 700; line-height: 1.0; letter-spacing: -0.02em; }
  .f4-room { position: absolute; left: 5.5cqw; right: 5.5cqw; top: 25cqh; display: flex; justify-content: space-between; align-items: flex-start; }
  .f4-col { display: flex; flex-direction: column; gap: 0.8cqw; }
  .f4-col.instructor { width: 50cqw; }
  .f4-students { width: 27cqw; display: flex; flex-direction: column; gap: 1.2cqw; }
  .f4-col .shot { width: 100%; aspect-ratio: 16 / 9; height: auto; }
  .f4-col.student .shot { border-color: #e4007c; }
  .f4-foot { position: absolute; left: 5.5cqw; bottom: 5.5cqw; font-size: 2.4cqw; font-weight: 600; }`,
    html: `
    <div class="f4-head">
      <div class="kicker">Workshop mode</div>
      <div class="f4-title">rehearse <span class="accent">together.</span></div>
    </div>
    <div class="f4-room">
      <div class="f4-col instructor"><div class="tag">Instructor &middot; broadcasting</div><img class="shot" src="capture/screenshots/together-instructor-broadcast.png" alt="" /></div>
      <div class="f4-students">
        <div class="f4-col student"><div class="tag">Student &middot; dark mode</div><img class="shot" src="capture/screenshots/together-student-sync.png" alt="" /></div>
        <div class="f4-col student"><div class="tag">Student &middot; light mode</div><img class="shot" src="capture/screenshots/together-student-light-sync.png" alt="" /></div>
      </div>
    </div>
    <div class="f4-foot">the whole room, <span class="accent">in sync.</span></div>`,
  },
  {
    n: '05', slug: 'safety-net', start: 54, dur: 20, register: 'dark',
    css: `
  .f5-text { position: absolute; left: 5.5cqw; top: 50%; transform: translateY(-50%); width: 30cqw; display: flex; flex-direction: column; gap: 2cqw; }
  .f5-head { font-size: 5cqw; font-weight: 700; line-height: 0.95; letter-spacing: -0.03em; }
  .f5-shot { position: absolute; right: 5.5cqw; top: 50%; transform: translateY(-50%); width: 56cqw; height: 31.5cqw; }`,
    html: `
    <div class="f5-text">
      <div class="kicker">History</div>
      <div class="f5-head">every try is <span class="accent">saved.</span></div>
      <ul class="bullets">
        <li>compare</li>
        <li>restore</li>
        <li>experiment fearlessly</li>
      </ul>
    </div>
    <img class="shot f5-shot" src="capture/screenshots/safety-diff-view.png" alt="" />`,
  },
  {
    n: '06', slug: 'home-amoxtli', start: 74, dur: 10, register: 'orange',
    css: `
  .f6-head { position: absolute; left: 5.5cqw; top: 5.5cqw; display: flex; flex-direction: column; gap: 1cqw; }
  .f6-title { font-size: 4.5cqw; font-weight: 700; line-height: 1.0; letter-spacing: -0.02em; }
  .f6-shot { position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; width: 72cqw; height: 42.4cqw; border: 1px solid rgba(17,17,17,0.2); object-fit: cover; object-position: top; }`,
    html: `
    <div class="f6-head">
      <div class="kicker">Its home</div>
      <div class="f6-title">built into amoxtli-vue lessons.</div>
    </div>
    <img class="f6-shot" src="capture/assets/home-amoxtli-lesson.png" alt="" />`,
  },
  {
    n: '07', slug: 'close-wordmark', start: 84, dur: 6, register: 'orange',
    css: `
  .f7-num { position: absolute; left: 5.5cqw; top: 5.5cqw; font-family: "Space Mono", monospace; font-size: 0.9cqw; letter-spacing: 0.14em; color: rgba(17,17,17,0.55); }
  .f7-meta { position: absolute; right: 5.5cqw; top: 5.5cqw; font-family: "Space Mono", monospace; font-size: 0.9cqw; letter-spacing: 0.14em; color: rgba(17,17,17,0.55); text-transform: uppercase; }
  .f7-block { position: absolute; left: 5.5cqw; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 1.4cqw; }
  .f7-word { font-size: 11cqw; font-weight: 700; line-height: 0.88; letter-spacing: -0.04em; }
  .f7-lead { margin-top: 2.4cqw; font-size: 2.6cqw; font-weight: 500; color: rgba(17,17,17,0.75); }`,
    html: `
    <div class="f7-num">NO. 07</div>
    <div class="f7-meta">a Vue playground</div>
    <div class="f7-block">
      <div class="rule"></div>
      <div class="f7-word">yehyecoa-vue</div>
      <div class="f7-lead">to try, to rehearse.</div>
    </div>`,
  },
];

const compId = f => `f${f.n}-${f.slug}`;

for (const f of frames) {
  const id = compId(f);
  const file = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>${FONTS}${BASE(id, f.register)}${f.css.replaceAll('\n  .', `\n  #${id}-ground .`)}
      </style>
      <div id="root" data-composition-id="${id}" data-start="0" data-duration="${f.dur}" data-width="1920" data-height="1080">
        <div id="${id}-ground" class="clip" data-start="0" data-duration="${f.dur}" data-track-index="0">${f.html}
        </div>
      </div>
      <script>
        const tl = gsap.timeline({ paused: true });
        // Sketch pass: static pose, no motion yet.
        window.__timelines["${id}"] = tl;
      </script>
    </template>
  </body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, `compositions/frames/${f.n}-${f.slug}.html`), file);
}

const total = frames.reduce((s, f) => s + f.dur, 0);
const mounts = frames.map(f => `      <div
        id="mount-${f.n}"
        class="clip"
        data-composition-id="${compId(f)}"
        data-composition-src="compositions/frames/${f.n}-${f.slug}.html"
        data-start="${f.start}"
        data-duration="${f.dur}"
        data-track-index="1"
        data-width="1920"
        data-height="1080"
      ></div>`).join('\n');

fs.writeFileSync(path.join(ROOT, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0b0c07; }
      #root { position: relative; width: 100%; height: 100%; background: #0b0c07; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${mounts}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
console.log(`wrote ${frames.length} frames, total ${total}s`);
