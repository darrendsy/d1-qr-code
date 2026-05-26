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
      <!DOCTYPE html>
      <html lang="zh">
      <head>
        <meta charset="utf-8" />
        <title>二维码统计 - ${qrId}</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 40px auto;
            max-width: 900px;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .card {
            background: #fafafa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #eee;
          }
          pre {
            background: #1e1e1e;
            color: #dcdcdc;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 14px;
          }
          canvas {
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
      
        <h1>二维码统计：${qrId}</h1>
      
        <div class="card">
          <div><strong>跳转目标：</strong> ${qr.target_url}</div>
          <div><strong>总扫码次数：</strong> ${scans.results.length}</div>
        </div>
      
        <h2>扫码趋势（按时间）</h2>
        <canvas id="trendChart" width="400" height="200"></canvas>
      
        <h2>国家分布</h2>
        <canvas id="countryChart" width="400" height="200"></canvas>
      
        <h2>最近扫码记录</h2>
        <pre>${JSON.stringify(scans.results, null, 2)}</pre>
      
        <script>
          const scans = ${JSON.stringify(scans.results)};
      
          // --- 扫码趋势图数据 ---
          const trendLabels = scans.map(s => s.timestamp);
          const trendData = scans.map(s => 1); // 每条记录计 1 次
      
          new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
              labels: trendLabels,
              datasets: [{
                label: '扫码次数',
                data: trendData,
                borderColor: '#4e79a7',
                tension: 0.3
              }]
            }
          });
      
          // --- 国家分布图数据 ---
          const countryCount = {};
          scans.forEach(s => {
            countryCount[s.country] = (countryCount[s.country] || 0) + 1;
          });
      
          new Chart(document.getElementById('countryChart'), {
            type: 'pie',
            data: {
              labels: Object.keys(countryCount),
              datasets: [{
                data: Object.values(countryCount),
                backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f']
              }]
            }
          });
        </script>
      
      </body>
      </html>
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
