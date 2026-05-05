import React, { useState } from 'react';
import { 
  Users, ShieldCheck, Settings, History, Search, 
  Filter, MoreVertical, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const mockUsers = [
  { id: 1, name: 'Dr. Sarah Smith', role: 'Doctor', email: 'sarah.smith@healthconnect.com', status: 'Active', lastActive: '2 mins ago' },
  { id: 2, name: 'Admin User', role: 'Admin', email: 'admin@healthconnect.com', status: 'Active', lastActive: 'Now' },
  { id: 3, name: 'Receptionist Jane', role: 'Receptionist', email: 'jane.desk@healthconnect.com', status: 'Active', lastActive: '15 mins ago' },
  { id: 4, name: 'Dr. David Lee', role: 'Doctor', email: 'david.lee@healthconnect.com', status: 'Inactive', lastActive: '2 days ago' },
];

const mockAuditLogs = [
  { id: 1, action: 'Conflict Resolved', user: 'System (Auto)', detail: 'Dr. Smith slot 10:30 AM overcapacity', time: '10:31 AM' },
  { id: 2, action: 'Manual Reschedule', user: 'Receptionist Jane', detail: 'Emily Davis moved to 11:15 AM', time: '10:28 AM' },
  { id: 3, action: 'Settings Updated', user: 'Admin User', detail: 'Max fatigue threshold set to 85', time: '09:15 AM' },
  { id: 4, action: 'Storm Detected', user: 'System', detail: 'High cancellation rate in Cardiology', time: '08:45 AM' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'logs'>('users');

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary-600" size={32} />
            Admin Control Center
          </h1>
          <p className="text-navy-500 mt-1">Full system management, user access control, and audit logs.</p>
        </div>
        <div className="flex bg-navy-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'users' ? "bg-white text-primary-700 shadow-sm" : "text-navy-500 hover:text-navy-700"
            )}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'settings' ? "bg-white text-primary-700 shadow-sm" : "text-navy-500 hover:text-navy-700"
            )}
          >
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'logs' ? "bg-white text-primary-700 shadow-sm" : "text-navy-500 hover:text-navy-700"
            )}
          >
            Audit Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9">
          
          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
              <div className="p-6 border-b border-navy-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 text-navy-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users by name, email or role..."
                    className="w-full pl-10 pr-4 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors">
                  Add New User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-navy-50 text-navy-500 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Last Active</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-navy-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-navy-900">{user.name}</p>
                            <p className="text-xs text-navy-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-bold",
                            user.role === 'Admin' ? "bg-primary-100 text-primary-700" :
                            user.role === 'Doctor' ? "bg-tertiary-100 text-tertiary-700" :
                            "bg-violet-100 text-violet-700"
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {user.status === 'Active' ? (
                              <CheckCircle2 size={14} className="text-status-open" />
                            ) : (
                              <XCircle size={14} className="text-navy-300" />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              user.status === 'Active' ? "text-status-open" : "text-navy-400"
                            )}>
                              {user.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-navy-500">{user.lastActive}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 hover:bg-navy-100 rounded transition-colors text-navy-400">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-2xl shadow-skyline border border-navy-100">
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-primary-600" />
                    Appointment Limits
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-navy-700 mb-1">Max Slot Capacity</label>
                      <input type="number" defaultValue={10} className="w-full p-2 border border-navy-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy-700 mb-1">Overbooking Threshold (%)</label>
                      <input type="number" defaultValue={20} className="w-full p-2 border border-navy-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-skyline border border-navy-100">
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-primary-600" />
                    Safety Thresholds
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-navy-700 mb-1">Fatigue Alert Score</label>
                      <input type="number" defaultValue={85} className="w-full p-2 border border-navy-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy-700 mb-1">Wait Time Warning (min)</label>
                      <input type="number" defaultValue={45} className="w-full p-2 border border-navy-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface p-6 rounded-2xl shadow-skyline border border-navy-100">
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-primary-600" />
                  General Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy-900 text-sm">Auto-Resolve Conflicts</p>
                      <p className="text-xs text-navy-500">System handles overbookings automatically</p>
                    </div>
                    <div className="w-12 h-6 bg-primary-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy-900 text-sm">Storm Alert Notifications</p>
                      <p className="text-xs text-navy-500">Notify all staff during cancellation surge</p>
                    </div>
                    <div className="w-12 h-6 bg-primary-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 border border-navy-200 text-navy-600 font-bold rounded-xl hover:bg-navy-50 transition-all">Discard</button>
                <button className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-sm">Save Changes</button>
              </div>
            </div>
          )}

          {/* TAB: LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
              <div className="p-6 border-b border-navy-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy-900">Audit Trail</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-navy-50 rounded-lg border border-navy-100 text-navy-400">
                    <Filter size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-0 divide-y divide-navy-100">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-navy-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                      <History size={18} className="text-navy-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-navy-900">{log.action}</p>
                        <span className="text-xs text-navy-400 font-medium">{log.time}</span>
                      </div>
                      <p className="text-sm text-navy-600 mt-0.5">{log.detail}</p>
                      <p className="text-xs text-navy-400 mt-1 flex items-center gap-1">
                        <Users size={12} /> Performed by: {log.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets (Stats) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-200">
            <p className="text-primary-100 text-sm font-bold uppercase tracking-wider mb-4">Security Overview</p>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-primary-100 text-xs">Uptime this month</p>
              </div>
              <div className="h-1 bg-primary-400/30 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-bold">48</p>
                  <p className="text-primary-100 text-[10px]">Active Sessions</p>
                </div>
                <div>
                  <p className="font-bold">0</p>
                  <p className="text-primary-100 text-[10px]">Failed Logins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-skyline border border-navy-100">
            <h4 className="text-sm font-bold text-navy-900 mb-4">Resource Allocation</h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-navy-500">
                  <span>Server CPU</span>
                  <span>12%</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-[12%]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-navy-500">
                  <span>Memory</span>
                  <span>42%</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-500 w-[42%]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-navy-500">
                  <span>DB Storage</span>
                  <span>68%</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full bg-status-warning w-[68%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
