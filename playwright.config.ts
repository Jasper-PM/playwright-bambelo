import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  workers: 3,
  timeout: 60000,
  retries: 1,
  use: {
    headless: true,
    screenshot: "only-on-failure",
    navigationTimeout: 30000,
    actionTimeout: 15000,
    httpCredentials: {
      username: process.env.BASIC_AUTH_USER || "",
      password: process.env.BASIC_AUTH_PASS || "",
    },
    baseURL: "https://bambelo.rejoicesoftware.in",
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
});
