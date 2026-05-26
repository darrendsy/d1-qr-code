import { renderAdminPage } from "../views/adminView";

export async function handleAdminRoute(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = parts[3];

  if (!qrId) {
    return new Response("缺少二维码 ID", { status: 400 });
  }

  // 查二维码信息
  const qr = await env.DB.prepare(
    "SELECT * FROM qr_codes WHERE id = ?"
  ).bind(qrId).first();

  if (!qr) {
    return new Response("未找到二维码", { status: 404 });
  }

  // 查扫码记录
  const scans = await env.DB.prepare(
    "SELECT * FROM qr_scans WHERE qr_id = ? ORDER BY id DESC LIMIT 50"
  ).bind(qrId).all();

  return new Response(renderAdminPage(qr, scans.results), {
    headers: { "content-type": "text/html" },
  });
}
