const canvas = document.getElementById('doodleCanvas');
const ctx = canvas.getContext('2d');
const pixelGrid = document.getElementById('pixelGrid');

let isDrawing = false;
let currentColor = '#ff00ff';
let brushSize = 5;
let isEraser = false;
let rainbowMode = false;
let mode = 'regular';
let pixelGridSize = 32;
let pixelData = [];
let strokeCount = 0;
let startTime = Date.now();
let isFillMode = false;

const tips = [
    "Pro tip: draw with ur eyes closed for MAXIMUM chaos",
    "Did u know? Art is just controlled accidents",
    "Fun fact: there are no mistakes, only happy accidents!!!",
    "Remember: if it looks bad just call it 'abstract'",
    "Expert advice: add more rainbows. always.",
    "Hot tip: smash that save button before u lose ur masterpiece",
    "Galaxy brain move: use the eraser to draw in white",
    "Secret technique: random colors = instant modern art",
    "Big brain time: pixel art is just fancy graph paper",
    "Wisdom: when in doubt, fill it with magenta",
    "Truth bomb: ur art is already perfect dont overthink it",
    "Legend says: the first stroke is always the hardest",
    "Ancient proverb: save early save often",
    "Real talk: mistakes make it more authentic",
    "Certified fact: this is definitely better than MS Paint"
];

function initCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function initPixelGrid() {
    pixelGrid.innerHTML = '';
    pixelData = [];
    const cellSize = 600 / pixelGridSize;
    pixelGrid.style.width = '800px';
    pixelGrid.style.height = '600px';
    pixelGrid.style.gridTemplateColumns = `repeat(${pixelGridSize}, ${cellSize}px)`;
    pixelGrid.style.gridTemplateRows = `repeat(${Math.floor(pixelGridSize * 0.75)}, ${cellSize}px)`;
    
    const rows = Math.floor(pixelGridSize * 0.75);
    for (let i = 0; i < rows * pixelGridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-cell';
        cell.style.width = cellSize + 'px';
        cell.style.height = cellSize + 'px';
        cell.style.backgroundColor = '#fff';
        cell.dataset.index = i;
        pixelGrid.appendChild(cell);
        pixelData.push('#fff');
    }
    
    setupPixelEvents();
}

function setupPixelEvents() {
    let isPixelDrawing = false;
    
    pixelGrid.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('pixel-cell')) {
            isPixelDrawing = true;
            paintPixel(e.target);
        }
    });
    
    pixelGrid.addEventListener('mousemove', (e) => {
        if (isPixelDrawing && e.target.classList.contains('pixel-cell')) {
            paintPixel(e.target);
        }
    });
    
    pixelGrid.addEventListener('mouseup', () => {
        isPixelDrawing = false;
    });
    
    pixelGrid.addEventListener('mouseleave', () => {
        isPixelDrawing = false;
    });
}

function paintPixel(cell) {
    const index = parseInt(cell.dataset.index);
    
    if (isFillMode) {
        const oldColor = pixelData[index];
        floodFill(index, oldColor, getDrawColor());
        return;
    }
    
    const color = isEraser ? '#fff' : getDrawColor();
    cell.style.backgroundColor = color;
    pixelData[index] = color;
    strokeCount++;
    updateStats();
}

function floodFill(index, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    
    const rows = Math.floor(pixelGridSize * 0.75);
    const cols = pixelGridSize;
    const stack = [index];
    const visited = new Set();
    
    while (stack.length > 0) {
        const current = stack.pop();
        
        if (visited.has(current)) continue;
        if (current < 0 || current >= pixelData.length) continue;
        if (pixelData[current] !== targetColor) continue;
        
        visited.add(current);
        pixelData[current] = replacementColor;
        const cell = pixelGrid.children[current];
        if (cell) cell.style.backgroundColor = replacementColor;
        
        const row = Math.floor(current / cols);
        const col = current % cols;
        
        if (col > 0) stack.push(current - 1);
        if (col < cols - 1) stack.push(current + 1);
        if (row > 0) stack.push(current - cols);
        if (row < rows - 1) stack.push(current + cols);
    }
    
    strokeCount++;
    updateStats();
}

function getDrawColor() {
    if (rainbowMode) {
        return `hsl(${Math.random() * 360}, 100%, 50%)`;
    }
    return currentColor;
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    strokeCount++;
    updateStats();
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = isEraser ? '#fff' : getDrawColor();
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function switchMode(newMode) {
    mode = newMode;
    
    document.getElementById('regularMode').classList.toggle('active', mode === 'regular');
    document.getElementById('pixelMode').classList.toggle('active', mode === 'pixel');
    
    const pixelOnlyElements = document.querySelectorAll('.pixel-only');
    pixelOnlyElements.forEach(el => {
        el.style.display = mode === 'pixel' ? 'block' : 'none';
    });
    
    if (mode === 'regular') {
        canvas.style.display = 'block';
        pixelGrid.style.display = 'none';
    } else {
        canvas.style.display = 'none';
        pixelGrid.style.display = 'grid';
        initPixelGrid();
    }
}

function clearCanvas() {
    if (confirm('R U SURE???? This will delete EVERYTHING!!!')) {
        if (mode === 'regular') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            initPixelGrid();
        }
        strokeCount = 0;
        updateStats();
    }
}

function saveImage() {
    let dataURL;
    
    if (mode === 'pixel') {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 800;
        tempCanvas.height = 600;
        
        const rows = Math.floor(pixelGridSize * 0.75);
        const cols = pixelGridSize;
        const cellWidth = 800 / cols;
        const cellHeight = 600 / rows;
        
        pixelData.forEach((color, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            tempCtx.fillStyle = color;
            tempCtx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        });
        
        dataURL = tempCanvas.toDataURL('image/png');
    } else {
        dataURL = canvas.toDataURL('image/png');
    }
    
    const link = document.createElement('a');
    link.download = `MASTERPIECE_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

function updateStats() {
    document.getElementById('strokeCount').textContent = strokeCount;
}

function updateTime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timeSpent').textContent = elapsed;
}

function getRandomTip() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('randomTip').textContent = tip;
}

function animateVisitorCounter() {
    const counter = document.getElementById('visitorCount');
    let count = 999999;
    setInterval(() => {
        count += Math.floor(Math.random() * 10) - 4;
        if (count < 999900) count = 999900;
        if (count > 999999) count = 999999;
        counter.textContent = count;
    }, 2000);
}

document.getElementById('regularMode').addEventListener('click', () => switchMode('regular'));
document.getElementById('pixelMode').addEventListener('click', () => switchMode('pixel'));

document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = e.target.value;
    document.getElementById('sizeDisplay').textContent = brushSize;
});

document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
    isEraser = false;
    isFillMode = false;
    document.getElementById('eraserBtn').style.opacity = '1';
    document.getElementById('fillBtn').style.opacity = '1';
});

document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentColor = btn.dataset.color;
        document.getElementById('colorPicker').value = currentColor;
        isEraser = false;
        isFillMode = false;
        document.getElementById('eraserBtn').style.opacity = '1';
        document.getElementById('fillBtn').style.opacity = '1';
    });
});

document.getElementById('eraserBtn').addEventListener('click', function() {
    isEraser = !isEraser;
    isFillMode = false;
    this.style.opacity = isEraser ? '0.5' : '1';
    this.textContent = isEraser ? '🧹 ERASER (ON)' : '🧹 ERASER';
    document.getElementById('fillBtn').style.opacity = '1';
});

document.getElementById('fillBtn').addEventListener('click', function() {
    isFillMode = !isFillMode;
    isEraser = false;
    this.style.opacity = isFillMode ? '0.5' : '1';
    this.textContent = isFillMode ? '🪣 FILL (ON)' : '🪣 FILL';
    document.getElementById('eraserBtn').style.opacity = '1';
});

document.getElementById('clearBtn').addEventListener('click', clearCanvas);
document.getElementById('saveBtn').addEventListener('click', saveImage);

document.getElementById('rainbowMode').addEventListener('change', (e) => {
    rainbowMode = e.target.checked;
});

document.getElementById('gridSize').addEventListener('change', (e) => {
    pixelGridSize = parseInt(e.target.value);
    initPixelGrid();
});

document.getElementById('newTipBtn').addEventListener('click', getRandomTip);

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

initCanvas();
getRandomTip();
animateVisitorCounter();
setInterval(updateTime, 1000);