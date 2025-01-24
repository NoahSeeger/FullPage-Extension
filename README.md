# Full Page Screenshot Extension

Eine Chrome-Extension zum Erstellen von vollständigen Screenshots ganzer Webseiten. Die Extension scrollt automatisch durch die Seite und erstellt einen nahtlosen Screenshot der gesamten Webseite.

## Features

- 📸 Vollständige Seitenaufnahme
- 🎯 Präzise Erfassung aller Elemente
- 🔄 Intelligente Behandlung von fixed/sticky Elementen
- ⚡ Verschiedene Geschwindigkeitsoptionen
- 💾 Download als PNG
- 📋 Kopieren in die Zwischenablage
- 🎨 Saubere Vorschau im Viewer

## Installation

1. Repository klonen oder herunterladen
2. Chrome öffnen und zu `chrome://extensions` navigieren
3. Developer Mode aktivieren (oben rechts)
4. "Load unpacked" klicken und den Projektordner auswählen

## Verwendung

1. Auf das Extension-Icon klicken
2. Geschwindigkeit auswählen:
   - Schnell (Standard)
   - Normal
   - Langsam (für komplexe Animationen)
3. "Screenshot erstellen" klicken
4. Warten bis der Screenshot erstellt ist
5. Im Viewer den Screenshot herunterladen oder in die Zwischenablage kopieren

## Technische Details

Die Extension verwendet einen mehrstufigen Prozess für präzise Screenshots:

1. **Höhenberechnung**: Ermittelt die exakte Höhe der Webseite
2. **Scroll-Steuerung**: Scrollt in berechneten Schritten durch die Seite
3. **Überlappung**: Verwendet eine 20px Überlappung für nahtlose Übergänge
4. **Element-Handling**:
   - Fixed/Sticky Elemente werden nur einmal erfasst
   - Action-Buttons werden am Ende eingefügt
5. **Qualitätssicherung**: Präzise Positionierung und Zusammenfügung der Screenshots

## Projektstruktur

├── manifest.json # Extension-Konfiguration
├── background.js # Hauptlogik für Screenshots
├── popup.html # UI für Geschwindigkeitsauswahl
├── popup.js # Popup-Steuerung
├── viewer.html # Screenshot-Anzeige
├── viewer.js # Viewer-Funktionalität
└── icons/ # Extension-Icons

## Bekannte Einschränkungen

- Funktioniert nicht auf Chrome-System-Seiten (chrome://)
- Sehr lange Seiten können mehr Zeit benötigen
- Einige dynamische Elemente könnten mehrfach erscheinen

## Entwicklung

### Voraussetzungen

- Chrome Browser
- Grundlegendes Verständnis von Chrome Extensions
- JavaScript-Kenntnisse

### Setup für Entwickler

1. Repository klonen
2. Extension in Chrome laden
3. Änderungen vornehmen
4. Extension in Chrome neu laden zum Testen

## Lizenz

MIT License - siehe LICENSE Datei

## Beitragen

Beiträge sind willkommen! Bitte einen Pull Request erstellen für:

- Bug Fixes
- Neue Features
- Dokumentationsverbesserungen

## Support

Bei Problemen oder Fragen bitte ein Issue erstellen.
