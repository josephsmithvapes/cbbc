[PROJECT:name=CBBC Cold Brew Bold Crew|stack=React 19+Vite 8+Supabase+gh-pages|status=97%]
[DEPLOY:url=coldbrewboldcrew.com|cmd=npm run deploy|base=/]

[DONE:features]
- index.html (876 lines): sticky frosted nav (56px blur), hero full-viewport, animated dots "BREW"
  gold gradient headline, scroll indicator, CTA. Fonts: Alfa Slab One+Cinzel+Space Grotesk
  Accessibility: focus-visible gold ring, aria-hidden, prefers-reduced-motion. Email capture:
  Buttondown API (verifiedbysky), duplicate handling, validation, success state. Footer 2019–2026
- Story section: 2-col grid, stats 20h/LA/0 shortcuts. Mobile: image hidden, single column
- Merch teaser: terra eyebrow, ghost "MERCH" text, tag pills
- LiveBatch (src/components/LiveBatch.jsx): 4 stages (IDLE/GRINDING/STEEPING/READY)
  Realtime Supabase batch_state | SVG animations per stage | live HH:MM:SS countdown
- BrewFlow (src/components/BrewFlow.jsx): 3-step navbar flowchart, realtime batch_state
  Mounted at #flow-mount via main.jsx dual-createRoot pattern
- BrewPanels (src/BrewPanels.jsx): 3-col static process grid with SVGs. bg=#1e1710
- AdminPanel (src/pages/AdminPanel.jsx): ?admin=1 URL, sessionStorage auth, 4 stage buttons
  Writes batch_state | auto-increment batch# on GRINDING | steep_start on STEEPING
- Supabase batch_state table: id, stage, batch_number, steep_start, updated_at
- BrewMonitor (src/components/BrewMonitor.jsx): IoT live telemetry, reads brew_state (ESP32)
  Countdown, temp tile, mass, yield Δ, progress bar, last push timestamp
  Live SVG sparkline: fetches last 120 rows from temperature_readings, realtime INSERT sub
  Converts temp_c→°F. "Awaiting telemetry…" placeholder if no data
- BatchProof (src/components/BatchProof.jsx): "Batch Proof" section, mounted after BrewPanels
  Reads temperature_readings (id, temp_c, brew_id uuid, recorded_at)
  Groups by brew_id → one card per brew | sorted oldest-first | thins to 200 pts per card
  Each card: date header + steep duration + mini SVG sparkline + Low/High/Avg/Readings stats
  Fetches up to 50000 rows total. 2 real brews loaded: Apr 27 + Apr 30 2025
- firmware/cbbc_brew/cbbc_brew.ino: ESP32 sketch
  DS18B20 GPIO 4 | HX711 GPIO 16/17 | BOOT button GPIO 0
  IDLE→BREWING→READY→POURING→COMPLETE | PATCH brew_state + POST brew_telemetry every 5s
  Supabase URL+anon key pre-filled. WIFI creds = placeholders. LOAD_CELL_SCALE=-420.0 placeholder

[SUPABASE:tables]
- batch_state: stage, batch_number, steep_start, updated_at — used by LiveBatch/BrewFlow/Admin
- brew_state: status, elapsed_seconds, current_temp_f, current_weight_g, etc — read by BrewMonitor
- temperature_readings: id, temp_c, brew_id(uuid), recorded_at — HAS DATA (Apr 27 + Apr 30)
- brew_telemetry: EMPTY — firmware posts here but table was never wired; not currently used

[BROKEN:brew_telemetry_empty|reason=ESP32 firmware POSTs to brew_telemetry but that table is empty.
  temperature_readings has the real data. BrewMonitor + BatchProof now read temperature_readings.
  If ESP32 is ever wired up, firmware target table needs to match]
[BROKEN:firmware_wifi_credentials|reason=WIFI_SSID/WIFI_PASS are placeholders in firmware]
[BROKEN:load_cell_uncalibrated|reason=LOAD_CELL_SCALE=-420.0 placeholder
  calibrate: SCALE=1.0, place 1kg known mass, read raw, set scale=raw/1000, negate if negative]
[BROKEN:realtime_publications|reason=Not confirmed for all tables. Run in Supabase SQL editor:
  ALTER PUBLICATION supabase_realtime ADD TABLE temperature_readings;
  ALTER PUBLICATION supabase_realtime ADD TABLE batch_state;
  ALTER PUBLICATION supabase_realtime ADD TABLE brew_state;
  Without these, live sparkline and BatchProof won't stream new readings]
[BROKEN:no_error_states|reason=Supabase failures silently drop in LiveBatch + BrewFlow]

[NEXT:tasks]
- Run realtime publication SQL above in Supabase SQL editor
- Deploy: npm run build && npm run deploy
- Fill WIFI_SSID + WIFI_PASS in firmware → flash ESP32 → verify HTTP 204 in Serial Monitor
- Calibrate load cell (4-step tare in firmware comments)
- Add error/loading fallback UI to LiveBatch + BrewFlow
- Phase 2: Supabase Edge Function + device JWT to replace anon-key ESP32 writes
- Phase 3: email_signups table + batch-ready subscriber notifications
- Optional: real photography for story section | admin panel mobile improvements

[USER:lang=en|prefers=voice-input]
- Email: moleculardeveloper@gmail.com | LA small batch cold brew + lifestyle merch (CBBC est. 2019)
- Dark/premium design — gold accents #c9a84c, INK=#161108 — Liquid Death/Ghia aesthetic
- Stack: React 19+Vite 8+Supabase, GitHub Pages | Admin: site?admin=1 | pass: coldbrewboldcrew2024
- Voice input — short scannable bullet responses, no trailing summaries
- Prefers gold-gradient large display text + centered SVG animation style
- IoT: ESP32-WROOM-32 + DS18B20 (GPIO 4) + HX711 (GPIO 16/17) → Supabase → React UI
