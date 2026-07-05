type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, payload: LogPayload): string {
    const timestamp = new Date().toISOString();
    const contextStr = payload.context ? ` | Context: ${JSON.stringify(payload.context)}` : "";
    const errorStr = payload.error ? ` | Error: ${payload.error instanceof Error ? payload.error.stack || payload.error.message : JSON.stringify(payload.error)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}]: ${payload.message}${contextStr}${errorStr}`;
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(this.formatMessage("info", { message, context }));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.formatMessage("warn", { message, context }));
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error(this.formatMessage("error", { message, error, context }));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", { message, context }));
    }
  }
}

export const logger = new Logger();
