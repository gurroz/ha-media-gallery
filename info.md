## HA Gallery

Lovelace card that browses your **Home Assistant local media** (storage folder), lists folders, and shows images with zoom and download.

Uses the built-in **Media Source** integration. Configure your storage in `configuration.yaml`:

```yaml
homeassistant:
  media_dirs:
    local: /media
```

Then add the card and the resource as a **JavaScript Module**. Card type: `custom:ha-gallery`.

### Quick config

```yaml
type: custom:ha-gallery
title: Gallery
```
