import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api';

interface Suggestion {
  appointment_id: string;
  patient_id: string;
  current_time: string;
  suggested_time: string;
  time_saved_mins: number;
}

interface Props {
  doctorId: string;
  onApplied: () => void;
}

export default function OptimizationPanel({ doctorId, onApplied }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/optimization/suggestions/${doctorId}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchSuggestions();
  }, [doctorId]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post('/optimization/apply', suggestions);
      setSuggestions([]);
      onApplied();
      alert('Schedule optimized successfully!');
    } catch (err) {
      alert('Failed to apply optimizations');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div>;

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-navy-100 p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-status-open/10 text-status-open rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-bold text-navy-900">Schedule is Optimal</h3>
        <p className="text-sm text-navy-500">No gaps detected. No action required.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden shadow-skyline">
      <div className="p-6 bg-primary-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h3 className="font-bold">Gap Compaction Suggestion</h3>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-md font-bold">{suggestions.length} Improvements</span>
      </div>

      <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
        <div className="p-3 bg-status-warning/10 border border-status-warning/20 rounded-xl flex gap-3 text-status-warning">
          <AlertTriangle size={18} className="shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            Applying these changes will move patients into earlier cancelled slots. Patients will receive automated rescheduling notifications.
          </p>
        </div>

        {suggestions.map((sug, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-navy-50 rounded-xl border border-navy-100">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-navy-400">Patient {sug.patient_id.split('-')[0]}</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-semibold text-navy-900 line-through opacity-40">
                  {new Date(sug.current_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <ArrowRight size={14} className="text-navy-300" />
                <span className="text-sm font-bold text-status-open">
                  {new Date(sug.suggested_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="bg-status-open/10 text-status-open px-2 py-1 rounded text-[10px] font-black">
              -{sug.time_saved_mins} MIN
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-navy-100 bg-navy-50/50">
        <button 
          onClick={handleApply}
          disabled={applying}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
        >
          {applying ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Approve & Compact Schedule</>}
        </button>
      </div>
    </div>
  );
}
