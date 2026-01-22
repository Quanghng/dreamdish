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
- **Runtime** : Node.js 22+ (⚠️ Node.js 20 n'est pas supporté)
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
├── .env.local                    # Variables d'environnement (non versionné)
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

- Node.js 22+ installé (⚠️ **Node.js 20.x n'est pas compatible** avec Next.js 16)
- npm ou yarn
- Une clé API Mistral AI valide

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
   
   Créez un fichier `.env.local` à la racine du projet :
   ```env
   # Clé API Mistral AI
   MISTRAL_API_KEY=votre_clé_api_ici
   
   # Configuration optionnelle
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   > ⚠️ **Important** : Ne jamais committer le fichier `.env.local` dans Git. La clé API doit rester secrète.

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
2. **Variables d'environnement** : Utilisation de `.env.local` pour les secrets
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
