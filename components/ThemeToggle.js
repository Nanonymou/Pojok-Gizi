"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("pg-theme") || "dark";
    setDark(saved === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pg-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="btn-ghost text-sm"
      aria-label="Toggle theme"
      title="Toggle Dark/Light Mode"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
