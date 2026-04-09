import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  staticFile,
} from "remotion";

export type WhoAmISlideProps = {
  primaryColor: string;
};

const getImageSrc = (imageFile: string) => {
  if (typeof window !== "undefined" && (window as any).remotion_isStudio) {
    return staticFile(imageFile);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}/${imageFile}`;
};

const BULLETS = [
  "Hi, I'm Paul (@polats) from Toronto, CA",
  "1st time in Helsinki",
  "Anino → Gameloft → Altitude → OP Games → Cosmic Labs",
];

const SMALL_IMAGES = [
  { file: "supercell/runrun.webp", alt: "RunRun" },
  { file: "supercell/arcadia.png", alt: "Arcadia" },
];

export const WhoAmISlide: React.FC<WhoAmISlideProps> = ({ primaryColor }) => {
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

  const photoScale = spring({
    fps,
    frame: frame - 5,
    config: { damping: 12, stiffness: 100 },
    from: 0.8,
    to: 1,
  });
  const photoOpacity = interpolate(frame, [5, 20], [0, 1], {
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
        {/* Top row: small profile photo + two large images */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            flex: 1,
            alignItems: "stretch",
          }}
        >
          {/* Profile photo - top left */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              opacity: photoOpacity,
              transform: `scale(${photoScale})`,
              flexShrink: 0,
              alignSelf: "flex-start",
            }}
          >
            <img
              src={getImageSrc("supercell/paulgadi.webp")}
              alt="Paul Gadi"
              style={{
                width: "180px",
                height: "180px",
                objectFit: "cover",
                borderRadius: "16px",
                border: `3px solid ${primaryColor}`,
                boxShadow: `0 0 30px ${primaryColor}40`,
              }}
            />
            <img
              src={getImageSrc("supercell/paulgadi.jpeg")}
              alt="Paul Gadi"
              style={{
                width: "180px",
                height: "180px",
                objectFit: "cover",
                borderRadius: "16px",
                border: "2px solid rgba(255,255,255,0.15)",
                marginTop: "16px",
              }}
            />
          </div>

          {/* Two large images taking most of the space */}
          {SMALL_IMAGES.map((img, i) => {
            const imgOpacity = interpolate(
              frame,
              [20 + i * 10, 30 + i * 10],
              [0, 1],
              { extrapolateRight: "clamp" },
            );
            return (
              <img
                key={img.file}
                src={getImageSrc(img.file)}
                alt={img.alt}
                style={{
                  flex: 1,
                  objectFit: "cover",
                  objectPosition: i === 0 ? "left center" : "center",
                  borderRadius: "16px",
                  border: "2px solid rgba(255,255,255,0.15)",
                  opacity: imgOpacity,
                  minWidth: 0,
                }}
              />
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
