function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function renderAdminPage(qr, stats, dailyCounts, countryCounts, recentScans) {
  const total      = stats?.total ?? 0;
  const uniqueIps  = stats?.unique_ips ?? 0;
  const today      = stats?.today ?? 0;
  const topCountry = countryCounts[0]?.country ?? "—";

  const COLORS = ["#4e79a7","#f28e2b","#e15759","#76b7b2","#59a14f","#edc948","#b07aa1","#ff9da7","#9c755f","#bab0ac"];

  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>统计 — ${esc(qr.id)}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 32px 24px;
      max-width: 960px;
      margin-inline: auto;
      color: #222;
      line-height: 1.5;
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      font-size: 14px;
    }
    nav a { color: #0070f3; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    h1 { font-size: 24px; margin: 0 0 20px; }
    .overview {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .overview img {
      width: 140px;
      height: 140px;
      flex-shrink: 0;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fff;
    }
    .overview-info { flex: 1; min-width: 0; }
    .target-url {
      font-size: 14px;
      color: #555;
      margin-bottom: 16px;
      word-break: break-all;
    }
    .target-url a { color: #0070f3; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat-card {
      background: #f7f8fa;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      padding: 14px 16px;
      text-align: center;
    }
    .stat-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #111;
      line-height: 1.1;
    }
    .stat-card .label {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
    }
    .chart-box {
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 10px;
      padding: 20px;
    }
    .chart-box h2 {
      font-size: 15px;
      margin: 0 0 16px;
      color: #444;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      padding: 9px 10px;
      border-bottom: 1px solid #eee;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f5f5f5; font-weight: 600; color: #555; }
    tr:last-child td { border-bottom: none; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .section-header h2 { font-size: 16px; margin: 0; }
    .section-header a { font-size: 13px; color: #0070f3; text-decoration: none; }
    .ua { color: #555; }
    .empty { color: #aaa; font-size: 14px; padding: 20px 0; text-align: center; }
  </style>
</head>
<body>

  <nav>
    <a href="/admin/manage">← 返回管理列表</a>
    <div style="display:flex;gap:16px;align-items:center;">
      <a href="/admin/export/qr/${esc(qr.id)}">↓ 导出扫码 CSV</a>
      <a href="/admin/logout" style="color:#888;">退出登录</a>
    </div>
  </nav>

  <h1>二维码统计：${esc(qr.id)}</h1>

  <div class="overview">
    <a href="/admin/qr-image/${esc(qr.id)}" target="_blank" title="查看原始 SVG">
      <img src="/admin/qr-image/${esc(qr.id)}" alt="QR ${esc(qr.id)}" />
    </a>
    <div class="overview-info">
      <div class="target-url">
        跳转目标：<a href="${esc(qr.target_url)}" target="_blank" rel="noopener">${esc(qr.target_url)}</a>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${total}</div>
          <div class="label">总扫码次数</div>
        </div>
        <div class="stat-card">
          <div class="value">${uniqueIps}</div>
          <div class="label">独立 IP</div>
        </div>
        <div class="stat-card">
          <div class="value">${today}</div>
          <div class="label">今日扫码</div>
        </div>
        <div class="stat-card">
          <div class="value" style="font-size:18px">${esc(topCountry)}</div>
          <div class="label">最多国家</div>
        </div>
      </div>
    </div>
  </div>

  <div class="charts-row">
    <div class="chart-box">
      <h2>每日扫码趋势</h2>
      <canvas id="trendChart"></canvas>
    </div>
    <div class="chart-box">
      <h2>国家分布</h2>
      <canvas id="countryChart"></canvas>
    </div>
  </div>

  <div class="section-header">
    <h2>最近 20 条扫码记录</h2>
  </div>
  ${recentScans.length === 0
    ? `<div class="empty">暂无扫码记录</div>`
    : `<table>
    <thead>
      <tr>
        <th>时间</th>
        <th>IP</th>
        <th>国家</th>
        <th>设备 / UA</th>
        <th>来源</th>
      </tr>
    </thead>
    <tbody>
      ${recentScans.map(s => `
      <tr>
        <td style="white-space:nowrap">${esc(s.timestamp)}</td>
        <td style="white-space:nowrap">${esc(s.ip)}</td>
        <td>${esc(s.country || "—")}</td>
        <td class="ua" title="${esc(s.user_agent)}">${esc(truncate(s.user_agent || "", 60))}</td>
        <td class="ua" title="${esc(s.referer)}">${esc(truncate(s.referer || "", 40)) || "—"}</td>
      </tr>`).join("")}
    </tbody>
  </table>`}

  <script>
    const dailyCounts   = ${JSON.stringify(dailyCounts)};
    const countryCounts = ${JSON.stringify(countryCounts)};
    const COLORS = ${JSON.stringify(COLORS)};

    new Chart(document.getElementById('trendChart'), {
      type: 'bar',
      data: {
        labels: dailyCounts.map(d => d.date),
        datasets: [{
          label: '扫码次数',
          data: dailyCounts.map(d => d.count),
          backgroundColor: '#4e79a7',
          borderRadius: 4,
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });

    new Chart(document.getElementById('countryChart'), {
      type: 'doughnut',
      data: {
        labels: countryCounts.map(c => c.country),
        datasets: [{
          data: countryCounts.map(c => c.count),
          backgroundColor: COLORS.slice(0, countryCounts.length),
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } }
        }
      }
    });
  </script>

</body>
</html>`;
}
