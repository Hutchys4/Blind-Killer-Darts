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
      img: `assets/cards/spade/spade_${label}.png`,
      lives: 3
    });
  }
  return deck;
}

let remaining = [], used = [], drawCount = 0;
let sliderLocked = false;
let cardListContainer;
let maxSelected = 10;

function updateRange(value) {
  const endCard = numberToLabel[value];
  maxSelected = parseInt(value);
  document.getElementById("rangeLabel").innerHTML = 
    `Showing cards from <strong>Ace (1)</strong> to <strong>${endCard.charAt(0).toUpperCase() + endCard.slice(1)}</strong> of Spades`;
}

function resetDeck() {
  const max = parseInt(document.getElementById("rangeSelect").value);
  maxSelected = max;
  remaining = getDeck(max);
  used = [];
  drawCount = 0;
  updateDrawCount();
  updateRange(max);
  document.getElementById("cardDisplay").innerHTML = '';

  const existingList = document.getElementById("cardList");
  if (existingList) {
    existingList.remove();
  }

  document.getElementById("revealListBtn").style.display = "none";
}

function showRandomCard() {
  if (!sliderLocked) {
    document.getElementById("rangeControls").style.display = "none";
    document.getElementById("resetBtn").style.display = "inline-block";
    sliderLocked = true;
  }

  if (remaining.length === 0) {
    alert("All cards drawn.");
    return;
  }

  const idx = Math.floor(Math.random() * remaining.length);
  const card = remaining.splice(idx, 1)[0];
  used.push(card);
  drawCount++;
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

  if (remaining.length === 0) {
    setTimeout(() => {
      document.getElementById("cardDisplay").innerHTML = '';
      document.getElementById("revealListBtn").style.display = "inline-block";
    }, 3100);
  }
}

function updateDrawCount() {
  document.getElementById("drawCount").textContent = "Draws: " + drawCount;
}

function enableSlider() {
  sliderLocked = false;
  document.getElementById("rangeControls").style.display = "block";
  document.getElementById("resetBtn").style.display = "none";
  resetDeck();
}

function showCardList() {
  // Sort used cards by their numeric value (A=1, 2, 3...10)
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

    const livesText = document.createElement("div");
    livesText.className = "lives";
    livesText.textContent = "Lives: " + card.lives;

    cardElement.appendChild(img);
    cardElement.appendChild(livesText);
    cardListContainer.appendChild(cardElement);

    cardElement.addEventListener("click", () => {
      if (card.lives > 0) {
        card.lives--;
        livesText.textContent = "Lives: " + card.lives;

        if (card.lives === 0) {
          img.classList.add("grayed-out");
        }
      }
    });
  });

  document.getElementById("revealListBtn").style.display = "none";
}

// Initialize on load
resetDeck();
