import { pool } from "../db/pool.js";
import { hashToken } from "./security.js";

export async function findApiPrincipal(rawToken, projectSlug) {
  const tokenHash = hashToken(rawToken);
  const { rows } = await pool.query(
    `SELECT u.id as user_id, u.display_name, pm.role, p.id as project_id, p.slug as project_slug,
            o.id as org_id, o.name as org_name
     FROM api_tokens t
     JOIN users u ON u.id = t.user_id AND u.is_active = true
     JOIN project_memberships pm ON pm.user_id = u.id
     JOIN projects p ON p.id = pm.project_id
     JOIN organizations o ON o.id = p.organization_id
     WHERE t.token_hash = $1 AND p.slug = $2`,
    [tokenHash, projectSlug]
  );

  return rows[0] || null;
}

export async function findTelegramPrincipal(telegramUserId, projectSlug) {
  const { rows } = await pool.query(
    `SELECT u.id as user_id, u.display_name, pm.role, p.id as project_id, p.slug as project_slug,
            o.id as org_id, o.name as org_name
     FROM users u
     JOIN project_memberships pm ON pm.user_id = u.id
     JOIN projects p ON p.id = pm.project_id
     JOIN organizations o ON o.id = p.organization_id
     WHERE u.telegram_user_id = $1 AND u.is_active = true AND p.slug = $2`,
    [telegramUserId, projectSlug]
  );
  return rows[0] || null;
}
