import { Profile, DocumentItem, BankAccount, TaskItem, DEFAULT_CONFIG } from '../data/initialData';

export function calculateFinancialStatus(accounts: BankAccount[], exchangeRateEUR: number) {
  let totalEUR = 0;
  let totalTHB = 0;

  accounts.forEach(acc => {
    if (acc.currency === 'EUR') {
      totalEUR += acc.balance;
      totalTHB += acc.balance * exchangeRateEUR;
    } else if (acc.currency === 'THB') {
      totalTHB += acc.balance;
      totalEUR += acc.balance / exchangeRateEUR;
    } else if (acc.currency === 'USD') {
      // Approximate USD to EUR conversion for summary, then to THB
      const balEUR = acc.balance * 0.9;
      totalEUR += balEUR;
      totalTHB += acc.balance * 33.8; // Using USD-THB direct rate
    }
  });

  const threshold = DEFAULT_CONFIG.thresholdTHB;
  const isCovered = totalTHB >= threshold;
  const margin = totalTHB - threshold;
  const coveragePercent = Math.min(100, Math.round((totalTHB / threshold) * 100));

  return {
    totalEUR,
    totalTHB,
    isCovered,
    margin,
    coveragePercent,
    threshold
  };
}

export function generateDynamicTasks(
  profile: Profile,
  documents: DocumentItem[],
  accounts: BankAccount[],
  exchangeRateEUR: number,
  customTasks: TaskItem[]
): TaskItem[] {
  const dynamicList: TaskItem[] = [];

  // 1. Passport Expiry Check
  if (profile.passportExpiryDate && profile.expectedArrivalDate) {
    const expiry = new Date(profile.passportExpiryDate);
    const arrival = new Date(profile.expectedArrivalDate);
    const diffTime = expiry.getTime() - arrival.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 180 && diffDays > 0) {
      dynamicList.push({
        id: 'dyn-passport-urgent',
        taskName: 'RENOUVELLEMENT REQUIS : Votre passeport expire moins de 6 mois après votre arrivée prévue.',
        category: 'Passeport',
        priority: 'Haute',
        dueDate: profile.expectedArrivalDate,
        status: 'A faire',
        comment: `Exigence Officielle: Le passeport doit être valide au moins 6 mois. Expiration dans seulement ${diffDays} jours par rapport à la date de départ prévue.`,
      });
    } else if (diffDays <= 0) {
      dynamicList.push({
        id: 'dyn-passport-expired',
        taskName: 'URGENT : Votre passeport est expiré ou expire avant votre arrivée !',
        category: 'Passeport',
        priority: 'Haute',
        status: 'A faire',
        comment: 'Action urgente : Déposez immédiatement une demande de renouvellement de passeport.',
      });
    }
  }

  // 2. Financial Threshold Check
  const fin = calculateFinancialStatus(accounts, exchangeRateEUR);
  if (!fin.isCovered) {
    dynamicList.push({
      id: 'dyn-finance-insufficient',
      taskName: `SEUIL FINANCIER INSUFFISANT : Augmenter l'encours de vos comptes (${Math.round(fin.margin)} THB manquants)`,
      category: 'Situation financière',
      priority: 'Haute',
      status: 'A faire',
      comment: `Exigence Officielle: Disposer de 500 000 THB au moment du dépôt. Actuellement, vous disposez de ${Math.round(fin.totalTHB).toLocaleString()} THB (Couverture: ${fin.coveragePercent}%).`,
    });
  }

  // 3. Translation Alert Check
  documents.forEach(doc => {
    if (doc.status === 'Obtenu' && doc.language === 'FR' && doc.translationRequired) {
      dynamicList.push({
        id: `dyn-translate-${doc.id}`,
        taskName: `Traduction requise pour : "${doc.name}"`,
        category: 'Traductions',
        priority: 'Moyenne',
        associatedDocId: doc.id,
        status: 'A faire',
        comment: `Conseil pratique: Le document est en français. Les consulats exigent généralement des traductions assermentées en anglais ou en thaï.`,
      });
    }
  });

  // 4. Certification / Legalisations
  documents.forEach(doc => {
    if (doc.status === 'Obtenu' && doc.certificationRequired) {
      dynamicList.push({
        id: `dyn-certify-${doc.id}`,
        taskName: `Certification requise pour : "${doc.name}"`,
        category: 'Certifications / authentifications',
        priority: 'Moyenne',
        associatedDocId: doc.id,
        status: 'A faire',
        comment: `Information à vérifier auprès du consulat : Certains documents d'entreprise ou bancaires originaux doivent être tamponnés ou certifiés conformes.`,
      });
    }
  });

  // 5. Activity-specific Documents Checklist
  const type = profile.activityType;
  
  if (type === 'salaried') {
    const hasContract = documents.some(d => d.name.toLowerCase().includes('contrat de travail') || d.name.toLowerCase().includes('employment'));
    if (!hasContract) {
      dynamicList.push({
        id: 'dyn-prof-salaried-contract',
        taskName: 'Obtenir un contrat de travail à distance ou lettre d\'embauche certifiée',
        category: 'Situation professionnelle',
        priority: 'Haute',
        status: 'A faire',
        comment: "Exigence Officielle: Preuve de statut d'employé d'une entreprise hors de Thaïlande avec détails sur le salaire.",
      });
    }

    const hasRemoteAuth = documents.some(d => d.name.toLowerCase().includes('télétravail') || d.name.toLowerCase().includes('remote'));
    if (!hasRemoteAuth) {
      dynamicList.push({
        id: 'dyn-prof-salaried-auth',
        taskName: 'Faire signer une attestation d\'autorisation de télétravail à l\'étranger',
        category: 'Situation professionnelle',
        priority: 'Haute',
        status: 'A faire',
        comment: "Exigence Officielle: Attestation de l'employeur confirmant que vous êtes autorisé à effectuer votre travail à distance de Thaïlande.",
      });
    }
  } else if (type === 'freelance') {
    const hasPortfolio = documents.some(d => d.name.toLowerCase().includes('portfolio') || d.name.toLowerCase().includes('site') || d.id === 'doc-6');
    if (!hasPortfolio) {
      dynamicList.push({
        id: 'dyn-prof-freelance-portfolio',
        taskName: 'Constituer un portfolio de freelance avec preuves de réalisations',
        category: 'Situation professionnelle',
        priority: 'Moyenne',
        status: 'A faire',
        comment: "Conseil pratique: Utile si votre structure de freelance est récente ou informelle, afin de prouver la réalité de votre activité.",
      });
    }

    const hasInvoices = documents.some(d => d.name.toLowerCase().includes('facture') || d.name.toLowerCase().includes('invoice'));
    if (!hasInvoices) {
      dynamicList.push({
        id: 'dyn-prof-freelance-invoices',
        taskName: 'Réunir les 3 dernières factures clients payées',
        category: 'Revenus',
        priority: 'Haute',
        status: 'A faire',
        comment: "Information à vérifier: Permet de certifier un revenu régulier de source non-thaïlandaise.",
      });
    }
  } else if (type === 'entrepreneur') {
    const hasIncorporation = documents.some(d => d.name.toLowerCase().includes('statut') || d.name.toLowerCase().includes('incorporation') || d.name.toLowerCase().includes('kbis'));
    if (!hasIncorporation) {
      dynamicList.push({
        id: 'dyn-prof-entrepreneur-inc',
        taskName: 'Extraire les statuts de la société et justificatif d\'enregistrement',
        category: 'Situation professionnelle',
        priority: 'Haute',
        status: 'A faire',
        comment: "Exigence Officielle: Preuve de possession et d'enregistrement officiel de l'entreprise commerciale hors de Thaïlande.",
      });
    }
  } else if (type === 'creator') {
    dynamicList.push({
      id: 'dyn-prof-creator-links',
      taskName: 'Préparer un document récapitulant vos canaux de diffusion (YouTube, Blog, Tik Tok) et statistiques d\'audience',
      category: 'Situation professionnelle',
      priority: 'Moyenne',
      status: 'A faire',
      comment: "Conseil pratique: Permet de justifier le motif de créateur de contenu auprès de l'agent consulaire.",
    });
  }

  // Combine user-defined custom tasks and computed dynamic ones
  return [...dynamicList, ...customTasks];
}
