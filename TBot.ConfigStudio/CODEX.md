# TBot Config Studio - Projekt Dokumentation

## Übersicht

**Projektname:** TBot Config Studio  
**Zweck:** Web-basierter Konfigurations-Editor für TBot `instance_settings.json`  
**Tech Stack:** React 18 + TypeScript + Vite + Lucide React

## Ziel

Ein eigenständiges Tool zur Analyse, Bearbeitung, Validierung und Verwaltung der TBot `instance_settings.json`.

### Wichtigste Regeln

1. **JSON-Kompatibilität:** Die originale JSON-Struktur muss vollständig kompatibel mit TBot bleiben
2. **Keine Änderungen an TBot-Core:** Nur eigenständiges Tool, kein Eingriff in bestehenden Code
3. **Unknown Keys erhalten:** Keine automatische Entfernung unbekannter Felder
4. **Reihenfolge bewahren:** JSON-Struktur soll erhalten bleiben

## Features

### Phase 1 (MVP)

- [x] JSON laden und speichern
- [x] Strukturierte Baumansicht
- [x] Horizontale Navigation (Hover-Dropdown)
- [x] Coordinate-Editor mit Planeten-Auswahl
- [x] Inline Active-Toggles bei Sections
- [x] Theme-Wechsel (System/Light/Dark)
- [x] Resizable JSON Preview
- [x] Status-Leiste
- [x] Suche
- [x] Bot-Daten Bereich mit API-Integration

### Phase 2 (geplant)

- [ ] Wiki-Bereich mit TBot-Dokumentation
- [ ] Hilfe-System mit erweiterten Tooltips
- [ ] Validierung und Warnungen
- [ ] Presets/Templates

## TBot API Endpunkte

Der Editor kann folgende Endpunkte von TBot abrufen:

```
/bot/planets       - Alle Planeten
/bot/moons         - Alle Monde
/bot/fleets        - Aktive Flotten
/bot/get-research  - Forschungen
/bot/character-class - Spieler-Klasse
/bot/has-commander - Commander-Offizier
/bot/has-admiral   - Admiral-Offizier
/bot/has-engineer  - Ingenieur-Offizier
/bot/has-geologist - Geologe-Offizier
/bot/has-technocrat - Technokrat-Offizier
/bot/user-infos    - Spieler-Informationen
/bot/server-data   - Server-Details
/bot/server/speed  - Server-Geschwindigkeit
/bot/server/speed-fleet - Flottengeschwindigkeit
```

### Connection

- Host und Port aus `General.Host` / `General.Port`
- BasicAuth aus `Credentials.BasicAuth.Username` / `Credentials.BasicAuth.Password`

## UI/UX Specs

### Layout

- **Header:** 56px Höhe, links Logo+Title, Mitte Tabs, rechts Actions
- **Navigation:** 44px Höhe, horizontal, Hover-Dropdown
- **Content:** Scrollbar, Sections mit Toggle
- **Preview:** Resizable (200-800px), Default 380px
- **Status:** 32px Höhe, fixed unten

### Farben

Light: `#f5f5f7` / Dark: `#000000`  
Accent: `#007aff` / Dark Accent: `#0a84ff`

### Komponenten

1. **Section Header:** Name + Chevron + Inline Active-Toggle
2. **Field Row:** Key + Input + Description
3. **Coordinate Editor:** Galaxy | System | Position | Type + Planet-Select
4. **Toggle Switch:** für Boolean-Werte

## Dateistruktur

```
TBot.ConfigStudio/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── src/
│   ├── main.tsx       # Hauptkomponente
│   └── styles.css    # Alle Styles
└── public/
```

## Entwicklung

```bash
cd TBot.ConfigStudio
npm install
npm run dev    # Dev-Server auf Port 3000
npm run build  # Production Build
```

## Bekannte Besonderheiten

### Lifeform-System

TBot nutzt globale Slot-Indizes (`MaxTechs11`, `MaxTechs12`...), die planetenspezifisch unterschiedliche Technologien repräsentieren können. Das Tool zeigt diese vereinfacht an.

### Coordinate-Varianten

- Einzelobjekt: `{ Galaxy, System, Position, Type }`
- Array: `[ { Galaxy, System, Position, Type }, ... ]`

### Spezielle Felder

Einige Felder wie `UserAgent` haben sehr lange Werte - die JSON-Preview nutzt horizontalen Scroll.

## Ansprechpartner

Bei Fragen zum Projekt: Projektinhaber
