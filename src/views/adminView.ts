export function renderAdminPage(qr, scans) {
  return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>二维码统计 - ${qr.id}</title>
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
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }
    th, td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    th {
      background: #f5f5f5;
    }
    canvas {
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <h1>二维码统计：${qr.id}</h1>

  <div class="card">
    <div><strong>跳转目标：</strong> ${qr.target_url}</div>
    <div><strong>总扫码次数：</strong> ${scans.length}</div>
  </div>

  <h2>扫码趋势（按时间）</h2>
  <canvas id="trendChart" width="400" height="200"></canvas>

  <h2>国家分布</h2>
  <canvas id="countryChart" width="400" height="200"></canvas>

  <h2>最近扫码记录</h2>
  <table>
    <thead>
      <tr>
        <th>时间</th>
        <th>IP</th>
        <th>国家</th>
        <th>设备</th>
        <th>来源</th>
      </tr>
    </thead>
    <tbody>
      ${scans
        .map(
          (s) => `
        <tr>
          <td>${s.timestamp}</td>
          <td>${s.ip}</td>
          <td>${s.country}</td>
          <td>${s.user_agent}</td>
          <td>${s.referer || "-"}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <script>
    const scans = ${JSON.stringify(scans)};

    const trendLabels = scans.map(s => s.timestamp);
    const trendData = scans.map(s => 1);

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
}
