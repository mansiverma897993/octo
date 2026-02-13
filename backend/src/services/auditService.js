import { logger } from "../logger.js";

export function audit(event, data = {}) {
  logger.info({ event, ...data });
}
