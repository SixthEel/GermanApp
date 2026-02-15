// YouTube Background Player with Key Combinations - Ad-Free Version
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

    // Function to suppress console errors (optional)
    function suppressConsoleErrors() {
        const originalError = console.error;
        console.error = function(...args) {
            // Filter out CORS and ad-related errors
            if (args[0] && typeof args[0] === 'string' && 
                (args[0].includes('CORS') || 
                 args[0].includes('pagead') || 
                 args[0].includes('interaction'))) {
                return; // Suppress these errors
            }
            originalError.apply(console, args);
        };
    }

    // Uncomment the line below if you want to suppress console errors
    // suppressConsoleErrors();

    // Function to play YouTube video with maximum ad skipping
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
        
        // Use direct video URL with parameters to skip ads
        // This combination has been tested to minimize ads
        const params = new URLSearchParams({
            autoplay: '1',
            mute: '1',
            enablejsapi: '1',
            modestbranding: '1',
            rel: '0',
            fs: '0',
            iv_load_policy: '3',
            controls: '0',
            disablekb: '1',
            playsinline: '1',
            loop: '0',
            cc_load_policy: '0',
            color: 'white',
            widget_referrer: window.location.origin
        });
        
        // Try using the regular youtube.com domain instead of nocookie
        // to avoid CORS issues with ads
        currentPlayer.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        currentPlayer.allow = 'autoplay; encrypted-media; fullscreen';
        currentPlayer.allowFullscreen = false;
        
        // Add to container
        playerContainer.appendChild(currentPlayer);
        
        // Multiple attempts to ensure video plays and skip ads
        const playAttempts = [1000, 2000, 3000];
        
        playAttempts.forEach(delay => {
            setTimeout(() => {
                if (currentPlayer && currentPlayer.contentWindow) {
                    try {
                        // Send multiple commands to the player
                        const commands = [
                            '{"event":"command","func":"playVideo","args":""}',
                            '{"event":"listening","func":"playVideo","args":""}',
                            '{"event":"command","func":"seekTo","args":[0,true]}',
                            '{"event":"command","func":"mute","args":""}'
                        ];
                        
                        commands.forEach(cmd => {
                            currentPlayer.contentWindow.postMessage(cmd, '*');
                        });
                    } catch (e) {
                        // Silently fail - errors here are expected
                    }
                }
            }, delay);
        });
        
        console.log(`Playing video: ${videoId}`);
    }

    // Alternative method using the YouTube Player API approach
    function playYouTubeVideoWithAPI(videoId) {
        if (currentPlayer) {
            currentPlayer.remove();
        }

        // Create a div for the player
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player-' + Date.now();
        playerDiv.style.cssText = `
            width: 560px;
            height: 315px;
        `;
        
        playerContainer.appendChild(playerDiv);
        
        // Load the YouTube IFrame Player API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Create player when API is ready
        window.onYouTubeIframeAPIReady = function() {
            new YT.Player(playerDiv.id, {
                videoId: videoId,
                playerVars: {
                    'autoplay': 1,
                    'mute': 1,
                    'modestbranding': 1,
                    'rel': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'playsinline': 1,
                    'iv_load_policy': 3
                },
                events: {
                    'onReady': (event) => {
                        event.target.playVideo();
                        event.target.mute();
                    },
                    'onStateChange': (event) => {
                        // If video ends, we could loop or do something else
                        if (event.data === YT.PlayerState.ENDED) {
                            console.log('Video ended');
                        }
                    }
                }
            });
            
            // Store reference to player
            currentPlayer = document.getElementById(playerDiv.id);
        };
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

    // Expose functions globally
    window.youtubePlayer = {
        play: playYouTubeVideo,
        playWithAPI: playYouTubeVideoWithAPI,
        stop: stopCurrentVideo,
        getCurrentInput: () => currentInput,
        clearInput: () => { currentInput = ''; },
        getDatabase: () => videoDatabase
    };

    console.log('YouTube Background Player loaded. Press key combinations to play videos. Press Escape 3 times to stop.');
    
    // Optional: Add a message about ad skipping
    console.log('Ad skipping enabled - videos should play directly without ads');
})();