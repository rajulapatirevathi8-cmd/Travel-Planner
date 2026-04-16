import app from "./app";
import { logger } from "./lib/logger";
import { recoverPendingFollowUps } from "./lib/followup-scheduler.js";
import { seedPackagesIfEmpty } from "./routes/holiday-packages.js";
import { startDailyOfferCron } from "./lib/marketing-scheduler.js";

// Use environment variable if available, otherwise default to 3000
const rawPort = process.env["PORT"] || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Re-schedule any follow-ups that were pending before last restart
  recoverPendingFollowUps().catch((e) =>
    logger.error({ err: e }, "Follow-up recovery failed")
  );

  // Seed holiday packages into DB if table is empty
  seedPackagesIfEmpty().catch((e) =>
    logger.error({ err: e }, "Package seed failed")
  );

  // Start daily marketing offer cron (fires at 9 AM IST every day)
  startDailyOfferCron();
});
