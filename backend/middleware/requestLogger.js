const SLOW_REQUEST_THRESHOLD_MS = Number(process.env.SLOW_REQUEST_THRESHOLD_MS || 1000);

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const userAgent = req.get("user-agent") || "unknown";
    const clientIp = req.ip || req.connection?.remoteAddress || "unknown";
    const level = durationMs >= SLOW_REQUEST_THRESHOLD_MS ? "WARN" : "INFO";

    console.log(
      `[${level}] ${new Date().toISOString()} ${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${durationMs.toFixed(1)}ms ip=${clientIp} ua="${userAgent}"`
    );
  });

  next();
};
