import { ImageResponse } from "next/og";

export const alt = "Cessna 150 — Interactive Guide · lovethe150.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(
  family: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format/);
  if (!match) throw new Error(`Could not resolve ${family} ${weight}`);
  return (await fetch(match[1])).arrayBuffer();
}

export default async function Image() {
  // Every character rendered in each font must appear in its `text` subset.
  const headerText = "CESSNA 150 INTERACTIVE GUIDE O-200-A 1,600 LB 2";
  const monoText =
    "LOVETHE150.COM · AIRCRAFT SPECIFICATIONS · V-SPEEDS · FLAPS · PROCEDURES · MODEL · SEATS · ENGINE · MTOW · SPECS";

  const [robotoBold, robotoRegular, mono] = await Promise.all([
    loadGoogleFont("Roboto Condensed", 700, headerText),
    loadGoogleFont("Roboto Condensed", 400, headerText),
    loadGoogleFont("JetBrains Mono", 500, monoText),
  ]);

  const cream = "#f4efe6";
  const creamDark = "#e8e0d4";
  const burgundy = "#6b0f1a";
  const ink = "#1f2937";
  const muted = "#78716c";

  const specs: Array<[string, string]> = [
    ["MODEL", "150"],
    ["SEATS", "2"],
    ["ENGINE", "O-200-A"],
    ["MTOW", "1,600 LB"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: cream,
          fontFamily: "Roboto Condensed",
          position: "relative",
        }}
      >
        {/* Top burgundy rule */}
        <div style={{ height: 8, backgroundColor: burgundy, display: "flex" }} />

        {/* Blueprint grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(${burgundy}26 1px, transparent 1px), linear-gradient(90deg, ${burgundy}26 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            opacity: 0.18,
          }}
        />

        {/* Body */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "56px 72px 48px 72px",
            position: "relative",
          }}
        >
          {/* Left column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.35,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Overline */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 2,
                    backgroundColor: burgundy,
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    fontFamily: "JetBrains Mono",
                    fontSize: 18,
                    letterSpacing: 4,
                    color: burgundy,
                  }}
                >
                  LOVETHE150.COM
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 0.92,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 132,
                    fontWeight: 700,
                    color: ink,
                    letterSpacing: -2,
                  }}
                >
                  CESSNA
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 132,
                    fontWeight: 700,
                    color: burgundy,
                    letterSpacing: -2,
                  }}
                >
                  150
                </div>
              </div>

              {/* Subtitle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginTop: 28,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 700,
                    color: ink,
                    letterSpacing: 1,
                  }}
                >
                  INTERACTIVE GUIDE
                </div>
              </div>
            </div>

            {/* Footer tagline */}
            <div
              style={{
                display: "flex",
                fontFamily: "JetBrains Mono",
                fontSize: 18,
                color: muted,
                letterSpacing: 2,
              }}
            >
              SPECS · V-SPEEDS · FLAPS · PROCEDURES
            </div>
          </div>

          {/* Right column — specs card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              backgroundColor: creamDark,
              padding: "36px 32px",
              position: "relative",
            }}
          >
            {/* Corner marks */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 22,
                height: 22,
                borderTop: `3px solid ${burgundy}`,
                borderLeft: `3px solid ${burgundy}`,
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 22,
                height: 22,
                borderTop: `3px solid ${burgundy}`,
                borderRight: `3px solid ${burgundy}`,
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 22,
                height: 22,
                borderBottom: `3px solid ${burgundy}`,
                borderLeft: `3px solid ${burgundy}`,
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderBottom: `3px solid ${burgundy}`,
                borderRight: `3px solid ${burgundy}`,
                display: "flex",
              }}
            />

            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 14,
                letterSpacing: 3,
                color: burgundy,
                paddingBottom: 16,
                borderBottom: `1px solid ${ink}1a`,
                display: "flex",
              }}
            >
              AIRCRAFT SPECIFICATIONS
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 24,
              }}
            >
              {[
                [specs[0], specs[1]],
                [specs[2], specs[3]],
              ].map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: rowIdx === 0 ? 28 : 0,
                  }}
                >
                  {row.map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "JetBrains Mono",
                          fontSize: 13,
                          letterSpacing: 2,
                          color: muted,
                          marginBottom: 6,
                          display: "flex",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 38,
                          fontWeight: 700,
                          color: ink,
                          display: "flex",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Roboto Condensed",
          data: robotoBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Roboto Condensed",
          data: robotoRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "JetBrains Mono",
          data: mono,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
