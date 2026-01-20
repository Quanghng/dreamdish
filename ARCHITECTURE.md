# Structure du Projet DreamDish

Cette documentation explique l'organisation du projet et le rôle de chaque dossier.

## 📁 Organisation des Dossiers

### `/app` - Application Next.js (App Router)

```
app/
├── api/                  # API Routes (Backend serverless)
│   ├── generate/         # Endpoint de génération de prompts
│   │   └── route.ts      # POST /api/generate
│   ├── suggestions/      # Endpoint de suggestions d'ingrédients
│   │   └── route.ts      # POST|GET /api/suggestions
│   └── health/           # Endpoint de monitoring
│       └── route.ts      # GET /api/health
├── layout.tsx            # Layout racine (Header, Footer, providers)
├── page.tsx              # Page d'accueil (/)
└── globals.css           # Styles globaux CSS/Tailwind
```

**Rôle** : Contient toutes les pages et routes de l'application selon l'App Router de Next.js.

### `/components` - Composants React Réutilisables

```
components/
├── ui/                      # Composants UI de base
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── IngredientSelector/      # Sélecteur d'ingrédients
│   ├── index.tsx
│   ├── IngredientGrid.tsx
│   └── IngredientCard.tsx
└── PromptDisplay/           # Affichage du prompt
    ├── index.tsx
    └── CopyButton.tsx
```

**Rôle** : Contient tous les composants React modulaires et réutilisables.

**Convention** : 
- Un composant = un fichier
- PascalCase pour les noms
- Index.tsx pour l'export principal

### `/lib` - Services et Utilitaires AI

```
lib/
├── mistral.ts            # Client Mistral AI principal
├── moderation.ts         # Service de modération de contenu
├── suggestions.ts        # Service de suggestions avec cache
├── errors.ts             # Gestion des erreurs AI
├── utils.ts              # Fonctions utilitaires générales
└── prompts/              # Ingénierie des prompts
    ├── templates.ts      # Templates de prompts
    └── builder.ts        # Constructeur dynamique de prompts
```

**Rôle** : Code partagé, services AI et configurations.

**Contenu détaillé** :
- `mistral.ts` : Client Mistral AI, génération de prompts visuels, métriques
- `moderation.ts` : Vérification de contenu (blocklist + AI)
- `suggestions.ts` : Suggestions d'ingrédients en temps réel avec cache
- `errors.ts` : Types d'erreurs standardisés et messages utilisateur
- `utils.ts` : Helpers (validation, retry, rate limiting, parsing)
- `prompts/templates.ts` : Templates de prompts pour chaque cas d'usage
- `prompts/builder.ts` : Construction dynamique des prompts

### `/types` - Définitions TypeScript

```
types/
└── index.ts              # Tous les types et interfaces AI
```

**Rôle** : Centralise toutes les définitions de types TypeScript.

**Types principaux** :
- `GeneratePromptRequest/Response` : API de génération
- `SuggestionRequest/Response` : API de suggestions
- `ModerationResult` : Résultat de modération
- `AIError`, `AIMetrics`, `AIHealthStatus` : Monitoring
- `CulinaryStyle`, `PresentationStyle` : Options de style

### `/config` - Configuration de l'Application

```
config/
└── mistral.config.ts     # Configuration centralisée Mistral AI
```

**Rôle** : Paramètres centralisés pour l'intégration AI.

**Contenu** :
- Sélection des modèles (large, small, moderation)
- Paramètres de génération (temperature, maxTokens, topP)
- Configuration du retry et rate limiting
- Feature flags (modération, suggestions, logs)

### `/public` - Fichiers Statiques

```
public/
├── ingredients/         # Images d'ingrédients
│   ├── tomate.jpg
│   ├── basilic.jpg
│   └── ...
├── favicon.ico
└── next.svg
```

**Rôle** : Assets statiques accessibles publiquement.

**Note** : Les fichiers sont servis depuis `/` (ex: `/ingredients/tomate.jpg`)

### `/__tests__` - Tests Automatisés

```
__tests__/
├── setup.ts              # Configuration globale des tests
├── lib/
│   ├── mistral.test.ts   # Tests du client Mistral
│   ├── moderation.test.ts # Tests de modération
│   └── suggestions.test.ts # Tests de suggestions
├── api/
│   └── generate.test.ts  # Tests d'intégration API
└── prompts/
    └── quality.test.ts   # Tests de qualité des prompts
```

**Rôle** : Tests unitaires et d'intégration avec Vitest.

## 🔄 Flux de Données

### 1. Sélection d'Ingrédients (Frontend)
```
User Click → IngredientCard → IngredientSelector (state) → Selected List
```

### 2. Génération de Prompt (API Call)
```
Frontend → POST /api/generate → Mistral AI → Response → Display
```

### 3. Architecture Client-Serveur
```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────┐
│  Client (React) │ -----> │ API Route (Next) │ -----> │  Mistral AI │
│  /components    │  HTTP  │  /app/api        │  SDK   │  (External) │
└─────────────────┘ <----- └──────────────────┘ <----- └─────────────┘
     JSON Request            Server-side only         API Response
```

### Flux de Génération de Prompt

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                            │
│  1. Sélection des ingrédients                                           │
│  2. Choix du style (modern, classic, fusion, molecular, rustic)         │
│  3. Choix de présentation (minimalist, elaborate, artistic, traditional)│
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ POST /api/generate
┌─────────────────────────────────────────────────────────────────────────┐
│                              SERVEUR (Next.js)                           │
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ Validation  │───▶│ Modération  │───▶│ Génération  │                  │
│  │ des entrées │    │ (blocklist  │    │ du prompt   │                  │
│  │             │    │  + AI)      │    │ visuel      │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
│         │                  │                  │                          │
│         ▼                  ▼                  ▼                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ Rate        │    │ Prompt      │    │ Retry avec  │                  │
│  │ Limiting    │    │ Builder     │    │ Backoff     │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ API Mistral
┌─────────────────────────────────────────────────────────────────────────┐
│                           MISTRAL AI                                     │
│                                                                          │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │  mistral-large    │  │  mistral-small    │  │ mistral-moderation│   │
│  │  (Génération)     │  │  (Suggestions)    │  │ (Sécurité)        │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📋 Bonnes Pratiques Appliquées

### 1. Séparation des Préoccupations
- **Frontend** (`/components`) : UI et interactions utilisateur
- **Backend** (`/app/api`) : Logique serveur et appels API externes
- **Types** (`/types`) : Contrats de données partagés
- **Config** (`/config`) : Paramètres centralisés

### 2. Sécurité
- Clé API Mistral stockée côté serveur uniquement
- Variables d'environnement dans `.env.local` (non versionné)
- Validation des entrées utilisateur

### 3. Modularité
- Composants réutilisables et isolés
- Fonctions utilitaires partagées dans `/lib`
- Types centralisés pour éviter la duplication

### 4. TypeScript Strict
- Typage fort sur tous les fichiers
- Interfaces explicites pour les API
- Enums pour les valeurs constantes

### Stratégies de Résilience

1. **Retry avec Backoff Exponentiel**
   - 3 tentatives maximum
   - Délai initial: 1s, max: 10s
   - Multiplicateur: 2x

2. **Rate Limiting**
   - API: 30 requêtes/minute
   - AI: 10 appels/minute
   - Headers informatifs (X-RateLimit-Remaining)

3. **Cache des Suggestions**
   - TTL: 5 minutes
   - Clé basée sur contexte + recherche
   - Nettoyage automatique

4. **Fail-Open pour la Modération**
   - Blocklist local en premier
   - Fallback si AI indisponible

## 🔒 Sécurité

### Protection des Clés API
- Clé Mistral côté serveur uniquement
- Variables d'environnement dans `.env.local`
- Fichier `.env.example` pour documentation

### Modération de Contenu
1. **Vérification Blocklist** (rapide)
   - Termes dangereux/toxiques
   - Substances illicites
   - Non-alimentaire

2. **Modération AI** (avancée)
   - Analyse contextuelle
   - Combinaisons dangereuses
   - Réponse JSON structurée

### Validation des Entrées
- 1-15 ingrédients requis
- Styles et présentations validés
- Sanitisation des strings

## 📊 Monitoring

### Endpoint Health Check
`GET /api/health`

Retourne:
- Statut de connexion Mistral
- Validité de la clé API
- Features activées
- Métriques (latence, succès, tokens)

### Métriques Collectées
- Durée des requêtes (ms)
- Tokens utilisés
- Taux de succès
- Codes d'erreur

## 🧪 Tests

### Commandes
```bash
npm test              # Mode watch
npm run test:run      # Exécution unique
npm run test:coverage # Avec couverture
npm run test:ui       # Interface graphique
```

### Couverture
- **lib/** : Services AI
- **app/api/** : Routes API
- **prompts/** : Qualité des prompts

## 🚀 Démarrage Rapide

### 1. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Ajouter votre clé API Mistral
# MISTRAL_API_KEY=votre_clé_ici
```

### 2. Installation
```bash
npm install
```

### 3. Développement
```bash
npm run dev
```

### 4. Tests
```bash
npm test
```

## 📝 Conventions de Nommage

### Fichiers
- **Composants React** : `PascalCase.tsx`
- **Services/Utils** : `camelCase.ts`
- **Types** : `index.ts` dans `/types`
- **Tests** : `*.test.ts`

### Code
- **Composants** : `PascalCase`
- **Fonctions** : `camelCase`
- **Constantes** : `UPPER_SNAKE_CASE`
- **Interfaces** : `PascalCase`
- **Commentaires** : Français

## 🔗 Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
