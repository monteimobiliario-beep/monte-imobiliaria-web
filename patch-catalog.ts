import fs from 'fs';

let content = fs.readFileSync('views/CatalogView.tsx', 'utf-8');

content = content.replace(
  `                <div className="md:col-span-3">
                  <ImageUploadField 
                    label="Imagem de Destaque (Principal)"
                    value={newProp.image || ''}
                    onChange={(url) => setNewProp({...newProp, image: url})}
                    placeholder="Cole um link (Google Drive, etc) ou carregue da galeria..."
                  />
                </div>`,
  `                <div className="md:col-span-3">
                  <ImageUploadField 
                    label="Imagem de Destaque (Principal)"
                    value={newProp.image || ''}
                    onChange={(url) => setNewProp({...newProp, image: url})}
                    placeholder="Cole um link (Google Drive, etc) ou carregue da galeria..."
                  />
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-market-slate uppercase tracking-widest ml-1">URL do Vídeo (YouTube/Vimeo) - Opcional</label>
                  <input value={newProp.video_url || ''} onChange={e => setNewProp({...newProp, video_url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-market-blue/20 focus:border-market-blue transition-all" placeholder="Ex: https://youtube.com/watch?v=..." />
                </div>`
);

content = content.replace(
  `setNewProp({title:'', type:'Casa', deal_type:'Venda', price:0, location:'', bedrooms:1, bathrooms:1, area:0, description:'', image:'', gallery: [], featured: false, status: 'Disponível'});`,
  `setNewProp({title:'', type:'Casa', deal_type:'Venda', price:0, location:'', bedrooms:1, bathrooms:1, area:0, description:'', image:'', gallery: [], featured: false, status: 'Disponível', video_url: ''});`
);

fs.writeFileSync('views/CatalogView.tsx', content);
