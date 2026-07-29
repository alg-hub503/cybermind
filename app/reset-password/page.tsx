"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

function getStrength(password: string): { label: string; color: string; score: number } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "#ef4444", score };
  if (score <= 4) return { label: "Medium", color: "#f59e0b", score };
  return { label: "Strong", color: "#22c55e", score };
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isValid = password.length >= 6 && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("This link is invalid or has expired.");
      return;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        return;
      }

      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
        <Toaster richColors />
        <h1>Invalid Link</h1>
        <p style={{ color: "#64748b" }}>This link is invalid or has expired.</p>
        <Link href="/forgot-password" style={{ color: "#6366f1" }}>Request a new reset link</Link>
      </main>
    );
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
      <h1>Reset Password</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ flex: 1 }}
            />
            <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
          {password && (
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(strength.score / 6) * 100}%`,
                    height: "100%",
                    background: strength.color,
                    borderRadius: 2,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: strength.color, fontWeight: 500 }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={{ flex: 1 }}
          />
          <Button type="button" variant="outline" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? "Hide" : "Show"}
          </Button>
        </div>

        {confirmPassword && !passwordsMatch && (
          <p style={{ color: "#ef4444", fontSize: 13 }}>Passwords do not match.</p>
        )}

        <Button type="submit" disabled={loading || !isValid}>
          {loading ? "Updating..." : "Update Password"}
        </Button>

        <Link href="/login" style={{ color: "#6366f1", fontSize: 14, textAlign: "center" }}>
          Back to Login
        </Link>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}
