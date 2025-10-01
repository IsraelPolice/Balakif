import { NATIONS, BLOCS } from './nations.js';
import { WorldMap } from './worldMap.js';
import { LeaderCard } from './leaderCard.js';

export class UI {
    constructor(gameEngine, database) {
        this.engine = gameEngine;
        this.db = database;
        this.worldMap = null;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen')
        };

        this.elements = {
            gdpValue: document.getElementById('gdp-value'),
            treasuryValue: document.getElementById('treasury-value'),
            militaryValue: document.getElementById('military-value'),
            territoryPercent: document.getElementById('territory-percent'),
            supportValue: document.getElementById('support-value'),
            playerName: document.getElementById('player-name'),
            turnNumber: document.getElementById('turn-number'),
            turnDate: document.getElementById('turn-date'),
            worldMap: document.getElementById('world-map'),
            currentNationName: document.getElementById('current-nation-name'),
            resourceGrid: document.getElementById('resource-grid'),
            outpostGrid: document.getElementById('outpost-grid'),
            diplomacyPanel: document.getElementById('diplomacy-panel'),
            militaryPanel: document.getElementById('military-panel'),
            economyPanel: document.getElementById('economy-panel'),
            eventsList: document.getElementById('events-list'),
            modalContainer: document.getElementById('modal-container'),
            modalContent: document.getElementById('modal-content'),
            notificationArea: document.getElementById('notification-area')
        };
    }

    setupEventListeners() {
        const newGameBtn = document.getElementById('btn-new-game');
        const loadGameBtn = document.getElementById('btn-load-game');
        const leaderboardBtn = document.getElementById('btn-leaderboard');
        const howToPlayBtn = document.getElementById('btn-how-to-play');

        if (newGameBtn) newGameBtn.addEventListener('click', () => this.showNationSelection());
        if (loadGameBtn) loadGameBtn.addEventListener('click', () => this.showLoadGameModal());
        if (leaderboardBtn) leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        if (howToPlayBtn) howToPlayBtn.addEventListener('click', () => this.showHowToPlay());

        const saveGameBtn = document.getElementById('btn-save-game');
        const menuBtn = document.getElementById('btn-menu');

        if (saveGameBtn) saveGameBtn.addEventListener('click', () => this.saveGame());
        if (menuBtn) menuBtn.addEventListener('click', () => this.returnToMenu());

        const modalClose = document.getElementById('modal-close');
        if (modalClose) modalClose.addEventListener('click', () => this.hideModal());

        // Zoom controls
        const zoomIn = document.getElementById('btn-zoom-in');
        const zoomOut = document.getElementById('btn-zoom-out');
        const resetZoom = document.getElementById('btn-reset-zoom');

        if (zoomIn) zoomIn.addEventListener('click', () => this.worldMap?.zoom(0.1));
        if (zoomOut) zoomOut.addEventListener('click', () => this.worldMap?.zoom(-0.1));
        if (resetZoom) resetZoom.addEventListener('click', () => this.worldMap?.resetZoom());

        document.querySelectorAll('.action-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget;
                this.switchTab(target.dataset.tab);
            });
        });

        this.engine.subscribe((state) => this.updateUI(state));
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    async initialize() {
        setTimeout(() => {
            this.showScreen('menu');
        }, 2000);

        // אוטו-סייב כל דקה
        setInterval(() => {
            if (this.engine.state.selectedNation) {
                this.autoSave();
            }
        }, 60000);
    }

    autoSave() {
        try {
            const state = this.engine.getState();
            const saveData = {
                state: state,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem('chromaverse_autosave', JSON.stringify(saveData));
            console.log('🔄 Auto-saved at', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    showNationSelection() {
        let html = '<h2>Select Your Nation</h2><p style="margin-bottom: 1.5rem;">Choose wisely - each nation has unique advantages and challenges</p>';
        html += '<div class="nations-grid">';

        Object.values(NATIONS).forEach(nation => {
            const blocColor = BLOCS[nation.bloc]?.color || '#666';
            html += `
                <div class="nation-select-card" onclick="window.game.ui.selectNation('${nation.id}')" style="border-left: 4px solid ${blocColor}">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">${nation.flag}</div>
                    <h3>${nation.name}</h3>
                    <p class="nation-title">${nation.title}</p>
                    <div class="nation-stats">
                        <div>GDP: $${(nation.demographics.gdp / 1000000000000).toFixed(1)}T</div>
                        <div>Military: ${nation.military.strength}%</div>
                        <div>Difficulty: ${nation.difficulty || 'Medium'}</div>
                    </div>
                    <div class="nation-bloc" style="color: ${blocColor}">${BLOCS[nation.bloc]?.name}</div>
                </div>
            `;
        });

        html += '</div>';
        this.showModal(html);
    }

    selectNation(nationId) {
        const result = this.engine.selectNation(nationId);
        if (result.success) {
            this.hideModal();
            this.showScreen('game');

            // Initialize world map
            if (this.elements.worldMap) {
                this.worldMap = new WorldMap(this.elements.worldMap, (clickedNationId) => {
                    this.showNationDetails(clickedNationId);
                });
                this.worldMap.render(nationId, []);
            }

            this.showNotification(`ברוך הבא, מנהיג ${result.nation.name}!`, 'success');
        }
    }

    async showLoadGameModal() {
        const result = await this.db.getAllSaves();
        if (!result.success || result.saves.length === 0) {
            this.showNotification('No saved games found!', 'warning');
            return;
        }

        let html = '<h2>Load Game</h2><div class="saves-list">';
        result.saves.forEach(save => {
            const nation = NATIONS[save.selected_nation];
            html += `
                <div class="save-card">
                    <div class="save-info">
                        <h3>${nation?.flag || '🌍'} ${save.player_name}</h3>
                        <p>Nation: ${nation?.name || 'Unknown'} | Turn: ${save.current_turn} | Year: ${save.turn_year}</p>
                        <p>Territories: ${save.territories_controlled?.length || 1}</p>
                    </div>
                    <div class="save-actions">
                        <button class="btn-primary" onclick="window.game.ui.loadGame('${save.id}')">Load</button>
                        <button class="btn-action" onclick="window.game.ui.deleteSave('${save.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.showModal(html);
    }

    async loadGame(saveId) {
        const result = await this.db.loadGame(saveId);
        if (result.success) {
            this.engine.setState(result.gameState);
            this.hideModal();
            this.showScreen('game');
            this.showNotification('Game loaded!', 'success');
        }
    }

    async deleteSave(saveId) {
        if (confirm('Delete this save?')) {
            await this.db.deleteSave(saveId);
            this.showLoadGameModal();
        }
    }

    async saveGame() {
        try {
            // שמירה מקומית מהירה
            const state = this.engine.getState();
            const saveData = {
                state: state,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem('chromaverse_quicksave', JSON.stringify(saveData));

            // שמירה גם לדאטהבייס
            const result = await this.db.saveGame(state);
            if (result.success) {
                this.engine.state.saveId = result.saveId;
            }

            this.showNotification('✅ המשחק נשמר בהצלחה!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showNotification('❌ שגיאה בשמירת המשחק', 'danger');
        }
    }

    quickLoad() {
        try {
            const saveData = localStorage.getItem('chromaverse_quicksave');
            if (!saveData) {
                this.showNotification('❌ לא נמצא שמירה מהירה', 'warning');
                return;
            }

            const parsed = JSON.parse(saveData);
            this.engine.loadState(parsed.state);
            this.showNotification('✅ המשחק נטען בהצלחה!', 'success');
            this.switchScreen('game');
        } catch (error) {
            console.error('Load error:', error);
            this.showNotification('❌ שגיאה בטעינת המשחק', 'danger');
        }
    }

    async showLeaderboard() {
        const result = await this.db.getLeaderboard();
        if (!result.success) {
            this.showNotification('Error loading leaderboard', 'danger');
            return;
        }

        let html = '<h2>Global Leaderboard</h2><table class="leaderboard-table"><thead><tr><th>Rank</th><th>Leader</th><th>Score</th><th>Territory</th><th>Conquests</th></tr></thead><tbody>';
        result.leaderboard.forEach((entry, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.player_name}</td>
                    <td>${entry.score?.toLocaleString() || 0}</td>
                    <td>${entry.territory_percentage?.toFixed(1) || 0}%</td>
                    <td>${entry.nations_conquered || 0}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        this.showModal(html);
    }

    showHowToPlay() {
        const html = `
            <h2>How to Play Hevre's Empire</h2>
            <div class="instructions">
                <section>
                    <h3>🎯 Objective</h3>
                    <p>Dominate the world through military conquest, economic supremacy, or diplomatic mastery. Control 50% of global territory, achieve 10T$ GDP, or survive until 2035.</p>
                </section>
                <section>
                    <h3>💰 Economy</h3>
                    <p>Manage GDP and treasury. Invest in infrastructure for growth. Conquer nations to expand your economic base.</p>
                </section>
                <section>
                    <h3>⚔️ Military</h3>
                    <p>Recruit units: Infantry, Armor, Air Force, Navy. Declare war and fight tactical battles. Win 3 battles to conquer a nation.</p>
                </section>
                <section>
                    <h3>🤝 Diplomacy</h3>
                    <p>Improve relations, form alliances, manage bloc dynamics. Western vs Communist blocs create global tension.</p>
                </section>
                <section>
                    <h3>🏆 Victory</h3>
                    <ul>
                        <li>Control 50%+ of world territory</li>
                        <li>Achieve 10 Trillion GDP</li>
                        <li>Survive to 2035</li>
                    </ul>
                </section>
            </div>
        `;
        this.showModal(html);
    }

    returnToMenu() {
        if (confirm('Return to menu? Unsaved progress will be lost.')) {
            this.showScreen('menu');
        }
    }

    endTurn() {
        this.engine.endTurn();
        this.showNotification(`${this.getMonthName(this.engine.state.turnMonth)} ${this.engine.state.turnYear}`, 'success');
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    }

    updateUI(state) {
        if (!state.selectedNation) return;

        this.elements.gdpValue.textContent = `$${(state.resources.gdp / 1000000000).toFixed(1)}B`;
        this.elements.treasuryValue.textContent = `$${(state.resources.treasury / 1000000000).toFixed(1)}B`;
        this.elements.militaryValue.textContent = `${state.military.strength}%`;
        this.elements.territoryPercent.textContent = `${state.stats.territoryPercentage.toFixed(1)}%`;
        this.elements.supportValue.textContent = `${state.internal.support}%`;
        this.elements.playerName.textContent = NATIONS[state.selectedNation].name;

        // עדכון דירוג ורמה
        const rankElement = document.getElementById('player-rank');
        const levelElement = document.getElementById('player-level');
        const scoreElement = document.getElementById('player-score');

        if (rankElement) {
            rankElement.textContent = `${state.stats.rankEmoji || '🥉'} ${state.stats.rank}`;
        }
        if (levelElement) {
            levelElement.textContent = state.stats.level;
        }
        if (scoreElement) {
            scoreElement.textContent = state.stats.score.toLocaleString();
        }

        // Update world map
        if (this.worldMap) {
            const conqueredIds = state.territories
                .filter(t => !t.originalOwner)
                .map(t => t.nationId);
            this.worldMap.render(state.selectedNation, conqueredIds);
        }

        if (this.elements.currentNationName) {
            this.elements.currentNationName.textContent = NATIONS[state.selectedNation].name;
        }

        this.renderTerritories(state);
        this.renderWars(state);
        this.renderDiplomacy(state);
        this.renderMilitary(state);
        this.renderEconomy(state);
        this.renderEvents(state.events);

        // הצגת אירועים חדשים במודל
        this.checkForNewEvents(state);
    }

    checkForNewEvents(state) {
        // בדיקה אם יש אירועים פעילים מהמערכת החדשה
        if (this.engine.eventsSystem && this.engine.eventsSystem.activeEvents.length > 0) {
            const activeEvent = this.engine.eventsSystem.activeEvents[0];
            if (!this.currentDisplayedEventId || this.currentDisplayedEventId !== activeEvent.id) {
                this.currentDisplayedEventId = activeEvent.id;
                this.showEventModal(activeEvent);
            }
        }
    }

    showEventModal(event) {
        const choicesHTML = event.choices.map((choice, index) => `
            <button class="btn-primary" style="margin: 0.5rem 0; width: 100%; text-align: right; padding: 1rem;"
                    onclick="window.game.ui.handleEventChoice('${event.id}', ${index})">
                ${choice.text}
                ${choice.cost > 0 ? `<span style="color: #ff8800; font-weight: bold;"> (-$${(choice.cost / 1000000000).toFixed(1)}B)</span>` : ''}
            </button>
        `).join('');

        const html = `
            <div style="text-align: center;">
                <h2 style="color: #ffd700; font-size: 1.8rem; margin-bottom: 1rem;">
                    ${event.title}
                </h2>
                <p style="color: #ddd; line-height: 1.6; margin-bottom: 2rem; font-size: 1.1rem;">
                    ${event.description}
                </p>
                <div style="text-align: right;">
                    <h3 style="color: #00d9ff; margin-bottom: 1rem;">בחר פעולה:</h3>
                    ${choicesHTML}
                </div>
            </div>
        `;

        this.showModal(html);
    }

    handleEventChoice(eventId, choiceIndex) {
        const event = this.engine.eventsSystem.activeEvents.find(e => e.id === eventId);
        if (!event) return;

        const result = this.engine.handleEventChoice(event, choiceIndex);

        if (result.success) {
            this.showNotification(result.message, 'success');
            this.hideModal();
            this.currentDisplayedEventId = null;
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    renderTerritories(state) {
        if (!this.elements.resourceGrid) return;

        let html = '';
        state.territories.forEach(t => {
            const nation = NATIONS[t.nationId];
            if (!nation) return;

            html += `
                <div class="resource-card">
                    <div style="font-size: 2rem;">${nation.flag}</div>
                    <div style="font-weight: bold;">${nation.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">
                        ${(t.population / 1000000).toFixed(1)}M אנשים
                    </div>
                    ${!t.originalOwner ? `<div style="color: var(--accent-tertiary);">שילוב: ${t.integration || 0}%</div>` : ''}
                </div>
            `;
        });
        this.elements.resourceGrid.innerHTML = html || '<p style="color: var(--text-secondary);">אין שטחים</p>';
    }

    renderWars(state) {
        if (!this.elements.outpostGrid) return;

        let html = '';
        state.diplomacy.wars.forEach((war, index) => {
            const enemy = NATIONS[war.target];
            if (!enemy) return;

            const victories = war.battles.filter(b => b.result === 'victory').length;
            html += `
                <div class="outpost-card">
                    <div style="font-weight: bold;">🔥 מלחמה נגד ${enemy.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">ניצחונות: ${victories}/3</div>
                    <button class="btn-primary" style="margin-top: 0.5rem;" onclick="window.game.ui.conductBattle(${index})">תקוף</button>
                </div>
            `;
        });
        this.elements.outpostGrid.innerHTML = html || '<p style="color: var(--text-secondary);">אין מלחמות פעילות</p>';
    }

    renderNationsList(state) {
        let html = '';
        Object.values(NATIONS).forEach(nation => {
            const relation = state.diplomacy.relations[nation.id] || 0;
            const isPlayer = nation.id === state.selectedNation;
            const isConquered = state.territories.find(t => t.nationId === nation.id && !t.originalOwner);

            html += `
                <div class="dimension-card ${isPlayer ? 'active' : ''}" ${!isPlayer && !isConquered ? `onclick="window.game.ui.showNationDetails('${nation.id}')"` : ''}>
                    <div class="card-header">
                        <span style="font-size: 1.5rem;">${nation.flag}</span>
                        <span class="card-title">${nation.name}</span>
                    </div>
                    ${isConquered ? '<div style="color: var(--success);">✓ CONQUERED</div>' : ''}
                    ${!isPlayer && !isConquered ? `<div style="color: ${relation > 50 ? 'var(--success)' : relation < 0 ? 'var(--danger)' : 'var(--text-secondary)'};">Relations: ${relation}%</div>` : ''}
                </div>
            `;
        });
        this.elements.nationsList.innerHTML = html;
    }

    showNationDetails(nationId) {
        const nation = NATIONS[nationId];
        const relation = this.engine.getRelation(nationId);

        const html = LeaderCard.createModal(nationId, nation, relation);
        this.showModal(html);
    }

    improveRelations(nationId) {
        const result = this.engine.improveRelations(nationId);
        if (result.success) {
            this.showNotification('יחסים שופרו!', 'success');
            this.hideModal();
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    formAlliance(nationId) {
        const result = this.engine.formAlliance(nationId);
        if (result.success) {
            this.showNotification(`ברית נוצרה עם ${NATIONS[nationId].name}!`, 'success');
            this.hideModal();
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    confirmWar(nationId) {
        if (confirm(`להכריז מלחמה על ${NATIONS[nationId].name}? זה יפגע ביחסים עם בני בריתם.`)) {
            this.declareWar(nationId);
        }
    }

    declareWar(nationId) {
        const result = this.engine.declareWar(nationId);
        if (result.success) {
            this.showNotification(`מלחמה הוכרזה על ${NATIONS[nationId].name}!`, 'danger');
            this.hideModal();
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    async conductBattle(warIndex) {
        const war = this.engine.state.diplomacy.wars[warIndex];
        if (!war) return;

        const enemyNation = NATIONS[war.target];
        const playerState = this.engine.state;

        // חישוב כוחות
        const playerUnits = playerState.military.units;
        const playerPower =
            (playerUnits.infantry || 0) * 1 +
            (playerUnits.armor || 0) * 10 +
            (playerUnits.airForce || 0) * 50 +
            (playerUnits.navy || 0) * 100;

        const enemyUnits = enemyNation.military.units;
        const enemyPower =
            (enemyUnits.infantry || 0) * 1 +
            (enemyUnits.armor || 0) * 10 +
            (enemyUnits.airForce || 0) * 50 +
            (enemyUnits.navy || 0) * 100;

        // הצגת מודל קרב
        this.showBattleModal(war, enemyNation, playerPower, enemyPower);
    }

    showBattleModal(war, enemyNation, playerPower, enemyPower) {
        const playerState = this.engine.state;
        const playerNation = NATIONS[playerState.selectedNation];

        const html = `
            <div style="text-align: center;">
                <h2 style="color: #ff0055; font-size: 2rem; margin-bottom: 2rem;">
                    ⚔️ קרב: ${playerNation.name} נגד ${enemyNation.name}
                </h2>

                <!-- השוואת כוחות -->
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; margin: 2rem 0; align-items: center;">
                    <!-- הכוחות שלך -->
                    <div style="text-align: right; padding: 1.5rem; background: linear-gradient(135deg, rgba(0,100,200,0.3), rgba(0,50,100,0.3)); border-radius: 12px; border: 2px solid #00d9ff;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #00d9ff; margin-bottom: 1rem;">
                            ${playerNation.name}
                        </div>
                        <div style="font-size: 2rem; color: #00ff88; font-weight: bold; margin: 1rem 0;">
                            ${playerPower.toLocaleString()}
                        </div>
                        <div style="font-size: 0.85rem; color: #aaa; line-height: 1.8;">
                            🪖 חי"ר: ${(playerState.military.units.infantry || 0).toLocaleString()}<br>
                            🛡️ שריון: ${(playerState.military.units.armor || 0).toLocaleString()}<br>
                            ✈️ אוויר: ${(playerState.military.units.airForce || 0).toLocaleString()}<br>
                            ⚓ ים: ${(playerState.military.units.navy || 0).toLocaleString()}
                        </div>
                        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(0,255,136,0.1); border-radius: 6px;">
                            <div style="color: #00ff88; font-weight: bold;">כוח צבאי: ${playerState.military.strength}%</div>
                        </div>
                    </div>

                    <!-- VS -->
                    <div style="font-size: 3rem; color: #ff0055; font-weight: bold;">
                        VS
                    </div>

                    <!-- כוחות האויב -->
                    <div style="text-align: left; padding: 1.5rem; background: linear-gradient(135deg, rgba(200,0,0,0.3), rgba(100,0,0,0.3)); border-radius: 12px; border: 2px solid #ff0055;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #ff0055; margin-bottom: 1rem;">
                            ${enemyNation.name}
                        </div>
                        <div style="font-size: 2rem; color: #ff8800; font-weight: bold; margin: 1rem 0;">
                            ${enemyPower.toLocaleString()}
                        </div>
                        <div style="font-size: 0.85rem; color: #aaa; line-height: 1.8;">
                            🪖 חי"ר: ${(enemyNation.military.units.infantry || 0).toLocaleString()}<br>
                            🛡️ שריון: ${(enemyNation.military.units.armor || 0).toLocaleString()}<br>
                            ✈️ אוויר: ${(enemyNation.military.units.airForce || 0).toLocaleString()}<br>
                            ⚓ ים: ${(enemyNation.military.units.navy || 0).toLocaleString()}
                        </div>
                        <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255,0,85,0.1); border-radius: 6px;">
                            <div style="color: #ff0055; font-weight: bold;">כוח צבאי: ${enemyNation.military.strength}%</div>
                        </div>
                    </div>
                </div>

                <!-- תחזית -->
                <div style="padding: 1.5rem; background: rgba(255,215,0,0.1); border: 2px solid #ffd700; border-radius: 12px; margin: 2rem 0;">
                    <h3 style="color: #ffd700; margin-bottom: 1rem;">📊 תחזית קרב</h3>
                    <div style="font-size: 1.1rem; line-height: 2;">
                        ${playerPower > enemyPower * 1.5 ?
                            '<div style="color: #00ff88;">✅ יתרון מכריע! סיכוי ניצחון גבוה</div>' :
                        playerPower > enemyPower * 1.2 ?
                            '<div style="color: #00d9ff;">✓ יתרון טקטי. סיכוי ניצחון טוב</div>' :
                        playerPower > enemyPower ?
                            '<div style="color: #ffd700;">⚠ יתרון קל. קרב קשה צפוי</div>' :
                        playerPower > enemyPower * 0.8 ?
                            '<div style="color: #ff8800;">⚠ כוחות שווים. תוצאה לא ודאית</div>' :
                            '<div style="color: #ff0055;">❌ האויב חזק יותר! סכנה גבוהה</div>'
                        }
                        <div style="color: #aaa; font-size: 0.9rem; margin-top: 0.5rem;">
                            נפגעים צפויים: ${Math.floor(Math.random() * 15 + 5)}% מהכוחות
                        </div>
                    </div>
                </div>

                <!-- כפתורי פעולה -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem;">
                    <button class="btn-primary" style="padding: 1.5rem; font-size: 1.2rem; background: linear-gradient(135deg, #ff0055, #cc0044);"
                            onclick="window.game.ui.executeBattleNow('${war.target}')">
                        ⚔️ התקפה!
                    </button>
                    <button class="btn-primary" style="padding: 1.5rem; font-size: 1.2rem; background: linear-gradient(135deg, #666, #444);"
                            onclick="window.game.ui.hideModal()">
                        ביטול
                    </button>
                </div>
            </div>
        `;

        this.showModal(html);
    }

    async executeBattleNow(targetId) {
        this.hideModal();

        // סימולציית קרב מרגשת
        const loadingHtml = `
            <div style="text-align: center;">
                <h2 style="color: #ff0055;">⚔️ הקרב מתחיל!</h2>
                <div id="battle-log" style="margin: 2rem 0; text-align: right; max-height: 400px; overflow-y: auto;"></div>
                <div style="font-size: 3rem; animation: spin 1s linear infinite;">💥</div>
            </div>
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        `;

        this.showModal(loadingHtml);

        const battleLog = [];
        const logElement = () => document.getElementById('battle-log');

        const addLog = (text, color = '#fff') => {
            battleLog.push(`<div style="color: ${color}; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">${text}</div>`);
            if (logElement()) {
                logElement().innerHTML = battleLog.join('');
                logElement().scrollTop = logElement().scrollHeight;
            }
        };

        await new Promise(r => setTimeout(r, 500));
        addLog('🎯 פתיחה בהפצצה אווירית מסיבית...', '#00d9ff');

        await new Promise(r => setTimeout(r, 1000));
        addLog('💥 פגיעות ישירות במטרות אסטרטגיות!', '#ff8800');

        await new Promise(r => setTimeout(r, 1000));
        addLog('🛡️ כוחות שריון פורצים את הקווים!', '#00ff88');

        await new Promise(r => setTimeout(r, 1000));
        addLog('⚡ יחידות מיוחדות מבצעות חדירה עמוקה...', '#ffd700');

        await new Promise(r => setTimeout(r, 1000));
        addLog('🔥 קרבות קשים בשטח אורבני!', '#ff0055');

        await new Promise(r => setTimeout(r, 1500));

        // ביצוע הקרב האמיתי
        const warIndex = this.engine.state.diplomacy.wars.findIndex(w => w.target === targetId);

        if (warIndex === -1) {
            addLog('❌ שגיאה: המלחמה לא נמצאה!', '#ff0055');
            await new Promise(r => setTimeout(r, 2000));
            this.hideModal();
            this.showNotification('❌ שגיאה: המלחמה לא נמצאה', 'danger');
            return;
        }

        const result = this.engine.conductBattle(warIndex);

        if (!result || !result.success) {
            addLog('❌ שגיאה בביצוע הקרב!', '#ff0055');
            await new Promise(r => setTimeout(r, 2000));
            this.hideModal();
            this.showNotification(result?.message || '❌ שגיאה בביצוע הקרב', 'danger');
            return;
        }

        await new Promise(r => setTimeout(r, 500));

        if (result.victory) {
            addLog('🏆 ניצחון! כוחות האויב נסוגים!', '#00ff88');
            if (result.conquered) {
                addLog('👑 המדינה נכבשה! הטריטוריה בשליטתך!', '#ffd700');
            }
        } else {
            addLog('💔 הקרב הסתיים בתבוסה...', '#ff0055');
        }

        await new Promise(r => setTimeout(r, 2000));

        this.hideModal();

        if (result.conquered) {
            this.showNotification('🎉 ניצחון מוחלט! המדינה נכבשה!', 'success');
        } else if (result.victory) {
            this.showNotification('✅ ניצחון בקרב!', 'success');
        } else {
            this.showNotification('❌ תבוסה. חזק והתקפה שוב', 'danger');
        }
    }

    renderCurrentNation(state) {
        // פונקציה זו כבר לא נחוצה - renderTerritories ו-renderWars מטפלים בתצוגה
    }

    renderDiplomacy(state) {
        let html = '';
        Object.entries(state.diplomacy.relations).slice(0, 10).forEach(([nationId, relation]) => {
            const nation = NATIONS[nationId];
            if (!nation) return;

            html += `
                <div class="tech-card" onclick="window.game.ui.showNationDetails('${nationId}')">
                    <div class="card-header">
                        <span style="font-size: 1.5rem;">${nation.flag}</span>
                        <span class="card-title">${nation.name}</span>
                    </div>
                    <div style="color: ${relation > 50 ? 'var(--success)' : relation < 0 ? 'var(--danger)' : 'var(--text-secondary)'};">
                        Relations: ${relation}%
                    </div>
                </div>
            `;
        });
        this.elements.diplomacyPanel.innerHTML = html || '<p style="color: var(--text-secondary);">No diplomatic relations yet</p>';
    }

    renderMilitary(state) {
        const units = [
            { type: 'infantry', name: 'חיילי רגלים', icon: '🪖', cost: 50000, tech: 'מוטיבציה וציוד', power: 1 },
            { type: 'armor', name: 'שריון', icon: '🛡️', cost: 5000000, tech: 'טנקים מתקדמים', power: 10 },
            { type: 'airForce', name: 'חיל אוויר', icon: '✈️', cost: 50000000, tech: 'מטוסי F-35', power: 50 },
            { type: 'navy', name: 'חיל ים', icon: '⚓', cost: 200000000, tech: 'ספינות קרב', power: 100 }
        ];

        // Combat Power Calculation
        let totalPower = 0;
        units.forEach(unit => {
            totalPower += (state.military.units[unit.type] || 0) * unit.power;
        });

        let html = `
            <!-- סקירת כוח -->
            <div class="building-card" style="border: 2px solid #ff0055; background: linear-gradient(135deg, rgba(255,0,85,0.1), rgba(0,0,0,0.3));">
                <h4 style="color: #ff0055;">⚔️ כוח קרבי משוקלל</h4>
                <div style="font-size: 2.5rem; font-weight: bold; color: #ff0055; text-align: center; margin: 1rem 0;">
                    ${totalPower.toLocaleString()}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                    <div>כוח צבאי: <strong>${state.military.strength}%</strong></div>
                    <div>מוכנות: <strong>${state.military.readiness || 100}%</strong></div>
                </div>
            </div>

            <!-- סטטיסטיקות יחידות -->
            <div class="building-card">
                <h4>📊 הרכב הכוחות</h4>
                <div style="line-height: 2; margin-top: 1rem;">
                    ${units.map(unit => `
                        <div style="display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span>${unit.icon} ${unit.name}</span>
                            <strong style="color: #00d9ff;">${(state.military.units[unit.type] || 0).toLocaleString()}</strong>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(0,100,200,0.2); border-radius: 6px;">
                    <div style="font-size: 0.85rem; color: #aaa;">סה"כ יחידות: ${Object.values(state.military.units).reduce((a,b) => a+b, 0).toLocaleString()}</div>
                </div>
            </div>

            <h4 style="margin: 1.5rem 0 1rem 0; color: #00d9ff;">🎖️ גיוס יחידות</h4>
        `;

        units.forEach(unit => {
            const currentCount = state.military.units[unit.type] || 0;
            html += `
                <div class="building-card" style="border-right: 4px solid #00d9ff;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 1.5rem;">${unit.icon} <strong>${unit.name}</strong></div>
                            <div style="font-size: 0.85rem; color: #aaa; margin-top: 0.25rem;">${unit.tech}</div>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 1.2rem; color: #00ff88;">${currentCount.toLocaleString()}</div>
                            <div style="font-size: 0.75rem; color: #aaa;">יחידות</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                            <span>כוח לכל יחידה:</span>
                            <span style="color: #ffd700;">⚡ ${unit.power}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <span>עלות:</span>
                            <span style="color: #ff8800;">💵 $${(unit.cost / 1000000).toFixed(2)}M</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                        <button class="btn-primary" style="padding: 0.5rem; font-size: 0.9rem;"
                                onclick="window.game.ui.recruitUnits('${unit.type}', 10)">
                            +10
                        </button>
                        <button class="btn-primary" style="padding: 0.5rem; font-size: 0.9rem;"
                                onclick="window.game.ui.recruitUnits('${unit.type}', 100)">
                            +100
                        </button>
                        <button class="btn-primary" style="padding: 0.5rem; font-size: 0.9rem; background: linear-gradient(135deg, #ff0055, #ff4488);"
                                onclick="window.game.ui.recruitUnits('${unit.type}', 1000)">
                            +1000
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            <!-- שדרוגים צבאיים -->
            <div class="building-card" style="border: 2px solid #ffd700; margin-top: 1rem;">
                <h4 style="color: #ffd700;">⭐ שדרוגי טכנולוגיה</h4>
                <p style="color: #aaa; font-size: 0.9rem; margin: 0.5rem 0;">שפר את יכולות הצבא שלך</p>
                <button class="btn-primary" style="width: 100%; margin-top: 0.5rem; background: linear-gradient(135deg, #ffd700, #ffaa00);"
                        onclick="window.game.ui.upgradeMilitary()">
                    שדרג ציוד (+5% כוח) - $10B
                </button>
            </div>
        `;

        this.elements.militaryPanel.innerHTML = html;
    }

    upgradeMilitary() {
        const cost = 10000000000;
        if (this.engine.state.resources.treasury < cost) {
            this.showNotification('❌ אין מספיק תקציב!', 'warning');
            return;
        }

        this.engine.state.resources.treasury -= cost;
        this.engine.state.military.strength = Math.min(100, this.engine.state.military.strength + 5);

        this.showNotification('✅ שדרוג צבאי הושלם! +5% כוח', 'success');
        this.engine.notifyListeners();
    }

    recruitUnits(unitType, quantity) {
        const result = this.engine.recruitMilitary(unitType, quantity);
        if (result.success) {
            this.showNotification(`Recruited ${quantity} ${unitType}!`, 'success');
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    renderEconomy(state) {
        const joyStatus = this.engine.getPublicJoyStatus();
        const publicJoy = state.internal.publicJoy || 70;
        const taxRate = state.internal.taxRate || 25;

        let html = `
            <!-- מד שמחת עם -->
            <div class="building-card" style="border: 2px solid ${joyStatus.color};">
                <h4 style="color: ${joyStatus.color};">😊 שמחת העם</h4>
                <div style="margin: 1rem 0;">
                    <div style="background: rgba(0,0,0,0.5); height: 30px; border-radius: 15px; overflow: hidden;">
                        <div style="width: ${publicJoy}%; height: 100%; background: linear-gradient(to right, ${joyStatus.color}, #00ff88);
                                    display: flex; align-items: center; justify-content: center; font-weight: bold; transition: all 0.5s ease;">
                            ${publicJoy.toFixed(0)}%
                        </div>
                    </div>
                    <p style="color: ${joyStatus.color}; margin-top: 0.5rem; font-weight: bold;">
                        ${joyStatus.message}
                    </p>
                </div>
            </div>

            <!-- מערכת מיסוי -->
            <div class="building-card">
                <h4>💰 מדיניות מיסוי</h4>
                <div style="margin: 1rem 0;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #00d9ff; font-weight: bold;">
                        שיעור מס: <span id="tax-rate-display">${taxRate}</span>%
                    </label>
                    <input type="range" id="tax-slider" min="10" max="50" value="${taxRate}"
                           style="width: 100%; accent-color: #00d9ff;">
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.85rem; color: #aaa;">
                        <span>10% (נמוך)</span>
                        <span>50% (גבוה)</span>
                    </div>
                    <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(0, 100, 200, 0.2); border-radius: 6px;">
                        <div style="color: #00ff88;">✓ מיסים גבוהים = הכנסה רבה</div>
                        <div style="color: #ff8800;">✗ מיסים גבוהים = שמחה נמוכה</div>
                    </div>
                </div>
            </div>

            <!-- השקעה כלכלית -->
            <div class="building-card">
                <h4>📈 השקעה כלכלית</h4>
                <p>השקע 5% מהתמ"ג כדי להגביר צמיחה</p>
                <div class="card-cost">
                    <span class="cost-item">💵 $${(state.resources.gdp * 0.05 / 1000000000).toFixed(2)}B</span>
                </div>
                <button class="btn-primary" onclick="window.game.ui.investEconomy()">השקע</button>
            </div>

            <!-- סקירה כלכלית -->
            <div class="building-card">
                <h4>📊 סקירה כלכלית</h4>
                <div style="margin-top: 1rem; line-height: 2;">
                    <div>צמיחת תמ"ג: +${state.resources.growthRate}% בשנה</div>
                    <div>הכנסה מיסים: ${(taxRate * 0.05).toFixed(1)}% מתמ"ג</div>
                    <div>תקציב צבאי: 3% מתמ"ג</div>
                </div>
            </div>
        `;

        this.elements.economyPanel.innerHTML = html;

        // הוספת event listener ל-slider
        setTimeout(() => {
            const slider = document.getElementById('tax-slider');
            const display = document.getElementById('tax-rate-display');
            if (slider && display) {
                slider.addEventListener('input', (e) => {
                    const newRate = parseInt(e.target.value);
                    display.textContent = newRate;
                });

                slider.addEventListener('change', (e) => {
                    const newRate = parseInt(e.target.value);
                    this.changeTaxRate(newRate);
                });
            }
        }, 100);
    }

    changeTaxRate(newRate) {
        const result = this.engine.setTaxRate(newRate);
        if (result.success) {
            this.showNotification(`שיעור המס השתנה ל-${newRate}%`, 'success');
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    investEconomy() {
        const result = this.engine.investEconomy();
        if (result.success) {
            this.showNotification('Economic investment made!', 'success');
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    renderEvents(events) {
        let html = '';
        events.slice(0, 10).forEach(event => {
            const icons = {
                gameStart: '🎮',
                war: '⚔️',
                battleVictory: '🏆',
                battleDefeat: '💔',
                conquest: '👑',
                diplomacy: '🤝',
                alliance: '🛡️',
                economy: '💰',
                economicBoom: '📈',
                recession: '📉',
                nuclearTest: '☢️',
                tradeOpportunity: '💼'
            };

            const importanceColors = {
                critical: 'var(--danger)',
                high: 'var(--warning)',
                medium: 'var(--accent-primary)',
                low: 'var(--text-secondary)'
            };

            html += `
                <div class="event-card" style="border-left: 4px solid ${importanceColors[event.importance] || 'var(--text-secondary)'}">
                    <div class="card-header">
                        <span style="font-size: 1.5rem;">${icons[event.type] || '📢'}</span>
                        <span class="card-title">${event.title}</span>
                    </div>
                    <div class="card-description">${event.message}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">${event.month}/${event.year} - Turn ${event.turn}</div>
                </div>
            `;
        });
        this.elements.eventsList.innerHTML = html || '<p style="color: var(--text-secondary); padding: 1rem;">No recent events</p>';
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    showModal(html) {
        this.elements.modalContent.innerHTML = html;
        this.elements.modalContainer.classList.remove('hidden');
    }

    hideModal() {
        this.elements.modalContainer.classList.add('hidden');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        this.elements.notificationArea.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
