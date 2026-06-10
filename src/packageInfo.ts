import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface PackageInfo {
  name?: string;
  version?: string;
}

export function readPackageInfo(cwd: string): PackageInfo {
  const packageJsonPath = resolve(cwd, "package.json");

  if (!existsSync(packageJsonPath)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      name?: unknown;
      version?: unknown;
    };

    return {
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      version: typeof parsed.version === "string" ? parsed.version : undefined
    };
  } catch {
    return {};
  }
}
