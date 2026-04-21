import * as m from "@ultimate-ts-starter/i18n/messages";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ultimate-ts-starter/ui/components/input-otp";
import { Label } from "@ultimate-ts-starter/ui/components/label";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type SetupStep = "idle" | "qr" | "backup-codes";

export default function TwoFactorSetup() {
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState<SetupStep>("idle");
  const [totpUri, setTotpUri] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPending) {
    return null;
  }

  // eslint-disable-next-line typescript/no-unsafe-type-assertion -- Better Auth augments user with twoFactorEnabled
  const userRecord = session?.user as unknown as
    | Record<string, unknown>
    | undefined;
  const twoFactorEnabled =
    typeof userRecord?.twoFactorEnabled === "boolean"
      ? userRecord.twoFactorEnabled
      : undefined;

  const handleEnable = async () => {
    setError("");
    setLoading(true);

    const { data, error: uriError } = await authClient.twoFactor.getTotpUri({
      password: "",
    });

    setLoading(false);

    if (uriError !== null) {
      setError(uriError?.message ?? "Failed to generate QR code");
      return;
    }

    setTotpUri(data.totpURI);
    setStep("qr");
  };

  const handleVerifySetup = async () => {
    if (code.length !== 6) {
      setError(m.auth_enter_6_digit());
      return;
    }

    setError("");
    setLoading(true);

    const { error: enableError } = await authClient.twoFactor.enable({
      password: "",
    });

    if (enableError) {
      setLoading(false);
      setError(enableError.message ?? "Failed to enable 2FA");
      return;
    }

    const { error: verifyError } = await authClient.twoFactor.verifyTotp({
      code,
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message ?? m.auth_invalid_code());
      return;
    }

    toast.success(m.tfa_enabled_success());

    const { data: backupData } = await authClient.twoFactor.generateBackupCodes(
      { password: "" }
    );

    if (backupData?.backupCodes) {
      setBackupCodes(backupData.backupCodes);
      setStep("backup-codes");
    } else {
      setStep("idle");
      setCode("");
    }
  };

  const handleDisable = async () => {
    setError("");
    setLoading(true);

    const { error: disableError } = await authClient.twoFactor.disable({
      password: "",
    });

    setLoading(false);

    if (disableError) {
      setError(disableError.message ?? "Failed to disable 2FA");
      return;
    }

    toast.success(m.tfa_disabled_success());
    setStep("idle");
    setCode("");
    setTotpUri("");
    setBackupCodes([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{m.tfa_title()}</h3>
        <p className="text-sm text-muted-foreground">
          {twoFactorEnabled === true
            ? m.tfa_enabled_desc()
            : m.tfa_disabled_desc()}
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === "idle" && (
        <div>
          {twoFactorEnabled === true ? (
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                void handleDisable();
              }}
            >
              {loading ? m.tfa_disabling() : m.tfa_disable()}
            </Button>
          ) : (
            <Button
              disabled={loading}
              onClick={() => {
                void handleEnable();
              }}
            >
              {loading ? m.tfa_setting_up() : m.tfa_enable()}
            </Button>
          )}
        </div>
      )}

      {step === "qr" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{m.tfa_scan_qr()}</p>
            <div className="flex justify-center rounded-lg border bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                alt="TOTP QR Code"
                width={200}
                height={200}
              />
            </div>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">{m.tfa_cant_scan()}</summary>
              <code className="mt-1 block break-all rounded bg-muted p-2">
                {totpUri}
              </code>
            </details>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerifySetup();
            }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label>{m.tfa_verify_label()}</Label>
              <InputOTP
                maxLength={6}
                autoFocus
                value={code}
                onChange={(value) => {
                  setCode(value);
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
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? m.auth_verifying() : m.tfa_verify_enable()}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("idle");
                  setCode("");
                  setError("");
                }}
              >
                {m.tfa_cancel()}
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === "backup-codes" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{m.tfa_backup_save()}</p>
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted p-4 font-mono text-sm">
              {backupCodes.map((bc) => (
                <span key={bc}>{bc}</span>
              ))}
            </div>
          </div>
          <Button
            onClick={() => {
              setStep("idle");
              setCode("");
              setTotpUri("");
              setBackupCodes([]);
            }}
          >
            {m.tfa_backup_done()}
          </Button>
        </div>
      )}
    </div>
  );
}
