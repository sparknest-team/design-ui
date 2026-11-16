import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(
  new URL(
    "../../../cedar-design-web/packages/ui/package.json",
    import.meta.url,
  ),
);
const vue = require("@vitejs/plugin-vue");
export default {
  server: { host: "127.0.0.1" },
  plugins: [
    vue.default({
      compiler: require("@vue/compiler-sfc"),
      script: {
        fs: {
          fileExists: existsSync,
          readFile: (file) => readFileSync(file, "utf8"),
        },
      },
    }),
    require("@vitejs/plugin-vue-jsx").default(),
  ],
  css: { preprocessorOptions: { less: { javascriptEnabled: true } } },
  resolve: {
    alias: {
      "@sparknest/ui-doc-preview-vue": new URL(
        "./src/index.ts",
        import.meta.url,
      ).pathname,
      vitest: require
        .resolve("vitest/package.json")
        .replace("package.json", "dist/index.js"),
      "@vue/test-utils": require.resolve("@vue/test-utils"),
      vue: require.resolve("vue"),
    },
  },
  test: {
    include: ["test/review-panel.test.ts"],
    environment: "jsdom",
  },
};
