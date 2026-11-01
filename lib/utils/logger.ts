/**
 * Centralized logging utility providing standard level methods with consistent [EventPilot] prefixing.
 */

const LOG_PREFIX = "[EventPilot]";

export const logger = {
  debug(...args: unknown[]): void {
    console.debug(LOG_PREFIX, ...args);
  },
  info(...args: unknown[]): void {
    console.info(LOG_PREFIX, ...args);
  },
  warn(...args: unknown[]): void {
    console.warn(LOG_PREFIX, ...args);
  },
  error(...args: unknown[]): void {
    console.error(LOG_PREFIX, ...args);
  },
};
