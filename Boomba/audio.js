// Audio Chaos Zone - Main JavaScript

// Global Audio Context
let audioContext;
let masterGain;

// Initialize Audio Context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = 0.7;
    }
}

// ==================== PARTICLE BACKGROUND ====================
function createParticles() {
    const container = document.getElementById('particle-container');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        container.appendChild(particle);
    }
}

// Add float animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(20px, -20px); }
        50% { transform: translate(-20px, 20px); }
        75% { transform: translate(20px, 20px); }
    }
`;
document.head.appendChild(style);

// ==================== FREQUENCY GENERATOR ====================
let freqOscillator = null;
let freqGain = null;
let freqAnalyser = null;

function setupFrequencyGenerator() {
    const freqSlider = document.getElementById('freq-slider');
    const freqInput = document.getElementById('freq-input');
    const waveType = document.getElementById('wave-type');
    const volumeSlider = document.getElementById('freq-volume');
    const volumeDisplay = document.getElementById('freq-vol-display');
    const playBtn = document.getElementById('freq-play');
    const stopBtn = document.getElementById('freq-stop');
    const randomBtn = document.getElementById('freq-random');
    const canvas = document.getElementById('freq-visualizer');
    const ctx = canvas.getContext('2d');

    // Sync slider and input
    freqSlider.addEventListener('input', () => {
        freqInput.value = freqSlider.value;
        if (freqOscillator) {
            freqOscillator.frequency.value = freqSlider.value;
        }
    });

    freqInput.addEventListener('input', () => {
        freqSlider.value = freqInput.value;
        if (freqOscillator) {
            freqOscillator.frequency.value = freqInput.value;
        }
    });

    volumeSlider.addEventListener('input', () => {
        volumeDisplay.textContent = volumeSlider.value + '%';
        if (freqGain) {
            freqGain.gain.value = volumeSlider.value / 100;
        }
    });

    playBtn.addEventListener('click', () => {
        initAudioContext();
        
        if (freqOscillator) {
            freqOscillator.stop();
        }

        freqOscillator = audioContext.createOscillator();
        freqGain = audioContext.createGain();
        freqAnalyser = audioContext.createAnalyser();

        freqOscillator.type = waveType.value;
        freqOscillator.frequency.value = freqSlider.value;
        freqGain.gain.value = volumeSlider.value / 100;

        freqOscillator.connect(freqGain);
        freqGain.connect(freqAnalyser);
        freqAnalyser.connect(masterGain);

        freqOscillator.start();
        visualizeFrequency(ctx, freqAnalyser);
    });

    stopBtn.addEventListener('click', () => {
        if (freqOscillator) {
            freqOscillator.stop();
            freqOscillator = null;
        }
    });

    randomBtn.addEventListener('click', () => {
        const randomFreq = Math.floor(Math.random() * 19980) + 20;
        freqSlider.value = randomFreq;
        freqInput.value = randomFreq;
        if (freqOscillator) {
            freqOscillator.frequency.value = randomFreq;
        }
    });

    waveType.addEventListener('change', () => {
        if (freqOscillator) {
            freqOscillator.type = waveType.value;
        }
    });
}

function visualizeFrequency(ctx, analyser) {
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!freqOscillator) return;
        
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 3;
        ctx.strokeStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    draw();
}

// ==================== BEAT MACHINE ====================
let beatInterval = null;
let currentBeat = 0;
let beatPattern = {
    kick: [],
    snare: [],
    hat: [],
    clap: []
};

function setupBeatMachine() {
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    const patternLength = document.getElementById('pattern-length');
    const patternDisplay = document.getElementById('pattern-display');
    const playBtn = document.getElementById('beat-play');
    const stopBtn = document.getElementById('beat-stop');
    const clearBtn = document.getElementById('beat-clear');
    const randomBtn = document.getElementById('beat-random');

    // Create beat grid
    const beatRows = document.querySelectorAll('.beat-cells');
    const length = parseInt(patternLength.value);
    
    function createBeatGrid() {
        beatRows.forEach(row => {
            row.innerHTML = '';
            const sound = row.dataset.sound;
            beatPattern[sound] = [];
            
            for (let i = 0; i < length; i++) {
                const cell = document.createElement('div');
                cell.className = 'beat-cell';
                cell.dataset.beat = i;
                cell.addEventListener('click', () => {
                    cell.classList.toggle('active');
                    beatPattern[sound][i] = cell.classList.contains('active');
                });
                row.appendChild(cell);
                beatPattern[sound][i] = false;
            }
        });
    }

    createBeatGrid();

    bpmSlider.addEventListener('input', () => {
        bpmDisplay.textContent = bpmSlider.value;
    });

    patternLength.addEventListener('input', () => {
        patternDisplay.textContent = patternLength.value + ' beats';
        createBeatGrid();
    });

    playBtn.addEventListener('click', () => {
        initAudioContext();
        if (beatInterval) return;
        
        const bpm = parseInt(bpmSlider.value);
        const interval = 60000 / bpm;
        currentBeat = 0;

        beatInterval = setInterval(() => {
            playBeat(currentBeat);
            currentBeat = (currentBeat + 1) % parseInt(patternLength.value);
        }, interval);
    });

    stopBtn.addEventListener('click', () => {
        if (beatInterval) {
            clearInterval(beatInterval);
            beatInterval = null;
        }
        document.querySelectorAll('.beat-cell').forEach(cell => {
            cell.classList.remove('playing');
        });
    });

    clearBtn.addEventListener('click', () => {
        document.querySelectorAll('.beat-cell').forEach(cell => {
            cell.classList.remove('active');
        });
        Object.keys(beatPattern).forEach(sound => {
            beatPattern[sound].fill(false);
        });
    });

    randomBtn.addEventListener('click', () => {
        document.querySelectorAll('.beat-cell').forEach(cell => {
            const isActive = Math.random() > 0.7;
            cell.classList.toggle('active', isActive);
            const sound = cell.parentElement.dataset.sound;
            const beat = parseInt(cell.dataset.beat);
            beatPattern[sound][beat] = isActive;
        });
    });
}

function playBeat(beatNum) {
    // Remove previous playing indicators
    document.querySelectorAll('.beat-cell').forEach(cell => {
        cell.classList.remove('playing');
    });

    // Highlight current beat
    document.querySelectorAll(`.beat-cell[data-beat="${beatNum}"]`).forEach(cell => {
        cell.classList.add('playing');
        if (cell.classList.contains('active')) {
            const sound = cell.parentElement.dataset.sound;
            playDrumSound(sound);
        }
    });
}

function playDrumSound(sound) {
    initAudioContext();
    const now = audioContext.currentTime;
    
    if (sound === 'kick') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (sound === 'snare') {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
    } else if (sound === 'hat') {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
    } else if (sound === 'clap') {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        noise.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
    }
}

// ==================== KEYBOARD SYNTH ====================
const noteFrequencies = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

let activeOscillators = {};

function setupKeyboard() {
    const keyboard = document.querySelector('.piano-keyboard');
    const octaveSlider = document.getElementById('octave');
    const octaveDisplay = document.getElementById('octave-display');
    const attackSlider = document.getElementById('attack');
    const attackDisplay = document.getElementById('attack-display');
    const releaseSlider = document.getElementById('release');
    const releaseDisplay = document.getElementById('release-display');
    const synthType = document.getElementById('synth-type');
    const canvas = document.getElementById('keyboard-visualizer');
    const ctx = canvas.getContext('2d');

    octaveSlider.addEventListener('input', () => {
        octaveDisplay.textContent = octaveSlider.value;
    });

    attackSlider.addEventListener('input', () => {
        attackDisplay.textContent = attackSlider.value + 'ms';
    });

    releaseSlider.addEventListener('input', () => {
        releaseDisplay.textContent = releaseSlider.value + 'ms';
    });

    // Create piano keys
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyMap = {
        'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
        't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B',
        'k': 'C', 'o': 'C#', 'l': 'D', 'p': 'D#'
    };

    keyboard.innerHTML = '';
    notes.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = note.includes('#') ? 'piano-key black' : 'piano-key white';
        key.dataset.note = note;
        
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = note;
        key.appendChild(label);

        if (note.includes('#')) {
            key.style.left = `${(index - 0.3) * 50}px`;
        }

        key.addEventListener('mousedown', () => playNote(note));
        key.addEventListener('mouseup', () => stopNote(note));
        key.addEventListener('mouseleave', () => stopNote(note));

        keyboard.appendChild(key);
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        const note = keyMap[e.key.toLowerCase()];
        if (note && !activeOscillators[note]) {
            playNote(note);
            const key = keyboard.querySelector(`[data-note="${note}"]`);
            if (key) key.classList.add('active');
        }
    });

    document.addEventListener('keyup', (e) => {
        const note = keyMap[e.key.toLowerCase()];
        if (note) {
            stopNote(note);
            const key = keyboard.querySelector(`[data-note="${note}"]`);
            if (key) key.classList.remove('active');
        }
    });

    function playNote(note) {
        initAudioContext();
        if (activeOscillators[note]) return;

        const octave = parseInt(octaveSlider.value);
        const freq = noteFrequencies[note] * Math.pow(2, octave - 4);
        const attack = parseInt(attackSlider.value) / 1000;
        const now = audioContext.currentTime;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = synthType.value;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + attack);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        activeOscillators[note] = { osc, gain };

        const key = keyboard.querySelector(`[data-note="${note}"]`);
        if (key) key.classList.add('active');
    }

    function stopNote(note) {
        if (!activeOscillators[note]) return;

        const release = parseInt(releaseSlider.value) / 1000;
        const now = audioContext.currentTime;
        const { osc, gain } = activeOscillators[note];

        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + release);
        osc.stop(now + release);

        delete activeOscillators[note];

        const key = keyboard.querySelector(`[data-note="${note}"]`);
        if (key) key.classList.remove('active');
    }
}

// ==================== SOUNDBOARD ====================
function setupSoundboard() {
    const soundButtons = document.querySelectorAll('.sound-btn');
    const volumeSlider = document.getElementById('soundboard-volume');
    const volumeDisplay = document.getElementById('sb-vol-display');

    volumeSlider.addEventListener('input', () => {
        volumeDisplay.textContent = volumeSlider.value + '%';
    });

    soundButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            initAudioContext();
            const sound = btn.dataset.sound;
            playSoundEffect(sound, volumeSlider.value / 100);
            btn.classList.add('playing');
            setTimeout(() => btn.classList.remove('playing'), 500);
        });
    });
}

function playSoundEffect(sound, volume) {
    const now = audioContext.currentTime;
    const duration = 0.5;

    if (sound === 'airhorn') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.value = 400;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + duration);
    } else if (sound === 'explosion') {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        noise.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
    } else if (sound === 'laser') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (sound === 'ding') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (sound === 'boing') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    } else {
        // Generic beep for other sounds
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.value = 500 + Math.random() * 500;
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// ==================== AUDIO MIXER ====================
let audioTracks = [];

function setupMixer() {
    const fileInput = document.getElementById('audio-upload');
    const tracksContainer = document.getElementById('tracks-container');
    const playAllBtn = document.getElementById('play-all');
    const stopAllBtn = document.getElementById('stop-all');
    const clearBtn = document.getElementById('clear-tracks');

    fileInput.addEventListener('change', (e) => {
        initAudioContext();
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                audioContext.decodeAudioData(event.target.result, (buffer) => {
                    addTrack(file.name, buffer);
                });
            };
            reader.readAsArrayBuffer(file);
        });
    });

    playAllBtn.addEventListener('click', () => {
        audioTracks.forEach(track => track.play());
    });

    stopAllBtn.addEventListener('click', () => {
        audioTracks.forEach(track => track.stop());
    });

    clearBtn.addEventListener('click', () => {
        audioTracks.forEach(track => track.stop());
        audioTracks = [];
        tracksContainer.innerHTML = '';
    });
}

function addTrack(name, buffer) {
    const tracksContainer = document.getElementById('tracks-container');
    
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track';
    
    const header = document.createElement('div');
    header.className = 'track-header';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'track-name';
    nameDiv.textContent = name;
    
    const controls = document.createElement('div');
    controls.className = 'track-controls';
    
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = 0;
    volumeSlider.max = 100;
    volumeSlider.value = 70;
    volumeSlider.style.width = '100px';
    
    const playBtn = document.createElement('button');
    playBtn.textContent = '▶️';
    
    const stopBtn = document.createElement('button');
    stopBtn.textContent = '⏹️';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    
    const progressDiv = document.createElement('div');
    progressDiv.className = 'track-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'track-progress-bar';
    progressDiv.appendChild(progressBar);
    
    const track = {
        buffer: buffer,
        source: null,
        gainNode: null,
        isPlaying: false,
        startTime: 0,
        pauseTime: 0,
        play: function() {
            if (this.isPlaying) return;
            
            this.source = audioContext.createBufferSource();
            this.gainNode = audioContext.createGain();
            
            this.source.buffer = this.buffer;
            this.gainNode.gain.value = volumeSlider.value / 100;
            
            this.source.connect(this.gainNode);
            this.gainNode.connect(masterGain);
            
            this.startTime = audioContext.currentTime - this.pauseTime;
            this.source.start(0, this.pauseTime);
            this.isPlaying = true;
            
            updateProgress();
        },
        stop: function() {
            if (!this.isPlaying || !this.source) return;
            
            this.source.stop();
            this.isPlaying = false;
            this.pauseTime = 0;
            progressBar.style.width = '0%';
        }
    };
    
    function updateProgress() {
        if (!track.isPlaying) return;
        
        const elapsed = audioContext.currentTime - track.startTime;
        const progress = (elapsed / track.buffer.duration) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';
        
        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            track.isPlaying = false;
            track.pauseTime = 0;
            progressBar.style.width = '0%';
        }
    }
    
    playBtn.addEventListener('click', () => track.play());
    stopBtn.addEventListener('click', () => track.stop());
    deleteBtn.addEventListener('click', () => {
        track.stop();
        trackDiv.remove();
        audioTracks = audioTracks.filter(t => t !== track);
    });
    
    volumeSlider.addEventListener('input', () => {
        if (track.gainNode) {
            track.gainNode.gain.value = volumeSlider.value / 100;
        }
    });
    
    controls.appendChild(volumeSlider);
    controls.appendChild(playBtn);
    controls.appendChild(stopBtn);
    controls.appendChild(deleteBtn);
    header.appendChild(nameDiv);
    header.appendChild(controls);
    trackDiv.appendChild(header);
    trackDiv.appendChild(progressDiv);
    tracksContainer.appendChild(trackDiv);
    
    audioTracks.push(track);
}

// ==================== NOISE GENERATOR ====================
let noiseSource = null;
let noiseGain = null;

function setupNoiseGenerator() {
    const noiseBtns = document.querySelectorAll('.noise-btn');
    const stopBtn = document.getElementById('noise-stop');
    const volumeSlider = document.getElementById('noise-volume');
    const volumeDisplay = document.getElementById('noise-vol-display');

    volumeSlider.addEventListener('input', () => {
        volumeDisplay.textContent = volumeSlider.value + '%';
        if (noiseGain) {
            noiseGain.gain.value = volumeSlider.value / 100;
        }
    });

    noiseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            initAudioContext();
            stopNoise();
            
            const noiseType = btn.dataset.noise;
            playNoise(noiseType, volumeSlider.value / 100);
            
            noiseBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    stopBtn.addEventListener('click', () => {
        stopNoise();
        noiseBtns.forEach(b => b.classList.remove('active'));
    });
}

function playNoise(type, volume) {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11;
            b6 = white * 0.115926;
        }
    } else if (type === 'brown') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }
    } else if (type === 'radio') {
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
            if (Math.random() > 0.98) {
                data[i] *= Math.random() * 5;
            }
        }
    }

    noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    noiseGain = audioContext.createGain();
    noiseGain.gain.value = volume;

    noiseSource.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();
}

function stopNoise() {
    if (noiseSource) {
        noiseSource.stop();
        noiseSource = null;
        noiseGain = null;
    }
}

// ==================== METRONOME ====================
let metronomeInterval = null;
let metroBeat = 0;
let tapTimes = [];

function setupMetronome() {
    const bpmSlider = document.getElementById('metro-bpm');
    const bpmDisplay = document.getElementById('metro-bpm-display');
    const beatsSlider = document.getElementById('metro-beats');
    const beatsDisplay = document.getElementById('metro-beats-display');
    const volumeSlider = document.getElementById('metro-volume');
    const volumeDisplay = document.getElementById('metro-vol-display');
    const startBtn = document.getElementById('metro-start');
    const stopBtn = document.getElementById('metro-stop');
    const tapBtn = document.getElementById('metro-tap');
    const visual = document.getElementById('metro-visual');

    bpmSlider.addEventListener('input', () => {
        bpmDisplay.textContent = bpmSlider.value;
    });

    beatsSlider.addEventListener('input', () => {
        beatsDisplay.textContent = beatsSlider.value;
        createMetroVisual();
    });

    volumeSlider.addEventListener('input', () => {
        volumeDisplay.textContent = volumeSlider.value + '%';
    });

    function createMetroVisual() {
        visual.innerHTML = '';
        const beats = parseInt(beatsSlider.value);
        for (let i = 0; i < beats; i++) {
            const beat = document.createElement('div');
            beat.className = 'metro-beat';
            if (i === 0) beat.classList.add('accent');
            beat.dataset.beat = i;
            visual.appendChild(beat);
        }
    }

    createMetroVisual();

    startBtn.addEventListener('click', () => {
        initAudioContext();
        if (metronomeInterval) return;

        const bpm = parseInt(bpmSlider.value);
        const interval = 60000 / bpm;
        const beats = parseInt(beatsSlider.value);
        metroBeat = 0;

        metronomeInterval = setInterval(() => {
            playMetroClick(metroBeat === 0, volumeSlider.value / 100);
            
            document.querySelectorAll('.metro-beat').forEach(b => {
                b.classList.remove('active');
            });
            document.querySelector(`.metro-beat[data-beat="${metroBeat}"]`).classList.add('active');
            
            metroBeat = (metroBeat + 1) % beats;
        }, interval);
    });

    stopBtn.addEventListener('click', () => {
        if (metronomeInterval) {
            clearInterval(metronomeInterval);
            metronomeInterval = null;
        }
        document.querySelectorAll('.metro-beat').forEach(b => {
            b.classList.remove('active');
        });
    });

    tapBtn.addEventListener('click', () => {
        const now = Date.now();
        tapTimes.push(now);
        
        if (tapTimes.length > 8) tapTimes.shift();
        
        if (tapTimes.length >= 2) {
            const intervals = [];
            for (let i = 1; i < tapTimes.length; i++) {
                intervals.push(tapTimes[i] - tapTimes[i-1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            const bpm = Math.round(60000 / avgInterval);
            bpmSlider.value = Math.max(30, Math.min(300, bpm));
            bpmDisplay.textContent = bpmSlider.value;
        }
    });
}

function playMetroClick(isAccent, volume) {
    initAudioContext();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.frequency.value = isAccent ? 1000 : 800;
    gain.gain.setValueAtTime(volume * (isAccent ? 0.7 : 0.5), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
}

// ==================== SECTION COLLAPSE ====================
function setupCollapse() {
    document.querySelectorAll('.section-header').forEach(header => {
        const btn = header.querySelector('.collapse-btn');
        const content = header.nextElementSibling;
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            content.classList.toggle('collapsed');
            btn.textContent = content.classList.contains('collapsed') ? '[+]' : '[-]';
        });
    });
}

// ==================== MASTER CONTROLS ====================
function setupMasterControls() {
    const volumeSlider = document.getElementById('master-volume');
    const volumeDisplay = document.getElementById('master-vol-display');
    const panicBtn = document.getElementById('panic-button');
    const chaosBtn = document.getElementById('chaos-all');

    volumeSlider.addEventListener('input', () => {
        volumeDisplay.textContent = volumeSlider.value + '%';
        if (masterGain) {
            masterGain.gain.value = volumeSlider.value / 100;
        }
    });

    panicBtn.addEventListener('click', () => {
        // Stop everything!
        if (freqOscillator) {
            freqOscillator.stop();
            freqOscillator = null;
        }
        if (beatInterval) {
            clearInterval(beatInterval);
            beatInterval = null;
        }
        if (metronomeInterval) {
            clearInterval(metronomeInterval);
            metronomeInterval = null;
        }
        stopNoise();
        audioTracks.forEach(track => track.stop());
        Object.values(activeOscillators).forEach(({osc}) => osc.stop());
        activeOscillators = {};
        
        document.querySelectorAll('.active, .playing').forEach(el => {
            el.classList.remove('active', 'playing');
        });
    });

    chaosBtn.addEventListener('click', () => {
        initAudioContext();
        // Start random chaos
        document.getElementById('freq-random').click();
        document.getElementById('freq-play').click();
        document.getElementById('beat-random').click();
        document.getElementById('beat-play').click();
        
        setTimeout(() => {
            document.querySelector('.noise-btn[data-noise="white"]').click();
        }, 500);
    });
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupFrequencyGenerator();
    setupBeatMachine();
    setupKeyboard();
    setupSoundboard();
    setupMixer();
    setupNoiseGenerator();
    setupMetronome();
    setupCollapse();
    setupMasterControls();
});