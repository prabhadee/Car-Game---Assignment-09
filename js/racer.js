document.addEventListener('DOMContentLoaded', function() {
    
    const road = document.getElementById('road');
    const player = document.getElementById('player');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const nextLevelButton = document.getElementById('next-level-button');
    const finalScoreElement = document.getElementById('final-score');
    const finalLevelElement = document.getElementById('final-level');
    const completedLevelElement = document.getElementById('completed-level');
    const levelScoreElement = document.getElementById('level-score');
    const gameContainer = document.getElementById('game-container');
    
    let score = 0;
    let level = 1;
    let gameSpeed = 5;
    let baseSpeed = 5;
    let maxSpeed = 15;
    let enemySpawnRate = 2000;
    let isGameRunning = false;
    let playerX = 0;
    let playerY = window.innerHeight - 180;
    let lastFrameTime = 0;
    let enemySpawnTime = 0;
    let acceleration = 0;
    let keysPressed = {};
    
    
    const levelRequirements = [100, 500, 1000, 5000];
    
    function updatePlayerPosition() {
        const roadBounds = road.getBoundingClientRect();
        const playerWidth = player.offsetWidth;
        
        if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
            playerX = Math.max(roadBounds.left + 20, playerX - 5);
        }
        if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
            playerX = Math.min(roadBounds.right - playerWidth - 20, playerX + 5);
        }
        
        if (keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W']) {
            playerY = Math.max(100, playerY - 2);
            acceleration = getLevelAcceleration();
        } else if (keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S']) {
            playerY = Math.min(window.innerHeight - 180, playerY + 2);
            acceleration = -0.2;
        } else {
            acceleration = -0.05;
        }
        
        gameSpeed = Math.max(2, Math.min(maxSpeed, gameSpeed + acceleration));
        
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
    }

    const enemies = [];
    
    function createEnemy() {
        if (enemies.length > 15) return;
        
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        
        const roadBounds = road.getBoundingClientRect();
        const enemyWidth = 50;
        const minX = roadBounds.left + 20;
        const maxX = roadBounds.right - enemyWidth - 20;
        const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        
        const enemySpeed = level >= 2 && Math.random() > 0.7 ? 
            gameSpeed * 1.5 : gameSpeed;
        
        enemy.style.left = randomX + 'px';
        enemy.style.top = '-90px';
        gameContainer.appendChild(enemy);
        
        enemies.push({
            element: enemy,
            x: randomX,
            y: -90,
            speed: enemySpeed
        });
    }
    
    function updateEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.y += enemy.speed;
            
            if (enemy.y > window.innerHeight) {
                enemy.element.remove();
                enemies.splice(i, 1);
                increaseScore();
            } else {
                enemy.element.style.top = enemy.y + 'px';
                checkCollision(enemy);
            }
        }
    }
    
    function checkCollision(enemy) {
        const playerBounds = player.getBoundingClientRect();
        const enemyBounds = enemy.element.getBoundingClientRect();
        
        if (
            playerBounds.left < enemyBounds.right &&
            playerBounds.right > enemyBounds.left &&
            playerBounds.top < enemyBounds.bottom &&
            playerBounds.bottom > enemyBounds.top
        ) {
            gameOver();
        }
    }
    
    function increaseScore() {
        score += Math.floor(gameSpeed);
        scoreElement.textContent = score;
        
        if (level <= 4 && score >= levelRequirements[level-1]) {
            completeLevel();
        }
    }

    function getLevelAcceleration() {
        switch(level) {
            case 1: return 0;
            case 2: return 0.1;
            case 3: return 0.3;
            case 4: return 0.4;
            default: return 0.5;
        }
    }
    
    function completeLevel() {
        isGameRunning = false;
        keysPressed = {};
        
        completedLevelElement.textContent = level;
        levelScoreElement.textContent = score;
        levelCompleteScreen.style.display = 'flex';
    }
    
    // function levelUp() {
    //     level++;
    //     levelElement.textContent = level;
    //     acceleration++;  // this should update in every level up as level 1 = 0 , level 2 = 0.1 , level 3 = 0.3 , level 4 = 0.4

    //     baseSpeed += 2;
    //     maxSpeed += 3;
    //     enemySpawnRate = Math.max(500, enemySpawnRate - 500);
        
    //     updateCenterLine();
    // }

    function levelUp() {
        level++;
        levelElement.textContent = level;
        
        baseSpeed += 2;
        maxSpeed += 3;
        enemySpawnRate = Math.max(500, enemySpawnRate - 500);
        
        updateCenterLine();
    }
    
    // function updateCenterLine() {
    //     const centerLine = document.querySelector('.center-line');
    //     const animationDuration = 20 / gameSpeed;
    //     centerLine.style.animationDuration = `${animationDuration}s`;
    // }

    function updateCenterLine() {
        const centerLines = document.querySelectorAll('.center-line');
        const animationDuration = 20 / gameSpeed;
        centerLines.forEach(line => {
            line.style.animationDuration = `${animationDuration}s`;
            line.style.animationDirection = gameSpeed >= 0 ? 'normal' : 'reverse';
        });
    }

    function gameOver() {
        isGameRunning = false;
        keysPressed = {};
        
        finalScoreElement.textContent = score;
        finalLevelElement.textContent = level;
        gameOverScreen.style.display = 'flex';
    }
    
    function gameLoop(currentTime) {
        if (!isGameRunning) return;
        
        const deltaTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
        
        enemySpawnTime += deltaTime;
        if (enemySpawnTime > enemySpawnRate) {
            createEnemy();
            enemySpawnTime = 0;
        }
        
        updatePlayerPosition();
        updateEnemies();
        updateCenterLine();
        
        requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        score = 0;
        level = 1;
        gameSpeed = baseSpeed;
        enemySpawnRate = 2000;
        enemySpawnTime = 0;
        acceleration = 0;
        scoreElement.textContent = score;
        levelElement.textContent = level;
        
        enemies.forEach(enemy => enemy.element.remove());
        enemies.length = 0;
        
        const roadBounds = road.getBoundingClientRect();
        playerX = roadBounds.left + (roadBounds.width - player.offsetWidth) / 2;
        playerY = window.innerHeight - 180;
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
        
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        levelCompleteScreen.style.display = 'none';
        
        isGameRunning = true;
        lastFrameTime = performance.now();
        updateCenterLine();
        requestAnimationFrame(gameLoop);
    }
    
    function startNextLevel() {
        levelUp();
        score = 0;
        scoreElement.textContent = score;
        
        enemies.forEach(enemy => enemy.element.remove());
        enemies.length = 0;
        
        const roadBounds = road.getBoundingClientRect();
        playerX = roadBounds.left + (roadBounds.width - player.offsetWidth) / 2;
        playerY = window.innerHeight - 180;
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
        
        levelCompleteScreen.style.display = 'none';
        
        isGameRunning = true;
        lastFrameTime = performance.now();
        updateCenterLine();
        requestAnimationFrame(gameLoop);
    }
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    nextLevelButton.addEventListener('click', startNextLevel);
    
    document.addEventListener('keydown', function(event) {
        if (!isGameRunning && event.key === 'Enter') {
            if (gameOverScreen.style.display === 'flex') {
                startGame();
            } else if (levelCompleteScreen.style.display === 'flex') {
                startNextLevel();
            } else {
                startGame();
            }
            return;
        }
        
        if (!isGameRunning) return;
        
        keysPressed[event.key] = true;
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }
    });
    
    document.addEventListener('keyup', function(event) {
        keysPressed[event.key] = false;
    });
    
    let touchStartX = 0;
    gameContainer.addEventListener('touchstart', function(e) {
        if (!isGameRunning) return;
        touchStartX = e.touches[0].clientX;
        e.preventDefault();
    });
    
    gameContainer.addEventListener('touchmove', function(e) {
        if (!isGameRunning) return;
        const touchX = e.touches[0].clientX;
        const diff = touchX - touchStartX;
        
        if (diff < -20) {
            playerX = Math.max(road.getBoundingClientRect().left + 20, playerX - 15);
            touchStartX = touchX;
        } else if (diff > 20) {
            playerX = Math.min(road.getBoundingClientRect().right - player.offsetWidth - 20, playerX + 15);
            touchStartX = touchX;
        }
        
        player.style.left = playerX + 'px';
        e.preventDefault();
    });
    
    window.addEventListener('load', function() {
        const roadBounds = road.getBoundingClientRect();
        playerX = roadBounds.left + (roadBounds.width - player.offsetWidth) / 2;
        playerY = window.innerHeight - 180;
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
    });
    
    window.addEventListener('resize', function() {
        if (isGameRunning) {
            const roadBounds = road.getBoundingClientRect();
            playerX = Math.min(
                Math.max(roadBounds.left + 20, playerX),
                roadBounds.right - player.offsetWidth - 20
            );
            playerY = window.innerHeight - 180;
            player.style.left = playerX + 'px';
            player.style.top = playerY + 'px';
        }
    });
});