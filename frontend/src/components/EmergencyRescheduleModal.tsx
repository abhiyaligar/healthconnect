import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, ArrowRight, User, Loader2, CheckCircle2, X } from 'lucide-react';
import api from '../api';

interface Props {
  sourceDoctorId: string;
  sourceDoctorName: string;
  onClose: () => void;
}

export default function EmergencyRescheduleModal({ sourceDoctorId, sourceDoctorName, onClose }: Props) {
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    };
    fetchDoctors();
  }, []);

  const fetchPreview = async () => {
    if (!targetDate) return;
    setLoadingPreview(true);
    try {
      const res = await api.get('/emergency/preview', {
        params: {
          source_doctor_id: sourceDoctorId,
          source_date: new Date().toISOString().split('T')[0],
          target_doctor_id: targetDoctorId || sourceDoctorId,
          target_date: targetDate
        }
      });
      setPreview(res.data);
    } catch (err) {
      alert('Failed to fetch preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await api.post('/emergency/execute', {
        source_doctor_id: sourceDoctorId,
        source_date: new Date().toISOString().split('T')[0],
        target_doctor_id: targetDoctorId || sourceDoctorId,
        target_date: targetDate
      });
      alert('Bulk rescheduling complete!');
      onClose();
    } catch (err) {
      alert('Failed to execute bulk rescheduling');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-8 bg-status-error text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Doctor Emergency Mode</h2>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Mass Rescheduling Tool</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Source Doctor</label>
              <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100 font-bold text-navy-900">
                {sourceDoctorName}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Target Doctor (Optional)</label>
              <select 
                value={targetDoctorId}
                onChange={(e) => setTargetDoctorId(e.target.value)}
                className="w-full p-4 bg-white border border-navy-100 rounded-2xl font-bold text-navy-900 focus:ring-2 focus:ring-status-error focus:outline-none"
              >
                <option value="">Move to same doctor (different day)</option>
                {doctors.filter(d => d.custom_id !== sourceDoctorId).map(d => (
                  <option key={d.custom_id} value={d.custom_id}>{d.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-navy-400 uppercase tracking-widest">Target Date</label>
            <div className="flex gap-4">
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="flex-1 p-4 bg-white border border-navy-100 rounded-2xl font-bold text-navy-900 focus:ring-2 focus:ring-status-error focus:outline-none"
              />
              <button 
                onClick={fetchPreview}
                className="px-6 bg-navy-900 text-white font-bold rounded-2xl hover:bg-navy-800 transition-colors"
              >
                Preview Impact
              </button>
            </div>
          </div>

          {loadingPreview && (
            <div className="py-12 flex flex-col items-center gap-4 text-navy-400">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Calculating Priority Mapping...</p>
            </div>
          )}

          {preview && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100 text-center">
                  <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Affected</p>
                  <p className="text-2xl font-black text-navy-900">{preview.source_count}</p>
                </div>
                <div className="p-4 bg-status-open/10 rounded-2xl border border-status-open/20 text-center">
                  <p className="text-[10px] font-bold text-status-open uppercase mb-1">Allocated</p>
                  <p className="text-2xl font-black text-status-open">{preview.allocated_count}</p>
                </div>
                <div className="p-4 bg-status-error/10 rounded-2xl border border-status-error/20 text-center">
                  <p className="text-[10px] font-bold text-status-error uppercase mb-1">Overflow</p>
                  <p className="text-2xl font-black text-status-error">{preview.overflow_count}</p>
                </div>
              </div>

              <div className="max-h-48 overflow-auto rounded-2xl border border-navy-50 bg-navy-50/30 p-2 space-y-1">
                {preview.mapping.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-navy-50 shadow-sm text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${m.priority > 50 ? 'bg-status-error' : 'bg-primary-500'}`} />
                      <span className="font-bold text-navy-900">Patient {m.patient_id.split('-')[0]}</span>
                    </div>
                    {m.status === 'ALLOCATED' ? (
                      <div className="flex items-center gap-2 text-navy-400">
                        <span>{new Date(m.original_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <ArrowRight size={12} />
                        <span className="font-black text-status-open">{new Date(m.suggested_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <span className="font-black text-status-error uppercase">Needs Manual Re-booking</span>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={handleExecute}
                disabled={executing || preview.allocated_count === 0}
                className="w-full py-5 bg-status-error hover:bg-red-700 text-white font-black rounded-[24px] shadow-xl shadow-status-error/20 transition-all flex items-center justify-center gap-2 text-lg"
              >
                {executing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> Execute Bulk Rescheduling</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
