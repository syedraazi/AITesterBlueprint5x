import app from "../../../src/backend/server.mjs";

export default function handler(request, response) {
  return app(request, response);
}
