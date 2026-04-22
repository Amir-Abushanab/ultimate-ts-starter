import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Use at least 8 characters");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
});

export const otpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type SignIn = z.infer<typeof signInSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
export type OtpVerify = z.infer<typeof otpSchema>;
