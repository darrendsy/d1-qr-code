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
    .notice {
      padding: 12px;
      background: #e6ffed;
      border: 1px solid #b7f0c6;
      margin-bottom: 16px;
      color: #064e2a;
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
    .small-form {
      display: inline-block;
      margin: 0;
    }
    .file-input {
      display: inline-block;
      vertical-align: middle;
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

  <h1>二维码管理</h1>

  <div class="top-actions">
    <!-- 导出所有二维码列表 -->
    <a href="/admin/export/qrs" style="margin-right:12px;">导出二维码列表 CSV</a>

    <!-- 导入二维码 CSV -->
    <form id="importForm" class="small-form" method="POST" action="/admin/manage/import" enctype="multipart/form-data" style="display:inline-block;margin-left:12px;">
      <input class="file-input" type="file" name="file" accept=".csv" required />
      <select name="mode" title="import mode" style="margin-left:8px;">
        <option value="skip">遇到重复跳过</option>
        <option value="replace">遇到重复覆盖</option>
      </select>
      <button type="submit" style="margin-left:8px;">导入 CSV</button>
    </form>

    <!-- 新增二维码表单 -->
    <form method="POST" action="/admin/manage/create" style="margin-left:auto;">
      <label style="font-weight:600;margin-right:8px;">新增二维码</label>
      <input name="id" placeholder="ID" required style="width:160px; padding:6px; margin-right:8px;">
      <input name="target_url" placeholder="跳转目标 URL" required style="width:320px; padding:6px; margin-right:8px;">
      <button type="submit" style="padding:6px 12px;">新增</button>
    </form>
  </div>

  <div style="margin-top:6px;font-size:13px;color:#666;">
    <strong>CSV 格式</strong>：第一行为表头，至少包含 <code>id,target_url</code> 两列。可选列 <code>created_at</code>（ISO 时间或 SQLite datetime）。
    示例：<code>id,target_url,created_at</code>
  </div>

  <!-- 导入结果提示（由页面脚本读取 location.search 并显示） -->
  <div id="importNoticeContainer"></div>

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
          <td>${qr.created_at || ""}</td>
          <td>
            <a href="/admin/qr/${qr.id}">查看</a> |
            <a href="/admin/manage/edit/${qr.id}">编辑</a> |
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

  <script>
    // 显示导入结果提示并清除 query，避免刷新重复提示
    (function () {
      try {
        const params = new URLSearchParams(location.search);
        if (params.has('imported')) {
          const count = params.get('imported');
          const file = params.get('file') || '';
          const msg = '导入完成：' + count + ' 条记录已导入。 文件：' + file;
          const container = document.getElementById('importNoticeContainer');
          const el = document.createElement('div');
          el.className = 'notice';
          el.textContent = msg;
          container.appendChild(el);
          // 清除 query 参数
          history.replaceState(null, '', location.pathname);
        }
      } catch (e) {
        // 忽略任何脚本错误，页面仍可正常使用
        console.error('import notice error', e);
      }
    })();
  </script>

</body>
</html>
`;
}
