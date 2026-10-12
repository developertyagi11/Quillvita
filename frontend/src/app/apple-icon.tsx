import { ImageResponse } from "next/og";

import { BRAND_COLOR } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_COLOR,
      }}
    >
      <svg width="112" height="112" viewBox="6 6 20 20">
        <circle cx="15" cy="15" r="6.75" fill="none" stroke="#ffffff" strokeWidth="3.5" />
        <path d="M18.5 18.5 L23.5 23.5" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>,
    size,
  );
}
