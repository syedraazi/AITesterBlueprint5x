const app = require("../../../src/backend/server.js");

module.exports = (request, response) => {
  request.url = "/api/settings/test/jira";
  return app(request, response);
};
