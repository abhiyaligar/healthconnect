import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../api';

interface ICDCode {
  code: str;
  description: str;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ICDAutoComplete({ value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<ICDCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchICD = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/clinical/icd10?query=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error('ICD search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchICD, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: ICDCode) => {
    const selectedValue = `${item.code} - ${item.description}`;
    setQuery(selectedValue);
    onChange(selectedValue);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-navy-900 mb-2">Diagnosis (ICD-10 Search)</label>
      <div className="relative">
        <Search className="absolute left-3 top-3 text-navy-400" size={18} />
        <input 
          type="text" 
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full pl-10 pr-10 py-3 border border-navy-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20"
          placeholder="Search for diagnosis or ICD code..."
        />
        {loading && <Loader2 className="absolute right-3 top-3 text-primary-500 animate-spin" size={18} />}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-navy-100 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
          {results.map((item) => (
            <button
              key={item.code}
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-primary-50 transition-colors border-b border-navy-50 last:border-0"
            >
              <span className="font-bold text-primary-700">{item.code}</span>
              <p className="text-navy-600 truncate">{item.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
