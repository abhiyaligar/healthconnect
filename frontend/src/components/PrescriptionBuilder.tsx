import React, { useState } from 'react';
import { Plus, Trash2, Pill } from 'lucide-react';

interface PrescriptionItem {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Props {
  items: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
}

export default function PrescriptionBuilder({ items, onChange }: Props) {
  const addItem = () => {
    onChange([...items, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
          <Pill size={16} className="text-primary-600" /> Prescriptions
        </h3>
        <button 
          onClick={addItem}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <Plus size={14} /> Add Medicine
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 bg-navy-50 rounded-xl border border-navy-100 space-y-3 relative group">
            <button 
              onClick={() => removeItem(idx)}
              className="absolute top-2 right-2 p-1 text-navy-300 hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Medicine Name</label>
                <input 
                  type="text"
                  value={item.medicine_name}
                  onChange={(e) => updateItem(idx, 'medicine_name', e.target.value)}
                  className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Dosage</label>
                <input 
                  type="text"
                  value={item.dosage}
                  onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                  className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
                  placeholder="500mg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Frequency</label>
                <input 
                  type="text"
                  value={item.frequency}
                  onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
                  placeholder="1-0-1"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Duration</label>
                <input 
                  type="text"
                  value={item.duration}
                  onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                  className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
                  placeholder="5 days"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-400 uppercase mb-1">Instructions</label>
                <input 
                  type="text"
                  value={item.instructions}
                  onChange={(e) => updateItem(idx, 'instructions', e.target.value)}
                  className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm"
                  placeholder="After food"
                />
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-navy-100 rounded-xl">
            <p className="text-xs text-navy-400">No medications added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
