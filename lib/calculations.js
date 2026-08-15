// Semua boundary di bawah ini WAJIB sama dengan PRD. Jangan diubah tanpa
// mengubah dokumen 01-form-input-pemeriksaan-gizi.md terlebih dahulu.

function kategoriFatGender(persenFat, jenisKelamin) {
  const f = Number(persenFat);
  if (jenisKelamin === "L") {
    if (f < 6) return "Esensial";
    if (f < 14) return "Atlet";
    if (f < 18) return "Kebugaran";
    if (f < 25) return "Rata-rata";
    return "Obesitas";
  }
  // Perempuan
  if (f < 14) return "Esensial";
  if (f < 21) return "Atlet";
  if (f < 25) return "Kebugaran";
  if (f < 32) return "Rata-rata";
  return "Obesitas";
}

function keteranganFat(persenFat) {
  const f = Number(persenFat);
  if (f >= 1 && f < 13) return "Normal";
  if (f >= 13 && f < 15) return "Sedang";
  if (f >= 15 && f <= 20) return "Tinggi";
  if (f > 20) return "Obesitas";
  return "Tidak Valid";
}

function keteranganVicFat(vicFat) {
  const v = Number(vicFat);
  if (v >= 1 && v < 13) return "Normal";
  if (v >= 13 && v < 15) return "Sedang";
  if (v >= 15 && v <= 20) return "Tinggi";
  if (v > 20) return "Obesitas";
  return "Tidak Valid";
}

function keteranganBmi(bmi) {
  const b = Number(bmi);
  if (b < 18.5) return "Underweight";
  if (b < 25) return "Normal";
  if (b < 30) return "Overweight";
  if (b < 35) return "Obesitas 1";
  if (b < 40) return "Obesitas 2";
  return "Obesitas 3"; // b >= 40, termasuk tepat 40.0
}

function validatePositive(value, label) {
  if (value === undefined || value === null || Number(value) <= 0) {
    throw new Error(`${label} harus lebih besar dari 0`);
  }
}

const KANTIN_OPTIONS = ["Mahakam", "Belayan"];
const REQUEST_STATUS_OPTIONS = ["Baru", "Ditindaklanjuti", "Selesai"];
const PEMERIKSAAN_STATUS_OPTIONS = ["Menunggu Pemeriksaan", "Selesai Pemeriksaan"];

// Hari konsul dikunci per kantin: Mahakam hanya hari Minggu, Belayan hanya
// hari Senin. Jangan diubah tanpa mengubah dokumen PRD terkait terlebih dahulu.
const KANTIN_HARI = {
  Mahakam: { label: "Minggu", dayOfWeek: 0 },
  Belayan: { label: "Senin", dayOfWeek: 1 },
};

function getHariForKantin(kantin) {
  return KANTIN_HARI[kantin] || null;
}

// Menghitung tanggal terdekat (hari ini atau ke depan) yang jatuh pada
// dayOfWeek yang diminta (0 = Minggu ... 6 = Sabtu).
function nextDateForDayOfWeek(dayOfWeek, from = new Date()) {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diff = (dayOfWeek - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  return base;
}

function nextDateForKantin(kantin, from = new Date()) {
  const hari = getHariForKantin(kantin);
  if (!hari) return null;
  return nextDateForDayOfWeek(hari.dayOfWeek, from);
}

function isJamKonsulValid(jam) {
  // jam format "HH:MM"
  if (!/^\d{2}:\d{2}$/.test(jam)) return false;
  const [h, m] = jam.split(":").map(Number);
  const minutes = h * 60 + m;
  return minutes >= 18 * 60 + 30 && minutes <= 20 * 60;
}

// Nomor WhatsApp Indonesia: boleh diawali 08, +62, atau 62, diikuti 8-13 digit
// lagi (total 9-15 digit), tanpa spasi/simbol selain "+" di depan.
function isWhatsappValid(nomor) {
  if (!nomor) return false;
  const trimmed = String(nomor).trim();
  return /^(\+?62|0)8[0-9]{7,12}$/.test(trimmed);
}

module.exports = {
  kategoriFatGender,
  keteranganFat,
  keteranganVicFat,
  keteranganBmi,
  validatePositive,
  isJamKonsulValid,
  isWhatsappValid,
  getHariForKantin,
  nextDateForDayOfWeek,
  nextDateForKantin,
  KANTIN_OPTIONS,
  REQUEST_STATUS_OPTIONS,
  PEMERIKSAAN_STATUS_OPTIONS,
  KANTIN_HARI,
};
