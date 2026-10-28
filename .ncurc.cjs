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
  //
  // Except the Polar pair, held together: @polar-sh/better-auth 1.8.4 (the
  // last 1.x) peers on @polar-sh/sdk ^0.47.0, and better-auth 2.x needs sdk
  // ^1.0.2, an API rewrite (createPolarCore from @polar-sh/sdk/2026-10,
  // snake_case models) this repo hasn't migrated to. So sdk stays on 0.47.x
  // ("patch": for a 0.x package "minor" would allow 0.48) and the adapter on
  // 1.x. Lift both together as part of that migration.
  target: (name) => {
    if (name === "@polar-sh/sdk") {
      return "patch";
    }
    if (name === "@polar-sh/better-auth") {
      return "minor";
    }
    return "latest";
  },
};
