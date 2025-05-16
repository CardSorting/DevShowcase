/**
 * Enemy classes and formation logic
 */
class Enemy extends Entity {
    constructor(x, y, width, height, color, points) {
        super(x, y, width, height, color);
        this.points = points; // Points earned when destroyed
        this.initialX = x;
        this.initialY = y;
        this.formationX = x;
        this.formationY = y;
        this.inFormation = true;
        this.divingPath = null;
        this.pathProgress = 0;
        this.divingSpeed = 0;
        this.shootCooldown = randomBetween(3, 6);
        this.timeSinceLastShot = 0;
        this.createEnemySprite();
    }
    
    createEnemySprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // Base enemy shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(this.width / 4, 0);
        ctx.lineTo(3 * this.width / 4, 0);
        ctx.lineTo(this.width, this.height / 2);
        ctx.lineTo(3 * this.width / 4, this.height);
        ctx.lineTo(this.width / 4, this.height);
        ctx.closePath();
        ctx.fill();
        
        // Eyes/details
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.width / 3, this.height / 2, 3, 0, Math.PI * 2);
        ctx.arc(2 * this.width / 3, this.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        this.sprite = canvas;
    }
    
    update(deltaTime, canvas, playerX, playerY) {
        if (this.inFormation) {
            // Move in formation
            this.x = this.formationX;
            this.y = this.formationY;
        } else {
            // Follow diving path
            if (this.divingPath && this.pathProgress < 1) {
                this.pathProgress += this.divingSpeed * deltaTime;
                if (this.pathProgress >= 1) {
                    // Return to formation
                    this.inFormation = true;
                    this.pathProgress = 0;
                    this.divingPath = null;
                } else {
                    // Calculate position along path
                    const point = calculateBezierPoint(
                        this.pathProgress,
                        { x: this.initialX, y: this.initialY },
                        this.divingPath.control1,
                        this.divingPath.control2,
                        { x: this.divingPath.endX, y: this.divingPath.endY }
                    );
                    this.x = point.x;
                    this.y = point.y;
                }
            }
        }
        
        // Shooting cooldown
        this.timeSinceLastShot += deltaTime;
        
        super.update(deltaTime);
    }
    
    startDiving(canvas, playerX) {
        if (this.inFormation) {
            this.inFormation = false;
            this.initialX = this.x;
            this.initialY = this.y;
            this.pathProgress = 0;
            this.divingSpeed = randomBetween(3, 5) / 10; // 0.3 to 0.5
            
            // Create a path to dive towards the player and then back to formation
            const targetX = playerX;
            const targetY = canvas.height + 50; // Just below the canvas
            
            this.divingPath = {
                control1: {
                    x: this.initialX + randomBetween(-100, 100),
                    y: this.initialY + 100
                },
                control2: {
                    x: targetX + randomBetween(-50, 50),
                    y: targetY - 100
                },
                endX: this.formationX,
                endY: this.formationY
            };
        }
    }
    
    canShoot() {
        return this.timeSinceLastShot >= this.shootCooldown && randomBetween(1, 100) <= 10;
    }
    
    shoot() {
        this.timeSinceLastShot = 0;
        this.shootCooldown = randomBetween(3, 6);
        return new EnemyBullet(
            this.x + this.width / 2 - 2,
            this.y + this.height
        );
    }
}

class BasicEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 25, 25, '#e74c3c', 10);
    }
}

class AdvancedEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 30, 30, '#9b59b6', 20);
    }
    
    createEnemySprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // More detailed enemy shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Main body
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(this.width / 4, this.height);
        ctx.lineTo(3 * this.width / 4, this.height);
        ctx.lineTo(this.width, this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // Details
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.width / 3, this.height / 3, this.width / 3, this.height / 6);
        ctx.fillRect(this.width / 4, this.height / 2, this.width / 2, this.height / 6);
        
        this.sprite = canvas;
    }
}

class BossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 40, 40, '#f39c12', 50);
        this.health = 3;
    }
    
    createEnemySprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // Boss enemy shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Upper part
        ctx.moveTo(0, this.height / 3);
        ctx.lineTo(this.width / 4, 0);
        ctx.lineTo(3 * this.width / 4, 0);
        ctx.lineTo(this.width, this.height / 3);
        // Middle part
        ctx.lineTo(this.width, 2 * this.height / 3);
        // Lower part
        ctx.lineTo(3 * this.width / 4, this.height);
        ctx.lineTo(this.width / 4, this.height);
        ctx.lineTo(0, 2 * this.height / 3);
        ctx.closePath();
        ctx.fill();
        
        // Details
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.width / 3, this.height / 2, 5, 0, Math.PI * 2);
        ctx.arc(2 * this.width / 3, this.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        this.sprite = canvas;
    }
    
    hit() {
        this.health--;
        // Change color as health decreases
        if (this.health === 2) {
            this.color = '#e67e22';
            this.createEnemySprite();
        } else if (this.health === 1) {
            this.color = '#e74c3c';
            this.createEnemySprite();
        }
        return this.health <= 0;
    }
}

class EnemyFormation {
    constructor(canvas) {
        this.canvas = canvas;
        this.enemies = [];
        this.direction = 1; // 1 = right, -1 = left
        this.speed = 30; // pixels per second
        this.dropAmount = 20; // pixels to drop when hitting edge
        this.padding = 40; // Space between enemies
    }
    
    createFormation(level) {
        this.enemies = [];
        this.direction = 1;
        this.speed = 30 + level * 5; // Increase speed with level
        
        const rows = Math.min(4 + Math.floor(level / 2), 7); // More rows with higher levels
        const cols = Math.min(7 + Math.floor(level / 3), 12); // More columns with higher levels
        
        const formationWidth = cols * this.padding;
        const startX = (this.canvas.width - formationWidth) / 2;
        const startY = 60;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let enemy;
                
                if (row === 0 && (col === 0 || col === cols - 1 || col === Math.floor(cols / 2))) {
                    // Boss enemies in key positions
                    enemy = new BossEnemy(
                        startX + col * this.padding,
                        startY + row * this.padding
                    );
                } else if (row === 1 || row === 2) {
                    // Advanced enemies in middle rows
                    enemy = new AdvancedEnemy(
                        startX + col * this.padding,
                        startY + row * this.padding
                    );
                } else {
                    // Basic enemies elsewhere
                    enemy = new BasicEnemy(
                        startX + col * this.padding,
                        startY + row * this.padding
                    );
                }
                
                this.enemies.push(enemy);
            }
        }
    }
    
    update(deltaTime, playerX, playerY) {
        if (this.enemies.length === 0) return;
        
        // Move the formation
        let movingEnemies = this.enemies.filter(enemy => enemy.inFormation);
        if (movingEnemies.length === 0) return;
        
        let changeDirection = false;
        
        // Check if formation has hit edge
        movingEnemies.forEach(enemy => {
            if ((this.direction === 1 && enemy.x + enemy.width + this.speed * deltaTime > this.canvas.width - 10) ||
                (this.direction === -1 && enemy.x - this.speed * deltaTime < 10)) {
                changeDirection = true;
            }
        });
        
        if (changeDirection) {
            this.direction *= -1;
            
            // Drop formation
            movingEnemies.forEach(enemy => {
                enemy.formationY += this.dropAmount;
            });
        } else {
            // Move formation horizontally
            movingEnemies.forEach(enemy => {
                enemy.formationX += this.direction * this.speed * deltaTime;
            });
        }
        
        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.canvas, playerX, playerY);
        });
        
        // Random enemy diving
        if (Math.random() < 0.01) {
            const formationEnemies = this.enemies.filter(enemy => enemy.inFormation);
            if (formationEnemies.length > 0) {
                const randomEnemy = formationEnemies[Math.floor(Math.random() * formationEnemies.length)];
                randomEnemy.startDiving(this.canvas, playerX);
            }
        }
    }
    
    draw(ctx) {
        this.enemies.forEach(enemy => {
            enemy.draw(ctx);
        });
    }
    
    checkBulletCollisions(bullets, powerUpManager) {
        let score = 0;
        let droppedPowerUp = false;
        
        bullets.forEach(bullet => {
            if (!bullet.active) return;
            
            for (let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];
                if (enemy.active && bullet.collidesWith(enemy)) {
                    // Handle boss enemies with multiple hits
                    let destroyed = true;
                    if (enemy instanceof BossEnemy) {
                        destroyed = enemy.hit();
                    }
                    
                    if (destroyed) {
                        enemy.deactivate();
                        // Attempt to drop a power-up
                        powerUpManager.attemptDrop(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        droppedPowerUp = true; 
                        
                        this.enemies.splice(i, 1);
                        score += enemy.points;
                    }
                    
                    bullet.deactivate();
                    break;
                }
            }
        });
        
        return { score, droppedPowerUp };
    }
    
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.active);
    }
    
    getRandomShootingEnemy() {
        const activeEnemies = this.getActiveEnemies();
        const shootingEnemies = activeEnemies.filter(enemy => enemy.canShoot());
        
        if (shootingEnemies.length > 0) {
            return shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
        }
        
        return null;
    }
}
