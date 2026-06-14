# React Build Reload Integration

`vite-plugin-build-version` and `react-build-reload` work together.

## Build Time

`vite-plugin-build-version` runs during `vite build` and emits:

```txt
dist/build-version.json
```

## Runtime

`react-build-reload` runs in the browser and checks:

```txt
/build-version.json
```

## Setup

```ts
// vite.config.ts
import { buildVersionPlugin } from "vite-plugin-build-version";

export default defineConfig({
  plugins: [
    buildVersionPlugin()
  ]
});
```

```tsx
// App.tsx
import { BuildReloadWatcher } from "react-build-reload";

export function App() {
  return <BuildReloadWatcher versionUrl="/build-version.json" />;
}
```

## Compatibility Rule

The generated file must include:

```json
{
  "buildId": "..."
}
```

All other fields are optional. `react-build-reload` preserves optional metadata and passes it to callbacks.
