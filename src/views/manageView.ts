<!-- 导出所有二维码列表 -->
<a href="/admin/export/qrs" style="margin-right:12px;">导出二维码列表 CSV</a>

<!-- 每行导出该二维码扫码记录 -->
<a href="/admin/export/qr/${qr.id}">导出扫码 CSV</a>

<!-- 导入二维码 CSV -->
<form id="importForm" method="POST" action="/admin/manage/import" enctype="multipart/form-data" style="display:inline-block;margin-left:12px;">
  <input type="file" name="file" accept=".csv" required />
  <select name="mode" title="import mode" style="margin-left:8px;">
    <option value="skip">遇到重复跳过</option>
    <option value="replace">遇到重复覆盖</option>
  </select>
  <button type="submit" style="margin-left:8px;">导入 CSV</button>
</form>

<!-- 可选：显示导入说明 -->
<div style="margin-top:12px;font-size:13px;color:#666;">
  <strong>CSV 格式</strong>：第一行为表头，至少包含 <code>id,target_url</code> 两列。可选列 <code>created_at</code>（ISO 时间或 SQLite datetime）。
  示例：<code>id,target_url,created_at</code>
</div>


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
            <a href="/admin/manage/edit/${qr.id}">编辑</a> |
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
