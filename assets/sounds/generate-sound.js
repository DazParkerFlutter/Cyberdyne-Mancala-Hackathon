/**
 * Stone Drop Sound Generator
 * This script generates a MP3 sound file for a stone dropping into a wooden pit
 */

// This is a Node.js script that uses the Web Audio API to generate a stone drop sound
// Use this to generate a stone-drop.mp3 file

// Here's how you'd use this in a browser environment to test the sound:
/*
function generateStoneDropSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.5;
    
    // Create oscillator (for the main "knock" sound)
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.3);
    
    // Create noise (for the "rattle" effect)
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    // Gain nodes to control volume
    const oscGain = audioContext.createGain();
    oscGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.05, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    // Filter to make it sound more wooden
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.Q.setValueAtTime(0.7, audioContext.currentTime);
    
    // Connect the graph
    osc.connect(oscGain);
    noise.connect(noiseGain);
    oscGain.connect(filter);
    noiseGain.connect(filter);
    filter.connect(audioContext.destination);
    
    // Start and stop the sources
    osc.start();
    noise.start();
    osc.stop(audioContext.currentTime + duration);
    noise.stop(audioContext.currentTime + 0.2);
    
    return audioContext;
}
*/

// Since we can't actually generate the MP3 from this context, you can:
// 1. Create a test.html file and include the above code
// 2. Use a browser's record functionality or an audio capture tool
// 3. Save the output as assets/sounds/stone-drop.mp3
// 4. Or simply download a free "wood knock" or "stone drop" sound effect from a sound library

console.log("This is a reference script for stone drop sound generation.");
console.log("Please obtain a stone drop sound effect and save it as 'stone-drop.mp3'"); 