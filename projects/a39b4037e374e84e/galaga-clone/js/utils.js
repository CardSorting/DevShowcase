/**
 * Utility functions for the Galaga game
 */

// Check collision between two objects with x, y, width, and height properties
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Generate a random number between min and max (inclusive)
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Check if a value is out of bounds
function isOutOfBounds(value, min, max) {
    return value < min || value > max;
}

// Create a sprite image
function createSprite(color, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
}

// Load a high score from local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('galagaHighScore');
    return savedHighScore ? parseInt(savedHighScore) : 0;
}

// Save a high score to local storage
function saveHighScore(score) {
    localStorage.setItem('galagaHighScore', score.toString());
}

// Calculate a point on a path given a progress value (0 to 1)
function calculateBezierPoint(t, p0, p1, p2, p3) {
    const cX = 3 * (p1.x - p0.x);
    const bX = 3 * (p2.x - p1.x) - cX;
    const aX = p3.x - p0.x - cX - bX;

    const cY = 3 * (p1.y - p0.y);
    const bY = 3 * (p2.y - p1.y) - cY;
    const aY = p3.y - p0.y - cY - bY;

    const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
    
    return { x, y };
}
