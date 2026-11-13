/**
 * Which pathname the full-screen menu is open for, or null. The menu is "open for" a specific
 * route, so it closes by itself when the route changes. The header buttons and the overlay are
 * separate trees (the overlay sits behind the page card), so they share this tiny store.
 */
let openFor: string | null = null;
const listeners = new Set<() => void>();

export const menuStore = {
  get: () => openFor,
  getServer: (): string | null => null,
  set(next: string | null) {
    if (openFor === next) return;
    openFor = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
