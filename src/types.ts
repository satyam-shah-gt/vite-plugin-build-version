export type BuildVersionStrategy = "timestamp" | "git" | "env" | "manual";

export type BuildVersionSource = BuildVersionStrategy;

export interface BuildVersionPluginOptions {
  strategy?: BuildVersionStrategy;
  buildId?: string;
  envKey?: string;
  fileName?: string;
  includeGitInfo?: boolean;
  includePackageVersion?: boolean;
  extra?: Record<string, unknown>;
  fallback?: "timestamp";
}

export interface NormalizedBuildVersionOptions {
  strategy: BuildVersionStrategy;
  buildId?: string;
  envKey: string;
  fileName: string;
  includeGitInfo: boolean;
  includePackageVersion: boolean;
  extra: Record<string, unknown>;
  fallback: "timestamp";
}

export interface GitInfo {
  commit?: string;
  shortCommit?: string;
  branch?: string;
  dirty?: boolean;
}

export interface BuildVersionInfo {
  buildId: string;
  source: BuildVersionSource;
  builtAt: string;
  version?: string;
  commit?: string;
  shortCommit?: string;
  branch?: string;
  dirty?: boolean;
  environment?: string;
  [key: string]: unknown;
}

export interface CreateBuildVersionContext {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}
