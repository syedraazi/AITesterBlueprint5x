const app = require("../src/backend/server.js");

module.exports = (request, response) => {
  request.url = "/api/generate";
  if (typeof request.body === "string") {
    try {
      request.body = JSON.parse(request.body);
    } catch {
      return response.status(400).json({ error: "The request body must be valid JSON." });
    }
  }
  if (request.body !== undefined) request._body = true;
  return app(request, response);
};
