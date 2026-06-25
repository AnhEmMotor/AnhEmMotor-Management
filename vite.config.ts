import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import vueDevTools from "vite-plugin-vue-devtools";
import viteCompression from "vite-plugin-compression";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import tailwindcss from "@tailwindcss/vite";

export default ({ mode }: { mode: string }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL } = env;

  const optimizeElementPlus = [];
  const epPath = path.resolve(root, "node_modules/element-plus/es/components");
  if (fs.existsSync(epPath)) {
    const dirs = fs.readdirSync(epPath);
    for (const dir of dirs) {
      if (fs.existsSync(path.join(epPath, dir, "style/css.mjs"))) {
        optimizeElementPlus.push(`element-plus/es/components/${dir}/style/css`);
      }
      if (fs.existsSync(path.join(epPath, dir, "style/index.mjs"))) {
        optimizeElementPlus.push(
          `element-plus/es/components/${dir}/style/index`,
        );
      }
    }
  }

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION),
    },
    base: VITE_BASE_URL,
    server: {
      port: Number(VITE_PORT),
      strictPort: true,
      host: false,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"), // Đảm bảo giữ nguyên /api cho Backend
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@view": resolvePath("src/view"),
        "@views": resolvePath("src/modules"),
        "@imgs": resolvePath("src/assets/images"),
        "@icons": resolvePath("src/assets/icons"),
        "@utils": resolvePath("src/utils"),
        "@stores": resolvePath("src/store"),
        "@styles": resolvePath("src/assets/styles"),
      },
    },
    build: {
      target: "es2015",
      outDir: "dist",
      chunkSizeWarningLimit: 1500,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [],
        include: ["src/modules/**/*.vue"],
      },
      rollupOptions: {
        onwarn(warning, defaultWarn) {
          if (warning.code === "INVALID_ANNOTATION") {
            return;
          }
          defaultWarn(warning);
        },
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("echarts")) {
                return "echarts";
              }
              if (id.includes("@wangeditor")) {
                return "wangeditor";
              }
              if (id.includes("element-plus")) {
                return "element-plus";
              }
              if (id.includes("xlsx")) {
                return "xlsx";
              }
              if (id.includes("xgplayer")) {
                return "xgplayer";
              }
              if (id.match(/node_modules\/(vue|vue-router|pinia)\//)) {
                return "vue-core";
              }
              if (id.includes("@vueuse")) {
                return "vueuse";
              }
              const parts = id.split("node_modules/");
              const packagePath = parts[parts.length - 1];
              if (packagePath) {
                const pathParts = packagePath.split("/");
                let packageName = pathParts[0];
                if (packageName.startsWith("@")) {
                  packageName = packageName + "-" + pathParts[1];
                }
                // Loại bỏ ký tự đặc biệt có thể gây lỗi file hệ thống
                return packageName.replace(/[^a-zA-Z0-9-]/g, "");
              }
              return "vendors";
            }
          },
        },
      },
    },
    plugins: [
      vue(),
      tailwindcss(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia", "@vueuse/core"],
        dts: "src/types/import/auto-imports.d.ts",
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: true,
          filepath: "./.auto-import.json",
          globalsPropValue: true,
        },
      }),
      Components({
        dts: "src/types/import/components.d.ts",
        resolvers: [ElementPlusResolver()],
      }),
      ElementPlus({
        useSource: true,
      }),
      viteCompression({
        verbose: false,
        disable: false,
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240,
        deleteOriginFile: false,
      }),
      vueDevTools(),
    ],
    optimizeDeps: {
      exclude: ["mammoth"],
      include: [
        "echarts",
        "echarts/core",
        "echarts/charts",
        "echarts/components",
        "echarts/renderers",
        "xlsx",
        "xgplayer",
        "crypto-js",
        "file-saver",
        "vue-img-cutter",
        "element-plus/es",
        ...optimizeElementPlus,
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@styles/core/el-light.scss" as *; 
            @use "@styles/core/mixin.scss" as *;
          `,
        },
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
  });
};

function resolvePath(paths: string) {
  return path.resolve(__dirname, paths);
}
