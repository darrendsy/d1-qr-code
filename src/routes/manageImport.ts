import { bulkImportQrs } from "../services/qrService";

function parseCsv(text) {
  // 简单 CSV 解析：按行，第一行为表头，支持逗号分隔与双引号转义
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // 简单处理双引号内逗号：若需要更健壮解析，可引入第三方解析器
    const cells = [];
    let cur = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"' ) {
        if (inQuotes && line[j+1] === '"') { cur += '"'; j++; continue; }
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    cells.push(cur);
    const obj = {};
    for (let k = 0; k < header.length; k++) {
      obj[header[k]] = (cells[k] || "").trim();
    }
    rows.push(obj);
  }
  return rows;
}

export async function handleManageImportRoute(request, env) {
  try {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const mode = String(form.get("mode") || "skip");

    if (!file || typeof file === "string") {
      return new Response("缺少文件", { status: 400 });
    }

    const filename = file.name || "import.csv";
    const text = await file.text();

    const parsed = parseCsv(text);
    if (!parsed.length) {
      return new Response("CSV 内容为空或格式不正确", { status: 400 });
    }

    const result = await bulkImportQrs(env, parsed, mode);

    // 跳回管理页并在 query 中带上结果（使用绝对 URL）
    const redirectUrl = new URL("/admin/manage", request.url);
    redirectUrl.searchParams.set("imported", String(result.inserted));
    redirectUrl.searchParams.set("file", filename);
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (err) {
    console.error("manageImport error:", err);
    return new Response("导入失败: " + (err && err.stack ? err.stack : String(err)), { status: 500 });
  }
}
