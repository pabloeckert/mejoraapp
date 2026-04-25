// Structured logging for Edge Functions
// Import: import { log } from "../_shared/log.ts";

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  fn: string;
  msg: string;
  data?: Record<string, unknown>;
  ts: string;
}

export function log(
  level: LogLevel,
  fn: string,
  msg: string,
  data?: Record<string, unknown>
) {
  const entry: LogEntry = {
    level,
    fn,
    msg,
    data,
    ts: new Date().toISOString(),
  };
  const output = JSON.stringify(entry);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.log(output);
}

export const logInfo = (fn: string, msg: string, data?: Record<string, unknown>) =>
  log("info", fn, msg, data);
export const logWarn = (fn: string, msg: string, data?: Record<string, unknown>) =>
  log("warn", fn, msg, data);
export const logError = (fn: string, msg: string, data?: Record<string, unknown>) =>
  log("error", fn, msg, data);
