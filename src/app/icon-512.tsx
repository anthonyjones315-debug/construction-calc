import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ea580c",
          fontSize: 320,
          fontWeight: 700,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
