import { getQrTarget } from "../services/qrService";
import { logScan } from "../services/scanService";

export async function handleQrRoute(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = decodeURIComponent(parts[2] ?? "");

  if (!qrId) {
    return new Response("缺少二维码 ID", { status: 400 });
  }

  const qr = await getQrTarget(env, qrId);

  if (!qr) {
    return new Response("未找到对应二维码", { status: 404 });
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ua = request.headers.get("User-Agent") || "";
  const referer = request.headers.get("Referer") || "";
  const country = request.cf?.country || "";

  await logScan(env, qrId, ip, ua, referer, country);

  return Response.redirect(qr.target_url, 302);
}
