export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 取出路径，例如 /qr/abc123
    const path = url.pathname;

    // 分割路径，得到二维码 ID
    // /qr/abc123 → ["", "qr", "abc123"]
    const parts = path.split("/");

    // parts[2] 就是二维码 ID
    const qrId = parts[2];

    return new Response(`二维码 ID 是：${qrId}`);
  },
};
