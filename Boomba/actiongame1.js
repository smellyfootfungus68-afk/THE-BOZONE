const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 800;
const TILE_SIZE = 40;
const ROOM_MIN = 8;
const ROOM_MAX = 15;
const MAX_ROOMS = 12;
const game = {
    state: 'menu',
    floor: 1,
    time: 0,
    shake: 0,
    particles: [],
    floatingTexts: [],
    lightSources: [],
    combo: 0,
    comboTimer: 0,
    score: 0,
    bossActive: false,
    difficulty: 1,
    achievements: [],
    secrets: 0,
    eliteKills: 0,
    damageTaken: 0,
    perfectFloors: 0
};
const player = {
    x: 0,
    y: 0,
    size: 16,
    speed: 4,
    hp: 100,
    maxHp: 100,
    xp: 0,
    level: 1,
    gold: 0,
    angle: 0,
    weapon: null,
    armor: null,
    accessory: null,
    stats: {
        damage: 10,
        defense: 0,
        speed: 4,
        critChance: 0.1,
        lifeSteal: 0,
        dodgeChance: 0,
        thorns: 0,
        vampiric: 0,
        fireRate: 1
    },
    abilities: {
        dash: {
            cooldown: 0,
            maxCooldown: 60,
            level: 1
        },
        aoe: {
            cooldown: 0,
            maxCooldown: 180,
            level: 1
        },
        heal: {
            cooldown: 0,
            maxCooldown: 240,
            level: 1
        },
        ultimate: {
            cooldown: 0,
            maxCooldown: 600,
            level: 1,
            charge: 0
        }
    },
    invulnerable: 0,
    dashVelX: 0,
    dashVelY: 0,
    statusEffects: [],
    isDashing: false,
    mana: 100,
    maxMana: 100,
    rage: 0,
    maxRage: 100,
    shield: 0,
    maxShield: 50,
    killStreak: 0,
    lastKillTime: 0
};
const input = {
    keys: {},
    mouse: {
        x: 0,
        y: 0,
        down: false,
        clicked: false
    },
    lastAttack: 0,
    attackCooldown: 15
};
const world = {
    map: [],
    rooms: [],
    corridors: [],
    width: 80,
    height: 60,
    enemies: [],
    projectiles: [],
    items: [],
    particles: [],
    effects: [],
    stairs: null,
    chests: [],
    traps: [],
    shrines: [],
    bosses: [],
    portals: [],
    environmentEffects: [],
    destructibles: []
};
class Room {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cx = Math.floor(x + w / 2);
        this.cy = Math.floor(y + h / 2);
        this.cleared = false;
        this.type = Math.random() < 0.15 ? 'special' : Math.random() < 0.3 ? 'treasure' : Math.random() < 0.4 ? 'challenge' : 'normal';
        this.discovered = false;
        this.lit = false
    }
    intersects(other) {
        return !(this.x + this.w + 1 < other.x || other.x + other.w + 1 < this.x || this.y + this.h + 1 < other.y || other.y + other.h + 1 < this.y)
    }
}
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = 14;
        this.type = type || 'basic';
        this.vx = 0;
        this.vy = 0;
        this.hp = 30;
        this.maxHp = 30;
        this.speed = 1.5;
        this.damage = 5;
        this.gold = 10;
        this.xp = 20;
        this.state = 'idle';
        this.stateTime = 0;
        this.attackCooldown = 0;
        this.hitFlash = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.statusEffects = [];
        this.ai = 'chase';
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.frozen = 0;
        this.poisoned = 0;
        this.burning = 0;
        this.stunned = 0;
        this.setupType()
    }
    setupType() {
        if (this.type === 'fast') {
            this.speed = 2.8;
            this.hp = 20;
            this.maxHp = 20;
            this.damage = 3;
            this.gold = 8;
            this.xp = 15;
            this.size = 12;
            this.ai = 'flank'
        } else if (this.type === 'tank') {
            this.speed = 1;
            this.hp = 80;
            this.maxHp = 80;
            this.damage = 10;
            this.gold = 20;
            this.xp = 40;
            this.size = 18;
            this.ai = 'charge'
        } else if (this.type === 'ranged') {
            this.speed = 1.2;
            this.hp = 25;
            this.maxHp = 25;
            this.damage = 4;
            this.gold = 15;
            this.xp = 25;
            this.size = 13;
            this.shootCooldown = 0;
            this.ai = 'kite'
        } else if (this.type === 'elite') {
            this.speed = 2;
            this.hp = 120;
            this.maxHp = 120;
            this.damage = 15;
            this.gold = 50;
            this.xp = 80;
            this.size = 20;
            this.ai = 'smart'
        } else if (this.type === 'summoner') {
            this.speed = 0.8;
            this.hp = 40;
            this.maxHp = 40;
            this.damage = 3;
            this.gold = 30;
            this.xp = 50;
            this.size = 15;
            this.summonCooldown = 0;
            this.ai = 'summon'
        } else if (this.type === 'teleporter') {
            this.speed = 1.5;
            this.hp = 35;
            this.maxHp = 35;
            this.damage = 8;
            this.gold = 25;
            this.xp = 35;
            this.size = 13;
            this.teleportCooldown = 0;
            this.ai = 'teleport'
        } else if (this.type === 'berserker') {
            this.speed = 2.2;
            this.hp = 60;
            this.maxHp = 60;
            this.damage = 12;
            this.gold = 18;
            this.xp = 30;
            this.size = 16;
            this.ai = 'berserker'
        } else if (this.type === 'shielded') {
            this.speed = 1.3;
            this.hp = 50;
            this.maxHp = 50;
            this.damage = 6;
            this.gold = 22;
            this.xp = 28;
            this.size = 15;
            this.shield = 30;
            this.maxShield = 30;
            this.ai = 'defensive'
        }
        this.hp *= (1 + game.floor * 0.3);
        this.maxHp = this.hp;
        this.damage *= (1 + game.floor * 0.2);
        if (this.shield) this.maxShield = this.shield *= (1 + game.floor * 0.2)
    }
    update() {
        this.stateTime++;
        this.hitFlash = Math.max(0, this.hitFlash - 1);
        this.attackCooldown = Math.max(0, this.attackCooldown - 1);
        this.frozen = Math.max(0, this.frozen - 1);
        this.poisoned = Math.max(0, this.poisoned - 1);
        this.burning = Math.max(0, this.burning - 1);
        this.stunned = Math.max(0, this.stunned - 1);
        if (this.shootCooldown !== undefined) this.shootCooldown = Math.max(0, this.shootCooldown - 1);
        if (this.summonCooldown !== undefined) this.summonCooldown = Math.max(0, this.summonCooldown - 1);
        if (this.teleportCooldown !== undefined) this.teleportCooldown = Math.max(0, this.teleportCooldown - 1);
        if (this.poisoned > 0 && this.stateTime % 30 === 0) {
            this.takeDamage(2, 0);
            createParticle(this.x, this.y, Math.random() * Math.PI * 2, 1, '#22c65b', 10)
        }
        if (this.burning > 0 && this.stateTime % 20 === 0) {
            this.takeDamage(3, 0);
            createParticle(this.x, this.y, Math.random() * Math.PI * 2, 2, '#ff6b35', 15)
        }
        if (this.stunned > 0 || this.frozen > 0) {
            this.vx *= 0.5;
            this.vy *= 0.5
        } else {
            this.knockbackX *= 0.85;
            this.knockbackY *= 0.85;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (this.ai === 'chase' && dist < 400) {
                this.state = 'chase';
                const angle = Math.atan2(dy, dx);
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed
            } else if (this.ai === 'flank' && dist < 450) {
                const angle = Math.atan2(dy, dx) + Math.sin(this.stateTime * 0.05) * 0.8;
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed
            } else if (this.ai === 'kite' && dist < 500) {
                if (dist > 200) {
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed * 0.7;
                    this.vy = Math.sin(angle) * this.speed * 0.7
                } else {
                    const angle = Math.atan2(dy, dx) + Math.PI;
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed
                }
                if (this.type === 'ranged' && dist > 150 && this.shootCooldown === 0) {
                    this.shoot();
                    this.shootCooldown = 90
                }
            } else if (this.ai === 'charge' && dist < 450) {
                if (dist > 80) {
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed * 1.5;
                    this.vy = Math.sin(angle) * this.speed * 1.5
                } else {
                    this.vx *= 0.95;
                    this.vy *= 0.95
                }
            } else if (this.ai === 'smart' && dist < 500) {
                if (player.hp < player.maxHp * 0.3) {
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed * 1.3;
                    this.vy = Math.sin(angle) * this.speed * 1.3
                } else if (this.hp < this.maxHp * 0.4 && dist < 150) {
                    const angle = Math.atan2(dy, dx) + Math.PI;
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed
                } else {
                    const angle = Math.atan2(dy, dx) + Math.sin(this.stateTime * 0.03) * 0.5;
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed
                }
            } else if (this.ai === 'summon' && dist < 400) {
                if (dist > 250) {
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed * 0.5;
                    this.vy = Math.sin(angle) * this.speed * 0.5
                } else {
                    this.vx = 0;
                    this.vy = 0
                }
                if (this.summonCooldown === 0 && world.enemies.length < 40) {
                    this.summonMinion();
                    this.summonCooldown = 180
                }
            } else if (this.ai === 'teleport' && dist < 450) {
                if (this.teleportCooldown === 0 && dist > 100 && dist < 300) {
                    this.teleport();
                    this.teleportCooldown = 120
                } else {
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed
                }
            } else if (this.ai === 'berserker' && dist < 400) {
                const rageBonus = 1 + (1 - this.hp / this.maxHp) * 0.8;
                const angle = Math.atan2(dy, dx);
                this.vx = Math.cos(angle) * this.speed * rageBonus;
                this.vy = Math.sin(angle) * this.speed * rageBonus
            } else if (this.ai === 'defensive' && dist < 400) {
                if (this.shield > 0 && dist < 200) {
                    const angle = Math.atan2(dy, dx) + Math.PI;
                    this.vx = Math.cos(angle) * this.speed * 0.5;
                    this.vy = Math.sin(angle) * this.speed * 0.5
                } else {
                    const angle = Math.atan2(dy, dx);
                    this.vx = Math.cos(angle) * this.speed;
                    this.vy = Math.sin(angle) * this.speed
                }
            } else {
                this.state = 'idle';
                this.patrolAngle += 0.02;
                this.vx = Math.cos(this.patrolAngle) * this.speed * 0.3;
                this.vy = Math.sin(this.patrolAngle) * this.speed * 0.3
            }
        }
        let newX = this.x + this.vx + this.knockbackX;
        let newY = this.y + this.vy + this.knockbackY;
        if (!this.collidesWithWall(newX, this.y)) this.x = newX;
        if (!this.collidesWithWall(this.x, newY)) this.y = newY;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.size + player.size && this.attackCooldown === 0) {
            this.attackPlayer()
        }
    }
    shoot() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const spread = this.type === 'elite' ? 3 : 1;
        for (let i = 0; i < spread; i++) {
            const offsetAngle = angle + (i - Math.floor(spread / 2)) * 0.2;
            world.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(offsetAngle) * 5,
                vy: Math.sin(offsetAngle) * 5,
                damage: this.damage,
                size: 6,
                fromEnemy: true,
                life: 120,
                color: '#ff6b6b',
                homing: this.type === 'elite'
            })
        }
    }
    summonMinion() {
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 50;
            const x = this.x + Math.cos(angle) * dist;
            const y = this.y + Math.sin(angle) * dist;
            if (!this.collidesWithWall(x, y)) {
                world.enemies.push(new Enemy(x, y, 'fast'));
                for (let j = 0; j < 10; j++) createParticle(x, y, Math.random() * Math.PI * 2, 2, '#9b59b6', 20)
            }
        }
    }
    teleport() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 150;
        const newX = this.x + Math.cos(angle) * dist;
        const newY = this.y + Math.sin(angle) * dist;
        if (!this.collidesWithWall(newX, newY)) {
            for (let i = 0; i < 15; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, 3, '#00d2ff', 25);
            this.x = newX;
            this.y = newY;
            for (let i = 0; i < 15; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, 3, '#00d2ff', 25)
        }
    }
    attackPlayer() {
        if (player.invulnerable > 0) return;
        if (Math.random() < player.stats.dodgeChance) {
            createFloatingText(player.x, player.y, 'DODGE!', '#00d2ff');
            return
        }
        damagePlayer(this.damage);
        this.attackCooldown = 60;
        game.shake = 8
    }
    collidesWithWall(x, y) {
        const tx = Math.floor(x / TILE_SIZE);
        const ty = Math.floor(y / TILE_SIZE);
        return world.map[ty] && world.map[ty][tx] === 1
    }
    takeDamage(amount, angle) {
        if (this.shield && this.shield > 0) {
            const shieldDamage = Math.min(this.shield, amount);
            this.shield -= shieldDamage;
            amount -= shieldDamage;
            createFloatingText(this.x, this.y - 10, 'SHIELD -' + Math.floor(shieldDamage), '#3498db');
            if (amount <= 0) return
        }
        const actualDamage = Math.max(1, amount);
        this.hp -= actualDamage;
        this.hitFlash = 10;
        createFloatingText(this.x, this.y, '-' + Math.floor(actualDamage), '#ff4757');
        this.knockbackX = Math.cos(angle) * 8;
        this.knockbackY = Math.sin(angle) * 8;
        for (let i = 0; i < 5; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, Math.random() * 3 + 1, this.getColor(), 15);
        if (this.hp <= 0) {
            player.gold += this.gold;
            player.xp += this.xp;
            player.killStreak++;
            player.lastKillTime = game.time;
            game.combo++;
            game.comboTimer = 120;
            game.score += this.xp * game.combo;
            if (this.type === 'elite') game.eliteKills++;
            updateUI();
            checkLevelUp();
            for (let i = 0; i < 15; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, Math.random() * 4 + 2, this.getColor(), 25);
            if (Math.random() < 0.3 + (game.floor * 0.02)) this.dropItem();
            if (player.killStreak >= 10 && player.killStreak % 10 === 0) {
                player.abilities.ultimate.charge = Math.min(100, player.abilities.ultimate.charge + 25);
                createFloatingText(player.x, player.y, 'ULTIMATE +25%', '#ffd700')
            }
        }
    }
    dropItem() {
        const itemTypes = ['health', 'mana', 'weapon', 'armor', 'accessory', 'powerup'];
        let type;
        const roll = Math.random();
        if (roll < 0.35) type = 'health';
        else if (roll < 0.55) type = 'mana';
        else if (roll < 0.7) type = 'weapon';
        else if (roll < 0.85) type = 'armor';
        else if (roll < 0.95) type = 'accessory';
        else type = 'powerup';
        world.items.push({
            x: this.x,
            y: this.y,
            type,
            tier: Math.floor(game.floor / 2) + 1,
            time: 0,
            powerupType: type === 'powerup' ? ['speed', 'damage', 'invincible', 'multishot'][Math.floor(Math.random() * 4)] : null
        })
    }
    getColor() {
        if (this.type === 'fast') return '#00d2ff';
        if (this.type === 'tank') return '#8b4513';
        if (this.type === 'ranged') return '#9b59b6';
        if (this.type === 'elite') return '#ffd700';
        if (this.type === 'summoner') return '#e056fd';
        if (this.type === 'teleporter') return '#00ffff';
        if (this.type === 'berserker') return '#ff3838';
        if (this.type === 'shielded') return '#3498db';
        return '#ff4757'
    }
    draw() {
        const color = this.hitFlash > 0 ? '#fff' : this.getColor();
        if (this.frozen > 0) {
            ctx.fillStyle = 'rgba(100,200,255,0.5)';
            ctx.fillRect(this.x - this.size / 2 - 3, this.y - this.size / 2 - 3, this.size + 6, this.size + 6)
        }
        if (this.stunned > 0) {
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size, 8, 0, Math.PI * 2);
            ctx.stroke()
        }
        ctx.fillStyle = color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        if (this.shield && this.shield > 0) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.strokeRect(this.x - this.size / 2 - 2, this.y - this.size / 2 - 2, this.size + 4, this.size + 4);
            ctx.globalAlpha = 1
        }
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 8, this.size, 4);
        ctx.fillStyle = '#ff4757';
        const hpWidth = (this.hp / this.maxHp) * this.size;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 8, hpWidth, 4);
        if (this.shield && this.maxShield > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 13, this.size, 3);
            ctx.fillStyle = '#3498db';
            const shieldWidth = (this.shield / this.maxShield) * this.size;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 13, shieldWidth, 3)
        }
        if (this.burning > 0) {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * this.size * 0.3;
                createParticle(this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, Math.PI * 1.5 + Math.random() * 0.4 - 0.2, 2, '#ff6b35', 10)
            }
        }
    }
}
class Boss {
    constructor(x, y, floor) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.floor = floor;
        this.phase = 1;
        this.hp = 500 * floor;
        this.maxHp = this.hp;
        this.damage = 20 * floor;
        this.speed = 1.2;
        this.vx = 0;
        this.vy = 0;
        this.state = 'idle';
        this.stateTime = 0;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.hitFlash = 0;
        this.invulnerable = 0;
        this.type = floor % 3 === 0 ? 'dragon' : floor % 3 === 1 ? 'golem' : 'lich';
        this.pattern = 0;
        this.summonCooldown = 0;
        this.vulnerable = false
    }
    update() {
        this.stateTime++;
        this.attackCooldown = Math.max(0, this.attackCooldown - 1);
        this.specialCooldown = Math.max(0, this.specialCooldown - 1);
        this.summonCooldown = Math.max(0, this.summonCooldown - 1);
        this.hitFlash = Math.max(0, this.hitFlash - 1);
        this.invulnerable = Math.max(0, this.invulnerable - 1);
        const phaseThreshold = this.maxHp / 3;
        if (this.hp < phaseThreshold && this.phase === 1) {
            this.phase = 2;
            this.phaseTransition()
        } else if (this.hp < phaseThreshold * 0.5 && this.phase === 2) {
            this.phase = 3;
            this.phaseTransition()
        }
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        if (this.type === 'dragon') {
            if (this.specialCooldown === 0) {
                this.breatheFire();
                this.specialCooldown = 180
            }
            if (this.attackCooldown === 0) {
                this.shoot360();
                this.attackCooldown = 90
            }
            const orbitAngle = this.stateTime * 0.02;
            const orbitDist = 200;
            this.vx = (Math.cos(orbitAngle) * orbitDist - this.x + player.x) * 0.05;
            this.vy = (Math.sin(orbitAngle) * orbitDist - this.y + player.y) * 0.05
        } else if (this.type === 'golem') {
            if (dist > 100) {
                this.vx = Math.cos(angle) * this.speed;
                this.vy = Math.sin(angle) * this.speed
            } else {
                this.vx *= 0.9;
                this.vy *= 0.9
            }
            if (this.specialCooldown === 0) {
                this.groundSlam();
                this.specialCooldown = 240
            }
            if (this.summonCooldown === 0) {
                this.summonRocks();
                this.summonCooldown = 300
            }
        } else if (this.type === 'lich') {
            if (dist < 150) {
                const escapeAngle = angle + Math.PI;
                this.vx = Math.cos(escapeAngle) * this.speed * 0.8;
                this.vy = Math.sin(escapeAngle) * this.speed * 0.8
            } else if (dist > 350) {
                this.vx = Math.cos(angle) * this.speed * 0.5;
                this.vy = Math.sin(angle) * this.speed * 0.5
            } else {
                this.vx *= 0.95;
                this.vy *= 0.95
            }
            if (this.specialCooldown === 0) {
                this.summonUndead();
                this.specialCooldown = 200
            }
            if (this.attackCooldown === 0) {
                this.darkBolt();
                this.attackCooldown = 60
            }
        }
        let newX = this.x + this.vx;
        let newY = this.y + this.vy;
        if (!this.collidesWithWall(newX, this.y)) this.x = newX;
        if (!this.collidesWithWall(this.x, newY)) this.y = newY;
        if (dist < this.size + player.size && this.attackCooldown === 0) {
            this.attackPlayer();
            this.attackCooldown = 120
        }
    }
    breatheFire() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        for (let i = 0; i < 15; i++) {
            const spread = 0.5;
            const offsetAngle = angle + (Math.random() - 0.5) * spread;
            world.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(offsetAngle) * (6 + Math.random() * 2),
                vy: Math.sin(offsetAngle) * (6 + Math.random() * 2),
                damage: this.damage * 0.7,
                size: 8,
                fromEnemy: true,
                life: 80,
                color: '#ff6b35'
            })
        }
    }
    shoot360() {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            world.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                damage: this.damage * 0.5,
                size: 7,
                fromEnemy: true,
                life: 120,
                color: '#ff0000'
            })
        }
    }
    groundSlam() {
        game.shake = 20;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            world.effects.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                size: 30,
                life: 40,
                maxLife: 40,
                damage: this.damage * 1.5,
                type: 'shockwave',
                color: '#8b4513'
            })
        }
        for (let i = 0; i < 30; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, Math.random() * 5 + 2, '#8b4513', 30)
    }
    summonRocks() {
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 200;
            const x = this.x + Math.cos(angle) * dist;
            const y = this.y + Math.sin(angle) * dist;
            world.effects.push({
                x: x,
                y: y - 200,
                vx: 0,
                vy: 8,
                size: 25,
                life: 60,
                maxLife: 60,
                damage: this.damage,
                type: 'fallingRock',
                color: '#666'
            })
        }
    }
    darkBolt() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        for (let i = 0; i < 5; i++) {
            const offsetAngle = angle + (i - 2) * 0.15;
            world.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(offsetAngle) * 6,
                vy: Math.sin(offsetAngle) * 6,
                damage: this.damage * 0.6,
                size: 9,
                fromEnemy: true,
                life: 100,
                color: '#9b59b6',
                homing: true
            })
        }
    }
    summonUndead() {
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100;
            const x = this.x + Math.cos(angle) * dist;
            const y = this.y + Math.sin(angle) * dist;
            if (!this.collidesWithWall(x, y)) {
                world.enemies.push(new Enemy(x, y, 'fast'));
                for (let j = 0; j < 15; j++) createParticle(x, y, Math.random() * Math.PI * 2, 2, '#9b59b6', 20)
            }
        }
    }
    phaseTransition() {
        this.invulnerable = 60;
        game.shake = 15;
        for (let i = 0; i < 50; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, Math.random() * 6 + 3, this.getColor(), 40);
        createFloatingText(this.x, this.y, 'PHASE ' + this.phase, '#ffd700')
    }
    attackPlayer() {
        if (player.invulnerable > 0) return;
        damagePlayer(this.damage);
        game.shake = 15
    }
    collidesWithWall(x, y) {
        const tx = Math.floor(x / TILE_SIZE);
        const ty = Math.floor(y / TILE_SIZE);
        return world.map[ty] && world.map[ty][tx] === 1
    }
    takeDamage(amount, angle) {
        if (this.invulnerable > 0) {
            createFloatingText(this.x, this.y, 'IMMUNE', '#ffeb3b');
            return
        }
        this.hp -= amount;
        this.hitFlash = 10;
        createFloatingText(this.x, this.y, '-' + Math.floor(amount), '#ff4757');
        game.shake = 5;
        for (let i = 0; i < 8; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, Math.random() * 4 + 2, this.getColor(), 20);
        if (this.hp <= 0) {
            player.gold += 500 * this.floor;
            player.xp += 300 * this.floor;
            game.score += 1000 * this.floor * game.combo;
            game.bossActive = false;
            updateUI();
            checkLevelUp();
            for (let i = 0; i < 100; i++) createParticle(this.x, this.y, Math.random() * Math.PI * 2, Math.random() * 8 + 4, this.getColor(), 50);
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 50;
                world.items.push({
                    x: this.x + Math.cos(angle) * dist,
                    y: this.y + Math.sin(angle) * dist,
                    type: Math.random() < 0.5 ? 'weapon' : 'armor',
                    tier: this.floor + 2,
                    time: 0
                })
            }
            world.bosses.splice(world.bosses.indexOf(this), 1)
        }
    }
    getColor() {
        if (this.type === 'dragon') return '#ff0000';
        if (this.type === 'golem') return '#8b4513';
        if (this.type === 'lich') return '#9b59b6';
        return '#ffd700'
    }
    draw() {
        const color = this.hitFlash > 0 ? '#fff' : this.getColor();
        if (this.invulnerable > 0) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.5 + Math.sin(this.stateTime * 0.2) * 0.3;
            ctx.strokeRect(this.x - this.size / 2 - 5, this.y - this.size / 2 - 5, this.size + 10, this.size + 10);
            ctx.globalAlpha = 1
        }
        ctx.fillStyle = color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 15, this.size, 8);
        ctx.fillStyle = '#ff0000';
        const hpWidth = (this.hp / this.maxHp) * this.size;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 15, hpWidth, 8);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Courier New';
        ctx.fillText('BOSS', this.x - 15, this.y - this.size / 2 - 20)
    }
}

function generateDungeon() {
    world.map = [];
    world.rooms = [];
    world.corridors = [];
    world.enemies = [];
    world.projectiles = [];
    world.items = [];
    world.particles = [];
    world.chests = [];
    world.traps = [];
    world.shrines = [];
    world.bosses = [];
    world.portals = [];
    world.effects = [];
    world.destructibles = [];
    for (let y = 0; y < world.height; y++) {
        world.map[y] = [];
        for (let x = 0; x < world.width; x++) world.map[y][x] = 1
    }
    for (let i = 0; i < MAX_ROOMS; i++) {
        const w = Math.floor(Math.random() * (ROOM_MAX - ROOM_MIN) + ROOM_MIN);
        const h = Math.floor(Math.random() * (ROOM_MAX - ROOM_MIN) + ROOM_MIN);
        const x = Math.floor(Math.random() * (world.width - w - 2)) + 1;
        const y = Math.floor(Math.random() * (world.height - h - 2)) + 1;
        const room = new Room(x, y, w, h);
        let overlaps = false;
        for (let other of world.rooms) {
            if (room.intersects(other)) {
                overlaps = true;
                break
            }
        }
        if (!overlaps) {
            carveRoom(room);
            if (world.rooms.length > 0) {
                const prev = world.rooms[world.rooms.length - 1];
                carveCorridor(prev.cx, prev.cy, room.cx, room.cy)
            }
            world.rooms.push(room)
        }
    }
    if (world.rooms.length > 0) {
        const startRoom = world.rooms[0];
        player.x = startRoom.cx * TILE_SIZE;
        player.y = startRoom.cy * TILE_SIZE;
        const endRoom = world.rooms[world.rooms.length - 1];
        if (game.floor % 5 === 0) {
            game.bossActive = true;
            world.bosses.push(new Boss(endRoom.cx * TILE_SIZE, endRoom.cy * TILE_SIZE, game.floor))
        } else {
            world.stairs = {
                x: endRoom.cx * TILE_SIZE,
                y: endRoom.cy * TILE_SIZE
            }
        }
    }
    populateRooms();
    game.damageTaken = 0
}

function carveRoom(room) {
    for (let y = room.y; y < room.y + room.h; y++)
        for (let x = room.x; x < room.x + room.w; x++) world.map[y][x] = 0
}

function carveCorridor(x1, y1, x2, y2) {
    let x = x1,
        y = y1;
    while (x !== x2) {
        world.map[y][x] = 0;
        x += x < x2 ? 1 : -1
    }
    while (y !== y2) {
        world.map[y][x] = 0;
        y += y < y2 ? 1 : -1
    }
}

function populateRooms() {
    for (let i = 1; i < world.rooms.length - 1; i++) {
        const room = world.rooms[i];
        if (room.type === 'treasure') {
            const x = room.cx * TILE_SIZE;
            const y = room.cy * TILE_SIZE;
            world.chests.push({
                x,
                y,
                opened: false,
                tier: Math.floor(game.floor / 3) + 1
            })
        } else if (room.type === 'special') {
            const x = room.cx * TILE_SIZE;
            const y = room.cy * TILE_SIZE;
            world.shrines.push({
                x,
                y,
                type: ['damage', 'defense', 'speed', 'health'][Math.floor(Math.random() * 4)],
                used: false
            })
        } else if (room.type === 'challenge') {
            const enemyCount = Math.floor(Math.random() * 6) + 8 + game.floor;
            for (let j = 0; j < enemyCount; j++) {
                const x = (room.x + Math.random() * room.w) * TILE_SIZE;
                const y = (room.y + Math.random() * room.h) * TILE_SIZE;
                const rand = Math.random();
                let type = 'basic';
                if (rand < 0.08) type = 'elite';
                else if (rand < 0.18) type = 'berserker';
                else if (rand < 0.28) type = 'shielded';
                else if (rand < 0.38) type = 'tank';
                else if (rand < 0.5) type = 'fast';
                else if (rand < 0.65) type = 'ranged';
                else if (rand < 0.75) type = 'summoner';
                else if (rand < 0.85) type = 'teleporter';
                world.enemies.push(new Enemy(x, y, type))
            }
            world.chests.push({
                x: room.cx * TILE_SIZE,
                y: room.cy * TILE_SIZE,
                opened: false,
                tier: Math.floor(game.floor / 2) + 2
            })
        } else {
            const enemyCount = Math.floor(Math.random() * 4) + 3 + game.floor;
            for (let j = 0; j < enemyCount; j++) {
                const x = (room.x + Math.random() * room.w) * TILE_SIZE;
                const y = (room.y + Math.random() * room.h) * TILE_SIZE;
                const rand = Math.random();
                let type = 'basic';
                if (rand < 0.1) type = 'elite';
                else if (rand < 0.25) type = 'tank';
                else if (rand < 0.45) type = 'fast';
                else if (rand < 0.65) type = 'ranged';
                else if (rand < 0.75) type = 'summoner';
                else if (rand < 0.85) type = 'teleporter';
                else if (rand < 0.92) type = 'berserker';
                else if (rand < 0.98) type = 'shielded';
                world.enemies.push(new Enemy(x, y, type))
            }
            if (Math.random() < 0.3) {
                world.chests.push({
                    x: room.cx * TILE_SIZE,
                    y: room.cy * TILE_SIZE,
                    opened: false,
                    tier: Math.floor(game.floor / 3) + 1
                })
            }
        }
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
            const x = (room.x + Math.random() * room.w) * TILE_SIZE;
            const y = (room.y + Math.random() * room.h) * TILE_SIZE;
            if (Math.random() < 0.15) world.traps.push({
                x,
                y,
                type: 'spike',
                active: false,
                cooldown: 0
            })
        }
        for (let j = 0; j < Math.floor(Math.random() * 2); j++) {
            const x = (room.x + Math.random() * room.w) * TILE_SIZE;
            const y = (room.y + Math.random() * room.h) * TILE_SIZE;
            if (Math.random() < 0.1) world.destructibles.push({
                x,
                y,
                hp: 10,
                maxHp: 10,
                broken: false
            })
        }
    }
}

function updateGame() {
    if (game.state !== 'playing') return;
    game.time++;
    game.shake *= 0.9;
    if (Math.abs(game.shake) < 0.1) game.shake = 0;
    game.comboTimer = Math.max(0, game.comboTimer - 1);
    if (game.comboTimer === 0) game.combo = 0;
    if (game.time - player.lastKillTime > 180) player.killStreak = 0;
    updatePlayer();
    updateEnemies();
    updateBosses();
    updateProjectiles();
    updateParticles();
    updateFloatingTexts();
    updateAbilityCooldowns();
    updateEffects();
    updateTraps();
    checkStairs();
    checkChests();
    checkShrines();
    checkPortals();
    updateItems();
    updateDestructibles()
}

function updatePlayer() {
    player.invulnerable = Math.max(0, player.invulnerable - 1);
    player.mana = Math.min(player.maxMana, player.mana + 0.1);
    player.shield = Math.max(0, player.shield - 0.05);
    for (let i = player.statusEffects.length - 1; i >= 0; i--) {
        const effect = player.statusEffects[i];
        effect.duration--;
        if (effect.duration <= 0) player.statusEffects.splice(i, 1)
    }
    let moveX = 0, moveY = 0;

    if (!player.isDashing) {
        if (input.keys['w'] || input.keys['W']) moveY -= 1;
        if (input.keys['s'] || input.keys['S']) moveY += 1;
        if (input.keys['a'] || input.keys['A']) moveX -= 1;
        if (input.keys['d'] || input.keys['D']) moveX += 1;
    }
    if (moveX !== 0 || moveY !== 0) {
        const mag = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= mag;
        moveY /= mag
    }
    const speedMult = player.statusEffects.find(e => e.type === 'speed') ? 1.5 : 1;
    
    // FIX: Improved dash mechanics
    if (player.isDashing) {
        // Decay dash velocity
        player.dashVelX *= 0.82;
        player.dashVelY *= 0.82;
        
        // Stop dashing when velocity is very low
        if (Math.abs(player.dashVelX) < 0.3 && Math.abs(player.dashVelY) < 0.3) {
            player.isDashing = false;
            player.dashVelX = 0;
            player.dashVelY = 0;
        }
        
        moveX = player.dashVelX;
        moveY = player.dashVelY;
    } else {
        // Normal movement
        moveX *= player.stats.speed * speedMult;
        moveY *= player.stats.speed * speedMult;
    }
    
    // FIX: Better collision detection
    const newX = player.x + moveX;
    const newY = player.y + moveY;
    
    // Check X movement
    if (!collidesWithWall(newX, player.y)) {
        player.x = newX;
    } else {
        // If we hit a wall while dashing, stop the dash
        if (player.isDashing) {
            player.dashVelX = 0;
        }
    }
    
    // Check Y movement
    if (!collidesWithWall(player.x, newY)) {
        player.y = newY;
    } else {
        // If we hit a wall while dashing, stop the dash
        if (player.isDashing) {
            player.dashVelY = 0;
        }
    }

    const dx = input.mouse.x - canvas.width / 2;
    const dy = input.mouse.y - canvas.height / 2;
    player.angle = Math.atan2(dy, dx);
    const fireRateMult = player.statusEffects.find(e => e.type === 'multishot') ? 0.5 : 1;
    if (input.mouse.clicked && game.time - input.lastAttack > input.attackCooldown * fireRateMult) {
        playerAttack();
        input.lastAttack = game.time;
        input.mouse.clicked = false
    }
    if (input.keys['Shift']) {
        if (player.abilities.dash.cooldown === 0) {
            dash()
        }
        input.keys['Shift'] = false
    }
    if (input.keys['e'] || input.keys['E']) {
        if (player.abilities.aoe.cooldown === 0) {
            aoeAttack()
        }
        input.keys['e'] = false;
        input.keys['E'] = false
    }
    if (input.keys['r'] || input.keys['R']) {
        if (player.abilities.heal.cooldown === 0) {
            healAbility()
        }
        input.keys['r'] = false;
        input.keys['R'] = false
    }
    if (input.keys['t'] || input.keys['T']) {
        if (player.abilities.ultimate.cooldown === 0 && player.abilities.ultimate.charge >= 100) {
            ultimateAbility()
        }
        input.keys['t'] = false;
        input.keys['T'] = false
    }
}

function dash() {
    // FIX: Set dash flag and velocity
    player.isDashing = true;
    player.dashVelX = Math.cos(player.angle) * 12; // Slightly reduced for better control
    player.dashVelY = Math.sin(player.angle) * 12;
    player.invulnerable = 20;
    player.abilities.dash.cooldown = player.abilities.dash.maxCooldown;
    for (let i = 0; i < 10; i++) createParticle(player.x, player.y, Math.random() * Math.PI * 2, Math.random() * 2 + 1, '#00d2ff', 20)
}

function aoeAttack() {
    if (player.mana < 30) return;
    player.mana -= 30;
    player.abilities.aoe.cooldown = player.abilities.aoe.maxCooldown;
    const damage = player.stats.damage * 2 * player.abilities.aoe.level;
    for (let enemy of world.enemies) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            const angle = Math.atan2(dy, dx);
            enemy.takeDamage(damage, angle);
            enemy.stunned = 30
        }
    }
    for (let boss of world.bosses) {
        const dx = boss.x - player.x;
        const dy = boss.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            const angle = Math.atan2(dy, dx);
            boss.takeDamage(damage, angle)
        }
    }
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        createParticle(player.x + Math.cos(angle) * 100, player.y + Math.sin(angle) * 100, angle, 3, '#a55eea', 25)
    }
    game.shake = 12
}

function healAbility() {
    if (player.mana < 40) return;
    player.mana -= 40;
    player.abilities.heal.cooldown = player.abilities.heal.maxCooldown;
    const healAmount = Math.floor(player.maxHp * 0.3 * player.abilities.heal.level);
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    createFloatingText(player.x, player.y, '+' + healAmount, '#2ecc71');
    updateUI();
    for (let i = 0; i < 20; i++) createParticle(player.x, player.y, Math.random() * Math.PI * 2, Math.random() * 3 + 1, '#2ecc71', 30)
}

function ultimateAbility() {
    player.abilities.ultimate.cooldown = player.abilities.ultimate.maxCooldown;
    player.abilities.ultimate.charge = 0;
    player.invulnerable = 60;
    game.shake = 25;
    for (let enemy of world.enemies) {
        const damage = player.stats.damage * 5;
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        enemy.takeDamage(damage, angle + Math.PI)
    }
    for (let boss of world.bosses) {
        const damage = player.stats.damage * 5;
        boss.takeDamage(damage, 0)
    }
    for (let i = 0; i < 100; i++) createParticle(player.x, player.y, Math.random() * Math.PI * 2, Math.random() * 10 + 5, '#ffd700', 60);
    createFloatingText(player.x, player.y, 'ULTIMATE!', '#ffd700');
    updateUI()
}

function playerAttack() {
    const damage = player.stats.damage * (player.weapon ? player.weapon.multiplier : 1);
    const isCrit = Math.random() < player.stats.critChance;
    const finalDamage = isCrit ? damage * 2 : damage;
    const hasMultishot = player.statusEffects.find(e => e.type === 'multishot');
    const shots = hasMultishot ? 5 : 1;
    for (let i = 0; i < shots; i++) {
        const spread = hasMultishot ? (i - 2) * 0.2 : 0;
        world.projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle + spread) * 8,
            vy: Math.sin(player.angle + spread) * 8,
            damage: finalDamage,
            size: 8,
            fromEnemy: false,
            life: 60,
            color: isCrit ? '#ffd700' : '#00ff88',
            isCrit,
            piercing: player.accessory && player.accessory.effect === 'pierce' ? 3 : 0
        })
    }
}

function updateEnemies() {
    for (let i = world.enemies.length - 1; i >= 0; i--) {
        const enemy = world.enemies[i];
        enemy.update();
        if (enemy.hp <= 0) world.enemies.splice(i, 1)
    }
    if (world.enemies.length === 0 && world.bosses.length === 0) {
        for (let room of world.rooms) {
            if (!room.cleared && !room.discovered) {
                const dx = room.cx * TILE_SIZE - player.x;
                const dy = room.cy * TILE_SIZE - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    room.cleared = true;
                    break
                }
            }
        }
    }
}

function updateBosses() {
    for (let boss of world.bosses) boss.update()
}

function updateProjectiles() {
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
        const proj = world.projectiles[i];
        if (proj.homing && !proj.fromEnemy) {
            const closest = findClosestEnemy(proj.x, proj.y);
            if (closest) {
                const dx = closest.x - proj.x;
                const dy = closest.y - proj.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                const turnSpeed = 0.1;
                const currentAngle = Math.atan2(proj.vy, proj.vx);
                let newAngle = currentAngle + (angle - currentAngle) * turnSpeed;
                const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
                proj.vx = Math.cos(newAngle) * speed;
                proj.vy = Math.sin(newAngle) * speed
            }
        } else if (proj.homing && proj.fromEnemy) {
            const dx = player.x - proj.x;
            const dy = player.y - proj.y;
            const angle = Math.atan2(dy, dx);
            const turnSpeed = 0.05;
            const currentAngle = Math.atan2(proj.vy, proj.vx);
            let newAngle = currentAngle + (angle - currentAngle) * turnSpeed;
            const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
            proj.vx = Math.cos(newAngle) * speed;
            proj.vy = Math.sin(newAngle) * speed
        }
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;
        if (proj.life <= 0 || collidesWithWall(proj.x, proj.y)) {
            world.projectiles.splice(i, 1);
            continue
        }
        if (proj.fromEnemy) {
            const dx = proj.x - player.x;
            const dy = proj.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < player.size + proj.size && player.invulnerable === 0) {
                damagePlayer(proj.damage);
                world.projectiles.splice(i, 1)
            }
        } else {
            let hit = false;
            for (let j = world.enemies.length - 1; j >= 0; j--) {
                const enemy = world.enemies[j];
                const dx = proj.x - enemy.x;
                const dy = proj.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < enemy.size + proj.size) {
                    const angle = Math.atan2(dy, dx);
                    enemy.takeDamage(proj.damage, angle + Math.PI);
                    if (player.stats.lifeSteal > 0) {
                        const heal = Math.floor(proj.damage * player.stats.lifeSteal);
                        player.hp = Math.min(player.maxHp, player.hp + heal);
                        updateUI()
                    }
                    if (Math.random() < 0.15) enemy.frozen = 60;
                    if (Math.random() < 0.12) enemy.poisoned = 120;
                    if (Math.random() < 0.1) enemy.burning = 100;
                    if (proj.piercing && proj.piercing > 0) {
                        proj.piercing--;
                        hit = true
                    } else {
                        world.projectiles.splice(i, 1);
                        hit = true
                    }
                    break
                }
            }
            if (hit) continue;
            for (let boss of world.bosses) {
                const dx = proj.x - boss.x;
                const dy = proj.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < boss.size + proj.size) {
                    const angle = Math.atan2(dy, dx);
                    boss.takeDamage(proj.damage, angle + Math.PI);
                    if (player.stats.lifeSteal > 0) {
                        const heal = Math.floor(proj.damage * player.stats.lifeSteal);
                        player.hp = Math.min(player.maxHp, player.hp + heal);
                        updateUI()
                    }
                    if (proj.piercing && proj.piercing > 0) {
                        proj.piercing--
                    } else {
                        world.projectiles.splice(i, 1)
                    }
                    break
                }
            }
        }
    }
}

function findClosestEnemy(x, y) {
    let closest = null;
    let minDist = Infinity;
    for (let enemy of world.enemies) {
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            closest = enemy
        }
    }
    return closest
}

function updateParticles() {
    for (let i = world.particles.length - 1; i >= 0; i--) {
        const p = world.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life--;
        if (p.life <= 0) world.particles.splice(i, 1)
    }
}

function updateFloatingTexts() {
    for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
        const text = game.floatingTexts[i];
        text.y -= 1;
        text.life--;
        text.alpha = text.life / 60;
        if (text.life <= 0) game.floatingTexts.splice(i, 1)
    }
}

function updateAbilityCooldowns() {
    for (let key in player.abilities) {
        if (player.abilities[key].cooldown > 0) player.abilities[key].cooldown--
    }
}

function updateEffects() {
    for (let i = world.effects.length - 1; i >= 0; i--) {
        const effect = world.effects[i];
        effect.life--;
        if (effect.type === 'shockwave') {
            effect.size += 2;
            const dx = effect.x - player.x;
            const dy = effect.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < effect.size && player.invulnerable === 0) {
                damagePlayer(effect.damage);
                player.invulnerable = 30
            }
        } else if (effect.type === 'fallingRock') {
            effect.y += effect.vy;
            if (effect.life < 20) {
                const dx = effect.x - player.x;
                const dy = effect.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < effect.size && player.invulnerable === 0) {
                    damagePlayer(effect.damage);
                    player.invulnerable = 30;
                    effect.life = 0
                }
            }
        }
        if (effect.life <= 0) world.effects.splice(i, 1)
    }
}

function updateTraps() {
    for (let trap of world.traps) {
        trap.cooldown = Math.max(0, trap.cooldown - 1);
        const dx = player.x - trap.x;
        const dy = player.y - trap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 25 && !trap.active && trap.cooldown === 0) {
            trap.active = true;
            trap.cooldown = 120;
            if (player.invulnerable === 0) {
                damagePlayer(15);
                game.shake = 10
            }
        }
        if (trap.active && trap.cooldown < 60) trap.active = false
    }
}

function updateItems() {
    for (let item of world.items) {
        item.time++;
        item.y += Math.sin(item.time * 0.1) * 0.3
    }
}

function updateDestructibles() {
    for (let i = world.destructibles.length - 1; i >= 0; i--) {
        const dest = world.destructibles[i];
        if (dest.broken) continue;
        for (let proj of world.projectiles) {
            if (proj.fromEnemy) continue;
            const dx = proj.x - dest.x;
            const dy = proj.y - dest.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 20) {
                dest.hp -= proj.damage;
                if (dest.hp <= 0) {
                    dest.broken = true;
                    for (let j = 0; j < 10; j++) createParticle(dest.x, dest.y, Math.random() * Math.PI * 2, Math.random() * 3 + 1, '#666', 20);
                    if (Math.random() < 0.3) world.items.push({
                        x: dest.x,
                        y: dest.y,
                        type: 'health',
                        tier: 1,
                        time: 0
                    })
                }
                break
            }
        }
    }
}

function checkStairs() {
    if (!world.stairs) return;
    const dx = player.x - world.stairs.x;
    const dy = player.y - world.stairs.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 30 && (input.keys['f'] || input.keys['F'])) {
        if (world.enemies.length === 0) {
            nextFloor()
        } else {
            createFloatingText(player.x, player.y, 'Clear enemies first!', '#ff4757')
        }
        input.keys['f'] = false;
        input.keys['F'] = false
    }
}

function checkChests() {
    for (let chest of world.chests) {
        if (chest.opened) continue;
        const dx = player.x - chest.x;
        const dy = player.y - chest.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30 && (input.keys['f'] || input.keys['F'])) {
            openChest(chest);
            input.keys['f'] = false;
            input.keys['F'] = false
        }
    }
}

function checkShrines() {
    for (let shrine of world.shrines) {
        if (shrine.used) continue;
        const dx = player.x - shrine.x;
        const dy = player.y - shrine.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40 && (input.keys['f'] || input.keys['F'])) {
            useShrine(shrine);
            input.keys['f'] = false;
            input.keys['F'] = false
        }
    }
}

function checkPortals() {
    for (let portal of world.portals) {
        const dx = player.x - portal.x;
        const dy = player.y - portal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
            player.x = portal.targetX;
            player.y = portal.targetY;
            for (let i = 0; i < 20; i++) createParticle(player.x, player.y, Math.random() * Math.PI * 2, Math.random() * 4 + 2, '#00d2ff', 30)
        }
    }
}

function openChest(chest) {
    chest.opened = true;
    const gold = Math.floor(Math.random() * 50) + 30 + game.floor * 10;
    player.gold += gold;
    createFloatingText(chest.x, chest.y, '+' + gold + 'G', '#ffd700');
    const rolls = chest.tier || 1;
    for (let i = 0; i < rolls; i++) {
        if (Math.random() < 0.6) {
            const type = Math.random() < 0.4 ? 'weapon' : Math.random() < 0.7 ? 'armor' : 'accessory';
            world.items.push({
                x: chest.x + Math.random() * 40 - 20,
                y: chest.y + Math.random() * 40 - 20,
                type,
                tier: Math.floor(game.floor / 2) + 1 + chest.tier,
                time: 0
            })
        }
    }
    updateUI();
    for (let i = 0; i < 30; i++) createParticle(chest.x, chest.y, Math.random() * Math.PI * 2, Math.random() * 4 + 2, '#ffd700', 30)
}

function useShrine(shrine) {
    shrine.used = true;
    if (shrine.type === 'damage') {
        player.stats.damage += 5;
        createFloatingText(shrine.x, shrine.y, 'Damage +5!', '#ff4757')
    } else if (shrine.type === 'defense') {
        player.stats.defense += 3;
        createFloatingText(shrine.x, shrine.y, 'Defense +3!', '#3498db')
    } else if (shrine.type === 'speed') {
        player.stats.speed += 0.5;
        createFloatingText(shrine.x, shrine.y, 'Speed +0.5!', '#00d2ff')
    } else if (shrine.type === 'health') {
        player.maxHp += 30;
        player.hp += 30;
        createFloatingText(shrine.x, shrine.y, 'Max HP +30!', '#2ecc71')
    }
    updateUI();
    for (let i = 0; i < 25; i++) createParticle(shrine.x, shrine.y, Math.random() * Math.PI * 2, Math.random() * 3 + 2, '#ffd700', 35)
}

function nextFloor() {
    if (game.damageTaken === 0) {
        game.perfectFloors++;
        player.maxHp += 10;
        player.hp = player.maxHp;
        createFloatingText(player.x, player.y, 'PERFECT! +10 Max HP', '#ffd700')
    }
    game.floor++;
    generateDungeon();
    updateUI();
    for (let i = 0; i < 50; i++) createParticle(player.x, player.y, Math.random() * Math.PI * 2, Math.random() * 5 + 2, '#ffd700', 40)
}

function damagePlayer(amount) {
    if (player.invulnerable > 0) return;
    const actualDamage = Math.max(1, amount - player.stats.defense);
    player.hp -= actualDamage;
    player.invulnerable = 30;
    game.damageTaken += actualDamage;
    createFloatingText(player.x, player.y, '-' + Math.floor(actualDamage), '#ff4757');
    updateUI();
    if (player.stats.thorns > 0) {
        const thornDamage = player.stats.thorns;
        for (let enemy of world.enemies) {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const angle = Math.atan2(dy, dx);
                enemy.takeDamage(thornDamage, angle + Math.PI)
            }
        }
    }
    if (player.hp <= 0) gameOver()
}

function gameOver() {
    game.state = 'gameover';
    document.getElementById('final-floor').textContent = game.floor;
    document.getElementById('final-gold').textContent = player.gold;
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('final-kills').textContent = game.eliteKills;
    document.getElementById('game-over-screen').classList.remove('hidden')
}

function checkLevelUp() {
    const xpNeeded = 100 + player.level * 50;
    if (player.xp >= xpNeeded) {
        player.xp -= xpNeeded;
        player.level++;
        showLevelUpScreen()
    }
}

function showLevelUpScreen() {
    game.state = 'levelup';
    const screen = document.getElementById('level-up-screen');
    const choices = document.getElementById('upgrade-choices');
    choices.innerHTML = '';
    const upgrades = [{
        name: 'Max HP +20',
        desc: 'Increase maximum health',
        apply: () => {
            player.maxHp += 20;
            player.hp += 20
        }
    }, {
        name: 'Damage +5',
        desc: 'Increase base damage',
        apply: () => {
            player.stats.damage += 5
        }
    }, {
        name: 'Defense +2',
        desc: 'Increase damage reduction',
        apply: () => {
            player.stats.defense += 2
        }
    }, {
        name: 'Speed +0.5',
        desc: 'Move faster',
        apply: () => {
            player.stats.speed += 0.5
        }
    }, {
        name: 'Crit Chance +5%',
        desc: 'Increase critical hit chance',
        apply: () => {
            player.stats.critChance += 0.05
        }
    }, {
        name: 'Life Steal +5%',
        desc: 'Heal on hit',
        apply: () => {
            player.stats.lifeSteal += 0.05
        }
    }, {
        name: 'Attack Speed',
        desc: 'Attack faster',
        apply: () => {
            input.attackCooldown = Math.max(5, input.attackCooldown - 2)
        }
    }, {
        name: 'Dash CD -10',
        desc: 'Dash more often',
        apply: () => {
            player.abilities.dash.maxCooldown = Math.max(20, player.abilities.dash.maxCooldown - 10)
        }
    }, {
        name: 'Max Mana +20',
        desc: 'Increase max mana',
        apply: () => {
            player.maxMana += 20;
            player.mana += 20
        }
    }, {
        name: 'Dodge +8%',
        desc: 'Chance to dodge attacks',
        apply: () => {
            player.stats.dodgeChance += 0.08
        }
    }, {
        name: 'Thorns +5',
        desc: 'Reflect damage to nearby enemies',
        apply: () => {
            player.stats.thorns += 5
        }
    }, {
        name: 'AoE Level +1',
        desc: 'Increase AoE damage',
        apply: () => {
            player.abilities.aoe.level++
        }
    }, {
        name: 'Heal Level +1',
        desc: 'Increase heal amount',
        apply: () => {
            player.abilities.heal.level++
        }
    }, {
        name: 'Vampiric +3%',
        desc: 'Lifesteal from all damage',
        apply: () => {
            player.stats.vampiric += 0.03
        }
    }];
    const selected = [];
    while (selected.length < 3 && selected.length < upgrades.length) {
        const upgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
        if (!selected.includes(upgrade)) selected.push(upgrade)
    }
    for (let upgrade of selected) {
        const div = document.createElement('div');
        div.className = 'upgrade-option';
        div.innerHTML = '<h3>' + upgrade.name + '</h3><p>' + upgrade.desc + '</p>';
        div.onclick = () => {
            upgrade.apply();
            screen.classList.add('hidden');
            game.state = 'playing';
            updateUI()
        };
        choices.appendChild(div)
    }
    screen.classList.remove('hidden')
}

function collidesWithWall(x, y) {
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    return world.map[ty] && world.map[ty][tx] === 1
}

function createParticle(x, y, angle, speed, color, life) {
    world.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life,
        maxLife: life
    })
}

function createFloatingText(x, y, text, color) {
    game.floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 60,
        alpha: 1
    })
}

function drawGame() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (game.state !== 'playing') return;
    ctx.save();
    const shakeX = (Math.random() - 0.5) * game.shake;
    const shakeY = (Math.random() - 0.5) * game.shake;
    ctx.translate(canvas.width / 2 - player.x + shakeX, canvas.height / 2 - player.y + shakeY);
    drawMap();
    drawTraps();
    drawShrines();
    drawDestructibles();
    drawChests();
    drawItems();
    drawEnemies();
    drawBosses();
    drawProjectiles();
    drawParticles();
    drawEffects();
    drawPlayer();
    drawStairs();
    drawFloatingTexts();
    ctx.restore();
    drawMinimap();
    drawCombo()
}

function drawMap() {
    const startX = Math.floor((player.x - canvas.width / 2) / TILE_SIZE) - 2;
    const endX = Math.ceil((player.x + canvas.width / 2) / TILE_SIZE) + 2;
    const startY = Math.floor((player.y - canvas.height / 2) / TILE_SIZE) - 2;
    const endY = Math.ceil((player.y + canvas.height / 2) / TILE_SIZE) + 2;
    for (let y = Math.max(0, startY); y < Math.min(world.height, endY); y++) {
        for (let x = Math.max(0, startX); x < Math.min(world.width, endX); x++) {
            if (world.map[y][x] === 1) {
                const dx = x * TILE_SIZE - player.x;
                const dy = y * TILE_SIZE - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const darkness = Math.min(1, dist / 400);
                ctx.fillStyle = 'rgb(' + (60 * (1 - darkness)) + ',' + (60 * (1 - darkness)) + ',' + (80 * (1 - darkness)) + ')';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = 'rgba(100,100,120,0.3)';
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else {
                const dx = x * TILE_SIZE - player.x;
                const dy = y * TILE_SIZE - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const darkness = Math.min(1, dist / 400);
                ctx.fillStyle = 'rgb(' + (20 * (1 - darkness)) + ',' + (20 * (1 - darkness)) + ',' + (30 * (1 - darkness)) + ')';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
            }
        }
    }
}

function drawPlayer() {
    if (player.invulnerable > 0 && player.invulnerable % 10 < 5) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.size / 2 - 4, -2, 10, 4);
    ctx.restore();
    if (player.shield > 0) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1
    }
}

function drawEnemies() {
    for (let enemy of world.enemies) enemy.draw()
}

function drawBosses() {
    for (let boss of world.bosses) boss.draw()
}

function drawProjectiles() {
    for (let proj of world.projectiles) {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
        if (proj.isCrit) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke()
        }
    }
}

function drawParticles() {
    for (let p of world.particles) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    }
    ctx.globalAlpha = 1
}

function drawEffects() {
    for (let effect of world.effects) {
        if (effect.type === 'shockwave') {
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 4;
            ctx.globalAlpha = effect.life / effect.maxLife;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1
        } else if (effect.type === 'fallingRock') {
            ctx.fillStyle = effect.color;
            ctx.globalAlpha = Math.min(1, effect.life / 20);
            ctx.fillRect(effect.x - effect.size / 2, effect.y - effect.size / 2, effect.size, effect.size);
            ctx.globalAlpha = 1
        }
    }
}

function drawFloatingTexts() {
    ctx.font = 'bold 16px Courier New';
    for (let text of game.floatingTexts) {
        ctx.fillStyle = text.color;
        ctx.globalAlpha = text.alpha;
        ctx.fillText(text.text, text.x - 20, text.y)
    }
    ctx.globalAlpha = 1
}

function drawStairs() {
    if (!world.stairs) return;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(world.stairs.x, world.stairs.y, 15, 0, Math.PI * 2);
    ctx.fill();
    const dx = world.stairs.x - player.x;
    const dy = world.stairs.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 50) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Courier New';
        ctx.fillText('F - Next Floor', world.stairs.x - 45, world.stairs.y - 25)
    }
}

function drawChests() {
    for (let chest of world.chests) {
        ctx.fillStyle = chest.opened ? '#555' : '#8b6914';
        ctx.fillRect(chest.x - 12, chest.y - 12, 24, 24);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(chest.x - 12, chest.y - 12, 24, 24);
        if (!chest.opened) {
            const dx = chest.x - player.x;
            const dy = chest.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Courier New';
                ctx.fillText('F - Open', chest.x - 25, chest.y - 20)
            }
        }
    }
}

function drawShrines() {
    for (let shrine of world.shrines) {
        if (shrine.used) {
            ctx.fillStyle = '#333'
        } else {
            ctx.fillStyle = '#9b59b6'
        }
        ctx.fillRect(shrine.x - 15, shrine.y - 15, 30, 30);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(shrine.x - 15, shrine.y - 15, 30, 30);
        if (!shrine.used) {
            const dx = shrine.x - player.x;
            const dy = shrine.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Courier New';
                ctx.fillText('F - ' + shrine.type.toUpperCase(), shrine.x - 35, shrine.y - 20)
            }
        }
    }
}

function drawTraps() {
    for (let trap of world.traps) {
        ctx.fillStyle = trap.active ? '#ff4757' : '#8b0000';
        ctx.fillRect(trap.x - 10, trap.y - 10, 20, 20);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(trap.x - 10, trap.y - 10, 20, 20)
    }
}

function drawDestructibles() {
    for (let dest of world.destructibles) {
        if (dest.broken) continue;
        ctx.fillStyle = '#666';
        ctx.fillRect(dest.x - 12, dest.y - 12, 24, 24);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.strokeRect(dest.x - 12, dest.y - 12, 24, 24)
    }
}

function drawItems() {
    for (let i = world.items.length - 1; i >= 0; i--) {
        const item = world.items[i];
        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.size + 15) {
            pickupItem(item);
            world.items.splice(i, 1);
            continue
        }
        let color = '#2ecc71';
        if (item.type === 'weapon') color = '#e74c3c';
        else if (item.type === 'armor') color = '#3498db';
        else if (item.type === 'mana') color = '#9b59b6';
        else if (item.type === 'accessory') color = '#f39c12';
        else if (item.type === 'powerup') color = '#00d2ff';
        ctx.fillStyle = color;
        ctx.fillRect(item.x - 8, item.y - 8, 16, 16);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x - 8, item.y - 8, 16, 16)
    }
}

function pickupItem(item) {
    if (item.type === 'health') {
        const heal = 30;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        createFloatingText(item.x, item.y, '+' + heal + ' HP', '#2ecc71')
    } else if (item.type === 'mana') {
        const mana = 40;
        player.mana = Math.min(player.maxMana, player.mana + mana);
        createFloatingText(item.x, item.y, '+' + mana + ' MP', '#9b59b6')
    } else if (item.type === 'weapon') {
        const tier = item.tier || 1;
        player.weapon = {
            tier,
            multiplier: 1 + tier * 0.3
        };
        updateEquipment();
        createFloatingText(item.x, item.y, 'Weapon T' + tier, '#e74c3c')
    } else if (item.type === 'armor') {
        const tier = item.tier || 1;
        player.armor = {
            tier,
            defense: tier * 2
        };
        player.stats.defense = player.armor.defense;
        updateEquipment();
        createFloatingText(item.x, item.y, 'Armor T' + tier, '#3498db')
    } else if (item.type === 'accessory') {
        const tier = item.tier || 1;
        const effects = ['pierce', 'homing', 'lifesteal', 'shield'];
        const effect = effects[Math.floor(Math.random() * effects.length)];
        player.accessory = {
            tier,
            effect
        };
        if (effect === 'shield') player.maxShield += tier * 10;
        updateEquipment();
        createFloatingText(item.x, item.y, 'Accessory: ' + effect, '#f39c12')
    } else if (item.type === 'powerup') {
        const duration = 300;
        if (item.powerupType === 'speed') {
            player.statusEffects.push({
                type: 'speed',
                duration
            });
            createFloatingText(item.x, item.y, 'SPEED BOOST!', '#00d2ff')
        } else if (item.powerupType === 'damage') {
            player.statusEffects.push({
                type: 'damage',
                duration,
                value: 10
            });
            createFloatingText(item.x, item.y, 'DAMAGE BOOST!', '#ff4757')
        } else if (item.powerupType === 'invincible') {
            player.invulnerable = duration;
            createFloatingText(item.x, item.y, 'INVINCIBLE!', '#ffd700')
        } else if (item.powerupType === 'multishot') {
            player.statusEffects.push({
                type: 'multishot',
                duration
            });
            createFloatingText(item.x, item.y, 'MULTISHOT!', '#a55eea')
        }
    }
    updateUI()
}

function drawMinimap() {
    // FIX: Draw minimap directly at fixed position instead of using DOM positioning
    const minimapX = canvas.width - 170; // 20px from right edge
    const minimapY = 20; // 20px from top
    const minimapW = 150;
    const minimapH = 150;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(minimapX, minimapY, minimapW, minimapH);
    
    // Calculate scale
    const scaleX = minimapW / world.width;
    const scaleY = minimapH / world.height;
    
    // Draw rooms
    for (let room of world.rooms) {
        let color = 'rgba(60,60,80,0.6)';
        if (room.type === 'treasure') color = 'rgba(255,215,0,0.4)';
        else if (room.type === 'special') color = 'rgba(155,89,182,0.4)';
        else if (room.type === 'challenge') color = 'rgba(255,71,87,0.4)';
        
        ctx.fillStyle = color;
        ctx.fillRect(
            minimapX + room.x * scaleX, 
            minimapY + room.y * scaleY, 
            room.w * scaleX, 
            room.h * scaleY
        )
    }
    
    // Draw enemies
    for (let enemy of world.enemies) {
        ctx.fillStyle = 'rgba(255,71,87,0.6)';
        ctx.fillRect(
            minimapX + (enemy.x / TILE_SIZE) * scaleX - 1, 
            minimapY + (enemy.y / TILE_SIZE) * scaleY - 1, 
            2, 2
        )
    }
    
    // Draw player
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(
        minimapX + (player.x / TILE_SIZE) * scaleX, 
        minimapY + (player.y / TILE_SIZE) * scaleY, 
        3, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw stairs
    if (world.stairs) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(
            minimapX + (world.stairs.x / TILE_SIZE) * scaleX, 
            minimapY + (world.stairs.y / TILE_SIZE) * scaleY, 
            3, 0, Math.PI * 2
        );
        ctx.fill()
    }
    
    // Draw bosses
    for (let boss of world.bosses) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(
            minimapX + (boss.x / TILE_SIZE) * scaleX - 3, 
            minimapY + (boss.y / TILE_SIZE) * scaleY - 3, 
            6, 6
        )
    }
    
    // Draw chests
    for (let chest of world.chests) {
        if (!chest.opened) {
            ctx.fillStyle = 'rgba(255,215,0,0.8)';
            ctx.fillRect(
                minimapX + (chest.x / TILE_SIZE) * scaleX - 1, 
                minimapY + (chest.y / TILE_SIZE) * scaleY - 1, 
                2, 2
            )
        }
    }
    
    // Border
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, minimapW, minimapH);
    
    ctx.restore()
}

function drawCombo() {
    if (game.combo > 1) {
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        const comboAlpha = Math.min(1, game.comboTimer / 60);
        ctx.globalAlpha = comboAlpha;
        ctx.fillText('COMBO x' + game.combo, canvas.width / 2, 80);
        ctx.globalAlpha = 1;
        ctx.restore()
    }
}

function updateUI() {
    document.getElementById('hp-text').textContent = Math.floor(player.hp) + '/' + player.maxHp;
    document.getElementById('hp-bar').style.width = (player.hp / player.maxHp * 100) + '%';
    const xpNeeded = 100 + player.level * 50;
    document.getElementById('xp-text').textContent = Math.floor(player.xp) + '/' + xpNeeded;
    document.getElementById('xp-bar').style.width = (player.xp / xpNeeded * 100) + '%';
    document.getElementById('level-num').textContent = player.level;
    document.getElementById('floor-num').textContent = game.floor;
    document.getElementById('gold-num').textContent = player.gold;
    document.getElementById('mana-text').textContent = Math.floor(player.mana) + '/' + player.maxMana;
    document.getElementById('mana-bar').style.width = (player.mana / player.maxMana * 100) + '%';
    document.getElementById('score-num').textContent = game.score;
    document.getElementById('ult-charge').textContent = Math.floor(player.abilities.ultimate.charge) + '%';
    document.getElementById('stat-damage').textContent = Math.floor(player.stats.damage);
    document.getElementById('stat-defense').textContent = Math.floor(player.stats.defense);
    document.getElementById('stat-speed').textContent = player.stats.speed.toFixed(1);
    document.getElementById('stat-crit').textContent = (player.stats.critChance * 100).toFixed(0) + '%';
    document.getElementById('stat-lifesteal').textContent = (player.stats.lifeSteal * 100).toFixed(0) + '%';
    document.getElementById('stat-dodge').textContent = (player.stats.dodgeChance * 100).toFixed(0) + '%';
    document.getElementById('stat-thorns').textContent = Math.floor(player.stats.thorns);
    document.getElementById('stat-vampiric').textContent = (player.stats.vampiric * 100).toFixed(0) + '%';
    document.getElementById('stat-attackspeed').textContent = (1000 / input.attackCooldown).toFixed(1) + '/s';
    document.getElementById('stat-kills').textContent = player.killStreak;
    updateAbilityUI()
}

function updateAbilityUI() {
    const abilities = document.querySelectorAll('.ability');
    abilities[0].querySelector('.cooldown-overlay').style.height = (player.abilities.dash.cooldown / player.abilities.dash.maxCooldown * 100) + '%';
    abilities[1].querySelector('.cooldown-overlay').style.height = (player.abilities.aoe.cooldown / player.abilities.aoe.maxCooldown * 100) + '%';
    abilities[2].querySelector('.cooldown-overlay').style.height = (player.abilities.heal.cooldown / player.abilities.heal.maxCooldown * 100) + '%';
    abilities[3].querySelector('.cooldown-overlay').style.height = (player.abilities.ultimate.cooldown > 0 ? 100 : (100 - player.abilities.ultimate.charge)) + '%'
}

function updateEquipment() {
    if (player.weapon) document.querySelector('#weapon-slot .slot-content').textContent = 'T' + player.weapon.tier;
    if (player.armor) document.querySelector('#armor-slot .slot-content').textContent = 'T' + player.armor.tier;
    if (player.accessory) document.querySelector('#accessory-slot .slot-content').textContent = player.accessory.effect.substring(0, 3).toUpperCase()
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop)
}
document.addEventListener('keydown', e => {
    input.keys[e.key] = true
});
document.addEventListener('keyup', e => {
    input.keys[e.key] = false
});
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = e.clientX - rect.left;
    input.mouse.y = e.clientY - rect.top
});
canvas.addEventListener('mousedown', () => {
    input.mouse.down = true;
    input.mouse.clicked = true
});
canvas.addEventListener('mouseup', () => {
    input.mouse.down = false
});
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('menu-screen').classList.add('hidden');
    game.state = 'playing';
    generateDungeon();
    updateUI()
});
document.getElementById('restart-btn').addEventListener('click', () => {
    location.reload()
});
gameLoop();