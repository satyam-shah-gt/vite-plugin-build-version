import { execFileSync } from "node:child_process";
import type { GitInfo } from "./types";

function readGitValue(cwd: string, args: string[]): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return undefined;
  }
}

export function readGitInfo(cwd: string): GitInfo | undefined {
  const commit = readGitValue(cwd, ["rev-parse", "HEAD"]);
  const shortCommit = readGitValue(cwd, ["rev-parse", "--short", "HEAD"]);
  const branch = readGitValue(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const status = readGitValue(cwd, ["status", "--porcelain"]);

  if (!commit && !shortCommit && !branch) {
    return undefined;
  }

  return {
    commit,
    shortCommit,
    branch,
    dirty: Boolean(status)
  };
}
