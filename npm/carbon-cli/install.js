#!/usr/bin/env node

const { existsSync, mkdirSync, chmodSync, createWriteStream, unlinkSync } = require("fs");
const { join } = require("path");
const https = require("https");
const { execSync } = require("child_process");

const PACKAGE_VERSION = require("./package.json").version;
const REPO = "Omnipair/carbon";

// Map Node.js platform/arch to GitHub Release asset names
const PLATFORM_MAP = {
  "linux-x64": "carbon-cli-linux-amd64",
  "darwin-x64": "carbon-cli-macos-amd64",
  "darwin-arm64": "carbon-cli-macos-amd64", // Rosetta2 fallback; update when arm64 builds exist
  "win32-x64": "carbon-cli-windows-amd64.exe",
};

function getPlatformKey() {
  return `${process.platform}-${process.arch}`;
}

function getAssetName() {
  const key = getPlatformKey();
  const asset = PLATFORM_MAP[key];
  if (!asset) {
    console.error(
      `Unsupported platform: ${key}\n` +
        `Supported: ${Object.keys(PLATFORM_MAP).join(", ")}`
    );
    process.exit(1);
  }
  return asset;
}

function getBinaryPath() {
  const ext = process.platform === "win32" ? ".exe" : "";
  return join(__dirname, "bin", `carbon-cli${ext}`);
}

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        // Follow redirects (GitHub releases redirect to S3)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: HTTP ${res.statusCode} from ${url}`));
          return;
        }

        const binaryPath = getBinaryPath();
        const dir = join(__dirname, "bin");
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        const file = createWriteStream(binaryPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            if (process.platform !== "win32") {
              chmodSync(binaryPath, 0o755);
            }
            resolve(binaryPath);
          });
        });
        file.on("error", (err) => {
          unlinkSync(binaryPath);
          reject(err);
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const binaryPath = getBinaryPath();

  // Skip download if binary already exists (e.g. CI caching)
  if (existsSync(binaryPath)) {
    console.log(`carbon-cli binary already exists at ${binaryPath}`);
    return;
  }

  const asset = getAssetName();
  const tag = `v${PACKAGE_VERSION}`;
  const url = `https://github.com/${REPO}/releases/download/${tag}/${asset}`;

  console.log(`Downloading carbon-cli ${tag} for ${getPlatformKey()}...`);
  console.log(`  ${url}`);

  try {
    const path = await download(url);
    console.log(`Installed carbon-cli to ${path}`);
  } catch (err) {
    console.error(`Failed to download carbon-cli: ${err.message}`);
    console.error(
      `\nYou can build from source instead:\n` +
        `  cargo install --git https://github.com/${REPO}.git carbon-cli`
    );
    process.exit(1);
  }
}

main();
