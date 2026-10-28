import React, { useState } from 'react';
import {
  FileText,
  Database,
  Cpu,
  Layers,
  Server,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  X,
  Code2,
  BookOpen,
} from 'lucide-react';
import { NICESO_LOGO_URL } from '../constants/assets';

interface TechnicalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalDocsModal: React.FC<TechnicalDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'srs' | 'erd' | 'architecture' | 'deployment'>('srs');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={NICESO_LOGO_URL}
              alt="Logo Niceso"
              className="h-9 w-auto object-contain rounded-md bg-white p-0.5"
            />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Dokumentasi Teknis NICESO HRIS
              </h2>
              <p className="text-xs text-slate-400">
                SRS, Arsitektur Sistem, ERD 24 Tabel, API Spec, dan Panduan Deployment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-6 shrink-0 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveDocTab('srs')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeDocTab === 'srs'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Software Requirements Specification (SRS)</span>
          </button>

          <button
            onClick={() => setActiveDocTab('erd')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeDocTab === 'erd'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Diagram ERD & Schema (24 Tabel)</span>
          </button>

          <button
            onClick={() => setActiveDocTab('architecture')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeDocTab === 'architecture'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. Arsitektur & REST API Spec</span>
          </button>

          <button
            onClick={() => setActiveDocTab('deployment')}
            className={`py-3 px-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeDocTab === 'deployment'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>4. Panduan Deployment Mobile & Server</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs leading-relaxed space-y-6">
          {/* TAB 1: SRS */}
          {activeDocTab === 'srs' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  1. Gambaran Umum & Tujuan Sistem (SRS)
                </h3>
                <p>
                  <strong>NICESO HRIS</strong> adalah Human Resource Information System terpadu yang dirancang untuk mendukung operasional retail jaringan toko Niceso di seluruh Indonesia. Sistem ini mencakup presensi berbasis GPS Geofencing dan verifikasi swafoto, manajemen cuti terintegrasi transaksi saldo, pengajuan dan realisasi lembur, jadwal shift fleksibel, dan persetujuan bertingkat (multi-level approvals).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Matriks Role-Based Access Control (RBAC):</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-200/80 font-bold">
                      <tr>
                        <th className="p-2 border-r">Fungsi / Modul</th>
                        <th className="p-2 border-r text-center">Employee</th>
                        <th className="p-2 border-r text-center">Manager</th>
                        <th className="p-2 border-r text-center">HR Admin</th>
                        <th className="p-2 text-center">Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-r font-medium">Check-in & Check-out Mobile</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓ (Diri sendiri)</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓ (Diri sendiri)</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-medium">Pengajuan Cuti & Lembur</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-medium">Approval Persetujuan Staf</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓ (Tim Cabang)</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓ (All Level)</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-medium">Kelola Data Karyawan (CRUD)</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">✓</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-medium">Ekspor Laporan & Rekapitulasi</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 border-r text-center text-blue-700 font-bold">✓ (Tim Cabang)</td>
                        <td className="p-2 border-r text-center text-emerald-700 font-bold">✓ (Nasional)</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">✓ (Nasional)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-medium">Audit Log & Konfigurasi Master</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 border-r text-center text-slate-400">-</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">✓ (Full Access)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Ketentuan Bisnis Penting:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Zona Waktu Default:</strong> Asia/Jakarta (WIB), mendukung Asia/Makassar (WITA) dan Jayapura (WIT) jika ada ekspansi cabang.</li>
                  <li><strong>Toleransi Keterlambatan:</strong> Konfigurable per shift kerja (Standar Reguler: 15 menit, Shift Toko: 10 menit).</li>
                  <li><strong>Perhitungan Saldo Cuti:</strong> Menggunakan double-entry ledger (Tabel <code>leave_transactions</code>) untuk mencegah pengurangan ganda saat transaksi konkuren.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ERD & 24 Tables */}
          {activeDocTab === 'erd' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  2. Relational Database Schema (24 Tabel Lengkap Sesuai Spesifikasi)
                </h3>
                <p>
                  Database PostgreSQL dirancang ternormalisasi (3NF) dengan foreign key constraints, cascading rules terisolasi, indexes pada kolom pencarian berkala, dan server timestamps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <h4 className="font-bold text-rose-700">1-6. Entitas Akun & Organisasi</h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                    <li><code>users</code> (id, nik, email, password_hash, role, is_active, created_at)</li>
                    <li><code>employees</code> (id, user_id, nik, full_name, phone, dept_id, branch_id, hire_date, employment_type, status)</li>
                    <li><code>departments</code> (id, name, code, manager_id)</li>
                    <li><code>positions</code> (id, title, code, department_id, level)</li>
                    <li><code>branches</code> (id, name, code, latitude, longitude, radius_meters, address, city, timezone, is_active, type, description)</li>
                    <li><code>roles</code> (id, code, name, description)</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <h4 className="font-bold text-rose-700">7-11. Hak Akses & Jadwal Kerja</h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                    <li><code>permissions</code> (id, code, module, action)</li>
                    <li><code>user_roles</code> (user_id, role_id)</li>
                    <li><code>work_schedules</code> (id, name, code, start_time, end_time, tolerance_min, break_min)</li>
                    <li><code>employee_schedules</code> (id, employee_id, schedule_id, effective_date)</li>
                    <li><code>holidays</code> (id, date, name, is_national)</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <h4 className="font-bold text-rose-700">12-16. Absensi & Manajemen Cuti</h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                    <li><code>attendance_records</code> (id, emp_id, date, in_time, out_time, in_lat, in_lng, status, late_min, duration_min)</li>
                    <li><code>attendance_corrections</code> (id, emp_id, date, proposed_in, proposed_out, reason, status)</li>
                    <li><code>leave_types</code> (id, name, code, default_quota, deducts_annual, requires_attachment)</li>
                    <li><code>leave_balances</code> (id, emp_id, leave_type_id, year, total_quota, used_quota, remaining)</li>
                    <li><code>leave_transactions</code> (id, emp_id, type_id, txn_type, amount, balance_after, ref_id)</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <h4 className="font-bold text-rose-700">17-24. Lembur, Approval, Notifikasi & Audit</h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                    <li><code>leave_requests</code> (id, emp_id, type_id, start_date, end_date, total_days, reason, status)</li>
                    <li><code>overtime_requests</code> (id, emp_id, date, planned_in, planned_out, duration, reason, status)</li>
                    <li><code>overtime_realizations</code> (id, ot_request_id, actual_in, actual_out, duration, notes)</li>
                    <li><code>approval_records</code> (id, ref_type, ref_id, approver_id, action, notes, decided_at)</li>
                    <li><code>notifications</code> (id, user_id, title, message, type, is_read, created_at)</li>
                    <li><code>announcements</code> (id, title, content, author_id, priority, created_at)</li>
                    <li><code>attachments</code> (id, entity_type, entity_id, file_url, file_size, mime_type)</li>
                    <li><code>audit_logs</code> (id, user_id, action, module, details, ip_address, created_at)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Clean Architecture & API Spec */}
          {activeDocTab === 'architecture' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  3. Clean Architecture & RESTful API Specifications
                </h3>
                <p>
                  Aplikasi menerapkan arsitektur 4-lapisan: <em>Domain Layer (Pure Business Rules)</em>, <em>Use Cases / Application Layer</em>, <em>Repository & Data Layer</em>, dan <em>Presentation / UI Mobile Layer</em>.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
                <p className="text-rose-400 font-bold">// Endpoint Autentikasi & Sesi</p>
                <p>POST   /api/v1/auth/login                  {"-->"} 200 OK (JWT Access & Refresh Token)</p>
                <p>POST   /api/v1/auth/refresh                {"-->"} 200 OK (Rotated Access Token)</p>
                <p>POST   /api/v1/auth/change-password        {"-->"} 200 OK</p>
                <p className="text-rose-400 font-bold mt-2">// Endpoint Absensi Presisi</p>
                <p>POST   /api/v1/attendance/check-in         {"-->"} 201 Created (Validates geofence & server time)</p>
                <p>POST   /api/v1/attendance/check-out        {"-->"} 200 OK (Calculates net duration)</p>
                <p>GET    /api/v1/attendance/today            {"-->"} 200 OK (Current employee status)</p>
                <p>GET    /api/v1/attendance/history          {"-->"} 200 OK (Paginated records with month filter)</p>
                <p className="text-rose-400 font-bold mt-2">// Endpoint Pengajuan & Cuti</p>
                <p>POST   /api/v1/leaves/request              {"-->"} 201 Created (Atomically validates balance)</p>
                <p>POST   /api/v1/overtime/request            {"-->"} 201 Created</p>
                <p>POST   /api/v1/corrections/request         {"-->"} 201 Created</p>
                <p className="text-rose-400 font-bold mt-2">// Endpoint Persetujuan (Manager/HR)</p>
                <p>GET    /api/v1/approvals/pending           {"-->"} 200 OK</p>
                <p>POST   /api/v1/approvals/decide            {"-->"} 200 OK (Requires action & notes)</p>
              </div>
            </div>
          )}

          {/* TAB 4: Deployment Guide */}
          {activeDocTab === 'deployment' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  4. Panduan Deployment Mobile (Flutter/React Native) & Server
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">A. Build Android APK & Google Play App Bundle (AAB):</h4>
                  <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {`# Flutter Production Build
flutter clean && flutter pub get
flutter build appbundle --release --obfuscate --split-debug-info=./build/symbols
# Output: build/app/outputs/bundle/release/app-release.aab`}
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">B. Build iOS Archive (Xcode / App Store):</h4>
                  <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {`# iOS Production Archive
cd ios && pod install
flutter build ipa --release --export-options-plist=ExportOptions.plist`}
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">C. Backend Docker & Database Migrations:</h4>
                  <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {`# Run DB Migrations
npm run db:migrate
# Docker Container
docker build -t niceso-hris-api:latest .
docker run -d -p 3000:3000 --env-file .env niceso-hris-api:latest`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Dokumentasi Resmi PT Niceso Sukses Indonesia · v2.4 Enterprise Edition
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
