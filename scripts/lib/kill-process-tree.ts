import { spawnSync } from "node:child_process";

/**
 * Kills a spawned dev-server process and everything under it.
 *
 * Why this exists: scripts/*.ts spawn `npm run dev` with `shell: true` (so
 * `npm` resolves on Windows). On Windows, the PID that `spawn()` returns in
 * that mode is the `cmd.exe` wrapper, not `next dev` itself — plain
 * `child.kill()` only kills the wrapper, leaving `next dev` running and
 * still bound to port 3000. The next script to run then has its own fresh
 * server silently bumped to port 3001 while its readiness check (which
 * hits hard-coded port 3000) happily talks to the orphaned, often
 * already-exhausted old process — producing exactly the "Can't reach
 * database server" / "Transaction not found" errors this project kept
 * hitting. `taskkill /T` kills the whole process tree, not just the PID
 * handed back, so this is the fix on Windows; POSIX `spawn` under
 * `shell: true` doesn't have this problem, so a plain SIGKILL is enough
 * there.
 */
export function killProcessTree(pid: number | undefined): void {
  if (!pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"]);
    return;
  }

  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    // Already gone — nothing to do.
  }
}
