import axios from "axios";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export async function executeOnAgent(payload) {
  const token = jwt.sign(
    {
      iss: "mdc-backend",
      aud: "mdc-local-agent",
      sub: String(payload.actor?.userId || "unknown"),
      req: payload.requestId,
      role: payload.actor?.role || "unknown"
    },
    config.agent.jwtSecret,
    { algorithm: "HS256", expiresIn: "60s" }
  );

  const resp = await axios.post(`${config.agent.baseUrl}/execute`, payload, {
    headers: {
      "x-agent-secret": config.agent.sharedSecret,
      authorization: `Bearer ${token}`
    },
    timeout: 120000
  });

  return resp.data;
}
