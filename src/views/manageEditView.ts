function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderManageEditPage(qr, error?: string) {
  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>编辑二维码 — ${esc(qr.id)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 24px;
      max-width: 560px;
      margin-inline: auto;
      color: #222;
      line-height: 1.5;
    }
    nav { margin-bottom: 28px; font-size: 14px; }
    nav a { color: #0070f3; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    h1 { font-size: 22px; margin: 0 0 24px; }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #444;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 9px 11px;
      border: 1px solid #ddd;
      border-radius: 7px;
      font-size: 15px;
      margin-bottom: 18px;
      outline: none;
      transition: border-color .15s;
    }
    input:focus { border-color: #0070f3; }
    .warning {
      font-size: 12px;
      color: #888;
      margin-top: -14px;
      margin-bottom: 18px;
    }
    .error {
      padding: 10px 14px;
      background: #fff0f0;
      border: 1px solid #fcc;
      border-radius: 7px;
      color: #c00;
      font-size: 13px;
      margin-bottom: 18px;
    }
    .actions {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 4px;
    }
    button[type="submit"] {
      padding: 10px 22px;
      background: #0070f3;
      color: #fff;
      border: none;
      border-radius: 7px;
      font-size: 15px;
      cursor: pointer;
      transition: background .15s;
    }
    button[type="submit"]:hover { background: #005ed4; }
    .cancel { font-size: 14px; color: #888; text-decoration: none; }
    .cancel:hover { text-decoration: underline; }
  </style>
</head>
<body>

  <nav><a href="/admin/manage">← 返回管理列表</a></nav>

  <h1>编辑二维码</h1>

  ${error ? `<div class="error">${esc(error)}</div>` : ""}

  <form method="POST" action="/admin/manage/edit/${esc(qr.id)}">
    <label for="id">二维码 ID</label>
    <input id="id" name="id" value="${esc(qr.id)}" required />
    <p class="warning">修改 ID 会改变扫码链接（/qr/&lt;id&gt;），已印刷的二维码将失效。</p>

    <label for="target_url">跳转目标 URL</label>
    <input id="target_url" name="target_url" value="${esc(qr.target_url)}" required />

    <div class="actions">
      <button type="submit">保存修改</button>
      <a class="cancel" href="/admin/manage">取消</a>
    </div>
  </form>

</body>
</html>`;
}
