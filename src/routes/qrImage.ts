import { generateQrSvg } from "../services/qrImageService";

export function handleQrImageRoute(request: Request): Response {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = parts[parts.length - 1];

  if (!qrId) {
    return new Response("缺少二维码 ID", { status: 400 });
  }

  const scanUrl = `${url.origin}/qr/${qrId}`;
  const svg = generateQrSvg(scanUrl);

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=86400",
    },
  });
}
