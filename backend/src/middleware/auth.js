import { findApiPrincipal, findTelegramPrincipal } from "../repositories/authRepo.js";
import { config } from "../config.js";

export async function bearerAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const projectSlug = req.headers["x-project-slug"] || config.defaultProjectSlug;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const principal = await findApiPrincipal(token, projectSlug);
  if (!principal) return res.status(401).json({ error: "Unauthorized" });

  req.auth = {
    type: "bearer",
    userId: principal.user_id,
    displayName: principal.display_name,
    role: principal.role,
    orgId: principal.org_id,
    projectId: principal.project_id,
    projectSlug: principal.project_slug
  };
  next();
}

export async function telegramUserAuth(telegramUserId, projectSlug = config.defaultProjectSlug) {
  const principal = await findTelegramPrincipal(Number(telegramUserId), projectSlug);
  if (!principal) return null;
  return {
    type: "telegram",
    userId: principal.user_id,
    displayName: principal.display_name,
    role: principal.role,
    orgId: principal.org_id,
    projectId: principal.project_id,
    projectSlug: principal.project_slug
  };
}
