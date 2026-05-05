import React, { useState } from 'react';
import { User, Clock, Activity, AlertTriangle, CheckCircle2, TrendingUp, MoreVertical, Calendar, Coffee, Wifi, X, FileText, HeartPulse } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const doctorProfile = {
  name: 'Dr. Sarah Smith',
  specialty: 'Cardiology',
  patientsSeen: 14,
  totalPatients: 22,
};

const schedule = [
  { 
    id: 'p1', name: 'John Doe', time: '09:00 AM', type: 'Consultation', status: 'completed', priority: 'P3', priorityLabel: 'Routine',
    symptoms: 'Mild chest pain, occasional shortness of breath.', severity: 'Moderate', history: 'No previous heart conditions. Mild hypertension.',
    vitals: { hr: 78, bp: '120/80', temp: '98.6°F' }
  },
  { 
    id: 'p2', name: 'Jane Smith', time: '09:30 AM', type: 'Follow-up', status: 'completed', priority: 'P3', priorityLabel: 'Routine',
    symptoms: 'Routine checkup for blood pressure medication.', severity: 'Mild', history: 'Diagnosed with hypertension 2 years ago.',
    vitals: { hr: 65, bp: '130/85', temp: '98.2°F' }
  },
  { 
    id: 'p3', name: 'Robert Johnson', time: '10:00 AM', type: 'Emergency', status: 'in-progress', priority: 'P1', priorityLabel: 'Urgent',
    symptoms: 'Severe sharp pain in the center of the chest radiating to left arm. Sweating profusely.', severity: 'Severe', history: 'Type 2 Diabetes, previous mild heart attack in 2021.',
    vitals: { hr: 110, bp: '160/95', temp: '99.1°F' }
  },
  { 
    id: 'p4', name: 'Emily Davis', time: '10:45 AM', type: 'Consultation', status: 'waiting', priority: 'P2', priorityLabel: 'Elevated',
    symptoms: 'Palpitations and dizziness when standing up quickly.', severity: 'Moderate', history: 'Anemia, takes iron supplements.',
    vitals: { hr: 92, bp: '110/70', temp: '98.4°F' }
  },
  { 
    id: 'p5', name: 'Michael Brown', time: '11:15 AM', type: 'Check-up', status: 'waiting', priority: 'P3', priorityLabel: 'Routine',
    symptoms: 'Annual physical examination.', severity: 'Mild', history: 'Family history of heart disease.',
    vitals: { hr: 72, bp: '118/75', temp: '98.6°F' }
  },
  { 
    id: 'p6', name: 'Jessica Wilson', time: '11:45 AM', type: 'Consultation', status: 'waiting', priority: 'P3', priorityLabel: 'Routine',
    symptoms: 'Persistent dry cough, mild fatigue.', severity: 'Mild', history: 'Asthma, uses inhaler occasionally.',
    vitals: { hr: 80, bp: '122/82', temp: '98.8°F' }
  },
];

const fatigue = {
  score: 78, // High fatigue
  hoursActive: '4.5',
  patientsConsecutive: 4,
};

export default function DoctorDashboard() {
  const [availabilityStatus, setAvailabilityStatus] = useState<'active' | 'break'>('active');
  const [selectedPatient, setSelectedPatient] = useState<typeof schedule[0] | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [showFullChart, setShowFullChart] = useState(false);
  const [prescription, setPrescription] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const handlePatientSelect = (patient: typeof schedule[0]) => {
    setSelectedPatient(patient);
    setIsConsulting(false);
    setShowFullChart(false);
    setPrescription('');
    setFollowUpDate('');
  };

  const closePanel = () => {
    setSelectedPatient(null);
    setShowFullChart(false);
  };

  const toggleAvailability = () => {
    setAvailabilityStatus(s => s === 'active' ? 'break' : 'active');
  };
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'P1': return 'bg-status-error/10 text-status-error border-status-error/20';
      case 'P2': return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      default: return 'bg-navy-50 text-navy-500 border-navy-100';
    }
  };

  const getStatusIndicator = (s: string) => {
    switch (s) {
      case 'completed': return <CheckCircle2 size={18} className="text-status-open" />;
      case 'in-progress': return <Activity size={18} className="text-primary-500 animate-pulse" />;
      default: return <Clock size={18} className="text-navy-300" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-sans tracking-tight">{doctorProfile.name}</h1>
          <p className="text-navy-500 flex items-center gap-2 mt-1">
            <User size={16} /> {doctorProfile.specialty} | <Calendar size={16} className="ml-2" /> Today's Shift
          </p>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          {/* Availability Toggle */}
          <button
            onClick={toggleAvailability}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
              availabilityStatus === 'active'
                ? 'border-status-open text-status-open hover:bg-status-open hover:text-white'
                : 'border-status-warning text-status-warning hover:bg-status-warning hover:text-white bg-status-warning/10'
            )}
          >
            {availabilityStatus === 'active'
              ? <><Wifi size={16} /> Mark as On Break</>
              : <><Coffee size={16} /> Mark as Available</>
            }
          </button>

          {/* Status badge */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold',
            availabilityStatus === 'active'
              ? 'bg-status-open/10 text-status-open'
              : 'bg-status-warning/10 text-status-warning'
          )}>
            {availabilityStatus === 'active'
              ? <><span className="w-2 h-2 rounded-full bg-status-open animate-pulse inline-block" /> Available</>
              : <><Coffee size={16} /> On Break</>
            }
          </div>

          <div className="bg-surface p-4 rounded-xl shadow-skyline border border-navy-100 flex flex-col min-w-[140px]">
            <span className="text-navy-500 text-sm font-medium">Patients Seen</span>
            <span className="text-2xl font-bold text-primary-600">{doctorProfile.patientsSeen} <span className="text-sm font-normal text-navy-400">/ {doctorProfile.totalPatients}</span></span>
          </div>
          <div className="bg-surface p-4 rounded-xl shadow-skyline border border-navy-100 flex flex-col min-w-[140px]">
            <span className="text-navy-500 text-sm font-medium">Efficiency</span>
            <span className="text-2xl font-bold text-status-open">94%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Today's Schedule</h2>
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700">View All</button>
          </div>
          
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
            <div className="p-0">
              {schedule.map(patient => (
                <div 
                  key={patient.id} 
                  onClick={() => handlePatientSelect(patient)}
                  className={cn(
                    "flex items-center justify-between p-5 border-b border-navy-100 last:border-0 hover:bg-navy-50 transition-colors cursor-pointer",
                    patient.status === 'in-progress' && "bg-primary-50/50"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-16">
                      <span className="text-sm font-bold text-navy-900">{patient.time.split(' ')[0]}</span>
                      <span className="text-xs font-medium text-navy-400">{patient.time.split(' ')[1]}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-navy-900">{patient.name}</span>
                      <span className="text-sm text-navy-500">{patient.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className={cn("hidden sm:flex px-2.5 py-1 rounded-md text-xs font-semibold border items-center gap-1.5", getPriorityColor(patient.priority))}>
                      {patient.priority} - {patient.priorityLabel}
                    </span>
                    <span className={cn("sm:hidden px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5", getPriorityColor(patient.priority))}>
                      {patient.priority}
                    </span>
                    
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-navy-100 shadow-sm shrink-0">
                      {getStatusIndicator(patient.status)}
                    </div>
                    
                    <button className="text-navy-300 hover:text-navy-600 transition-colors shrink-0">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fatigue & Workload Analytics */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Fatigue Monitor</h2>
          
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6 relative overflow-hidden">
            
            {/* Subtle alert background if fatigue is high */}
            {fatigue.score > 75 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-status-warning"></div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-navy-900 font-semibold">Real-Time Score</h3>
              {fatigue.score > 75 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-status-warning bg-status-warning/10 px-2 py-1 rounded-md">
                  <AlertTriangle size={14} /> ELEVATED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-status-open bg-status-open/10 px-2 py-1 rounded-md">
                  <CheckCircle2 size={14} /> OPTIMAL
                </span>
              )}
            </div>

            {/* Gauge representation */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#eff1f4" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke={fatigue.score > 75 ? "#f59e0b" : "#22c55e"} 
                    strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * fatigue.score) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-navy-900">{fatigue.score}</span>
                  <span className="text-xs font-medium text-navy-400 uppercase tracking-wider">Index</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-navy-50 rounded-lg p-4 flex flex-col">
                <span className="text-xs font-medium text-navy-500 mb-1">Time Active</span>
                <span className="text-lg font-bold text-navy-900 flex items-center gap-2">
                  <Clock size={16} className="text-primary-500" /> {fatigue.hoursActive}h
                </span>
              </div>
              <div className="bg-navy-50 rounded-lg p-4 flex flex-col">
                <span className="text-xs font-medium text-navy-500 mb-1">Consecutive</span>
                <span className="text-lg font-bold text-navy-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-status-warning" /> {fatigue.patientsConsecutive} pts
                </span>
              </div>
            </div>

            {fatigue.score > 75 && (
              <div className="mt-6 p-4 bg-status-warning/10 border border-status-warning/20 rounded-xl">
                <h4 className="text-sm font-bold text-status-warning mb-1">Action Recommended</h4>
                <p className="text-xs text-status-warning/80">
                  Your fatigue score indicates potential burnout. The system has automatically reduced your booking priority for the next hour to stabilize load.
                </p>
                <button className="mt-3 w-full py-2 bg-white text-status-warning border border-status-warning text-sm font-medium rounded-lg hover:bg-status-warning hover:text-white transition-colors">
                  Acknowledge
                </button>
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* Patient Details Side Panel */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm transition-opacity" onClick={closePanel} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slide-left_0.3s_ease-out]">
            {/* Panel Header */}
            <div className="p-8 border-b border-navy-100 flex items-center justify-between bg-navy-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy-900">{selectedPatient.name}</h2>
                  <p className="text-sm text-navy-500">{selectedPatient.time} · {selectedPatient.type}</p>
                </div>
              </div>
              <button onClick={closePanel} className="p-2 hover:bg-navy-100 rounded-xl text-navy-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-auto p-8 space-y-6">
              {!isConsulting ? (
                <>
                  {/* Priority & Severity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface border border-navy-100 p-4 rounded-xl shadow-sm">
                      <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">System Priority</p>
                      <p className={cn("text-lg font-black flex items-center gap-2", 
                        selectedPatient.priority === 'P1' ? 'text-status-error' : 
                        selectedPatient.priority === 'P2' ? 'text-status-warning' : 'text-primary-600'
                      )}>
                        {selectedPatient.priority}
                      </p>
                    </div>
                    <div className="bg-surface border border-navy-100 p-4 rounded-xl shadow-sm">
                      <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Reported Severity</p>
                      <p className="text-lg font-bold text-navy-900">{selectedPatient.severity}</p>
                    </div>
                  </div>

                  {/* Vitals Snapshot */}
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2"><HeartPulse size={16} className="text-status-error" /> Latest Vitals</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-navy-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] font-bold text-navy-400 uppercase">HR</p>
                        <p className="text-sm font-bold text-navy-900">{selectedPatient.vitals.hr} <span className="text-[10px] font-normal text-navy-400">bpm</span></p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] font-bold text-navy-400 uppercase">BP</p>
                        <p className="text-sm font-bold text-navy-900">{selectedPatient.vitals.bp}</p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] font-bold text-navy-400 uppercase">Temp</p>
                        <p className="text-sm font-bold text-navy-900">{selectedPatient.vitals.temp}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-navy-100" />

                  {/* Patient Input Data */}
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2"><FileText size={16} className="text-primary-600" /> Patient-Reported Data</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Reason for Visit / Symptoms</p>
                        <div className="p-3 bg-primary-50/50 border border-primary-100 rounded-lg text-sm text-navy-800">
                          {selectedPatient.symptoms}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Brief Medical History</p>
                        <div className="p-3 bg-navy-50 border border-navy-100 rounded-lg text-sm text-navy-700">
                          {selectedPatient.history || 'No medical history provided.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2"><FileText size={16} className="text-primary-600" /> E-Prescription</h3>
                    <textarea 
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="Enter medications, dosage instructions, and clinical notes here..."
                      className="w-full h-40 p-4 bg-navy-50 border border-navy-200 rounded-xl text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2"><Calendar size={16} className="text-primary-600" /> Follow-up Schedule</h3>
                    <div className="p-4 bg-surface border border-navy-100 rounded-xl shadow-sm">
                      <label className="block text-[10px] font-bold text-navy-400 uppercase mb-2">Select Date</label>
                      <input 
                        type="date" 
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full p-3 bg-navy-50 border border-navy-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                      />
                      <p className="text-xs text-navy-400 mt-2">The patient will receive an automated booking link for this date.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-navy-100 bg-white space-y-3">
              {!isConsulting ? (
                <>
                  <button onClick={() => setIsConsulting(true)} className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                    <Activity size={18} /> Start Consultation
                  </button>
                  <button onClick={() => setShowFullChart(true)} className="w-full py-3.5 border-2 border-navy-100 text-navy-600 font-bold rounded-xl hover:bg-navy-50 hover:border-navy-200 transition-all">
                    View Full Chart
                  </button>
                </>
              ) : (
                <button onClick={closePanel} className="w-full py-3.5 bg-status-open hover:bg-status-open/90 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Complete & Send Prescription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Chart Modal */}
      {showFullChart && selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowFullChart(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full animate-[fade-in_0.2s_ease-out]">
            <div className="p-6 border-b border-navy-100 flex items-center justify-between bg-navy-50 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-navy-900">Comprehensive Patient Chart</h2>
                <p className="text-sm text-navy-500">Patient: {selectedPatient.name}</p>
              </div>
              <button onClick={() => setShowFullChart(false)} className="p-2 hover:bg-navy-100 rounded-xl text-navy-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-surface">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Demographics & History */}
                <div className="space-y-6">
                  <div className="bg-white p-5 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-4 border-b border-navy-100 pb-2">Demographics</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-navy-500">DOB:</span> <span className="font-medium text-navy-900">12/04/1985 (39y)</span></div>
                      <div className="flex justify-between"><span className="text-navy-500">Gender:</span> <span className="font-medium text-navy-900">Male</span></div>
                      <div className="flex justify-between"><span className="text-navy-500">Blood Type:</span> <span className="font-medium text-status-error">O+</span></div>
                      <div className="flex justify-between"><span className="text-navy-500">Weight:</span> <span className="font-medium text-navy-900">185 lbs</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-4 border-b border-navy-100 pb-2">Active Problems</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-navy-800"><span className="w-1.5 h-1.5 rounded-full bg-status-warning" /> Hypertension (I10)</li>
                      <li className="flex items-center gap-2 text-navy-800"><span className="w-1.5 h-1.5 rounded-full bg-status-warning" /> Type 2 Diabetes (E11.9)</li>
                    </ul>
                  </div>

                  <div className="bg-white p-5 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-4 border-b border-navy-100 pb-2">Current Medications</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="text-navy-800">
                        <span className="font-bold">Lisinopril</span> 10mg
                        <p className="text-[10px] text-navy-500">1 tablet daily</p>
                      </li>
                      <li className="text-navy-800">
                        <span className="font-bold">Metformin</span> 500mg
                        <p className="text-[10px] text-navy-500">Take with meals, twice daily</p>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Past Visits & Clinical Notes */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-5 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2"><Clock size={16} className="text-primary-600"/> Encounter History</h3>
                    
                    <div className="space-y-4">
                      {/* Past Visit 1 */}
                      <div className="p-4 bg-navy-50 rounded-lg border border-navy-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-navy-900 text-sm">Follow-up Consultation</span>
                          <span className="text-xs font-bold text-navy-400 bg-white px-2 py-1 rounded border border-navy-100">Oct 14, 2025</span>
                        </div>
                        <p className="text-sm text-navy-700 mb-2">Patient reported feeling dizzy in the mornings. Adjusted Lisinopril dosage. Blood pressure was slightly elevated.</p>
                        <div className="flex gap-2 text-[10px] font-bold text-navy-500 uppercase">
                          <span className="px-2 py-0.5 bg-white rounded border border-navy-200">BP: 135/85</span>
                          <span className="px-2 py-0.5 bg-white rounded border border-navy-200">HR: 72</span>
                        </div>
                      </div>

                      {/* Past Visit 2 */}
                      <div className="p-4 bg-navy-50 rounded-lg border border-navy-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-navy-900 text-sm">Annual Wellness Visit</span>
                          <span className="text-xs font-bold text-navy-400 bg-white px-2 py-1 rounded border border-navy-100">Mar 02, 2025</span>
                        </div>
                        <p className="text-sm text-navy-700 mb-2">Routine checkup. Labs drawn. A1C improved to 6.8%. Patient advised to continue current diet and exercise regimen.</p>
                        <div className="flex gap-2 text-[10px] font-bold text-navy-500 uppercase">
                          <span className="px-2 py-0.5 bg-white rounded border border-navy-200">Labs Normal</span>
                          <span className="px-2 py-0.5 bg-white rounded border border-navy-200">Weight: 188 lbs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-4">Diagnostic Reports</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 p-3 border border-navy-100 rounded-lg flex items-center justify-between hover:bg-navy-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-status-open" />
                          <span className="text-sm font-bold text-navy-800">CBC Panel</span>
                        </div>
                        <span className="text-[10px] text-navy-400">Mar 02</span>
                      </div>
                      <div className="flex-1 p-3 border border-navy-100 rounded-lg flex items-center justify-between hover:bg-navy-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-primary-600" />
                          <span className="text-sm font-bold text-navy-800">ECG Results</span>
                        </div>
                        <span className="text-[10px] text-navy-400">Oct 14</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="p-4 border-t border-navy-100 flex justify-end bg-white rounded-b-2xl">
              <button onClick={() => setShowFullChart(false)} className="px-6 py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 font-bold rounded-xl transition-colors">
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
