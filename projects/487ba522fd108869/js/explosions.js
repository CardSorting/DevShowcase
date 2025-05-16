/**
 * Explosion effect for destroyed entities
 */
class Explosion extends Entity {
    constructor(x, y, size) {
        super(x, y, size, size, '#ffffff');
        this.size = size;
        this.maxSize = size * 1.5;
        this.alpha = 1;
        this.fadeSpeed = 2.5;
        this.growSpeed = 1.2;
        this.particles = [];
        this.createExplosionParticles();
    }
    
    createExplosionParticles() {
        // Number of particles based on explosion size
        const particleCount = Math.floor(this.size / 5);
        
        // Create particles with random directions
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2; // Random angle
            const speed = 1 + Math.random() * 3;       // Random speed
            const size = 2 + Math.random() * 3;        // Random size
            const distance = this.size / 2;            // Max distance
            
            const particle = {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                size: size,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                distance: 0,
                maxDistance: distance,
                alpha: 1,
                color: this.getRandomExplosionColor()
            };
            
            this.particles.push(particle);
        }
    }
    
    getRandomExplosionColor() {
        const colors = ['#f39c12', '#e74c3c', '#f1c40f', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(deltaTime) {
        // Update explosion size and alpha
        this.width = Math.min(this.width + this.growSpeed, this.maxSize);
        this.height = this.width;
        this.alpha -= this.fadeSpeed * deltaTime;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.distance += Math.sqrt(
                Math.pow(particle.velocity.x, 2) + 
                Math.pow(particle.velocity.y, 2)
            );
            
            // Fade particles based on distance traveled
            particle.alpha = 1 - (particle.distance / particle.maxDistance);
        });
        
        // Deactivate when completely faded
        if (this.alpha <= 0) {
            this.deactivate();
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Save context to restore later
        ctx.save();
        
        // Draw main explosion
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw particles
        this.particles.forEach(particle => {
            if (particle.alpha > 0) {
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Restore context
        ctx.restore();
    }
}

class ExplosionManager {
    constructor() {
        this.explosions = [];
    }
    
    createExplosion(x, y, size) {
        const explosion = new Explosion(x, y, size);
        this.explosions.push(explosion);
    }
    
    update(deltaTime) {
        // Update and filter active explosions
        this.explosions = this.explosions.filter(explosion => explosion.active);
        this.explosions.forEach(explosion => {
            explosion.update(deltaTime);
        });
    }
    
    draw(ctx) {
        this.explosions.forEach(explosion => {
            explosion.draw(ctx);
        });
    }
    
    clearExplosions() {
        this.explosions = [];
    }
}
