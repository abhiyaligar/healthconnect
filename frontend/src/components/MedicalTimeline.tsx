import React from 'react';
import { Calendar, User, Activity, FileText, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { toISTDate } from '../utils/time';

interface PrescriptionItem {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Appointment {
  id: string;
  actual_end_time: string;
  diagnosis: string;
  clinical_notes: string;
  vitals: any[];
  prescriptions: { items: PrescriptionItem[] }[];
  slot?: { doctor_id: string };
}

interface Props {
  history: Appointment[];
}

export default function MedicalTimeline({ history }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="p-12 text-center bg-navy-50 rounded-2xl border-2 border-dashed border-navy-100">
        <Clock size={48} className="mx-auto text-navy-200 mb-4" />
        <p className="text-navy-400 font-bold uppercase tracking-widest text-xs">No Clinical History Found</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-navy-100 before:to-transparent">
      {history.map((appt) => (
        <div key={appt.id} className="relative flex items-start group">
          {/* Timeline Dot */}
          <div className="absolute left-0 w-10 h-10 rounded-full bg-white border-2 border-navy-100 flex items-center justify-center z-10 group-hover:border-primary-500 transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-navy-200 group-hover:bg-primary-500 transition-colors" />
          </div>

          <div className="ml-16 w-full">
            <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-black text-navy-900">
                      {toISTDate(appt.actual_end_time)}
                    </span>
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-bold uppercase">
                      Consultation
                    </span>
                  </div>
                  <p className="text-sm font-bold text-navy-500 flex items-center gap-2">
                    <Activity size={14} className="text-status-open" /> {appt.diagnosis || 'General Checkup'}
                  </p>
                </div>
                {expandedId === appt.id ? <ChevronUp className="text-navy-300" /> : <ChevronDown className="text-navy-300" />}
              </div>

              {expandedId === appt.id && (
                <div className="px-6 pb-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="w-full h-px bg-navy-50" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vitals Snapshot */}
                    {appt.vitals && appt.vitals.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-wider flex items-center gap-2">
                          <Activity size={12} /> Recorded Vitals
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-navy-50 rounded-xl">
                            <p className="text-[10px] text-navy-400 font-bold">BP</p>
                            <p className="text-sm font-black text-navy-900">{appt.vitals[0].bp_systolic}/{appt.vitals[0].bp_diastolic}</p>
                          </div>
                          <div className="p-3 bg-navy-50 rounded-xl">
                            <p className="text-[10px] text-navy-400 font-bold">Pulse</p>
                            <p className="text-sm font-black text-navy-900">{appt.vitals[0].heart_rate} BPM</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Prescription Snapshot */}
                    {appt.prescriptions && appt.prescriptions.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-wider flex items-center gap-2">
                          <Pill size={12} /> Prescribed Meds
                        </h4>
                        <div className="space-y-2">
                          {appt.prescriptions[0].items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-primary-50/50 rounded-lg border border-primary-100/50">
                              <span className="text-xs font-bold text-navy-800">{item.medicine_name}</span>
                              <span className="text-[10px] font-medium text-primary-600">{item.dosage} · {item.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  {appt.clinical_notes && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Clinical Notes</h4>
                      <p className="text-sm text-navy-600 leading-relaxed italic bg-navy-50 p-4 rounded-xl">
                        "{appt.clinical_notes}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Clock({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
