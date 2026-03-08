import { css } from "lit";

export const baseStyles = css`
  :host {
    display: block;
    width: 100%;
    padding: 0;
  }
  .card {
    width: 100%;
    box-sizing: border-box;
    background: var(--ha-card-background, var(--card-background-color, white));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    overflow: hidden;
  }
  .header {
    padding: 12px 16px;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--primary-text-color);
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }
  .content {
    padding: 16px;
    min-height: 120px;
  }
  .loading,
  .error {
    text-align: center;
    padding: 24px;
    color: var(--secondary-text-color);
  }
  .error {
    color: var(--error-color, #b00020);
  }
  @keyframes gallery-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
