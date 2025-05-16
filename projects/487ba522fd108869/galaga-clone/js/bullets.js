/**
 * Bullet classes for player and enemy projectiles
 */
class Bullet extends Entity {
    constructor(x, y, width, height, color, velocity) {
        super(x, y, width, height, color);
        this.velocity = velocity;
    }
    
    update(deltaTime, canvas) {
        super.update(deltaTime);
        
        // Deactivate bullets that go off screen
        if (this.y < -this.height || this.y > canvas.height) {
            this.deactivate();
        }
    }
}

class PlayerBullet extends Bullet {
    constructor(x, y) {
        super(x, y, 4, 15, '#2ecc71', { x: 0, y: -400 });
        this.createBulletSprite();
    }
    
    createBulletSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // Bullet gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#2ecc71');
        gradient.addColorStop(1, '#27ae60');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Bullet glow
        ctx.shadowColor = '#2ecc71';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.sprite = canvas;
    }
}

class EnemyBullet extends Bullet {
    constructor(x, y) {
        super(x, y, 4, 15, '#e74c3c', { x: 0, y: 300 });
        this.createBulletSprite();
    }
    
    createBulletSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // Bullet gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(1, '#c0392b');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Bullet glow
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.sprite = canvas;
    }
}

class BulletManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.playerBullets = [];
        this.enemyBullets = [];
    }
    
    update(deltaTime) {
        // Update player bullets
        this.playerBullets = this.playerBullets.filter(bullet => bullet.active);
        this.playerBullets.forEach(bullet => {
            bullet.update(deltaTime, this.canvas);
        });
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);
        this.enemyBullets.forEach(bullet => {
            bullet.update(deltaTime, this.canvas);
        });
    }
    
    draw(ctx) {
        // Draw player bullets
        this.playerBullets.forEach(bullet => {
            bullet.draw(ctx);
        });
        
        // Draw enemy bullets
        this.enemyBullets.forEach(bullet => {
            bullet.draw(ctx);
        });
    }
    
    addPlayerBullet(bullet) {
        this.playerBullets.push(bullet);
    }
    
    addEnemyBullet(bullet) {
        this.enemyBullets.push(bullet);
    }
    
    checkPlayerCollisions(player) {
        let playerHit = false;
        
        this.enemyBullets.forEach(bullet => {
            if (bullet.active && player.active && bullet.collidesWith(player)) {
                bullet.deactivate();
                playerHit = true;
            }
        });
        
        return playerHit;
    }
    
    clearBullets() {
        this.playerBullets = [];
        this.enemyBullets = [];
    }
}
