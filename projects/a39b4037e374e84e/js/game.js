/**
 * Main game controller for the Galaga clone
 */
class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Game state
        this.gameActive = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = loadHighScore();
        this.level = 1;
        this.levelCleared = false;
        this.levelStartTimer = 0;
        this.levelStartDelay = 2; // seconds
        
        // Initialize game components
        this.initializeGame();
        
        // Input handling
        this.keys = {};
        this.initializeControls();
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        
        // Add event listeners for UI buttons
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.startGame());
        
        // Update high score display
        this.highScoreElement.textContent = this.highScore;
        
        // Start the game loop
        this.lastTime = 0;
        this.init();
    }
    
    init() {
        // Start the main game loop
        window.requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    initializeGame() {
        // Create game entities
        this.player = new Player(this.canvas);
        this.enemyFormation = new EnemyFormation(this.canvas);
        this.bulletManager = new BulletManager(this.canvas);
        this.explosionManager = new ExplosionManager();
        this.powerUpManager = new PowerUpManager(this.canvas);
        
        // Create initial enemy formation
        this.enemyFormation.createFormation(this.level);
    }
    
    initializeControls() {
        // Key down event
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Space bar for shooting
            if (e.code === 'Space' && this.gameActive && !this.gameOver) {
                const bullets = this.player.shoot();
                if (bullets) {
                    bullets.forEach(bullet => this.bulletManager.addPlayerBullet(bullet));
                }
            }
        });
        
        // Key up event
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    startGame() {
        // Reset game state
        this.gameActive = true;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.levelCleared = false;
        this.levelStartTimer = 0;
        
        // Reset game components
        this.player.reset();
        this.player.resetLives();
        this.enemyFormation.createFormation(this.level);
        this.bulletManager.clearBullets();
        this.explosionManager.clearExplosions();
        this.powerUpManager.clearPowerUps();
        
        // Update UI
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.player.lives;
        
        // Hide start screen
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
    
    endGame() {
        this.gameActive = false;
        this.gameOver = true;
        
        // Update final score and show game over screen
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            saveHighScore(this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
    }
    
    startNextLevel() {
        this.level++;
        this.levelCleared = false;
        this.levelStartTimer = 0;
        
        // Create new enemy formation with increased difficulty
        this.enemyFormation.createFormation(this.level);
        
        // Clear bullets
        this.bulletManager.clearBullets();
    }
    
    update(deltaTime) {
        if (!this.gameActive) return;
        
        // Level transition
        if (this.levelCleared) {
            this.levelStartTimer += deltaTime;
            if (this.levelStartTimer >= this.levelStartDelay) {
                this.startNextLevel();
            }
            return;
        }
        
        // Update player
        this.player.update(deltaTime, this.keys);
        
        // Update enemy formation
        this.enemyFormation.update(deltaTime, this.player.x, this.player.y);
        
        // Update bullets
        this.bulletManager.update(deltaTime);
        
        // Update explosions
        this.explosionManager.update(deltaTime);

        // Update power-ups
        this.powerUpManager.update(deltaTime);
        
        // Enemy shooting
        if (Math.random() < 0.02) {
            const shootingEnemy = this.enemyFormation.getRandomShootingEnemy();
            if (shootingEnemy) {
                const bullet = shootingEnemy.shoot();
                this.bulletManager.addEnemyBullet(bullet);
            }
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Check if level is cleared
        if (this.enemyFormation.getActiveEnemies().length === 0) {
            this.levelCleared = true;
        }
        
        // Check if enemies have reached the bottom
        const enemies = this.enemyFormation.getActiveEnemies();
        for (let enemy of enemies) {
            if (enemy.y + enemy.height > this.canvas.height - 50) {
                this.endGame();
                break;
            }
        }
    }
    
    checkCollisions() {
        // Check player bullet collisions with enemies
        const collisionResult = this.enemyFormation.checkBulletCollisions(this.bulletManager.playerBullets, this.powerUpManager);
        if (collisionResult.score > 0) {
            this.score += collisionResult.score;
            this.scoreElement.textContent = this.score;
        }
        if (collisionResult.droppedPowerUp) {
            // Power-up was dropped by the enemy formation logic
        }
        
        // Check enemy bullet collisions with player
        if (this.bulletManager.checkPlayerCollisions(this.player)) {
            const playerDead = this.player.hit();
            
            // Create explosion at player position
            this.explosionManager.createExplosion(
                this.player.x + this.player.width / 2 - 15,
                this.player.y + this.player.height / 2 - 15,
                30
            );
            
            // Update lives display
            this.livesElement.textContent = this.player.lives;
            
            if (playerDead) {
                this.endGame();
            } else {
                // Reset player position
                this.player.reset();
            }
        }
        
        // Check direct collisions between player and enemies
        const enemies = this.enemyFormation.getActiveEnemies();
        for (let enemy of enemies) {
            if (enemy.collidesWith(this.player)) {
                const playerDead = this.player.hit();
                
                // Create explosions
                this.explosionManager.createExplosion(
                    enemy.x + enemy.width / 2 - 15,
                    enemy.y + enemy.height / 2 - 15,
                    30
                );
                
                // Remove the enemy
                    enemy.deactivate();
                    this.enemyFormation.enemies = this.enemyFormation.enemies.filter(e => e !== enemy);
                    this.powerUpManager.attemptDrop(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    
                    // Add points
                    this.score += enemy.points;
                this.scoreElement.textContent = this.score;
                
                // Update lives and check game over
                this.livesElement.textContent = this.player.lives;
                
                if (playerDead) {
                    this.endGame();
                } else {
                    // Reset player position
                    this.player.reset();
                }
                
                break;
            }
        }

        // Check power-up collisions with player
        const collectedPowerUp = this.powerUpManager.checkCollisions(this.player);
        if (collectedPowerUp) {
            this.player.activatePowerUp(collectedPowerUp);
        }
    }
    
    draw() {
        // Clear the canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw enemy formation
        this.enemyFormation.draw(this.ctx);
        
        // Draw bullets
        this.bulletManager.draw(this.ctx);
        
        // Draw explosions
        this.explosionManager.draw(this.ctx);

        // Draw power-ups
        this.powerUpManager.draw(this.ctx);
        
        // Draw level transition
        if (this.levelCleared && this.gameActive) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.font = '30px "Courier New", monospace';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`LEVEL ${this.level} COMPLETED`, this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillText(`LEVEL ${this.level + 1} STARTING...`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Update and draw
        this.update(deltaTime);
        this.draw();
        
        // Continue the game loop
        window.requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    const game = new Game();
});
