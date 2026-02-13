import { pool } from "../db/pool.js";
import { hashToken } from "./security.js";

export async function bootstrapDefaults(config) {
  const org = (await pool.query("INSERT INTO organizations(name) VALUES($1) ON CONFLICT DO NOTHING RETURNING *", [config.seed.orgName])).rows[0]
    || (await pool.query("SELECT * FROM organizations WHERE name=$1", [config.seed.orgName])).rows[0];

  const user = (await pool.query(
    `INSERT INTO users(email, display_name, telegram_user_id) VALUES($1,$2,$3)
     ON CONFLICT (email) DO UPDATE SET display_name=EXCLUDED.display_name
     RETURNING *`,
    [config.seed.adminEmail, config.seed.adminName, config.seed.telegramAdminId || null]
  )).rows[0];

  const project = (await pool.query(
    `INSERT INTO projects(organization_id,name,slug) VALUES($1,$2,$3)
     ON CONFLICT (organization_id,slug) DO UPDATE SET name=EXCLUDED.name
     RETURNING *`,
    [org.id, config.seed.projectName, config.seed.projectSlug]
  )).rows[0];

  await pool.query(
    `INSERT INTO project_memberships(user_id, project_id, role) VALUES($1,$2,'admin')
     ON CONFLICT (user_id, project_id) DO NOTHING`,
    [user.id, project.id]
  );

  if (config.seed.adminApiToken) {
    await pool.query(
      `INSERT INTO api_tokens(user_id, token_hash, label) VALUES($1,$2,$3)
       ON CONFLICT (token_hash) DO NOTHING`,
      [user.id, hashToken(config.seed.adminApiToken), "seed-admin-token"]
    );
  }

  return { org, user, project };
}
