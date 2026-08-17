"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";

const emptyForm = {
  nama: "",
  umur: "",
  jenisKelamin: "",
  nikOrId: "",
  perusahaanId: "",
  kantin: "",
  jamKonsul: "",
  noWhatsapp: "",
  keluhan: "",
};

// Hari konsul dikunci per kantin: Mahakam hanya Minggu, Belayan hanya Senin.
const KANTIN_HARI = {
  Mahakam: { label: "Minggu", dayOfWeek: 0 },
  Belayan: { label: "Senin", dayOfWeek: 1 },
};

function nextDateForKantin(kantin) {
  const hari = KANTIN_HARI[kantin];
  if (!hari) return null;
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = (hari.dayOfWeek - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  return base;
}

function formatTanggalId(date) {
  if (!date) return "";
  return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function isWhatsappValid(nomor) {
  if (!nomor) return false;
  return /^(\+?62|0)8[0-9]{7,12}$/.test(String(nomor).trim());
}

// Hanya slot 18:30–20:00, kelipatan 15 menit, supaya user tidak bisa memilih
// di luar rentang yang diizinkan (native <input type="time"> tidak benar-benar
// mengunci pilihan di beberapa browser walau sudah diberi min/max).
function buildTimeSlots() {
  const slots = [];
  let h = 18;
  let m = 30;
  while (h < 20 || (h === 20 && m === 0)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 15;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

export default function RequestGiziPage() {
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/master-perusahaan")
      .then((r) => r.json())
      .then((d) => setPerusahaanList(d.items || []))
      .catch(() => {});
  }, []);

  const tanggalKonsul = nextDateForKantin(form.kantin);

  const isComplete =
    form.nama &&
    form.umur &&
    form.jenisKelamin &&
    form.nikOrId &&
    form.perusahaanId &&
    form.kantin &&
    form.jamKonsul &&
    isWhatsappValid(form.noWhatsapp);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/request-gizi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Gagal mengirim request");
      return;
    }
    setSuccess(true);
    setForm(emptyForm);
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "radial-gradient(circle at 85% -10%, var(--primary-soft), transparent 42%), radial-gradient(circle at 0% 110%, var(--primary-soft), transparent 40%), var(--background)",
      }}
    >
      <header className="grid grid-cols-3 items-center px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center">
          <img
            src="https://i.postimg.cc/WpdjYB8N/Whats-App-Image-2026-08-14-at-11-03-08.png"
            alt="Logo Aden"
            className="h-10 w-auto max-w-[140px] object-contain"
          />
        </div>
        <div className="font-bold tracking-wide text-center brand-gradient-text">
          POJOK GIZI BY ADEN
        </div>
        <div className="flex items-center justify-end gap-2">
          <a href="/login" className="btn-ghost text-sm" title="Login Nutrisionist">
            Login
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-16">
        <div className="text-center mb-6 animate-in">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
          >
            <span aria-hidden>🥗</span> Konsultasi Gizi Digital
          </div>
          <h1 className="text-2xl font-bold">Digital Nutrition Consultation</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Ajukan konsultasi gizi dengan Nutrisionist — cepat, mudah, dan gratis.
          </p>
        </div>

        {success ? (
          <div className="card p-8 text-center space-y-3 animate-in">
            <div
              className="mx-auto flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: "var(--primary-soft)" }}
            >
              <span className="text-3xl" style={{ color: "var(--success)" }} aria-hidden>
                ✓
              </span>
            </div>
            <div className="text-xl font-bold">Request Berhasil Dikirim</div>
            <p style={{ color: "var(--muted)" }}>
              Request konsultasi Anda telah diterima. Silakan menunggu tindak lanjut dari Nutrisionist
              melalui WhatsApp.
            </p>
            <button className="btn-primary mt-2" onClick={() => setSuccess(false)}>
              Ajukan Request Lain
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card p-6 space-y-5 animate-in">
            <Field label="Nama Lengkap" icon="👤">
              <input
                className="input-field"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={(e) => update("nama", e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Umur" icon="🎂">
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="Tahun"
                  value={form.umur}
                  onChange={(e) => update("umur", e.target.value)}
                  required
                />
              </Field>
              <Field label="NIK / ID Perusahaan" icon="🪪">
                <input
                  className="input-field"
                  placeholder="Nomor ID"
                  value={form.nikOrId}
                  onChange={(e) => update("nikOrId", e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Jenis Kelamin" icon="⚧">
              <div className="segmented" role="radiogroup" aria-label="Jenis Kelamin">
                <GenderOption
                  active={form.jenisKelamin === "L"}
                  onClick={() => update("jenisKelamin", "L")}
                  icon="♂"
                  label="Laki-laki"
                />
                <GenderOption
                  active={form.jenisKelamin === "P"}
                  onClick={() => update("jenisKelamin", "P")}
                  icon="♀"
                  label="Perempuan"
                />
              </div>
            </Field>

            <Field label="Perusahaan" icon="🏢">
              <select
                className="input-field"
                value={form.perusahaanId}
                onChange={(e) => update("perusahaanId", e.target.value)}
                required
              >
                <option value="">Pilih Perusahaan</option>
                {perusahaanList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kantin" icon="📍">
              <select
                className="input-field"
                value={form.kantin}
                onChange={(e) => update("kantin", e.target.value)}
                required
              >
                <option value="">Pilih Kantin</option>
                <option value="Mahakam">Mahakam</option>
                <option value="Belayan">Belayan</option>
              </select>
            </Field>

            {form.kantin && (
              <div
                className="rounded-xl p-4 animate-in"
                style={{ background: "var(--primary-soft)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                  📅 HARI &amp; TANGGAL KONSUL
                </div>
                <div className="font-bold" style={{ color: "var(--primary)" }}>
                  {KANTIN_HARI[form.kantin].label} · {formatTanggalId(tanggalKonsul)}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Kantin {form.kantin} hanya melayani konsultasi hari {KANTIN_HARI[form.kantin].label},
                  jadi tanggal otomatis mengikuti hari terdekat.
                </p>
              </div>
            )}

            <Field label="No. WhatsApp" icon="💬">
              <input
                type="tel"
                className="input-field"
                placeholder="08xxxxxxxxxx"
                value={form.noWhatsapp}
                onChange={(e) => update("noWhatsapp", e.target.value)}
                required
              />
              {form.noWhatsapp && !isWhatsappValid(form.noWhatsapp) && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                  Format nomor WhatsApp belum valid, contoh: 08123456789
                </p>
              )}
            </Field>

            <Field label="Jam Konsul (18:30–20:00)" icon="⏰">
              <select
                className="input-field"
                value={form.jamKonsul}
                onChange={(e) => update("jamKonsul", e.target.value)}
                required
              >
                <option value="">Pilih Jam</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Keluhan atau Kondisi" icon="📝">
              <textarea
                className="input-field"
                rows={3}
                placeholder="Ceritakan keluhan atau kondisi Anda (opsional)"
                value={form.keluhan}
                onChange={(e) => update("keluhan", e.target.value)}
              />
            </Field>

            {error && (
              <div
                className="text-sm rounded-lg px-3 py-2"
                style={{ color: "var(--danger)", background: "rgba(239,68,68,0.1)" }}
              >
                {error}
              </div>
            )}

            <button type="submit" disabled={!isComplete || loading} className="btn-primary w-full">
              {loading ? "Mengirim..." : "REQUEST KONSULTASI"}
            </button>
            <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
              Dengan mengirim request, Anda setuju dihubungi Nutrisionist via WhatsApp.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

function GenderOption({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      data-active={active}
      className="segmented-option"
      onClick={onClick}
    >
      <span className="text-lg" aria-hidden>
        {icon}
      </span>
      {label}
    </button>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
        {icon && (
          <span aria-hidden style={{ opacity: 0.8 }}>
            {icon}
          </span>
        )}
        {label}
      </label>
      {children}
    </div>
  );
}
