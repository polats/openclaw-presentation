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
const OPENER_TITLE_FRAMES = 63;   // 2.1s — title reveal + hold + static-transition tail (S00 ends at frame 543)
const OPENER_TRANSITION_FRAMES = 12; // last 12 frames of S00 slow-ramp into full static
const S01_STATIC_FADEOUT_FRAMES = 14; // first 14 frames of S01 fade the static back out

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
  // S07 (puncture) is anchored at frame 1433. When S01 grew by 86
  // frames (316 → 402), s03..s06 had to shed the same 86 frames so
  // the puncture beat doesn't drift.
  // S01+S02 combined: one continuous gameplay video that first shows
  // the "Unravel the machinations" dialog (Phase A), then swaps Edi
  // for Mika and transitions to the "Shifts. Stations. Quotas."
  // staggered triplet (Phase B) inside the same dialog box.
  s01_agencyGameplay: 402,  // 13.4s — Phase A 172f + Phase B 230f (S01 ends at 945)
  // S03+S04+S05+S06 combined: dialog-phase scene absorbs the silent
  // tier-up's 68 frames so S07 stays anchored at frame 1433 without
  // any tier-up beat in between.
  s03_dialogPhases:   488,  // 16.27s — was 420f, +68f from removed s06
  s07_puncture:       180,  // 6s — "Make them remember." (anchored at frame 1433)

  // Closer
  s15_black:           60,  // 2s — black
  // S16 absorbs the former S17 (Wishlist CTA was removed). Title
  // return now holds for 5s — bg music fades out across the back
  // half (the window where S17 used to live).
  s16_titleReturn:     150, // 5s — was 90 (title) + 60 (former S17)
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
  // transition wipes out to the next scene. Last RENDERED frame is
  // sceneEnd - 1; the peak burst must land before that.
  const sceneEnd = EDI_VIDEO_FRAMES + OPENER_TITLE_FRAMES; // = 480 + 55 = 535
  const burstPeakFrame = sceneEnd - 2;                     // last 2 frames hold full static

  // Backdrop-shader reveal envelope: 0 before title (burst), decays to
  // a calm scanline veil during the hold, then drops back to 0 at
  // burstPeakFrame so the last visible frames sit on full static.
  const slideReveal = interpolate(
    frame,
    [titleStart - 4, titleStart + 4, titleStart + 40, sceneEnd - OPENER_TRANSITION_FRAMES, burstPeakFrame],
    [0, 0.0, 1.0, 1.0, 0.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // uBoost ramps 0 → 1 over the same window, peaking 2 frames before
  // sceneEnd so the full-static peak is rendered, not skipped.
  const slideBoost = interpolate(
    frame,
    [sceneEnd - OPENER_TRANSITION_FRAMES, burstPeakFrame],
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
      <Sequence from={22} durationInFrames={32} name="VO · ... Are you awake?">
        <Audio src={staticFile('trailer/edi-awake.flac')} />
      </Sequence>

      {/* Edi's follow-up shift line at frame 165 (5.5s).
          Clip is 3.84s ≈ 116 frames. */}
      <Sequence from={165} durationInFrames={120} name="VO · Right in time for today's shift">
        <Audio src={staticFile('trailer/edi-shift.flac')} />
      </Sequence>

      {/* "Here are the candidates for today. Choose one." at
          frame 255 (8.5s). Clip is 3.83s ≈ 115 frames. */}
      <Sequence from={255} durationInFrames={120} name="VO · Here are the candidates">
        <Audio src={staticFile('trailer/edi-candidates.flac')} />
      </Sequence>

      {/* "Interesting choice. Let's see how they last at The Agency."
          at frame 385 (12.83s). Clip is 3.88s ≈ 117 frames. */}
      <Sequence from={385} durationInFrames={122} name="VO · Interesting choice (The Agency)">
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
const AGENCY_SHIFTS_SRC = staticFile('trailer/agency-shifts.mp4');
// Source duration of agency-shifts.mp4 (seconds). Used to compute a
// playbackRate so the clip ends exactly when S01 does — speeds the
// video up if S01 is shorter than the source.
const AGENCY_SHIFTS_DURATION_S = 16.868;

// Conversation scene source — Mika dialog gameplay.
const MIKA_CONVO_SRC = staticFile('trailer/mika-convo.mp4');
const MIKA_CONVO_DURATION_S = 8.6;  // post-trim (first 4s cut)

// Second half of S03 — agent-alive gameplay.
const ALIVE_SRC = staticFile('trailer/alive.mp4');
const ALIVE_DURATION_S = 22.377;

// Puncture scene background — phone crack reveal.
const CRACK_SRC = staticFile('trailer/crack.mp4');
const CRACK_DURATION_S = 10.0;  // post-trim (first 4s cut)

const Scene01_AgencyGameplay: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: compW, height: compH, fps } = useVideoConfig();

  // Speed up agency-shifts.mp4 so it lands exactly with S01's end.
  const sceneDurationS = D.s01_agencyGameplay / fps;
  const shiftsPlaybackRate = AGENCY_SHIFTS_DURATION_S / sceneDurationS;

  // ── Phase boundary ───────────────────────────────────────────────
  // Phase A (0..PHASE_B_START): "Unravel the machinations" dialog.
  // Phase B (PHASE_B_START..end): three-word "Shifts. Stations. Quotas."
  //   triplet staggered into the same dialog box.
  const PHASE_B_START = 172;

  // ── Element entrance envelopes (phase A) ────────────────────────
  const videoEnter = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const avatarEnter = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eyebrowEnter = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineEnter = interpolate(frame, [28, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase A headline fades out as Phase B takes over.
  const headlineExit = interpolate(frame, [PHASE_B_START - 12, PHASE_B_START], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineOpacity = headlineEnter * headlineExit;

  // ── Phase B: three-word triplet stagger ─────────────────────────
  // Original S02 staggers were [6,22], [38,54], [70,86] in a 144-frame
  // scene. Offset by PHASE_B_START so they land in this combined scene.
  // "Secrets." is a fourth, late-arriving word in pulsing red — lands
  // at composition frame 900 (= 543 s00 + 357 in-scene).
  const SECRETS_IN_FRAME = 357;
  const wordTimings = [
    [PHASE_B_START +  6, PHASE_B_START + 22],   // "Shifts."
    [PHASE_B_START + 38, PHASE_B_START + 54],   // "Stations."
    [PHASE_B_START + 70, PHASE_B_START + 86],   // "Quotas."
    [SECRETS_IN_FRAME,   SECRETS_IN_FRAME + 16],// "Secrets." (red pulse)
  ];
  const words = ['Shifts.', 'Stations.', 'Quotas.', 'Secrets.'];
  // Pulsing red brightness for the last word.
  const secretsPulse = 0.78 + 0.22 * Math.sin(frame * 0.18);

  // Static-shader fade-out from S00's transition (top of scene).
  const staticBoost = interpolate(
    frame,
    [0, S01_STATIC_FADEOUT_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const staticActive = frame < S01_STATIC_FADEOUT_FRAMES + 2;

  // Outro: screenshake + TV-static wipe at the END of S01, bridging
  // into S03. Mirrors the S00→S01 transition in reverse.
  const SCENE_END = D.s01_agencyGameplay;
  const OUTRO_STATIC_FRAMES = 12;
  const OUTRO_SHAKE_FRAMES  = 32;

  // Screenshake ramps in over the last ~32 frames, peaks just before
  // the static takes over.
  const shakeT = interpolate(
    frame,
    [SCENE_END - OUTRO_SHAKE_FRAMES, SCENE_END - 4],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const shakeAmp = shakeT * shakeT * 22; // ease-in (^2) for sharper ramp
  const shakeX = (random(`sx-${frame}`) - 0.5) * 2 * shakeAmp;
  const shakeY = (random(`sy-${frame}`) - 0.5) * 2 * shakeAmp;

  // Outro static — peaks 2 frames before the cut so the last visible
  // frames sit on full white-noise (same trick used in S00).
  const outroBoost = interpolate(
    frame,
    [SCENE_END - OUTRO_STATIC_FRAMES, SCENE_END - 2],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const outroStaticActive = frame >= SCENE_END - OUTRO_STATIC_FRAMES - 2;

  // CRT overlay intensity — fades in with Nina's arrival (matches
  // the same 14-frame cross-fade window the avatar swap uses) and
  // stays on for the rest of the scene. The CRT-pulse modulates the
  // scanline darkness so the effect has life.
  const CRT_FADEIN_WINDOW = 14;
  const crtIntensity = interpolate(
    frame,
    [SECRETS_IN_FRAME - CRT_FADEIN_WINDOW / 2, SECRETS_IN_FRAME + CRT_FADEIN_WINDOW / 2],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const crtPulse = 0.85 + 0.15 * Math.sin(frame * 0.42);

  // Layout — visual-novel pattern:
  //   1. Gameplay video as the FULL-BLEED background. Phone-aspect
  //      portrait video uses object-fit:cover with a blurred copy of
  //      the same source filling the side gutters so the entire
  //      1920×1080 frame is gameplay texture (no black margins).
  //   2. Edi avatar overlays bottom-left, transparent PNG; bleeds
  //      slightly off the left edge and anchored flush to comp bottom
  //      (image is cropped at the bottom).
  //   3. Dialog box overlays the lower edge — semi-transparent so the
  //      gameplay stays visible through it.

  const PORTRAIT_HEIGHT = compH;                                    // full height
  const PORTRAIT_WIDTH  = Math.round(PORTRAIT_HEIGHT * (406 / 808)); // ≈ 542px
  const PORTRAIT_LEFT   = Math.round((compW - PORTRAIT_WIDTH) / 2);  // centered

  const AVATAR_WIDTH  = 720;
  const AVATAR_HEIGHT = 1040;
  const AVATAR_LEFT   = -40;

  const CARD_LEFT   = 460;
  const CARD_RIGHT  = 100;
  const CARD_BOTTOM = 70;
  const CARD_HEIGHT = 200;

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
     {/* Shake wrapper — translates the scene contents in the last
         ~32 frames so the cut to S03 feels impact-driven. The static
         overlay below sits OUTSIDE this wrapper so it stays steady. */}
     <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
      {/* Blurred backdrop — same video stretched + heavily blurred so
          the side gutters around the portrait read as gameplay texture
          instead of black margins. Multiple OffthreadVideo instances
          with the same src remain frame-synced via useCurrentFrame. */}
      <AbsoluteFill style={{
        filter: 'blur(48px) brightness(0.55) saturate(1.1)',
        transform: 'scale(1.12)',
        opacity: videoEnter,
      }}>
        <OffthreadVideo
          src={AGENCY_SHIFTS_SRC}
          playbackRate={shiftsPlaybackRate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* Portrait gameplay video — full-height, centered, undistorted */}
      <div
        style={{
          position: 'absolute',
          left: PORTRAIT_LEFT,
          top: 0,
          width: PORTRAIT_WIDTH,
          height: PORTRAIT_HEIGHT,
          opacity: videoEnter,
          overflow: 'hidden',
          boxShadow: `0 0 120px rgba(0, 0, 0, 0.5)`,
        }}
      >
        <OffthreadVideo
          src={AGENCY_SHIFTS_SRC}
          playbackRate={shiftsPlaybackRate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Character avatar — three layered states with cross-fades:
            1. Edi (Phase A)
            2. Mika neutral (Phase B, before "Secrets." appears)
            3. Mika shushing (from the "Secrets." moment onward)
          Mika's source PNG is larger than Edi's so per-character
          scale keeps them visually matched. */}
      {(() => {
        // Edi → Mika cross-fade at PHASE_B_START
        const SWAP_WINDOW = 16;
        const mikaInForA = interpolate(
          frame,
          [PHASE_B_START - SWAP_WINDOW / 2, PHASE_B_START + SWAP_WINDOW / 2],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        const ediOpacity = 1 - mikaInForA;
        // Mika-neutral → Mika-shh cross-fade at SECRETS_IN_FRAME
        const SHH_WINDOW = 14;
        const shhInForB = interpolate(
          frame,
          [SECRETS_IN_FRAME - SHH_WINDOW / 2, SECRETS_IN_FRAME + SHH_WINDOW / 2],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        const mikaNeutralOpacity = mikaInForA * (1 - shhInForB);
        const mikaShhOpacity     = mikaInForA * shhInForB;

        const EDI_SCALE  = 1.10;
        const MIKA_SCALE = EDI_SCALE * 0.92; // ≈ 1.012
        const containerStyle = (mul: number, scale: number): React.CSSProperties => ({
          position: 'absolute',
          left: AVATAR_LEFT + (1 - avatarEnter) * -40,
          bottom: 0,
          width: AVATAR_WIDTH,
          height: AVATAR_HEIGHT,
          opacity: avatarEnter * mul,
          overflow: 'hidden',
          // bottom-center origin: scaling shrinks Mika in from BOTH
          // sides equally so she stays anchored at the same horizontal
          // midpoint as Edi instead of pulling toward the left edge.
          transform: `scale(${scale})`,
          transformOrigin: 'bottom center',
        });
        const imgStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'bottom',
          filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.65))',
        };
        return (
          <>
            {ediOpacity > 0.001 && (
              <div style={containerStyle(ediOpacity, EDI_SCALE)}>
                <img src={staticFile('trailer/edi.png')} style={imgStyle} />
              </div>
            )}
            {mikaNeutralOpacity > 0.001 && (
              <div style={containerStyle(mikaNeutralOpacity, MIKA_SCALE)}>
                <img src={staticFile('trailer/nina2.png')} style={imgStyle} />
              </div>
            )}
            {mikaShhOpacity > 0.001 && (
              <div style={containerStyle(mikaShhOpacity, MIKA_SCALE)}>
                <img src={staticFile('trailer/nina.png')} style={imgStyle} />
              </div>
            )}
          </>
        );
      })()}

      {/* Dialog overlay — semi-transparent so the gameplay stays
          visible through it. Sits along the bottom edge. */}
      <div
        style={{
          position: 'absolute',
          left: CARD_LEFT,
          right: CARD_RIGHT,
          bottom: CARD_BOTTOM + (1 - eyebrowEnter) * 24,
          height: CARD_HEIGHT,
          opacity: eyebrowEnter,
          padding: '32px 44px',
          background: `linear-gradient(180deg, rgba(11,11,12,0.22) 0%, rgba(11,11,12,0.38) 100%)`,
          backdropFilter: 'blur(8px) saturate(1.05)',
          border: `1px solid ${SCLAB.bone['300']}33`,
          borderLeft: `3px solid ${SCLAB.signal['500']}`,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.55)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Speaker tag */}
        <div
          style={{
            fontFamily: SCLAB_FONTS.mono,
            fontSize: '0.95rem',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: SCLAB.signal['500'],
            marginBottom: 18,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          [ TRANSMISSION 002 ]
        </div>

        {/* Headline area — Phase A holds the "Unravel" line, then
            fades out as Phase B's word triplet takes over in the
            same physical slot. */}
        <div style={{ position: 'relative', minHeight: 60 }}>
          {/* Phase A — "Unravel the machinations of The Agency." */}
          {headlineOpacity > 0.001 && (
            <h1
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'italic',
                fontSize: '3rem',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: SCLAB.bone['900'],
                margin: 0,
                opacity: headlineOpacity,
                transform: `translateX(${(1 - headlineEnter) * 20}px)`,
                whiteSpace: 'nowrap',
                textShadow: '0 4px 16px rgba(0,0,0,0.75)',
              }}
            >
              Unravel the machinations{' '}
              <span style={{ fontStyle: 'normal' }}>of The Agency.</span>
            </h1>
          )}

          {/* Phase B — "Shifts. Stations. Quotas." staggered triplet */}
          {frame >= PHASE_B_START - 4 && (
            <div
              style={{
                display: 'flex',
                gap: 36,
                fontFamily: SCLAB_FONTS.serif,
                fontSize: '3.6rem',
                lineHeight: 1.0,
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: SCLAB.bone['900'],
                textShadow: '0 4px 16px rgba(0,0,0,0.75)',
              }}
            >
              {words.map((word, i) => {
                const [start, end] = wordTimings[i];
                const wOpacity = interpolate(frame, [start, end], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const wY = interpolate(wOpacity, [0, 1], [16, 0]);
                const isRed = word === 'Secrets.';
                const redR = Math.round(220 + 35 * secretsPulse);
                const redG = Math.round(50 * (1 - secretsPulse) + 30);
                const redB = Math.round(50 * (1 - secretsPulse) + 30);
                const redColor = `rgb(${redR}, ${redG}, ${redB})`;
                return (
                  <div
                    key={word}
                    style={{
                      opacity: wOpacity,
                      transform: `translateY(${wY}px)`,
                      color: isRed ? redColor : undefined,
                      fontWeight: isRed ? 600 : undefined,
                      textShadow: isRed
                        ? `0 4px 16px rgba(0,0,0,0.75), 0 0 ${18 + secretsPulse * 16}px rgba(${redR},${redG},${redB},${0.45 + secretsPulse * 0.25})`
                        : undefined,
                    }}
                  >
                    {word}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CRT overlay — kicks in when Nina arrives. Scanlines + edge
          vignette + faint red tint on top of the whole scene. */}
      {crtIntensity > 0.001 && (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: crtIntensity }}>
          {/* Scanlines */}
          <AbsoluteFill style={{
            background: `repeating-linear-gradient(180deg,
              rgba(0,0,0,0) 0px,
              rgba(0,0,0,0) 2px,
              rgba(0,0,0,${0.32 * crtPulse}) 3px,
              rgba(0,0,0,${0.32 * crtPulse}) 4px)`,
            mixBlendMode: 'multiply',
          }} />
          {/* Edge vignette — darkens corners, brightens center area */}
          <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
          }} />
          {/* Faint red signal tint — matches the "Secrets." pulse */}
          <AbsoluteFill style={{
            background: 'rgba(180, 30, 30, 0.08)',
            mixBlendMode: 'screen',
          }} />
          {/* Subtle horizontal flicker line — sweeps top-to-bottom slowly */}
          <AbsoluteFill style={{
            background: `linear-gradient(180deg,
              rgba(255,255,255,0) ${(frame * 1.3) % 100 - 2}%,
              rgba(255,255,255,${0.04 * crtPulse}) ${(frame * 1.3) % 100}%,
              rgba(255,255,255,0) ${(frame * 1.3) % 100 + 2}%)`,
            mixBlendMode: 'screen',
          }} />
        </AbsoluteFill>
      )}
     </AbsoluteFill>
     {/* ── END SHAKE WRAPPER ────────────────────────────────────── */}

      {/* Outro static — ramps in over the last 12 frames so the cut
          to S03 wipes through full TV static (mirrors the S00→S01
          transition). Sits OUTSIDE the shake wrapper so the static
          itself stays steady. */}
      {outroStaticActive && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <ThreeCanvas width={compW} height={compH}>
            <TitleBackdropShader reveal={0} boost={outroBoost} />
          </ThreeCanvas>
        </AbsoluteFill>
      )}

      {/* Static shader fading out — picks up where S00's transition
          left off so the cut into S01 is bridged, not hard. */}
      {staticActive && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <ThreeCanvas width={compW} height={compH}>
            <TitleBackdropShader reveal={0} boost={staticBoost} />
          </ThreeCanvas>
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
// SCENE 03 — Combined dialog phases (was S03 + S04 + S05).
//
// Reuses the S01 layout (blurred backdrop video + centered portrait
// video + Mika avatar bottom-left + dialog box). The avatar and video
// stay put; only the dialog headline cycles through four caption
// beats with fade transitions:
//
//   Phase A  (0..108)    "Talk to them. They'll talk back."
//   Phase B  (108..180)  "Every agent is alive."
//   Phase C  (180..240)  "Every story is different."
//   Phase D  (240..420)  "Deeper bonds. Deeper rooms. Deeper truths."
//                        (three lines, staggered)
//
// Static fade-in at the top bridges from S01's outro static.
// ============================================================================
const Scene03_DialogPhases: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: compW, height: compH, fps } = useVideoConfig();

  // Caption phase boundaries (scene-local frames).
  //   PHASE_A_END = 163  →  "Talk to them. They'll talk back." holds
  //                          until the mika-johnny.flac + gated video end.
  //   PHASE_B_END = 245  →  "Every story is different." starts fading in
  //                          at scene-local 238 (composition frame 1183).
  //   PHASE_C_END = 296  →  Phase D ("Deeper bonds…") follows.
  const PHASE_A_END = 163;
  const PHASE_B_END = 245;
  const PHASE_C_END = 296;
  // Phase D runs PHASE_C_END → D.s03_dialogPhases.

  // Entrance staggers (matches S01 patterns)
  const videoEnter = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const avatarEnter = interpolate(frame, [22, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eyebrowEnter = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Cross-faded caption opacities — each peaks during its phase and
  // fades out as the next phase begins.
  const fadeOverlap = 14;
  const captionA = interpolate(
    frame,
    [10, 28, PHASE_A_END - fadeOverlap, PHASE_A_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // "They'll talk back." is delayed — appears at composition frame
  // 1009 (scene-local 64) when mika-johnny.flac plays.
  const TALK_BACK_REVEAL_FRAME = 64;
  const talkBackOpacity = interpolate(
    frame,
    [TALK_BACK_REVEAL_FRAME, TALK_BACK_REVEAL_FRAME + 14],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const captionB = interpolate(
    frame,
    [PHASE_A_END - fadeOverlap / 2, PHASE_A_END + fadeOverlap / 2, PHASE_B_END - fadeOverlap, PHASE_B_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const captionC = interpolate(
    frame,
    [PHASE_B_END - fadeOverlap / 2, PHASE_B_END + fadeOverlap / 2, PHASE_C_END - fadeOverlap, PHASE_C_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Phase D — three-line stagger (was S05's bond loop)
  const dWords: Array<{ text: string; start: number; in: number; italic?: boolean }> = [
    { text: 'Deeper bonds.',  start: PHASE_C_END - fadeOverlap / 2, in: 16 },
    { text: 'Deeper rooms.',  start: PHASE_C_END + 36, in: 16 },
    { text: 'Deeper truths.', start: PHASE_C_END + 76, in: 16, italic: true },
  ];

  // Static fade-in from S01's outro
  const S03_STATIC_FADEIN_FRAMES = 14;
  const staticBoost = interpolate(
    frame,
    [0, S03_STATIC_FADEIN_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const staticActive = frame < S03_STATIC_FADEIN_FRAMES + 2;

  // Outro static: ramps in over the last 12 frames of S03 (starts at
  // scene-local 476 = composition frame 1421). Peaks 2 frames before
  // the cut to S07, same trick as the S01→S03 transition.
  const S03_OUTRO_STATIC_FRAMES = 12;
  const S03_SCENE_END = D.s03_dialogPhases;
  const outroBoost = interpolate(
    frame,
    [S03_SCENE_END - S03_OUTRO_STATIC_FRAMES, S03_SCENE_END - 2],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const outroStaticActive = frame >= S03_SCENE_END - S03_OUTRO_STATIC_FRAMES - 2;

  // mika-convo plays at natural speed (1×). Source is 8.6s and S03
  // is 16.27s — once the clip ends, OffthreadVideo holds on the last
  // frame for the remainder of the scene.

  // Layout constants (mirrors S01)
  const PORTRAIT_HEIGHT = compH;
  const PORTRAIT_WIDTH  = Math.round(PORTRAIT_HEIGHT * (406 / 808));
  const PORTRAIT_LEFT   = Math.round((compW - PORTRAIT_WIDTH) / 2);

  const AVATAR_WIDTH  = 720;
  const AVATAR_HEIGHT = 1040;
  const AVATAR_LEFT   = -40;
  const MIKA_SCALE    = 1.10 * 0.92; // matches S01's Mika sizing

  const CARD_LEFT   = 460;
  const CARD_RIGHT  = 100;
  // Phase A pose — box sits higher in the comp to leave the mika-convo
  // gameplay area visible. Phase B onward — animate back to the S01
  // pose (lower, slightly shorter) once "Every agent is alive."
  // takes over.
  const A_CARD_HEIGHT = 240;
  const A_CARD_BOTTOM = 190;
  const S01_CARD_HEIGHT = 200;
  const S01_CARD_BOTTOM = 70;
  const cardMoveT = interpolate(
    frame,
    [PHASE_A_END - 7, PHASE_A_END + 14],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const CARD_HEIGHT = interpolate(cardMoveT, [0, 1], [A_CARD_HEIGHT, S01_CARD_HEIGHT]);
  const CARD_BOTTOM = interpolate(cardMoveT, [0, 1], [A_CARD_BOTTOM, S01_CARD_BOTTOM]);

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      {/* Mika's "Johnny..." VO at scene-local frame 64 = composition
          frame 1009. Lines up with the "They'll talk back." reveal.
          Plays the first 3.3 seconds (99 frames @ 30fps). */}
      <Sequence from={TALK_BACK_REVEAL_FRAME} durationInFrames={99} name="VO · Mika — Johnny (first 3.3s)">
        <Audio src={staticFile('trailer/mika-johnny.flac')} endAt={99} />
      </Sequence>

      {/* First-half video: mika-convo runs only while the audio plays,
          unmounts at the frame mika-johnny.flac ends
          (TALK_BACK_REVEAL_FRAME + 99 = 163). */}
      <Sequence from={0} durationInFrames={TALK_BACK_REVEAL_FRAME + 99} name="S03 video · mika-convo">
        {/* Blurred backdrop video — same trick as S01 */}
        <AbsoluteFill style={{
          filter: 'blur(48px) brightness(0.55) saturate(1.1)',
          transform: 'scale(1.12)',
          opacity: videoEnter,
        }}>
          <OffthreadVideo
            src={MIKA_CONVO_SRC}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>

        {/* Portrait gameplay video — centered, full height */}
        <div
          style={{
            position: 'absolute',
            left: PORTRAIT_LEFT,
            top: 0,
            width: PORTRAIT_WIDTH,
            height: PORTRAIT_HEIGHT,
            opacity: videoEnter,
            overflow: 'hidden',
            boxShadow: '0 0 120px rgba(0, 0, 0, 0.5)',
          }}
        >
          <OffthreadVideo
            src={MIKA_CONVO_SRC}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </Sequence>

      {/* Second-half video: alive.mp4 picks up where mika-convo left
          off (frame 163) and runs until S03 ends. Speed-matched so it
          plays end-to-end across the remaining 325 frames. */}
      {(() => {
        const ALIVE_START = TALK_BACK_REVEAL_FRAME + 99; // 163
        const ALIVE_DUR_FRAMES = D.s03_dialogPhases - ALIVE_START; // 325
        const aliveSlotS = ALIVE_DUR_FRAMES / 30;
        const alivePlaybackRate = ALIVE_DURATION_S / aliveSlotS;
        // Zoom + letterbox: both start at composition frame 1322
        // (scene-local 377 = 1322 - 945). The ZOOM finishes at
        // composition frame 1340 (scene-local 395 = 1340 - 945) and
        // holds at peak; the LETTERBOX keeps ramping all the way to
        // S03's end where only ⅓ of the screen (360px) is visible.
        const ZOOM_START = 377;
        const ZOOM_END = 395;            // composition frame 1340
        const zoomScaleT = interpolate(frame, [ZOOM_START, ZOOM_END], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const letterboxT = interpolate(frame, [ZOOM_START, D.s03_dialogPhases], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const portraitScale = interpolate(zoomScaleT, [0, 1], [1, 1.4]);
        const letterboxH = interpolate(letterboxT, [0, 1], [0, 360]);
        return (
          <Sequence from={ALIVE_START} durationInFrames={ALIVE_DUR_FRAMES} name="S03 video · alive">
            {/* Blurred backdrop */}
            <AbsoluteFill style={{
              filter: 'blur(48px) brightness(0.55) saturate(1.1)',
              transform: 'scale(1.12)',
            }}>
              <OffthreadVideo
                src={ALIVE_SRC}
                playbackRate={alivePlaybackRate}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AbsoluteFill>

            {/* Portrait video — zooms in + letterbox bars grow from
                the top/bottom of the phone after ZOOM_START. */}
            <div
              style={{
                position: 'absolute',
                left: PORTRAIT_LEFT,
                top: 0,
                width: PORTRAIT_WIDTH,
                height: PORTRAIT_HEIGHT,
                overflow: 'hidden',
                boxShadow: '0 0 120px rgba(0, 0, 0, 0.5)',
              }}
            >
              <OffthreadVideo
                src={ALIVE_SRC}
                playbackRate={alivePlaybackRate}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${portraitScale})`,
                  transformOrigin: 'center center',
                }}
              />
              {/* Letterbox bars — grow inward from the top and bottom
                  of the phone-frame container as the zoom progresses. */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: letterboxH, background: '#000', pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: letterboxH, background: '#000', pointerEvents: 'none',
              }} />
            </div>
          </Sequence>
        );
      })()}

      {/* Mika avatar — present for the whole scene */}
      <div
        style={{
          position: 'absolute',
          left: AVATAR_LEFT + (1 - avatarEnter) * -40,
          bottom: 0,
          width: AVATAR_WIDTH,
          height: AVATAR_HEIGHT,
          opacity: avatarEnter,
          overflow: 'hidden',
          transform: `scale(${MIKA_SCALE})`,
          transformOrigin: 'bottom center',
        }}
      >
        <img
          src={staticFile('trailer/mika.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom',
            filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.65))',
          }}
        />
      </div>

      {/* Dialog box — same look as S01, cycling caption phases */}
      <div
        style={{
          position: 'absolute',
          left: CARD_LEFT,
          right: CARD_RIGHT,
          bottom: CARD_BOTTOM + (1 - eyebrowEnter) * 24,
          height: CARD_HEIGHT,
          opacity: eyebrowEnter,
          padding: '32px 44px',
          background: 'linear-gradient(180deg, rgba(11,11,12,0.22) 0%, rgba(11,11,12,0.38) 100%)',
          backdropFilter: 'blur(8px) saturate(1.05)',
          border: `1px solid ${SCLAB.bone['300']}33`,
          borderLeft: `3px solid ${SCLAB.signal['500']}`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: SCLAB_FONTS.mono,
            fontSize: '0.95rem',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: SCLAB.signal['500'],
            marginBottom: 18,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          [ TRANSMISSION 003 ]
        </div>

        {/* Headline slot — captions stack absolutely so they can cross-fade. */}
        <div style={{ position: 'relative', minHeight: 140 }}>
          {/* Phase A */}
          {captionA > 0.001 && (
            <h1
              style={{
                position: 'absolute', inset: 0,
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'italic',
                fontSize: '3rem',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: SCLAB.bone['900'],
                margin: 0,
                opacity: captionA,
                textShadow: '0 4px 16px rgba(0,0,0,0.75)',
              }}
            >
              Talk to them.{' '}
              <span style={{ fontStyle: 'normal', opacity: talkBackOpacity }}>
                They'll talk back.
              </span>
            </h1>
          )}

          {/* Phase B */}
          {captionB > 0.001 && (
            <h1
              style={{
                position: 'absolute', inset: 0,
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'normal',
                fontSize: '3rem',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: SCLAB.bone['900'],
                margin: 0,
                opacity: captionB,
                textShadow: '0 4px 16px rgba(0,0,0,0.75)',
              }}
            >
              Every agent is alive.
            </h1>
          )}

          {/* Phase C */}
          {captionC > 0.001 && (
            <h1
              style={{
                position: 'absolute', inset: 0,
                fontFamily: SCLAB_FONTS.serif,
                fontStyle: 'italic',
                fontSize: '3rem',
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: SCLAB.bone['900'],
                margin: 0,
                opacity: captionC,
                textShadow: '0 4px 16px rgba(0,0,0,0.75)',
              }}
            >
              Every story is different.
            </h1>
          )}

          {/* Phase D — three words on a single row, "Deeper truths."
              pulsates yellow as the punchline. */}
          {frame >= PHASE_C_END - fadeOverlap / 2 && (() => {
            const yellowPulse = 0.78 + 0.22 * Math.sin(frame * 0.18);
            return (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 28,
                }}
              >
                {dWords.map((w) => {
                  const opacity = interpolate(frame, [w.start, w.start + w.in], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  const y = interpolate(opacity, [0, 1], [16, 0]);
                  const isTruths = w.text === 'Deeper truths.';
                  // Yellow pulse: alpha-blended brightness on a base
                  // yellow color. Roughly cycles between gold and
                  // bright pale-yellow.
                  const yR = Math.round(220 + 35 * yellowPulse);
                  const yG = Math.round(190 + 50 * yellowPulse);
                  const yB = Math.round(60 * yellowPulse);
                  const yellow = `rgb(${yR}, ${yG}, ${yB})`;
                  return (
                    <div
                      key={w.text}
                      style={{
                        opacity,
                        transform: `translateY(${y}px)`,
                        fontFamily: SCLAB_FONTS.serif,
                        fontStyle: w.italic ? 'italic' : 'normal',
                        fontSize: '2.6rem',
                        lineHeight: 1.05,
                        letterSpacing: '-0.01em',
                        fontWeight: isTruths ? 600 : 400,
                        color: isTruths ? yellow : SCLAB.bone['900'],
                        textShadow: isTruths
                          ? `0 4px 16px rgba(0,0,0,0.75), 0 0 ${20 + yellowPulse * 18}px rgba(${yR},${yG},${yB},${0.45 + yellowPulse * 0.3})`
                          : '0 4px 16px rgba(0,0,0,0.75)',
                      }}
                    >
                      {w.text}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Outro static: ramps in over the last 12 frames of S03 so the
          cut to S07 wipes through TV static, mirroring S01's outro. */}
      {outroStaticActive && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <ThreeCanvas width={compW} height={compH}>
            <TitleBackdropShader reveal={0} boost={outroBoost} />
          </ThreeCanvas>
        </AbsoluteFill>
      )}

      {/* Static shader fading out — bridges S01's outro static */}
      {staticActive && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <ThreeCanvas width={compW} height={compH}>
            <TitleBackdropShader reveal={0} boost={staticBoost} />
          </ThreeCanvas>
        </AbsoluteFill>
      )}
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
  const { width: compW, height: compH, fps } = useVideoConfig();
  const captionOpacity = interpolate(frame, [40, 60, D.s07_puncture - 20, D.s07_puncture - 4], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scrim = interpolate(frame, [20, 60, D.s07_puncture - 20, D.s07_puncture - 4], [0, 0.7, 0.7, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Static fade-in — bridges S03's outro static (boost ramps 1 → 0
  // over the first 14 frames of this scene).
  const S07_STATIC_FADEIN_FRAMES = 14;
  const staticBoost = interpolate(
    frame,
    [0, S07_STATIC_FADEIN_FRAMES],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const staticActive = frame < S07_STATIC_FADEIN_FRAMES + 2;

  // crack.mp4 speed-matched to S07's duration so it plays end-to-end.
  const sceneDurationS = D.s07_puncture / fps;
  const crackPlaybackRate = CRACK_DURATION_S / sceneDurationS;

  // Portrait video sized to crack.mp4's phone aspect (474/950).
  const CRACK_HEIGHT = compH;
  const CRACK_WIDTH = Math.round(CRACK_HEIGHT * (474 / 950)); // ≈ 539
  const CRACK_LEFT = Math.round((compW - CRACK_WIDTH) / 2);

  return (
    <AbsoluteFill style={{ backgroundColor: SCLAB.ink['100'] }}>
      {/* Blurred backdrop — crack.mp4 stretched + heavily blurred */}
      <AbsoluteFill style={{
        filter: 'blur(48px) brightness(0.55) saturate(1.1)',
        transform: 'scale(1.12)',
      }}>
        <OffthreadVideo
          src={CRACK_SRC}
          playbackRate={crackPlaybackRate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* Portrait crack.mp4 — centered, full height */}
      <div
        style={{
          position: 'absolute',
          left: CRACK_LEFT,
          top: 0,
          width: CRACK_WIDTH,
          height: CRACK_HEIGHT,
          overflow: 'hidden',
          boxShadow: '0 0 120px rgba(0, 0, 0, 0.5)',
        }}
      >
        <OffthreadVideo
          src={CRACK_SRC}
          playbackRate={crackPlaybackRate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${scrim})`, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: captionOpacity }}>
        <div style={{ textAlign: 'center' }}>
          <HeadlineSerif size="7.5rem">
            Make them <span style={{ color: SCLAB.signal['500'] }}>remember</span>.
          </HeadlineSerif>
        </div>
      </AbsoluteFill>

      {/* Static shader fading out — bridges S03's outro static so the
          cut from S03 → S07 wipes through TV static. */}
      {staticActive && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <ThreeCanvas width={compW} height={compH}>
            <TitleBackdropShader reveal={0} boost={staticBoost} />
          </ThreeCanvas>
        </AbsoluteFill>
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
  // QR + URL fade-in: lands at scene-local frame 82 (= composition
  // frame 1755 since S16 starts at 1673).
  const QR_REVEAL_FRAME = 82;
  const qrOpacity = interpolate(frame, [QR_REVEAL_FRAME, QR_REVEAL_FRAME + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
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

      {/* Lower-right QR code + URL */}
      {qrOpacity > 0.001 && (
        <div
          style={{
            position: 'absolute',
            right: 80,
            bottom: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            opacity: qrOpacity,
            padding: 18,
            background: 'rgba(255, 255, 255, 0.96)',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <img
            src={staticFile('trailer/qr-woid.png')}
            style={{
              width: 240,
              height: 240,
              imageRendering: 'pixelated',
              display: 'block',
            }}
          />
          <div style={{
            fontFamily: MONO,
            fontSize: 18,
            letterSpacing: '0.18em',
            color: '#0a0c0e',
            textTransform: 'uppercase',
          }}>
            woid.noods.cc
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// COMPOSITION
// ============================================================================
export const TheAgencyTrailer: React.FC = () => {
  let f = 0;
  const seq = (dur: number, node: React.ReactNode, key: string, name?: string) => {
    const el = (
      <Sequence key={key} from={f} durationInFrames={dur} name={name ?? key}>
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
      <Sequence from={97} durationInFrames={358 - 97} name="BGM · pre-puncture">
        <Audio src={staticFile('trailer/bg.mp3')} volume={0.45} />
      </Sequence>
      <Sequence from={358} name="BGM · post-jump">
        <Audio
          src={staticFile('trailer/bg.mp3')}
          startFrom={535 - 97}
          // Fade out across the window where S17 used to live —
          // composition frames 1763..1823 → sequence-local 1405..1465.
          volume={(f) =>
            interpolate(f, [0, 1405, 1465], [0.45, 0.45, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      </Sequence>

      {seq(D.s00_opener,         <Scene00_EdiOpener />,         's00', 'S00 · Edi Opener')}
      {seq(D.s01_agencyGameplay, <Scene01_AgencyGameplay />,    's01', 'S01 · Unravel + Shifts/Stations/Quotas')}
      {seq(D.s03_dialogPhases,   <Scene03_DialogPhases />,      's03', 'S03 · Talk to them → Every agent alive → Deeper bonds')}
      {seq(D.s07_puncture,       <Scene07_Puncture />,          's07', 'S07 · Make them remember')}
      {seq(D.s15_black,          <Scene15_Black />,             's15', 'S15 · Black')}
      {seq(D.s16_titleReturn,    <Scene16_TitleReturn />,       's16', 'S16 · Title return')}
    </AbsoluteFill>
  );
};
