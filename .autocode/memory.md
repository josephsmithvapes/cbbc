[PROJECT:name=CBBC Cold Brew Bold Crew|stack=React 19+Vite 8+Supabase+gh-pages|status=99%]
[DEPLOY:url=coldbrewboldcrew.com|cmd=npm run deploy|base=/]

[DONE:features]
- index.html (876 lines): sticky frosted nav (56px blur), hero, animated dots, gold headline
  Story section, merch teaser, email capture (Buttondown/verifiedbysky), footer 2019–2026
  Fonts: Alfa Slab One + Cinzel + Space Grotesk. Accessibility: focus ring, reduced-motion
- LiveBatch (src/components/LiveBatch.jsx): realtime batch_state → 4 stage SVG animations
  IDLE/GRINDING/STEEPING/READY + live HH:MM:SS countdown
- BrewFlow (src/components/BrewFlow.jsx): 3-step nav indicator, realtime batch_state
  Dual createRoot in main.jsx — mounts at #brew-mount and #flow-mount
- BrewPanels (src/BrewPanels.jsx): static 3-col process grid, bg=#1e1710
- BrewMonitor (src/components/BrewMonitor.jsx): IoT telemetry panel
  Reads brew_state: countdown, temp tile, mass, yield Δ, progress bar, last push
  Live SVG sparkline: paginates temperature_readings (last 120), realtime INSERT sub
  Converts temp_c → °F inline
- BatchProof (src/components/BatchProof.jsx): past batches section, mounted after BrewPanels
  Paginates ALL temperature_readings (1000/page), splits sessions by 6h gap threshold
  Fetches batches table → matches each card by steep_start time range (±4h)
  Card layout: batch name (gold display), date, steep duration, origin·roast·process pill,
  mini SVG sparkline (130px, hour tick marks), Low/High/Avg/Readings stats, tasting notes
- AdminPanel (src/pages/AdminPanel.jsx): ?admin=1, sessionStorage auth
  MetaFields reusable component: Name, Origin, Roast (Light/Med/Dark/Dark+),
  Process (Washed/Natural/Honey/Other), Grind Notes, Tasting Notes
  PastBatchRow collapsed list component with EDIT button
  GRINDING → INSERT into batches + increment batch_number
  STEEPING → sets steep_start on batch_state
  READY → UPDATE batches SET steep_end = now() on active batch
  IDLE → clears active batch state, resets form
  SAVE NOTES → UPDATE tasting_notes mid-brew without stage change
  Loads active batch on mount to repopulate form if page refreshed mid-brew
  PAST BATCHES section: list all batches DESC by steep_start
    EDIT → inline form with all fields + datetime-local steep_start/steep_end inputs
    SAVE / CANCEL / DELETE (two-step confirm red button)
    + ADD → blank form w/ datetime inputs for retroactive batch entry
  toLocal(iso)/toISO(local) helpers, loadPastBatches() after every mutation
  Sticky header, flash message (✓ LIVE / ✓ SAVED / ✗ ERROR)
  [NOTE: AdminPanel.jsx rewrite is uncommitted — needs git commit + deploy]
- firmware/cbbc_brew/cbbc_brew.ino: ESP32 sketch
  DS18B20 GPIO 4 | HX711 GPIO 16/17 | BOOT GPIO 0
  IDLE→BREWING→READY→POURING→COMPLETE | PATCH brew_state + POST brew_telemetry every 5s
  Supabase URL+anon key pre-filled. WIFI=placeholders. LOAD_CELL_SCALE=-420.0 placeholder.

[SUPABASE:tables]
- batch_state: stage, batch_number, steep_start, updated_at — LiveBatch/BrewFlow/Admin
- brew_state: status, elapsed_s, current_temp_f, current_weight_g etc — BrewMonitor
- temperature_readings: id, temp_c, brew_id(uuid), recorded_at — HAS DATA (Apr 27 + Apr 30)
  Note: both brews share same brew_id — split by 6h time gap in BatchProof
- batches: id(uuid), batch_number, name, origin, roast, process, grind_notes,
  tasting_notes, steep_start, steep_end, created_at — populated by AdminPanel
- brew_telemetry: EMPTY — firmware target, not currently used by UI

[BROKEN:firmware_wifi_credentials|reason=WIFI_SSID/WIFI_PASS placeholders in firmware]
[BROKEN:load_cell_uncalibrated|reason=LOAD_CELL_SCALE=-420.0 placeholder]
[BROKEN:realtime_publications|reason=Run in Supabase SQL editor if not done:
  ALTER PUBLICATION supabase_realtime ADD TABLE temperature_readings;
  ALTER PUBLICATION supabase_realtime ADD TABLE batch_state;
  ALTER PUBLICATION supabase_realtime ADD TABLE brew_state;
  ALTER PUBLICATION supabase_realtime ADD TABLE batches;]
[BROKEN:apr27_apr30_no_metadata|reason=Existing 2 brews predate batches table
  Use + ADD in AdminPanel to enter metadata for those 2 cards]
[BROKEN:no_error_states|reason=Supabase failures silently drop in LiveBatch + BrewFlow]

[NEXT:tasks]
- PRIORITY: git commit AdminPanel.jsx + npm run deploy + git push origin main
- Run: ALTER PUBLICATION supabase_realtime ADD TABLE batches; in Supabase SQL editor
- Add metadata for Apr 27 + Apr 30 brews via + ADD form in AdminPanel (?admin=1)
- Fill WIFI_SSID + WIFI_PASS in firmware → flash ESP32 → verify HTTP 204 Serial Monitor
- Calibrate load cell (4-step tare in firmware comments)
- Add error/loading fallback UI to LiveBatch + BrewFlow
- Phase 2: Supabase Edge Function + device JWT to replace anon-key ESP32 writes
- Phase 3: email_signups table + batch-ready subscriber notifications
- Optional: real photography, admin mobile polish

[USER:lang=en|prefers=voice-input]
- Email: moleculardeveloper@gmail.com | LA small batch cold brew + merch (CBBC est. 2019)
- Dark/premium — gold #c9a84c, INK=#161108, Liquid Death/Ghia aesthetic
- Stack: React 19+Vite 8+Supabase, GitHub Pages | Admin: ?admin=1 | pass: coldbrewboldcrew2024
- Voice input — short scannable bullets, no trailing summaries
- Gold-gradient display text + centered SVG animation style
- IoT: ESP32-WROOM-32 + DS18B20 (GPIO 4) + HX711 (GPIO 16/17) → Supabase → React
