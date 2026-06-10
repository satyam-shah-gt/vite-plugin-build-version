import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertValidFileName,
  createBuildVersionInfo,
  stringifyBuildVersionInfo
} from "../generator";

const tempDirs: string[] = [];
const fixedNow = new Date("2026-06-06T00:00:00.000Z");

function createTempProject(packageJson = { name: "test-app", version: "1.2.3" }) {
  const cwd = mkdtempSync(join(tmpdir(), "vite-plugin-build-version-"));
  tempDirs.push(cwd);

  writeFileSync(join(cwd, "package.json"), JSON.stringify(packageJson), "utf8");

  return cwd;
}

function run(cwd: string, command: string, args: string[]) {
  execFileSync(command, args, {
    cwd,
    stdio: ["ignore", "ignore", "ignore"]
  });
}

describe("createBuildVersionInfo", () => {
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("creates a timestamp build ID by default", () => {
    const cwd = createTempProject();

    const info = createBuildVersionInfo({}, { cwd, env: {}, now: fixedNow });

    expect(info).toEqual(
      expect.objectContaining({
        buildId: "2026-06-06T00:00:00.000Z",
        source: "timestamp",
        builtAt: "2026-06-06T00:00:00.000Z",
        version: "1.2.3",
        name: "test-app"
      })
    );
  });

  it("uses manual buildId first", () => {
    const cwd = createTempProject();

    const info = createBuildVersionInfo(
      {
        strategy: "manual",
        buildId: "release-v1.0.0"
      },
      {
        cwd,
        env: { BUILD_ID: "from-env" },
        now: fixedNow
      }
    );

    expect(info.buildId).toBe("release-v1.0.0");
    expect(info.source).toBe("manual");
  });

  it("throws for manual strategy without buildId", () => {
    const cwd = createTempProject();

    expect(() =>
      createBuildVersionInfo({ strategy: "manual" }, { cwd, env: {}, now: fixedNow })
    ).toThrow("requires a non-empty buildId");
  });

  it("reads the configured environment variable", () => {
    const cwd = createTempProject();

    const info = createBuildVersionInfo(
      {
        strategy: "env",
        envKey: "GITHUB_SHA"
      },
      {
        cwd,
        env: { GITHUB_SHA: "abc123" },
        now: fixedNow
      }
    );

    expect(info.buildId).toBe("abc123");
    expect(info.source).toBe("env");
  });

  it("falls back to timestamp when env is missing", () => {
    const cwd = createTempProject();

    const info = createBuildVersionInfo(
      {
        strategy: "env",
        envKey: "MISSING_BUILD_ID"
      },
      {
        cwd,
        env: {},
        now: fixedNow
      }
    );

    expect(info.buildId).toBe("2026-06-06T00:00:00.000Z");
    expect(info.source).toBe("timestamp");
  });

  it("uses git metadata when available", () => {
    const cwd = createTempProject();
    mkdirSync(join(cwd, "src"));
    writeFileSync(join(cwd, "src", "index.ts"), "export {};\n", "utf8");

    run(cwd, "git", ["init"]);
    run(cwd, "git", ["config", "user.email", "test@example.com"]);
    run(cwd, "git", ["config", "user.name", "Test User"]);
    run(cwd, "git", ["add", "."]);
    run(cwd, "git", ["commit", "-m", "initial"]);

    const info = createBuildVersionInfo(
      {
        strategy: "git",
        includeGitInfo: true
      },
      {
        cwd,
        env: {},
        now: fixedNow
      }
    );

    expect(info.source).toBe("git");
    expect(info.buildId).toBe(info.shortCommit);
    expect(info.commit).toEqual(expect.any(String));
    expect(info.branch).toEqual(expect.any(String));
  });

  it("merges extra metadata without allowing buildId override", () => {
    const cwd = createTempProject();

    const info = createBuildVersionInfo(
      {
        buildId: "real-build",
        extra: {
          buildId: "wrong-build",
          environment: "staging",
          appName: "admin"
        }
      },
      {
        cwd,
        env: { NODE_ENV: "production" },
        now: fixedNow
      }
    );

    expect(info.buildId).toBe("real-build");
    expect(info.environment).toBe("staging");
    expect(info.appName).toBe("admin");
  });

  it("validates output file names", () => {
    expect(() => assertValidFileName("")).toThrow("non-empty");
    expect(() => assertValidFileName("/build-version.json")).toThrow("relative");
    expect(() => assertValidFileName("../build-version.json")).toThrow("relative");
    expect(() => assertValidFileName("build-version.txt")).toThrow(".json");
    expect(() => assertValidFileName("metadata/build-version.json")).not.toThrow();
  });

  it("stringifies JSON with a trailing newline", () => {
    expect(
      stringifyBuildVersionInfo({
        buildId: "abc",
        source: "manual",
        builtAt: "2026-06-06T00:00:00.000Z"
      })
    ).toBe(
      '{\n  "buildId": "abc",\n  "source": "manual",\n  "builtAt": "2026-06-06T00:00:00.000Z"\n}\n'
    );
  });
});
