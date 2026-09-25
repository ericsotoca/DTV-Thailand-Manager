import React, { useState } from 'react';
import { translations } from '../data/translations';
import { Shield, RefreshCw, Download, Upload, AlertTriangle, CheckCircle2, Languages } from 'lucide-react';

interface SettingsViewProps {
  lang: 'fr' | 'en';
  onToggleLang: () => void;
  onImportBackup: (dataStr: string) => void;
  onExportBackup: () => void;
  onWipeData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  onToggleLang,
  onImportBackup,
  onExportBackup,
  onWipeData
}) => {
  const t = translations[lang];
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      try {
        const text = reader.result as string;
        // Basic validation test
        const data = JSON.parse(text);
        if (!data.profile || !data.documents || !data.accounts) {
          throw new Error("Format de sauvegarde corrompu ou incomplet.");
        }
        onImportBackup(text);
        setImportSuccess(true);
      } catch (err: any) {
        setImportError(err.message || "Erreur de format JSON.");
      }
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.system_settings}</h2>
        <p className="text-xs text-slate-500">{lang === 'fr' ? 'Configurez vos préférences système et exportez vos données de sauvegarde.' : 'Configure your system preferences and export data backups.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Languages Toggle */}
        <div className="bg-white border border-slate-200/85 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Languages className="w-4.5 h-4.5 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{t.lang_select}</h3>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{lang === 'fr' ? 'Langue active : Français' : 'Active Language : English'}</span>
            <button onClick={onToggleLang} className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded cursor-pointer transition">
              {lang === 'fr' ? 'Switch to English' : 'Changer en Français'}
            </button>
          </div>
        </div>

        {/* Import/Export Backup */}
        <div className="bg-white border border-slate-200/85 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Download className="w-4.5 h-4.5 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{lang === 'fr' ? 'Sauvegarde & Portabilité' : 'Backups & Portability'}</h3>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              {lang === 'fr'
                ? "Comme l'application fonctionne entièrement en local, vous pouvez sauvegarder votre saisie administrative sous forme de fichier portable et la restaurer sur un autre appareil."
                : "Since this application runs client-side, you can backup your records to a local JSON file and restore it on any device."}
            </p>

            {importSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'fr' ? 'Sauvegarde restaurée avec succès !' : 'Backup successfully loaded !'}</span>
              </div>
            )}

            {importError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded font-medium">
                {importError}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <button onClick={onExportBackup} className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded cursor-pointer transition">
                <Download className="w-4.5 h-4.5" />
                <span>{t.export_backup}</span>
              </button>
              
              <div className="relative inline-block">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded border border-slate-200 transition cursor-pointer">
                  <Upload className="w-4.5 h-4.5" />
                  <span>{t.import_backup}</span>
                </button>
                <input type="file" accept=".json" onChange={handleImportFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Security & Confidentiality */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-slate-100 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">{lang === 'fr' ? 'Sécurité & RGPD' : 'Security & Privacy'}</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {t.privacy_policy}
        </p>

        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-100 uppercase">{lang === 'fr' ? 'Zone de Suppression Définitive' : 'Permanent Wipeout Zone'}</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                {t.wipe_warning}
              </p>
            </div>
          </div>

          {!showConfirmWipe ? (
            <button onClick={() => setShowConfirmWipe(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs transition cursor-pointer">
              {t.wipe_data}
            </button>
          ) : (
            <div className="p-4 bg-slate-950 border border-rose-900/50 rounded-lg space-y-3">
              <span className="font-bold text-rose-400 text-xs uppercase block">{lang === 'fr' ? 'Êtes-vous absolument sûr ?' : 'Are you absolutely sure ?'}</span>
              <div className="flex gap-2">
                <button onClick={onWipeData} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs cursor-pointer">
                  {lang === 'fr' ? 'Confirmer la suppression' : 'Confirm Deletion'}
                </button>
                <button onClick={() => setShowConfirmWipe(false)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded font-bold text-xs cursor-pointer">
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
