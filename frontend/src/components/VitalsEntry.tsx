import React from 'react';
import { Activity, Thermometer, Weight, Wind } from 'lucide-react';

interface Vitals {
  bp_systolic: string;
  bp_diastolic: string;
  heart_rate: string;
  spo2: string;
  temperature: string;
  weight: string;
}

interface Props {
  vitals: Vitals;
  onChange: (vitals: Vitals) => void;
}

export default function VitalsEntry({ vitals, onChange }: Props) {
  const handleChange = (field: keyof Vitals, value: string) => {
    onChange({ ...vitals, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
        <Activity size={16} className="text-status-error" /> Patient Vitals
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Blood Pressure (S/D)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={vitals.bp_systolic}
              onChange={(e) => handleChange('bp_systolic', e.target.value)}
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
              placeholder="120"
            />
            <span className="text-navy-300">/</span>
            <input 
              type="number"
              value={vitals.bp_diastolic}
              onChange={(e) => handleChange('bp_diastolic', e.target.value)}
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
              placeholder="80"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Heart Rate (BPM)</label>
          <div className="relative">
            <Activity className="absolute left-2.5 top-2.5 text-navy-300" size={14} />
            <input 
              type="number"
              value={vitals.heart_rate}
              onChange={(e) => handleChange('heart_rate', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-navy-200 rounded-lg text-sm"
              placeholder="72"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">SpO2 (%)</label>
          <div className="relative">
            <Wind className="absolute left-2.5 top-2.5 text-navy-300" size={14} />
            <input 
              type="number"
              value={vitals.spo2}
              onChange={(e) => handleChange('spo2', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-navy-200 rounded-lg text-sm"
              placeholder="98"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Temperature (°C)</label>
          <div className="relative">
            <Thermometer className="absolute left-2.5 top-2.5 text-navy-300" size={14} />
            <input 
              type="number"
              step="0.1"
              value={vitals.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-navy-200 rounded-lg text-sm"
              placeholder="36.6"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Weight (kg)</label>
          <div className="relative">
            <Weight className="absolute left-2.5 top-2.5 text-navy-300" size={14} />
            <input 
              type="number"
              step="0.1"
              value={vitals.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-navy-200 rounded-lg text-sm"
              placeholder="70.0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
