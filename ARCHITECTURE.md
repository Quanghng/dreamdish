# Structure du Projet DreamDish

Cette documentation explique l'organisation du projet et le rôle de chaque dossier.

## 📁 Organisation des Dossiers

### `/app` - Application Next.js (App Router)

```
app/
├── api/              # API Routes (Backend serverless)
│   └── generate/     # Endpoint de génération de prompts
│       └── route.ts  # POST /api/generate
├── layout.tsx        # Layout racine (Header, Footer, providers)
├── page.tsx          # Page d'accueil (/)
└── globals.css       # Styles globaux CSS/Tailwind
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

### `/lib` - Bibliothèques et Utilitaires

```
lib/
├── mistral.ts       # Client Mistral AI configuré
└── utils.ts         # Fonctions utilitaires générales
```

**Rôle** : Code partagé et configurations des services externes.

**Contenu actuel** :
- `mistral.ts` : Client Mistral AI initialisé avec la clé API
- `utils.ts` : Helpers (formatage, validation, etc.)

### `/types` - Définitions TypeScript

```
types/
└── index.ts         # Tous les types et interfaces
```

**Rôle** : Centralise toutes les définitions de types TypeScript.

**Contenu** :
- Interfaces pour les données (Ingredient, Prompt, etc.)
- Types pour les API requests/responses
- Enums (MistralModel, IngredientCategory)

### `/config` - Configuration de l'Application

```
config/
└── mistral.config.ts    # Configuration des modèles Mistral
```

**Rôle** : Fichiers de configuration centralisés.

**Contenu** :
- Paramètres des modèles IA
- Prompts système
- Constantes de configuration

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

## 🚀 Évolution Future

### Extensions Prévues

```
dreamdish/
├── components/
│   ├── ImageGenerator/    # Génération d'images
│   ├── Gallery/           # Galerie de plats
│   └── History/           # Historique des prompts
├── app/
│   ├── gallery/           # Page galerie
│   ├── history/           # Page historique
│   └── api/
│       ├── images/        # Génération d'images
│       └── moderation/    # Modération de contenu
└── lib/
    └── database.ts        # Connexion DB (future)
```

## 📝 Naming Conventions

### Fichiers
- **Composants React** : `PascalCase.tsx` (ex: `IngredientCard.tsx`)
- **Utilitaires** : `camelCase.ts` (ex: `utils.ts`)
- **Types** : `index.ts` dans `/types`
- **API Routes** : `route.ts` dans `/app/api/[endpoint]`

### Code
- **Composants** : `PascalCase` (ex: `IngredientSelector`)
- **Fonctions** : `camelCase` (ex: `formatIngredientsList`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `MISTRAL_CONFIG`)
- **Interfaces** : `PascalCase` (ex: `GeneratePromptRequest`)
- **Types** : `PascalCase` (ex: `MistralClient`)

## 🔗 Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React Best Practices](https://react.dev/learn)
