export type HeroSwitch = "fallback" | "nowebgl" | "slow" | "fail" | "hold" | "lowperf";

export type HeroReason =
  | "reduced-motion"
  | "data-saver"
  | "slow-connection"
  | "no-webgl"
  | "load-failed"
  | "context-lost"
  | "low-performance"
  | "forced";

export type CapabilityInputs = {
  switch: HeroSwitch | null;
  reducedMotion: boolean;
  saveData: boolean;
  /** `navigator.connection.effectiveType`, or null when the browser does not expose it. */
  effectiveType: string | null;
  /** Evaluated last, and only when every earlier check passed. */
  webgl: () => boolean;
};

export type CapabilityDecision = { load: true; reason: null } | { load: false; reason: HeroReason };

/** Decides, once after mount, whether this visitor gets the 3D scene. Order matters. */
export function shouldLoadScene(inputs: CapabilityInputs): CapabilityDecision {
  if (inputs.switch === "fallback") return { load: false, reason: "forced" };
  if (inputs.reducedMotion) return { load: false, reason: "reduced-motion" };
  if (inputs.saveData || inputs.switch === "slow") return { load: false, reason: "data-saver" };
  if (inputs.effectiveType === "slow-2g" || inputs.effectiveType === "2g") {
    return { load: false, reason: "slow-connection" };
  }
  if (inputs.switch === "nowebgl" || !inputs.webgl()) return { load: false, reason: "no-webgl" };
  return { load: true, reason: null };
}

type NavigatorWithConnection = {
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** Reads the data-saver and connection class signals. Missing APIs mean a normal connection. */
export function readConnection(nav: object): { saveData: boolean; effectiveType: string | null } {
  const connection = (nav as NavigatorWithConnection).connection;
  return {
    saveData: connection?.saveData === true,
    effectiveType: connection?.effectiveType ?? null,
  };
}
