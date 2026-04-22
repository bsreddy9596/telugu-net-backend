const env = require("./env");

function write(level, message, meta) {
  const timestamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${timestamp}] ${level.toUpperCase()}: ${message}${payload}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

module.exports = {
  http: (message) => write("http", message),
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta),
  isDevelopment: env.nodeEnv === "development",
};
