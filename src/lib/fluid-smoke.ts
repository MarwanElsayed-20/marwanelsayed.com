/**
 * A small fluid simulation (stable fluids on the GPU) used for the cursor's smoke. Moving the
 * pointer adds velocity and a puff of ink; the velocity field is advected, swirled (vorticity) and
 * made divergence-free, and the ink is carried along by it, which is what gives the long curling,
 * crescent-shaped wisps. The ink is stored premultiplied so the canvas can sit over the page.
 * Needs WebGL2 with renderable half-float textures; without them `FluidSmoke.create` returns null.
 */

const SIM_RESOLUTION = 100;
const DYE_RESOLUTION = 360;
const PRESSURE_ITERATIONS = 14;
const VELOCITY_DISSIPATION = 0.6;
const DYE_DISSIPATION = 3.2;
const CURL = 34;
/* Thin, short-lived ink: with the original 2.6 / 0.00045 / 3200 the smoke covered about three
   times the screen (mean 6.0% against 2.1% of a 1440x900 page for the same pointer path). */
const SPLAT_RADIUS = 0.0003;
const SPLAT_FORCE = 2400;

const vertexSource = `#version 300 es
in vec2 aPosition;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const header = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 fragColor;
`;

const fragments = {
  splat: `${header}
uniform sampler2D uTarget; uniform float aspectRatio; uniform vec4 color; uniform vec2 point; uniform float radius;
void main() {
  vec2 p = vUv - point; p.x *= aspectRatio;
  vec4 splat = exp(-dot(p, p) / radius) * color;
  fragColor = texture(uTarget, vUv) + splat;
}`,
  advection: `${header}
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  fragColor = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,
  divergence: `${header}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  curl: `${header}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  vorticity: `${header}
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main() {
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C; force.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + force * dt;
  fragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,
  pressure: `${header}
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  fragColor = vec4((L + R + B + T - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: `${header}
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(v, 0.0, 1.0);
}`,
  clear: `${header}
uniform sampler2D uTexture; uniform float value;
void main() { fragColor = value * texture(uTexture, vUv); }`,
  display: `${header}
uniform sampler2D uTexture;
void main() {
  vec4 c = texture(uTexture, vUv);
  float a = clamp(c.a, 0.0, 1.0);
  fragColor = vec4(min(c.rgb, vec3(a)), a);
}`,
};

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };
type Target = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
  texel: [number, number];
};
type Pair = { read: Target; write: Target; swap: () => void };

function size(shortSide: number, aspect: number): [number, number] {
  return aspect >= 1
    ? [Math.round(shortSide * aspect), shortSide]
    : [shortSide, Math.round(shortSide / aspect)];
}

export class FluidSmoke {
  private readonly programs: Record<keyof typeof fragments, Program>;
  private velocity!: Pair;
  private dye!: Pair;
  private divergence!: Target;
  private curlTarget!: Target;
  private pressure!: Pair;
  private readonly quad: WebGLBuffer;
  private aspect = 1;
  /** Seconds the ink in the field is expected to remain visible; the owner stops stepping after it. */
  lastSplat = 0;

  private constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly canvas: HTMLCanvasElement,
  ) {
    const vertex = this.compile(gl.VERTEX_SHADER, vertexSource);
    const build = (source: string): Program => {
      const program = gl.createProgram()!;
      gl.attachShader(program, vertex);
      gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, source));
      gl.bindAttribLocation(program, 0, "aPosition");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("fluid link failed");
      const uniforms: Program["uniforms"] = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i += 1) {
        const name = gl.getActiveUniform(program, i)!.name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return { program, uniforms };
    };
    this.programs = Object.fromEntries(
      Object.entries(fragments).map(([key, source]) => [key, build(source)]),
    ) as FluidSmoke["programs"];
    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.resize();
  }

  /** Returns null when the browser cannot run the simulation. */
  static create(canvas: HTMLCanvasElement): FluidSmoke | null {
    try {
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
      gl.getExtension("OES_texture_float_linear");
      return new FluidSmoke(gl, canvas);
    } catch {
      return null;
    }
  }

  private compile(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("fluid shader failed");
    return shader;
  }

  private target(width: number, height: number): Target {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, framebuffer, width, height, texel: [1 / width, 1 / height] };
  }

  private pair(width: number, height: number): Pair {
    const pair: Pair = {
      read: this.target(width, height),
      write: this.target(width, height),
      swap() {
        [pair.read, pair.write] = [pair.write, pair.read];
      },
    };
    return pair;
  }

  /** Rebuilds the fields for the canvas's current aspect ratio (this empties them). */
  resize() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.aspect = aspect;
    const [simW, simH] = size(SIM_RESOLUTION, aspect);
    const [dyeW, dyeH] = size(DYE_RESOLUTION, aspect);
    this.canvas.width = dyeW;
    this.canvas.height = dyeH;
    this.velocity = this.pair(simW, simH);
    this.dye = this.pair(dyeW, dyeH);
    this.divergence = this.target(simW, simH);
    this.curlTarget = this.target(simW, simH);
    this.pressure = this.pair(simW, simH);
  }

  private use(
    name: keyof typeof fragments,
    target: Target | null,
    uniforms: Record<string, unknown>,
  ) {
    const gl = this.gl;
    const { program, uniforms: locations } = this.programs[name];
    gl.useProgram(program);
    let unit = 0;
    for (const [key, value] of Object.entries(uniforms)) {
      const location = locations[key];
      if (location === undefined) continue;
      if (typeof value === "number") gl.uniform1f(location, value);
      else if (Array.isArray(value)) {
        if (value.length === 2) gl.uniform2f(location, value[0], value[1]);
        else if (value.length === 3) gl.uniform3f(location, value[0], value[1], value[2]);
        else gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      } else {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, (value as Target).texture);
        gl.uniform1i(location, unit);
        unit += 1;
      }
    }
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /**
   * Pushes the fluid along (dx, dy) at a point (x, y in 0..1, y up) and drops ink of the given
   * premultiplied colour there.
   */
  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number, number]) {
    const base = { aspectRatio: this.aspect, point: [x, y], radius: SPLAT_RADIUS };
    this.use("splat", this.velocity.write, {
      ...base,
      uTarget: this.velocity.read,
      texelSize: this.velocity.read.texel,
      color: [dx * SPLAT_FORCE, dy * SPLAT_FORCE, 0, 0],
    });
    this.velocity.swap();
    this.use("splat", this.dye.write, {
      ...base,
      uTarget: this.dye.read,
      texelSize: this.dye.read.texel,
      color,
    });
    this.dye.swap();
    this.lastSplat = performance.now();
  }

  step(dt: number) {
    const v = this.velocity;
    const t = v.read.texel;
    this.use("curl", this.curlTarget, { uVelocity: v.read, texelSize: t });
    this.use("vorticity", v.write, {
      uVelocity: v.read,
      uCurl: this.curlTarget,
      curl: CURL,
      dt,
      texelSize: t,
    });
    v.swap();
    this.use("divergence", this.divergence, { uVelocity: v.read, texelSize: t });
    this.use("clear", this.pressure.write, {
      uTexture: this.pressure.read,
      value: 0.8,
      texelSize: t,
    });
    this.pressure.swap();
    for (let i = 0; i < PRESSURE_ITERATIONS; i += 1) {
      this.use("pressure", this.pressure.write, {
        uPressure: this.pressure.read,
        uDivergence: this.divergence,
        texelSize: t,
      });
      this.pressure.swap();
    }
    this.use("gradient", v.write, {
      uPressure: this.pressure.read,
      uVelocity: v.read,
      texelSize: t,
    });
    v.swap();
    this.use("advection", v.write, {
      uVelocity: v.read,
      uSource: v.read,
      texelSize: t,
      dt,
      dissipation: VELOCITY_DISSIPATION,
    });
    v.swap();
    this.use("advection", this.dye.write, {
      uVelocity: v.read,
      uSource: this.dye.read,
      texelSize: t,
      dt,
      dissipation: DYE_DISSIPATION,
    });
    this.dye.swap();
  }

  render() {
    this.use("display", null, { uTexture: this.dye.read, texelSize: this.dye.read.texel });
  }

  clear() {
    for (const pair of [this.velocity, this.dye, this.pressure]) {
      for (const target of [pair.read, pair.write]) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target.framebuffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      }
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /** The canvas keeps its context (a remount reuses it), so only the fields are emptied. */
  dispose() {
    this.clear();
  }
}
