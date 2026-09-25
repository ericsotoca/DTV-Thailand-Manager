// Specialized initial data structure for DTV Thailand Manager (French applicant -> Paris Royal Thai Embassy)
export interface Profile {
  lastName: string;
  firstName: string;
  nationality: string;
  birthDate: string;
  residenceCountry: string;
  residenceCity: string;
  address: string;
  phone: string;
  email: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssueCountry: string;
  profession: string;
  activityType: 'salaried' | 'freelance' | 'entrepreneur' | 'creator' | 'liberal' | 'other';
  activityDetail: string;
  professionalWebsite: string;
  companyName: string;
  monthlyIncome: number;
  yearlyIncome: number;
  expectedArrivalDate: string;
  expectedStayDuration: string;
  targetEmbassy: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  importance: 'obligatoire' | 'recommande' | 'optionnel';
  status: 'A obtenir' | 'Obtenu' | 'A verifier' | 'A traduire' | 'A certifier' | 'A renouveler' | 'Valide' | 'Refuse';
  fileAttachedName?: string;
  fileAttachedData?: string; // base64 payload or placeholder marker
  documentDate?: string;
  expiryDate?: string;
  language: string;
  translationRequired: boolean;
  certificationRequired: boolean;
  authenticationRequired: boolean;
  officialSourceUrl?: string;
  comment: string;
  lastVerifiedDate?: string;
  confidenceScore?: number; // 1 to 5
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  country: string;
  balance: number;
  currency: string;
  statementDate: string;
  coveredPeriod: string;
  holderName: string;
  associatedDocId?: string;
  history: { date: string; balance: number }[]; // Balance history for charts
}

export interface OfficialSource {
  id: string;
  title: string;
  organization: string;
  url: string;
  consultationDate: string;
  updateDate: string;
  requirementText: string;
  reliability: 'Excellent' | 'Bon' | 'Moyen';
}

export interface TaskItem {
  id: string;
  taskName: string;
  category: string;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  dueDate?: string;
  associatedDocId?: string;
  status: 'A faire' | 'En cours' | 'Fait';
  sourceUrl?: string;
  comment: string;
}

export interface DTVConfig {
  thresholdTHB: number;
  exchangeRateEURtoTHB: number;
  exchangeRateUSDtoTHB: number;
}

export const DEFAULT_CONFIG: DTVConfig = {
  thresholdTHB: 500000,
  exchangeRateEURtoTHB: 37.5, // 1 EUR = 37.5 THB
  exchangeRateUSDtoTHB: 33.8, // 1 USD = 33.8 THB
};

export const INITIAL_SOURCES: OfficialSource[] = [
  {
    id: 'source-1',
    title: 'Portail d\'enregistrement e-Visa Royal Thai',
    organization: 'Ministère des Affaires Étrangères de Thaïlande (MFA)',
    url: 'https://thaievisa.go.th/',
    consultationDate: '2026-09-25',
    updateDate: '2026-08-15',
    requirementText: 'Spécifie l\'obligation de fournir un justificatif financier de 500 000 THB minimum sous forme de relevé bancaire de moins de 3 mois, libellé au nom propre du demandeur.',
    reliability: 'Excellent',
  },
  {
    id: 'source-2',
    title: 'Consignes de visa DTV - Ambassade Royale de Thaïlande à Paris',
    organization: 'Ambassade Royale de Thaïlande en France',
    url: 'https://paris.thaiembassy.org/',
    consultationDate: '2026-09-25',
    updateDate: '2026-07-01',
    requirementText: "Précise les pièces justificatives spécifiques pour les résidents en France (Justificatif de domicile de moins de 3 mois en France, page d'identité du passeport français) et les critères professionnels des télétravailleurs (contrats, certificats d'auto-entrepreneur français traduits).",
    reliability: 'Excellent',
  }
];

export const INITIAL_PROFILE: Profile = {
  lastName: 'Martin',
  firstName: 'Thomas',
  nationality: 'Française',
  birthDate: '1992-06-15',
  residenceCountry: 'France',
  residenceCity: 'Paris',
  address: '75 Rue de Vaugirard, 75006 Paris',
  phone: '+33 6 12 34 56 78',
  email: 'thomas.martin@example.com',
  passportNumber: '26AB12345',
  passportIssueDate: '2021-02-10',
  passportExpiryDate: '2031-02-09',
  passportIssueCountry: 'France',
  profession: 'Consultant UI/UX Senior Freelance',
  activityType: 'freelance',
  activityDetail: 'Prestation de service à distance de conception d\'interfaces web pour des clients basés en Europe.',
  professionalWebsite: 'https://thomasmartin.dev',
  companyName: 'Thomas Martin EI',
  monthlyIncome: 4800,
  yearlyIncome: 57600,
  expectedArrivalDate: '2027-01-15',
  expectedStayDuration: '1 an (Renouvelable)',
  targetEmbassy: 'Ambassade Royale de Thaïlande à Paris (France)',
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Passeport Français (Page d\'identité)',
    category: 'Passeport',
    importance: 'obligatoire',
    status: 'Obtenu',
    documentDate: '2021-02-10',
    expiryDate: '2031-02-09',
    language: 'FR / EN',
    translationRequired: false,
    certificationRequired: false,
    authenticationRequired: false,
    officialSourceUrl: 'https://paris.thaiembassy.org/',
    comment: 'Passeport français obligatoire. Doit comporter au moins 2 pages vierges et expirer au moins 6 mois après l\'arrivée.',
    lastVerifiedDate: '2026-09-25',
    confidenceScore: 5,
  },
  {
    id: 'doc-2',
    name: 'Justificatif de domicile récent en France (Moins de 3 mois)',
    category: 'Résidence',
    importance: 'obligatoire',
    status: 'Obtenu',
    documentDate: '2026-09-01',
    expiryDate: '2026-12-01',
    language: 'FR',
    translationRequired: true,
    certificationRequired: false,
    authenticationRequired: false,
    officialSourceUrl: 'https://paris.thaiembassy.org/',
    comment: 'Facture d\'électricité (EDF) ou de box internet en France. L\'Ambassade de Paris exige une traduction certifiée conforme car le document est rédigé en français.',
    lastVerifiedDate: '2026-09-25',
    confidenceScore: 5,
  },
  {
    id: 'doc-3',
    name: 'Photo d\'identité récente conforme aux normes e-visa',
    category: 'Photographie',
    importance: 'obligatoire',
    status: 'A obtenir',
    language: 'N/A',
    translationRequired: false,
    certificationRequired: false,
    authenticationRequired: false,
    officialSourceUrl: 'https://thaievisa.go.th/',
    comment: 'Photo de face de moins de 6 mois, fond clair uni, sans lunettes ni accessoires.',
    lastVerifiedDate: '2026-09-25',
    confidenceScore: 4,
  },
  {
    id: 'doc-4',
    name: 'Extrait Kbis ou attestation d\'auto-entrepreneur (URSSAF)',
    category: 'Situation professionnelle',
    importance: 'obligatoire',
    status: 'A verifier',
    documentDate: '2021-05-12',
    language: 'FR',
    translationRequired: true,
    certificationRequired: false,
    authenticationRequired: false,
    officialSourceUrl: 'https://paris.thaiembassy.org/',
    comment: 'Preuve officielle d\'enregistrement de votre entreprise individuelle en France. La traduction certifiée conforme en anglais est requise par l\'ambassade à Paris.',
    lastVerifiedDate: '2026-09-25',
    confidenceScore: 3,
  },
  {
    id: 'doc-5',
    name: 'Relevé bancaire français récent en Euros (€)',
    category: 'Banque',
    importance: 'obligatoire',
    status: 'Obtenu',
    documentDate: '2026-09-20',
    language: 'FR',
    translationRequired: false,
    certificationRequired: false,
    authenticationRequired: false,
    officialSourceUrl: 'https://paris.thaiembassy.org/',
    comment: 'Relevé bancaire d\'un établissement en France montrant un solde supérieur à 13 400 € (équivalent à 500k THB). Le nom complet du titulaire doit correspondre au passeport.',
    lastVerifiedDate: '2026-09-25',
    confidenceScore: 5,
  },
  {
    id: 'doc-6',
    name: 'Portfolio et contrats de prestation de services en anglais',
    category: 'Situation professionnelle',
    importance: 'recommande',
    status: 'A obtenir',
    language: 'EN',
    translationRequired: false,
    certificationRequired: false,
    authenticationRequired: false,
    officialSourceUrl: 'https://paris.thaiembassy.org/',
    comment: 'Indispensable pour démontrer la réalité et le caractère continu de l\'activité de freelance. Recommandé de rassembler au moins 2 contrats signés.',
    lastVerifiedDate: '2026-09-25',
    confidenceScore: 4,
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'Boursorama Banque (France)',
    accountType: 'Compte Courant Personnel',
    country: 'France',
    balance: 14200,
    currency: 'EUR',
    statementDate: '2026-09-20',
    coveredPeriod: 'Août - Septembre 2026',
    holderName: 'Thomas Martin',
    associatedDocId: 'doc-5',
    history: [
      { date: '2026-05', balance: 13200 },
      { date: '2026-06', balance: 12400 },
      { date: '2026-07', balance: 13100 },
      { date: '2026-08', balance: 13900 },
      { date: '2026-09', balance: 14200 },
    ],
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    taskName: 'Prendre une photo d\'identité e-visa',
    category: 'Photographie',
    priority: 'Haute',
    dueDate: '2026-11-01',
    associatedDocId: 'doc-3',
    status: 'A faire',
    comment: 'Faire au format numérique standard exigé sur le portail e-visa.',
  },
  {
    id: 'task-2',
    taskName: 'Traduire l\'attestation d\'auto-entrepreneur ou KBis en anglais',
    category: 'Traductions',
    priority: 'Haute',
    dueDate: '2026-11-15',
    associatedDocId: 'doc-4',
    status: 'A faire',
    comment: 'Passer par un traducteur certifié (assermenté auprès d\'une cour d\'appel en France).',
  },
  {
    id: 'task-3',
    taskName: 'Faire traduire le justificatif de domicile EDF en anglais',
    category: 'Traductions',
    priority: 'Moyenne',
    dueDate: '2026-11-20',
    associatedDocId: 'doc-2',
    status: 'A faire',
    comment: 'L\'Ambassade à Paris exige que les documents rédigés en français soient accompagnés d\'une traduction officielle.',
  },
  {
    id: 'task-4',
    taskName: 'Finaliser le portfolio professionnel',
    category: 'Situation professionnelle',
    priority: 'Moyenne',
    dueDate: '2026-12-01',
    associatedDocId: 'doc-6',
    status: 'A faire',
    comment: 'Joindre des captures de sites web ou projets pour prouver l\'activité de Consultant UI/UX.',
  }
];
