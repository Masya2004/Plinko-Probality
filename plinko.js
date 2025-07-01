// Увеличиваем размеры доски и элементов в 1.5 раза
const SCALE = 1.5;
let ROWS = 8;
let PEGS_PER_ROW = 9;
const BALL_RADIUS = Math.round(12 * SCALE * 2 / 1.5);
const PEG_RADIUS = Math.round(6 * SCALE * 1.5 * 1.5);
const BOARD_WIDTH = Math.round(600 * SCALE);
const BOARD_HEIGHT = Math.round(500 * SCALE);
let SLOTS = PEGS_PER_ROW - 1;

const boardDiv = document.getElementById('plinko-board');
const histogramDiv = document.getElementById('histogram');

// Создание SVG доски
const svgNS = 'http://www.w3.org/2000/svg';
let svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', BOARD_WIDTH);
svg.setAttribute('height', BOARD_HEIGHT);
svg.style.display = 'block';
svg.style.margin = '0 auto';
svg.style.background = 'none'; // убираем фон
svg.style.border = 'none'; // убираем рамку
svg.style.boxShadow = 'none'; // убираем тени
boardDiv.appendChild(svg);

// --- Палитра ярких цветов для шариков ---
const BALL_COLORS = [
  '#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f72585', '#3a86ff', '#ffbe0b', '#fb5607', '#8338ec'
];

// --- Получить случайный цвет ---
function getRandomBallColor() {
  return BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
}

let boardMode = 'square'; // 'square' или 'pyramid'
let slotCountsSquare = Array(SLOTS).fill(0);
let slotCountsPyramid = Array(SLOTS).fill(0);
let slotCounts = slotCountsSquare;

// --- Кнопка переключения режима ---
document.getElementById('toggle-board-mode-btn').onclick = () => {
  boardMode = (boardMode === 'square') ? 'pyramid' : 'square';
  document.getElementById('toggle-board-mode-btn').textContent =
    'Mode: ' + (boardMode === 'square' ? 'Square' : 'Pyramid');
  // Переключаем статистику на соответствующий режим
  slotCounts = (boardMode === 'square') ? slotCountsSquare : slotCountsPyramid;
  recreateBoard();
};

// --- Рисуем пеги: квадратная или пирамидальная сетка ---
function drawPegs() {
  if (boardMode === 'square') {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < PEGS_PER_ROW - (row % 2); col++) {
        const x = (BOARD_WIDTH / PEGS_PER_ROW) * (col + 0.5 + (row % 2) * 0.5);
        const y = (BOARD_HEIGHT / (ROWS + 2)) * (row + 1.7);
        const peg = document.createElementNS(svgNS, 'circle');
        peg.setAttribute('cx', x);
        peg.setAttribute('cy', y);
        peg.setAttribute('r', PEG_RADIUS);
        peg.setAttribute('fill', 'url(#peg-gradient)');
        peg.setAttribute('filter', 'drop-shadow(0 1px 2px #2224)');
        peg.classList.add('peg');
        svg.appendChild(peg);
      }
    }
  } else {
    drawPegsPyramid();
  }
}

function drawPegsPyramid() {
  // Пирамидальная сетка: в первом ряду 1 пег, во втором 2, ...
  for (let row = 0; row < ROWS; row++) {
    let pegsInRow = row + 1;
    for (let col = 0; col < pegsInRow; col++) {
      const x = BOARD_WIDTH/2 + (col - row/2) * (BOARD_WIDTH / PEGS_PER_ROW);
      const y = (BOARD_HEIGHT / (ROWS + 2)) * (row + 1.7);
      const peg = document.createElementNS(svgNS, 'circle');
      peg.setAttribute('cx', x);
      peg.setAttribute('cy', y);
      peg.setAttribute('r', PEG_RADIUS);
      peg.setAttribute('fill', 'url(#peg-gradient)');
      peg.setAttribute('filter', 'drop-shadow(0 1px 2px #2224)');
      peg.classList.add('peg');
      svg.appendChild(peg);
    }
  }
}

// Градиент для пегов и шарика
function addSVGDefs() {
  const defs = document.createElementNS(svgNS, 'defs');
  // Peg gradient
  const pegGrad = document.createElementNS(svgNS, 'radialGradient');
  pegGrad.id = 'peg-gradient';
  pegGrad.innerHTML = `
    <stop offset="0%" stop-color="#fff"/>
    <stop offset="60%" stop-color="#00fff7"/>
    <stop offset="100%" stop-color="#3a86ff"/>
  `;
  defs.appendChild(pegGrad);
  // Ball gradient
  const ballGrad = document.createElementNS(svgNS, 'radialGradient');
  ballGrad.id = 'ball-gradient';
  ballGrad.innerHTML = `
    <stop offset="0%" stop-color="#fff"/>
    <stop offset="80%" stop-color="#4e7ad2"/>
    <stop offset="100%" stop-color="#2a3a5e"/>
  `;
  ballGrad.appendChild(defs);
  svg.appendChild(defs);
}

// Пересоздание доски при изменении параметров
function recreateBoard() {
  // Удаляем старый SVG
  boardDiv.innerHTML = '';
  
  // Обновляем параметры
  ROWS = parseInt(document.getElementById('rows-input').value);
  PEGS_PER_ROW = ROWS + 1;
  SLOTS = PEGS_PER_ROW - 1;
  
  // Создаём новый SVG
  svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', BOARD_WIDTH);
  svg.setAttribute('height', BOARD_HEIGHT);
  svg.style.display = 'block';
  svg.style.margin = '0 auto';
  svg.style.background = 'none'; // убираем фон
  svg.style.border = 'none'; // убираем рамку
  svg.style.boxShadow = 'none'; // убираем тени
  boardDiv.appendChild(svg);
  
  // Добавляем градиенты и пеги
  addSVGDefs();
  drawPegs();
  
  // Маркеры спавна всегда после drawPegs, если квадрат
  if (boardMode === 'square') {
    createSpawnMarkers();
  }
  
  // Выбираем нужный slotCounts и обновляем статистику
  slotCounts = (boardMode === 'square') ? slotCountsSquare : slotCountsPyramid;
  updateHistogram();
}

// Получение количества шариков из интерфейса
function getBallsCount() {
  let val = parseInt(document.getElementById('balls-input').value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 1000) val = 1000;
  document.getElementById('balls-input').value = val;
  return val;
}

// Инициализация доски
addSVGDefs();
drawPegs();

// --- Кнопка показать/скрыть вероятности ---
const probDiv = document.getElementById('probabilities');
document.getElementById('toggle-prob-btn').onclick = () => {
  if (probDiv.style.display === 'none') {
    probDiv.style.display = '';
  } else {
    probDiv.style.display = 'none';
  }
};

// --- Кнопка случайная доска ---
document.getElementById('random-board-btn').onclick = () => {
  const rows = Math.floor(Math.random() * 6) + 5; // 5-10
  const balls = [1, 10, 100, 1000][Math.floor(Math.random()*4)];
  document.getElementById('rows-input').value = rows;
  document.getElementById('balls-input').value = balls;
  recreateBoard();
};

// --- Кнопка сохранить как PNG ---
document.getElementById('save-png-btn').onclick = () => {
  const svgElem = document.querySelector('#plinko-board svg');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElem);
  const canvas = document.createElement('canvas');
  canvas.width = svgElem.width.baseVal.value;
  canvas.height = svgElem.height.baseVal.value;
  const ctx = canvas.getContext('2d');
  const img = new window.Image();
  img.onload = function() {
    ctx.fillStyle = getComputedStyle(document.body).background;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = 'plinko.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
};

// Обработчики кнопок
function dropBall() {
  const count = getBallsCount();
  if (count === 1) {
    animateBall();
  } else {
    dropManyBalls(count);
  }
}

// --- Подсветка пегов ---
function highlightPeg(row, col, color) {
  // Подсветка отключена, только звук
  playPlink(color);
}

// --- Всплеск при падении ---
function splashAtSlot(slot, color) {
  const slotX = (BOARD_WIDTH / SLOTS) * (slot + 0.5);
  const slotY = BOARD_HEIGHT - 10;
  const splash = document.createElementNS(svgNS, 'ellipse');
  splash.setAttribute('cx', slotX);
  splash.setAttribute('cy', slotY);
  splash.setAttribute('rx', 2);
  splash.setAttribute('ry', 1);
  splash.setAttribute('fill', color || '#fff');
  splash.setAttribute('opacity', '0.8');
  svg.appendChild(splash);
  setTimeout(() => {
    splash.setAttribute('rx', 22);
    splash.setAttribute('ry', 8);
    splash.setAttribute('opacity', '0');
  }, 10);
  setTimeout(() => svg.removeChild(splash), 420);
  playSplash(color);
}

// --- Plinko spawn markers and true peg collision physics ---
let spawnGap = Math.floor((PEGS_PER_ROW - 1) / 2); // индекс промежутка (от 0 до PEGS_PER_ROW-2)

function getTopPegCenters() {
  let arr = [];
  for (let col = 0; col < PEGS_PER_ROW; col++) {
    arr.push((BOARD_WIDTH / PEGS_PER_ROW) * (col + 0.5));
  }
  return arr;
}
function getGapCenters(row) {
  // Возвращает массив X-координат промежутков между пегами для заданного ряда
  let pegCount = PEGS_PER_ROW - (row % 2);
  let arr = [];
  for (let i = 0; i < pegCount - 1; i++) {
    let x1 = (BOARD_WIDTH / PEGS_PER_ROW) * (i + 0.5 + (row % 2) * 0.5);
    let x2 = (BOARD_WIDTH / PEGS_PER_ROW) * (i + 1.5 + (row % 2) * 0.5);
    arr.push((x1 + x2) / 2);
  }
  return arr;
}
function createSpawnMarkers() {
  if (boardMode !== 'square') return;
  svg.querySelectorAll('circle.spawn-marker').forEach(m => svg.removeChild(m));
  const gaps = getGapCenters(0);
  for (let gap = 0; gap < gaps.length; gap++) {
    const x = gaps[gap];
    const marker = document.createElementNS(svgNS, 'circle');
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', (BOARD_HEIGHT / (ROWS + 2)) * 0.45);
    marker.setAttribute('r', BALL_RADIUS + 3);
    marker.setAttribute('fill', gap === spawnGap ? '#3a86ff' : '#fff');
    marker.setAttribute('opacity', gap === spawnGap ? '0.7' : '0.35');
    marker.setAttribute('stroke', '#3a86ff');
    marker.setAttribute('stroke-width', gap === spawnGap ? '2.5' : '1.2');
    marker.classList.add('spawn-marker');
    marker.style.cursor = 'pointer';
    marker.addEventListener('click', () => {
      spawnGap = gap;
      createSpawnMarkers();
    });
    svg.appendChild(marker);
  }
}

createSpawnMarkers();

// === Управление скоростью падения ===
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
let plinkoSpeed = parseInt(speedRange.value, 10); // 1 (медленно) ... 100 (быстро)

speedRange.addEventListener('input', () => {
  plinkoSpeed = parseInt(speedRange.value, 10);
  speedValue.textContent = plinkoSpeed;
});

function animateBall(color, delay = 0) {
  // --- Настоящая физика столкновений ---
  let x, y;
  if (boardMode === 'pyramid') {
    // Спавн по центру над верхним пегом
    x = BOARD_WIDTH / 2;
    y = (BOARD_HEIGHT / (ROWS + 2)) * 0.45;
  } else {
    let gap = spawnGap;
    let gaps = getGapCenters(0);
    x = gaps[gap];
    y = (BOARD_HEIGHT / (ROWS + 2)) * 0.45;
  }
  let vx = 0;
  let vy = 3.2; // скорость падения
  const gravity = 0.18; // ускорение свободного падения
  const vxMax = 4.0; // увеличенный диапазон горизонтальной скорости
  const damping = 0.99; // меньшее затухание горизонтальной скорости
  const leftBoundary = BALL_RADIUS;
  const rightBoundary = BOARD_WIDTH - BALL_RADIUS;
  let state = 'fall';
  const ball = document.createElementNS(svgNS, 'circle');
  ball.setAttribute('cx', x);
  ball.setAttribute('cy', y);
  ball.setAttribute('r', BALL_RADIUS);
  ball.setAttribute('fill', color || getRandomBallColor());
  ball.setAttribute('filter', 'drop-shadow(0 0 16px #fff8), drop-shadow(0 2px 8px #0002)');
  ball.style.opacity = 0;
  svg.appendChild(ball);
  setTimeout(() => { ball.style.transition = 'opacity 0.3s'; ball.style.opacity = 1; }, 10);

  // Собираем все пеги (массив объектов {x, y})
  const allPegs = [];
  for (let r = 0; r < ROWS; r++) {
    let pegCount = PEGS_PER_ROW - (r % 2);
    for (let c = 0; c < pegCount; c++) {
      let px = (BOARD_WIDTH / PEGS_PER_ROW) * (c + 0.5 + (r % 2) * 0.5);
      let py = (BOARD_HEIGHT / (ROWS + 2)) * (r + 1.7);
      allPegs.push({x: px, y: py, row: r, col: c});
    }
  }

  function step() {
    let cx = parseFloat(ball.getAttribute('cx'));
    let cy = parseFloat(ball.getAttribute('cy'));
    // 1. Двигаем шарик вниз
    vx *= damping; // затухание горизонтальной скорости
    vy += gravity; // гравитация
    let nextX = cx + vx;
    let nextY = cy + vy;

    // --- Боковые границы ---
    if (nextX < leftBoundary) {
      nextX = leftBoundary;
      vx = -vx * 1.05; // Было 0.7, теперь 1.05 (сила отскока x1.5)
    }
    if (nextX > rightBoundary) {
      nextX = rightBoundary;
      vx = -vx * 1.05;
    }

    // 2. Проверяем столкновение с ближайшим пегом
    let collision = null;
    let minDist = Infinity;
    for (const peg of allPegs) {
      if (peg.y <= cy) continue; // только пеги ниже текущей позиции
      let dx = peg.x - cx;
      let dy = peg.y - cy;
      if (Math.abs(dx) < 2*BALL_RADIUS && dy > 0 && dy < minDist) {
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= BALL_RADIUS + PEG_RADIUS + 1) {
          collision = peg;
          minDist = dy;
        }
      }
    }
    if (collision) {
      // Двигаем шарик до точки столкновения
      let peg = collision;
      let dx = peg.x - cx;
      let dy = peg.y - cy;
      let dist = Math.sqrt(dx*dx + dy*dy);
      let t = (dist - BALL_RADIUS - PEG_RADIUS) / Math.sqrt(vx*vx + vy*vy);
      if (t < 0) t = 0;
      let hitX = cx + vx * t;
      let hitY = cy + vy * t;
      ball.setAttribute('cx', hitX);
      ball.setAttribute('cy', hitY);
      highlightPeg(peg.row, peg.col, color);
      // --- Отскок ---
      // После столкновения: вертикальная скорость всегда вниз, горизонтальная — случайная
      vy = Math.abs((3.2 + Math.random() * 0.8) * 1.5); // x1.5
      vx = ((Math.random() * 2 - 1) * vxMax) * 2.5; // x2.5 — оптимальная сила отскока
      // Делаем небольшой сдвиг, чтобы не застрять в пеге
      ball.setAttribute('cx', hitX + vx * 2);
      ball.setAttribute('cy', hitY + vy * 2);
      // --- Управляем задержкой через ползунок ---
      setTimeout(() => requestAnimationFrame(step), getPlinkoDelay());
      return;
    }
    // Нет столкновений — двигаем вниз
    ball.setAttribute('cx', nextX);
    ball.setAttribute('cy', nextY);
    // Шлейф
    const tail = document.createElementNS(svgNS, 'circle');
    tail.setAttribute('cx', nextX);
    tail.setAttribute('cy', nextY);
    tail.setAttribute('r', BALL_RADIUS * 0.7);
    tail.setAttribute('fill', color || getRandomBallColor());
    tail.style.opacity = 0.18 + 0.12 * Math.random();
    svg.appendChild(tail);
    setTimeout(() => { if (tail.parentNode) svg.removeChild(tail); }, 180);
    // Проверяем выход за низ
    if (nextY > BOARD_HEIGHT - BALL_RADIUS) {
      let slot = Math.floor(nextX / (BOARD_WIDTH / SLOTS));
      if (slot < 0) slot = 0;
      if (slot >= slotCounts.length) slot = slotCounts.length - 1;
      splashAtSlot(slot, color);
      setTimeout(() => { svg.removeChild(ball); }, 400);
      slotCounts[slot]++;
      updateHistogram();
      return;
    }
    // --- Управляем задержкой через ползунок ---
    setTimeout(() => requestAnimationFrame(step), getPlinkoDelay());
  }
  if (delay > 0) {
    setTimeout(step, delay);
  } else {
    step();
  }
}

// Функция для вычисления задержки (мс) на основе значения ползунка
function getPlinkoDelay() {
  // 1 (медленно) -> 40мс, 100 (быстро) -> 0мс
  // Можно скорректировать диапазон по ощущениям
  return Math.round(40 - (plinkoSpeed / 100) * 40);
}

function dropManyBalls(n, delay = 100) {
  let i = 0;
  function dropBatch() {
    if (i < n) {
      const color = getRandomBallColor();
      animateBall(color, i * delay);
      i++;
      setTimeout(dropBatch, delay);
    } else {
      setTimeout(updateHistogram, 400);
    }
  }
  dropBatch();
}

function simulateBall() {
  // Симуляция движения шарика: на каждом ряду случайно влево/вправо
  let pos = 0;
  for (let row = 0; row < ROWS; row++) {
    if (Math.random() < 0.5) pos++;
  }
  // pos = количество шагов вправо, это и есть номер слота
  return pos;
}

// --- Звуки ---
const soundEnabled = () => document.getElementById('sound-toggle')?.checked;
const audioCtx = window.AudioContext ? new window.AudioContext() : null;
function playPlink(color) {
  if (!soundEnabled() || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine'; // был 'triangle', теперь мягче
  // Цвет влияет на частоту, но диапазон ниже
  const idx = BALL_COLORS.indexOf(color);
  o.frequency.value = 320 + (idx >= 0 ? idx*18 : Math.random()*40); // ниже и мягче
  g.gain.value = 0.045 + Math.random() * 0.02; // тише
  g.gain.setValueAtTime(g.gain.value, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.09); // плавное затухание
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.09); // короче
}
function playSplash(color) {
  if (!soundEnabled() || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  const idx = BALL_COLORS.indexOf(color);
  o.frequency.value = 220 + (idx >= 0 ? idx*20 : Math.random()*40);
  g.gain.value = 0.12;
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.12);
}

// Обработчики событий
document.getElementById('drop-one').onclick = () => animateBall();
document.getElementById('drop-many').onclick = () => dropManyBalls(getBallsCount(), 100);
document.getElementById('reset').onclick = () => {
  if (boardMode === 'square') {
    slotCountsSquare = Array(SLOTS).fill(0);
    slotCounts = slotCountsSquare;
  } else {
    slotCountsPyramid = Array(SLOTS).fill(0);
    slotCounts = slotCountsPyramid;
  }
  updateHistogram();
};

// Обработчик изменения количества рядов
document.getElementById('rows-input').addEventListener('change', () => {
  // Обновляем размеры массивов статистики при изменении количества рядов
  const newSlots = parseInt(document.getElementById('rows-input').value);
  slotCountsSquare = Array(newSlots).fill(0);
  slotCountsPyramid = Array(newSlots).fill(0);
  slotCounts = (boardMode === 'square') ? slotCountsSquare : slotCountsPyramid;
  recreateBoard();
});

// Инициализация отображения
updateHistogram();

// Инициализация статистики для обоих режимов
slotCountsSquare = Array(SLOTS).fill(0);
slotCountsPyramid = Array(SLOTS).fill(0);
slotCounts = slotCountsSquare; // По умолчанию квадратный режим

// === Animated Particles Background ===
(function particleBackground() {
  const canvas = document.getElementById('matrix-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  // Частицы
  const particles = [];
  const particleCount = Math.min(100, Math.floor(width * height / 10000));
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = `hsl(${200 + Math.random() * 60}, 70%, 60%)`;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Отражение от краев
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      
      // Ограничение в пределах экрана
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Создаем частицы
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function draw() {
    // Очищаем с полупрозрачным фоном для эффекта следа
    ctx.fillStyle = 'rgba(15, 15, 35, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    // Обновляем и рисуем частицы
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    // Рисуем соединения между близкими частицами
    ctx.strokeStyle = 'rgba(58, 134, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          ctx.globalAlpha = (100 - distance) / 100 * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
  
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
})();

// --- Обновление гистограммы ---
function updateHistogram() {
  histogramDiv.innerHTML = '';
  const max = Math.max(...slotCounts, 1);
  const probs = getProbabilities();
  const total = slotCounts.reduce((a, b) => a + b, 0);
  slotCounts.forEach((count, i) => {
    const bar = document.createElement('div');
    bar.className = 'hist-bar';
    bar.style.height = '0px';
    bar.style.width = '24px';
    bar.style.position = 'relative';
    // Value (percent)
    const value = document.createElement('span');
    value.className = 'bar-value';
    value.textContent = total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '';
    bar.appendChild(value);
    // Tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = `Probability: ${(probs[i]*100).toFixed(2)}%`;
    bar.appendChild(tooltip);
    // Slot label (vertical)
    const slotLabel = document.createElement('span');
    slotLabel.className = 'slot-label';
    slotLabel.textContent = i+1;
    bar.appendChild(slotLabel);
    histogramDiv.appendChild(bar);
    setTimeout(() => {
      bar.style.transition = 'height 0.7s cubic-bezier(.4,2,.6,1)';
      bar.style.height = (100 * count / max) + 'px';
    }, 10);
  });
  updateProbabilities();
  updateStats();
}

function getProbabilities() {
  // Биномиальное распределение для Plinko
  const n = ROWS;
  const probs = [];
  for (let k = 0; k < SLOTS; k++) {
    probs.push(binomial(n, k) / Math.pow(2, n));
  }
  return probs;
}

function binomial(n, k) {
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res *= (n - i + 1) / i;
  }
  return res;
}

function updateProbabilities() {
  const probs = getProbabilities();
  const mean = ROWS / 2;
  const variance = ROWS / 4;
  const stddev = Math.sqrt(variance);
  const modeName = boardMode === 'square' ? 'Square' : 'Pyramid';
  const probDiv = document.getElementById('probabilities');
  probDiv.innerHTML = `<b>Theoretical probabilities (mode "${modeName}"):</b><br>` +
    probs.map((p, i) => `Slot ${i+1}: ${(p*100).toFixed(2)}%`).join(' | ') +
    `<br><b>Mean:</b> ${(mean+1).toFixed(2)}<br><b>Standard deviation:</b> ${stddev.toFixed(2)}`;
}

function updateStats() {
  const total = slotCounts.reduce((a, b) => a + b, 0);
  const modeName = boardMode === 'square' ? 'Square' : 'Pyramid';
  if (total === 0) {
    document.getElementById('stats').innerHTML = `<b>Statistics for mode "${modeName}":</b> No data`;
    return;
  }
  // Mean
  let mean = 0;
  slotCounts.forEach((count, i) => { mean += (i+1) * count; });
  mean /= total;
  // Median
  let acc = 0, median = 0;
  for (let i = 0; i < slotCounts.length; i++) {
    acc += slotCounts[i];
    if (acc >= total/2) { median = i+1; break; }
  }
  // Mode
  let mode = 1, maxCount = slotCounts[0];
  for (let i = 1; i < slotCounts.length; i++) {
    if (slotCounts[i] > maxCount) { maxCount = slotCounts[i]; mode = i+1; }
  }
  document.getElementById('stats').innerHTML =
    `<b>Statistics for mode "${modeName}":</b> <b>Mean:</b> ${mean.toFixed(2)} | <b>Median:</b> ${median} | <b>Mode:</b> ${mode} | <b>Total balls:</b> ${total}`;
}

 