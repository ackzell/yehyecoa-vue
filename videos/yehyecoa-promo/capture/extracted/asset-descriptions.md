# Asset descriptions — yehyecoa-vue UI capture

All material is real UI from the running dev app (Vite :5173 + PartyKit :1999), captured with Playwright by `scripts/capture-app.mjs`. Dark theme throughout. Stills are 1920x1080 CSS px at deviceScaleFactor 2 (3840x2160 files). Videos are H.264 / yuv420p, 1920x1080, 30 fps, no audio. Headless capture: **no mouse pointer is visible** in any still or video.

Default layout reference (in 1920x1080 frame coordinates): header bar y 0–50 (save, history, layout, theme icons at top-right x≈1770–1890; online status centered at x≈960); editor pane x 0–960 (file tab `App.vue`); preview pane x 960–1920, y 88–564 (`PREVIEW` tab); console panel x 960–1920, y 564–1040; footer y 1040–1080 (room badge bottom-left, `yehyecoa-vue v0.3.1-beta` bottom-right). The demo SFC renders a green "Vue Workshop" heading, a green pill button "Clicked N times" and "Doubled: N", centered in the preview at x≈1440. In 3840x2160 files, double these numbers.

## Beat 1 — focus

- `capture/screenshots/focus-hero.png` — 3840x2160. Clean full UI in solo mode: editor on the left with the 47-line counter SFC, preview on the right top showing "Vue Workshop" / "Clicked 0 times" / "Doubled: 0", empty Console panel below. Header center is empty (no workshop). The editor/preview seam sits exactly at the horizontal center.
- `capture/screenshots/focus-default-layout.png` — 3840x2160. Identical frame to the hero (default horizontal layout, preview above console).
- `capture/screenshots/focus-live-edit-after.png` — 3840x2160. Same layout after the live edit: line 4 reads `ref('Vue Playground')` with the caret there, and the preview heading now says "Vue Playground".
- `capture/assets/focus-live-edit.mp4` — 1920x1080, 5.5 s. Caret on line 4; the word "Workshop" gets selected and "Playground" is typed character by character; the preview heading (center-right, x≈1440 y≈240) re-renders live as the letters are typed, ending on "Vue Playground".
- `capture/assets/focus-editor-crop.png` — 1920x1980. Element crop of the whole editor pane: `App.vue` tab + `+` on top, full SFC code (script, template, style with color swatches) with line numbers 1–48.
- `capture/assets/focus-preview-crop.png` — 1920x950. Element crop of the preview iframe only: centered "Vue Workshop" green heading, green pill button "Clicked 0 times", gray "Doubled: 0" on dark gray.

## Beat 2 — console + layouts

- `capture/screenshots/console-log-output.png` — 3840x2160. Default layout after clicking the preview button three times: preview shows "Clicked 3 times" / "Doubled: 6"; Console panel (right, lower half) lists `count is now 1`, `count is now 2`, `count is now 3` (numbers in purple) at its top-left.
- `capture/assets/console-log-output.mp4` — 1920x1080, 5.4 s. The preview button is clicked three times (about 1 s apart; no visible cursor); the counter increments and a new `count is now N` row appears in the Console each time.
- `capture/assets/console-panel-crop.png` — 1920x952. Element crop of the console panel: "Console" title with `clear` button at top-right, three log rows at the top, empty dark area below.
- `capture/screenshots/console-layout-menu-open.png` — 3840x2160. Same state as the log still with the layout popover open: a narrow vertical icon strip hanging under the layout icon at the far top-right (x≈1850, y≈55–240) with five icons (preview, layout direction, reverse, console, output split).
- `capture/assets/console-layout-menu-crop.png` — 40x346. Very narrow element crop of just the five-icon layout menu column (icons only, no labels).
- `capture/screenshots/console-layout-vertical.png` — 3840x2160. Vertical layout: editor across the top half, preview (heading visible, button cut off at the split) and console with the three logs stacked across the bottom half. Layout menu still open at top-right.
- `capture/screenshots/console-layout-output-horizontal.png` — 3840x2160. Horizontal layout with the output split side by side: editor left half, preview in the third quarter (heading, "Clicked 3 times", "Doubled: 6"), console with logs in the right quarter. Menu open at top-right, partly overlapping the console's `clear` button.
- `capture/screenshots/console-layout-reversed.png` — 3840x2160. Reversed layout: preview (left quarter, "Clicked 0 times" because the preview re-mounted) and an empty console (second quarter) on the left half, editor on the right half. Menu open at top-right.
- `capture/assets/console-layout-switch.mp4` — 1920x1080, 12.0 s. Opens the layout menu (top-right) and cycles: vertical stack → back to horizontal → preview|console side by side → reversed (editor moves right; preview counter resets) → back to the default layout. Panes animate/snap between layouts; the menu stays open at top-right throughout.

## Beat 3 — together (instructor + 2 students, one light mode, room `vue-workshop`; 75-line file)

- `capture/screenshots/together-instructor-connected.png` — 3840x2160. Instructor window joined to the workshop: a pink broadcast icon at the header center (x≈960, "Instructor mode"), footer bottom-left shows green `vue-workshop` room badge; editor + preview show the counter app ("Vue Workshop").
- `capture/screenshots/together-student-connected.png` — 3840x2160. Student window in the same room: header center shows a sky-blue broadcast icon ("Instructor is online") followed by a pill "• Following instructor" (green pulsing dot); same code as the instructor (received via sync); footer shows `vue-workshop`.
- `capture/assets/together-instructor-status-crop.png` — 84x84. Tight crop of the instructor's pink broadcast icon.
- `capture/assets/together-student-status-crop.png` — 374x96. Crop of the student's status cluster: sky-blue broadcast icon + "Following instructor" pill.
- `capture/screenshots/together-instructor-broadcast.png` — 3840x2160. Instructor after editing: line 4 `ref('Vue Class of 2026')`, line 6 `count.value * 10`; preview heading "Vue Class of 2026".
- `capture/screenshots/together-student-sync.png` — 3840x2160. Student after the broadcast: identical code and "Vue Class of 2026" preview, plus the yellow instructor ghost cursor right after `10` on line 6; "Following instructor" pill at header center.
- `capture/screenshots/together-side-by-side.png` — 3840x1080. The two previous stills scaled to 1920x1080 each and placed side by side (instructor left, student right) — a composite built with ffmpeg, not a single app window.
- `capture/assets/together-student-editor-crop.png` — 1920x1980. Element crop of the student's editor pane after sync, including the yellow ghost cursor on line 6.
- `capture/assets/together-instructor-broadcast.mp4` — 1920x1080, 19.0 s. Instructor window: "Workshop" on line 4 replaced with "Class of 2026"; the `2` on line 6 becomes `10`; then lines 8–11 (increment()) are selected and held; the editor scrolls down to the styles and lines 62–69 (@media max-width block) are selected and held; then it scrolls back up (the students' debounced scroll-back may land after the clip ends).
- `capture/assets/together-student-sync.mp4` — 1920x1080, 19.0 s. Dark-mode student, same interval: edits arrive live, the instructor's selections are painted amber with the ghost cursor, and scroll follows.
- `capture/assets/together-student-light-sync.mp4` — 1920x1080, 19.0 s. Light-mode student, same interval: instructor selections are painted pink; the edits and scroll follow live.
- `capture/screenshots/together-student-light-sync.png` — 3840x2160. Light-mode student after the sync.

## Beat 4 — safety net (history / snapshots)

- `capture/screenshots/safety-snapshot-saved-toast.png` — 3840x2160. Two green "Snapshot saved" toasts stacked at the top center (x≈1000, y≈75–125) after manual saves; editor line 6 shows `* 3`, preview "Vue Playground".
- `capture/screenshots/safety-history-drawer.png` — 3840x2160. History drawer open on the right (x≈1570–1920): "Your sessions (1)" selector, then four orange "manual" snapshots (newest first: "Manually saved (no changes)", "Manual save from editor", "Manually saved", "Manually saved"), each with Restore / Delete buttons and relative times. Editor and preview are compressed to the left; preview shows "Vue Lab".
- `capture/assets/safety-history-drawer-crop.png` — 700x1980. Element crop of the drawer panel alone (sessions selector + snapshot timeline).
- `capture/screenshots/safety-diff-view.png` — 3840x2160. Drawer open with the diff popover of the oldest snapshot showing below it (x≈935–1995, y≈520–860): side-by-side "Current" vs "Snapshot", red line 4 `'Vue Lab'` vs green `'Vue Workshop'`, red line 6 `* 3` vs green `* 2`, header "+2 additions −2 deletions".
- `capture/assets/safety-diff-view-crop.png` — 2048x672. Element crop of just the diff card (Current / Snapshot columns, highlighted changed lines 4 and 6).
- `capture/screenshots/safety-restored.png` — 3840x2160. After clicking Restore on the oldest snapshot: editor back to `'Vue Workshop'` / `* 2`, preview "Vue Workshop"; drawer now has a new blue "auto — Before a snapshot was restored · now" entry at the top, and the oldest entry at the bottom now reads "(no changes)" because it matches the restored code. No restore toast exists in the app.
- `capture/assets/safety-history-restore.mp4` — 1920x1080, 11.6 s. Starts on the editor with `'Vue Lab'` / `* 3` and preview "Vue Lab"; the history drawer slides in from the right; snapshots animate in; the diff popover opens under the oldest snapshot (~3–6 s) and closes; Restore is hovered and clicked; code and preview revert to "Vue Workshop" and a blue "auto" snapshot appears at the top of the drawer.

## Beat 6 — home (amoxtli-vue)

- `capture/assets/home-amoxtli-integration.png` — 2908x1714. User-supplied (repo `docs/amoxtli-integration.png`): yehyecoa embedded as the preview pane of an amoxtli-vue (TutorialKit) lesson, lesson text on the left, the playground on the right.
