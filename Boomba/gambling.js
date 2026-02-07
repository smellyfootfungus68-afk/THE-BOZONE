// BOZONE CASINO - Where dreams come to die
let balance = 1000;
let losingStreak = 0;
let winsToday = 0;
let bankruptcyCount = 0;
let totalWagered = 0;
let totalWon = 0;
let totalLost = 0;
let jackpot = 9999;

// Update displays
function updateBalance() {
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('losing-streak').textContent = losingStreak;
    document.getElementById('wins-today').textContent = winsToday;
    document.getElementById('bankruptcy-count').textContent = bankruptcyCount;
    document.getElementById('total-wagered').textContent = totalWagered.toFixed(2);
    document.getElementById('total-won').textContent = totalWon.toFixed(2);
    document.getElementById('total-lost').textContent = totalLost.toFixed(2);
    
    const winRate = totalWagered > 0 ? ((totalWon / totalWagered) * 100).toFixed(1) : 0;
    document.getElementById('win-rate').textContent = winRate;
    
    if (balance <= 0) {
        showBankruptPopup();
    }
}

// Money rain effect
function createMoneyRain() {
    const moneyRain = document.getElementById('money-rain');
    const symbols = ['💰', '💵', '💴', '💶', '💷', '🪙'];
    
    for (let i = 0; i < 20; i++) {
        const money = document.createElement('div');
        money.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        money.style.position = 'absolute';
        money.style.left = Math.random() * 100 + '%';
        money.style.top = '-50px';
        money.style.fontSize = (Math.random() * 20 + 20) + 'px';
        money.style.opacity = '0.7';
        money.style.animation = `fall ${Math.random() * 3 + 5}s linear infinite`;
        money.style.animationDelay = Math.random() * 5 + 's';
        moneyRain.appendChild(money);
    }
}

// Add CSS animation for falling money
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to { transform: translateY(100vh) rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Floating chips
function createFloatingChips() {
    const container = document.getElementById('floating-chips');
    const chips = ['🔴', '🔵', '⚫', '⚪'];
    
    for (let i = 0; i < 10; i++) {
        const chip = document.createElement('div');
        chip.textContent = chips[Math.floor(Math.random() * chips.length)];
        chip.style.position = 'absolute';
        chip.style.left = Math.random() * 100 + '%';
        chip.style.top = Math.random() * 100 + '%';
        chip.style.fontSize = '30px';
        chip.style.opacity = '0.3';
        chip.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
        chip.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(chip);
    }
}

const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(100px, -100px) rotate(90deg); }
        50% { transform: translate(200px, 100px) rotate(180deg); }
        75% { transform: translate(-100px, 50px) rotate(270deg); }
    }
`;
document.head.appendChild(floatStyle);

// SLOT MACHINE
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣', '🔔'];
let slotBet = 10;

document.getElementById('slot-bet').addEventListener('input', (e) => {
    slotBet = parseInt(e.target.value);
    document.getElementById('slot-bet-display').textContent = slotBet;
});

document.getElementById('slot-spin').addEventListener('click', () => {
    if (balance < slotBet) {
        showResult('slot-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    balance -= slotBet;
    totalWagered += slotBet;
    
    const reels = ['reel1', 'reel2', 'reel3'];
    const results = [];
    
    reels.forEach((reel, index) => {
        const reelEl = document.getElementById(reel);
        reelEl.classList.add('spinning');
        
        setTimeout(() => {
            const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            results[index] = symbol;
            reelEl.textContent = symbol;
            reelEl.classList.remove('spinning');
            
            if (index === 2) {
                checkSlotWin(results);
            }
        }, 1000 + (index * 500));
    });
    
    updateBalance();
});

function checkSlotWin(results) {
    let winAmount = 0;
    
    if (results[0] === results[1] && results[1] === results[2]) {
        // Jackpot!
        if (results[0] === '💎') {
            winAmount = jackpot;
            showWinPopup(winAmount);
            jackpot = 9999;
        } else if (results[0] === '7️⃣') {
            winAmount = slotBet * 50;
        } else {
            winAmount = slotBet * 10;
        }
    } else if (results[0] === results[1] || results[1] === results[2]) {
        winAmount = slotBet * 2;
    }
    
    if (winAmount > 0) {
        balance += winAmount;
        totalWon += winAmount;
        winsToday++;
        losingStreak = 0;
        showResult('slot-result', `WON $${winAmount.toFixed(2)}!`, true);
    } else {
        losingStreak++;
        totalLost += slotBet;
        jackpot += Math.floor(slotBet * 0.1);
        showResult('slot-result', 'YOU LOSE!', false);
    }
    
    document.getElementById('jackpot').textContent = jackpot;
    updateBalance();
}

// ROULETTE
const rouletteNumbers = {
    red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    green: [0]
};

let rouletteBet = 20;
document.getElementById('roulette-bet').addEventListener('input', (e) => {
    rouletteBet = parseInt(e.target.value);
    document.getElementById('roulette-bet-display').textContent = rouletteBet;
});

document.querySelectorAll('.roulette-bet').forEach(btn => {
    btn.addEventListener('click', () => {
        if (balance < rouletteBet) {
            showResult('roulette-result', 'NOT ENOUGH MONEY!', false);
            return;
        }
        
        const betType = btn.dataset.type;
        balance -= rouletteBet;
        totalWagered += rouletteBet;
        
        const wheel = document.querySelector('.wheel-inner');
        const spins = Math.random() * 360 + 1080;
        wheel.style.transform = `rotate(${spins}deg)`;
        
        setTimeout(() => {
            const number = Math.floor(Math.random() * 37);
            document.querySelector('.wheel-number').textContent = number;
            
            let win = false;
            let multiplier = 0;
            
            if (betType === 'red' && rouletteNumbers.red.includes(number)) {
                win = true;
                multiplier = 2;
            } else if (betType === 'black' && rouletteNumbers.black.includes(number)) {
                win = true;
                multiplier = 2;
            } else if (betType === 'green' && number === 0) {
                win = true;
                multiplier = 35;
            } else if (betType === 'odd' && number % 2 === 1 && number !== 0) {
                win = true;
                multiplier = 2;
            } else if (betType === 'even' && number % 2 === 0 && number !== 0) {
                win = true;
                multiplier = 2;
            }
            
            if (win) {
                const winAmount = rouletteBet * multiplier;
                balance += winAmount;
                totalWon += winAmount;
                winsToday++;
                losingStreak = 0;
                showResult('roulette-result', `${number} - WON $${winAmount.toFixed(2)}!`, true);
            } else {
                losingStreak++;
                totalLost += rouletteBet;
                showResult('roulette-result', `${number} - YOU LOSE!`, false);
            }
            
            updateBalance();
        }, 3000);
    });
});

// DICE ROLL
const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
let diceBet = 15;

document.getElementById('dice-bet').addEventListener('input', (e) => {
    diceBet = parseInt(e.target.value);
    document.getElementById('dice-bet-display').textContent = diceBet;
});

document.querySelectorAll('.dice-bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (balance < diceBet) {
            showResult('dice-result', 'NOT ENOUGH MONEY!', false);
            return;
        }
        
        const betType = btn.dataset.bet;
        balance -= diceBet;
        totalWagered += diceBet;
        
        const die1El = document.getElementById('die1');
        const die2El = document.getElementById('die2');
        
        die1El.classList.add('rolling');
        die2El.classList.add('rolling');
        
        setTimeout(() => {
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            const total = die1 + die2;
            
            die1El.textContent = diceSymbols[die1 - 1];
            die2El.textContent = diceSymbols[die2 - 1];
            die1El.classList.remove('rolling');
            die2El.classList.remove('rolling');
            
            let win = false;
            let multiplier = 0;
            
            if (betType === '7' && total === 7) {
                win = true;
                multiplier = 5;
            } else if (betType === 'high' && total >= 8 && total <= 12) {
                win = true;
                multiplier = 2;
            } else if (betType === 'low' && total >= 2 && total <= 6) {
                win = true;
                multiplier = 2;
            } else if (betType === 'doubles' && die1 === die2) {
                win = true;
                multiplier = 4;
            }
            
            if (win) {
                const winAmount = diceBet * multiplier;
                balance += winAmount;
                totalWon += winAmount;
                winsToday++;
                losingStreak = 0;
                showResult('dice-result', `${total} - WON $${winAmount.toFixed(2)}!`, true);
            } else {
                losingStreak++;
                totalLost += diceBet;
                showResult('dice-result', `${total} - YOU LOSE!`, false);
            }
            
            updateBalance();
        }, 500);
    });
});

// COIN FLIP
let coinBet = 25;
document.getElementById('coin-bet').addEventListener('input', (e) => {
    coinBet = parseInt(e.target.value);
    document.getElementById('coin-bet-display').textContent = coinBet;
});

document.querySelectorAll('.coin-bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (balance < coinBet) {
            showResult('coin-result', 'NOT ENOUGH MONEY!', false);
            return;
        }
        
        const choice = btn.dataset.side;
        balance -= coinBet;
        totalWagered += coinBet;
        
        const coin = document.getElementById('coin');
        coin.classList.add('flipping');
        
        setTimeout(() => {
            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            coin.classList.remove('flipping');
            
            if (result === choice) {
                const winAmount = coinBet * 2;
                balance += winAmount;
                totalWon += winAmount;
                winsToday++;
                losingStreak = 0;
                showResult('coin-result', `${result.toUpperCase()} - WON $${winAmount.toFixed(2)}!`, true);
            } else {
                losingStreak++;
                totalLost += coinBet;
                showResult('coin-result', `${result.toUpperCase()} - YOU LOSE!`, false);
            }
            
            updateBalance();
        }, 1000);
    });
});

// SCRATCH CARD
const scratchCanvas = document.getElementById('scratch-canvas');
const scratchCtx = scratchCanvas.getContext('2d');
let isScratching = false;
let scratchRevealed = 0;
let scratchPrize = 0;

function initScratchCard() {
    scratchCtx.fillStyle = '#ffd700';
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    scratchCtx.fillStyle = '#ccc';
    scratchCtx.font = 'bold 20px Arial';
    scratchCtx.fillText('SCRATCH TO REVEAL', 50, 100);
    
    scratchCtx.globalCompositeOperation = 'source-over';
    scratchCtx.fillStyle = '#silver';
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    scratchRevealed = 0;
}

scratchCanvas.addEventListener('mousedown', () => { isScratching = true; });
scratchCanvas.addEventListener('mouseup', () => { isScratching = false; });
scratchCanvas.addEventListener('mousemove', (e) => {
    if (!isScratching) return;
    
    const rect = scratchCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 20, 0, Math.PI * 2);
    scratchCtx.fill();
    
    scratchRevealed++;
    
    if (scratchRevealed > 100) {
        revealScratchPrize();
    }
});

function revealScratchPrize() {
    scratchCtx.globalCompositeOperation = 'source-over';
    scratchCtx.fillStyle = '#fff';
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    
    scratchCtx.fillStyle = '#000';
    scratchCtx.font = 'bold 48px Arial';
    
    if (scratchPrize > 0) {
        scratchCtx.fillText(`WIN $${scratchPrize}!`, 50, 120);
        balance += scratchPrize;
        totalWon += scratchPrize;
        winsToday++;
        losingStreak = 0;
        showResult('scratch-result', `WON $${scratchPrize}!`, true);
    } else {
        scratchCtx.fillText('SORRY!', 80, 120);
        losingStreak++;
        showResult('scratch-result', 'TRY AGAIN!', false);
    }
    
    updateBalance();
    isScratching = false;
}

document.getElementById('buy-scratch').addEventListener('click', () => {
    const cost = 50;
    if (balance < cost) {
        showResult('scratch-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    balance -= cost;
    totalWagered += cost;
    totalLost += cost;
    
    const prizes = [0, 0, 0, 25, 50, 100, 200, 500];
    scratchPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    initScratchCard();
    updateBalance();
});

initScratchCard();

// HIGHER OR LOWER
const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = ['♥', '♦', '♣', '♠'];
let currentCardValue = 7;
let hiloStreak = 0;
let hiloBet = 20;

document.getElementById('hilo-bet').addEventListener('input', (e) => {
    hiloBet = parseInt(e.target.value);
    document.getElementById('hilo-bet-display').textContent = hiloBet;
});

function getCardValue() {
    return Math.floor(Math.random() * 13) + 1;
}

function displayCard(element, value) {
    const card = cardValues[value - 1];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    
    element.querySelector('.card-value').textContent = card;
    element.querySelector('.card-suit').textContent = suit;
    
    if (suit === '♥' || suit === '♦') {
        element.classList.add('hearts');
    } else {
        element.classList.remove('hearts');
    }
}

displayCard(document.getElementById('current-card'), currentCardValue);

document.querySelectorAll('.hilo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (balance < hiloBet) {
            showResult('hilo-result', 'NOT ENOUGH MONEY!', false);
            return;
        }
        
        const guess = btn.dataset.guess;
        balance -= hiloBet;
        totalWagered += hiloBet;
        
        const nextCard = document.getElementById('next-card');
        nextCard.classList.remove('hidden');
        
        const nextValue = getCardValue();
        displayCard(nextCard, nextValue);
        
        let win = false;
        if (guess === 'higher' && nextValue > currentCardValue) win = true;
        if (guess === 'lower' && nextValue < currentCardValue) win = true;
        if (guess === 'same' && nextValue === currentCardValue) win = true;
        
        if (win) {
            hiloStreak++;
            const winAmount = hiloBet * (1 + hiloStreak * 0.5);
            balance += winAmount;
            totalWon += winAmount;
            winsToday++;
            losingStreak = 0;
            showResult('hilo-result', `CORRECT! WON $${winAmount.toFixed(2)}! STREAK: ${hiloStreak}`, true);
        } else {
            losingStreak++;
            totalLost += hiloBet;
            hiloStreak = 0;
            showResult('hilo-result', 'WRONG! STREAK BROKEN!', false);
        }
        
        currentCardValue = nextValue;
        document.getElementById('hilo-streak').textContent = hiloStreak;
        
        setTimeout(() => {
            document.getElementById('current-card').querySelector('.card-value').textContent = 
                document.getElementById('next-card').querySelector('.card-value').textContent;
            document.getElementById('current-card').querySelector('.card-suit').textContent = 
                document.getElementById('next-card').querySelector('.card-suit').textContent;
            nextCard.classList.add('hidden');
        }, 2000);
        
        updateBalance();
    });
});

// LOTTERY
const lotteryGrid = document.getElementById('lottery-grid');
let selectedLotteryNums = [];

for (let i = 1; i <= 49; i++) {
    const btn = document.createElement('button');
    btn.className = 'lottery-number';
    btn.textContent = i;
    btn.addEventListener('click', () => {
        if (selectedLotteryNums.includes(i)) {
            selectedLotteryNums = selectedLotteryNums.filter(n => n !== i);
            btn.classList.remove('selected');
        } else if (selectedLotteryNums.length < 6) {
            selectedLotteryNums.push(i);
            btn.classList.add('selected');
        }
        
        document.getElementById('selected-nums').textContent = 
            selectedLotteryNums.length > 0 ? selectedLotteryNums.join(', ') : 'None';
        document.getElementById('lottery-play').disabled = selectedLotteryNums.length !== 6;
    });
    lotteryGrid.appendChild(btn);
}

document.getElementById('lottery-quick').addEventListener('click', () => {
    document.querySelectorAll('.lottery-number').forEach(btn => btn.classList.remove('selected'));
    selectedLotteryNums = [];
    
    while (selectedLotteryNums.length < 6) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!selectedLotteryNums.includes(num)) {
            selectedLotteryNums.push(num);
            lotteryGrid.children[num - 1].classList.add('selected');
        }
    }
    
    document.getElementById('selected-nums').textContent = selectedLotteryNums.join(', ');
    document.getElementById('lottery-play').disabled = false;
});

document.getElementById('lottery-play').addEventListener('click', () => {
    if (balance < 100) {
        showResult('lottery-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    balance -= 100;
    totalWagered += 100;
    
    const winningNums = [];
    while (winningNums.length < 6) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!winningNums.includes(num)) winningNums.push(num);
    }
    
    winningNums.sort((a, b) => a - b);
    document.getElementById('winning-nums').textContent = winningNums.join(' - ');
    
    const matches = selectedLotteryNums.filter(n => winningNums.includes(n)).length;
    let winAmount = 0;
    
    if (matches === 6) winAmount = 10000;
    else if (matches === 5) winAmount = 1000;
    else if (matches === 4) winAmount = 100;
    else if (matches === 3) winAmount = 10;
    
    if (winAmount > 0) {
        balance += winAmount;
        totalWon += winAmount;
        winsToday++;
        losingStreak = 0;
        showResult('lottery-result', `${matches} MATCHES! WON $${winAmount}!`, true);
        if (matches === 6) showWinPopup(winAmount);
    } else {
        losingStreak++;
        totalLost += 100;
        showResult('lottery-result', `${matches} MATCHES - NO WIN!`, false);
    }
    
    updateBalance();
});

// BLACKJACK
const bjDeck = [];
let dealerHand = [];
let playerHand = [];
let bjBet = 50;
let bjInProgress = false;

document.getElementById('bj-bet').addEventListener('input', (e) => {
    bjBet = parseInt(e.target.value);
    document.getElementById('bj-bet-display').textContent = bjBet;
});

function createDeck() {
    bjDeck.length = 0;
    for (let suit of suits) {
        for (let value of cardValues) {
            bjDeck.push({ value, suit });
        }
    }
}

function drawCard() {
    const index = Math.floor(Math.random() * bjDeck.length);
    return bjDeck.splice(index, 1)[0];
}

function getCardPoints(card) {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function calculateHandValue(hand) {
    let value = hand.reduce((sum, card) => sum + getCardPoints(card), 0);
    let aces = hand.filter(card => card.value === 'A').length;
    
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

function displayBJCard(card, isHidden = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'bj-card';
    
    if (isHidden) {
        cardEl.classList.add('back');
        cardEl.textContent = '?';
    } else {
        if (card.suit === '♥' || card.suit === '♦') {
            cardEl.classList.add('red');
        }
        cardEl.innerHTML = `${card.value}<br>${card.suit}`;
    }
    
    return cardEl;
}

document.getElementById('bj-deal').addEventListener('click', () => {
    if (balance < bjBet) {
        showResult('bj-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    balance -= bjBet;
    totalWagered += bjBet;
    bjInProgress = true;
    
    createDeck();
    dealerHand = [drawCard(), drawCard()];
    playerHand = [drawCard(), drawCard()];
    
    const dealerCards = document.getElementById('dealer-cards');
    const playerCards = document.getElementById('player-cards');
    
    dealerCards.innerHTML = '';
    playerCards.innerHTML = '';
    
    dealerCards.appendChild(displayBJCard(dealerHand[0]));
    dealerCards.appendChild(displayBJCard(dealerHand[1], true));
    
    playerHand.forEach(card => playerCards.appendChild(displayBJCard(card)));
    
    document.getElementById('dealer-score').textContent = getCardPoints(dealerHand[0]);
    document.getElementById('player-score').textContent = calculateHandValue(playerHand);
    
    document.getElementById('bj-hit').disabled = false;
    document.getElementById('bj-stand').disabled = false;
    document.getElementById('bj-double').disabled = false;
    document.getElementById('bj-deal').disabled = true;
    
    if (calculateHandValue(playerHand) === 21) {
        setTimeout(() => stand(), 500);
    }
    
    updateBalance();
});

document.getElementById('bj-hit').addEventListener('click', () => {
    playerHand.push(drawCard());
    const playerCards = document.getElementById('player-cards');
    playerCards.appendChild(displayBJCard(playerHand[playerHand.length - 1]));
    
    const playerValue = calculateHandValue(playerHand);
    document.getElementById('player-score').textContent = playerValue;
    
    document.getElementById('bj-double').disabled = true;
    
    if (playerValue > 21) {
        endBlackjack('BUST! YOU LOSE!', false);
    } else if (playerValue === 21) {
        stand();
    }
});

document.getElementById('bj-stand').addEventListener('click', stand);

function stand() {
    document.getElementById('bj-hit').disabled = true;
    document.getElementById('bj-stand').disabled = true;
    document.getElementById('bj-double').disabled = true;
    
    const dealerCards = document.getElementById('dealer-cards');
    dealerCards.innerHTML = '';
    dealerHand.forEach(card => dealerCards.appendChild(displayBJCard(card)));
    
    let dealerValue = calculateHandValue(dealerHand);
    document.getElementById('dealer-score').textContent = dealerValue;
    
    const dealerDraw = setInterval(() => {
        if (dealerValue < 17) {
            dealerHand.push(drawCard());
            dealerCards.appendChild(displayBJCard(dealerHand[dealerHand.length - 1]));
            dealerValue = calculateHandValue(dealerHand);
            document.getElementById('dealer-score').textContent = dealerValue;
        } else {
            clearInterval(dealerDraw);
            finishBlackjack();
        }
    }, 1000);
}

document.getElementById('bj-double').addEventListener('click', () => {
    if (balance < bjBet) {
        showResult('bj-result', 'NOT ENOUGH MONEY TO DOUBLE!', false);
        return;
    }
    
    balance -= bjBet;
    totalWagered += bjBet;
    bjBet *= 2;
    
    playerHand.push(drawCard());
    const playerCards = document.getElementById('player-cards');
    playerCards.appendChild(displayBJCard(playerHand[playerHand.length - 1]));
    
    const playerValue = calculateHandValue(playerHand);
    document.getElementById('player-score').textContent = playerValue;
    
    if (playerValue > 21) {
        endBlackjack('BUST! YOU LOSE!', false);
    } else {
        stand();
    }
    
    updateBalance();
});

function finishBlackjack() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endBlackjack('DEALER BUST! YOU WIN!', true);
    } else if (playerValue > dealerValue) {
        endBlackjack('YOU WIN!', true);
    } else if (playerValue < dealerValue) {
        endBlackjack('DEALER WINS!', false);
    } else {
        endBlackjack('PUSH!', null);
    }
}

function endBlackjack(message, win) {
    if (win === true) {
        const winAmount = bjBet * 2;
        balance += winAmount;
        totalWon += winAmount;
        winsToday++;
        losingStreak = 0;
    } else if (win === false) {
        losingStreak++;
        totalLost += bjBet;
    } else {
        balance += bjBet;
    }
    
    showResult('bj-result', message, win);
    document.getElementById('bj-deal').disabled = false;
    bjInProgress = false;
    bjBet = parseInt(document.getElementById('bj-bet').value);
    updateBalance();
}

// CRASH GAME
let crashMultiplier = 1.00;
let crashActive = false;
let crashInterval;
let crashBet = 30;
let crashTarget;
const crashCanvas = document.getElementById('crash-graph');
const crashCtx = crashCanvas.getContext('2d');

document.getElementById('crash-bet').addEventListener('input', (e) => {
    crashBet = parseInt(e.target.value);
    document.getElementById('crash-bet-display').textContent = crashBet;
});

function drawCrashGraph() {
    crashCtx.clearRect(0, 0, crashCanvas.width, crashCanvas.height);
    crashCtx.strokeStyle = '#00ff00';
    crashCtx.lineWidth = 3;
    crashCtx.beginPath();
    crashCtx.moveTo(0, crashCanvas.height);
    
    const points = Math.floor(crashMultiplier * 50);
    for (let i = 0; i <= points; i++) {
        const x = (i / 50) * crashCanvas.width;
        const y = crashCanvas.height - (i * 2);
        crashCtx.lineTo(x, y);
    }
    crashCtx.stroke();
}

document.getElementById('crash-start').addEventListener('click', () => {
    if (balance < crashBet) {
        showResult('crash-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    if (crashActive) return;
    
    balance -= crashBet;
    totalWagered += crashBet;
    crashMultiplier = 1.00;
    crashActive = true;
    crashTarget = 1 + Math.random() * 5;
    
    document.getElementById('crash-start').disabled = true;
    document.getElementById('crash-cashout').disabled = false;
    
    crashInterval = setInterval(() => {
        crashMultiplier += 0.01;
        document.getElementById('crash-multiplier').textContent = crashMultiplier.toFixed(2) + 'x';
        drawCrashGraph();
        
        if (crashMultiplier >= crashTarget) {
            clearInterval(crashInterval);
            crashActive = false;
            document.getElementById('crash-start').disabled = false;
            document.getElementById('crash-cashout').disabled = true;
            losingStreak++;
            totalLost += crashBet;
            showResult('crash-result', `CRASHED AT ${crashMultiplier.toFixed(2)}x!`, false);
            updateBalance();
        }
    }, 100);
});

document.getElementById('crash-cashout').addEventListener('click', () => {
    if (!crashActive) return;
    
    clearInterval(crashInterval);
    crashActive = false;
    
    const winAmount = crashBet * crashMultiplier;
    balance += winAmount;
    totalWon += winAmount;
    winsToday++;
    losingStreak = 0;
    
    document.getElementById('crash-start').disabled = false;
    document.getElementById('crash-cashout').disabled = true;
    
    showResult('crash-result', `CASHED OUT AT ${crashMultiplier.toFixed(2)}x! WON $${winAmount.toFixed(2)}!`, true);
    updateBalance();
});

// PLINKO
const plinkoCanvas = document.getElementById('plinko-canvas');
const plinkoCtx = plinkoCanvas.getContext('2d');
let plinkoBet = 20;

document.getElementById('plinko-bet').addEventListener('input', (e) => {
    plinkoBet = parseInt(e.target.value);
    document.getElementById('plinko-bet-display').textContent = plinkoBet;
});

function drawPlinko() {
    plinkoCtx.clearRect(0, 0, plinkoCanvas.width, plinkoCanvas.height);
    
    // Draw pegs
    plinkoCtx.fillStyle = '#ffd700';
    for (let row = 0; row < 12; row++) {
        const pegsInRow = row + 3;
        const spacing = plinkoCanvas.width / (pegsInRow + 1);
        for (let peg = 0; peg < pegsInRow; peg++) {
            plinkoCtx.beginPath();
            plinkoCtx.arc(spacing * (peg + 1), 30 + row * 30, 4, 0, Math.PI * 2);
            plinkoCtx.fill();
        }
    }
}

drawPlinko();

document.getElementById('plinko-drop').addEventListener('click', () => {
    if (balance < plinkoBet) {
        showResult('plinko-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    balance -= plinkoBet;
    totalWagered += plinkoBet;
    
    let x = plinkoCanvas.width / 2;
    let y = 10;
    
    plinkoCtx.fillStyle = '#ff0000';
    
    const dropInterval = setInterval(() => {
        drawPlinko();
        
        plinkoCtx.beginPath();
        plinkoCtx.arc(x, y, 6, 0, Math.PI * 2);
        plinkoCtx.fill();
        
        y += 5;
        x += (Math.random() - 0.5) * 10;
        
        if (y > plinkoCanvas.height - 20) {
            clearInterval(dropInterval);
            
            const multipliers = [10, 5, 2, 1, 0.5, 1, 2, 5, 10];
            const slot = Math.floor((x / plinkoCanvas.width) * multipliers.length);
            const mult = multipliers[Math.max(0, Math.min(slot, multipliers.length - 1))];
            
            const winAmount = plinkoBet * mult;
            balance += winAmount;
            
            if (mult >= 1) {
                totalWon += winAmount;
                winsToday++;
                losingStreak = 0;
                showResult('plinko-result', `${mult}x! WON $${winAmount.toFixed(2)}!`, true);
            } else {
                losingStreak++;
                totalLost += (plinkoBet - winAmount);
                showResult('plinko-result', `${mult}x - LOST $${(plinkoBet - winAmount).toFixed(2)}`, false);
            }
            
            updateBalance();
        }
    }, 50);
});

// MYSTERY BOX
let mysteryBet = 40;

document.getElementById('mystery-bet').addEventListener('input', (e) => {
    mysteryBet = parseInt(e.target.value);
    document.getElementById('mystery-bet-display').textContent = mysteryBet;
});

document.querySelectorAll('.mystery-box').forEach(box => {
    box.addEventListener('click', () => {
        if (balance < mysteryBet) {
            showResult('mystery-result', 'NOT ENOUGH MONEY!', false);
            return;
        }
        
        balance -= mysteryBet;
        totalWagered += mysteryBet;
        
        const outcomes = [10, 2, 0];
        const shuffled = outcomes.sort(() => Math.random() - 0.5);
        
        document.querySelectorAll('.mystery-box').forEach((b, i) => {
            setTimeout(() => {
                const mult = shuffled[i];
                b.querySelector('.box-content').textContent = mult === 0 ? '💀' : `${mult}x`;
                b.classList.add('opened');
            }, i * 500);
        });
        
        setTimeout(() => {
            const boxNum = parseInt(box.dataset.box) - 1;
            const mult = shuffled[boxNum];
            
            if (mult > 0) {
                const winAmount = mysteryBet * mult;
                balance += winAmount;
                totalWon += winAmount;
                winsToday++;
                losingStreak = 0;
                showResult('mystery-result', `${mult}x! WON $${winAmount.toFixed(2)}!`, true);
            } else {
                losingStreak++;
                totalLost += mysteryBet;
                showResult('mystery-result', 'SKULL! YOU LOSE!', false);
            }
            
            updateBalance();
            
            setTimeout(() => {
                document.querySelectorAll('.mystery-box').forEach(b => {
                    b.querySelector('.box-content').textContent = '?';
                    b.classList.remove('opened');
                });
            }, 3000);
        }, 1500);
    });
});

// PRIZE WHEEL
const wheelCanvas = document.getElementById('wheel-canvas');
const wheelCtx = wheelCanvas.getContext('2d');
let wheelBet = 35;
const wheelPrizes = [100, 0, 50, 10, 5, 0, 20, 0, 200, 0, 30, 0];

document.getElementById('wheel-bet').addEventListener('input', (e) => {
    wheelBet = parseInt(e.target.value);
    document.getElementById('wheel-bet-display').textContent = wheelBet;
});

function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = 120;
    const sliceAngle = (2 * Math.PI) / wheelPrizes.length;
    
    wheelPrizes.forEach((prize, i) => {
        wheelCtx.beginPath();
        wheelCtx.moveTo(centerX, centerY);
        wheelCtx.arc(centerX, centerY, radius, i * sliceAngle, (i + 1) * sliceAngle);
        wheelCtx.closePath();
        
        wheelCtx.fillStyle = prize > 0 ? (i % 2 === 0 ? '#ff0000' : '#ffff00') : '#333';
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#fff';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
        
        wheelCtx.save();
        wheelCtx.translate(centerX, centerY);
        wheelCtx.rotate(i * sliceAngle + sliceAngle / 2);
        wheelCtx.textAlign = 'center';
        wheelCtx.fillStyle = '#fff';
        wheelCtx.font = 'bold 16px Arial';
        wheelCtx.fillText(prize > 0 ? `$${prize}` : 'LOSE', radius * 0.7, 5);
        wheelCtx.restore();
    });
}

drawWheel();

document.getElementById('spin-wheel').addEventListener('click', () => {
    if (balance < wheelBet) {
        showResult('wheel-result', 'NOT ENOUGH MONEY!', false);
        return;
    }
    
    balance -= wheelBet;
    totalWagered += wheelBet;
    
    const spinner = document.getElementById('prize-wheel');
    const spins = 360 * 5 + Math.random() * 360;
    spinner.style.transform = `rotate(${spins}deg)`;
    
    setTimeout(() => {
        const finalAngle = spins % 360;
        const sliceAngle = 360 / wheelPrizes.length;
        const prizeIndex = Math.floor(((360 - finalAngle) + sliceAngle / 2) / sliceAngle) % wheelPrizes.length;
        const prize = wheelPrizes[prizeIndex];
        
        if (prize > 0) {
            balance += prize;
            totalWon += prize;
            winsToday++;
            losingStreak = 0;
            showResult('wheel-result', `WON $${prize}!`, true);
        } else {
            losingStreak++;
            totalLost += wheelBet;
            showResult('wheel-result', 'YOU LOSE!', false);
        }
        
        updateBalance();
    }, 4000);
});

// Utility functions
function showResult(elementId, message, isWin) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = 'result-text';
    if (isWin !== null) {
        el.classList.add(isWin ? 'win' : 'lose');
    }
}

function showWinPopup(amount) {
    document.getElementById('win-amount').textContent = `YOU WON $${amount.toFixed(2)}!`;
    document.getElementById('win-popup').classList.remove('hidden');
}

function showBankruptPopup() {
    document.getElementById('bankrupt-popup').classList.remove('hidden');
    bankruptcyCount++;
}

document.getElementById('close-win').addEventListener('click', () => {
    document.getElementById('win-popup').classList.add('hidden');
});

document.getElementById('close-bankrupt').addEventListener('click', () => {
    document.getElementById('bankrupt-popup').classList.add('hidden');
});

document.getElementById('add-money').addEventListener('click', () => {
    balance += 500;
    updateBalance();
});

document.getElementById('reset-balance').addEventListener('click', () => {
    balance = 1000;
    losingStreak = 0;
    winsToday = 0;
    totalWagered = 0;
    totalWon = 0;
    totalLost = 0;
    updateBalance();
});

// Lucky number generator
function updateLuckyNumber() {
    document.getElementById('lucky-number').textContent = Math.floor(Math.random() * 100);
}
setInterval(updateLuckyNumber, 5000);

// Initialize
createMoneyRain();
createFloatingChips();
updateBalance();
updateLuckyNumber();