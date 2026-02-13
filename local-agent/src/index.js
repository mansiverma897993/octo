import express from "express";
import { config } from "./config.js";
import { verifyRequest } from "./security/verifyRequest.js";
import { executeRouter } from "./routes/executeRoute.js";
import { logger } from "./logger.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(verifyRequest);
app.use(executeRouter);

app.listen(config.port, () => {
  logger.info({ port: config.port, platform: config.platform, workspaceRoot: config.workspaceRoot }, "mdc-local-agent started");
  console.log(`mdc-local-agent running on :${config.port}`);
});
