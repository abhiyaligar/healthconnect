import React, { useState, useEffect } from 'react';
import { User, Clock, Activity, AlertTriangle, CheckCircle2, TrendingUp, MoreVertical, Calendar, Coffee, Wifi, X, FileText, HeartPulse } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PrescriptionBuilder from '../components/PrescriptionBuilder';
import VitalsEntry from '../components/VitalsEntry';
import ICDAutoComplete from '../components/ICDAutoComplete';
import MedicalTimeline from '../components/MedicalTimeline';
import { toISTTime } from '../utils/time';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Appointment {
  id: string;
  patient_id: string;
  slot_id: string;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  queue_token: string;
  priority_score: number;
  clinical_notes?: string;
  diagnosis?: string;
  actual_start_time?: string;
  slot?: {
    start_time: string;
    end_time: string;
  };
}

interface DoctorProfile {
  full_name: string;
  specialty: string;
  patientsSeen: number;
  totalPatients: number;
  avg_consultation_time: number;
}

export default function DoctorDashboard() {
  const { name: authName } = useAuth();
  const [availabilityStatus, setAvailabilityStatus] = useState<'active' | 'break'>('active');
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({ diagnosis: '', clinical_notes: '' });
  const [isConsulting, setIsConsulting] = useState(false);
  const [showFullChart, setShowFullChart] = useState(false);
  const [prescription, setPrescription] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [vitals, setVitals] = useState({
    bp_systolic: '', bp_diastolic: '', heart_rate: '', spo2: '', temperature: '', weight: ''
  });
  const [followUpDate, setFollowUpDate] = useState('');

  const handlePatientSelect = (appt: Appointment) => {
    setSelectedPatient(appt);
    setNotes({ diagnosis: appt.diagnosis || '', clinical_notes: appt.clinical_notes || '' });
    setIsConsulting(appt.status === 'IN_PROGRESS' || appt.status === 'COMPLETED');
    setShowFullChart(false);
    setPrescription('');
    setPrescriptionItems([]);
    setVitals({
      bp_systolic: '', bp_diastolic: '', heart_rate: '', spo2: '', temperature: '', weight: ''
    });
    setFollowUpDate('');
    
    // Fetch clinical details if they exist
    fetchClinicalDetails(appt.id, appt.patient_id);
  };

  const fetchClinicalDetails = async (apptId: string, patientId: string) => {
    try {
      const [vitalsRes, prescriptionRes] = await Promise.all([
        api.get(`/clinical/vitals/history/${patientId}`).then(res => res.data.find((v: any) => v.appointment_id === apptId)),
        api.get(`/clinical/prescription/${apptId}`)
      ]);

      if (vitalsRes) {
        setVitals({
          bp_systolic: vitalsRes.bp_systolic?.toString() || '',
          bp_diastolic: vitalsRes.bp_diastolic?.toString() || '',
          heart_rate: vitalsRes.heart_rate?.toString() || '',
          spo2: vitalsRes.spo2?.toString() || '',
          temperature: vitalsRes.temperature?.toString() || '',
          weight: vitalsRes.weight?.toString() || ''
        });
      }

      if (prescriptionRes.data) {
        setPrescription(prescriptionRes.data.notes || '');
        setPrescriptionItems(prescriptionRes.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch clinical details', err);
    }
  };

  const closePanel = () => {
    setSelectedPatient(null);
    setShowFullChart(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, apptsRes] = await Promise.all([
          api.get('/doctors/me'),
          api.get('/appointments/doctor/me')
        ]);
        setProfile(profileRes.data);
        setAppointments(apptsRes.data.items || apptsRes.data);
      } catch (err) {
        console.error('Failed to fetch doctor data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (selectedPatient?.patient_id) {
        try {
          const res = await api.get(`/history/${selectedPatient.patient_id}`);
          setPatientHistory(res.data.items || res.data);
        } catch (err) {
          console.error('Failed to fetch patient history');
        }
      }
    };
    fetchPatientHistory();
  }, [selectedPatient]);

  const handleStartConsultation = async (apptId: string) => {
    try {
      const res = await api.patch(`/appointments/${apptId}/call`);
      setAppointments(prev => prev.map(a => a.id === apptId ? res.data : a));
      setSelectedPatient(res.data);
      setIsConsulting(true);
    } catch (err) {
      alert('Failed to start consultation');
    }
  };

  const handleCompleteConsultation = async (apptId: string) => {
    try {
      const res = await api.patch(`/appointments/${apptId}/complete`);
      setAppointments(prev => prev.map(a => a.id === apptId ? res.data : a));
      setSelectedPatient(null);
      setIsConsulting(false);
    } catch (err) {
      alert('Failed to complete consultation');
    }
  };

  const handleUpdateNotes = async (apptId: string) => {
    try {
      // 1. Update basic clinical notes & diagnosis
      await api.patch(`/appointments/${apptId}/clinical-notes`, notes);
      
      // 2. Save Vitals if any were entered
      if (vitals.bp_systolic || vitals.heart_rate || vitals.spo2) {
        await api.post('/clinical/vitals', {
          appointment_id: apptId,
          patient_id: selectedPatient?.patient_id,
          ...Object.fromEntries(Object.entries(vitals).map(([k, v]) => [k, v === '' ? null : (k === 'temperature' || k === 'weight' ? parseFloat(v) : parseInt(v))]))
        });
      }

      // 3. Save Prescription if any items were added
      if (prescriptionItems.length > 0) {
        await api.post('/clinical/prescription', {
          appointment_id: apptId,
          patient_id: selectedPatient?.patient_id,
          doctor_id: profile?.custom_id,
          notes: prescription,
          items: prescriptionItems
        });
      }

      const res = await api.get(`/appointments/${apptId}`);
      setAppointments(prev => prev.map(a => a.id === apptId ? res.data : a));
      alert('Clinical data saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update notes');
    }
  };

  const toggleAvailability = () => {
    setAvailabilityStatus(s => s === 'active' ? 'break' : 'active');
  };

  const getPriorityColor = (score: number) => {
    if (score >= 10) return 'bg-status-error/10 text-status-error border-status-error/20';
    if (score >= 5) return 'bg-status-warning/10 text-status-warning border-status-warning/20';
    return 'bg-navy-50 text-navy-500 border-navy-100';
  };

  const getStatusIndicator = (s: string) => {
    switch (s) {
      case 'COMPLETED': return <CheckCircle2 size={18} className="text-status-open" />;
      case 'IN_PROGRESS': return <Activity size={18} className="text-primary-500 animate-pulse" />;
      default: return <Clock size={18} className="text-navy-300" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 font-sans tracking-tight">{profile?.full_name || authName}</h1>
          <p className="text-navy-500 flex items-center gap-2 mt-1">
            <User size={16} /> {profile?.specialty} | <Calendar size={16} className="ml-2" /> Today's Shift
          </p>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <button
            onClick={toggleAvailability}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
              availabilityStatus === 'active'
                ? 'border-status-open text-status-open hover:bg-status-open hover:text-white'
                : 'border-status-warning text-status-warning hover:bg-status-warning hover:text-white bg-status-warning/10'
            )}
          >
            {availabilityStatus === 'active' ? <><Wifi size={16} /> Go Offline</> : <><Coffee size={16} /> Go Online</>}
          </button>

          <div className="bg-surface p-4 rounded-xl shadow-skyline border border-navy-100 flex flex-col min-w-[140px]">
            <span className="text-navy-500 text-sm font-medium">Patients Seen</span>
            <span className="text-2xl font-bold text-primary-600">{completedCount} <span className="text-sm font-normal text-navy-400">/ {appointments.length}</span></span>
          </div>
          <div className="bg-surface p-4 rounded-xl shadow-skyline border border-navy-100 flex flex-col min-w-[140px]">
            <span className="text-navy-500 text-sm font-medium">Avg Time</span>
            <span className="text-2xl font-bold text-status-open">{profile?.avg_consultation_time}m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy-900">Today's Schedule</h2>
          </div>
          
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 overflow-hidden">
            <div className="p-0">
              {appointments.length === 0 ? (
                <div className="p-10 text-center text-navy-400">No appointments scheduled today.</div>
              ) : appointments.map(appt => (
                <div 
                  key={appt.id} 
                  onClick={() => handlePatientSelect(appt)}
                  className={cn(
                    "flex items-center justify-between p-5 border-b border-navy-100 last:border-0 hover:bg-navy-50 transition-colors cursor-pointer",
                    appt.status === 'IN_PROGRESS' && "bg-primary-50/50"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-16">
                      <span className="text-sm font-bold text-navy-900">{appt.slot ? toISTTime(appt.slot.start_time) : '--'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-navy-900">{appt.queue_token}</span>
                      <span className="text-sm text-navy-500">Patient ID: {appt.patient_id.split('-')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold border items-center gap-1.5", getPriorityColor(appt.priority_score))}>
                      Priority: {appt.priority_score}
                    </span>
                    
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-navy-100 shadow-sm shrink-0">
                      {getStatusIndicator(appt.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fatigue & Workload */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-900">System Insights</h2>
          <div className="bg-surface rounded-2xl shadow-skyline border border-navy-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-navy-900 font-semibold">Load Profile</h3>
              <span className="text-xs font-bold text-status-open bg-status-open/10 px-2 py-1 rounded-md">STABLE</span>
            </div>
            <p className="text-sm text-navy-500 leading-relaxed">
              Your average consultation time is currently **{profile?.avg_consultation_time} minutes**. The scheduling engine is automatically adjusting your slot durations to prevent overruns.
            </p>
          </div>
        </div>

      </div>

      {/* Patient Details Side Panel */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm transition-opacity" onClick={closePanel} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slide-left_0.3s_ease-out]">
            <div className="p-8 border-b border-navy-100 flex items-center justify-between bg-navy-50">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Consultation</h2>
                <p className="text-sm text-navy-500">{selectedPatient.queue_token} · {selectedPatient.status}</p>
              </div>
              <button onClick={closePanel} className="p-2 hover:bg-navy-100 rounded-xl text-navy-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-6">
              {!isConsulting ? (
                <>
                  {/* Priority & Severity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface border border-navy-100 p-4 rounded-xl shadow-sm">
                      <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">System Priority</p>
                      <p className={cn("text-lg font-black flex items-center gap-2", 
                        selectedPatient.priority_score >= 10 ? 'text-status-error' : 
                        selectedPatient.priority_score >= 5 ? 'text-status-warning' : 'text-primary-600'
                      )}>
                        P{selectedPatient.priority_score}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-navy-100" />

                  {/* Patient Input Data */}
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2"><FileText size={16} className="text-primary-600" /> Appointment Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Diagnosis</p>
                        <div className="p-3 bg-primary-50/50 border border-primary-100 rounded-lg text-sm text-navy-800">
                          {selectedPatient.diagnosis || 'No diagnosis recorded.'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-navy-400 uppercase mb-1">Clinical Notes</p>
                        <div className="p-3 bg-navy-50 border border-navy-100 rounded-lg text-sm text-navy-700">
                          {selectedPatient.clinical_notes || 'No clinical notes recorded.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
                  <div className="space-y-8">
                    <VitalsEntry vitals={vitals} onChange={setVitals} />
                    
                    <div className="w-full h-px bg-navy-100" />
                    
                    <ICDAutoComplete value={notes.diagnosis} onChange={(val) => setNotes(n => ({...n, diagnosis: val}))} />
                    
                    <div className="w-full h-px bg-navy-100" />
                    
                    <div>
                      <label className="block text-sm font-bold text-navy-900 mb-2">Clinical Consultation Notes</label>
                      <textarea 
                        rows={5}
                        value={notes.clinical_notes}
                        onChange={(e) => setNotes(n => ({...n, clinical_notes: e.target.value}))}
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl text-sm resize-none"
                        placeholder="Detailed consultation notes..."
                      />
                    </div>

                    <div className="w-full h-px bg-navy-100" />

                    <PrescriptionBuilder items={prescriptionItems} onChange={setPrescriptionItems} />

                    <button 
                      onClick={() => handleUpdateNotes(selectedPatient.id)}
                      className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
                    >
                      Save Clinical Records
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-navy-100 bg-white space-y-3">
              {selectedPatient.status === 'CONFIRMED' && (
                <>
                  <button 
                    onClick={() => handleStartConsultation(selectedPatient.id)}
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Activity size={18} /> Start Consultation
                  </button>
                  <button onClick={() => setShowFullChart(true)} className="w-full py-3.5 border-2 border-navy-100 text-navy-600 font-bold rounded-xl hover:bg-navy-50 hover:border-navy-200 transition-all">
                    View Full Chart
                  </button>
                </>
              )}
              {selectedPatient.status === 'IN_PROGRESS' && (
                <button 
                  onClick={() => handleCompleteConsultation(selectedPatient.id)}
                  className="w-full py-3.5 bg-status-open hover:bg-status-open/90 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Complete & Close
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
                <p className="text-sm text-navy-500">Patient: {selectedPatient.patient_id}</p>
              </div>
              <button onClick={() => setShowFullChart(false)} className="p-2 hover:bg-navy-100 rounded-xl text-navy-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-surface">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Demographics & Meds */}
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

                {/* Center/Right Column: Timeline & History */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-8 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-8 flex items-center gap-2">
                      <Activity size={18} className="text-primary-600" /> Longitudinal Clinical Timeline
                    </h3>
                    <MedicalTimeline history={patientHistory} />
                  </div>

                  <div className="bg-white p-5 border border-navy-100 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2"><Clock size={16} className="text-primary-600"/> Encounter History</h3>
                    <div className="space-y-4">
                      {/* Placeholder past visits */}
                      <div className="p-4 bg-navy-50 rounded-lg border border-navy-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-navy-900 text-sm">Follow-up Consultation</span>
                          <span className="text-xs font-bold text-navy-400 bg-white px-2 py-1 rounded border border-navy-100">Oct 14, 2025</span>
                        </div>
                        <p className="text-sm text-navy-700 mb-2">Patient reported feeling dizzy in the mornings. Adjusted Lisinopril dosage.</p>
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
    </div>
  );
}
