"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { group: "Overview", items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    group: "Gizi",
    items: [
      { href: "/rekap", label: "Data Konsultasi" },
      { href: "/pemeriksaan", label: "Input Pemeriksaan" },
    ],
  },
  { group: "Request", items: [{ href: "/dashboard#request", label: "Request Gizi" }] },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 hidden md:flex flex-col border-r card rounded-none sticky top-0 h-screen">
        <div className="p-4 text-sm font-bold tracking-wide" style={{ color: "var(--primary)" }}>
          POJOK GIZI <span className="text-foreground">BY ADEN</span>
        </div>
        <nav className="flex-1 px-2 space-y-4 overflow-y-auto">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="px-2 text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                {g.group}
              </div>
              {g.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-lg text-sm mb-1"
                    style={
                      active
                        ? { background: "var(--primary-soft)", color: "var(--primary)", fontWeight: 600 }
                        : { color: "var(--foreground)" }
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout} className="btn-ghost w-full text-sm">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b"
          style={{ background: "var(--surface)", backdropFilter: "blur(6px)" }}
        >
          <div className="font-semibold md:hidden">POJOK GIZI</div>
          <div className="hidden md:block text-sm" style={{ color: "var(--muted)" }}>
            Nutrition Monitoring Overview
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
