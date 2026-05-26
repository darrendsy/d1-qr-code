import { handleQrRoute } from "./routes/qr";
import { handleAdminRoute } from "./routes/admin";
import { handleManageRoute } from "./routes/manage";
import { handleManageCreateRoute } from "./routes/manageCreate";
import { handleManageEditRoute } from "./routes/manageEdit";




export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/qr/")) {
      return handleQrRoute(request, env);
    }

    if (path.startsWith("/admin/manage/edit/")) {
      return handleManageEditRoute(request, env);
    }


    if (path === "/admin/manage/create") {
      return handleManageCreateRoute(request, env);
    }


    if (path.startsWith("/admin/manage")) {
      return handleManageRoute(request, env);
    }


    if (path.startsWith("/admin/qr/")) {
      return handleAdminRoute(request, env);
    }

    return new Response("OK");
  },
};
