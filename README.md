# HA Gallery

A Lovelace frontend card for Home Assistant that browses your **local media (storage) folder**, lists subfolders, and displays images with **zoom** and **download**. Installable via [HACS](https://hacs.xyz).

It uses the built-in **Media Source** integration: only **image** files are shown (e.g. JPEG, PNG, GIF, WebP); other file types are ignored.

## Installation

### HACS (recommended)

1. Open **HACS** → **Frontend** → **+ Explore & Download Repositories**.
2. Click **+** (bottom right) → **Custom repositories** and add: `https://github.com/gurroz/ha-media-gallery`
3. Search for **HA Media Gallery** and download.
4. Restart Home Assistant (or clear browser cache).

### Manual

1. Download the latest `ha-media-gallery.js` from [releases](https://github.com/gurroz/ha-media-gallery/releases).
2. Put `ha-media-gallery.js` in your config folder under `www/` (e.g. `config/www/ha-media-gallery.js`).
3. Add the resource in the Lovelace UI (see Configuration).

## Configuration

### Add the Lovelace resource

- **UI:** Settings → Dashboards → ⋮ (top right) → **Resources** → **+ Add Resource**  
  - URL: `/hacsfiles/ha-media-gallery/ha-media-gallery.js` (if installed via HACS)  
  - or `/local/ha-media-gallery.js` (if installed manually)  
  - Type: **JavaScript Module**
- **YAML:** In `ui-lovelace.yaml` or your dashboard config:

```yaml
resources:
  - url: /hacsfiles/ha-media-gallery/ha-media-gallery.js
    type: module
```

### Add the card

- **UI:** Edit dashboard → **+ Add Card** → **Custom: HA Gallery** (search for "HA Gallery" or "Gallery").
- **YAML:**

```yaml
type: custom:ha-gallery
title: Gallery
```

## Storage folder (local media)

The card shows content from Home Assistant’s **Media Source** (local media). Configure the folder in `configuration.yaml`:

```yaml
homeassistant:
  media_dirs:
    local: /media
```

Use a path that exists on your Home Assistant host (e.g. `/media` for the default, or another directory you mount). Only **image** types are shown; other files are skipped.

## Development

```bash
npm install
npm run build
```

Output is in `dist/ha-media-gallery.js`. Use **npm run watch** for continuous build during development.

## License

MIT
