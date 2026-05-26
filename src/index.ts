export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const parts = path.split("/");
    const qrId = parts[2];

    if (!qrId) {
      return new Response("缺少二维码 ID", { status: 400 });
    }

    // 1. 查找二维码目标
    const stmt = env.DB.prepare("SELECT target_url FROM qr_codes WHERE id = ?");
    const qr = await stmt.bind(qrId).first();

    if (!qr) {
      return new Response("未找到对应二维码", { status: 404 });
    }

    // 2. 记录扫码日志
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const ua = request.headers.get("User-Agent") || "";
    const referer = request.headers.get("Referer") || "";
    const country = request.cf?.country || "";

    await env.DB.prepare(
      `INSERT INTO qr_scans (qr_id, ip, user_agent, referer, country)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(qrId, ip, ua, referer, country)
      .run();

    // 3. 跳转
    return Response.redirect(qr.target_url, 302);
  },
};
