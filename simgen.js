// ===== GLOBAL STATE =====
let currentSimulator = null;
let animationId = null;
let isPaused = false;
let canvas, ctx;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeBackgroundParticles();
    initializePreviewCanvases();
    setupEventListeners();
});

// ===== BACKGROUND PARTICLES =====
function initializeBackgroundParticles() {
    const container = document.getElementById('bg-particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        container.appendChild(particle);
    }
}

// Add float animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
        50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
        75% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
    }
`;
document.head.appendChild(style);

// ===== PREVIEW CANVASES =====
function initializePreviewCanvases() {
    const previews = document.querySelectorAll('.preview-canvas');
    previews.forEach((canvas, index) => {
        const ctx = canvas.getContext('2d');
        const simType = canvas.closest('.sim-card').dataset.sim;
        renderPreview(ctx, simType, canvas.width, canvas.height);
    });
}

function renderPreview(ctx, type, width, height) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    switch(type) {
        case 'particles':
            for (let i = 0; i < 30; i++) {
                ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'fire':
            for (let i = 0; i < 50; i++) {
                const gradient = ctx.createRadialGradient(
                    Math.random() * width, height - Math.random() * height * 0.5,
                    0, Math.random() * width, height, 50
                );
                gradient.addColorStop(0, '#ff0');
                gradient.addColorStop(0.5, '#f80');
                gradient.addColorStop(1, '#f00');
                ctx.fillStyle = gradient;
                ctx.globalAlpha = 0.3;
                ctx.fillRect(0, 0, width, height);
            }
            ctx.globalAlpha = 1;
            break;
        case 'waves':
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            for (let x = 0; x < width; x++) {
                const y = height/2 + Math.sin(x * 0.1) * 30;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
        // Add more preview renders...
        default:
            ctx.fillStyle = '#0f0';
            ctx.font = '12px monospace';
            ctx.fillText('READY', width/2 - 20, height/2);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Activate buttons
    document.querySelectorAll('.activate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.sim-card');
            const simType = card.dataset.sim;
            openSimulator(simType);
        });
    });

    // Modal controls
    document.getElementById('close-modal').addEventListener('click', closeSimulator);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('reset-btn').addEventListener('click', resetSimulator);
    document.getElementById('random-btn').addEventListener('click', randomizeSettings);
    document.getElementById('screenshot-btn').addEventListener('click', takeScreenshot);
}

// ===== SIMULATOR MODAL =====
function openSimulator(type) {
    const modal = document.getElementById('simulator-modal');
    const title = document.getElementById('modal-title');
    
    modal.classList.remove('hidden');
    title.textContent = type.toUpperCase() + ' SIMULATOR';
    
    canvas = document.getElementById('main-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Initialize the selected simulator
    initSimulator(type);
}

function closeSimulator() {
    document.getElementById('simulator-modal').classList.add('hidden');
    if (animationId) cancelAnimationFrame(animationId);
    currentSimulator = null;
    isPaused = false;
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? '▶️ PLAY' : '⏸️ PAUSE';
}

function resetSimulator() {
    if (currentSimulator && currentSimulator.reset) {
        currentSimulator.reset();
    }
}

function randomizeSettings() {
    if (currentSimulator && currentSimulator.randomize) {
        currentSimulator.randomize();
    }
}

function takeScreenshot() {
    const link = document.createElement('a');
    link.download = `bozone-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// ===== SIMULATOR FACTORY =====
function initSimulator(type) {
    if (animationId) cancelAnimationFrame(animationId);
    
    const simulators = {
        particles: ParticleSimulator,
        fire: FireSimulator,
        waves: WaveSimulator,
        fractal: FractalSimulator,
        kaleidoscope: KaleidoscopeSimulator,
        galaxy: GalaxySimulator,
        maze: MazeSimulator,
        lightning: LightningSimulator,
        cells: CellsSimulator,
        civilization: CivilizationSimulator,
        fluid: FluidSimulator,
        gravity: GravitySimulator,
        mandelbrot: MandelbrotSimulator,
        lava: LavaLampSimulator,
        matrix: MatrixSimulator,
        terrain: TerrainSimulator
    };
    
    if (simulators[type]) {
        currentSimulator = new simulators[type](canvas, ctx);
        currentSimulator.init();
        animate();
    }
}

function animate() {
    if (!isPaused && currentSimulator && currentSimulator.update) {
        currentSimulator.update();
    }
    if (currentSimulator && currentSimulator.render) {
        currentSimulator.render();
    }
    
    // Update stats
    updateStats();
    
    animationId = requestAnimationFrame(animate);
}

function updateStats() {
    const fps = Math.round(1000 / 16.67);
    document.getElementById('fps-counter').textContent = `FPS: ${fps}`;
    
    if (currentSimulator && currentSimulator.getStats) {
        const stats = currentSimulator.getStats();
        document.getElementById('particle-count').textContent = stats.count || '';
        document.getElementById('custom-stat').textContent = stats.custom || '';
    }
}

// ===== UTILITY FUNCTIONS =====
function createControls(controls) {
    const container = document.getElementById('dynamic-controls');
    container.innerHTML = '';
    
    controls.forEach(control => {
        const group = document.createElement('div');
        group.className = 'control-group';
        
        const label = document.createElement('label');
        label.textContent = control.label;
        group.appendChild(label);
        
        if (control.type === 'range') {
            const input = document.createElement('input');
            input.type = 'range';
            input.min = control.min;
            input.max = control.max;
            input.value = control.value;
            input.step = control.step || 1;
            
            const display = document.createElement('span');
            display.className = 'value-display';
            display.textContent = control.value;
            
            input.addEventListener('input', (e) => {
                display.textContent = e.target.value;
                if (control.onChange) control.onChange(parseFloat(e.target.value));
            });
            
            group.appendChild(input);
            group.appendChild(display);
        } else if (control.type === 'checkbox') {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = control.value;
            input.addEventListener('change', (e) => {
                if (control.onChange) control.onChange(e.target.checked);
            });
            group.appendChild(input);
        } else if (control.type === 'color') {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = control.value;
            input.addEventListener('input', (e) => {
                if (control.onChange) control.onChange(e.target.value);
            });
            group.appendChild(input);
        } else if (control.type === 'select') {
            const select = document.createElement('select');
            control.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });
            select.value = control.value;
            select.addEventListener('change', (e) => {
                if (control.onChange) control.onChange(e.target.value);
            });
            group.appendChild(select);
        }
        
        container.appendChild(group);
    });
}

// ===== PARTICLE SIMULATOR =====
class ParticleSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.settings = {
            count: 200,
            size: 3,
            speed: 2,
            color: '#00ffff',
            gravity: 0,
            bounce: true,
            trail: true
        };
    }
    
    init() {
        this.createParticles();
        this.setupControls();
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.settings.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.settings.speed,
                vy: (Math.random() - 0.5) * this.settings.speed,
                hue: Math.random() * 360
            });
        }
    }
    
    setupControls() {
        createControls([
            {
                label: 'Particle Count',
                type: 'range',
                min: 10,
                max: 500,
                value: this.settings.count,
                onChange: (v) => {
                    this.settings.count = v;
                    this.createParticles();
                }
            },
            {
                label: 'Size',
                type: 'range',
                min: 1,
                max: 10,
                value: this.settings.size,
                onChange: (v) => this.settings.size = v
            },
            {
                label: 'Speed',
                type: 'range',
                min: 0.5,
                max: 10,
                value: this.settings.speed,
                step: 0.5,
                onChange: (v) => this.settings.speed = v
            },
            {
                label: 'Gravity',
                type: 'range',
                min: -1,
                max: 1,
                value: this.settings.gravity,
                step: 0.1,
                onChange: (v) => this.settings.gravity = v
            },
            {
                label: 'Bounce',
                type: 'checkbox',
                value: this.settings.bounce,
                onChange: (v) => this.settings.bounce = v
            },
            {
                label: 'Trail Effect',
                type: 'checkbox',
                value: this.settings.trail,
                onChange: (v) => this.settings.trail = v
            }
        ]);
    }
    
    update() {
        this.particles.forEach(p => {
            p.vy += this.settings.gravity;
            p.x += p.vx;
            p.y += p.vy;
            
            if (this.settings.bounce) {
                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            } else {
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;
            }
            
            p.hue = (p.hue + 1) % 360;
        });
    }
    
    render() {
        if (this.settings.trail) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.particles.forEach(p => {
            this.ctx.fillStyle = `hsl(${p.hue}, 100%, 50%)`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.settings.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    reset() {
        this.createParticles();
    }
    
    randomize() {
        this.settings.speed = Math.random() * 5 + 1;
        this.settings.gravity = Math.random() * 2 - 1;
        this.createParticles();
    }
    
    getStats() {
        return {
            count: `Particles: ${this.particles.length}`,
            custom: `Speed: ${this.settings.speed.toFixed(1)}`
        };
    }
}

// ===== FIRE SIMULATOR =====
class FireSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.settings = {
            intensity: 50,
            height: 100,
            color1: '#ffff00',
            color2: '#ff0000'
        };
    }
    
    init() {
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Intensity',
                type: 'range',
                min: 10,
                max: 200,
                value: this.settings.intensity,
                onChange: (v) => this.settings.intensity = v
            },
            {
                label: 'Flame Height',
                type: 'range',
                min: 50,
                max: 300,
                value: this.settings.height,
                onChange: (v) => this.settings.height = v
            },
            {
                label: 'Base Color',
                type: 'color',
                value: this.settings.color1,
                onChange: (v) => this.settings.color1 = v
            },
            {
                label: 'Tip Color',
                type: 'color',
                value: this.settings.color2,
                onChange: (v) => this.settings.color2 = v
            }
        ]);
    }
    
    update() {
        // Add new particles
        for (let i = 0; i < this.settings.intensity / 10; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height,
                vy: -Math.random() * 5 - 2,
                vx: (Math.random() - 0.5) * 2,
                life: 1,
                size: Math.random() * 20 + 10
            });
        }
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.size *= 0.98;
            return p.life > 0 && p.y > this.canvas.height - this.settings.height;
        });
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, this.settings.color1);
            gradient.addColorStop(0.5, this.settings.color2);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    reset() {
        this.particles = [];
    }
    
    getStats() {
        return {
            count: `Flames: ${this.particles.length}`,
            custom: `Heat: ${this.settings.intensity}°`
        };
    }
}

// ===== WAVE SIMULATOR =====
class WaveSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.time = 0;
        this.settings = {
            amplitude: 50,
            frequency: 0.02,
            speed: 0.05,
            waves: 3,
            color: '#00ffff'
        };
    }
    
    init() {
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Amplitude',
                type: 'range',
                min: 10,
                max: 200,
                value: this.settings.amplitude,
                onChange: (v) => this.settings.amplitude = v
            },
            {
                label: 'Frequency',
                type: 'range',
                min: 0.001,
                max: 0.1,
                value: this.settings.frequency,
                step: 0.001,
                onChange: (v) => this.settings.frequency = v
            },
            {
                label: 'Speed',
                type: 'range',
                min: 0.01,
                max: 0.2,
                value: this.settings.speed,
                step: 0.01,
                onChange: (v) => this.settings.speed = v
            },
            {
                label: 'Wave Count',
                type: 'range',
                min: 1,
                max: 10,
                value: this.settings.waves,
                onChange: (v) => this.settings.waves = v
            },
            {
                label: 'Color',
                type: 'color',
                value: this.settings.color,
                onChange: (v) => this.settings.color = v
            }
        ]);
    }
    
    update() {
        this.time += this.settings.speed;
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let w = 0; w < this.settings.waves; w++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.settings.color;
            this.ctx.lineWidth = 3;
            
            const offset = w * 50;
            for (let x = 0; x < this.canvas.width; x++) {
                const y = this.canvas.height / 2 + 
                    Math.sin(x * this.settings.frequency + this.time + w) * this.settings.amplitude +
                    Math.sin(x * this.settings.frequency * 2 + this.time * 1.5 + w) * (this.settings.amplitude / 2);
                
                if (x === 0) this.ctx.moveTo(x, y + offset);
                else this.ctx.lineTo(x, y + offset);
            }
            
            this.ctx.globalAlpha = 1 - (w / this.settings.waves) * 0.5;
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    reset() {
        this.time = 0;
    }
    
    getStats() {
        return {
            count: `Waves: ${this.settings.waves}`,
            custom: `Time: ${this.time.toFixed(2)}s`
        };
    }
}

// ===== FRACTAL SIMULATOR (Koch Snowflake) =====
class FractalSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            depth: 4,
            rotation: 0,
            scale: 1,
            color: '#00ff00'
        };
    }
    
    init() {
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Recursion Depth',
                type: 'range',
                min: 1,
                max: 7,
                value: this.settings.depth,
                onChange: (v) => this.settings.depth = v
            },
            {
                label: 'Rotation',
                type: 'range',
                min: 0,
                max: 360,
                value: this.settings.rotation,
                onChange: (v) => this.settings.rotation = v
            },
            {
                label: 'Scale',
                type: 'range',
                min: 0.5,
                max: 2,
                value: this.settings.scale,
                step: 0.1,
                onChange: (v) => this.settings.scale = v
            },
            {
                label: 'Color',
                type: 'color',
                value: this.settings.color,
                onChange: (v) => this.settings.color = v
            }
        ]);
    }
    
    drawKoch(x1, y1, x2, y2, depth) {
        if (depth === 0) {
            this.ctx.lineTo(x2, y2);
            return;
        }
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        const x3 = x1 + dx / 3;
        const y3 = y1 + dy / 3;
        
        const x5 = x1 + 2 * dx / 3;
        const y5 = y1 + 2 * dy / 3;
        
        const x4 = x3 + (x5 - x3) * 0.5 - (y5 - y3) * Math.sqrt(3) / 2;
        const y4 = y3 + (y5 - y3) * 0.5 + (x5 - x3) * Math.sqrt(3) / 2;
        
        this.drawKoch(x1, y1, x3, y3, depth - 1);
        this.drawKoch(x3, y3, x4, y4, depth - 1);
        this.drawKoch(x4, y4, x5, y5, depth - 1);
        this.drawKoch(x5, y5, x2, y2, depth - 1);
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(this.settings.rotation * Math.PI / 180);
        this.ctx.scale(this.settings.scale, this.settings.scale);
        
        const size = 200;
        const height = size * Math.sqrt(3) / 2;
        
        this.ctx.strokeStyle = this.settings.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-size / 2, height / 3);
        
        this.drawKoch(-size / 2, height / 3, size / 2, height / 3, this.settings.depth);
        this.drawKoch(size / 2, height / 3, 0, -2 * height / 3, this.settings.depth);
        this.drawKoch(0, -2 * height / 3, -size / 2, height / 3, this.settings.depth);
        
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    randomize() {
        this.settings.depth = Math.floor(Math.random() * 6) + 1;
        this.settings.rotation = Math.random() * 360;
    }
    
    getStats() {
        return {
            count: `Depth: ${this.settings.depth}`,
            custom: `Segments: ${Math.pow(4, this.settings.depth) * 3}`
        };
    }
}

// ===== KALEIDOSCOPE SIMULATOR =====
class KaleidoscopeSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.time = 0;
        this.settings = {
            segments: 8,
            rotation: 0,
            complexity: 5
        };
    }
    
    init() {
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Segments',
                type: 'range',
                min: 3,
                max: 24,
                value: this.settings.segments,
                onChange: (v) => this.settings.segments = v
            },
            {
                label: 'Rotation Speed',
                type: 'range',
                min: 0,
                max: 5,
                value: this.settings.rotation,
                step: 0.1,
                onChange: (v) => this.settings.rotation = v
            },
            {
                label: 'Complexity',
                type: 'range',
                min: 1,
                max: 10,
                value: this.settings.complexity,
                onChange: (v) => this.settings.complexity = v
            }
        ]);
    }
    
    update() {
        this.time += this.settings.rotation * 0.01;
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        const angle = (Math.PI * 2) / this.settings.segments;
        
        for (let i = 0; i < this.settings.segments; i++) {
            this.ctx.save();
            this.ctx.rotate(angle * i + this.time);
            
            for (let j = 0; j < this.settings.complexity; j++) {
                const radius = 50 + j * 30;
                const x = Math.cos(this.time * (j + 1)) * radius;
                const y = Math.sin(this.time * (j + 1) * 1.3) * radius;
                
                this.ctx.fillStyle = `hsl(${(this.time * 100 + j * 36) % 360}, 100%, 50%)`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    reset() {
        this.time = 0;
    }
    
    getStats() {
        return {
            count: `Segments: ${this.settings.segments}`,
            custom: `Angle: ${(this.time * 180 / Math.PI).toFixed(1)}°`
        };
    }
}

// ===== GALAXY SIMULATOR =====
class GalaxySimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.stars = [];
        this.settings = {
            starCount: 500,
            arms: 3,
            rotation: 0.5,
            spread: 100
        };
    }
    
    init() {
        this.createGalaxy();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Star Count',
                type: 'range',
                min: 100,
                max: 2000,
                value: this.settings.starCount,
                onChange: (v) => {
                    this.settings.starCount = v;
                    this.createGalaxy();
                }
            },
            {
                label: 'Spiral Arms',
                type: 'range',
                min: 2,
                max: 8,
                value: this.settings.arms,
                onChange: (v) => {
                    this.settings.arms = v;
                    this.createGalaxy();
                }
            },
            {
                label: 'Rotation Speed',
                type: 'range',
                min: 0,
                max: 2,
                value: this.settings.rotation,
                step: 0.1,
                onChange: (v) => this.settings.rotation = v
            },
            {
                label: 'Spread',
                type: 'range',
                min: 50,
                max: 300,
                value: this.settings.spread,
                onChange: (v) => {
                    this.settings.spread = v;
                    this.createGalaxy();
                }
            }
        ]);
    }
    
    createGalaxy() {
        this.stars = [];
        for (let i = 0; i < this.settings.starCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const armOffset = Math.floor(Math.random() * this.settings.arms) * (Math.PI * 2 / this.settings.arms);
            const distance = Math.random() * this.settings.spread;
            const spread = (Math.random() - 0.5) * 20;
            
            this.stars.push({
                baseAngle: angle + armOffset,
                distance: distance,
                spread: spread,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random()
            });
        }
    }
    
    update() {
        this.stars.forEach(star => {
            star.baseAngle += this.settings.rotation * 0.001 * (1 / (star.distance + 1));
        });
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.stars.forEach(star => {
            const angle = star.baseAngle + (star.distance * 0.01);
            const x = centerX + Math.cos(angle) * star.distance + star.spread;
            const y = centerY + Math.sin(angle) * star.distance + star.spread;
            
            const hue = 200 + star.distance / this.settings.spread * 60;
            this.ctx.fillStyle = `hsla(${hue}, 100%, ${50 + star.brightness * 50}%, ${star.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw core
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(centerX - 30, centerY - 30, 60, 60);
    }
    
    reset() {
        this.createGalaxy();
    }
    
    getStats() {
        return {
            count: `Stars: ${this.stars.length}`,
            custom: `Arms: ${this.settings.arms}`
        };
    }
}

// ===== MAZE GENERATOR =====
class MazeSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            cols: 30,
            rows: 20,
            solve: false
        };
        this.grid = [];
        this.solution = [];
    }
    
    init() {
        this.generateMaze();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Columns',
                type: 'range',
                min: 10,
                max: 50,
                value: this.settings.cols,
                onChange: (v) => {
                    this.settings.cols = v;
                    this.generateMaze();
                }
            },
            {
                label: 'Rows',
                type: 'range',
                min: 10,
                max: 50,
                value: this.settings.rows,
                onChange: (v) => {
                    this.settings.rows = v;
                    this.generateMaze();
                }
            },
            {
                label: 'Show Solution',
                type: 'checkbox',
                value: this.settings.solve,
                onChange: (v) => {
                    this.settings.solve = v;
                    if (v) this.solveMaze();
                }
            }
        ]);
    }
    
    generateMaze() {
        this.grid = [];
        for (let y = 0; y < this.settings.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.settings.cols; x++) {
                this.grid[y][x] = {
                    walls: { top: true, right: true, bottom: true, left: true },
                    visited: false
                };
            }
        }
        
        // Recursive backtracking
        const stack = [];
        let current = { x: 0, y: 0 };
        this.grid[0][0].visited = true;
        
        while (true) {
            const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
            
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                stack.push(current);
                this.removeWalls(current, next);
                this.grid[next.y][next.x].visited = true;
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                break;
            }
        }
    }
    
    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const dirs = [
            { x: 0, y: -1 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        
        dirs.forEach(dir => {
            const nx = x + dir.x;
            const ny = y + dir.y;
            if (nx >= 0 && nx < this.settings.cols && ny >= 0 && ny < this.settings.rows) {
                if (!this.grid[ny][nx].visited) {
                    neighbors.push({ x: nx, y: ny });
                }
            }
        });
        
        return neighbors;
    }
    
    removeWalls(current, next) {
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        
        if (dx === 1) {
            this.grid[current.y][current.x].walls.right = false;
            this.grid[next.y][next.x].walls.left = false;
        } else if (dx === -1) {
            this.grid[current.y][current.x].walls.left = false;
            this.grid[next.y][next.x].walls.right = false;
        } else if (dy === 1) {
            this.grid[current.y][current.x].walls.bottom = false;
            this.grid[next.y][next.x].walls.top = false;
        } else if (dy === -1) {
            this.grid[current.y][current.x].walls.top = false;
            this.grid[next.y][next.x].walls.bottom = false;
        }
    }
    
    solveMaze() {
        // Simple BFS pathfinding
        this.solution = [];
        const queue = [{ x: 0, y: 0, path: [{ x: 0, y: 0 }] }];
        const visited = new Set(['0,0']);
        
        while (queue.length > 0) {
            const { x, y, path } = queue.shift();
            
            if (x === this.settings.cols - 1 && y === this.settings.rows - 1) {
                this.solution = path;
                break;
            }
            
            const cell = this.grid[y][x];
            const moves = [
                { dx: 0, dy: -1, wall: 'top' },
                { dx: 1, dy: 0, wall: 'right' },
                { dx: 0, dy: 1, wall: 'bottom' },
                { dx: -1, dy: 0, wall: 'left' }
            ];
            
            moves.forEach(move => {
                if (!cell.walls[move.wall]) {
                    const nx = x + move.dx;
                    const ny = y + move.dy;
                    const key = `${nx},${ny}`;
                    
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({
                            x: nx,
                            y: ny,
                            path: [...path, { x: nx, y: ny }]
                        });
                    }
                }
            });
        }
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cellWidth = this.canvas.width / this.settings.cols;
        const cellHeight = this.canvas.height / this.settings.rows;
        
        // Draw solution path
        if (this.settings.solve && this.solution.length > 0) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = cellWidth * 0.3;
            this.ctx.beginPath();
            this.solution.forEach((pos, i) => {
                const x = pos.x * cellWidth + cellWidth / 2;
                const y = pos.y * cellHeight + cellHeight / 2;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            });
            this.ctx.stroke();
        }
        
        // Draw maze walls
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        for (let y = 0; y < this.settings.rows; y++) {
            for (let x = 0; x < this.settings.cols; x++) {
                const cell = this.grid[y][x];
                const px = x * cellWidth;
                const py = y * cellHeight;
                
                this.ctx.beginPath();
                if (cell.walls.top) {
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px + cellWidth, py);
                }
                if (cell.walls.right) {
                    this.ctx.moveTo(px + cellWidth, py);
                    this.ctx.lineTo(px + cellWidth, py + cellHeight);
                }
                if (cell.walls.bottom) {
                    this.ctx.moveTo(px, py + cellHeight);
                    this.ctx.lineTo(px + cellWidth, py + cellHeight);
                }
                if (cell.walls.left) {
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px, py + cellHeight);
                }
                this.ctx.stroke();
            }
        }
        
        // Draw start and end
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(2, 2, cellWidth - 4, cellHeight - 4);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            (this.settings.cols - 1) * cellWidth + 2,
            (this.settings.rows - 1) * cellHeight + 2,
            cellWidth - 4,
            cellHeight - 4
        );
    }
    
    reset() {
        this.generateMaze();
        this.solution = [];
    }
    
    randomize() {
        this.settings.cols = Math.floor(Math.random() * 30) + 15;
        this.settings.rows = Math.floor(Math.random() * 30) + 15;
        this.generateMaze();
    }
    
    getStats() {
        return {
            count: `Size: ${this.settings.cols}x${this.settings.rows}`,
            custom: this.solution.length > 0 ? `Steps: ${this.solution.length}` : ''
        };
    }
}

// ===== LIGHTNING SIMULATOR =====
class LightningSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bolts = [];
        this.settings = {
            frequency: 30,
            branches: 3,
            segments: 50,
            color: '#00ffff'
        };
        this.frameCount = 0;
    }
    
    init() {
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Strike Frequency',
                type: 'range',
                min: 10,
                max: 100,
                value: this.settings.frequency,
                onChange: (v) => this.settings.frequency = v
            },
            {
                label: 'Branches',
                type: 'range',
                min: 0,
                max: 10,
                value: this.settings.branches,
                onChange: (v) => this.settings.branches = v
            },
            {
                label: 'Segments',
                type: 'range',
                min: 20,
                max: 100,
                value: this.settings.segments,
                onChange: (v) => this.settings.segments = v
            },
            {
                label: 'Color',
                type: 'color',
                value: this.settings.color,
                onChange: (v) => this.settings.color = v
            }
        ]);
    }
    
    createBolt(startX, startY, endX, endY, segments) {
        const points = [{ x: startX, y: startY }];
        
        for (let i = 1; i < segments; i++) {
            const progress = i / segments;
            const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 50;
            const y = startY + (endY - startY) * progress;
            points.push({ x, y });
        }
        
        points.push({ x: endX, y: endY });
        
        const bolt = { points, life: 1, branches: [] };
        
        // Create branches
        for (let b = 0; b < this.settings.branches; b++) {
            const branchPoint = Math.floor(Math.random() * (points.length - 2)) + 1;
            const start = points[branchPoint];
            const branch = this.createBolt(
                start.x, start.y,
                start.x + (Math.random() - 0.5) * 200,
                start.y + Math.random() * 200,
                Math.floor(segments / 2)
            );
            bolt.branches.push(branch);
        }
        
        return bolt;
    }
    
    update() {
        this.frameCount++;
        
        // Create new bolts
        if (Math.random() * 100 < this.settings.frequency) {
            const startX = Math.random() * this.canvas.width;
            const endX = startX + (Math.random() - 0.5) * 100;
            this.bolts.push(this.createBolt(startX, 0, endX, this.canvas.height, this.settings.segments));
        }
        
        // Update bolts
        this.bolts = this.bolts.filter(bolt => {
            bolt.life -= 0.05;
            return bolt.life > 0;
        });
    }
    
    drawBolt(bolt) {
        this.ctx.globalAlpha = bolt.life;
        this.ctx.strokeStyle = this.settings.color;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.settings.color;
        
        this.ctx.beginPath();
        bolt.points.forEach((point, i) => {
            if (i === 0) this.ctx.moveTo(point.x, point.y);
            else this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.stroke();
        
        // Draw branches
        bolt.branches.forEach(branch => this.drawBolt(branch));
        
        this.ctx.shadowBlur = 0;
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bolts.forEach(bolt => this.drawBolt(bolt));
        this.ctx.globalAlpha = 1;
    }
    
    reset() {
        this.bolts = [];
    }
    
    getStats() {
        return {
            count: `Active Bolts: ${this.bolts.length}`,
            custom: `Frame: ${this.frameCount}`
        };
    }
}

// ===== CONWAY'S GAME OF LIFE =====
class CellsSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            cols: 100,
            rows: 70,
            speed: 10
        };
        this.grid = [];
        this.generation = 0;
        this.frameCount = 0;
    }
    
    init() {
        this.initializeGrid();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Grid Size',
                type: 'range',
                min: 30,
                max: 150,
                value: this.settings.cols,
                onChange: (v) => {
                    this.settings.cols = v;
                    this.settings.rows = Math.floor(v * 0.7);
                    this.initializeGrid();
                }
            },
            {
                label: 'Update Speed',
                type: 'range',
                min: 1,
                max: 30,
                value: this.settings.speed,
                onChange: (v) => this.settings.speed = v
            }
        ]);
    }
    
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.settings.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.settings.cols; x++) {
                this.grid[y][x] = Math.random() > 0.7 ? 1 : 0;
            }
        }
        this.generation = 0;
    }
    
    update() {
        this.frameCount++;
        if (this.frameCount % (30 - this.settings.speed) !== 0) return;
        
        const newGrid = [];
        for (let y = 0; y < this.settings.rows; y++) {
            newGrid[y] = [];
            for (let x = 0; x < this.settings.cols; x++) {
                const neighbors = this.countNeighbors(x, y);
                const cell = this.grid[y][x];
                
                if (cell === 1 && (neighbors === 2 || neighbors === 3)) {
                    newGrid[y][x] = 1;
                } else if (cell === 0 && neighbors === 3) {
                    newGrid[y][x] = 1;
                } else {
                    newGrid[y][x] = 0;
                }
            }
        }
        this.grid = newGrid;
        this.generation++;
    }
    
    countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = (x + dx + this.settings.cols) % this.settings.cols;
                const ny = (y + dy + this.settings.rows) % this.settings.rows;
                count += this.grid[ny][nx];
            }
        }
        return count;
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cellWidth = this.canvas.width / this.settings.cols;
        const cellHeight = this.canvas.height / this.settings.rows;
        
        for (let y = 0; y < this.settings.rows; y++) {
            for (let x = 0; x < this.settings.cols; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = '#00ff00';
                    this.ctx.fillRect(
                        x * cellWidth,
                        y * cellHeight,
                        cellWidth - 1,
                        cellHeight - 1
                    );
                }
            }
        }
    }
    
    reset() {
        this.initializeGrid();
    }
    
    randomize() {
        this.initializeGrid();
    }
    
    getStats() {
        const alive = this.grid.flat().filter(c => c === 1).length;
        return {
            count: `Generation: ${this.generation}`,
            custom: `Alive: ${alive}`
        };
    }
}

// ===== CIVILIZATION SIMULATOR =====
class CivilizationSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            cities: 10,
            growthRate: 1
        };
        this.cities = [];
        this.year = 0;
    }
    
    init() {
        this.createCivilizations();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Cities',
                type: 'range',
                min: 5,
                max: 30,
                value: this.settings.cities,
                onChange: (v) => {
                    this.settings.cities = v;
                    this.createCivilizations();
                }
            },
            {
                label: 'Growth Rate',
                type: 'range',
                min: 0.5,
                max: 5,
                value: this.settings.growthRate,
                step: 0.5,
                onChange: (v) => this.settings.growthRate = v
            }
        ]);
    }
    
    createCivilizations() {
        this.cities = [];
        for (let i = 0; i < this.settings.cities; i++) {
            this.cities.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                population: Math.random() * 50 + 10,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                resources: Math.random() * 100
            });
        }
        this.year = 0;
    }
    
    update() {
        this.year++;
        
        this.cities.forEach(city => {
            // Population growth
            city.population += (Math.random() * this.settings.growthRate);
            city.population = Math.max(1, city.population);
            
            // Resource gathering
            city.resources += city.population * 0.1;
            
            // Trade with nearby cities
            this.cities.forEach(other => {
                if (other !== city) {
                    const dist = Math.hypot(city.x - other.x, city.y - other.y);
                    if (dist < 150) {
                        const trade = 0.01;
                        city.resources += trade;
                        other.resources += trade;
                    }
                }
            });
        });
    }
    
    render() {
        this.ctx.fillStyle = '#001a00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw trade routes
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
        this.ctx.lineWidth = 1;
        this.cities.forEach(city => {
            this.cities.forEach(other => {
                if (other !== city) {
                    const dist = Math.hypot(city.x - other.x, city.y - other.y);
                    if (dist < 150) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(city.x, city.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.stroke();
                    }
                }
            });
        });
        
        // Draw cities
        this.cities.forEach(city => {
            const radius = Math.sqrt(city.population) * 2;
            
            // City glow
            const gradient = this.ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, radius * 2);
            gradient.addColorStop(0, city.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(city.x - radius * 2, city.y - radius * 2, radius * 4, radius * 4);
            
            // City center
            this.ctx.fillStyle = city.color;
            this.ctx.beginPath();
            this.ctx.arc(city.x, city.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Population text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(Math.floor(city.population), city.x - 10, city.y - radius - 5);
        });
    }
    
    reset() {
        this.createCivilizations();
    }
    
    randomize() {
        this.settings.cities = Math.floor(Math.random() * 20) + 10;
        this.createCivilizations();
    }
    
    getStats() {
        const totalPop = this.cities.reduce((sum, city) => sum + city.population, 0);
        return {
            count: `Year: ${this.year}`,
            custom: `Population: ${Math.floor(totalPop)}`
        };
    }
}

// ===== FLUID SIMULATOR =====
class FluidSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.settings = {
            particleCount: 300,
            viscosity: 0.98,
            gravity: 0.2
        };
    }
    
    init() {
        this.createFluid();
        this.setupControls();
        this.setupMouseInteraction();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Particle Count',
                type: 'range',
                min: 100,
                max: 1000,
                value: this.settings.particleCount,
                onChange: (v) => {
                    this.settings.particleCount = v;
                    this.createFluid();
                }
            },
            {
                label: 'Viscosity',
                type: 'range',
                min: 0.9,
                max: 0.99,
                value: this.settings.viscosity,
                step: 0.01,
                onChange: (v) => this.settings.viscosity = v
            },
            {
                label: 'Gravity',
                type: 'range',
                min: 0,
                max: 1,
                value: this.settings.gravity,
                step: 0.1,
                onChange: (v) => this.settings.gravity = v
            }
        ]);
    }
    
    setupMouseInteraction() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    createFluid() {
        this.particles = [];
        for (let i = 0; i < this.settings.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.3,
                vx: 0,
                vy: 0,
                radius: 3
            });
        }
    }
    
    update() {
        this.particles.forEach(p => {
            // Apply gravity
            p.vy += this.settings.gravity;
            
            // Mouse interaction
            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                p.vx += (dx / dist) * force * 2;
                p.vy += (dy / dist) * force * 2;
            }
            
            // Apply viscosity
            p.vx *= this.settings.viscosity;
            p.vy *= this.settings.viscosity;
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Boundaries
            if (p.x < p.radius) {
                p.x = p.radius;
                p.vx *= -0.5;
            }
            if (p.x > this.canvas.width - p.radius) {
                p.x = this.canvas.width - p.radius;
                p.vx *= -0.5;
            }
            if (p.y < p.radius) {
                p.y = p.radius;
                p.vy *= -0.5;
            }
            if (p.y > this.canvas.height - p.radius) {
                p.y = this.canvas.height - p.radius;
                p.vy *= -0.5;
            }
            
            // Particle-particle interactions
            this.particles.forEach(other => {
                if (other !== p) {
                    const dx = other.x - p.x;
                    const dy = other.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < p.radius + other.radius) {
                        const overlap = p.radius + other.radius - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        p.x -= nx * overlap * 0.5;
                        p.y -= ny * overlap * 0.5;
                        other.x += nx * overlap * 0.5;
                        other.y += ny * overlap * 0.5;
                    }
                }
            });
        });
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const hue = 200 + speed * 10;
            this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    reset() {
        this.createFluid();
    }
    
    getStats() {
        return {
            count: `Particles: ${this.particles.length}`,
            custom: `Viscosity: ${this.settings.viscosity}`
        };
    }
}

// ===== GRAVITY SIMULATOR (N-Body) =====
class GravitySimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bodies = [];
        this.settings = {
            bodyCount: 10,
            gravity: 0.5,
            trailLength: 50
        };
        this.trails = [];
    }
    
    init() {
        this.createBodies();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Body Count',
                type: 'range',
                min: 3,
                max: 30,
                value: this.settings.bodyCount,
                onChange: (v) => {
                    this.settings.bodyCount = v;
                    this.createBodies();
                }
            },
            {
                label: 'Gravity Strength',
                type: 'range',
                min: 0.1,
                max: 2,
                value: this.settings.gravity,
                step: 0.1,
                onChange: (v) => this.settings.gravity = v
            },
            {
                label: 'Trail Length',
                type: 'range',
                min: 0,
                max: 100,
                value: this.settings.trailLength,
                onChange: (v) => this.settings.trailLength = v
            }
        ]);
    }
    
    createBodies() {
        this.bodies = [];
        this.trails = [];
        
        // Create a central massive body
        this.bodies.push({
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: 0,
            vy: 0,
            mass: 1000,
            radius: 15,
            color: '#ffff00'
        });
        
        // Create orbiting bodies
        for (let i = 1; i < this.settings.bodyCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            const x = this.canvas.width / 2 + Math.cos(angle) * distance;
            const y = this.canvas.height / 2 + Math.sin(angle) * distance;
            
            const orbitalSpeed = Math.sqrt(this.settings.gravity * 1000 / distance);
            const vx = -Math.sin(angle) * orbitalSpeed;
            const vy = Math.cos(angle) * orbitalSpeed;
            
            this.bodies.push({
                x, y, vx, vy,
                mass: Math.random() * 50 + 10,
                radius: Math.random() * 5 + 3,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
            
            this.trails.push([]);
        }
    }
    
    update() {
        // Calculate gravitational forces
        for (let i = 0; i < this.bodies.length; i++) {
            let fx = 0, fy = 0;
            
            for (let j = 0; j < this.bodies.length; j++) {
                if (i !== j) {
                    const dx = this.bodies[j].x - this.bodies[i].x;
                    const dy = this.bodies[j].y - this.bodies[i].y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);
                    
                    if (dist > 5) {
                        const force = (this.settings.gravity * this.bodies[i].mass * this.bodies[j].mass) / distSq;
                        fx += (dx / dist) * force / this.bodies[i].mass;
                        fy += (dy / dist) * force / this.bodies[i].mass;
                    }
                }
            }
            
            this.bodies[i].vx += fx;
            this.bodies[i].vy += fy;
        }
        
        // Update positions and trails
        this.bodies.forEach((body, i) => {
            body.x += body.vx;
            body.y += body.vy;
            
            if (this.settings.trailLength > 0 && i > 0) {
                if (!this.trails[i]) this.trails[i] = [];
                this.trails[i].push({ x: body.x, y: body.y });
                if (this.trails[i].length > this.settings.trailLength) {
                    this.trails[i].shift();
                }
            }
        });
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw trails
        this.trails.forEach((trail, i) => {
            if (trail.length > 1) {
                this.ctx.strokeStyle = this.bodies[i + 1].color;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                trail.forEach((point, j) => {
                    if (j === 0) this.ctx.moveTo(point.x, point.y);
                    else this.ctx.lineTo(point.x, point.y);
                });
                this.ctx.stroke();
            }
        });
        
        // Draw bodies
        this.bodies.forEach(body => {
            // Glow
            const gradient = this.ctx.createRadialGradient(
                body.x, body.y, 0,
                body.x, body.y, body.radius * 2
            );
            gradient.addColorStop(0, body.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                body.x - body.radius * 2,
                body.y - body.radius * 2,
                body.radius * 4,
                body.radius * 4
            );
            
            // Body
            this.ctx.fillStyle = body.color;
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    reset() {
        this.createBodies();
    }
    
    randomize() {
        this.settings.bodyCount = Math.floor(Math.random() * 20) + 5;
        this.settings.gravity = Math.random() * 1.5 + 0.3;
        this.createBodies();
    }
    
    getStats() {
        return {
            count: `Bodies: ${this.bodies.length}`,
            custom: `G: ${this.settings.gravity.toFixed(2)}`
        };
    }
}

// ===== MANDELBROT SET =====
class MandelbrotSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            maxIterations: 100,
            colorScheme: 'rainbow'
        };
    }
    
    init() {
        this.setupControls();
        this.render();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Zoom',
                type: 'range',
                min: 1,
                max: 1000,
                value: this.settings.zoom,
                onChange: (v) => {
                    this.settings.zoom = v;
                    this.render();
                }
            },
            {
                label: 'Max Iterations',
                type: 'range',
                min: 50,
                max: 500,
                value: this.settings.maxIterations,
                onChange: (v) => {
                    this.settings.maxIterations = v;
                    this.render();
                }
            },
            {
                label: 'Color Scheme',
                type: 'select',
                options: ['rainbow', 'fire', 'ocean', 'monochrome'],
                value: this.settings.colorScheme,
                onChange: (v) => {
                    this.settings.colorScheme = v;
                    this.render();
                }
            }
        ]);
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const px = (x - this.canvas.width / 2) / (this.canvas.width / 4) / this.settings.zoom;
            const py = (y - this.canvas.height / 2) / (this.canvas.height / 4) / this.settings.zoom;
            
            this.settings.offsetX += px;
            this.settings.offsetY += py;
            this.settings.zoom *= 2;
            this.render();
        });
    }
    
    mandelbrot(x, y) {
        let real = x;
        let imag = y;
        
        for (let i = 0; i < this.settings.maxIterations; i++) {
            const real2 = real * real;
            const imag2 = imag * imag;
            
            if (real2 + imag2 > 4) return i;
            
            imag = 2 * real * imag + y;
            real = real2 - imag2 + x;
        }
        
        return this.settings.maxIterations;
    }
    
    getColor(iterations) {
        if (iterations === this.settings.maxIterations) return '#000';
        
        const t = iterations / this.settings.maxIterations;
        
        switch (this.settings.colorScheme) {
            case 'rainbow':
                return `hsl(${t * 360}, 100%, 50%)`;
            case 'fire':
                return `rgb(${255 * t}, ${100 * t}, 0)`;
            case 'ocean':
                return `rgb(0, ${100 * t}, ${255 * t})`;
            case 'monochrome':
                return `rgb(${255 * t}, ${255 * t}, ${255 * t})`;
            default:
                return `hsl(${t * 360}, 100%, 50%)`;
        }
    }
    
    render() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        
        for (let px = 0; px < this.canvas.width; px++) {
            for (let py = 0; py < this.canvas.height; py++) {
                const x = (px - this.canvas.width / 2) / (this.canvas.width / 4) / this.settings.zoom - this.settings.offsetX;
                const y = (py - this.canvas.height / 2) / (this.canvas.height / 4) / this.settings.zoom - this.settings.offsetY;
                
                const iterations = this.mandelbrot(x, y);
                const color = this.getColor(iterations);
                
                const rgb = this.hexToRgb(color);
                const idx = (py * this.canvas.width + px) * 4;
                imageData.data[idx] = rgb.r;
                imageData.data[idx + 1] = rgb.g;
                imageData.data[idx + 2] = rgb.b;
                imageData.data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    hexToRgb(hex) {
        if (hex.startsWith('rgb')) {
            const match = hex.match(/\d+/g);
            return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
        }
        if (hex.startsWith('hsl')) {
            // Simple HSL to RGB conversion
            const match = hex.match(/\d+/g);
            const h = parseInt(match[0]) / 360;
            const s = parseInt(match[1]) / 100;
            const l = parseInt(match[2]) / 100;
            
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h * 6) % 2 - 1));
            const m = l - c / 2;
            
            let r, g, b;
            if (h < 1/6) [r, g, b] = [c, x, 0];
            else if (h < 2/6) [r, g, b] = [x, c, 0];
            else if (h < 3/6) [r, g, b] = [0, c, x];
            else if (h < 4/6) [r, g, b] = [0, x, c];
            else if (h < 5/6) [r, g, b] = [x, 0, c];
            else [r, g, b] = [c, 0, x];
            
            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255)
            };
        }
        return { r: 0, g: 0, b: 0 };
    }
    
    reset() {
        this.settings.zoom = 1;
        this.settings.offsetX = 0;
        this.settings.offsetY = 0;
        this.render();
    }
    
    randomize() {
        this.settings.offsetX = (Math.random() - 0.5) * 2;
        this.settings.offsetY = (Math.random() - 0.5) * 2;
        this.settings.zoom = Math.random() * 100 + 1;
        this.render();
    }
    
    getStats() {
        return {
            count: `Zoom: ${this.settings.zoom.toFixed(1)}x`,
            custom: `Iterations: ${this.settings.maxIterations}`
        };
    }
}

// ===== LAVA LAMP SIMULATOR =====
class LavaLampSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.blobs = [];
        this.settings = {
            blobCount: 8,
            temperature: 5,
            color1: '#ff00ff',
            color2: '#00ffff'
        };
    }
    
    init() {
        this.createBlobs();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Blob Count',
                type: 'range',
                min: 3,
                max: 20,
                value: this.settings.blobCount,
                onChange: (v) => {
                    this.settings.blobCount = v;
                    this.createBlobs();
                }
            },
            {
                label: 'Temperature',
                type: 'range',
                min: 1,
                max: 10,
                value: this.settings.temperature,
                onChange: (v) => this.settings.temperature = v
            },
            {
                label: 'Primary Color',
                type: 'color',
                value: this.settings.color1,
                onChange: (v) => this.settings.color1 = v
            },
            {
                label: 'Secondary Color',
                type: 'color',
                value: this.settings.color2,
                onChange: (v) => this.settings.color2 = v
            }
        ]);
    }
    
    createBlobs() {
        this.blobs = [];
        for (let i = 0; i < this.settings.blobCount; i++) {
            this.blobs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 50 + 30,
                vy: (Math.random() - 0.5) * 2,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    update() {
        this.blobs.forEach(blob => {
            blob.vy += (this.canvas.height / 2 - blob.y) * 0.0001 * this.settings.temperature;
            blob.vy *= 0.99;
            blob.y += blob.vy;
            
            if (blob.y < blob.radius) {
                blob.y = blob.radius;
                blob.vy *= -0.5;
            }
            if (blob.y > this.canvas.height - blob.radius) {
                blob.y = this.canvas.height - blob.radius;
                blob.vy *= -0.5;
            }
            
            blob.phase += 0.02;
            blob.radius = (Math.sin(blob.phase) * 10 + 40);
        });
    }
    
    render() {
        // Background gradient
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#1a0033');
        bgGradient.addColorStop(1, '#000033');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw blobs with metaball effect
        this.blobs.forEach(blob => {
            const gradient = this.ctx.createRadialGradient(
                blob.x, blob.y, 0,
                blob.x, blob.y, blob.radius * 1.5
            );
            gradient.addColorStop(0, this.settings.color1);
            gradient.addColorStop(0.5, this.settings.color2);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(blob.x, blob.y, blob.radius * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    reset() {
        this.createBlobs();
    }
    
    randomize() {
        this.settings.temperature = Math.random() * 8 + 2;
        this.createBlobs();
    }
    
    getStats() {
        return {
            count: `Blobs: ${this.blobs.length}`,
            custom: `Temp: ${this.settings.temperature.toFixed(1)}°`
        };
    }
}

// ===== MATRIX RAIN =====
class MatrixSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            speed: 1,
            density: 0.95,
            color: '#00ff00'
        };
        this.drops = [];
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    init() {
        this.initDrops();
        this.setupControls();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Speed',
                type: 'range',
                min: 0.5,
                max: 5,
                value: this.settings.speed,
                step: 0.5,
                onChange: (v) => this.settings.speed = v
            },
            {
                label: 'Density',
                type: 'range',
                min: 0.8,
                max: 0.99,
                value: this.settings.density,
                step: 0.01,
                onChange: (v) => this.settings.density = v
            },
            {
                label: 'Color',
                type: 'color',
                value: this.settings.color,
                onChange: (v) => this.settings.color = v
            }
        ]);
    }
    
    initDrops() {
        const columns = Math.floor(this.canvas.width / 20);
        this.drops = [];
        for (let i = 0; i < columns; i++) {
            this.drops.push(Math.random() * -100);
        }
    }
    
    update() {
        this.drops = this.drops.map(y => {
            return y > this.canvas.height && Math.random() > this.settings.density
                ? 0
                : y + this.settings.speed * 20;
        });
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.settings.color;
        this.ctx.font = '15px monospace';
        
        this.drops.forEach((y, i) => {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * 20;
            this.ctx.fillText(char, x, y);
        });
    }
    
    reset() {
        this.initDrops();
    }
    
    randomize() {
        this.settings.speed = Math.random() * 4 + 1;
        this.settings.density = Math.random() * 0.15 + 0.85;
    }
    
    getStats() {
        return {
            count: `Columns: ${this.drops.length}`,
            custom: `Speed: ${this.settings.speed.toFixed(1)}x`
        };
    }
}

// ===== TERRAIN GENERATOR =====
class TerrainSimulator {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = {
            roughness: 0.5,
            octaves: 5,
            seed: Math.random()
        };
    }
    
    init() {
        this.setupControls();
        this.generate();
    }
    
    setupControls() {
        createControls([
            {
                label: 'Roughness',
                type: 'range',
                min: 0.1,
                max: 1,
                value: this.settings.roughness,
                step: 0.1,
                onChange: (v) => {
                    this.settings.roughness = v;
                    this.generate();
                }
            },
            {
                label: 'Detail (Octaves)',
                type: 'range',
                min: 1,
                max: 8,
                value: this.settings.octaves,
                onChange: (v) => {
                    this.settings.octaves = v;
                    this.generate();
                }
            }
        ]);
    }
    
    noise(x, y) {
        // Simple pseudo-random noise
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.settings.seed) * 43758.5453;
        return n - Math.floor(n);
    }
    
    perlin(x, y) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;
        
        const n00 = this.noise(xi, yi);
        const n10 = this.noise(xi + 1, yi);
        const n01 = this.noise(xi, yi + 1);
        const n11 = this.noise(xi + 1, yi + 1);
        
        const u = xf * xf * (3 - 2 * xf);
        const v = yf * yf * (3 - 2 * yf);
        
        const nx0 = n00 * (1 - u) + n10 * u;
        const nx1 = n01 * (1 - u) + n11 * u;
        
        return nx0 * (1 - v) + nx1 * v;
    }
    
    generate() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let value = 0;
                let amplitude = 1;
                let frequency = 1;
                let maxValue = 0;
                
                for (let octave = 0; octave < this.settings.octaves; octave++) {
                    value += this.perlin(
                        x * frequency * 0.01,
                        y * frequency * 0.01
                    ) * amplitude;
                    
                    maxValue += amplitude;
                    amplitude *= this.settings.roughness;
                    frequency *= 2;
                }
                
                value /= maxValue;
                
                // Color based on height
                let r, g, b;
                if (value < 0.3) {
                    // Water
                    r = 0;
                    g = 100 + value * 300;
                    b = 255;
                } else if (value < 0.5) {
                    // Beach/Sand
                    r = 194;
                    g = 178;
                    b = 128;
                } else if (value < 0.7) {
                    // Grass
                    r = 34;
                    g = 139 + (value - 0.5) * 200;
                    b = 34;
                } else if (value < 0.85) {
                    // Mountain
                    r = 139;
                    g = 137;
                    b = 137;
                } else {
                    // Snow
                    r = 255;
                    g = 250;
                    b = 250;
                }
                
                const idx = (y * width + x) * 4;
                imageData.data[idx] = r;
                imageData.data[idx + 1] = g;
                imageData.data[idx + 2] = b;
                imageData.data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    render() {
        // Terrain is generated, not animated
    }
    
    reset() {
        this.settings.seed = Math.random();
        this.generate();
    }
    
    randomize() {
        this.settings.roughness = Math.random();
        this.settings.octaves = Math.floor(Math.random() * 7) + 1;
        this.settings.seed = Math.random();
        this.generate();
    }
    
    getStats() {
        return {
            count: `Octaves: ${this.settings.octaves}`,
            custom: `Roughness: ${this.settings.roughness.toFixed(2)}`
        };
    }
}