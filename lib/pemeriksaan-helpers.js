const {
  kategoriFatGender,
  keteranganFat,
  keteranganVicFat,
  keteranganBmi,
  validatePositive,
  KANTIN_OPTIONS,
} = require("./calculations");

function buildPemeriksaanData(body) {
  const {
    tanggal,
    noRm,
    namaKaryawan,
    nikOrId,
    perusahaanId,
    kantin,
    jenisKelamin,
    usia,
    beratBadan,
    tinggiBadan,
    persenFat,
    vicFat,
    kalori,
    bmi,
    tindakLanjut,
  } = body;

  if (!tanggal) throw new Error("Tanggal wajib diisi");
  if (!noRm) throw new Error("No. RM wajib diisi");
  if (!namaKaryawan) throw new Error("Nama Karyawan wajib diisi");
  if (!nikOrId) throw new Error("ID/NIK wajib diisi");
  if (!perusahaanId) throw new Error("Perusahaan wajib dipilih");
  if (!KANTIN_OPTIONS.includes(kantin)) throw new Error("Kantin harus Mahakam atau Belayan");
  if (!["L", "P"].includes(jenisKelamin)) throw new Error("Jenis Kelamin harus L atau P");

  // Auto-calc SELALU dihitung ulang di sini (server), tidak percaya nilai dari client.
  validatePositive(persenFat, "%Fat");
  validatePositive(vicFat, "Vic Fat");
  if (!bmi || Number(bmi) <= 0) throw new Error("BMI harus lebih besar dari 0");

  return {
    tanggal: new Date(tanggal),
    noRm,
    namaKaryawan,
    nikOrId,
    perusahaanId,
    kantin,
    jenisKelamin,
    usia: Number(usia) || 0,
    beratBadan: Number(beratBadan) || 0,
    tinggiBadan: Number(tinggiBadan) || 0,
    persenFat: Number(persenFat),
    kategoriFatGender: kategoriFatGender(persenFat, jenisKelamin),
    keteranganFat: keteranganFat(persenFat),
    vicFat: Number(vicFat),
    keteranganVicFat: keteranganVicFat(vicFat),
    kalori: kalori ? Number(kalori) : null,
    bmi: Number(bmi),
    keteranganBmi: keteranganBmi(bmi),
    tindakLanjut: tindakLanjut || null,
  };
}

module.exports = { buildPemeriksaanData };
