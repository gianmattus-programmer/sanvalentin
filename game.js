const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Sistema de carga de imágenes mejorado
const images = {
    player: { src: 'imgs/gian.png', loaded: false },
    bullet: { src: 'imgs/corazón.png', loaded: false },
    background: { src: 'imgs/fondo_amor.jpg', loaded: false },
    enemies: [
        { src: 'imgs/yadira1.png', loaded: false },
        { src: 'imgs/yadira2.png', loaded: false },
        { src: 'imgs/yadira3.png', loaded: false },
        { src: 'imgs/yadira4.png', loaded: false },
        { src: 'imgs/yadira5.png', loaded: false },
        { src: 'imgs/yadira6.png', loaded: false },
        { src: 'imgs/yadira7.png', loaded: false },
        { src: 'imgs/yadira8.png', loaded: false }
    ],
    heart: { src: 'imgs/corazón1.png', loaded: false }
};

// Ajustar las dimensiones base para todas las imágenes
const SPRITE_SIZE = {
    width: 60,  // Aumentado de 40 a 60
    height: 60
};

// Modificar el sistema de puntuación y niveles
const gameState = {
    score: 0,
    level: 1,
    lives: 5,
    baseEnemySpeed: 1.5,
    nextLevelScore: 100, // Cambiado a 100 puntos
    maxLevel: 14,
    enemySpawnRate: 0.005,
    maxEnemySpawnRate: 0.02,
    pointsPerHit: 20 // Puntos por cada golpe
};

// Función mejorada para calcular la velocidad según el nivel
function getEnemySpeed() {
    // Incremento más pronunciado cada 100 puntos
    const speedIncrease = Math.floor(gameState.score / 100) * 0.5;
    return gameState.baseEnemySpeed + speedIncrease;
}

// Función para calcular tasa de aparición de enemigos según nivel
function getEnemySpawnRate() {
    const spawnIncrease = (gameState.level - 1) * 0.001;
    return Math.min(gameState.enemySpawnRate + spawnIncrease, gameState.maxEnemySpawnRate);
}

// Modificar la función drawScoreboard para quitar el texto del canvas
function drawScoreboard() {
    // Solo dibujar los corazones de vida
    for (let i = 0; i < gameState.lives; i++) {
        ctx.drawImage(images.heart.img, 10 + i * 30, 10, 25, 25);
    }
}

// Función modificada para cargar imágenes
function loadGameImages() {
    // Cargar imágenes principales
    ['player', 'bullet', 'background', 'heart'].forEach(key => {
        const img = new Image();
        img.onload = () => {
            console.log(`✓ Imagen cargada: ${key}`);
            images[key].loaded = true;
            images[key].img = img;
            checkAllImagesLoaded();
        };
        img.onerror = () => {
            console.error(`✗ Error cargando: ${images[key].src}`);
            createBackupImage(key);
        };
        img.src = images[key].src;
    });

    // Cargar imágenes de enemigos
    images.enemies.forEach((enemy, index) => {
        const img = new Image();
        img.onload = () => {
            console.log(`✓ Imagen de enemigo ${index + 1} cargada`);
            enemy.loaded = true;
            enemy.img = img;
            checkAllImagesLoaded();
        };
        img.onerror = () => {
            console.error(`✗ Error cargando enemigo ${index + 1}`);
            createBackupImage('enemy', enemy);
        };
        img.src = enemy.src;
    });
}

// Función modificada para crear imágenes de respaldo
function createBackupImage(key, imageObj = null) {
    const backupCanvas = document.createElement('canvas');
    backupCanvas.width = 60;
    backupCanvas.height = 60;
    const bCtx = backupCanvas.getContext('2d');
    
    if (key === 'background') {
        bCtx.fillStyle = '#333';
        bCtx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        bCtx.fillStyle = key === 'enemy' ? '#f00' : '#0f0';
        bCtx.fillRect(0, 0, 60, 60);
    }

    if (imageObj) {
        imageObj.img = backupCanvas;
        imageObj.loaded = true;
    } else {
        images[key].img = backupCanvas;
        images[key].loaded = true;
    }
    checkAllImagesLoaded();
}

// Función modificada para verificar la carga
function checkAllImagesLoaded() {
    const mainImagesLoaded = ['player', 'bullet', 'background', 'heart']
        .every(key => images[key].loaded);
    const enemiesLoaded = images.enemies
        .every(enemy => enemy.loaded);

    if (mainImagesLoaded && enemiesLoaded) {
        console.log('Todas las imágenes están listas');
        document.getElementById('loading').style.display = 'none';
        gameLoop();
    }
}

// Modificar las funciones de dibujo para usar las nuevas referencias
function drawGame() {
    ctx.drawImage(images.background.img, 0, 0, canvas.width, canvas.height);
    
    // Dibujar jugador
    ctx.drawImage(images.player.img, 
        game.player.x, 
        game.player.y, 
        SPRITE_SIZE.width, 
        SPRITE_SIZE.height
    );
    
    // Dibujar balas
    game.bullets.forEach(bullet => {
        ctx.drawImage(images.bullet.img, 
            bullet.x, 
            bullet.y, 
            SPRITE_SIZE.width, 
            SPRITE_SIZE.height
        );
    });

    // Dibujar enemigos
    game.enemies.forEach(enemy => {
        ctx.drawImage(enemy.img, 
            enemy.x, 
            enemy.y, 
            SPRITE_SIZE.width, 
            SPRITE_SIZE.height
        );
    });

    updateScoreboard();
}

// Modificar la función updateScoreboard
function updateScoreboard() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    
    const heartsContainer = document.getElementById('hearts');
    heartsContainer.innerHTML = '';
    
    for (let i = 0; i < gameState.lives; i++) {
        const heartImg = document.createElement('img');
        heartImg.src = images.heart.src;
        heartImg.style.cssText = 'width: 25px; height: 25px; margin: 0 5px; vertical-align: middle;';
        heartsContainer.appendChild(heartImg);
    }
}

// Modificar la función de generar enemigos para usar imágenes aleatorias
function generateEnemy() {
    const randomEnemyImg = images.enemies[
        Math.floor(Math.random() * images.enemies.length)
    ].img;
    
    return {
        x: Math.random() * (canvas.width - SPRITE_SIZE.width),
        y: -SPRITE_SIZE.height,
        width: SPRITE_SIZE.width,
        height: SPRITE_SIZE.height,
        img: randomEnemyImg
    };
}

// Agregar función para mostrar mensaje de nivel
function showLevelMessage(level) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 20px;
        border-radius: 10px;
        font-size: 24px;
        animation: fadeInOut 2s forwards;
        pointer-events: none;
        z-index: 1000;
    `;
    message.innerHTML = `¡Nivel ${level} alcanzado! 🎉`;
    document.body.appendChild(message);

    // Remover el mensaje después de la animación
    setTimeout(() => document.body.removeChild(message), 2000);
}

// Agregar estilos de animación al head
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// Agregar mensajes románticos especiales
const loveMessages = [
    { score: 100, message: "TRANQUILA, ÉSTO RECIÉN EMPIEZA 💖" },
    { score: 200, message: "CADA PUNTO ES UN LATIDO POR TI 💗" },
    { score: 300, message: "ERES MI JUGADORA FAVORITA 💝" },
    { score: 400, message: "NIVEL TRAS NIVEL, MI AMOR CRECE 💘" },
    { score: 500, message: "ME ENCANTAS CADA DÍA MÁS 💖" },
    { score: 600, message: "SIGAMOS JUNTOS EN ESTA AVENTURA 💕" },
    { score: 700, message: "ERES MI MEJOR REGALO 🎁" },
    { score: 800, message: "CONTIGO TODO ES MEJOR 💑" },
    { score: 900, message: "NUNCA ME CANSARÉ DE TI 💫" },
    { score: 1000, message: "MIL RAZONES PARA AMARTE 🌹" },
    { score: 1100, message: "ERES MI MAYOR BENDICIÓN ✨" },
    { score: 1200, message: "JUNTOS HASTA EL INFINITO 💞" },
    { score: 1300, message: "MI CORAZÓN ES TUYO 💝" },
    { score: 1400, message: "FELIZ DÍA DE SAN VALENTÍN MI AMOR 💘" }
];

// Función para mostrar mensajes románticos
function showLoveMessage(message, special = false) {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${special ? 'linear-gradient(45deg, #ff4081, #f50057)' : 'rgba(0, 0, 0, 0.8)'};
        color: #fff;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 24px;
        animation: loveMessage 3s forwards;
        pointer-events: none;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.3);
    `;
    messageElement.innerHTML = message;
    document.body.appendChild(messageElement);
    setTimeout(() => document.body.removeChild(messageElement), 3000);
}

// Agregar animación para mensajes románticos
const loveStyle = document.createElement('style');
loveStyle.textContent = `
    @keyframes loveMessage {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        20% { transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }

    @keyframes heartbeat {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(loveStyle);

// Modificar el sistema de mensajes
const messageQueue = {
    messages: [],
    showing: false,
    addMessage: function(message, type = 'normal') {
        this.messages.push({ text: message, type });
        if (!this.showing) {
            this.showNext();
        }
    },
    showNext: function() {
        if (this.messages.length === 0) {
            this.showing = false;
            return;
        }
        
        this.showing = true;
        const msg = this.messages.shift();
        showMessage(msg.text, msg.type);
    }
};

// Función unificada para mostrar mensajes
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    const isLoveMessage = type === 'love';
    
    messageElement.style.cssText = `
        position: fixed;
        top: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isLoveMessage ? 'linear-gradient(45deg, #ff4081, #f50057)' : 'rgba(0, 0, 0, 0.8)'};
        color: #fff;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 24px;
        animation: message 3s forwards;
        pointer-events: none;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.3);
        white-space: nowrap;
    `;
    messageElement.innerHTML = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
        document.body.removeChild(messageElement);
        messageQueue.showNext();
    }, 3000);
}

// Modificar la función que maneja el puntaje
function updateScore(points) {
    const previousLevel = Math.floor(gameState.score / 100);
    gameState.score += points;
    const newLevel = Math.floor(gameState.score / 100);
    
    // Verificar si cambió de nivel
    if (newLevel > previousLevel && newLevel < gameState.maxLevel) {
        gameState.level = newLevel + 1;
        showLevelEffect();
        messageQueue.addMessage(loveMessages[newLevel].message, 'love');
    }
    
    // Activar efectos especiales a los 1000 puntos
    if (gameState.score >= 1000 && !gameState.specialEffectsShown) {
        gameState.specialEffectsShown = true;
        createFloatingHearts();
    }
    
    updateScoreboard();
}

// Efectos especiales cuando alcanza 1000 puntos
function checkSpecialEffects() {
    if (gameState.score >= 1000 && !gameState.specialEffectsShown) {
        gameState.specialEffectsShown = true;
        // Añadir corazones flotantes en el fondo
        createFloatingHearts();
    }
}

// Crear corazones flotantes
function createFloatingHearts() {
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}vw;
            bottom: -20px;
            font-size: 20px;
            animation: float ${5 + Math.random() * 10}s linear infinite;
            opacity: 0.5;
            z-index: 0;
        `;
        document.body.appendChild(heart);
    }
}

// Agregar animación para corazones flotantes
const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes float {
        0% { transform: translateY(0); opacity: 0.5; }
        100% { transform: translateY(-100vh); opacity: 0; }
    }
`;
document.head.appendChild(floatStyle);

// Modificar el gameLoop
function gameLoop() {
    // Actualizar posición del jugador
    if (game.keys.left && game.player.x > 0) game.player.x -= game.player.speed;
    if (game.keys.right && game.player.x < canvas.width - game.player.width) {
        game.player.x += game.player.speed;
    }

    // Generar enemigos con nueva tasa
    if (Math.random() < getEnemySpawnRate()) {
        game.enemies.push(generateEnemy());
    }

    // Actualizar enemigos con nueva velocidad
    game.enemies.forEach(enemy => enemy.y += getEnemySpeed());

    // Actualizar balas
    game.bullets.forEach(bullet => bullet.y -= 10);

    // Colisiones entre balas y enemigos
    game.bullets = game.bullets.filter(bullet => {
        let bulletHit = false;
        game.enemies = game.enemies.filter(enemy => {
            const hit = collision(bullet, enemy);
            if (hit) {
                bulletHit = true;
                updateScore(gameState.pointsPerHit); // Usar nueva puntuación
            }
            return !hit;
        });
        return !bulletHit && bullet.y > 0;
    });

    // Colisiones entre jugador y enemigos
    for (const enemy of game.enemies) {
        if (collision(game.player, enemy)) {
            handlePlayerCollision();
            game.enemies = game.enemies.filter(e => e !== enemy);
            break;
        }
    }

    drawGame();
    checkFallenEnemies();
    checkSpecialEffects();
    addVisualEffects();
    requestAnimationFrame(gameLoop);
}

// Modificar la parte del código que maneja el cambio de nivel
function checkLevelUp(newScore) {
    if (newScore >= gameState.nextLevelScore && gameState.level < gameState.maxLevel) {
        gameState.level++;
        showLevelMessage(gameState.level);
        gameState.nextLevelScore += 200; // Incrementar cada 200 puntos
    }
}

// Modificar la función de colisiones jugador-enemigo
function handlePlayerCollision() {
    gameState.lives--;
    if (gameState.lives === 1) {
        giveBonusLives();
    } else if (gameState.lives <= 0) {
        const gameOver = document.getElementById('gameOver');
        document.getElementById('finalLevel').textContent = gameState.level;
        document.getElementById('finalScore').textContent = gameState.score;
        gameOver.style.display = 'block';
        cancelAnimationFrame(gameLoop);
    }
}

// Función para dar vidas extra
function giveBonusLives() {
    gameState.lives += 2;
    const bonusMessage = document.createElement('div');
    bonusMessage.className = 'bonus-lives';
    bonusMessage.innerHTML = '¡TOMA 2 VIDAS MÁS MI AMOR! 💖💖';
    document.body.appendChild(bonusMessage);
    
    setTimeout(() => {
        document.body.removeChild(bonusMessage);
    }, 2000);
}

// Verificar enemigos que caen
function checkFallenEnemies() {
    game.enemies = game.enemies.filter(enemy => {
        if (enemy.y > canvas.height) {
            gameState.lives--;
            updateScoreboard();
            if (gameState.lives <= 0) {
                handlePlayerCollision();
            }
            return false;
        }
        return true;
    });
}

// Agregar eventos para los botones
document.getElementById('retryButton').addEventListener('click', () => {
    resetGame();
    document.getElementById('gameOver').style.display = 'none';
});

// Corregir el evento del botón salir (eliminar el anterior y reemplazar con este)
document.getElementById('exitButton').addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto
    document.getElementById('exitConfirm').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
});

// Corregir los eventos de los botones del modal
document.getElementById('stayButton').addEventListener('click', () => {
    document.getElementById('exitConfirm').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
});

document.getElementById('confirmExit').addEventListener('click', () => {
    if (confirm('¿Realmente quieres salir? 💔')) {
        window.close();
        window.location.href = 'about:blank';
    }
});

// Mejorar la función de descarga del PDF
document.getElementById('downloadLetter').addEventListener('click', () => {
    try {
        const link = document.createElement('a');
        link.href = 'docs/carta_amor.pdf';
        link.download = 'carta_amor.pdf';
        
        // Verificar si el archivo existe
        fetch(link.href)
            .then(response => {
                if (response.ok) {
                    link.click();
                } else {
                    alert('¡Ups! Parece que la carta de amor se perdió en el camino 💌');
                }
            })
            .catch(error => {
                console.error('Error al descargar:', error);
                alert('No pude entregarte la carta 😢');
            });
    } catch (error) {
        console.error('Error:', error);
        alert('Algo salió mal al intentar darte mi carta 💔');
    }
});

// Función para reiniciar el juego
function resetGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 5;
    gameState.nextLevelScore = 300;
    game.enemies = [];
    game.bullets = [];
    game.player.x = canvas.width / 2 - 25;
    updateScoreboard();
    startAutoShoot(); // Reiniciar disparo automático
    requestAnimationFrame(gameLoop);
}

// Estado del juego
const game = {
    player: {
        x: canvas.width / 2 - SPRITE_SIZE.width / 2,
        y: canvas.height - SPRITE_SIZE.height - 10,
        width: SPRITE_SIZE.width,
        height: SPRITE_SIZE.height,
        speed: 8 // Velocidad del jugador más equilibrada
    },
    bullets: [],
    enemies: [],
    keys: {
        left: false,
        right: false
    }
};

// Controladores de eventos
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') game.keys.left = true;
    if (e.key === 'ArrowRight') game.keys.right = true;
    // Eliminamos el disparo con espacio
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') game.keys.left = false;
    if (e.key === 'ArrowRight') game.keys.right = false;
});

// Función auxiliar para colisiones
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Función para disparo automático (para todas las plataformas)
function startAutoShoot() {
    return setInterval(() => {
        if (gameState.lives > 0) {
            game.bullets.push({
                x: game.player.x + SPRITE_SIZE.width/2 - (SPRITE_SIZE.width * 0.8)/2,
                y: game.player.y,
                width: SPRITE_SIZE.width * 0.8,
                height: SPRITE_SIZE.height * 0.8
            });
        }
    }, 300); // Reducido de 500ms a 300ms para más frecuencia
}

// Modificar la inicialización del juego
function initGame() {
    loadGameImages();
    startAutoShoot(); // Iniciar disparo automático para todos
}

// Reemplazar la llamada inicial
initGame();

// Agregar soporte táctil
let touchStartX = null;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    // Removemos el disparo manual en móviles ya que ahora es automático
});

canvas.addEventListener('touchmove', (e) => {
    if (touchStartX === null) return;
    
    const touchX = e.touches[0].clientX;
    const diffX = touchX - touchStartX;
    
    if (diffX > 5 && game.player.x < canvas.width - game.player.width) {
        game.player.x += game.player.speed;
    } else if (diffX < -5 && game.player.x > 0) {
        game.player.x -= game.player.speed;
    }
    
    touchStartX = touchX;
});

canvas.addEventListener('touchend', () => {
    touchStartX = null;
});

// Prevenir scroll en móviles
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Función para detectar dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Actualizar los estilos de animación
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes message {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        20% { transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(animationStyles);

// Agregar efectos visuales adicionales
function addVisualEffects() {
    // Efecto de brillos
    if (Math.random() < 0.1) {
        createSparkle();
    }
    
    // Efecto de corazones flotantes periódicos
    if (Math.random() < 0.05) {
        createFloatingHeart();
    }
}

// Crear efecto de brillo
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        pointer-events: none;
        animation: sparkle 1s linear forwards;
        z-index: 2;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => document.body.removeChild(sparkle), 1000);
}

// Crear corazón flotante individual
function createFloatingHeart() {
    const heart = document.createElement('div');
    const size = 10 + Math.random() * 20;
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        bottom: -20px;
        font-size: ${size}px;
        animation: floatHeart ${3 + Math.random() * 4}s linear forwards;
        opacity: 0.7;
        z-index: 1;
        transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(heart);
    setTimeout(() => document.body.removeChild(heart), 4000);
}

// Agregar nuevos estilos de animación
const newAnimations = document.createElement('style');
newAnimations.textContent = `
    @keyframes sparkle {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0); opacity: 0; }
    }

    @keyframes floatHeart {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
        50% { transform: translateY(-50vh) rotate(180deg); opacity: 0.5; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }

    @keyframes levelComplete {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(newAnimations);

// Modificar la función showLevelEffect para no animar el tablero
function showLevelEffect() {
    // Crear un elemento temporal para el efecto de nivel
    const levelEffect = document.createElement('div');
    levelEffect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff4081, #f50057);
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 24px;
        animation: levelComplete 1s ease;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 0 20px rgba(255, 64, 129, 0.3);
    `;
    levelEffect.innerHTML = `¡NIVEL ${gameState.level}! 💖`;
    document.body.appendChild(levelEffect);
    
    // Remover el efecto después de la animación
    setTimeout(() => document.body.removeChild(levelEffect), 1000);
    
    // Crear efecto de explosión de corazones sin mover el tablero
    for (let i = 0; i < 10; i++) {
        setTimeout(createFloatingHeart, i * 100);
    }
}

// Actualizar la animación de nivel
const levelAnimations = document.createElement('style');
levelAnimations.textContent = `
    @keyframes levelComplete {
        0% { transform: translate(-50%, -50%) scale(0); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
        100% { transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(levelAnimations);

// Agregar mensaje especial a las 11:11
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 11 && now.getMinutes() === 11) {
        messageQueue.addMessage('11:11 - PIDIENDO UN DESEO POR TI 💫', 'love');
    }
}, 60000); // Revisar cada minuto
