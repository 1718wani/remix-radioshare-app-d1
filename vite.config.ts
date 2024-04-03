/// <reference types="vitest" />

import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [remixCloudflareDevProxy(), remix(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
