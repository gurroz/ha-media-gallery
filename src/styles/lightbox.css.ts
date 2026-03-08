import { css } from "lit";

export const lightboxStyles = css`
  :host {
    display: contents;
  }
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .lightbox-content {
    max-width: 95vw;
    max-height: 90vh;
    object-fit: contain;
    cursor: grab;
    touch-action: none;
    user-select: none;
    will-change: transform;
  }
  .lightbox-content:active {
    cursor: grabbing;
  }
  .lightbox-content.video {
    width: min(95vw, 1280px);
    cursor: default;
    touch-action: auto;
    user-select: auto;
    will-change: auto;
  }
  .lightbox-title {
    position: absolute;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 0.875rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  }
  .lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lightbox-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .zoom-help {
    position: absolute;
    top: 20px;
    left: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.75rem;
    pointer-events: none;
  }
  .slideshow-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
    z-index: 3;
  }
  .slideshow-progress-bar {
    width: 100%;
    height: 100%;
    transform-origin: left;
    background: var(--primary-color, #03a9f4);
  }
  .slideshow-progress-bar.cycle-a {
    animation: slideshow-progress-a 5s linear forwards;
  }
  .slideshow-progress-bar.cycle-b {
    animation: slideshow-progress-b 5s linear forwards;
  }
  @keyframes slideshow-progress-a {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  @keyframes slideshow-progress-b {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  .slide-button,
  .slideshow-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    cursor: pointer;
  }
  .slide-button {
    position: absolute;
    top: 50%;
    width: 48px;
    height: 48px;
    transform: translateY(-50%);
    z-index: 1;
  }
  .slide-button.previous {
    left: 16px;
  }
  .slide-button.next {
    right: 16px;
  }
  .slideshow-controls {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    color: #fff;
    z-index: 1;
  }
  .slideshow-toggle {
    width: 40px;
    height: 40px;
  }
  .slide-button:hover,
  .slideshow-toggle:hover {
    background: rgba(255, 255, 255, 0.35);
  }
  .lightbox.presentation .zoom-help,
  .lightbox.presentation .slide-button,
  .lightbox.presentation .slideshow-controls,
  .lightbox.presentation .lightbox-title {
    display: none;
  }
`;
