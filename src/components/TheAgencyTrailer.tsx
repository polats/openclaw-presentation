import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Sequence,
  Html5Video,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useRemotionEnvironment,
  useVideoConfig,
  random,
} from 'remotion';
import {
  ThreeCanvas,
  useOffthreadVideoTexture,
  useVideoTexture,
} from '@remotion/three';
import { SCLAB, SCLAB_FONTS } from './sclab/theme';

// ---------------------------------------------------------------------------
// The Agency — launch trailer (v0)
//
// Beat sheet: see /home/paul/projects/woid/docs/design/trailer.md
// Total: 1500 frames @ 30fps = 50s. Pad warm middle to reach 75s.
//
// All scenes are motion-graphics placeholders evoking the beat. Real
// gameplay capture (`ShelterStage3D.jsx`, build mode, recap stack, etc.)
// will swap in scene-by-scene once trailer-mode capture lands.
// ---------------------------------------------------------------------------

const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"JetBrains Mono", monospace';
const SANS = '"Space Grotesk", Inter, sans-serif';

const COLOR = {
  bg: '#0a0c0e',
  paper: '#e8e6df',
  paperDim: 'rgba(232, 230, 223, 0.55)',
  accent: '#6ec1c4', // Severance-coded faded cyan
  warning: '#c44b3e',
} as const;

// ---------- Scene durations (frames @ 30fps) ----------
// Captured clip is 15.91s ≈ 477f; 480f is a clean integer with margin.
const EDI_VIDEO_FRAMES    = 480;  // 16.0s — full play of edi-intro.mp4
const OPENER_DOLLY_FRAMES = 32;   // 1.07s — fast launch, quick settle
const OPENER_CRACK_FRAMES = 50;   // 1.67s — glass break on the settled phone
const OPENER_TITLE_FRAMES = 110;  // 3.67s — title reveal + hold

// "The Agency" line appears ~13.7s into the trimmed clip (frame 411 at
// 30fps). Computed from timing.json:
//   (target_line_offset_s - trim_start_s) * 30 ≈ (21.64 - 7.94) * 30
const AGENCY_REVEAL_FRAME = 411;

// In-video shader fires 1.5s AFTER the reveal (moved 0.5s earlier).
const SHADER_START_FRAME = AGENCY_REVEAL_FRAME + 45;
// Crack fires 0.25s AFTER the in-video shader.
const CRACK_START_FRAME = SHADER_START_FRAME + 8;
// Title comes in once cracks are mostly drawn (85% of crack window).
const TITLE_START_FRAME = CRACK_START_FRAME + Math.round(OPENER_CRACK_FRAMES * 0.85);

const D = {
  // Phases overlap (crack starts mid-dolly) so total ends at
  // TITLE_START_FRAME + title hold, not sum-of-phases.
  s00_opener: TITLE_START_FRAME + OPENER_TITLE_FRAMES,
  s05_caption1:     90,  // 0:08.5 — "Bond with your agents."
  s06_vignette:    120,  // 0:11.5 — 4 quick gameplay cuts
  s07_recap:        90,  // 0:15.5 — recap card slides in
  s08_warmBeats:   180,  // 0:18.5 — three named moments
  s09_tierUp:       60,  // 0:24.5 — tier indicator advances
  s10_drift:        90,  // 0:26.5 — palette glitch + caption shift
  s11_loop:        150,  // 0:29.5 — same shot, three characters
  s12_corruptRecap:120, // 0:34.5 — corrupted recap card
  s13_strangeRoom:  90,  // 0:38.5 — Tier-N strange floor
  s14_heldFace:     45,  // 0:41.5 — held face + single-frame insert
  s15_black:        60,  // 0:43.0 — black
  s16_titleReturn:  90,  // 0:45.0 — title card with taglines
  s17_cta:          60,  // 0:48.0 — wishlist on Steam
};

export const THE_AGENCY_TOTAL_FRAMES = Object.values(D).reduce((a, b) => a + b, 0);

// ---------- Helpers ----------
const fadeInOut = (frame: number, dur: number, fadeIn = 8, fadeOut = 8) =>
  interpolate(
    frame,
    [0, fadeIn, dur - fadeOut, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

// ============================================================================
// SCENE 00 — Edi tutorial opener (3D + shader)
//
// Phase A: phone mesh dead-on, video plays as VideoTexture on screen
// Phase B: dramatic dolly — spring-driven 3D rotation + translation +
//          scale with a chromatic-aberration / scanline / displacement
//          shader spike during the transition (adapted from woid spell
//          shaders: vertex displacement + RGB chroma shift + scanlines)
// Phase C: "The Agency" SCLAB-styled title slams in centered, phone
//          rests tilted in lower-right
// ============================================================================

const PHONE_ASPECT_H_OVER_W = 932 / 430;
const BEZEL_PADDING = 0.07;
const PHONE_PLANE_HEIGHT = 1000;
const PHONE_PLANE_WIDTH = PHONE_PLANE_HEIGHT / PHONE_ASPECT_H_OVER_W;
// Depth of the phone body — ratio chosen so the device reads as
// chunky/holdable when tilted, without looking like a brick. Real
// phones are ~10% the width; we go slightly thicker (~12%) for
// readable volume at trailer scale.
const PHONE_DEPTH = PHONE_PLANE_WIDTH * 0.12;

// Phone rests in lower-right, screen FACING LEFT (negative Y rotation,
// counter-clockwise roll). The screen surface presents itself toward
// the upper-left where the title lives.
const REST_POSE = {
  position: [640, -260, 60] as [number, number, number],
  rotation: [-0.12, -0.52, -0.18] as [number, number, number],
  scale: 0.40,
};

const EDI_VIDEO_SRC = staticFile('trailer/edi-intro.mp4');

// ── Custom shader for the phone screen ──────────────────────────────
// Adapted from woid's `src/lib/spellRuntime.js` MESH_FRAG / MESH_VERT
// pattern: cheap value-noise displacement on vertex stage, chromatic
// aberration + scanlines in fragment stage. uIntensity controls how
// hot the effect is — animated 0 → 1 → 0 across the dolly transition.
const PHONE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PHONE_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uIntensity;
  uniform float uCrack;
  uniform float uTime;
  uniform float uHasMap;

  // Hash for voronoi cell centers.
  vec2 hash22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  // Voronoi second-min distance — small near cell boundaries, large
  // inside cells. Difference (secondMin - minDist) gives crack lines.
  float voronoiCracks(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float minDist = 8.0;
    float secondMin = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = hash22(i + g);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if (d < minDist) {
          secondMin = minDist;
          minDist = d;
        } else if (d < secondMin) {
          secondMin = d;
        }
      }
    }
    return sqrt(secondMin) - sqrt(minDist);
  }

  void main() {
    // Chromatic aberration scales with uIntensity (in-video shader beats).
    vec2 dir = vUv - 0.5;
    float chroma = uIntensity * 0.045;
    vec4 cR = texture2D(uMap, vUv + dir * chroma);
    vec4 cG = texture2D(uMap, vUv);
    vec4 cB = texture2D(uMap, vUv - dir * chroma);
    vec3 col = vec3(cR.r, cG.g, cB.b);
    if (uHasMap < 0.5) col = vec3(0.03, 0.04, 0.05);

    // Scanlines pulsing with intensity
    float scan = 1.0 - 0.18 * uIntensity * (0.5 + 0.5 * sin(vUv.y * 720.0 + uTime * 24.0));
    col *= scan;

    // Edge vignette highlight
    float edge = smoothstep(0.45, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    col += vec3(0.6, 0.4, 0.2) * edge * uIntensity * 0.6;

    // ── GLASS CRACKING ──────────────────────────────────────────────
    // Two layers of voronoi cells (big shards + finer sub-cracks) that
    // grow outward from an impact point. uCrack ∈ [0, 1] drives both
    // the radius of the crack field and the crack-line darkness.
    if (uCrack > 0.0) {
      vec2 impact = vec2(0.5, 0.55);
      float distFromImpact = length(vUv - impact);

      // Radius grows over [0, 1] then settles; clamp so cracks persist.
      float radius = smoothstep(0.0, 0.5, uCrack) * 1.4;
      float withinRadius = 1.0 - smoothstep(radius - 0.15, radius, distFromImpact);

      // Primary cracks — large irregular shards
      float crackDist1 = voronoiCracks(vUv * 7.0);
      float crack1 = 1.0 - smoothstep(0.0, 0.06, crackDist1);

      // Secondary cracks — finer sub-shards offset so they don't align
      float crackDist2 = voronoiCracks(vUv * 18.0 + vec2(13.0, 7.0));
      float crack2 = (1.0 - smoothstep(0.0, 0.04, crackDist2)) * 0.65;

      float cracks = max(crack1, crack2) * withinRadius * uCrack;

      // Refraction: offset texture sample slightly along crack lines so
      // each shard looks slightly displaced (broken glass refraction).
      vec2 refractDir = normalize(vUv - impact) * cracks * 0.012;
      vec3 refracted = texture2D(uMap, vUv + refractDir).rgb;
      col = mix(col, refracted, cracks * 0.6);

      // Dark crack lines
      col = mix(col, vec3(0.01, 0.02, 0.03), cracks * 0.65);
      // Bright glass-edge highlights along the sharp crack
      col += vec3(1.0, 0.92, 0.75) * pow(cracks, 5.0) * 1.6;

      // Subtle impact flash — bright bloom at the impact point during onset
      float flashWindow = smoothstep(0.0, 0.15, uCrack) * (1.0 - smoothstep(0.15, 0.4, uCrack));
      float flash = exp(-distFromImpact * 6.0) * flashWindow;
      col += vec3(1.0, 0.85, 0.65) * flash * 1.2;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Shader spikes now only run AFTER Edi says "The Agency" (frame 294).
// Two beats: a big initial spike right on the reveal, then a sustained
// pulse leading into the dolly transition.
// Spikes start 2s after the reveal. First peak is sharp, second
// sustains into the dolly handoff.
const POST_REVEAL_SPIKES: Array<{ at: number; halfWidth: number; amp: number }> = [
  { at: SHADER_START_FRAME,      halfWidth: 10, amp: 0.85 }, // sharp onset
  { at: SHADER_START_FRAME + 25, halfWidth: 18, amp: 0.55 }, // sustained pulse → dolly
];

const spikeAt = (t: number, peak: number, halfWidth: number) => {
  const x = (t - peak) / halfWidth;
  return Math.exp(-x * x);
};

const computePostRevealIntensity = (frame: number): number => {
  if (frame < AGENCY_REVEAL_FRAME) return 0;
  let v = 0;
  for (const s of POST_REVEAL_SPIKES) v += s.amp * spikeAt(frame, s.at, s.halfWidth);
  return Math.min(1, v);
};

const PhoneMesh: React.FC<{
  texture: THREE.Texture | null;
}> = ({ texture }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Spring-driven dolly: fast off the line, settles cleanly ─────
  // High stiffness + low mass for a snappy launch, with overshoot
  // clamped so the phone arrives at its rest pose without bouncing.
  const dollyT = spring({
    frame: frame - EDI_VIDEO_FRAMES,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.7, overshootClamping: true },
    durationInFrames: OPENER_DOLLY_FRAMES,
  });
  const dollyClamped = Math.max(0, Math.min(1, dollyT));

  // ── Phase intensities ────────────────────────────────────────────
  // In-video shader fires 2s after the reveal (SHADER_START_FRAME).
  const dollyIntensity = Math.sin(Math.PI * dollyClamped) * 1.0;
  const postRevealIntensity = computePostRevealIntensity(frame);
  const shaderIntensity = Math.max(postRevealIntensity, dollyIntensity);

  // Glass-crack progress: starts 0.5s after the in-video shader,
  // independent of whether the phone has reached its destination.
  const crackStart = CRACK_START_FRAME;
  const crackEnd = crackStart + OPENER_CRACK_FRAMES;
  const crackT = interpolate(frame, [crackStart, crackEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Persistent cracks after the breakage window — keep them visible.
  const crackVisible = frame >= crackStart ? Math.max(crackT, 0.95) : 0;

  // Phone shake during the crack impact (only frames crackStart..+12)
  const shakeT = frame < crackStart
    ? 0
    : interpolate(frame, [crackStart, crackStart + 12], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
  const shakeAmp = shakeT * 18;
  const shakeX = Math.sin(frame * 1.3) * shakeAmp;
  const shakeY = Math.cos(frame * 1.7) * shakeAmp * 0.6;
  const shakeRZ = Math.sin(frame * 2.1) * shakeT * 0.04;

  // ── Pose ─────────────────────────────────────────────────────────
  const px = interpolate(dollyT, [0, 1], [0, REST_POSE.position[0]]) + shakeX;
  const py = interpolate(dollyT, [0, 1], [0, REST_POSE.position[1]]) + shakeY;
  const pz = interpolate(dollyT, [0, 1], [0, REST_POSE.position[2]]);
  const rx = interpolate(dollyT, [0, 1], [0, REST_POSE.rotation[0]]);
  const ry = interpolate(dollyT, [0, 1], [0, REST_POSE.rotation[1]]);
  const rz = interpolate(dollyT, [0, 1], [0, REST_POSE.rotation[2]]) + shakeRZ;
  // Subtle punch-in during the dolly; no more after settle.
  const punch = Math.sin(Math.PI * dollyClamped) * 0.04;
  const sc = interpolate(dollyT, [0, 1], [1, REST_POSE.scale]) + punch;

  // Material — recreated when the texture binds.
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PHONE_VERT,
      fragmentShader: PHONE_FRAG,
      uniforms: {
        uMap: { value: texture },
        uHasMap: { value: texture ? 1 : 0 },
        uIntensity: { value: 0 },
        uCrack: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture]);

  material.uniforms.uIntensity.value = shaderIntensity;
  material.uniforms.uCrack.value = crackVisible;
  material.uniforms.uTime.value = frame / fps;
  if (texture && material.uniforms.uMap.value !== texture) {
    material.uniforms.uMap.value = texture;
    material.uniforms.uHasMap.value = 1;
  }

  const bezelW = PHONE_PLANE_WIDTH * (1 + BEZEL_PADDING);
  const bezelH = PHONE_PLANE_HEIGHT * (1 + BEZEL_PADDING);

  return (
    <group position={[px, py, pz]} rotation={[rx, ry, rz]} scale={sc}>
      {/* Phone body — a real 3D box so the device shows volume when
          rotated. Lit by the scene's ambient + directional lights via
          MeshStandardMaterial. Centered behind z=0 so the screen
          plane sits flush with the front face. */}
      <mesh position={[0, 0, -PHONE_DEPTH / 2]}>
        <boxGeometry args={[bezelW, bezelH, PHONE_DEPTH]} />
        <meshStandardMaterial
          color={SCLAB.ink['200']}
          roughness={0.55}
          metalness={0.35}
        />
      </mesh>
      {/* Screen — front face of the phone, custom shader. Lifted just
          past z=0 to avoid z-fighting with the box front. */}
      <mesh position={[0, 0, 0.5]} material={material}>
        <planeGeometry args={[PHONE_PLANE_WIDTH, PHONE_PLANE_HEIGHT]} />
      </mesh>
    </group>
  );
};

// ── Fullscreen backdrop shader for the title reveal ─────────────────
// A noise-driven static burst that flashes at title entry and decays
// to a subtle scanline veil. Adapted from the same noise/aberration
// pattern as the phone-screen shader, but covering the whole comp.
const SLIDE_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uReveal;     // 0..1 over the burst window
  uniform float uTime;
  uniform vec2  uResolution;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 78.233);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;

    // Static burst — reduced amplitude per "lessen the effect" note.
    float burst = exp(-pow(uReveal * 6.0, 1.4));
    float n = hash21(uv * uResolution + uTime * 60.0);

    float scan = 0.5 + 0.5 * sin(uv.y * uResolution.y * 1.8 + uTime * 12.0);
    float scanA = mix(0.0, 0.06, burst) + uReveal * 0.02;

    vec2 d = uv - 0.5;
    float vig = 1.0 - smoothstep(0.25, 0.85, length(d) * 1.4);

    // Tear bands lessened — quieter overall ambience.
    float band = step(0.996, fract(uv.y * 28.0 + uTime * 6.0)) * burst * 0.18;

    vec3 col = vec3(0.0);
    col += vec3(1.0, 0.55, 0.18) * n * burst * 0.18;
    col += vec3(1.0, 0.55, 0.18) * scan * scanA;
    col += vec3(1.0) * band;
    col += vec3(0.08, 0.05, 0.03) * vig * (1.0 - burst * 0.5) * (1.0 - uReveal * 0.2);

    // Lower alpha so the backdrop sits behind the title without
    // competing with it.
    float a = burst * 0.45 + (1.0 - burst) * 0.18 * (1.0 - uReveal);
    gl_FragColor = vec4(col, a);
  }
`;

const SLIDE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const TitleBackdropShader: React.FC<{ reveal: number }> = ({ reveal }) => {
  const frame = useCurrentFrame();
  const { fps, width: compW, height: compH } = useVideoConfig();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SLIDE_VERT,
      fragmentShader: SLIDE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uReveal: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(compW, compH) },
      },
    });
  }, [compW, compH]);

  material.uniforms.uReveal.value = reveal;
  material.uniforms.uTime.value = frame / fps;

  // Fullscreen quad in clip space (vertex shader bypasses camera).
  return (
    <mesh material={material} renderOrder={999}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

const Scene00_EdiOpener: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: compW, height: compH, fps } = useVideoConfig();
  const env = useRemotionEnvironment();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ── Texture binding ──────────────────────────────────────────────
  // Conditional-hook pattern straight from the Remotion docs:
  // useOffthreadVideoTexture() throws if called in preview, and
  // useVideoTexture() needs a real <video> ref that only exists in
  // preview. So we branch on env.isRendering with rules-of-hooks
  // disabled — the branch is stable for the lifetime of the render,
  // so React's hook ordering stays consistent within each mode.
  let texture: THREE.Texture | null;
  if (env.isRendering) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    texture = useOffthreadVideoTexture({ src: EDI_VIDEO_SRC });
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    texture = useVideoTexture(videoRef);
  }

  // Title appears once cracks are mostly drawn.
  const titleStart = TITLE_START_FRAME;
  const titleSpring = spring({
    frame: frame - titleStart,
    fps,
    config: { damping: 9, stiffness: 130, mass: 1.0 },
  });
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0.78, 1]);
  const titleSlide = interpolate(titleSpring, [0, 1], [40, 0]);
  const subtitleOpacity = interpolate(frame, [titleStart + 24, titleStart + 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Backdrop-shader reveal envelope: 0 before title, burst at title
  // start, decays to a calm scanline veil during the hold.
  const slideReveal = interpolate(
    frame,
    [titleStart - 4, titleStart + 4, titleStart + 90],
    [0, 0.0, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const slideActive = frame >= titleStart - 4;

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      {/* Hidden video element drives preview-mode VideoTexture */}
      {!env.isRendering && (
        <Html5Video
          ref={videoRef}
          src={EDI_VIDEO_SRC}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
          muted
        />
      )}

      <ThreeCanvas
        width={compW}
        height={compH}
        camera={{ position: [0, 0, 1700], fov: 35, near: 1, far: 4000 }}
      >
        {/* Lighting — fills + key. Without these the phone body
            (MeshStandardMaterial) renders black and the volume is
            invisible. The screen shader is unlit by design. */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[400, 800, 900]} intensity={1.2} />
        <directionalLight position={[-600, -300, 400]} intensity={0.35} color={'#ffd6a8'} />

        <PhoneMesh texture={texture} />
        {slideActive && <TitleBackdropShader reveal={slideReveal} />}
      </ThreeCanvas>

      {/* SCLAB-styled title — Instrument Serif, signal-orange eyebrow */}
      {frame >= titleStart && (
        <AbsoluteFill style={{ alignItems: 'flex-start', justifyContent: 'center', pointerEvents: 'none' }}>
          <div
            style={{
              marginLeft: 140,
              marginTop: -40,
              transform: `translateY(${titleSlide}px) scale(${titleScale})`,
              transformOrigin: 'left center',
              opacity: titleOpacity,
            }}
          >
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '1.1rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: SCLAB.signal['500'],
                marginBottom: 28,
              }}
            >
              [ TRANSMISSION 001 ]
            </div>
            <h1
              style={{
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14rem',
                lineHeight: 0.92,
                letterSpacing: '-0.015em',
                color: SCLAB.bone['900'],
                margin: 0,
              }}
            >
              The Agency
            </h1>
            <div
              style={{
                width: 140,
                height: 2,
                backgroundColor: SCLAB.signal['500'],
                margin: '40px 0 28px',
              }}
            />
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '2rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: SCLAB.bone['700'],
                opacity: subtitleOpacity,
                fontWeight: 500,
              }}
            >
              Break out of the loop
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 05 — Held caption: "Bond with your agents."
// ============================================================================
const Scene05_Caption1: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, D.s05_caption1, 10, 12);
  const charDrift = interpolate(frame, [0, D.s05_caption1], [0, -4]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64 }}>
        {/* held still glyph */}
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <div style={{ position: 'absolute', inset: 0, border: `1px solid ${COLOR.paperDim}` }} />
          <div
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: 10, height: 10,
              background: COLOR.paper,
              transform: `translate(-50%, calc(-50% + ${charDrift}px))`,
            }}
          />
        </div>
        <div
          style={{
            color: COLOR.paper,
            fontFamily: SERIF,
            fontSize: 48,
            letterSpacing: '0.04em',
            fontStyle: 'italic',
          }}
        >
          Bond with your agents.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 06 — Vignette montage (4 rapid cuts: build / palette / approve / schedule)
// ============================================================================
const VignetteFrame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'relative', width: 560, height: 340, border: `1px solid ${COLOR.paperDim}` }}>
      {children}
      <div
        style={{
          position: 'absolute', left: 0, bottom: -28,
          fontFamily: MONO, fontSize: 13,
          color: COLOR.paperDim, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  </AbsoluteFill>
);

const Scene06_Vignettes: React.FC = () => {
  const each = Math.floor(D.s06_vignette / 4);
  return (
    <>
      <Sequence from={0} durationInFrames={each}>
        <VignetteFrame label="build">
          {/* placing a room */}
          <RoomPlacing />
        </VignetteFrame>
      </Sequence>
      <Sequence from={each} durationInFrames={each}>
        <VignetteFrame label="palette">
          <PaletteSwatch />
        </VignetteFrame>
      </Sequence>
      <Sequence from={each * 2} durationInFrames={each}>
        <VignetteFrame label="approve / decline">
          <ApproveCard />
        </VignetteFrame>
      </Sequence>
      <Sequence from={each * 3} durationInFrames={D.s06_vignette - each * 3}>
        <VignetteFrame label="schedule">
          <ScheduleSlots />
        </VignetteFrame>
      </Sequence>
    </>
  );
};

const RoomPlacing: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 25], [0, 200], { extrapolateRight: 'clamp' });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: 'absolute', left: 60 + i * 140, top: 200, width: 120, height: 80,
          border: `1px solid ${COLOR.paperDim}`,
        }} />
      ))}
      <div style={{
        position: 'absolute', left: 60 + x, top: 80, width: 120, height: 80,
        border: `1px solid ${COLOR.accent}`,
        background: `${COLOR.accent}1a`,
      }} />
    </>
  );
};

const PaletteSwatch: React.FC = () => {
  const colors = ['#6ec1c4', '#c4a26e', '#a26ec4', '#6e8ac4'];
  const f = useCurrentFrame();
  const idx = Math.min(colors.length - 1, Math.floor(f / 8));
  return (
    <div style={{ position: 'absolute', inset: 40, display: 'flex', gap: 12 }}>
      {colors.map((c, i) => (
        <div key={c} style={{
          flex: 1,
          background: c,
          opacity: i <= idx ? 1 : 0.15,
          transform: i === idx ? 'translateY(-4px)' : 'translateY(0)',
        }} />
      ))}
    </div>
  );
};

const ApproveCard: React.FC = () => {
  const f = useCurrentFrame();
  const slideIn = interpolate(f, [0, 14], [40, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: 80, right: 80, top: 80,
      transform: `translateY(${slideIn}px)`,
      padding: 24, border: `1px solid ${COLOR.paper}`, background: COLOR.bg,
    }}>
      <div style={{ fontFamily: SERIF, fontSize: 22, color: COLOR.paper, marginBottom: 14 }}>
        Mara is asking for the afternoon off.
      </div>
      <div style={{ display: 'flex', gap: 14, fontFamily: MONO, fontSize: 13, letterSpacing: '0.2em' }}>
        <div style={{ padding: '6px 14px', border: `1px solid ${COLOR.accent}`, color: COLOR.accent }}>APPROVE</div>
        <div style={{ padding: '6px 14px', border: `1px solid ${COLOR.paperDim}`, color: COLOR.paperDim }}>DECLINE</div>
      </div>
    </div>
  );
};

const ScheduleSlots: React.FC = () => (
  <div style={{ position: 'absolute', inset: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
    {['MORNING', 'MIDDAY', 'AFTERNOON', 'NIGHT'].map((s, i) => (
      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: COLOR.paperDim, letterSpacing: '0.2em', width: 110 }}>{s}</div>
        <div style={{ flex: 1, height: 16, background: i < 3 ? `${COLOR.accent}55` : 'transparent', border: `1px solid ${COLOR.paperDim}` }} />
      </div>
    ))}
  </div>
);

// ============================================================================
// SCENE 07 — Recap card slides in, holds on one killer line
// ============================================================================
const Scene07_Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 18], [60, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeInOut(frame, D.s07_recap, 10, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{
        width: 880, padding: '48px 56px', border: `1px solid ${COLOR.paper}`, background: COLOR.bg,
        transform: `translateY(${slide}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: COLOR.paperDim, letterSpacing: '0.3em', marginBottom: 18 }}>
          DAY 03 — RECAP
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, color: COLOR.paper, lineHeight: 1.4 }}>
          She liked how the apartment sounded before anyone was up.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 08 — Three warm beats (named characters, specific moments)
// ============================================================================
const Scene08_WarmBeats: React.FC = () => {
  const each = Math.floor(D.s08_warmBeats / 3);
  return (
    <>
      <Sequence from={0} durationInFrames={each}>
        <NamedBeat name="MARA" line="claimed the window seat by the kettle." />
      </Sequence>
      <Sequence from={each} durationInFrames={each}>
        <NamedBeat name="TOMEK" line="said her sketches were getting bolder." />
      </Sequence>
      <Sequence from={each * 2} durationInFrames={D.s08_warmBeats - each * 2}>
        <NamedBeat name="BO" line="insists it's not cold. It's cold." />
      </Sequence>
    </>
  );
};

const NamedBeat: React.FC<{ name: string; line: string }> = ({ name, line }) => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, 60, 8, 8);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, maxWidth: 900 }}>
        <div style={{
          width: 80, height: 80, border: `1px solid ${COLOR.paperDim}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 10, height: 10, background: COLOR.paper }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 13, color: COLOR.accent, letterSpacing: '0.4em' }}>{name}</div>
        <div style={{ fontFamily: SERIF, fontSize: 36, color: COLOR.paper, textAlign: 'center', lineHeight: 1.35 }}>
          {line}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 09 — Tier-up (new floor unlocks below)
// ============================================================================
const Scene09_TierUp: React.FC = () => {
  const frame = useCurrentFrame();
  const fillT = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const newRow = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = fadeInOut(frame, D.s09_tierUp, 6, 6);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: COLOR.paperDim, letterSpacing: '0.4em' }}>FACILITY TIER 02 → 03</div>
        <div style={{ width: 360, height: 4, background: `${COLOR.paperDim}` }}>
          <div style={{ width: `${fillT * 100}%`, height: '100%', background: COLOR.accent }} />
        </div>
        <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ height: 36, border: `1px solid ${COLOR.paperDim}` }} />
          ))}
          <div style={{
            height: 36, border: `1px solid ${COLOR.accent}`,
            opacity: newRow,
            transform: `translateY(${(1 - newRow) * -8}px)`,
            background: `${COLOR.accent}1a`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 10 — Drift: palette glitches, caption now reads ominous
// ============================================================================
const Scene10_Drift: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, D.s10_drift, 8, 10);
  // single-frame palette corruption every ~20 frames
  const glitch = frame % 20 < 1 ? 1 : 0;
  const shift = glitch ? 6 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            fontFamily: SERIF, fontSize: 56, color: COLOR.paper, letterSpacing: '0.02em',
            position: 'relative',
            transform: `translateX(${shift}px)`,
          }}
        >
          Every story is different.
        </div>
        {glitch === 1 && (
          <div
            style={{
              position: 'absolute', inset: 0,
              fontFamily: SERIF, fontSize: 56, color: COLOR.warning, letterSpacing: '0.02em',
              transform: 'translateX(-6px)', mixBlendMode: 'screen' as any,
              opacity: 0.6,
            }}
          >
            Every story is different.
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 11 — The loop: same shift-arrival walk, three different characters
// ============================================================================
const Scene11_Loop: React.FC = () => {
  // three sub-sequences, each compressing in duration
  const dur1 = 60;
  const dur2 = 50;
  const dur3 = 40;
  return (
    <>
      <Sequence from={0} durationInFrames={dur1}>
        <LoopTraversal accent={COLOR.accent} />
      </Sequence>
      <Sequence from={dur1} durationInFrames={dur2}>
        <LoopTraversal accent={'#c4a26e'} />
      </Sequence>
      <Sequence from={dur1 + dur2} durationInFrames={dur3}>
        <LoopTraversal accent={'#a26ec4'} />
      </Sequence>
    </>
  );
};

const LoopTraversal: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 880, height: 200 }}>
        {/* corridor */}
        <div style={{ position: 'absolute', top: 100, left: 0, right: 0, height: 1, background: COLOR.paperDim }} />
        {/* entrance */}
        <div style={{ position: 'absolute', left: 0, top: 90, width: 16, height: 20, background: accent }} />
        {/* dot */}
        <div style={{
          position: 'absolute', left: t * 820, top: 95, width: 10, height: 10, background: COLOR.paper,
        }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 12 — Corrupted recap card
// ============================================================================
const Scene12_CorruptRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, D.s12_corruptRecap, 8, 12);
  const scrambleSeed = Math.floor(frame / 4);
  const scrambled = scrambleText('She liked how the apartment sounded before anyone was up.', scrambleSeed, 0.4);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{
        width: 880, padding: '48px 56px', border: `1px solid ${COLOR.warning}`, background: COLOR.bg,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: COLOR.warning, letterSpacing: '0.3em', marginBottom: 18 }}>
          DAY {String(scrambleSeed % 99).padStart(2, '0')} — RECAP
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, color: COLOR.paper, lineHeight: 1.4 }}>
          {scrambled}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const scrambleText = (text: string, seed: number, rate: number): string => {
  const glyphs = '█▓▒░◊◌○●◯◍';
  return text
    .split('')
    .map((ch, i) => {
      if (ch === ' ') return ch;
      const r = random(`${seed}-${i}`);
      if (r < rate) {
        return glyphs[Math.floor(random(`${seed}-${i}-g`) * glyphs.length)];
      }
      return ch;
    })
    .join('');
};

// ============================================================================
// SCENE 13 — Tier-N strange-floor room (geometry distorts)
// ============================================================================
const Scene13_StrangeRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, D.s13_strangeRoom, 10, 10);
  const skew = interpolate(frame, [0, D.s13_strangeRoom], [0, 4]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{
        width: 720, height: 420, position: 'relative',
        border: `1px solid ${COLOR.paperDim}`,
        transform: `perspective(900px) rotateY(${skew}deg)`,
      }}>
        {/* unfamiliar interior — vertical lines, off rhythm */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${(i / 9) * 100 + Math.sin(i * 1.7) * 3}%`,
            width: 1, background: COLOR.paperDim,
          }} />
        ))}
        {/* the still figure */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14, height: 14, background: COLOR.paper,
        }} />
        {/* blank nameplate */}
        <div style={{
          position: 'absolute', left: '50%', top: '62%',
          transform: 'translateX(-50%)',
          width: 140, height: 14,
          border: `1px solid ${COLOR.paperDim}`,
        }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 14 — Held face + single-frame insert
// ============================================================================
const Scene14_HeldFace: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, D.s14_heldFace, 4, 4);
  // single-frame insert near the middle
  const insert = frame === Math.floor(D.s14_heldFace * 0.55);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      {insert ? (
        <div style={{
          fontFamily: SERIF, fontSize: 140, color: COLOR.warning, letterSpacing: '0.08em',
        }}>
          INNIE
        </div>
      ) : (
        <div style={{ position: 'relative', width: 160, height: 200 }}>
          {/* face placeholder — two dots and a line */}
          <div style={{ position: 'absolute', left: 40, top: 70, width: 10, height: 10, background: COLOR.paper }} />
          <div style={{ position: 'absolute', right: 40, top: 70, width: 10, height: 10, background: COLOR.paper }} />
          <div style={{ position: 'absolute', left: 50, right: 50, top: 130, height: 2, background: COLOR.paper }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 15 — Black
// ============================================================================
const Scene15_Black: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLOR.bg }} />
);

// ============================================================================
// SCENE 16 — Title return with taglines
// ============================================================================
const Scene16_TitleReturn: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
        <div style={{
          color: COLOR.paper, fontFamily: SERIF, fontSize: 96, letterSpacing: '0.16em',
          opacity: titleOpacity, textTransform: 'none',
        }}>
          The Agency
        </div>
        <div style={{
          color: COLOR.paperDim, fontFamily: SERIF, fontSize: 24, fontStyle: 'italic',
          opacity: taglineOpacity, letterSpacing: '0.06em',
        }}>
          Bond with your agents. Break out of the loop.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 17 — Wishlist CTA
// ============================================================================
const Scene17_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = fadeInOut(frame, D.s17_cta, 10, 6);
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg, alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{
        fontFamily: MONO, fontSize: 22, color: COLOR.paper,
        letterSpacing: '0.4em', textTransform: 'uppercase',
        padding: '20px 36px', border: `1px solid ${COLOR.paper}`,
      }}>
        Wishlist on Steam
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// COMPOSITION
// ============================================================================
export const TheAgencyTrailer: React.FC = () => {
  let f = 0;
  const seq = (dur: number, node: React.ReactNode, key: string) => {
    const el = (
      <Sequence key={key} from={f} durationInFrames={dur}>
        {node}
      </Sequence>
    );
    f += dur;
    return el;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg }}>
      {seq(D.s00_opener,        <Scene00_EdiOpener />,     's00')}
      {seq(D.s05_caption1,      <Scene05_Caption1 />,      's05')}
      {seq(D.s06_vignette,      <Scene06_Vignettes />,     's06')}
      {seq(D.s07_recap,         <Scene07_Recap />,         's07')}
      {seq(D.s08_warmBeats,     <Scene08_WarmBeats />,     's08')}
      {seq(D.s09_tierUp,        <Scene09_TierUp />,        's09')}
      {seq(D.s10_drift,         <Scene10_Drift />,         's10')}
      {seq(D.s11_loop,          <Scene11_Loop />,          's11')}
      {seq(D.s12_corruptRecap,  <Scene12_CorruptRecap />,  's12')}
      {seq(D.s13_strangeRoom,   <Scene13_StrangeRoom />,   's13')}
      {seq(D.s14_heldFace,      <Scene14_HeldFace />,      's14')}
      {seq(D.s15_black,         <Scene15_Black />,         's15')}
      {seq(D.s16_titleReturn,   <Scene16_TitleReturn />,   's16')}
      {seq(D.s17_cta,           <Scene17_CTA />,           's17')}
    </AbsoluteFill>
  );
};
