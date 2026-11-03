import type { TestInfo } from "@playwright/test";

type Series = { name: string; points: { x: number; y: number }[] };
const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");

export async function attachChart(info: TestInfo, name: string, xLabel: string, yLabel: string, series: Series[]) {
  const points = series.flatMap((item) => item.points);
  const maxX = Math.max(1, ...points.map((p) => p.x));
  const maxY = Math.max(1, ...points.map((p) => p.y)) * 1.1;
  const x = (value: number) => 80 + value / maxX * 580;
  const y = (value: number) => 320 - value / maxY * 230;
  const colors = ["#007d64", "#c72f45", "#3e61ab"];
  const lines = series.map((item, index) => {
    const color = colors[index % colors.length];
    return `<text x="80" y="${52 + index * 18}" fill="${color}">${escape(item.name)}</text>
      <polyline fill="none" stroke="${color}" stroke-width="3" points="${item.points.map((p) => `${x(p.x)},${y(p.y)}`).join(" ")}"/>
      ${item.points.map((p) => `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="4" fill="${color}"><title>${p.x}: ${p.y.toFixed(1)}</title></circle>`).join("")}`;
  }).join("");
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const value = maxY * i / 4;
    return `<line x1="80" y1="${y(value)}" x2="660" y2="${y(value)}" stroke="#e4e4e7"/>
      <text x="70" y="${y(value) + 4}" text-anchor="end">${value.toFixed(0)}</text>`;
  }).join("");
  await info.attach(name, {
    contentType: "image/svg+xml",
    body: `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="390" viewBox="0 0 720 390">
      <rect width="720" height="390" fill="white"/>
      <g font-family="Arial, sans-serif" font-size="13" fill="#27272a">
      <text x="80" y="25" font-size="18">${escape(name)}</text>${ticks}${lines}
      <text x="80" y="340">0</text><text x="660" y="340" text-anchor="end">${maxX}</text>
      <text x="370" y="375" text-anchor="middle">${escape(xLabel)}</text>
      <text x="20" y="220" transform="rotate(-90 20 220)" text-anchor="middle">${escape(yLabel)}</text>
      </g></svg>`
  });
}
