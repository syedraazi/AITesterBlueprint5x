import app from "../src/backend/server.mjs";

export default function handler(request, response) {
  request.url = "/api/strategy";
  if (typeof request.body === "string") {
    try {
      request.body = JSON.parse(request.body);
    } catch {
      return response.status(400).json({ error: "The request body must be valid JSON." });
    }
  }
  if (request.body !== undefined) request._body = true;
  return app(request, response);
}
