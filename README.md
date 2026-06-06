# vite-plugin-build-version

Vite plugin that generates a build version JSON file during frontend builds.

The generated file is compatible with [`react-build-reload`](https://github.com/satyam-shah-gt/react-build-reload), which reads `/build-version.json` at runtime to detect new frontend deployments.

## Install

```bash
npm install -D vite-plugin-build-version
```

## Quick Start

Add the plugin to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { buildVersionPlugin } from "vite-plugin-build-version";

export default defineConfig({
  plugins: [
    react(),
    buildVersionPlugin()
  ]
});
```

Run the build:

```bash
npm run build
```

The plugin emits:

```txt
dist/build-version.json
```

Example output:

```json
{
  "buildId": "2026-06-06T00:00:00.000Z",
  "source": "timestamp",
  "builtAt": "2026-06-06T00:00:00.000Z",
  "version": "1.0.0"
}
```

## With React Build Reload

Use this plugin at build time:

```ts
buildVersionPlugin()
```

Use `react-build-reload` at runtime:

```tsx
import { BuildReloadWatcher } from "react-build-reload";

export function App() {
  return <BuildReloadWatcher versionUrl="/build-version.json" />;
}
```

The plugin creates the file. The runtime watcher reads it.

## Documentation

- [Getting started](docs/getting-started.md)
- [API reference](docs/api-reference.md)
- [Strategies](docs/strategies.md)
- [React Build Reload integration](docs/reload-app-integration.md)
- [Usage examples](docs/usage-examples.md)
- [Roadmap](docs/roadmap.md)

## Scope

This package only generates build metadata during Vite builds. It does not reload browsers, show UI, handle chunk errors, manage service workers, or track deployment history.
