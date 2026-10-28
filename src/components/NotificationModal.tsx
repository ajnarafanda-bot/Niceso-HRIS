import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  CalendarDays,
  FileCheck2,
  Info,
  X,
  Check,
} from 'lucide-react';
import { useHris } from '../context/HrisContext';
import { NotificationItem } from '../types/hris';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
  } = useHris();

  if (!isOpen) return null;

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser.id || currentUser.role === 'SUPER_ADMIN'
  );

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.linkTab) {
      setActiveTab(item.linkTab as any);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl relative animate-in fade-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pusat Notifikasi Niceso
              </h3>
              <p className="text-[11px] text-slate-500">
                Pengingat presensi, status pengajuan, dan informasi toko
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="py-2 flex items-center justify-between text-xs border-b border-slate-100 shrink-0">
          <span className="text-slate-500 font-medium">
            {userNotifications.filter((n) => !n.isRead).length} Belum Dibaca
          </span>
          <button
            onClick={markAllNotificationsAsRead}
            className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tandai Semua Sudah Dibaca</span>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 my-2 -mx-2 px-2">
          {userNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada notifikasi baru untuk Anda.
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                  notif.isRead
                    ? 'hover:bg-slate-50 text-slate-700'
                    : 'bg-rose-50/50 hover:bg-rose-50 text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold">{notif.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {notif.createdAt}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 shrink-0 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
