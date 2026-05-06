import React, { useState, useEffect } from 'react';
import { 
  User, Activity, Pill, FileText, Calendar, 
  MapPin, Droplets, Scale, Thermometer, Heart, 
  TrendingUp, Clock, ChevronRight, Loader2
} from 'lucide-react';
import api from '../api';
import MedicalTimeline from '../components/MedicalTimeline';
import { useAuth } from '../context/AuthContext';

interface PatientProfile {
  full_name: string;
  custom_id: string;
  blood_type?: string;
  weight?: string;
  gender?: string;
  dob?: string;
}

export default function PatientProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'vitals' | 'prescriptions'>('timeline');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, histRes, recsRes] = await Promise.all([
          api.get('/auth/me'), // Should return profile info
          api.get('/history/me/full'),
          api.get('/history/me/records') // We'll need to implement this one or reuse
        ]);
        
        // Mocking profile from user context if endpoint doesn't have it all
        setProfile({
          full_name: user?.full_name || 'Patient User',
          custom_id: user?.custom_id || 'PAT-001',
          blood_type: 'O+',
          weight: '72kg',
          gender: 'Male',
          dob: '1992-05-15'
        });
        
        setHistory(histRes.data);
        setRecords(recsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50/30">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-navy-400 font-bold uppercase tracking-widest text-xs">Loading Medical Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-navy-100 shadow-skyline relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 opacity-50" />
        
        <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-32 rounded-[24px] bg-navy-900 flex items-center justify-center text-white shadow-xl">
            <User size={64} />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black text-navy-900 tracking-tight">{profile?.full_name}</h1>
              <span className="px-3 py-1 bg-navy-100 text-navy-600 rounded-full text-xs font-black uppercase tracking-widest">
                ID: {profile?.custom_id}
              </span>
            </div>
            <p className="text-navy-500 font-medium flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {profile?.dob} (32y)</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} /> New York, NY</span>
            </p>
            
            <div className="flex gap-3 pt-4">
               <div className="px-4 py-2 bg-primary-50 rounded-xl border border-primary-100 flex items-center gap-2">
                 <Droplets size={16} className="text-primary-600" />
                 <span className="text-sm font-bold text-navy-800">{profile?.blood_type}</span>
               </div>
               <div className="px-4 py-2 bg-tertiary-50 rounded-xl border border-tertiary-100 flex items-center gap-2">
                 <Scale size={16} className="text-tertiary-600" />
                 <span className="text-sm font-bold text-navy-800">{profile?.weight}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Clinical History Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-navy-100 shadow-skyline overflow-hidden">
            <div className="flex border-b border-navy-50">
              {['timeline', 'prescriptions', 'vitals'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-6 text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'text-primary-600 bg-primary-50/30 border-b-2 border-primary-600' : 'text-navy-400 hover:text-navy-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-8">
              {activeTab === 'timeline' && <MedicalTimeline history={history} />}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-navy-900 mb-6">Medication History</h3>
                  {history.flatMap(h => h.prescriptions).flatMap(p => p.items).map((item, i) => (
                    <div key={i} className="p-4 bg-navy-50 rounded-2xl border border-navy-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                           <Pill size={20} />
                         </div>
                         <div>
                           <p className="font-bold text-navy-900">{item.medicine_name}</p>
                           <p className="text-[10px] text-navy-400 font-bold uppercase">{item.dosage} · {item.frequency}</p>
                         </div>
                       </div>
                       <span className="text-xs font-bold text-navy-400">{item.duration}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'vitals' && (
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-navy-900 mb-6">Longitudinal Vitals Trend</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100">
                         <div className="flex justify-between items-start mb-4">
                            <Heart className="text-primary-600" />
                            <TrendingUp size={16} className="text-primary-400" />
                         </div>
                         <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Avg Heart Rate</p>
                         <p className="text-3xl font-black text-navy-900 mt-1">74 <span className="text-sm">BPM</span></p>
                      </div>
                      <div className="p-6 bg-status-open/10 rounded-3xl border border-status-open/20">
                         <div className="flex justify-between items-start mb-4">
                            <Activity className="text-status-open" />
                            <TrendingUp size={16} className="text-status-open/40" />
                         </div>
                         <p className="text-[10px] font-black text-status-open uppercase tracking-widest">Avg Blood Pressure</p>
                         <p className="text-3xl font-black text-navy-900 mt-1">120/80 <span className="text-sm">mmHg</span></p>
                      </div>
                   </div>
                   <div className="h-64 bg-navy-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-navy-100 text-navy-300 font-bold uppercase tracking-widest text-[10px]">
                      Vitals Charting Engine Placeholder
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           {/* Uploaded Records */}
           <div className="bg-white rounded-[32px] p-8 border border-navy-100 shadow-skyline">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-6 flex items-center justify-between">
                Medical Records
                <span className="text-xs text-navy-300 normal-case font-medium">{records.length} files</span>
              </h3>
              <div className="space-y-3">
                 {records.map((rec, i) => (
                   <a 
                    key={i} 
                    href={rec.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 hover:bg-navy-50 rounded-2xl transition-colors border border-transparent hover:border-navy-100 group"
                   >
                     <div className="w-10 h-10 bg-navy-50 text-navy-400 rounded-xl flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                       <FileText size={20} />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-bold text-navy-900 truncate">{rec.description || 'Medical Report'}</p>
                       <p className="text-[10px] font-bold text-navy-300 uppercase">{rec.file_type} · {new Date(rec.created_at).toLocaleDateString()}</p>
                     </div>
                     <ChevronRight size={16} className="text-navy-200" />
                   </a>
                 ))}
                 {records.length === 0 && (
                   <p className="text-center py-6 text-navy-300 text-xs italic">No uploaded records found.</p>
                 )}
              </div>
           </div>

           {/* Health Summary */}
           <div className="bg-navy-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute bottom-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-6">Patient Health Insight</h3>
              <p className="text-lg font-medium leading-relaxed relative z-10">
                Overall stability is high. Routine checkup recommended every 6 months to maintain current vitals.
              </p>
              <div className="mt-8 space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-navy-400">Compliance Rate</span>
                    <span className="text-primary-400">95%</span>
                 </div>
                 <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 w-[95%]" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
