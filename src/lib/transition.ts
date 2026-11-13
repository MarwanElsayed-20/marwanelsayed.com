/**
 * Decides whether a click should play the page transition. Anything the browser or Next should
 * handle natively (new tabs, downloads, other origins, same-page hashes) returns null.
 */
export function transitionTarget(
  event: Pick<
    MouseEvent,
    "defaultPrevented" | "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
  >,
  link: HTMLAnchorElement | null,
  current: Pick<Location, "origin" | "pathname" | "search" | "href">,
): URL | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return null;
  if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download"))
    return null;
  if (link.dataset.noTransition !== undefined) return null;
  let url: URL;
  try {
    url = new URL(link.href, current.href);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.origin !== current.origin) return null;
  // Same page (hash or query only): nothing to cover. Next and HashFocus handle these natively.
  if (url.pathname === current.pathname) return null;
  return url;
}
