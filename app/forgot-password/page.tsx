"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      toast.success(data.message);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: "100px auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Toaster richColors />
      <h1>Forgot Password</h1>

      {sent ? (
        <p style={{ color: "#64748b" }}>
          If an account exists for this email, a reset link has been sent. Please check your inbox.
          <br />
          <Link href="/login" style={{ color: "#6366f1" }}>Back to Login</Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Link href="/login" style={{ color: "#6366f1", fontSize: 14, textAlign: "center" }}>
            Back to Login
          </Link>
        </form>
      )}
    </main>
  );
}
