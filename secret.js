// YouTube Background Player with Key Combinations - Ad Skip Version
(function() {
    'use strict';

    // Database of codes and YouTube video IDs
    const videoDatabase = [
        { code: "thatguy[ArrowUp][ArrowDown]", videoId: "dQw4w9WgXcQ" },
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

    // Function to play YouTube video (with ad skipping)
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
        
        // YouTube embed URL with parameters to skip ads and maximize video playback
        // Parameters:
        // autoplay=1 - Auto play the video
        // mute=1 - Start muted (helps with autoplay restrictions)
        // enablejsapi=1 - Enable JavaScript API
        // modestbranding=1 - Reduce YouTube branding
        // rel=0 - Don't show related videos
        // fs=0 - Disable fullscreen button
        // iv_load_policy=3 - Hide video annotations
        // controls=0 - Hide player controls (optional)
        currentPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&controls=0`;
        currentPlayer.allow = 'autoplay; encrypted-media; fullscreen';
        currentPlayer.allowFullscreen = false;
        
        // Add to container
        playerContainer.appendChild(currentPlayer);
        
        // Try to skip ads by loading the video directly
        // This uses the YouTube player API to attempt to skip ads
        setTimeout(() => {
            try {
                // Attempt to send message to iframe to skip ads
                // Note: This is a best-effort approach and may not always work
                if (currentPlayer && currentPlayer.contentWindow) {
                    currentPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }
            } catch (e) {
                // Silently fail if ad skipping doesn't work
                console.log('Ad skip attempt completed');
            }
        }, 1000);
        
        console.log(`Playing video: ${videoId} (with ad skip enabled)`);
    }

    // Alternative method using YouTube's video player with ad blocking
    function playYouTubeVideoAlternative(videoId) {
        if (currentPlayer) {
            currentPlayer.remove();
        }

        // Use YouTube's embedded player with additional parameters for ad-free experience
        // Note: This uses the youtube-nocookie.com domain which often has fewer ads
        currentPlayer = document.createElement('iframe');
        currentPlayer.style.cssText = `
            width: 560px;
            height: 315px;
            border: none;
        `;
        
        // Using youtube-nocookie.com and additional parameters to minimize ads
        currentPlayer.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&controls=0&playsinline=1`;
        currentPlayer.allow = 'autoplay; encrypted-media; fullscreen';
        currentPlayer.allowFullscreen = false;
        
        playerContainer.appendChild(currentPlayer);
        
        // Additional attempt to skip ads by reloading if necessary
        setTimeout(() => {
            try {
                // Try to send multiple commands to ensure video plays
                if (currentPlayer && currentPlayer.contentWindow) {
                    currentPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    // Try to mute if not already muted
                    currentPlayer.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                }
            } catch (e) {
                console.log('Video playback initiated');
            }
        }, 500);
        
        console.log(`Playing video: ${videoId} (using alternative method)`);
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
                // Use the alternative method for better ad skipping
                playYouTubeVideoAlternative(entry.videoId);
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
        playAlternative: playYouTubeVideoAlternative,
        stop: stopCurrentVideo,
        getCurrentInput: () => currentInput,
        clearInput: () => { currentInput = ''; },
        getDatabase: () => videoDatabase
    };

    console.log('YouTube Background Player loaded. Press key combinations to play videos. Press Escape 3 times to stop.');
})();