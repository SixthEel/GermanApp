// Local Audio Player with Key Combinations
(function() {
    'use strict';

    // Database of codes and local audio filenames
    const audioDatabase = [
        { code: "9mmgobang", audioFile: "Memphis- 9MM Goes Bang! Extended (Lyrics).webm" },
        // Add more codes and audio files here
    ];

    // Current input tracking
    let currentInput = '';
    let inputTimer = null;
    
    // Create hidden audio container
    const audioContainer = document.createElement('div');
    audioContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
        z-index: -9999;
    `;
    audioContainer.id = 'local-audio-player-container';
    
    // Add container to body when DOM is ready
    if (document.body) {
        document.body.appendChild(audioContainer);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(audioContainer);
        });
    }

    // Current playing audio element
    let currentAudio = null;

    // Key mapping for special keys
    const specialKeys = {
        'Enter': '[Enter]',
        ' ': '[Space]',
        'Tab': '[Tab]',
        'ArrowUp': '[ArrowUp]',
        'ArrowDown': '[ArrowDown]',
        'ArrowLeft': '[ArrowLeft]',
        'ArrowRight': '[ArrowRight]',
        'Escape': '[Escape]',
        'Backspace': '[Backspace]',
        'Delete': '[Delete]',
        'Home': '[Home]',
        'End': '[End]',
        'PageUp': '[PageUp]',
        'PageDown': '[PageDown]',
        'Shift': '[Shift]',
        'Control': '[Control]',
        'Alt': '[Alt]',
        'Meta': '[Meta]'
    };

    // Function to play local audio
    function playLocalAudio(audioFile) {
        // Remove existing audio if any
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.remove();
            currentAudio = null;
        }

        // Create new audio element
        currentAudio = document.createElement('audio');
        
        // Set audio source
        currentAudio.src = audioFile;
        currentAudio.controls = false;
        currentAudio.loop = false;
        
        // Add to container
        audioContainer.appendChild(currentAudio);
        
        // Play audio
        currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        
        console.log(`Playing local audio: ${audioFile}`);
    }

    // Function to stop current audio
    function stopCurrentAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.remove();
            currentAudio = null;
            console.log('Audio stopped');
        }
    }

    // Function to check if input matches any code
    function checkForMatch(input) {
        for (const entry of audioDatabase) {
            if (input.endsWith(entry.code)) {
                playLocalAudio(entry.audioFile);
                return true;
            }
        }
        return false;
    }

    // Reset input after timeout
    function resetInputTimer() {
        if (inputTimer) {
            clearTimeout(inputTimer);
        }
        inputTimer = setTimeout(() => {
            currentInput = '';
            console.log('Input reset due to timeout');
        }, 3000);
    }

    // Keyboard event listener
    document.addEventListener('keydown', (event) => {
        // Prevent default for special keys to avoid page navigation
        if (specialKeys[event.key]) {
            event.preventDefault();
        }

        // Build the input string
        if (specialKeys[event.key]) {
            currentInput += specialKeys[event.key];
        } else if (event.key.length === 1) {
            // Regular character
            currentInput += event.key.toLowerCase();
        }

        // Reset timer
        resetInputTimer();

        // Check for matches
        if (checkForMatch(currentInput)) {
            currentInput = ''; // Reset after successful match
            clearTimeout(inputTimer);
        }

        // Limit input length
        if (currentInput.length > 100) {
            currentInput = currentInput.slice(-50);
        }

        // Debug logging
        console.log('Current input:', currentInput);
    });

    // Add stop command - press Escape 3 times quickly
    let escapeCount = 0;
    let escapeTimer = null;
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            escapeCount++;
            
            if (escapeTimer) {
                clearTimeout(escapeTimer);
            }
            
            if (escapeCount >= 3) {
                stopCurrentAudio();
                escapeCount = 0;
            }
            
            escapeTimer = setTimeout(() => {
                escapeCount = 0;
            }, 1000);
        }
    });

    // Add volume control (optional)
    document.addEventListener('keydown', (event) => {
        // Ctrl + Up Arrow to increase volume
        if (event.ctrlKey && event.key === 'ArrowUp' && currentAudio) {
            event.preventDefault();
            if (currentAudio.volume < 1) {
                currentAudio.volume = Math.min(1, currentAudio.volume + 0.1);
                console.log(`Volume: ${Math.round(currentAudio.volume * 100)}%`);
            }
        }
        
        // Ctrl + Down Arrow to decrease volume
        if (event.ctrlKey && event.key === 'ArrowDown' && currentAudio) {
            event.preventDefault();
            if (currentAudio.volume > 0) {
                currentAudio.volume = Math.max(0, currentAudio.volume - 0.1);
                console.log(`Volume: ${Math.round(currentAudio.volume * 100)}%`);
            }
        }
        
        // Ctrl + Space to pause/play
        if (event.ctrlKey && event.key === ' ') {
            event.preventDefault();
            if (currentAudio) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    console.log('Play');
                } else {
                    currentAudio.pause();
                    console.log('Pause');
                }
            }
        }
    });

    // Expose functions globally
    window.localAudioPlayer = {
        play: playLocalAudio,
        stop: stopCurrentAudio,
        getCurrentInput: () => currentInput,
        clearInput: () => { currentInput = ''; },
        getDatabase: () => audioDatabase,
        getCurrentAudio: () => currentAudio
    };

    console.log('Local Audio Player loaded. Press key combinations to play local MP3 files. Press Escape 3 times to stop.');
    console.log('Make sure your MP3 files are in the same directory as your HTML file!');
    console.log('Controls: Ctrl+Up = Volume Up, Ctrl+Down = Volume Down, Ctrl+Space = Play/Pause');
})();