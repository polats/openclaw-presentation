import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Html5Video,
  OffthreadVideo,
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
const OPENER_TITLE_FRAMES = 55;   // 1.83s — title reveal + hold + static-transition tail (S00 ends at frame 535)
const OPENER_TRANSITION_FRAMES = 4; // last 4 frames of S00 are a full-bleed static-shader transition

// "The Agency" line appears ~13.7s into the trimmed clip (frame 411 at
// 30fps). Computed from timing.json:
//   (target_line_offset_s - trim_start_s) * 30 ≈ (21.64 - 7.94) * 30
const AGENCY_REVEAL_FRAME = 411;

// In-video shader fires 1.5s AFTER the reveal (moved 0.5s earlier).
const SHADER_START_FRAME = AGENCY_REVEAL_FRAME + 45;
// Crack fires 0.25s AFTER the in-video shader.
const CRACK_START_FRAME = SHADER_START_FRAME + 8;
// Title + slide backdrop appear AT THE SAME MOMENT the phone starts
// to dolly. The phone moving and the title slamming in are
// synchronized — one moment, two simultaneous beats.
const TITLE_START_FRAME = EDI_VIDEO_FRAMES;

// ── Scene 01: Agency-gameplay video durations ───────────────────────
// agency-gameplay.mp4 is ~11.97s = 359f. The video plays from frame 0;
// the caption overlays the video early and fades out so the rest of
// the clip reads clean.
const AGENCY_VIDEO_FRAMES         = 360;  // 12.0s — gameplay video
const AGENCY_CAPTION_FADEIN       = 14;   // 0.47s
const AGENCY_CAPTION_HOLD         = 70;   // 2.33s — caption visible
const AGENCY_CAPTION_FADEOUT      = 22;   // 0.73s

const D = {
  // Phases overlap (crack starts mid-dolly) so total ends at
  // TITLE_START_FRAME + title hold, not sum-of-phases.
  s00_opener:         TITLE_START_FRAME + OPENER_TITLE_FRAMES,

  // ── Six narrative beats added after the gameplay reveal ─────────
  // Compressed so s07 starts at frame 1440 (s00 531 + s01..s06 909).
  s01_agencyGameplay: 191,  // 6.37s
  s02_surfaceLoop:    144,  // 4.8s — "Shifts. Stations. Quotas."
  s03_conversations:  128,  // 4.27s — "Talk to them. They'll talk back."
  s04_emergence:      144,  // 4.8s — split captions
  s05_bondLoop:       222,  // 7.4s — "Deeper bonds. Deeper rooms. Deeper truths."
  s06_tierUp:         80,   // 2.67s — silent FOSH/Castles tier-up
  s07_puncture:       180,  // 6s — "Make them remember."

  // Closer
  s15_black:           60,  // 2s — black
  s16_titleReturn:     90,  // 3s — title card with taglines
  s17_cta:             60,  // 2s — wishlist on Steam
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

// Aspect (height / width) of the captured edi-intro.mp4. The capture
// script measures the phone's pixel bounds directly from the recording
// (Wayland fractional scaling makes DOM coords unreliable), so the
// dimensions drift. Check the script's "Phone aspect (h/w)" log line
// after each capture and update here.
const PHONE_ASPECT_H_OVER_W = 808 / 406;
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
  // uBoost (0..1) ramps the static into a full-bleed transition:
  // pushes noise + scanline amplitudes up and forces alpha to 1.0.
  // Used at the end of Scene00 to wipe into the next scene.
  uniform float uBoost;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 78.233);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = vUv;

    // Static burst — reduced amplitude for the title-appearance moment.
    float burst = exp(-pow(uReveal * 6.0, 1.4));
    float n = hash21(uv * uResolution + uTime * 60.0);

    float scan = 0.5 + 0.5 * sin(uv.y * uResolution.y * 1.8 + uTime * 12.0);
    float scanA = mix(0.0, 0.06, burst) + uReveal * 0.02;

    vec2 d = uv - 0.5;
    float vig = 1.0 - smoothstep(0.25, 0.85, length(d) * 1.4);

    float band = step(0.996, fract(uv.y * 28.0 + uTime * 6.0)) * burst * 0.18;

    // Boost-aware noise amplitude: gentle for title burst, white-noise
    // wash for the transition burst.
    float noiseAmp = mix(0.18, 1.0, uBoost);

    vec3 col = vec3(0.0);
    col += vec3(1.0, 0.55, 0.18) * n * burst * noiseAmp;
    col += vec3(1.0, 0.55, 0.18) * scan * scanA;
    col += vec3(1.0) * band;
    // During boost: blend the noise toward grayscale so the transition
    // reads as "TV static" rather than colored fizz.
    col = mix(col, vec3(n), uBoost * burst * 0.85);
    col += vec3(0.08, 0.05, 0.03) * vig * (1.0 - burst * 0.5) * (1.0 - uReveal * 0.2);

    // Alpha — subtle for title, full-coverage for transition burst.
    float baseA = burst * 0.45 + (1.0 - burst) * 0.18 * (1.0 - uReveal);
    float a = mix(baseA, burst, uBoost);
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

const TitleBackdropShader: React.FC<{ reveal: number; boost?: number }> = ({ reveal, boost = 0 }) => {
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
        uBoost: { value: 0 },
      },
    });
  }, [compW, compH]);

  material.uniforms.uReveal.value = reveal;
  material.uniforms.uTime.value = frame / fps;
  material.uniforms.uBoost.value = boost;

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

  // Scene end = title hold end, which is also when the static-shader
  // transition wipes out to the next scene.
  const sceneEnd = EDI_VIDEO_FRAMES + OPENER_TITLE_FRAMES; // = 480 + 55 = 535

  // Backdrop-shader reveal envelope: 0 before title (burst), decays to
  // a calm scanline veil during the hold, then drops back toward 0 in
  // the last few frames so the static burst comes roaring back for
  // the transition out.
  const slideReveal = interpolate(
    frame,
    [titleStart - 4, titleStart + 4, titleStart + 40, sceneEnd - OPENER_TRANSITION_FRAMES, sceneEnd],
    [0, 0.0, 1.0, 1.0, 0.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // uBoost ramps 0 → 1 over the last OPENER_TRANSITION_FRAMES so the
  // shader switches from "subtle title veil" to "full-screen static
  // wipe" for the transition into the next scene.
  const slideBoost = interpolate(
    frame,
    [sceneEnd - OPENER_TRANSITION_FRAMES, sceneEnd],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const slideActive = frame >= titleStart - 4;

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      {/* Edi's "... Are you awake?" line — fires when the dialog
          appears on the captured video. The tutorial runtime shows
          the dialog ~600ms after the play click, with a 150ms pre-
          roll baked into the trim. 0.75s × 30fps ≈ frame 22. */}
      <Sequence from={22} durationInFrames={32}>
        <Audio src={staticFile('trailer/edi-awake.flac')} />
      </Sequence>

      {/* Edi's follow-up shift line at frame 165 (5.5s).
          Clip is 3.84s ≈ 116 frames. */}
      <Sequence from={165} durationInFrames={120}>
        <Audio src={staticFile('trailer/edi-shift.flac')} />
      </Sequence>

      {/* "Here are the candidates for today. Choose one." at
          frame 255 (8.5s). Clip is 3.83s ≈ 115 frames. */}
      <Sequence from={255} durationInFrames={120}>
        <Audio src={staticFile('trailer/edi-candidates.flac')} />
      </Sequence>

      {/* "Interesting choice. Let's see how they last at The Agency."
          at frame 385 (12.83s). Clip is 3.88s ≈ 117 frames. */}
      <Sequence from={385} durationInFrames={122}>
        <Audio src={staticFile('trailer/edi-agency.flac')} />
      </Sequence>

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
        {slideActive && <TitleBackdropShader reveal={slideReveal} boost={slideBoost} />}
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
// SCENE 01 — Agency gameplay: "unravel the machinations of The Agency"
//
// Two-phase scene:
//   Phase A (caption only): SCLAB-styled typography card sits over a
//     dark backdrop. No video yet — viewer reads cleanly.
//   Phase B (gameplay video): caption fades out, agency-gameplay.mp4
//     plays full-bleed. Agents at stations, room-to-room camera pan,
//     resource collection.
// ============================================================================
const AGENCY_GAMEPLAY_SRC = staticFile('trailer/agency-gameplay.mp4');

const Scene01_AgencyGameplay: React.FC = () => {
  const frame = useCurrentFrame();

  // Caption envelope: fade-in → hold → fade-out, all over the playing
  // video. Total caption window = fadeIn + hold + fadeOut frames.
  const c1 = AGENCY_CAPTION_FADEIN;
  const c2 = c1 + AGENCY_CAPTION_HOLD;
  const c3 = c2 + AGENCY_CAPTION_FADEOUT;
  const captionOpacity = interpolate(frame, [0, c1, c2, c3], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slight scale-in so the caption arrives with motion, not statically
  const captionScale = interpolate(frame, [0, c1], [0.96, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Darkening scrim under the caption so the typography reads cleanly
  // over the busy gameplay frame. Tracks the caption opacity so the
  // scrim disappears as soon as the type does.
  const scrimOpacity = captionOpacity * 0.62;

  // Small fade at the end of the video so the next scene transitions
  // cleanly rather than hard-cutting on a moving frame.
  const videoOpacity = interpolate(
    frame,
    [AGENCY_VIDEO_FRAMES - 16, AGENCY_VIDEO_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      {/* Gameplay video — plays from frame 0, full bleed. */}
      <AbsoluteFill style={{ opacity: videoOpacity }}>
        <OffthreadVideo
          src={AGENCY_GAMEPLAY_SRC}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </AbsoluteFill>

      {/* Scrim — darkens the video while the caption is up */}
      {scrimOpacity > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, rgba(0,0,0,${scrimOpacity}) 0%, rgba(0,0,0,${scrimOpacity * 0.55}) 70%, rgba(0,0,0,0) 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Caption overlay — typography on top of the dimmed video */}
      {captionOpacity > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div
            style={{
              opacity: captionOpacity,
              transform: `scale(${captionScale})`,
              textAlign: 'center',
              maxWidth: '78%',
              textShadow: '0 4px 32px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                fontFamily: SCLAB_FONTS.mono,
                fontSize: '1.1rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: SCLAB.signal['500'],
                marginBottom: 38,
              }}
            >
              [ TRANSMISSION 002 ]
            </div>
            <h1
              style={{
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'italic',
                fontSize: '6.5rem',
                lineHeight: 1.0,
                color: SCLAB.bone['900'],
                letterSpacing: '-0.01em',
                fontWeight: 400,
                margin: 0,
              }}
            >
              Unravel the machinations
              <br />
              <span style={{ fontStyle: 'normal' }}>of The Agency.</span>
            </h1>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// ── Six narrative beats — typography drafts for v0 ────────────────────────
// These scenes use motion-graphics placeholders ("gameplay placeholder"
// labels) where real gameplay capture will swap in. The captions are
// the load-bearing element while we lock the script. Replace each
// placeholder block with a captured clip as the gameplay arrives.
// ============================================================================

// Shared typography helpers — keep the SCLAB design system consistent
// across the six new beats.
const Eyebrow: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <div
    style={{
      fontFamily: SCLAB_FONTS.mono,
      fontSize: '1.05rem',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: SCLAB.signal['500'],
      opacity,
    }}
  >
    {children}
  </div>
);

const HeadlineSerif: React.FC<{
  children: React.ReactNode;
  size?: string;
  italic?: boolean;
  opacity?: number;
  scale?: number;
}> = ({ children, size = '6rem', italic = false, opacity = 1, scale = 1 }) => (
  <h2
    style={{
      fontFamily: SCLAB_FONTS.serif,
      fontStyle: italic ? 'italic' : 'normal',
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1.0,
      letterSpacing: '-0.01em',
      color: SCLAB.bone['900'],
      margin: 0,
      opacity,
      transform: `scale(${scale})`,
      textShadow: '0 4px 32px rgba(0,0,0,0.7)',
    }}
  >
    {children}
  </h2>
);

const FootagePlaceholder: React.FC<{
  label: string;
  hint?: string;
}> = ({ label, hint }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: SCLAB.ink['200'] }}>
    <div
      style={{
        border: `1px dashed ${SCLAB.bone['300']}`,
        padding: '24px 36px',
        textAlign: 'center',
      }}
    >
      <div style={{
        fontFamily: SCLAB_FONTS.mono,
        fontSize: '0.85rem',
        letterSpacing: '0.32em',
        color: SCLAB.bone['500'],
        marginBottom: 6,
      }}>
        FOOTAGE
      </div>
      <div style={{
        fontFamily: SCLAB_FONTS.mono,
        fontSize: '1.1rem',
        letterSpacing: '0.16em',
        color: SCLAB.bone['900'],
      }}>
        {label}
      </div>
      {hint && (
        <div style={{
          fontFamily: SCLAB_FONTS.mono,
          fontSize: '0.75rem',
          color: SCLAB.bone['500'],
          marginTop: 10,
          letterSpacing: '0.1em',
        }}>
          {hint}
        </div>
      )}
    </div>
  </AbsoluteFill>
);

// ============================================================================
// SCENE 02 — Surface loop: "Shifts. Stations. Quotas."
// Plant the genre. Show the production-line gameplay so FOSH/Castles
// viewers recognize the shape.
// ============================================================================
const Scene02_SurfaceLoop: React.FC = () => {
  const frame = useCurrentFrame();

  // Three-word triplet — each word lands on its own ~32-frame beat.
  // Tightened for the 144-frame s02_surfaceLoop window.
  const wordTimings = [
    [6, 22],   // "Shifts."
    [38, 54],  // "Stations."
    [70, 86],  // "Quotas."
  ];

  const overall = fadeInOut(frame, D.s02_surfaceLoop, 8, 14);
  const scrim = interpolate(frame, [10, 30, D.s02_surfaceLoop - 30, D.s02_surfaceLoop - 6], [0, 0.6, 0.55, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      <FootagePlaceholder label="AGENTS AT STATIONS · RESOURCES TICKING" hint="capture: 3 rooms producing in parallel" />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${scrim})`, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: overall }}>
        <div style={{ display: 'flex', gap: 48 }}>
          {['Shifts.', 'Stations.', 'Quotas.'].map((word, i) => {
            const [start, end] = wordTimings[i];
            const wOpacity = interpolate(frame, [start, end], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const wY = interpolate(wOpacity, [0, 1], [16, 0]);
            return (
              <div key={word} style={{ opacity: wOpacity, transform: `translateY(${wY}px)` }}>
                <HeadlineSerif size="5.5rem">{word}</HeadlineSerif>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 03 — Conversations: "Talk to them. They'll talk back."
// Cut from system-shots to a face. The shift in framing is the message.
// ============================================================================
const Scene03_Conversations: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [20, 40, D.s03_conversations - 30, D.s03_conversations - 8], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scrim = captionOpacity * 0.6;

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      <FootagePlaceholder label="AGENT PROFILE OPENS · DIALOG EXCHANGE" hint="capture: tap-to-focus + chat panel" />
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 60%, rgba(0,0,0,${scrim}) 0%, rgba(0,0,0,${scrim * 0.4}) 70%, rgba(0,0,0,0) 100%)`,
        pointerEvents: 'none',
      }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: captionOpacity }}>
        <div style={{ textAlign: 'center', maxWidth: '72%' }}>
          <Eyebrow>[ TRANSMISSION 003 ]</Eyebrow>
          <div style={{ height: 36 }} />
          <HeadlineSerif size="5.5rem" italic>
            Talk to them.
            <br />
            <span style={{ fontStyle: 'normal' }}>They'll talk back.</span>
          </HeadlineSerif>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 04 — Emergence (split): "Every agent is alive." → "Every story is different."
// Lean into the LLM angle, then echo the existing tagline.
// ============================================================================
const Scene04_Emergence: React.FC = () => {
  const frame = useCurrentFrame();

  // Two phases:
  //   first half — "Every agent is alive."  (named agents flicker behind)
  //   second half — "Every story is different."  (recap-line flicker)
  const half = Math.floor(D.s04_emergence / 2);

  const cap1Opacity = interpolate(frame, [10, 28, half - 14, half - 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cap2Opacity = interpolate(frame, [half + 6, half + 22, D.s04_emergence - 16, D.s04_emergence - 4], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scrim = Math.max(cap1Opacity, cap2Opacity) * 0.55;

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      <FootagePlaceholder label="VIGNETTE CUTS · NAMED AGENTS" hint="capture: 3 different agents, 3 different lines" />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${scrim})`, pointerEvents: 'none' }} />

      {/* Caption A */}
      {cap1Opacity > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', opacity: cap1Opacity }}>
            <HeadlineSerif size="6.5rem">Every agent is alive.</HeadlineSerif>
          </div>
        </AbsoluteFill>
      )}

      {/* Caption B */}
      {cap2Opacity > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', opacity: cap2Opacity }}>
            <HeadlineSerif size="6.5rem" italic>Every story is different.</HeadlineSerif>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 05 — Bond loop (THE PITCH): "Deeper bonds. Deeper rooms. Deeper truths."
// The triplet mirrors S02's "Shifts. Stations. Quotas." — same rhythm,
// trade for trade. Longest beat; load-bearing. Each line drops vertically
// to imply descent into lower floors.
// ============================================================================
const Scene05_BondLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = ['Deeper bonds.', 'Deeper rooms.', 'Deeper truths.'];

  // Stagger: each line arrives 50f after the previous. Tightened for
  // the 222-frame s05_bondLoop window so the last line still has room
  // to hold before the scene fades out.
  const lineTimings = [
    { start: 10, in: 16 },
    { start: 60, in: 16 },
    { start: 110, in: 16 },
  ];

  const overall = fadeInOut(frame, D.s05_bondLoop, 6, 24);
  const scrim = interpolate(frame, [10, 50, D.s05_bondLoop - 30, D.s05_bondLoop - 6], [0, 0.6, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      <FootagePlaceholder label="BOND-METER TICKS · ROOM UNLOCKS · CAMERA PANS DOWN" hint="capture: causal chain bond→reveal→build→descent" />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${scrim})`, pointerEvents: 'none' }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: overall }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {lines.map((line, i) => {
            const t = lineTimings[i];
            const lOpacity = interpolate(frame, [t.start, t.start + t.in], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const lY = interpolate(lOpacity, [0, 1], [28, 0]);
            const isLast = i === lines.length - 1;
            return (
              <div key={line} style={{ opacity: lOpacity, transform: `translateY(${lY}px)` }}>
                <HeadlineSerif size={isLast ? '7rem' : '6rem'} italic={isLast}>
                  {line}
                </HeadlineSerif>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 06 — Silent tier-up (Castles/FOSH nod for genre viewers)
// Reuses the existing tier-up motion graphics. Linger long enough that
// the FOSH/Castles audience recognizes the shape, then cuts.
// ============================================================================
const Scene06_TierUpSilent: React.FC = () => {
  const frame = useCurrentFrame();
  const fillT = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const newRow = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const overall = fadeInOut(frame, D.s06_tierUp, 10, 14);

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'], alignItems: 'center', justifyContent: 'center', opacity: overall }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <Eyebrow opacity={overall}>FACILITY TIER 02 → 03</Eyebrow>
        <div style={{ width: 420, height: 4, background: SCLAB.bone['300'] }}>
          <div style={{ width: `${fillT * 100}%`, height: '100%', background: SCLAB.signal['500'] }} />
        </div>
        <div style={{ width: 560, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ height: 42, border: `1px solid ${SCLAB.bone['300']}` }} />
          ))}
          <div style={{
            height: 42,
            border: `1px solid ${SCLAB.signal['500']}`,
            background: `${SCLAB.signal['500']}1f`,
            opacity: newRow,
            transform: `translateY(${(1 - newRow) * -10}px)`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 07 — Puncture: "Make them remember."
// Sharp tonal turn. Held face, signal-orange punch on the line, cut to
// black hand-off into the title return.
// ============================================================================
const Scene07_Puncture: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [40, 60, D.s07_puncture - 20, D.s07_puncture - 4], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scrim = interpolate(frame, [20, 60, D.s07_puncture - 20, D.s07_puncture - 4], [0, 0.7, 0.7, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      <FootagePlaceholder
        label="HELD FACE · AGENT GLANCES AT CAMERA"
        hint="capture: one too-long shot of an agent looking back"
      />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${scrim})`, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: captionOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <HeadlineSerif size="7.5rem">
            Make them <span style={{ color: SCLAB.signal['500'] }}>remember</span>.
          </HeadlineSerif>
        </div>
      </AbsoluteFill>
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
      {/* Background music — kicks in at frame 97 (3.23s). At frame
          358 the track jumps forward 177 frames mid-stream, then
          continues — same effect as if the song had played from
          frame 97 with a silent passage 358→534 silenced, but
          without the gap. */}
      <Sequence from={97} durationInFrames={358 - 97}>
        <Audio src={staticFile('trailer/bg.mp3')} volume={0.45} />
      </Sequence>
      <Sequence from={358}>
        <Audio
          src={staticFile('trailer/bg.mp3')}
          startFrom={535 - 97}
          volume={0.45}
        />
      </Sequence>

      {seq(D.s00_opener,         <Scene00_EdiOpener />,         's00')}
      {seq(D.s01_agencyGameplay, <Scene01_AgencyGameplay />,    's01')}
      {seq(D.s02_surfaceLoop,    <Scene02_SurfaceLoop />,       's02')}
      {seq(D.s03_conversations,  <Scene03_Conversations />,     's03')}
      {seq(D.s04_emergence,      <Scene04_Emergence />,         's04')}
      {seq(D.s05_bondLoop,       <Scene05_BondLoop />,          's05')}
      {seq(D.s06_tierUp,         <Scene06_TierUpSilent />,      's06')}
      {seq(D.s07_puncture,       <Scene07_Puncture />,          's07')}
      {seq(D.s15_black,          <Scene15_Black />,             's15')}
      {seq(D.s16_titleReturn,    <Scene16_TitleReturn />,       's16')}
      {seq(D.s17_cta,            <Scene17_CTA />,               's17')}
    </AbsoluteFill>
  );
};
