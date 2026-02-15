class App {
    constructor() {
        this.data = null;
        this.currentWords = [];
        this.selectedLessons = new Set();
        this.selectedPages = new Set();   
        this.isReverseMode = false;

        // DOM Elements
        this.checkboxesLessons = document.getElementById('checkboxes-lessons');
        this.checkboxesPages = document.getElementById('checkboxes-pages');
        this.lessonMultiselect = document.getElementById('lessonMultiselect');
        this.pageMultiselect = document.getElementById('pageMultiselect');
        
        this.reverseModeToggle = document.getElementById('reverseModeToggle');
        
        this.wordListContainer = document.getElementById('wordListContainer');
        this.wordCountBadge = document.getElementById('wordCountBadge');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.views = {
            learn: document.getElementById('view-learn'),
            games: document.getElementById('view-games'),
            stats: null
        };

        this.init();
    }

    async init() {
        console.log("App initializing...");
        this.dbFiles = [
            'database 1-4.json',
            'database 5-10.json',
            'database 11-14.json',
            'database 15-18.json'
        ];

        await this.loadData();
        this.setupEventListeners();
        this.setupMultiselectUI();
    }

    async loadData() {
        try {
            if (typeof DB_DATA !== 'undefined') {
                this.processData([DB_DATA]);
                return;
            }

            const promises = this.dbFiles.map(file => fetch(file).then(res => {
                if (!res.ok) throw new Error(`Failed to load ${file}`);
                return res.json();
            }).catch(err => {
                console.warn(err);
                return null; 
            }));

            const results = await Promise.all(promises);
            this.processData(results);

        } catch (error) {
            console.error("Failed to load databases:", error);
            this.wordListContainer.innerHTML = `
                <div class="empty-state glass-panel">
                    <h2 style="color: #ff7675">Fehler beim Laden</h2>
                    <p>Datenbank konnte nicht geladen werden.</p>
                </div>
            `;
        }
    }

    processData(results) {
        const validData = results.filter(data => data && data.lessons);
        let allLessons = [];
        validData.forEach(d => { allLessons = allLessons.concat(d.lessons); });
        allLessons.sort((a, b) => (a.number || 0) - (b.number || 0));

        this.data = { lessons: allLessons };
        this.populateLessonCheckboxes();
    }

    populateLessonCheckboxes() {
        if (!this.data || !this.data.lessons) return;

        this.checkboxesLessons.innerHTML = '';
        
        // "Alles auswählen"
        const selectAllLabel = document.createElement('label');
        selectAllLabel.innerHTML = `<input type="checkbox" id="selectAllLessons" /> <strong>Alles auswählen</strong>`;
        this.checkboxesLessons.appendChild(selectAllLabel);

        this.data.lessons.forEach((lesson) => {
            const label = document.createElement('label');
            const name = lesson.name ? ` - ${lesson.name}` : '';
            // Jen číslo a jméno
            label.innerHTML = `<input type="checkbox" value="${lesson.number}" class="lesson-cb" /> ${lesson.number}${name}`;
            this.checkboxesLessons.appendChild(label);
        });
    }

    populatePageCheckboxes() {
        this.checkboxesPages.innerHTML = '';
        this.selectedPages.clear();

        let availablePages = [];
        
        this.selectedLessons.forEach(lessonNum => {
            const lesson = this.data.lessons.find(l => l.number == lessonNum);
            if (lesson && lesson.pages) {
                lesson.pages.forEach(p => {
                    availablePages.push({
                        lessonNum: lesson.number,
                        pageNum: p.number,
                        id: `${lesson.number}-${p.number}`
                    });
                });
            }
        });

        if (availablePages.length === 0) {
            this.checkboxesPages.innerHTML = '<label>Wähle zuerst eine Lektion...</label>';
            return;
        }

        const selectAllLabel = document.createElement('label');
        selectAllLabel.innerHTML = `<input type="checkbox" id="selectAllPages" checked /> <strong>Alle Seiten</strong>`;
        this.checkboxesPages.appendChild(selectAllLabel);

        availablePages.forEach(p => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${p.id}" class="page-cb" checked /> Seite ${p.pageNum} <span style="opacity:0.5; font-size:0.8em">(L${p.lessonNum})</span>`;
            this.checkboxesPages.appendChild(label);
            this.selectedPages.add(p.id);
        });

        this.updateCurrentWords();
    }

    setupMultiselectUI() {
        let expandedLessons = false;
        this.lessonMultiselect.querySelector('.selectBox').addEventListener('click', () => {
            if (!expandedLessons) {
                this.lessonMultiselect.classList.add('active');
                expandedLessons = true;
            } else {
                this.lessonMultiselect.classList.remove('active');
                expandedLessons = false;
            }
        });

        let expandedPages = false;
        this.pageMultiselect.querySelector('.selectBox').addEventListener('click', () => {
            if (!expandedPages) {
                this.pageMultiselect.classList.add('active');
                expandedPages = true;
            } else {
                this.pageMultiselect.classList.remove('active');
                expandedPages = false;
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.lessonMultiselect.contains(e.target)) {
                this.lessonMultiselect.classList.remove('active');
                expandedLessons = false;
            }
            if (!this.pageMultiselect.contains(e.target)) {
                this.pageMultiselect.classList.remove('active');
                expandedPages = false;
            }
        });
    }

    setupEventListeners() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewName = btn.dataset.view;
                this.switchView(viewName);
            });
        });

        this.checkboxesLessons.addEventListener('change', (e) => {
            if (e.target.id === 'selectAllLessons') {
                const allCbs = this.checkboxesLessons.querySelectorAll('.lesson-cb');
                allCbs.forEach(cb => {
                    cb.checked = e.target.checked;
                    const val = parseInt(cb.value);
                    if (e.target.checked) this.selectedLessons.add(val);
                    else this.selectedLessons.delete(val);
                });
            } else if (e.target.classList.contains('lesson-cb')) {
                const val = parseInt(e.target.value);
                if (e.target.checked) this.selectedLessons.add(val);
                else this.selectedLessons.delete(val);
                
                const all = this.checkboxesLessons.querySelectorAll('.lesson-cb');
                const checked = this.checkboxesLessons.querySelectorAll('.lesson-cb:checked');
                document.getElementById('selectAllLessons').checked = (all.length === checked.length);
            }
            this.populatePageCheckboxes();
        });

        this.checkboxesPages.addEventListener('change', (e) => {
            if (e.target.id === 'selectAllPages') {
                const allCbs = this.checkboxesPages.querySelectorAll('.page-cb');
                allCbs.forEach(cb => {
                    cb.checked = e.target.checked;
                    if (e.target.checked) this.selectedPages.add(cb.value);
                    else this.selectedPages.delete(cb.value);
                });
            } else if (e.target.classList.contains('page-cb')) {
                if (e.target.checked) this.selectedPages.add(e.target.value);
                else this.selectedPages.delete(e.target.value);

                const all = this.checkboxesPages.querySelectorAll('.page-cb');
                const checked = this.checkboxesPages.querySelectorAll('.page-cb:checked');
                document.getElementById('selectAllPages').checked = (all.length === checked.length);
                
                this.updateCurrentWords();
            }
        });

        this.reverseModeToggle.addEventListener('change', (e) => {
            this.isReverseMode = e.target.checked;
            if (window.GameManager) {
                window.GameManager.setOptions({ reverse: this.isReverseMode });
            }
        });
    }

    switchView(viewName) {
        this.navButtons.forEach(btn => {
            if (btn.dataset.view === viewName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

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
        this.currentWords = [];
        
        if (this.selectedLessons.size > 0 && this.selectedPages.size > 0) {
            this.selectedLessons.forEach(lessonNum => {
                const lesson = this.data.lessons.find(l => l.number == lessonNum);
                if (lesson && lesson.pages) {
                    lesson.pages.forEach(p => {
                        const pageId = `${lesson.number}-${p.number}`;
                        if (this.selectedPages.has(pageId)) {
                            this.currentWords = this.currentWords.concat(p.words || []);
                        }
                    });
                }
            });
        }

        this.updateStats();
        this.renderWords();

        if (window.GameManager) {
            window.GameManager.setWords(this.currentWords);
            window.GameManager.setOptions({ reverse: this.isReverseMode });
        }
    }

    updateStats() {
        this.wordCountBadge.textContent = `${this.currentWords.length} Wörter`;
    }

    renderWords() {
        this.wordListContainer.innerHTML = '';

        if (this.currentWords.length === 0) {
            this.wordListContainer.innerHTML = `
                <div class="empty-state glass-panel">
                    <h2>Wähle Lektionen</h2>
                    <p>Markiere Lektionen und Seiten im Menü oben.</p>
                </div>
            `;
            return;
        }

        this.currentWords.forEach(word => {
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

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
