const {
  kategoriFatGender,
  keteranganFat,
  keteranganVicFat,
  keteranganBmi,
  validatePositive,
  KANTIN_OPTIONS,
} = require("./calculations");

// requireComplete = true  -> dipakai saat submit dari Form Input Pemeriksaan
//                            (tombol Edit di data konsultasi), semua field
//                            pemeriksaan wajib lengkap.
// requireComplete = false -> dipakai saat entri otomatis dibuat dari Request
//                            Gizi: baru berisi data identitas dasar, field
//                            pemeriksaan (No RM, JK, body measurement, dst)
//                            masih kosong dan diisi belakangan lewat Edit.
function buildPemeriksaanData(body, { requireComplete = true } = {}) {
  const {
    tanggal,
    noRm,
    namaKaryawan,
    nikOrId,
    perusahaanId,
    kantin,
    noWhatsapp,
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
  if (!namaKaryawan) throw new Error("Nama Karyawan wajib diisi");
  if (!nikOrId) throw new Error("ID/NIK wajib diisi");
  if (!perusahaanId) throw new Error("Perusahaan wajib dipilih");
  if (!KANTIN_OPTIONS.includes(kantin)) throw new Error("Kantin harus Mahakam atau Belayan");

  const data = {
    tanggal: new Date(tanggal),
    namaKaryawan,
    nikOrId,
    perusahaanId,
    kantin,
    noWhatsapp: noWhatsapp || null,
    usia: Number(usia) || 0,
    kalori: kalori ? Number(kalori) : null,
    tindakLanjut: tindakLanjut || null,
  };

  // No. RM: hanya divalidasi/di-set kalau memang dikirim. Pengunciannya
  // (tidak boleh diubah setelah pertama kali terdaftar untuk seorang
  // karyawan) ditegakkan di route handler yang memanggil fungsi ini.
  if (noRm !== undefined) data.noRm = noRm || null;

  const hasPemeriksaanInput =
    jenisKelamin || beratBadan || tinggiBadan || persenFat || vicFat || bmi;

  if (requireComplete || hasPemeriksaanInput) {
    if (!noRm) throw new Error("No. RM wajib diisi");
    if (!["L", "P"].includes(jenisKelamin)) throw new Error("Jenis Kelamin harus L atau P");
    if (!beratBadan || Number(beratBadan) <= 0) throw new Error("Berat Badan wajib diisi");
    if (!tinggiBadan || Number(tinggiBadan) <= 0) throw new Error("Tinggi Badan wajib diisi");
    validatePositive(persenFat, "%Fat");
    validatePositive(vicFat, "Vic Fat");
    if (!bmi || Number(bmi) <= 0) throw new Error("BMI harus lebih besar dari 0");

    Object.assign(data, {
      noRm,
      jenisKelamin,
      beratBadan: Number(beratBadan),
      tinggiBadan: Number(tinggiBadan),
      persenFat: Number(persenFat),
      kategoriFatGender: kategoriFatGender(persenFat, jenisKelamin),
      keteranganFat: keteranganFat(persenFat),
      vicFat: Number(vicFat),
      keteranganVicFat: keteranganVicFat(vicFat),
      bmi: Number(bmi),
      keteranganBmi: keteranganBmi(bmi),
      status: "Selesai Pemeriksaan",
    });
  }

  return data;
}

// Entri awal yang dibuat otomatis begitu seseorang mengisi form Request Gizi.
// Statusnya "Menunggu Pemeriksaan" sampai dilengkapi lewat tombol Edit.
function buildInitialPemeriksaanFromRequest(request) {
  return {
    tanggal: request.hariKonsul,
    namaKaryawan: request.nama,
    nikOrId: request.nikOrId,
    perusahaanId: request.perusahaanId,
    kantin: request.kantin,
    noWhatsapp: request.noWhatsapp,
    // Jenis kelamin ikut dibawa dari Request Gizi supaya nutrisionist tidak
    // perlu mengisinya lagi saat melengkapi pemeriksaan. Bisa "L" | "P" | null.
    jenisKelamin: request.jenisKelamin || null,
    usia: Number(request.umur) || 0,
    status: "Menunggu Pemeriksaan",
    requestGiziId: request.id,
  };
}

// Mencari No. RM yang sudah pernah terdaftar untuk seorang karyawan (dikaitkan
// by nama + ID/NIK, case-insensitive pada nama). Dipakai untuk mengunci field
// No. RM di form pemeriksaan supaya tidak terjadi duplikasi RM per karyawan.
async function findLockedNoRm(prisma, { namaKaryawan, nikOrId, excludeId }) {
  if (!namaKaryawan || !nikOrId) return null;
  const existing = await prisma.pemeriksaanGizi.findFirst({
    where: {
      nikOrId,
      namaKaryawan: { equals: namaKaryawan, mode: "insensitive" },
      noRm: { not: null },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return existing ? existing.noRm : null;
}

module.exports = { buildPemeriksaanData, buildInitialPemeriksaanFromRequest, findLockedNoRm };
