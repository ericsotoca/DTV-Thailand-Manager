import React, { useState } from 'react';
import { OfficialSource } from '../data/initialData';
import { translations } from '../data/translations';
import { BookOpen, ExternalLink, Plus, Trash2, ShieldCheck, X } from 'lucide-react';

interface SourcesViewProps {
  lang: 'fr' | 'en';
  sources: OfficialSource[];
  onAddSource: (src: OfficialSource) => void;
  onDeleteSource: (id: string) => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  lang,
  sources,
  onAddSource,
  onDeleteSource
}) => {
  const t = translations[lang];
  const [showAdd, setShowAdd] = useState(false);

  const [newSrc, setNewSrc] = useState<Partial<OfficialSource>>({
    title: '',
    organization: '',
    url: '',
    requirementText: '',
    reliability: 'Excellent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: OfficialSource = {
      ...newSrc as OfficialSource,
      id: 'src-' + Date.now(),
      consultationDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
    };
    onAddSource(payload);
    setShowAdd(false);
    setNewSrc({
      title: '',
      organization: '',
      url: '',
      requirementText: '',
      reliability: 'Excellent'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.sources}</h2>
          <p className="text-xs text-slate-500">{lang === 'fr' ? 'Consultez les directives réglementaires authentiques ou ajoutez de nouvelles sources consulaires.' : 'Review authenticated regulatory guidelines or add new consular sources.'}</p>
        </div>
        
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>{t.add_source}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-700 text-xs uppercase">{lang === 'fr' ? 'Formulaire Nouvelle Source Consulaire' : 'Register New Consular Source'}</span>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-bold mb-1">{t.source_title} *</label>
              <input required type="text" value={newSrc.title} onChange={(e) => setNewSrc({ ...newSrc, title: e.target.value })} placeholder="ex: Royal Thai Embassy, Paris" className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none" />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">{t.source_org} *</label>
              <input required type="text" value={newSrc.organization} onChange={(e) => setNewSrc({ ...newSrc, organization: e.target.value })} placeholder="ex: MFA Thailand" className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-bold mb-1">{t.source_url} *</label>
              <input required type="url" value={newSrc.url} onChange={(e) => setNewSrc({ ...newSrc, url: e.target.value })} placeholder="https://..." className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none" />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">{t.reliability}</label>
              <select value={newSrc.reliability} onChange={(e) => setNewSrc({ ...newSrc, reliability: e.target.value as any })} className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none">
                <option value="Excellent">Excellent</option>
                <option value="Bon">Bon</option>
                <option value="Moyen">Moyen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">{lang === 'fr' ? "Texte ou résumé de l'exigence" : "Requirement summary text"} *</label>
            <textarea required rows={3} value={newSrc.requirementText} onChange={(e) => setNewSrc({ ...newSrc, requirementText: e.target.value })} placeholder="Saisissez le texte réglementaire..." className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-600 font-semibold">{lang === 'fr' ? 'Annuler' : 'Cancel'}</button>
            <button type="submit" className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold">{lang === 'fr' ? 'Enregistrer la Source' : 'Save Source'}</button>
          </div>
        </form>
      )}

      {/* Sources list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src) => (
          <div key={src.id} className="bg-white border border-slate-200/80 p-5 rounded-xl flex flex-col justify-between hover:shadow-sm transition">
            
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-50 text-slate-600 rounded">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{src.title}</h4>
                    {/* Zero-Pill unboxed inline tags */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                      <span>{src.organization}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-600">{src.reliability} Reliability</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => onDeleteSource(src.id)} className="text-slate-300 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
              </div>

              {/* Requirement text */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                "{src.requirementText}"
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-semibold mt-4">
              <span>{t.consult_date} : {src.consultationDate}</span>
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition">
                <span>Visiter la source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
