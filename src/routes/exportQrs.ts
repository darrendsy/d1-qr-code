// src/routes/exportQrs.ts
import { getAllQrsForExport } from "../services/qrService";

function escapeCsvCell(value) {
  if (value == null) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function handleExportQrsRoute(request, env) {
  // 可选：在此处校验管理员权限
  const qrsRes = await getAllQrsForExport(env);
  const rows = qrsRes.results || [];

  const header = ["id", "target_url", "created_at"].join(",") + "\n";
  const body = rows.map(q =>
    [escapeCsvCell(q.id), escapeCsvCell(q.target_url), escapeCsvCell(q.created_at)].join(",")
  ).join("\n");

  const csv = header + body;
  const filename = `qr_list.csv`;
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}
