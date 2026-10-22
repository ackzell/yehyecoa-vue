#!/usr/bin/env node
/**
 * Capture real UI material of the yehyecoa-vue app for the HyperFrames promo.
 *
 * Prerequisites (not started by this script):
 *   - Vite dev server at http://localhost:5173 (override with YV_URL)
 *   - PartyKit dev server at http://127.0.0.1:1999
 *   - ffmpeg on PATH (webm -> H.264 mp4)
 *
 * Run from the repository root:
 *   node videos/yehyecoa-promo/scripts/capture-app.mjs
 *
 * Optional: BEATS=focus,console,together,safety to run a subset.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROMO = path.resolve(HERE, '..');
const REPO = path.resolve(PROMO, '..', '..');
const require = createRequire(path.join(REPO, 'package.json'));
const { chromium } = require('@playwright/test');

const BASE = process.env.YV_URL || 'http://localhost:5173';
const SHOTS = path.join(PROMO, 'capture/screenshots');
const ASSETS = path.join(PROMO, 'capture/assets');
const RAW = path.join(ASSETS, '.raw');
const VIEWPORT = { width: 1920, height: 1080 };
const BEATS = (process.env.BEATS || 'focus,console,together,safety').split(',');
const ROOM = 'vue-workshop';

for (const d of [SHOTS, ASSETS, RAW]) fs.mkdirSync(d, { recursive: true });

const BASE_CODE = `<script setup>
import { ref, computed } from 'vue'

const title = ref('Vue Workshop')
const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
  console.log('count is now', count.value)
}
</script>

<template>
  <main class="card">
    <h1>{{ title }}</h1>
    <button @click="increment">Clicked {{ count }} times</button>
    <p>Doubled: {{ doubled }}</p>
  </main>
</template>

<style>
.card {
  font-family: system-ui, sans-serif;
  text-align: center;
  padding: 4rem 2rem;
}
h1 {
  color: #42b883;
  font-size: 3.5rem;
  margin-bottom: 2rem;
}
button {
  font-size: 1.4rem;
  padding: 0.8rem 1.8rem;
  border: 0;
  border-radius: 999px;
  background: #42b883;
  color: #0d1117;
  font-weight: 600;
  cursor: pointer;
}
p {
  color: #9ca3af;
  font-size: 1.4rem;
}
</style>
`;

// The together beat uses a longer file so the scroll sync has room to show.
const TOGETHER_CODE = BASE_CODE.replace('</style>', `button:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}
button:active {
  transform: translateY(0);
}
button:focus-visible {
  outline: 3px solid #42b883;
  outline-offset: 4px;
}
.card {
  max-width: 40rem;
  margin: 0 auto;
}
@media (max-width: 600px) {
  h1 {
    font-size: 2.2rem;
  }
  button {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>`);

// ---------------------------------------------------------------- helpers

const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('[capture]', ...a);

async function newSession(browser, { name, role = 'no', offline = false, record = true, theme = 'dark' }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: theme,
    permissions: ['clipboard-read', 'clipboard-write'],
    ...(record ? { recordVideo: { dir: path.join(RAW, name), size: VIEWPORT } } : {}),
  });
  if (offline) {
    // Make the workshop status check fail so the app stays in solo mode.
    await ctx.route('http://127.0.0.1:1999/**', r => r.abort());
  }
  await ctx.addInitScript(({ role, theme }) => {
    if (window.top !== window) return; // skip the preview iframe (same origin)
    sessionStorage.setItem('isInstructor', role);
    if (!sessionStorage.getItem('yv-capture-init')) {
      sessionStorage.setItem('yv-capture-init', '1');
      localStorage.setItem('yehyecoa-vue-theme', theme);
      localStorage.setItem('yehyecoa-vue-layout', 'horizontal');
      localStorage.setItem('yehyecoa-vue-show-output', 'true');
      localStorage.setItem('yehyecoa-vue-show-console', 'true');
      localStorage.setItem('yehyecoa-vue-output-layout', 'vertical');
      localStorage.setItem('yehyecoa-vue-layout-reverse', 'false');
    }
    // Hide the dev-only Vue DevTools floating anchor (not part of the product UI).
    const hide = () => {
      const s = document.createElement('style');
      s.textContent = '#__vue-devtools-container__{display:none!important}';
      document.head.appendChild(s);
    };
    if (document.head) hide();
    else document.addEventListener('DOMContentLoaded', hide);
  }, { role, theme });
  const page = await ctx.newPage();
  page.on('load', () => log(`[${name}] page load`));
  const t0 = Date.now();
  const marks = {};
  return { ctx, page, name, t0, marks, mark: k => (marks[k] = (Date.now() - t0) / 1000) };
}

async function boot(s, query = '') {
  const { page } = s;
  await page.goto(`${BASE}/${query}`);
  await page.locator('.monaco-editor').first().waitFor();
  await sleep(1500);
  // Dismiss the standalone-mode warning toast (no /events SSE endpoint in dev) by clicking it.
  const warn = page.getByText('No events endpoint available');
  if (await warn.isVisible().catch(() => false)) await warn.click();
}

/** Dismiss visible toasts the way a user would (the app dismisses a toast on click). */
async function waitToastsGone(page, timeout = 8000) {
  const toasts = page.locator('div.fixed.top-0 .rounded-lg.pointer-events-auto');
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const n = await toasts.count();
    if (!n) return;
    await toasts.first().click({ timeout: 1000 }).catch(() => {});
    await sleep(350);
  }
  log('WARN: toasts still visible');
}

async function setCode(page, code) {
  const ta = page.locator('.monaco-editor textarea').first();
  await ta.focus();
  await page.evaluate(c => navigator.clipboard.writeText(c), code);
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('ControlOrMeta+V');
  await sleep(300);
  await page.keyboard.press('ControlOrMeta+ArrowUp'); // caret to top
  await sleep(1200);
}

/** Put the caret at end of 1-based `line`. */
async function gotoLineEnd(page, line) {
  await page.locator('.monaco-editor textarea').first().focus();
  await page.keyboard.press('ControlOrMeta+ArrowUp');
  for (let i = 1; i < line; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ControlOrMeta+ArrowRight');
}

/** Select the word ending `back` chars before the end of `line`. */
async function selectWordNearEnd(page, line, back) {
  await gotoLineEnd(page, line);
  for (let i = 0; i < back; i++) await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Alt+Shift+ArrowLeft');
}

/** Select whole lines `from`..`to` (1-based) from the keyboard. */
async function selectLines(page, from, to) {
  await page.locator('.monaco-editor textarea').first().focus();
  await page.keyboard.press('ControlOrMeta+ArrowUp');
  for (let i = 1; i < from; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Home');
  for (let i = from; i <= to; i++) { await page.keyboard.press('Shift+ArrowDown'); await sleep(120); }
}

/** Smooth wheel scroll over the editor; positive `dy` scrolls down. */
async function wheelEditor(page, dy, steps = 12) {
  const box = await page.locator('.monaco-editor').first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await sleep(40); }
}

/** Wait until the footer shows the joined workshop room (outside the toast layer). */
const waitConnected = page => page.waitForFunction(r => [...document.querySelectorAll('.repl-container div')]
  .some(d => d.textContent.trim() === r && !d.closest('.fixed') && !d.children.length), ROOM, { timeout: 15000 });

const typeSlow = (page, text, delay = 90) => page.keyboard.type(text, { delay });

const shot = (page, file, opts = {}) => page.screenshot({ path: path.join(SHOTS, file), ...opts });
const crop = (locator, file) => locator.screenshot({ path: path.join(ASSETS, file) });

async function cropPad(page, locator, file, pad = 12) {
  const b = await locator.boundingBox();
  await page.screenshot({ path: path.join(ASSETS, file), clip: { x: b.x - pad, y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 } });
}

const preview = page => page.frameLocator('.iframe-container iframe');

/** Close context, then trim + transcode its video to mp4. */
async function finish(s, clips) {
  const video = s.page.video();
  await s.ctx.close();
  if (!video || !clips?.length) return;
  const src = await video.path();
  for (const { out, from, to } of clips) {
    const start = Math.max(0, s.marks[from] - 0.4);
    const dur = s.marks[to] + 0.6 - start;
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-ss', start.toFixed(2), '-i', src, '-t', dur.toFixed(2),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
      '-r', '30', '-an', '-movflags', '+faststart', path.join(ASSETS, out),
    ]);
    log('video', out, `${dur.toFixed(1)}s`);
  }
}

// ---------------------------------------------------------------- beats

async function beatFocus(browser) {
  const s = await newSession(browser, { name: 'focus', offline: true });
  const { page } = s;
  await boot(s);
  await setCode(page, BASE_CODE);
  await waitToastsGone(page);
  await page.mouse.move(1900, 1070);
  await shot(page, 'focus-hero.png');
  await shot(page, 'focus-default-layout.png');
  await crop(page.locator('.split-pane > .left'), 'focus-editor-crop.png');
  await crop(page.locator('.iframe-container'), 'focus-preview-crop.png');

  // Live edit: retitle the app, the preview re-renders as you type.
  await gotoLineEnd(page, 4);
  await sleep(300);
  s.mark('editStart');
  await sleep(800);
  await selectWordNearEnd(page, 4, 2); // selects "Workshop" in ref('Vue Workshop')
  await sleep(700);
  await typeSlow(page, 'Playground', 110);
  await sleep(1800);
  s.mark('editEnd');
  await shot(page, 'focus-live-edit-after.png');
  await finish(s, [{ out: 'focus-live-edit.mp4', from: 'editStart', to: 'editEnd' }]);
}

async function beatConsole(browser) {
  const s = await newSession(browser, { name: 'console', offline: true });
  const { page } = s;
  await boot(s);
  await setCode(page, BASE_CODE);
  await waitToastsGone(page);
  await page.mouse.move(1900, 1070);

  s.mark('logStart');
  await sleep(800);
  const btn = preview(page).locator('button');
  for (let i = 0; i < 3; i++) {
    await btn.click();
    await sleep(900);
  }
  await sleep(800);
  s.mark('logEnd');
  await page.mouse.move(1900, 1070);
  await shot(page, 'console-log-output.png');
  await crop(page.locator('.console-wrapper'), 'console-panel-crop.png');

  // Layout menu
  await sleep(500);
  s.mark('layoutStart');
  await sleep(500);
  await page.locator('button[aria-haspopup], nav button').filter({ has: page.locator('.i-mynaui\\:layout, .i-mynaui\\:layout-solid') }).first().click();
  await sleep(900);
  await shot(page, 'console-layout-menu-open.png');
  const menu = page.locator('[role="menu"]');
  await crop(menu, 'console-layout-menu-crop.png');
  const menuBtn = i => menu.locator('button.sc-toolbar-btn').nth(i);

  // 1: vertical (stacked) layout
  await menuBtn(1).click();
  await sleep(1400);
  await shot(page, 'console-layout-vertical.png');
  // back to horizontal, then output split side-by-side (preview | console)
  await menuBtn(1).click();
  await sleep(1200);
  await menuBtn(4).click();
  await sleep(1400);
  await shot(page, 'console-layout-output-horizontal.png');
  // reverse (editor on the right)
  await menuBtn(2).click();
  await sleep(2500);
  await shot(page, 'console-layout-reversed.png');
  // restore defaults
  await menuBtn(2).click();
  await sleep(600);
  await menuBtn(4).click();
  await sleep(1200);
  s.mark('layoutEnd');
  await finish(s, [
    { out: 'console-log-output.mp4', from: 'logStart', to: 'logEnd' },
    { out: 'console-layout-switch.mp4', from: 'layoutStart', to: 'layoutEnd' },
  ]);
}

async function beatTogether(browser) {
  // Student first so the instructor's full sync on connect reaches them.
  const st = await newSession(browser, { name: 'together-student', role: 'no' });
  await boot(st, `?room=${ROOM}`);
  await waitConnected(st.page);
  // A second student in light mode, to show both themes in the same room.
  const st2 = await newSession(browser, { name: 'together-student-light', role: 'no', theme: 'light' });
  await boot(st2, `?room=${ROOM}`);
  await waitConnected(st2.page);

  const ins = await newSession(browser, { name: 'together-instructor', role: 'yes' });
  await boot(ins, `?room=${ROOM}`);
  await waitConnected(ins.page);
  await setCode(ins.page, TOGETHER_CODE);
  await sleep(1500);
  await Promise.all([waitToastsGone(st.page), waitToastsGone(st2.page), waitToastsGone(ins.page)]);
  for (const s of [st, st2, ins]) await s.page.mouse.move(1900, 1070);
  await sleep(500);

  const synced = await st.page.locator('.monaco-editor').first().innerText();
  if (!synced.replace(/\s+/g, ' ').includes('Vue Workshop')) throw new Error('Student did not receive instructor code');
  const synced2 = await st2.page.locator('.monaco-editor').first().innerText();
  if (!synced2.replace(/\s+/g, ' ').includes('Vue Workshop')) throw new Error('Light student did not receive instructor code');

  await shot(ins.page, 'together-instructor-connected.png');
  await shot(st.page, 'together-student-connected.png');
  await shot(st2.page, 'together-student-light-connected.png');
  await cropPad(ins.page, ins.page.locator('.instructor-status').locator('xpath=..'), 'together-instructor-status-crop.png');
  await cropPad(st.page, st.page.locator('.instructor-status').locator('xpath=..'), 'together-student-status-crop.png');

  // Broadcast: instructor edits, student editor + preview follow live.
  await gotoLineEnd(ins.page, 4);
  await sleep(300);
  ins.mark('syncStart'); st.mark('syncStart'); st2.mark('syncStart');
  await sleep(900);
  await selectWordNearEnd(ins.page, 4, 2);
  await sleep(700);
  await typeSlow(ins.page, 'Class of 2026', 110);
  await sleep(900);
  await selectWordNearEnd(ins.page, 6, 1); // the "2" in count.value * 2
  await sleep(500);
  await typeSlow(ins.page, '10', 150);
  await sleep(1500);
  // Highlight sync: the instructor selects a block, students see it painted.
  await selectLines(ins.page, 8, 11);
  await sleep(2200);
  // Scroll sync: scroll down to the styles, highlight a rule, scroll back.
  await wheelEditor(ins.page, 760, 20);
  await sleep(1400);
  await selectLines(ins.page, 62, 69); // the @media (max-width) block
  await sleep(2400);
  await wheelEditor(ins.page, -760, 20);
  await sleep(1500);
  ins.mark('syncEnd'); st.mark('syncEnd'); st2.mark('syncEnd');

  await shot(ins.page, 'together-instructor-broadcast.png');
  await shot(st.page, 'together-student-sync.png');
  await shot(st2.page, 'together-student-light-sync.png');
  await crop(st.page.locator('.split-pane > .left'), 'together-student-editor-crop.png');

  // Side-by-side composite still of both windows after the sync.
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', path.join(SHOTS, 'together-instructor-broadcast.png'),
    '-i', path.join(SHOTS, 'together-student-sync.png'),
    '-filter_complex', '[0:v]scale=1920:-1[a];[1:v]scale=1920:-1[b];[a][b]hstack=inputs=2',
    path.join(SHOTS, 'together-side-by-side.png'),
  ]);

  await finish(ins, [{ out: 'together-instructor-broadcast.mp4', from: 'syncStart', to: 'syncEnd' }]);
  await finish(st, [{ out: 'together-student-sync.mp4', from: 'syncStart', to: 'syncEnd' }]);
  await finish(st2, [{ out: 'together-student-light-sync.mp4', from: 'syncStart', to: 'syncEnd' }]);
}

async function beatSafety(browser) {
  const s = await newSession(browser, { name: 'safety', offline: true });
  const { page } = s;
  await boot(s);
  await setCode(page, BASE_CODE);
  await waitToastsGone(page);
  const saveBtn = page.locator('nav button').filter({ has: page.locator('[class*="i-mynaui:save"]') }).first();

  // Snapshot 1: base code
  await saveBtn.click();
  await sleep(1200);
  // Snapshot 2: new title
  await selectWordNearEnd(page, 4, 2);
  await typeSlow(page, 'Playground', 20);
  await sleep(800);
  await saveBtn.click();
  await sleep(1000);
  // Snapshot 3: triple instead of double
  await selectWordNearEnd(page, 6, 1);
  await typeSlow(page, '3', 20);
  await sleep(800);
  await page.locator('.monaco-editor textarea').first().focus();
  await page.keyboard.press('ControlOrMeta+S'); // editor save keybinding
  await sleep(500);
  await page.mouse.move(1900, 1070);
  await shot(page, 'safety-snapshot-saved-toast.png');
  await waitToastsGone(page);
  // Snapshot 4: rename
  await selectWordNearEnd(page, 4, 2);
  await typeSlow(page, 'Lab', 20);
  await sleep(800);
  await saveBtn.click();
  await sleep(600);
  await waitToastsGone(page);
  await page.mouse.move(1900, 1070);
  await sleep(500);

  s.mark('historyStart');
  await sleep(600);
  await page.locator('nav button').filter({ has: page.locator('[class*="i-mynaui:clock-hexagon"]') }).first().click();
  await sleep(1500);
  await page.mouse.move(1900, 1070);
  await shot(page, 'safety-history-drawer.png');
  const drawer = page.locator('.sidebar-drawer');
  await crop(drawer, 'safety-history-drawer-crop.png');

  // Diff against the oldest snapshot (last item in the list).
  const items = drawer.locator('li');
  const oldest = items.last();
  await oldest.hover();
  await sleep(600);
  await oldest.getByText(/\d+ files?/).hover();
  await sleep(1800);
  await shot(page, 'safety-diff-view.png');
  const diff = page.locator('.v-popper--theme-diff-card .v-popper__inner').first();
  if (await diff.isVisible().catch(() => false)) await crop(diff, 'safety-diff-view-crop.png');
  else log('WARN: diff popper not visible');

  // Close the diff popper, then restore the oldest snapshot.
  // (floating-vue only hides it on a real hover-out of the trigger.)
  await oldest.getByText(/\d+ files?/).hover();
  await sleep(300);
  await page.mouse.move(1000, 900, { steps: 10 });
  await sleep(1200);
  await oldest.getByRole('button', { name: /Restore/ }).hover();
  await sleep(700);
  await oldest.getByRole('button', { name: /Restore/ }).click();
  await sleep(2000);
  await page.mouse.move(1500, 600);
  await sleep(800);
  s.mark('historyEnd');
  await shot(page, 'safety-restored.png');
  await finish(s, [{ out: 'safety-history-restore.mp4', from: 'historyStart', to: 'historyEnd' }]);
}

// ---------------------------------------------------------------- main

const browser = await chromium.launch();
try {
  if (BEATS.includes('focus')) { log('beat: focus'); await beatFocus(browser); }
  if (BEATS.includes('console')) { log('beat: console'); await beatConsole(browser); }
  if (BEATS.includes('together')) { log('beat: together'); await beatTogether(browser); }
  if (BEATS.includes('safety')) { log('beat: safety'); await beatSafety(browser); }
}
finally {
  await browser.close();
  fs.rmSync(RAW, { recursive: true, force: true });
}
log('done');
