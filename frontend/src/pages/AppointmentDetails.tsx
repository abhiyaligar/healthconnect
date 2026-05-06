import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Activity, Pill, 
  ChevronLeft, Star, Send, Loader2, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api';
import { toISTTime, toISTDate } from '../utils/time';

interface Appointment {
  id: string;
  queue_token: string;
  status: string;
  actual_end_time: string;
  diagnosis: string;
  clinical_notes: string;
  rating?: number;
  feedback?: string;
  slot: {
    start_time: string;
    doctor: {
      full_name: string;
      specialty: string;
    };
  };
  vitals: any[];
  prescriptions: any[];
}

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${id}`);
        setAppointment(res.data);
        if (res.data.rating) {
          setRating(res.data.rating);
          setFeedback(res.data.feedback || '');
        }
      } catch (err) {
        console.error('Failed to fetch appointment details');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const handleRate = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await api.post(`/appointments/${id}/rate?rating=${rating}&feedback=${encodeURIComponent(feedback)}`);
      setAppointment(prev => prev ? { ...prev, rating, feedback } : null);
      alert('Thank you for your feedback!');
    } catch (err) {
      alert('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary-500" size={40} />
    </div>
  );

  if (!appointment) return (
    <div className="p-8 text-center">
      <AlertCircle size={48} className="mx-auto text-status-error mb-4" />
      <h2 className="text-2xl font-bold text-navy-900">Appointment Not Found</h2>
      <Link to="/dashboard" className="text-primary-600 font-bold mt-4 inline-block">Back to Dashboard</Link>
    </div>
  );

  const isCompleted = appointment.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-navy-400 hover:text-navy-900 font-bold uppercase tracking-widest text-[10px] transition-colors"
      >
        <ChevronLeft size={16} /> Back to Schedule
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-[32px] p-8 border border-navy-100 shadow-skyline relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 opacity-50" />
        
        <div className="relative flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
            <Calendar size={32} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                isCompleted ? 'bg-status-open/10 text-status-open' : 'bg-primary-50 text-primary-600'
              }`}>
                {appointment.status}
              </span>
              <span className="text-navy-300 text-xs font-bold uppercase tracking-widest">Token: {appointment.queue_token}</span>
            </div>
            <h1 className="text-3xl font-black text-navy-900 tracking-tight">
              {toISTDate(appointment.slot.start_time)}
            </h1>
            <p className="text-navy-500 font-medium flex items-center gap-2">
              <Clock size={16} /> {toISTTime(appointment.slot.start_time)} with {appointment.slot.doctor.full_name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Clinical Summary */}
        <div className="md:col-span-7 space-y-8">
          {isCompleted ? (
            <div className="bg-white rounded-[32px] p-8 border border-navy-100 shadow-skyline space-y-8">
              <div>
                <h3 className="text-xs font-black text-navy-400 uppercase tracking-[0.2em] mb-4">Diagnosis & Notes</h3>
                <p className="text-lg font-bold text-navy-900 mb-2">{appointment.diagnosis || 'General Checkup'}</p>
                <p className="text-navy-600 leading-relaxed italic">
                  "{appointment.clinical_notes || 'No clinical notes provided.'}"
                </p>
              </div>

              {appointment.vitals.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-navy-400 uppercase tracking-[0.2em] mb-4">Recorded Vitals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                      <p className="text-[10px] font-black text-navy-400 uppercase mb-1">Blood Pressure</p>
                      <p className="text-xl font-black text-navy-900">{appointment.vitals[0].bp_systolic}/{appointment.vitals[0].bp_diastolic}</p>
                    </div>
                    <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                      <p className="text-[10px] font-black text-navy-400 uppercase mb-1">Heart Rate</p>
                      <p className="text-xl font-black text-navy-900">{appointment.vitals[0].heart_rate} BPM</p>
                    </div>
                  </div>
                </div>
              )}

              {appointment.prescriptions.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-navy-400 uppercase tracking-[0.2em] mb-4">Prescription</h3>
                  <div className="space-y-3">
                    {appointment.prescriptions[0].items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-primary-50/50 rounded-2xl border border-primary-100/50">
                        <div className="flex items-center gap-3">
                          <Pill className="text-primary-600" size={18} />
                          <span className="font-bold text-navy-900">{item.medicine_name}</span>
                        </div>
                        <span className="text-xs font-bold text-primary-600">{item.dosage} · {item.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-navy-50 rounded-[32px] p-12 border-2 border-dashed border-navy-100 text-center">
              <Clock size={48} className="mx-auto text-navy-200 mb-4" />
              <p className="text-navy-400 font-bold uppercase tracking-widest text-xs">Consultation has not started yet.</p>
              <p className="text-navy-300 text-sm mt-2">Clinical details will appear here once completed.</p>
            </div>
          )}
        </div>

        {/* Patient Experience / Rating */}
        <div className="md:col-span-5">
          {isCompleted ? (
            <div className="bg-navy-900 rounded-[32px] p-8 text-white shadow-2xl space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Share Your Experience</h3>
              
              <div className="space-y-4">
                <p className="text-lg font-medium leading-tight">How was your session with {appointment.slot.doctor.full_name}?</p>
                
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={!!appointment.rating || submitting}
                      onMouseEnter={() => !appointment.rating && setHoverRating(star)}
                      onMouseLeave={() => !appointment.rating && setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={32} 
                        className={`${
                          star <= (hoverRating || rating || appointment.rating || 0) 
                            ? 'fill-status-warning text-status-warning' 
                            : 'text-navy-700'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>

                {!appointment.rating ? (
                  <div className="space-y-4 pt-2">
                    <textarea
                      placeholder="Optional feedback..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-navy-800 border border-navy-700 rounded-2xl p-4 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                    />
                    <button
                      onClick={handleRate}
                      disabled={rating === 0 || submitting}
                      className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-navy-700 disabled:text-navy-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Submit Review</>}
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-status-open bg-status-open/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                      <CheckCircle2 size={12} /> Feedback Submitted
                    </div>
                    {appointment.feedback && (
                      <p className="text-sm text-navy-300 italic leading-relaxed">
                        "{appointment.feedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-8 border border-navy-100 shadow-skyline">
               <div className="flex items-center gap-3 text-status-open mb-6">
                 <div className="w-10 h-10 rounded-xl bg-status-open/10 flex items-center justify-center">
                   <Activity size={20} />
                 </div>
                 <h3 className="font-bold text-navy-900 uppercase text-xs tracking-widest">Active Status</h3>
               </div>
               <p className="text-navy-500 text-sm leading-relaxed mb-6">
                 Please wait for your token to be called. You will receive a notification when the doctor is ready.
               </p>
               <div className="p-4 bg-navy-50 rounded-2xl border border-navy-100">
                 <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Expected Wait</p>
                 <p className="text-lg font-black text-navy-900 flex items-center gap-2">
                   ~15 Minutes <span className="text-[10px] font-bold text-status-warning uppercase px-2 py-0.5 bg-status-warning/10 rounded">Increasing</span>
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
