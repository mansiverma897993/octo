import { commandCatalog } from "./catalog.js";

export function enforcePolicy(intent, auth) {
  const meta = commandCatalog[intent.action];
  if (!meta) throw new Error("Action is not allowed");
  if (!meta.rolesAllowed.includes(auth.role)) {
    throw new Error(`Role ${auth.role} is not permitted for ${intent.action}`);
  }

  return {
    ...intent,
    requiresApproval: intent.requiresApproval || meta.risky
  };
}
