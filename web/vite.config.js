import { defineConfig, loadEnv, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from "vite-plugin-commonjs";

const getProxyConfig = (targetURL) => {
  if (targetURL != null) {
    return {
      target: targetURL,
      changeOrigin: true,
      configure: (proxy, options) => {
      }
    }
  } else {
    return {
      target: 'http://localhost:5000',
      changeOrigin: false,
      configure: (proxy, options) => {
      }
    }
  }
}

const getReplJSONProxyConfig = (targetURL) => {
  if (targetURL != null) {
    const targetParsed = new URL(targetURL);
    return {
      // subsitute proxied server URL in websocket endpoints for REPLs
      target: targetURL,
      changeOrigin: true,
      selfHandleResponse: true,
      configure: (proxy, options) => {
        proxy.on("proxyRes", (proxyRes, req, res) => {
          var body = [];
          proxyRes.on("data", (chunk) => {
            body.push(chunk);
          });
          proxyRes.on("end", () => {
            const newBody = Buffer.concat(body).toString()
              .replaceAll("maiden_app_location", targetParsed.hostname);
            res.end(newBody);
          });
        });
      }
    }
  } else {
    return {
      target: 'http://localhost:5000',
      changeOrigin: false,
      configure: (proxy, options) => {
      }
    }
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
  const baseProxyConfig = getProxyConfig(maiden_env.MAIDEN_PROXY);

  return {
    plugins: [
      transformJsxInJs(),
      react(),
      commonjs(),
    ],
    base: "/maiden/",
    build: {
      outDir: 'build',
    },
    server: {
      port: 5001,
      proxy: {
        '/api': baseProxyConfig,
        '/doc':  baseProxyConfig,
        '/maiden/repl-endpoints.json': getReplJSONProxyConfig(maiden_env.MAIDEN_PROXY)
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