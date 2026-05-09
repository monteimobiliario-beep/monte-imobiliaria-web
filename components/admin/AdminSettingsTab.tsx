import React from 'react';
import { Palette, ImageIcon, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { ImageUploadField } from '../ImageUploadField';

interface AdminSettingsTabProps {
  tempSettings: any;
  setTempSettings: (settings: any) => void;
  isBrandingSaving: boolean;
  handleSaveBranding: () => void;
  meshStyle: React.CSSProperties;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ tempSettings, setTempSettings, isBrandingSaving, handleSaveBranding, meshStyle }) => (
  <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-right-10 duration-700">
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 md:p-16" style={meshStyle}>
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-market-blue rounded-3xl flex items-center justify-center text-white shadow-xl">
          <Palette size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-market-navy tracking-tight uppercase">Gestão da <span className="text-market-blue">Marca</span></h2>
          <p className="text-xs font-bold text-market-slate uppercase tracking-widest">Painel de Controlo de Identidade e Conteúdo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-market-blue uppercase tracking-[0.4em] mb-4">Informação Institucional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Nome da Empresa</label>
                <input value={tempSettings.companyName} onChange={e => setTempSettings({...tempSettings, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Tagline / Legado</label>
                <input value={tempSettings.tagline} onChange={e => setTempSettings({...tempSettings, tagline: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-market-blue uppercase tracking-[0.4em] mb-4">Conteúdo Hero</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Título Hero</label>
                <input value={tempSettings.heroTitle} onChange={e => setTempSettings({...tempSettings, heroTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">Descrição Hero</label>
                <textarea value={tempSettings.heroDescription} onChange={e => setTempSettings({...tempSettings, heroDescription: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm focus:ring-4 focus:ring-market-blue/10 outline-none h-32 resize-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold text-market-blue uppercase tracking-[0.4em] mb-4">Ativos Visuais</h4>
            <div className="space-y-4">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1 flex items-center gap-2">Logomarca <ImageIcon size={12} /></label>
                <ImageUploadField value={tempSettings.logoUrl} onChange={url => setTempSettings({...tempSettings, logoUrl: url})} bucket="monte-assets" />
                <input value={tempSettings.logoUrl} onChange={e => setTempSettings({...tempSettings, logoUrl: e.target.value})} placeholder="URL direta..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none" />
              </div>
              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1 flex items-center gap-2">Favicon <LinkIcon size={12} /></label>
                <ImageUploadField value={tempSettings.faviconUrl} onChange={url => setTempSettings({...tempSettings, faviconUrl: url})} bucket="monte-assets" />
                <input value={tempSettings.faviconUrl} onChange={e => setTempSettings({...tempSettings, faviconUrl: e.target.value})} placeholder="URL favicon..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none" />
              </div>
            </div>
          </div>

          <button onClick={handleSaveBranding} disabled={isBrandingSaving} className="market-button market-button-primary w-full py-6 text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl">
            {isBrandingSaving ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> Sincronizar Tudo</>}
          </button>
        </div>

        <div className="space-y-10">
          <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200 shadow-inner flex flex-col items-center">
            <h5 className="text-[9px] font-bold text-market-slate uppercase tracking-widest mb-8">Preview de Logotipo</h5>
            <div className="w-full h-48 flex items-center justify-center group overflow-hidden">
              <img src={tempSettings.logoUrl || undefined} alt="Logo Preview" className="max-w-[120px] max-h-full object-contain transition-transform group-hover:scale-110" />
            </div>
            
            <h5 className="text-[9px] font-bold text-market-slate uppercase tracking-widest mt-12 mb-8">Cores Corporativas</h5>
            <div className="flex gap-6">
              <div className="space-y-3 flex flex-col items-center">
                <input type="color" value={tempSettings.primaryColor} onChange={e => setTempSettings({...tempSettings, primaryColor: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl" />
                <span className="text-[8px] font-bold text-market-slate uppercase">Primária</span>
              </div>
              <div className="space-y-3 flex flex-col items-center">
                <input type="color" value={tempSettings.accentColor} onChange={e => setTempSettings({...tempSettings, accentColor: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl" />
                <span className="text-[8px] font-bold text-market-slate uppercase">Acento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
