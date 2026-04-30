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
const hintBtn     = document.getElementById('hint-btn');
const helpBtn     = document.getElementById('help-btn');

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
  bindTopActions();
}

function bindTopActions() {
  if (helpBtn) {
    helpBtn.addEventListener('click', openHelpPopup);
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', openHintPopup);
  }
}

function openHelpPopup() {
  const content = [
    'Goal: Fill the 3x3 board with the correct birds for MAGGIATAL.',
    'Tap a bird card, then tap an empty board field to place it.',
    'Double-tap a placed bird to return it to the slider.',
    'Each card costs resources. Returned cards refund those resources.',
    'Mississippiweih is already placed as the starting bird.'
  ];

  const listHTML = content.map(line => `<li>${line}</li>`).join('');
  openPopup('How To Play', `<ul class="popup-list">${listHTML}</ul>`);
}

function openHintPopup() {
  const hint = buildHintText();
  openPopup('Hint', `<p class="popup-text">${hint}</p>`);
}

function buildHintText() {
  const hasSolution = typeof SOLUTION !== 'undefined' && SOLUTION;

  if (state.board.every(Boolean)) {
    return 'The board is already full. If the word is wrong, remove one bird with a double-tap and replace it.';
  }

  if (hasSolution) {
    for (let idx = 0; idx < state.board.length; idx += 1) {
      const expected = SOLUTION[idx];
      const currentBird = state.board[idx];

      if (currentBird) {
        const currentLetter = currentBird.name.charAt(0).toUpperCase();
        if (currentLetter !== expected) {
          return `Field ${idx + 1} should start with "${expected}". Remove ${currentBird.name} and replace it.`;
        }
        continue;
      }

      const matchingBirds = state.availableCards.filter(bird => {
        return bird.name.charAt(0).toUpperCase() === expected;
      });

      if (matchingBirds.length === 0) {
        return `Field ${idx + 1} needs a bird starting with "${expected}". Try freeing one from the board.`;
      }

      const affordableBird = matchingBirds.find(canAffordBird) || matchingBirds[0];
      const status = canAffordBird(affordableBird)
        ? 'You can place it now.'
        : 'You may need to return another bird first to recover resources.';

      return `Next target: Field ${idx + 1} (${expected}). Try ${affordableBird.name}. ${status}`;
    }
  }

  const affordable = state.availableCards.find(canAffordBird);
  if (affordable) {
    return `Try placing ${affordable.name} on an empty field.`;
  }

  return 'No playable card right now. Return one bird from the board to recover resources.';
}

function canAffordBird(bird) {
  return Object.entries(bird.cost).every(([resource, amount]) => {
    return state.resources[resource] >= amount;
  });
}

function openPopup(title, contentHTML) {
  closePopup();

  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  overlay.innerHTML = `
    <div class="popup-dialog" role="dialog" aria-modal="true" aria-label="${title}">
      <button class="popup-close" type="button" aria-label="Close">×</button>
      <h3 class="popup-title">${title}</h3>
      <div class="popup-content">${contentHTML}</div>
      <button class="popup-ok" type="button">OK</button>
    </div>
  `;

  const dialog = overlay.querySelector('.popup-dialog');
  const closeBtn = overlay.querySelector('.popup-close');
  const okBtn = overlay.querySelector('.popup-ok');

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closePopup();
  });

  closeBtn.addEventListener('click', closePopup);
  okBtn.addEventListener('click', closePopup);

  const escHandler = (event) => {
    if (event.key === 'Escape') closePopup();
  };
  overlay.dataset.escHandler = 'true';
  document.addEventListener('keydown', escHandler, { once: true });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  dialog.focus?.();
}

function closePopup() {
  const existing = document.querySelector('.popup-overlay');
  if (!existing) return;
  existing.remove();
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
