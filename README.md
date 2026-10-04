# 📚 Portugiesisch Lernen PWA

Eine Progressive Web App zum Erlernen von Portugiesisch mit Spaced Repetition und Flashcards.

## 🎯 Features

- **📚 Flashcards mit 3D-Animation** - Interaktive Karten zum Üben von Portugiesisch-Deutsch Übersetzungen
- **🧠 SM-2 Spaced Repetition Algorithm** - Optimale Lernintervalle basierend auf Ihre Leistung
- **💾 Offline-First PWA** - Arbeitet vollständig offline mit LocalStorage Persistierung
- **📊 Statistiken & Fortschrittverfolgung** - Detaillierte Übersicht Ihrer Lernleistung
- **🎓 Kategorisierte Wortlisten** - Top 100, 500 und 1000 häufigste Portugiesische Wörter
- **📱 Mobile-First Design** - Responsive Design für Smartphones, Tablets und Desktop
- **🌙 Dark Mode** - Automatische Unterstützung für Light und Dark Mode
- **⌨️ Typing Practice** - Müssen das portugiesische Wort tippen, nicht nur Karte umdrehen

## 🚀 Quick Start

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Produktions-Build anzeigen
npm run preview
```

Die App läuft auf `http://localhost:5173/`.

## 📁 Projektstruktur

```
src/
├── components/          # React Komponenten
│   ├── Flashcard.tsx         # 3D Flashcard mit Typing Input
│   ├── StudyMode.tsx         # Hauptlernmodus
│   ├── CategorySelector.tsx  # Wortkategorie-Wähler
│   ├── Stats.tsx             # Statistiken und Fortschritt
│   └── Navigation.tsx        # App-Navigation/Header
├── data/
│   └── words.ts         # Portugiesisch-Deutsch Wortliste (250+ Wörter)
├── lib/
│   ├── sm2.ts           # SM-2 Spaced Repetition Algorithm
│   └── useProgress.ts   # Custom Hook für LocalStorage Persistierung
├── types/
│   └── index.ts         # TypeScript Interfaces
├── App.tsx              # Haupt-App Komponente
├── main.tsx             # Entry Point mit Service Worker Registrierung
└── index.css            # Tailwind CSS Konfiguration
```

## 🎯 How to Use

1. **Kategorie wählen** - Starten Sie mit Top 100 häufigsten Wörtern
2. **Lernen starten** - Übersetzen Sie deutsche Wörter ins Portugiesische
3. **Bewerten** - Geben Sie an, wie schwer die Frage war
4. **Statistiken** - Verfolgen Sie Ihren Fortschritt

## 🛠️ Technology Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS 4** - CSS Framework
- **Service Worker** - Offline-Funktionalität
- **LocalStorage** - Client-seitige Datenspeicherung

## 📱 PWA Installation

### Chrome/Edge (Desktop)
Klicken Sie auf das Install-Symbol in der Adressleiste.

### iOS (Safari)
1. Tippen Sie auf Share
2. "Zum Home-Bildschirm hinzufügen"

### Android (Chrome)
1. Öffnen Sie das Menü
2. "App installieren"

## 📊 Datenstruktur

Alle Daten werden lokal in LocalStorage gespeichert:
- `portugiesisch_cards` - Flashcard Daten und Lernfortschritt
- `portugiesisch_progress` - Historische Lern-Einträge

## 🌍 Deployment

```bash
# Build für Produktion
npm run build

# Mit Fly.io deployen
fly deploy
```

## 📝 Version

**v0.1.0** - MVP mit Flashcards, SM-2 Spaced Repetition, und Offline-Support

## 🔄 Geplante Features

- [ ] Quiz-Modus mit Multiple Choice
- [ ] Audio-Aussprache
- [ ] Benutzerdefinierte Wortlisten
- [ ] Cloud-Synchronisierung
- [ ] Lerngruppen

---

**Offline-First**: ✅ Funktioniert ohne Internetverbindung!
