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
