import type { Plugin } from "vite";
import {
  createBuildVersionInfo,
  normalizeOptions,
  stringifyBuildVersionInfo
} from "./generator";
import type { BuildVersionPluginOptions } from "./types";

export function buildVersionPlugin(options: BuildVersionPluginOptions = {}): Plugin {
  const normalizedOptions = normalizeOptions(options);
  let root = process.cwd();

  return {
    name: "vite-plugin-build-version",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    generateBundle() {
      const buildInfo = createBuildVersionInfo(normalizedOptions, {
        cwd: root,
        env: process.env
      });

      this.emitFile({
        type: "asset",
        fileName: normalizedOptions.fileName,
        source: stringifyBuildVersionInfo(buildInfo)
      });
    }
  };
}
