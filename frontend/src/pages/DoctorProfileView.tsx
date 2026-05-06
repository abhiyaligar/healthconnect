import React, { useState, useEffect } from 'react';
import { 
  User, Activity, Clock, Calendar, 
  Award, BookOpen, Star, TrendingUp, 
  Users, CheckCircle2, ChevronRight, Loader2
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfileView() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/history/doctor/me');
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch doctor history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50/30">
      <Loader2 className="animate-spin text-primary-500" size={40} />
    </div>
  );

  const ratedAppts = history.filter(h => h.rating && h.rating > 0);
  const avgRating = ratedAppts.length > 0 
    ? (ratedAppts.reduce((acc, curr) => acc + curr.rating, 0) / ratedAppts.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Professional Header */}
      <div className="bg-primary-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Award size={160} />
        </div>
        
        <div className="relative flex flex-col md:flex-row gap-8 items-center">
          <div className="w-40 h-40 rounded-[32px] bg-white p-1 shadow-2xl">
            <div className="w-full h-full rounded-[30px] bg-primary-100 flex items-center justify-center text-primary-900 overflow-hidden">
               <User size={80} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-4xl font-black tracking-tight">{user?.full_name}</h1>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-primary-400">
                Senior Consultant
              </span>
            </div>
            <p className="text-primary-100 text-lg font-medium flex items-center justify-center md:justify-start gap-3">
              <BookOpen size={20} className="text-primary-400" /> Cardiological Surgery · 12 Years Exp.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Consultations</span>
                 <span className="text-2xl font-black">{history.length}+</span>
               </div>
               <div className="w-px h-10 bg-white/10 hidden md:block" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Patient Rating</span>
                 <span className="text-2xl font-black flex items-center gap-2">{avgRating} <Star size={20} className="fill-status-warning text-status-warning" /></span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Performance Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[32px] p-8 border border-navy-100 shadow-skyline">
              <h3 className="text-xs font-black text-navy-400 uppercase tracking-[0.2em] mb-8">Performance Analytics</h3>
              
              <div className="space-y-6">
                 <div className="p-6 bg-navy-50 rounded-3xl border border-navy-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-navy-500">Avg. Consultation Time</span>
                       <Clock size={16} className="text-primary-600" />
                    </div>
                    <p className="text-2xl font-black text-navy-900">18.5 <span className="text-sm font-bold text-navy-400">min</span></p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-status-open">
                       <TrendingUp size={12} /> 4% Faster than last month
                    </div>
                 </div>

                 <div className="p-6 bg-navy-50 rounded-3xl border border-navy-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-navy-500">Daily Load Capacity</span>
                       <Users size={16} className="text-tertiary-600" />
                    </div>
                    <p className="text-2xl font-black text-navy-900">84 <span className="text-sm font-bold text-navy-400">%</span></p>
                    <div className="mt-4 h-1.5 bg-navy-200 rounded-full overflow-hidden">
                       <div className="h-full bg-tertiary-500 w-[84%]" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Consultation History */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-navy-100 shadow-skyline overflow-hidden">
              <div className="p-8 border-b border-navy-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-navy-900">Consultation Archive</h3>
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-widest mt-1">Verified Medical Records</p>
                </div>
                <span className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold">{history.length} Total</span>
              </div>
              
              <div className="divide-y divide-navy-50">
                 {history.map((appt, i) => (
                   <div key={i} className="p-6 flex items-center justify-between hover:bg-navy-50/30 transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center text-navy-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-navy-900">Patient ID: {appt.patient_id}</p>
                          <p className="text-xs text-navy-400">
                            {new Date(appt.actual_end_time).toLocaleDateString()} · {appt.diagnosis || 'General Checkup'}
                          </p>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 text-xs font-bold text-navy-400 group-hover:text-primary-600 transition-colors">
                        View Summary <ChevronRight size={14} />
                      </button>
                   </div>
                 ))}
                 {history.length === 0 && (
                   <div className="p-20 text-center text-navy-300 font-bold uppercase tracking-widest text-xs">
                     No consultation history recorded yet.
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
