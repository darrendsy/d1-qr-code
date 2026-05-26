import { handleQrRoute } from "./routes/qr";
import { handleAdminRoute } from "./routes/admin";
import { handleManageRoute } from "./routes/manage";
import { handleManageCreateRoute } from "./routes/manageCreate";
import { handleManageEditRoute } from "./routes/manageEdit";
import { handleManageDeleteRoute } from "./routes/manageDelete";
import { handleExportQrRoute } from "./routes/exportQr";
import { handleExportQrsRoute } from "./routes/exportQrs";
import { handleQrImageRoute } from "./routes/qrImage";
import { handleLoginRoute, handleLogoutRoute } from "./routes/login";
import { isAuthenticated } from "./services/authService";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 公开路由：二维码跳转
    if (path.startsWith("/qr/")) {
      return handleQrRoute(request, env);
    }

    // 登录 / 登出（不需要鉴权）
    if (path === "/admin/login") {
      return handleLoginRoute(request, env);
    }
    if (path === "/admin/logout") {
      return handleLogoutRoute();
    }

    // 所有 /admin/* 路由统一鉴权
    if (path.startsWith("/admin/")) {
      if (!(await isAuthenticated(request, env))) {
        return Response.redirect(new URL("/admin/login", request.url).toString(), 302);
      }
    }

    // 管理路由（已通过鉴权）
    if (path.startsWith("/admin/qr-image/")) {
      return handleQrImageRoute(request);
    }
    if (path.startsWith("/admin/manage/edit/")) {
      return handleManageEditRoute(request, env);
    }
    if (path === "/admin/manage/create") {
      return handleManageCreateRoute(request, env);
    }
    if (path.startsWith("/admin/manage/delete/")) {
      return handleManageDeleteRoute(request, env);
    }
    if (path.startsWith("/admin/qr/")) {
      return handleAdminRoute(request, env);
    }
    if (path.startsWith("/admin/export/qr/")) {
      return handleExportQrRoute(request, env);
    }
    if (path === "/admin/export/qrs") {
      return handleExportQrsRoute(request, env);
    }
    if (path.startsWith("/admin/manage")) {
      return handleManageRoute(request, env);
    }

    return new Response("OK");
  },
};
