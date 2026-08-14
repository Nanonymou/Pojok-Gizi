"use client";
import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("pg-theme") || "dark";
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);
  return null;
}
