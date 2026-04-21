import { TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useState } from "react";

const API_URL = process.env.SERVER_URL ?? "http://localhost:3000";
const TOKEN_PATH = `${process.env.HOME}/.ultimate-ts-starter-token`;

// ── Token persistence ───────────────────────────
const loadToken = async (): Promise<string | null> => {
  try {
    return await Bun.file(TOKEN_PATH).text();
  } catch {
    return null;
  }
};

const saveToken = async (token: string) => {
  await Bun.write(TOKEN_PATH, token);
};

const clearToken = async () => {
  try {
    const { unlink } = await import("node:fs/promises");
    await unlink(TOKEN_PATH);
  } catch {
    // file may not exist
  }
};

// ── API helper ──────────────────────────────────
const apiCall = async (path: string, opts?: RequestInit) => {
  const token = await loadToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${API_URL}${path}`, { ...opts, headers });
};

// ── App ─────────────────────────────────────────
type Screen = "home" | "login-email" | "login-otp";

const App = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Type /help for commands");

  const handleCommand = async (cmd: string) => {
    const c = cmd.trim().toLowerCase();

    if (c === "/login") {
      setScreen("login-email");
      setStatus("Enter your email:");
      return;
    }

    if (c === "/logout") {
      await clearToken();
      setStatus("Signed out.");
      return;
    }

    if (c === "/status") {
      try {
        const res = await apiCall("/health");
        const data = (await res.json()) as {
          status: string;
          checks?: { database?: { status: string } };
        };
        setStatus(
          `API: ${data.status} | DB: ${data.checks?.database?.status ?? "?"}`
        );
      } catch {
        setStatus("Failed to reach API.");
      }
      return;
    }

    if (c === "/me") {
      try {
        const res = await apiCall("/api/auth/get-session");
        if (res.ok) {
          const data = (await res.json()) as {
            user: { name: string; email: string };
          };
          setStatus(`Signed in as ${data.user.name} (${data.user.email})`);
        } else {
          setStatus("Not signed in. Use /login");
        }
      } catch {
        setStatus("Failed to check session.");
      }
      return;
    }

    if (c === "/help") {
      setStatus("/login  /logout  /status  /me  /help  /quit");
      return;
    }

    if (c === "/quit" || c === "/exit") {
      process.exit(0);
    }

    setStatus(`Unknown: ${c} — type /help`);
  };

  const handleEmailSubmit = async (val: string) => {
    setEmail(val);
    setStatus("Sending OTP...");
    try {
      const res = await fetch(
        `${API_URL}/api/auth/email-otp/send-verification-otp`,
        {
          body: JSON.stringify({ email: val, type: "sign-in" }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }
      );
      if (res.ok) {
        setScreen("login-otp");
        setStatus(`OTP sent to ${val}. Enter the 6-digit code:`);
      } else {
        setStatus("Failed to send OTP. Try /login again.");
        setScreen("home");
      }
    } catch {
      setStatus("Network error. Is the server running?");
      setScreen("home");
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setStatus("Verifying...");
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-in/email-otp`, {
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (res.ok) {
        const token = res.headers.get("set-auth-token");
        if (token) {
          await saveToken(token);
          setStatus("Signed in! Token saved.");
        } else {
          setStatus("Signed in (cookie-only, no bearer token).");
        }
      } else {
        setStatus("Invalid OTP. Try again or /login to restart.");
        // stay on otp screen
        return;
      }
    } catch {
      setStatus("Network error.");
    }
    setScreen("home");
  };

  const promptLabels: Record<string, string> = {
    "login-email": "Email: ",
    "login-otp": "OTP: ",
  };
  const prompt = promptLabels[screen] ?? "> ";

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <box justifyContent="center" marginBottom={1}>
        <ascii-font font="tiny" text="Ultimate TS" />
      </box>

      <box marginBottom={1}>
        <text attributes={TextAttributes.DIM}>{status}</text>
      </box>

      <box flexGrow={1} />

      <box>
        <text attributes={TextAttributes.BOLD}>{prompt}</text>
        <input
          value={input}
          onChange={(val) => {
            setInput(val);
          }}
          onSubmit={(val) => {
            if (screen === "login-email") {
              void handleEmailSubmit(val);
            } else if (screen === "login-otp") {
              void handleOtpSubmit(val);
            } else {
              void handleCommand(val);
            }
            setInput("");
          }}
          autoFocus
        />
      </box>
    </box>
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
