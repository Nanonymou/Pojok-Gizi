"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Username atau password salah");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, var(--primary-soft), transparent 40%), var(--background)",
      }}
    >
      <div className="absolute top-4 left-4">
        <a href="/request-gizi" className="btn-ghost text-sm">
          ← Kembali
        </a>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="text-lg font-bold tracking-widest" style={{ color: "var(--primary)" }}>
            POJOK GIZI BY ADEN
          </div>
        </div>
        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Nutritionist Access
          </div>
          <div>
            <label className="text-sm block mb-1">Username</label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Memeriksa..." : "LOGIN ACCESS"}
          </button>
        </form>
        <div className="text-center mt-4 text-xs" style={{ color: "var(--muted)" }}>
          Halaman ini hanya untuk Nutrisionist.{" "}
          <a href="/request-gizi" className="underline">
            Ingin request konsultasi gizi?
          </a>
        </div>
      </div>
    </div>
  );
}
