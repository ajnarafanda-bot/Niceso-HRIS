import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  Monitor,
  FileText,
  UserCheck,
  ChevronDown,
  Building2,
  Clock,
  Shield,
  Briefcase,
  Users,
  MapPin,
} from 'lucide-react';
import { useHris } from '../context/HrisContext';
import { UserRole } from '../types/hris';
import { NICESO_LOGO_URL } from '../constants/assets';

interface MobileHeaderProps {
  onOpenNotifications: () => void;
  onOpenDocs: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenNotifications,
  onOpenDocs,
}) => {
  const {
    currentUser,
    switchUserByRole,
    activeBranch,
    branches,
    setActiveBranch,
    unreadNotificationCount,
    deviceMode,
    setDeviceMode,
    pendingApprovalsCount,
    setActiveTab,
  } = useHris();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badgeColor: string }> = {
    EMPLOYEE: { label: 'Karyawan / Kasir', badgeColor: 'bg-emerald-100 text-emerald-800' },
    MANAGER: { label: 'Store Manager', badgeColor: 'bg-blue-100 text-blue-800' },
    HR_ADMIN: { label: 'HR Admin', badgeColor: 'bg-purple-100 text-purple-800' },
    SUPER_ADMIN: { label: 'Super Admin', badgeColor: 'bg-rose-100 text-rose-800' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Brand & Action Bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-2">
        {/* NICESO Logo & Subtitle */}
        <div className="flex items-center gap-2.5">
          <img
            src={NICESO_LOGO_URL}
            alt="Logo Niceso"
            className="h-8 w-auto max-w-[100px] object-contain rounded-md shadow-2xs border border-slate-100"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-rose-600 tracking-tight text-sm leading-none">
                NICESO
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 leading-none">
                HRIS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              Human Resource System
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Docs / Technical Spec Button */}
          <button
            onClick={onOpenDocs}
            aria-label="Buka Dokumentasi Teknis & ERD"
            title="Dokumentasi SRS & ERD 24 Tabel"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">SRS & ERD</span>
          </button>

          {/* Device Frame Viewport Toggle */}
          <button
            onClick={() => setDeviceMode(deviceMode === 'mobile' ? 'fluid' : 'mobile')}
            aria-label={deviceMode === 'mobile' ? 'Tampilan Layar Penuh' : 'Tampilan Bingkai Smartphone'}
            title={deviceMode === 'mobile' ? 'Beralih ke Layar Lebar' : 'Beralih ke Mode HP'}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            {deviceMode === 'mobile' ? (
              <Monitor className="w-4 h-4 text-slate-600" />
            ) : (
              <Smartphone className="w-4 h-4 text-rose-600" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Pusat Notifikasi"
            className="relative p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              aria-label="Ganti Role Akun"
              className="flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-700 transition-colors"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="max-w-[75px] truncate font-semibold">
                {currentUser.fullName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Beralih Pengguna (Simulasi RBAC)
                  </p>
                  <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
                  <p className="text-[11px] text-slate-500">{roleLabels[currentUser.role].label}</p>
                </div>

                <div className="py-1">
                  {(['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] as UserRole[]).map(
                    (role) => (
                      <button
                        key={role}
                        onClick={() => {
                          switchUserByRole(role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentUser.role === role ? 'bg-rose-50 font-semibold text-rose-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{roleLabels[role].label}</span>
                        </div>
                        {currentUser.role === role && (
                          <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded">
                            Aktif
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar: Active Branch & Timezone */}
      <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 font-medium hover:text-slate-900 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-semibold text-slate-800">{activeBranch.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                Pilih Lokasi Cabang
              </div>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBranch(b);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    activeBranch.id === b.id ? 'bg-rose-50 text-rose-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] text-slate-400">{b.radiusMeters}m</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>WIB (Asia/Jakarta)</span>
        </div>
      </div>

      {/* Management Quick Strip for Manager / HR / Super Admin */}
      {(currentUser.role === 'MANAGER' ||
        currentUser.role === 'HR_ADMIN' ||
        currentUser.role === 'SUPER_ADMIN') && (
        <div className="px-4 py-1.5 bg-rose-50/70 border-t border-rose-100 flex items-center justify-between text-xs overflow-x-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="font-medium text-rose-900 truncate">
              Mode Kewenangan: <strong className="font-bold">{roleLabels[currentUser.role].label}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-2 py-0.5 bg-white border border-rose-200 rounded text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <span>Approval</span>
              {pendingApprovalsCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1 rounded-full font-bold">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {(currentUser.role === 'HR_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => setActiveTab('employees')}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                <Users className="w-3 h-3" />
                <span>Karyawan</span>
              </button>
            )}

            {(currentUser.role === 'HR_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => setActiveTab('locations')}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-rose-600" />
                <span>Titik & Radius</span>
              </button>
            )}

            {(currentUser.role === 'HR_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => setActiveTab('reports')}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Laporan
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
