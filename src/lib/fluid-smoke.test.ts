import { describe, expect, it } from "vitest";
import { FluidSmoke } from "./fluid-smoke";

describe("FluidSmoke", () => {
  it("is unavailable without WebGL2, so the cursor simply has no smoke", () => {
    expect(FluidSmoke.create(document.createElement("canvas"))).toBeNull();
  });
});
