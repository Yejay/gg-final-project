let mic, fft;
let audioEnabled = false;
let sensitivity = 0.5;
let frequencyBands = 64;
let audioSpectrum = [];

function setupAudio() {
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, frequencyBands);
    fft.setInput(mic);
}

function toggleAudio() {
    if (!audioEnabled) {
        userStartAudio().then(() => {
            mic.start();
            audioEnabled = true;
            document.getElementById('toggleAudio').textContent = 'Disable Audio';
            document.getElementById('toggleAudio').style.background = '#f44336';
        });
    } else {
        mic.stop();
        audioEnabled = false;
        document.getElementById('toggleAudio').textContent = 'Enable Audio';
        document.getElementById('toggleAudio').style.background = '#4CAF50';
    }
}

function updateAudioData() {
    if (!audioEnabled) return;
    
    fft.analyze();
    
    let bass = constrain(fft.getEnergy("bass") * sensitivity, 0, 100);
    let mid = constrain(fft.getEnergy("mid") * sensitivity, 0, 100);
    let treble = constrain(fft.getEnergy("treble") * sensitivity, 0, 100);
    
    audioSpectrum = constrain((bass + mid + treble) / 3, 0, 100);
    
    waveSpeed = map(bass, 0, 100, 0.05, 0.15);
    waveAmplitude = map(mid, 0, 100, 3, 8);
    glowIntensity = map(treble, 0, 100, 150, 180);
}