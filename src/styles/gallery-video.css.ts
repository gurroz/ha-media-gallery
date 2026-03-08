import { css } from "lit";

export const galleryVideoStyles = css`
  :host {
    display: block;
    width: min(95vw, 1280px);
    max-width: 95vw;
    max-height: 90vh;
  }
  video {
    display: block;
    width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
  .unsupported,
  .video-loading {
    box-sizing: border-box;
    width: min(92vw, 480px);
    padding: 24px;
    text-align: center;
    color: #fff;
  }
  .unsupported h2 {
    margin: 0 0 12px;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .unsupported p {
    margin: 0 0 16px;
    font-size: 0.9rem;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.85);
  }
  .unsupported button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #fff;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font: inherit;
  }
  .unsupported button:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;
