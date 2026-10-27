import { defineConfig, loadEnv, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from "vite-plugin-commonjs";

// options for where the backend is running
// specify with MAIDEN_PROXY env var
const proxies = {
  norns: {
    target: 'http://norns.local',
    changeOrigin: true,
    configure: (proxy, options) => {
    },
  },
  local: {
    target: 'http://localhost:5000',
    changeOrigin: false,
    configure: (proxy, options) => {
    },
  }
}

// enable using JSX transformations in files with .js extension
const transformJsxInJs = () => ({
  name: "transform-jsx-in-js",
  enforce: "pre",
  async transform(code, id) {
    if (!id.match(/.*\.js$/)) {
      return null;
    }

    return await transformWithOxc(code, id, {
      lang: "jsx",
    });
  },
});

export default defineConfig(({ mode }) => {

  const maiden_env = loadEnv(mode, process.cwd(), "MAIDEN_");

  return {
    plugins: [
      react(),
      commonjs(),
      transformJsxInJs(),
    ],
    base: "/maiden/",
    build: {
      outDir: 'build',
    },
    server: {
      port: 5001,
      proxy: {
        '/api': proxies[maiden_env.MAIDEN_PROXY || "local"],
        '/doc': proxies[maiden_env.MAIDEN_PROXY || "local"]
      }
    },
    test: {
      globals: true,
      environment: 'jsdom'
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});