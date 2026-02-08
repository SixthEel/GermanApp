/**
 * Konami Code Easter Egg
 * Works everywhere, anytime in the LernDeutsch app
 * Up Up Down Down Left Right Left Right B A
 */

(function() {
    'use strict';

    // Configuration
    const YOUTUBE_VIDEO_ID = 'FlD6pELdJY4'; // Your YouTube video ID
    
    // Konami code sequence
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'b', 'a'
    ];
    
    let sequencePointer = 0;
    let player = null;
    let isInitialized = false;

    // Initialize the Konami code system
    function initKonami() {
        if (isInitialized) return;
        
        console.log('🎮 Konami code system initialized');
        
        // Create invisible YouTube player container if it doesn't exist
        if (!document.getElementById('konami-player-container')) {
            const container = document.createElement('div');
            container.id = 'konami-player-container';
            container.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 1px;
                height: 1px;
                overflow: hidden;
                pointer-events: none;
                opacity: 0;
                z-index: -9999;
            `;
            document.body.appendChild(container);
        }
        
        // Load YouTube API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }
        
        // Wait for YouTube API
        const checkYouTubeAPI = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(checkYouTubeAPI);
                initializeYouTubePlayer();
            }
        }, 100);
        
        // Set up key detection
        document.addEventListener('keydown', handleKeyPress);
        
        isInitialized = true;
    }

    // Initialize YouTube player
    function initializeYouTubePlayer() {
        try {
            player = new YT.Player('konami-player-container', {
                height: '1',
                width: '1',
                videoId: YOUTUBE_VIDEO_ID,
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'playsinline': 1,
                    'rel': 0,
                    'showinfo': 0
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        } catch (error) {
            console.warn('Could not initialize YouTube player:', error);
        }
    }

    function onPlayerReady(event) {
        console.log('🎵 Konami audio player ready');
        // Set volume to 50%
        event.target.setVolume(50);
    }

    function onPlayerStateChange(event) {
        // Optional: You can add state change handling here
        // For example, automatically pause if user navigates away
        // if (event.data === YT.PlayerState.PLAYING) {
        //     // Audio is playing
        // }
    }

    // Handle key presses for Konami code
    function handleKeyPress(event) {
        // Normalize the key (lowercase for letters)
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        const targetKey = konamiSequence[sequencePointer];
        
        // Handle letter keys (case-insensitive)
        const isLetter = targetKey && targetKey.length === 1;
        const isMatch = isLetter 
            ? key.toLowerCase() === targetKey.toLowerCase()
            : key === targetKey;
        
        if (isMatch) {
            sequencePointer++;
            
            // Show visual feedback for each correct key
            showKeyFeedback(key);
            
            if (sequencePointer === konamiSequence.length) {
                // Complete sequence detected!
                showSuccessAnimation();
                toggleAudio();
                sequencePointer = 0;
            }
        } else {
            // Reset sequence on wrong key
            if (sequencePointer > 0) {
                showResetFeedback();
            }
            sequencePointer = 0;
        }
    }

    // Toggle audio play/pause
    function toggleAudio() {
        if (!player || typeof player.getPlayerState !== 'function') {
            console.warn('Audio player not ready yet');
            return;
        }
        
        try {
            const state = player.getPlayerState();
            
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
                showNotification('🎵 Audio paused');
            } else {
                player.playVideo();
                showNotification('🎵 Secret audio activated!');
            }
        } catch (error) {
            console.warn('Could not toggle audio:', error);
        }
    }

    // Visual feedback functions
    function showKeyFeedback(key) {
        // Create a subtle visual feedback
        const feedback = document.createElement('div');
        feedback.textContent = key === 'ArrowUp' ? '' : 
                              key === 'ArrowDown' ? '' : 
                              key === 'ArrowLeft' ? '' : 
                              key === 'ArrowRight' ? '' : 
                              key.toUpperCase();
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 48px;
            color: #10b981;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
            opacity: 0;
            z-index: 10000;
            pointer-events: none;
            transition: all 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        // Animate
        requestAnimationFrame(() => {
            feedback.style.transform = 'translate(-50%, -50%) scale(1)';
            feedback.style.opacity = '1';
        });
        
        // Remove after animation
        setTimeout(() => {
            feedback.style.transform = 'translate(-50%, -50%) scale(0)';
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 300);
    }

    function showResetFeedback() {
        const feedback = document.createElement('div');
        feedback.textContent = '';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 32px;
            opacity: 0;
            z-index: 10000;
            pointer-events: none;
            transition: all 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        requestAnimationFrame(() => {
            feedback.style.transform = 'translate(-50%, -50%) scale(1)';
            feedback.style.opacity = '1';
        });
        
        setTimeout(() => {
            feedback.style.transform = 'translate(-50%, -50%) scale(0)';
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 300);
        }, 300);
    }

    function showSuccessAnimation() {
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.innerHTML = '';
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 80px;
            opacity: 0;
            z-index: 9999;
            pointer-events: none;
            animation: celebration 1.5s ease-out;
        `;
        
        // Add CSS for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebration {
                0% { opacity: 0; transform: scale(0.5); }
                20% { opacity: 1; transform: scale(1.2); }
                40% { transform: scale(1); }
                60% { transform: rotate(5deg); }
                80% { transform: rotate(-5deg); }
                100% { opacity: 0; transform: scale(0.8); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
            style.remove();
        }, 1500);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        /*
        notification.style.cssText =
        `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s;
        `
        */
        ;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKonami);
    } else {
        initKonami();
    }

    // Make it accessible globally (optional)
    window.konami = {
        toggle: toggleAudio,
        isActive: () => player && player.getPlayerState() === YT.PlayerState.PLAYING
    };
})();