// Global variables
let canvas, ctx;
let originalImage = null;
let currentImage = null;
let historyStack = [];
let historyIndex = -1;
let currentTool = 'upload';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawTool = 'brush';
let pixelTool = 'draw';
let rainbowBrush = false;
let hueOffset = 0;
let collageImages = [];
let chaosLevel = 0;
let filterCount = 0;

// DOM elements
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const dropZone = document.getElementById('drop-zone');
const mainCanvas = document.getElementById('main-canvas');
const drawCanvas = document.getElementById('draw-canvas');
const pixelCanvas = document.getElementById('pixel-canvas');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    canvas = mainCanvas;
    ctx = canvas.getContext('2d');
    
    setupEventListeners();
    createFloatingEmojis();
    createCursorTrail();
    updateTips();
    startClock();
}

// Event Listeners Setup
function setupEventListeners() {
    // File upload
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTool = e.target.dataset.tool;
            switchTool(currentTool);
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            applyFilterPreview(filter);
        });
    });
    
    document.getElementById('apply-filter')?.addEventListener('click', applyCurrentFilter);
    document.getElementById('stack-filter')?.addEventListener('click', stackFilter);
    
    // Glitch buttons
    document.querySelectorAll('.glitch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const glitch = e.target.dataset.glitch;
            applyGlitch(glitch);
        });
    });
    
    document.getElementById('random-glitch')?.addEventListener('click', randomGlitch);
    document.getElementById('ultra-glitch')?.addEventListener('click', ultraGlitch);
    
    // Drawing controls
    setupDrawingControls();
    
    // Pixel art controls
    setupPixelControls();
    
    // Meme controls
    setupMemeControls();
    
    // Collage controls
    setupCollageControls();
    
    // Action buttons
    document.getElementById('download-btn')?.addEventListener('click', downloadImage);
    document.getElementById('reset-btn')?.addEventListener('click', resetImage);
    document.getElementById('random-chaos')?.addEventListener('click', randomChaos);
    document.getElementById('undo-btn')?.addEventListener('click', undo);
    document.getElementById('redo-btn')?.addEventListener('click', redo);
    
    // Webcam
    document.getElementById('webcam-btn')?.addEventListener('click', startWebcam);
    document.getElementById('capture-btn')?.addEventListener('click', captureWebcam);
    
    // Sidebar
    document.getElementById('new-tip')?.addEventListener('click', updateTips);
    
    // Sliders
    document.getElementById('filter-intensity')?.addEventListener('input', (e) => {
        document.getElementById('intensity-value').textContent = e.target.value;
    });
    
    document.getElementById('glitch-amount')?.addEventListener('input', (e) => {
        document.getElementById('glitch-amount-display').textContent = e.target.value;
    });
}

function switchTool(tool) {
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tool}-section`)?.classList.add('active');
}

// File Handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            currentImage = img;
            displayImage(img);
            saveToHistory();
            updateChaos(5);
            addToHistory('Image uploaded');
            unlockAchievement(0);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayImage(img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    document.getElementById('dimensions').textContent = `${img.width} × ${img.height}px`;
}

// History Management
function saveToHistory() {
    historyStack = historyStack.slice(0, historyIndex + 1);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStack.push(imageData);
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(historyStack[historyIndex], 0, 0);
        addToHistory('Undo');
    }
}

function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        ctx.putImageData(historyStack[historyIndex], 0, 0);
        addToHistory('Redo');
    }
}

// Filters
function applyFilterPreview(filterName) {
    if (!originalImage) return;
    
    const intensity = document.getElementById('filter-intensity').value / 100;
    
    displayImage(currentImage);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    switch(filterName) {
        case 'grayscale':
            applyGrayscale(data);
            break;
        case 'sepia':
            applySepia(data);
            break;
        case 'invert':
            applyInvert(data);
            break;
        case 'blur':
            applyBlur(imageData);
            break;
        case 'brightness':
            applyBrightness(data, intensity);
            break;
        case 'contrast':
            applyContrast(data, intensity);
            break;
        case 'saturate':
            applySaturate(data, intensity);
            break;
        case 'hue':
            applyHueRotate(data, intensity * 360);
            break;
        case 'pixelate':
            applyPixelate(intensity);
            break;
        case 'edge':
            applyEdgeDetect(imageData);
            break;
        case 'emboss':
            applyEmboss(imageData);
            break;
        case 'vaporwave':
            applyVaporwave(data);
            break;
        case 'deepfry':
            applyDeepFry(data);
            break;
        case 'rainbow':
            applyRainbow(data);
            break;
        case 'nightvision':
            applyNightVision(data);
            break;
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function applyCurrentFilter() {
    saveToHistory();
    filterCount++;
    addToHistory('Filter applied');
    updateChaos(10);
    if (filterCount >= 10) unlockAchievement(1);
}

function stackFilter() {
    applyCurrentFilter();
}

// Filter implementations
function applyGrayscale(data) {
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
    }
}

function applySepia(data) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
}

function applyInvert(data) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
}

function applyBrightness(data, factor) {
    const adjust = (factor - 0.5) * 100;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + adjust));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjust));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjust));
    }
}

function applyContrast(data, factor) {
    const contrast = factor * 2;
    const intercept = 128 * (1 - contrast);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * contrast + intercept));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * contrast + intercept));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * contrast + intercept));
    }
}

function applySaturate(data, factor) {
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
        data[i] = Math.min(255, gray + factor * (data[i] - gray));
        data[i + 1] = Math.min(255, gray + factor * (data[i + 1] - gray));
        data[i + 2] = Math.min(255, gray + factor * (data[i + 2] - gray));
    }
}

function applyHueRotate(data, angle) {
    const cos = Math.cos(angle * Math.PI / 180);
    const sin = Math.sin(angle * Math.PI / 180);
    const lumR = 0.213, lumG = 0.715, lumB = 0.072;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = (lumR + cos * (1 - lumR) + sin * (-lumR)) * r + 
                  (lumG + cos * (-lumG) + sin * (-lumG)) * g + 
                  (lumB + cos * (-lumB) + sin * (1 - lumB)) * b;
        data[i + 1] = (lumR + cos * (-lumR) + sin * (0.143)) * r + 
                      (lumG + cos * (1 - lumG) + sin * (0.140)) * g + 
                      (lumB + cos * (-lumB) + sin * (-0.283)) * b;
        data[i + 2] = (lumR + cos * (-lumR) + sin * (-(1 - lumR))) * r + 
                      (lumG + cos * (-lumG) + sin * (lumG)) * g + 
                      (lumB + cos * (1 - lumB) + sin * (lumB)) * b;
    }
}

function applyPixelate(size) {
    const pixelSize = Math.max(1, Math.floor(20 * size));
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.imageSmoothingEnabled = false;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = w / pixelSize;
    tempCanvas.height = h / pixelSize;
    
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, w, h);
    
    ctx.imageSmoothingEnabled = true;
}

function applyBlur(imageData) {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const temp = new Uint8ClampedArray(pixels);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4 + c;
                        sum += temp[idx];
                    }
                }
                pixels[(y * width + x) * 4 + c] = sum / 9;
            }
        }
    }
}

function applyEdgeDetect(imageData) {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const temp = new Uint8ClampedArray(pixels);
    
    const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += temp[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                pixels[(y * width + x) * 4 + c] = Math.abs(sum);
            }
        }
    }
}

function applyEmboss(imageData) {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const temp = new Uint8ClampedArray(pixels);
    
    const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += temp[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                pixels[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, sum + 128));
            }
        }
    }
}

function applyVaporwave(data) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2 + 50);
        data[i + 1] = Math.min(255, data[i + 1] * 0.8);
        data[i + 2] = Math.min(255, data[i + 2] * 1.5 + 30);
    }
}

function applyDeepFry(data) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.5 + Math.random() * 50);
        data[i + 1] = Math.min(255, data[i + 1] * 1.3);
        data[i + 2] = Math.min(255, data[i + 2] * 0.7);
    }
    applyContrast(data, 2);
}

function applyRainbow(data) {
    for (let i = 0; i < data.length; i += 4) {
        const hue = (i / data.length) * 360;
        const [r, g, b] = hslToRgb(hue, 1, 0.5);
        data[i] = Math.min(255, (data[i] + r * 255) / 2);
        data[i + 1] = Math.min(255, (data[i + 1] + g * 255) / 2);
        data[i + 2] = Math.min(255, (data[i + 2] + b * 255) / 2);
    }
}

function applyNightVision(data) {
    applyGrayscale(data);
    for (let i = 0; i < data.length; i += 4) {
        data[i + 1] = Math.min(255, data[i] * 1.5);
        data[i] = data[i] * 0.3;
        data[i + 2] = data[i + 2] * 0.3;
    }
}

// Glitch Effects
function applyGlitch(type) {
    if (!originalImage) return;
    
    const amount = document.getElementById('glitch-amount').value / 100;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    switch(type) {
        case 'rgb':
            glitchRGB(imageData, amount);
            break;
        case 'scan':
            glitchScanlines(imageData);
            break;
        case 'corrupt':
            glitchCorrupt(imageData, amount);
            break;
        case 'wave':
            glitchWave(imageData, amount);
            break;
        case 'noise':
            glitchNoise(imageData, amount);
            break;
        case 'slice':
            glitchSlice(imageData, amount);
            break;
        case 'crt':
            glitchCRT(imageData);
            break;
        case 'datamosh':
            glitchDatamosh(imageData, amount);
            break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
    addToHistory(`Glitch: ${type}`);
    updateChaos(15);
}

function glitchRGB(imageData, amount) {
    const data = imageData.data;
    const offset = Math.floor(amount * 20);
    const temp = new Uint8ClampedArray(data);
    
    for (let i = 0; i < data.length; i += 4) {
        const redOffset = ((i + offset * 4) % data.length);
        const blueOffset = ((i - offset * 4 + data.length) % data.length);
        data[i] = temp[redOffset];
        data[i + 2] = temp[blueOffset];
    }
}

function glitchScanlines(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    
    for (let y = 0; y < imageData.height; y += 2) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            data[i] *= 0.7;
            data[i + 1] *= 0.7;
            data[i + 2] *= 0.7;
        }
    }
}

function glitchCorrupt(imageData, amount) {
    const data = imageData.data;
    const corruptAmount = Math.floor(amount * data.length * 0.01);
    
    for (let i = 0; i < corruptAmount; i++) {
        const idx = Math.floor(Math.random() * data.length);
        data[idx] = Math.random() * 255;
    }
}

function glitchWave(imageData, amount) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const temp = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
        const offset = Math.floor(Math.sin(y * 0.1) * amount * 20);
        for (let x = 0; x < width; x++) {
            const newX = (x + offset + width) % width;
            const oldIdx = (y * width + x) * 4;
            const newIdx = (y * width + newX) * 4;
            data[newIdx] = temp[oldIdx];
            data[newIdx + 1] = temp[oldIdx + 1];
            data[newIdx + 2] = temp[oldIdx + 2];
            data[newIdx + 3] = temp[oldIdx + 3];
        }
    }
}

function glitchNoise(imageData, amount) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < amount * 0.1) {
            const noise = Math.random() * 255;
            data[i] = data[i + 1] = data[i + 2] = noise;
        }
    }
}

function glitchSlice(imageData, amount) {
    const height = imageData.height;
    const slices = Math.floor(amount * 20);
    
    for (let i = 0; i < slices; i++) {
        const y = Math.floor(Math.random() * height);
        const sliceHeight = Math.floor(Math.random() * 20) + 1;
        const offset = (Math.random() - 0.5) * amount * 100;
        
        const slice = ctx.getImageData(0, y, canvas.width, sliceHeight);
        ctx.putImageData(slice, offset, y);
    }
}

function glitchCRT(imageData) {
    glitchScanlines(imageData);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i + 1] = Math.min(255, data[i + 1] * 1.2);
    }
}

function glitchDatamosh(imageData, amount) {
    const data = imageData.data;
    const blocks = Math.floor(amount * 50);
    
    for (let i = 0; i < blocks; i++) {
        const blockSize = Math.floor(Math.random() * 100) + 10;
        const srcX = Math.floor(Math.random() * (imageData.width - blockSize));
        const srcY = Math.floor(Math.random() * (imageData.height - blockSize));
        const dstX = Math.floor(Math.random() * (imageData.width - blockSize));
        const dstY = Math.floor(Math.random() * (imageData.height - blockSize));
        
        const block = ctx.getImageData(srcX, srcY, blockSize, blockSize);
        ctx.putImageData(block, dstX, dstY);
    }
}

function randomGlitch() {
    const glitches = ['rgb', 'scan', 'corrupt', 'wave', 'noise', 'slice', 'crt', 'datamosh'];
    const randomType = glitches[Math.floor(Math.random() * glitches.length)];
    applyGlitch(randomType);
}

function ultraGlitch() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => randomGlitch(), i * 100);
    }
    updateChaos(50);
    if (chaosLevel >= 100) unlockAchievement(2);
}

// Drawing Tools
function setupDrawingControls() {
    const drawCtx = drawCanvas.getContext('2d');
    
    document.getElementById('brush-size')?.addEventListener('input', (e) => {
        document.getElementById('brush-size-display').textContent = e.target.value;
    });
    
    document.getElementById('rainbow-brush')?.addEventListener('click', () => {
        rainbowBrush = !rainbowBrush;
        const btn = document.getElementById('rainbow-brush');
        btn.style.background = rainbowBrush ? 'linear-gradient(90deg, red, orange, yellow, green, blue, violet)' : '';
    });
    
    document.querySelectorAll('.draw-tool').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.draw-tool').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            drawTool = e.target.dataset.tool;
        });
    });
    
    // Drawing events
    drawCanvas.addEventListener('mousedown', startDraw);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDraw);
    drawCanvas.addEventListener('mouseout', stopDraw);
    
    document.getElementById('clear-drawing')?.addEventListener('click', () => {
        if (currentImage) {
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            mergeDrawing();
        }
    });
    
    // Initialize draw canvas with current image
    if (currentImage) {
        drawCanvas.width = canvas.width;
        drawCanvas.height = canvas.height;
        drawCtx.drawImage(canvas, 0, 0);
    }
}

function startDraw(e) {
    if (!currentImage) return;
    isDrawing = true;
    const rect = drawCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = drawCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const drawCtx = drawCanvas.getContext('2d');
    
    const size = document.getElementById('brush-size').value;
    let color = document.getElementById('brush-color').value;
    
    if (rainbowBrush) {
        hueOffset = (hueOffset + 1) % 360;
        color = `hsl(${hueOffset}, 100%, 50%)`;
    }
    
    drawCtx.strokeStyle = color;
    drawCtx.fillStyle = color;
    drawCtx.lineWidth = size;
    drawCtx.lineCap = 'round';
    
    switch(drawTool) {
        case 'brush':
            drawCtx.beginPath();
            drawCtx.moveTo(lastX, lastY);
            drawCtx.lineTo(x, y);
            drawCtx.stroke();
            break;
        case 'eraser':
            drawCtx.clearRect(x - size/2, y - size/2, size, size);
            break;
        case 'spray':
            for (let i = 0; i < 20; i++) {
                const offsetX = (Math.random() - 0.5) * size;
                const offsetY = (Math.random() - 0.5) * size;
                drawCtx.fillRect(x + offsetX, y + offsetY, 2, 2);
            }
            break;
    }
    
    lastX = x;
    lastY = y;
}

function stopDraw() {
    if (isDrawing) {
        isDrawing = false;
        mergeDrawing();
    }
}

function mergeDrawing() {
    ctx.drawImage(drawCanvas, 0, 0);
    saveToHistory();
    addToHistory('Drawing applied');
}

// Pixel Art
function setupPixelControls() {
    const pixelCtx = pixelCanvas.getContext('2d');
    
    document.getElementById('grid-size')?.addEventListener('change', (e) => {
        initPixelCanvas(parseInt(e.target.value));
    });
    
    document.querySelectorAll('.pixel-tool').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pixel-tool').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            pixelTool = e.target.dataset.tool;
        });
    });
    
    pixelCanvas.addEventListener('mousedown', (e) => {
        pixelDraw(e);
        pixelCanvas.addEventListener('mousemove', pixelDraw);
    });
    
    pixelCanvas.addEventListener('mouseup', () => {
        pixelCanvas.removeEventListener('mousemove', pixelDraw);
    });
    
    document.getElementById('clear-pixel')?.addEventListener('click', () => {
        const size = parseInt(document.getElementById('grid-size').value);
        initPixelCanvas(size);
    });
    
    document.getElementById('mirror-h')?.addEventListener('click', mirrorPixelH);
    document.getElementById('mirror-v')?.addEventListener('click', mirrorPixelV);
    document.getElementById('rotate-pixel')?.addEventListener('click', rotatePixel);
    
    initPixelCanvas(16);
}

function initPixelCanvas(gridSize) {
    const size = 400;
    pixelCanvas.width = gridSize;
    pixelCanvas.height = gridSize;
    pixelCanvas.style.width = size + 'px';
    pixelCanvas.style.height = size + 'px';
    
    const ctx = pixelCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, gridSize, gridSize);
}

function pixelDraw(e) {
    const rect = pixelCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / rect.width * pixelCanvas.width);
    const y = Math.floor((e.clientY - rect.top) / rect.height * pixelCanvas.height);
    
    const ctx = pixelCanvas.getContext('2d');
    const color = document.getElementById('pixel-color').value;
    
    switch(pixelTool) {
        case 'draw':
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
            break;
        case 'erase':
            ctx.clearRect(x, y, 1, 1);
            break;
        case 'pick':
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const pickedColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
            document.getElementById('pixel-color').value = pickedColor;
            break;
        case 'fill':
            floodFill(ctx, x, y, color);
            break;
    }
    
    updateChaos(2);
}

function floodFill(ctx, x, y, fillColor) {
    const imageData = ctx.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    const fillRGB = hexToRgb(fillColor);
    
    if (colorsMatch(targetColor, fillRGB)) return;
    
    const stack = [[x, y]];
    
    while (stack.length) {
        const [cx, cy] = stack.pop();
        
        if (cx < 0 || cx >= pixelCanvas.width || cy < 0 || cy >= pixelCanvas.height) continue;
        
        const currentColor = getPixelColor(imageData, cx, cy);
        if (!colorsMatch(currentColor, targetColor)) continue;
        
        setPixelColor(imageData, cx, cy, fillRGB);
        
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(imageData, x, y) {
    const i = (y * imageData.width + x) * 4;
    return [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
}

function setPixelColor(imageData, x, y, rgb) {
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = rgb[0];
    imageData.data[i + 1] = rgb[1];
    imageData.data[i + 2] = rgb[2];
    imageData.data[i + 3] = 255;
}

function colorsMatch(c1, c2) {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
}

function mirrorPixelH() {
    const ctx = pixelCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);
    const width = pixelCanvas.width;
    const height = pixelCanvas.height;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
            const left = getPixelColor(imageData, x, y);
            const right = getPixelColor(imageData, width - 1 - x, y);
            setPixelColor(imageData, width - 1 - x, y, left);
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function mirrorPixelV() {
    const ctx = pixelCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);
    const width = pixelCanvas.width;
    const height = pixelCanvas.height;
    
    for (let y = 0; y < height / 2; y++) {
        for (let x = 0; x < width; x++) {
            const top = getPixelColor(imageData, x, y);
            setPixelColor(imageData, x, height - 1 - y, top);
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function rotatePixel() {
    const ctx = pixelCanvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = pixelCanvas.height;
    tempCanvas.height = pixelCanvas.width;
    
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.drawImage(pixelCanvas, -pixelCanvas.width / 2, -pixelCanvas.height / 2);
    
    ctx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    ctx.drawImage(tempCanvas, 0, 0, pixelCanvas.width, pixelCanvas.height);
}

// Meme Maker
function setupMemeControls() {
    document.getElementById('meme-size')?.addEventListener('input', (e) => {
        document.getElementById('meme-size-display').textContent = e.target.value;
    });
    
    document.getElementById('apply-meme')?.addEventListener('click', applyMemeText);
    document.getElementById('random-meme')?.addEventListener('click', randomMemeText);
}

function applyMemeText() {
    if (!currentImage) return;
    
    const topText = document.getElementById('top-text').value.toUpperCase();
    const bottomText = document.getElementById('bottom-text').value.toUpperCase();
    const fontSize = document.getElementById('meme-size').value;
    const textColor = document.getElementById('meme-color').value;
    const strokeColor = document.getElementById('meme-stroke').value;
    const font = document.getElementById('meme-font').value;
    
    displayImage(currentImage);
    
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = textColor;
    ctx.lineWidth = fontSize / 10;
    
    if (topText) {
        const y = fontSize * 1.2;
        ctx.strokeText(topText, canvas.width / 2, y);
        ctx.fillText(topText, canvas.width / 2, y);
    }
    
    if (bottomText) {
        const y = canvas.height - fontSize * 0.5;
        ctx.strokeText(bottomText, canvas.width / 2, y);
        ctx.fillText(bottomText, canvas.width / 2, y);
    }
    
    saveToHistory();
    addToHistory('Meme text added');
    updateChaos(10);
}

function randomMemeText() {
    const topTexts = ['WHEN YOU', 'ME TRYING TO', 'NOBODY:', 'POV:', 'THAT MOMENT WHEN'];
    const bottomTexts = ['BOTTOM TEXT', 'EPIC FAIL', 'VERY NICE', 'SUCH WOW', 'MAXIMUM CHAOS'];
    
    document.getElementById('top-text').value = topTexts[Math.floor(Math.random() * topTexts.length)];
    document.getElementById('bottom-text').value = bottomTexts[Math.floor(Math.random() * bottomTexts.length)];
    applyMemeText();
}

// Collage
function setupCollageControls() {
    document.getElementById('collage-upload')?.addEventListener('click', () => {
        document.getElementById('collage-input').click();
    });
    
    document.getElementById('collage-input')?.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        collageImages.push(img);
                        updateCollagePreview();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    document.getElementById('generate-collage')?.addEventListener('click', generateCollage);
    document.getElementById('shuffle-collage')?.addEventListener('click', () => {
        collageImages.sort(() => Math.random() - 0.5);
        generateCollage();
    });
}

function updateCollagePreview() {
    const preview = document.getElementById('collage-preview');
    preview.innerHTML = `${collageImages.length} images loaded`;
}

function generateCollage() {
    if (collageImages.length === 0) return;
    
    const layout = document.getElementById('collage-layout').value;
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    
    switch(layout) {
        case 'grid':
            generateGridCollage(size);
            break;
        case 'random':
            generateRandomCollage(size);
            break;
        case 'spiral':
            generateSpiralCollage(size);
            break;
        case 'circle':
            generateCircleCollage(size);
            break;
    }
    
    saveToHistory();
    addToHistory('Collage created');
    updateChaos(20);
}

function generateGridCollage(size) {
    const cols = Math.ceil(Math.sqrt(collageImages.length));
    const rows = Math.ceil(collageImages.length / cols);
    const cellW = size / cols;
    const cellH = size / rows;
    
    collageImages.forEach((img, i) => {
        const x = (i % cols) * cellW;
        const y = Math.floor(i / cols) * cellH;
        ctx.drawImage(img, x, y, cellW, cellH);
    });
}

function generateRandomCollage(size) {
    collageImages.forEach(img => {
        const w = Math.random() * size * 0.5 + size * 0.2;
        const h = w * (img.height / img.width);
        const x = Math.random() * (size - w);
        const y = Math.random() * (size - h);
        const rotation = (Math.random() - 0.5) * 0.5;
        
        ctx.save();
        ctx.translate(x + w/2, y + h/2);
        ctx.rotate(rotation);
        ctx.drawImage(img, -w/2, -h/2, w, h);
        ctx.restore();
    });
}

function generateSpiralCollage(size) {
    const center = size / 2;
    let angle = 0;
    let radius = 50;
    
    collageImages.forEach((img, i) => {
        const imgSize = 100;
        const x = center + Math.cos(angle) * radius - imgSize/2;
        const y = center + Math.sin(angle) * radius - imgSize/2;
        
        ctx.save();
        ctx.translate(x + imgSize/2, y + imgSize/2);
        ctx.rotate(angle);
        ctx.drawImage(img, -imgSize/2, -imgSize/2, imgSize, imgSize);
        ctx.restore();
        
        angle += Math.PI / 3;
        radius += 20;
    });
}

function generateCircleCollage(size) {
    const center = size / 2;
    const radius = size * 0.35;
    const angleStep = (Math.PI * 2) / collageImages.length;
    
    collageImages.forEach((img, i) => {
        const angle = i * angleStep;
        const imgSize = 100;
        const x = center + Math.cos(angle) * radius - imgSize/2;
        const y = center + Math.sin(angle) * radius - imgSize/2;
        
        ctx.drawImage(img, x, y, imgSize, imgSize);
    });
}

// Webcam
function startWebcam() {
    const video = document.getElementById('webcam');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.style.display = 'block';
            document.getElementById('capture-btn').style.display = 'block';
        })
        .catch(err => {
            alert('Webcam access denied!');
        });
}

function captureWebcam() {
    const video = document.getElementById('webcam');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
        originalImage = img;
        currentImage = img;
        displayImage(img);
        saveToHistory();
    };
    
    video.style.display = 'none';
    document.getElementById('capture-btn').style.display = 'none';
    const stream = video.srcObject;
    stream.getTracks().forEach(track => track.stop());
}

// Utility Functions
function downloadImage() {
    const link = document.createElement('a');
    link.download = `bozone-masterpiece-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    addToHistory('Image downloaded');
}

function resetImage() {
    if (originalImage) {
        displayImage(originalImage);
        currentImage = originalImage;
        saveToHistory();
        addToHistory('Reset to original');
        chaosLevel = 0;
        updateChaosDisplay();
    }
}

function randomChaos() {
    if (!originalImage) return;
    
    const actions = [
        () => randomGlitch(),
        () => applyFilterPreview(['vaporwave', 'deepfry', 'rainbow'][Math.floor(Math.random() * 3)]),
        () => applyCurrentFilter(),
        () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            glitchCorrupt(imageData, 0.5);
            ctx.putImageData(imageData, 0, 0);
        }
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
    
    updateChaos(25);
}

function addToHistory(text) {
    const historyList = document.getElementById('history-list');
    const entry = document.createElement('p');
    entry.textContent = `${new Date().toLocaleTimeString()}: ${text}`;
    historyList.insertBefore(entry, historyList.firstChild);
    
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

function updateChaos(amount) {
    chaosLevel = Math.min(100, chaosLevel + amount);
    updateChaosDisplay();
}

function updateChaosDisplay() {
    document.getElementById('chaos-bar').style.width = chaosLevel + '%';
    document.getElementById('chaos-text').textContent = `${Math.floor(chaosLevel)}% Chaos`;
}

function unlockAchievement(index) {
    const achievements = document.getElementById('achievements').children;
    if (achievements[index]) {
        achievements[index].textContent = achievements[index].textContent.replace('🔒', '✅');
    }
}

// Visual Effects
function createFloatingEmojis() {
    const container = document.getElementById('floating-emojis');
    const emojis = ['🎨', '🖼️', '✨', '🌈', '💫', '⭐', '🎭', '🖌️'];
    
    setInterval(() => {
        const emoji = document.createElement('div');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.position = 'fixed';
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.top = '100vh';
        emoji.style.fontSize = Math.random() * 20 + 20 + 'px';
        emoji.style.opacity = '0.6';
        emoji.style.pointerEvents = 'none';
        emoji.style.transition = 'all 5s linear';
        container.appendChild(emoji);
        
        setTimeout(() => {
            emoji.style.top = '-100px';
            emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 10);
        
        setTimeout(() => emoji.remove(), 5000);
    }, 2000);
}

function createCursorTrail() {
    const trail = document.getElementById('cursor-trail');
    
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.7) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.borderRadius = '50%';
            particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            particle.style.pointerEvents = 'none';
            particle.style.transition = 'all 1s';
            trail.appendChild(particle);
            
            setTimeout(() => {
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0)';
            }, 10);
            
            setTimeout(() => particle.remove(), 1000);
        }
    });
}

function updateTips() {
    const tips = [
        'Try stacking multiple filters!',
        'Hold shift while drawing for straight lines!',
        'The Ultra Glitch button is dangerous!',
        'Pixel art mode is perfect for sprites!',
        'Deep Fry everything!',
        'Rainbow brush is psychedelic!',
        'Try the datamosh glitch!',
        'Collages work best with 4-9 images!',
        'Click chaos meter to randomize!',
        'Save your work before experimenting!'
    ];
    
    const tip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip-text').textContent = tip;
}

function startClock() {
    // Just for fun - not actually needed but adds to the chaos
    setInterval(() => {
        const randomEmoji = ['🎨', '🖼️', '✨', '🌈', '💫'][Math.floor(Math.random() * 5)];
        const title = document.querySelector('.glitch-text .rainbow-text');
        if (title && Math.random() > 0.95) {
            title.textContent = 'IMAGE STUFF ' + randomEmoji;
            setTimeout(() => {
                title.textContent = 'IMAGE STUFF';
            }, 500);
        }
    }, 3000);
}

// Color utilities
function hslToRgb(h, s, l) {
    h /= 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h + 1/3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1/3);
    return [r, g, b];
}

function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}