// ═══════════════════════════════════════════════════════
// win.js — MAGGIATAL Gewinn-Erkennung + Animation
//
// EINBINDEN in index.html VOR dem schliessenden </body>:
//   <script src="js/birds.js"></script>
//   <script src="js/game.js"></script>
//   <script src="js/win.js"></script>   ← NEU
// ═══════════════════════════════════════════════════════

// ── Lösung definieren ───────────────────────────────────
// Anfangsbuchstaben der Vögel im Board (Position 0–8)
// ergeben M-A-G-G-I-A-T-A-L = MAGGIATAL
//
// Die bird.id muss mit dem ersten Buchstaben des Namens übereinstimmen.
// Reihenfolge: Zeile 1 (0,1,2) → Zeile 2 (3,4,5) → Zeile 3 (6,7,8)
//
// Korrekte Vogel-IDs pro Position (egal in welcher Reihenfolge gespielt):
const SOLUTION = {
  // position → erwarteter Anfangsbuchstabe (case-insensitive)
  0: 'M',  // Mississippiweih
  1: 'A',  // Azurfink
  2: 'G',  // Gimpel
  3: 'G',  // Goldammer
  4: 'I',  // Inkatäubchen
  5: 'A',  // Astralischer Gleitaar
  6: 'T',  // Trompetenschwan
  7: 'A',  // Australspornpieper
  8: 'L',  // Lincolnammer
};

// Lösungswort (für die Anzeige)
const SOLUTION_WORD = ['M','A','G','G','I','A','T','A','L'];

// ── Gewinn-Check (wird von game.js nach jedem Zug aufgerufen) ──
// Füge am Ende von placeCard() in game.js hinzu:
//   checkWin();
window.checkWin = function checkWin() {
  // Alle 9 Felder müssen besetzt sein
  if (state.board.some(b => b === null)) return;

  // Jeden Vogel prüfen: Anfangsbuchstabe = Lösungsbuchstabe?
  const correct = state.board.every((bird, idx) => {
    if (!bird) return false;
    const firstLetter = bird.name.charAt(0).toUpperCase();
    return firstLetter === SOLUTION[idx];
  });

  if (correct) triggerWin();
};

// ── Win-Animation ────────────────────────────────────────
let winTriggered = false;

function triggerWin() {
  if (winTriggered) return;
  winTriggered = true;

  // Kurze Pause dann Animation starten
  setTimeout(() => {
    flipCardsSequentially();
  }, 400);
}

// ── 1. Karten nacheinander umdrehen & Buchstabe zeigen ──
function flipCardsSequentially() {
  const cells = document.querySelectorAll('.board-cell');

  cells.forEach((cell, idx) => {
    setTimeout(() => {
      flipCell(cell, idx);

      // Nach letzter Karte: Konfetti
      if (idx === cells.length - 1) {
        setTimeout(() => launchConfetti(), 500);
      }
    }, idx * 350); // 350ms Abstand zwischen jeder Karte
  });
}

function flipCell(cell, idx) {
  const letter = SOLUTION_WORD[idx];

  // Flip-Wrapper erstellen
  cell.style.perspective = '600px';
  cell.style.transformStyle = 'preserve-3d';

  const inner = document.createElement('div');
  inner.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  // Vorderseite (Vogel — was schon drin ist)
  const front = document.createElement('div');
  front.style.cssText = `
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: inherit;
  `;
  // Bestehenden Inhalt übernehmen
  front.innerHTML = cell.innerHTML;

  // Rückseite (Buchstabe)
  const back = document.createElement('div');
  back.style.cssText = `
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #1a3a4a 0%, #2a5a6a 100%);
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
  `;

  const letterEl = document.createElement('span');
  letterEl.textContent = letter;
  letterEl.style.cssText = `
    font-family: 'Georgia', serif;
    font-size: min(12vw, 10vh);
    font-weight: 900;
    color: #f5c842;
    text-shadow: 0 2px 12px rgba(245,200,66,0.6);
    letter-spacing: -0.02em;
    line-height: 1;
    animation: letterPop 0.4s 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  `;

  const posLabel = document.createElement('span');
  posLabel.textContent = `${idx + 1}`;
  posLabel.style.cssText = `
    font-size: min(3vw, 2.5vh);
    color: rgba(245,200,66,0.5);
    font-family: 'Georgia', serif;
  `;

  back.appendChild(letterEl);
  back.appendChild(posLabel);
  inner.appendChild(front);
  inner.appendChild(back);

  cell.innerHTML = '';
  cell.appendChild(inner);

  // Flip auslösen
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      inner.style.transform = 'rotateY(180deg)';
    });
  });
}

// ── 2. Konfetti ─────────────────────────────────────────
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Konfetti-Partikel
  const COLORS = ['#f5c842','#5ab8d4','#e05a5a','#6bc96b','#f5a623','#c084fc','#ffffff'];
  const PARTICLE_COUNT = 160;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * canvas.height * 0.5,
      w: 6 + Math.random() * 10,
      h: 3 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      opacity: 1,
    });
  }

  let frame = 0;
  const MAX_FRAMES = 220;

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07; // Schwerkraft
      p.rotation += p.rotSpeed;

      // Fade out in letzten 60 Frames
      if (frame > MAX_FRAMES - 60) {
        p.opacity = Math.max(0, p.opacity - 0.018);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < MAX_FRAMES) {
      requestAnimationFrame(drawConfetti);
    } else {
      canvas.remove();
      showWinBanner();
    }
  }

  requestAnimationFrame(drawConfetti);
}

// ── 3. Gewinn-Banner ────────────────────────────────────
function showWinBanner() {
  const banner = document.createElement('div');
  banner.id = 'win-banner';
  banner.style.cssText = `
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(26, 58, 74, 0.88);
    backdrop-filter: blur(12px);
    z-index: 9998;
    animation: bannerFadeIn 0.5s ease both;
  `;

  banner.innerHTML = `
    <div style="
      text-align: center;
      padding: 8vw;
      animation: bannerSlideUp 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both;
    ">
      <div style="font-size: 10vw; margin-bottom: 2vh;">🎉</div>
      <div style="
        font-family: Georgia, serif;
        font-size: 10vw;
        font-weight: 900;
        color: #f5c842;
        letter-spacing: 0.15em;
        text-shadow: 0 4px 24px rgba(245,200,66,0.5);
        line-height: 1;
        margin-bottom: 2vh;
      ">MAGGIATAL</div>
      <div style="
        font-family: Georgia, serif;
        font-size: 4.5vw;
        color: rgba(255,255,255,0.8);
        margin-bottom: 6vh;
        line-height: 1.5;
      ">Puzzle gelöst! 🐦</div>
      <button onclick="resetGame()" style="
        font-family: Georgia, serif;
        font-size: 4vw;
        font-weight: 700;
        color: #1a3a4a;
        background: #f5c842;
        border: none;
        border-radius: 999px;
        padding: 3vw 8vw;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(245,200,66,0.4);
        transition: transform 0.15s;
      " onactive="this.style.transform='scale(0.95)'">
        Nochmal spielen
      </button>
    </div>
  `;

  document.body.appendChild(banner);
}

// ── Reset ────────────────────────────────────────────────
window.resetGame = function resetGame() {
  winTriggered = false;
  state.resources = { berry: 3, grain: 3, mouse: 3, fish: 3, worm: 3 };
  state.availableCards = [...BIRDS];
  state.board = Array(9).fill(null);
  state.selectedCard = null;

  // UI aufräumen
  document.getElementById('win-banner')?.remove();
  document.getElementById('confetti-canvas')?.remove();

  // Ressourcen-Anzeige resetten
  Object.keys(state.resources).forEach(res => {
    const el = document.querySelector(`.resource-count[data-resource="${res}"]`);
    if (el) { el.textContent = 3; el.classList.remove('depleted'); }
  });

  renderSlider();
  renderBoard();
};

// ── CSS-Keyframes einfügen ───────────────────────────────
const winStyles = document.createElement('style');
winStyles.textContent = `
  @keyframes letterPop {
    from { transform: scale(0) rotate(-10deg); opacity: 0; }
    to   { transform: scale(1) rotate(0deg);   opacity: 1; }
  }
  @keyframes bannerFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bannerSlideUp {
    from { transform: translateY(40px) scale(0.95); opacity: 0; }
    to   { transform: translateY(0) scale(1);       opacity: 1; }
  }
`;
document.head.appendChild(winStyles);

// ── game.js PATCH — checkWin() am Ende von placeCard() aufrufen ──
// Öffne js/game.js und suche diese Zeile am Ende von placeCard():
//
//   showToast(`${bird.name} platziert! ✓`);
//
// Füge DANACH ein:
//
//   checkWin();
//
// Das ist die einzige Änderung in game.js die nötig ist.
