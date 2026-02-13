import express from "express";
import { ExecutePayloadSchema, buildCommand } from "../executor/commandCatalog.js";
import { executeCommand } from "../executor/execute.js";
import { config } from "../config.js";
import { resolveSafeCwd } from "../security/workspaceGuard.js";
import { logger } from "../logger.js";

export const executeRouter = express.Router();

executeRouter.post("/execute", async (req, res) => {
  try {
    const payload = ExecutePayloadSchema.parse(req.body);
    const cwd = resolveSafeCwd(payload.intent.parameters.path || ".");
    const command = buildCommand(payload.intent, config.platform);

    logger.info({ requestId: payload.requestId, actor: payload.actor, command, cwd }, "executing command");

    const result = await executeCommand({
      cmd: command.cmd,
      args: command.args,
      cwd
    });

    logger.info({ requestId: payload.requestId, result }, "command finished");

    return res.json({
      requestId: payload.requestId,
      action: payload.intent.action,
      ...result
    });
  } catch (error) {
    logger.error({ error: error.message }, "execution failed");
    return res.status(400).json({ error: error.message });
  }
});
