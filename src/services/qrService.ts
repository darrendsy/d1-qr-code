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

