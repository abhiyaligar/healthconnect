import React, { useState, useEffect } from 'react';
import { User, Clock, Activity, AlertTriangle, CheckCircle2, TrendingUp, MoreVertical, Calendar, Coffee, Wifi, X, FileText, HeartPulse } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Appointment {
  id: string;
  patient_id: string;
  slot_id: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  queue_token: string;
  priority_score: number;
  clinical_notes?: string;
  diagnosis?: string;
  actual_start_time?: string;
  slot?: {
    start_time: string;
    end_time: string;
  };
}

interface DoctorProfile {
  full_name: string;
  specialty: string;
  patientsSeen: number;
  totalPatients: number;
  avg_consultation_time: number;
}

export default function DoctorDashboard() {
  const { name: authName } = useAuth();
  const [availabilityStatus, setAvailabilityStatus] = useState<'active' | 'break'>('active');
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({ diagnosis: '', clinical_notes: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, apptsRes] = await Promise.all([
          api.get('/doctors/me'),
          api.get('/appointments/doctor/me')
        ]);
        setProfile(profileRes.data);
        setAppointments(apptsRes.data);
      } catch (err) {
        console.error('Failed to fetch doctor data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartConsultation = async (apptId: string) => {
    try {
      const res = await api.patch(`/appointments/${apptId}/call`);
      setAppointments(prev => prev.map(a => a.id === apptId ? res.data : a));
      setSelectedPatient(res.data);
    } catch (err) {
      alert('Failed to start consultation');
    }
  };

  const handleCompleteConsultation = async (apptId: string) => {
    try {
      const res = await api.patch(`/appointments/${apptId}/complete`);
      setAppointments(prev => prev.map(a => a.id === apptId ? res.data : a));
      setSelectedPatient(null);
    } catch (err) {
      alert('Failed to complete consultation');
    }
  };

  const handleUpdateNotes = async (apptId: string) => {
    try {
      const res = await api.patch(`/appointments/${apptId}/clinical-notes`, notes);
      setAppointments(prev => prev.map(a => a.id === apptId ? res.data : a));
      alert('Notes updated successfully');
    } catch (err) {
      alert('Failed to update notes');
    }
  };

  const toggleAvailability = () => {
    setAvailabilityStatus(s => s === 'active' ? 'break' : 'active');
  };

  const getPriorityColor = (score: number) => {
    if (score >= 10) return 'bg-status-error/10 text-status-error border-status-error/20';
    if (score >= 5) return 'bg-status-warning/10 text-status-warning border-status-warning/20';
    return 'bg-navy-50 text-navy-500 border-navy-100';
  };

  const getStatusIndicator = (s: string) => {
    switch (s) {
      case 'COMPLETED': return <CheckCircle2 size={18} className="text-status-open" />;
      case 'IN_PROGRESS': return <Activity size={18} className="text-primary-500 animate-pulse" />;
      default: return <Clock size={18} className="text-navy-300" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-sans tracking-tight">{profile?.full_name || authName}</h1>
          <p className="text-navy-500 flex items-center gap-2 mt-1">
            <User size={16} /> {profile?.specialty} | <Calendar size={16} className="ml-2" /> Today's Shift
          </p>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <button
            onClick={toggleAvailability}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
              availabilityStatus === 'active'
                ? 'border-status-open text-status-open hover:bg-status-open hover:text-white'
                : 'border-status-warning text-status-warning hover:bg-status-warning hover:text-white bg-status-warning/10'
            )}
          >
            {availabilityStatus === 'active' ? <><Wifi size={16} /> Go Offline</> : <><Coffee size={16} /> Go Online</>}
          </button>

          <div className="bg-surface p-4 rounded-xl shadow-skyline border border-navy-100 flex flex-col min-w-[140px]">
            <span className="text-navy-500 text-sm font-medium">Patients Seen</span>
            <span className="text-2xl font-bold text-primary-600">{completedCount} <span className="text-sm font-normal text-navy-400">/ {appointments.length}</span></span>
          </div>
          <div className="bg-surface p-4 rounded-xl shadow-skyline border border-navy-100 flex flex-col min-w-[140px]">
            <span className="text-navy-500 text-sm font-medium">Avg Time</span>
            <span className="text-2xl font-bold text-status-open">{profile?.avg_consultation_time}m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Today's Schedule</h2>
          </div>
          
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
            <div className="p-0">
              {appointments.length === 0 ? (
                <div className="p-10 text-center text-navy-400">No appointments scheduled today.</div>
              ) : appointments.map(appt => (
                <div 
                  key={appt.id} 
                  onClick={() => {
                    setSelectedPatient(appt);
                    setNotes({ diagnosis: appt.diagnosis || '', clinical_notes: appt.clinical_notes || '' });
                  }}
                  className={cn(
                    "flex items-center justify-between p-5 border-b border-navy-100 last:border-0 hover:bg-navy-50 transition-colors cursor-pointer",
                    appt.status === 'IN_PROGRESS' && "bg-primary-50/50"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-16">
                      <span className="text-sm font-bold text-navy-900">{appt.slot ? new Date(appt.slot.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-navy-900">{appt.queue_token}</span>
                      <span className="text-sm text-navy-500">Patient ID: {appt.patient_id.split('-')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold border items-center gap-1.5", getPriorityColor(appt.priority_score))}>
                      Priority: {appt.priority_score}
                    </span>
                    
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-navy-100 shadow-sm shrink-0">
                      {getStatusIndicator(appt.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fatigue & Workload */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-900">System Insights</h2>
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-navy-900 font-semibold">Load Profile</h3>
              <span className="text-xs font-bold text-status-open bg-status-open/10 px-2 py-1 rounded-md">STABLE</span>
            </div>
            <p className="text-sm text-navy-500 leading-relaxed">
              Your average consultation time is currently **{profile?.avg_consultation_time} minutes**. The scheduling engine is automatically adjusting your slot durations to prevent overruns.
            </p>
          </div>
        </div>

      </div>

      {/* Patient Details Side Panel */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setSelectedPatient(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-8 border-b border-navy-100 flex items-center justify-between bg-navy-50">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Consultation</h2>
                <p className="text-sm text-navy-500">{selectedPatient.queue_token} · {selectedPatient.status}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-navy-100 rounded-xl text-navy-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-6">
              {selectedPatient.status === 'IN_PROGRESS' || selectedPatient.status === 'COMPLETED' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-navy-900 mb-2">Diagnosis</label>
                    <input 
                      type="text" 
                      value={notes.diagnosis}
                      onChange={(e) => setNotes(n => ({...n, diagnosis: e.target.value}))}
                      className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm"
                      placeholder="Enter diagnosis..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-navy-900 mb-2">Clinical Notes</label>
                    <textarea 
                      rows={5}
                      value={notes.clinical_notes}
                      onChange={(e) => setNotes(n => ({...n, clinical_notes: e.target.value}))}
                      className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm"
                      placeholder="Detailed consultation notes..."
                    />
                  </div>
                  <button 
                    onClick={() => handleUpdateNotes(selectedPatient.id)}
                    className="w-full py-2 bg-navy-100 text-navy-700 font-bold rounded-lg hover:bg-navy-200"
                  >
                    Save Notes
                  </button>
                </div>
              ) : (
                <div className="p-10 text-center text-navy-400">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Start the consultation to enter notes.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-navy-100 bg-white space-y-3">
              {selectedPatient.status === 'CONFIRMED' && (
                <button 
                  onClick={() => handleStartConsultation(selectedPatient.id)}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Activity size={18} /> Start Consultation
                </button>
              )}
              {selectedPatient.status === 'IN_PROGRESS' && (
                <button 
                  onClick={() => handleCompleteConsultation(selectedPatient.id)}
                  className="w-full py-3.5 bg-status-open hover:bg-status-open/90 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Complete & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
