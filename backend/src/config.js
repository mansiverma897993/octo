import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8080),
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || "",
    allowedUserIds: new Set((process.env.TELEGRAM_ALLOWED_USER_IDS || "").split(",").filter(Boolean).map(Number))
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
  },
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/mdc",
  defaultProjectSlug: process.env.DEFAULT_PROJECT_SLUG || "default-project",
  agent: {
    baseUrl: process.env.AGENT_BASE_URL || "http://127.0.0.1:9090",
    sharedSecret: process.env.AGENT_SHARED_SECRET || "",
    jwtSecret: process.env.AGENT_JWT_SECRET || ""
  },
  approvalMode: String(process.env.APPROVAL_MODE || "true") === "true",
  logDir: process.env.LOG_DIR || "./logs",
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 60)
  },
  seed: {
    orgName: process.env.SEED_ORG_NAME || "Default Org",
    projectName: process.env.SEED_PROJECT_NAME || "Default Project",
    projectSlug: process.env.SEED_PROJECT_SLUG || "default-project",
    adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
    adminName: process.env.SEED_ADMIN_NAME || "Admin",
    adminApiToken: process.env.SEED_ADMIN_API_TOKEN || "dev-admin-token",
    telegramAdminId: process.env.SEED_TELEGRAM_ADMIN_ID ? Number(process.env.SEED_TELEGRAM_ADMIN_ID) : null
  }
};