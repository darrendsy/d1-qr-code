export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const parts = path.split("/");

    // 后台查看统计：/admin/qr/:id
    if (parts[1] === "admin" && parts[2] === "qr") {
      const qrId = parts[3];

      if (!qrId) {
        return new Response("缺少二维码 ID", { status: 400 });
      }

      // 1. 查二维码信息
      const qr = await env.DB.prepare(
        "SELECT * FROM qr_codes WHERE id = ?"
      ).bind(qrId).first();

      if (!qr) {
        return new Response("未找到二维码", { status: 404 });
      }

      // 2. 查扫码记录
      const scans = await env.DB.prepare(
        "SELECT * FROM qr_scans WHERE qr_id = ? ORDER BY id DESC LIMIT 20"
      ).bind(qrId).all();

      // 3. 返回简单 HTML
      const html = `
        <h1>二维码统计：${qrId}</h1>
        <p>跳转目标：${qr.target_url}</p>
        <p>总扫码次数：${scans.results.length}</p>

        <h2>最近扫码记录</h2>
        <pre>${JSON.stringify(scans.results, null, 2)}</pre>
      `;

      return new Response(html, {
        headers: { "content-type": "text/html" },
      });
    }

    // 正常二维码跳转：/qr/:id
    if (parts[1] === "qr") {
      const qrId = parts[2];

      if (!qrId) {
        return new Response("缺少二维码 ID", { status: 400 });
      }

      // 查找二维码目标
      const qr = await env.DB.prepare(
        "SELECT target_url FROM qr_codes WHERE id = ?"
      ).bind(qrId).first();

      if (!qr) {
        return new Response("未找到对应二维码", { status: 404 });
      }

      // 记录扫码日志
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

      // 跳转
      return Response.redirect(qr.target_url, 302);
    }

    return new Response("OK");
  },
};
