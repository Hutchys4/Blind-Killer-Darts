// Map number to card label and filename suffix
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

// Build deck for spade cards with local image paths
function getDeck(max) {
  const deck = [];
  for (let i = 1; i <= max; i++) {
    const label = numberToLabel[i];
    deck.push({
      n: i,
      name: label.charAt(0).toUpperCase() + label.slice(1) + " of Spades",
      img: `assets/cards/spade/spade_${label}.png`
    });
  }
  return deck;
}

let remaining = [], used = [], drawCount = 0;
let sliderLocked = false;
const selectedCards = [];

function updateRange(value) {
  const endCard = numberToLabel[value];
  document.getElementById("rangeLabel").innerHTML = 
    `Showing cards from <strong>Ace (1)</strong> to <strong>${endCard.charAt(0).toUpperCase() + endCard.slice(1)}</strong> of Spades`;
}

function resetDeck() {
  const max = parseInt(document.getElementById("rangeSelect").value);
  remaining = getDeck(max);
  used = [];
  drawCount = 0;
  updateDrawCount();
  updateRange(max);
  document.getElementById("cardDisplay").innerHTML = '';
  selectedCards.length = 0;
  renderSelectedCards();
}

function showRandomCard() {
  if (!sliderLocked) {
    document.getElementById("rangeControls").style.display = "none";
    document.getElementById("resetBtn").style.display = "inline-block";
    sliderLocked = true;
  }

  if (remaining.length === 0) {
    alert("All cards drawn. Resetting deck.");
    resetDeck();
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

  addCardToList(card);

  clearTimeout(window.hideTimeout);
  window.hideTimeout = setTimeout(() => {
    document.getElementById("cardDisplay").innerHTML = '';
  }, 5000);
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

// Add selected card with 3 lives
function addCardToList(card) {
  const cardData = { ...card, lives: 3 };
  selectedCards.push(cardData);
  renderSelectedCards();
}

// Render selected cards list
function renderSelectedCards() {
  const container = document.getElementById("selectedCards");
  container.innerHTML = "";

  selectedCards.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card-with-lives";

    const cardImg = document.createElement("img");
    cardImg.src = card.img;
    cardImg.alt = card.name;
    cardImg.className = "card-img";
    if (card.lives === 0) {
      cardImg.classList.add("grayed-out");
    }

    const livesText = document.createElement("div");
    livesText.className = "lives";
    livesText.textContent = `Lives: ${card.lives}`;

    cardDiv.appendChild(cardImg);
    cardDiv.appendChild(livesText);
    cardDiv.appendChild(document.createTextNode(card.name));

    cardDiv.addEventListener("click", () => {
      if (card.lives > 0) {
        card.lives--;
        renderSelectedCards();
      }
    });

    container.appendChild(cardDiv);
  });
}

// Initialize on load
resetDeck();
