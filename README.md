# 🐦 Birdoku — Projektstruktur

```
birdoku/
├── index.html                  ← Einstiegspunkt
├── README.md                   ← Diese Datei
│
├── css/
│   └── style.css               ← Alle Styles (mobile, vh-basiert)
│
├── js/
│   ├── birds.js                ← Vogeldaten & Ressourcen-Config
│   └── game.js                 ← Spiellogik
│
└── assets/
    ├── icons/                  ← Ressourcen-Icons (Top-Leiste)
    │   ├── berry.png           → 🫐 Beere
    │   ├── grain.png           → 🌽 Korn
    │   ├── mouse.png           → 🐭 Maus
    │   ├── fish.png            → 🐟 Fisch
    │   └── worm.png            → 🪱 Wurm
    │
    └── birds/                  ← Vogelkarten-Bilder
        ├── seagull.png         → Möwe
        ├── owl.png             → Eule
        ├── robin.png           → Rotkehlchen
        ├── duck.png            → Ente
        ├── eagle.png           → Adler
        ├── flamingo.png        → Flamingo
        ├── parrot.png          → Papagei
        ├── penguin.png         → Pinguin
        ├── heron.png           → Reiher
        ├── woodpecker.png      → Specht
        ├── crow.png            → Krähe
        ├── kingfisher.png      → Eisvogel
        ├── sparrow.png         → Spatz
        ├── toucan.png          → Tukan
        └── stork.png           → Storch
```

---

## Bilder hinzufügen

### Ressourcen-Icons (assets/icons/)
- Empfohlene Größe: **64×64px** oder **128×128px**
- Format: PNG mit Transparenz
- Solange kein Bild vorhanden: Emoji als Fallback ✓

### Vogelkarten (assets/birds/)
- Empfohlene Größe: **300×400px** (Hochformat)
- Format: PNG oder JPG
- Solange kein Bild vorhanden: Emoji als Fallback ✓

---

## Spielmechanik

| Aktion | Beschreibung |
|--------|--------------|
| Karte antippen | Karte auswählen (gelber Rahmen) |
| Board-Feld antippen | Ausgewählte Karte platzieren (kostet Ressourcen) |
| Doppel-Tap auf Board | Karte zurück in Slider, Ressourcen zurück |
| Ressourcen | Zählen runter beim Spielen, rauf beim Zurücklegen |

---

## Neue Vögel hinzufügen

In `js/birds.js` das `BIRDS`-Array erweitern:

```js
{
  id: 'myvogel',          // Dateiname ohne .png
  name: 'Mein Vogel',     // Anzeigename
  emoji: '🐦',            // Fallback-Emoji
  image: 'assets/birds/myvogel.png',
  cost: { fish: 1, worm: 1 }  // Ressourcenkosten
}
```

---

## In VS Code öffnen

1. Ordner in VS Code öffnen
2. **Live Server** Extension installieren (ritwickdey.LiveServer)
3. `index.html` → Rechtsklick → „Open with Live Server"
4. Im Browser DevTools → Toggle Device (📱) → iPhone/Mobile

Das Projekt läuft komplett ohne Build-Tools oder npm.
