import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { monogramPaths } from "@/lib/brand/monogram";
import { siteOrigin } from "@/lib/site/site-origin";
import { SHARE_SIZE, shareCardText } from "./share-card";

/* All file reads happen at build time: every share image route is static. */
const root = process.cwd();

/** Read the existing token source; no parallel palette. */
function token(name: string) {
  const css = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]+)`, "i"))?.[1];
  if (!value) throw new Error(`Missing share image token: ${name}`);
  return value;
}

/**
 * The site's own Inter Tight as two static instances (next/og cannot read WOFF2 or variable
 * fonts). Made from src/fonts/inter-tight-roman.woff2 by scripts/brand/fonts.py.
 */
function fonts() {
  return ([400, 700] as const).map((weight) => ({
    name: "Inter Tight",
    data: readFileSync(join(root, `src/fonts/inter-tight-share-${weight}.ttf`)),
    weight,
    style: "normal" as const,
  }));
}

/** A cover as a data URL, or nothing when the file is missing: the card then uses text only. */
function coverData(src: string | undefined) {
  const file = src === undefined ? undefined : join(root, "public", src);
  if (file === undefined || !existsSync(file)) return undefined;
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
}

/** The address printed on the card: only a configured public origin, never a guess. */
function siteHost() {
  const origin = siteOrigin(process.env);
  return origin === null ? undefined : new URL(origin).hostname.replace(/^www\./, "");
}

/** Font size by length, so the shortened title always fits its lines. */
function titleSize(title: string, withCover: boolean) {
  if (withCover) return title.length <= 22 ? 64 : 54;
  return title.length <= 24 ? 96 : title.length <= 48 ? 80 : 68;
}

type ShareImageInput = Parameters<typeof shareCardText>[0] & {
  /** A project capture under public/ (see shareCapture). Shown with its disclosure. */
  capture?: string;
};

/**
 * The share card: the ME mark and wordmark, the page title, and a section label on the ink
 * background, as in the footer and menu. Project cards add the project's real cover, captioned
 * the way the site captions captures. Lime appears only in the mark and the label's square.
 */
export function shareImage({ capture, ...input }: ShareImageInput) {
  const text = shareCardText(input);
  const ink = token("foreground");
  const paper = token("background");
  const lime = token("highlight");
  const cover = coverData(capture);
  const host = siteHost();
  const mark = monogramPaths("master");
  const markHeight = 40;
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "64px 80px 60px",
        background: ink,
        color: paper,
        fontFamily: "Inter Tight",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg
          width={(markHeight * mark.width) / mark.height}
          height={markHeight}
          viewBox={`0 0 ${mark.width} ${mark.height}`}
        >
          <path d={mark.mark} fill={paper} />
          <path d={mark.accent} fill={lime} />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.65px",
            textTransform: "uppercase",
          }}
        >
          {text.ownerName}
        </div>
        {host ? (
          <div style={{ display: "flex", marginLeft: "auto", fontSize: 22, opacity: 0.72 }}>
            {host}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: cover ? "center" : "flex-end",
          flex: 1,
          maxWidth: cover ? 470 : 1000,
          paddingBottom: text.sectionLabel && !cover ? 44 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: titleSize(text.title, cover !== undefined),
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            overflowWrap: "anywhere",
          }}
        >
          {text.title}
        </div>
        {text.line ? (
          <div
            style={{
              display: "flex",
              marginTop: 26,
              maxWidth: cover ? 470 : 820,
              fontSize: cover ? 24 : 30,
              lineHeight: 1.38,
              opacity: 0.72,
            }}
          >
            {text.line}
          </div>
        ) : null}
      </div>
      {text.sectionLabel ? (
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24 }}>
          <div style={{ display: "flex", width: 14, height: 14, background: lime }} />
          {text.sectionLabel}
        </div>
      ) : null}
      {/* next/og draws no fragments, so the cover and its caption are separate elements. */}
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the page
        <img
          src={cover}
          alt=""
          width={680}
          height={425}
          style={{
            position: "absolute",
            left: 600,
            top: 132,
            borderRadius: 14,
            border: `1px solid ${token("border-strong")}`,
          }}
        />
      ) : null}
      {cover ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 600,
            top: 574,
            fontSize: 20,
            opacity: 0.6,
          }}
        >
          Real interface, sample data.
        </div>
      ) : null}
    </div>,
    { ...SHARE_SIZE, fonts: fonts() },
  );
}
