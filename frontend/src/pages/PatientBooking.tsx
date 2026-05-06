import React, { useState, useEffect } from 'react';
import { Heart, Brain, Bone, Eye, Star, Clock, Calendar, CheckCircle2, AlertCircle, ChevronLeft, Stethoscope } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Doctor {
  id: string;
  custom_id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  bio?: string;
  avg_consultation_time: number;
}

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  status: 'OPEN' | 'CLOSED';
  max_capacity: number;
}

const specialtyIcons: Record<string, any> = {
  'Cardiology': Heart,
  'Neurology': Brain,
  'Orthopedics': Bone,
  'Ophthalmology': Eye,
  'General': Stethoscope,
};

export default function PatientBooking() {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientDetails, setPatientDetails] = useState({ symptoms: '', severity: 'Moderate', history: '' });
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [specialtySearch, setSpecialtySearch] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors/');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to fetch doctors');
      }
    };
    fetchDoctors();
  }, []);

  const fetchSlots = async (docId: string, date: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/slots/?doctor_id=${docId}&date=${date}`);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtySelect = async (spec: string) => {
    setSelectedSpecialty(spec);
    setLoading(true);
    try {
      const res = await api.get(`/doctors/recommend?specialty=${spec}`);
      setDoctors(res.data);
      setStep(2);
    } catch (err) {
      console.error('Failed to fetch recommended doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    fetchSlots(doc.custom_id, selectedDate);
    setStep(3);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      fetchSlots(selectedDoctor.custom_id, date);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    if (slot.status === 'CLOSED') return;
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    try {
      setLoading(true);
      const res = await api.post('/appointments/', {
        slot_id: selectedSlot.id,
        // In the future, we can send symptoms/severity if the backend supports it
      });
      setBookingResult(res.data);
      setStep(5);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPatientDetails({ symptoms: '', severity: 'Moderate', history: '' });
    setBookingResult(null);
  };

  const uniqueSpecialties = Array.from(new Set(doctors.map(d => d.specialty)));

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-navy-900 mb-2 font-sans tracking-tight">Book Appointment</h1>
        <p className="text-navy-500">Secure your consultation in just a few clicks.</p>
        
        <div className="flex items-center gap-4 mt-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-4 flex-1">
              <div className={cn("h-2 rounded-full flex-1 transition-colors duration-300", step >= s ? "bg-primary-500" : "bg-navy-100")}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1 text-[10px] sm:text-sm font-medium text-navy-400 text-center">
          <span className={cn("w-16 sm:w-auto", step >= 1 && "text-primary-700")}>Specialty</span>
          <span className={cn("w-16 sm:w-auto", step >= 2 && "text-primary-700")}>Doctor</span>
          <span className={cn("w-16 sm:w-auto", step >= 3 && "text-primary-700")}>Time Slot</span>
          <span className={cn("w-16 sm:w-auto", step >= 4 && "text-primary-700")}>Details</span>
          <span className={cn("w-16 sm:w-auto", step >= 5 && "text-primary-700")}>Confirm</span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden min-h-[500px] relative">
        {step > 1 && step < 5 && (
          <button onClick={() => setStep(step - 1)} className="absolute top-6 left-6 flex items-center gap-2 text-navy-500 hover:text-primary-600 font-medium">
            <ChevronLeft size={20} /> Back
          </button>
        )}

        <div className="p-6 sm:p-10 pt-16">
          {/* STEP 1: SPECIALTY */}
          {step === 1 && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-navy-900">Select a Specialty</h2>
                <div className="relative w-full md:w-64">
                  <input 
                    type="text" 
                    placeholder="Search specialty..."
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-navy-50 border border-navy-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {uniqueSpecialties
                  .filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase()))
                  .map((spec) => {
                  const Icon = specialtyIcons[spec] || Stethoscope;
                  return (
                    <div key={spec} className="group p-6 rounded-xl border border-navy-100 hover:border-primary-300 hover:bg-navy-50 cursor-pointer flex items-start justify-between">
                      <div onClick={() => handleSpecialtySelect(spec)} className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-navy-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center">
                          <Icon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-navy-900 mt-2">{spec}</h3>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSpecialtySelect(spec); }}
                        className="self-center px-4 py-2 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <Zap size={12} className="fill-white" /> Quickest
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && selectedSpecialty && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Available {selectedSpecialty} Specialists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doc: any, index) => (
                  <div key={doc.custom_id} className={cn(
                    "p-6 rounded-xl border flex flex-col justify-between relative",
                    index === 0 ? "border-primary-500 bg-primary-50/30" : "border-navy-100"
                  )}>
                    {index === 0 && (
                      <span className="absolute -top-3 left-6 px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        Fastest Turnaround
                      </span>
                    )}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-700">
                        {doc.full_name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-navy-900">{doc.full_name}</h3>
                          {index === 0 && <Star size={16} className="text-primary-500 fill-primary-500" />}
                        </div>
                        <p className="text-navy-500 text-sm mt-1">{doc.bio || 'General Physician'}</p>
                        <p className="text-[10px] text-navy-400 mt-2 font-bold uppercase tracking-tight">
                          Current Load: {doc.current_load} Patients Today
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDoctorSelect(doc)} className={cn(
                      "w-full py-2.5 rounded-lg font-bold transition-all",
                      index === 0 ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-navy-50 text-primary-600 hover:bg-primary-600 hover:text-white"
                    )}>
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && selectedDoctor && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Select a Time Slot</h2>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-4 bg-navy-50 rounded-xl border border-navy-100">
                <p className="text-navy-500 flex items-center gap-2"><Calendar size={18} /> Available slots for {selectedDoctor.full_name}</p>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-navy-700 uppercase">Pick Date:</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="p-2 border border-navy-200 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {loading ? <div className="col-span-4 py-10 text-center">Fetching availability...</div> : 
                 slots.length === 0 ? <div className="col-span-4 py-10 text-center text-navy-400">No open slots available for this date.</div> :
                 slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slot.status === 'CLOSED'}
                    className={cn(
                      "py-3 px-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-1",
                      slot.status === 'OPEN' ? "bg-white border-status-open/30 text-status-open hover:bg-status-open hover:text-white shadow-sm" : "bg-navy-50 text-navy-400 cursor-not-allowed"
                    )}
                  >
                    <span className="font-bold">{new Date(slot.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                    <span className="text-[10px] opacity-60">Max {slot.max_capacity} patients</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && selectedSlot && (
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Final Step</h2>
              <p className="text-navy-500 mb-8">Confirm your booking for {new Date(selectedSlot.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">Reason for Visit / Symptoms</label>
                  <textarea 
                    value={patientDetails.symptoms}
                    onChange={e => setPatientDetails(p => ({ ...p, symptoms: e.target.value }))}
                    className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                    rows={3}
                    placeholder="e.g. Mild chest pain for the last 2 days..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">Self-Assessed Severity</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Mild', 'Moderate', 'Severe'].map(sev => (
                      <button
                        key={sev}
                        onClick={() => setPatientDetails(p => ({ ...p, severity: sev }))}
                        className={cn(
                          "py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                          patientDetails.severity === sev 
                            ? "border-primary-600 bg-primary-50 text-primary-700" 
                            : "border-navy-100 text-navy-500 hover:border-navy-300"
                        )}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">Brief Medical History (Optional)</label>
                  <textarea 
                    value={patientDetails.history}
                    onChange={e => setPatientDetails(p => ({ ...p, history: e.target.value }))}
                    className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                    rows={2}
                    placeholder="Any previous conditions, surgeries, or allergies..."
                  />
                </div>
              </div>

              <button 
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg transition-all"
              >
                {loading ? 'Processing...' : 'Confirm Appointment'}
              </button>
            </div>
          )}

          {step === 5 && bookingResult && (
            <div className="flex flex-col items-center text-center max-w-md mx-auto py-8">
              <div className="w-20 h-20 bg-status-open/10 text-status-open rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Booking Success!</h2>
              <p className="text-navy-500 mb-8">Your queue token has been generated.</p>

              <div className="w-full bg-navy-50 border border-navy-100 rounded-xl p-6 text-left mb-8">
                <div className="flex justify-between items-center border-b border-navy-100 pb-4 mb-4">
                  <span className="text-navy-500 font-medium">Token Number</span>
                  <span className="text-2xl font-bold text-primary-600">{bookingResult.queue_token}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-navy-500">Status</span>
                    <span className="font-bold text-status-open">{bookingResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500">Priority Score</span>
                    <span className="font-bold text-navy-900">{bookingResult.priority_score}</span>
                  </div>
                </div>
              </div>

              <button onClick={resetBooking} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium">
                Book Another Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
