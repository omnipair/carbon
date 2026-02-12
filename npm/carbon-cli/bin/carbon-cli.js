#!/usr/bin/env node

const { execFileSync } = require("child_process");
const { join } = require("path");

const ext = process.platform === "win32" ? ".exe" : "";
const binaryPath = join(__dirname, `carbon-cli${ext}`);

try {
  execFileSync(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  if (err.status !== undefined) {
    process.exit(err.status);
  }
  console.error(`Failed to run carbon-cli: ${err.message}`);
  console.error(`Expected binary at: ${binaryPath}`);
  console.error(`Try reinstalling: npm install -g @omnipair/carbon-cli`);
  process.exit(1);
}
