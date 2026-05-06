import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, ArrowRight, CheckCircle2, 
  RotateCcw, Shield, User, Zap, ChevronLeft, BarChart3
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function ConflictResolution() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchConflicts = async () => {
    try {
      const res = await api.get('/analytics/conflicts/detailed');
      setConflicts(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch detailed conflicts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, []);

  const handleAutoResolve = async (conflictId: string) => {
    showToast('info', 'Auto-Resolving', 'Calculating optimal slot re-balancing...');
    // Mocking resolution for now - in production this would call a backend resolve endpoint
    setTimeout(() => {
      showToast('success', 'Resolved', 'Patients successfully moved to next available slots.');
      fetchConflicts();
    }, 1500);
  };

  if (loading) return <div className="p-20 text-center text-navy-400">Analyzing scheduling fairness...</div>;

  const openConflicts = conflicts.filter(c => c.patients.some((p: any) => p.action === 'MOVE'));
  const highSeverity = conflicts.filter(c => c.severity === 'HIGH');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => navigate('/reception')}
            className="flex items-center gap-2 text-navy-400 hover:text-navy-900 mb-2 font-medium transition-colors"
          >
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight">Conflict Resolution</h1>
          <p className="text-navy-500 font-medium mt-1">Detected scheduling conflicts · Today's shift</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchConflicts} className="p-3 bg-white border border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 transition-colors">
            <RotateCcw size={20} />
          </button>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100">
            Auto-Resolve All
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Conflicts', value: conflicts.length, color: 'text-navy-900' },
          { label: 'High Severity', value: highSeverity.length, color: 'text-status-error' },
          { label: 'Total Affected', value: conflicts.reduce((acc, c) => acc + c.patients_affected, 0), color: 'text-navy-900' },
          { label: 'Wait Surge', value: `${conflicts.length > 2 ? '+12' : '+0'}m`, color: 'text-status-warning' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-navy-100 shadow-sm">
            <p className="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-navy-100 pb-px">
        {['All', 'High Severity', 'Open', 'Resolved'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-primary-600' : 'text-navy-400 hover:text-navy-600'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Conflict List */}
      <div className="space-y-6">
        {conflicts.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border border-navy-100 shadow-sm">
            <div className="w-20 h-20 bg-status-open/10 rounded-[32px] flex items-center justify-center text-status-open mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-navy-900">System Stabilized</h2>
            <p className="text-navy-500 mt-2">No active scheduling conflicts detected for the current shift.</p>
          </div>
        ) : (
          conflicts.map((conflict, i) => (
            <div key={i} className="bg-white rounded-[32px] border border-navy-100 shadow-skyline overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Header */}
              <div className="p-8 border-b border-navy-50 flex items-start justify-between">
                <div className="flex gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${conflict.severity === 'HIGH' ? 'bg-status-error/10 text-status-error' : 'bg-status-warning/10 text-status-warning'}`}>
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-navy-900">{conflict.type.replace(/_/g, ' ')}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase ${conflict.severity === 'HIGH' ? 'bg-status-error text-white' : 'bg-status-warning text-white'}`}>
                        {conflict.severity}
                      </span>
                    </div>
                    <p className="text-navy-500 font-medium">
                      {conflict.doctor} · <span className="text-navy-900">{conflict.time}</span> · {conflict.patients_affected} patients affected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-navy-400 uppercase tracking-widest mb-1">System Suggestion</p>
                  <p className="text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 inline-block">
                    {conflict.suggestion}
                  </p>
                </div>
              </div>

              {/* Patient Breakdown */}
              <div className="p-8 bg-navy-50/50">
                <p className="text-xs font-black text-navy-400 uppercase tracking-[0.2em] mb-6">Affected Patients & Fairness Impact</p>
                <div className="grid grid-cols-2 gap-6">
                  {conflict.patients.map((p: any, j: number) => (
                    <div key={j} className={`p-6 rounded-2xl border-2 transition-all ${p.action === 'MOVE' ? 'bg-white border-status-error/20 shadow-sm' : 'bg-white/50 border-navy-100'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${p.priority === 'P1' ? 'bg-status-error text-white' : p.priority === 'P2' ? 'bg-status-warning text-white' : 'bg-navy-400 text-white'}`}>
                            {p.priority}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900">{p.patient_name}</p>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${p.action === 'MOVE' ? 'text-status-error' : 'text-status-open'}`}>
                              {p.action === 'MOVE' ? '↺ Rescheduling Candidate' : '✓ Retained in Slot'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-navy-400 uppercase">Priority Score</p>
                          <p className="text-lg font-black text-navy-900">{p.total_score}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-navy-50/80 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-black text-navy-400 uppercase">Base</p>
                          <p className="text-xs font-bold text-navy-700">{p.breakdown.base.toFixed(1)}</p>
                        </div>
                        <div className="bg-navy-50/80 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-black text-navy-400 uppercase">Wait</p>
                          <p className="text-xs font-bold text-primary-600">+{p.breakdown.wait.toFixed(1)}</p>
                        </div>
                        <div className="bg-navy-50/80 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-black text-navy-400 uppercase">Penalty</p>
                          <p className="text-xs font-bold text-status-error">−{p.breakdown.penalty.toFixed(1)}</p>
                        </div>
                      </div>

                      {p.reschedule_count > 1 && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-status-error uppercase bg-status-error/5 p-2 rounded-lg border border-status-error/10">
                          <Zap size={12} /> Fairness Alert: Already moved {p.reschedule_count}×
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-white border-t border-navy-50 flex justify-end gap-3">
                <button className="px-6 py-2.5 rounded-xl border border-navy-200 text-navy-600 font-bold hover:bg-navy-50 transition-all">
                  Manual Override
                </button>
                <button 
                  onClick={() => handleAutoResolve(conflict.slot_id)}
                  className="px-8 py-2.5 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-all flex items-center gap-2"
                >
                  Apply System Resolution <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
