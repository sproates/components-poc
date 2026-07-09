import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: "src",
      exclude: ["src/**/*.stories.tsx", "src/performance/**"],
      tsconfigPath: "./tsconfig.build.json"
    })
  ],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        atoms: resolve(__dirname, "src/atoms/index.ts"),
        Button: resolve(__dirname, "src/atoms/Button/index.ts"),
        Checkbox: resolve(__dirname, "src/atoms/Checkbox/index.ts"),
        TextInput: resolve(__dirname, "src/atoms/TextInput/index.ts"),
        molecules: resolve(__dirname, "src/molecules/index.ts"),
        FormField: resolve(__dirname, "src/molecules/FormField/index.ts"),
        LoginForm: resolve(__dirname, "src/molecules/LoginForm/index.ts")
      },
      formats: ["es"]
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        assetFileNames: (assetInfo) => {
          const names = [assetInfo.name, ...(assetInfo.names ?? [])].filter(Boolean);
          return names.some((name) => name?.endsWith(".css"))
            ? "styles.css"
            : "assets/[name][extname]";
        },
        entryFileNames: "[name].js"
      }
    }
  }
});
