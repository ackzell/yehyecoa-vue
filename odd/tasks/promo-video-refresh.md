# Feature: promo-video-refresh

Locator: `odd/tasks/promo-video-refresh.md` · Engram mirror: `odd/promo-video-refresh/tasks`
Branch: `feat/promo-video-refresh` · Project: `videos/yehyecoa-promo`

## Objective

Update the HyperFrames promo (90s, 16:9) so it reflects the current app.

## Problem / why

The promo was built on 2026-10-22 (d465a96). Since then the REPL moved to a dock
layout (7e502be, c9ddc20): the header layout menu that Frame 3 records is gone,
the UI got polish (splitter handles, console header, buttons), and an in-app
changelog opens from the footer version (5db4903).

## Scope (user-confirmed 2026-10-26)

- Re-capture every app beat against the current UI (refreshed polish).
- Frame 3: console + drag-and-dock panels (replaces retired layout menu).
- New ~4s changelog beat (footer version → changelog sheet) before the close;
  Frame 5 trimmed 20s → ~16s so total stays 90s.

## Constraints

- Keep BRIEF.md design system, spelling "yehyecoa", wordmark "yehyecoa-vue".
- Capture via Playwright (`scripts/capture-app.mjs`); hyperframes capture blocks localhost.
- Usage budget is limited (weekly 26% left on 2026-10-26): one draft render, one final.

## Tasks

- [x] T0 Bump HyperFrames pin 0.8.184 → 0.8.203; `check` ok. (inline)
- [x] T1 Update capture script: dock layout-tree defaults, drag-and-dock segment, changelog segment; re-run captures. (delegated: writer) — 55d8ccb
- [x] T2 Update STORYBOARD.md, Frame 3, Frame 5 timing, new changelog frame, index.html retime. (delegated: same writer) — 2f66424
- [ ] T3 User review in Studio preview, then final render. (inline)

## Acceptance criteria

- No beat shows the retired layout menu; all captures match current UI.
- Changelog beat present; total duration 90s; `npx hyperframes check` ok.

## Progress / evidence

- T0: pin bumped, check ok (report 8a23d206).
- T1/T2: `hyperframes check` 0 errors; `timeline` 90s; no console-layout-switch.mp4 reference.
  Frame starts 0, 9, 23, 34, 54, 70, 80, 84. boards/sketches keep old names (historical, unrendered).
- Review points: Frame 5 cursor at ~66.9s; preview reload after dock drop; 6b 4s pacing.

## Next step

T3: user reviews preview, then one final render.
