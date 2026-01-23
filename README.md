# 🍽️ DreamDish

> Transformez vos ingrédients en œuvre d'art culinaire grâce à l'Intelligence Artificielle

## 📋 Description du Projet

DreamDish est une application web innovante qui permet de transformer une simple liste d'ingrédients en une description visuelle artistique d'un plat gastronomique unique. En utilisant l'IA Mistral, l'application génère des prompts détaillés qui peuvent ensuite être utilisés pour créer des images de plats extraordinaires.

### Concept

1. **Sélection d'ingrédients** : L'utilisateur sélectionne des ingrédients via une interface visuelle intuitive (grille d'images cliquables)
2. **Génération du prompt** : L'IA Mistral transforme cette liste en une description visuelle ultra-détaillée et artistique
3. **Création visuelle** : Le prompt généré peut être utilisé avec des outils de génération d'images (DALL-E, Stable Diffusion, etc.)

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework** : Next.js 16.1.3 (App Router)
- **Langage** : TypeScript 5
- **Stylisation** : Tailwind CSS 4
- **IA** : Mistral AI SDK (@mistralai/mistralai)
- **Runtime** : Node.js 24+ (LTS)
- **Package Manager** : npm

### Structure du Projet

```
dreamdish/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes (serverless)
│   │   └── generate/             # Endpoint pour la génération de prompts
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
├── components/                   # Composants React réutilisables
│   ├── ui/                       # Composants UI de base
│   ├── IngredientSelector/       # Sélecteur d'ingrédients
│   └── PromptDisplay/            # Affichage du prompt généré
├── lib/                          # Utilitaires et helpers
│   ├── mistral.ts                # Client Mistral AI
│   └── utils.ts                  # Fonctions utilitaires
├── types/                        # Définitions TypeScript
│   └── index.ts                  # Types partagés
├── config/                       # Configuration de l'application
│   └── mistral.config.ts         # Configuration des modèles Mistral
├── public/                       # Fichiers statiques
│   └── ingredients/              # Images d'ingrédients
├── .env                          # Variables d'environnement (non versionné)
├── .gitignore                    # Fichiers ignorés par Git
├── next.config.ts                # Configuration Next.js
├── tailwind.config.ts            # Configuration Tailwind CSS
├── tsconfig.json                 # Configuration TypeScript
└── package.json                  # Dépendances du projet
```

## 🤖 Modèles Mistral Utilisés

| Étape | Modèle | Justification |
|-------|--------|---------------|
| **Génération du prompt visuel** | Mistral Large 3 ou Mistral Medium 3.1 | Modèles "frontier-class" les plus performants pour transformer une liste d'ingrédients en description artistique complexe |
| **Filtrage / Sécurité** | Mistral Moderation | Vérifie que les combinaisons d'ingrédients et prompts respectent les règles de sécurité |
| **Suggestions temps réel** | Mistral Small 3.2 | Modèle rapide pour suggérer des ingrédients pendant la saisie utilisateur |

> **Note importante** : Les modèles Mistral sont des modèles de langage (text-to-text). Pour générer l'image finale, le prompt créé par Mistral doit être envoyé à un moteur de génération d'images (DALL-E, Stable Diffusion, etc.).

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 24+ installé (LTS version recommandée)
- npm ou yarn
- Une clé API Mistral AI valide
- Une clé API Hugging Face (gratuite)
- Une clé API Google AI (pour la génération d'images avec Imagen 3)

### Installation

1. **Cloner le projet** (si applicable)
   ```bash
   git clone <url-du-repo>
   cd dreamdish
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**
   
   Créez un fichier `.env` à la racine du projet en copiant `.env.example` :
   ```bash
   cp .env.example .env
   ```

   Puis remplissez les valeurs suivantes :

   #### **Clés API Requises** 🔑

   ```env
   # Clé API Mistral AI (REQUIS)
   # Obtenez-la sur : https://console.mistral.ai/
   MISTRAL_API_KEY=votre_clé_api_mistral_ici
   
   # Clé API Hugging Face (REQUIS)
   # Créez un compte gratuit : https://huggingface.co/settings/tokens
   HUGGINGFACE_API_KEY=votre_clé_api_huggingface_ici
   
   # Clé API Google AI (REQUIS pour génération d'images)
   # Obtenez-la sur : https://makersuite.google.com/app/apikey
   GOOGLE_AI_API_KEY=votre_clé_api_google_ici
   ```

   #### **Configuration des Modèles** (Optionnel)

   ```env
   # Modèles Mistral AI (valeurs par défaut)
   MISTRAL_MODEL_LARGE=mistral-large-latest
   MISTRAL_MODEL_MEDIUM=mistral-medium-latest
   MISTRAL_MODEL_SMALL=mistral-small-latest
   MISTRAL_MODEL_MODERATION=mistral-small-latest
   ```

   #### **Rate Limiting** (Optionnel)

   ```env
   # Limites de requêtes
   MISTRAL_MAX_REQUESTS_PER_MINUTE=60
   MISTRAL_MAX_TOKENS_PER_REQUEST=4096
   ```

   #### **Fonctionnalités** (Optionnel)

   ```env
   # Activer/désactiver des fonctionnalités
   ENABLE_MODERATION=true
   ENABLE_SUGGESTIONS=true
   ENABLE_IMAGE_GENERATION=true
   LOG_AI_REQUESTS=true
   ```

   #### **Configuration Base de Données** (Prisma PostgreSQL)

   ```env
   # PostgreSQL Database URLs (Vercel/Prisma)
   DATABASE_URL="postgres://user:password@host:5432/database?sslmode=require"
   POSTGRES_URL="postgres://user:password@host:5432/database?sslmode=require"
   PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"
   ```

   #### **NextAuth Configuration** (Authentification)

   ```env
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000/"
   NEXTAUTH_SECRET="générez_un_secret_aléatoire_ici"
   ```

   Pour générer `NEXTAUTH_SECRET`, utilisez :
   ```bash
   openssl rand -base64 32
   ```

   #### **Configuration Locale** (Optionnel)

   ```env
   # URL de l'application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   > ⚠️ **Important** : 
   > - Ne jamais committer le fichier `.env` dans Git (déjà dans `.gitignore`)
   > - Gardez vos clés API secrètes et ne les partagez jamais
   > - Pour la production, configurez ces variables dans les paramètres de votre plateforme de déploiement (Vercel, etc.)

4. **Initialiser la base de données** (si vous utilisez Prisma)
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Lancement en développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build de production

```bash
npm run build
npm run start
```

## 🐳 Déploiement avec Docker

La méthode la plus simple pour lancer l'application est d'utiliser Docker Compose.

### Prérequis Docker

- [Docker](https://docs.docker.com/get-docker/) installé
- [Docker Compose](https://docs.docker.com/compose/install/) installé (inclus avec Docker Desktop)

### Lancement rapide avec Docker

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd dreamdish
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Éditez le fichier `.env` et remplissez vos clés API :
   ```env
   # Clés API (REQUIS)
   MISTRAL_API_KEY=votre_clé_mistral
   HUGGINGFACE_API_KEY=votre_clé_huggingface
   GOOGLE_AI_API_KEY=votre_clé_google
   
   # NextAuth (REQUIS)
   NEXTAUTH_SECRET=générez_avec_openssl_rand_base64_32
   ```

3. **Lancer l'application**
   ```bash
   docker-compose up -d
   ```

4. **Initialiser la base de données** (première fois uniquement)
   ```bash
   docker-compose exec app npx prisma db push
   ```

5. **Accéder à l'application**
   
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Commandes Docker utiles

| Commande | Description |
|----------|-------------|
| `docker-compose up -d` | Démarre les conteneurs en arrière-plan |
| `docker-compose down` | Arrête et supprime les conteneurs |
| `docker-compose logs -f app` | Affiche les logs de l'application |
| `docker-compose logs -f db` | Affiche les logs de la base de données |
| `docker-compose exec app npx prisma studio` | Ouvre Prisma Studio |
| `docker-compose build --no-cache` | Reconstruit l'image sans cache |
| `docker-compose down -v` | Arrête et supprime les volumes (⚠️ efface les données) |

### Architecture Docker

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
├─────────────────────────┬───────────────────────────────┤
│     dreamdish-app       │        dreamdish-db           │
│     (Next.js 16)        │      (PostgreSQL 16)          │
│     Port: 3000          │        Port: 5432             │
├─────────────────────────┴───────────────────────────────┤
│                  dreamdish-network                       │
└─────────────────────────────────────────────────────────┘
```

### Personnalisation

Vous pouvez personnaliser la configuration de la base de données dans `.env` :

```env
# Credentials PostgreSQL (Docker)
POSTGRES_USER=dreamdish
POSTGRES_PASSWORD=votre_mot_de_passe_securise
POSTGRES_DB=dreamdish
```

> ⚠️ **Note** : En production, utilisez des mots de passe forts et ne les commitez jamais dans Git.

## 🔧 Configuration

### Configuration Mistral

Les paramètres des modèles Mistral sont configurables dans `config/mistral.config.ts` :

- Choix du modèle (Large, Medium, Small)
- Température (créativité)
- Tokens maximum
- Paramètres de sécurité

### Configuration Tailwind CSS

Le fichier `tailwind.config.ts` permet de personnaliser :
- Palette de couleurs
- Breakpoints responsive
- Espacements personnalisés
- Plugins additionnels

## 📝 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Compile l'application pour la production |
| `npm run start` | Lance l'application en mode production |
| `npm run lint` | Vérifie la qualité du code avec ESLint |

## 🎯 Fonctionnalités Prévues

### Phase 1 - MVP (Minimum Viable Product)
- [x] Configuration du projet Next.js + TypeScript
- [ ] Interface de sélection d'ingrédients (grille visuelle)
- [ ] Intégration API Mistral pour génération de prompts
- [ ] Affichage du prompt généré
- [ ] Système de copie du prompt

### Phase 2 - Améliorations
- [ ] Suggestions d'ingrédients en temps réel
- [ ] Filtrage par catégories (légumes, viandes, épices, etc.)
- [ ] Historique des prompts générés
- [ ] Système de favoris

### Phase 3 - Avancé
- [ ] Intégration directe avec un générateur d'images
- [ ] Galerie de plats générés
- [ ] Partage sur les réseaux sociaux
- [ ] Multi-langues

## 🔐 Sécurité

### Bonnes Pratiques Implémentées

1. **Protection de la clé API** : La clé Mistral est stockée côté serveur uniquement (API Routes)
2. **Variables d'environnement** : Utilisation de `.env` pour les secrets
3. **Validation des entrées** : Vérification des données utilisateur avant envoi à l'API
4. **Modération** : Utilisation de Mistral Moderation pour filtrer les contenus inappropriés

### Limitations de la Clé API

- **Expiration** : 24 janvier 2026
- **Action requise** : Renouveler la clé avant expiration sur [console.mistral.ai](https://console.mistral.ai)

## 🛠️ Technologies et Dépendances

### Dépendances de Production

```json
{
  "@mistralai/mistralai": "^1.11.0",  // SDK officiel Mistral AI
  "next": "16.1.3",                    // Framework React
  "react": "19.2.3",                   // Bibliothèque UI
  "react-dom": "19.2.3"                // Rendu React
}
```

### Dépendances de Développement

```json
{
  "@tailwindcss/postcss": "^4",        // PostCSS pour Tailwind
  "@types/node": "^20",                // Types TypeScript pour Node.js
  "@types/react": "^19",               // Types TypeScript pour React
  "@types/react-dom": "^19",           // Types TypeScript pour ReactDOM
  "eslint": "^9",                      // Linter JavaScript/TypeScript
  "eslint-config-next": "16.1.3",      // Configuration ESLint pour Next.js
  "tailwindcss": "^4",                 // Framework CSS utilitaire
  "typescript": "^5"                   // Langage TypeScript
}
```

## 📚 Ressources et Documentation

### Documentation Officielle

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Mistral AI Documentation](https://docs.mistral.ai)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Exemples de Code

#### Appel à l'API Mistral (Backend)

```typescript
// app/api/generate/route.ts
import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

export async function POST(request: Request) {
  const { ingredients } = await request.json();
  
  const prompt = `Crée une description visuelle ultra-détaillée pour un plat gastronomique 
  original utilisant ces ingrédients : ${ingredients.join(", ")}. 
  Le style doit être moderne et la présentation artistique.`;
  
  const response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: prompt }]
  });
  
  return Response.json({ prompt: response.choices[0].message.content });
}
```

#### Sélection d'ingrédients (Frontend)

```typescript
// components/IngredientSelector.tsx
'use client';

import { useState } from 'react';

export default function IngredientSelector() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  const handleIngredientClick = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Grille d'ingrédients */}
    </div>
  );
}
```

## 👥 Contribution

Ce projet suit les principes de **good practices** et de **code modulaire**.

### Conventions de Code

- **TypeScript strict** : Typage fort obligatoire
- **ESLint** : Respect des règles définies
- **Composants** : Un composant = un fichier
- **Nommage** : PascalCase pour composants, camelCase pour fonctions
- **Comments** : Code auto-documenté, commentaires pour la logique complexe

### Structure des Commits

```
feat: Ajout du sélecteur d'ingrédients
fix: Correction de l'appel API Mistral
docs: Mise à jour du README
style: Format du code avec Prettier
refactor: Restructuration du client Mistral
```

## 📄 Licence

Ce projet est développé dans le cadre du programme EFREIM2 sous la supervision de Jérôme Commaret.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation des technologies utilisées
2. Vérifiez les issues GitHub (si applicable)
3. Contactez l'équipe de développement

---

**Version** : 0.1.0  
**Date de création** : Janvier 2026  
**Dernière mise à jour** : 19 janvier 2026
