
import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingSettings {
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  logoUrl: string;
  heroBgUrl: string;
  legacyTitle: string;
  primaryColor: string;
  accentColor: string;
}

const DEFAULT_SETTINGS: BrandingSettings = {
  companyName: 'Monte Hub',
  tagline: 'Patrimónios',
  heroTitle: 'Onde o Legado Encontra o Destino',
  heroSubtitle: 'Onde o Legado Encontra o Destino', // Fallback for components using different labels
  heroDescription: 'A Monte Hub curadoria de patrimónios. Descubra a nova era do imobiliário de luxo em Moçambique.',
  logoUrl: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/building-2.svg',
  heroBgUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600',
  legacyTitle: 'Curadoria de Ativos Premium',
  primaryColor: '#0052FF', // market-blue
  accentColor: '#FF3B30',  // market-accent
};

interface BrandingContextType {
  settings: BrandingSettings;
  updateSettings: (newSettings: Partial<BrandingSettings>) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrandingSettings>(() => {
    const saved = localStorage.getItem('monte_branding_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<BrandingSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('monte_branding_settings', JSON.stringify(updated));
      return updated;
    });
    
    // Sync with old logo listener just in case
    if (newSettings.logoUrl) {
      window.dispatchEvent(new CustomEvent('monteLogoUpdated', { detail: newSettings.logoUrl }));
    }
  };

  // Sync colors with CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--market-blue', settings.primaryColor);
    document.documentElement.style.setProperty('--market-accent', settings.accentColor);
  }, [settings.primaryColor, settings.accentColor]);

  return (
    <BrandingContext.Provider value={{ settings, updateSettings }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) throw new Error('useBranding must be used within a BrandingProvider');
  return context;
};
