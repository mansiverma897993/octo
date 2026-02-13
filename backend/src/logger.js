import fs from "fs";
import path from "path";
import pino from "pino";
import { config } from "./config.js";

fs.mkdirSync(config.logDir, { recursive: true });
const destination = pino.destination(path.join(config.logDir, "backend.log"));

export const logger = pino({
  level: "info",
  base: { service: "mdc-backend" }
}, destination);
