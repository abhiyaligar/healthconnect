import React, { useState } from 'react';
import { Heart, Brain, Bone, Eye, Star, Clock, Calendar, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const specialties = [
  { id: 'cardiology', name: 'Cardiology', icon: Heart, desc: 'Heart and cardiovascular system' },
  { id: 'neurology', name: 'Neurology', icon: Brain, desc: 'Brain and nervous system' },
  { id: 'orthopedics', name: 'Orthopedics', icon: Bone, desc: 'Bones, joints, and muscles' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: Eye, desc: 'Eye and vision care' },
];

const doctors = {
  cardiology: [
    { id: 'dr-smith', name: 'Dr. Sarah Smith', rating: 4.9, reviews: 128, exp: '15 years' },
    { id: 'dr-jones', name: 'Dr. Michael Jones', rating: 4.7, reviews: 84, exp: '10 years' },
  ],
  neurology: [
    { id: 'dr-lee', name: 'Dr. David Lee', rating: 4.8, reviews: 156, exp: '12 years' },
  ],
  orthopedics: [
    { id: 'dr-brown', name: 'Dr. Emily Brown', rating: 4.9, reviews: 201, exp: '18 years' },
  ],
  ophthalmology: [
    { id: 'dr-davis', name: 'Dr. Robert Davis', rating: 4.6, reviews: 65, exp: '8 years' },
  ],
};

const slots = [
  { time: '09:00 AM', status: 'open',    filled: 3,  capacity: 10, predictedWait: 8  },
  { time: '09:15 AM', status: 'full',    filled: 10, capacity: 10, predictedWait: 0  },
  { time: '09:30 AM', status: 'warning', filled: 9,  capacity: 8,  predictedWait: 28 },
  { time: '09:45 AM', status: 'open',    filled: 4,  capacity: 10, predictedWait: 12 },
  { time: '10:00 AM', status: 'open',    filled: 2,  capacity: 10, predictedWait: 6  },
  { time: '10:15 AM', status: 'full',    filled: 10, capacity: 10, predictedWait: 0  },
  { time: '10:30 AM', status: 'open',    filled: 5,  capacity: 10, predictedWait: 15 },
  { time: '10:45 AM', status: 'warning', filled: 8,  capacity: 8,  predictedWait: 32 },
  { time: '11:00 AM', status: 'open',    filled: 1,  capacity: 10, predictedWait: 5  },
  { time: '11:15 AM', status: 'open',    filled: 3,  capacity: 10, predictedWait: 10 },
  { time: '11:30 AM', status: 'full',    filled: 10, capacity: 10, predictedWait: 0  },
  { time: '11:45 AM', status: 'open',    filled: 2,  capacity: 10, predictedWait: 7  },
];

export default function PatientBooking() {
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState({ symptoms: '', severity: 'Moderate', history: '' });

  const handleSpecialtySelect = (id: string) => {
    setSelectedSpecialty(id);
    setStep(2);
  };

  const handleDoctorSelect = (doc: any) => {
    setSelectedDoctor(doc);
    setStep(3);
  };

  const handleSlotSelect = (slot: any) => {
    if (slot.status === 'full') return;
    setSelectedSlot(slot);
    setStep(4);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedSpecialty(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPatientDetails({ symptoms: '', severity: 'Moderate', history: '' });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header & Progress */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-navy-900 mb-2 font-sans tracking-tight">Book Appointment</h1>
        <p className="text-navy-500">Follow the steps below to schedule your visit.</p>
        
        <div className="flex items-center gap-4 mt-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-4 flex-1">
              <div className={cn(
                "h-2 rounded-full flex-1 transition-colors duration-300",
                step >= s ? "bg-primary-500" : "bg-navy-100"
              )}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1 text-sm font-medium text-navy-400">
          <span className={cn(step >= 1 && "text-primary-700")}>Specialty</span>
          <span className={cn(step >= 2 && "text-primary-700")}>Doctor</span>
          <span className={cn(step >= 3 && "text-primary-700")}>Time Slot</span>
          <span className={cn(step >= 4 && "text-primary-700")}>Details</span>
          <span className={cn(step >= 5 && "text-primary-700")}>Confirmation</span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden min-h-[500px] relative transition-all duration-300">
        
        {step > 1 && step < 5 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="absolute top-6 left-6 flex items-center gap-2 text-navy-500 hover:text-primary-600 font-medium transition-colors z-10"
          >
            <ChevronLeft size={20} /> Back
          </button>
        )}

        <div className="p-10 pt-16">
          {/* STEP 1: SPECIALTY */}
          {step === 1 && (
            <div className="transition-opacity duration-500 opacity-100">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Select a Specialty</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specialties.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div 
                      key={spec.id}
                      onClick={() => handleSpecialtySelect(spec.id)}
                      className="group p-6 rounded-xl border border-navy-100 hover:border-primary-300 hover:shadow-md hover:bg-navy-50 transition-all cursor-pointer flex items-start gap-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-navy-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-navy-900 mb-1">{spec.name}</h3>
                        <p className="text-navy-500 text-sm">{spec.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DOCTOR */}
          {step === 2 && selectedSpecialty && (
            <div className="transition-opacity duration-500 opacity-100">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Select a Doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(doctors as any)[selectedSpecialty].map((doc: any) => (
                  <div key={doc.id} className="p-6 rounded-xl border border-navy-100 flex flex-col justify-between">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-tertiary-200 flex items-center justify-center text-xl font-bold text-tertiary-700">
                        {doc.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-navy-900">{doc.name}</h3>
                        <div className="flex items-center gap-1 text-status-warning text-sm font-medium mt-1">
                          <Star size={16} fill="currentColor" />
                          <span>{doc.rating}</span>
                          <span className="text-navy-400 font-normal">({doc.reviews} reviews)</span>
                        </div>
                        <p className="text-navy-500 text-sm mt-1">{doc.exp} experience</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDoctorSelect(doc)}
                      className="w-full py-2.5 bg-navy-50 hover:bg-primary-600 hover:text-white text-primary-600 rounded-lg font-medium transition-colors"
                    >
                      View Availability
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TIME SLOT */}
          {step === 3 && selectedDoctor && (
            <div className="transition-opacity duration-500 opacity-100">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Select a Time Slot</h2>
              <p className="text-navy-500 mb-6 flex items-center gap-2">
                <Calendar size={18} /> Schedule with {selectedDoctor.name} for Today
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-navy-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium"><div className="w-3 h-3 rounded-full bg-status-open"></div> Available</div>
                <div className="flex items-center gap-2 text-sm font-medium"><div className="w-3 h-3 rounded-full bg-status-warning"></div> Overbooked</div>
                <div className="flex items-center gap-2 text-sm font-medium"><div className="w-3 h-3 rounded-full bg-status-error"></div> Full</div>
                <div className="ml-auto text-xs text-navy-400 flex items-center gap-1"><Clock size={12} /> Predicted wait shown per slot</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot, idx) => {
                  const isOpen = slot.status === 'open';
                  const isWarning = slot.status === 'warning';
                  const isFull = slot.status === 'full';

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={isFull}
                      className={cn(
                        "py-3 px-3 rounded-lg text-sm font-medium transition-all border flex flex-col items-center gap-1",
                        isOpen && "bg-white border-status-open/30 text-status-open hover:bg-status-open hover:text-white hover:shadow-md",
                        isWarning && "bg-white border-status-warning/40 text-status-warning hover:bg-status-warning hover:text-white hover:shadow-md",
                        isFull && "bg-navy-50 border-navy-100 text-navy-400 cursor-not-allowed opacity-60"
                      )}
                    >
                      <span className="font-bold">{slot.time}</span>
                      <span className="text-xs opacity-80">
                        {isFull ? 'Full' : `~${slot.predictedWait}m wait`}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {slot.filled}/{slot.capacity} filled
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PATIENT DETAILS */}
          {step === 4 && selectedSlot && (
            <div className="transition-opacity duration-500 opacity-100 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Patient Details</h2>
              <p className="text-navy-500 mb-6">Please provide some details about your condition to help the doctor prepare.</p>
              
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
                  <div className="grid grid-cols-3 gap-3">
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

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setStep(5)}
                  disabled={!patientDetails.symptoms.trim()}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Confirmation
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && selectedSlot && selectedDoctor && (
            <div className="transition-opacity duration-500 opacity-100 flex flex-col items-center text-center max-w-md mx-auto py-8">
              <div className="w-20 h-20 bg-status-open/10 text-status-open rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Booking Confirmed!</h2>
              <p className="text-navy-500 mb-8">Your appointment has been successfully scheduled.</p>

              <div className="w-full bg-navy-50 border border-navy-100 rounded-xl p-6 text-left mb-8">
                <div className="flex justify-between items-center border-b border-navy-100 pb-4 mb-4">
                  <span className="text-navy-500 font-medium">Token Number</span>
                  <span className="text-2xl font-bold text-primary-600">T-42</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-navy-500">Doctor</span>
                    <span className="font-medium text-navy-900">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500">Time</span>
                    <span className="font-medium text-navy-900">{selectedSlot.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500">Estimated Wait</span>
                    <span className="font-medium text-navy-900 flex items-center gap-1">
                      <Clock size={16} /> ~15 mins
                    </span>
                  </div>
                </div>
              </div>

              {selectedSlot.status === 'warning' && (
                <div className="flex items-start gap-3 p-4 bg-status-warning/10 text-status-warning rounded-lg mb-8 text-left w-full">
                  <AlertCircle size={20} className="shrink-0 mt-0.5 text-status-warning" />
                  <p className="text-sm">You selected an overbooked slot. Please expect a slightly longer wait time than usual. We appreciate your patience.</p>
                </div>
              )}

              <button 
                onClick={resetBooking}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all"
              >
                Book Another Appointment
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
