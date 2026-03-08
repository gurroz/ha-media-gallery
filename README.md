# HA Media Gallery

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![GitHub Release][releases-shield]][releases]
[![License][license-shield]][license]
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20me-ff5e5b?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gurroz)

A Lovelace dashboard card for [Home Assistant](https://www.home-assistant.io) that browses your **local media** folders and shows images and videos with search, filters, lightbox zoom, slideshow, and download.

Uses the built-in [Media Source](https://www.home-assistant.io/integrations/media_source/) integration. Images and videos from your media folders are shown; playback still depends on what your browser can decode (see [Video format support](#video-format-support)).

## Screenshots

![Media grid in the visual card editor](https://raw.githubusercontent.com/gurroz/ha-media-gallery/main/docs/images/browse.png)

![Lightbox with zoom and slideshow](https://raw.githubusercontent.com/gurroz/ha-media-gallery/main/docs/images/lightbox.png)

## Features

- Browse Home Assistant local media folders with breadcrumbs
- Grid view for images and videos
- Search by file or folder name
- Filter by images, videos, or both
- Lightbox for full-screen viewing
- Pinch / scroll zoom and drag to pan (images)
- Slideshow (current folder, or recursive across subfolders)
- Sequential or random slideshow order
- Download media from the grid or lightbox
- Visual card editor in the Lovelace UI

## Video format support

This card plays video with your browser's built-in player. It does not bundle a video decoder, so **a file plays only if your browser and device can already decode it**. This is a browser limitation, not something the card can work around.

- **Plays:** H.264/AAC MP4, WebM, and most `.mov` files containing H.264
- **Plays via hls.js:** HLS (`.m3u8`) from integrations such as Frigate
- **Depends on your device:** HEVC/H.265, which works on Safari, macOS, Android, and Windows with the HEVC Video Extensions installed, but not on Linux
- **Does not play:** AVI, WMV, MPEG-2, and most MKV files

Files that cannot play still appear in the gallery and can still be downloaded. To watch them in the dashboard, convert them to H.264 MP4.

## Requirements

- Home Assistant with the Media Source integration available (included by default)
- A configured local media directory, for example in `configuration.yaml`:

```yaml
homeassistant:
  media_dirs:
    local: /media
```

Use a path that exists on your Home Assistant host (for example `/media`, or another mounted directory).

## Installation

### HACS (recommended)

1. Open **HACS** → **Frontend**.
2. Open the menu (three dots) → **Custom repositories**.
3. Add `https://github.com/gurroz/ha-media-gallery` as type **Dashboard**.
4. Search for **HA Media Gallery** and download it.
5. Restart Home Assistant, or hard-refresh the browser (`Ctrl`+`Shift`+`R` / `Cmd`+`Shift`+`R`).

Once the card is included in the HACS default store, you can skip the custom repository step and search for **HA Media Gallery** directly.

### Manual

1. Download `ha-media-gallery.js` from the [latest release][releases].
2. Copy it to `<config>/www/ha-media-gallery.js`.
3. Add the Lovelace resource (see below).
4. Hard-refresh the browser.

## Configuration

### Lovelace resource

Add a JavaScript module resource after installing:

| Install method | Resource URL |
| --- | --- |
| HACS | `/hacsfiles/ha-media-gallery/ha-media-gallery.js` |
| Manual | `/local/ha-media-gallery.js` |

**UI:** Settings → Dashboards → Resources → Add resource → type **JavaScript Module**.

**YAML:**

```yaml
resources:
  - url: /hacsfiles/ha-media-gallery/ha-media-gallery.js
    type: module
```

### Add the card

**UI:** Edit dashboard → **Add card** → search for **HA Gallery**.

**YAML:**

```yaml
type: custom:ha-gallery
title: Gallery
media_content_id: media-source://media_source/local
slideshow_interval: 5
slideshow_order: sequential
```

### Options

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | string | yes | — | Must be `custom:ha-gallery` |
| `title` | string | no | `Gallery` | Card header title |
| `media_content_id` | string | no | Media Source root | Starting Media Source path (for example `media-source://media_source/local`) |
| `slideshow_interval` | number | no | `5` | Seconds between slides (`1`–`300`) |
| `slideshow_order` | string | no | `sequential` | `sequential` or `random` |

### Examples

**Minimal**

```yaml
type: custom:ha-gallery
```

**Open a specific local folder**

```yaml
type: custom:ha-gallery
title: Family Photos
media_content_id: media-source://media_source/local/photos
slideshow_interval: 8
slideshow_order: random
```

## Usage

| Control | Action |
| --- | --- |
| Folder tile | Open that folder |
| Breadcrumb | Jump back up the path |
| Search | Filter folders and files by name |
| Image / video filter buttons | Show images, videos, or both |
| Media tile | Open lightbox (images) or play video |
| Download icon | Save the file |
| Slideshow (folder) | Play images in the current folder |
| Slideshow (recursive) | Play images from this folder and subfolders |
| Lightbox: pinch / scroll | Zoom images |
| Lightbox: drag | Pan when zoomed |
| Lightbox: presentation | Hide chrome for a cleaner slideshow |

## Troubleshooting

**Card does not appear after install**  
Hard-refresh the browser or clear cache. Confirm the resource URL and that the type is **JavaScript Module**.

**Empty gallery / no media**  
Confirm `media_dirs` points at a real host path and that the folder contains browser-supported images or videos. Check Home Assistant → Media to verify the same content is visible there.

**Unable to authorize media**  
Home Assistant could not resolve a playable URL for that item. Confirm Media Source can open the file outside the card, then refresh the dashboard.

**"This browser cannot play this format"**  
The file uses a container or codec your browser cannot decode. Download it to confirm it plays locally, then convert it to H.264 MP4 for dashboard playback. HEVC files may play in Safari but not in Chrome on the same network.

## Development

```bash
npm install
npm run build
```

Output: `dist/ha-media-gallery.js` (single file, about 430 KB minified, including `hls.js` for HLS playback). Use `npm run watch` while developing.

```bash
npm test
npm run typecheck
```

## Support

- [Issues](https://github.com/gurroz/ha-media-gallery/issues)
- [Ko-fi](https://ko-fi.com/gurroz)

## License

[MIT](LICENSE)

[releases-shield]: https://img.shields.io/github/v/release/gurroz/ha-media-gallery.svg?style=for-the-badge
[releases]: https://github.com/gurroz/ha-media-gallery/releases
[license-shield]: https://img.shields.io/github/license/gurroz/ha-media-gallery.svg?style=for-the-badge
[license]: https://github.com/gurroz/ha-media-gallery/blob/main/LICENSE
