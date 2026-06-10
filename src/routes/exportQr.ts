// src/routes/exportQr.ts
import { getAllScansByQrId } from "../services/scanService";

function escapeCsvCell(value) {
  if (value == null) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function handleExportQrRoute(request, env) {
  // 可选：在此处校验管理员权限
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = decodeURIComponent(parts[parts.length - 1] ?? "");

  if (!qrId) return new Response("缺少二维码 ID", { status: 400 });

  const scansRes = await getAllScansByQrId(env, qrId);
  const rows = scansRes.results || [];

  // CSV header
  const header = ["id", "qr_id", "timestamp", "ip", "country", "user_agent", "referer"].join(",") + "\n";

  // CSV body
  const body = rows.map(r =>
    [
      escapeCsvCell(r.id),
      escapeCsvCell(r.qr_id),
      escapeCsvCell(r.timestamp),
      escapeCsvCell(r.ip),
      escapeCsvCell(r.country),
      escapeCsvCell(r.user_agent),
      escapeCsvCell(r.referer)
    ].join(",")
  ).join("\n");

  const csv = header + body;

  const filename = `qr_scans_${qrId}.csv`;
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}
