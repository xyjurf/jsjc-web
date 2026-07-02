import pino from "pino";
import { CONFIG } from "./config";

let _logger: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (!_logger) {
    _logger = pino({
      level: CONFIG.worker.logLevel,
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
      base: { service: "fulfillment-worker" },
    });
  }
  return _logger;
}