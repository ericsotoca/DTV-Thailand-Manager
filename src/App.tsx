import { useState, useMemo, useEffect } from 'react';
import { 
  INITIAL_PROFILE, 
  INITIAL_DOCUMENTS, 
  INITIAL_BANK_ACCOUNTS, 
  INITIAL_SOURCES, 
  INITIAL_TASKS, 
  DEFAULT_CONFIG,
  Profile,
  DocumentItem,
  BankAccount,
  OfficialSource,
  TaskItem
} from './data/initialData';
import { translations } from './data/translations';
import { generateDynamicTasks } from './utils/checklistGenerator';

// View Components
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { DocumentManager } from './components/DocumentManager';
import { FinancialView } from './components/FinancialView';
import { ProfessionView } from './components/ProfessionView';
import { CalendarView } from './components/CalendarView';
import { SourcesView } from './components/SourcesView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';

// Icons
import { 
  LayoutDashboard, 
  User, 
  ClipboardList, 
  FolderClosed, 
  Coins, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  FileCheck, 
  Settings, 
  Menu, 
  X,
  Plus,
  Trash2
} from 'lucide-react';

export default function App() {
  // Core LocalStorage States
  const [lang, setLang] = useState<'fr' | 'en'>(() => {
    return (localStorage.getItem('dtv_lang') as 'fr' | 'en') || 'fr';
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('dtv_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('dtv_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('dtv_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [sources, setSources] = useState<OfficialSource[]>(() => {
    const saved = localStorage.getItem('dtv_sources');
    return saved ? JSON.parse(saved) : INITIAL_SOURCES;
  });

  const [customTasks, setCustomTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('dtv_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [exchangeRateEUR, setExchangeRateEUR] = useState<number>(() => {
    const saved = localStorage.getItem('dtv_exchange_rate');
    return saved ? Number(saved) : DEFAULT_CONFIG.exchangeRateEURtoTHB;
  });

  // UI Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New task form inside checklist view
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({
    taskName: '',
    category: 'Situation professionnelle',
    priority: 'Moyenne',
    status: 'A faire',
    comment: ''
  });

  // Persistance synchronisation
  useEffect(() => {
    localStorage.setItem('dtv_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('dtv_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('dtv_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('dtv_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('dtv_sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('dtv_tasks', JSON.stringify(customTasks));
  }, [customTasks]);

  useEffect(() => {
    localStorage.setItem('dtv_exchange_rate', exchangeRateEUR.toString());
  }, [exchangeRateEUR]);

  // Dynamic computations of compiled tasks
  const compiledTasks = useMemo(() => {
    return generateDynamicTasks(profile, documents, accounts, exchangeRateEUR, customTasks);
  }, [profile, documents, accounts, exchangeRateEUR, customTasks]);

  const t = translations[lang];

  // Handlers
  const handleUpdateProfile = (updated: Profile) => {
    setProfile(updated);
  };

  const handleUpdateActivityType = (type: Profile['activityType']) => {
    setProfile(prev => ({ ...prev, activityType: type }));
  };

  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const handleUpdateDocument = (updated: DocumentItem) => {
    setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleAddAccount = (acc: BankAccount) => {
    setAccounts(prev => [acc, ...prev]);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleAddSource = (src: OfficialSource) => {
    setSources(prev => [src, ...prev]);
  };

  const handleDeleteSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleTaskStatus = (id: string) => {
    // Check if dynamic task or user task
    if (id.startsWith('dyn-')) {
      // Dynamic tasks are status checked by satisfying their conditions,
      // but users can toggle them as customized overrides. We save as custom task to persist or suppress
      const targetDyn = compiledTasks.find(tk => tk.id === id);
      if (targetDyn) {
        const payload: TaskItem = {
          ...targetDyn,
          id: 'user-override-' + id,
          status: targetDyn.status === 'Fait' ? 'A faire' : 'Fait'
        };
        setCustomTasks(prev => [payload, ...prev]);
      }
    } else {
      setCustomTasks(prev => prev.map(tk => {
        if (tk.id === id) {
          const nextStatus: TaskItem['status'] = tk.status === 'Fait' ? 'A faire' : 'Fait';
          return { ...tk, status: nextStatus };
        }
        return tk;
      }));
    }
  };

  const handleDeleteTask = (id: string) => {
    setCustomTasks(prev => prev.filter(tk => tk.id !== id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TaskItem = {
      ...newTask as TaskItem,
      id: 'task-user-' + Date.now(),
    };
    setCustomTasks(prev => [payload, ...prev]);
    setShowAddTask(false);
    setNewTask({
      taskName: '',
      category: 'Situation professionnelle',
      priority: 'Moyenne',
      status: 'A faire',
      comment: ''
    });
  };

  const handleWipeAllData = () => {
    localStorage.clear();
    setProfile(INITIAL_PROFILE);
    setDocuments(INITIAL_DOCUMENTS);
    setAccounts(INITIAL_BANK_ACCOUNTS);
    setSources(INITIAL_SOURCES);
    setCustomTasks(INITIAL_TASKS);
    setExchangeRateEUR(DEFAULT_CONFIG.exchangeRateEURtoTHB);
    setActiveTab('dashboard');
    window.location.reload();
  };

  const handleExportBackup = () => {
    const data = {
      profile,
      documents,
      accounts,
      sources,
      tasks: customTasks,
      exchangeRateEUR
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dtv_manager_backup_${profile.lastName || 'user'}.json`;
    link.click();
  };

  const handleImportBackup = (dataStr: string) => {
    const parsed = JSON.parse(dataStr);
    setProfile(parsed.profile);
    setDocuments(parsed.documents);
    setAccounts(parsed.accounts);
    if (parsed.sources) setSources(parsed.sources);
    if (parsed.tasks) setCustomTasks(parsed.tasks);
    if (parsed.exchangeRateEUR) setExchangeRateEUR(parsed.exchangeRateEUR);
  };

  // Nav Items Definitions
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'profile', label: t.profile, icon: User },
    { id: 'checklist', label: t.checklist, icon: ClipboardList },
    { id: 'documents', label: t.documents, icon: FolderClosed },
    { id: 'finances', label: t.finances, icon: Coins },
    { id: 'profession', label: t.profession, icon: Briefcase },
    { id: 'calendar', label: t.calendar, icon: Calendar },
    { id: 'sources', label: t.sources, icon: BookOpen },
    { id: 'report', label: t.report, icon: FileCheck },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      
      {/* LEFT SIDEBAR (Desktop) / TOP NAV BAR (Mobile) */}
      <header className="md:hidden bg-slate-900 text-slate-100 px-4 py-3.5 flex items-center justify-between z-20 print:hidden border-b border-slate-800">
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-tight text-white">{t.title}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{t.subtitle}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-slate-300 hover:text-white cursor-pointer">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Navigation overlay for mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-10 md:hidden print:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Left Sidebar container */}
      <aside className={`fixed md:sticky top-0 bottom-0 left-0 bg-slate-900 text-slate-300 w-64 p-5 z-20 shrink-0 transform md:transform-none transition-transform duration-200 flex flex-col justify-between border-r border-slate-800 print:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="space-y-6">
          {/* Brand locking contract */}
          <div className="pb-4 border-b border-slate-800">
            <h1 className="text-lg font-black text-white tracking-tight">{t.title}</h1>
            <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">{t.subtitle}</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quiet User Tag Footer */}
        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          <span>v1.0.0 · Local & Secure</span>
        </div>
      </aside>

      {/* CORE CONTENT WORKSPACE */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
        
        {activeTab === 'dashboard' && (
          <DashboardView 
            lang={lang} 
            documents={documents} 
            accounts={accounts} 
            tasks={compiledTasks} 
            exchangeRateEUR={exchangeRateEUR} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView 
            lang={lang} 
            profile={profile} 
            onSave={handleUpdateProfile} 
          />
        )}

        {activeTab === 'documents' && (
          <DocumentManager 
            lang={lang} 
            documents={documents} 
            profile={profile}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'finances' && (
          <FinancialView 
            lang={lang} 
            accounts={accounts} 
            exchangeRateEUR={exchangeRateEUR}
            onUpdateRate={setExchangeRateEUR}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'profession' && (
          <ProfessionView 
            lang={lang} 
            profile={profile} 
            onUpdateActivityType={handleUpdateActivityType} 
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            lang={lang} 
            profile={profile} 
            documents={documents} 
          />
        )}

        {activeTab === 'sources' && (
          <SourcesView 
            lang={lang} 
            sources={sources} 
            onAddSource={handleAddSource} 
            onDeleteSource={handleDeleteSource} 
          />
        )}

        {activeTab === 'report' && (
          <ReportView 
            lang={lang} 
            profile={profile} 
            documents={documents} 
            accounts={accounts} 
            tasks={compiledTasks} 
            sources={sources}
            exchangeRateEUR={exchangeRateEUR} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            lang={lang} 
            onToggleLang={() => setLang(prev => prev === 'fr' ? 'en' : 'fr')} 
            onImportBackup={handleImportBackup} 
            onExportBackup={handleExportBackup} 
            onWipeData={handleWipeAllData} 
          />
        )}

        {/* Integrated Smart Checklist Tab View */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{t.checklist}</h2>
                <p className="text-xs text-slate-500">{lang === 'fr' ? 'Consultez vos tâches administratives personnalisées recalculées d\'après vos critères réels.' : 'Monitor administrative tasks tailored to your real credentials.'}</p>
              </div>

              <button onClick={() => setShowAddTask(!showAddTask)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer transition">
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Créer une tâche' : 'Add Task'}</span>
              </button>
            </div>

            {showAddTask && (
              <form onSubmit={handleCreateTask} className="bg-white border border-slate-200 p-4 rounded-xl text-xs space-y-3 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">{lang === 'fr' ? 'Intitulé de la tâche' : 'Task Name'} *</label>
                    <input required type="text" value={newTask.taskName} onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })} className="w-full border border-slate-200 rounded px-2.5 py-1 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">{lang === 'fr' ? 'Catégorie associée' : 'Filing Category'}</label>
                    <select value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} className="w-full border border-slate-200 rounded px-2.5 py-1 focus:outline-none bg-white">
                      <option value="Situation professionnelle">Situation professionnelle</option>
                      <option value="Situation financière">Situation financière</option>
                      <option value="Passeport">Passeport</option>
                      <option value="Traductions">Traductions</option>
                      <option value="Résidence">Résidence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">{lang === 'fr' ? 'Priorité' : 'Priority'}</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })} className="w-full border border-slate-200 rounded px-2.5 py-1 focus:outline-none bg-white">
                      <option value="Haute">Haute</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Basse">Basse</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">{lang === 'fr' ? 'Commentaire' : 'Comments'}</label>
                  <input type="text" value={newTask.comment} onChange={(e) => setNewTask({ ...newTask, comment: e.target.value })} className="w-full border border-slate-200 rounded px-2.5 py-1 focus:outline-none" />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddTask(false)} className="px-3.5 py-1 border border-slate-200 hover:bg-slate-50 rounded font-semibold text-slate-600">{lang === 'fr' ? 'Annuler' : 'Cancel'}</button>
                  <button type="submit" className="px-3.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded font-semibold">{lang === 'fr' ? 'Ajouter' : 'Save Task'}</button>
                </div>
              </form>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {compiledTasks.map((tk) => {
                  const isDone = tk.status === 'Fait';
                  const isDynamic = tk.id.startsWith('dyn-');

                  return (
                    <div key={tk.id} className={`p-4 flex items-start justify-between gap-4 transition hover:bg-slate-50/40 ${isDone ? 'bg-slate-50/20 opacity-70' : ''}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleTaskStatus(tk.id)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer"
                        />
                        
                        <div className="text-xs space-y-1">
                          <p className={`font-semibold text-slate-800 ${isDone ? 'line-through text-slate-400' : ''}`}>{tk.taskName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                            <span>{tk.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className={tk.priority === 'Haute' ? 'text-rose-600' : tk.priority === 'Moyenne' ? 'text-amber-600' : 'text-slate-400'}>{tk.priority} priority</span>
                            {isDynamic && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-indigo-600 font-bold">{lang === 'fr' ? 'Générée par l\'IA/Moteur' : 'AI Engine Generated'}</span>
                              </>
                            )}
                          </div>
                          {tk.comment && <p className="text-[11px] text-slate-500 italic">"{tk.comment}"</p>}
                        </div>
                      </div>

                      {!isDynamic && (
                        <button onClick={() => handleDeleteTask(tk.id)} className="text-slate-300 hover:text-rose-600 shrink-0 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {compiledTasks.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    {lang === 'fr' ? 'Aucune tâche à afficher.' : 'No tasks to display.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
