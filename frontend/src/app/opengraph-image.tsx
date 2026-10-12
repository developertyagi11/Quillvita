import { ImageResponse } from "next/og";

import { BRAND_COLOR, CANVAS_COLOR, OG_IMAGE_ALT, SITE_NAME } from "@/lib/site";

export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FEATURES = ["Match score", "ATS readiness", "Missing keywords", "Every change explained"];

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: CANVAS_COLOR,
        color: "#f7f8f8",
        border: "1px solid #23252a",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: BRAND_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Q
        </div>
        <div style={{ fontSize: 34, fontWeight: 600 }}>{SITE_NAME}</div>
        <div
          style={{
            marginLeft: 12,
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #23252a",
            background: "#0f1011",
            color: "#8a8f98",
            fontSize: 22,
          }}
        >
          Free · No account needed
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.05 }}>
          Tailor your resume to every job.
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.05,
            color: "#8a8f98",
          }}
        >
          Without inventing a thing.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {FEATURES.map((feature) => (
          <div
            key={feature}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 10,
              border: "1px solid #23252a",
              background: "#0f1011",
              color: "#d0d6e0",
              fontSize: 24,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: BRAND_COLOR }} />
            {feature}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
