import app from "../src/backend/server.mjs";

export default function handler(request, response) {
  request.url = "/api/connections";
  return app(request, response);
}
