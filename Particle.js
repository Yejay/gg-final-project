class Particle {
    constructor(x, y) {
        this.screenX = x;
        this.screenY = y;
        this.x = x - width / 2;
        this.y = height / 2 - y;
        this.originalX = this.x;
        this.originalY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.damping = 0.97;
        this.brightness = 0;
        this.waveBrightness = 0;
        this.baseHue = random(160, 220);
        this.hue = this.baseHue;
        this.size = random(particleSize * 0.9, particleSize * 1.1);
        this.needsUpdate = true;
        this.waveOffset = 0;
    }

    update() {
        let dx = mouseX - this.screenX;
        let dy = mouseY - this.screenY;
        let distToMouse = dx * dx + dy * dy;
        let waveX = (this.screenX + waveTime * 100) * waveFrequency;
        let waveY = this.screenY * waveFrequency;
        
        if (distToMouse > activeRadius * activeRadius && 
            abs(this.vx) < 0.01 && abs(this.vy) < 0.01 && 
            this.brightness < 1) {
            let quickWave = sin(waveX) * cos(waveY + waveTime);
            if (abs(quickWave) < 0.1) {
                return;
            }
        }

        // Calculate wave effect
        let waveValue = sin(waveX) * cos(waveY + waveTime) * waveAmplitude;
        this.waveBrightness = map(waveValue, -waveAmplitude, waveAmplitude, 0, 100);
        this.waveBrightness = max(0, this.waveBrightness);

        // Add physical wave movement
        let targetWaveOffset = waveValue * 0.3; // Scale factor for wave height
        let waveForce = (targetWaveOffset - this.waveOffset) * 0.1;
        this.vy += waveForce;
        this.waveOffset += (targetWaveOffset - this.waveOffset) * 0.1;

        // Mouse interaction
        if (distToMouse < mouseInfluenceRadius * mouseInfluenceRadius) {
            let distance = sqrt(distToMouse);
            let mouseSpeed = dist(mouseX, mouseY, lastMouseX || mouseX, lastMouseY || mouseY);
            let influence = map(distance, 0, mouseInfluenceRadius, 1, 0, true);
            influence = influence * influence;
            
            this.brightness = min(this.brightness + influence * mouseSpeed * 1.5, glowIntensity);
            
            if (distance > 0.1) {
                let forceX = (dx / distance) * mouseSpeed * influence * 0.4;
                let forceY = (dy / distance) * mouseSpeed * influence * 0.4;
                
                this.vx -= forceX;
                this.vy += forceY;
            }
        } else {
            this.brightness = max(0, this.brightness - 2);
        }
        
        this.brightness = max(this.brightness, this.waveBrightness);
        
        // Apply physics with wave movement
        if (abs(this.vx) > 0.01 || abs(this.vy) > 0.01 || abs(waveForce) > 0.01) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.damping;
            this.vy *= this.damping;
            
            // Return to original position with wave offset
            let returnX = (this.originalX - this.x) * 0.05;
            let returnY = (this.originalY - this.y + this.waveOffset) * 0.05;
            this.x += returnX;
            this.y += returnY;
            
            this.screenX = this.x + width / 2;
            this.screenY = height / 2 - this.y;
        }

        // Color shift effect
        if (isColorShifting) {
            let targetHue = (frameCount * 2) % 360;
            this.hue = lerp(this.hue, targetHue, 0.1);
        } else {
            this.hue = lerp(this.hue, this.baseHue, 0.1);
        }

        // Apply explosion effects
        explosions.forEach(explosion => {
            explosion.affectParticle(this);
        });

        // Add audio reactivity to particle behavior with better constraints
        if (audioEnabled) {
            let audioLevel = constrain(audioSpectrum / 100, 0, 1);
            
            // Modify particle properties based on audio with limited scaling
            let baseSize = random(particleSize * 0.9, particleSize * 1.1);
            this.size = map(audioLevel, 0, 1, baseSize, baseSize * 2);
            
            // Adjust brightness with a more controlled range
            let audioBrightness = map(audioLevel, 0, 1, 0, glowIntensity * 0.3);
            this.brightness = max(this.brightness, audioBrightness);
            
            // Add gentler movement based on audio
            let angle = noise(this.x * 0.01, this.y * 0.01, frameCount * 0.02) * TWO_PI;
            this.vx += cos(angle) * audioLevel * 0.2;
            this.vy += sin(angle) * audioLevel * 0.2;
        }
    }

    draw(buffer) {
        if (this.brightness < 0.1) {
            // Draw simple dot for inactive particles
            buffer.blendMode(BLEND);
            buffer.noStroke();
            buffer.fill(this.hue, 30, 30, 100);
            buffer.circle(this.x, this.y, this.size);
            return;
        }

        buffer.push();
        buffer.blendMode(ADD);
        buffer.noStroke();
        
        // Adjust color based on wave brightness
        let waveHue = map(this.waveBrightness, 0, 100, this.hue, this.hue + 20);
        let coreBrightness = map(this.brightness, 0, glowIntensity, 50, 100);
        
        buffer.fill(waveHue, 100, coreBrightness, this.brightness);
        buffer.circle(this.x, this.y, this.size * 1.5);
        
        // Reduce number of glow layers for inactive particles
        let numLayers = this.brightness > 50 ? 3 : 2;
        for (let i = 0; i < numLayers; i++) {
            let glowSize = map(this.brightness, 0, glowIntensity, this.size, this.size * (4 + i * 2));
            let alpha = map(i, 0, numLayers - 1, this.brightness * 0.5, this.brightness * 0.1);
            buffer.fill(waveHue, 100, 100, alpha);
            buffer.circle(this.x, this.y, glowSize);
        }
        buffer.pop();
    }
}