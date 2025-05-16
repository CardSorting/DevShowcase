/**
 * PowerUp classes and manager
 */

const POWERUP_TYPES = {
    RAPID_FIRE: 'rapid_fire',
    SHIELD: 'shield',
    SPREAD_SHOT: 'spread_shot'
};

class PowerUp extends Entity {
    constructor(x, y, type) {
        const size = 20;
        let color;
        switch (type) {
            case POWERUP_TYPES.RAPID_FIRE:
                color = '#FFFF00'; // Yellow
                break;
            case POWERUP_TYPES.SHIELD:
                color = '#00FFFF'; // Cyan
                break;
            case POWERUP_TYPES.SPREAD_SHOT:
                color = '#FF00FF'; // Magenta
                break;
            default:
                color = '#FFFFFF'; // White
        }
        super(x, y, size, size, color);
        this.type = type;
        this.velocity.y = 100; // Power-ups fall downwards
        this.createPowerUpSprite();
    }

    createPowerUpSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Simple diamond shape for now
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width, this.height / 2);
        ctx.lineTo(this.width / 2, this.height);
        ctx.lineTo(0, this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Add a letter to distinguish
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let letter = '?';
        if (this.type === POWERUP_TYPES.RAPID_FIRE) letter = 'R';
        if (this.type === POWERUP_TYPES.SHIELD) letter = 'S';
        if (this.type === POWERUP_TYPES.SPREAD_SHOT) letter = 'P';
        ctx.fillText(letter, this.width / 2, this.height / 2);

        this.sprite = canvas;
    }

    update(deltaTime, canvas) {
        super.update(deltaTime);
        // Deactivate if it goes off screen
        if (this.y > canvas.height) {
            this.deactivate();
        }
    }
}

class PowerUpManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.powerUps = [];
        this.powerUpDropChance = 0.1; // 10% chance for an enemy to drop a power-up
    }

    spawnPowerUp(x, y) {
        // Randomly select a power-up type
        const types = Object.values(POWERUP_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const powerUp = new PowerUp(x, y, randomType);
        this.powerUps.push(powerUp);
    }

    attemptDrop(x, y) {
        if (Math.random() < this.powerUpDropChance) {
            this.spawnPowerUp(x, y);
        }
    }

    update(deltaTime) {
        this.powerUps = this.powerUps.filter(pu => pu.active);
        this.powerUps.forEach(pu => {
            pu.update(deltaTime, this.canvas);
        });
    }

    draw(ctx) {
        this.powerUps.forEach(pu => {
            pu.draw(ctx);
        });
    }

    checkCollisions(player) {
        let collectedPowerUpType = null;
        this.powerUps.forEach(pu => {
            if (pu.active && player.active && pu.collidesWith(player)) {
                collectedPowerUpType = pu.type;
                pu.deactivate();
            }
        });
        return collectedPowerUpType;
    }

    clearPowerUps() {
        this.powerUps = [];
    }
}
