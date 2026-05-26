import { getQrById, updateQr } from "../services/qrService";
import { renderManageEditPage } from "../views/manageEditView";

export async function handleManageEditRoute(request, env) {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const qrId = parts[parts.length - 1];

    if (request.method === "GET") {
      const qr = await getQrById(env, qrId);
      if (!qr) return new Response("未找到二维码", { status: 404 });
      return new Response(renderManageEditPage(qr), { headers: { "content-type": "text/html" } });
    }

    if (request.method === "POST") {
      const form = await request.formData();
      const targetUrl = String(form.get("target_url") || "");
      if (!targetUrl) return new Response("缺少 target_url", { status: 400 });

      await updateQr(env, qrId, targetUrl);
      return Response.redirect("/admin/manage", 302);
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    console.error("manageEdit error:", err);
    return new Response("内部错误: " + (err && err.stack ? err.stack : String(err)), { status: 500 });
  }
}
