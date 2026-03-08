import { css } from "lit";

export const toolbarStyles = css`
  :host {
    display: block;
  }
  .gallery-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  .media-search {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: auto;
  }
  .media-search input {
    width: min(260px, 45vw);
    padding: 8px 10px;
    border: 1px solid var(--divider-color);
    border-radius: 18px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font: inherit;
  }
  .media-filter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid var(--divider-color);
    border-radius: 50%;
    background: var(--card-background-color);
    color: var(--secondary-text-color);
    cursor: pointer;
  }
  .media-filter.active {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .slideshow-start {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border: none;
    border-radius: 18px;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    cursor: pointer;
  }
  .slideshow-start.icon-only {
    width: 36px;
    height: 36px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }
  .slideshow-start:disabled {
    opacity: 0.65;
    cursor: wait;
  }
  .slideshow-start .loading-icon {
    animation: gallery-spin 1s linear infinite;
  }
  @keyframes gallery-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
