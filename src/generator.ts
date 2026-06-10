import { readGitInfo } from "./git";
import { readPackageInfo } from "./packageInfo";
import type {
  BuildVersionInfo,
  BuildVersionPluginOptions,
  BuildVersionSource,
  CreateBuildVersionContext,
  GitInfo,
  NormalizedBuildVersionOptions
} from "./types";

const DEFAULT_ENV_KEY = "BUILD_ID";
const DEFAULT_FILE_NAME = "build-version.json";

export function normalizeOptions(
  options: BuildVersionPluginOptions = {}
): NormalizedBuildVersionOptions {
  return {
    strategy: options.strategy ?? "timestamp",
    buildId: options.buildId,
    envKey: options.envKey ?? DEFAULT_ENV_KEY,
    fileName: options.fileName ?? DEFAULT_FILE_NAME,
    includeGitInfo: options.includeGitInfo ?? false,
    includePackageVersion: options.includePackageVersion ?? true,
    extra: options.extra ?? {},
    fallback: options.fallback ?? "timestamp"
  };
}

export function assertValidFileName(fileName: string): void {
  if (!fileName.trim()) {
    throw new Error("build-version fileName must be a non-empty string.");
  }

  if (fileName.startsWith("/") || fileName.includes("..")) {
    throw new Error("build-version fileName must be a relative output path.");
  }

  if (!fileName.endsWith(".json")) {
    throw new Error("build-version fileName must end with .json.");
  }
}

function timestampBuildId(now: Date): string {
  return now.toISOString();
}

function resolveBuildId(params: {
  options: NormalizedBuildVersionOptions;
  env: NodeJS.ProcessEnv;
  gitInfo?: GitInfo;
  now: Date;
}): { buildId: string; source: BuildVersionSource } {
  const { options, env, gitInfo, now } = params;
  const manualBuildId = options.buildId?.trim();

  if (manualBuildId) {
    return { buildId: manualBuildId, source: "manual" };
  }

  if (options.strategy === "manual") {
    throw new Error("manual build version strategy requires a non-empty buildId.");
  }

  const envBuildId = env[options.envKey]?.trim();

  if (envBuildId) {
    return { buildId: envBuildId, source: "env" };
  }

  const gitBuildId = gitInfo?.shortCommit || gitInfo?.commit;

  if (gitBuildId) {
    return { buildId: gitBuildId, source: "git" };
  }

  return {
    buildId: timestampBuildId(now),
    source: "timestamp"
  };
}

export function createBuildVersionInfo(
  optionsInput: BuildVersionPluginOptions = {},
  context: CreateBuildVersionContext = {}
): BuildVersionInfo {
  const options = normalizeOptions(optionsInput);
  assertValidFileName(options.fileName);

  const cwd = context.cwd ?? process.cwd();
  const env = context.env ?? process.env;
  const now = context.now ?? new Date();
  const packageInfo = options.includePackageVersion ? readPackageInfo(cwd) : {};
  const gitInfo = readGitInfo(cwd);
  const resolved = resolveBuildId({ options, env, gitInfo, now });

  const extra = { ...options.extra };
  delete extra.buildId;

  const buildInfo: BuildVersionInfo = {
    ...extra,
    buildId: resolved.buildId,
    source: resolved.source,
    builtAt: now.toISOString()
  };

  if (packageInfo.version) {
    buildInfo.version = packageInfo.version;
  }

  if (packageInfo.name && buildInfo.name === undefined) {
    buildInfo.name = packageInfo.name;
  }

  if (env.NODE_ENV && buildInfo.environment === undefined) {
    buildInfo.environment = env.NODE_ENV;
  }

  if (options.includeGitInfo && gitInfo) {
    buildInfo.commit = gitInfo.commit;
    buildInfo.shortCommit = gitInfo.shortCommit;
    buildInfo.branch = gitInfo.branch;
    buildInfo.dirty = gitInfo.dirty;
  }

  return buildInfo;
}

export function stringifyBuildVersionInfo(buildInfo: BuildVersionInfo): string {
  return `${JSON.stringify(buildInfo, null, 2)}\n`;
}
