import fs from "fs";
import path from "path";
import crypto from "crypto";
import { config } from "../config.js";

const file = path.resolve(config.approvalStoreFile);
fs.mkdirSync(path.dirname(file), { recursive: true });

function readDb() {
  if (!fs.existsSync(file)) return { approvals: [] };
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeDb(db) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

export function createApproval(payload) {
  const db = readDb();
  const rec = {
    id: crypto.randomUUID(),
    status: "PENDING",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    payload
  };
  db.approvals.unshift(rec);
  writeDb(db);
  return rec;
}

export function getApproval(id) {
  const db = readDb();
  return db.approvals.find(a => a.id === id) || null;
}

export function listApprovals(limit = 20, status = "PENDING") {
  const db = readDb();
  return db.approvals.filter(a => !status || a.status === status).slice(0, limit);
}

function setStatus(id, status) {
  const db = readDb();
  const idx = db.approvals.findIndex(a => a.id === id);
  if (idx < 0) return null;
  db.approvals[idx].status = status;
  db.approvals[idx].updatedAt = Date.now();
  writeDb(db);
  return db.approvals[idx];
}

export const approve = (id) => setStatus(id, "APPROVED");
export const reject = (id) => setStatus(id, "REJECTED");
