export { buildVersionPlugin } from "./plugin";
export {
  assertValidFileName,
  createBuildVersionInfo,
  normalizeOptions,
  stringifyBuildVersionInfo
} from "./generator";
export { readGitInfo } from "./git";
export type {
  BuildVersionInfo,
  BuildVersionPluginOptions,
  BuildVersionSource,
  BuildVersionStrategy,
  CreateBuildVersionContext,
  GitInfo,
  NormalizedBuildVersionOptions
} from "./types";
