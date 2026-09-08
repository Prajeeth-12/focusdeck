# FocusDeck — Personal Daily & Weekly Kanban Productivity System

A fast, offline-first personal productivity application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Dexie.js (IndexedDB)**.

> **Core Philosophy:** *"I decide. The application records and organizes."*  
> Zero auto-rescheduling, zero algorithmic prioritization, zero arbitrary productivity scores. Pure, manual user control with instant execution speed.

---

## ✨ Key Features

- 🎯 **Today View (`1`)**: Focused 3-pillar daily execution hub (**Coding**, **Theory / Learning**, **Projects**) with a circular daily completion meter and 1-click status toggles (`Start`, `Pause`, `Done`).
- 📅 **Weekly Plan (`2`)**: Full-width 7-day Monday–Sunday planning calendar with an integrated **Bottom Backlog Pool Dock**. Drag and drop tasks between days or schedule directly from the backlog pool.
- 🗄️ **Task Pool & Registry (`3`)**: Consolidated central registry with segmented views (**Backlog**, **All Active**, **Completed Archive**) and layout switchers (**Table View**, **Cards Grid**, **Kanban Board**).
- 🏷️ **Tag Cloud & Global Search**: Tag filtering and instant fuzzy search across titles, descriptions, categories, and tags with keyboard shortcut `/`.
- 🌓 **Dual Light & Dark Themes**: High-contrast, custom color-tokenized UI with an instant 1-click header toggle and persistent `localStorage` saving.
- 💾 **100% Offline & Local-First**: Backed by browser IndexedDB for zero latency. Includes JSON export and import for seamless backups.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `1` | Navigate to **Today** view |
| `2` | Navigate to **Weekly Plan** view |
| `3` | Navigate to **Task Pool** view |
| `N` | Open **New Task** modal |
| `/` | Focus **Global Search** |
| `Esc` | Close modal / clear focus |
| `Ctrl + Enter` | Save task in modal |

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Database:** Dexie.js (IndexedDB wrapper)
- **Effects:** Canvas-Confetti on completion

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Prajeeth-12/focusdeck.git
cd focusdeck
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

