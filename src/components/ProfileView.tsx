import React, { useState } from 'react';
import { Profile } from '../data/initialData';
import { translations } from '../data/translations';
import { User, Shield, Briefcase, Plane, Save, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  lang: 'fr' | 'en';
  profile: Profile;
  onSave: (p: Profile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ lang, profile, onSave }) => {
  const t = translations[lang];
  const [form, setForm] = useState<Profile>({ ...profile });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'monthlyIncome' || name === 'yearlyIncome' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.personal_sheet}</h2>
          <p className="text-xs text-slate-500">{lang === 'fr' ? 'Saisissez vos données administratives réelles pour évaluer la validité du dossier.' : 'Input real administrative records to assess dossier compliance.'}</p>
        </div>
        
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t.save_profile}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'fr' ? 'Profil sauvegardé avec succès ! Les vérifications de conformité ont été recalculées.' : 'Profile successfully saved ! Compliance checks have been recalculated.'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 1: Identité */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{lang === 'fr' ? '1. Identité' : '1. Identity'}</h3>
          </div>
          
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.lastname} *</label>
              <input required type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.firstname} *</label>
              <input required type="text" name="firstName" value={form.firstName} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.nationality} *</label>
              <input readOnly type="text" name="nationality" value="Française" className="w-full border border-slate-100 bg-slate-50 text-slate-500 rounded px-2.5 py-1.5 focus:outline-none cursor-not-allowed font-medium" />
              <span className="text-[9px] text-indigo-600 font-bold uppercase mt-1 block">Spécialisé Français</span>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.birthdate} *</label>
              <input required type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.residence_country} *</label>
              <input readOnly type="text" name="residenceCountry" value="France" className="w-full border border-slate-100 bg-slate-50 text-slate-500 rounded px-2.5 py-1.5 focus:outline-none cursor-not-allowed font-medium" />
              <span className="text-[9px] text-indigo-600 font-bold uppercase mt-1 block">Spécialisé Habitant en France</span>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.residence_city} *</label>
              <input required type="text" name="residenceCity" value={form.residenceCity} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.address}</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.phone}</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.email} *</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
          </div>
        </div>

        {/* Section 2: Passeport */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{lang === 'fr' ? '2. Passeport' : '2. Passport'}</h3>
          </div>
          
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.passport_num} *</label>
              <input required type="text" name="passportNumber" value={form.passportNumber} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.passport_issue} *</label>
              <input required type="date" name="passportIssueDate" value={form.passportIssueDate} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.passport_expiry} *</label>
              <input required type="date" name="passportExpiryDate" value={form.passportExpiryDate} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.passport_country} *</label>
              <input readOnly type="text" name="passportIssueCountry" value="France" className="w-full border border-slate-100 bg-slate-50 text-slate-500 rounded px-2.5 py-1.5 focus:outline-none cursor-not-allowed font-medium" />
              <span className="text-[9px] text-indigo-600 font-bold uppercase mt-1 block">Passeport Français</span>
            </div>
            
            <div className="pt-4 bg-slate-50 p-3 rounded text-[11px] text-slate-500 leading-relaxed border border-slate-100">
              <span className="font-bold block uppercase text-rose-800 mb-0.5">{t.official_requirement}</span>
              <span>{lang === 'fr' ? 'Votre passeport doit obligatoirement posséder au moins 2 pages vierges et expirer au moins 6 mois après votre date prévue d\'entrée.' : 'Your passport must contain at least 2 blank pages and expire at least 6 months after expected arrival.'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Activité et Logistique */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{lang === 'fr' ? '3. Activité & Voyage' : '3. Activity & Voyage'}</h3>
          </div>
          
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.activity_type} *</label>
              <select name="activityType" value={form.activityType} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white">
                <option value="salaried">{t.prof_salaried}</option>
                <option value="freelance">{t.prof_freelance}</option>
                <option value="entrepreneur">{t.prof_entrepreneur}</option>
                <option value="creator">{t.prof_creator}</option>
                <option value="liberal">{t.prof_liberal}</option>
                <option value="other">{t.prof_other}</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.job_title} *</label>
              <input required type="text" name="profession" value={form.profession} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.company_name}</label>
              <input type="text" name="companyName" value={form.companyName || ''} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.website}</label>
              <input type="text" name="professionalWebsite" value={form.professionalWebsite || ''} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.activity_detail}</label>
              <textarea name="activityDetail" value={form.activityDetail || ''} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-medium mb-1">{t.monthly_income} *</label>
                <input required type="number" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">{t.yearly_income} *</label>
                <input required type="number" name="yearlyIncome" value={form.yearlyIncome} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{lang === 'fr' ? 'Détails du Logistique Voyage' : 'Voyage Logistics'}</span>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.arrival_date} *</label>
              <input required type="date" name="expectedArrivalDate" value={form.expectedArrivalDate} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.stay_duration}</label>
              <input type="text" name="expectedStayDuration" value={form.expectedStayDuration} onChange={handleChange} className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">{t.target_embassy} *</label>
              <input readOnly type="text" name="targetEmbassy" value="Ambassade Royale de Thaïlande à Paris (France)" className="w-full border border-slate-100 bg-slate-50 text-slate-500 rounded px-2.5 py-1.5 focus:outline-none cursor-not-allowed font-medium" />
              <span className="text-[9px] text-indigo-600 font-bold uppercase mt-1 block">Dépôt Exclusif Paris</span>
            </div>
          </div>
        </div>

      </div>

    </form>
  );
};
