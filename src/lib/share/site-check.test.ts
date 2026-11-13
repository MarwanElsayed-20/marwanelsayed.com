import { expect, it } from "vitest";
import { expectedPublicPaths, htmlMetadata, legacyRedirects } from "./site-check";

it("covers exactly the public paths and one legacy redirect for each project", () => {
  const paths = expectedPublicPaths();
  expect(paths).toHaveLength(31);
  expect(new Set(paths).size).toBe(31);
  expect(paths).toEqual(expect.arrayContaining(["/", "/work", "/about"]));
  expect(legacyRedirects()).toHaveLength(30);
  for (const redirect of legacyRedirects().slice(2)) expect(paths).toContain(redirect.to);
});
it("reads actual metadata, decodes entities, and ignores serialized scripts", () => {
  const meta = htmlMetadata(
    '<title>A &amp; B</title><meta property="og:image" content="/image"><script>"<meta property="og:image" content="bad">"</script>',
  );
  expect(meta.title).toBe("A & B");
  expect(meta.values("og:image")).toEqual(["/image"]);
});
