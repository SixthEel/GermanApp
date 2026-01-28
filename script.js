/**
 * Main Application Script for LernDeutsch
 */

class App {
    constructor() {
        this.data = null;
        this.currentLesson = null;
        this.currentPage = null;
        this.currentWords = [];

        // DOM Elements
        this.lessonSelect = document.getElementById('lessonSelect');
        this.pageSelect = document.getElementById('pageSelect');
        this.wordListContainer = document.getElementById('wordListContainer');
        this.wordCountBadge = document.getElementById('wordCountBadge');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.views = {
            learn: document.getElementById('view-learn'),
            games: document.getElementById('view-games'),
            stats: null // TODO
        };

        this.init();
    }

    async init() {
        console.log("App initializing...");
        // Configuration for database files
        this.dbFiles = [
            'database 1-4.json',
            'database 5-10.json'
            // Add more files here as needed, e.g. 'database 11-20.json'
        ];

        await this.loadData();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            const promises = this.dbFiles.map(file => fetch(file).then(res => {
                if (!res.ok) throw new Error(`Failed to load ${file}`);
                return res.json();
            }).catch(err => {
                console.warn(err);
                return null; // Return null on failure to allow partial loading
            }));

            const results = await Promise.all(promises);

            // Merge results
            const validData = results.filter(data => data && data.lessons);
            if (validData.length === 0) {
                throw new Error("No valid database files loaded.");
            }

            // Combine lessons
            let allLessons = [];
            validData.forEach(d => {
                allLessons = allLessons.concat(d.lessons);
            });

            // Sort by lesson number
            allLessons.sort((a, b) => (a.number || 0) - (b.number || 0));

            this.data = { lessons: allLessons };
            console.log("Joined Data:", this.data);

            this.populateLessonSelect();
        } catch (error) {
            console.error("Failed to load databases:", error);
            this.wordListContainer.innerHTML = `
                <div class="empty-state glass-panel">
                    <h2 style="color: #ff7675">Error Loading Data</h2>
                    <p>Could not load database files.</p>
                    <pre>${error.message}</pre>
                </div>
            `;
        }
    }

    populateLessonSelect() {
        if (!this.data || !this.data.lessons) return;

        this.lessonSelect.innerHTML = '<option value="">Select Lesson...</option>';

        this.data.lessons.forEach((lesson) => {
            const option = document.createElement('option');
            // User requested to use the lesson number in the json
            // Since we merged and renumbered, lesson.number is the key.
            option.value = lesson.number;
            option.textContent = `Lesson ${lesson.number}`;
            this.lessonSelect.appendChild(option);
        });
    }

    populatePageSelect(lessonNumber) {
        this.pageSelect.innerHTML = '<option value="">All Pages</option>';
        this.pageSelect.disabled = false;

        // Find lesson by number
        const lesson = this.data.lessons.find(l => l.number == lessonNumber);

        if (!lesson || !lesson.pages) return;

        lesson.pages.forEach((page, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Page ${page.number}`; // Assuming page has a number property
            this.pageSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewName = btn.dataset.view;
                this.switchView(viewName);
            });
        });

        // Lesson Selection
        this.lessonSelect.addEventListener('change', (e) => {
            const lessonNum = e.target.value;
            if (lessonNum !== "") {
                this.currentLesson = this.data.lessons.find(l => l.number == lessonNum);
                this.populatePageSelect(lessonNum);
                this.currentPage = null; // Reset page
                this.updateCurrentWords();
            } else {
                this.currentLesson = null;
                this.pageSelect.disabled = true;
                this.pageSelect.innerHTML = '<option value="">All Pages</option>';
                this.currentWords = [];
                this.renderWords();
            }
        });

        // Page Selection
        this.pageSelect.addEventListener('change', (e) => {
            const index = e.target.value;
            if (index !== "" && this.currentLesson) {
                this.currentPage = this.currentLesson.pages[index];
            } else {
                this.currentPage = null; // All pages
            }
            this.updateCurrentWords();
        });
    }

    switchView(viewName) {
        // Update Nav
        this.navButtons.forEach(btn => {
            if (btn.dataset.view === viewName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Update Views
        Object.keys(this.views).forEach(key => {
            const view = this.views[key];
            if (!view) return;

            if (key === viewName) {
                view.classList.remove('hidden');
                view.classList.add('active');
            } else {
                view.classList.add('hidden');
                view.classList.remove('active');
            }
        });
    }

    updateCurrentWords() {
        if (!this.currentLesson) {
            this.currentWords = [];
        } else if (this.currentPage) {
            this.currentWords = this.currentPage.words || [];
        } else {
            // Aggregate all words from the lesson
            this.currentWords = this.currentLesson.pages.flatMap(p => p.words || []);
        }

        this.updateStats();
        this.renderWords();

        // Notify Games if they are implemented
        if (window.GameManager) {
            window.GameManager.setWords(this.currentWords);
        }
    }

    updateStats() {
        this.wordCountBadge.textContent = `${this.currentWords.length} Words`;
    }

    renderWords() {
        this.wordListContainer.innerHTML = '';

        if (this.currentWords.length === 0) {
            this.wordListContainer.innerHTML = `
                <div class="empty-state glass-panel">
                    <h2>Select a Lesson</h2>
                    <p>Choose a lesson and page to view vocabulary.</p>
                </div>
            `;
            return;
        }

        this.currentWords.forEach(word => {
            // Check for required fields to avoid empty cards
            const german = word.german || "???";
            const czech = word.czech || "???";
            const example = word.example || "";
            const plural = word.plural ? `(Pl. ${word.plural})` : "";

            const card = document.createElement('div');
            card.className = 'word-card';
            card.innerHTML = `
                <div class="w-german">${german}</div>
                <div class="w-czech">${czech}</div>
                ${plural ? `<div class="w-meta">${plural}</div>` : ''}
                ${example ? `<div class="w-example">"${example}"</div>` : ''}
            `;
            this.wordListContainer.appendChild(card);
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
