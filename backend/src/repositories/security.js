import crypto from "crypto";

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
