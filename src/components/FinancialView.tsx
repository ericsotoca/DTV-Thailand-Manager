import React, { useState } from 'react';
import { BankAccount } from '../data/initialData';
import { translations } from '../data/translations';
import { Landmark, AlertTriangle, Plus, Trash2, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { calculateFinancialStatus } from '../utils/checklistGenerator';

interface FinancialViewProps {
  lang: 'fr' | 'en';
  accounts: BankAccount[];
  exchangeRateEUR: number;
  onUpdateRate: (rate: number) => void;
  onAddAccount: (acc: BankAccount) => void;
  onDeleteAccount: (id: string) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  lang,
  accounts,
  exchangeRateEUR,
  onUpdateRate,
  onAddAccount,
  onDeleteAccount
}) => {
  const t = translations[lang];
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New account form state
  const [newAcc, setNewAcc] = useState<Partial<BankAccount>>({
    bankName: '',
    accountType: 'Compte Courant',
    country: 'France',
    balance: 5000,
    currency: 'EUR',
    statementDate: new Date().toISOString().split('T')[0],
    coveredPeriod: 'Solde instantané',
    holderName: '',
  });

  const fin = calculateFinancialStatus(accounts, exchangeRateEUR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: BankAccount = {
      ...newAcc as BankAccount,
      id: 'bank-' + Date.now(),
      history: [
        { date: '2026-05', balance: Number(newAcc.balance) * 0.9 },
        { date: '2026-06', balance: Number(newAcc.balance) * 0.95 },
        { date: '2026-07', balance: Number(newAcc.balance) * 0.98 },
        { date: '2026-08', balance: Number(newAcc.balance) * 0.99 },
        { date: '2026-09', balance: Number(newAcc.balance) },
      ]
    };
    onAddAccount(payload);
    setShowAddForm(false);
    setNewAcc({
      bankName: '',
      accountType: 'Compte Courant',
      country: 'France',
      balance: 5000,
      currency: 'EUR',
      statementDate: new Date().toISOString().split('T')[0],
      coveredPeriod: 'Solde instantané',
      holderName: '',
    });
  };

  // Compile unified balances over 5 months for charts
  const monthlyDates = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const unifiedHistory = monthlyDates.map((month) => {
    let monthlyTotalTHB = 0;
    accounts.forEach(acc => {
      // Find history value or default to current balance
      const histVal = acc.history?.find(h => h.date === month)?.balance ?? acc.balance;
      if (acc.currency === 'EUR') {
        monthlyTotalTHB += histVal * exchangeRateEUR;
      } else {
        monthlyTotalTHB += histVal;
      }
    });
    return { month, total: monthlyTotalTHB };
  });

  // SVG Chart Mathematics
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 25;
  const maxVal = Math.max(...unifiedHistory.map(d => d.total), 600000); // Scale chart to show at least 600k
  const points = unifiedHistory.map((d, idx) => {
    const x = padding + (idx * (chartWidth - 2 * padding)) / (unifiedHistory.length - 1);
    const y = chartHeight - padding - (d.total * (chartHeight - 2 * padding)) / maxVal;
    return { x, y, total: d.total, month: d.month };
  });

  const svgPathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const svgAreaD = points.length > 0
    ? `${svgPathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  const thresholdY = chartHeight - padding - (500000 * (chartHeight - 2 * padding)) / maxVal;

  return (
    <div className="space-y-6">
      
      {/* Upper Grid: Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Summary */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-xl flex flex-col justify-between col-span-1 lg:col-span-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.financial_proof}</h3>
            
            <div className="flex items-baseline gap-2.5 mt-3">
              <span className="text-3xl font-extrabold font-mono text-slate-800">
                {Math.round(fin.totalTHB).toLocaleString()} <span className="text-lg font-bold">THB</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                (≈ {Math.round(fin.totalEUR).toLocaleString()} EUR)
              </span>
            </div>

            {/* Threshold Progress slider bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 font-semibold font-mono">
                <span>0 THB</span>
                <span>{t.reference_threshold} : 500 000 THB</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div className={`h-full transition-all duration-500 ${fin.isCovered ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${fin.coveragePercent}%` }} />
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-800/20" style={{ left: '100%', transform: 'translateX(-100%)' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium uppercase">{t.margin_above}</span>
              <span className={`font-mono font-bold text-sm ${fin.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {fin.margin >= 0 ? '+' : ''}{Math.round(fin.margin).toLocaleString()} THB
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase">{t.coverage_rate}</span>
              <span className="font-mono font-bold text-sm text-slate-700">
                {fin.coveragePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Change Rate Config */}
        <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t.rate_setting}</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t.rate_warning}
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800">
                <span>1 EUR =</span>
                <span>{exchangeRateEUR} THB</span>
              </div>
              <input type="range" min="30" max="45" step="0.1" value={exchangeRateEUR} onChange={(e) => onUpdateRate(Number(e.target.value))} className="w-full accent-slate-800 cursor-ew-resize" />
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-100 p-2.5 rounded text-[10px] text-amber-800 leading-normal flex gap-1.5">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t.warning_guarantee}</span>
          </div>
        </div>

      </div>

      {/* SVG Interactive Area Chart */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t.balance_history}</h4>
          <span className="text-[10px] text-slate-400">{lang === 'fr' ? 'Exigence de stabilité sur 3 à 6 mois' : '3 to 6 months balance stability check'}</span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] overflow-visible">
            {/* Grid lines */}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#E2E8F0" strokeWidth="1" />
            
            {/* Reference Threshold 500k line */}
            <line x1={padding} y1={thresholdY} x2={chartWidth - padding} y2={thresholdY} stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3" />
            <text x={chartWidth - padding - 5} y={thresholdY - 4} className="text-[8px] font-mono fill-rose-600 text-right font-semibold" textAnchor="end">Limit 500k THB</text>

            {/* Area under curve */}
            <path d={svgAreaD} fill="url(#chartGradient)" />

            {/* Line curve */}
            <path d={svgPathD} fill="none" stroke={fin.isCovered ? '#10B981' : '#F59E0B'} strokeWidth="2.5" strokeLinecap="round" />

            {/* Scatter points */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke={fin.isCovered ? '#10B981' : '#F59E0B'} strokeWidth="2" />
                <text x={p.x} y={p.y - 8} className="text-[9px] font-mono font-semibold fill-slate-700 text-center" textAnchor="middle">
                  {Math.round(p.total / 1000)}k
                </text>
                <text x={p.x} y={chartHeight - padding + 12} className="text-[8px] font-mono fill-slate-400 text-center" textAnchor="middle">
                  {p.month}
                </text>
              </g>
            ))}

            {/* Defs Gradient */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fin.isCovered ? '#10B981' : '#F59E0B'} stopOpacity="0.2" />
                <stop offset="100%" stopColor={fin.isCovered ? '#10B981' : '#F59E0B'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Accounts List Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{lang === 'fr' ? 'Comptes Bancaires Enregistrés' : 'Registered Bank Accounts'}</h4>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add_account}</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.bank_name} *</label>
                <input required type="text" value={newAcc.bankName} onChange={(e) => setNewAcc({ ...newAcc, bankName: e.target.value })} placeholder="ex: HSBC, Boursorama" className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.account_type}</label>
                <input type="text" value={newAcc.accountType} onChange={(e) => setNewAcc({ ...newAcc, accountType: e.target.value })} placeholder="ex: Compte Courant, Livret A" className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.holder} *</label>
                <input required type="text" value={newAcc.holderName} onChange={(e) => setNewAcc({ ...newAcc, holderName: e.target.value })} placeholder="Nom exact" className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.balance} *</label>
                <input required type="number" value={newAcc.balance} onChange={(e) => setNewAcc({ ...newAcc, balance: Number(e.target.value) })} className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.currency}</label>
                <select value={newAcc.currency} onChange={(e) => setNewAcc({ ...newAcc, currency: e.target.value })} className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none">
                  <option value="EUR">EUR (€)</option>
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.country}</label>
                <input type="text" value={newAcc.country} onChange={(e) => setNewAcc({ ...newAcc, country: e.target.value })} placeholder="ex: France" className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">{t.statement_date}</label>
                <input type="date" value={newAcc.statementDate} onChange={(e) => setNewAcc({ ...newAcc, statementDate: e.target.value })} className="w-full border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded font-semibold text-slate-600">{lang === 'fr' ? 'Annuler' : 'Cancel'}</button>
              <button type="submit" className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold">{lang === 'fr' ? 'Enregistrer' : 'Register'}</button>
            </div>
          </form>
        )}

        {/* Bank account cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const isEUR = acc.currency === 'EUR';
            const convertedTHB = isEUR ? acc.balance * exchangeRateEUR : acc.balance;

            return (
              <div key={acc.id} className="bg-white border border-slate-200/80 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-50 text-slate-600 rounded">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{acc.bankName}</h5>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                          <span>{acc.accountType}</span>
                          <span>·</span>
                          <span>{acc.country}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => onDeleteAccount(acc.id)} className="text-slate-300 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="border-t border-slate-50 pt-3 my-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{lang === 'fr' ? 'Solde Déclaré' : 'Declared Balance'}</span>
                      <span className="font-mono font-bold text-slate-700">
                        {acc.balance.toLocaleString()} {acc.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{lang === 'fr' ? 'Équivalent' : 'Equivalent'}</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {Math.round(convertedTHB).toLocaleString()} THB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-2 font-semibold">
                  <span>{lang === 'fr' ? 'Titulaire :' : 'Holder :'} {acc.holderName}</span>
                  <span>{acc.statementDate ? `Le ${acc.statementDate}` : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
