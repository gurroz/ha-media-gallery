export const LIGHTBOX_HISTORY_HASH = "ha-gallery-lightbox";

export function snapshotLocation(win: Window = window): string {
  return `${win.location.pathname}${win.location.search}${win.location.hash}`;
}

export function lightboxHistoryUrl(win: Window = window): string {
  return `${win.location.pathname}${win.location.search}#${LIGHTBOX_HISTORY_HASH}`;
}

/**
 * Add a real history entry Home Assistant / mobile WebViews can go back to.
 * A hash change is required: pushState with an unchanged URL is often ignored.
 */
export function pushLightboxHistory(win: Window = window): boolean {
  try {
    const { history } = win;
    const current =
      history.state && typeof history.state === "object" ? history.state : {};
    history.replaceState({ ...current, opensDialog: true }, "");
    history.pushState(
      { ...current, haGalleryLightbox: true },
      "",
      lightboxHistoryUrl(win)
    );
    return true;
  } catch {
    return false;
  }
}

export function restoreLocation(url: string, win: Window = window): void {
  if (!url || snapshotLocation(win) === url) return;
  try {
    const current =
      win.history.state && typeof win.history.state === "object"
        ? win.history.state
        : {};
    win.history.pushState(current, "", url);
  } catch {
    // Ignore environments that block history writes.
  }
}
