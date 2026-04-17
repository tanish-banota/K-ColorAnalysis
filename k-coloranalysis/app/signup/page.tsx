"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter your name");
      return;
    }
  
    setLoading(true);
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }
  
    const user = data.user;
  
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        ]);
  
      if (profileError) {
        console.error(profileError);
      }
    }
  
    setLoading(false);
    router.push("/");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--app-canvas)]">
      <div className="w-full max-w-[430px] bg-white p-6 rounded-[32px] shadow-[0_24px_80px_rgba(18,18,18,0.08)]">

        <h1 className="text-2xl font-semibold text-center mb-4">
          Create Account
        </h1>

        <button
          onClick={handleGoogle}
          className="w-full py-3 rounded-full border mb-4"
        >
          Continue with Google
        </button>

        <div className="flex gap-2 mb-3">
            <input
                placeholder="First Name"
                onChange={(e) => setFirstName(e.target.value)}
            />

            <input
                placeholder="Last Name"
                onChange={(e) => setLastName(e.target.value)}
            />
        </div>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 rounded-xl bg-[var(--soft)]"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-[var(--soft)]"
        />

        <button
            onClick={handleSignup}
            disabled={!firstName.trim() || !lastName.trim() || loading}
            className="w-full py-3 rounded-full bg-black text-white disabled:opacity-50"
        >
  Sign up
</button>
      </div>
    </div>
  );
}