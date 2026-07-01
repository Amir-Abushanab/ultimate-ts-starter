const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const uniwindConfig = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
});

// Shared workspace packages author relative imports with explicit ".js" ESM
// extensions (e.g. `from "./use-event-stream.js"` for a `.ts` source), which
// tsc and Vite map to the ".ts"/".tsx" file. Metro (SDK 57) does not, so those
// imports fail to resolve. Chain the resolver: for a relative "*.js" specifier,
// first try it extensionless (Metro resolves that to the ".ts" source); if that
// fails, fall back to the original specifier so real ".js" assets still work.
const upstreamResolveRequest = uniwindConfig.resolver.resolveRequest;
uniwindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstreamResolveRequest ?? context.resolveRequest;
  if (
    typeof moduleName === "string" &&
    /^\.\.?\//.test(moduleName) &&
    moduleName.endsWith(".js")
  ) {
    try {
      return resolve(context, moduleName.replace(/\.js$/, ""), platform);
    } catch {
      return resolve(context, moduleName, platform);
    }
  }
  return resolve(context, moduleName, platform);
};

module.exports = uniwindConfig;
