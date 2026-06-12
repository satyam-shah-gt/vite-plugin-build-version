# Usage Examples

## Basic Vite

```ts
import { defineConfig } from "vite";
import { buildVersionPlugin } from "vite-plugin-build-version";

export default defineConfig({
  plugins: [
    buildVersionPlugin()
  ]
});
```

## GitHub Actions

```ts
buildVersionPlugin({
  strategy: "env",
  envKey: "GITHUB_SHA",
  extra: {
    environment: "production"
  }
})
```

```yaml
- run: npm run build
  env:
    GITHUB_SHA: ${{ github.sha }}
```

## Custom File Name

```ts
buildVersionPlugin({
  fileName: "version.json"
})
```

The output will be:

```txt
dist/version.json
```

Configure `react-build-reload` to match:

```tsx
<BuildReloadWatcher versionUrl="/version.json" />
```

## Manual Release ID

```ts
buildVersionPlugin({
  strategy: "manual",
  buildId: "release-v1.2.0"
})
```

## Extra Metadata

```ts
buildVersionPlugin({
  extra: {
    appName: "admin-dashboard",
    releaseChannel: "stable"
  }
})
```
