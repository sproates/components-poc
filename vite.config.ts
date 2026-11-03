import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

const entries = Object.fromEntries(
  Object.entries(pkg.exports).flatMap(([subpath, target]) => {
    if (typeof target === "string") return [];
    const name = target.import.replace("./dist/", "").replace(".js", "");
    const source =
      subpath === "." ? "src/index.ts" : `src/${subpath.slice(2)}/index.ts`;
    return [[name, resolve(import.meta.dirname, source)]];
  }),
);
const externalPackages = [
  ...Object.keys(pkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
];

export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: entries,
      formats: ["es"],
    },
    rollupOptions: {
      external: (id) =>
        externalPackages.some(
          (name) => id === name || id.startsWith(`${name}/`),
        ),
      output: {
        assetFileNames: (assetInfo) => {
          const names = [assetInfo.name, ...(assetInfo.names ?? [])].filter(
            Boolean,
          );
          return names.some((name) => name?.endsWith(".css"))
            ? "styles.css"
            : "assets/[name][extname]";
        },
        entryFileNames: "[name].js",
      },
    },
  },
});
