// ═══════════════════════════════════════
// game.js — Spiellogik
// ═══════════════════════════════════════

// ── State ──────────────────────────────
const state = {
  resources: { berry: 3, grain: 3, mouse: 3, fish: 3, worm: 3 },
  availableCards: [...BIRDS],   // Karten im Slider
  board: Array(9).fill(null),   // 9 Board-Felder
  selectedCard: null,           // Aktuell ausgewählte Karte
};

// ── DOM Refs ────────────────────────────
const slider      = document.getElementById('card-slider');
const boardEl     = document.getElementById('board');
const boardCells  = document.querySelectorAll('.board-cell');

// Vogel-Farbzuordnung (wird für Karten- und Board-Hintergründe genutzt)
const BIRD_COLOR_MAP = {
  'mississippiweih': 'green',
  'azurfink': 'green',
  'gimpel': 'green',
  'kakapo': 'green',
  'goldammer': 'yellow',
  'inkataeubchen': 'yellow',
  'astralischer-gleitaar': 'yellow',
  'trompetenschwan': 'blue',
  'australspornpieper': 'blue',
  'lincolnammer': 'blue',
  'truthuhn': 'yellow',
  'ringelschnabelmoeve': 'blue',
  'arielfregattvogel': 'blue'
};

// ── Init ────────────────────────────────
function init() {
  // Mississippiweih als Startkarte in Feld 0
  const mississippiweih = BIRDS.find(b => b.id === 'mississippiweih');
  if (mississippiweih) {
    state.board[0] = mississippiweih;
    state.availableCards = state.availableCards.filter(b => b.id !== 'mississippiweih');
    // Kosten abziehen
    for (const [res, cost] of Object.entries(mississippiweih.cost)) {
      state.resources[res] -= cost;
      updateResourceDisplay(res);
    }
  }

  loadImages();    // Icons prüfen
  renderSlider();
  renderBoard();
  bindBoardCells();
}

// ── Ressourcen-Bilder laden (Fallback zu Emoji) ──
function loadImages() {
  document.querySelectorAll('.resource-icon').forEach(img => {
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => { /* bleibt versteckt, Emoji zeigt */ });
    // Neu laden triggern falls src schon gesetzt
    if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
  });
}

// ── Slider rendern ──────────────────────
function renderSlider() {
  slider.innerHTML = '';
  state.availableCards.forEach((bird, i) => {
    const card = createCardEl(bird, i);
    slider.appendChild(card);
  });
}

function renderResourceCost(res, amount) {
  const resource = RESOURCES[res];
  return `
    <span class="cost-item">
      <img class="cost-icon" src="${resource.image}" alt="${resource.label}" />
    </span>
  `;
}

function renderResourceIcon(res) {
  const resource = RESOURCES[res];
  return `
    <span class="board-cost-item">
      <img class="board-cost-icon" src="${resource.image}" alt="${resource.label}" />
    </span>
  `;
}

function createCardEl(bird, sliderIndex) {
  const card = document.createElement('div');
  card.className = 'bird-card';
  card.dataset.id = bird.id;
  card.style.animationDelay = `${sliderIndex * 0.04}s`;

  const color = BIRD_COLOR_MAP[bird.id];
  if (color) card.classList.add(`bird-bg-${color}`);

  const costHTML = Object.entries(bird.cost).map(([res, amount]) => {
    return renderResourceCost(res, amount);
  }).join('');

  // Kosten HTML
  card.innerHTML = `
    <div class="bird-card-media">
      <img class="bird-card-img" src="${bird.image}" alt="${bird.name}" />
    </div>
    <div class="bird-card-info">
      <div class="bird-card-name">${bird.name}</div>
      <div class="bird-card-cost">${costHTML}</div>
    </div>
  `;

  // Bild laden (ersetzt Placeholder wenn vorhanden)
  const img = card.querySelector('.bird-card-img');
  img.addEventListener('load', () => img.classList.add('loaded'));
  img.addEventListener('error', () => img.classList.remove('loaded'));
  if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');

  // Click → Karte auswählen
  card.addEventListener('click', () => selectCard(bird, card));

  return card;
}

// ── Karte auswählen ─────────────────────
function selectCard(bird, cardEl) {
  // Deselect wenn gleiche Karte nochmal geklickt
  if (state.selectedCard?.id === bird.id) {
    state.selectedCard = null;
    cardEl.classList.remove('selected');
    return;
  }

  // Vorherige Auswahl entfernen
  document.querySelectorAll('.bird-card.selected').forEach(c => c.classList.remove('selected'));

  state.selectedCard = bird;
  cardEl.classList.add('selected');
}

// ── Board-Zellen binden ─────────────────
function bindBoardCells() {
  boardCells.forEach(cell => {
    let tapTimer = null;
    let tapCount = 0;

    cell.addEventListener('click', () => {
      const idx = parseInt(cell.dataset.index);

      // Für leere Zellen: Single-click = Karte platzieren
      if (!state.board[idx]) {
        if (!state.selectedCard) return;
        placeCard(state.selectedCard, idx);
        return;
      }

      // Für besetzte Zellen: Double-tap = Karte zurück in Slider
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 350);
      } else if (tapCount === 2) {
        clearTimeout(tapTimer);
        tapCount = 0;
        returnCard(idx);
      }
    });
  });
}

// ── Karte platzieren ─────────────────────
function placeCard(bird, cellIndex) {
  // Ressourcen prüfen
  for (const [res, cost] of Object.entries(bird.cost)) {
    if (state.resources[res] < cost) {
      return;
    }
  }

  // Ressourcen abziehen
  for (const [res, cost] of Object.entries(bird.cost)) {
    state.resources[res] -= cost;
    updateResourceDisplay(res);
  }

  // Board updaten
  state.board[cellIndex] = bird;

  // Karte aus Slider entfernen
  state.availableCards = state.availableCards.filter(b => b.id !== bird.id);
  state.selectedCard = null;

  renderSlider();
  renderBoard();
  checkWin();
}

// ── Karte zurück in Slider ───────────────
function returnCard(cellIndex) {
  const bird = state.board[cellIndex];
  if (!bird) return;

  // Ressourcen zurückgeben
  for (const [res, cost] of Object.entries(bird.cost)) {
    state.resources[res] += cost;
    updateResourceDisplay(res);
  }

  // Board leeren
  state.board[cellIndex] = null;

  // Karte zurück in Slider
  state.availableCards.push(bird);

  renderSlider();
  renderBoard();
}

// ── Board rendern ────────────────────────
function renderBoard() {
  boardCells.forEach(cell => {
    const idx = parseInt(cell.dataset.index);
    const bird = state.board[idx];
    cell.innerHTML = '';
    cell.classList.remove('occupied');

    if (bird) {
      cell.classList.add('occupied');

      const costHTML = Object.entries(bird.cost).map(([res, amount]) => {
        return renderResourceCost(res, amount);
      }).join(' ');

      cell.innerHTML = `
        <div class="board-bird">
          <div class="board-bird-media">
            <img class="board-bird-img" src="${bird.image}" alt="${bird.name}" />
          </div>
          <div class="board-bird-name">${bird.name}</div>
          <div class="board-bird-cost">${costHTML}</div>
        </div>
        <span class="double-tap-hint">↩</span>
      `;

      // Farbe für das Board-Mini-Element zuweisen
      const bb = cell.querySelector('.board-bird');
      const bcolor = BIRD_COLOR_MAP[bird.id];
      if (bb && bcolor) bb.classList.add(`bird-bg-${bcolor}`);

      // Bild laden
      const img = cell.querySelector('.board-bird-img');
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.remove('loaded'));
      if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');

      // Pop animation
      cell.classList.add('pop');
      cell.addEventListener('animationend', () => cell.classList.remove('pop'), { once: true });
    }
  });
}

// ── Ressource-Anzeige updaten ────────────
function updateResourceDisplay(res) {
  const el = document.querySelector(`.resource-count[data-resource="${res}"]`);
  if (!el) return;
  el.textContent = state.resources[res];
  el.classList.toggle('depleted', state.resources[res] === 0);

  // Pulse-Animation
  el.classList.add('pulse');
  el.addEventListener('transitionend', () => el.classList.remove('pulse'), { once: true });
}

// ── Start ────────────────────────────────
init();
