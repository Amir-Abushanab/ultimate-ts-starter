import { describe, expect, it } from "vitest";

import { emailSchema, otpSchema, signInSchema, signUpSchema } from "./auth";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.safeParse("test@example.com").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = emailSchema.safeParse("  test@example.com  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });
});

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "12345678" }).success
    ).toBe(true);
  });

  it("rejects short password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "123" }).success
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("requires name", () => {
    expect(
      signUpSchema.safeParse({
        email: "a@b.com",
        name: "",
        password: "12345678",
      }).success
    ).toBe(false);
  });

  it("accepts valid signup data", () => {
    expect(
      signUpSchema.safeParse({
        email: "a@b.com",
        name: "Test",
        password: "12345678",
      }).success
    ).toBe(true);
  });
});

describe("otpSchema", () => {
  it("accepts a 6-digit OTP", () => {
    expect(
      otpSchema.safeParse({ email: "a@b.com", otp: "123456" }).success
    ).toBe(true);
  });

  it("rejects a 5-digit OTP", () => {
    expect(
      otpSchema.safeParse({ email: "a@b.com", otp: "12345" }).success
    ).toBe(false);
  });
});
