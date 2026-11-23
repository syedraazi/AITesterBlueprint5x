import app from "../backend/server.mjs";

export default function handler(request, response) {
  const requestUrl = request.url || "/";
  if (!requestUrl.startsWith("/api/") && requestUrl !== "/api") {
    request.url = `/api${requestUrl.startsWith("/") ? requestUrl : `/${requestUrl}`}`;
  }
  return app(request, response);
}
