import React, { useState, useEffect } from 'react';
import { Bell, Zap, Clock, User, CheckCircle2 } from 'lucide-react';
import api from '../api';

interface Notification {
  id: string;
  patient_id: string;
  type: string;
  message: string;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/optimization/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-[24px] border border-navy-100 shadow-skyline flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-navy-50 flex items-center justify-between bg-navy-50/50">
        <h3 className="text-xs font-black text-navy-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <Bell size={16} className="text-primary-600" /> System Alerts
        </h3>
        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded">Live Log</span>
      </div>
      
      <div className="flex-1 overflow-auto divide-y divide-navy-50">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-navy-300 italic text-sm">
            No recent alerts logged.
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-4 hover:bg-navy-50/50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 uppercase">
                  {notif.type === 'COME_EARLY' ? <Zap size={12} /> : <Bell size={12} />}
                  {notif.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-medium text-navy-400">
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-navy-700 leading-relaxed">
                {notif.message}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-navy-400">
                <User size={10} /> {notif.patient_id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
