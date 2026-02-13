import dotenv from "dotenv";
import os from "os";

dotenv.config();

const detectPlatform = () => {
  if (process.env.PLATFORM && process.env.PLATFORM !== "auto") return process.env.PLATFORM;
  if (process.platform === "win32") return "win32";
  if (process.platform === "darwin") return "darwin";
  if (process.platform === "linux" && os.release().toLowerCase().includes("microsoft")) return "wsl";
  return process.platform;
};

export const config = {
  port: Number(process.env.PORT || 9090),
  sharedSecret: process.env.AGENT_SHARED_SECRET || "",
  jwtSecret: process.env.AGENT_JWT_SECRET || "",
  workspaceRoot: process.env.WORKSPACE_ROOT || process.cwd(),
  logDir: process.env.LOG_DIR || "./logs",
  platform: detectPlatform()
};
