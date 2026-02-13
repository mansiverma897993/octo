import { z } from "zod";

export const ExecutePayloadSchema = z.object({
  requestId: z.string().min(1),
  actor: z.object({
    userId: z.union([z.string(), z.number()]),
    role: z.string().min(1)
  }),
  intent: z.object({
    action: z.enum(["CREATE_NEXTJS_APP", "INSTALL_DEPENDENCIES", "RUN_DEV_SERVER", "OPEN_CURSOR"]),
    parameters: z.object({
      projectName: z.string().optional(),
      packageManager: z.enum(["npm", "pnpm", "yarn"]).optional(),
      path: z.string().optional()
    }).default({})
  })
});

function safeProjectName(name = "my-app") {
  const cleaned = name.replace(/[^a-zA-Z0-9-_]/g, "");
  if (!cleaned) return "my-app";
  return cleaned.slice(0, 50);
}

export function buildCommand(intent, platform) {
  const pm = intent.parameters.packageManager || "npm";

  switch (intent.action) {
    case "CREATE_NEXTJS_APP": {
      const projectName = safeProjectName(intent.parameters.projectName);
      return { cmd: "npx", args: ["create-next-app@latest", projectName, "--yes"] };
    }

    case "INSTALL_DEPENDENCIES":
      return { cmd: pm, args: ["install"] };

    case "RUN_DEV_SERVER":
      return { cmd: pm, args: ["run", "dev"] };

    case "OPEN_CURSOR":
      if (platform === "win32") return { cmd: "cmd", args: ["/c", "start", "", "cursor", "."] };
      if (platform === "darwin") return { cmd: "open", args: ["-a", "Cursor", "."] };
      return { cmd: "cursor", args: ["."] };

    default:
      throw new Error("Unsupported action");
  }
}
