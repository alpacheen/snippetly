import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";


export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Snippetly";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "white",
          fontSize: 64,
          fontFamily: "sans-serif",
          padding: "0 100px",
          textAlign: "center",
        }}
      >
        <h1>{title}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
