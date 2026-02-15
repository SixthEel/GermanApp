// YouTube Background Player with Key Combinations
(function() {
    'use strict';

    // Database of codes and YouTube video IDs
    const videoDatabase = [
        { code: "thatguy[ArrowUp][ArrowDown]", videoId: "dQw4w9WgXcQ" },
        { code: "music[Space][Enter]", videoId: "jNQT7yQcJyI" },
        { code: "play[Tab][ArrowLeft][ArrowRight]", videoId: "9bZkp7q19f0" },
        { code: "secret123", videoId: "kJQP7kiw5Fk" },
        { code: "chill[ArrowDown][ArrowDown][Space]", videoId: "5qap5aO4i9A" },
        // Add more codes and video IDs here
    ];

    // Current input tracking
    let currentInput = '';
    let inputTimer = null;
    
    // Create hidden iframe container
    const playerContainer = document.createElement('div');
    playerContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
        z-index: -9999;
    `;
    playerContainer.id = 'hidden-youtube-player-container';
    
    // Add container to body when DOM is ready
    if (document.body) {
        document.body.appendChild(playerContainer);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(playerContainer);
        });
    }

    // Current playing iframe
    let currentPlayer = null;

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

    // Function to play YouTube video
    function playYouTubeVideo(videoId) {
        // Remove existing player if any
        if (currentPlayer) {
            currentPlayer.remove();
        }

        // Create new iframe
        currentPlayer = document.createElement('iframe');
        currentPlayer.style.cssText = `
            width: 560px;
            height: 315px;
            border: none;
        `;
        
        // YouTube embed URL with autoplay
        currentPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
        currentPlayer.allow = 'autoplay; encrypted-media';
        
        // Add to container
        playerContainer.appendChild(currentPlayer);
        
        console.log(`Playing video: ${videoId}`);
    }

    // Function to stop current video
    function stopCurrentVideo() {
        if (currentPlayer) {
            currentPlayer.remove();
            currentPlayer = null;
            console.log('Video stopped');
        }
    }

    // Function to check if input matches any code
    function checkForMatch(input) {
        for (const entry of videoDatabase) {
            if (input.endsWith(entry.code)) {
                playYouTubeVideo(entry.videoId);
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
        }, 3000); // Reset after 3 seconds of no input
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

        // Limit input length to prevent memory issues
        if (currentInput.length > 100) {
            currentInput = currentInput.slice(-50);
        }

        // Debug logging (remove in production)
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
                stopCurrentVideo();
                escapeCount = 0;
            }
            
            escapeTimer = setTimeout(() => {
                escapeCount = 0;
            }, 1000);
        }
    });

    // Expose functions globally for testing (optional)
    window.youtubePlayer = {
        play: playYouTubeVideo,
        stop: stopCurrentVideo,
        getCurrentInput: () => currentInput,
        clearInput: () => { currentInput = ''; },
        getDatabase: () => videoDatabase
    };

    console.log('YouTube Background Player loaded. Press key combinations to play videos. Press Escape 3 times to stop.');
})();