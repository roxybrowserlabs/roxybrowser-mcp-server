import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export default async function buildForTests() {
  const vp = fileURLToPath(new URL("../node_modules/vite-plus/bin/vp", import.meta.url));
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  await execFileAsync(process.execPath, [vp, "pack"], {
    cwd: projectRoot,
  });
}
