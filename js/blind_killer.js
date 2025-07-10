const numberToLabel = {
  1: "ace",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten"
};

function getDeck(max) {
  const deck = [];
  for (let i = 1; i <= max; i++) {
    const label = numberToLabel[i];
    deck.push({
      n: i,
      name: label.charAt(0).toUpperCase() + label.slice(1) + " of Spades",
      img: `../assets/cards/spade/spade_${label}.png`,
      lives: 3
    });
  }
  return deck;
}

let remaining = [], used = [], drawCount = 0;
let sliderLocked = false;
let cardListContainer;
let maxSelected = 10;
let playerCount = 1;
let playerDraws = 0;

function updateRange(value) {
  if (value < 5) value = 5;
  const endCard = numberToLabel[value];
  maxSelected = parseInt(value);
  document.getElementById("rangeLabel").innerHTML =
    `Showing cards from <strong>Ace (1)</strong> to <strong>${endCard.charAt(0).toUpperCase() + endCard.slice(1)}</strong> of Spades`;
}

function updatePlayers(value) {
  playerCount = parseInt(value);
  document.getElementById("playerLabel").innerHTML = `Number of players: <strong>${playerCount}</strong>`;
}

function resetDeck() {
  const max = parseInt(document.getElementById("rangeSelect").value);
  maxSelected = Math.max(5, max);
  remaining = getDeck(maxSelected);
  used = [];
  drawCount = 0;
  playerDraws = 0;
  updateDrawCount();
  updateRange(maxSelected);
  updatePlayers(document.getElementById("playerSelect").value);
  document.getElementById("cardDisplay").innerHTML = '';

  document.querySelector("button[onclick='showRandomCard()']").style.display = "inline-block";

  const existingList = document.getElementById("cardList");
  if (existingList) {
    existingList.remove();
  }

  document.getElementById("winnerOverlay").classList.add("hidden");
  document.getElementById("allDrawnOverlay").classList.add("hidden");
}

function showRandomCard() {
  if (!sliderLocked) {
    document.getElementById("rangeControls").style.display = "none";
    document.getElementById("playerControls").style.display = "none";
    document.getElementById("resetBtn").style.display = "inline-block";
    sliderLocked = true;
  }

  if (remaining.length === 0 || playerDraws >= maxSelected) {
    document.querySelector("button[onclick='showRandomCard()']").style.display = "none";
    document.getElementById("allDrawnOverlay").classList.remove("hidden");
    return;
  }

  const idx = Math.floor(Math.random() * remaining.length);
  const card = remaining.splice(idx, 1)[0];
  used.push(card);
  drawCount++;
  playerDraws++;
  updateDrawCount();

  document.getElementById('cardDisplay').innerHTML = `
    <div class="number">${card.n === 1 ? "A" : card.n}</div>
    <img class="card-img" src="${card.img}" alt="${card.name}">
    <div>${card.name}</div>
  `;

  clearTimeout(window.hideTimeout);
  window.hideTimeout = setTimeout(() => {
    document.getElementById("cardDisplay").innerHTML = '';
  }, 3000);

  if (playerDraws === playerCount) {
    // Fill in dummy cards if needed
    while (playerDraws < maxSelected && remaining.length > 0) {
      const dummyIdx = Math.floor(Math.random() * remaining.length);
      const dummyCard = remaining.splice(dummyIdx, 1)[0];
      used.push(dummyCard);
      playerDraws++;
    }
  }

  // Final check if all cards are now drawn
  if (playerDraws >= maxSelected || remaining.length === 0) {
    document.querySelector("button[onclick='showRandomCard()']").style.display = "none";
    document.getElementById("allDrawnOverlay").classList.remove("hidden");
  }
}

function updateDrawCount() {
  document.getElementById("drawCount").textContent = "Draws: " + drawCount;
}

function enableSlider() {
  sliderLocked = false;
  document.getElementById("rangeControls").style.display = "block";
  document.getElementById("playerControls").style.display = "block";
  document.getElementById("resetBtn").style.display = "none";
  resetDeck();
}

function getHeartIcons(lives) {
  return "❤️".repeat(lives);
}

function checkForWinner() {
  const aliveCards = used.filter(card => card.lives > 0);
  if (aliveCards.length === 1) {
    showWinner(aliveCards[0]);
  }
}

function showWinner(card) {
  const overlay = document.getElementById("winnerOverlay");
  const msg = document.getElementById("winnerMessage");
  const cardLabel = card.n === 1 ? "Ace" : card.n;
  msg.textContent = `${cardLabel} of Spades is the winner! Would you like to play again?`;
  overlay.classList.remove("hidden");
}

function showCardList() {
  const sortedCards = [...used].sort((a, b) => a.n - b.n);

  cardListContainer = document.createElement("div");
  cardListContainer.id = "cardList";
  cardListContainer.className = "card-list";
  document.body.appendChild(cardListContainer);

  sortedCards.forEach((card, index) => {
    const cardElement = document.createElement("div");
    cardElement.className = "card-with-lives";
    cardElement.dataset.index = index;

    const img = document.createElement("img");
    img.src = card.img;
    img.alt = card.name;
    img.className = "card-img";

    const skullOverlay = document.createElement("div");
    skullOverlay.className = "skull-overlay";
    skullOverlay.style.display = "none";
    skullOverlay.textContent = "💀";

    const livesText = document.createElement("div");
    livesText.className = "lives";
    livesText.textContent = getHeartIcons(card.lives);

    cardElement.appendChild(img);
    cardElement.appendChild(skullOverlay);
    cardElement.appendChild(livesText);
    cardListContainer.appendChild(cardElement);

    cardElement.addEventListener("click", () => {
      if (card.lives > 0) {
        card.lives--;
        livesText.style.opacity = 0;
        setTimeout(() => {
          livesText.textContent = getHeartIcons(card.lives);
          livesText.style.opacity = 1;
          if (card.lives === 0) {
            img.classList.add("grayed-out");
            skullOverlay.style.display = "flex";
            checkForWinner();
          }
        }, 200);
      }
    });
  });
}

document.getElementById("playAgainBtn").addEventListener("click", () => {
  document.getElementById("winnerOverlay").classList.add("hidden");
  enableSlider();
});

document.getElementById("viewResultsBtn").addEventListener("click", () => {
  document.getElementById("allDrawnOverlay").classList.add("hidden");
  showCardList();
});

function goHome() {
  window.location.href = "index.html";
}


resetDeck();
