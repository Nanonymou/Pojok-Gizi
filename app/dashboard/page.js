"use client";
import { useEffect, useState, useCallback } from "react";
import AppShell from "../../components/AppShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_OPTIONS = ["Baru", "Ditindaklanjuti", "Selesai"];

export default function DashboardPage() {
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [filters, setFilters] = useState({ kantin: "", perusahaanId: "", from: "", to: "" });
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/master-perusahaan")
      .then((r) => r.json())
      .then((d) => setPerusahaanList(d.items || []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.kantin) params.set("kantin", filters.kantin);
    if (filters.perusahaanId) params.set("perusahaanId", filters.perusahaanId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    const [dashRes, reqRes] = await Promise.all([
      fetch(`/api/dashboard?${params.toString()}`).then((r) => r.json()),
      fetch(`/api/request-gizi`).then((r) => r.json()),
    ]);
    setData(dashRes);
    setRequests(reqRes.items || []);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id, status) {
    await fetch(`/api/request-gizi/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          GOOD DAY, NUTRITIONIST
        </div>
        <h1 className="text-xl font-bold">Nutrition Monitoring Overview</h1>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} perusahaanList={perusahaanList} />

      {loading || !data ? (
        <div className="mt-8" style={{ color: "var(--muted)" }}>
          Memuat data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Kpi label="Total Konsultasi" value={data.kpi.total} />
            <Kpi label="Mahakam" value={data.kpi.mahakam} />
            <Kpi label="Belayan" value={data.kpi.belayan} />
            <Kpi label="Overweight + Obesitas" value={data.kpi.overweightObesitas} accent="var(--warning)" />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <ChartCard title="Jenis Kelamin" data={data.charts.jenisKelamin} />
            <ChartCard title="% Fat (Kategori Gender)" data={data.charts.fat} />
            <ChartCard title="Vic Fat" data={data.charts.vicFat} />
            <ChartCard title="BMI / Status Gizi" data={data.charts.bmi} />
          </div>
        </>
      )}

      <div id="request" className="mt-10">
        <h2 className="text-lg font-bold mb-3">Request Gizi</h2>
        {requests.length === 0 ? (
          <div className="card p-6 text-center" style={{ color: "var(--muted)" }}>
            <div className="font-semibold mb-1">NO REQUEST</div>
            Belum ada request konsultasi gizi baru.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: "var(--surface-hover)" }}>
                  <Th>Nama</Th>
                  <Th>Umur</Th>
                  <Th>Perusahaan</Th>
                  <Th>Kantin</Th>
                  <Th>Hari</Th>
                  <Th>Jam</Th>
                  <Th>No. WhatsApp</Th>
                  <Th>Keluhan</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <Td>{r.nama}</Td>
                    <Td>{r.umur}</Td>
                    <Td>{r.perusahaan?.nama}</Td>
                    <Td>{r.kantin}</Td>
                    <Td>{new Date(r.hariKonsul).toLocaleDateString("id-ID")}</Td>
                    <Td>{r.jamKonsul}</Td>
                    <Td>{r.noWhatsapp}</Td>
                    <Td className="max-w-xs truncate">{r.keluhan}</Td>
                    <Td>
                      <select
                        className="input-field text-xs py-1"
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterBar({ filters, setFilters, perusahaanList }) {
  function set(k, v) {
    setFilters((f) => ({ ...f, [k]: v }));
  }
  return (
    <div className="card p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
          Kantin
        </label>
        <select className="input-field" value={filters.kantin} onChange={(e) => set("kantin", e.target.value)}>
          <option value="">Semua</option>
          <option value="Mahakam">Mahakam</option>
          <option value="Belayan">Belayan</option>
        </select>
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
          Perusahaan
        </label>
        <select
          className="input-field"
          value={filters.perusahaanId}
          onChange={(e) => set("perusahaanId", e.target.value)}
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
          Dari Tanggal
        </label>
        <input type="date" className="input-field" value={filters.from} onChange={(e) => set("from", e.target.value)} />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: "var(--muted)" }}>
          Sampai Tanggal
        </label>
        <input type="date" className="input-field" value={filters.to} onChange={(e) => set("to", e.target.value)} />
      </div>
      <button className="btn-ghost text-sm" onClick={() => setFilters({ kantin: "", perusahaanId: "", from: "", to: "" })}>
        Reset (Bulan Berjalan)
      </button>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div className="card p-4">
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent || "var(--foreground)" }}>
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, data }) {
  const hasData = data && data.some((d) => d.Mahakam > 0 || d.Belayan > 0);
  return (
    <div className="card p-4">
      <div className="font-semibold mb-3 text-sm">{title}</div>
      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--muted)" }}>
          NO DATA AVAILABLE
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="kategori" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
            <Legend />
            <Bar dataKey="Mahakam" fill="var(--chart-mahakam)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Belayan" fill="var(--chart-belayan)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 font-semibold whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 whitespace-nowrap ${className}`}>{children}</td>;
}
