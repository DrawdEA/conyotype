import { ImageResponse } from "next/og";

// rendered per request: a build-time prerender would need an incremental cache store on Workers, which we don't run
export const dynamic = "force-dynamic";

export const alt = "ConyoType — okayyy but like, can you make chika fast?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The display face, fetched from Google Fonts at render time; falls back to the default sans if that fails. */
async function displayFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Bagel+Fat+One", {
      headers: { "user-agent": "Mozilla/5.0" }, // ask for the TTF variant, not woff2
    }).then((r) => r.text());
    const url = css.match(/src: url\((https:[^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const font = await displayFont();
  const display = font ? "Bagel Fat One" : "sans-serif";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#141913",
          color: "#e9eedf",
          fontFamily: display,
        }}
      >
        <div style={{ display: "flex", fontSize: 44, lineHeight: 1 }}>
          conyo<span style={{ color: "#4d6ef5" }}>type</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 86, lineHeight: 1.05 }}>
          <div style={{ display: "flex" }}>Okayyy but like,</div>
          {/* one flex row of separate words: Satori measures a mid-line colored span wrong, so each word is its own box */}
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexShrink: 0, marginRight: 28 }}>can</div>
            <div style={{ display: "flex", flexShrink: 0, marginRight: 28 }}>you</div>
            <div style={{ display: "flex", flexShrink: 0, marginRight: 28 }}>make</div>
            <div style={{ display: "flex", flexShrink: 0, marginRight: 28, color: "#4d6ef5" }}>chika</div>
            <div style={{ display: "flex", flexShrink: 0 }}>fast?</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "sans-serif", fontSize: 28, color: "#8e9a86" }}>
          <div style={{ display: "flex", background: "#1d241b", borderRadius: 999, padding: "10px 22px", color: "#e9eedf" }}>30 seconds</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>type conyo chika to the GC, get on the leaderboard</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Bagel Fat One", data: font, style: "normal", weight: 400 }] : [],
    },
  );
}
