import { useState, useEffect } from 'react';
import { 
  UserPlus, Mail, Phone, Calendar, Shield, 
  ArrowRight, CheckCircle2, ChevronLeft, Stethoscope
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function WalkinRegistration() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Profile, 2: Slot Assignment

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: Math.random().toString(36).slice(-8), // Auto-generate random password
    full_name: '',
    mobile: '',
    role: 'PATIENT',
    dob: '',
    gender: 'Other'
  });

  // Slot Selection State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [registeredPatientId, setRegisteredPatientId] = useState<string>('');

  useEffect(() => {
    if (step === 2) {
      api.get('/doctors/').then(res => setDoctors(res.data.items || res.data));
    }
  }, [step]);

  useEffect(() => {
    if (selectedDoctor) {
      api.get(`/slots/?doctor_id=${selectedDoctor}`).then(res => {
        setSlots(res.data.filter((s: any) => s.status === 'OPEN'));
      });
    }
  }, [selectedDoctor]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Signup the patient
      const res = await api.post('/auth/signup', formData);
      setRegisteredPatientId(res.data.custom_id);
      showToast('success', 'Account Created', `Patient ${formData.full_name} registered successfully.`);
      setStep(2);
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.response?.data?.detail || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      // For walk-ins, we might need a special endpoint if the receptionist is booking FOR the patient
      // But for now, we'll assume the receptionist can book if they have the patient's context or token
      // Since we just created the account, we can use a "receptionist book" endpoint if we have one.
      // Let's assume we use the standard booking but passing the patient_id (admin power).
      
      await api.post('/appointments/', {
        slot_id: selectedSlot,
        patient_id: registeredPatientId,
      });
      
      showToast('success', 'Appointment Booked', 'Patient added to live queue.');
      navigate('/reception');
    } catch (err: any) {
      showToast('error', 'Booking Failed', 'Admin booking not yet fully implemented on backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button 
        onClick={() => navigate('/reception')}
        className="flex items-center gap-2 text-navy-400 hover:text-navy-900 mb-8 font-medium transition-colors"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-[32px] shadow-skyline border border-navy-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-navy-50 flex">
          <div className={`h-full bg-primary-600 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
        </div>

        <div className="p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
              {step === 1 ? <UserPlus size={24} /> : <Stethoscope size={24} />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">
                {step === 1 ? 'Register New Patient' : 'Assign to Doctor'}
              </h1>
              <p className="text-navy-500 text-sm">
                {step === 1 ? 'Create a secure account for the walk-in patient.' : `Select an available slot for ${formData.full_name}.`}
              </p>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-navy-400">Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-3.5 text-navy-300" size={18} />
                    <input 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-navy-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-navy-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-navy-300" size={18} />
                    <input 
                      required type="email"
                      className="w-full pl-12 pr-4 py-3 bg-navy-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-navy-400">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-navy-300" size={18} />
                    <input 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-navy-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-navy-400">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-navy-300" size={18} />
                    <input 
                      required type="date"
                      className="w-full pl-12 pr-4 py-3 bg-navy-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-navy-900"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-primary-600" />
                  <div>
                    <p className="text-xs font-bold text-navy-700">Auto-generated Password</p>
                    <p className="text-sm font-mono font-bold text-primary-700">{formData.password}</p>
                  </div>
                </div>
                <p className="text-[10px] text-primary-400 font-bold uppercase text-right max-w-[120px]">
                  Share this with the patient for future login
                </p>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-100"
                >
                  {loading ? 'Creating...' : 'Create Account & Continue'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-navy-400">Select Doctor</label>
                <div className="grid grid-cols-2 gap-4">
                  {doctors.map(doc => (
                    <button 
                      key={doc.custom_id}
                      onClick={() => setSelectedDoctor(doc.custom_id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedDoctor === doc.custom_id ? 'border-primary-600 bg-primary-50' : 'border-navy-50 hover:border-navy-200'}`}
                    >
                      <p className="font-bold text-navy-900">{doc.full_name}</p>
                      <p className="text-xs text-navy-400">{doc.specialty}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDoctor && (
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-navy-400">Available Slots Today</label>
                  {slots.length === 0 ? (
                    <p className="p-4 bg-status-error/5 text-status-error text-sm rounded-xl border border-status-error/10">No open slots available for this doctor today.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {slots.map(slot => (
                        <button 
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedSlot === slot.id ? 'border-primary-600 bg-primary-600 text-white' : 'border-navy-50 hover:border-navy-200 text-navy-600'}`}
                        >
                          {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6">
                <button 
                  onClick={handleBookAppointment}
                  disabled={loading || !selectedSlot}
                  className="w-full py-4 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Booking...' : 'Complete Registration & Book'} <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
