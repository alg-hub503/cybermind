"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

async function handleLogin(e: React.FormEvent) {
e.preventDefault();

setError("");

const result = await signIn("credentials", {
  email,
  password,
  redirect: false,
});

if (result?.error) {
  setError("Invalid email or password");
  return;
}

router.push("/dashboard");
router.refresh();

}

return (
<div style={{ padding: 40, maxWidth: 400 }}>
<h1>Login</h1>

  <form onSubmit={handleLogin}>
    <div style={{ marginBottom: 12 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />
    </div>

    <div style={{ marginBottom: 12 }}>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />
    </div>

    <button type="submit">
      Login
    </button>
  </form>

  {error && (
    <p style={{ color: "red", marginTop: 12 }}>
      {error}
    </p>
  )}
</div>

);
}