import React from 'react';
import {
  Home,
  Clock,
  FilePlus2,
  CalendarDays,
  User,
  CheckSquare,
  Users,
  BarChart3,
  FileCode2,
} from 'lucide-react';
import { useHris, AppTab } from '../context/HrisContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, pendingApprovalsCount } = useHris();

  const isManagement =
    currentUser.role === 'MANAGER' ||
    currentUser.role === 'HR_ADMIN' ||
    currentUser.role === 'SUPER_ADMIN';

  const navItems = [
    {
      id: 'beranda' as AppTab,
      label: 'Beranda',
      icon: Home,
    },
    {
      id: 'absensi' as AppTab,
      label: 'Absensi',
      icon: Clock,
    },
    {
      id: 'pengajuan' as AppTab,
      label: 'Pengajuan',
      icon: FilePlus2,
    },
    {
      id: 'riwayat' as AppTab,
      label: 'Riwayat',
      icon: CalendarDays,
    },
    {
      id: 'profil' as AppTab,
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Utama Aplikasi"
      className="sticky bottom-0 z-30 bg-white border-t border-slate-200 shadow-md safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-rose-600 rounded-b-full transition-all" />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.id === 'pengajuan' && isManagement && pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-rose-600 rounded-full" />
                )}
              </div>
              <span className="text-[11px] tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
