import type {
  AnalyticsClient,
  FlagsSnapshot,
} from "@ultimate-ts-starter/analytics";
import { beforeEach, describe, expect, it } from "vitest";

import {
  connectFlagsToAnalytics,
  getAllFlags,
  getFlag,
  getFlagsSnapshot,
  getFlagSync,
  resetFlags,
  setFlags,
} from "./index";

const makeStubAnalytics = (remote: Partial<Record<string, boolean>>) => {
  let calls = 0;
  const snapshot: FlagsSnapshot = {
    getFlag: (key) => remote[key],
    isEnabled: (key) => remote[key],
  };
  const client: AnalyticsClient = {
    captureException: () => {},
    getFlagsSnapshot: () => {
      calls += 1;
      return Promise.resolve(snapshot);
    },
    group: () => {},
    identify: () => {},
    page: () => {},
    reset: () => {},
    track: () => {},
  };
  return {
    get calls() {
      return calls;
    },
    client,
  };
};

describe("feature flags", () => {
  beforeEach(() => {
    resetFlags();
    connectFlagsToAnalytics(null);
  });

  it("returns default values", async () => {
    expect(await getFlag("twoFactorSetup")).toBe(true);
    expect(await getFlag("newCheckoutFlow")).toBe(false);
  });

  it("getFlagSync returns defaults", () => {
    expect(getFlagSync("twoFactorSetup")).toBe(true);
    expect(getFlagSync("newCheckoutFlow")).toBe(false);
  });

  it("overrides a flag", async () => {
    setFlags({ newCheckoutFlow: true });
    expect(await getFlag("newCheckoutFlow")).toBe(true);
  });

  it("preserves other flags when overriding one", async () => {
    setFlags({ newCheckoutFlow: true });
    expect(await getFlag("twoFactorSetup")).toBe(true);
  });

  it("resets overrides", async () => {
    setFlags({ newCheckoutFlow: true });
    resetFlags();
    expect(await getFlag("newCheckoutFlow")).toBe(false);
  });

  it("getAllFlags returns full snapshot", () => {
    const flags = getAllFlags();
    expect(flags).toEqual({
      newCheckoutFlow: false,
      organizationSwitcher: false,
      twoFactorSetup: true,
    });
  });
});

describe("getFlagsSnapshot", () => {
  beforeEach(() => {
    resetFlags();
    connectFlagsToAnalytics(null);
  });

  it("returns fully-resolved defaults with no analytics", async () => {
    const result = await getFlagsSnapshot();
    expect(result).toMatchObject({
      newCheckoutFlow: false,
      organizationSwitcher: false,
      twoFactorSetup: true,
    });
    expect(result.$snapshot).toBeNull();
  });

  it("merges remote values into defaults", async () => {
    const stub = makeStubAnalytics({ newCheckoutFlow: true });
    connectFlagsToAnalytics(stub.client);
    expect(await getFlagsSnapshot()).toMatchObject({
      newCheckoutFlow: true,
      organizationSwitcher: false,
      twoFactorSetup: true,
    });
  });

  it("exposes the raw analytics snapshot via $snapshot for capture attribution", async () => {
    const stub = makeStubAnalytics({ newCheckoutFlow: true });
    connectFlagsToAnalytics(stub.client);
    const result = await getFlagsSnapshot();
    expect(result.$snapshot).not.toBeNull();
    // Same object the analytics client handed us — can be passed back to track()
    expect(result.$snapshot?.isEnabled("newCheckoutFlow")).toBe(true);
  });

  it("local overrides beat remote values", async () => {
    const stub = makeStubAnalytics({ newCheckoutFlow: true });
    connectFlagsToAnalytics(stub.client);
    setFlags({ newCheckoutFlow: false });
    expect(await getFlagsSnapshot()).toMatchObject({ newCheckoutFlow: false });
  });

  it("issues one /flags call regardless of how many flags get read", async () => {
    const stub = makeStubAnalytics({
      newCheckoutFlow: true,
      organizationSwitcher: true,
    });
    connectFlagsToAnalytics(stub.client);
    const snap = await getFlagsSnapshot();
    expect(snap.newCheckoutFlow).toBe(true);
    expect(snap.organizationSwitcher).toBe(true);
    expect(snap.twoFactorSetup).toBe(true);
    expect(stub.calls).toBe(1);
  });

  it("getFlag still works via the snapshot path", async () => {
    const stub = makeStubAnalytics({ newCheckoutFlow: true });
    connectFlagsToAnalytics(stub.client);
    expect(await getFlag("newCheckoutFlow")).toBe(true);
  });
});
