const validNumbers = [20, 19, 18, 17, 16, 15, 50]; // 50 = bull
let players = [];
let currentPlayerIndex = 0;
let hitCountThisTurn = 0;
const maxHitsPerTurn = 3;
let instantWinMode = false;

// DOM Elements
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

// Win rule toggle
const winRuleToggle = document.getElementById("winRuleToggle");

// Event Listeners
playerCountSlider.addEventListener("input", () => {
  playerCountDisplay.textContent = playerCountSlider.value;
  renderNameInputs(playerCountSlider.value);
});

function renderNameInputs(count) {
  const nameInputsContainer = document.getElementById("nameInputs");
  nameInputsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = `nameInput${i}`;
    input.placeholder = `Player ${i + 1} name`;
    input.style.margin = "0.5rem";
    input.style.padding = "0.5rem";
    input.style.borderRadius = "6px";
    input.style.border = "1px solid #ccc";
    input.maxLength = 25;
    nameInputsContainer.appendChild(input);
  }
}

renderNameInputs(playerCountSlider.value);

winRuleToggle.addEventListener("change", () => {
  instantWinMode = winRuleToggle.checked;
});

startGameBtn.addEventListener("click", () => {
  startGameBtn.style.display = "none";
  playerCountSlider.style.display = "none";
  playerCountDisplay.style.display = "none";
  playerCountLabel.style.display = "none";
  winRuleToggle.parentElement.style.display = "none";

  // hide name inputs on game start
  const nameIn = document.getElementById("nameInputs");
  nameIn.style.display = "none";

  const count = parseInt(playerCountSlider.value);
  players = [];

  for (let i = 0; i < count; i++) {
    const nameInput = document.getElementById(`nameInput${i}`);
    const name = nameInput?.value?.trim() || `Player ${i + 1}`;
    players.push({
      name: name,
      hits: Object.fromEntries(validNumbers.map((n) => [n, 0])),
      score: 0,
    });
  }

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
  const nameIn = document.getElementById("nameInputs");
  nameIn.style.display = "block";
});

cancelEndGameBtn.addEventListener("click", () => {
  endGamePopup.classList.add("hidden");
});

nextPlayerContinueBtn.addEventListener("click", () => {
  nextPlayerPopup.classList.add("hidden");
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  hitCountThisTurn = 0;
  updateControlsState(false);
  updateScoreboard();
});

closeWinnerPopupBtn.addEventListener("click", () => {
  winnerPopup.classList.add("hidden");
  resetGame();
  const nameIn = document.getElementById("nameInputs");
  nameIn.style.display = "block";
});

function startGame() {
  scoreboard.classList.remove("hidden");
  controls.classList.remove("hidden");
  currentTurnDisplay.classList.remove("hidden");
  endGameBtn.classList.remove("hidden");

  updateScoreboard();
  renderNumberButtons();
  updateControlsState(false);
}

function renderNumberButtons() {
  numberButtons.innerHTML = "";
  validNumbers.forEach((number) => {
    const btn = document.createElement("button");
    btn.textContent = number === 25 ? "Bull" : number;
    btn.addEventListener("click", () => markHit(number));
    numberButtons.appendChild(btn);
  });
}

function markHit(number) {
  if (hitCountThisTurn >= maxHitsPerTurn) return;

  const player = players[currentPlayerIndex];
  const hits = player.hits[number];

  if (hits < 3) {
    player.hits[number]++;
  } else {
    const closedByOthers = players.every((p) => p.hits[number] >= 3);
    if (!closedByOthers) {
      player.score += number;
    }
  }

  hitCountThisTurn++;
  updateScoreboard();

  if (checkForWinner()) {
    updateControlsState(true);
    return;
  }

  if (hitCountThisTurn >= maxHitsPerTurn) {
    updateControlsState(true);
    nextPlayerPopup.classList.remove("hidden");
  }
}

function updateScoreboard() {
  scoreboard.innerHTML = "";

  players.forEach((player, index) => {
    const col = document.createElement("div");
    col.className = "score-column";

    // Add highlight class if this is the current player
    if (index === currentPlayerIndex) {
      col.classList.add("current-player");
    }

    const name = document.createElement("h3");
    name.textContent = player.name;
    col.appendChild(name);

    const hitsGrid = document.createElement("div");
    hitsGrid.className = "hit-markers";

    validNumbers.forEach((number) => {
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

function updateControlsState(disableHits) {
  Array.from(numberButtons.children).forEach((btn) => {
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
  endGameBtn.classList.add("hidden");

  numberButtons.innerHTML = "";
  currentTurnDisplay.textContent = "";

  startGameBtn.style.display = "inline-block";
  playerCountSlider.style.display = "inline-block";
  playerCountDisplay.style.display = "inline-block";
  playerCountLabel.style.display = "inline-block";
  winRuleToggle.parentElement.style.display = "block";

  winRuleToggle.checked = false;
  instantWinMode = false;
}

function checkForWinner() {
  const player = players[currentPlayerIndex];
  const allClosed = validNumbers.every((n) => player.hits[n] >= 3);

  if (!allClosed) return false;

  if (instantWinMode) {
    showWinnerPopup(player.name);
    return true;
  } else {
    const maxScore = Math.max(...players.map((p) => p.score));
    if (player.score < maxScore) return false;
    showWinnerPopup(player.name);
    return true;
  }
}

function showWinnerPopup(name) {
  winnerNameDisplay.textContent = `${name} wins the game! 🎉`;

  winnerPopup.classList.remove("hidden");
}

function goHome() {
  window.location.href = "../index.html";
}