"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, Color, ExtrudeGeometry, Vector3, type Group } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { techLogos, type TechLogo } from "@/components/hero/tech-logos";
import { readColorToken } from "@/lib/css-token";
import { FrameMonitor } from "@/lib/frame-monitor";
import { damp } from "@/lib/parallax";

export type HeroSceneProps = {
  /** True when the stage is out of view or the tab is hidden. */
  paused: boolean;
  /** True on fine-pointer devices (items drift away from the pointer); false on touch. */
  fine: boolean;
  /** Review switch: pretend every frame is slow, to exercise the low-performance path. */
  simulateSlow: boolean;
  onReady: () => void;
  onFrame: (count: number) => void;
  onContextLost: () => void;
  onLowPerformance: () => void;
};

const MAX_ITEMS = 12;
/** How far the pointer pushes items away, in item sizes. */
const PUSH_RANGE = 2.4;
const LOGOS = new Map<string, TechLogo>(techLogos.map((logo) => [logo.title, logo]));
const NAMES = techLogos.map((logo) => logo.title);

function useSceneColors() {
  return useMemo(
    () => ({
      ink: readColorToken("--color-foreground"),
      sky: readColorToken("--color-surface"),
      ground: readColorToken("--color-muted"),
    }),
    [],
  );
}

function Lights() {
  const colors = useSceneColors();
  return (
    <>
      <hemisphereLight args={[colors.sky, colors.ground, 0.7]} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} />
      <directionalLight position={[-4, -2, 3]} intensity={0.8} />
    </>
  );
}

type Layer = { geometry: ExtrudeGeometry; color: Color };

/**
 * A logo as real 3D: every filled shape of the artwork is extruded and keeps its own colour, so
 * multi-colour marks stay multi-colour. Centred and scaled to fit a unit box.
 */
function buildLogo(logo: TechLogo): Layer[] {
  const markup = logo.markup.replace(/@([0-9a-fA-F]{6})/g, "#$1");
  const parsed = new SVGLoader().parse(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.viewBox}">${markup}</svg>`,
  );
  const span = Number(logo.viewBox.split(" ")[2]) || 24;
  const layers: Layer[] = [];
  parsed.paths.forEach((path, order) => {
    const fill = (path.userData as { style?: { fill?: string } } | undefined)?.style?.fill;
    if (!fill || fill === "none") return;
    const shapes = path.toShapes();
    if (shapes.length === 0) return;
    const geometry = new ExtrudeGeometry(shapes, {
      depth: span * 0.1,
      bevelEnabled: true,
      bevelThickness: span * 0.018,
      bevelSize: span * 0.012,
      bevelSegments: 1,
      curveSegments: 4,
    });
    // Later shapes sit a hair forward so overlapping faces never fight.
    geometry.translate(0, 0, order * span * 0.003);
    layers.push({ geometry, color: new Color(fill) });
  });
  const box = new Box3();
  layers.forEach(({ geometry }) => {
    geometry.computeBoundingBox();
    box.union(geometry.boundingBox!);
  });
  const center = box.getCenter(new Vector3());
  const longest = Math.max(box.max.x - box.min.x, box.max.y - box.min.y) || 1;
  layers.forEach(({ geometry }) => {
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.scale(1 / longest, 1 / longest, 1 / longest);
  });
  return layers;
}

type PointerRef = { current: { x: number; y: number; active: boolean } };
type Spot = { x: number; y: number };

/** Scratch state shared by the items and updated every frame; it is not rendered state. */
class World {
  constructor(
    readonly spots: Spot[],
    readonly shown: string[],
  ) {}
  place(index: number, x: number, y: number) {
    this.spots[index].x = x;
    this.spots[index].y = y;
  }
  show(index: number, name: string) {
    this.shown[index] = name;
  }
}

type WandererProps = {
  index: number;
  size: number;
  /** The slot's own area of the panel (world units): it drifts only inside it, so items stay apart. */
  cell: { x: number; y: number; width: number; height: number };
  pointer: PointerRef;
  world: World;
  cache: Map<string, Layer[]>;
};

function layersFor(cache: Map<string, Layer[]>, name: string): Layer[] {
  let layers = cache.get(name);
  if (!layers) {
    layers = buildLogo(LOGOS.get(name)!);
    cache.set(name, layers);
  }
  return layers;
}

/** A logo nobody else is showing, chosen at random. */
function pickName(shown: string[], own: string | undefined): string {
  const options = NAMES.filter((name) => name !== own && !shown.includes(name));
  const from = options.length > 0 ? options : NAMES;
  return from[Math.floor(Math.random() * from.length)];
}

/**
 * One drifting logo. It wanders slowly inside its own area of the panel, shies from the pointer,
 * and every few seconds shrinks away and comes back as a different technology.
 */
function Wanderer({ index, size, cell, pointer, world, cache }: WandererProps) {
  const group = useRef<Group>(null);
  const [name, setName] = useState(() => world.shown[index]);
  const state = useRef({
    vx: 0,
    vy: 0,
    goal: { x: cell.x, y: cell.y },
    goalAt: 0,
    switchAt: -1,
    scale: 0,
    leaving: false,
    phase: -1,
  });
  const layers = useMemo(() => layersFor(cache, name), [cache, name]);

  useFrame((frame, rawDelta) => {
    const target = group.current;
    if (!target) return;
    const delta = Math.min(rawDelta, 0.1);
    const t = frame.clock.elapsedTime;
    const me = state.current;
    if (me.phase < 0) {
      // Randomness is taken on the first frame, not while rendering.
      me.phase = Math.random() * 10;
      me.switchAt = t + 2 + Math.random() * 5;
    }
    const spot = world.spots[index];

    if (t > me.goalAt) {
      // A new, unhurried destination inside this slot's own area.
      const roomX = Math.max(0, cell.width / 2 - size * 0.55);
      const roomY = Math.max(0, cell.height / 2 - size * 0.55);
      me.goal = {
        x: cell.x + (Math.random() * 2 - 1) * roomX,
        y: cell.y + (Math.random() * 2 - 1) * roomY,
      };
      me.goalAt = t + 3 + Math.random() * 3;
    }
    let ax = (me.goal.x - spot.x) * 0.5;
    let ay = (me.goal.y - spot.y) * 0.5;
    if (pointer.current.active) {
      const dx = spot.x - pointer.current.x;
      const dy = spot.y - pointer.current.y;
      const distance = Math.hypot(dx, dy) / size;
      if (distance < PUSH_RANGE && distance > 0.001) {
        const push = (1 - distance / PUSH_RANGE) * size * 12;
        ax += (dx / distance / size) * push;
        ay += (dy / distance / size) * push;
      }
    }
    me.vx = (me.vx + ax * delta) * Math.pow(0.12, delta);
    me.vy = (me.vy + ay * delta) * Math.pow(0.12, delta);
    world.place(index, spot.x + me.vx * delta, spot.y + me.vy * delta);

    // Shrink away, swap to another technology, grow back.
    if (!me.leaving && t > me.switchAt) me.leaving = true;
    me.scale = damp(me.scale, me.leaving ? 0 : 1, me.leaving ? 7 : 4, delta);
    if (me.leaving && me.scale < 0.04) {
      const next = pickName(world.shown, world.shown[index]);
      world.show(index, next);
      setName(next);
      me.leaving = false;
      me.switchAt = t + 3.5 + Math.random() * 4;
    }

    target.position.set(spot.x, spot.y + Math.sin(t * 0.8 + me.phase) * size * 0.05, 0);
    target.scale.setScalar(size * Math.max(me.scale, 0.0001));
    target.rotation.set(
      Math.cos(t * 0.45 + me.phase) * 0.2 - me.vy * 0.05,
      Math.sin(t * 0.6 + me.phase * 1.3) * 0.75 + me.vx * 0.05,
      Math.sin(t * 0.3 + me.phase * 2.1) * 0.06,
    );
  });

  return (
    <group ref={group} scale={0.0001}>
      {/* The artwork is drawn y-down; flipping it keeps the logo upright. */}
      <group scale={[1, -1, 1]}>
        {layers.map((layer, layerIndex) => (
          <mesh key={layerIndex} geometry={layer.geometry}>
            <meshStandardMaterial color={layer.color} roughness={0.3} metalness={0.05} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A few logos, each wandering in its own part of the panel and trading places over time. */
function TechField({ fine }: { fine: boolean }) {
  const viewport = useThree((state) => state.viewport);
  const gl = useThree((state) => state.gl);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const cache = useMemo(() => new Map<string, Layer[]>(), []);

  useEffect(
    () => () => {
      cache.forEach((layers) => layers.forEach((layer) => layer.geometry.dispose()));
      cache.clear();
    },
    [cache],
  );

  useEffect(() => {
    if (!fine) return;
    const handle = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointer.current = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * viewport.width,
        y: (0.5 - (event.clientY - rect.top) / rect.height) * viewport.height,
        active: inside,
      };
    };
    window.addEventListener("pointermove", handle, { passive: true });
    return () => window.removeEventListener("pointermove", handle);
  }, [fine, gl, viewport.width, viewport.height]);

  // Few, large, well-spaced: a grid of areas with one logo drifting in each.
  const columns = Math.max(2, Math.min(6, Math.round(viewport.width / (viewport.height * 0.65))));
  const rows = viewport.height > viewport.width * 0.45 ? 3 : 2;
  const count = Math.min(MAX_ITEMS, columns * rows);
  const cellWidth = viewport.width / columns;
  const cellHeight = viewport.height / rows;
  const size = Math.min(cellWidth, cellHeight) * 0.52;

  const world = useMemo(() => {
    const names: string[] = [];
    for (let i = 0; i < count; i += 1) names.push(pickName(names, undefined));
    const spots: Spot[] = names.map((_, i) => ({
      x: -viewport.width / 2 + (i % columns) * cellWidth + cellWidth / 2,
      y: viewport.height / 2 - Math.floor(i / columns) * cellHeight - cellHeight / 2,
    }));
    return new World(spots, names);
    // The starting layout is taken once per grid; resizing only rescales the areas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, columns]);

  return (
    <>
      {world.shown.map((_, index) => (
        <Wanderer
          key={`${columns}x${rows}-${index}`}
          index={index}
          size={size}
          cell={{
            x: -viewport.width / 2 + (index % columns) * cellWidth + cellWidth / 2,
            y: viewport.height / 2 - Math.floor(index / columns) * cellHeight - cellHeight / 2,
            width: cellWidth,
            height: cellHeight,
          }}
          pointer={pointer}
          world={world}
          cache={cache}
        />
      ))}
    </>
  );
}

type FrameWatcherProps = {
  monitorEnabled: boolean;
  simulateSlow: boolean;
  onReady: () => void;
  onFrame: (count: number) => void;
  onReducePixelRatio: () => void;
  onLowPerformance: () => void;
};

function FrameWatcher({
  monitorEnabled,
  simulateSlow,
  onReady,
  onFrame,
  onReducePixelRatio,
  onLowPerformance,
}: FrameWatcherProps) {
  const monitor = useMemo(() => new FrameMonitor(), []);
  const count = useRef(0);

  useFrame((_, delta) => {
    if (count.current === 0) onReady();
    count.current += 1;
    if (count.current % 30 === 0) onFrame(count.current);
    if (!monitorEnabled) return;
    const action = monitor.push(simulateSlow ? 100 : delta * 1000);
    if (action === "reduce-pixel-ratio") onReducePixelRatio();
    else if (action === "fallback") onLowPerformance();
  });

  return null;
}

/** Automated browsers are not users; their software rendering must not trigger the monitor. */
function isAutomatedBrowser(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

export function HeroScene({
  paused,
  fine,
  simulateSlow,
  onReady,
  onFrame,
  onContextLost,
  onLowPerformance,
}: HeroSceneProps) {
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.5]);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={dpr}
      camera={{ fov: 35, position: [0, 0, 6.2] }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => {
          if (alive.current) onContextLost();
        });
      }}
    >
      <Lights />
      <TechField fine={fine} />
      <FrameWatcher
        monitorEnabled={simulateSlow || !isAutomatedBrowser()}
        simulateSlow={simulateSlow}
        onReady={onReady}
        onFrame={onFrame}
        onReducePixelRatio={() => setDpr(1)}
        onLowPerformance={onLowPerformance}
      />
    </Canvas>
  );
}
