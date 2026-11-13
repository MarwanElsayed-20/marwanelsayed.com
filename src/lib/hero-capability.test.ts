import { describe, expect, it, vi } from "vitest";
import { readConnection, shouldLoadScene, type CapabilityInputs } from "./hero-capability";

const base: CapabilityInputs = {
  switch: null,
  reducedMotion: false,
  saveData: false,
  effectiveType: null,
  webgl: () => true,
};

describe("shouldLoadScene", () => {
  it("loads on a normal connection with WebGL", () => {
    expect(shouldLoadScene(base)).toEqual({ load: true, reason: null });
  });

  it("loads on 3g and 4g connections", () => {
    expect(shouldLoadScene({ ...base, effectiveType: "3g" }).load).toBe(true);
    expect(shouldLoadScene({ ...base, effectiveType: "4g" }).load).toBe(true);
  });

  it("skips for reduced motion", () => {
    expect(shouldLoadScene({ ...base, reducedMotion: true })).toEqual({
      load: false,
      reason: "reduced-motion",
    });
  });

  it("skips for data-saver", () => {
    expect(shouldLoadScene({ ...base, saveData: true })).toEqual({
      load: false,
      reason: "data-saver",
    });
  });

  it("skips for very slow connections", () => {
    expect(shouldLoadScene({ ...base, effectiveType: "2g" }).reason).toBe("slow-connection");
    expect(shouldLoadScene({ ...base, effectiveType: "slow-2g" }).reason).toBe("slow-connection");
  });

  it("skips without WebGL", () => {
    expect(shouldLoadScene({ ...base, webgl: () => false })).toEqual({
      load: false,
      reason: "no-webgl",
    });
  });

  it("honors the degrade-only switches", () => {
    expect(shouldLoadScene({ ...base, switch: "fallback" }).reason).toBe("forced");
    expect(shouldLoadScene({ ...base, switch: "slow" }).reason).toBe("data-saver");
    expect(shouldLoadScene({ ...base, switch: "nowebgl" }).reason).toBe("no-webgl");
  });

  it("does not skip for the fail, hold, and lowperf switches (they act later)", () => {
    for (const value of ["fail", "hold", "lowperf"] as const) {
      expect(shouldLoadScene({ ...base, switch: value }).load).toBe(true);
    }
  });

  it("uses the documented priority order", () => {
    const all = { ...base, reducedMotion: true, saveData: true, effectiveType: "2g" };
    expect(shouldLoadScene({ ...all, switch: "fallback" }).reason).toBe("forced");
    expect(shouldLoadScene(all).reason).toBe("reduced-motion");
    expect(shouldLoadScene({ ...all, reducedMotion: false }).reason).toBe("data-saver");
    expect(shouldLoadScene({ ...all, reducedMotion: false, saveData: false }).reason).toBe(
      "slow-connection",
    );
  });

  it("only checks WebGL when every earlier check passed", () => {
    const webgl = vi.fn(() => true);
    shouldLoadScene({ ...base, reducedMotion: true, webgl });
    shouldLoadScene({ ...base, saveData: true, webgl });
    shouldLoadScene({ ...base, effectiveType: "2g", webgl });
    expect(webgl).not.toHaveBeenCalled();
    shouldLoadScene({ ...base, webgl });
    expect(webgl).toHaveBeenCalledTimes(1);
  });
});

describe("readConnection", () => {
  it("treats a missing connection API as a normal connection", () => {
    expect(readConnection({})).toEqual({ saveData: false, effectiveType: null });
  });

  it("reads saveData and effectiveType", () => {
    expect(readConnection({ connection: { saveData: true, effectiveType: "2g" } })).toEqual({
      saveData: true,
      effectiveType: "2g",
    });
  });
});
