export type NavItem = {
  label: string;
  href: string;
  /** The pages under this address (`/services/<id>`) mark it as the current place too. */
  parent?: boolean;
};

/**
 * Primary navigation, in display order. Contact is not listed: "Get in touch" in the header
 * and the contact band on the home page cover it.
 * Never list review routes under /design-system.
 */
export const navItems: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services", parent: true },
  { label: "About", href: "/about" },
];
