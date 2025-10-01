import { NATIONS, BLOCS } from './nations.js';
import { WorldMap } from './worldMap.js';

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
        const result = await this.db.saveGame(this.engine.getState());
        if (result.success) {
            this.engine.state.saveId = result.saveId;
            this.showNotification('Game saved!', 'success');
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

        if (this.elements.turnDate) {
            this.elements.turnDate.textContent = 'זמן אמת';
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

        let html = `
            <h2>${nation.flag} ${nation.name}</h2>
            <h3 style="color: var(--text-secondary); margin-bottom: 1rem;">${nation.title}</h3>
            <p>${nation.backstory}</p>
            <div style="margin-top: 1.5rem;">
                <h3>Statistics</h3>
                <div class="nation-stats-detail">
                    <div>Population: ${(nation.demographics.population / 1000000).toFixed(1)}M</div>
                    <div>GDP: $${(nation.demographics.gdp / 1000000000000).toFixed(2)}T</div>
                    <div>Military Strength: ${nation.military.strength}%</div>
                    <div>Relations: ${relation}%</div>
                </div>
            </div>
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button class="btn-primary" onclick="window.game.ui.improveRelations('${nationId}')">Improve Relations ($1B)</button>
                <button class="btn-action" onclick="window.game.ui.declareWar('${nationId}')">Declare War</button>
            </div>
        `;
        this.showModal(html);
    }

    improveRelations(nationId) {
        const result = this.engine.improveRelations(nationId);
        if (result.success) {
            this.showNotification('Relations improved!', 'success');
            this.hideModal();
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    declareWar(nationId) {
        if (confirm(`Declare war on ${NATIONS[nationId].name}? This will damage relations with their allies.`)) {
            const result = this.engine.declareWar(nationId);
            if (result.success) {
                this.showNotification(`War declared on ${NATIONS[nationId].name}!`, 'danger');
                this.hideModal();
            }
        }
    }

    renderCurrentNation(state) {
        const nation = NATIONS[state.selectedNation];
        this.elements.currentDimensionName.textContent = nation.name;
        this.elements.dimType.textContent = nation.title;
        this.elements.dimDanger.textContent = nation.bloc;
        this.elements.dimWealth.textContent = `$${(nation.demographics.gdp / 1000000000000).toFixed(1)}T GDP`;

        this.elements.dimensionMap.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="font-size: 8rem; margin-bottom: 1rem;">${nation.flag}</div>
                <h2>${nation.name}</h2>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${nation.backstory}</p>
            </div>
        `;

        let resourcesHTML = '';
        state.territories.forEach(t => {
            resourcesHTML += `
                <div class="resource-card">
                    <div style="font-weight: bold;">${NATIONS[t.nationId]?.name || t.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">
                        ${(t.population / 1000000).toFixed(1)}M people
                    </div>
                    ${!t.originalOwner ? `<div style="color: var(--accent-tertiary);">Integration: ${t.integration}%</div>` : ''}
                </div>
            `;
        });
        this.elements.resourceGrid.innerHTML = resourcesHTML || '<p style="color: var(--text-secondary);">No territories</p>';

        let warsHTML = '';
        state.diplomacy.wars.forEach((war, index) => {
            const enemy = NATIONS[war.target];
            const victories = war.battles.filter(b => b.result === 'victory').length;
            warsHTML += `
                <div class="outpost-card">
                    <div style="font-weight: bold;">🔥 War vs ${enemy.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Victories: ${victories}/3</div>
                    <button class="btn-primary" style="margin-top: 0.5rem;" onclick="window.game.ui.conductBattle(${index})">Launch Attack</button>
                </div>
            `;
        });
        this.elements.outpostGrid.innerHTML = warsHTML || '<p style="color: var(--text-secondary);">No active wars</p>';
    }

    conductBattle(warIndex) {
        const result = this.engine.conductBattle(warIndex);
        if (result.victory) {
            this.showNotification('Battle won!', 'success');
        } else if (result.conquered) {
            this.showNotification('Nation conquered!', 'success');
        } else {
            this.showNotification('Battle lost', 'danger');
        }
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
            { type: 'infantry', name: 'Infantry', icon: '🪖', cost: 50000 },
            { type: 'armor', name: 'Armor', icon: '🛡️', cost: 5000000 },
            { type: 'airForce', name: 'Air Force', icon: '✈️', cost: 50000000 },
            { type: 'navy', name: 'Navy', icon: '⚓', cost: 200000000 }
        ];

        let html = '<div style="margin-bottom: 1rem;"><strong>Current Forces:</strong></div>';
        units.forEach(unit => {
            html += `
                <div class="building-card">
                    <div class="card-header">
                        <span style="font-size: 2rem;">${unit.icon}</span>
                        <span class="card-title">${unit.name}</span>
                    </div>
                    <div>Current: ${state.military.units[unit.type]}</div>
                    <div class="card-cost">
                        <span class="cost-item">💵 $${(unit.cost / 1000000).toFixed(1)}M</span>
                    </div>
                    <button class="btn-primary" style="margin-top: 0.5rem;" onclick="window.game.ui.recruitUnits('${unit.type}', 100)">Recruit 100</button>
                </div>
            `;
        });
        this.elements.militaryPanel.innerHTML = html;
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
        let html = `
            <div class="building-card">
                <h4>Economic Investment</h4>
                <p>Invest 5% of GDP to boost growth</p>
                <div class="card-cost">
                    <span class="cost-item">💵 $${(state.resources.gdp * 0.05 / 1000000000).toFixed(2)}B</span>
                </div>
                <button class="btn-primary" onclick="window.game.ui.investEconomy()">Invest</button>
            </div>
            <div class="building-card">
                <h4>Economic Overview</h4>
                <div style="margin-top: 1rem;">
                    <div>GDP Growth: +2% per turn</div>
                    <div>Treasury Income: 5% of GDP/turn</div>
                    <div>Military Budget: 3% of GDP/turn</div>
                </div>
            </div>
        `;
        this.elements.economyPanel.innerHTML = html;
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
