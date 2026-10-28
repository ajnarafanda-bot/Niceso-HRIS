/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HrisProvider, useHris } from './context/HrisContext';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/views/DashboardView';
import { AttendanceView } from './components/views/AttendanceView';
import { RequestView } from './components/views/RequestView';
import { HistoryView } from './components/views/HistoryView';
import { ProfileView } from './components/views/ProfileView';
import { ApprovalView } from './components/views/ApprovalView';
import { EmployeeDirectoryView } from './components/views/EmployeeDirectoryView';
import { ReportsView } from './components/views/ReportsView';
import { AuditLogView } from './components/views/AuditLogView';
import { LocationManagementView } from './components/views/LocationManagementView';
import { NotificationModal } from './components/NotificationModal';
import { TechnicalDocsModal } from './components/TechnicalDocsModal';
import { Wifi, Signal, Battery, Smartphone, Monitor } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, deviceMode, setDeviceMode } = useHris();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'beranda':
        return <DashboardView />;
      case 'absensi':
        return <AttendanceView />;
      case 'pengajuan':
        return <RequestView />;
      case 'riwayat':
        return <HistoryView />;
      case 'profil':
        return <ProfileView />;
      case 'approvals':
        return <ApprovalView />;
      case 'employees':
        return <EmployeeDirectoryView />;
      case 'locations':
        return <LocationManagementView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditLogView />;
      default:
        return <DashboardView />;
    }
  };

  // Smartphone Shell when in mobile mode
  if (deviceMode === 'mobile') {
    return (
      <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 flex flex-col items-center justify-center">
        {/* Device Mode Switcher Floating Bar */}
        <div className="mb-3 flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-700 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Simulasi Mobile App Niceso</span>
          <button
            onClick={() => setDeviceMode('fluid')}
            className="ml-2 px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] font-medium transition-colors"
          >
            Layar Penuh (Tablet/Web)
          </button>
        </div>

        {/* Smartphone Hardware Frame */}
        <div className="w-full max-w-[420px] bg-black rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 flex flex-col h-[860px] max-h-[94vh] relative overflow-hidden">
          {/* Dynamic Island / Hardware Speaker */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 ml-2" />
          </div>

          {/* Screen Display Container */}
          <div className="w-full h-full bg-[#f8fafc] rounded-[36px] overflow-hidden flex flex-col relative">
            {/* Mobile OS Status Bar */}
            <div className="h-7 bg-white text-slate-800 px-5 flex items-center justify-between text-[11px] font-bold shrink-0 select-none z-30 border-b border-slate-100">
              <span>08:30</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-slate-800" />
                <Wifi className="w-3.5 h-3.5 text-slate-800" />
                <Battery className="w-4 h-4 text-slate-800" />
              </div>
            </div>

            {/* App Header */}
            <MobileHeader
              onOpenNotifications={() => setIsNotifOpen(true)}
              onOpenDocs={() => setIsDocsOpen(true)}
            />

            {/* Main Scrollable View */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
              {renderActiveView()}
            </main>

            {/* Bottom Nav */}
            <BottomNav />

            {/* iOS Home Indicator Bar */}
            <div className="h-4 bg-white flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* Modals */}
        <NotificationModal
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
        />
        <TechnicalDocsModal
          isOpen={isDocsOpen}
          onClose={() => setIsDocsOpen(false)}
        />
      </div>
    );
  }

  // Fluid Web/Tablet View
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="w-full max-w-4xl mx-auto bg-white min-h-screen shadow-md flex flex-col">
        {/* App Header */}
        <MobileHeader
          onOpenNotifications={() => setIsNotifOpen(true)}
          onOpenDocs={() => setIsDocsOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderActiveView()}
        </main>

        {/* Bottom Nav */}
        <BottomNav />
      </div>

      {/* Modals */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
      <TechnicalDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HrisProvider>
      <AppContent />
    </HrisProvider>
  );
}
