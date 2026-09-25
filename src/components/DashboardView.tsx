import React from 'react';
import { translations } from '../data/translations';
import { DocumentItem, BankAccount, TaskItem } from '../data/initialData';
import { CheckCircle2, AlertTriangle, XCircle, Info, Landmark, Calendar, RefreshCw, FileText } from 'lucide-react';
import { calculateFinancialStatus } from '../utils/checklistGenerator';

interface DashboardViewProps {
  lang: 'fr' | 'en';
  documents: DocumentItem[];
  accounts: BankAccount[];
  tasks: TaskItem[];
  exchangeRateEUR: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  documents,
  accounts,
  tasks,
  exchangeRateEUR
}) => {
  const t = translations[lang];

  // Calculations
  const totalDocs = documents.length;
  const validatedDocs = documents.filter(d => d.status === 'Valide' || d.status === 'Obtenu').length;
  const missingDocs = documents.filter(d => d.status === 'A obtenir').length;
  const toCorrectDocs = documents.filter(d => d.status === 'Refuse').length;
  const toTranslateDocs = documents.filter(d => d.translationRequired && d.status === 'Obtenu').length;
  const remainingTasks = tasks.filter(tk => tk.status !== 'Fait').length;

  // Let's filter documents with deadlines approaching
  const today = new Date();
  const expiringDocsCount = documents.filter(d => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diff > 0 && diff <= 30;
  }).length;

  // Calculate percentage of required documents that are validated/obtained
  const requiredDocs = documents.filter(d => d.importance === 'obligatoire');
  const requiredValidated = requiredDocs.filter(d => d.status === 'Valide' || d.status === 'Obtenu').length;
  const globalPercentage = requiredDocs.length > 0 
    ? Math.round((requiredValidated / requiredDocs.length) * 100)
    : 0;

  // Financial coverage
  const fin = calculateFinancialStatus(accounts, exchangeRateEUR);

  // Global indicator
  let globalIndicator: 'RED' | 'ORANGE' | 'GREEN' = 'RED';
  if (globalPercentage === 100 && fin.isCovered && toCorrectDocs === 0) {
    globalIndicator = 'GREEN';
  } else if (globalPercentage >= 65 && fin.isCovered) {
    globalIndicator = 'ORANGE';
  } else {
    globalIndicator = 'RED';
  }

  return (
    <div className="space-y-6">
      {/* Upper Grid: Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Gauge */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t.global_progress}</h3>
            <span className="text-xs text-slate-400">({t.importance_obligatoire} uniquement)</span>
          </div>
          
          <div className="flex items-center justify-between my-4">
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                <circle cx="56" cy="56" r="48" stroke={globalIndicator === 'GREEN' ? '#10B981' : globalIndicator === 'ORANGE' ? '#F59E0B' : '#EF4444'} strokeWidth="8" fill="transparent"
                  strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * globalPercentage) / 100} />
              </svg>
              <div className="absolute text-2xl font-bold font-mono text-slate-800">{globalPercentage}%</div>
            </div>
            
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>{requiredValidated} / {requiredDocs.length} {t.importance_obligatoire.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-slate-200" />
                <span>{requiredDocs.length - requiredValidated} {t.to_obtain.toLowerCase()}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {lang === 'fr' 
              ? "Calculé à partir du nombre de justificatifs obligatoires ayant le statut Obtenu ou Validé."
              : "Calculated based on the number of required items with Obtained or Validated status."}
          </div>
        </div>

        {/* Global indicator status card */}
        <div className={`col-span-1 lg:col-span-2 border p-6 rounded-xl flex flex-col justify-between ${
          globalIndicator === 'GREEN' ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950' :
          globalIndicator === 'ORANGE' ? 'bg-amber-50/40 border-amber-200 text-amber-950' :
          'bg-rose-50/40 border-rose-200 text-rose-950'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.global_indicator}</h3>
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full inline-block animate-pulse ${
                  globalIndicator === 'GREEN' ? 'bg-emerald-500' :
                  globalIndicator === 'ORANGE' ? 'bg-amber-500' :
                  'bg-rose-500'
                }`} />
                <span className="text-sm font-semibold font-mono">
                  {globalIndicator === 'GREEN' ? t.status_ready :
                   globalIndicator === 'ORANGE' ? t.status_almost :
                   t.status_incomplete}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              {globalIndicator === 'GREEN' ? t.ready_desc :
               globalIndicator === 'ORANGE' ? t.almost_desc :
               t.incomplete_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-200/50">
            <div className="flex items-start gap-2.5 text-xs">
              <Landmark className="w-4 h-4 shrink-0 text-slate-500" />
              <div>
                <span className="font-semibold block">{t.financial_proof}</span>
                <span className={fin.isCovered ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                  {fin.isCovered 
                    ? `Seuil validé (${Math.round(fin.totalTHB).toLocaleString()} THB / 500k)` 
                    : `Solde insuffisant (${Math.round(fin.totalTHB).toLocaleString()} THB / 500k)`}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs">
              <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
              <div>
                <span className="font-semibold block">{t.tasks_remaining}</span>
                <span className="font-mono">{remainingTasks} {lang === 'fr' ? 'tâches actives' : 'active tasks'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Metrics Widgets List */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase">{t.docs_needed}</span>
            <span className="text-xl font-bold font-mono text-slate-800">{totalDocs}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase">{t.docs_validated}</span>
            <span className="text-xl font-bold font-mono text-slate-800">{validatedDocs}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase">{t.docs_missing}</span>
            <span className="text-xl font-bold font-mono text-slate-800">{missingDocs}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase">{t.docs_to_correct}</span>
            <span className="text-xl font-bold font-mono text-rose-800">{toCorrectDocs}</span>
          </div>
        </div>

      </div>

      {/* Checklist Overview & Administrative reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 15 Conseilles pratiques pour dépôt à Paris */}
        <div className="bg-slate-50 border border-slate-200/70 p-6 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                {lang === 'fr' ? '15 Conseils Pratiques — Dépôt Ambassade de Paris' : '15 Practical Tips — Submission to Paris Embassy'}
              </h3>
            </div>
            
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 text-xs text-slate-600 scrollbar-thin">
              {[
                { num: "01", tip: "Marge de change : Conservez au moins 1 500 € de marge au-dessus du seuil (500k THB) pour amortir les variations quotidiennes de l'Euro." },
                { num: "02", tip: "Stabilité bancaire : Présentez un relevé complet de compte courant/épargne prouvant que le solde est resté stable ou croissant sans chute brutale." },
                { num: "03", tip: "Traduction assermentée : L'Ambassade de Paris décline les pièces rédigées uniquement en français (EDF, KBis). Utilisez un traducteur agréé en Cour d'appel." },
                { num: "04", tip: "Format PDF natif : Téléchargez directement les relevés PDF de votre banque en ligne au lieu d'imprimer puis de scanner des feuilles physiques." },
                { num: "05", tip: "Coût de visa : Prévoyez 350 € de frais consulaires e-visa non remboursables, payables par carte bancaire lors de la validation." },
                { num: "06", tip: "Autorisation de télétravail : La lettre d'employeur doit certifier expressément votre droit de télétravailler spécifiquement depuis la Thaïlande." },
                { num: "07", tip: "Preuves de freelance : Joignez au moins 2 ou 3 contrats de prestation récents traduits, accompagnés des factures payées correspondantes." },
                { num: "08", tip: "Justificatif de domicile : Fournissez une facture EDF, gaz ou box internet à votre nom de moins de 3 mois (quittances manuscrites simples refusées)." },
                { num: "09", tip: "Page du passeport : Scannez la double-page d'identité complète (pages 2 & 3 avec signature) de manière parfaitement nette et plate." },
                { num: "10", tip: "Validité de validité : Vérifiez que votre passeport français est valide au moins 6 mois après votre date d'arrivée prévue." },
                { num: "11", tip: "Photo conforme : Utilisez une photo d'identité de face de moins de 6 mois, sans sourire, visage dégagé et sans lunettes." },
                { num: "12", tip: "Site web de freelance : Posséder un site web de portfolio professionnel en anglais renforce fortement la légitimité de votre activité." },
                { num: "13", tip: "Avis d'imposition : Joindre votre dernier avis d'imposition français traduit en anglais consolide la sincérité de vos revenus récurrents." },
                { num: "14", tip: "Calculateur de change : Le taux utilisé dans l'appli est indicatif, l'administration se base sur son propre taux journalier officiel." },
                { num: "15", tip: "Délai d'anticipation : Soumettez le dossier en ligne 4 à 6 semaines avant votre vol pour parer à tout délai de traitement complémentaire." }
              ].map((item) => (
                <div key={item.num} className="flex gap-2 p-2 bg-white border border-slate-100 rounded-lg">
                  <span className="font-bold text-indigo-700 shrink-0 font-mono text-[10px]">{item.num}.</span>
                  <span className="leading-tight text-[11px] text-slate-600">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action task checklist preview */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">{lang === 'fr' ? 'Tâches administratives prioritaires' : 'Priority Administrative Tasks'}</h3>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic my-6 text-center">{lang === 'fr' ? 'Aucune tâche en suspens. Félicitations !' : 'No pending tasks. Congratulations !'}</p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {tasks.slice(0, 3).map((tk) => (
                  <div key={tk.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        tk.priority === 'Haute' ? 'bg-rose-500' :
                        tk.priority === 'Moyenne' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      <span className="font-medium text-slate-700 truncate max-w-xs">{tk.taskName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{tk.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-right text-xs mt-3 pt-3 border-t border-slate-100">
            <span className="text-slate-400">{tasks.length} {lang === 'fr' ? 'tâches enregistrées' : 'tasks recorded'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
