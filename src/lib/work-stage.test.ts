import { describe, expect, it } from "vitest";
import { sceneAt, sceneOffset, sceneProgress, trackSteps } from "./work-stage";

const step = 800;

describe("sceneAt", () => {
  it("shows the first scene as the panel pins and changes halfway between two scenes", () => {
    expect(sceneAt(0, step, 4)).toBe(0);
    expect(sceneAt(399, step, 4)).toBe(0);
    expect(sceneAt(400, step, 4)).toBe(1);
    expect(sceneAt(1199, step, 4)).toBe(1);
    expect(sceneAt(1200, step, 4)).toBe(2);
  });

  it("stays within the scenes before and after the panel", () => {
    expect(sceneAt(-500, step, 4)).toBe(0);
    expect(sceneAt(trackSteps(4) * step + 900, step, 4)).toBe(3);
    expect(sceneAt(100, 0, 4)).toBe(0);
  });
});

describe("sceneProgress", () => {
  it("runs each middle scene from 0 to 1 over one step", () => {
    expect(sceneProgress(400, step, 4, 1)).toBe(0);
    expect(sceneProgress(800, step, 4, 1)).toBe(0.5);
    expect(sceneProgress(1200, step, 4, 1)).toBe(1);
  });

  it("gives the first and last scenes their half steps", () => {
    expect(sceneProgress(0, step, 4, 0)).toBe(0);
    expect(sceneProgress(200, step, 4, 0)).toBe(0.5);
    expect(sceneProgress(2000, step, 4, 3)).toBe(0);
    expect(sceneProgress(2400, step, 4, 3)).toBe(0.5);
    expect(sceneProgress(trackSteps(4) * step, step, 4, 3)).toBe(1);
  });
});

describe("sceneOffset", () => {
  it("lands each scene on its own offset from the pin point", () => {
    expect(sceneOffset(1000, step, 0)).toBe(1000);
    expect(sceneOffset(1000, step, 3)).toBe(3400);
    for (let index = 0; index < 4; index++)
      expect(sceneAt(sceneOffset(1000, step, index) - 1000, step, 4)).toBe(index);
  });
});
