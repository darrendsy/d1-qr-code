export async function getQrById(env, id) {
  return await env.DB.prepare(
    "SELECT * FROM qr_codes WHERE id = ?"
  ).bind(id).first();
}

export async function getAllQrs(env) {
  return await env.DB.prepare(
    "SELECT * FROM qr_codes ORDER BY created_at DESC"
  ).all();
}

export async function getQrTarget(env, id) {
  return await env.DB.prepare(
    "SELECT target_url FROM qr_codes WHERE id = ?"
  ).bind(id).first();
}

export async function createQr(env, id, targetUrl) {
  return await env.DB.prepare(
    "INSERT INTO qr_codes (id, target_url) VALUES (?, ?)"
  ).bind(id, targetUrl).run();
}

export async function updateQr(env, id, targetUrl) {
  return await env.DB.prepare(
    "UPDATE qr_codes SET target_url = ? WHERE id = ?"
  ).bind(targetUrl, id).run();
}

export async function deleteQr(env, id) {
  return await env.DB.prepare(
    "DELETE FROM qr_codes WHERE id = ?"
  ).bind(id).run();
}

export async function getAllQrsForExport(env) {
  return await env.DB.prepare(
    "SELECT id, target_url, created_at FROM qr_codes ORDER BY created_at DESC"
  ).all();
}

// Rename a QR code ID. Migrates all scan records to the new ID in one transaction.
// Throws "ID_EXISTS" if newId is already taken, "NOT_FOUND" if oldId doesn't exist.
export async function renameQr(env, oldId, newId, targetUrl) {
  if (oldId === newId) {
    return updateQr(env, oldId, targetUrl);
  }

  const [original, conflict] = await Promise.all([
    env.DB.prepare("SELECT created_at FROM qr_codes WHERE id = ?").bind(oldId).first(),
    env.DB.prepare("SELECT 1 FROM qr_codes WHERE id = ?").bind(newId).first(),
  ]);

  if (!original) throw new Error("NOT_FOUND");
  if (conflict)  throw new Error("ID_EXISTS");

  await env.DB.prepare("BEGIN").run();
  try {
    await env.DB.prepare("INSERT INTO qr_codes (id, target_url, created_at) VALUES (?, ?, ?)")
      .bind(newId, targetUrl, original.created_at).run();
    await env.DB.prepare("UPDATE qr_scans SET qr_id = ? WHERE qr_id = ?")
      .bind(newId, oldId).run();
    await env.DB.prepare("DELETE FROM qr_codes WHERE id = ?")
      .bind(oldId).run();
    await env.DB.prepare("COMMIT").run();
  } catch (err) {
    await env.DB.prepare("ROLLBACK").run();
    throw err;
  }
}
