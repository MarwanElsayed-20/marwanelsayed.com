/** Representative public pages for site-wide checks: home, the work index, the services and one of each kind of detail page. */
export const PUBLIC_PAGES = [
  "/",
  "/work",
  "/services",
  "/about",
  "/services/online-stores",
  "/websites-ecommerce/mdr-electrical-supply",
] as const;
export const NOT_FOUND_PATH = "/this-page-does-not-exist";
export const ALL_PAGES = [...PUBLIC_PAGES, NOT_FOUND_PATH] as const;
