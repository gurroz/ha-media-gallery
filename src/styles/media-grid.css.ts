import { css } from "lit";

export const mediaGridStyles = css`
  :host {
    display: block;
  }
  .images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .image-wrap {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: var(--secondary-background-color, #eee);
    aspect-ratio: 1;
    content-visibility: auto;
    contain-intrinsic-size: 160px 160px;
  }
  .image-wrap img,
  .image-wrap video,
  .image-wrap .video-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }
  .video-placeholder {
    border: none;
    background: var(--secondary-background-color, #333);
    color: #fff;
    padding: 0;
  }
  .video-placeholder ha-icon {
    --mdc-icon-size: 48px;
  }
  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    color: #fff;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.8));
  }
  .play-overlay ha-icon {
    --mdc-icon-size: 52px;
  }
  .media-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    text-align: center;
    color: var(--error-color, #b00020);
    font-size: 0.8rem;
  }
  .media-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--secondary-text-color);
  }
  .media-loading ha-icon {
    animation: gallery-spin 1s linear infinite;
  }
  .actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    opacity: 0;
    transition: opacity 0.2s;
  }
  .image-wrap:hover .actions {
    opacity: 1;
  }
  .actions button {
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .actions button:hover {
    background: #fff;
  }
  @keyframes gallery-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
