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
let music;
let isMusicPlaying = false;

function preload() {
	// Create shader
	bloomShader = createShader(bloomVertShader, bloomFragShader);
	// Load background image
	bgImage = loadImage(
		'https://images.unsplash.com/photo-1476968052548-9b8e04d29c9a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
	);
    /**
     * Bombastic by Zenji
     * Free Music Archive
     * https://freemusicarchive.org/music/Zenji/
     * Licensed under Attribution-NonCommercial-NoDerivatives 4.0 International License
     */
    music = loadSound('https://cdn.jsdelivr.net/gh/Yejay/gg-final-project@main/assets/Zenji - Bombastic.mp3');
}

function updateParticleGrid() {
	particles = [];
	spacing = particleSize * 8; // Adjust spacing based on particle size

	let padding = spacing * 4; // Add padding to ensure coverage during movement

	for (let x = -padding; x < width + padding; x += spacing) {
		for (let y = -padding; y < height + padding; y += spacing) {
			particles.push(new Particle(x, y));
		}
	}
	console.log(
		`Created ${particles.length} particles with spacing ${spacing}px`
	);
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

	// Setup audio
	setupAudio();

	// Add event listeners
	document.getElementById('toggleAudio').addEventListener('click', toggleAudio);
	document.getElementById('sensitivity').addEventListener('input', (e) => {
		sensitivity = e.target.value / 100;
	});

	document.getElementById('waveSpeed').addEventListener('input', (e) => {
		waveSpeed = parseFloat(e.target.value);
	});

	document.getElementById('waveFrequency').addEventListener('input', (e) => {
		waveFrequency = parseFloat(e.target.value);
	});

	document.getElementById('waveAmplitude').addEventListener('input', (e) => {
		waveAmplitude = parseFloat(e.target.value);
	});

	document.getElementById('particleSize').addEventListener('input', (e) => {
		particleSize = parseFloat(e.target.value);
		updateParticleGrid(); // Recreate particles with new size
	});

	document.getElementById('bloomIntensity').addEventListener('input', (e) => {
		bloomShader.setUniform('intensity', parseFloat(e.target.value));
	});

    document.getElementById('toggleMusic').addEventListener('click', toggleMusic);
}

function draw() {
	// Update audio data
	updateAudioData();

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
	particles.forEach((particle) => {
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
	rect(-width / 2, -height / 2, width, height);
	pop();

	// Update and draw explosions
	explosions = explosions.filter((explosion) => explosion.update());
	explosions.forEach((explosion) => explosion.draw(particleBuffer));

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
	if (holdDuration > 500) {
		// Hold for 0.5 seconds
		explosions.push(new Explosion(mouseX, mouseY));
		isColorShifting = true;
		setTimeout(() => (isColorShifting = false), 3000); // Stop color shift after 3 seconds
	}
}

function toggleMusic() {
    if (!isMusicPlaying) {
        music.loop(); // Start playing the music in a loop
        isMusicPlaying = true;
        document.getElementById('toggleMusic').textContent = 'Stop Music';
    } else {
        music.stop(); // Stop the music
        isMusicPlaying = false;
        document.getElementById('toggleMusic').textContent = 'Play Music';
    }
}

function setupAudio() {
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, frequencyBands);
    
    // Use music as the input for FFT if music is playing
    if (isMusicPlaying) {
        fft.setInput(music);
    } else {
        fft.setInput(mic);
    }
}

function updateAudioData() {
    if (!audioEnabled) return;
    
    fft.analyze();
    
    // Get different frequency bands with better scaling
    let bass = constrain(fft.getEnergy("bass") * sensitivity, 0, 100);
    let mid = constrain(fft.getEnergy("mid") * sensitivity, 0, 100);
    let treble = constrain(fft.getEnergy("treble") * sensitivity, 0, 100);
    
    // Calculate overall spectrum with constraints
    audioSpectrum = constrain((bass + mid + treble) / 3, 0, 100);
    
    // Update global parameters with more controlled ranges
    waveSpeed = map(bass, 0, 100, 0.05, 0.15);
    waveAmplitude = map(mid, 0, 100, 3, 8);
    glowIntensity = map(treble, 0, 100, 150, 180);
}