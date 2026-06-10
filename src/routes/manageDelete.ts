import { deleteQr } from "../services/qrService";
import { deleteScansByQrId } from "../services/scanService";

export async function handleManageDeleteRoute(request, env) {
  try {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const qrId = decodeURIComponent(parts[parts.length - 1] ?? "");

    if (!qrId) {
      return new Response("缺少二维码 ID", { status: 400 });
    }

    // 先删除扫码记录，再删除二维码
    await deleteScansByQrId(env, qrId);
    await deleteQr(env, qrId);

    // 绝对跳转回管理页
    return Response.redirect(new URL("/admin/manage", request.url).toString(), 302);
  } catch (err) {
    console.error("manageDelete error:", err);
    return new Response("删除失败: " + (err && err.stack ? err.stack : String(err)), { status: 500 });
  }
}
