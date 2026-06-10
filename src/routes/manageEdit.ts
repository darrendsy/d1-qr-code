import { getQrById, renameQr } from "../services/qrService";
import { renderManageEditPage } from "../views/manageEditView";

export async function handleManageEditRoute(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = decodeURIComponent(parts[parts.length - 1] ?? "");

  if (request.method === "GET") {
    const qr = await getQrById(env, qrId);
    if (!qr) return new Response("未找到二维码", { status: 404 });
    return new Response(renderManageEditPage(qr), { headers: { "content-type": "text/html" } });
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const newId     = String(form.get("id")         ?? "").trim();
    const targetUrl = String(form.get("target_url") ?? "").trim();

    if (!newId || !targetUrl) {
      const qr = await getQrById(env, qrId);
      return new Response(renderManageEditPage(qr, "ID 和跳转目标 URL 不能为空"), {
        status: 400,
        headers: { "content-type": "text/html" },
      });
    }

    try {
      await renameQr(env, qrId, newId, targetUrl);
      return Response.redirect(new URL("/admin/manage", request.url).toString(), 302);
    } catch (err: any) {
      const qr = await getQrById(env, qrId);
      const msg = err?.message === "ID_EXISTS"
        ? `ID "${newId}" 已存在，请换一个。`
        : "保存失败：" + String(err?.message ?? err);
      return new Response(renderManageEditPage(qr, msg), {
        status: 400,
        headers: { "content-type": "text/html" },
      });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
