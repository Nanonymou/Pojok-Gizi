"use client";
import { useEffect, useState, useCallback } from "react";
import AppShell from "../../components/AppShell";

const PEMERIKSAAN_STATUS_OPTIONS = ["Menunggu Pemeriksaan", "Selesai Pemeriksaan"];

export default function RekapPage() {
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [filters, setFilters] = useState({ kantin: "", perusahaanId: "", q: "", from: "", to: "", status: "" });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetch("/api/master-perusahaan")
      .then((r) => r.json())
      .then((d) => setPerusahaanList(d.items || []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filters.kantin) params.set("kantin", filters.kantin);
    if (filters.perusahaanId) params.set("perusahaanId", filters.perusahaanId);
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const res = await fetch(`/api/pemeriksaan?${params.toString()}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <AppShell>
      <h1 className="text-xl font-bold mb-4">Tabel Rekap Data Pemeriksaan</h1>

      <div className="card p-4 flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
            Cari (Nama/NIK/No RM)
          </label>
          <input
            className="input-field"
            value={filters.q}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, q: e.target.value }));
            }}
          />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
            Kantin
          </label>
          <select
            className="input-field"
            value={filters.kantin}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, kantin: e.target.value }));
            }}
          >
            <option value="">Semua</option>
            <option value="Mahakam">Mahakam</option>
            <option value="Belayan">Belayan</option>
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
            Status
          </label>
          <select
            className="input-field"
            value={filters.status}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, status: e.target.value }));
            }}
          >
            <option value="">Semua</option>
            {PEMERIKSAAN_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
            Perusahaan
          </label>
          <select
            className="input-field"
            value={filters.perusahaanId}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, perusahaanId: e.target.value }));
            }}
          >
            <option value="">Semua</option>
            {perusahaanList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
            Dari
          </label>
          <input
            type="date"
            className="input-field"
            value={filters.from}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, from: e.target.value }));
            }}
          />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
            Sampai
          </label>
          <input
            type="date"
            className="input-field"
            value={filters.to}
            onChange={(e) => {
              setPage(1);
              setFilters((f) => ({ ...f, to: e.target.value }));
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)" }}>Memuat data...</div>
      ) : result.items.length === 0 ? (
        <div className="card p-6 text-center" style={{ color: "var(--muted)" }}>
          <div className="font-semibold mb-1">NO DATA AVAILABLE</div>
          Belum terdapat data pemeriksaan pada periode yang dipilih.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-hover)" }} className="text-left">
                <Th>Tanggal</Th>
                <Th>No RM</Th>
                <Th>Nama</Th>
                <Th>Perusahaan</Th>
                <Th>Kantin</Th>
                <Th>JK</Th>
                <Th>%Fat</Th>
                <Th>Vic Fat</Th>
                <Th>BMI</Th>
                <Th>Status Gizi</Th>
                <Th>No. WhatsApp</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((row) => (
                <tr key={row.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <Td>{new Date(row.tanggal).toLocaleDateString("id-ID")}</Td>
                  <Td>{row.noRm || "-"}</Td>
                  <Td>{row.namaKaryawan}</Td>
                  <Td>{row.perusahaan?.nama}</Td>
                  <Td>{row.kantin}</Td>
                  <Td>{row.jenisKelamin || "-"}</Td>
                  <Td>{row.persenFat ?? "-"}</Td>
                  <Td>{row.vicFat ?? "-"}</Td>
                  <Td>{row.bmi ?? "-"}</Td>
                  <Td>
                    <Badge status={row.keteranganBmi || "-"} />
                  </Td>
                  <Td>{row.noWhatsapp || "-"}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <button className="btn-ghost text-xs py-1" onClick={() => setEditing(row)}>
                      Edit
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 text-sm">
        <div style={{ color: "var(--muted)" }}>
          Total {result.total} data — Halaman {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <button className="btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {editing && (
        <EditModal
          row={editing}
          perusahaanList={perusahaanList}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </AppShell>
  );
}

function Badge({ status }) {
  const colorMap = {
    Normal: "var(--success)",
    Underweight: "var(--warning)",
    Overweight: "var(--warning)",
    Sedang: "var(--primary)",
    Tinggi: "var(--warning)",
  };
  const color = colorMap[status] || "var(--danger)";
  return (
    <span className="badge" style={{ color }}>
      {status}
    </span>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 font-semibold whitespace-nowrap">{children}</th>;
}
function Td({ children }) {
  return <td className="px-3 py-2 whitespace-nowrap">{children}</td>;
}
function StatusBadge({ status }) {
  const isDone = status === "Selesai Pemeriksaan";
  return (
    <span className="badge" style={{ color: isDone ? "var(--success)" : "var(--warning)" }}>
      {status}
    </span>
  );
}

function EditModal({ row, perusahaanList, onClose, onSaved }) {
  const [form, setForm] = useState({
    ...row,
    tanggal: new Date(row.tanggal).toISOString().slice(0, 10),
    perusahaanId: row.perusahaanId,
    kantin: row.kantin || "",
    jenisKelamin: row.jenisKelamin || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lockedNoRm, setLockedNoRm] = useState(null);

  // No. RM sudah pernah terdaftar untuk karyawan ini (by nama + NIK/ID)? Kalau
  // ya, field No. RM dikunci (read-only) supaya tidak terjadi duplikasi.
  useEffect(() => {
    if (!form.namaKaryawan || !form.nikOrId) return;
    const params = new URLSearchParams({ nama: form.namaKaryawan, nikOrId: form.nikOrId });
    fetch(`/api/pemeriksaan/lookup-rm?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.locked && d.noRm) {
          setLockedNoRm(d.noRm);
          setForm((f) => (f.noRm ? f : { ...f, noRm: d.noRm }));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.namaKaryawan, form.nikOrId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/pemeriksaan/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Gagal menyimpan");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="card p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="font-semibold mb-1">Edit Data Pemeriksaan</div>
        <div className="mb-3">
          <StatusBadge status={form.status || "Menunggu Pemeriksaan"} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <LabeledInput label="Tanggal" type="date" value={form.tanggal} onChange={(v) => update("tanggal", v)} />
          <div>
            <label className="text-sm block mb-1">
              No. Rekam Medis {lockedNoRm && <span style={{ color: "var(--muted)" }}>(terkunci)</span>}
            </label>
            <input
              className="input-field"
              value={form.noRm || ""}
              onChange={(e) => update("noRm", e.target.value)}
              readOnly={Boolean(lockedNoRm)}
              style={lockedNoRm ? { background: "var(--surface-hover)" } : undefined}
            />
          </div>
          <LabeledInput label="Nama" value={form.namaKaryawan} onChange={(v) => update("namaKaryawan", v)} />
          <LabeledInput label="NIK/ID" value={form.nikOrId} onChange={(v) => update("nikOrId", v)} />
          <LabeledInput label="No. WhatsApp" value={form.noWhatsapp || ""} onChange={(v) => update("noWhatsapp", v)} />
          <div>
            <label className="text-sm block mb-1">Perusahaan</label>
            <select className="input-field" value={form.perusahaanId} onChange={(e) => update("perusahaanId", e.target.value)}>
              {perusahaanList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Kantin</label>
            <select className="input-field" value={form.kantin} onChange={(e) => update("kantin", e.target.value)}>
              <option value="Mahakam">Mahakam</option>
              <option value="Belayan">Belayan</option>
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Jenis Kelamin</label>
            <select className="input-field" value={form.jenisKelamin} onChange={(e) => update("jenisKelamin", e.target.value)}>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <LabeledInput label="Usia" type="number" value={form.usia} onChange={(v) => update("usia", v)} />
          <LabeledInput label="Berat Badan" type="number" value={form.beratBadan} onChange={(v) => update("beratBadan", v)} />
          <LabeledInput label="Tinggi Badan" type="number" value={form.tinggiBadan} onChange={(v) => update("tinggiBadan", v)} />
          <LabeledInput label="%Fat" type="number" value={form.persenFat} onChange={(v) => update("persenFat", v)} />
          <LabeledInput label="Vic Fat" type="number" value={form.vicFat} onChange={(v) => update("vicFat", v)} />
          <LabeledInput label="Kalori" type="number" value={form.kalori || ""} onChange={(v) => update("kalori", v)} />
          <LabeledInput label="BMI" type="number" value={form.bmi} onChange={(v) => update("bmi", v)} />
        </div>
        <div className="mt-3">
          <label className="text-sm block mb-1">Tindak Lanjut</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.tindakLanjut || ""}
            onChange={(e) => update("tindakLanjut", e.target.value)}
          />
        </div>
        {error && (
          <div className="text-sm mt-2" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end mt-4">
          <button className="btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button className="btn-primary" disabled={saving} onClick={save}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <input className="input-field" {...props} onChange={(e) => props.onChange(e.target.value)} />
    </div>
  );
}
