import { pool } from "../db/pool.js";

export async function createApproval(payload) {
  const { rows } = await pool.query(
    `INSERT INTO approvals (organization_id, project_id, requested_by, status, intent, requires_approval)
     VALUES ($1,$2,$3,'PENDING',$4::jsonb,$5)
     RETURNING *`,
    [payload.orgId, payload.projectId, payload.userId, JSON.stringify(payload.intent), payload.requiresApproval]
  );
  return rows[0];
}

export async function listApprovals(projectId, status = "PENDING", limit = 20) {
  const params = [projectId, limit];
  let where = "project_id = $1";
  if (status) {
    params.splice(1, 0, status);
    where += " AND status = $2";
  }
  const limitParam = status ? "$3" : "$2";
  const { rows } = await pool.query(`SELECT * FROM approvals WHERE ${where} ORDER BY requested_at DESC LIMIT ${limitParam}`, params);
  return rows;
}

export async function getApproval(id, projectId) {
  const { rows } = await pool.query("SELECT * FROM approvals WHERE id=$1 AND project_id=$2", [id, projectId]);
  return rows[0] || null;
}

export async function setApprovalStatus(id, projectId, status, decidedBy, executionResult = null) {
  const { rows } = await pool.query(
    `UPDATE approvals
     SET status=$3, decided_at=now(), decided_by=$4, execution_result = COALESCE($5::jsonb, execution_result)
     WHERE id=$1 AND project_id=$2
     RETURNING *`,
    [id, projectId, status, decidedBy, executionResult ? JSON.stringify(executionResult) : null]
  );
  return rows[0] || null;
}
