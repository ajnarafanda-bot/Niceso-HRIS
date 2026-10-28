import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  KeyRound,
  LogOut,
  QrCode,
  Download,
  CheckCircle2,
  Lock,
  ChevronRight,
  Briefcase,
  Users,
  AlertCircle,
  X,
} from 'lucide-react';
import { useHris } from '../../context/HrisContext';
import { formatDateIndo } from '../../utils/rules';
import { NICESO_LOGO_URL } from '../../constants/assets';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    currentEmployee,
    activeBranch,
    switchUserByRole,
    deviceMode,
    setDeviceMode,
  } = useHris();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [showIdCardModal, setShowIdCardModal] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPasswordFeedback({ type: 'error', message: 'Harap isi semua kolom kata sandi.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    setPasswordFeedback({
      type: 'success',
      message: 'Kata sandi berhasil diperbarui dengan aman!',
    });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordFeedback(null);
    }, 1500);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Profil Karyawan Niceso
        </h2>
        <p className="text-xs text-slate-500">
          Informasi identitas kepegawaian resmi, penempatan kerja, dan keamanan akun
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-xl object-cover border-2 border-rose-500/20 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {currentUser.fullName}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {currentEmployee.employmentType}
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-600 mt-0.5">
              {currentEmployee.position}
            </p>
            <p className="text-[11px] text-slate-500">
              NIK: <strong className="font-mono text-slate-800">{currentEmployee.nik}</strong> · {currentEmployee.department}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cabang: {activeBranch.name}
            </p>
          </div>
        </div>

        {/* Digital ID Card Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">ID Card Digital Niceso</span>
          </div>
          <button
            onClick={() => setShowIdCardModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors border border-rose-200"
          >
            <QrCode className="w-4 h-4 text-rose-600" />
            <span>Buka ID Card & QR</span>
          </button>
        </div>
      </div>

      {/* Personal & Employment Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Detail Kepegawaian & Kontak
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Email Perusahaan</span>
            <span className="font-medium text-slate-800 break-all">{currentEmployee.email}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Nomor Telepon</span>
            <span className="font-medium text-slate-800">{currentEmployee.phone}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Atasan Langsung</span>
            <span className="font-medium text-slate-800">
              {currentEmployee.directSupervisorName || 'Store Manager Ahmad Fauzi'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Tanggal Bergabung</span>
            <span className="font-medium text-slate-800">
              {formatDateIndo(currentEmployee.hireDate)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Status Akun</span>
            <span className="font-semibold text-emerald-700">Aktif & Terverifikasi</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Sisa Cuti Tahunan</span>
            <span className="font-bold text-rose-600">
              {currentEmployee.remainingAnnualLeave} Hari Kerja
            </span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-700 mb-1">Kontak Darurat:</p>
          <p className="text-xs text-slate-600">
            {currentEmployee.emergencyContact.name} ({currentEmployee.emergencyContact.relationship}) —{' '}
            <strong className="text-slate-800">{currentEmployee.emergencyContact.phone}</strong>
          </p>
        </div>
      </div>

      {/* Security & Account Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Keamanan & Preferensi Aplikasi
        </h4>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Ubah Kata Sandi (Password)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setDeviceMode(deviceMode === 'mobile' ? 'fluid' : 'mobile')}
          className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Mode Tampilan ({deviceMode === 'mobile' ? 'Smartphone Frame' : 'Layar Penuh'})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => switchUserByRole('EMPLOYEE')}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi (Beralih Pengguna)</span>
          </button>
        </div>
      </div>

      {/* MODAL: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl relative animate-in fade-in">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordFeedback(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Perbarui Kata Sandi Akun
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gunakan kombinasi minimal 6 karakter demi keamanan akun HRIS Niceso.
            </p>

            {passwordFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs mb-3 ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {passwordFeedback.message}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                >
                  Simpan Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Digital ID Card */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full overflow-hidden shadow-2xl relative animate-in fade-in">
            {/* Header Red Banner */}
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-4 text-white text-center relative">
              <button
                onClick={() => setShowIdCardModal(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="bg-white p-1 rounded-lg inline-block mx-auto mb-1.5 shadow-xs">
                <img
                  src={NICESO_LOGO_URL}
                  alt="Logo Niceso"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <h4 className="font-extrabold tracking-wider text-sm leading-none">NICESO</h4>
              <p className="text-[10px] text-rose-100 uppercase tracking-widest font-semibold mt-0.5">
                Kartu Tanda Pengenal Resmi
              </p>
            </div>

            {/* Photo & Details */}
            <div className="p-5 text-center space-y-3">
              <div className="relative inline-block">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-rose-500/20 shadow-sm"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {currentUser.fullName}
                </h3>
                <p className="text-xs font-bold text-rose-600 mt-0.5">
                  {currentEmployee.position}
                </p>
                <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                  NIK: {currentEmployee.nik}
                </p>
                <p className="text-[11px] text-slate-500">
                  {activeBranch.name} · {currentEmployee.department}
                </p>
              </div>

              {/* QR Code Graphic Simulator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                <div className="w-28 h-28 bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-20 h-20 text-slate-800" />
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                    {currentEmployee.nik}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    alert(`ID Card digital untuk ${currentUser.fullName} telah disimpan.`);
                    setShowIdCardModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh ID Card Digital</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
