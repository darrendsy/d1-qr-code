export function renderLoginPage(error: boolean): string {
  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="utf-8" />
  <title>管理员登录</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      color: #222;
    }
    .card {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 40px 36px;
      width: 100%;
      max-width: 360px;
      box-shadow: 0 2px 12px rgba(0,0,0,.06);
    }
    h1 {
      font-size: 20px;
      margin: 0 0 24px;
      text-align: center;
    }
    label {
      display: block;
      font-size: 13px;
      color: #555;
      margin-bottom: 6px;
    }
    input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 7px;
      font-size: 15px;
      outline: none;
      transition: border-color .15s;
    }
    input[type="password"]:focus { border-color: #0070f3; }
    button {
      width: 100%;
      margin-top: 18px;
      padding: 11px;
      background: #0070f3;
      color: #fff;
      border: none;
      border-radius: 7px;
      font-size: 15px;
      cursor: pointer;
      transition: background .15s;
    }
    button:hover { background: #005ed4; }
    .error {
      margin-top: 14px;
      padding: 10px 12px;
      background: #fff0f0;
      border: 1px solid #fcc;
      border-radius: 6px;
      font-size: 13px;
      color: #c00;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>二维码管理后台</h1>
    <form method="POST" action="/admin/login">
      <label for="password">管理员密码</label>
      <input id="password" type="password" name="password" autofocus required />
      <button type="submit">登录</button>
    </form>
    ${error ? `<div class="error">密码错误，请重试。</div>` : ""}
  </div>
</body>
</html>`;
}
