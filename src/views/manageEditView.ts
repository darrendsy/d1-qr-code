export function renderManageEditPage(qr) {
  return `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>编辑二维码 - ${qr.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 40px auto;
      max-width: 600px;
      line-height: 1.6;
      color: #333;
    }
    input {
      width: 100%;
      padding: 8px;
      margin-bottom: 15px;
    }
    button {
      padding: 8px 16px;
    }
  </style>
</head>
<body>

  <h1>编辑二维码：${qr.id}</h1>

  <form method="POST" action="/admin/manage/edit/${qr.id}">
    <label>跳转目标 URL：</label><br/>
    <input name="target_url" value="${qr.target_url}" required />

    <button type="submit">保存修改</button>
  </form>

</body>
</html>
`;
}
