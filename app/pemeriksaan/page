"use client";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";

function kategoriFatGender(persenFat, jk) {
  const f = Number(persenFat);
  if (!f || f <= 0) return "-";
  if (jk === "L") {
    if (f < 6) return "Esensial";
    if (f < 14) return "Atlet";
    if (f < 18) return "Kebugaran";
    if (f < 25) return "Rata-rata";
    return "Obesitas";
  }
  if (jk === "P") {
    if (f < 14) return "Esensial";
    if (f < 21) return "Atlet";
    if (f < 25) return "Kebugaran";
    if (f < 32) return "Rata-rata";
    return "Obesitas";
  }
  return "-";
}
function keteranganFat(f) {
  f = Number(f);
  if (!f || f <= 0) return "-";
  if (f >= 1 && f < 13) return "Normal";
  if (f >= 13 && f < 15) return "Sedang";
  if (f >= 15 && f <= 20) return "Tinggi";
  if (f > 20) return "Obesitas";
  return "-";
}
function keteranganVicFat(v) {
  v = Number(v);
  if (!v || v <= 0) return "-";
  if (v >= 1 && v < 13) return "Normal";
  if (v >= 13 && v < 15) return "Sedang";
  if (v >= 15 && v <= 20) return "Tinggi";
  if (v > 20) return "Obesitas";
  return "-";
}
function keteranganBmi(b) {
  b = Number(b);
  if (!b || b <= 0) return "-";
  if (b < 18.5) return "Underweight";
  if (b < 25) return "Normal";
  if (b < 30) return "Overweight";
  if (b < 35) return "Obesitas 1";
  if (b < 40) return "Obesitas 2";
  return "Obesitas 3";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { min: start.toISOString().slice(0, 10), max: end.toISOString().slice(0, 10) };
}

const emptyForm = {
  tanggal: todayISO(),
  noRm: "",
  namaKaryawan: "",
  nikOrId: "",
  perusahaanId: "",
  kantin: "",
  jenisKelamin: "",
  usia: "",
  beratBadan: "",
  tinggiBadan: "",
  persenFat: "",
  vicFat: "",
  kalori: "",
  bmi: "",
  tindakLanjut: "",
};

export default function PemeriksaanPage() {
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const range = useMemo(monthRange, []);

  useEffect(() => {
    fetch("/api/master-perusahaan")
      .then((r) => r.json())
      .then((d) => setPerusahaanList(d.items || []));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await fetch("/api/pemeriksaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Gagal menyimpan data");
      return;
    }
    setSuccess("Data pemeriksaan berhasil disimpan.");
    setForm({ ...emptyForm, tanggal: todayISO() });
  }

  return (
    <AppShell>
      <h1 className="text-xl font-bold mb-4">Form Input Pemeriksaan Gizi</h1>

      <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
        <Section title="Patient Information">
          <Grid>
            <Field label="Tanggal">
              <input
                type="date"
                className="input-field"
                min={range.min}
                max={range.max}
                value={form.tanggal}
                onChange={(e) => update("tanggal", e.target.value)}
                required
              />
            </Field>
            <Field label="No. Rekam Medis">
              <input className="input-field" value={form.noRm} onChange={(e) => update("noRm", e.target.value)} required />
            </Field>
            <Field label="Nama Karyawan">
              <input
                className="input-field"
                value={form.namaKaryawan}
                onChange={(e) => update("namaKaryawan", e.target.value)}
                required
              />
            </Field>
            <Field label="ID / NIK">
              <input className="input-field" value={form.nikOrId} onChange={(e) => update("nikOrId", e.target.value)} required />
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
            <Field label="Kantin">
              <select className="input-field" value={form.kantin} onChange={(e) => update("kantin", e.target.value)} required>
                <option value="">Pilih Kantin</option>
                <option value="Mahakam">Mahakam</option>
                <option value="Belayan">Belayan</option>
              </select>
            </Field>
            <Field label="Jenis Kelamin">
              <select
                className="input-field"
                value={form.jenisKelamin}
                onChange={(e) => update("jenisKelamin", e.target.value)}
                required
              >
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
            <Field label="Usia">
              <input type="number" className="input-field" value={form.usia} onChange={(e) => update("usia", e.target.value)} required />
            </Field>
          </Grid>
        </Section>

        <Section title="Body Measurement">
          <Grid>
            <Field label="Berat Badan (kg)">
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={form.beratBadan}
                onChange={(e) => update("beratBadan", e.target.value)}
                required
              />
            </Field>
            <Field label="Tinggi Badan (cm)">
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={form.tinggiBadan}
                onChange={(e) => update("tinggiBadan", e.target.value)}
                required
              />
            </Field>
            <Field label="% Fat">
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="input-field"
                value={form.persenFat}
                onChange={(e) => update("persenFat", e.target.value)}
                required
              />
            </Field>
            <Field label="Vic Fat">
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="input-field"
                value={form.vicFat}
                onChange={(e) => update("vicFat", e.target.value)}
                required
              />
            </Field>
            <Field label="Kalori">
              <input type="number" className="input-field" value={form.kalori} onChange={(e) => update("kalori", e.target.value)} />
            </Field>
            <Field label="BMI">
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="input-field"
                value={form.bmi}
                onChange={(e) => update("bmi", e.target.value)}
                required
              />
            </Field>
          </Grid>
        </Section>

        <Section title="Result (Otomatis)">
          <Grid>
            <ReadOnly label="Kategori %Fat (Gender)" value={kategoriFatGender(form.persenFat, form.jenisKelamin)} />
            <ReadOnly label="Keterangan %Fat" value={keteranganFat(form.persenFat)} />
            <ReadOnly label="Keterangan Vic Fat" value={keteranganVicFat(form.vicFat)} />
            <ReadOnly label="Keterangan BMI" value={keteranganBmi(form.bmi)} />
          </Grid>
          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            Preview di atas dihitung ulang secara resmi di server saat data disimpan.
          </p>
        </Section>

        <Section title="Follow Up">
          <Field label="Tindak Lanjut">
            <textarea
              className="input-field"
              rows={3}
              value={form.tindakLanjut}
              onChange={(e) => update("tindakLanjut", e.target.value)}
            />
          </Field>
        </Section>

        {error && (
          <div className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm" style={{ color: "var(--success)" }}>
            {success}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Menyimpan..." : "SIMPAN PEMERIKSAAN"}
        </button>
      </form>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-bold tracking-wider mb-3" style={{ color: "var(--primary)" }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
function Grid({ children }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      {children}
    </div>
  );
}
function ReadOnly({ label, value }) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <div className="input-field" style={{ background: "var(--surface-hover)", color: "var(--primary)", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}
