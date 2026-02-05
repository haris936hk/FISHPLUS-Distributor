# CLAUDE.md

> Persistent project memory for AI assistants working on FISHPLUS-Distributor.

---

## Project Overview

**FISHPLUS-Distributor** is a desktop (Desktop Optimized Layout mouse focused) application built with Electron Forge, React 19, and Zustand for state management. It uses SQLite for local data persistence, Mantine as the UI component library, and communicates between main/renderer processes via a secure IPC bridge.

**Tech Stack:** Electron 40 · React 19 · Zustand · Mantine 8 · SQLite · Tailwind CSS 4 · Webpack

---

## Build & Development Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Run dev server | `npm start` |
| Package app | `npm run package` |
| Build distributable | `npm run make` |
| Lint code | `npm run lint` |
| Auto-fix lint issues | `npm run lint:fix` |
| Format code | `npm run format` |
| Check formatting | `npm run format:check` |

---

## Testing Instructions

| Task | Command |
|------|---------|
| Run full test suite | `npm test` |
| Watch mode | `npm run test:watch` |

- **Framework:** Mocha + Chai
- **Config:** `.mocharc.json`
- **Test files:** `test/**/*.test.js`
- **Setup file:** `test/setup.js` (runs before all tests)

---

## Code Style & Conventions

### Formatting (Prettier)
- Semicolons: **always**
- Quotes: **single**
- Tab width: **2 spaces**
- Trailing commas: **ES5**
- Max line width: **100 chars**

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `FeatureCard.jsx` |
| Hooks | camelCase, `use` prefix | `useDatabase.js` |
| Store files | camelCase | `store/index.js` |
| Constants | SCREAMING_SNAKE_CASE | `FEATURES` |

### Architectural Patterns
- **Functional components only** — no class components
- **Zustand store** with `devtools` middleware for state management
- **IPC abstraction** via `window.api.*` — never call `ipcRenderer` directly
- **Domain-specific hooks** for data fetching (`useAppVersion`, `usePlatform`)
- **Barrel exports** — use `index.js` in component/hook directories

### Do's
- ✅ Use `PropTypes` for component props validation
- ✅ Keep components small and focused
- ✅ Use Mantine components for UI consistency
- ✅ Access IPC through `window.api` (e.g., `window.api.settings.getAll()`)
- ✅ Use Tailwind utility classes for layout/spacing

### Don'ts
- ❌ Don't use raw SQL queries in renderer — use domain-specific APIs
- ❌ Don't disable `contextIsolation` or enable `nodeIntegration`
- ❌ Don't import Electron directly in renderer process
- ❌ Avoid inline styles; prefer Tailwind or Mantine props

---

## Project Structure

```
FISHPLUS-Distributor/
├── src/
│   ├── main.js              # Electron main process entry
│   ├── preload.js           # Preload script (context bridge)
│   ├── index.html           # HTML template
│   ├── database/
│   │   ├── index.js         # DB initialization & connection
│   │   ├── migrations.js    # Schema migrations
│   │   ├── queries.js       # Reusable query functions
│   │   └── schema.sql       # Database schema
│   ├── ipc/
│   │   ├── channels.js      # IPC channel name constants
│   │   └── handlers.js      # Main process IPC handlers
│   └── renderer/
│       ├── App.jsx          # Root React component
│       ├── index.jsx        # React entry point
│       ├── index.css        # Global styles
│       ├── components/      # Reusable UI components
│       │   ├── index.js     # Barrel export
│       │   ├── FeatureCard.jsx
│       │   └── ErrorBoundary.jsx
│       ├── hooks/           # Custom React hooks
│       │   └── useDatabase.js
│       └── store/           # Zustand state management
│           └── index.js
├── test/
│   ├── setup.js             # Test environment setup
│   └── *.test.js            # Test files
├── .webpack/                # Webpack output (generated)
├── out/                     # Packaged app output
└── Config files:
    ├── forge.config.js      # Electron Forge config
    ├── webpack.*.js         # Webpack configs
    ├── tailwind.config.js   # Tailwind CSS config
    ├── eslint.config.js     # ESLint flat config
    ├── .prettierrc          # Prettier config
    └── .mocharc.json        # Mocha test config
```

---

## Key Gotchas

1. **IPC Security:** The `useDatabase` hook is deprecated. Always use `window.api.*` methods.
2. **DevTools:** Auto-open only in development (`!app.isPackaged`).
3. **Database Lifecycle:** Initialized on `app.whenReady()`, closed on `before-quit`.
