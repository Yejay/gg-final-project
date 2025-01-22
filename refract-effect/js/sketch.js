let particles = [];
let particleSize = 4;
let spacing = particleSize * 8; // Dynamic spacing based on particle size
let mouseInfluenceRadius = 100;
let lastMouseX, lastMouseY;
let glowIntensity = 150;
let bloomShader;
let particleBuffer;
let bloomBuffer;
let bgImage;
let bgOpacity = 100; // Background opacity (0-255)
let waveTime = 0;
let waveSpeed = 0.1;
let waveFrequency = 0.005;
let waveAmplitude = 5;
let activeRadius = 100;
let mouseHoldTime = 0;
let explosions = [];
let colorShiftTime = 0;
let isColorShifting = false;

// Bloom shader code
const bloomVertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}`;

const bloomFragShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float intensity;

vec4 blur13(sampler2D image, vec2 uv, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture2D(image, uv) * 0.1964825501511404;
    color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
    return color;
}

void main() {
    vec2 uv = vTexCoord;
    vec2 res = resolution;
    
    // Horizontal blur
    vec4 blur1 = blur13(tex0, uv, vec2(1.0, 0.0));
    // Vertical blur
    vec4 blur2 = blur13(tex0, uv, vec2(0.0, 1.0));
    
    // Combine blurs and original
    vec4 original = texture2D(tex0, uv);
    vec4 bloom = (blur1 + blur2) * 0.5;
    
    // Enhance bloom
    bloom *= intensity;
    
    gl_FragColor = original + bloom;
}`;

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
            buffer.circle(this.x - width/2, this.y - height/2, this.radius - i * 20);
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

class Particle {
    constructor(x, y) {
        this.screenX = x;
        this.screenY = y;
        this.x = x - width/2;
        this.y = height/2 - y;
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
            
            this.screenX = this.x + width/2;
            this.screenY = height/2 - this.y;
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

function preload() {
    // Create shader
    bloomShader = createShader(bloomVertShader, bloomFragShader);
    // Load background image
    bgImage = loadImage('https://images.unsplash.com/photo-1476968052548-9b8e04d29c9a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
}

function updateParticleGrid() {
    particles = [];
    // Calculate spacing based on particle size and desired density
    spacing = particleSize * 8; // Adjust multiplier to control density
    
    // Create particles with new spacing
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            particles.push(new Particle(x, y));
        }
    }
    console.log(`Created ${particles.length} particles with spacing ${spacing}px`);
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    colorMode(HSB, 360, 100, 100, glowIntensity);
    
    // Create offscreen buffers
    particleBuffer = createGraphics(width, height, WEBGL);
    bloomBuffer = createGraphics(width, height, WEBGL);
    
    particleBuffer.colorMode(HSB, 360, 100, 100, glowIntensity);
    
    // Initialize particle grid
    updateParticleGrid();
}

function draw() {
    // Draw background image with opacity
    push();
    background(0);
    imageMode(CENTER);
    let scale = max(width / bgImage.width, height / bgImage.height);
    tint(255, bgOpacity); // Set opacity for background image
    image(bgImage, 0, 0, bgImage.width * scale, bgImage.height * scale);
    pop();
    
    // Update wave time
    waveTime += waveSpeed;
    
    // Clear particle buffer
    particleBuffer.clear();
    
    // Draw particles to particle buffer
    particleBuffer.push();
    particles.forEach(particle => {
        particle.update();
        particle.draw(particleBuffer);
    });
    particleBuffer.pop();
    
    // Apply bloom shader to particles and draw them on top
    push();
    blendMode(ADD);
    bloomShader.setUniform('tex0', particleBuffer);
    bloomShader.setUniform('resolution', [width, height]);
    bloomShader.setUniform('intensity', 1.5);
    shader(bloomShader);
    rect(-width/2, -height/2, width, height);
    pop();
    
    // Update and draw explosions
    explosions = explosions.filter(explosion => explosion.update());
    explosions.forEach(explosion => explosion.draw(particleBuffer));
    
    lastMouseX = mouseX;
    lastMouseY = mouseY;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    particleBuffer = createGraphics(width, height, WEBGL);
    bloomBuffer = createGraphics(width, height, WEBGL);
    
    particleBuffer.colorMode(HSB, 360, 100, 100, glowIntensity);
    
    // Update particle grid on resize
    updateParticleGrid();
}

function mousePressed() {
    mouseHoldTime = millis();
}

function mouseReleased() {
    let holdDuration = millis() - mouseHoldTime;
    if (holdDuration > 500) { // Hold for 0.5 seconds
        explosions.push(new Explosion(mouseX, mouseY));
        isColorShifting = true;
        setTimeout(() => isColorShifting = false, 3000); // Stop color shift after 3 seconds
    }
}
