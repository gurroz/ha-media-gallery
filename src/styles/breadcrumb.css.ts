import { css } from "lit";

export const breadcrumbStyles = css`
  :host {
    display: block;
  }
  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    background: var(--secondary-background-color, #f5f5f5);
    font-size: 0.875rem;
    color: var(--secondary-text-color);
  }
  .breadcrumb button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--primary-color, #03a9f4);
  }
  .breadcrumb button:hover {
    background: var(--primary-color);
    color: var(--card-background-color, white);
  }
  .breadcrumb .sep {
    opacity: 0.6;
  }
`;
