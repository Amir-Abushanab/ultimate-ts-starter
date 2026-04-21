import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import * as m from "@ultimate-ts-starter/i18n/messages";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { Input } from "@ultimate-ts-starter/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ultimate-ts-starter/ui/components/input-otp";
import { Label } from "@ultimate-ts-starter/ui/components/label";
import { emailSchema } from "@ultimate-ts-starter/validation/auth";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

type Step = "email" | "otp" | "two-factor";

const AuthForm = () => {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // ── Step 1: Email form ──
  const emailForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setError("");
      setEmail(value.email);

      const ssoResult = await authClient.signIn.sso({
        callbackURL: `${window.location.origin}/dashboard`,
        email: value.email,
      });
      if (ssoResult.data?.url !== undefined) {
        window.location.href = ssoResult.data.url;
        return;
      }

      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp(
        {
          email: value.email,
          type: "sign-in",
        }
      );

      if (otpError) {
        setError(otpError.message ?? "Failed to send code");
        return;
      }

      setStep("otp");
    },
    validators: {
      onSubmit: z.object({ email: emailSchema }),
    },
  });

  // ── Step 2: OTP form ──
  const otpForm = useForm({
    defaultValues: { otp: "" },
    onSubmit: async ({ value }) => {
      setError("");

      const { data, error: signInError } = await authClient.signIn.emailOtp({
        email,
        otp: value.otp,
      });

      if (signInError) {
        setError(signInError.message ?? m.auth_invalid_code());
        return;
      }

      if ("twoFactorRedirect" in data && data.twoFactorRedirect === true) {
        setStep("two-factor");
        return;
      }

      toast.success(m.auth_signed_in());
      void navigate({ to: "/dashboard" });
    },
    validators: {
      onSubmit: z.object({
        otp: z.string().length(6, m.auth_enter_6_digit()),
      }),
    },
  });

  // ── Step 3: 2FA form ──
  const tfaForm = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setError("");

      const { error: tfError } = await authClient.twoFactor.verifyOtp({
        code: value.code,
      });

      if (tfError) {
        setError(tfError.message ?? m.auth_invalid_code());
        return;
      }

      toast.success(m.auth_signed_in());
      void navigate({ to: "/dashboard" });
    },
    validators: {
      onSubmit: z.object({
        code: z.string().length(6, m.auth_enter_6_digit()),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  const handleResendOtp = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    toast.success(m.auth_code_resent());
  };

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-2 text-center text-3xl font-bold">
        {step === "email" && m.auth_sign_in()}
        {step === "otp" && m.auth_check_email()}
        {step === "two-factor" && m.auth_two_factor()}
      </h1>

      <p className="mb-6 text-center text-muted-foreground">
        {step === "email" && m.auth_enter_email()}
        {step === "otp" && m.auth_otp_sent({ email })}
        {step === "two-factor" && m.auth_enter_authenticator()}
      </p>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Step 1: Email */}
      {step === "email" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void emailForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <emailForm.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{m.auth_email_label()}</Label>
                <Input
                  id={field.name}
                  type="email"
                  autoFocus
                  placeholder={m.auth_email_placeholder()}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                />
                {field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-sm text-destructive">
                    {err?.message}
                  </p>
                ))}
              </div>
            )}
          </emailForm.Field>

          <emailForm.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? m.auth_checking() : m.auth_continue()}
              </Button>
            )}
          </emailForm.Subscribe>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              void authClient.signIn.social({
                callbackURL: `${window.location.origin}/dashboard`,
                provider: "google",
              });
            }}
          >
            <svg className="size-4 me-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === "otp" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void otpForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <otpForm.Field name="otp">
            {(field) => (
              <div className="space-y-2">
                <Label>{m.auth_otp_label()}</Label>
                <InputOTP
                  maxLength={6}
                  autoFocus
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-sm text-destructive">
                    {err?.message}
                  </p>
                ))}
              </div>
            )}
          </otpForm.Field>

          <otpForm.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? m.auth_verifying() : m.auth_verify()}
              </Button>
            )}
          </otpForm.Subscribe>

          <div className="flex justify-between text-sm">
            <Button
              variant="link"
              type="button"
              className="p-0 h-auto"
              onClick={() => {
                setStep("email");
                setError("");
              }}
            >
              {m.auth_back_to_login()}
            </Button>
            <Button
              variant="link"
              type="button"
              className="p-0 h-auto"
              onClick={() => {
                void handleResendOtp();
              }}
            >
              {m.auth_resend_code()}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: 2FA */}
      {step === "two-factor" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void tfaForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <tfaForm.Field name="code">
            {(field) => (
              <div className="space-y-2">
                <Label>{m.auth_authenticator_label()}</Label>
                <InputOTP
                  maxLength={6}
                  autoFocus
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value);
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-sm text-destructive">
                    {err?.message}
                  </p>
                ))}
              </div>
            )}
          </tfaForm.Field>

          <tfaForm.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? m.auth_verifying() : m.auth_verify()}
              </Button>
            )}
          </tfaForm.Subscribe>
        </form>
      )}
    </div>
  );
};

export default AuthForm;
