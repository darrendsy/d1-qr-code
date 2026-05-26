import { handleQrRoute } from "./routes/qr";
import { handleAdminRoute } from "./routes/admin";
import { handleManageRoute } from "./routes/manage";
import { handleManageCreateRoute } from "./routes/manageCreate";
import { handleManageEditRoute } from "./routes/manageEdit";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. 最具体的路由
    if (path.startsWith("/admin/manage/edit/")) {
      return handleManageEditRoute(request, env);
    }

    if (path === "/admin/manage/create") {
      return handleManageCreateRoute(request, env);
    }

    // 2. 中等具体
    if (path.startsWith("/admin/qr/")) {
      return handleAdminRoute(request, env);
    }

    // 3. 管理页面
    if (path.startsWith("/admin/manage")) {
      return handleManageRoute(request, env);
    }

    // 4. 二维码跳转
    if (path.startsWith("/qr/")) {
      return handleQrRoute(request, env);
    }

    return new Response("OK");
  },
};
