import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
  useToast,
} from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

type Step = "email" | "otp";

const AuthForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");
    setLoading(true);

    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message ?? "Failed to send code");
      return;
    }

    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError("");
    setLoading(true);

    const { error: signInError } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Invalid code");
      return;
    }

    toast.show({ label: "Signed in", variant: "success" });
    void queryClient.refetchQueries();
  };

  return (
    <Surface variant="secondary" className="p-4 rounded-lg">
      <Text className="text-foreground font-medium mb-4">
        {step === "email" ? "Sign In" : "Enter Code"}
      </Text>

      <FieldError isInvalid={!!error} className="mb-3">
        {error}
      </FieldError>

      {step === "email" && (
        <View className="gap-3">
          <TextField>
            <Label>Email</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={() => {
                void handleSendOtp();
              }}
            />
          </TextField>

          <Button
            onPress={() => {
              void handleSendOtp();
            }}
            isDisabled={loading}
            className="mt-1"
          >
            {loading ? (
              <Spinner size="sm" color="default" />
            ) : (
              <Button.Label>Continue</Button.Label>
            )}
          </Button>
        </View>
      )}

      {step === "otp" && (
        <View className="gap-3">
          <Text className="text-muted text-sm">
            We sent a 6-digit code to {email}
          </Text>

          <TextField>
            <Label>Verification Code</Label>
            <Input
              value={otp}
              onChangeText={(val) => {
                setOtp(val.replaceAll(/\D/g, "").slice(0, 6));
              }}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              returnKeyType="go"
              onSubmitEditing={() => {
                void handleVerifyOtp();
              }}
            />
          </TextField>

          <Button
            onPress={() => {
              void handleVerifyOtp();
            }}
            isDisabled={loading}
            className="mt-1"
          >
            {loading ? (
              <Spinner size="sm" color="default" />
            ) : (
              <Button.Label>Verify</Button.Label>
            )}
          </Button>

          <Button
            variant="ghost"
            onPress={() => {
              setStep("email");
              setOtp("");
              setError("");
            }}
          >
            <Button.Label>Back to login</Button.Label>
          </Button>
        </View>
      )}
    </Surface>
  );
};

export { AuthForm };
