import path from "path";
import { config } from "../config.js";

export function resolveSafeCwd(pathParam = ".") {
  const base = path.resolve(config.workspaceRoot);
  const target = path.resolve(base, pathParam);

  if (!target.startsWith(base)) {
    throw new Error("Path escapes workspace root");
  }

  return target;
}
