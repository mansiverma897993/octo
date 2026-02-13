import { buildApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { runMigrations } from "./db/migrate.js";
import { bootstrapDefaults } from "./repositories/bootstrapRepo.js";

const app = buildApp();

async function start() {
  await runMigrations();
  await bootstrapDefaults(config);
  app.listen(config.port, () => {
    logger.info({ port: config.port }, "mdc-backend started");
    console.log(`mdc-backend running on :${config.port}`);
  });
}

start().catch((error) => {
  logger.error({ error: error.message }, "failed to start backend");
  process.exit(1);
});
