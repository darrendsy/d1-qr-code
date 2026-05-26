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
    a {
      color: #0070f3;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <h1>二维码管理</h1>

<form method="POST" action="/admin/manage/create" style="margin-bottom: 30px;">
  <label>二维码 ID：</label><br/>
  <input name="id" required style="width: 300px; padding: 8px; margin-bottom: 10px;"><br/>

  <label>跳转目标 URL：</label><br/>
  <input name="target_url" required style="width: 300px; padding: 8px; margin-bottom: 10px;"><br/>

  <button type="submit" style="padding: 8px 16px;">新增二维码</button>
</form>


  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>跳转目标</th>
        <th>创建时间</th>
        <th>统计</th>
      </tr>
    </thead>
    <tbody>
      ${qrs.results
        .map(
          (qr) => `
        <tr>
          <td>${qr.id}</td>
          <td>${qr.target_url}</td>
          <td>${qr.created_at}</td>
          <td>
            <a href="/admin/qr/${qr.id}">查看</a> |
            <a href="/admin/manage/edit/${qr.id}">编辑</a>
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
