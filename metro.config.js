const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite uses a WebAssembly worker on web.
config.resolver.assetExts.push("wasm");

// SharedArrayBuffer requires cross-origin isolation in the browser.
config.server.enhanceMiddleware = (middleware) => (request, response, next) => {
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  return middleware(request, response, next);
};

module.exports = config;
