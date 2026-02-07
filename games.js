const modal = document.getElementById('game-modal');
const gameTitle = document.getElementById('game-title');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level');
const gameOverDiv = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const closeBtn = document.querySelector('.close-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');

let currentGame = null;
let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    paused: false
};

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.game-card');
            const gameName = card.dataset.game;
            startGame(gameName);
        });
    });
    
    closeBtn.addEventListener('click', closeGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', () => {
        if(currentGame) {
            closeGame();
            setTimeout(() => startGame(currentGame.name), 100);
        }
    });
    retryBtn.addEventListener('click', () => {
        gameOverDiv.classList.add('hidden');
        if(currentGame) {
            currentGame.restart();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
});

function createParticles() {
    const container = document.getElementById('particle-container');
    for(let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particle);
    }
}

function updateUI() {
    scoreDisplay.textContent = gameState.score;
    livesDisplay.textContent = gameState.lives;
    levelDisplay.textContent = gameState.level;
}

function togglePause() {
    gameState.paused = !gameState.paused;
    pauseBtn.textContent = gameState.paused ? 'RESUME' : 'PAUSE';
}

function showGameOver() {
    finalScoreDisplay.textContent = gameState.score;
    gameOverDiv.classList.remove('hidden');
}

function closeGame() {
    modal.classList.add('hidden');
    gameContainer.innerHTML = '';
    if(currentGame && currentGame.cleanup) {
        currentGame.cleanup();
    }
    currentGame = null;
}

function startGame(gameName) {
    modal.classList.remove('hidden');
    gameState = { score: 0, lives: 3, level: 1, paused: false };
    updateUI();
    gameOverDiv.classList.add('hidden');
    pauseBtn.textContent = 'PAUSE';
    
    const games = {
        snake: SnakeGame,
        pong: PongGame,
        dodge: DodgeGame,
        clicker: ClickerGame,
        maze: MazeGame,
        reaction: ReactionGame,
        breakout: BreakoutGame,
        runner: RunnerGame,
        memory: MemoryGame,
        tetris: TetrisGame,
        flappy: FlappyGame,
        platformer: PlatformerGame,
        typing: TypingGame,
        match: MatchGame,
        shooter: ShooterGame,
        rhythm: RhythmGame,
        paint: PaintGame,
        simon: SimonGame,
        whack: WhackGame,
        laser: LaserGame,
        portal: PortalGame,
        defend: DefendGame,
        collect: CollectGame,
        bounce: BounceGame,
        asteroid: AsteroidGame,
        gravity: GravityGame,
        chain: ChainGame,
        defend2: Defend2Game
    };
    
    const GameClass = games[gameName];
    if(GameClass) {
        currentGame = new GameClass();
        currentGame.name = gameName;
        gameTitle.textContent = document.querySelector(`[data-game="${gameName}"] h3`).textContent;
        currentGame.init();
    }
}

class SnakeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 30;
        this.tileCount = 20;
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.randomFood();
        this.interval = null;
        this.drunk = false;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', this.handleKey.bind(this));
        this.interval = setInterval(() => this.update(), 150);
    }
    
    handleKey(e) {
        if(gameState.paused) return;
        const key = e.key;
        const rotations = {
            'ArrowUp': {x: 0, y: -1},
            'ArrowDown': {x: 0, y: 1},
            'ArrowLeft': {x: -1, y: 0},
            'ArrowRight': {x: 1, y: 0}
        };
        
        if(rotations[key]) {
            let dir = rotations[key];
            if(this.drunk && Math.random() > 0.7) {
                const dirs = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
                dir = dirs[Math.floor(Math.random() * dirs.length)];
            }
            if(dir.x !== -this.direction.x && dir.y !== -this.direction.y) {
                this.nextDirection = dir;
            }
        }
    }
    
    randomFood() {
        return {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }
    
    update() {
        if(gameState.paused) return;
        
        this.direction = this.nextDirection;
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        if(head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        for(let segment of this.snake) {
            if(segment.x === head.x && segment.y === head.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        if(head.x === this.food.x && head.y === this.food.y) {
            gameState.score += 10;
            if(gameState.score % 50 === 0) {
                this.drunk = !this.drunk;
            }
            updateUI();
            this.food = this.randomFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.drunk ? '#ff00ff' : '#00ff00';
        this.snake.forEach((segment, i) => {
            this.ctx.fillRect(
                segment.x * this.gridSize + 2,
                segment.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
        });
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        if(this.drunk) {
            this.ctx.fillStyle = 'rgba(255,0,255,0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.snake = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.randomFood();
        this.drunk = false;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 150);
    }
    
    cleanup() {
        clearInterval(this.interval);
        document.removeEventListener('keydown', this.handleKey);
    }
}

class PongGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.paddle1 = {x: 20, y: 250, width: 10, height: 100, dy: 0};
        this.paddle2 = {x: 770, y: 250, width: 10, height: 100, dy: 0};
        this.ball = {x: 400, y: 300, dx: 5, dy: 3, radius: 8};
        this.keys = {};
        this.aiThoughts = ['Why?', 'What is my purpose?', 'Is this all there is?'];
        this.currentThought = 0;
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        if(this.keys['ArrowUp']) this.paddle1.dy = -6;
        else if(this.keys['ArrowDown']) this.paddle1.dy = 6;
        else this.paddle1.dy = 0;
        
        this.paddle1.y += this.paddle1.dy;
        this.paddle1.y = Math.max(0, Math.min(this.canvas.height - this.paddle1.height, this.paddle1.y));
        
        const aiSpeed = 4;
        if(this.ball.y < this.paddle2.y + this.paddle2.height / 2) {
            this.paddle2.y -= aiSpeed;
        } else {
            this.paddle2.y += aiSpeed;
        }
        this.paddle2.y = Math.max(0, Math.min(this.canvas.height - this.paddle2.height, this.paddle2.y));
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        if(this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        if(this.ball.x <= this.paddle1.x + this.paddle1.width &&
           this.ball.y >= this.paddle1.y && this.ball.y <= this.paddle1.y + this.paddle1.height) {
            this.ball.dx *= -1.1;
            this.currentThought = (this.currentThought + 1) % this.aiThoughts.length;
        }
        
        if(this.ball.x >= this.paddle2.x - this.ball.radius &&
           this.ball.y >= this.paddle2.y && this.ball.y <= this.paddle2.y + this.paddle2.height) {
            this.ball.dx *= -1.1;
            gameState.score++;
            updateUI();
        }
        
        if(this.ball.x < 0) {
            this.resetBall();
        } else if(this.ball.x > this.canvas.width) {
            this.resetBall();
        }
        
        this.draw();
    }
    
    resetBall() {
        this.ball.x = 400;
        this.ball.y = 300;
        this.ball.dx = (Math.random() > 0.5 ? 5 : -5);
        this.ball.dy = (Math.random() - 0.5) * 6;
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
        
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillText(this.aiThoughts[this.currentThought], 350, 50);
    }
    
    restart() {
        this.resetBall();
        this.paddle1.y = 250;
        this.paddle2.y = 250;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class DodgeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 300, y: 550, size: 20, dx: 0};
        this.enemies = [];
        this.interval = null;
        this.spawnTimer = 0;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', this.handleKey.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    handleKey(e) {
        if(e.key === 'ArrowLeft') this.player.dx = -5;
        if(e.key === 'ArrowRight') this.player.dx = 5;
    }
    
    handleKeyUp(e) {
        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.player.dx = 0;
    }
    
    update() {
        if(gameState.paused) return;
        
        this.player.x += this.player.dx;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));
        
        this.spawnTimer++;
        if(this.spawnTimer > 40) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 3 + Math.random() * 3
            });
            this.spawnTimer = 0;
        }
        
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            if(this.player.x < enemy.x + enemy.width &&
               this.player.x + this.player.size > enemy.x &&
               this.player.y < enemy.y + enemy.height &&
               this.player.y + this.player.size > enemy.y) {
                gameState.lives--;
                updateUI();
                if(gameState.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            if(enemy.y > this.canvas.height) {
                gameState.score += 10;
                updateUI();
                return false;
            }
            
            return true;
        });
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        
        this.ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 300, y: 550, size: 20, dx: 0};
        this.enemies = [];
        this.spawnTimer = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class ClickerGame {
    constructor() {
        this.container = document.createElement('div');
        this.clickCount = 0;
        this.multiplier = 1;
        this.autoClickers = 0;
        this.interval = null;
    }
    
    init() {
        this.container.style.cssText = 'padding: 40px; text-align: center;';
        this.container.innerHTML = `
            <div style="font-size: 72px; margin: 30px 0; color: #ff00ff;" id="click-display">0</div>
            <button id="main-click" style="width: 200px; height: 200px; font-size: 32px; background: linear-gradient(45deg, #ff00ff, #00ffff); border: 5px solid #fff; cursor: pointer; border-radius: 50%;">CLICK ME</button>
            <div style="margin-top: 30px; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <button id="buy-multi" style="padding: 15px 30px; font-size: 18px; background: #ffff00; border: 3px solid #000; cursor: pointer;">2x MULTIPLIER (100 clicks)</button>
                <button id="buy-auto" style="padding: 15px 30px; font-size: 18px; background: #00ff00; border: 3px solid #000; cursor: pointer;">AUTO CLICKER (500 clicks)</button>
            </div>
            <div style="margin-top: 20px; font-size: 24px; color: #00ffff;">Multiplier: <span id="multi-display">1</span>x</div>
            <div style="font-size: 24px; color: #00ffff;">Auto Clickers: <span id="auto-display">0</span></div>
        `;
        gameContainer.appendChild(this.container);
        
        document.getElementById('main-click').addEventListener('click', () => this.click());
        document.getElementById('buy-multi').addEventListener('click', () => this.buyMultiplier());
        document.getElementById('buy-auto').addEventListener('click', () => this.buyAuto());
        
        this.interval = setInterval(() => {
            if(!gameState.paused) {
                this.clickCount += this.autoClickers * this.multiplier;
                this.update();
            }
        }, 1000);
    }
    
    click() {
        if(gameState.paused) return;
        this.clickCount += this.multiplier;
        this.update();
    }
    
    buyMultiplier() {
        if(this.clickCount >= 100) {
            this.clickCount -= 100;
            this.multiplier *= 2;
            this.update();
        }
    }
    
    buyAuto() {
        if(this.clickCount >= 500) {
            this.clickCount -= 500;
            this.autoClickers++;
            this.update();
        }
    }
    
    update() {
        document.getElementById('click-display').textContent = Math.floor(this.clickCount);
        document.getElementById('multi-display').textContent = this.multiplier;
        document.getElementById('auto-display').textContent = this.autoClickers;
        gameState.score = Math.floor(this.clickCount);
        updateUI();
    }
    
    restart() {
        this.clickCount = 0;
        this.multiplier = 1;
        this.autoClickers = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        this.update();
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class MazeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 30;
        this.cols = 20;
        this.rows = 20;
        this.player = {x: 0, y: 0};
        this.exit = {x: 19, y: 19};
        this.maze = this.generateMaze();
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', this.handleKey.bind(this));
        this.draw();
    }
    
    generateMaze() {
        const maze = Array(this.rows).fill().map(() => Array(this.cols).fill(1));
        const stack = [];
        const start = {x: 0, y: 0};
        maze[start.y][start.x] = 0;
        stack.push(start);
        
        const dirs = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
        
        while(stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];
            
            for(let dir of dirs) {
                const nx = current.x + dir.x * 2;
                const ny = current.y + dir.y * 2;
                if(nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows && maze[ny][nx] === 1) {
                    neighbors.push({x: nx, y: ny, dx: dir.x, dy: dir.y});
                }
            }
            
            if(neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                maze[current.y + next.dy][current.x + next.dx] = 0;
                maze[next.y][next.x] = 0;
                stack.push({x: next.x, y: next.y});
            } else {
                stack.pop();
            }
        }
        
        return maze;
    }
    
    handleKey(e) {
        if(gameState.paused) return;
        const moves = {
            'ArrowUp': {x: 0, y: -1},
            'ArrowDown': {x: 0, y: 1},
            'ArrowLeft': {x: -1, y: 0},
            'ArrowRight': {x: 1, y: 0}
        };
        
        const move = moves[e.key];
        if(move) {
            const newX = this.player.x + move.x;
            const newY = this.player.y + move.y;
            
            if(newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows && this.maze[newY][newX] === 0) {
                this.player.x = newX;
                this.player.y = newY;
                
                if(this.player.x === this.exit.x && this.player.y === this.exit.y) {
                    gameState.score += 100;
                    gameState.level++;
                    updateUI();
                    this.player = {x: 0, y: 0};
                    this.maze = this.generateMaze();
                }
                
                this.draw();
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for(let y = 0; y < this.rows; y++) {
            for(let x = 0; x < this.cols; x++) {
                if(this.maze[y][x] === 1) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.exit.x * this.cellSize + 5, this.exit.y * this.cellSize + 5, this.cellSize - 10, this.cellSize - 10);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x * this.cellSize + 5, this.player.y * this.cellSize + 5, this.cellSize - 10, this.cellSize - 10);
    }
    
    restart() {
        this.player = {x: 0, y: 0};
        this.maze = this.generateMaze();
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        this.draw();
    }
    
    cleanup() {}
}

class ReactionGame {
    constructor() {
        this.container = document.createElement('div');
        this.waiting = true;
        this.startTime = 0;
        this.bestTime = Infinity;
        this.timeout = null;
    }
    
    init() {
        this.container.style.cssText = 'padding: 60px; text-align: center;';
        this.container.innerHTML = `
            <div id="reaction-box" style="width: 400px; height: 400px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 32px; background: #ff0000; border: 5px solid #fff; cursor: pointer;">
                WAIT FOR GREEN...
            </div>
            <div style="margin-top: 30px; font-size: 24px; color: #fff;">
                <div>Last: <span id="last-time">-</span> ms</div>
                <div>Best: <span id="best-time">-</span> ms</div>
            </div>
        `;
        gameContainer.appendChild(this.container);
        
        const box = document.getElementById('reaction-box');
        box.addEventListener('click', () => this.click());
        
        this.scheduleGreen();
    }
    
    scheduleGreen() {
        this.waiting = true;
        const box = document.getElementById('reaction-box');
        box.style.background = '#ff0000';
        box.textContent = 'WAIT FOR GREEN...';
        
        this.timeout = setTimeout(() => {
            box.style.background = '#00ff00';
            box.textContent = 'CLICK NOW!';
            this.waiting = false;
            this.startTime = Date.now();
        }, 2000 + Math.random() * 3000);
    }
    
    click() {
        if(gameState.paused) return;
        const box = document.getElementById('reaction-box');
        
        if(this.waiting) {
            box.textContent = 'TOO EARLY! WAIT...';
            clearTimeout(this.timeout);
            setTimeout(() => this.scheduleGreen(), 1000);
        } else {
            const reactionTime = Date.now() - this.startTime;
            document.getElementById('last-time').textContent = reactionTime;
            
            if(reactionTime < this.bestTime) {
                this.bestTime = reactionTime;
                document.getElementById('best-time').textContent = reactionTime;
            }
            
            gameState.score = Math.max(0, 1000 - reactionTime);
            updateUI();
            
            box.textContent = `${reactionTime}ms! Click to continue`;
            setTimeout(() => this.scheduleGreen(), 1500);
        }
    }
    
    restart() {
        clearTimeout(this.timeout);
        this.waiting = true;
        this.startTime = 0;
        this.bestTime = Infinity;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        document.getElementById('last-time').textContent = '-';
        document.getElementById('best-time').textContent = '-';
        this.scheduleGreen();
    }
    
    cleanup() {
        clearTimeout(this.timeout);
    }
}

class BreakoutGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.paddle = {x: 250, y: 550, width: 100, height: 15, dx: 0};
        this.ball = {x: 300, y: 500, dx: 4, dy: -4, radius: 8};
        this.bricks = [];
        this.createBricks();
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            if(e.key === 'ArrowLeft') this.paddle.dx = -7;
            if(e.key === 'ArrowRight') this.paddle.dx = 7;
        });
        document.addEventListener('keyup', (e) => {
            if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.paddle.dx = 0;
        });
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    createBricks() {
        const rows = 5;
        const cols = 8;
        const brickWidth = 70;
        const brickHeight = 20;
        const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff'];
        
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                this.bricks.push({
                    x: c * (brickWidth + 5) + 10,
                    y: r * (brickHeight + 5) + 30,
                    width: brickWidth,
                    height: brickHeight,
                    color: colors[r],
                    alive: true
                });
            }
        }
    }
    
    update() {
        if(gameState.paused) return;
        
        this.paddle.x += this.paddle.dx;
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        if(this.ball.x <= 0 || this.ball.x >= this.canvas.width) {
            this.ball.dx *= -1;
        }
        
        if(this.ball.y <= 0) {
            this.ball.dy *= -1;
        }
        
        if(this.ball.y >= this.canvas.height) {
            gameState.lives--;
            updateUI();
            if(gameState.lives <= 0) {
                this.gameOver();
            } else {
                this.ball.x = 300;
                this.ball.y = 500;
                this.ball.dx = 4;
                this.ball.dy = -4;
            }
        }
        
        if(this.ball.y + this.ball.radius >= this.paddle.y &&
           this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.dy = -Math.abs(this.ball.dy);
            this.ball.dx += (this.ball.x - (this.paddle.x + this.paddle.width / 2)) * 0.1;
        }
        
        this.bricks.forEach(brick => {
            if(!brick.alive) return;
            
            if(this.ball.x >= brick.x && this.ball.x <= brick.x + brick.width &&
               this.ball.y >= brick.y && this.ball.y <= brick.y + brick.height) {
                brick.alive = false;
                this.ball.dy *= -1;
                gameState.score += 10;
                updateUI();
            }
        });
        
        if(this.bricks.every(b => !b.alive)) {
            gameState.level++;
            updateUI();
            this.bricks = [];
            this.createBricks();
            this.ball.dx *= 1.2;
            this.ball.dy *= 1.2;
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.bricks.forEach(brick => {
            if(brick.alive) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.paddle = {x: 250, y: 550, width: 100, height: 15, dx: 0};
        this.ball = {x: 300, y: 500, dx: 4, dy: -4, radius: 8};
        this.bricks = [];
        this.createBricks();
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class RunnerGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 100, y: 300, width: 30, height: 30, dy: 0, grounded: true};
        this.obstacles = [];
        this.ground = 330;
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.speed = 5;
        this.distance = 0;
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            if(e.key === ' ' && this.player.grounded) {
                this.player.dy = this.jumpPower;
                this.player.grounded = false;
            }
        });
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        this.player.dy += this.gravity;
        this.player.y += this.player.dy;
        
        if(this.player.y >= this.ground) {
            this.player.y = this.ground;
            this.player.dy = 0;
            this.player.grounded = true;
        }
        
        this.distance += this.speed;
        
        if(Math.random() < 0.02) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.ground,
                width: 20 + Math.random() * 20,
                height: 30 + Math.random() * 40
            });
        }
        
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            
            if(this.player.x < obs.x + obs.width &&
               this.player.x + this.player.width > obs.x &&
               this.player.y < obs.y + obs.height &&
               this.player.y + this.player.height > obs.y) {
                this.gameOver();
                return false;
            }
            
            return obs.x > -obs.width;
        });
        
        gameState.score = Math.floor(this.distance / 10);
        updateUI();
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.ground + 30);
        this.ctx.lineTo(this.canvas.width, this.ground + 30);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = '#ff0000';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 100, y: 300, width: 30, height: 30, dy: 0, grounded: true};
        this.obstacles = [];
        this.distance = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class MemoryGame {
    constructor() {
        this.container = document.createElement('div');
        this.sequence = [];
        this.playerSequence = [];
        this.displaying = false;
    }
    
    init() {
        this.container.style.cssText = 'padding: 40px; text-align: center;';
        this.container.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 30px; color: #ffff00;">Watch the pattern!</div>
            <div style="display: grid; grid-template-columns: repeat(2, 150px); gap: 20px; justify-content: center; margin-bottom: 30px;">
                <button class="mem-btn" data-color="0" style="width: 150px; height: 150px; background: #ff0000; border: 5px solid #fff; font-size: 32px; cursor: pointer;">1</button>
                <button class="mem-btn" data-color="1" style="width: 150px; height: 150px; background: #00ff00; border: 5px solid #fff; font-size: 32px; cursor: pointer;">2</button>
                <button class="mem-btn" data-color="2" style="width: 150px; height: 150px; background: #0000ff; border: 5px solid #fff; font-size: 32px; cursor: pointer;">3</button>
                <button class="mem-btn" data-color="3" style="width: 150px; height: 150px; background: #ffff00; border: 5px solid #fff; font-size: 32px; cursor: pointer;">4</button>
            </div>
            <button id="start-mem" style="padding: 15px 40px; background: #ff00ff; color: #fff; border: 3px solid #fff; font-size: 20px; cursor: pointer;">START</button>
        `;
        gameContainer.appendChild(this.container);
        
        document.querySelectorAll('.mem-btn').forEach(btn => {
            btn.addEventListener('click', () => this.clickButton(parseInt(btn.dataset.color)));
        });
        
        document.getElementById('start-mem').addEventListener('click', () => this.startRound());
    }
    
    startRound() {
        this.sequence.push(Math.floor(Math.random() * 4));
        this.playerSequence = [];
        this.displaySequence();
    }
    
    async displaySequence() {
        this.displaying = true;
        const buttons = document.querySelectorAll('.mem-btn');
        
        for(let color of this.sequence) {
            await new Promise(resolve => setTimeout(resolve, 500));
            buttons[color].style.opacity = '1';
            buttons[color].style.transform = 'scale(1.1)';
            await new Promise(resolve => setTimeout(resolve, 400));
            buttons[color].style.opacity = '0.7';
            buttons[color].style.transform = 'scale(1)';
        }
        
        this.displaying = false;
    }
    
    clickButton(color) {
        if(this.displaying || gameState.paused) return;
        
        this.playerSequence.push(color);
        
        const buttons = document.querySelectorAll('.mem-btn');
        buttons[color].style.opacity = '1';
        setTimeout(() => buttons[color].style.opacity = '0.7', 200);
        
        const index = this.playerSequence.length - 1;
        
        if(this.playerSequence[index] !== this.sequence[index]) {
            gameState.lives--;
            updateUI();
            if(gameState.lives <= 0) {
                showGameOver();
            } else {
                alert('WRONG! Try again');
                this.displaySequence();
                this.playerSequence = [];
            }
        } else if(this.playerSequence.length === this.sequence.length) {
            gameState.score += 10;
            gameState.level = this.sequence.length;
            updateUI();
            setTimeout(() => this.startRound(), 1000);
        }
    }
    
    restart() {
        this.sequence = [];
        this.playerSequence = [];
        this.displaying = false;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
    }
    
    cleanup() {}
}

class TetrisGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.cols = 10;
        this.rows = 20;
        this.blockSize = 30;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.shapes = [
            [[1,1,1,1]],
            [[1,1],[1,1]],
            [[1,1,1],[0,1,0]],
            [[1,1,1],[1,0,0]],
            [[1,1,1],[0,0,1]],
            [[1,1,0],[0,1,1]],
            [[0,1,1],[1,1,0]]
        ];
        this.colors = ['#00ffff', '#ffff00', '#ff00ff', '#0000ff', '#ff7700', '#00ff00', '#ff0000'];
        this.current = null;
        this.interval = null;
        this.spawnPiece();
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', this.handleKey.bind(this));
        this.interval = setInterval(() => this.update(), 500);
    }
    
    spawnPiece() {
        const shapeIndex = Math.floor(Math.random() * this.shapes.length);
        this.current = {
            shape: this.shapes[shapeIndex],
            color: this.colors[shapeIndex],
            x: Math.floor(this.cols / 2) - 1,
            y: 0
        };
    }
    
    handleKey(e) {
        if(gameState.paused) return;
        if(e.key === 'ArrowLeft') this.move(-1, 0);
        if(e.key === 'ArrowRight') this.move(1, 0);
        if(e.key === 'ArrowDown') this.move(0, 1);
        if(e.key === 'ArrowUp') this.rotate();
    }
    
    move(dx, dy) {
        this.current.x += dx;
        this.current.y += dy;
        if(this.collides()) {
            this.current.x -= dx;
            this.current.y -= dy;
            if(dy > 0) {
                this.merge();
                this.clearLines();
                this.spawnPiece();
                if(this.collides()) {
                    this.gameOver();
                }
            }
        }
        this.draw();
    }
    
    rotate() {
        const rotated = this.current.shape[0].map((_, i) =>
            this.current.shape.map(row => row[i]).reverse()
        );
        const original = this.current.shape;
        this.current.shape = rotated;
        if(this.collides()) {
            this.current.shape = original;
        }
        this.draw();
    }
    
    collides() {
        for(let y = 0; y < this.current.shape.length; y++) {
            for(let x = 0; x < this.current.shape[y].length; x++) {
                if(this.current.shape[y][x]) {
                    const newX = this.current.x + x;
                    const newY = this.current.y + y;
                    if(newX < 0 || newX >= this.cols || newY >= this.rows ||
                       (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    merge() {
        for(let y = 0; y < this.current.shape.length; y++) {
            for(let x = 0; x < this.current.shape[y].length; x++) {
                if(this.current.shape[y][x]) {
                    const newY = this.current.y + y;
                    const newX = this.current.x + x;
                    if(newY >= 0) {
                        this.board[newY][newX] = this.current.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        for(let y = this.rows - 1; y >= 0; y--) {
            if(this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        if(linesCleared > 0) {
            gameState.score += linesCleared * 100;
            updateUI();
        }
    }
    
    update() {
        if(gameState.paused) return;
        this.move(0, 1);
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for(let y = 0; y < this.rows; y++) {
            for(let x = 0; x < this.cols; x++) {
                if(this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
                }
            }
        }
        
        if(this.current) {
            this.ctx.fillStyle = this.current.color;
            for(let y = 0; y < this.current.shape.length; y++) {
                for(let x = 0; x < this.current.shape[y].length; x++) {
                    if(this.current.shape[y][x]) {
                        this.ctx.fillRect(
                            (this.current.x + x) * this.blockSize,
                            (this.current.y + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.spawnPiece();
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 500);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class FlappyGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.bird = {x: 100, y: 300, dy: 0, radius: 15};
        this.pipes = [];
        this.gravity = 0.5;
        this.jump = -10;
        this.pipeSpeed = 3;
        this.pipeGap = 150;
        this.frameCount = 0;
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            if(e.key === ' ') {
                this.bird.dy = this.jump;
            }
        });
        this.canvas.addEventListener('click', () => {
            this.bird.dy = this.jump;
        });
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        this.bird.dy += this.gravity;
        this.bird.y += this.bird.dy;
        
        if(this.bird.y <= 0 || this.bird.y >= this.canvas.height) {
            this.gameOver();
            return;
        }
        
        this.frameCount++;
        if(this.frameCount % 90 === 0) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                topHeight: pipeY,
                bottomY: pipeY + this.pipeGap,
                scored: false
            });
        }
        
        this.pipes = this.pipes.filter(pipe => {
            pipe.x -= this.pipeSpeed;
            
            if(!pipe.scored && pipe.x + 50 < this.bird.x) {
                pipe.scored = true;
                gameState.score += 10;
                updateUI();
            }
            
            if((this.bird.x + this.bird.radius > pipe.x && this.bird.x - this.bird.radius < pipe.x + 50) &&
               (this.bird.y - this.bird.radius < pipe.topHeight || this.bird.y + this.bird.radius > pipe.bottomY)) {
                this.gameOver();
                return false;
            }
            
            return pipe.x > -50;
        });
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#00ff00';
        this.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.bottomY, 50, this.canvas.height - pipe.bottomY);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.bird = {x: 100, y: 300, dy: 0, radius: 15};
        this.pipes = [];
        this.frameCount = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class PlatformerGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 50, y: 500, width: 30, height: 30, dx: 0, dy: 0, grounded: false};
        this.platforms = [
            {x: 0, y: 550, width: 800, height: 50},
            {x: 200, y: 450, width: 150, height: 20},
            {x: 450, y: 350, width: 150, height: 20},
            {x: 100, y: 250, width: 150, height: 20},
            {x: 500, y: 150, width: 200, height: 20}
        ];
        this.goal = {x: 600, y: 100, width: 40, height: 40};
        this.gravity = 0.6;
        this.speed = 5;
        this.jumpPower = -12;
        this.keys = {};
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        if(this.keys['ArrowLeft']) this.player.dx = -this.speed;
        else if(this.keys['ArrowRight']) this.player.dx = this.speed;
        else this.player.dx = 0;
        
        if(this.keys[' '] && this.player.grounded) {
            this.player.dy = this.jumpPower;
            this.player.grounded = false;
        }
        
        this.player.dy += this.gravity;
        this.player.x += this.player.dx;
        this.player.y += this.player.dy;
        
        this.player.grounded = false;
        
        this.platforms.forEach(platform => {
            if(this.player.x < platform.x + platform.width &&
               this.player.x + this.player.width > platform.x &&
               this.player.y < platform.y + platform.height &&
               this.player.y + this.player.height > platform.y) {
                
                if(this.player.dy > 0 && this.player.y < platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.dy = 0;
                    this.player.grounded = true;
                }
            }
        });
        
        if(this.player.y > this.canvas.height) {
            this.player.x = 50;
            this.player.y = 500;
            this.player.dy = 0;
            gameState.lives--;
            updateUI();
            if(gameState.lives <= 0) {
                this.gameOver();
            }
        }
        
        if(this.player.x < this.goal.x + this.goal.width &&
           this.player.x + this.player.width > this.goal.x &&
           this.player.y < this.goal.y + this.goal.height &&
           this.player.y + this.player.height > this.goal.y) {
            gameState.score += 100;
            gameState.level++;
            updateUI();
            this.player.x = 50;
            this.player.y = 500;
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 50, y: 500, width: 30, height: 30, dx: 0, dy: 0, grounded: false};
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class TypingGame {
    constructor() {
        this.container = document.createElement('div');
        this.words = ['quantum', 'chaos', 'entropy', 'bizarre', 'cosmic', 'void', 'glitch', 'neural', 'digital', 'psychic'];
        this.fallingWords = [];
        this.currentInput = '';
        this.interval = null;
        this.spawnTimer = 0;
    }
    
    init() {
        this.container.style.cssText = 'padding: 20px; position: relative; width: 600px; height: 500px; background: #000; border: 5px solid #fff; margin: 0 auto;';
        this.container.innerHTML = `
            <div id="word-area" style="position: relative; height: 400px;"></div>
            <input type="text" id="type-input" style="width: 100%; padding: 15px; font-size: 24px; background: #000; color: #00ff00; border: 3px solid #00ff00; margin-top: 10px;" placeholder="Type the words!" autocomplete="off">
        `;
        gameContainer.appendChild(this.container);
        
        const input = document.getElementById('type-input');
        input.addEventListener('input', (e) => this.checkWord(e.target.value));
        input.focus();
        
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        this.spawnTimer++;
        if(this.spawnTimer > 120) {
            this.spawnWord();
            this.spawnTimer = 0;
        }
        
        const wordArea = document.getElementById('word-area');
        this.fallingWords = this.fallingWords.filter(word => {
            word.y += word.speed;
            word.element.style.top = word.y + 'px';
            
            if(word.y > 400) {
                word.element.remove();
                gameState.lives--;
                updateUI();
                if(gameState.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            return true;
        });
    }
    
    spawnWord() {
        const word = this.words[Math.floor(Math.random() * this.words.length)];
        const element = document.createElement('div');
        element.textContent = word;
        element.style.cssText = `position: absolute; left: ${Math.random() * 500}px; top: 0px; color: #ff00ff; font-size: 24px; font-weight: bold;`;
        
        document.getElementById('word-area').appendChild(element);
        
        this.fallingWords.push({
            word: word,
            y: 0,
            speed: 1 + Math.random(),
            element: element
        });
    }
    
    checkWord(input) {
        if(gameState.paused) return;
        
        for(let i = 0; i < this.fallingWords.length; i++) {
            if(this.fallingWords[i].word === input.toLowerCase()) {
                this.fallingWords[i].element.remove();
                this.fallingWords.splice(i, 1);
                document.getElementById('type-input').value = '';
                gameState.score += 10;
                updateUI();
                break;
            }
        }
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.fallingWords.forEach(w => w.element.remove());
        this.fallingWords = [];
        this.spawnTimer = 0;
        document.getElementById('type-input').value = '';
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class MatchGame {
    constructor() {
        this.container = document.createElement('div');
        this.symbols = ['🌟', '🎮', '🎵', '🔥', '💎', '🚀', '👾', '🎨'];
        this.cards = [];
        this.flipped = [];
        this.matched = 0;
    }
    
    init() {
        this.container.style.cssText = 'padding: 40px;';
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 100px); gap: 15px; justify-content: center;';
        
        const deck = [...this.symbols, ...this.symbols].sort(() => Math.random() - 0.5);
        
        deck.forEach((symbol, i) => {
            const card = document.createElement('div');
            card.style.cssText = 'width: 100px; height: 100px; background: #ff00ff; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer; user-select: none;';
            card.dataset.symbol = symbol;
            card.dataset.index = i;
            card.textContent = '?';
            card.addEventListener('click', () => this.flipCard(card));
            grid.appendChild(card);
            this.cards.push(card);
        });
        
        this.container.appendChild(grid);
        gameContainer.appendChild(this.container);
    }
    
    flipCard(card) {
        if(gameState.paused || this.flipped.length >= 2 || card.dataset.flipped === 'true') return;
        
        card.textContent = card.dataset.symbol;
        card.dataset.flipped = 'true';
        this.flipped.push(card);
        
        if(this.flipped.length === 2) {
            setTimeout(() => this.checkMatch(), 500);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flipped;
        
        if(card1.dataset.symbol === card2.dataset.symbol) {
            card1.style.background = '#00ff00';
            card2.style.background = '#00ff00';
            this.matched += 2;
            gameState.score += 20;
            updateUI();
            
            if(this.matched === this.cards.length) {
                setTimeout(() => {
                    alert('YOU WON! Starting new level...');
                    gameState.level++;
                    this.restart();
                }, 500);
            }
        } else {
            card1.textContent = '?';
            card2.textContent = '?';
            card1.dataset.flipped = 'false';
            card2.dataset.flipped = 'false';
        }
        
        this.flipped = [];
    }
    
    restart() {
        this.container.innerHTML = '';
        this.cards = [];
        this.flipped = [];
        this.matched = 0;
        this.init();
    }
    
    cleanup() {}
}

class ShooterGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 275, y: 550, width: 50, height: 30, dx: 0};
        this.bullets = [];
        this.enemies = [];
        this.keys = {};
        this.enemyDirection = 1;
        this.interval = null;
        this.spawnEnemies();
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if(e.key === ' ') this.shoot();
        });
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    spawnEnemies() {
        for(let row = 0; row < 4; row++) {
            for(let col = 0; col < 8; col++) {
                this.enemies.push({
                    x: col * 70 + 20,
                    y: row * 50 + 30,
                    width: 40,
                    height: 30,
                    alive: true
                });
            }
        }
    }
    
    shoot() {
        if(gameState.paused) return;
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 15,
            dy: -8
        });
    }
    
    update() {
        if(gameState.paused) return;
        
        if(this.keys['ArrowLeft']) this.player.x -= 5;
        if(this.keys['ArrowRight']) this.player.x += 5;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        
        this.bullets = this.bullets.filter(bullet => {
            bullet.y += bullet.dy;
            
            for(let enemy of this.enemies) {
                if(enemy.alive && bullet.x < enemy.x + enemy.width &&
                   bullet.x + bullet.width > enemy.x &&
                   bullet.y < enemy.y + enemy.height &&
                   bullet.y + bullet.height > enemy.y) {
                    enemy.alive = false;
                    gameState.score += 10;
                    updateUI();
                    return false;
                }
            }
            
            return bullet.y > 0;
        });
        
        let hitEdge = false;
        this.enemies.forEach(enemy => {
            if(enemy.alive) {
                enemy.x += this.enemyDirection * 2;
                if(enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
                    hitEdge = true;
                }
            }
        });
        
        if(hitEdge) {
            this.enemyDirection *= -1;
            this.enemies.forEach(enemy => {
                enemy.y += 20;
                if(enemy.y > this.canvas.height - 100) {
                    this.gameOver();
                }
            });
        }
        
        if(this.enemies.every(e => !e.alive)) {
            gameState.level++;
            updateUI();
            this.enemies = [];
            this.spawnEnemies();
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        this.ctx.fillStyle = '#ff00ff';
        this.enemies.forEach(enemy => {
            if(enemy.alive) {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 275, y: 550, width: 50, height: 30, dx: 0};
        this.bullets = [];
        this.enemies = [];
        this.enemyDirection = 1;
        this.spawnEnemies();
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class RhythmGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.lanes = [100, 200, 300, 400, 500];
        this.notes = [];
        this.speed = 3;
        this.keys = ['a', 's', 'd', 'f', 'g'];
        this.interval = null;
        this.spawnTimer = 0;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => this.hitNote(e.key));
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        this.spawnTimer++;
        if(this.spawnTimer > 60) {
            const lane = Math.floor(Math.random() * 5);
            this.notes.push({
                lane: lane,
                y: -20,
                hit: false
            });
            this.spawnTimer = 0;
        }
        
        this.notes = this.notes.filter(note => {
            note.y += this.speed;
            
            if(note.y > this.canvas.height) {
                if(!note.hit) {
                    gameState.lives--;
                    updateUI();
                    if(gameState.lives <= 0) {
                        this.gameOver();
                    }
                }
                return false;
            }
            return true;
        });
        
        this.draw();
    }
    
    hitNote(key) {
        if(gameState.paused) return;
        const laneIndex = this.keys.indexOf(key);
        if(laneIndex === -1) return;
        
        for(let note of this.notes) {
            if(note.lane === laneIndex && !note.hit && note.y > 500 && note.y < 580) {
                note.hit = true;
                gameState.score += 10;
                updateUI();
                break;
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#ffffff';
        this.lanes.forEach(x => {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        });
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(50, 520, 500, 60);
        
        this.notes.forEach(note => {
            this.ctx.fillStyle = note.hit ? '#ffff00' : '#ff00ff';
            this.ctx.fillRect(this.lanes[note.lane] - 20, note.y, 40, 20);
        });
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '20px Comic Sans MS';
        this.keys.forEach((key, i) => {
            this.ctx.fillText(key.toUpperCase(), this.lanes[i] - 8, 590);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.notes = [];
        this.spawnTimer = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class PaintGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.drawing = false;
        this.color = '#ff00ff';
        this.colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
        this.colorIndex = 0;
        this.brushSize = 5;
    }
    
    init() {
        gameContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <button id="clear-canvas" style="padding: 10px 20px; background: #ff0000; color: #fff; border: 2px solid #fff; cursor: pointer; margin: 0 5px; font-weight: bold;">CLEAR</button>
                <button id="rainbow-mode" style="padding: 10px 20px; background: #ff00ff; color: #fff; border: 2px solid #fff; cursor: pointer; margin: 0 5px; font-weight: bold;">RAINBOW</button>
                <button id="size-up" style="padding: 10px 20px; background: #00ff00; color: #000; border: 2px solid #fff; cursor: pointer; margin: 0 5px; font-weight: bold;">SIZE+</button>
                <button id="size-down" style="padding: 10px 20px; background: #ffff00; color: #000; border: 2px solid #fff; cursor: pointer; margin: 0 5px; font-weight: bold;">SIZE-</button>
            </div>
        `;
        gameContainer.appendChild(this.canvas);
        
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.border = '5px solid #fff';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        this.canvas.addEventListener('mousedown', () => this.drawing = true);
        this.canvas.addEventListener('mouseup', () => this.drawing = false);
        this.canvas.addEventListener('mouseleave', () => this.drawing = false);
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        
        document.getElementById('clear-canvas').addEventListener('click', () => {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });
        
        document.getElementById('rainbow-mode').addEventListener('click', () => {
            this.colorIndex = (this.colorIndex + 1) % this.colors.length;
            this.color = this.colors[this.colorIndex];
        });
        
        document.getElementById('size-up').addEventListener('click', () => {
            this.brushSize = Math.min(50, this.brushSize + 5);
        });
        
        document.getElementById('size-down').addEventListener('click', () => {
            this.brushSize = Math.max(1, this.brushSize - 5);
        });
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    draw(e) {
        if(!this.drawing || gameState.paused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        gameState.score++;
        updateUI();
    }
    
    restart() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
    }
    
    cleanup() {}
}

class SimonGame {
    constructor() {
        this.container = document.createElement('div');
        this.sequence = [];
        this.playerSequence = [];
        this.displaying = false;
        this.speed = 600;
    }
    
    init() {
        this.container.style.cssText = 'padding: 40px; text-align: center;';
        this.container.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 30px; color: #ffff00;" id="simon-message">Press START to begin</div>
            <div style="display: grid; grid-template-columns: repeat(2, 200px); gap: 10px; justify-content: center; margin-bottom: 30px;">
                <button class="simon-btn" data-color="0" style="width: 200px; height: 200px; background: #ff0000; border: 5px solid #fff; cursor: pointer; font-size: 48px;">🔴</button>
                <button class="simon-btn" data-color="1" style="width: 200px; height: 200px; background: #0000ff; border: 5px solid #fff; cursor: pointer; font-size: 48px;">🔵</button>
                <button class="simon-btn" data-color="2" style="width: 200px; height: 200px; background: #00ff00; border: 5px solid #fff; cursor: pointer; font-size: 48px;">🟢</button>
                <button class="simon-btn" data-color="3" style="width: 200px; height: 200px; background: #ffff00; border: 5px solid #fff; cursor: pointer; font-size: 48px;">🟡</button>
            </div>
            <button id="start-simon" style="padding: 20px 50px; background: #ff00ff; color: #fff; border: 3px solid #fff; font-size: 24px; cursor: pointer; font-weight: bold;">START</button>
        `;
        gameContainer.appendChild(this.container);
        
        document.querySelectorAll('.simon-btn').forEach(btn => {
            btn.addEventListener('click', () => this.clickButton(parseInt(btn.dataset.color)));
        });
        
        document.getElementById('start-simon').addEventListener('click', () => this.startRound());
    }
    
    startRound() {
        this.sequence.push(Math.floor(Math.random() * 4));
        this.playerSequence = [];
        document.getElementById('simon-message').textContent = 'Watch carefully!';
        this.displaySequence();
    }
    
    async displaySequence() {
        this.displaying = true;
        const buttons = document.querySelectorAll('.simon-btn');
        
        for(let color of this.sequence) {
            await new Promise(resolve => setTimeout(resolve, this.speed));
            buttons[color].style.filter = 'brightness(2)';
            buttons[color].style.transform = 'scale(0.95)';
            await new Promise(resolve => setTimeout(resolve, this.speed));
            buttons[color].style.filter = 'brightness(1)';
            buttons[color].style.transform = 'scale(1)';
        }
        
        document.getElementById('simon-message').textContent = 'Your turn!';
        this.displaying = false;
    }
    
    clickButton(color) {
        if(this.displaying || gameState.paused) return;
        
        this.playerSequence.push(color);
        
        const buttons = document.querySelectorAll('.simon-btn');
        buttons[color].style.filter = 'brightness(2)';
        setTimeout(() => buttons[color].style.filter = 'brightness(1)', 200);
        
        const index = this.playerSequence.length - 1;
        
        if(this.playerSequence[index] !== this.sequence[index]) {
            document.getElementById('simon-message').textContent = 'WRONG! GAME OVER!';
            gameState.lives = 0;
            updateUI();
            showGameOver();
        } else if(this.playerSequence.length === this.sequence.length) {
            gameState.score += 10;
            gameState.level = this.sequence.length;
            updateUI();
            this.speed = Math.max(200, this.speed - 20);
            setTimeout(() => this.startRound(), 1000);
        }
    }
    
    restart() {
        this.sequence = [];
        this.playerSequence = [];
        this.displaying = false;
        this.speed = 600;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        document.getElementById('simon-message').textContent = 'Press START to begin';
    }
    
    cleanup() {}
}

class WhackGame {
    constructor() {
        this.container = document.createElement('div');
        this.holes = [];
        this.activeHole = -1;
        this.interval = null;
        this.spawnInterval = 1000;
    }
    
    init() {
        this.container.style.cssText = 'padding: 40px; text-align: center;';
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 150px); gap: 20px; justify-content: center;';
        
        for(let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.style.cssText = 'width: 150px; height: 150px; background: #000; border: 5px solid #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 60px; position: relative;';
            hole.dataset.index = i;
            hole.addEventListener('click', () => this.whack(i));
            grid.appendChild(hole);
            this.holes.push(hole);
        }
        
        this.container.appendChild(grid);
        gameContainer.appendChild(this.container);
        
        this.interval = setInterval(() => this.spawn(), this.spawnInterval);
    }
    
    spawn() {
        if(gameState.paused) return;
        
        if(this.activeHole >= 0) {
            this.holes[this.activeHole].textContent = '';
            this.holes[this.activeHole].style.background = '#000';
        }
        
        this.activeHole = Math.floor(Math.random() * 9);
        this.holes[this.activeHole].textContent = '👾';
        this.holes[this.activeHole].style.background = '#ff00ff';
        
        this.spawnInterval = Math.max(300, this.spawnInterval - 10);
    }
    
    whack(index) {
        if(gameState.paused) return;
        
        if(index === this.activeHole) {
            this.holes[index].textContent = '💥';
            this.holes[index].style.background = '#00ff00';
            gameState.score += 10;
            updateUI();
            
            setTimeout(() => {
                this.holes[index].textContent = '';
                this.holes[index].style.background = '#000';
            }, 200);
            
            this.activeHole = -1;
        } else {
            gameState.lives--;
            updateUI();
            if(gameState.lives <= 0) {
                clearInterval(this.interval);
                showGameOver();
            }
        }
    }
    
    restart() {
        clearInterval(this.interval);
        this.activeHole = -1;
        this.spawnInterval = 1000;
        this.holes.forEach(h => {
            h.textContent = '';
            h.style.background = '#000';
        });
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        this.interval = setInterval(() => this.spawn(), this.spawnInterval);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class LaserGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 400, y: 550, size: 30};
        this.lasers = [];
        this.enemies = [];
        this.keys = {};
        this.interval = null;
        this.spawnTimer = 0;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if(e.key === ' ') this.shoot();
        });
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    shoot() {
        if(gameState.paused) return;
        this.lasers.push({
            x: this.player.x,
            y: this.player.y - 10,
            width: 4,
            height: 20,
            dy: -10
        });
    }
    
    update() {
        if(gameState.paused) return;
        
        if(this.keys['ArrowLeft']) this.player.x -= 6;
        if(this.keys['ArrowRight']) this.player.x += 6;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));
        
        this.lasers = this.lasers.filter(laser => {
            laser.y += laser.dy;
            
            for(let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];
                if(laser.x < enemy.x + enemy.size &&
                   laser.x + laser.width > enemy.x &&
                   laser.y < enemy.y + enemy.size &&
                   laser.y + laser.height > enemy.y) {
                    this.enemies.splice(i, 1);
                    gameState.score += 5;
                    updateUI();
                    return false;
                }
            }
            
            return laser.y > 0;
        });
        
        this.spawnTimer++;
        if(this.spawnTimer > 40) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                size: 30,
                speed: 2 + Math.random() * 2
            });
            this.spawnTimer = 0;
        }
        
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            if(enemy.y > this.canvas.height) {
                gameState.lives--;
                updateUI();
                if(gameState.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            return true;
        });
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        
        this.ctx.fillStyle = '#ffff00';
        this.lasers.forEach(laser => {
            this.ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
        });
        
        this.ctx.fillStyle = '#ff00ff';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 400, y: 550, size: 30};
        this.lasers = [];
        this.enemies = [];
        this.spawnTimer = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class PortalGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 50, y: 50, size: 20, dx: 0, dy: 0};
        this.portals = [];
        this.goal = {x: 550, y: 550, size: 30};
        this.keys = {};
        this.speed = 4;
        this.interval = null;
        this.generatePortals();
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    generatePortals() {
        for(let i = 0; i < 3; i++) {
            this.portals.push({
                x: Math.random() * 500 + 50,
                y: Math.random() * 500 + 50,
                size: 40,
                linkedTo: (i + 1) % 3
            });
        }
    }
    
    update() {
        if(gameState.paused) return;
        
        this.player.dx = 0;
        this.player.dy = 0;
        
        if(this.keys['ArrowLeft']) this.player.dx = -this.speed;
        if(this.keys['ArrowRight']) this.player.dx = this.speed;
        if(this.keys['ArrowUp']) this.player.dy = -this.speed;
        if(this.keys['ArrowDown']) this.player.dy = this.speed;
        
        this.player.x += this.player.dx;
        this.player.y += this.player.dy;
        
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.size, this.player.y));
        
        this.portals.forEach((portal, i) => {
            if(this.player.x < portal.x + portal.size &&
               this.player.x + this.player.size > portal.x &&
               this.player.y < portal.y + portal.size &&
               this.player.y + this.player.size > portal.y) {
                const target = this.portals[portal.linkedTo];
                this.player.x = target.x;
                this.player.y = target.y;
            }
        });
        
        if(this.player.x < this.goal.x + this.goal.size &&
           this.player.x + this.player.size > this.goal.x &&
           this.player.y < this.goal.y + this.goal.size &&
           this.player.y + this.player.size > this.goal.y) {
            gameState.score += 50;
            gameState.level++;
            updateUI();
            this.player.x = 50;
            this.player.y = 50;
            this.portals = [];
            this.generatePortals();
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.portals.forEach((portal, i) => {
            this.ctx.fillStyle = ['#ff00ff', '#00ffff', '#ffff00'][i];
            this.ctx.beginPath();
            this.ctx.arc(portal.x + portal.size/2, portal.y + portal.size/2, portal.size/2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.size, this.goal.size);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
    }
    
    restart() {
        this.player = {x: 50, y: 50, size: 20, dx: 0, dy: 0};
        this.portals = [];
        this.generatePortals();
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class DefendGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.towers = [];
        this.enemies = [];
        this.path = [{x: 0, y: 300}, {x: 400, y: 300}, {x: 400, y: 150}, {x: 800, y: 150}];
        this.money = 100;
        this.interval = null;
        this.spawnTimer = 0;
        this.enemyHealth = 3;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        this.canvas.addEventListener('click', (e) => this.placeTower(e));
        
        const info = document.createElement('div');
        info.style.cssText = 'text-align: center; margin: 10px; color: #ffff00; font-size: 18px;';
        info.innerHTML = 'Click to place towers ($50) | Money: <span id="tower-money">100</span>';
        gameContainer.appendChild(info);
        
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    placeTower(e) {
        if(gameState.paused || this.money < 50) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.towers.push({x: x, y: y, size: 20, range: 100, cooldown: 0});
        this.money -= 50;
        document.getElementById('tower-money').textContent = this.money;
    }
    
    update() {
        if(gameState.paused) return;
        
        this.spawnTimer++;
        if(this.spawnTimer > 120) {
            this.enemies.push({
                x: this.path[0].x,
                y: this.path[0].y,
                pathIndex: 0,
                health: this.enemyHealth,
                size: 15
            });
            this.spawnTimer = 0;
        }
        
        this.enemies = this.enemies.filter(enemy => {
            const target = this.path[enemy.pathIndex];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < 5) {
                enemy.pathIndex++;
                if(enemy.pathIndex >= this.path.length) {
                    gameState.lives--;
                    updateUI();
                    if(gameState.lives <= 0) {
                        this.gameOver();
                    }
                    return false;
                }
            } else {
                enemy.x += (dx / dist) * 2;
                enemy.y += (dy / dist) * 2;
            }
            
            return enemy.health > 0;
        });
        
        this.towers.forEach(tower => {
            if(tower.cooldown > 0) {
                tower.cooldown--;
                return;
            }
            
            for(let enemy of this.enemies) {
                const dx = enemy.x - tower.x;
                const dy = enemy.y - tower.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < tower.range) {
                    enemy.health--;
                    tower.cooldown = 30;
                    if(enemy.health <= 0) {
                        this.money += 10;
                        gameState.score += 10;
                        updateUI();
                        document.getElementById('tower-money').textContent = this.money;
                    }
                    break;
                }
            }
        });
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#001100';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 30;
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for(let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#00ffff';
        this.towers.forEach(tower => {
            this.ctx.fillRect(tower.x - tower.size/2, tower.y - tower.size/2, tower.size, tower.size);
        });
        
        this.ctx.fillStyle = '#ff00ff';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x - enemy.size/2, enemy.y - enemy.size/2, enemy.size, enemy.size);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.towers = [];
        this.enemies = [];
        this.money = 100;
        this.spawnTimer = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        document.getElementById('tower-money').textContent = this.money;
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class CollectGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 300, y: 300, size: 25, dx: 0, dy: 0};
        this.gems = [];
        this.enemies = [];
        this.keys = {};
        this.speed = 5;
        this.interval = null;
        this.spawnTimer = 0;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        for(let i = 0; i < 5; i++) {
            this.spawnGem();
        }
        
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    spawnGem() {
        this.gems.push({
            x: Math.random() * (this.canvas.width - 20),
            y: Math.random() * (this.canvas.height - 20),
            size: 15
        });
    }
    
    update() {
        if(gameState.paused) return;
        
        this.player.dx = 0;
        this.player.dy = 0;
        
        if(this.keys['ArrowLeft']) this.player.dx = -this.speed;
        if(this.keys['ArrowRight']) this.player.dx = this.speed;
        if(this.keys['ArrowUp']) this.player.dy = -this.speed;
        if(this.keys['ArrowDown']) this.player.dy = this.speed;
        
        this.player.x += this.player.dx;
        this.player.y += this.player.dy;
        
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.size, this.player.y));
        
        this.gems = this.gems.filter(gem => {
            if(this.player.x < gem.x + gem.size &&
               this.player.x + this.player.size > gem.x &&
               this.player.y < gem.y + gem.size &&
               this.player.y + this.player.size > gem.y) {
                gameState.score += 10;
                updateUI();
                this.spawnGem();
                return false;
            }
            return true;
        });
        
        this.spawnTimer++;
        if(this.spawnTimer > 90) {
            this.enemies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 20,
                speed: 2
            });
            this.spawnTimer = 0;
        }
        
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist > 0) {
                enemy.x += (dx / dist) * enemy.speed;
                enemy.y += (dy / dist) * enemy.speed;
            }
            
            if(this.player.x < enemy.x + enemy.size &&
               this.player.x + this.player.size > enemy.x &&
               this.player.y < enemy.y + enemy.size &&
               this.player.y + this.player.size > enemy.y) {
                this.gameOver();
            }
        });
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffff00';
        this.gems.forEach(gem => {
            this.ctx.fillRect(gem.x, gem.y, gem.size, gem.size);
        });
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        
        this.ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 300, y: 300, size: 25, dx: 0, dy: 0};
        this.gems = [];
        this.enemies = [];
        this.spawnTimer = 0;
        for(let i = 0; i < 5; i++) {
            this.spawnGem();
        }
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class BounceGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.paddle = {x: 250, y: 550, width: 100, height: 15};
        this.ball = {x: 300, y: 300, dx: 4, dy: 4, radius: 10};
        this.bounces = 0;
        this.interval = null;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.paddle.x = e.clientX - rect.left - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        });
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        if(this.ball.x <= 0 || this.ball.x >= this.canvas.width) {
            this.ball.dx *= -1;
        }
        
        if(this.ball.y <= 0) {
            this.ball.dy *= -1;
        }
        
        if(this.ball.y + this.ball.radius >= this.paddle.y &&
           this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddle.width) {
            this.ball.dy = -Math.abs(this.ball.dy);
            this.bounces++;
            gameState.score = this.bounces;
            updateUI();
            
            this.ball.dx *= 1.02;
            this.ball.dy *= 1.02;
        }
        
        if(this.ball.y > this.canvas.height) {
            this.gameOver();
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '24px Comic Sans MS';
        this.ctx.fillText(`Bounces: ${this.bounces}`, 10, 30);
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.paddle = {x: 250, y: 550, width: 100, height: 15};
        this.ball = {x: 300, y: 300, dx: 4, dy: 4, radius: 10};
        this.bounces = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class AsteroidGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.ship = {x: 400, y: 300, angle: 0, dx: 0, dy: 0, size: 15};
        this.bullets = [];
        this.asteroids = [];
        this.keys = {};
        this.interval = null;
        
        for(let i = 0; i < 5; i++) {
            this.spawnAsteroid(40);
        }
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if(e.key === ' ') this.shoot();
        });
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    spawnAsteroid(size) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        if(edge === 0) { x = Math.random() * this.canvas.width; y = 0; }
        else if(edge === 1) { x = this.canvas.width; y = Math.random() * this.canvas.height; }
        else if(edge === 2) { x = Math.random() * this.canvas.width; y = this.canvas.height; }
        else { x = 0; y = Math.random() * this.canvas.height; }
        
        this.asteroids.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            size: size
        });
    }
    
    shoot() {
        if(gameState.paused) return;
        this.bullets.push({
            x: this.ship.x,
            y: this.ship.y,
            dx: Math.cos(this.ship.angle) * 10,
            dy: Math.sin(this.ship.angle) * 10,
            life: 60
        });
    }
    
    update() {
        if(gameState.paused) return;
        
        if(this.keys['ArrowLeft']) this.ship.angle -= 0.1;
        if(this.keys['ArrowRight']) this.ship.angle += 0.1;
        if(this.keys['ArrowUp']) {
            this.ship.dx += Math.cos(this.ship.angle) * 0.2;
            this.ship.dy += Math.sin(this.ship.angle) * 0.2;
        }
        
        this.ship.dx *= 0.99;
        this.ship.dy *= 0.99;
        
        this.ship.x += this.ship.dx;
        this.ship.y += this.ship.dy;
        
        if(this.ship.x < 0) this.ship.x = this.canvas.width;
        if(this.ship.x > this.canvas.width) this.ship.x = 0;
        if(this.ship.y < 0) this.ship.y = this.canvas.height;
        if(this.ship.y > this.canvas.height) this.ship.y = 0;
        
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            bullet.life--;
            
            for(let i = 0; i < this.asteroids.length; i++) {
                const asteroid = this.asteroids[i];
                const dx = bullet.x - asteroid.x;
                const dy = bullet.y - asteroid.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < asteroid.size) {
                    this.asteroids.splice(i, 1);
                    gameState.score += 10;
                    updateUI();
                    
                    if(asteroid.size > 15) {
                        this.spawnAsteroid(asteroid.size / 2);
                        this.spawnAsteroid(asteroid.size / 2);
                    }
                    
                    return false;
                }
            }
            
            return bullet.life > 0;
        });
        
        this.asteroids.forEach(asteroid => {
            asteroid.x += asteroid.dx;
            asteroid.y += asteroid.dy;
            
            if(asteroid.x < 0) asteroid.x = this.canvas.width;
            if(asteroid.x > this.canvas.width) asteroid.x = 0;
            if(asteroid.y < 0) asteroid.y = this.canvas.height;
            if(asteroid.y > this.canvas.height) asteroid.y = 0;
            
            const dx = this.ship.x - asteroid.x;
            const dy = this.ship.y - asteroid.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < asteroid.size + this.ship.size) {
                this.gameOver();
            }
        });
        
        if(this.asteroids.length === 0) {
            for(let i = 0; i < 5 + gameState.level; i++) {
                this.spawnAsteroid(40);
            }
            gameState.level++;
            updateUI();
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.ship.size, 0);
        this.ctx.lineTo(-this.ship.size, -this.ship.size/2);
        this.ctx.lineTo(-this.ship.size, this.ship.size/2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
        });
        
        this.ctx.fillStyle = '#ff00ff';
        this.asteroids.forEach(asteroid => {
            this.ctx.beginPath();
            this.ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.ship = {x: 400, y: 300, angle: 0, dx: 0, dy: 0, size: 15};
        this.bullets = [];
        this.asteroids = [];
        for(let i = 0; i < 5; i++) {
            this.spawnAsteroid(40);
        }
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class GravityGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.player = {x: 50, y: 50, size: 20, dy: 0};
        this.gravity = 0.5;
        this.gravityDown = true;
        this.obstacles = [];
        this.speed = 3;
        this.interval = null;
        this.distance = 0;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        document.addEventListener('keydown', (e) => {
            if(e.key === ' ') {
                this.gravityDown = !this.gravityDown;
            }
        });
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    update() {
        if(gameState.paused) return;
        
        if(this.gravityDown) {
            this.player.dy += this.gravity;
        } else {
            this.player.dy -= this.gravity;
        }
        
        this.player.y += this.player.dy;
        
        if(this.player.y < 0 || this.player.y > this.canvas.height - this.player.size) {
            this.gameOver();
            return;
        }
        
        this.distance += this.speed;
        
        if(Math.random() < 0.02) {
            const height = 50 + Math.random() * 150;
            const fromTop = Math.random() > 0.5;
            
            this.obstacles.push({
                x: this.canvas.width,
                y: fromTop ? 0 : this.canvas.height - height,
                width: 30,
                height: height
            });
        }
        
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= this.speed;
            
            if(this.player.x < obs.x + obs.width &&
               this.player.x + this.player.size > obs.x &&
               this.player.y < obs.y + obs.height &&
               this.player.y + this.player.size > obs.y) {
                this.gameOver();
                return false;
            }
            
            return obs.x > -obs.width;
        });
        
        gameState.score = Math.floor(this.distance / 10);
        updateUI();
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = this.gravityDown ? '#000' : '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        
        this.ctx.fillStyle = '#ff00ff';
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillText(`SPACE to flip gravity`, 10, 30);
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.player = {x: 50, y: 50, size: 20, dy: 0};
        this.gravityDown = true;
        this.obstacles = [];
        this.distance = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class ChainGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.circles = [];
        this.explosions = [];
        this.clicksLeft = 3;
        this.interval = null;
        
        for(let i = 0; i < 30; i++) {
            this.circles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
                radius: 15,
                alive: true
            });
        }
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        
        const info = document.createElement('div');
        info.style.cssText = 'text-align: center; margin: 10px; color: #ffff00; font-size: 20px;';
        info.innerHTML = 'Clicks left: <span id="clicks-left">3</span>';
        gameContainer.appendChild(info);
        
        this.canvas.addEventListener('click', (e) => this.click(e));
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    click(e) {
        if(gameState.paused || this.clicksLeft <= 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.explosions.push({x: x, y: y, radius: 0, maxRadius: 100});
        this.clicksLeft--;
        document.getElementById('clicks-left').textContent = this.clicksLeft;
    }
    
    update() {
        if(gameState.paused) return;
        
        this.circles.forEach(circle => {
            if(!circle.alive) return;
            
            circle.x += circle.dx;
            circle.y += circle.dy;
            
            if(circle.x < 0 || circle.x > this.canvas.width) circle.dx *= -1;
            if(circle.y < 0 || circle.y > this.canvas.height) circle.dy *= -1;
        });
        
        this.explosions = this.explosions.filter(exp => {
            exp.radius += 3;
            
            this.circles.forEach(circle => {
                if(!circle.alive) return;
                
                const dx = circle.x - exp.x;
                const dy = circle.y - exp.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < exp.radius + circle.radius) {
                    circle.alive = false;
                    gameState.score += 10;
                    updateUI();
                    this.explosions.push({x: circle.x, y: circle.y, radius: 0, maxRadius: 80});
                }
            });
            
            return exp.radius < exp.maxRadius;
        });
        
        if(this.circles.every(c => !c.alive)) {
            setTimeout(() => {
                alert('YOU WIN! Level up!');
                this.restart();
                gameState.level++;
            }, 500);
        } else if(this.clicksLeft === 0 && this.explosions.length === 0) {
            setTimeout(() => showGameOver(), 500);
        }
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.circles.forEach(circle => {
            if(circle.alive) {
                this.ctx.beginPath();
                this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 3;
        this.explosions.forEach(exp => {
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }
    
    restart() {
        this.circles = [];
        this.explosions = [];
        this.clicksLeft = 3;
        
        for(let i = 0; i < 30 + gameState.level * 5; i++) {
            this.circles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
                radius: 15,
                alive: true
            });
        }
        
        document.getElementById('clicks-left').textContent = this.clicksLeft;
        updateUI();
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}

class Defend2Game {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.core = {x: 300, y: 300, radius: 30, health: 100};
        this.turret = {angle: 0};
        this.bullets = [];
        this.enemies = [];
        this.interval = null;
        this.spawnTimer = 0;
    }
    
    init() {
        gameContainer.appendChild(this.canvas);
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.turret.angle = Math.atan2(y - this.core.y, x - this.core.x);
        });
        
        this.canvas.addEventListener('click', () => this.shoot());
        
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    shoot() {
        if(gameState.paused) return;
        this.bullets.push({
            x: this.core.x,
            y: this.core.y,
            dx: Math.cos(this.turret.angle) * 8,
            dy: Math.sin(this.turret.angle) * 8,
            radius: 5
        });
    }
    
    update() {
        if(gameState.paused) return;
        
        this.spawnTimer++;
        if(this.spawnTimer > 60) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 350;
            this.enemies.push({
                x: this.core.x + Math.cos(angle) * distance,
                y: this.core.y + Math.sin(angle) * distance,
                radius: 15,
                speed: 1 + Math.random()
            });
            this.spawnTimer = 0;
        }
        
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            
            for(let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < enemy.radius + bullet.radius) {
                    this.enemies.splice(i, 1);
                    gameState.score += 10;
                    updateUI();
                    return false;
                }
            }
            
            const distFromCenter = Math.sqrt((bullet.x - this.core.x)**2 + (bullet.y - this.core.y)**2);
            return distFromCenter < 400;
        });
        
        this.enemies = this.enemies.filter(enemy => {
            const dx = this.core.x - enemy.x;
            const dy = this.core.y - enemy.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
            
            if(dist < this.core.radius + enemy.radius) {
                this.core.health -= 10;
                if(this.core.health <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            return true;
        });
        
        this.draw();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for(let i = 1; i <= 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.core.x, this.core.y, i * 60, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        const healthColor = this.core.health > 50 ? '#00ff00' : this.core.health > 25 ? '#ffff00' : '#ff0000';
        this.ctx.fillStyle = healthColor;
        this.ctx.beginPath();
        this.ctx.arc(this.core.x, this.core.y, this.core.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.core.x, this.core.y);
        this.ctx.lineTo(
            this.core.x + Math.cos(this.turret.angle) * 40,
            this.core.y + Math.sin(this.turret.angle) * 40
        );
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.fillStyle = '#ff00ff';
        this.enemies.forEach(enemy => {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Comic Sans MS';
        this.ctx.fillText(`Core HP: ${this.core.health}`, 10, 30);
    }
    
    gameOver() {
        clearInterval(this.interval);
        showGameOver();
    }
    
    restart() {
        this.core = {x: 300, y: 300, radius: 30, health: 100};
        this.bullets = [];
        this.enemies = [];
        this.spawnTimer = 0;
        gameState = { score: 0, lives: 3, level: 1, paused: false };
        updateUI();
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000/60);
    }
    
    cleanup() {
        clearInterval(this.interval);
    }
}