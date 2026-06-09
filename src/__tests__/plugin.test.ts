import { build } from "vite";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildVersionPlugin } from "../plugin";

const tempDirs: string[] = [];

function createViteProject() {
  const root = mkdtempSync(join(tmpdir(), "build-version-vite-"));
  tempDirs.push(root);

  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "package.json"), JSON.stringify({
    name: "vite-test-app",
    version: "9.8.7",
    type: "module"
  }), "utf8");
  writeFileSync(
    join(root, "index.html"),
    '<div id="app"></div><script type="module" src="/src/main.ts"></script>',
    "utf8"
  );
  writeFileSync(join(root, "src", "main.ts"), "console.log('test app');\n", "utf8");

  return root;
}

async function runViteBuild(root: string, plugins: NonNullable<Parameters<typeof build>[0]>["plugins"]) {
  await build({
    root,
    logLevel: "silent",
    plugins,
    build: {
      outDir: "dist",
      emptyOutDir: true
    }
  });
}

describe("buildVersionPlugin", () => {
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("emits dist/build-version.json during Vite build", async () => {
    const root = createViteProject();

    await runViteBuild(root, [
      buildVersionPlugin({
        buildId: "integration-build",
        extra: {
          environment: "test"
        }
      })
    ]);

    const data = JSON.parse(readFileSync(join(root, "dist", "build-version.json"), "utf8"));

    expect(data).toEqual(
      expect.objectContaining({
        buildId: "integration-build",
        source: "manual",
        version: "9.8.7",
        name: "vite-test-app",
        environment: "test"
      })
    );
  });

  it("respects custom fileName", async () => {
    const root = createViteProject();

    await runViteBuild(root, [
      buildVersionPlugin({
        buildId: "custom-file",
        fileName: "meta/version.json"
      })
    ]);

    const data = JSON.parse(readFileSync(join(root, "dist", "meta", "version.json"), "utf8"));

    expect(data.buildId).toBe("custom-file");
  });
});
