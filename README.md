# Luminescent Flows

## Inspiration
This project is inspired by the mesmerizing interplay of light, sound, and motion, particularly by bioluminescent beaches, aurora borealis, and interactive artworks, like those in Tokyo's teamLab Borderless. It combines fluid particle dynamics, audio reactivity, and interactive visual effects to create an immersive experience. The goal is to evoke a sense of wonder and engagement, allowing users to explore the interplay between sound, light, and movement.

## Features
- **Interactive Particle System**: Particles respond to mouse movement, creating glowing effects and dynamic interactions.
- **Audio Reactivity**: The particle system reacts to microphone input or background music, with adjustable sensitivity for bass, mid, and treble frequencies.
- **Dynamic Wave Patterns**: Particles move in flowing wave-like patterns, creating a mesmerizing visual effect.
- **Bloom Effect**: A shader-based bloom effect enhances the visual appeal of glowing particles.
- **Explosion Effects**: Click and hold to create explosion effects that ripple through the particle field.
- **Color Shifting**: Particles shift colors dynamically, creating a vibrant and ever-changing visual experience.
- **Customizable Parameters**: Adjust wave speed, wave frequency, wave amplitude, particle size, and bloom intensity in real-time.
- **Background Music**: Play a background track that reacts to the audio visualization.

## How to Use

### Controls

#### General Controls:
- **Mouse Movement**: Influences particle movement and creates glowing effects.
- **Mouse Click**: Creates explosion effects that ripple through the particle field.
- **Mouse Hold**: Hold the mouse click for 0.5 seconds to trigger a color-shifting explosion.

#### Audio Controls:
- **Enable/Disable Audio**: Toggle microphone input for audio-reactive effects.
- **Audio Sensitivity**: Adjust how responsive the particles are to audio input using the slider.

#### Music Controls:
- **Play/Stop Music**: Toggle background music on or off. The music reacts to the audio visualization.

#### Customization Controls:
- **Wave Speed**: Adjust the speed of the wave patterns.
- **Wave Frequency**: Adjust the frequency of the wave patterns.
- **Wave Amplitude**: Adjust the amplitude (height) of the wave patterns.
- **Particle Size**: Adjust the size of the particles.
- **Bloom Intensity**: Adjust the intensity of the bloom effect.

---

## Implementation Details

### Technologies Used
- **[p5.js](https://p5js.org/)**: A JavaScript library for creative coding, used to handle graphics, interactivity, and animations.
- **[p5.sound.js](https://p5js.org/reference/#/libraries/p5.sound)**: An add-on to p5.js for handling audio input, analysis, and playback.
- **WebGL**: Used for rendering the particle system and bloom effect with hardware acceleration.
- **GLSL Shaders**: Custom shaders are used to create the bloom effect, enhancing the visual appeal of the particles.

### Key Components

#### 1. **Particle System**
- The particle system is the core of the project. Each particle is an instance of the `Particle` class, which handles its position, velocity, color, and interaction with mouse movements and audio input.
- Particles are arranged in a grid and move dynamically based on wave patterns, mouse interactions, and audio reactivity.

#### 2. **Audio Reactivity**
- The project uses the `p5.FFT` (Fast Fourier Transform) to analyze audio input from the microphone or background music.
- The audio spectrum is divided into bass, mid, and treble frequencies, which influence the wave speed, wave amplitude, and particle brightness.

#### 3. **Wave Patterns**
- Particles move in wave-like patterns, which are generated using sine and cosine functions. The wave parameters (speed, frequency, and amplitude) can be adjusted in real-time using the UI controls.

#### 4. **Bloom Effect**
- A custom GLSL shader is used to create a bloom effect, which enhances the glow of the particles. The shader applies a blur to the particles and combines it with the original image to create a glowing effect.

#### 5. **Explosion Effects**
- When the user clicks and holds the mouse, an explosion effect is created. The explosion affects nearby particles, pushing them away and increasing their brightness and color intensity.

#### 6. **Background Music**
- The project includes a background music track that can be toggled on or off. The music is loaded from a CDN and reacts to the audio visualization, creating a synchronized visual and auditory experience.

#### 7. **UI Controls**
- The UI controls allow users to customize the experience in real-time. Sliders and buttons are provided to adjust wave parameters, particle size, bloom intensity, and audio sensitivity.

---

## Project Structure
```
refract-effect/
├── index.html              # Main HTML file
├── style.css               # CSS for styling the UI
├── sketch.js               # Main p5.js sketch file
├── Particle.js             # Particle class for individual particle behavior
├── Explosion.js            # Explosion class for explosion effects
├── BloomShader.js          # GLSL shader code for the bloom effect
├── AudioHandler.js         # Audio handling and reactivity logic
└── README.md               # Project documentation
```

---

## Setup Instructions
1. Open the `index.html` file in a modern web browser.
2. Ensure microphone permissions are enabled if you want to use audio reactivity with the microphone.
3. Use the controls listed above to interact with the particles, adjust parameters, and explore the visual effects.

---

## Credits
- **Background Music**: "Bombastic" by Zenji (Free Music Archive) - Licensed under Attribution-NonCommercial-NoDerivatives 4.0 International License.
- **Background Image**: [Unsplash](https://unsplash.com/photos/photo-1476968052548-9b8e04d29c9a) - Free to use under the Unsplash License.

Parts of this documentation have been created using generative AI.