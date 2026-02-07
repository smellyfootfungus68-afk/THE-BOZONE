let currentGame = null;
let animationId = null;

document.getElementById('counter').textContent = Math.floor(Math.random() * 99999) + 10000;

function loadGame(gameName) {
document.querySelector('.game-grid').classList.add('hidden');
document.querySelector('header').classList.add('hidden');
document.getElementById('game-container').classList.remove('hidden');
if (animationId) cancelAnimationFrame(animationId);
if (currentGame && currentGame.cleanup) currentGame.cleanup();
const games = {
snake: SnakeBattle,
pong: CyberPong,
tanks: TankWars,
racing: SpeedRacers,
platforms: PlatformChaos,
duel: QuickDrawDuel,
soccer: MicroSoccer,
blocks: BlockPusher,
bomber: BombMania,
space: SpaceDogfight,
tron: LightCycles,
sumo: SumoRing
};
currentGame = new games[gameName]();
}

function backToMenu() {
if (animationId) cancelAnimationFrame(animationId);
if (currentGame && currentGame.cleanup) currentGame.cleanup();
currentGame = null;
document.querySelector('.game-grid').classList.remove('hidden');
document.querySelector('header').classList.remove('hidden');
document.getElementById('game-container').classList.add('hidden');
}

class SnakeBattle {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🐍 SNAKE BATTLE';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1 (PINK)</strong><br>W/A/S/D to move</div>
<div class="player-controls"><strong>PLAYER 2 (CYAN)</strong><br>Arrow Keys to move</div>
`;
this.gridSize = 20;
this.p1 = {
body: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}],
dir: {x: 1, y: 0},
nextDir: {x: 1, y: 0},
color: '#ff00ff',
dead: false
};
this.p2 = {
body: [{x: 30, y: 20}, {x: 31, y: 20}, {x: 32, y: 20}],
dir: {x: -1, y: 0},
nextDir: {x: -1, y: 0},
color: '#00ffff',
dead: false
};
this.food = this.spawnFood();
this.keys = {};
this.lastUpdate = 0;
this.updateInterval = 100;
window.addEventListener('keydown', this.handleKey.bind(this));
this.gameLoop();
}
handleKey(e) {
const key = e.key.toLowerCase();
if (key === 'w' && this.p1.dir.y === 0) this.p1.nextDir = {x: 0, y: -1};
if (key === 's' && this.p1.dir.y === 0) this.p1.nextDir = {x: 0, y: 1};
if (key === 'a' && this.p1.dir.x === 0) this.p1.nextDir = {x: -1, y: 0};
if (key === 'd' && this.p1.dir.x === 0) this.p1.nextDir = {x: 1, y: 0};
if (e.key === 'ArrowUp' && this.p2.dir.y === 0) this.p2.nextDir = {x: 0, y: -1};
if (e.key === 'ArrowDown' && this.p2.dir.y === 0) this.p2.nextDir = {x: 0, y: 1};
if (e.key === 'ArrowLeft' && this.p2.dir.x === 0) this.p2.nextDir = {x: -1, y: 0};
if (e.key === 'ArrowRight' && this.p2.dir.x === 0) this.p2.nextDir = {x: 1, y: 0};
}
spawnFood() {
return {
x: Math.floor(Math.random() * 40),
y: Math.floor(Math.random() * 30)
};
}
update() {
[this.p1, this.p2].forEach(p => {
if (p.dead) return;
p.dir = p.nextDir;
const head = {x: p.body[0].x + p.dir.x, y: p.body[0].y + p.dir.y};
if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 30) {
p.dead = true;
return;
}
for (let snake of [this.p1, this.p2]) {
for (let seg of snake.body) {
if (head.x === seg.x && head.y === seg.y) {
p.dead = true;
return;
}
}
}
p.body.unshift(head);
if (head.x === this.food.x && head.y === this.food.y) {
this.food = this.spawnFood();
} else {
p.body.pop();
}
});
}
draw() {
this.ctx.fillStyle = '#000';
this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
this.ctx.fillStyle = '#ffff00';
this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
[this.p1, this.p2].forEach(p => {
this.ctx.fillStyle = p.color;
p.body.forEach((seg, i) => {
this.ctx.fillRect(seg.x * this.gridSize, seg.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
if (i === 0) {
this.ctx.fillStyle = '#fff';
this.ctx.fillRect(seg.x * this.gridSize + 5, seg.y * this.gridSize + 5, 3, 3);
this.ctx.fillRect(seg.x * this.gridSize + 12, seg.y * this.gridSize + 5, 3, 3);
this.ctx.fillStyle = p.color;
}
});
});
const status = document.getElementById('game-status');
if (this.p1.dead && this.p2.dead) {
status.textContent = '💀 BOTH DIED! TIE! 💀';
} else if (this.p1.dead) {
status.textContent = '🏆 CYAN WINS! 🏆';
} else if (this.p2.dead) {
status.textContent = '🏆 PINK WINS! 🏆';
} else {
status.textContent = `PINK: ${this.p1.body.length} | CYAN: ${this.p2.body.length}`;
}
}
gameLoop(timestamp = 0) {
if (timestamp - this.lastUpdate > this.updateInterval) {
if (!this.p1.dead || !this.p2.dead) this.update();
this.lastUpdate = timestamp;
}
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {
window.removeEventListener('keydown', this.handleKey.bind(this));
}
}

class CyberPong {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🏓 CYBER PONG';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1 (LEFT)</strong><br>W/S to move</div>
<div class="player-controls"><strong>PLAYER 2 (RIGHT)</strong><br>Arrow Up/Down</div>
`;
this.p1 = {y: 250, score: 0};
this.p2 = {y: 250, score: 0};
this.ball = {x: 400, y: 300, dx: 5, dy: 3};
this.paddleHeight = 100;
this.paddleWidth = 15;
this.keys = {};
window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
update() {
if (this.keys['w'] && this.p1.y > 0) this.p1.y -= 7;
if (this.keys['s'] && this.p1.y < 500) this.p1.y += 7;
if (this.keys['arrowup'] && this.p2.y > 0) this.p2.y -= 7;
if (this.keys['arrowdown'] && this.p2.y < 500) this.p2.y += 7;
this.ball.x += this.ball.dx;
this.ball.y += this.ball.dy;
if (this.ball.y <= 0 || this.ball.y >= 600) this.ball.dy *= -1;
if (this.ball.x <= 20 && this.ball.y >= this.p1.y && this.ball.y <= this.p1.y + this.paddleHeight) {
this.ball.dx = Math.abs(this.ball.dx) * 1.05;
this.ball.dy += (Math.random() - 0.5) * 2;
}
if (this.ball.x >= 765 && this.ball.y >= this.p2.y && this.ball.y <= this.p2.y + this.paddleHeight) {
this.ball.dx = -Math.abs(this.ball.dx) * 1.05;
this.ball.dy += (Math.random() - 0.5) * 2;
}
if (this.ball.x < 0) {
this.p2.score++;
this.reset();
}
if (this.ball.x > 800) {
this.p1.score++;
this.reset();
}
}
reset() {
this.ball = {x: 400, y: 300, dx: (Math.random() > 0.5 ? 5 : -5), dy: (Math.random() - 0.5) * 6};
}
draw() {
this.ctx.fillStyle = '#000';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.strokeStyle = '#00ff00';
this.ctx.setLineDash([10, 10]);
this.ctx.beginPath();
this.ctx.moveTo(400, 0);
this.ctx.lineTo(400, 600);
this.ctx.stroke();
this.ctx.setLineDash([]);
this.ctx.fillStyle = '#ff00ff';
this.ctx.fillRect(5, this.p1.y, this.paddleWidth, this.paddleHeight);
this.ctx.fillStyle = '#00ffff';
this.ctx.fillRect(780, this.p2.y, this.paddleWidth, this.paddleHeight);
this.ctx.fillStyle = '#ffff00';
this.ctx.beginPath();
this.ctx.arc(this.ball.x, this.ball.y, 10, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = '#fff';
this.ctx.font = '40px Comic Sans MS';
this.ctx.fillText(this.p1.score, 200, 50);
this.ctx.fillText(this.p2.score, 550, 50);
document.getElementById('game-status').textContent = this.p1.score >= 10 ? '🏆 PINK WINS! 🏆' : this.p2.score >= 10 ? '🏆 CYAN WINS! 🏆' : 'FIRST TO 10!';
}
gameLoop() {
this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}

class TankWars {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🎯 TANK WARS';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1 (PINK)</strong><br>WASD move | SPACE shoot</div>
<div class="player-controls"><strong>PLAYER 2 (CYAN)</strong><br>Arrows move | ENTER shoot</div>
`;
this.p1 = {x: 100, y: 300, angle: 0, health: 5, color: '#ff00ff'};
this.p2 = {x: 700, y: 300, angle: Math.PI, health: 5, color: '#00ffff'};
this.bullets = [];
this.obstacles = [];
for (let i = 0; i < 8; i++) {
this.obstacles.push({
x: 150 + Math.random() * 500,
y: 100 + Math.random() * 400,
w: 40 + Math.random() * 40,
h: 40 + Math.random() * 40
});
}
this.keys = {};
window.addEventListener('keydown', e => {
this.keys[e.key.toLowerCase()] = true;
if (e.key === ' ' && this.bullets.filter(b => b.player === 1).length < 3) {
this.bullets.push({
x: this.p1.x + Math.cos(this.p1.angle) * 25,
y: this.p1.y + Math.sin(this.p1.angle) * 25,
dx: Math.cos(this.p1.angle) * 8,
dy: Math.sin(this.p1.angle) * 8,
player: 1
});
}
if (e.key === 'Enter' && this.bullets.filter(b => b.player === 2).length < 3) {
this.bullets.push({
x: this.p2.x + Math.cos(this.p2.angle) * 25,
y: this.p2.y + Math.sin(this.p2.angle) * 25,
dx: Math.cos(this.p2.angle) * 8,
dy: Math.sin(this.p2.angle) * 8,
player: 2
});
}
});
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
update() {
if (this.keys['w']) {
this.p1.x += Math.cos(this.p1.angle) * 3;
this.p1.y += Math.sin(this.p1.angle) * 3;
}
if (this.keys['s']) {
this.p1.x -= Math.cos(this.p1.angle) * 3;
this.p1.y -= Math.sin(this.p1.angle) * 3;
}
if (this.keys['a']) this.p1.angle -= 0.1;
if (this.keys['d']) this.p1.angle += 0.1;
if (this.keys['arrowup']) {
this.p2.x += Math.cos(this.p2.angle) * 3;
this.p2.y += Math.sin(this.p2.angle) * 3;
}
if (this.keys['arrowdown']) {
this.p2.x -= Math.cos(this.p2.angle) * 3;
this.p2.y -= Math.sin(this.p2.angle) * 3;
}
if (this.keys['arrowleft']) this.p2.angle -= 0.1;
if (this.keys['arrowright']) this.p2.angle += 0.1;
this.p1.x = Math.max(20, Math.min(780, this.p1.x));
this.p1.y = Math.max(20, Math.min(580, this.p1.y));
this.p2.x = Math.max(20, Math.min(780, this.p2.x));
this.p2.y = Math.max(20, Math.min(580, this.p2.y));
this.bullets = this.bullets.filter(b => {
b.x += b.dx;
b.y += b.dy;
if (b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) return false;
for (let obs of this.obstacles) {
if (b.x > obs.x && b.x < obs.x + obs.w && b.y > obs.y && b.y < obs.y + obs.h) return false;
}
const target = b.player === 1 ? this.p2 : this.p1;
const dist = Math.hypot(b.x - target.x, b.y - target.y);
if (dist < 20) {
target.health--;
return false;
}
return true;
});
}
draw() {
this.ctx.fillStyle = '#1a1a1a';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = '#444';
this.obstacles.forEach(obs => this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h));
[this.p1, this.p2].forEach(p => {
this.ctx.save();
this.ctx.translate(p.x, p.y);
this.ctx.rotate(p.angle);
this.ctx.fillStyle = p.color;
this.ctx.fillRect(-20, -15, 40, 30);
this.ctx.fillRect(15, -5, 20, 10);
this.ctx.restore();
this.ctx.fillStyle = '#00ff00';
this.ctx.fillRect(p.x - 25, p.y - 30, p.health * 10, 5);
});
this.bullets.forEach(b => {
this.ctx.fillStyle = b.player === 1 ? '#ff00ff' : '#00ffff';
this.ctx.beginPath();
this.ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
this.ctx.fill();
});
document.getElementById('game-status').textContent = this.p1.health <= 0 ? '🏆 CYAN WINS! 🏆' : this.p2.health <= 0 ? '🏆 PINK WINS! 🏆' : `PINK: ${this.p1.health} ❤️ | CYAN: ${this.p2.health} ❤️`;
}
gameLoop() {
if (this.p1.health > 0 && this.p2.health > 0) this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}

class SpeedRacers {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🏁 SPEED RACERS';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1 (PINK)</strong><br>W/S speed | A/D steer</div>
<div class="player-controls"><strong>PLAYER 2 (CYAN)</strong><br>↑/↓ speed | ←/→ steer</div>
`;
this.p1 = {x: 100, y: 250, angle: 0, speed: 0, color: '#ff00ff', laps: 0, checkpoint: 0};
this.p2 = {x: 100, y: 350, angle: 0, speed: 0, color: '#00ffff', laps: 0, checkpoint: 0};
this.checkpoints = [
{x: 400, y: 100, w: 50, h: 200, id: 1},
{x: 650, y: 300, w: 100, h: 50, id: 2},
{x: 200, y: 450, w: 50, h: 100, id: 3}
];
this.keys = {};
window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
update() {
[{p: this.p1, up: 'w', down: 's', left: 'a', right: 'd'}, 
{p: this.p2, up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright'}].forEach(({p, up, down, left, right}) => {
if (this.keys[up]) p.speed = Math.min(p.speed + 0.3, 8);
if (this.keys[down]) p.speed = Math.max(p.speed - 0.5, -3);
if (!this.keys[up] && !this.keys[down]) p.speed *= 0.95;
if (this.keys[left] && Math.abs(p.speed) > 0.5) p.angle -= 0.05 * Math.abs(p.speed) / 4;
if (this.keys[right] && Math.abs(p.speed) > 0.5) p.angle += 0.05 * Math.abs(p.speed) / 4;
p.x += Math.cos(p.angle) * p.speed;
p.y += Math.sin(p.angle) * p.speed;
if (p.x < 50 || p.x > 750 || p.y < 50 || p.y > 550) {
p.speed *= -0.5;
p.x = Math.max(50, Math.min(750, p.x));
p.y = Math.max(50, Math.min(550, p.y));
}
this.checkpoints.forEach(cp => {
if (p.x > cp.x && p.x < cp.x + cp.w && p.y > cp.y && p.y < cp.y + cp.h) {
if (cp.id === p.checkpoint + 1 || (cp.id === 1 && p.checkpoint === 3)) {
p.checkpoint = cp.id;
if (cp.id === 1 && p.checkpoint === 1) p.laps++;
}
}
});
});
}
draw() {
this.ctx.fillStyle = '#2d5016';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.strokeStyle = '#fff';
this.ctx.lineWidth = 3;
this.ctx.strokeRect(50, 50, 700, 500);
this.checkpoints.forEach((cp, i) => {
this.ctx.fillStyle = `rgba(255, 255, 0, ${0.3 + Math.sin(Date.now() / 200) * 0.2})`;
this.ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
});
this.ctx.fillStyle = '#fff';
this.ctx.fillRect(80, 200, 60, 200);
[this.p1, this.p2].forEach(p => {
this.ctx.save();
this.ctx.translate(p.x, p.y);
this.ctx.rotate(p.angle);
this.ctx.fillStyle = p.color;
this.ctx.fillRect(-15, -10, 30, 20);
this.ctx.fillStyle = '#222';
this.ctx.fillRect(-12, -8, 8, 4);
this.ctx.fillRect(-12, 4, 8, 4);
this.ctx.fillRect(4, -8, 8, 4);
this.ctx.fillRect(4, 4, 8, 4);
this.ctx.restore();
});
this.ctx.fillStyle = '#fff';
this.ctx.font = '20px Comic Sans MS';
this.ctx.fillText(`P1: ${this.p1.laps} laps`, 10, 30);
this.ctx.fillText(`P2: ${this.p2.laps} laps`, 10, 60);
document.getElementById('game-status').textContent = this.p1.laps >= 3 ? '🏆 PINK WINS! 🏆' : this.p2.laps >= 3 ? '🏆 CYAN WINS! 🏆' : 'FIRST TO 3 LAPS!';
}
gameLoop() {
this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}

class PlatformChaos {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '📦 PLATFORM CHAOS';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1 (PINK)</strong><br>A/D move | W jump</div>
<div class="player-controls"><strong>PLAYER 2 (CYAN)</strong><br>←/→ move | ↑ jump</div>
`;
this.p1 = {x: 100, y: 400, vx: 0, vy: 0, w: 30, h: 30, grounded: false, color: '#ff00ff', kills: 0};
this.p2 = {x: 700, y: 400, vx: 0, vy: 0, w: 30, h: 30, grounded: false, color: '#00ffff', kills: 0};
this.platforms = [
{x: 0, y: 550, w: 800, h: 50},
{x: 150, y: 450, w: 150, h: 20},
{x: 500, y: 450, w: 150, h: 20},
{x: 300, y: 350, w: 200, h: 20},
{x: 100, y: 250, w: 120, h: 20},
{x: 580, y: 250, w: 120, h: 20},
{x: 350, y: 150, w: 100, h: 20}
];
this.keys = {};
window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
update() {
[{p: this.p1, left: 'a', right: 'd', jump: 'w'}, 
{p: this.p2, left: 'arrowleft', right: 'arrowright', jump: 'arrowup'}].forEach(({p, left, right, jump}) => {
if (this.keys[left]) p.vx = -5;
else if (this.keys[right]) p.vx = 5;
else p.vx *= 0.8;
if (this.keys[jump] && p.grounded) {
p.vy = -15;
p.grounded = false;
}
p.vy += 0.6;
p.x += p.vx;
p.y += p.vy;
p.grounded = false;
this.platforms.forEach(plat => {
if (p.x + p.w > plat.x && p.x < plat.x + plat.w) {
if (p.y + p.h > plat.y && p.y + p.h < plat.y + 20 && p.vy > 0) {
p.y = plat.y - p.h;
p.vy = 0;
p.grounded = true;
}
if (p.y < plat.y + plat.h && p.y > plat.y && p.vy < 0) {
p.y = plat.y + plat.h;
p.vy = 0;
}
}
if (p.y + p.h > plat.y && p.y < plat.y + plat.h) {
if (p.x + p.w > plat.x && p.x + p.w < plat.x + 10) {
p.x = plat.x - p.w;
p.vx = 0;
}
if (p.x < plat.x + plat.w && p.x > plat.x + plat.w - 10) {
p.x = plat.x + plat.w;
p.vx = 0;
}
}
});
if (p.y > 650) {
const opponent = p === this.p1 ? this.p2 : this.p1;
opponent.kills++;
p.x = p === this.p1 ? 100 : 700;
p.y = 200;
p.vx = 0;
p.vy = 0;
}
});
const dx = this.p1.x - this.p2.x;
const dy = this.p1.y - this.p2.y;
const dist = Math.hypot(dx, dy);
if (dist < 35) {
const force = 10;
this.p1.vx += (dx / dist) * force;
this.p1.vy += (dy / dist) * force;
this.p2.vx -= (dx / dist) * force;
this.p2.vy -= (dy / dist) * force;
}
}
draw() {
this.ctx.fillStyle = '#87CEEB';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = '#654321';
this.platforms.forEach(p => this.ctx.fillRect(p.x, p.y, p.w, p.h));
[this.p1, this.p2].forEach(p => {
this.ctx.fillStyle = p.color;
this.ctx.fillRect(p.x, p.y, p.w, p.h);
this.ctx.fillStyle = '#fff';
this.ctx.fillRect(p.x + 5, p.y + 5, 5, 5);
this.ctx.fillRect(p.x + 20, p.y + 5, 5, 5);
});
document.getElementById('game-status').textContent = `PINK: ${this.p1.kills} | CYAN: ${this.p2.kills} | FIRST TO 5!`;
if (this.p1.kills >= 5) document.getElementById('game-status').textContent = '🏆 PINK WINS! 🏆';
if (this.p2.kills >= 5) document.getElementById('game-status').textContent = '🏆 CYAN WINS! 🏆';
}
gameLoop() {
this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}

class QuickDrawDuel {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🔫 QUICK DRAW DUEL';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>Press SPACE when green!</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>Press ENTER when green!</div>
`;
this.state = 'waiting';
this.countdown = 3;
this.p1won = 0;
this.p2won = 0;
this.message = 'GET READY!';
this.countdownTimer = null;
this.keyHandler = this.handleKey.bind(this);
window.addEventListener('keydown', this.keyHandler);
this.startCountdown();
this.gameLoop();
}
startCountdown() {
this.state = 'countdown';
this.countdown = 3;
this.message = '3';
this.countdownTimer = setInterval(() => {
this.countdown--;
if (this.countdown === 2) this.message = '2';
else if (this.countdown === 1) this.message = '1';
else if (this.countdown === 0) {
clearInterval(this.countdownTimer);
setTimeout(() => {
this.state = 'draw';
this.message = 'DRAW!!!';
this.drawTime = Date.now();
}, Math.random() * 3000 + 1000);
}
}, 1000);
}
handleKey(e) {
if (this.state === 'draw') {
const reaction = Date.now() - this.drawTime;
if (e.key === ' ') {
this.p1won++;
this.message = `PINK WINS! ${reaction}ms`;
this.state = 'result';
setTimeout(() => this.startCountdown(), 2000);
} else if (e.key === 'Enter') {
this.p2won++;
this.message = `CYAN WINS! ${reaction}ms`;
this.state = 'result';
setTimeout(() => this.startCountdown(), 2000);
}
} else if (this.state === 'countdown' && (e.key === ' ' || e.key === 'Enter')) {
this.message = (e.key === ' ' ? 'PINK' : 'CYAN') + ' SHOT TOO EARLY!';
this.state = 'result';
if (e.key === ' ') this.p2won++;
else this.p1won++;
clearInterval(this.countdownTimer);
setTimeout(() => this.startCountdown(), 2000);
}
}
draw() {
this.ctx.fillStyle = this.state === 'draw' ? '#00ff00' : '#ff0000';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = '#000';
this.ctx.font = 'bold 80px Comic Sans MS';
this.ctx.textAlign = 'center';
this.ctx.fillText(this.message, 400, 300);
this.ctx.font = 'bold 40px Comic Sans MS';
this.ctx.fillText(`PINK: ${this.p1won}`, 200, 500);
this.ctx.fillText(`CYAN: ${this.p2won}`, 600, 500);
document.getElementById('game-status').textContent = this.p1won >= 5 ? '🏆 PINK WINS MATCH! 🏆' : this.p2won >= 5 ? '🏆 CYAN WINS MATCH! 🏆' : 'FIRST TO 5 WINS!';
}
gameLoop() {
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {
window.removeEventListener('keydown', this.keyHandler);
if (this.countdownTimer) clearInterval(this.countdownTimer);
}
}

class MicroSoccer {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '⚽ MICRO SOCCER';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>WASD to move</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>Arrow keys to move</div>
`;
this.p1 = {x: 200, y: 300, vx: 0, vy: 0, r: 20, color: '#ff00ff', score: 0};
this.p2 = {x: 600, y: 300, vx: 0, vy: 0, r: 20, color: '#00ffff', score: 0};
this.ball = {x: 400, y: 300, vx: 0, vy: 0, r: 12};
this.keys = {};
window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
update() {
const speed = 0.5;
if (this.keys['w']) this.p1.vy -= speed;
if (this.keys['s']) this.p1.vy += speed;
if (this.keys['a']) this.p1.vx -= speed;
if (this.keys['d']) this.p1.vx += speed;
if (this.keys['arrowup']) this.p2.vy -= speed;
if (this.keys['arrowdown']) this.p2.vy += speed;
if (this.keys['arrowleft']) this.p2.vx -= speed;
if (this.keys['arrowright']) this.p2.vx += speed;
this.p1.vx *= 0.92;
this.p1.vy *= 0.92;
this.p2.vx *= 0.92;
this.p2.vy *= 0.92;
this.p1.x += this.p1.vx;
this.p1.y += this.p1.vy;
this.p2.x += this.p2.vx;
this.p2.y += this.p2.vy;
[this.p1, this.p2].forEach(p => {
if (p.x < p.r) { p.x = p.r; p.vx *= -0.5; }
if (p.x > 800 - p.r) { p.x = 800 - p.r; p.vx *= -0.5; }
if (p.y < p.r) { p.y = p.r; p.vy *= -0.5; }
if (p.y > 600 - p.r) { p.y = 600 - p.r; p.vy *= -0.5; }
const dx = this.ball.x - p.x;
const dy = this.ball.y - p.y;
const dist = Math.hypot(dx, dy);
if (dist < p.r + this.ball.r) {
const angle = Math.atan2(dy, dx);
const force = 3;
this.ball.vx += Math.cos(angle) * force;
this.ball.vy += Math.sin(angle) * force;
}
});
this.ball.vx *= 0.98;
this.ball.vy *= 0.98;
this.ball.x += this.ball.vx;
this.ball.y += this.ball.vy;
if (this.ball.y < this.ball.r || this.ball.y > 600 - this.ball.r) {
this.ball.vy *= -0.8;
this.ball.y = this.ball.y < this.ball.r ? this.ball.r : 600 - this.ball.r;
}
if (this.ball.x < this.ball.r) {
if (this.ball.y > 250 && this.ball.y < 350) {
this.p2.score++;
this.reset();
} else {
this.ball.vx *= -0.8;
this.ball.x = this.ball.r;
}
}
if (this.ball.x > 800 - this.ball.r) {
if (this.ball.y > 250 && this.ball.y < 350) {
this.p1.score++;
this.reset();
} else {
this.ball.vx *= -0.8;
this.ball.x = 800 - this.ball.r;
}
}
}
reset() {
this.ball = {x: 400, y: 300, vx: 0, vy: 0, r: 12};
this.p1.x = 200;
this.p1.y = 300;
this.p2.x = 600;
this.p2.y = 300;
this.p1.vx = this.p1.vy = this.p2.vx = this.p2.vy = 0;
}
draw() {
this.ctx.fillStyle = '#2d8b3c';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.strokeStyle = '#fff';
this.ctx.lineWidth = 3;
this.ctx.strokeRect(0, 0, 800, 600);
this.ctx.beginPath();
this.ctx.moveTo(400, 0);
this.ctx.lineTo(400, 600);
this.ctx.stroke();
this.ctx.beginPath();
this.ctx.arc(400, 300, 80, 0, Math.PI * 2);
this.ctx.stroke();
this.ctx.fillStyle = 'rgba(255,0,255,0.3)';
this.ctx.fillRect(0, 250, 40, 100);
this.ctx.fillStyle = 'rgba(0,255,255,0.3)';
this.ctx.fillRect(760, 250, 40, 100);
this.ctx.fillStyle = this.p1.color;
this.ctx.beginPath();
this.ctx.arc(this.p1.x, this.p1.y, this.p1.r, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = this.p2.color;
this.ctx.beginPath();
this.ctx.arc(this.p2.x, this.p2.y, this.p2.r, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = '#fff';
this.ctx.beginPath();
this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = '#000';
this.ctx.font = '30px Comic Sans MS';
this.ctx.fillText(this.p1.score, 350, 50);
this.ctx.fillText(this.p2.score, 430, 50);
document.getElementById('game-status').textContent = this.p1.score >= 5 ? '🏆 PINK WINS! 🏆' : this.p2.score >= 5 ? '🏆 CYAN WINS! 🏆' : 'FIRST TO 5 GOALS!';
}
gameLoop() {
this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}

class BlockPusher {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🧱 BLOCK PUSHER';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>WASD to move & push</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>Arrows to move & push</div>
`;
this.p1 = {x: 100, y: 100, w: 40, h: 40, color: '#ff00ff', blocks: 0};
this.p2 = {x: 660, y: 460, w: 40, h: 40, color: '#00ffff', blocks: 0};
this.blocks = [];
for (let i = 0; i < 15; i++) {
this.blocks.push({
x: 200 + Math.random() * 400,
y: 150 + Math.random() * 300,
w: 50,
h: 50,
vx: 0,
vy: 0
});
}
this.zone1 = {x: 0, y: 0, w: 150, h: 150};
this.zone2 = {x: 650, y: 450, w: 150, h: 150};
this.keys = {};
window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
update() {
const speed = 4;
let p1dx = 0, p1dy = 0, p2dx = 0, p2dy = 0;
if (this.keys['w']) p1dy = -speed;
if (this.keys['s']) p1dy = speed;
if (this.keys['a']) p1dx = -speed;
if (this.keys['d']) p1dx = speed;
if (this.keys['arrowup']) p2dy = -speed;
if (this.keys['arrowdown']) p2dy = speed;
if (this.keys['arrowleft']) p2dx = -speed;
if (this.keys['arrowright']) p2dx = speed;
this.p1.x += p1dx;
this.p1.y += p1dy;
this.p2.x += p2dx;
this.p2.y += p2dy;
this.p1.x = Math.max(0, Math.min(760, this.p1.x));
this.p1.y = Math.max(0, Math.min(560, this.p1.y));
this.p2.x = Math.max(0, Math.min(760, this.p2.x));
this.p2.y = Math.max(0, Math.min(560, this.p2.y));
[this.p1, this.p2].forEach(p => {
this.blocks.forEach(b => {
if (p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y) {
const overlapX = Math.min(p.x + p.w, b.x + b.w) - Math.max(p.x, b.x);
const overlapY = Math.min(p.y + p.h, b.y + b.h) - Math.max(p.y, b.y);
if (overlapX < overlapY) {
if (p.x < b.x) b.vx = 5;
else b.vx = -5;
} else {
if (p.y < b.y) b.vy = 5;
else b.vy = -5;
}
}
});
});
this.blocks.forEach(b => {
b.x += b.vx;
b.y += b.vy;
b.vx *= 0.85;
b.vy *= 0.85;
b.x = Math.max(0, Math.min(750, b.x));
b.y = Math.max(0, Math.min(550, b.y));
});
this.p1.blocks = 0;
this.p2.blocks = 0;
this.blocks.forEach(b => {
if (b.x < this.zone1.x + this.zone1.w && b.y < this.zone1.y + this.zone1.h) this.p1.blocks++;
if (b.x > this.zone2.x && b.y > this.zone2.y) this.p2.blocks++;
});
}
draw() {
this.ctx.fillStyle = '#333';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = 'rgba(255,0,255,0.3)';
this.ctx.fillRect(this.zone1.x, this.zone1.y, this.zone1.w, this.zone1.h);
this.ctx.fillStyle = 'rgba(0,255,255,0.3)';
this.ctx.fillRect(this.zone2.x, this.zone2.y, this.zone2.w, this.zone2.h);
this.ctx.strokeStyle = '#fff';
this.ctx.lineWidth = 3;
this.ctx.strokeRect(this.zone1.x, this.zone1.y, this.zone1.w, this.zone1.h);
this.ctx.strokeRect(this.zone2.x, this.zone2.y, this.zone2.w, this.zone2.h);
this.blocks.forEach(b => {
this.ctx.fillStyle = '#ffff00';
this.ctx.fillRect(b.x, b.y, b.w, b.h);
this.ctx.strokeStyle = '#000';
this.ctx.strokeRect(b.x, b.y, b.w, b.h);
});
this.ctx.fillStyle = this.p1.color;
this.ctx.fillRect(this.p1.x, this.p1.y, this.p1.w, this.p1.h);
this.ctx.fillStyle = this.p2.color;
this.ctx.fillRect(this.p2.x, this.p2.y, this.p2.w, this.p2.h);
document.getElementById('game-status').textContent = this.p1.blocks >= 8 ? '🏆 PINK WINS! 🏆' : this.p2.blocks >= 8 ? '🏆 CYAN WINS! 🏆' : `PINK: ${this.p1.blocks} | CYAN: ${this.p2.blocks} | GET 8 TO WIN!`;
}
gameLoop() {
this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}

class BombMania {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '💣 BOMB MANIA';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>WASD move | SPACE bomb</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>Arrows move | ENTER bomb</div>
`;
this.p1 = {x: 100, y: 100, w: 35, h: 35, color: '#ff00ff', alive: true, bombs: 2};
this.p2 = {x: 700, y: 500, w: 35, h: 35, color: '#00ffff', alive: true, bombs: 2};
this.bombs = [];
this.explosions = [];
this.walls = [];
this.powerups = [];
for (let x = 1; x < 15; x++) {
for (let y = 1; y < 11; y++) {
if ((x + y) % 2 === 1 && Math.random() > 0.3) {
this.walls.push({x: x * 50, y: y * 50, w: 50, h: 50, breakable: Math.random() > 0.5});
}
}
}
this.keys = {};
this.keyHandler = this.handleKey.bind(this);
window.addEventListener('keydown', this.keyHandler);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
handleKey(e) {
this.keys[e.key.toLowerCase()] = true;
if (e.key === ' ' && this.p1.bombs > 0) {
const bx = Math.floor(this.p1.x / 50) * 50;
const by = Math.floor(this.p1.y / 50) * 50;
if (!this.bombs.find(b => b.x === bx && b.y === by)) {
this.bombs.push({x: bx, y: by, timer: 2000, owner: 1});
this.p1.bombs--;
}
}
if (e.key === 'Enter' && this.p2.bombs > 0) {
const bx = Math.floor(this.p2.x / 50) * 50;
const by = Math.floor(this.p2.y / 50) * 50;
if (!this.bombs.find(b => b.x === bx && b.y === by)) {
this.bombs.push({x: bx, y: by, timer: 2000, owner: 2});
this.p2.bombs--;
}
}
}
update() {
const speed = 3;
if (this.keys['w']) this.p1.y -= speed;
if (this.keys['s']) this.p1.y += speed;
if (this.keys['a']) this.p1.x -= speed;
if (this.keys['d']) this.p1.x += speed;
if (this.keys['arrowup']) this.p2.y -= speed;
if (this.keys['arrowdown']) this.p2.y += speed;
if (this.keys['arrowleft']) this.p2.x -= speed;
if (this.keys['arrowright']) this.p2.x += speed;
[this.p1, this.p2].forEach(p => {
p.x = Math.max(0, Math.min(765, p.x));
p.y = Math.max(0, Math.min(565, p.y));
this.walls.forEach(w => {
if (p.x < w.x + w.w && p.x + p.w > w.x && p.y < w.y + w.h && p.y + p.h > w.y) {
const overlapX = Math.min(p.x + p.w, w.x + w.w) - Math.max(p.x, w.x);
const overlapY = Math.min(p.y + p.h, w.y + w.h) - Math.max(p.y, w.y);
if (overlapX < overlapY) {
p.x += p.x < w.x ? -overlapX : overlapX;
} else {
p.y += p.y < w.y ? -overlapY : overlapY;
}
}
});
});
this.bombs = this.bombs.filter(b => {
b.timer -= 16;
if (b.timer <= 0) {
this.explosions.push({x: b.x, y: b.y, timer: 500});
for (let dx = -1; dx <= 1; dx++) {
for (let dy = -1; dy <= 1; dy++) {
if (Math.abs(dx) + Math.abs(dy) <= 2) {
this.explosions.push({x: b.x + dx * 50, y: b.y + dy * 50, timer: 500});
}
}
}
const owner = b.owner === 1 ? this.p1 : this.p2;
owner.bombs++;
return false;
}
return true;
});
this.explosions = this.explosions.filter(e => {
e.timer -= 16;
[this.p1, this.p2].forEach(p => {
if (p.alive && Math.abs(p.x - e.x) < 50 && Math.abs(p.y - e.y) < 50) {
p.alive = false;
}
});
this.walls = this.walls.filter(w => {
if (w.breakable && Math.abs(w.x - e.x) < 30 && Math.abs(w.y - e.y) < 30) {
if (Math.random() > 0.7) {
this.powerups.push({x: w.x, y: w.y, type: 'bomb'});
}
return false;
}
return true;
});
return e.timer > 0;
});
[this.p1, this.p2].forEach(p => {
this.powerups = this.powerups.filter(pu => {
if (Math.abs(p.x - pu.x) < 40 && Math.abs(p.y - pu.y) < 40) {
p.bombs++;
return false;
}
return true;
});
});
}
draw() {
this.ctx.fillStyle = '#1a4d1a';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = '#666';
this.walls.forEach(w => {
this.ctx.fillStyle = w.breakable ? '#8b4513' : '#444';
this.ctx.fillRect(w.x, w.y, w.w, w.h);
});
this.powerups.forEach(pu => {
this.ctx.fillStyle = '#ffff00';
this.ctx.fillRect(pu.x + 15, pu.y + 15, 20, 20);
});
this.bombs.forEach(b => {
this.ctx.fillStyle = '#000';
this.ctx.beginPath();
this.ctx.arc(b.x + 25, b.y + 25, 15, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = '#ff0000';
this.ctx.fillRect(b.x + 22, b.y + 10, 6, 10);
});
this.explosions.forEach(e => {
this.ctx.fillStyle = `rgba(255, 100, 0, ${e.timer / 500})`;
this.ctx.fillRect(e.x, e.y, 50, 50);
});
if (this.p1.alive) {
this.ctx.fillStyle = this.p1.color;
this.ctx.fillRect(this.p1.x, this.p1.y, this.p1.w, this.p1.h);
}
if (this.p2.alive) {
this.ctx.fillStyle = this.p2.color;
this.ctx.fillRect(this.p2.x, this.p2.y, this.p2.w, this.p2.h);
}
this.ctx.fillStyle = '#fff';
this.ctx.font = '20px Comic Sans MS';
this.ctx.fillText(`P1 Bombs: ${this.p1.bombs}`, 10, 25);
this.ctx.fillText(`P2 Bombs: ${this.p2.bombs}`, 650, 25);
document.getElementById('game-status').textContent = !this.p1.alive && !this.p2.alive ? '💀 DOUBLE KO! 💀' : !this.p1.alive ? '🏆 CYAN WINS! 🏆' : !this.p2.alive ? '🏆 PINK WINS! 🏆' : 'BOMB YOUR OPPONENT!';
}
gameLoop() {
if (this.p1.alive || this.p2.alive) this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {
window.removeEventListener('keydown', this.keyHandler);
}
}

class SpaceDogfight {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🚀 SPACE DOGFIGHT';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>A/D rotate | W thrust | SPACE shoot</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>←/→ rotate | ↑ thrust | ENTER shoot</div>
`;
this.p1 = {x: 200, y: 300, vx: 0, vy: 0, angle: 0, health: 5, color: '#ff00ff'};
this.p2 = {x: 600, y: 300, vx: 0, vy: 0, angle: Math.PI, health: 5, color: '#00ffff'};
this.bullets = [];
this.stars = [];
for (let i = 0; i < 100; i++) {
this.stars.push({x: Math.random() * 800, y: Math.random() * 600, size: Math.random() * 2});
}
this.keys = {};
this.keyHandler = this.handleKey.bind(this);
window.addEventListener('keydown', this.keyHandler);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.gameLoop();
}
handleKey(e) {
this.keys[e.key.toLowerCase()] = true;
if (e.key === ' ') {
this.bullets.push({
x: this.p1.x + Math.cos(this.p1.angle) * 20,
y: this.p1.y + Math.sin(this.p1.angle) * 20,
vx: this.p1.vx + Math.cos(this.p1.angle) * 10,
vy: this.p1.vy + Math.sin(this.p1.angle) * 10,
owner: 1,
life: 100
});
}
if (e.key === 'Enter') {
this.bullets.push({
x: this.p2.x + Math.cos(this.p2.angle) * 20,
y: this.p2.y + Math.sin(this.p2.angle) * 20,
vx: this.p2.vx + Math.cos(this.p2.angle) * 10,
vy: this.p2.vy + Math.sin(this.p2.angle) * 10,
owner: 2,
life: 100
});
}
}
update() {
if (this.keys['a']) this.p1.angle -= 0.08;
if (this.keys['d']) this.p1.angle += 0.08;
if (this.keys['w']) {
this.p1.vx += Math.cos(this.p1.angle) * 0.3;
this.p1.vy += Math.sin(this.p1.angle) * 0.3;
}
if (this.keys['arrowleft']) this.p2.angle -= 0.08;
if (this.keys['arrowright']) this.p2.angle += 0.08;
if (this.keys['arrowup']) {
this.p2.vx += Math.cos(this.p2.angle) * 0.3;
this.p2.vy += Math.sin(this.p2.angle) * 0.3;
}
[this.p1, this.p2].forEach(p => {
p.vx *= 0.99;
p.vy *= 0.99;
p.x += p.vx;
p.y += p.vy;
if (p.x < 0) p.x = 800;
if (p.x > 800) p.x = 0;
if (p.y < 0) p.y = 600;
if (p.y > 600) p.y = 0;
});
this.bullets = this.bullets.filter(b => {
b.x += b.vx;
b.y += b.vy;
b.life--;
if (b.x < 0) b.x = 800;
if (b.x > 800) b.x = 0;
if (b.y < 0) b.y = 600;
if (b.y > 600) b.y = 0;
const target = b.owner === 1 ? this.p2 : this.p1;
const dist = Math.hypot(b.x - target.x, b.y - target.y);
if (dist < 15) {
target.health--;
return false;
}
return b.life > 0;
});
}
draw() {
this.ctx.fillStyle = '#000';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = '#fff';
this.stars.forEach(s => {
this.ctx.fillRect(s.x, s.y, s.size, s.size);
});
[this.p1, this.p2].forEach(p => {
this.ctx.save();
this.ctx.translate(p.x, p.y);
this.ctx.rotate(p.angle);
this.ctx.fillStyle = p.color;
this.ctx.beginPath();
this.ctx.moveTo(15, 0);
this.ctx.lineTo(-10, -8);
this.ctx.lineTo(-10, 8);
this.ctx.closePath();
this.ctx.fill();
this.ctx.restore();
this.ctx.fillStyle = '#00ff00';
this.ctx.fillRect(p.x - 25, p.y - 25, p.health * 10, 3);
});
this.bullets.forEach(b => {
this.ctx.fillStyle = b.owner === 1 ? '#ff00ff' : '#00ffff';
this.ctx.beginPath();
this.ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
this.ctx.fill();
});
document.getElementById('game-status').textContent = this.p1.health <= 0 ? '🏆 CYAN WINS! 🏆' : this.p2.health <= 0 ? '🏆 PINK WINS! 🏆' : `PINK: ${this.p1.health}❤️ | CYAN: ${this.p2.health}❤️`;
}
gameLoop() {
if (this.p1.health > 0 && this.p2.health > 0) this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {
window.removeEventListener('keydown', this.keyHandler);
}
}

class LightCycles {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '💠 LIGHT CYCLES';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>A/D to turn</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>←/→ to turn</div>
`;
this.gridSize = 4;
this.p1 = {x: 100, y: 300, dir: 0, trail: [], color: '#ff00ff', alive: true};
this.p2 = {x: 700, y: 300, dir: 2, trail: [], color: '#00ffff', alive: true};
this.dirs = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}];
this.grid = Array(200).fill().map(() => Array(150).fill(0));
this.lastUpdate = 0;
this.keyHandler = this.handleKey.bind(this);
window.addEventListener('keydown', this.keyHandler);
this.gameLoop();
}
handleKey(e) {
if (e.key.toLowerCase() === 'a') this.p1.dir = (this.p1.dir + 3) % 4;
if (e.key.toLowerCase() === 'd') this.p1.dir = (this.p1.dir + 1) % 4;
if (e.key === 'ArrowLeft') this.p2.dir = (this.p2.dir + 3) % 4;
if (e.key === 'ArrowRight') this.p2.dir = (this.p2.dir + 1) % 4;
}
update() {
[this.p1, this.p2].forEach((p, i) => {
if (!p.alive) return;
const dir = this.dirs[p.dir];
p.x += dir.x * this.gridSize;
p.y += dir.y * this.gridSize;
const gx = Math.floor(p.x / this.gridSize);
const gy = Math.floor(p.y / this.gridSize);
if (gx < 0 || gx >= 200 || gy < 0 || gy >= 150 || this.grid[gx][gy] !== 0) {
p.alive = false;
return;
}
this.grid[gx][gy] = i + 1;
p.trail.push({x: p.x, y: p.y});
});
}
draw() {
this.ctx.fillStyle = '#000';
this.ctx.fillRect(0, 0, 800, 600);
for (let x = 0; x < 200; x++) {
for (let y = 0; y < 150; y++) {
if (this.grid[x][y] === 1) {
this.ctx.fillStyle = this.p1.color;
this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
}
if (this.grid[x][y] === 2) {
this.ctx.fillStyle = this.p2.color;
this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
}
}
}
if (this.p1.alive) {
this.ctx.fillStyle = '#fff';
this.ctx.fillRect(this.p1.x - 2, this.p1.y - 2, 8, 8);
}
if (this.p2.alive) {
this.ctx.fillStyle = '#fff';
this.ctx.fillRect(this.p2.x - 2, this.p2.y - 2, 8, 8);
}
document.getElementById('game-status').textContent = !this.p1.alive && !this.p2.alive ? '💀 DOUBLE CRASH! 💀' : !this.p1.alive ? '🏆 CYAN WINS! 🏆' : !this.p2.alive ? '🏆 PINK WINS! 🏆' : 'DON\'T CRASH!';
}
gameLoop(timestamp = 0) {
if (timestamp - this.lastUpdate > 50) {
if (this.p1.alive || this.p2.alive) this.update();
this.lastUpdate = timestamp;
}
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {
window.removeEventListener('keydown', this.keyHandler);
}
}

class SumoRing {
constructor() {
this.canvas = document.getElementById('gameCanvas');
this.ctx = this.canvas.getContext('2d');
this.canvas.width = 800;
this.canvas.height = 600;
document.getElementById('game-title').textContent = '🥊 SUMO RING';
document.getElementById('controls-info').innerHTML = `
<div class="player-controls"><strong>PLAYER 1</strong><br>WASD to move</div>
<div class="player-controls"><strong>PLAYER 2</strong><br>Arrow keys to move</div>
`;
this.ringRadius = 250;
this.p1 = {x: 300, y: 300, vx: 0, vy: 0, r: 25, color: '#ff00ff', wins: 0};
this.p2 = {x: 500, y: 300, vx: 0, vy: 0, r: 25, color: '#00ffff', wins: 0};
this.keys = {};
window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
this.roundActive = true;
this.gameLoop();
}
update() {
if (!this.roundActive) return;
const accel = 0.6;
if (this.keys['w']) this.p1.vy -= accel;
if (this.keys['s']) this.p1.vy += accel;
if (this.keys['a']) this.p1.vx -= accel;
if (this.keys['d']) this.p1.vx += accel;
if (this.keys['arrowup']) this.p2.vy -= accel;
if (this.keys['arrowdown']) this.p2.vy += accel;
if (this.keys['arrowleft']) this.p2.vx -= accel;
if (this.keys['arrowright']) this.p2.vx += accel;
this.p1.vx *= 0.95;
this.p1.vy *= 0.95;
this.p2.vx *= 0.95;
this.p2.vy *= 0.95;
this.p1.x += this.p1.vx;
this.p1.y += this.p1.vy;
this.p2.x += this.p2.vx;
this.p2.y += this.p2.vy;
const dx = this.p1.x - this.p2.x;
const dy = this.p1.y - this.p2.y;
const dist = Math.hypot(dx, dy);
if (dist < this.p1.r + this.p2.r) {
const angle = Math.atan2(dy, dx);
const force = 8;
this.p1.vx += Math.cos(angle) * force;
this.p1.vy += Math.sin(angle) * force;
this.p2.vx -= Math.cos(angle) * force;
this.p2.vy -= Math.sin(angle) * force;
}
const checkOut = (p, opponent) => {
const distFromCenter = Math.hypot(p.x - 400, p.y - 300);
if (distFromCenter > this.ringRadius) {
opponent.wins++;
this.roundActive = false;
setTimeout(() => {
this.p1.x = 300;
this.p1.y = 300;
this.p2.x = 500;
this.p2.y = 300;
this.p1.vx = this.p1.vy = this.p2.vx = this.p2.vy = 0;
this.roundActive = true;
}, 2000);
}
};
checkOut(this.p1, this.p2);
checkOut(this.p2, this.p1);
}
draw() {
this.ctx.fillStyle = '#1a1a1a';
this.ctx.fillRect(0, 0, 800, 600);
this.ctx.fillStyle = '#4a4a4a';
this.ctx.beginPath();
this.ctx.arc(400, 300, this.ringRadius, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.strokeStyle = '#ffff00';
this.ctx.lineWidth = 5;
this.ctx.stroke();
this.ctx.fillStyle = this.p1.color;
this.ctx.beginPath();
this.ctx.arc(this.p1.x, this.p1.y, this.p1.r, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = this.p2.color;
this.ctx.beginPath();
this.ctx.arc(this.p2.x, this.p2.y, this.p2.r, 0, Math.PI * 2);
this.ctx.fill();
this.ctx.fillStyle = '#fff';
this.ctx.font = '30px Comic Sans MS';
this.ctx.fillText(`PINK: ${this.p1.wins}`, 50, 50);
this.ctx.fillText(`CYAN: ${this.p2.wins}`, 650, 50);
document.getElementById('game-status').textContent = this.p1.wins >= 3 ? '🏆 PINK WINS! 🏆' : this.p2.wins >= 3 ? '🏆 CYAN WINS! 🏆' : 'PUSH OUT TO WIN!';
}
gameLoop() {
this.update();
this.draw();
animationId = requestAnimationFrame(this.gameLoop.bind(this));
}
cleanup() {}
}