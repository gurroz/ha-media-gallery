import type { ReactiveElement } from "lit";

export async function settle(element: ReactiveElement): Promise<void> {
  for (let index = 0; index < 5; index += 1) {
    await Promise.resolve();
    await element.updateComplete;
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
}

export function dispatchInput(
  element: Element,
  value: string,
  eventName = "input"
): void {
  (element as HTMLInputElement).value = value;
  element.dispatchEvent(
    new Event(eventName, { bubbles: true, composed: true })
  );
}

export function deepQuery(
  root: ParentNode | null | undefined,
  selector: string
): Element | null {
  if (!root) return null;
  const direct = (root as ParentNode).querySelector?.(selector) ?? null;
  if (direct) return direct;
  const elements =
    "querySelectorAll" in root
      ? root.querySelectorAll("*")
      : ([] as unknown as NodeListOf<Element>);
  for (const element of elements) {
    if (element.shadowRoot) {
      const found = deepQuery(element.shadowRoot, selector);
      if (found) return found;
    }
  }
  return null;
}

export function deepQueryAll(
  root: ParentNode | null | undefined,
  selector: string
): Element[] {
  if (!root) return [];
  const matches = [
    ...((root as ParentNode).querySelectorAll?.(selector) ?? []),
  ];
  const elements =
    "querySelectorAll" in root
      ? root.querySelectorAll("*")
      : ([] as unknown as NodeListOf<Element>);
  for (const element of elements) {
    if (element.shadowRoot) {
      matches.push(...deepQueryAll(element.shadowRoot, selector));
    }
  }
  return matches;
}
