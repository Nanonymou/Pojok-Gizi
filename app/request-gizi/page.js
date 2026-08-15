"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle";

const emptyForm = {
  nama: "",
  umur: "",
  nikOrId: "",
  perusahaanId: "",
  hariKonsul: "",
  jamKonsul: "",
  keluhan: "",
};

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

  const isComplete =
    form.nama && form.umur && form.nikOrId && form.perusahaanId && form.hariKonsul && form.jamKonsul;

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
          "radial-gradient(circle at 80% 0%, var(--primary-soft), transparent 45%), var(--background)",
      }}
    >
      <header className="grid grid-cols-3 items-center px-4 py-4 max-w-2xl mx-auto">
        <div />
        <div
          className="font-bold tracking-wide text-center"
          style={{ color: "var(--primary)" }}
        >
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
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">Digital Nutrition Consultation</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Ajukan konsultasi gizi dengan Nutrisionist
          </p>
        </div>

        {success ? (
          <div className="card p-6 text-center space-y-2">
            <div className="text-2xl" style={{ color: "var(--success)" }}>
              ✓ REQUEST BERHASIL
            </div>
            <p style={{ color: "var(--muted)" }}>
              Request konsultasi Anda telah diterima. Silakan menunggu tindak lanjut Nutrisionist.
            </p>
            <button className="btn-ghost mt-2" onClick={() => setSuccess(false)}>
              Ajukan Request Lain
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card p-5 space-y-4">
            <Field label="Nama">
              <input className="input-field" value={form.nama} onChange={(e) => update("nama", e.target.value)} required />
            </Field>
            <Field label="Umur">
              <input
                type="number"
                min="1"
                className="input-field"
                value={form.umur}
                onChange={(e) => update("umur", e.target.value)}
                required
              />
            </Field>
            <Field label="NIK atau ID Perusahaan">
              <input
                className="input-field"
                value={form.nikOrId}
                onChange={(e) => update("nikOrId", e.target.value)}
                required
              />
            </Field>
            <Field label="Perusahaan">
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
            <Field label="Hari Konsul">
              <input
                type="date"
                className="input-field"
                value={form.hariKonsul}
                onChange={(e) => update("hariKonsul", e.target.value)}
                required
              />
            </Field>
            <Field label="Jam Konsul (18:30–20:00)">
              <input
                type="time"
                min="18:30"
                max="20:00"
                className="input-field"
                value={form.jamKonsul}
                onChange={(e) => update("jamKonsul", e.target.value)}
                required
              />
            </Field>
            <Field label="Keluhan atau Kondisi">
              <textarea
                className="input-field"
                rows={3}
                value={form.keluhan}
                onChange={(e) => update("keluhan", e.target.value)}
              />
            </Field>

            {error && (
              <div className="text-sm" style={{ color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={!isComplete || loading} className="btn-primary w-full">
              {loading ? "Mengirim..." : "REQUEST KONSULTASI"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      {children}
    </div>
  );
}
