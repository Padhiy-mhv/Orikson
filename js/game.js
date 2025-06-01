// Настройки Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Константы
const groundLevel = 320;
const MOVE_SPEED = 3;
const ANIMATION_SPEED = 0.15;
const LEVEL_WIDTH = 2000; // Ширина уровня

// Состояния персонажа
const STATES = {
    IDLE: 'idle',
    WALK: 'walk'
};

// Пути к анимациям (замените на свои)
const ANIMATIONS = {
    [STATES.IDLE]: './assets/images/player_idle.gif',
    [STATES.WALK]: './assets/images/player_walk.gif'
};

// Персонаж
const player = {
    x: 400, // Стартовая позиция по центру
    y: groundLevel - 70,
    width: 50,
    height: 70,
    facingRight: true
};

// Игровые переменные
let currentState = STATES.IDLE;
let animations = {};
let currentFrame = 0;
let lastTime = 0;
const keys = {};
let cameraOffset = 0; // Для движения камеры

// ===== ЗАГРУЗКА АНИМАЦИЙ ===== //

function loadAnimation(state, path) {
    return new Promise((resolve) => {
        animations[state] = [];
        
        const anim = gifler(path);
        
        anim.frames(canvas, (ctx, frame) => {
            const buffer = document.createElement('canvas');
            buffer.width = player.width;
            buffer.height = player.height;
            const bCtx = buffer.getContext('2d');
            bCtx.drawImage(frame.buffer, 0, 0, player.width, player.height);
            animations[state].push(buffer);
        });
        
        anim.onload = () => {
            console.log(`Анимация ${state} загружена (${animations[state].length} кадров)`);
            resolve();
        };
        
        anim.onerror = () => {
            console.error(`Ошибка загрузки: ${path}`);
            createFallbackAnimation(state);
            resolve();
        };
    });
}

function createFallbackAnimation(state) {
    const buffer = document.createElement('canvas');
    buffer.width = player.width;
    buffer.height = player.height;
    const bCtx = buffer.getContext('2d');
    
    bCtx.fillStyle = state === STATES.IDLE ? 'blue' : 'green';
    bCtx.fillRect(0, 0, buffer.width, buffer.height);
    
    animations[state] = [buffer];
}

async function loadAllAnimations() {
    await Promise.all([
        loadAnimation(STATES.IDLE, ANIMATIONS[STATES.IDLE]),
        loadAnimation(STATES.WALK, ANIMATIONS[STATES.WALK])
    ]);
    console.log("Все анимации загружены!");
}

// ===== УПРАВЛЕНИЕ ===== //

function setupControls() {
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        
        // Проверяем, остались ли нажатыми клавиши движения
        const anyMoveKeyPressed = ['a', 'd', 'arrowleft', 'arrowright'].some(k => keys[k]);
        if (!anyMoveKeyPressed) {
            setState(STATES.IDLE);
        }
    });
}

// ===== ИГРОВАЯ ЛОГИКА ===== //

function setState(newState) {
    if (currentState !== newState) {
        currentState = newState;
        currentFrame = 0;
    }
}

function update() {
    // Движение влево
    if (keys['a'] || keys['arrowleft']) {
        player.x -= MOVE_SPEED;
        player.facingRight = false;
        setState(STATES.WALK);
        
        // Движение камеры, если персонаж близко к краю
        if (player.x < 200 && cameraOffset > 0) {
            cameraOffset -= MOVE_SPEED;
        }
    }
    
    // Движение вправо
    if (keys['d'] || keys['arrowright']) {
        player.x += MOVE_SPEED;
        player.facingRight = true;
        setState(STATES.WALK);
        
        // Движение камеры
        if (player.x > 600 && cameraOffset < LEVEL_WIDTH - canvas.width) {
            cameraOffset += MOVE_SPEED;
        }
    }
    
    // Ограничение позиции персонажа
    player.x = Math.max(0, Math.min(LEVEL_WIDTH - player.width, player.x));
}

function draw(timestamp) {
    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Черный фон
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Земля (на всю ширину уровня)
    ctx.fillStyle = '#333333';
    ctx.fillRect(-cameraOffset, groundLevel, LEVEL_WIDTH, canvas.height - groundLevel);
    
    // Отрисовка персонажа (с учетом камеры)
    if (animations[currentState]?.length > 0) {
        const frames = animations[currentState];
        const frameIndex = Math.floor(currentFrame) % frames.length;
        const frame = frames[frameIndex];
        
        ctx.save();
        if (!player.facingRight) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                frame,
                -player.x + cameraOffset - player.width,
                player.y,
                player.width,
                player.height
            );
        } else {
            ctx.drawImage(
                frame,
                player.x - cameraOffset,
                player.y,
                player.width,
                player.height
            );
        }
        ctx.restore();
        
        // Плавное обновление анимации
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        currentFrame += ANIMATION_SPEED * (deltaTime / 16);
        
        // Цикличность анимации
        if (currentFrame >= frames.length) {
            currentFrame = 0;
        }
    }
    
    requestAnimationFrame(draw);
}

// ===== ЗАПУСК ИГРЫ ===== //

async function init() {
    setupControls();
    await loadAllAnimations();
    requestAnimationFrame(draw);
    
    // Первая отрисовка
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Игра загружена!', 10, 30);
}

init();