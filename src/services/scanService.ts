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

export async function upsertQr(env, id, targetUrl, createdAt = null) {
  // 使用 SQLite UPSERT：如果 id 已存在则更新 target_url
  const sql = `
    INSERT INTO qr_codes (id, target_url, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET target_url = excluded.target_url
  `;
  return await env.DB.prepare(sql).bind(id, targetUrl, createdAt).run();
}

// 批量导入，rows 是 [{id, target_url, created_at?}, ...]
// mode: "skip" | "replace"
export async function bulkImportQrs(env, rows, mode = "skip") {
  // 使用事务提高性能与一致性
  await env.DB.prepare("BEGIN").run();
  try {
    let inserted = 0;
    for (const r of rows) {
      const id = String(r.id || "").trim();
      const target = String(r.target_url || "").trim();
      if (!id || !target) continue;

      if (mode === "skip") {
        // 先检查是否存在
        const exists = await env.DB.prepare("SELECT 1 FROM qr_codes WHERE id = ?").bind(id).first();
        if (exists) continue;
        await env.DB.prepare("INSERT INTO qr_codes (id, target_url, created_at) VALUES (?, ?, ?)").bind(id, target, r.created_at || null).run();
        inserted++;
      } else {
        // replace 模式：使用 upsert
        await upsertQr(env, id, target, r.created_at || null);
        inserted++;
      }
    }
    await env.DB.prepare("COMMIT").run();
    return { inserted };
  } catch (err) {
    await env.DB.prepare("ROLLBACK").run();
    throw err;
  }
}

