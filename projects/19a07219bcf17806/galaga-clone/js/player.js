/**
 * Player class representing the player's ship
 */
class Player extends Entity {
    constructor(canvas) {
        const width = 30;
        const height = 30;
        const x = canvas.width / 2 - width / 2;
        const y = canvas.height - height - 20;
        
        super(x, y, width, height, '#3498db');
        
        this.canvas = canvas;
        this.speed = 300; // pixels per second
        this.shootCooldown = 0.25; // seconds
        this.timeSinceLastShot = this.shootCooldown;
        this.lives = 3;
        
        // Create a better ship sprite
        this.createShipSprite();
    }
    
    createShipSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // Ship body
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);  // Top middle point
        ctx.lineTo(0, this.height);     // Bottom left
        ctx.lineTo(this.width, this.height); // Bottom right
        ctx.closePath();
        ctx.fill();
        
        // Ship cockpit
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 10);
        ctx.lineTo(this.width / 2 - 5, this.height - 10);
        ctx.lineTo(this.width / 2 + 5, this.height - 10);
        ctx.closePath();
        ctx.fill();
        
        this.sprite = canvas;
    }
    
    update(deltaTime, keys) {
        // Movement
        this.velocity.x = 0;
        
        if (keys.ArrowLeft) {
            this.velocity.x = -this.speed;
        } else if (keys.ArrowRight) {
            this.velocity.x = this.speed;
        }
        
        // Update position
        super.update(deltaTime);
        
        // Boundary check
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
        
        // Shooting cooldown
        this.timeSinceLastShot += deltaTime;
    }
    
    shoot() {
        if (this.timeSinceLastShot >= this.shootCooldown) {
            this.timeSinceLastShot = 0;
            return new PlayerBullet(
                this.x + this.width / 2 - 2,
                this.y
            );
        }
        return null;
    }
    
    hit() {
        this.lives--;
        return this.lives <= 0;
    }
    
    reset() {
        super.reset(this.canvas.width / 2 - this.width / 2, this.canvas.height - this.height - 20);
    }
    
    resetLives() {
        this.lives = 3;
    }
}
