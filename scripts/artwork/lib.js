// Shared helpers for the offline Selected work renders (see run.mjs): a renderer with studio reflections, and a frame
// accumulator that averages many jittered renders (anti-aliasing plus soft area-light shadows).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export { THREE };

export function setup({ width, height, exposure = 1, envIntensity = 1 }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = envIntensity;
  return { renderer, scene, canvas };
}

const halton = (index, base) => {
  let f = 1;
  let r = 0;
  let i = index;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
};

/** A directional light whose position wanders over a disc each frame, for soft shadows. */
export function areaLight(light, centre, radius) {
  return (i) => {
    const a = halton(i + 1, 5) * Math.PI * 2;
    const r = Math.sqrt(halton(i + 1, 7)) * radius;
    light.position.set(centre.x + Math.cos(a) * r, centre.y, centre.z + Math.sin(a) * r);
    light.shadow.needsUpdate = true;
  };
}

export async function accumulate({ renderer, scene, camera, frames = 48, jitter }) {
  const { width, height } = renderer.domElement;
  const gl = renderer.getContext();
  const sum = new Float64Array(width * height * 4);
  const px = new Uint8Array(width * height * 4);
  for (let i = 0; i < frames; i++) {
    jitter?.(i, frames);
    const jx = halton(i + 1, 2) - 0.5;
    const jy = halton(i + 1, 3) - 0.5;
    camera.setViewOffset(width, height, jx, jy, width, height);
    renderer.render(scene, camera);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (let k = 0; k < px.length; k++) sum[k] += px[k];
    if (i % 4 === 3) {
      console.log(`frame ${i + 1}/${frames}`);
      await new Promise((resolve) => setTimeout(resolve));
    }
  }
  camera.clearViewOffset();
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  const image = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = ((height - 1 - y) * width + x) * 4;
      const d = (y * width + x) * 4;
      const a = sum[s + 3];
      if (a <= 0) continue;
      // Blended colour is stored premultiplied (colour times alpha over a clear buffer).
      image.data[d] = Math.min(255, (sum[s] / a) * 255);
      image.data[d + 1] = Math.min(255, (sum[s + 1] / a) * 255);
      image.data[d + 2] = Math.min(255, (sum[s + 2] / a) * 255);
      image.data[d + 3] = a / frames;
    }
  }
  ctx.putImageData(image, 0, 0);
  return out;
}

/** Trims fully transparent edges, keeping a margin, so the PNG is only as big as its object. */
export function trim(canvas, margin = 24) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let x0 = width;
  let y0 = height;
  let x1 = 0;
  let y1 = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 2) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
  x0 = Math.max(0, x0 - margin);
  y0 = Math.max(0, y0 - margin);
  x1 = Math.min(width - 1, x1 + margin);
  y1 = Math.min(height - 1, y1 + margin);
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out
    .getContext("2d")
    .drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** Hands the finished image (WebP, alpha kept) and any data about it back to run.mjs. */
export function finish(canvas, meta) {
  window.__result = {
    webp: canvas.toDataURL("image/webp", 0.9),
    width: canvas.width,
    height: canvas.height,
    meta,
  };
}

/** The site's colour tokens (src/styles/tokens.css), so scenes use the same colours as the page. */
export async function tokens() {
  const css = await (await fetch("/tokens/tokens.css")).text();
  return Object.fromEntries(
    [...css.matchAll(/--(color-[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
  );
}

export function fail(error) {
  window.__error = String(error?.stack ?? error);
}

/** A soft ground that only shows the shadows falling on it. */
export function shadowCatcher(size = 20, opacity = 0.32) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.ShadowMaterial({ opacity }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

export function keyLight(scene, { intensity = 2.2, position = [4, 9, 5], size = 6 } = {}) {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(...position);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  light.shadow.camera.left = -size;
  light.shadow.camera.right = size;
  light.shadow.camera.top = size;
  light.shadow.camera.bottom = -size;
  light.shadow.bias = -0.0004;
  light.shadow.normalBias = 0.02;
  scene.add(light);
  scene.add(light.target);
  return light;
}
