# API Reference

## `buildVersionPlugin`

```ts
import { buildVersionPlugin } from "vite-plugin-build-version";
```

```ts
buildVersionPlugin(options?: BuildVersionPluginOptions)
```

Returns a Vite build-only plugin that emits a JSON asset.

## Options

```ts
type BuildVersionStrategy = "timestamp" | "git" | "env" | "manual";

interface BuildVersionPluginOptions {
  strategy?: BuildVersionStrategy;
  buildId?: string;
  envKey?: string;
  fileName?: string;
  includeGitInfo?: boolean;
  includePackageVersion?: boolean;
  extra?: Record<string, unknown>;
  fallback?: "timestamp";
}
```

| Option | Default | Description |
| --- | --- | --- |
| `strategy` | `"timestamp"` | Preferred build ID source. |
| `buildId` | `undefined` | Manual build ID for `manual` strategy or priority resolution. |
| `envKey` | `"BUILD_ID"` | Environment variable name for `env` strategy. |
| `fileName` | `"build-version.json"` | Output file name inside the Vite build output. |
| `includeGitInfo` | `false` | Adds commit and branch metadata when available. |
| `includePackageVersion` | `true` | Adds the app version from `package.json`. |
| `extra` | `{}` | Extra JSON fields to merge into the output. |
| `fallback` | `"timestamp"` | Safe fallback when env or git data is unavailable. |

## Output Shape

The generated JSON always includes:

```json
{
  "buildId": "..."
}
```

Recommended output:

```json
{
  "buildId": "abc123",
  "version": "1.0.0",
  "source": "git",
  "builtAt": "2026-06-06T00:00:00.000Z",
  "commit": "abc123def456",
  "branch": "main",
  "environment": "production"
}
```

`buildId` is protected. Values in `extra` cannot override it.
