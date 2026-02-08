/*  Game Logic for LernDeutsch  */

class GameManager {
    constructor() {
        this.words = [];
        this.activeGame = null;
        this.container = document.getElementById('activeGameContainer');
        this.viewport = document.getElementById('gameViewport');
        this.gamesGrid = document.querySelector('.games-grid');
        this.backBtn = document.querySelector('.back-btn');

        this.init();
    }

    init() {
        // Game Selection
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.game;
                this.startGame(gameType);
            });
        });

        // Back Button
        this.backBtn.addEventListener('click', () => {
            this.stopGame();
        });
    }

    setWords(words) {
        this.words = words;
        console.log("GameManager received " + words.length + " words.");
    }

    startGame(type) {
        if (this.words.length < 4 && type !== 'flashcards' && type !== 'snake') {
            alert("Not enough words for this game! Please select a lesson with more words.");
            return;
        }

        this.gamesGrid.classList.add('hidden');
        this.container.classList.remove('hidden');
        this.activeGame = type;
        this.renderGame(type);
    }

    stopGame() {
        this.activeGame = null;
        this.container.classList.add('hidden');
        this.gamesGrid.classList.remove('hidden');
        this.viewport.innerHTML = '';
    }

    renderGame(type) {
        this.viewport.innerHTML = '';
        switch (type) {
            case 'flashcards':
                new FlashcardGame(this.viewport, this.words);
                break;
            case 'quiz':
                new QuizGame(this.viewport, this.words);
                break;
            case 'memory':
                new MemoryGame(this.viewport, this.words);
                break;
            case 'typing':
                new TypingGame(this.viewport, this.words);
                break;
            case 'snake':
                new SnakeGame(this.viewport, this.words);
                break;
        }
    }
}

class FlashcardGame {
    constructor(container, words) {
        this.container = container;
        this.words = this.shuffle(words);
        this.currentIndex = 0;
        this.isFlipped = false;

        this.render();
    }

    shuffle(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    render() {
        this.container.innerHTML = `
            <div class="flashcard-container">
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <span id="fc-front-text"></span>
                        </div>
                        <div class="flashcard-back">
                            <span id="fc-back-text"></span>
                            <small id="fc-example"></small>
                        </div>
                    </div>
                </div>
                <div class="game-controls" style="justify-content: center;">
                    <button class="game-btn secondary" id="prevBtn">← Previous</button>
                    <button class="game-btn" id="nextBtn">Next →</button>
                </div>
                <div style="text-align: center; margin-top: 1rem; color: #b2bec3;">
                    <span id="fc-counter"></span>
                </div>
            </div>
        `;

        this.card = document.getElementById('flashcard');
        this.frontText = document.getElementById('fc-front-text');
        this.backText = document.getElementById('fc-back-text');
        this.exampleText = document.getElementById('fc-example');
        this.counter = document.getElementById('fc-counter');

        this.card.addEventListener('click', () => this.flip());
        document.getElementById('prevBtn').addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
        document.getElementById('nextBtn').addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

        document.addEventListener('keydown', this.handleKey.bind(this));

        this.updateCard();
    }

    handleKey(e) {
        if (!document.getElementById('flashcard')) return;
        if (e.key === 'ArrowRight') this.next();
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === ' ' || e.key === 'Enter') this.flip();
    }

    flip() {
        this.isFlipped = !this.isFlipped;
        this.card.classList.toggle('flipped', this.isFlipped);
    }

    updateCard() {
        const word = this.words[this.currentIndex];
        this.isFlipped = false;
        this.card.classList.remove('flipped');

        setTimeout(() => {
            this.frontText.textContent = word.german;
            this.backText.textContent = word.czech;
            this.exampleText.textContent = word.example || "";
            this.counter.textContent = `${this.currentIndex + 1} / ${this.words.length}`;
        }, 150);
    }

    next() {
        if (this.currentIndex < this.words.length - 1) {
            this.currentIndex++;
            this.updateCard();
        } else {
            this.currentIndex = 0;
            this.updateCard();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCard();
        }
    }
}

class QuizGame {
    constructor(container, words) {
        this.container = container;
        this.allWords = words;
        this.score = 0;
        this.questionCount = 0;

        this.nextQuestion();
    }

    nextQuestion() {
        this.questionCount++;
        const target = this.allWords[Math.floor(Math.random() * this.allWords.length)];

        let distractors = [];
        while (distractors.length < 3) {
            const w = this.allWords[Math.floor(Math.random() * this.allWords.length)];
            if (w !== target && !distractors.includes(w)) {
                distractors.push(w);
            }
        }

        const options = [...distractors, target].sort(() => Math.random() - 0.5);

        this.render(target, options);
    }

    render(target, options) {
        this.container.innerHTML = `
            <div class="quiz-container">
                <div style="margin-bottom: 1rem;">Score: ${this.score}</div>
                <div class="quiz-question">${target.czech}</div>
                <div class="quiz-options">
                    ${options.map(opt => `
                        <button class="quiz-btn" data-answer="${opt === target ? 'correct' : 'wrong'}">
                            ${opt.german}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e, btn));
        });
    }

    handleAnswer(e, btn) {
        const isCorrect = btn.dataset.answer === 'correct';

        this.container.querySelectorAll('.quiz-btn').forEach(b => {
            if (b.dataset.answer === 'correct') b.classList.add('correct');
            else b.classList.add('wrong');
            b.disabled = true;
        });

        if (isCorrect) this.score++;

        setTimeout(() => this.nextQuestion(), 1500);
    }
}

class MemoryGame {
    constructor(container, words) {
        this.container = container;
        const gameWords = [...words].sort(() => Math.random() - 0.5).slice(0, 8);
        this.cards = [];

        gameWords.forEach(w => {
            this.cards.push({ id: w.german, text: w.german, type: 'de' });
            this.cards.push({ id: w.german, text: w.czech, type: 'cz' });
        });

        this.cards.sort(() => Math.random() - 0.5);

        this.flipped = [];
        this.matched = [];
        this.isLocked = false;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="memory-container">
                <div class="memory-grid">
                    ${this.cards.map((card, index) => `
                        <div class="memory-card hidden-card" data-index="${index}">
                            <span>${card.text}</span>
                        </div>
                    `).join('')}
                </div>
                <div id="match-confirmation" class="confirmation-dialog hidden">
                    <div class="confirmation-message">Passen die Karten zusammen?</div>
                    <div class="confirmation-buttons">
                        <button class="game-btn secondary" id="confirm-no">No</button>
                        <button class="game-btn" id="confirm-yes">Yes</button>
                    </div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.handleCardClick(card));
        });

        this.confirmationDialog = document.getElementById('match-confirmation');
        this.confirmYesBtn = document.getElementById('confirm-yes');
        this.confirmNoBtn = document.getElementById('confirm-no');

        this.confirmYesBtn.addEventListener('click', () => this.handleUserConfirmation(true));
        this.confirmNoBtn.addEventListener('click', () => this.handleUserConfirmation(false));
    }

    handleCardClick(card) {
        if (this.isLocked) return;
        if (card.classList.contains('matched')) return;
        if (this.flipped.includes(card)) return;

        card.classList.remove('hidden-card');
        this.flipped.push(card);

        if (this.flipped.length === 2) {
            this.showConfirmationDialog();
        }
    }

    showConfirmationDialog() {
        this.isLocked = true;
        this.confirmationDialog.classList.remove('hidden');
        
        const [card1, card2] = this.flipped;
        const index1 = parseInt(card1.dataset.index);
        const index2 = parseInt(card2.dataset.index);
        const data1 = this.cards[index1];
        const data2 = this.cards[index2];
        
        const message = this.confirmationDialog.querySelector('.confirmation-message');
        message.innerHTML = `Do these cards match?<br>
                            <small style="color: #b2bec3; margin-top: 0.5rem; display: block;">
                            <strong>${data1.text}</strong> ↔ <strong>${data2.text}</strong>
                            </small>`;
        
        this.confirmYesBtn.focus();
    }

    hideConfirmationDialog() {
        this.confirmationDialog.classList.add('hidden');
        const message = this.confirmationDialog.querySelector('.confirmation-message');
        message.innerHTML = 'Do these cards match?';
    }

    handleUserConfirmation(userSaysMatch) {
        const [card1, card2] = this.flipped;
        const index1 = parseInt(card1.dataset.index);
        const index2 = parseInt(card2.dataset.index);
        const data1 = this.cards[index1];
        const data2 = this.cards[index2];
        
        const actualMatch = data1.id === data2.id;

        if (userSaysMatch && actualMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matched.push(card1, card2);
            this.flipped = [];
            this.isLocked = false;
            
            if (this.matched.length === this.cards.length) {
                setTimeout(() => alert("Victory! Well done!"), 500);
            }
        } else if (userSaysMatch && !actualMatch) {
            card1.classList.add('wrong-flash');
            card2.classList.add('wrong-flash');
            
            setTimeout(() => {
                card1.classList.remove('wrong-flash');
                card2.classList.remove('wrong-flash');
                card1.classList.add('hidden-card');
                card2.classList.add('hidden-card');
                this.flipped = [];
                this.isLocked = false;
            }, 1000);
        } else {
            setTimeout(() => {
                card1.classList.add('hidden-card');
                card2.classList.add('hidden-card');
                this.flipped = [];
                this.isLocked = false;
            }, 300);
        }
        
        this.hideConfirmationDialog();
    }
}

class TypingGame {
    constructor(container, words) {
        this.container = container;
        this.words = words;
        this.currentWord = null;
        this.streak = 0;

        this.nextWord();
    }

    nextWord() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.render();
        setTimeout(() => this.container.querySelector('input').focus(), 10);
    }

    render() {
        this.container.innerHTML = `
            <div class="typing-container">
                <div style="margin-bottom: 2rem;">Streak: <span style="color: var(--secondary); font-size: 1.5rem;">${this.streak}</span></div>
                <h2 style="margin-bottom: 1rem;">Translate to German:</h2>
                <div class="quiz-question">${this.currentWord.czech}</div>
                <div class="feedback-msg"></div>
                <input type="text" class="typing-input" placeholder="Type German word..." autocomplete="off">
                <button class="game-btn" id="checkBtn">Check</button>
                <div style="margin-top: 1rem;">
                    <button class="game-btn secondary" id="hintBtn" style="font-size: 0.8rem; padding: 0.5rem 1rem;">Hint?</button>
                </div>
            </div>
        `;

        const input = this.container.querySelector('input');
        const checkBtn = this.container.querySelector('#checkBtn');
        const hintBtn = this.container.querySelector('#hintBtn');

        const check = () => {
            const val = input.value.trim();
            if (val.toLowerCase() === this.currentWord.german.toLowerCase()) {
                this.showFeedback("Correct!", true);
                this.streak++;
                setTimeout(() => this.nextWord(), 1000);
            } else {
                this.showFeedback(`Incorrect. Answer: ${this.currentWord.german}`, false);
                this.streak = 0;
            }
        };

        checkBtn.addEventListener('click', check);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') check();
        });

        hintBtn.addEventListener('click', () => {
            input.value = this.currentWord.german.substring(0, 3) + "...";
            input.focus();
        });
    }

    showFeedback(msg, isSuccess) {
        const el = this.container.querySelector('.feedback-msg');
        el.textContent = msg;
        el.style.color = isSuccess ? '#00b894' : '#ff7675';
    }
}

// NEW: Snake Game Class
class SnakeGame {
    constructor(container, words) {
        this.container = container;
        this.words = words;
        this.game = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="snake-game-container">
                <div class="snake-header">
                    <div class="snake-stats">
                        <div>Score: <span id="snakeScore">0</span></div>
                        <div>High Score: <span id="snakeHighScore">0</span></div>
                    </div>
                    <div class="snake-word-display">
                        <p class="snake-word-label">Translate this word</p>
                        <h1 id="snakeTargetWord" class="snake-target-word">Snake Deutsch</h1>
                    </div>
                </div>

                <div class="snake-game-area" id="snakeContainer">
                    <div class="snake-grid-background" id="snakeGridBackground"></div>
                    
                    <div id="snakeOverlay" class="snake-overlay">
                        <h2 id="snakeOverlayTitle">Ready to Learn?</h2>
                        <p>
                            Control the snake with arrow keys. Collect the correct Czech translation for the German word.
                            <br/><span class="snake-warning-text">Wrong words shorten your snake!</span>
                        </p>
                        <button id="snakeOverlayBtn" class="snake-btn">Start Game</button>
                    </div>
                </div>
                
                <div class="snake-footer">
                    Tip: Green segments are safe. Red head is dangerous.
                </div>
            </div>
        `;

        // Initialize the Snake game with the current words
        this.game = new SnakeGameLogic(
            this.words,
            document.getElementById('snakeContainer'),
            document.getElementById('snakeGridBackground'),
            document.getElementById('snakeScore'),
            document.getElementById('snakeHighScore'),
            document.getElementById('snakeTargetWord'),
            document.getElementById('snakeOverlay'),
            document.getElementById('snakeOverlayTitle'),
            document.getElementById('snakeOverlayBtn')
        );
    }
}

// Snake Game Logic (adapted from main.js)
// NEW: Snake Game Class
class SnakeGame {
    constructor(container, words) {
        this.container = container;
        this.words = words;
        this.game = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="snake-game-container">
                <div class="snake-header">
                    <div class="snake-stats">
                        <div>Score: <span id="snakeScore">0</span></div>
                        <div>Speed: <span id="snakeSpeed">1.0x</span></div>
                        <div>High Score: <span id="snakeHighScore">0</span></div>
                    </div>
                    <div class="snake-word-display">
                        <p class="snake-word-label">Translate this word</p>
                        <h1 id="snakeTargetWord" class="snake-target-word">Snake Deutsch</h1>
                    </div>
                </div>

                <div class="snake-game-area" id="snakeContainer">
                    <div class="snake-grid-background" id="snakeGridBackground"></div>
                    
                    <div id="snakeOverlay" class="snake-overlay">
                        <h2 id="snakeOverlayTitle">Ready to Learn?</h2>
                        <p>
                            Control the snake with arrow keys or WASD. Collect the correct Czech translation for the German word.
                            <br/><span class="snake-warning-text">Wrong words shorten your snake by 3!</span>
                        </p>
                        <button id="snakeOverlayBtn" class="snake-btn">Start Game</button>
                    </div>
                </div>
                
                <div class="snake-footer">
                    <div>Speed increases every 3 correct words</div>
                    <div>Tip: Input buffering allows queued direction changes</div>
                </div>
            </div>
        `;

        // Initialize the Snake game with the current words
        this.game = new SnakeGameLogic(
            this.words,
            document.getElementById('snakeContainer'),
            document.getElementById('snakeGridBackground'),
            document.getElementById('snakeScore'),
            document.getElementById('snakeHighScore'),
            document.getElementById('snakeTargetWord'),
            document.getElementById('snakeOverlay'),
            document.getElementById('snakeOverlayTitle'),
            document.getElementById('snakeOverlayBtn'),
            document.getElementById('snakeSpeed')
        );
    }
}

class SnakeGameLogic {
    constructor(words, container, gridBackground, scoreEl, highScoreEl, targetWordEl, overlay, overlayTitle, overlayBtn, speedEl) {
        this.words = this.convertWordsForSnake(words);
        this.container = container;
        this.gridBackground = gridBackground;
        this.scoreEl = scoreEl;
        this.highScoreEl = highScoreEl;
        this.targetWordEl = targetWordEl;
        this.overlay = overlay;
        this.overlayTitle = overlayTitle;
        this.overlayBtn = overlayBtn;
        this.speedEl = speedEl;
        this.gameType = 'snake'; // Add game type identifier

        this.GRID_SIZE = 16;
        this.BASE_SPEED = 250; // ms per move
        this.currentSpeed = this.BASE_SPEED;
        this.speedMultiplier = 1.0;
        this.wordsCollected = 0;
        
        this.INITIAL_SNAKE = [
            { x: 8, y: 8 },
            { x: 7, y: 8 },
            { x: 6, y: 8 },
        ];
        this.INITIAL_DIRECTION = { x: 1, y: 0 };

        // For smooth movement
        this.snake = this.INITIAL_SNAKE.map(p => ({ 
            x: p.x, 
            y: p.y,
            targetX: p.x,
            targetY: p.y,
            lerpProgress: 1.0
        }));
        
        this.direction = { ...this.INITIAL_DIRECTION };
        this.nextDirection = { ...this.INITIAL_DIRECTION };
        this.inputBuffer = []; // Input buffering queue (max 3 inputs)
        this.MAX_BUFFER_SIZE = 3;
        
        this.status = 'idle';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake-german-highscore') || '0', 10);
        this.targetWord = null;
        this.fieldWords = [];
        this.gameInterval = null;
        
        // For rendering interpolation
        this.lastFrameTime = 0;
        this.animationFrameId = null;

        this.init();
    }

    convertWordsForSnake(words) {
        return words.map(word => ({
            german: word.german,
            english: word.czech
        }));
    }

    init() {
        this.updateUI();
        this.renderGridBackground();
        
        // Add global key listener with game type check
        window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        this.overlayBtn.addEventListener('click', () => this.startGame());

        // Touch support
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        document.addEventListener('touchmove', (e) => {
            if (this.status === 'playing') {
                e.preventDefault();
            }
        }, { passive: false });
    }

    handleGlobalKeyDown(e) {
        // Only process snake controls if snake game is active
        if (this.gameType === 'snake' && this.status === 'playing') {
            this.handleKeyInput(e);
        } else if ((this.status === 'idle' || this.status === 'gameover') && 
                   (e.key === 'Enter' || e.key === ' ')) {
            // Allow start/restart with Enter/Space
            this.startGame();
        }
    }

    handleKeyInput(e) {
        let newDirection = null;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y !== 1) newDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y !== -1) newDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x !== 1) newDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x !== -1) newDirection = { x: 1, y: 0 };
                break;
        }
        
        if (newDirection) {
            // Add to input buffer if not full
            if (this.inputBuffer.length < this.MAX_BUFFER_SIZE) {
                this.inputBuffer.push(newDirection);
            } else {
                // Replace oldest input if buffer is full
                this.inputBuffer.shift();
                this.inputBuffer.push(newDirection);
            }
        }
    }

    processInputBuffer() {
        if (this.inputBuffer.length > 0) {
            const nextDir = this.inputBuffer[0];
            
            // Check if direction change is valid (not opposite of current direction)
            if (this.direction.x !== -nextDir.x || this.direction.y !== -nextDir.y) {
                this.nextDirection = nextDir;
                this.inputBuffer.shift(); // Remove processed input
            } else {
                // If trying to go opposite direction, clear buffer and keep current
                this.inputBuffer = [];
            }
        }
    }

    startGame() {
        if (this.words.length < 5) {
            alert("Need at least 5 words for Snake game! Select a lesson with more words.");
            return;
        }

        this.snake = this.INITIAL_SNAKE.map(p => ({ 
            x: p.x, 
            y: p.y,
            targetX: p.x,
            targetY: p.y,
            lerpProgress: 1.0
        }));
        
        this.direction = { ...this.INITIAL_DIRECTION };
        this.nextDirection = { ...this.INITIAL_DIRECTION };
        this.inputBuffer = [];
        this.score = 0;
        this.wordsCollected = 0;
        this.currentSpeed = this.BASE_SPEED;
        this.speedMultiplier = 1.0;
        this.status = 'playing';
        
        this.updateUI();
        this.generateNewRound();
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        
        this.gameInterval = setInterval(() => this.gameLogicUpdate(), this.currentSpeed);
        this.lastFrameTime = performance.now();
        this.animate();
        
        this.overlay.classList.add('hidden');
    }

    gameLogicUpdate() {
        if (this.status !== 'playing') return;

        this.processInputBuffer();
        this.direction = this.nextDirection;

        const currentHead = this.snake[0];
        
        // Calculate new head position
        const newHead = {
            x: currentHead.targetX + this.direction.x,
            y: currentHead.targetY + this.direction.y,
            targetX: currentHead.targetX + this.direction.x,
            targetY: currentHead.targetY + this.direction.y,
            lerpProgress: 0.0
        };

        // Wall collision
        if (
            newHead.targetX < 0 ||
            newHead.targetX >= this.GRID_SIZE ||
            newHead.targetY < 0 ||
            newHead.targetY >= this.GRID_SIZE
        ) {
            this.gameOver();
            return;
        }

        // Word collision
        const hitWordIndex = this.fieldWords.findIndex(
            w => Math.round(w.position.x) === newHead.targetX && 
                 Math.round(w.position.y) === newHead.targetY
        );

        let isGrowing = false;
        let shouldShrink = false;

        if (hitWordIndex !== -1) {
            const hitWord = this.fieldWords[hitWordIndex];
            if (hitWord.isCorrect) {
                isGrowing = true;
                this.score++;
                this.wordsCollected++;
                
                // Increase speed every 3 words
                if (this.wordsCollected % 3 === 0) {
                    this.increaseSpeed();
                }
            } else {
                shouldShrink = true;
            }
        }

        // Self collision check (using target positions)
        const ignoreTailIndex = isGrowing ? -1 : this.snake.length - 1;
        const isSelfCollision = this.snake.some((segment, index) => {
            if (index === ignoreTailIndex) return false;
            return Math.round(segment.targetX) === newHead.targetX && 
                   Math.round(segment.targetY) === newHead.targetY;
        });

        if (isSelfCollision) {
            this.gameOver();
            return;
        }

        // Update snake with lerp animation
        if (isGrowing) {
            // Add new head, keep all segments
            this.snake.unshift(newHead);
        } else if (shouldShrink) {
            // Move head, then shrink by 3
            let tempSnake = [newHead, ...this.snake];
            
            if (tempSnake.length <= 3) {
                this.gameOver();
                return;
            }
            
            // Remove last 3 segments
            this.snake = tempSnake.slice(0, tempSnake.length - 3);
            this.fieldWords.splice(hitWordIndex, 1);
        } else {
            // Normal movement - update all segments
            for (let i = this.snake.length - 1; i > 0; i--) {
                this.snake[i].targetX = this.snake[i-1].targetX;
                this.snake[i].targetY = this.snake[i-1].targetY;
                this.snake[i].lerpProgress = 0.0;
            }
            
            this.snake[0] = newHead;
        }

        if (isGrowing) {
            this.generateNewRound();
        }

        this.updateUI();
    }

    increaseSpeed() {
        // Increase speed by 15% every 3 words
        this.speedMultiplier *= 0.85; // 15% faster = 85% of previous time
        this.currentSpeed = Math.max(50, Math.floor(this.BASE_SPEED * this.speedMultiplier)); // Minimum 50ms
        
        // Update interval
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => this.gameLogicUpdate(), this.currentSpeed);
        }
        
        // Visual feedback
        this.showSpeedUpEffect();
    }

    showSpeedUpEffect() {
        const effect = document.createElement('div');
        effect.textContent = '⚡ SPEED UP!';
        effect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
            color: #fbbf24;
            text-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
            opacity: 0;
            z-index: 40;
            pointer-events: none;
            animation: speedUpAnim 1s ease-out;
        `;
        
        // Add animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes speedUpAnim {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        
        document.head.appendChild(style);
        this.container.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
            style.remove();
        }, 1000);
    }

    gameOver() {
        this.status = 'gameover';
        clearInterval(this.gameInterval);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake-german-highscore', this.highScore.toString());
        }
        
        this.updateUI();
        this.overlayTitle.innerText = 'Game Over';
        this.overlayBtn.innerText = 'Restart';
        this.overlay.classList.remove('hidden');
    }

    generateNewRound() {
        // Pick a new word
        const randomPair = this.words[Math.floor(Math.random() * this.words.length)];
        this.targetWord = randomPair;

        // Pick 4 wrong words
        const wrongWords = [];
        while (wrongWords.length < 4) {
            const p = this.words[Math.floor(Math.random() * this.words.length)];
            if (p.english !== randomPair.english && !wrongWords.includes(p.english)) {
                wrongWords.push(p.english);
            }
        }

        // Get all possible positions
        const allPositions = [];
        for (let y = 0; y < this.GRID_SIZE; y++) {
            for (let x = 0; x < this.GRID_SIZE; x++) {
                allPositions.push({ x, y });
            }
        }

        // Exclude snake positions and safety zone
        const snakePositions = new Set(this.snake.map(s => 
            `${Math.round(s.targetX)},${Math.round(s.targetY)}`
        ));
        
        const head = this.snake[0];
        const safetyZone = new Set();
        
        // Front 3 cells in current direction
        for (let i = 1; i <= 3; i++) {
            safetyZone.add(`${head.targetX + this.direction.x * i},${head.targetY + this.direction.y * i}`);
        }
        
        // Cells to the sides
        const side1 = { x: head.targetX - this.direction.y, y: head.targetY + this.direction.x };
        const side2 = { x: head.targetX + this.direction.y, y: head.targetY - this.direction.x };
        safetyZone.add(`${side1.x},${side1.y}`);
        safetyZone.add(`${side2.x},${side2.y}`);

        const validPositions = allPositions.filter(p => {
            const key = `${p.x},${p.y}`;
            return !snakePositions.has(key) && !safetyZone.has(key);
        });

        // Shuffle valid positions
        for (let i = validPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validPositions[i], validPositions[j]] = [validPositions[j], validPositions[i]];
        }

        const positions = validPositions.slice(0, 5);

        const wordsToSpawn = [
            { text: randomPair.english, isCorrect: true },
            ...wrongWords.map(w => ({ text: w, isCorrect: false }))
        ];

        // Shuffle words
        for (let i = wordsToSpawn.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordsToSpawn[i], wordsToSpawn[j]] = [wordsToSpawn[j], wordsToSpawn[i]];
        }

        this.fieldWords = wordsToSpawn.map((w, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            text: w.text,
            isCorrect: w.isCorrect,
            position: positions[i] || { x: -1, y: -1 }
        })).filter(w => w.position.x !== -1);
    }

    updateUI() {
        if (this.scoreEl) this.scoreEl.innerText = this.score;
        if (this.highScoreEl) this.highScoreEl.innerText = this.highScore;
        if (this.speedEl) this.speedEl.innerText = `${(1/this.speedMultiplier).toFixed(1)}x`;
        
        if (this.targetWordEl) {
            if (this.status === 'playing' && this.targetWord) {
                this.targetWordEl.innerText = this.targetWord.german;
            } else if (this.status === 'gameover') {
                this.targetWordEl.innerText = 'Game Over';
            } else {
                this.targetWordEl.innerText = 'Snake Deutsch';
            }
        }
    }

    renderGridBackground() {
        this.gridBackground.innerHTML = '';
        
        for (let i = 0; i < this.GRID_SIZE * this.GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'snake-grid-cell';
            this.gridBackground.appendChild(cell);
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame((timestamp) => {
            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            
            // Update lerp progress for all segments
            const lerpSpeed = 0.2; // Adjust this for smoother/faster interpolation
            this.snake.forEach(segment => {
                if (segment.lerpProgress < 1.0) {
                    segment.lerpProgress = Math.min(1.0, segment.lerpProgress + lerpSpeed * (deltaTime / 16.67));
                    
                    // Linear interpolation
                    segment.x = segment.x + (segment.targetX - segment.x) * 0.2;
                    segment.y = segment.y + (segment.targetY - segment.y) * 0.2;
                } else {
                    segment.x = segment.targetX;
                    segment.y = segment.targetY;
                }
            });
            
            this.renderGame();
            this.animate();
        });
    }

    renderGame() {
        const dynamicElements = this.container.querySelectorAll('.snake-segment, .snake-word-item');
        dynamicElements.forEach(el => el.remove());

        // Render Snake with smooth positioning
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const el = document.createElement('div');
            el.className = `snake-segment ${isHead ? 'snake-head' : (index % 2 === 0 ? 'snake-body-even' : 'snake-body-odd')}`;
            
            // Use interpolated positions
            const xPercent = (segment.x / this.GRID_SIZE) * 100;
            const yPercent = (segment.y / this.GRID_SIZE) * 100;
            
            el.style.left = `${xPercent}%`;
            el.style.top = `${yPercent}%`;
            el.style.width = `${100 / this.GRID_SIZE}%`;
            el.style.height = `${100 / this.GRID_SIZE}%`;
            
            // Apply rotation for smoother turns (optional visual enhancement)
            if (index > 0 && index < this.snake.length - 1) {
                const prev = this.snake[index - 1];
                const next = this.snake[index + 1];
                const dx = next.targetX - prev.targetX;
                const dy = next.targetY - prev.targetY;
                
                if (dx !== 0 || dy !== 0) {
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    el.style.transform = `scale(0.95) rotate(${angle}deg)`;
                }
            }
            
            if (isHead) {
                const eye1 = document.createElement('div');
                eye1.className = 'snake-eye';
                const eye2 = document.createElement('div');
                eye2.className = 'snake-eye';
                
                // Position eyes based on direction
                const eyeOffset = 25; // percentage from center
                if (this.direction.x === 1) { // Right
                    eye1.style.right = '15%'; eye1.style.top = '20%';
                    eye2.style.right = '15%'; eye2.style.bottom = '20%';
                } else if (this.direction.x === -1) { // Left
                    eye1.style.left = '15%'; eye1.style.top = '20%';
                    eye2.style.left = '15%'; eye2.style.bottom = '20%';
                } else if (this.direction.y === 1) { // Down
                    eye1.style.right = '20%'; eye1.style.bottom = '15%';
                    eye2.style.left = '20%'; eye2.style.bottom = '15%';
                } else { // Up
                    eye1.style.right = '20%'; eye1.style.top = '15%';
                    eye2.style.left = '20%'; eye2.style.top = '15%';
                }
                
                el.appendChild(eye1);
                el.appendChild(eye2);
            }
            
            this.container.appendChild(el);
        });

        // Render Words
        this.fieldWords.forEach(word => {
            const el = document.createElement('div');
            el.className = 'snake-word-item';
            el.style.left = `${(word.position.x / this.GRID_SIZE) * 100}%`;
            el.style.top = `${(word.position.y / this.GRID_SIZE) * 100}%`;
            el.style.width = `${100 / this.GRID_SIZE}%`;
            el.style.height = `${100 / this.GRID_SIZE}%`;
            
            const tag = document.createElement('div');
            tag.className = 'snake-word-tag';
            tag.innerText = word.text;
            tag.style.opacity = word.isCorrect ? '1' : '0.8';
            tag.style.backgroundColor = word.isCorrect ? 
                'rgba(34, 197, 94, 0.9)' : // Green for correct
                'rgba(239, 68, 68, 0.9)';   // Red for wrong
            
            el.appendChild(tag);
            this.container.appendChild(el);
        });
    }

    handleTouchStart(e) {
        if (e.touches.length > 0) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    }

    handleTouchEnd(e) {
        if (this.status !== 'playing') return;

        if (e.changedTouches.length > 0) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            // Swipe threshold
            if (Math.max(absDx, absDy) < 30) return;
            
            let newDirection = null;
            
            if (absDx > absDy) {
                // Horizontal swipe
                if (dx > 0 && this.direction.x !== -1) {
                    newDirection = { x: 1, y: 0 }; // Right
                } else if (dx < 0 && this.direction.x !== 1) {
                    newDirection = { x: -1, y: 0 }; // Left
                }
            } else {
                // Vertical swipe
                if (dy > 0 && this.direction.y !== -1) {
                    newDirection = { x: 0, y: 1 }; // Down
                } else if (dy < 0 && this.direction.y !== 1) {
                    newDirection = { x: 0, y: -1 }; // Up
                }
            }
            
            if (newDirection) {
                this.inputBuffer.push(newDirection);
            }
        }
    }
}
// Attach to window
window.GameManager = new GameManager();