import React, { useState } from 'react';
import { Profile, DocumentItem } from '../data/initialData';
import { translations } from '../data/translations';
import { Calendar, AlertCircle, AlertTriangle, Clock, ShieldCheck, Plane, CalendarDays, CheckCircle } from 'lucide-react';

interface CalendarViewProps {
  lang: 'fr' | 'en';
  profile: Profile;
  documents: DocumentItem[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ lang, profile, documents }) => {
  const t = translations[lang];
  const today = new Date();

  // Timing Calculator state initialized to planned flight arrival date
  const [calcDeparture, setCalcDeparture] = useState<string>(profile.expectedArrivalDate || '2027-01-15');

  // Helper to subtract/add days from string date
  const formatDateOffset = (dateStr: string, daysOffset: number): string => {
    try {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Timeline intervals math
  const dateTooEarly = formatDateOffset(calcDeparture, -42); // 6 weeks before
  const dateIdealEnd = formatDateOffset(calcDeparture, -28); // 4 weeks before
  const dateWarningEnd = formatDateOffset(calcDeparture, -14); // 2 weeks before

  // Unified dates compilation
  const dateEvents: { name: string; date: string; category: string; status: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK' }[] = [];

  // Expatriation dates
  if (profile.expectedArrivalDate) {
    dateEvents.push({
      name: lang === 'fr' ? "Arrivée prévue en Thaïlande" : "Expected Arrival in Thailand",
      date: profile.expectedArrivalDate,
      category: "Projet de voyage",
      status: 'OK'
    });
  }

  // Passport expiry
  if (profile.passportExpiryDate) {
    const expDate = new Date(profile.passportExpiryDate);
    const diff = (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    let status: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
    if (diff <= 0) status = 'EXPIRED';
    else if (diff <= 180) status = 'CRITICAL'; // Less than 6 months
    else if (diff <= 365) status = 'WARNING';  // Less than 1 year

    dateEvents.push({
      name: lang === 'fr' ? "Expiration du passeport" : "Passport Expiration Date",
      date: profile.passportExpiryDate,
      category: "Passeport",
      status
    });
  }

  // Document expiries
  documents.forEach(doc => {
    if (doc.expiryDate) {
      const expDate = new Date(doc.expiryDate);
      const diff = (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      let status: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
      if (diff <= 0) status = 'EXPIRED';
      else if (diff <= 7) status = 'CRITICAL';
      else if (diff <= 30) status = 'WARNING';

      dateEvents.push({
        name: `${doc.name}`,
        date: doc.expiryDate,
        category: doc.category,
        status
      });
    }
  });

  // Sort events chronologically
  const sortedEvents = [...dateEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.unified_calendar}</h2>
        <p className="text-xs text-slate-500">{lang === 'fr' ? 'Consultez les dates clés et anticipez les renouvellements de vos pièces administratives.' : 'Monitor key administrative timelines and renewals.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alerts & Interactive Timing Calculator */}
        <div className="space-y-6">
          
          {/* Alerts Center Widget */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{lang === 'fr' ? 'Centre de Vigilance des Dates' : 'Alert Vigilance Center'}</h3>
            </div>

            <div className="space-y-3">
              
              {/* Urgent Warning Statuses */}
              {sortedEvents.some(e => e.status === 'EXPIRED') && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t.alert_expired}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    {lang === 'fr' 
                      ? "Un ou plusieurs documents indispensables à votre visa sont expirés. Vous devez impérativement les renouveler avant le dépôt."
                      : "One or more documents required for your visa are expired. Renew them prior to submission."}
                  </p>
                </div>
              )}

              {sortedEvents.some(e => e.status === 'CRITICAL') && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-950 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{t.alert_exp_7}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    {lang === 'fr' 
                      ? "Certaines pièces justificatives expirent dans moins de 7 jours, ou votre passeport présente une validité trop courte par rapport à l'entrée."
                      : "Some documents expire in less than 7 days, or your passport validity is critical."}
                  </p>
                </div>
              )}

              {!sortedEvents.some(e => e.status === 'EXPIRED' || e.status === 'CRITICAL') && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Aucune alerte critique' : 'No Critical Alerts'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    {lang === 'fr' 
                      ? "Toutes les dates de vos documents déclarés sont saines pour le moment. Félicitations !"
                      : "All documented dates are safe for now. Well done !"}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Interactive Timing Calculator Widget */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm text-slate-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {lang === 'fr' ? 'Planificateur de Dépôt e-Visa' : 'E-Visa Submission Scheduler'}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  {lang === 'fr' ? 'Votre date de vol prévue :' : 'Your expected flight date :'}
                </label>
                <input 
                  type="date" 
                  value={calcDeparture} 
                  onChange={(e) => setCalcDeparture(e.target.value)} 
                  className="w-full border border-slate-200 bg-white rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium font-mono text-slate-800" 
                />
              </div>

              {/* Color coded timelines */}
              <div className="space-y-3 pt-1">
                {/* 1. Too Early */}
                <div className="flex gap-2 text-[11px]">
                  <span className="w-1.5 rounded-full bg-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold text-blue-700 uppercase text-[9px] block leading-tight">{lang === 'fr' ? 'Trop précoce (Justificatifs < 3 mois)' : 'Too early'}</span>
                    <span className="font-mono text-[11px] text-slate-500 font-bold">{lang === 'fr' ? `Avant le ${dateTooEarly}` : `Before ${dateTooEarly}`}</span>
                  </div>
                </div>

                {/* 2. Ideal window */}
                <div className="flex gap-2 p-2 bg-emerald-50 rounded border border-emerald-100 text-[11px]">
                  <span className="w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-800 uppercase text-[9px] block leading-tight">{lang === 'fr' ? 'Créneau Idéal (Délai 4 à 6 sem.)' : 'Ideal Window (4-6 weeks)'}</span>
                    <span className="font-mono text-[11px] text-emerald-700 font-bold">
                      {lang === 'fr' ? `Du ${dateTooEarly} au ${dateIdealEnd}` : `From ${dateTooEarly} to ${dateIdealEnd}`}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">
                      {lang === 'fr' ? 'Recommandé. Traitement optimal permettant d\'intégrer d\'éventuelles corrections.' : 'Best window. Secure margins allowing for consular feedback.'}
                    </p>
                  </div>
                </div>

                {/* 3. Warning risk window */}
                <div className="flex gap-2 text-[11px]">
                  <span className="w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-700 uppercase text-[9px] block leading-tight">{lang === 'fr' ? 'Créneau Tendu (2 à 4 semaines)' : 'Tight Window (2-4 weeks)'}</span>
                    <span className="font-mono text-[11px] text-slate-500 font-bold">
                      {lang === 'fr' ? `Du ${dateIdealEnd} au ${dateWarningEnd}` : `From ${dateIdealEnd} to ${dateWarningEnd}`}
                    </span>
                  </div>
                </div>

                {/* 4. Critical */}
                <div className="flex gap-2 p-2 bg-rose-50 rounded border border-rose-100 text-[11px]">
                  <span className="w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-800 uppercase text-[9px] block leading-tight">{lang === 'fr' ? 'Critique & Risqué (Moins de 2 sem.)' : 'Critical Risk (< 2 weeks)'}</span>
                    <span className="font-mono text-[11px] text-rose-700 font-bold">
                      {lang === 'fr' ? `Après le ${dateWarningEnd}` : `After ${dateWarningEnd}`}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">
                      {lang === 'fr' ? 'Risque de vol manqué très élevé. L\'Ambassade à Paris traite les demandes sous 10 à 15 jours ouvrés.' : 'High risk. Paris processing times require 10-15 working days.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Chronological Timeline */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4.5 h-4.5 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{lang === 'fr' ? 'Événements chronologiques du dossier' : 'Dossier Timelines'}</h3>
          </div>

          <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-5">
            {sortedEvents.map((evt, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                  evt.status === 'EXPIRED' ? 'bg-rose-600' :
                  evt.status === 'CRITICAL' ? 'bg-rose-500' :
                  evt.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'
                }`} />

                <div className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{evt.name}</span>
                    <span className="font-mono text-[11px] text-slate-400 font-bold">{evt.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase">
                    <span>{evt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-semibold ${
                      evt.status === 'EXPIRED' ? 'text-rose-600' :
                      evt.status === 'CRITICAL' ? 'text-rose-500' :
                      evt.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-600'
                    }`}>{evt.status}</span>
                  </div>
                </div>
              </div>
            ))}

            {sortedEvents.length === 0 && (
              <div className="text-slate-400 text-xs italic py-6 text-center">
                {lang === 'fr' ? 'Aucune date d\'échéance enregistrée.' : 'No timelines documented yet.'}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
