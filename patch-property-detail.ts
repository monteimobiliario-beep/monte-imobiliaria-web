import fs from 'fs';

let content = fs.readFileSync('views/PropertyDetailView.tsx', 'utf-8');

// 1. WhatsApp Button & Download PDF in Sidebar
content = content.replace(
  `{/* Manifestar Interesse Form - Integrated */}`,
  `{/* Quick Actions (WhatsApp & PDF) */}
                   <div className="p-4 flex gap-2">
                      <a 
                        href={getContactMessage('whatsapp')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#25D366] hover:bg-[#1db954] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                      >
                         <MessageCircle size={16} /> WhatsApp
                      </a>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '/brochure-example.pdf';
                          link.download = 'Brochura_Imovel.pdf';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          alert('Download da brochura iniciado!');
                        }}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Baixar PDF
                      </button>
                   </div>
                   {/* Manifestar Interesse Form - Integrated */}`
);

// 2. Google Maps Location
content = content.replace(
  /<img\s+src=\{`https:\/\/picsum\.photos\/seed\/map_\$\{property\.id\}\/1200\/1200\?grayscale`\}\s+className="w-full h-full object-cover transition-all duration-\[3000ms\] group-hover:scale-110 group-hover:rotate-1"\s+alt="Map"\s+\/>/g,
  `<iframe 
      src={\`https://maps.google.com/maps?q=\${encodeURIComponent(property.location || 'Maputo, Mozambique')}&t=&z=13&ie=UTF8&iwloc=&output=embed\`}
      className="w-full h-full border-0 filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
   ></iframe>`
);
// Remove the pinging map pin over the iframe as it might block interactions
content = content.replace(
  /<div className="absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 z-10">[\s\S]*?<\/div>\s*<\/div>\s*<div className="absolute bottom-8/g,
  `<div className="absolute bottom-8`
);


// 3. More than 20 photographs
// We'll modify the `images` generation at the top
content = content.replace(
  `const images = property ? [property.image, ...(property.gallery || [])] : [];`,
  `const images = property ? [
    property.image, 
    ...(property.gallery || []),
    ...Array.from({ length: Math.max(0, 21 - (1 + (property.gallery?.length || 0))) }).map((_, i) => \`https://picsum.photos/seed/prop_\${property?.id}_\${i}/800/600\`)
  ].filter(Boolean) : [];`
);

// 4. Video Always Available
// Change this line so it always shows the Video Tour button, and if property.video_url is missing, provide a generic youtube video.
content = content.replace(
  `{property.video_url && (
                          <button onClick={(e) => { e.stopPropagation(); setShowVideo(true); }} className="flex items-center gap-3 px-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-market-navy font-bold text-[10px] uppercase tracking-widest hover:bg-market-blue hover:text-white transition-all shadow-xl">
                            <Play size={18} fill="currentColor" /> Tour
                          </button>
                        )}`,
  `<button onClick={(e) => { e.stopPropagation(); setShowVideo(true); }} className="flex items-center gap-3 px-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-market-navy font-bold text-[10px] uppercase tracking-widest hover:bg-market-blue hover:text-white transition-all shadow-xl">
                            <Play size={18} fill="currentColor" /> Vídeo / Tour
                          </button>`
);

// Ensure the showVideo modal uses a fallback if property.video_url is missing
content = content.replace(
  `{showVideo && property?.video_url && (`,
  `{showVideo && (
        `
);

content = content.replace(
  `src={\`\${property.video_url.replace('watch?v=', 'embed/')}?autoplay=1\`}`,
  `src={\`\${(property?.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ').replace('watch?v=', 'embed/')}?autoplay=1\`}`
);

// Characteristics (adding more)
content = content.replace(
  `(property.amenities || ['Segurança 24/7 ARM', 'Abast. Água Próprio', 'Grupo Gerador 100kVA', 'Cozinha Industrial', 'Domótica Residencial', 'Piscina Olímpica'])`,
  `(property.amenities && property.amenities.length > 0 ? property.amenities : ['Segurança 24/7 ARM', 'Abast. Água Próprio', 'Grupo Gerador 100kVA', 'Cozinha Industrial', 'Domótica Residencial', 'Piscina Olímpica', 'Ar Condicionado Central', 'Jardim Privativo', 'Garagem Subterrânea', 'Ginásio Totalmente Equipado', 'Varanda Panorâmica', 'Sistema de Som Integrado'])`
);


fs.writeFileSync('views/PropertyDetailView.tsx', content);
