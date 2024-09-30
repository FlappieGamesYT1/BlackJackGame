const playerCardsContainer = document.getElementById('player-cards');
const dealerCardsContainer = document.getElementById('dealer-cards');
const playerScoreElement = document.getElementById('player-score');
const dealerScoreElement = document.getElementById('dealer-score');
const gameMessage = document.getElementById('game-message');
const coinsElement = document.getElementById('coins');
const timerElement = document.getElementById('timer');
const betInput = document.getElementById('bet-input');

const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const resetButton = document.getElementById('reset-button');

let playerScore = 0;
let dealerScore = 0;
let playerCards = [];
let dealerCards = [];
let deck = [];
let coins = 100;
let betAmount = 10;
let timer;
let timeLeft = 60; // 60 seconds
let timerActive = false; // Track if the timer is active

function loadCoins() {
    const savedCoins = localStorage.getItem('coins');
    coins = savedCoins ? parseInt(savedCoins) : 100;
}

function saveCoins() {
    localStorage.setItem('coins', coins);
}

function initializeDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];

    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ value, suit });
        });
    });

    deck = deck.sort(() => 0.5 - Math.random());
}

function cardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}

function addCardToPlayer() {
    const card = deck.pop();
    playerCards.push(card);
    playerScore += cardValue(card);
    renderCard(card, playerCardsContainer);
    updateScores();
    checkPlayerBust();
}

function addCardToDealer() {
    const card = deck.pop();
    dealerCards.push(card);
    dealerScore += cardValue(card);
    renderCard(card, dealerCardsContainer);
    updateScores();
}

function renderCard(card, container) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.textContent = `${card.value}${card.suit}`;
    container.appendChild(cardElement);
    // Add flip animation
    setTimeout(() => {
        cardElement.classList.add('flip');
    }, 100);
}

function updateScores() {
    playerScoreElement.textContent = `Score: ${playerScore}`;
    dealerScoreElement.textContent = `Score: ${dealerScore}`;
}

function checkPlayerBust() {
    if (playerScore > 21) {
        gameMessage.textContent = "Player Busted! Dealer Wins!";
        coins -= betAmount;
        updateCoins();
        disableButtons();
    }
}

function checkDealerBust() {
    if (dealerScore > 21) {
        gameMessage.textContent = "Dealer Busted! Player Wins!";
        coins += betAmount * 2;
        updateCoins();
    }
}

function dealerTurn() {
    while (dealerScore < 17) {
        addCardToDealer();
    }
    checkDealerBust();
    if (dealerScore <= 21) {
        if (dealerScore > playerScore) {
            gameMessage.textContent = "Dealer Wins!";
            coins -= betAmount;
        } else if (dealerScore === playerScore) {
            gameMessage.textContent = "It's a Tie!";
        } else {
            gameMessage.textContent = "Player Wins!";
            if (playerScore === 21) {
                coins += betAmount * 5; // Win met precies 21
                gameMessage.textContent = "Player Wins with 21! x5 your bet!";
            } else {
                coins += betAmount * 2; // Win met meer dan dealer
            }
        }
        updateCoins();
    }
    disableButtons();
}

function updateCoins() {
    coinsElement.textContent = `Coins: ${coins}`;
    saveCoins();
    if (coins <= 0) {
        timerElement.style.display = 'block'; // Toon de timer wanneer coins op 0 zijn
        if (!timerActive) {
            startTimer(); // Start de timer wanneer coins 0 zijn
        }
    } else {
        timerElement.style.display = 'none'; // Verberg de timer als er munten zijn
        clearInterval(timer); // Stop de timer als de speler weer munten heeft
        timerActive = false; // Markeer timer als niet actief
        resetTimer(); // Reset de timerweergave
    }
}

function startTimer() {
    timerActive = true; // Markeer timer als actief
    timeLeft = 60; // Reset tijd naar 60 seconden
    timerElement.textContent = `Timer: ${timeLeft} seconds`;
    
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Timer: ${timeLeft} seconds`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            coins = 100; // Reset munten
            saveCoins();
            updateCoins();
            gameMessage.textContent = "You have been reset to 100 coins!";
        }
    }, 1000);
}

function resetTimer() {
    timeLeft = 60; // Reset tijd naar 60 seconden
    timerElement.textContent = `Timer: ${timeLeft} seconds`;
    clearInterval(timer);
}

function disableButtons() {
    hitButton.disabled = true;
    standButton.disabled = true;
}

function enableButtons() {
    hitButton.disabled = false;
    standButton.disabled = false;
}

function resetGame() {
    playerScore = 0;
    dealerScore = 0;
    playerCards = [];
    dealerCards = [];
    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';
    gameMessage.textContent = '';
    updateScores();
    initializeDeck();
    enableButtons();
}

function updateBet() {
    const newBet = parseInt(betInput.value);
    if (newBet > 0 && newBet <= coins) {
        betAmount = newBet;
    } else {
        gameMessage.textContent = "Invalid bet amount!";
    }
}

// Event listeners
hitButton.addEventListener('click', addCardToPlayer);
standButton.addEventListener('click', dealerTurn);
resetButton.addEventListener('click', resetGame);
betInput.addEventListener('change', updateBet);

// Start the game
loadCoins();
updateCoins();
resetGame();
resetTimer(); // Reset de timer wanneer het spel begint

// Reset the timer when the player closes the page with 0 coins
window.onbeforeunload = function() {
    if (coins <= 0) {
        localStorage.setItem('timerReset', true); // Markeer dat de timer moet worden gereset
    }
};

// Reset the timer if the player comes back and the timer was marked to reset
if (localStorage.getItem('timerReset')) {
    localStorage.removeItem('timerReset'); // Verwijder de markering
    coins = 100; // Reset de munten
    saveCoins();
    updateCoins(); // Update de weergave van de munten
    gameMessage.textContent = "Timer has been reset to 100 coins!";
}
