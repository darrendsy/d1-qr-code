import { getAllQrs } from "../services/qrService";
import { renderManagePage } from "../views/manageView";

export async function handleManageRoute(request, env) {
  const qrs = await getAllQrs(env);
  return new Response(renderManagePage(qrs), {
    headers: { "content-type": "text/html" },
  });
}
