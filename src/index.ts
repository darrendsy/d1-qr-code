export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const parts = path.split("/");
    const qrId = parts[2];

    if (!qrId) {
      return new Response("缺少二维码 ID", { status: 400 });
    }

    // 从数据库查找对应的跳转目标
    const stmt = env.DB.prepare("SELECT target_url FROM qr_codes WHERE id = ?");
    const qr = await stmt.bind(qrId).first();

    if (!qr) {
      return new Response("未找到对应二维码", { status: 404 });
    }

    // 跳转到目标网址
    return Response.redirect(qr.target_url, 302);
  },
};
