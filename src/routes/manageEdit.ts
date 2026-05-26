import { getQrById, updateQr } from "../services/qrService";
import { renderManageEditPage } from "../views/manageEditView";

export async function handleManageEditRoute(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = parts[4]; // /admin/manage/edit/:id

  if (request.method === "GET") {
    const qr = await getQrById(env, qrId);
    if (!qr) return new Response("未找到二维码", { status: 404 });

    return new Response(renderManageEditPage(qr), {
      headers: { "content-type": "text/html" },
    });
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const targetUrl = form.get("target_url");

    await updateQr(env, qrId, targetUrl);

    return Response.redirect("/admin/manage", 302);
  }

  return new Response("Method Not Allowed", { status: 405 });
}
