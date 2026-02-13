import { z } from "zod";

export const IntentSchema = z.object({
  action: z.enum([
    "CREATE_NEXTJS_APP",
    "INSTALL_DEPENDENCIES",
    "RUN_DEV_SERVER",
    "OPEN_CURSOR"
  ]),
  parameters: z.object({
    projectName: z.string().min(1).max(50).optional(),
    packageManager: z.enum(["npm", "pnpm", "yarn"]).optional(),
    path: z.string().max(200).optional()
  }).default({}),
  requiresApproval: z.boolean().default(false),
  reason: z.string().min(1).max(300)
});
