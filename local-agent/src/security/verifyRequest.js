import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function verifyRequest(req, res, next) {
  const secretHeader = req.headers["x-agent-secret"];
  if (!secretHeader || secretHeader !== config.sharedSecret) {
    return res.status(401).json({ error: "unauthorized (secret)" });
  }

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "unauthorized (token missing)" });

  try {
    req.jwt = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"],
      issuer: "mdc-backend",
      audience: "mdc-local-agent"
    });
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized (token invalid)" });
  }
}
