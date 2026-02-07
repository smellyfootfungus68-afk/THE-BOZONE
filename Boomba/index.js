let visitorCount = Math.floor(Math.random() * 999999);
let chaosMode = false;
let partyMode = false;
let cursorTrailEnabled = true;
let totalClicks = 0;
let settingsChanged = 0;
let startTime = Date.now();
let mysteryCounter = 42;
let konamiIndex = 0;
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const achievements = {
    'first-visit': false,
    'chaos-master': false,
    'secret-finder': false,
    'party-animal': false,
    'clicker': false,
    'customizer': false,
    'konami': false,
    'time-traveler': false
};

const facts = [
    "Did you know? Bananas are berries but strawberries aren't.",
    "The shortest war in history lasted 38 minutes.",
    "Honey never spoils. You could eat 3000 year old honey.",
    "A group of flamingos is called a 'flamboyance'.",
    "Octopuses have three hearts and blue blood.",
    "The inventor of the Pringles can is buried in one.",
    "Wombat poop is cube-shaped.",
    "There are more possible iterations of a game of chess than atoms in the universe.",
    "Cleopatra lived closer to the invention of the iPhone than to the building of the pyramids.",
    "A day on Venus is longer than a year on Venus.",
    "Scotland's national animal is the unicorn.",
    "A mantis shrimp can punch with the force of a bullet.",
    "There are more trees on Earth than stars in the Milky Way.",
    "Sharks have been around longer than trees.",
    "The fingerprints of koalas are so similar to humans, they could contaminate crime scenes.",
];

const fortunes = [
    "Signs point to yes... or no. Honestly, who knows?",
    "Ask again later (like, way later).",
    "The spirits say: ¯\\_(ツ)_/¯",
    "Outlook not so good. Get better questions.",
    "Absolutely! (No guarantees though)",
    "Reply hazy, try again (with coffee)",
    "My sources say no, but they're unreliable.",
    "YES! Wait, actually, MAYBE.",
    "The cosmos is buffering...",
    "404: Future Not Found",
];

const moods = [
    { color: '#ff0000', text: 'CHAOS INCARNATE 🔥' },
    { color: '#ff8800', text: 'MILDLY UNHINGED 🤪' },
    { color: '#ffff00', text: 'QUESTIONABLE ENERGY ⚡' },
    { color: '#00ff00', text: 'SURPRISINGLY CHILL 😌' },
    { color: '#00ffff', text: 'TRANSCENDENT VIBES ✨' },
    { color: '#0000ff', text: 'DEEPLY CONFUSED 🤔' },
    { color: '#ff00ff', text: 'CHAOTICALLY STABLE 🌀' },
    { color: '#ff1493', text: 'FABULOUSLY UNSTABLE 💅' },
];

const prophecies = [
    "In seven days, you will encounter a mildly inconvenient situation involving a beverage.",
    "Beware the one who speaks in Comic Sans.",
    "Your future holds many small victories and even more minor defeats.",
    "A great journey awaits... probably to the fridge.",
    "You will soon make a decision. It might even be a good one.",
    "The stars align to suggest you should probably hydrate more.",
    "An unexpected email will arrive. It will be spam.",
    "Fortune favors the bold, but so does embarrassment.",
    "You will soon laugh at something completely inappropriate.",
    "Your destiny involves 73% more chaos than average.",
    "The ancients foretell: your Wi-Fi will disconnect at an inopportune moment.",
    "A mysterious stranger approaches... it's the delivery person.",
];

const locations = [
    "Middle of the Ocean 🌊",
    "Mars (probably) 🔴",
    "The Void ⚫",
    "Your Neighbor's WiFi 📡",
    "Narnia 🦁",
    "The Matrix 🕶️",
    "A Parallel Universe 🌌",
    "Behind You 👻",
    "The Moon 🌙",
    "Atlantis 🏛️",
    "The 4th Dimension 🔮",
    "Inside a Computer 💻",
];

const inspirationalQuotes = [
    '"Live, Laugh, Chaos" - Anonymous',
    '"404: Wisdom Not Found" - The Server',
    '"YOLO but also make backups" - IT Department',
    '"Be yourself, unless you can be chaos" - The Void',
    '"Carpe Diem (Seize the Day) YEET" - Modern Philosophy',
    '"What would Comic Sans do?" - Design Principles',
    '"Ctrl+Z your mistakes" - Life Coach',
    '"Keep calm and clear cache" - Ancient Wisdom',
];

const emojis = ['✨', '🌟', '⭐', '💫', '🔥', '💎', '🌈', '🎨', '🎭', '🎪'];

function init() {
    updateClock();
    setInterval(updateClock, 1000);
    
    updateDate();
    
    updateVisitorCount();
    setInterval(updateVisitorCount, 3000);
    
    displayRandomFact();
    
    updateVibe();
    setInterval(updateVibe, 5000);
    
    updateUselessStats();
    setInterval(updateUselessStats, 1000);
    
    updateFooterQuote();
    setInterval(updateFooterQuote, 30000);
    
    randomizeFakeLocation();
    
    setupEventListeners();
    
    createFloatingStuff();
    
    loadSettings();
    loadAchievements();
    
    document.addEventListener('mousemove', handleCursorTrail);
    
    const mainTitle = document.getElementById('main-title');
    mainTitle.setAttribute('data-text', mainTitle.textContent);
    
    setInterval(glitchTitle, 3000);
    
    document.addEventListener('keydown', handleKeyPress);
    
    unlockAchievement('first-visit');
    
    setTimeout(() => {
        unlockAchievement('time-traveler');
    }, 300000);
    
    setInterval(randomMalfunctions, 30000);
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

function updateVisitorCount() {
    visitorCount += Math.floor(Math.random() * 10);
    document.getElementById('visitor-count').textContent = String(visitorCount).padStart(6, '0');
}

function displayRandomFact() {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    document.getElementById('random-fact').textContent = fact;
}

function updateVibe() {
    const vibeLevel = Math.floor(Math.random() * 100);
    const vibeBar = document.getElementById('vibe-bar');
    const vibeText = document.getElementById('vibe-text');
    
    vibeBar.style.width = vibeLevel + '%';
    
    if (vibeLevel < 30) {
        vibeText.textContent = 'Vibes: Questionable 😬';
    } else if (vibeLevel < 60) {
        vibeText.textContent = 'Vibes: Mid 😐';
    } else if (vibeLevel < 90) {
        vibeText.textContent = 'Vibes: Immaculate ✨';
    } else {
        vibeText.textContent = 'Vibes: TRANSCENDENT 🌟';
    }
}

function updateUselessStats() {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    document.getElementById('pixels-rendered').textContent = 
        (Math.random() * 9999999).toFixed(0);
    
    document.getElementById('cpu-sadness').textContent = 
        (Math.random() * 100).toFixed(1) + '%';
    
    const chaosLevels = ['MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'EXTREME', 'CATASTROPHIC'];
    let chaosIndex = 0;
    if (chaosMode) chaosIndex += 3;
    if (partyMode) chaosIndex += 2;
    if (document.getElementById('seizure-mode').checked) chaosIndex += 1;
    document.getElementById('chaos-level').textContent = 
        chaosLevels[Math.min(chaosIndex, chaosLevels.length - 1)];
    
    const regretLevels = ['ACCEPTABLE', 'QUESTIONABLE', 'CONCERNING', 'REGRETTABLE', 'CATASTROPHIC'];
    document.getElementById('regrets').textContent = 
        regretLevels[Math.floor(Math.random() * regretLevels.length)];
    
    document.getElementById('time-wasted').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const sanity = Math.max(0, 100 - (elapsedSeconds / 10));
    document.getElementById('sanity').textContent = sanity.toFixed(1) + '%';
}

function updateFooterQuote() {
    const quote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    document.getElementById('footer-quote').textContent = quote;
}

function randomizeFakeLocation() {
    const location = locations[Math.floor(Math.random() * locations.length)];
    document.getElementById('fake-location').textContent = location;
}

function setupEventListeners() {
    document.getElementById('bg-color').addEventListener('input', (e) => {
        document.body.style.background = e.target.value;
        trackSettingChange();
    });
    
    document.getElementById('random-bg').addEventListener('click', () => {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        document.getElementById('bg-color').value = randomColor;
        document.body.style.background = randomColor;
        trackSettingChange();
    });
    
    document.getElementById('text-color').addEventListener('input', (e) => {
        document.body.style.color = e.target.value;
        trackSettingChange();
    });
    
    document.getElementById('random-text').addEventListener('click', () => {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        document.getElementById('text-color').value = randomColor;
        document.body.style.color = randomColor;
        trackSettingChange();
    });
    
    document.getElementById('font-size').addEventListener('input', (e) => {
        const size = e.target.value + 'px';
        document.getElementById('font-size-display').textContent = size;
        document.body.style.fontSize = size;
        trackSettingChange();
    });
    
    document.getElementById('rotation').addEventListener('input', (e) => {
        const rotation = e.target.value + '°';
        document.getElementById('rotation-display').textContent = rotation;
        document.querySelector('.container').style.transform = `rotate(${e.target.value}deg)`;
        trackSettingChange();
    });
    
    document.getElementById('comic-sans').addEventListener('input', (e) => {
        const level = e.target.value;
        document.getElementById('comic-sans-display').textContent = level + '%';
        if (level > 50) {
            document.body.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        } else {
            document.body.style.fontFamily = "Arial, sans-serif";
        }
        trackSettingChange();
    });
    
    document.getElementById('blink-speed').addEventListener('input', (e) => {
        const speed = e.target.value + 'ms';
        document.getElementById('blink-display').textContent = speed;
        document.documentElement.style.setProperty('--blink-speed', speed);
        trackSettingChange();
    });
    
    document.getElementById('marquee-speed').addEventListener('input', (e) => {
        const marquees = document.querySelectorAll('marquee');
        marquees.forEach(m => m.scrollDelay = e.target.value);
        trackSettingChange();
    });
    
    document.getElementById('bg-pattern').addEventListener('change', (e) => {
        applyBackgroundPattern(e.target.value);
        trackSettingChange();
    });
    
    document.getElementById('cursor-trail-toggle').addEventListener('change', (e) => {
        cursorTrailEnabled = e.target.checked;
        trackSettingChange();
    });
    
    document.getElementById('chaos-mode').addEventListener('change', (e) => {
        chaosMode = e.target.checked;
        document.body.classList.toggle('chaos-mode', chaosMode);
        trackSettingChange();
    });
    
    document.getElementById('snow-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            startSnowfall();
        } else {
            stopSnowfall();
        }
        trackSettingChange();
    });
    
    document.getElementById('spin-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.querySelector('.container').style.animation = 'chaos-spin 10s infinite';
        } else {
            document.querySelector('.container').style.animation = 'none';
        }
        trackSettingChange();
    });
    
    document.getElementById('glitch-intensity').addEventListener('input', (e) => {
        const intensity = e.target.value;
        document.documentElement.style.setProperty('--glitch-intensity', intensity);
        trackSettingChange();
    });
    
    document.getElementById('wobble').addEventListener('input', (e) => {
        const wobble = e.target.value;
        document.documentElement.style.setProperty('--wobble', wobble + 'px');
        trackSettingChange();
    });
    
    document.getElementById('opacity').addEventListener('input', (e) => {
        document.querySelector('.container').style.opacity = e.target.value / 100;
        trackSettingChange();
    });
    
    document.getElementById('screen-shake').addEventListener('change', (e) => {
        document.body.classList.toggle('screen-shake', e.target.checked);
        trackSettingChange();
    });
    
    document.getElementById('gravity-mode').addEventListener('change', (e) => {
        document.body.classList.toggle('gravity-mode', e.target.checked);
        trackSettingChange();
    });
    
    document.getElementById('seizure-mode').addEventListener('change', (e) => {
        document.body.classList.toggle('seizure-mode', e.target.checked);
        trackSettingChange();
    });
    
    document.getElementById('upside-down').addEventListener('change', (e) => {
        document.body.classList.toggle('upside-down', e.target.checked);
        trackSettingChange();
    });
    
    document.getElementById('party-mode').addEventListener('click', () => {
        togglePartyMode();
        unlockAchievement('party-animal');
    });
    
    document.getElementById('reset-btn').addEventListener('click', resetSettings);
    
    document.getElementById('max-chaos').addEventListener('click', () => {
        maximumChaos();
        unlockAchievement('chaos-master');
    });
    
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    document.getElementById('load-settings').addEventListener('click', loadSettings);
    
    document.getElementById('new-fact').addEventListener('click', displayRandomFact);
    
    document.getElementById('close-easter').addEventListener('click', () => {
        document.getElementById('easter-egg').classList.add('hidden');
    });
    
    document.getElementById('consult-fortune').addEventListener('click', consultFortune);
    
    document.getElementById('refresh-mood').addEventListener('click', checkMood);
    
    document.getElementById('randomize-location').addEventListener('click', randomizeFakeLocation);
    
    document.getElementById('fake-play').addEventListener('click', toggleFakeAudio);
    
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    
    document.getElementById('increment-mystery').addEventListener('click', () => {
        mysteryCounter++;
        document.getElementById('mystery-counter').textContent = mysteryCounter;
    });
    
    document.getElementById('decrement-mystery').addEventListener('click', () => {
        mysteryCounter--;
        document.getElementById('mystery-counter').textContent = mysteryCounter;
    });
    
    document.getElementById('generate-prophecy').addEventListener('click', generateProphecy);
    
    document.getElementById('close-virus').addEventListener('click', () => {
        document.getElementById('fake-virus').classList.add('hidden');
    });
}

function trackSettingChange() {
    settingsChanged++;
    if (settingsChanged >= 10) {
        unlockAchievement('customizer');
    }
}

function consultFortune() {
    const question = document.getElementById('fortune-question').value;
    const answerEl = document.getElementById('fortune-answer');
    const orb = document.querySelector('.crystal-orb');
    
    if (!question.trim()) {
        alert('The void requires a question!');
        return;
    }
    
    orb.textContent = '...';
    
    setTimeout(() => {
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        answerEl.textContent = fortune;
        answerEl.classList.remove('hidden');
        orb.textContent = '🔮';
    }, 2000);
}

function checkMood() {
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const ring = document.getElementById('mood-ring-circle');
    const text = document.getElementById('mood-text');
    
    ring.style.background = mood.color;
    text.textContent = mood.text;
}

function toggleFakeAudio() {
    const btn = document.getElementById('fake-play');
    if (btn.textContent === '▶️') {
        btn.textContent = '⏸️';
        alert('Now playing: Despacito (Ultra HD 8K Remaster)');
    } else {
        btn.textContent = '▶️';
    }
}

function rollDice() {
    const diceDisplay = document.getElementById('dice-display');
    const diceFrames = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    let rolls = 0;
    const rollInterval = setInterval(() => {
        diceDisplay.textContent = diceFrames[Math.floor(Math.random() * 6)];
        rolls++;
        
        if (rolls >= 20) {
            clearInterval(rollInterval);
            const finalRoll = Math.floor(Math.random() * 6) + 1;
            diceDisplay.textContent = diceFrames[finalRoll - 1];
        }
    }, 100);
}

function generateProphecy() {
    const prophecy = prophecies[Math.floor(Math.random() * prophecies.length)];
    document.getElementById('prophecy-text').textContent = prophecy;
}

function unlockAchievement(id) {
    if (achievements[id]) return;
    
    achievements[id] = true;
    const achievementEl = document.querySelector(`[data-achievement="${id}"]`);
    if (achievementEl) {
        achievementEl.classList.remove('locked');
        achievementEl.classList.add('unlocked');
    }
    
    const popup = document.getElementById('achievement-popup');
    const popupText = document.getElementById('achievement-popup-text');
    
    const achievementNames = {
        'first-visit': '🎯 First Timer - You visited the site!',
        'chaos-master': '😈 Chaos Master - Maximum chaos activated!',
        'secret-finder': '🔍 Secret Finder - Easter egg discovered!',
        'party-animal': '🎊 Party Animal - Party mode enabled!',
        'clicker': '👆 Click Champion - 500 clicks achieved!',
        'customizer': '🎨 Customizer - Changed 10 settings!',
        'konami': '🎮 Konami Master - Secret code entered!',
        'time-traveler': '⏰ Time Traveler - Stayed for 5 minutes!',
    };
    
    popupText.textContent = achievementNames[id];
    popup.classList.remove('hidden');
    
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
    
    saveAchievements();
}

function saveAchievements() {
    localStorage.setItem('bozoneAchievements', JSON.stringify(achievements));
}

function loadAchievements() {
    const saved = localStorage.getItem('bozoneAchievements');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.keys(loaded).forEach(key => {
            if (loaded[key]) {
                achievements[key] = true;
                const achievementEl = document.querySelector(`[data-achievement="${key}"]`);
                if (achievementEl) {
                    achievementEl.classList.remove('locked');
                    achievementEl.classList.add('unlocked');
                }
            }
        });
    }
}

function applyBackgroundPattern(pattern) {
    const body = document.body;
    
    switch(pattern) {
        case 'dots':
            body.style.backgroundImage = 'radial-gradient(circle, #000 1px, transparent 1px)';
            body.style.backgroundSize = '20px 20px';
            break;
        case 'stripes':
            body.style.backgroundImage = 'repeating-linear-gradient(45deg, #ff0000, #ff0000 10px, #00ff00 10px, #00ff00 20px)';
            body.style.backgroundSize = 'auto';
            break;
        case 'checkers':
            body.style.backgroundImage = 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)';
            body.style.backgroundSize = '40px 40px';
            break;
        case 'stars':
            body.style.backgroundImage = 'radial-gradient(circle, yellow 2px, transparent 3px)';
            body.style.backgroundSize = '50px 50px';
            break;
        case 'matrix':
            body.style.backgroundImage = 'linear-gradient(0deg, #000 0%, #0f0 100%)';
            body.style.backgroundSize = 'auto';
            createMatrixRain();
            break;
        default:
            body.style.backgroundImage = 'none';
            body.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)';
            body.style.backgroundSize = '400% 400%';
    }
}

function handleCursorTrail(e) {
    if (!cursorTrailEnabled) return;
    
    const trail = document.createElement('div');
    trail.className = 'trail-particle';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    trail.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    
    document.getElementById('cursor-trail').appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
}

function createFloatingStuff() {
    const container = document.getElementById('floating-stuff');
    
    for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        item.className = 'floating-item';
        item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        item.style.left = Math.random() * 100 + '%';
        item.style.animationDuration = (Math.random() * 10 + 5) + 's';
        item.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(item);
    }
}

function togglePartyMode() {
    partyMode = !partyMode;
    document.body.classList.toggle('party-mode', partyMode);
    
    if (partyMode) {
        const audio = document.getElementById('bg-music');
        audio.play().catch(() => {});
    } else {
        const audio = document.getElementById('bg-music');
        audio.pause();
    }
}

function resetSettings() {
    document.getElementById('bg-color').value = '#ffffff';
    document.getElementById('text-color').value = '#000000';
    document.getElementById('font-size').value = 16;
    document.getElementById('rotation').value = 0;
    document.getElementById('comic-sans').value = 0;
    document.getElementById('blink-speed').value = 500;
    document.getElementById('marquee-speed').value = 10;
    document.getElementById('bg-pattern').value = 'none';
    document.getElementById('cursor-trail-toggle').checked = true;
    document.getElementById('chaos-mode').checked = false;
    document.getElementById('snow-toggle').checked = false;
    document.getElementById('spin-toggle').checked = false;
    document.getElementById('glitch-intensity').value = 3;
    document.getElementById('wobble').value = 0;
    document.getElementById('opacity').value = 100;
    document.getElementById('screen-shake').checked = false;
    document.getElementById('gravity-mode').checked = false;
    document.getElementById('seizure-mode').checked = false;
    document.getElementById('upside-down').checked = false;
    
    document.body.style = '';
    document.querySelector('.container').style = '';
    document.body.classList.remove('chaos-mode', 'party-mode', 'seizure-mode', 'upside-down', 'screen-shake', 'gravity-mode');
    
    applyBackgroundPattern('none');
}

function maximumChaos() {
    document.getElementById('chaos-mode').checked = true;
    document.getElementById('seizure-mode').checked = true;
    document.getElementById('spin-toggle').checked = true;
    document.getElementById('screen-shake').checked = true;
    document.getElementById('glitch-intensity').value = 10;
    document.getElementById('wobble').value = 50;
    
    document.body.classList.add('chaos-mode', 'seizure-mode', 'screen-shake');
    document.querySelector('.container').style.animation = 'chaos-spin 2s infinite';
    
    startSnowfall();
    togglePartyMode();
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            document.body.style.background = randomColor;
        }, i * 100);
    }
}

function saveSettings() {
    const settings = {
        bgColor: document.getElementById('bg-color').value,
        textColor: document.getElementById('text-color').value,
        fontSize: document.getElementById('font-size').value,
        rotation: document.getElementById('rotation').value,
        comicSans: document.getElementById('comic-sans').value,
        blinkSpeed: document.getElementById('blink-speed').value,
        marqueeSpeed: document.getElementById('marquee-speed').value,
        bgPattern: document.getElementById('bg-pattern').value,
        cursorTrail: document.getElementById('cursor-trail-toggle').checked,
        chaosMode: document.getElementById('chaos-mode').checked,
        snowfall: document.getElementById('snow-toggle').checked,
        spin: document.getElementById('spin-toggle').checked,
        glitch: document.getElementById('glitch-intensity').value,
        wobble: document.getElementById('wobble').value,
        opacity: document.getElementById('opacity').value,
        screenShake: document.getElementById('screen-shake').checked,
        gravity: document.getElementById('gravity-mode').checked,
        seizure: document.getElementById('seizure-mode').checked,
        upsideDown: document.getElementById('upside-down').checked,
    };
    
    localStorage.setItem('bozoneSettings', JSON.stringify(settings));
    alert('Settings saved to the void! 💾');
}

function loadSettings() {
    const saved = localStorage.getItem('bozoneSettings');
    if (!saved) return;
    
    const settings = JSON.parse(saved);
    
    document.getElementById('bg-color').value = settings.bgColor || '#ffffff';
    document.getElementById('text-color').value = settings.textColor || '#000000';
    document.getElementById('font-size').value = settings.fontSize || 16;
    document.getElementById('rotation').value = settings.rotation || 0;
    document.getElementById('comic-sans').value = settings.comicSans || 0;
    document.getElementById('blink-speed').value = settings.blinkSpeed || 500;
    document.getElementById('marquee-speed').value = settings.marqueeSpeed || 10;
    document.getElementById('bg-pattern').value = settings.bgPattern || 'none';
    document.getElementById('cursor-trail-toggle').checked = settings.cursorTrail !== false;
    document.getElementById('chaos-mode').checked = settings.chaosMode || false;
    document.getElementById('snow-toggle').checked = settings.snowfall || false;
    document.getElementById('spin-toggle').checked = settings.spin || false;
    document.getElementById('glitch-intensity').value = settings.glitch || 3;
    document.getElementById('wobble').value = settings.wobble || 0;
    document.getElementById('opacity').value = settings.opacity || 100;
    document.getElementById('screen-shake').checked = settings.screenShake || false;
    document.getElementById('gravity-mode').checked = settings.gravity || false;
    document.getElementById('seizure-mode').checked = settings.seizure || false;
    document.getElementById('upside-down').checked = settings.upsideDown || false;
    
    document.body.style.background = settings.bgColor;
    document.body.style.color = settings.textColor;
    document.body.style.fontSize = settings.fontSize + 'px';
    document.querySelector('.container').style.transform = `rotate(${settings.rotation}deg)`;
    document.querySelector('.container').style.opacity = settings.opacity / 100;
    
    applyBackgroundPattern(settings.bgPattern);
    
    if (settings.chaosMode) document.body.classList.add('chaos-mode');
    if (settings.screenShake) document.body.classList.add('screen-shake');
    if (settings.gravity) document.body.classList.add('gravity-mode');
    if (settings.seizure) document.body.classList.add('seizure-mode');
    if (settings.upsideDown) document.body.classList.add('upside-down');
    if (settings.snowfall) startSnowfall();
    if (settings.spin) document.querySelector('.container').style.animation = 'chaos-spin 10s infinite';
}

let snowInterval;

function startSnowfall() {
    stopSnowfall();
    snowInterval = setInterval(() => {
        const snow = document.createElement('div');
        snow.className = 'snow';
        snow.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
        snow.style.left = Math.random() * 100 + '%';
        snow.style.animationDuration = (Math.random() * 3 + 2) + 's';
        snow.style.opacity = Math.random();
        document.body.appendChild(snow);
        
        setTimeout(() => snow.remove(), 5000);
    }, 200);
}

function stopSnowfall() {
    if (snowInterval) {
        clearInterval(snowInterval);
        document.querySelectorAll('.snow').forEach(s => s.remove());
    }
}

function createMatrixRain() {
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    const container = document.body;
    
    for (let i = 0; i < 50; i++) {
        const char = document.createElement('div');
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        char.style.position = 'fixed';
        char.style.left = Math.random() * 100 + '%';
        char.style.top = Math.random() * 100 + '%';
        char.style.color = '#0f0';
        char.style.animation = `float ${Math.random() * 5 + 3}s linear infinite`;
        container.appendChild(char);
    }
}

function glitchTitle() {
    const title = document.getElementById('main-title');
    const original = title.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let glitched = '';
    for (let char of original) {
        if (Math.random() < 0.1) {
            glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
            glitched += char;
        }
    }
    
    title.textContent = glitched;
    
    setTimeout(() => {
        title.textContent = original;
    }, 100);
}

function handleKeyPress(e) {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            unlockAchievement('konami');
            document.getElementById('hacker-mode-indicator').classList.remove('hidden');
            konamiIndex = 0;
            
            setTimeout(() => {
                alert('🎮 KONAMI CODE ACTIVATED! You are now a certified hacker! 🎮');
            }, 100);
        }
    } else {
        konamiIndex = 0;
    }
    
    if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        document.getElementById('easter-egg').classList.remove('hidden');
        unlockAchievement('secret-finder');
    }
    
    if (e.key === 'Escape') {
        resetSettings();
    }
}

function randomMalfunctions() {
    const malfunctions = [
        () => {
            document.getElementById('fake-virus').classList.remove('hidden');
        },
        () => {
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                link.style.transform = `rotate(${Math.random() * 360}deg)`;
                setTimeout(() => link.style.transform = '', 1000);
            });
        },
        () => {
            document.body.style.transform = 'scale(1.5)';
            setTimeout(() => document.body.style.transform = '', 2000);
        },
        () => {
            const announcement = document.getElementById('announcement-text');
            announcement.textContent = '🚨 THE WEBSITE IS NOW SENTIENT 🚨';
        },
    ];
    
    if (Math.random() < 0.1) {
        const malfunction = malfunctions[Math.floor(Math.random() * malfunctions.length)];
        malfunction();
    }
}

document.addEventListener('DOMContentLoaded', init);

setInterval(() => {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (Math.random() < 0.05) {
            link.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
            setTimeout(() => {
                link.style.transform = '';
            }, 500);
        }
    });
}, 2000);

setInterval(() => {
    const announcements = [
        'The webmaster is currently experiencing consciousness. Please stand by.',
        'WARNING: This site may cause spontaneous existential crises.',
        'Did you remember to feed your Tamagotchi today?',
        'BREAKING: Local website achieves sentience, immediately regrets it.',
        'Your browser is judging your life choices.',
        'This message will self-destruct in... wait, no it won\'t.',
        'Congratulations! You are visitor #' + Math.floor(Math.random() * 1000000) + '!',
        'Site best viewed with eyes.',
        'Now with 300% more chaos!',
        'Achievement Unlocked: You scrolled down.',
        'The void stares back.',
        'Have you considered touching grass?',
        'Your IP address has been logged (just kidding).',
        'This website is powered by pure chaos energy.',
    ];
    
    document.getElementById('announcement-text').textContent = 
        announcements[Math.floor(Math.random() * announcements.length)];
}, 10000);

let clickCount = 0;
document.body.addEventListener('click', () => {
    clickCount++;
    totalClicks++;
    
    if (totalClicks >= 500) {
        unlockAchievement('clicker');
    }
    
    if (clickCount >= 100) {
        document.getElementById('easter-egg').classList.remove('hidden');
        unlockAchievement('secret-finder');
        clickCount = 0;
    }
});

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (Math.random() < 0.1) {
            e.preventDefault();
            alert('🎲 RANDOM EVENT: This link is temporarily broken! Try again!');
        }
    });
});