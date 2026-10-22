---
format: 1920x1080
duration: 90s
message: "yehyecoa is where you try, experiment, and rehearse Vue together"
arc: Feature-Benefit Cascade — name hook → promise → focus → together → safety net → home → wordmark
audience: Vue learners and workshop instructors
mode: collaborative
music: warm curious upbeat minimal electronic, light percussion, steady build, no vocals
---

## Video direction

- palette system (from `frame.md`, broadside): frames 1–5 sit on the dark register — ink-black `#0b0c07` ground, cream `#f5f5f5` text, muted `#a7a4a3` secondary, `#282627` 1px hairlines around every capture slot. Frames 6–7 sit on the orange register exactly as the confirmed sketch poses them — magenta `#e4007c` ground, ink-black text, ink 55% kickers. Magenta is the ONLY accent: one accent word per headline, marker highlights, cursor rings, keyword glows, the student-window hairlines in frame 4. `amber` from `frame.md` is not used. Captured UI keeps its own colors (Vue green, amber/pink painted selections, red/green diff, blue "auto" entry) — never recolored, never tinted.
- type (by role): display / h1 / h2 in Work Sans lowercase for headlines and the wordmark; label ramp (Space Mono, uppercase, 0.14em) for kickers and window tags; Space Mono for the shared caret and the pronunciation line; lead / h3 for secondary lines and bullets (mono magenta `/` marker).
- motion grammar + reveal model: long-tail `power3` settles everywhere; smooth over bouncy. There is NO voiceover, so the cue track is (a) the on-screen text beats and (b) the action inside each captured clip — each piece reveals on its own beat and nothing waits on screen before its cue; never front-load. One shared caret grammar (`context-sensitive-cursor`) types the name in frame 1, the kicker in frame 2 and the wordmark in frame 7 — the video opens and closes on the same typing hand.
- camera grammar: every camera move is MOTIVATED by a clip action (a click, a selection, a drawer opening, a diff appearing) — a fast push that lands and HOLDS, then one decelerating pull back. No slow drift, no back-half creeping push, no breathing. Camera moves run inside the capture slot's clipped window (the surface's content zooms/pans; the headline column and the confirmed layout around it stay put) via `coordinate-target-zoom` / `viewport-change`. Every push lands its target at the centre of the slot.
- clip timing: all clips are framework-owned muted `<video>` clips mounted at the frame times and in-points stated per frame. Action times quoted in Scenes come from the clips (approximate, ±0.3s) — the worker confirms them on the real clip and retimes the camera/cursor beats to the actual action, never the reverse. When a clip ends before its frame, its last frame holds to the cut.
- center-safe for the later 9:16 reframe: key text and each camera push's focal region stay out of the outer ~20% of width at the moment they are read; side-by-side layouts (frames 1–5) will restack at reframe, so no read may depend on two elements sitting left/right at the frame edges.
- rhythm / held-frame allocation: frame 1 is a measured reveal (calm open); frames 2–5 are the busy demo run; held reads are deliberate at the tail of frame 2 (12.4–14.0s), frame 4 (18.2–20.0s), frame 5 (17.6–20.0s), the whole post-lock half of frame 6 (7.2–10.0s, the breather before the close) and frame 7 (3.4–5.4s). During holds: stillness; at most a single keyword glow — no jitter loops needed.
- caption band: no voiceover and no captions in this video. The confirmed sketch poses that reach into the bottom band (frame 4's foot line, frame 6's bottom-anchored screenshot) stand as confirmed.
- handoffs: none. Every frame boundary is a clean harness transition (`transition_in`); no element visibly continues across a cut (frame 1's typed name, frame 3's/5's surfaces and frame 6's screenshot all change position, scale or content at their seams), so no `handoff_out` / `handoff_in` pairs are written.
- registry blocks to pre-install at Step 5: `cursor-zoom-follow` (frame 3), `oversized-cursor` (frame 5). Both found with `npx hyperframes catalog --query "mouse cursor pointer click" --json`; restyle both to the palette (magenta ring/press, cream or ink arrow), no other looks are named.
- negative list: gradients of any kind (incl. the blueprint's gradient pills), floating bokeh, purple-blue "AI" glows, device mockups or browser chrome around the captures, a real/system cursor (drawn cursors only in frames 3 and 5), a second accent color (no yellow/amber highlighters — magenta only), recoloring captured UI, bouncy / `back.out` / elastic entrances (the frame 4 badge is the lone overshoot), lazy breathing, slow back-half pans/pushes, infinite loops, the **slideshow** failure (everything up by 25% then frozen) and the **screensaver** failure (many elements floating independently). Spelling: the product is "yehyecoa", the closing wordmark "yehyecoa-vue" — never "yeyecoa".

## Frame 1 — Hook: the word

- scene: "yehyecoa" types in Space Mono on ink-black; pronunciation, then the meaning builds word by word
- voiceover: ""
- on_screen: "yehyecoa" · "yeh-yeh-CO-ah · Nahuatl" · "to try." · "to experiment." · "to rehearse."
- duration: 9s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook-word.html
- type: hook
- persuasion: Curiosity gap (an unfamiliar word whose meaning is the promise)
- beat: curiosity → intrigue
- blueprint: typewriter-reveal (Adapt)
- focal: the typed word "yehyecoa" (type, no asset)
- roles: no asset_candidates — word block = hero · meaning stack = supporting · ink-black field = background
- sfx: typing
- asset_candidates:

narrativeRole: open cold on the name; its meaning IS the value claim, so the viewer learns the promise before seeing any UI.
keyMessage: this is a place to try, experiment, and rehearse.

Adapt: keep the signature — a live caret typing the line as a human would is the engine of the shot; change: no collapse-and-brand-pop (the typed word IS the brand), and the "modify in place" beat becomes the meaning stack stepping down its opacity ramp as each new verb arrives. Per the confirmed sketch the typed name renders in the display ramp in magenta; the caret and the pronunciation are Space Mono.
Scene 1 (0.0–0.6s): ink-black field, nothing but a blinking mono caret at the start of the name, left word block on the vertical centre line — asymmetric 55/45 composition, the empty right column waits. Caret blink → `context-sensitive-cursor`.
Scene 2 (0.6–2.4s): "yehyecoa" types character by character in magenta display type, caret trailing → `discrete-text-sequence` (+ `context-sensitive-cursor`). The word block is the clear #1 element (size 3:1 over everything that follows).
Scene 3 (2.4–3.4s): the kicker "NO. 01 · NAHUATL" types on above the word in the label ramp (magenta) → `discrete-text-sequence`; caret parks blinking after the name.
Scene 4 (3.4–4.6s): the caret drops a line and types the pronunciation "yeh-yeh-CO-ah" in muted mono → `discrete-text-sequence`; the caret blinks out at 4.6s — the typing hand is done.
Scene 5 (4.8–5.8s): "to try." whips up into the top of the right column at full cream → `waterfall-entry`, smooth settle.
Scene 6 (6.0–7.0s): "to experiment." arrives beneath it the same way while "to try." steps down to ~50% opacity → `waterfall-entry` + `discrete-text-sequence` (state step).
Scene 7 (7.2–8.0s): "to rehearse." lands last at full cream; the stack resolves to the confirmed ramp (try ~22%, experiment ~50%, rehearse 100%) → `waterfall-entry`.
Scene 8 (8.0–9.0s): held read — completely still; the harness zoom-through into frame 2 is the exit.

## Frame 2 — Promise: a playground minus the noise

- scene: kinetic statement "a Vue playground." → "minus the noise." then the real editor+preview pivots in and a live edit updates the preview
- voiceover: ""
- on_screen: "a Vue playground." · "no version pickers." · "no compiled output." · "just you and your code."
- duration: 14s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-promise-focus.html
- type: product_intro
- persuasion: Negative contrast (what's removed is the feature)
- beat: clarity + ease
- blueprint: video-text-pivot (Adapt)
- focal: assets/focus-live-edit.mp4
- roles: focus-live-edit.mp4 = focal (plays in the right slot from 7.4s) · focus-hero.png = supporting (the slot's first pose; frame-matched to the clip's first frame so the swap is invisible) · focus-editor-crop.png = supporting (optional crisp plate for the editor push, 7.6–9.0s only, removed before the selection starts)
- sfx: whoosh-short
- asset_candidates: assets/focus-live-edit.mp4 — "Workshop"→"Playground" typed, preview updates live; assets/focus-hero.png — full dark UI, editor left, preview right; assets/focus-editor-crop.png — editor close-up

narrativeRole: land the product and the "focused for learning" value by beat 2; the live edit is the proof.
keyMessage: yehyecoa strips the playground down to what learners need.

Adapt: keep the signature — the same-anchor weight-transfer (an exit paired with an entrance in one slot, so it reads as one event) and a product clip that never cuts away; change: order is text-first (statement → surface → live clip), the still hands its slot to the live clip in place instead of yielding to a stat, and no gradient pill (broadside forbids gradients). Layout throughout is the confirmed asymmetric 40/60: text column left, capture slot right.
Scene 1 (0.0–1.2s): only the kicker "A VUE PLAYGROUND" types on in the label ramp (magenta) with the shared caret → `discrete-text-sequence` (a thin magenta block caret leads the typing); the right slot is empty ink-black.
Scene 2 (1.2–2.6s): "minus the noise." assembles word by word in the h1 ramp, "noise." landing last in magenta at ~2.3s → `dynamic-content-sequencing`.
Scene 3 (2.6–3.8s): the product surface (focus-hero.png, hairline border) slides in from the right edge into its confirmed slot on a long-tail settle → `gsap-effects` (translate + opacity, `power3`). Three depth layers: ground · surface · headline.
Scene 4 (3.8–7.4s): the bullets arrive one per beat with their magenta `/` marker — "no version pickers" at 4.0s, "no compiled output" at 5.3s, "just you and your code" at 6.6s → `dynamic-content-sequencing`.
Scene 5 (7.4–9.0s): weight-transfer in place — the still hands off to focus-live-edit.mp4 at identical geometry (clip mounts at 7.4s from in-point 0.4s; frame time = clip time + 7.0s), no visible seam. The camera inside the slot pushes in on the editor's line 4 (`const title = ref('Vue Workshop')`, left half of the surface) and lands it centred at ~8.8s → `coordinate-target-zoom`.
Scene 6 (9.0–10.6s): camera holds tight while "Workshop" is selected (~clip 2.0s → 9.0s) and "Playground" types in character by character (~clip 2.5–3.5s → 9.5–10.5s). No camera motion — the typing is the motion.
Scene 7 (10.6–11.4s): as the preview heading re-renders to "Vue Playground" (~clip 3.8s → 10.8s) the camera pans right onto the preview heading and lands centred at ~11.2s → `coordinate-target-zoom` (re-target at the same scale: pan, fast in, hard land) — motivated by the change it follows.
Scene 8 (11.4–12.4s): a magenta marker highlight sweeps under "just you and your code" (a plain magenta underline bar scaling in from the left, scaleX 0→1, 0.5s power2.out); the camera makes one decelerating pull back out to the full surface, landing at 12.4s → `coordinate-target-zoom` (zoom-out).
Scene 9 (12.4–14.0s): held read — the clip ends at ~12.5s and its last frame ("Vue Playground") holds to the cut; everything still.

## Frame 3 — Focus: console + layouts

- scene: the console catches three "count is now N" logs as the preview is clicked; then the layout menu cycles panes
- voiceover: ""
- on_screen: "see every log." · "arrange it your way."
- duration: 11s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-console-layouts.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: control
- blueprint: device-surface-showcase (Adapt)
- registry: cursor-zoom-follow (component — drawn cursor + push toward each click + press/ring per click + ease back out; restyle ring to magenta, arrow cream)
- focal: assets/console-log-output.mp4 (driven by the `cursor-zoom-follow` block for 1.0–5.0s), then assets/console-layout-switch.mp4
- roles: console-log-output.mp4 = focal (left slot, 0.0–5.0s) · console-layout-switch.mp4 = focal (same slot, 5.0–11.0s) · console-panel-crop.png = supporting (crisp plate over the console rows during the tight hold 3.9–4.6s, identical geometry) · console-layout-menu-open.png = supporting (seam plate under the 4.6–5.2s cut — its menu-open state matches the layout clip at its in-point)
- sfx: none
- asset_candidates: assets/console-log-output.mp4 — three clicks, three log rows land in the console; assets/console-panel-crop.png — console panel close-up; assets/console-layout-switch.mp4 — cycles through all layouts; assets/console-layout-menu-open.png — layout menu open

narrativeRole: finish the "focus" argument — the essentials a learner needs are built in.
keyMessage: everything you need to learn, nothing you don't.

Adapt: keep the signature — one held surface whose screens advance through a real flow on its own face, presented by a camera push-in on a target region that then zooms back out to re-frame the whole surface (floating-window variant); change: no gradient backdrop or browser chrome — the surface is the confirmed hairline-bordered capture slot on ink-black (asymmetric 60/40: slot left, text right), and two clips play in sequence in the one slot. The clips have no pointer, so the drawn cursor comes from `cursor-zoom-follow`.
Scene 1 (0.0–1.0s): the surface establishes — console-log-output.mp4 (mounted at 0.0s from in-point 0.0s) slides in from the left edge into its slot on a long-tail settle → a GSAP translate + opacity tween; only the kicker "BUILT IN" types on in the right column → `discrete-text-sequence`.
Scene 2 (1.0–1.6s): the drawn cursor enters and the camera pushes in toward the preview's "Clicked N times" button, framing the button at top and the console rows below it in one tight centred shot (the output column, right half of the surface) → `cursor-zoom-follow` block (camera = `coordinate-target-zoom`).
Scene 3 (1.6–3.9s): three clicks synced to the clip (~1.5s, ~2.5s, ~3.5s — confirm on the clip): each click presses the button with a magenta ring → a small ring ripple at the click point (inside the block); each `count is now N` row lands in the console and flares once with a magenta keyword glow → a soft magenta glow on the key word (text-shadow tween). The headline assembles on the same beats — "see" on click 1, "every" on click 2, "log." (magenta) on click 3 → a staggered word-by-word reveal. This is the requested push-in on the console rows.
Scene 4 (3.9–4.6s): hold tight on the three rows — the read; the crisp console-panel crop sits over the clip at identical geometry for legibility. Still.
Scene 5 (4.6–5.2s): the cursor leaves and the camera eases back out to the full surface; at the pull's peak velocity the slot cuts to console-layout-switch.mp4 (mounted at 5.0s from in-point 2.8s; frame time = clip time + 2.2s) → `cut-catalog.md` cut-the-curve.
Scene 6 (5.2–5.9s): "arrange it your way." reveals word by word beneath the headline in muted h3 → a staggered word-by-word reveal; a single magenta keyword glow touches the layout-menu strip at the surface's top-right → a soft magenta glow on the key word (text-shadow tween).
Scene 7 (5.9–10.3s): camera locked wide; the panes rearrange on the surface's own face — vertical stack (~5.2s), back to horizontal (~7.1s), preview|console side by side (~8.6s), reversed with the editor on the right (~10.3s). The layout changes ARE the screen advances; no camera move, no extra copy.
Scene 8 (10.3–11.0s): the reversed layout holds; still read; the harness zoom-through into frame 4 is the exit.

## Frame 4 — Together: rehearse as a room

- scene: instructor window large on the left, two student windows stacked on the right (one dark mode, one light mode); the instructor edits, highlights code and scrolls; both students' editors follow live (ghost cursor, painted selection, synced scroll); "Following instructor" status glows
- voiceover: ""
- on_screen: "rehearse together." · "one instructor." · "the whole room, in sync."
- duration: 20s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/04-together.html
- type: feature_showcase
- persuasion: Feature-to-benefit translation (live sync → nobody falls behind)
- beat: belonging + confidence
- blueprint: comparison-split (Adapt)
- focal: assets/together-student-light-sync.mp4 (the push-in target) within the three-window room; assets/together-instructor-broadcast.mp4 is the cause
- roles: together-instructor-broadcast.mp4 = supporting/cause (left, 50cqw) · together-student-sync.mp4 = supporting (right column, top) · together-student-light-sync.mp4 = focal (right column, bottom; first push-in target) · together-student-status-crop.png = cutout (the inner-edge badge) · together-instructor-status-crop.png = supporting (pink broadcast icon beside the instructor tag)
- sfx: whoosh-short
- asset_candidates: assets/together-instructor-broadcast.mp4 — 19.0s, instructor types "Vue Class of 2026", `* 2`→`* 10`, highlights the increment() block, scrolls down to the styles and highlights the @media block, scrolls back; assets/together-student-sync.mp4 — same interval on the dark-mode student, edits arrive live with ghost cursor; assets/together-student-light-sync.mp4 — same interval on a light-mode student (shows both themes in one room); assets/together-student-status-crop.png — "Following instructor" status; assets/together-instructor-status-crop.png — broadcast icon

narrativeRole: the differentiator — the playground is built for workshops, not solo tinkering.
keyMessage: an instructor broadcasts, every student follows in real time, in whatever theme they like.

Adapt: keep the signature — the split-tilt entry (windows arrive from opposite wings with mirrored inward-facing tilts) and the inner-edge pill badge as the shot's lone overshoot; change: the weights are the confirmed unequal room (instructor 50cqw left, two students stacked 27cqw right), the tilt resolves to flat on landing so the UI is readable, and the 20s shot keeps developing with two camera pushes driven by the clips' selections. All three clips mount together at 0.8s from in-point 0.0s (frame time = clip time + 0.8s) so they stay in sync; they end at 19.8s and their last frames hold.
Scene 1 (0.0–1.2s): only the head — kicker "WORKSHOP MODE" then "rehearse together." word by word, "together." in magenta, upper-left → a staggered word-by-word reveal.
Scene 2 (0.8–2.2s): the instructor window enters from the left wing with a slight inward tilt and lands flat on a long-tail settle → `split-tilt-cards`; its tag "INSTRUCTOR · BROADCASTING" and the pink broadcast-icon crop appear above it. At 1.8s the foot slot reveals "one instructor." (h3 weight, bottom-left) → a staggered word-by-word reveal.
Scene 3 (2.2–3.6s): the two students enter from the right wing with the mirrored tilt — dark at 2.2s, light ~0.3s behind — and land flat in the confirmed stack with magenta hairlines → `split-tilt-cards`. "Class of 2026" is already arriving live in all three editors (~clip 1–3s).
Scene 4 (3.8–4.6s): the "Following instructor" status crop pops as a pill badge on the student column's inner (left) edge, overlapping it ~15% — the one overshoot → a small spring pop-in (back.out); its dot flares once → a soft magenta glow on the key word (text-shadow tween).
Scene 5 (4.6–8.4s): wide hold while the instructor's edits keep landing in both students (`* 2`→`* 10`, ~clip 4.5–6.0s). Camera still — the live edits are the motion.
Scene 6 (8.4–11.8s): as the instructor selects increment() (~clip 7.6–11s), the camera pushes in on the LIGHT-mode student's editor where that selection is painted pink, landing it centred by ~9.2s → `coordinate-target-zoom`; the instructor and dark-student windows rack soft and dim → a light blur + dim on the non-focal windows. Hold tight to 11.8s — the requested push-in on the painted selection.
Scene 7 (11.8–12.8s): as the instructor scrolls (~clip 11–12s), one decelerating pull back to the full room; focus racks back → `coordinate-target-zoom` (zoom-out) + a light blur + dim on the non-focal windows. At 12.4s the foot slot hard-cuts "one instructor." → "the whole room, in sync." with "in sync." in magenta → `discrete-text-sequence`.
Scene 8 (12.8–17.4s): as the @media block is selected (~clip 12–16.6s), the camera pushes in on the student column so both themes read together — amber painted selection in dark, pink in light — landing by ~13.6s → `coordinate-target-zoom`; the instructor window racks soft → a light blur + dim on the non-focal windows. Hold.
Scene 9 (17.4–18.2s): as the scroll-back begins, one decelerating pull back to the full room → `coordinate-target-zoom` (zoom-out).
Scene 10 (18.2–20.0s): held wide read; "in sync." flares once at 18.4s → a soft magenta glow on the key word (text-shadow tween); then still to the cut.

## Frame 5 — Safety net: every try is saved

- scene: snapshots stack in the history drawer, a diff opens (Current vs Snapshot), Restore brings the old code back and an "auto" snapshot appears
- voiceover: ""
- on_screen: "every try is saved." · "compare." · "restore." · "experiment fearlessly."
- duration: 20s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-safety-net.html
- type: benefit_highlight
- persuasion: Risk reversal (you can always go back)
- beat: relief + peace of mind
- blueprint: camera-journey (Adapt)
- registry: oversized-cursor (component — drawn arrow lands its tip on Restore, clicks, settles just below so the result stays visible, exits; restyle click ring magenta)
- focal: assets/safety-history-restore.mp4
- roles: safety-history-restore.mp4 = focal (right slot, 5.0–20.0s) · safety-snapshot-saved-toast.png = supporting (the slot's prologue plate, 0.4–5.0s) · safety-diff-view-crop.png = supporting (crisp plate over the diff popover during the tight hold 10.0–13.6s, identical geometry) · safety-history-drawer-crop.png = supporting (crisp plate over the drawer during the Restore approach 14.2–15.5s, identical geometry)
- sfx: none
- asset_candidates: assets/safety-history-restore.mp4 — drawer opens, diff, restore, auto snapshot appears; assets/safety-diff-view-crop.png — side-by-side diff card; assets/safety-history-drawer-crop.png — snapshot timeline; assets/safety-snapshot-saved-toast.png — "Snapshot saved" toasts

narrativeRole: pay off "to try / to experiment" — trying is safe because nothing is lost.
keyMessage: break things freely; history has your back.

Adapt: keep the signature — the camera is the storyteller over ONE world, a multi-leg journey (dive → hinge action → travel to the consequence → landing at rest) where the Restore click motivates the final leg (sub-shape A, action roundtrip); change: the world is the confirmed capture slot (asymmetric 40/60: text left, slot right) and every leg runs inside its clipped window, with a static prologue on the "Snapshot saved" still before the clip. safety-history-restore.mp4 mounts at 5.0s from in-point 0.0s (frame time = clip time + 5.0s).
Scene 1 (0.0–1.4s): kicker "HISTORY" then "every try is saved." word by word, "saved." in magenta at ~1.2s → a staggered word-by-word reveal; the prologue surface (safety-snapshot-saved-toast.png) slides in from the right into its slot from 0.4s → a GSAP translate + opacity tween.
Scene 2 (1.4–2.6s): LEG 1, dive — the camera pushes tight onto the two green "Snapshot saved" toasts at the top centre of the still, landing centred → `coordinate-target-zoom`; "saved." flares once in the headline as it lands → a soft magenta glow on the key word (text-shadow tween).
Scene 3 (2.6–4.6s): hold tight on the toasts — the read. Still.
Scene 4 (4.6–5.2s): pull back out to the full surface; at peak velocity the slot cuts to the clip (same app view, its own toast still showing) → `cut-catalog.md` cut-the-curve.
Scene 5 (5.2–7.4s): wide on the clip, editor at 'Vue Lab'; camera locked.
Scene 6 (7.4–8.8s): LEG 2, travel — as the history drawer slides in (~clip 2.4–3.0s → 7.4–8.0s) the camera pans right and settles on the drawer's snapshot timeline → `coordinate-target-zoom`.
Scene 7 (9.0–13.9s): LEG 3, dive — as the diff popover opens (~clip 4.3s → 9.3s) the camera dives tight onto it, Current vs Snapshot centred by ~9.8s → `coordinate-target-zoom`; "compare" reveals in the bullet list at 9.8s → a staggered word-by-word reveal; at ~11.0s a hand-drawn magenta circle rings the changed line-4 pair ('Vue Lab' vs 'Vue Workshop') → a hand-drawn magenta marker shape (SVG stroke draw) (circle). The crisp diff crop sits over the popover for the hold. This is the requested push-in on the diff.
Scene 8 (13.9–15.6s): the popover closes (~clip 8.9s → 13.9s) and the camera swoops down the drawer to the oldest snapshot's Restore button → `coordinate-target-zoom`; the drawn cursor glides in and lands its tip on Restore; "restore" reveals in the list at 15.0s; the click lands on the clip's own click (~clip 10.6s → 15.6s) with a magenta ring → `oversized-cursor` block (a small ring ripple at the click point).
Scene 9 (15.6–16.6s): the hinge's consequence — one decelerating pull back to the full surface as the code and preview revert to "Vue Workshop" and the blue "auto" snapshot appears at the top of the drawer (~clip 10.7–11.0s); the cursor settles below and exits → `coordinate-target-zoom` (zoom-out).
Scene 10 (16.6–17.6s): "experiment fearlessly" reveals as the last bullet, "fearlessly" flaring once in magenta → a staggered word-by-word reveal + a soft magenta glow on the key word (text-shadow tween). The clip has ended (~16.6s); its last frame holds.
Scene 11 (17.6–20.0s): held wide read — still; the harness zoom-through into frame 6 is the exit.

## Frame 6 — Home: inside amoxtli-vue lessons

- scene: the playground settles into its home — the amoxtli-vue lesson view, lesson text left, yehyecoa right
- voiceover: ""
- on_screen: "built into amoxtli-vue lessons."
- duration: 10s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/06-home-amoxtli.html
- type: branding
- persuasion: Authority by association (part of a full course)
- beat: trust
- blueprint: zoom-out-workspace-reveal (Adapt)
- focal: assets/home-amoxtli-lesson.png
- roles: home-amoxtli-lesson.png = focal (the whole world: opens as a full-bleed close-up on its playground pane, lands in the confirmed bottom-anchored slot)
- sfx: whoosh
- asset_candidates: assets/home-amoxtli-lesson.png — current amoxtli-vue lesson (challenge text left, playground right, newer playground UI than this repo)

narrativeRole: place the tool in its context — it's where the lessons happen.
keyMessage: yehyecoa is the hands-on half of amoxtli-vue.

Adapt: keep the signature — open TIGHT and full-bleed on one detail, then ONE decelerating zoom-out reveals that it lives inside a larger whole, the frame LOCKS and element-level payoff carries on; the hard rule holds: no zoom-in anywhere, no camera after the lock (Benefits close-up dwell → snap). Change: the detail is the yehyecoa playground pane inside the amoxtli-vue lesson still, and the reveal lands on the confirmed pose (screenshot bottom-anchored, centred, on the magenta register under the top-left headline).
Scene 1 (0.0–2.6s): extreme close-up, full-bleed — the playground's preview (empty swatch box and the five colour swatches) and the top of its editor fill the frame, no lesson text or chrome visible; the camera glides slowly down-left along the editor code (the one permitted pre-reveal move) → `coordinate-target-zoom`.
Scene 2 (2.6–3.8s): THE reveal — one fast, heavily decelerating zoom-out: the lesson text column ("Challenge!") enters on the left, then the amoxtli-vue header, then the screenshot's own edge and the magenta ground; lands on the confirmed pose and locks at 3.8s → `coordinate-target-zoom` (single scale tween, exponential decel).
Scene 3 (4.0–5.4s): on the locked wide, the kicker "ITS HOME" types on (ink 55% label) → `discrete-text-sequence`, then "built into amoxtli-vue lessons." assembles word by word in ink-black h2, top-left → a staggered word-by-word reveal.
Scene 4 (5.8–7.2s): element payoff — a rough ink-black outline sketches around the playground pane of the screenshot (the yehyecoa half of the lesson) → a hand-drawn magenta marker shape (SVG stroke draw) (sketchout). No camera.
Scene 5 (7.2–10.0s): the deliberate breather — held, completely still read before the close.

## Frame 7 — Close: the wordmark

- scene: back to ink-black; "yehyecoa-vue" set large in lowercase Work Sans, "to try, to rehearse." under it, magenta accent
- voiceover: ""
- on_screen: "yehyecoa-vue" · "to try, to rehearse."
- duration: 6s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-close-wordmark.html
- type: cta
- persuasion: Callback (rhymes with the opening word)
- beat: satisfaction
- blueprint: titlecard-reveal (Adapt)
- focal: the wordmark "yehyecoa-vue" (type, no asset)
- roles: no asset_candidates — wordmark = hero · lead line = supporting · chrome (NO. 07 / A VUE PLAYGROUND) = supporting · magenta field = background
- sfx: typing
- asset_candidates:

narrativeRole: bookend the hook; leave the name and its meaning as the last image.
keyMessage: yehyecoa-vue — to try, to rehearse.

Adapt: keep the signature — one restrained move, then an allocated still hold (card-chain register: a character type-on as the card's move); change: the move is the frame 1 typing callback — "yehyecoa-vue" types with the same caret — followed by one slide-up of the lead line, and as the final frame it owns a real exit. Per the confirmed sketch the card sits on the magenta register (ink-black type), left-aligned on the vertical centre; the exit resolves to ink-black.
Scene 1 (0.0–0.5s): magenta field; only the short ink-black rule stub draws in left to right above the wordmark position → `gsap-effects` (scaleX).
Scene 2 (0.4–1.9s): "yehyecoa-vue" types character by character in ink-black display type with the shared mono caret trailing → `discrete-text-sequence` (+ `context-sensitive-cursor`).
Scene 3 (2.1–2.9s): "to try, to rehearse." slides up into place beneath it (lead, ink 75%) on one long-tail settle → `gsap-effects`; the caret blinks out at 2.9s.
Scene 4 (2.9–3.4s): the quiet chrome arrives — "NO. 07" top-left, "A VUE PLAYGROUND" top-right (ink 55% label) → `gsap-effects` (opacity).
Scene 5 (3.4–5.4s): held read — completely still.
Scene 6 (5.4–6.0s): the video's only real exit — the whole card fades to ink-black → `gsap-effects` (opacity).
