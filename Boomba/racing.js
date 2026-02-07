const canvas = document.getElementById('road-canvas');
const ctx = canvas.getContext('2d');
const minimap = document.getElementById('minimap');
const mmCtx = minimap.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
minimap.width = 200;
minimap.height = 200;

const keys = {};
let gameRunning = false;
let raceStartTime = 0;
let currentTime = 0;

const track = {
  segments: [],
  length: 0,
  checkpoints: []
};

const car = {
  x: 0,
  z: 0,
  speed: 0,
  maxSpeed: 400,
  accel: 2.0,
  decel: 1.2,
  turnSpeed: 0.08,
  direction: 0,
  lap: 0,
  lastCheckpoint: -1
};

const ROAD_WIDTH = 2000;
const SEGMENT_LENGTH = 200;
const CAMERA_DEPTH = 300;
const DRAW_DISTANCE = 600;

function generateTrack() {
  const points = [
    {x: 0, z: 0},
    {x: 5000, z: 0},
    {x: 8000, z: 5000},
    {x: 8000, z: 12000},
    {x: 4000, z: 16000},
    {x: -2000, z: 18000},
    {x: -6000, z: 15000},
    {x: -8000, z: 10000},
    {x: -6000, z: 4000},
    {x: -2000, z: 2000}
  ];
  
  track.checkpoints = [];
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const segments = 100;
    
    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const x = p1.x + (p2.x - p1.x) * t;
      const z = p1.z + (p2.z - p1.z) * t;
      
      const curve = Math.sin(t * Math.PI * 4) * 500;
      const perpX = -(p2.z - p1.z);
      const perpZ = (p2.x - p1.x);
      const len = Math.sqrt(perpX * perpX + perpZ * perpZ);
      
      const totalProgress = (i * segments + j) / (points.length * segments);
      const y = Math.sin(totalProgress * Math.PI * 8) * 800 + Math.cos(totalProgress * Math.PI * 3) * 400;
      
      track.segments.push({
        x: x + (perpX / len) * curve,
        y: y,
        z: z + (perpZ / len) * curve,
        curve: curve * 0.0001
      });
    }
    
    if (i > 0) {
      track.checkpoints.push(track.segments.length - 50);
    }
  }
  
  track.length = track.segments.length;
}

function project3D(x, y, z, camX, camY, camZ, camAngle) {
  const dx = x - camX;
  const dy = y - camY;
  const dz = z - camZ;
  
  const rotX = dx * Math.cos(camAngle) + dz * Math.sin(camAngle);
  const rotZ = -dx * Math.sin(camAngle) + dz * Math.cos(camAngle);
  
  if (rotZ <= 1) return null;
  
  const scale = CAMERA_DEPTH / rotZ;
  const screenX = canvas.width / 2 + rotX * scale;
  const screenY = canvas.height * 0.5 + dy * scale - rotZ * 2;
  const screenW = ROAD_WIDTH * scale;
  
  return {x: screenX, y: screenY, w: screenW, scale: scale};
}

function getSegmentAt(position) {
  const index = Math.floor(position) % track.length;
  return track.segments[index < 0 ? index + track.length : index];
}

function drawRoad() {
  ctx.fillStyle = '#72D7EE';
  ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
  
  ctx.fillStyle = '#6B8C42';
  ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
  
  const baseIndex = Math.floor(car.z / SEGMENT_LENGTH);
  const baseSegment = getSegmentAt(baseIndex);
  
  const cameraDepth = 1 / Math.tan((90 / 2) * Math.PI / 180);
  
  for (let n = DRAW_DISTANCE - 1; n > 0; n--) {
    const segment = getSegmentAt(baseIndex + n);
    const prevSegment = getSegmentAt(baseIndex + n - 1);
    
    const proj1 = project(segment, n * SEGMENT_LENGTH);
    const proj2 = project(prevSegment, (n - 1) * SEGMENT_LENGTH);
    
    if (!proj1 || !proj2) continue;
    
    const isEven = Math.floor(n / 3) % 2 === 0;
    const roadColor = isEven ? '#6B6B6B' : '#696969';
    const grassColor = isEven ? '#10AA10' : '#009A00';
    const rumbleColor = isEven ? '#FFFFFF' : '#FF0000';
    const laneColor = '#FFFFFF';
    
    ctx.fillStyle = grassColor;
    ctx.fillRect(0, proj2.y, canvas.width, proj1.y - proj2.y);
    
    const rumbleW1 = proj1.w * 0.15;
    const rumbleW2 = proj2.w * 0.15;
    ctx.fillStyle = rumbleColor;
    ctx.fillRect(proj1.x - proj1.w / 2 - rumbleW1, proj1.y, rumbleW1, proj2.y - proj1.y);
    ctx.fillRect(proj1.x + proj1.w / 2, proj1.y, rumbleW1, proj2.y - proj1.y);
    
    ctx.fillStyle = roadColor;
    ctx.fillRect(proj1.x - proj1.w / 2, proj1.y, proj1.w, proj2.y - proj1.y);
    
    if (n % 4 === 0) {
      ctx.fillStyle = laneColor;
      const laneW = proj1.w * 0.05;
      const laneH = proj2.y - proj1.y;
      ctx.fillRect(proj1.x - laneW / 2, proj1.y, laneW, laneH * 0.6);
    }
  }
  
  const carScreenY = canvas.height * 0.8;
  const carScreenX = canvas.width / 2;
  const carWidth = 60;
  const carHeight = 100;
  
  ctx.save();
  ctx.translate(carScreenX, carScreenY);
  ctx.fillStyle = '#c00';
  ctx.fillRect(-carWidth / 2, -carHeight, carWidth, carHeight);
  ctx.fillStyle = '#600';
  ctx.fillRect(-carWidth / 2 + 5, -carHeight + 15, carWidth - 10, 35);
  ctx.fillStyle = '#ff0';
  ctx.fillRect(-carWidth / 2, -15, 8, 10);
  ctx.fillRect(carWidth / 2 - 8, -15, 8, 10);
  ctx.fillStyle = '#111';
  ctx.fillRect(-carWidth / 2 - 8, -carHeight + 65, 10, 25);
  ctx.fillRect(carWidth / 2 - 2, -carHeight + 65, 10, 25);
  ctx.restore();
}

function project(segment, segmentZ) {
  const cameraX = car.x;
  const cameraY = 1000;
  const cameraZ = car.z;
  const cameraDepth = 1 / Math.tan((90 / 2) * Math.PI / 180);
  
  let camX = segment.x - cameraX;
  let camY = segment.y - cameraY;
  let camZ = segmentZ - cameraZ;
  
  const angle = -car.direction;
  const rotX = camX * Math.cos(angle) - camZ * Math.sin(angle);
  const rotZ = camX * Math.sin(angle) + camZ * Math.cos(angle);
  
  camX = rotX;
  camZ = rotZ;
  
  if (camZ <= 0) return null;
  
  const scale = cameraDepth / camZ;
  const screenX = Math.round((canvas.width / 2) + (scale * camX * canvas.width / 2));
  const screenY = Math.round((canvas.height / 2) - (scale * camY * canvas.height / 2));
  const screenW = Math.round(scale * ROAD_WIDTH * canvas.width / 2);
  
  if (screenY < 0 || screenY > canvas.height * 2) return null;
  
  return {x: screenX, y: screenY, w: screenW, scale: scale};
}

function drawMinimap() {
  mmCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  mmCtx.fillRect(0, 0, minimap.width, minimap.height);
  
  const scale = 0.012;
  const centerX = minimap.width / 2;
  const centerY = minimap.height / 2;
  
  mmCtx.strokeStyle = '#0f0';
  mmCtx.lineWidth = 2;
  mmCtx.beginPath();
  
  for (let i = 0; i < track.segments.length; i += 5) {
    const seg = track.segments[i];
    const x = centerX + (seg.x - car.x) * scale;
    const y = centerY + (seg.z - car.z) * scale;
    
    if (i === 0) {
      mmCtx.moveTo(x, y);
    } else {
      mmCtx.lineTo(x, y);
    }
  }
  
  mmCtx.closePath();
  mmCtx.stroke();
  
  for (let cp of track.checkpoints) {
    const seg = track.segments[cp];
    const x = centerX + (seg.x - car.x) * scale;
    const y = centerY + (seg.z - car.z) * scale;
    mmCtx.fillStyle = '#ff0';
    mmCtx.fillRect(x - 2, y - 2, 4, 4);
  }
  
  mmCtx.fillStyle = '#f00';
  mmCtx.save();
  mmCtx.translate(centerX, centerY);
  mmCtx.rotate(car.direction);
  mmCtx.fillRect(-4, -6, 8, 12);
  mmCtx.fillStyle = '#fff';
  mmCtx.fillRect(-3, -6, 6, 4);
  mmCtx.restore();
}

function updateCar(dt) {
  if (keys['ArrowUp']) {
    car.speed = Math.min(car.speed + car.accel * dt, car.maxSpeed);
  } else if (keys['ArrowDown']) {
    car.speed = Math.max(car.speed - car.accel * dt * 2, -car.maxSpeed * 0.5);
  } else {
    if (car.speed > 0) {
      car.speed = Math.max(0, car.speed - car.decel * dt);
    } else {
      car.speed = Math.min(0, car.speed + car.decel * dt);
    }
  }
  
  const speedFactor = Math.abs(car.speed) / car.maxSpeed;
  
  if (keys['ArrowLeft']) {
    car.direction -= car.turnSpeed * dt * (0.3 + speedFactor * 0.7);
  }
  if (keys['ArrowRight']) {
    car.direction += car.turnSpeed * dt * (0.3 + speedFactor * 0.7);
  }
  
  const dx = Math.sin(car.direction) * car.speed * dt;
  const dz = Math.cos(car.direction) * car.speed * dt;
  
  car.x += dx;
  car.z += dz;
  
  const currentSeg = Math.floor(car.z / SEGMENT_LENGTH);
  const segment = getSegmentAt(currentSeg);
  
  const distFromCenter = car.x - segment.x;
  if (Math.abs(distFromCenter) > ROAD_WIDTH / 2) {
    car.speed *= 0.92;
    car.x -= distFromCenter * 0.05;
  }
  
  for (let i = 0; i < track.checkpoints.length; i++) {
    const cpSegIndex = track.checkpoints[i];
    if (currentSeg >= cpSegIndex - 5 && currentSeg <= cpSegIndex + 5 && car.lastCheckpoint !== i) {
      car.lastCheckpoint = i;
      
      if (i === 0 && car.lastCheckpoint === 0 && car.z > SEGMENT_LENGTH * 100) {
        car.lap++;
        document.getElementById('lap').textContent = `Lap ${car.lap + 1}/3`;
        
        if (car.lap >= 3) {
          finishRace();
        }
      }
      
      document.getElementById('checkpoint').textContent = `Checkpoint ${i + 1}/${track.checkpoints.length}`;
      setTimeout(() => {
        document.getElementById('checkpoint').textContent = '';
      }, 2000);
      
      break;
    }
  }
}

function updateHUD() {
  document.getElementById('speed').textContent = `${Math.abs(Math.round(car.speed))} km/h`;
  
  const elapsed = (currentTime - raceStartTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = (elapsed % 60).toFixed(2);
  document.getElementById('timer').textContent = `${minutes}:${seconds.padStart(5, '0')}`;
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  
  const dt = Math.min(timestamp - currentTime, 100) / 16.67;
  currentTime = timestamp;
  
  updateCar(dt);
  drawRoad();
  drawMinimap();
  updateHUD();
  
  requestAnimationFrame(gameLoop);
}

function startRace() {
  document.getElementById('start-screen').style.display = 'none';
  car.x = 0;
  car.z = 0;
  car.speed = 0;
  car.direction = 0;
  car.lap = 0;
  car.lastCheckpoint = -1;
  gameRunning = true;
  raceStartTime = performance.now();
  currentTime = raceStartTime;
  requestAnimationFrame(gameLoop);
}

function finishRace() {
  gameRunning = false;
  const finalTime = (currentTime - raceStartTime) / 1000;
  const minutes = Math.floor(finalTime / 60);
  const seconds = (finalTime % 60).toFixed(2);
  document.getElementById('final-time').textContent = `Time: ${minutes}:${seconds.padStart(5, '0')}`;
  document.getElementById('finish-screen').style.display = 'block';
}

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

document.getElementById('start-btn').addEventListener('click', startRace);
document.getElementById('restart-btn').addEventListener('click', () => {
  document.getElementById('finish-screen').style.display = 'none';
  startRace();
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

generateTrack();