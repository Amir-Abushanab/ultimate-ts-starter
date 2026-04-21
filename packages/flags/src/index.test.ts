import { beforeEach, describe, expect, it } from "vitest";

import {
  getAllFlags,
  getFlag,
  getFlagSync,
  resetFlags,
  setFlags,
} from "./index";

describe("feature flags", () => {
  beforeEach(() => {
    resetFlags();
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
