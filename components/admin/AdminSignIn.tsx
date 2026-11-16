"use client";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function AdminSignIn() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      redirect: false,
      callbackUrl: "/approval"
    });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else window.location.href = "/approval";
  }
  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-slate-700">Authorized administrators only. Use configured credentials.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="block text-sm">Password<input name="password" type="password" required className="mt-1 w-full rounded border px-3 py-2" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-brand-700 px-4 py-2 text-white disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
