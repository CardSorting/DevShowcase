/**
 * Base Entity class for all game objects
 */
class Entity {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.sprite = createSprite(color, width, height);
        this.active = true;
        this.velocity = { x: 0, y: 0 };
    }

    // Update entity position based on velocity
    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    // Draw the entity on the canvas
    draw(ctx) {
        if (this.active) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        }
    }

    // Check collision with another entity
    collidesWith(entity) {
        return this.active && entity.active && checkCollision(this, entity);
    }

    // Set entity as inactive (to be removed from the game)
    deactivate() {
        this.active = false;
    }

    // Reset the entity to its initial state
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.velocity = { x: 0, y: 0 };
    }
}
