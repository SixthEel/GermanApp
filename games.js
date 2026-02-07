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
        // If a game is active, maybe restart it? For now, we'll let the user restart manually.
        console.log("GameManager received " + words.length + " words.");
    }

    startGame(type) {
        if (this.words.length < 4 && type !== 'flashcards') {
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
        }
    }
}

class FlashcardGame {
    constructor(container, words) {
        this.container = container;
        this.words = this.shuffle(words); // Shuffle for variety
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

        // Keyboard support
        document.addEventListener('keydown', this.handleKey.bind(this));

        this.updateCard();
    }

    handleKey(e) {
        if (!document.getElementById('flashcard')) return; // Ensure game is active
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

        // Short delay to allow flip back animation if proceeding
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
            // Loop or finish? Let's loop.
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
        // Pick one correct word
        const target = this.allWords[Math.floor(Math.random() * this.allWords.length)];

        // Pick 3 distractors
        let distractors = [];
        while (distractors.length < 3) {
            const w = this.allWords[Math.floor(Math.random() * this.allWords.length)];
            if (w !== target && !distractors.includes(w)) {
                distractors.push(w);
            }
        }

        // Combine and shuffle options
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

        // Reveal all
        this.container.querySelectorAll('.quiz-btn').forEach(b => {
            if (b.dataset.answer === 'correct') b.classList.add('correct');
            else b.classList.add('wrong');
            b.disabled = true;
        });

        if (isCorrect) this.score++;

        // Next question delay
        setTimeout(() => this.nextQuestion(), 1500);
    }
}

class MemoryGame {
    constructor(container, words) {
        this.container = container;
        // Take 8 random words
        const gameWords = [...words].sort(() => Math.random() - 0.5).slice(0, 8);
        this.cards = [];

        // Create pairs
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

        // Store confirmation elements for later use
        this.confirmationDialog = document.getElementById('match-confirmation');
        this.confirmYesBtn = document.getElementById('confirm-yes');
        this.confirmNoBtn = document.getElementById('confirm-no');

        // Setup confirmation button handlers
        this.confirmYesBtn.addEventListener('click', () => this.handleUserConfirmation(true));
        this.confirmNoBtn.addEventListener('click', () => this.handleUserConfirmation(false));
    }

    handleCardClick(card) {
        if (this.isLocked) return;
        if (card.classList.contains('matched')) return;
        if (this.flipped.includes(card)) return;

        // Reveal card
        card.classList.remove('hidden-card');
        this.flipped.push(card);

        if (this.flipped.length === 2) {
            this.showConfirmationDialog();
        }
    }

    showConfirmationDialog() {
        this.isLocked = true;
        this.confirmationDialog.classList.remove('hidden');
        
        // Show what cards are being compared
        const [card1, card2] = this.flipped;
        const index1 = parseInt(card1.dataset.index);
        const index2 = parseInt(card2.dataset.index);
        const data1 = this.cards[index1];
        const data2 = this.cards[index2];
        
        // Update the confirmation message to show the words being compared
        const message = this.confirmationDialog.querySelector('.confirmation-message');
        message.innerHTML = `Do these cards match?<br>
                            <small style="color: #b2bec3; margin-top: 0.5rem; display: block;">
                            <strong>${data1.text}</strong> ↔ <strong>${data2.text}</strong>
                            </small>`;
        
        // Focus the "Yes" button for accessibility
        this.confirmYesBtn.focus();
    }

    hideConfirmationDialog() {
        this.confirmationDialog.classList.add('hidden');
        // Reset message
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
            // User says match and it's correct - mark as matched
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matched.push(card1, card2);
            this.flipped = [];
            this.isLocked = false;
            
            // Check for victory
            if (this.matched.length === this.cards.length) {
                setTimeout(() => alert("Victory! Well done!"), 500);
            }
        } else if (userSaysMatch && !actualMatch) {
            // User says match but it's wrong - flash red and hide
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
            // User says no match - just hide the cards
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
        // Focus input
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

// Attach to window
window.GameManager = new GameManager();
