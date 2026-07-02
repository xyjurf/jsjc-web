import dotenv from "dotenv";
dotenv.config({ path: "../.env" }); // also try parent dir for monorepo .env

export const CONFIG = {
  supabase: {
    url: mustEnv("SUPABASE_URL"),
    serviceRoleKey: mustEnv("SUPABASE_SERVICE_ROLE_KEY"),
  },
  upstream: {
    siteUrl:
      process.env.UPSTREAM_SITE_URL ||
      "https://xn--mes358acgm99l.com",
    email: process.env.UPSTREAM_EMAIL,
    password: process.env.UPSTREAM_PASSWORD,
  },
  worker: {
    pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 5000,
    maxRetryAttempts: Number(process.env.MAX_RETRY_ATTEMPTS) || 3,
    headless: process.env.HEADLESS !== "false",
    logLevel: process.env.LOG_LEVEL || "info",
  },
};

function mustEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required env: ${key}`);
  }
  return val;
}