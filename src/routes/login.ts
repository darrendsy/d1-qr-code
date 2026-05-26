import { createSessionToken, sessionCookieHeader, clearCookieHeader } from "../services/authService";
import { renderLoginPage } from "../views/loginView";

export async function handleLoginRoute(request: Request, env: any): Promise<Response> {
  if (request.method === "GET") {
    return new Response(renderLoginPage(false), {
      headers: { "content-type": "text/html" },
    });
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const password = String(form.get("password") ?? "");
    const adminPassword: string | undefined = env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return new Response(renderLoginPage(true), {
        status: 401,
        headers: { "content-type": "text/html" },
      });
    }

    const token = await createSessionToken(adminPassword);
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/admin/manage",
        "Set-Cookie": sessionCookieHeader(token),
      },
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
}

export function handleLogoutRoute(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/admin/login",
      "Set-Cookie": clearCookieHeader(),
    },
  });
}
