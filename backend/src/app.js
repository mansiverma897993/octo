import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./logger.js";
import { requestId } from "./middleware/requestId.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import { bearerAuth } from "./middleware/auth.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { telegramRouter } from "./routes/telegramWebhook.js";
import { commandRouter } from "./routes/commandRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";

export function buildApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(requestId);
  app.use(pinoHttp({ logger }));
  app.use(apiRateLimit);

  app.use(healthRouter);
  app.use(telegramRouter);
  app.use("/api/commands", bearerAuth, commandRouter);
  app.use(dashboardRouter);

  return app;
}
