# Luminescent Flows

## Inspiration
This project is inspired by the mesmerizing interplay of light, sound, and motion, particularly by bioluminescent beaches, aurora borealis and iteractive artworks, like those in Tokyo's teamlabs Borderless. It combines fluid particle dynamics, audio reactivity, and interactive visual effects to create an immersive experience. The goal is to evoke a sense of wonder and engagement, allowing users to explore the interplay between sound, light, and movement.

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


## Project Structure
```
refract-effect/
├── index.html
├── style.css
├── sketch.js
├── Particle.js
├── Explosion.js
├── BloomShader.js
├── AudioHandler.js
└── README.md
```

## Credits
- **Background Music**: "Bombastic" by Zenji (Free Music Archive) - Licensed under Attribution-NonCommercial-NoDerivatives 4.0 International License.
- **Background Image**: [Unsplash](https://unsplash.com/photos/photo-1476968052548-9b8e04d29c9a) - Free to use under the Unsplash License.