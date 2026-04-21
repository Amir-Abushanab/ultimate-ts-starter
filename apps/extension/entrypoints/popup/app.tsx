import { useEffect, useState } from "react";

import "./app.css";

const API_URL = "http://localhost:3000";

type Screen = "loading" | "login" | "otp" | "home";

// chrome.storage types don't resolve in the shared lint environment;
// declare the subset we use so the linter sees proper types.
declare const chrome: {
  storage: {
    local: {
      get(key: string): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(key: string): Promise<void>;
    };
  };
};

const getToken = async (): Promise<string | null> => {
  const result = await chrome.storage.local.get("auth_token");
  const token = result.auth_token;
  return typeof token === "string" ? token : null;
};

const setToken = async (token: string) => {
  await chrome.storage.local.set({ auth_token: token });
};

const clearTokenStorage = async () => {
  await chrome.storage.local.remove("auth_token");
};

const App = () => {
  const [screen, setScreen] = useState<Screen>("loading");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  const checkSession = async () => {
    const token = await getToken();
    if (token === null) {
      setScreen("login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // eslint-disable-next-line typescript/no-unsafe-type-assertion -- JSON response shape validated by API contract
        const data = (await res.json()) as unknown as {
          user: { name: string; email: string };
        };
        setUser(data.user);
        setScreen("home");
      } else {
        await clearTokenStorage();
        setScreen("login");
      }
    } catch {
      setScreen("login");
      setStatus("Cannot reach server");
    }
  };

  useEffect(() => {
    void checkSession();
  }, []);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      return;
    }
    setStatus("Sending code...");
    try {
      const res = await fetch(
        `${API_URL}/api/auth/email-otp/send-verification-otp`,
        {
          body: JSON.stringify({ email: email.trim(), type: "sign-in" }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }
      );
      if (res.ok) {
        setScreen("otp");
        setStatus(`Code sent to ${email}`);
      } else {
        setStatus("Failed to send code");
      }
    } catch {
      setStatus("Network error");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      return;
    }
    setStatus("Verifying...");
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-in/email-otp`, {
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (res.ok) {
        const token = res.headers.get("set-auth-token");
        if (token !== null) {
          await setToken(token);
        }
        await checkSession();
      } else {
        setStatus("Invalid code");
      }
    } catch {
      setStatus("Network error");
    }
  };

  const handleSignOut = async () => {
    await clearTokenStorage();
    setUser(null);
    setScreen("login");
    setStatus("");
    setEmail("");
    setOtp("");
  };

  if (screen === "loading") {
    return <div className="popup">Loading...</div>;
  }

  return (
    <div className="popup">
      <h1>Ultimate TS Starter</h1>

      {status && <p className="status">{status}</p>}

      {screen === "login" && (
        <div className="form">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSendOtp();
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              void handleSendOtp();
            }}
          >
            Continue
          </button>
        </div>
      )}

      {screen === "otp" && (
        <div className="form">
          <input
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replaceAll(/\D/g, "").slice(0, 6));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleVerifyOtp();
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              void handleVerifyOtp();
            }}
          >
            Verify
          </button>
          <button
            type="button"
            className="link"
            onClick={() => {
              setScreen("login");
              setOtp("");
            }}
          >
            Back to login
          </button>
        </div>
      )}

      {screen === "home" && user && (
        <div className="form">
          <p>
            <strong>{user.name}</strong>
          </p>
          <p className="dim">{user.email}</p>
          <button
            type="button"
            className="danger"
            onClick={() => {
              void handleSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
