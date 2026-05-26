export async function logScan(env, qrId, ip, ua, referer, country) {
  return await env.DB.prepare(
    `INSERT INTO qr_scans (qr_id, ip, user_agent, referer, country)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(qrId, ip, ua, referer, country)
    .run();
}

export async function getScansByQrId(env, qrId, limit = 50) {
  return await env.DB.prepare(
    "SELECT * FROM qr_scans WHERE qr_id = ? ORDER BY id DESC LIMIT ?"
  ).bind(qrId, limit).all();
}

export async function deleteScansByQrId(env, qrId) {
  return await env.DB.prepare(
    "DELETE FROM qr_scans WHERE qr_id = ?"
  ).bind(qrId).run();
}

export async function getAllScansByQrId(env, qrId) {
  return await env.DB.prepare(
    "SELECT id, qr_id, ip, user_agent, referer, country, timestamp FROM qr_scans WHERE qr_id = ? ORDER BY id DESC"
  ).bind(qrId).all();
}

export async function getScanStats(env, qrId) {
  return await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(DISTINCT ip) as unique_ips,
      SUM(CASE WHEN DATE(timestamp) = DATE('now') THEN 1 ELSE 0 END) as today
    FROM qr_scans WHERE qr_id = ?
  `).bind(qrId).first();
}

export async function getDailyScanCounts(env, qrId) {
  return await env.DB.prepare(`
    SELECT DATE(timestamp) as date, COUNT(*) as count
    FROM qr_scans WHERE qr_id = ?
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
    LIMIT 60
  `).bind(qrId).all();
}

export async function getCountryDistribution(env, qrId) {
  return await env.DB.prepare(`
    SELECT COALESCE(NULLIF(country, ''), 'Unknown') as country, COUNT(*) as count
    FROM qr_scans WHERE qr_id = ?
    GROUP BY country
    ORDER BY count DESC
    LIMIT 10
  `).bind(qrId).all();
}


