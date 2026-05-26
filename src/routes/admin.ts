import { getQrById } from "../services/qrService";
import { getScansByQrId, getScanStats, getDailyScanCounts, getCountryDistribution } from "../services/scanService";
import { renderAdminPage } from "../views/adminView";

export async function handleAdminRoute(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const qrId = parts[3];

  if (!qrId) {
    return new Response("缺少二维码 ID", { status: 400 });
  }

  const qr = await getQrById(env, qrId);

  if (!qr) {
    return new Response("未找到二维码", { status: 404 });
  }

  const [stats, dailyCounts, countryCounts, recentScans] = await Promise.all([
    getScanStats(env, qrId),
    getDailyScanCounts(env, qrId),
    getCountryDistribution(env, qrId),
    getScansByQrId(env, qrId, 20),
  ]);

  return new Response(renderAdminPage(qr, stats, dailyCounts.results, countryCounts.results, recentScans.results), {
    headers: { "content-type": "text/html" },
  });
}
