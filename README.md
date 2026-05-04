# CBBC — Bold Crew Cold Brew

Website for CBBC, a small-batch cold brew brand based in Los Angeles. Est. 2019.

**Live:** [boldcrewcoldbrew.com](https://boldcrewcoldbrew.com)

---

## Stack

- **React 19 + Vite 8** — frontend
- **Supabase** — realtime database (batch state + temperature telemetry)
- **GitHub Pages** — hosting via `gh-pages`
- **Buttondown** — email list (verifiedbysky)

## Features

### Public Site (`index.html`)
- Full-viewport hero with animated dot sequence and gold-gradient headline
- Story section — brand origin, process stats
- Merch teaser
- Email signup with duplicate handling and validation

### Live Brew Section (React, mounted at `#brew-mount`)
- **LiveBatch** — realtime batch status (IDLE / GRINDING / STEEPING / READY) with SVG animations and live HH:MM:SS countdown, driven by Supabase `batch_state`
- **BrewMonitor** — IoT telemetry panel: countdown, temp, mass, yield delta, progress bar, and a live SVG temperature sparkline streaming from `temperature_readings`
- **BrewPanels** — static 3-column process grid
- **BatchProof** — past brew cards, one per session, each with date, steep duration, mini temperature chart (Low / High / Avg), and reading count. Paginates Supabase rows and splits sessions by time gap.
- **BrewFlow** — 3-step progress indicator mounted in the nav (`#flow-mount`)

### Admin Panel (`?admin=1`)
- Password-protected (sessionStorage)
- Set batch stage: IDLE → GRINDING → STEEPING → READY
- Auto-increments batch number on GRINDING
- Records steep start time for live countdown

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `batch_state` | Current brew stage, batch number, steep start time |
| `brew_state` | ESP32 IoT state — status, elapsed, temp, mass |
| `temperature_readings` | DS18B20 sensor log — `temp_c`, `brew_id`, `recorded_at` |
| `brew_telemetry` | Reserved for future ESP32 telemetry writes |

Realtime must be enabled on `batch_state`, `brew_state`, and `temperature_readings`:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE batch_state;
ALTER PUBLICATION supabase_realtime ADD TABLE brew_state;
ALTER PUBLICATION supabase_realtime ADD TABLE temperature_readings;
```

---

## IoT Hardware

ESP32-based brew monitor logging temperature to Supabase every 5 seconds.

- **MCU:** HiLetgo ESP32-WROOM-32 (micro-USB)
- **Temp sensor:** DS18B20 waterproof probe — GPIO 4 (1-Wire, 4.7kΩ pull-up)
- **Load cell:** HX711 + 5kg cell — GPIO 16 (DT) / GPIO 17 (SCK)
- **Firmware:** `firmware/cbbc_brew/cbbc_brew.ino`

Firmware setup:
1. Fill `WIFI_SSID` / `WIFI_PASS` in the sketch
2. Flash via Arduino IDE
3. Verify `HTTP 204` in Serial Monitor
4. Calibrate load cell: set `LOAD_CELL_SCALE=1.0`, place known 1kg mass, read raw value, set `scale = raw / 1000` (negate if negative)

---

## Dev

```bash
npm install
npm run dev
```

Requires a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_PASS=your_admin_password
```

## Deploy

```bash
npm run deploy
```

Builds and pushes to `gh-pages` branch → live at boldcrewcoldbrew.com.

---

## Design Tokens

| Token | Value |
|---|---|
| INK | `#161108` |
| GOLD | `#c9a84c` |
| CREAM | `#f2ede0` |
| Display font | Alfa Slab One |
| Brand font | Cinzel |
| Body font | Space Grotesk |
