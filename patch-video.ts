import fs from 'fs';

let content = fs.readFileSync('views/PropertyDetailView.tsx', 'utf-8');

const videoSection = `              {/* Video Tour Section */}
              {property?.video_url && (
                <div className="pt-16 mt-16 border-t border-slate-100/50">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[11px] font-display font-bold text-market-slate uppercase tracking-[0.5em]">Video / Tour Virtual</h2>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                       <span className="text-[9px] font-black text-market-navy uppercase tracking-widest">Imóvel de Luxo</span>
                    </div>
                  </div>
                  <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative border border-slate-100 bg-slate-50 group">
                    <iframe
                        src={\`\${property.video_url.replace('watch?v=', 'embed/')}?autoplay=0\`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Advanced Technical Specifications */}`;

content = content.replace(`              {/* Advanced Technical Specifications */}`, videoSection);

fs.writeFileSync('views/PropertyDetailView.tsx', content);
