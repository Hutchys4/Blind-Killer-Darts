const validNumbers = [20, 19, 18, 17, 16, 15, "B"]; // B = bull
let players = [];
let currentPlayerIndex = 0;
let dartsThrown = 0;
const dartsPerTurn = 3;
let instantWinMode = false;
let selectedMultiplier = 1; // 1 = single, 2 = double, 3 = triple
let turnHistory = []; // for undo: [{number, marks, points}]

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
const multiplierButtons = document.getElementById("multiplierButtons");

// Popups
const endGamePopup = document.getElementById("endGamePopup");
const confirmEndGameBtn = document.getElementById("confirmEndGame");
const cancelEndGameBtn = document.getElementById("cancelEndGame");

const nextPlayerPopup = document.getElementById("nextPlayerPopup");
const nextPlayerMessage = document.getElementById("nextPlayerMessage");
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
  dartsThrown = 0;
  turnHistory = [];
  startGame();
});

endGameBtn.addEventListener("click", () => {
  endGamePopup.classList.remove("hidden");
});

confirmEndGameBtn.addEventListener("click", () => {
  endGamePopup.classList.add("hidden");
  resetGame();
  document.getElementById("nameInputs").style.display = "block";
});

cancelEndGameBtn.addEventListener("click", () => {
  endGamePopup.classList.add("hidden");
});

nextPlayerContinueBtn.addEventListener("click", () => {
  nextPlayerPopup.classList.add("hidden");
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  dartsThrown = 0;
  turnHistory = [];
  selectedMultiplier = 1;
  updateMultiplierUI();
  updateControlsState(false);
  updateScoreboard();
  updateTurnDisplay();
});

closeWinnerPopupBtn.addEventListener("click", () => {
  winnerPopup.classList.add("hidden");
  resetGame();
  document.getElementById("nameInputs").style.display = "block";
});

function startGame() {
  scoreboard.classList.remove("hidden");
  controls.classList.remove("hidden");
  currentTurnDisplay.classList.remove("hidden");
  endGameBtn.classList.remove("hidden");

  selectedMultiplier = 1;
  updateScoreboard();
  renderNumberButtons();
  renderMultiplierButtons();
  updateControlsState(false);
  updateTurnDisplay();
}

function getNumberLabel(number) {
  return number === "B" ? "Bull" : number;
}

function getPointValue(number, multiplier) {
  if (number === "B") {
    return multiplier === 1 ? 25 : 50;
  }
  return number * multiplier;
}

function renderNumberButtons() {
  numberButtons.innerHTML = "";
  validNumbers.forEach((number) => {
    const btn = document.createElement("button");
    btn.textContent = getNumberLabel(number);
    btn.addEventListener("click", () => markHit(number));
    numberButtons.appendChild(btn);
  });

  // Miss button
  const missBtn = document.createElement("button");
  missBtn.textContent = "Miss";
  missBtn.className = "miss-btn";
  missBtn.addEventListener("click", () => recordMiss());
  numberButtons.appendChild(missBtn);
}

function renderMultiplierButtons() {
  multiplierButtons.innerHTML = "";

  const multipliers = [
    { label: "Single", value: 1 },
    { label: "Double", value: 2 },
    { label: "Triple", value: 3 },
  ];

  multipliers.forEach(({ label, value }) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.multiplier = value;
    btn.addEventListener("click", () => {
      selectedMultiplier = value;
      updateMultiplierUI();
    });
    multiplierButtons.appendChild(btn);
  });

  // Undo button
  const undoBtn = document.createElement("button");
  undoBtn.textContent = "Undo";
  undoBtn.id = "undoBtn";
  undoBtn.className = "undo-btn";
  undoBtn.addEventListener("click", () => undoLastDart());
  multiplierButtons.appendChild(undoBtn);

  updateMultiplierUI();
}

function updateMultiplierUI() {
  const btns = multiplierButtons.querySelectorAll("button[data-multiplier]");
  btns.forEach((btn) => {
    btn.classList.toggle(
      "multiplier-active",
      parseInt(btn.dataset.multiplier) === selectedMultiplier
    );
  });
}

function recordMiss() {
  if (dartsThrown >= dartsPerTurn) return;

  turnHistory.push({ number: null, marks: 0, points: 0 });
  dartsThrown++;
  updateTurnDisplay();
  updateScoreboard();

  if (dartsThrown >= dartsPerTurn) {
    updateControlsState(true);
    showNextPlayerPopup();
  }
}

function markHit(number) {
  if (dartsThrown >= dartsPerTurn) return;

  const player = players[currentPlayerIndex];
  const currentHits = player.hits[number];
  let multiplier = selectedMultiplier;

  // Bull can only be single (outer=25) or double (inner=50), no triple
  if (number === "B" && multiplier === 3) {
    multiplier = 2;
    selectedMultiplier = 2;
    updateMultiplierUI();
  }

  let marksAdded = 0;
  let pointsAdded = 0;

  if (currentHits < 3) {
    const marksNeeded = 3 - currentHits;
    const marksToClose = Math.min(multiplier, marksNeeded);
    const overflowMarks = multiplier - marksToClose;

    player.hits[number] = currentHits + marksToClose;
    marksAdded = marksToClose;

    // Overflow marks score points if not closed by everyone
    if (overflowMarks > 0) {
      const closedByAll = players.every(
        (p, i) => i === currentPlayerIndex || p.hits[number] >= 3
      );
      if (!closedByAll) {
        const pointValue =
          number === "B" ? 25 : number;
        pointsAdded = overflowMarks * pointValue;
        player.score += pointsAdded;
      }
    }
  } else {
    // Already closed by this player - score points if others haven't closed
    const closedByAll = players.every(
      (p, i) => i === currentPlayerIndex || p.hits[number] >= 3
    );
    if (!closedByAll) {
      const pointValue =
        number === "B" ? 25 : number;
      pointsAdded = multiplier * pointValue;
      player.score += pointsAdded;
    }
  }

  turnHistory.push({ number, marks: marksAdded, points: pointsAdded, multiplier });
  dartsThrown++;
  updateScoreboard();
  updateTurnDisplay();

  if (checkForWinner()) {
    updateControlsState(true);
    return;
  }

  if (dartsThrown >= dartsPerTurn) {
    updateControlsState(true);
    showNextPlayerPopup();
  }
}

function undoLastDart() {
  if (turnHistory.length === 0) return;

  const last = turnHistory.pop();
  dartsThrown--;

  if (last.number !== null) {
    const player = players[currentPlayerIndex];
    player.score -= last.points;
    player.hits[last.number] -= last.marks;
  }

  updateScoreboard();
  updateTurnDisplay();
  updateControlsState(false);

  // Hide next player popup if it was showing
  nextPlayerPopup.classList.add("hidden");
}

function showNextPlayerPopup() {
  const nextIndex = (currentPlayerIndex + 1) % players.length;
  nextPlayerMessage.textContent = `Pass to ${players[nextIndex].name}`;
  nextPlayerPopup.classList.remove("hidden");
}

function updateTurnDisplay() {
  const player = players[currentPlayerIndex];
  const remaining = dartsPerTurn - dartsThrown;
  currentTurnDisplay.innerHTML = `<strong>${player.name}</strong> — ${remaining} dart${remaining !== 1 ? "s" : ""} remaining`;
}

function getHitDisplay(hits) {
  if (hits === 0) return "";
  if (hits === 1) return "/";
  if (hits === 2) return "X";
  return "Ø";
}

function updateScoreboard() {
  scoreboard.innerHTML = "";

  // Number labels column
  const labelsCol = document.createElement("div");
  labelsCol.className = "score-labels";

  const labelHeader = document.createElement("div");
  labelHeader.className = "label-header";
  labelHeader.textContent = "";
  labelsCol.appendChild(labelHeader);

  const labelsGrid = document.createElement("div");
  labelsGrid.className = "label-markers";
  validNumbers.forEach((number) => {
    const cell = document.createElement("div");
    cell.className = "label-cell";
    cell.textContent = getNumberLabel(number);
    labelsGrid.appendChild(cell);
  });
  labelsCol.appendChild(labelsGrid);

  const labelFooter = document.createElement("div");
  labelFooter.className = "label-header";
  labelFooter.textContent = "";
  labelsCol.appendChild(labelFooter);
  scoreboard.appendChild(labelsCol);

  players.forEach((player, index) => {
    const col = document.createElement("div");
    col.className = "score-column";

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
      cell.textContent = getHitDisplay(hits);
      if (hits >= 3) {
        cell.classList.add("closed");
      }
      hitsGrid.appendChild(cell);
    });

    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "score-display";
    scoreDisplay.innerHTML = `<strong>${player.score}</strong>`;

    col.appendChild(hitsGrid);
    col.appendChild(scoreDisplay);
    scoreboard.appendChild(col);
  });
}

function updateControlsState(disableHits) {
  Array.from(numberButtons.children).forEach((btn) => {
    btn.disabled = disableHits;
  });
  const btns = multiplierButtons.querySelectorAll("button[data-multiplier]");
  btns.forEach((btn) => {
    btn.disabled = disableHits;
  });
}

function resetGame() {
  players = [];
  currentPlayerIndex = 0;
  dartsThrown = 0;
  turnHistory = [];
  selectedMultiplier = 1;

  scoreboard.classList.add("hidden");
  controls.classList.add("hidden");
  currentTurnDisplay.classList.add("hidden");
  endGamePopup.classList.add("hidden");
  nextPlayerPopup.classList.add("hidden");
  winnerPopup.classList.add("hidden");
  endGameBtn.classList.add("hidden");

  numberButtons.innerHTML = "";
  multiplierButtons.innerHTML = "";
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
  winnerNameDisplay.textContent = `${name} wins the game!`;
  winnerPopup.classList.remove("hidden");
}

function goHome() {
  window.location.href = "../index.html";
}
