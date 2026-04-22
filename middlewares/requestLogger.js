const morgan = require("morgan");

const env = require("../config/env");
const logger = require("../config/logger");

module.exports = morgan(env.isProduction ? "combined" : "dev", {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
});
