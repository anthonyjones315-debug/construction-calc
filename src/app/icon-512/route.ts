import React from "react";
import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ea580c",
          color: "white",
          fontSize: 320,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        },
      },
      "P",
    ),
    {
      width: 512,
      height: 512,
    },
  );
}
