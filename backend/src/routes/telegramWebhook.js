import express from "express";
import axios from "axios";
import { config } from "../config.js";
import { telegramUserAuth } from "../middleware/auth.js";
import { parseIntent } from "../ai/intentParser.js";
import { enforcePolicy } from "../commands/policy.js";
import { createApproval, getApproval, listApprovals, setApprovalStatus } from "../repositories/approvalRepo.js";
import { executeOnAgent } from "../services/agentClient.js";

export const telegramRouter = express.Router();

async function tgSend(chatId, text) {
  if (!config.telegram.token) return;
  await axios.post(`https://api.telegram.org/bot${config.telegram.token}/sendMessage`, { chat_id: chatId, text });
}

telegramRouter.post(`/webhook/${config.telegram.webhookSecret}`, async (req, res) => {
  res.sendStatus(200);
  const message = req.body?.message;
  if (!message?.text || !message?.from?.id) return;

  const auth = await telegramUserAuth(message.from.id);
  if (!auth) return tgSend(message.chat.id, "Unauthorized user.");

  const text = message.text.trim();

  try {
    if (text.startsWith("/pending")) {
      const items = await listApprovals(auth.projectId, "PENDING", 10);
      if (!items.length) return tgSend(message.chat.id, "No pending approvals.");
      const out = items.map((a) => `${a.id} :: ${a.intent.intent.action}`).join("\n");
      return tgSend(message.chat.id, `Pending approvals:\n${out}`);
    }

    if (text.startsWith("/approve ")) {
      if (!["admin", "approver"].includes(auth.role)) return tgSend(message.chat.id, "Only approver/admin can approve.");
      const id = text.split(" ")[1]?.trim();
      const rec = await setApprovalStatus(id, auth.projectId, "APPROVED", auth.userId);
      if (!rec) return tgSend(message.chat.id, "Approval ID not found.");

      const payload = rec.intent;
      const result = await executeOnAgent({ requestId: payload.requestId, intent: payload.intent, actor: payload.user });
      await setApprovalStatus(id, auth.projectId, "EXECUTED", auth.userId, result);
      return tgSend(message.chat.id, `✅ Approved & executed ${payload.intent.action}\nExit: ${result.exitCode}`);
    }

    if (text.startsWith("/reject ")) {
      if (!["admin", "approver"].includes(auth.role)) return tgSend(message.chat.id, "Only approver/admin can reject.");
      const id = text.split(" ")[1]?.trim();
      const rec = await setApprovalStatus(id, auth.projectId, "REJECTED", auth.userId);
      if (!rec) return tgSend(message.chat.id, "Approval ID not found.");
      return tgSend(message.chat.id, `❎ Rejected ${id}`);
    }

    if (text.startsWith("/status ")) {
      const id = text.split(" ")[1]?.trim();
      const rec = await getApproval(id, auth.projectId);
      if (!rec) return tgSend(message.chat.id, "Approval ID not found.");
      return tgSend(message.chat.id, `ID: ${id}\nStatus: ${rec.status}\nAction: ${rec.intent.intent.action}`);
    }

    const intent = await parseIntent(text);
    const allowedIntent = enforcePolicy(intent, auth);

    if (config.approvalMode || allowedIntent.requiresApproval) {
      const ap = await createApproval({
        orgId: auth.orgId,
        projectId: auth.projectId,
        userId: auth.userId,
        intent: { requestId: `tg-${message.message_id}`, user: auth, intent: allowedIntent },
        requiresApproval: true
      });
      return tgSend(message.chat.id, `Approval required.\nID: ${ap.id}\nAction: ${allowedIntent.action}\nUse /approve ${ap.id}`);
    }

    const result = await executeOnAgent({ requestId: `tg-${message.message_id}`, actor: auth, intent: allowedIntent });
    return tgSend(message.chat.id, `✅ Executed ${allowedIntent.action}\nExit: ${result.exitCode}`);
  } catch (error) {
    return tgSend(message.chat.id, `❌ ${error.message}`);
  }
});
