const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function runIOStress({ files, bytesEach }) {
  const dir = path.join(process.cwd(), "tmp_artifacts");
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < files; i++) {
    const p = path.join(dir, `blob_${i}.bin`);
    const buf = crypto.randomBytes(bytesEach);
    fs.writeFileSync(p, buf);
  }

  // Read some back
  for (let i = 0; i < Math.min(files, 50); i++) {
    const p = path.join(dir, `blob_${i}.bin`);
    fs.readFileSync(p);
  }

  // Clean up
  for (let i = 0; i < files; i++) {
    const p = path.join(dir, `blob_${i}.bin`);
    fs.unlinkSync(p);
  }
}

module.exports = { runIOStress };
