const app = require("../src/backend/server.js");

module.exports = (request, response) => {
  const requestUrl = request.url || "/";
  if (!requestUrl.startsWith("/api/") && requestUrl !== "/api") {
    request.url = `/api${requestUrl.startsWith("/") ? requestUrl : `/${requestUrl}`}`;
  }
  return app(request, response);
};
