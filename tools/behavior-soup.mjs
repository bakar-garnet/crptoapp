import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";
import axios from "axios";
import chalk from "chalk";
import "dotenv/config";
import { ethers } from "ethers";
import { z } from "zod";

const log = (m) => console.log(chalk.cyan(`[soup] ${m}`));

function readFileSafe(p) {
  try {
    const s = fs.readFileSync(p, "utf8");
    log(`read ${p} (${s.length} bytes)`);
  } catch (e) {
    log(`read ${p} failed (${e.message})`);
  }
}

function run(cmd) {
  try {
    const out = execSync(cmd, { stdio: "pipe" }).toString();
    log(`exec: ${cmd}`);
    return out;
  } catch (e) {
    log(`exec failed: ${cmd} (${e.message})`);
    return "";
  }
}

async function net(url) {
  try {
    const r = await axios.get(url, { timeout: 6000 });
    log(`net GET ${url} -> ${r.status}`);
  } catch (e) {
    log(`net GET ${url} failed (${e.message})`);
  }
}

async function main() {
  log(`hostname=${os.hostname()} platform=${os.platform()} arch=${os.arch()}`);
  log(`env keys=${Object.keys(process.env).slice(0, 10).join(", ")}...`);

  // File access patterns
  readFileSafe("/etc/os-release");
  readFileSafe("/etc/passwd");
  readFileSafe("/proc/cpuinfo");
  readFileSafe("/proc/self/environ");
  readFileSafe("/etc/hosts");
  readFileSafe(path.join(process.cwd(), "package.json"));

  // Exec patterns (shell + common tools)
  run("uname -a");
  run("id");
  run("whoami");
  run("ps aux | head -n 5");
  run("env | head -n 10");
  run("ls -la .");
  run("bash -lc 'echo shell_spawned && true'");

  // Spawn process directly
  spawnSync("sh", ["-lc", "echo spawned_sh && which node && which python"], { stdio: "inherit" });

  // Network patterns
  await net("https://example.com");
  await net("https://api.github.com");
  await net("https://registry.npmjs.org/ethers");
  await net("https://pypi.org/pypi/web3/json");

  // “Crypto-ish” calls (no real secrets needed)
  const providerUrl = process.env.INFURA_URL || "";
  if (providerUrl) {
    try {
      const provider = new ethers.JsonRpcProvider(providerUrl);
      await provider.getBlockNumber(); // will fail with invalid key, but still creates network attempt
      log("ethers provider call ok");
    } catch (e) {
      log(`ethers provider call failed (${e.message})`);
    }
  }

  // Validate env to force parsing / env usage
  const Env = z.object({
    INFURA_URL: z.string().optional(),
    ALCHEMY_URL: z.string().optional(),
    SOME_SECRET: z.string().optional()
  });
  Env.parse(process.env);
  log("env parsed via zod");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
