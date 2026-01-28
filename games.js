/**
 * Game Logic for LernDeutsch
 */

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
            <div class="memory-grid">
                ${this.cards.map((card, index) => `
                    <div class="memory-card hidden-card" data-index="${index}">
                        <span>${card.text}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.handleCardClick(card));
        });
    }

    handleCardClick(card) {
        if (this.isLocked) return;
        if (card.classList.contains('matched')) return;
        if (this.flipped.includes(card)) return;

        // Reveal
        card.classList.remove('hidden-card');
        this.flipped.push(card);

        if (this.flipped.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isLocked = true;
        const [c1, c2] = this.flipped;
        const i1 = c1.dataset.index;
        const i2 = c2.dataset.index;
        const d1 = this.cards[i1];
        const d2 = this.cards[i2];

        if (d1.id === d2.id) {
            // Match
            c1.classList.add('matched');
            c2.classList.add('matched');
            this.matched.push(c1, c2);
            this.flipped = [];
            this.isLocked = false;

            if (this.matched.length === this.cards.length) {
                setTimeout(() => alert("Victory! Well done!"), 500);
            }
        } else {
            // Mismatch
            c1.classList.add('wrong');
            c2.classList.add('wrong');
            setTimeout(() => {
                c1.classList.add('hidden-card');
                c2.classList.add('hidden-card');
                c1.classList.remove('wrong');
                c2.classList.remove('wrong');
                this.flipped = [];
                this.isLocked = false;
            }, 1000);
        }
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
