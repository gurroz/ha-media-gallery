import { css } from "lit";

export const folderGridStyles = css`
  :host {
    display: block;
  }
  .folders {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .folder-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.2s, border-color 0.2s;
  }
  .folder-card:hover {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .folder-card ha-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
    --mdc-icon-size: 48px;
  }
  .folder-card span {
    text-align: center;
    word-break: break-word;
    font-size: 0.875rem;
  }
`;
