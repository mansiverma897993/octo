import express from "express";
import { parseIntent } from "../ai/intentParser.js";
import { enforcePolicy } from "../commands/policy.js";
import { executeOnAgent } from "../services/agentClient.js";
import { audit } from "../services/auditService.js";
import { config } from "../config.js";
import { createApproval, getApproval, listApprovals, setApprovalStatus } from "../repositories/approvalRepo.js";

export const commandRouter = express.Router();

commandRouter.post("/interpret-and-run", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "text is required" });

    const intent = await parseIntent(text);
    const allowedIntent = enforcePolicy(intent, req.auth);
    audit("intent.parsed", { requestId: req.requestId, user: req.auth.userId, intent: allowedIntent });

    if (config.approvalMode || allowedIntent.requiresApproval) {
      const approval = await createApproval({
        orgId: req.auth.orgId,
        projectId: req.auth.projectId,
        userId: req.auth.userId,
        intent: { requestId: req.requestId, intent: allowedIntent, user: req.auth },
        requiresApproval: true
      });
      return res.json({ status: "PENDING_APPROVAL", approvalId: approval.id, intent: allowedIntent });
    }

    const result = await executeOnAgent({ requestId: req.requestId, intent: allowedIntent, actor: req.auth });
    audit("intent.executed", { requestId: req.requestId, result });
    return res.json({ status: "EXECUTED", result });
  } catch (error) {
    audit("intent.error", { requestId: req.requestId, error: error.message });
    return res.status(400).json({ error: error.message });
  }
});

commandRouter.get("/approval", async (req, res) => {
  const limit = Number(req.query.limit || 20);
  const status = req.query.status || "PENDING";
  const approvals = await listApprovals(req.auth.projectId, status, limit);
  res.json({ approvals });
});

commandRouter.get("/approval/:id", async (req, res) => {
  const item = await getApproval(req.params.id, req.auth.projectId);
  if (!item) return res.status(404).json({ error: "not found" });
  res.json(item);
});

commandRouter.post("/approval/:id/approve", async (req, res) => {
  if (!["admin", "approver"].includes(req.auth.role)) return res.status(403).json({ error: "forbidden" });
  const item = await setApprovalStatus(req.params.id, req.auth.projectId, "APPROVED", req.auth.userId);
  if (!item) return res.status(404).json({ error: "not found" });

  try {
    const payload = item.intent;
    const result = await executeOnAgent({
      requestId: payload.requestId,
      intent: payload.intent,
      actor: payload.user
    });
    await setApprovalStatus(req.params.id, req.auth.projectId, "EXECUTED", req.auth.userId, result);
    return res.json({ status: "EXECUTED", result });
  } catch (error) {
    await setApprovalStatus(req.params.id, req.auth.projectId, "FAILED", req.auth.userId, { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

commandRouter.post("/approval/:id/reject", async (req, res) => {
  if (!["admin", "approver"].includes(req.auth.role)) return res.status(403).json({ error: "forbidden" });
  const item = await setApprovalStatus(req.params.id, req.auth.projectId, "REJECTED", req.auth.userId);
  if (!item) return res.status(404).json({ error: "not found" });
  return res.json({ status: "REJECTED" });
});
