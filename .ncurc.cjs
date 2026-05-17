// npm-check-updates config — controls `pnpm ncu`.
//
// Packages listed in `reject` are skipped by automatic bumps. Edit by hand
// when you genuinely want to upgrade one (Expo SDK bumps, RN majors, etc.).
module.exports = {
  // Skip versions younger than 7 days. Buys time for the ecosystem to
  // catch regressions / supply-chain compromises before we pull them in.
  // Defense-in-depth alongside pnpm's `minimumReleaseAge` in pnpm-workspace.yaml.
  cooldown: "7d",

  // Reject specific *proposed* upgrade versions — typically accidental
  // releases that were published, deprecated by the maintainer, and
  // can't be fully unpublished. Runs against the version ncu wants to
  // upgrade TO (filterResults), not the version we currently have.
  filterResults: (name, { upgradedVersion }) => {
    // @orpc/client@2.0.0 was an accidental publish (deprecation message:
    // "accidential"). The maintainer rolled `latest` back to 1.14.2.
    if (name === "@orpc/client" && upgradedVersion === "2.0.0") {
      return false;
    }
    return true;
  },

  reject: [
    // react-native must move in lockstep with the installed Expo SDK.
    // Expo's peerDependencies declare `react-native: "*"`, but its native
    // code references symbols that exist only in specific RN versions.
    // Upgrade RN by hand whenever Expo SDK is upgraded.
    "react-native",
    // @react-native/* packages (e.g. @react-native/metro-config) ship
    // matched releases per RN version — pinning RN without pinning these
    // re-creates the same drift in a different place.
    "@react-native/*",
    // expo itself: each SDK is tested against a specific RN version. The
    // peerDependency is a misleading wildcard. Bumping expo without
    // re-pinning RN to the SDK's tested version (or upgrading SDK
    // entirely) will break the iOS build at Xcode compile time.
    "expo",
  ],

  // Respect each package's `latest` dist-tag instead of just picking the
  // numerically-highest published version. ('latest' is ncu's default but
  // worth being explicit about the rationale.)
  target: "latest",
};
