import React from 'react';
import { Profile } from '../data/initialData';
import { translations } from '../data/translations';
import { Briefcase, Info, Compass, ShieldAlert, CheckSquare, Plus, FileSpreadsheet } from 'lucide-react';

interface ProfessionViewProps {
  lang: 'fr' | 'en';
  profile: Profile;
  onUpdateActivityType: (type: Profile['activityType']) => void;
}

export const ProfessionView: React.FC<ProfessionViewProps> = ({
  lang,
  profile,
  onUpdateActivityType
}) => {
  const t = translations[lang];

  const profiles: { value: Profile['activityType']; label: string; desc: string; requirements: string[] }[] = [
    {
      value: 'salaried',
      label: t.prof_salaried,
      desc: lang === 'fr' 
        ? "Vous êtes employé en CDI ou CDD par une entreprise hors de Thaïlande et effectuez du télétravail (Workcation)." 
        : "You are employed by a company outside Thailand and work remotely (Workcation).",
      requirements: [
        "Contrat de travail en cours de validité (en anglais ou traduit)",
        "Attestation officielle de l'employeur autorisant le télétravail depuis la Thaïlande",
        "3 dernières fiches de paie démontrant le niveau de revenu",
        "Certificat d'enregistrement de l'entreprise émettrice hors de Thaïlande (KBis étranger)"
      ]
    },
    {
      value: 'freelance',
      label: t.prof_freelance,
      desc: lang === 'fr' 
        ? "Vous êtes consultant indépendant, prestataire de service ou freelance et travaillez pour plusieurs clients internationaux." 
        : "You are an independent contractor or freelancer delivering services to global clients.",
      requirements: [
        "Certificat officiel d'enregistrement d'activité (Auto-entrepreneur, EI, URSSAF)",
        "Portfolio professionnel détaillé présentant des exemples concrets de projets réalisés",
        "Contrats de prestation signés récents (au moins 2 ou 3 clients différents)",
        "Factures associées et justificatifs bancaires des virements reçus",
        "Site web professionnel ou profil LinkedIn validé"
      ]
    },
    {
      value: 'entrepreneur',
      label: t.prof_entrepreneur,
      desc: lang === 'fr' 
        ? "Vous êtes fondateur, actionnaire ou gérant d'une entreprise commerciale légalement enregistrée à l'étranger." 
        : "You are a founder, shareholder, or manager of a legally incorporated company abroad.",
      requirements: [
        "Statuts constitutifs officiels de l'entreprise",
        "Attestation d'enregistrement commercial",
        "Relevés de comptes bancaires professionnels des 3 derniers mois",
        "Rapports annuels ou brochures présentant l'activité de l'entreprise"
      ]
    },
    {
      value: 'creator',
      label: t.prof_creator,
      desc: lang === 'fr' 
        ? "Vous êtes influenceur, blogueur, youtubeur ou créateur de contenu indépendant avec une audience mesurable." 
        : "You are a blogger, influencer, content creator, or digital publisher with measurable traction.",
      requirements: [
        "Document synthétique présentant vos canaux de diffusion et statistiques d'audience",
        "Preuves de monétisation (rapports d'affiliation, Adsense, partenariats)",
        "Contrats publicitaires récents ou lettres d'intention de sponsors",
        "Exemples de publications récentes sur vos plateformes"
      ]
    },
    {
      value: 'liberal',
      label: t.prof_liberal,
      desc: lang === 'fr' 
        ? "Vous exercez une profession libérale réglementée (médecin, avocat, architecte, etc.) à distance." 
        : "You practice a regulated liberal profession (consultant, lawyer, architect, etc.) remotely.",
      requirements: [
        "Licence professionnelle officielle en vigueur",
        "Preuve d'inscription à l'ordre national ou registre professionnel",
        "Factures d'honoraires récentes",
        "Déclaration fiscale d'activité"
      ]
    }
  ];

  const currentSelection = profiles.find(p => p.value === profile.activityType) || profiles[1];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.prof_checklist}</h2>
        <p className="text-xs text-slate-500">{lang === 'fr' ? 'Adaptez la checklist des justificatifs professionnels requis selon votre statut.' : 'Adjust required professional proofs checklist to your actual status.'}</p>
      </div>

      {/* Selector Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t.select_profile_type}</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {profiles.map((p) => (
            <button key={p.value} onClick={() => onUpdateActivityType(p.value)} className={`px-3 py-2 text-xs font-semibold rounded-lg border transition text-center cursor-pointer ${
              profile.activityType === p.value 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description & Advice card */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="col-span-2 space-y-2">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{lang === 'fr' ? 'Description de votre statut DTV' : 'DTV Status Overview'}</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentSelection.desc}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[11px] text-amber-950 space-y-1">
          <div className="flex items-center gap-1 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.info_to_check}</span>
          </div>
          <p className="leading-normal font-medium text-slate-700">
            {lang === 'fr' 
              ? "Les ambassades thaïlandaises se réservent le droit de demander des pièces complémentaires pour tester la véracité de l'activité."
              : "Thai Embassies reserve the right to request additional proofs to verify remote work veracity."}
          </p>
        </div>
      </div>

      {/* Core Adapted Requirements */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Briefcase className="w-4.5 h-4.5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">{lang === 'fr' ? 'Justificatifs requis conseillés' : 'Recommended Proofs'}</h3>
        </div>

        <div className="space-y-3">
          {currentSelection.requirements.map((req, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg text-xs hover:bg-slate-50 transition border border-slate-100">
              <CheckSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">{req}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-medium">
                  <span className="font-bold text-indigo-700 uppercase">{t.official_requirement} :</span>
                  <span>{lang === 'fr' ? 'Doit être numérisé en format haute définition.' : 'Must be scanned in high resolution.'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200/50">
          <span className="font-bold block uppercase text-emerald-800 mb-1">{t.practical_advice} :</span>
          <span>
            {lang === 'fr'
              ? "Préparez un document d'introduction rédigé en anglais (Cover Letter) résumant brièvement votre parcours, la nature de votre travail à distance et comment vous remplissez l'exigence du visa. Cela facilite grandement le travail de l'agent consulaire."
              : "Prepare a professional Cover Letter written in English summarizing your background, the nature of your remote job, and how you satisfy the DTV criteria. This significantly speeds up consular processing."}
          </span>
        </div>
      </div>

    </div>
  );
};
