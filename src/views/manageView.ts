export function renderManagePage(qrs) {
  return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>二维码管理</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 40px auto;
      max-width: 900px;
      line-height: 1.6;
      color: #333;
    }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
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
      vertical-align: middle;
    }
    .qr-thumb {
      display: block;
      width: 72px;
      height: 72px;
    }
    th {
      background: #f5f5f5;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    .small-form {
      display: inline-block;
      margin: 0;
    }
    button.link-like {
      background:none;
      border:none;
      color:#0070f3;
      cursor:pointer;
      padding:0;
      font: inherit;
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <h1 style="margin:0;">二维码管理</h1>
    <a href="/admin/logout" style="font-size:13px;color:#888;">退出登录</a>
  </div>

  <div class="top-actions">
    <!-- 导出所有二维码列表 -->
    <a href="/admin/export/qrs" style="margin-right:12px;">导出二维码列表 CSV</a>

    <!-- 新增二维码表单 -->
    <form method="POST" action="/admin/manage/create" style="margin-left:auto;">
      <label style="font-weight:600;margin-right:8px;">新增二维码</label>
      <input name="id" placeholder="ID" required style="width:160px; padding:6px; margin-right:8px;">
      <input name="target_url" placeholder="跳转目标 URL" required style="width:320px; padding:6px; margin-right:8px;">
      <button type="submit" style="padding:6px 12px;">新增</button>
    </form>
  </div>

  <table>
    <thead>
      <tr>
        <th>二维码</th>
        <th>ID</th>
        <th>跳转目标</th>
        <th>创建时间</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      ${qrs.results
        .map(
          (qr) => `
        <tr>
          <td>
            <a href="/admin/qr-image/${qr.id}" target="_blank" title="点击查看原图">
              <img class="qr-thumb" src="/admin/qr-image/${qr.id}" alt="QR ${qr.id}" loading="lazy" />
            </a>
          </td>
          <td>${qr.id}</td>
          <td>${qr.target_url}</td>
          <td>${qr.created_at || ""}</td>
          <td>
            <a href="/admin/qr/${qr.id}">统计</a> |
            <a href="/admin/manage/edit/${qr.id}">编辑</a> |
            <a href="/admin/qr-image/${qr.id}" download="qr_${qr.id}.svg">下载 SVG</a> |
            <a href="/admin/export/qr/${qr.id}">导出扫码 CSV</a> |
            <form method="POST" action="/admin/manage/delete/${qr.id}" style="display:inline" onsubmit="return confirm('确认删除二维码 ${qr.id} 及其所有扫码记录吗？');">
              <button type="submit" style="background:none;border:none;color:#e00;cursor:pointer;padding:0;">删除</button>
            </form>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>


</body>
</html>
`;
}
