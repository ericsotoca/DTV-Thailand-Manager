import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  
  // Use a generous body limit so users can upload document images/PDFs as base64 strings
  app.use(express.json({ limit: '25mb' }));

  // Initialize Gemini SDK with User-Agent header for telemetry
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health / check config endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // AI Document analysis endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { fileName, fileType, fileData, profile, requirement } = req.body;
      
      if (!fileData) {
        return res.status(400).json({ error: 'Données de fichier manquantes (base64 requis).' });
      }

      // Check if API Key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "La clé API Gemini n'est pas configurée sur le serveur. Veuillez l'ajouter dans les Secrets de l'AI Studio." 
        });
      }

      // Format clean base64 data (strip prefix if present)
      const cleanBase64 = fileData.replace(/^data:.*?;base64,/, '');

      const systemInstruction = `Tu es l'assistant de vérification officiel du "DTV Thailand Manager". Cet outil est STRICTEMENT dédié aux ressortissants français, habitant en France, et déposant leur demande de Destination Thailand Visa (DTV) pour motif "Workcation / Freelancer" auprès de l'Ambassade Royale de Thaïlande à Paris.

Ton rôle est d'analyser les documents administratifs fournis sous forme d'image (base64) pour évaluer s'ils respectent les exigences spécifiques du consulat à Paris.

EXIGENCES CONSULAIRES DE PARIS (FRANCE) À RESPECTER :
1. Traduction officielle : Tout document rédigé en français (attestation d'auto-entrepreneur URSSAF, KBis français, facture d'électricité EDF, justificatif de domicile) doit être accompagné d'une traduction certifiée conforme en anglais ou thaïlandais par un traducteur assermenté. Si un document analysé est en français (hors passeport multilingue), tu dois impérativement suggérer le statut 'À traduire'.
2. Nationalité et résidence : Le demandeur doit obligatoirement posséder un passeport français et résider en France (prouvé par un justificatif de domicile de moins de 3 mois).
3. Seuil financier : L'Ambassade à Paris exige un solde d'au moins 500 000 THB (soit environ 13 400 €) sur des comptes bancaires français ou libellés en euros. Si le solde d'un relevé en euros est insuffisant, signale-le.

RÈGLES D'OR DE PRUDENCE :
1. Tu ne dois JAMAIS déclarer catégoriquement qu'un document sera accepté par l'administration ou garantir l'octroi du visa.
2. Utilise systématiquement des formulations mesurées et prudentes comme : "semble correspondre", "information à vérifier", "document potentiellement incomplet", "vérifier auprès de la source officielle".
3. Ne jamais inventer ou supposer une règle administrative qui n'est pas stipulée.
4. Identifie le type de document, extrait les dates clés (émission, expiration), le nom complet du titulaire, la langue du document, et vérifie la cohérence avec le profil de citoyen français déposant à Paris.
5. Signale explicitement les informations manquantes ou les incohérences (par exemple, si le nom sur le document ne correspond pas exactement au nom du profil, ou si la date d'expiration est critique).
6. Suggère la catégorie de classement la plus adaptée parmi :
   'Identity', 'Passport', 'Photographie', 'Situation professionnelle', 'Revenus', 'Situation financière', 'Banque', 'Résidence', 'Hébergement en Thaïlande', 'Preuve de voyage', 'Documents complémentaires', 'Traductions', 'Certifications / authentifications'
7. Suggère un statut d'évaluation adapté parmi :
   'Obtenu', 'À vérifier', 'À traduire', 'À certifier', 'À renouveler'`;

      const promptText = `Analyse ce document administratif pour le dossier DTV de ${profile ? `${profile.firstName} ${profile.lastName}` : 'le demandeur'}.
      
      Profil déclaré du demandeur :
      - Nom: ${profile?.lastName || 'Non spécifié'}
      - Prénom: ${profile?.firstName || 'Non spécifié'}
      - Nationalité: ${profile?.nationality || 'Non spécifié'}
      - Passeport: ${profile?.passportNumber || 'Non spécifié'} (Expire le: ${profile?.passportExpiryDate || 'Non spécifié'})
      - Activité professionnelle: ${profile?.professionalActivity || 'Non spécifié'} (Statut: ${profile?.activityType || 'Non spécifié'})
      - Revenus mensuels: ${profile?.monthlyIncome || 'Non spécifié'}
      
      Détails de l'exigence associée : ${requirement ? JSON.stringify(requirement) : 'Exigences générales (solde bancaire suffisant > 500 000 THB ou preuve de remote-working / portfolio freelance).'}.
      
      Examine attentivement l'image du document et fournis une réponse structurée au format JSON strict avec les propriétés suivantes :
      - documentType: Nom précis du document identifié (ex: "Relevé de compte HSBC Mars 2026", "Contrat de freelance de prestation de service", etc.)
      - extractedHolder: Nom du titulaire extrait du document (ou null si non trouvé)
      - extractedDates: { issueDate: "AAAA-MM-JJ" ou null, expiryDate: "AAAA-MM-JJ" ou null }
      - language: Code ou nom de la langue détectée (ex: "fr", "en", "th", etc.)
      - keyDetails: Tableau contenant 3 à 5 faits clés extraits (ex: "Solde final de 15 230 € (environ 580 000 THB)", "Date de début de contrat: 12/2025", "Entreprise émettrice: Acme Corp", etc.)
      - profileMatch: Valeur booléenne indiquant si le titulaire extrait correspond au nom du profil (avec tolérance sur les majuscules/accents) ou si le document est pertinent pour ce profil.
      - issuesDetected: Tableau de problèmes ou incohérences détectés (ex: "Le solde de 4 200 € est inférieur au seuil requis de 500 000 THB", "Le nom sur la facture est abrégé", "Le document est en français, une traduction certifiée en anglais ou thaï est probablement nécessaire pour l'ambassade", ou tableau vide si aucun problème majeur n'est détecté)
      - suggestedCategory: Une des 13 catégories exactes mentionnées dans les instructions du système
      - suggestedStatus: Un des statuts exacts mentionnés dans les instructions du système (par ex: 'À vérifier' ou 'Obtenu' ou 'À traduire')
      - commentary: Analyse globale, rédigée en français avec beaucoup de soin, intégrant obligatoirement un conseil pratique et le rappel des informations à vérifier. Respecte le ton de l'assistant administratif d'une ambassade (prudent, rigoureux, guidant l'utilisateur sans s'engager).
      - confidenceScore: Note de confiance de 1 à 5 sur l'extraction (1 = faible/flou, 5 = très net et fiable).`;

      // Construct inlineData part for Gemini
      const imagePart = {
        inlineData: {
          mimeType: fileType || 'image/jpeg',
          data: cleanBase64,
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [imagePart, { text: promptText }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: { type: Type.STRING },
              extractedHolder: { type: Type.STRING, description: "Nom du titulaire ou null" },
              extractedDates: {
                type: Type.OBJECT,
                properties: {
                  issueDate: { type: Type.STRING },
                  expiryDate: { type: Type.STRING }
                }
              },
              language: { type: Type.STRING },
              keyDetails: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              profileMatch: { type: Type.BOOLEAN },
              issuesDetected: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedCategory: { type: Type.STRING },
              suggestedStatus: { type: Type.STRING },
              commentary: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER }
            },
            required: [
              'documentType',
              'profileMatch',
              'issuesDetected',
              'suggestedCategory',
              'suggestedStatus',
              'commentary',
              'confidenceScore'
            ]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Le modèle n'a renvoyé aucune réponse.");
      }

      const data = JSON.parse(resultText);
      return res.json(data);
    } catch (error: any) {
      console.error('Erreur lors de l\'analyse de document par Gemini:', error);
      return res.status(500).json({ 
        error: error.message || "Erreur interne lors de l'analyse du document par l'IA." 
      });
    }
  });

  // Serve static client assets in production, otherwise mount Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DTV Manager Server] Listening on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[DTV Manager Server] Failed to start:', err);
});
