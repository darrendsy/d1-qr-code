import { handleQrRoute } from "./routes/qr";
import { handleAdminRoute } from "./routes/admin";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/qr/")) {
      return handleQrRoute(request, env);
    }

    if (path.startsWith("/admin/qr/")) {
      return handleAdminRoute(request, env);
    }

    return new Response("OK");
  },
};
