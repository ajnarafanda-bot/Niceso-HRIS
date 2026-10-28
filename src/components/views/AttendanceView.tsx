import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Navigation,
  FileEdit,
  Info,
  Calendar,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { calculateDistanceMeters, formatDuration } from '../../utils/rules';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    currentEmployee,
    activeBranch,
    branches,
    setActiveBranch,
    activeSchedule,
    todayAttendanceRecord,
    performCheckIn,
    performCheckOut,
    setActiveTab,
  } = useHris();

  // Simulated GPS position
  // Default: exact branch location with ~15m variation (within radius)
  const [userLat, setUserLat] = useState<number>(activeBranch.latitude + 0.0001);
  const [userLng, setUserLng] = useState<number>(activeBranch.longitude + 0.0001);
  const [locationPreset, setLocationPreset] = useState<'INSIDE' | 'OUTSIDE' | 'REAL'>('INSIDE');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(15);
  const [selectedMethod, setSelectedMethod] = useState<'GPS + Swafoto' | 'Fingerprint Toko'>('GPS + Swafoto');
  const [selfieCaptured, setSelfieCaptured] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Live timer for working hours if checked in and not checked out
  const [liveDurationMinutes, setLiveDurationMinutes] = useState<number>(0);

  useEffect(() => {
    if (todayAttendanceRecord?.checkInTime && !todayAttendanceRecord?.checkOutTime) {
      const calculateCurrent = () => {
        const [inH, inM] = todayAttendanceRecord.checkInTime!.split(':').map(Number);
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const startMins = inH * 60 + inM;
        const diff = Math.max(0, currentMins - startMins - (activeSchedule.breakMinutes || 0));
        setLiveDurationMinutes(diff);
      };
      calculateCurrent();
      const interval = setInterval(calculateCurrent, 30000);
      return () => clearInterval(interval);
    }
  }, [todayAttendanceRecord, activeSchedule]);

  // Update coordinates based on preset
  useEffect(() => {
    if (locationPreset === 'INSIDE') {
      setUserLat(activeBranch.latitude + 0.0001);
      setUserLng(activeBranch.longitude + 0.0001);
      setGpsAccuracy(12);
    } else if (locationPreset === 'OUTSIDE') {
      // ~450m away
      setUserLat(activeBranch.latitude + 0.0040);
      setUserLng(activeBranch.longitude + 0.0040);
      setGpsAccuracy(20);
    }
  }, [locationPreset, activeBranch]);

  const currentDistance = calculateDistanceMeters(
    userLat,
    userLng,
    activeBranch.latitude,
    activeBranch.longitude
  );

  const isInsideGeofence = currentDistance <= activeBranch.radiusMeters && activeBranch.isActive;

  const handleUseRealGps = () => {
    if (!navigator.geolocation) {
      setActionFeedback({ type: 'error', message: 'Geolocation tidak didukung oleh browser Anda.' });
      return;
    }
    setActionFeedback(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setUserLat(lat);
        setUserLng(lng);
        setGpsAccuracy(acc);
        setLocationPreset('REAL');

        if (acc > 100) {
          setActionFeedback({
            type: 'warning',
            message: `Koordinat GPS terbaca (${lat.toFixed(4)}, ${lng.toFixed(4)}), namun akurasi sinyal rendah (±${acc}m). Pastikan GPS HP aktif pada mode Akurasi Tinggi.`,
          });
        } else {
          setActionFeedback({
            type: 'success',
            message: `Koordinat GPS asli berhasil diambil (${lat.toFixed(4)}, ${lng.toFixed(4)}) dengan akurasi tinggi (±${acc}m).`,
          });
        }
      },
      (err) => {
        setActionFeedback({
          type: 'error',
          message: `Gagal membaca GPS: ${err.message}. Pastikan izin lokasi aktif atau gunakan opsi simulasi.`,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckInSubmit = () => {
    setIsProcessing(true);
    setActionFeedback(null);

    setTimeout(() => {
      const result = performCheckIn({
        lat: userLat,
        lng: userLng,
        method: selectedMethod,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      });

      setIsProcessing(false);
      setActionFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
    }, 400);
  };

  const handleCheckOutSubmit = () => {
    setIsProcessing(true);
    setActionFeedback(null);

    setTimeout(() => {
      const result = performCheckOut({
        lat: userLat,
        lng: userLng,
      });

      setIsProcessing(false);
      setActionFeedback({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });
    }, 400);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Title & Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Presensi Masuk & Pulang
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan kehadiran digital Niceso berbasis GPS & Verifikasi Wajah
          </p>
        </div>
        <button
          onClick={() => setActiveTab('pengajuan')}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Koreksi Absensi</span>
        </button>
      </div>

      {/* Feedback banner */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-medium">{actionFeedback.message}</span>
        </div>
      )}

      {/* Geofence & Location Radar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Validasi Geofence Cabang
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN') && (
              <button
                type="button"
                onClick={() => setActiveTab('locations')}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors"
              >
                ⚙️ Kelola Radius & Lokasi
              </button>
            )}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                !activeBranch.isActive
                  ? 'bg-slate-200 text-slate-700'
                  : isInsideGeofence
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {!activeBranch.isActive
                ? 'Lokasi Nonaktif'
                : isInsideGeofence
                ? 'Dalam Radius (Valid)'
                : 'Di Luar Radius (Tidak Sah)'}
            </span>
          </div>
        </div>

        {/* Warning if branch is disabled */}
        {!activeBranch.isActive && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Peringatan Lokasi Nonaktif:</strong> Titik lokasi kerja{' '}
              <strong>{activeBranch.name}</strong> saat ini berstatus Nonaktif di sistem HR.
              Karyawan tidak dapat melakukan presensi di lokasi nonaktif sampai diaktifkan kembali
              oleh HR Admin.
            </div>
          </div>
        )}

        {/* Branch Selection Dropdown for Multi-store rotation */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <label className="text-[11px] font-semibold text-slate-500 shrink-0">
            Pilih Lokasi Kerja:
          </label>
          <select
            value={activeBranch.id}
            onChange={(e) => {
              const b = branches.find((branch) => branch.id === e.target.value);
              if (b) setActiveBranch(b);
            }}
            className="w-full max-w-xs px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-rose-600"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.radiusMeters}m) {!b.isActive ? '[Nonaktif]' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Branch vs User Distance indicator */}
        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800">{activeBranch.name}</p>
              {!activeBranch.isActive && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                  Nonaktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{activeBranch.address}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Batas Radius: <strong className="text-slate-700">{activeBranch.radiusMeters} meter</strong>
              {gpsAccuracy !== null && ` · Akurasi GPS: ±${gpsAccuracy}m`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Jarak Anda Saat Ini</p>
            <p
              className={`text-xl font-extrabold ${
                !activeBranch.isActive
                  ? 'text-slate-500'
                  : isInsideGeofence
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {currentDistance} <span className="text-xs font-medium text-slate-500">meter</span>
            </p>
            {activeBranch.isActive && (
              <p className="text-[10px] text-slate-400">
                {currentDistance <= activeBranch.radiusMeters
                  ? `Sisa toleransi: ${activeBranch.radiusMeters - currentDistance}m`
                  : `Melebihi: ${currentDistance - activeBranch.radiusMeters}m`}
              </p>
            )}
          </div>
        </div>

        {/* GPS Testing Simulator Buttons */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
            Simulasi Posisi GPS (Untuk Pengujian):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLocationPreset('INSIDE')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                locationPreset === 'INSIDE'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✓ Di Toko (15m)
            </button>
            <button
              type="button"
              onClick={() => setLocationPreset('OUTSIDE')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                locationPreset === 'OUTSIDE'
                  ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ✗ Di Luar (450m)
            </button>
            <button
              type="button"
              onClick={handleUseRealGps}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                locationPreset === 'REAL'
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              GPS Asli HP
            </button>
          </div>
        </div>
      </div>

      {/* Method & Selfie Verification */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Metode Verifikasi Presensi
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedMethod('GPS + Swafoto')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              selectedMethod === 'GPS + Swafoto'
                ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-4 h-4 text-rose-600" />
              <span className="text-xs">GPS + Swafoto</span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal">Kamera HP & Deteksi Wajah</p>
          </button>

          <button
            onClick={() => setSelectedMethod('Fingerprint Toko')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              selectedMethod === 'Fingerprint Toko'
                ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span className="text-xs">Fingerprint Toko</span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal">Mesin Biometrik Kasir</p>
          </button>
        </div>

        {selectedMethod === 'GPS + Swafoto' && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden relative border border-slate-300 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
                alt="Swafoto Pegawai"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] text-center font-bold">
                Wajah Valid
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Verifikasi Wajah Siap</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pastikan pencahayaan cukup dan seragam Niceso terlihat jelas.
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                ✓ Liveness Detection Aktif
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Eksekusi Presensi Hari Ini ({todayAttendanceRecord?.date || '27-10-2026'})
        </h3>

        {/* State: Not yet checked in */}
        {!todayAttendanceRecord?.checkInTime && (
          <div>
            <button
              onClick={handleCheckInSubmit}
              disabled={isProcessing || !activeBranch.isActive || !isInsideGeofence}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                !activeBranch.isActive
                  ? 'bg-slate-400 cursor-not-allowed opacity-75'
                  : isInsideGeofence
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99]'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Presensi Server...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>
                    {!activeBranch.isActive
                      ? 'Lokasi Nonaktif (Presensi Dinonaktifkan)'
                      : isInsideGeofence
                      ? 'Lakukan Check-in Masuk Sekarang'
                      : 'Mendekat ke Area Toko untuk Check-in'}
                  </span>
                </>
              )}
            </button>
            {!activeBranch.isActive ? (
              <p className="text-[11px] text-amber-700 text-center mt-2 font-medium">
                Lokasi <strong>{activeBranch.name}</strong> sedang dinonaktifkan. Anda tidak dapat melakukan presensi di lokasi ini.
              </p>
            ) : !isInsideGeofence ? (
              <p className="text-[11px] text-rose-600 text-center mt-2 font-medium">
                Sistem mendeteksi Anda berada di luar radius toko ({currentDistance}m dari pusat gerai). Gunakan tombol simulasi "Di Toko (15m)" di atas untuk mencoba.
              </p>
            ) : null}
          </div>
        )}

        {/* State: Checked in, waiting for check out */}
        {todayAttendanceRecord?.checkInTime && !todayAttendanceRecord?.checkOutTime && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Anda Sudah Check-in ({todayAttendanceRecord.checkInTime} WIB)
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Status:{' '}
                  <strong className="font-semibold">{todayAttendanceRecord.status}</strong>
                  {todayAttendanceRecord.lateMinutes > 0 &&
                    ` (Terlambat ${todayAttendanceRecord.lateMinutes}m)`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Durasi Berjalan
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {formatDuration(liveDurationMinutes || 480)}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckOutSubmit}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Check-out...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Lakukan Check-out Pulang</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* State: Checked in & Checked out */}
        {todayAttendanceRecord?.checkInTime && todayAttendanceRecord?.checkOutTime && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Presensi Hari Ini Telah Selesai
            </h4>
            <p className="text-xs text-slate-600">
              Masuk: <strong className="text-slate-900">{todayAttendanceRecord.checkInTime} WIB</strong> · Pulang:{' '}
              <strong className="text-slate-900">{todayAttendanceRecord.checkOutTime} WIB</strong>
            </p>
            <p className="text-xs text-emerald-700 font-semibold">
              Total Kerja: {Math.floor(todayAttendanceRecord.workDurationMinutes / 60)} jam{' '}
              {todayAttendanceRecord.workDurationMinutes % 60} menit
            </p>
          </div>
        )}
      </div>

      {/* Work schedule reminder */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Peraturan Absensi Niceso:</strong> Batas keterlambatan adalah{' '}
          {activeSchedule.toleranceMinutes} menit setelah jam masuk (
          {activeSchedule.startTime} WIB). Keterlambatan di atas toleransi akan tercatat otomatis
          dalam rekapitulasi HR bulanan.
        </div>
      </div>
    </div>
  );
};
