import app from "../src/backend/server.mjs";

export default function handler(request, response) {
  request.url = "/api/health";
  return app(request, response);
}
