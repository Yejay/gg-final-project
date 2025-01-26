class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 250;
        this.speed = 15;
        this.alpha = 255;
    }

    update() {
        this.radius += this.speed;
        this.alpha = map(this.radius, 0, this.maxRadius, 255, 0);
        return this.radius < this.maxRadius;
    }

    draw(buffer) {
        buffer.push();
        buffer.blendMode(ADD);
        buffer.noFill();
        buffer.strokeWeight(2);
        
        // Draw multiple rings with different colors
        for (let i = 0; i < 3; i++) {
            let hue = (frameCount * 2 + i * 30) % 360;
            buffer.stroke(hue, 100, 100, this.alpha * 0.5);
            buffer.circle(this.x - width / 2, this.y - height / 2, this.radius - i * 20);
        }
        buffer.pop();
    }

    affectParticle(particle) {
        let dx = particle.screenX - this.x;
        let dy = particle.screenY - this.y;
        let distance = sqrt(dx * dx + dy * dy);
        let ringDistance = abs(distance - this.radius);
        
        if (ringDistance < 50) {
            let influence = map(ringDistance, 0, 50, 1, 0, true);
            influence = influence * influence;
            
            // Add force away from explosion center
            let angle = atan2(dy, dx);
            particle.vx += cos(angle) * influence * 5;
            particle.vy += sin(angle) * influence * 5;
            
            // Increase brightness
            particle.brightness = min(particle.brightness + influence * 200, glowIntensity);
            
            // Shift color
            particle.hue = (particle.hue + influence * 10) % 360;
        }
    }
}