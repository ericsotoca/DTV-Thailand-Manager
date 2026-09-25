import React, { useState } from 'react';
import { Profile, DocumentItem, BankAccount, TaskItem, OfficialSource } from '../data/initialData';
import { translations } from '../data/translations';
import { calculateFinancialStatus } from '../utils/checklistGenerator';
import { CheckCircle2, AlertTriangle, Printer, Download, ClipboardList, Info } from 'lucide-react';

interface ReportViewProps {
  lang: 'fr' | 'en';
  profile: Profile;
  documents: DocumentItem[];
  accounts: BankAccount[];
  tasks: TaskItem[];
  sources: OfficialSource[];
  exchangeRateEUR: number;
}

export const ReportView: React.FC<ReportViewProps> = ({
  lang,
  profile,
  documents,
  accounts,
  tasks,
  sources,
  exchangeRateEUR
}) => {
  const t = translations[lang];
  const [auditRun, setAuditRun] = useState(false);

  // Core metrics for audit
  const fin = calculateFinancialStatus(accounts, exchangeRateEUR);
  const requiredDocs = documents.filter(d => d.importance === 'obligatoire');
  const requiredValidated = requiredDocs.filter(d => d.status === 'Valide' || d.status === 'Obtenu');
  const missingRequired = requiredDocs.filter(d => d.status === 'A obtenir');
  const rejectedDocs = documents.filter(d => d.status === 'Refuse');
  const translationDocs = documents.filter(d => d.status === 'Obtenu' && d.language === 'FR' && d.translationRequired);
  const certificationDocs = documents.filter(d => d.status === 'Obtenu' && d.certificationRequired);
  
  const score = requiredDocs.length > 0 
    ? Math.round((requiredValidated.length / requiredDocs.length) * 100)
    : 0;

  // Passport expiration math
  const today = new Date();
  let passportValidityDays = 0;
  let passportExceedsSixMonths = false;
  if (profile.passportExpiryDate && profile.expectedArrivalDate) {
    const expiry = new Date(profile.passportExpiryDate);
    const arrival = new Date(profile.expectedArrivalDate);
    passportValidityDays = Math.ceil((expiry.getTime() - arrival.getTime()) / (1000 * 3600 * 24));
    passportExceedsSixMonths = passportValidityDays >= 180;
  }

  // Handle CSV export of tasks
  const exportChecklistCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tache,Categorie,Priorite,Statut,Commentaire\n";
    
    tasks.forEach(tk => {
      const row = `"${tk.taskName.replace(/"/g, '""')}","${tk.category}","${tk.priority}","${tk.status}","${tk.comment.replace(/"/g, '""')}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DTV_Thailand_Checklist_${profile.lastName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.report_title}</h2>
          <p className="text-xs text-slate-500">{lang === 'fr' ? 'Générez l\'audit de conformité final de votre dossier avant votre dépôt au consulat.' : 'Generate compliance audits for your application dossier.'}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={exportChecklistCSV} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>{t.export_checklist_csv}</span>
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer">
            <Printer className="w-3.5 h-3.5" />
            <span>{t.print_dossier}</span>
          </button>
        </div>
      </div>

      {/* Audit trigger section */}
      {!auditRun ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-xl text-center space-y-4 print:hidden">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-slate-700">{lang === 'fr' ? 'Prêt à auditer votre dossier ?' : 'Ready to audit your dossier ?'}</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{t.audit_not_run}</p>
          </div>
          <button onClick={() => setAuditRun(true)} className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition cursor-pointer">
            {t.run_audit}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0">
          
          {/* Header Report */}
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">{lang === 'fr' ? 'AUDIT TECHNIQUE DE CONFORMITÉ THAI-DTV' : 'THAI-DTV COMPLIANCE TECHNICAL AUDIT'}</h3>
              <p className="text-[11px] text-slate-400 font-semibold font-mono">Dossier: {profile.lastName.toUpperCase()} {profile.firstName} · {new Date().toISOString().split('T')[0]}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-bold block">{lang === 'fr' ? 'Score de préparation' : 'Readiness Score'}</span>
              <span className="text-2xl font-black font-mono text-slate-800">{score}%</span>
            </div>
          </div>

          {/* 12 points list */}
          <div className="space-y-5 text-xs text-slate-700">
            
            {/* 1. État général */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">1. État général</h4>
              <p className="leading-relaxed text-slate-600">
                {lang === 'fr'
                  ? `Votre dossier possède un score global de ${score}%. Le seuil financier requis de 500k THB est ${fin.isCovered ? 'parfaitement validé' : 'insuffisant pour le moment'}.`
                  : `Your dossier has a completion score of ${score}%. The requested 500k THB threshold is ${fin.isCovered ? 'fully met' : 'insufficient for now'}.`}
              </p>
            </div>

            {/* 2. Documents validés */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">2. Documents validés</h4>
              <p className="leading-relaxed text-slate-600">
                {lang === 'fr'
                  ? `Vous disposez de ${requiredValidated.length} document(s) validé(s) ou obtenus par rapport au cahier d'exigences.`
                  : `You gathered ${requiredValidated.length} validated or obtained document(s).`}
              </p>
              {requiredValidated.length > 0 && (
                <ul className="list-disc pl-4 mt-1 text-slate-500 font-medium">
                  {requiredValidated.map(d => <li key={d.id}>{d.name}</li>)}
                </ul>
              )}
            </div>

            {/* 3. Documents manquants */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">3. Documents manquants</h4>
              <p className="leading-relaxed text-slate-600">
                {missingRequired.length === 0 
                  ? (lang === 'fr' ? "Aucun document obligatoire manquant." : "No missing required documents.")
                  : (lang === 'fr' ? `Il vous manque encore ${missingRequired.length} document(s) obligatoire(s) :` : `You are still missing ${missingRequired.length} required document(s) :`)}
              </p>
              {missingRequired.length > 0 && (
                <ul className="list-disc pl-4 mt-1 text-rose-700 font-medium">
                  {missingRequired.map(d => <li key={d.id}>{d.name}</li>)}
                </ul>
              )}
            </div>

            {/* 4. Documents à corriger */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">4. Documents à corriger</h4>
              <p className="leading-relaxed text-slate-600">
                {rejectedDocs.length === 0 
                  ? (lang === 'fr' ? "Aucune pièce signalée incorrecte ou rejetée." : "No incorrect or rejected pieces.")
                  : (lang === 'fr' ? `Attention, ${rejectedDocs.length} document(s) ont été jugés non conformes :` : `Warning, ${rejectedDocs.length} document(s) are non-compliant :`)}
              </p>
              {rejectedDocs.length > 0 && (
                <ul className="list-disc pl-4 mt-1 text-rose-800 font-bold">
                  {rejectedDocs.map(d => <li key={d.id}>{d.name} — {d.comment}</li>)}
                </ul>
              )}
            </div>

            {/* 5. Documents à traduire */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">5. Documents à traduire</h4>
              <p className="leading-relaxed text-slate-600">
                {translationDocs.length === 0
                  ? (lang === 'fr' ? "Aucune traduction supplémentaire urgente requise." : "No urgent translations required.")
                  : (lang === 'fr' ? `Vous avez ${translationDocs.length} document(s) rédigés en français à faire traduire officiellement :` : `You have ${translationDocs.length} French document(s) requiring official translation :`)}
              </p>
              {translationDocs.length > 0 && (
                <ul className="list-disc pl-4 mt-1 text-amber-700 font-medium">
                  {translationDocs.map(d => <li key={d.id}>{d.name} (Langue: {d.language})</li>)}
                </ul>
              )}
            </div>

            {/* 6. Documents à certifier */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">6. Documents à certifier</h4>
              <p className="leading-relaxed text-slate-600">
                {certificationDocs.length === 0
                  ? (lang === 'fr' ? "Aucun document n'exige de tampon ou de certification bancaire physique spécifique." : "No bank stamps or physical certifications are pending.")
                  : (lang === 'fr' ? `Vous devez faire certifier conforme auprès de votre banque les pièces suivantes :` : `You must acquire bank stamps for :`)}
              </p>
              {certificationDocs.length > 0 && (
                <ul className="list-disc pl-4 mt-1 text-slate-500 font-medium">
                  {certificationDocs.map(d => <li key={d.id}>{d.name}</li>)}
                </ul>
              )}
            </div>

            {/* 7. Points financiers */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">7. Points financiers</h4>
              <p className="leading-relaxed text-slate-600">
                {lang === 'fr'
                  ? `Votre solde cumulé s'élève à ${Math.round(fin.totalTHB).toLocaleString()} THB (Seuil: 500k). Votre marge de sécurité est de ${Math.round(fin.margin).toLocaleString()} THB.`
                  : `Your cumulative balance is ${Math.round(fin.totalTHB).toLocaleString()} THB (Limit: 500k). Your safety buffer is ${Math.round(fin.margin).toLocaleString()} THB.`}
              </p>
              {!fin.isCovered && (
                <div className="mt-1 bg-rose-50 border border-rose-100 p-2 text-rose-800 rounded font-medium">
                  {lang === 'fr' ? "⚠️ AVERTISSEMENT : Solde inférieur au seuil légal thaïlandais." : "⚠️ WARNING : Bank balances are below the official Thai requirements."}
                </div>
              )}
            </div>

            {/* 8. Points professionnels */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">8. Points professionnels</h4>
              <p className="leading-relaxed text-slate-600">
                {lang === 'fr'
                  ? `Motif sélectionné: "${profile.activityType.toUpperCase()}". Profession déclarée: "${profile.profession}" pour "${profile.companyName || 'activité propre'}".`
                  : `Selected motif: "${profile.activityType.toUpperCase()}". Declared job: "${profile.profession}" for "${profile.companyName || 'own business'}".`}
              </p>
            </div>

            {/* 9. Points concernant le passeport */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">9. Points concernant le passeport</h4>
              <p className="leading-relaxed text-slate-600">
                {profile.passportNumber ? (
                  lang === 'fr'
                    ? `Numéro de passeport: ${profile.passportNumber}. Expiration: ${profile.passportExpiryDate || 'Inconnue'}. Validité après arrivée : ${passportValidityDays} jours (${passportExceedsSixMonths ? 'Conforme, supérieure à 180 jours' : '⚠️ NON CONFORME, inférieure à 6 mois !'}).`
                    : `Passport Number: ${profile.passportNumber}. Expiration: ${profile.passportExpiryDate || 'Unknown'}. Validity after arrival : ${passportValidityDays} days (${passportExceedsSixMonths ? 'Compliant, > 180 days' : '⚠️ NON-COMPLIANT, < 6 months !'}).`
                ) : (
                  <span className="text-rose-700 font-medium">{lang === 'fr' ? "Aucun numéro de passeport ou date d'expiration renseigné sur votre fiche !" : "No passport details filled in your personal sheet !"}</span>
                )}
              </p>
            </div>

            {/* 10. Actions prioritaires */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">10. Actions prioritaires</h4>
              <p className="leading-relaxed text-slate-600">
                {lang === 'fr' ? 'Tâches administratives prioritaires en attente :' : 'Priority remaining tasks :'}
              </p>
              <ul className="list-disc pl-4 mt-1 font-medium text-slate-600">
                {tasks.filter(t => t.status !== 'Fait').slice(0, 3).map(tk => (
                  <li key={tk.id}>{tk.taskName} ({tk.priority} Priorité)</li>
                ))}
                {tasks.filter(t => t.status !== 'Fait').length === 0 && (
                  <li className="text-emerald-700 italic">{lang === 'fr' ? 'Aucune tâche prioritaire restante !' : 'No priority tasks left !'}</li>
                )}
              </ul>
            </div>

            {/* 11. Sources officielles utilisées */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">11. Sources officielles utilisées</h4>
              <p className="leading-relaxed text-slate-600">
                {lang === 'fr'
                  ? `L'évaluation réglementaire est consolidée sur les directives issues de ${sources.length} sources ministérielles et consulaires enregistrées.`
                  : `Regulatory check is integrated over ${sources.length} consular and ministerial registered sources.`}
              </p>
            </div>

            {/* 12. Éléments restant à vérifier */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase mb-1">12. Éléments restant à vérifier</h4>
              <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-lg text-[11px] text-slate-600 leading-normal space-y-1">
                <span className="font-bold block text-slate-800 uppercase">{lang === 'fr' ? 'Avertissement & Décharge légale :' : 'Disclaimer & legal release :'}</span>
                <p>
                  {lang === 'fr'
                    ? "DTV Thailand Manager est un assistant personnel d'organisation administrative. Les exigences consulaires pouvant varier de manière discrétionnaire selon l'ambassade (Paris, Londres, Vientiane, etc.), l'utilisateur est tenu de vérifier chaque pièce directement sur le portail officiel Thai e-Visa avant tout paiement des frais de dossier."
                    : "DTV Thailand Manager is an administrative assistant. Consular guidelines can vary widely across embassies. Applicants are bound to verify each document on the Thai e-Visa portal prior to final fee settlement."}
                </p>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end print:hidden">
            <button onClick={() => setAuditRun(false)} className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded text-xs cursor-pointer">
              {lang === 'fr' ? 'Réinitialiser l\'audit' : 'Reset Audit'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
