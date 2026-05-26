import { createQr } from "../services/qrService";

export async function handleManageCreateRoute(request, env) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const form = await request.formData();
  const id = form.get("id");
  const targetUrl = form.get("target_url");

  if (!id || !targetUrl) {
    return new Response("缺少参数", { status: 400 });
  }

  await createQr(env, id, targetUrl);

  return Response.redirect(new URL("/admin/manage", request.url).toString(), 302);
}
