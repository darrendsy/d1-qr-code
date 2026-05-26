import { renderSVG } from "uqr";

export function generateQrSvg(text: string): string {
  return renderSVG(text, { pixelSize: 4, ecc: "M" });
}
