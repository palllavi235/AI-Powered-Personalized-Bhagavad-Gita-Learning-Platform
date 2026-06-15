"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "Authentication failed.");
      return;
    }

    if (data.message) {
      setMessage(data.message);
      return;
    }

    router.push(mode === "signup" ? "/onboarding" : searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      {mode === "signup" && (
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" autoComplete="name" required />
      )}
      <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" autoComplete="email" required />
      <Input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
      />
      <Button className="w-full" disabled={loading}>
        {mode === "signup" ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
        {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <p className="text-sm text-muted-foreground">
        {mode === "signup" ? "Already have an account?" : "New to YUDHSVAH?"}{" "}
        <Link className="font-medium text-foreground hover:underline" href={mode === "signup" ? "/login" : "/signup"}>
          {mode === "signup" ? "Login" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="secondary" size={compact ? "sm" : "md"} onClick={logout}>
      Logout
    </Button>
  );
}
