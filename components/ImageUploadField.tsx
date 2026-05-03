
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, Loader2, X, Check } from 'lucide-react';
import { uploadImage, formatImageUrl } from '../imageUtils';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  placeholder?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  className = "", 
  placeholder = "https://..." 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const publicUrl = await uploadImage(file);
      onChange(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || 'Falha no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawUrl = e.target.value;
    onChange(rawUrl);
  };

  const handleBlur = () => {
    if (value) {
      const formatted = formatImageUrl(value);
      if (formatted !== value) {
        onChange(formatted);
      }
    }
  };

  const clearImage = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1 flex justify-between">
        {label}
        {isUploading && <span className="flex items-center gap-1 text-market-blue lowercase animate-pulse"><Loader2 size={10} className="animate-spin" /> enviando...</span>}
      </label>
      
      <div className="relative group">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <LinkIcon size={14} />
            </div>
            <input 
              type="text" 
              value={value} 
              onChange={handleUrlChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all"
            />
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-market-blue transition-all flex items-center justify-center gap-2 group/btn"
            title="Carregar da Galeria"
          >
            <Upload size={16} className="group-hover/btn:scale-110 transition-transform" />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Galeria</span>
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {value && (
          <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group/preview shadow-inner">
            <img 
              src={formatImageUrl(value)} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=1000&auto=format&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button 
                type="button" 
                onClick={clearImage}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-market-accent text-white text-[8px] font-black uppercase rounded shadow-lg flex items-center gap-1">
              <Check size={8} /> Pronto
            </div>
          </div>
        )}

        {error && (
          <p className="mt-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 p-2 rounded-lg border border-rose-100">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
