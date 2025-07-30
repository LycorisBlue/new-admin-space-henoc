# Dashboard Next.js

Dashboard moderne développé avec Next.js et Tailwind CSS.

## 🚀 Installation

```bash
npm install
npm run dev
```

## 📁 Structure

```
src/
├── app/                 # Pages et layouts (App Router)
├── components/
│   ├── ui/             # Composants réutilisables
│   └── shared/         # Composants spécifiques dashboard
├── lib/                # Utilitaires et API
└── styles/             # CSS personnalisé
```

## 📝 Conventions

- `.js` pour utilitaires, config, API
- `.jsx` pour composants React

## 🛠 Stack Technique

- **Next.js 14** - Framework React
- **Tailwind CSS** - Styles utilitaires
- **App Router** - Système de routage moderne

## 🔧 Configuration

Créer `.env.local` :

```env
NEXT_PUBLIC_API_URL=https://china-test.api-medev.com
```

## 📦 Scripts

```bash
npm run dev      # Serveur développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```

## 🏗 Composants

- `Sidebar` - Navigation principale
- `TopBar` - Barre supérieure
- `Widget` - Conteneurs métriques
- `Card` - Conteneur générique

## 🌐 API

Fonctions API dans `lib/api.js` pour communication avec l'API externe.