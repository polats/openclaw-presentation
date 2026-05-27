import React, { useRef, useEffect } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  staticFile,
} from "remotion";

export type Media = { file: string; alt: string; type: "video" | "image"; flex: number };

export type WhoAmIVideoSlideProps = {
  primaryColor: string;
  media: Media[];
};

// Aspect-ratio flex values keep each clip uncropped (objectFit: contain) while
// giving wider videos more horizontal room.
export const MEDIA_APOCALYPSE: Media = { file: "screenshots/apocalypse-radio-clip.mp4", alt: "Apocalypse Radio", type: "video", flex: 1386 / 846 };
export const MEDIA_GAME_A_DAY: Media = { file: "screenshots/game-a-day.gif", alt: "r/game_a_day", type: "image", flex: 960 / 480 };
export const MEDIA_SOULCATS: Media = { file: "supercell/soulcats.mp4", alt: "soulcats.xyz", type: "video", flex: 1280 / 720 };

const getMediaSrc = (file: string) => {
  if (typeof window !== "undefined" && (window as any).remotion_isStudio) {
    return staticFile(file);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/${file}`;
};

const BULLETS = [
  "Hi, I'm Paul (@polats) from Toronto, CA",
  "Toronto Tech Week 2026",
  "Anino → Gameloft → Altitude → OP Games → Cosmic Labs",
];

const VideoTile: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);
  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      autoPlay
      playsInline
      aria-label={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        borderRadius: "16px",
      }}
    />
  );
};

export const WhoAmIVideoSlide: React.FC<WhoAmIVideoSlideProps> = ({ primaryColor, media }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({
    fps,
    frame,
    config: { damping: 10, stiffness: 100 },
    from: -50,
    to: 0,
  });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        padding: "80px 120px",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 16, 20, 0.75)",
          backdropFilter: "blur(8px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-20%",
          width: "50%",
          height: "50%",
          background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)`,
          filter: "blur(100px)",
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 800,
          fontFamily: '"Space Grotesk", Inter, sans-serif',
          marginBottom: "40px",
          textTransform: "uppercase",
          borderBottom: `4px solid ${primaryColor}`,
          paddingBottom: "16px",
          width: "fit-content",
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          position: "relative",
        }}
      >
        WHOAMI
      </h1>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative",
          gap: "32px",
        }}
      >
        {/* Videos take the whole row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            flex: 1,
            alignItems: "stretch",
            minHeight: 0,
          }}
        >
          {media.map((item, i) => {
            const mediaOpacity = interpolate(
              frame,
              [10 + i * 10, 25 + i * 10],
              [0, 1],
              { extrapolateRight: "clamp" },
            );
            return (
              <div
                key={item.file}
                style={{
                  flex: item.flex,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  opacity: mediaOpacity,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: "16px",
                    border: "2px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(0,0,0,0.35)",
                    overflow: "hidden",
                  }}
                >
                  {item.type === "video" ? (
                    <VideoTile src={getMediaSrc(item.file)} alt={item.alt} />
                  ) : (
                    <img
                      src={getMediaSrc(item.file)}
                      alt={item.alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: "16px",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: primaryColor,
                    textAlign: "center",
                  }}
                >
                  {item.alt}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom: bullet points in a single row */}
        <div style={{ display: "flex", gap: "48px" }}>
          {BULLETS.map((bullet, index) => {
            const featureFrame = frame - (index * 15 + 15);
            const featureY = spring({
              fps,
              frame: featureFrame,
              config: { damping: 12, stiffness: 120 },
              from: 30,
              to: 0,
            });
            const featureOpacity = interpolate(featureFrame, [0, 10], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  transform: `translateY(${featureY}px)`,
                  opacity: featureOpacity,
                  fontSize: "1.6rem",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 20px ${primaryColor}80`,
                    transform: "rotate(45deg)",
                    flexShrink: 0,
                  }}
                />
                <span>{bullet}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
