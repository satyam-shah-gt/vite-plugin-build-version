# Getting Started

`vite-plugin-build-version` creates `build-version.json` during Vite builds.

## 1. Install

```bash
npm install -D vite-plugin-build-version
```

## 2. Add the Plugin

```ts
import { defineConfig } from "vite";
import { buildVersionPlugin } from "vite-plugin-build-version";

export default defineConfig({
  plugins: [
    buildVersionPlugin()
  ]
});
```

## 3. Build the App

```bash
npm run build
```

The output folder will contain:

```txt
dist/build-version.json
```

## 4. Serve the File

After deployment, the file should be available at:

```txt
/build-version.json
```

That path matches the default `versionUrl` used by `react-build-reload`.

## 5. Use a CI Build ID

```ts
buildVersionPlugin({
  strategy: "env",
  envKey: "BUILD_ID"
})
```

In CI:

```bash
BUILD_ID="$GITHUB_SHA" npm run build
```
