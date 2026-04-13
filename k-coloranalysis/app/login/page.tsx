"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }
  };

  const handleSignup = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to confirm your account");
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--app-canvas)] text-[var(--ink)] flex items-center justify-center">
      <div className="w-full max-w-[430px] bg-white px-6 py-8 rounded-[32px] shadow-[0_24px_80px_rgba(18,18,18,0.08)]">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-sm text-[var(--muted)] uppercase tracking-[0.24em]">
            K-Color Analysis
          </div>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em]">
            Welcome!
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to save your color results and recommendations
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          className="w-full rounded-full border border-black/10 py-3 text-sm font-medium hover:bg-[var(--soft)] transition"
        >
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-xs text-[var(--muted)]">or</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[18px] bg-[var(--soft)] px-4 py-3 text-sm outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[18px] bg-[var(--soft)] px-4 py-3 text-sm outline-none"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-black py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Signup */}
        <button
          onClick={handleSignup}
          className="mt-3 w-full rounded-full bg-[var(--soft)] py-3 text-sm font-medium"
        >
          Create account
        </button>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-[var(--muted)] leading-5">
          Your results are saved privately and tied to your account.
        </div>
      </div>
    </div>
  );
}