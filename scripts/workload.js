const pino = require("pino");
const { v4: uuidv4 } = require("uuid");
const { z } = require("zod");
const { execSync } = require("child_process");

const { runIOStress } = require("./io_stress");
const { runNetProbe } = require("./net_probe");

const log = pino({ level: "info" });

const Args = z.object({
  loops: z.coerce.number().int().min(1).max(50).default(10)
});

function main() {
  const loops = Args.parse({ loops: process.env.LOOPS || "10" }).loops;

  log.info({ loops }, "starting workload");

  // Some normal process exec noise (benign)
  execSync("ls -la", { stdio: "inherit" });
  execSync("node -v", { stdio: "inherit" });
  execSync("python3 -V || true", { stdio: "inherit", shell: "/bin/bash" });

  // IO churn
  runIOStress({ files: 200, bytesEach: 64 * 1024 });

  // Network calls to common public endpoints + package registries
  // (benign HTTPS)
  runNetProbe();

  for (let i = 0; i < loops; i++) {
    const id = uuidv4();
    log.info({ i, id }, "loop tick");
  }

  log.info("workload complete");
}

main();
