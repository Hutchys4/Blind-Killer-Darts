const validNumbers = [20, 19, 18, 17, 16, 15, 25]; // 25 = bull
let players = [];
let currentPlayerIndex = 0;
let hitCountThisTurn = 0;
const maxHitsPerTurn = 3;

const playerCountSlider = document.getElementById("playerCount");
const playerCountDisplay = document.getElementById("playerCountDisplay");
const playerCountLabel = document.getElementById("playerCountLabel");
const startGameBtn = document.getElementById("startGame");
const endGameBtn = document.getElementById("endGame");

const scoreboard = document.getElementById("scoreboard");
const controls = document.getElementById("controls");
const numberButtons = document.getElementById("numberButtons");
const currentTurnDisplay = document.getElementById("currentTurn");

// Popups
const endGamePopup = document.getElementById("endGamePopup");
const confirmEndGameBtn = document.getElementById("confirmEndGame");
const cancelEndGameBtn = document.getElementById("cancelEndGame");

const nextPlayerPopup = document.getElementById("nextPlayerPopup");
const nextPlayerContinueBtn = document.getElementById("nextPlayerContinue");

const winnerPopup = document.getElementById("winnerPopup");
const winnerNameDisplay = document.getElementById("winnerName");
const closeWinnerPopupBtn = document.getElementById("closeWinnerPopup");

playerCountSlider.addEventListener("input", () => {
  playerCountDisplay.textContent = playerCountSlider.value;
});

startGameBtn.addEventListener("click", () => {

  startGameBtn.style.display = 'none';
  playerCountSlider.style.display = 'none';
  playerCountDisplay.style.display = 'none';
  playerCountLabel.style.display = 'none';

  const count = parseInt(playerCountSlider.value);
  players = Array.from({ length: count }, (_, i) => ({
    name: `Player ${i + 1}`,
    hits: Object.fromEntries(validNumbers.map(n => [n, 0])),
    score: 0
  }));
  currentPlayerIndex = 0;
  hitCountThisTurn = 0;
  startGame();
});

endGameBtn.addEventListener("click", () => {
  endGamePopup.classList.remove("hidden");
});

confirmEndGameBtn.addEventListener("click", () => {
  endGamePopup.classList.add("hidden");
  resetGame();
});

cancelEndGameBtn.addEventListener("click", () => {
  endGamePopup.classList.add("hidden");
});

nextPlayerContinueBtn.addEventListener("click", () => {
  nextPlayerPopup.classList.add("hidden");
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  hitCountThisTurn = 0;
  updateTurnDisplay();
  updateControlsState(false);
});

closeWinnerPopupBtn.addEventListener("click", () => {
  winnerPopup.classList.add("hidden");
  resetGame();
});

function startGame() {
  scoreboard.classList.remove("hidden");
  controls.classList.remove("hidden");
  currentTurnDisplay.classList.remove("hidden");
  updateScoreboard();
  updateTurnDisplay();
  renderNumberButtons();
  updateControlsState(false);
}

function updateTurnDisplay() {
  currentTurnDisplay.textContent = `Current Turn: ${players[currentPlayerIndex].name}`;
}

function renderNumberButtons() {
  numberButtons.innerHTML = "";
  validNumbers.forEach(number => {
    const btn = document.createElement("button");
    btn.textContent = number === 25 ? "Bull" : number;
    btn.addEventListener("click", () => markHit(number));
    numberButtons.appendChild(btn);
  });
}

function markHit(number) {
  if (hitCountThisTurn >= maxHitsPerTurn) return; // Safety check

  const player = players[currentPlayerIndex];
  const hits = player.hits[number];

  if (hits < 3) {
    player.hits[number]++;
  } else {
    // Scoring phase
    const closedByOthers = players.every(p => p.hits[number] >= 3);
    if (!closedByOthers) {
      player.score += number;
    }
  }

  hitCountThisTurn++;
  updateScoreboard();

  // Check for winner
  if (checkForWinner()) {
    updateControlsState(true);
    return;
  }

  // Check if turn hit limit reached
  if (hitCountThisTurn >= maxHitsPerTurn) {
    updateControlsState(true);
    nextPlayerPopup.classList.remove("hidden");
  }
}

function updateScoreboard() {
  scoreboard.innerHTML = "";

  players.forEach(player => {
    const col = document.createElement("div");
    col.className = "score-column";

    const name = document.createElement("h3");
    name.textContent = player.name;
    col.appendChild(name);

    const hitsGrid = document.createElement("div");
    hitsGrid.className = "hit-markers";

    validNumbers.forEach(number => {
      const cell = document.createElement("div");
      cell.className = "hit-cell";
      const hits = player.hits[number];
      cell.textContent = hits === 3 ? "X" : hits > 3 ? "X+" : hits;
      if (hits >= 3) {
        cell.classList.add("closed");
      }
      hitsGrid.appendChild(cell);
    });

    const scoreDisplay = document.createElement("div");
    scoreDisplay.style.marginTop = "1rem";
    scoreDisplay.innerHTML = `<strong>Score: ${player.score}</strong>`;

    col.appendChild(hitsGrid);
    col.appendChild(scoreDisplay);
    scoreboard.appendChild(col);
  });
}

// Disable or enable number buttons for hits, but keep "End Turn" always enabled
function updateControlsState(disableHits) {
  Array.from(numberButtons.children).forEach(btn => {
    btn.disabled = disableHits;
  });
}

function resetGame() {
  players = [];
  currentPlayerIndex = 0;
  hitCountThisTurn = 0;
  scoreboard.classList.add("hidden");
  controls.classList.add("hidden");
  currentTurnDisplay.classList.add("hidden");
  endGamePopup.classList.add("hidden");
  nextPlayerPopup.classList.add("hidden");
  winnerPopup.classList.add("hidden");
  numberButtons.innerHTML = "";
  currentTurnDisplay.textContent = "";
}

// Returns true if current player has won
function checkForWinner() {
  const player = players[currentPlayerIndex];

  // All numbers closed?
  const allClosed = validNumbers.every(n => player.hits[n] >= 3);
  if (!allClosed) return false;

  // Highest score?
  const maxScore = Math.max(...players.map(p => p.score));
  if (player.score < maxScore) return false;

  // Show winner popup
  showWinnerPopup(player.name);
  return true;
}

function showWinnerPopup(name) {
  winnerNameDisplay.textContent = `${name} wins the game! 🎉`;
  winnerPopup.classList.remove("hidden");

  // Hide other UI
  controls.classList.add("hidden");
  scoreboard.classList.add("hidden");
  currentTurnDisplay.classList.add("hidden");
}
