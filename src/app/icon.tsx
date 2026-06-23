import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Branded favicon: the green apex-peak mark on near-black.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 512 512">
          <path
            d="M256 120 L412 392 L330 392 L256 256 L182 392 L100 392 Z"
            fill="#00e676"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
