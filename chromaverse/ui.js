export class UI {
    constructor(gameEngine, database) {
        this.engine = gameEngine;
        this.db = database;
        this.currentScreen = 'loading';
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
            energyValue: document.getElementById('energy-value'),
            shardsValue: document.getElementById('shards-value'),
            knowledgeValue: document.getElementById('knowledge-value'),
            dimensionsCount: document.getElementById('dimensions-count'),
            stabilityValue: document.getElementById('stability-value'),
            playerName: document.getElementById('player-name'),
            turnNumber: document.getElementById('turn-number'),
            dimensionList: document.getElementById('dimension-list'),
            dimensionView: document.getElementById('dimension-view'),
            currentDimensionName: document.getElementById('current-dimension-name'),
            dimType: document.getElementById('dim-type'),
            dimDanger: document.getElementById('dim-danger'),
            dimWealth: document.getElementById('dim-wealth'),
            dimensionMap: document.getElementById('dimension-map'),
            resourceGrid: document.getElementById('resource-grid'),
            outpostGrid: document.getElementById('outpost-grid'),
            techTree: document.getElementById('tech-tree'),
            buildingList: document.getElementById('building-list'),
            tradePanel: document.getElementById('trade-panel'),
            eventsList: document.getElementById('events-list'),
            modalContainer: document.getElementById('modal-container'),
            modalContent: document.getElementById('modal-content'),
            notificationArea: document.getElementById('notification-area')
        };
    }

    setupEventListeners() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-load-game').addEventListener('click', () => this.showLoadGameModal());
        document.getElementById('btn-leaderboard').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('btn-how-to-play').addEventListener('click', () => this.showHowToPlay());

        document.getElementById('btn-discover-dimension').addEventListener('click', () => this.discoverDimension());
        document.getElementById('btn-end-turn').addEventListener('click', () => this.endTurn());
        document.getElementById('btn-save-game').addEventListener('click', () => this.saveGame());
        document.getElementById('btn-achievements').addEventListener('click', () => this.showAchievements());
        document.getElementById('btn-menu').addEventListener('click', () => this.returnToMenu());

        document.getElementById('modal-close').addEventListener('click', () => this.hideModal());
        document.getElementById('modal-container').addEventListener('click', (e) => {
            if (e.target.id === 'modal-container') this.hideModal();
        });

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        this.engine.subscribe((state) => this.updateUI(state));
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
    }

    async initialize() {
        setTimeout(() => {
            this.showScreen('menu');
        }, 2000);
    }

    startNewGame() {
        const name = prompt('Enter your name:', 'Architect');
        if (name) {
            this.engine.state.playerName = name;
            this.showScreen('game');
            this.updateUI(this.engine.getState());
        }
    }

    async showLoadGameModal() {
        const result = await this.db.getAllSaves();
        if (!result.success) {
            this.showNotification('Error loading saves!', 'danger');
            return;
        }

        const saves = result.saves;
        if (saves.length === 0) {
            this.showNotification('No saved games found!', 'warning');
            return;
        }

        let html = '<h2>Load Game</h2><div class="saves-list">';
        saves.forEach(save => {
            const date = new Date(save.updated_at).toLocaleString();
            html += `
                <div class="save-card">
                    <div class="save-info">
                        <h3>${save.player_name}</h3>
                        <p>Turn: ${save.current_turn} | Dimensions: ${save.discovered_dimensions}</p>
                        <p class="save-date">${date}</p>
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
        if (!result.success) {
            this.showNotification('Error loading game!', 'danger');
            return;
        }

        this.engine.setState(result.gameState);
        this.hideModal();
        this.showScreen('game');
        this.updateUI(this.engine.getState());
        this.showNotification('Game loaded successfully!', 'success');
    }

    async deleteSave(saveId) {
        if (!confirm('Are you sure you want to delete this save?')) return;

        const result = await this.db.deleteSave(saveId);
        if (result.success) {
            this.showNotification('Save deleted!', 'success');
            this.showLoadGameModal();
        } else {
            this.showNotification('Error deleting save!', 'danger');
        }
    }

    async saveGame() {
        const result = await this.db.saveGame(this.engine.getState());
        if (result.success) {
            this.engine.state.saveId = result.saveId;
            this.showNotification('Game saved successfully!', 'success');

            if (this.engine.state.achievements.length > 0) {
                for (const achId of this.engine.state.achievements) {
                    await this.db.unlockAchievement(result.saveId, achId);
                }
            }
        } else {
            this.showNotification('Error saving game!', 'danger');
        }
    }

    async showLeaderboard() {
        const result = await this.db.getLeaderboard();
        if (!result.success) {
            this.showNotification('Error loading leaderboard!', 'danger');
            return;
        }

        let html = '<h2>Leaderboard</h2><table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Dimensions</th><th>Victory</th></tr></thead><tbody>';

        result.leaderboard.forEach((entry, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.player_name}</td>
                    <td>${entry.score.toLocaleString()}</td>
                    <td>${entry.dimensions_conquered}</td>
                    <td>${entry.victory_type}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        this.showModal(html);
    }

    showHowToPlay() {
        const html = `
            <h2>How to Play ChromaVerse</h2>
            <div class="instructions">
                <section>
                    <h3>🎯 Objective</h3>
                    <p>Become the master of the multiverse by discovering and conquering parallel dimensions, researching advanced technologies, and accumulating vast wealth.</p>
                </section>

                <section>
                    <h3>⚡ Resources</h3>
                    <ul>
                        <li><strong>Multiverse Energy:</strong> Main currency for building and exploration</li>
                        <li><strong>Reality Shards:</strong> Rare currency for dimension discovery</li>
                        <li><strong>Knowledge Points:</strong> Used for research and technology</li>
                    </ul>
                </section>

                <section>
                    <h3>🌐 Dimensions</h3>
                    <p>Each dimension has unique properties:</p>
                    <ul>
                        <li><strong>Standard:</strong> Normal physics, balanced gameplay</li>
                        <li><strong>Quantum:</strong> Fluctuating resources, unpredictable</li>
                        <li><strong>Entropic:</strong> High danger, buildings decay faster</li>
                        <li><strong>Chrono:</strong> Time manipulation, extra actions</li>
                        <li><strong>Exotic:</strong> Reality-bending abilities</li>
                    </ul>
                </section>

                <section>
                    <h3>🏗️ Buildings</h3>
                    <p>Construct outposts to extract resources and expand your empire. Each outpost generates passive income.</p>
                </section>

                <section>
                    <h3>🔬 Research</h3>
                    <p>Unlock technologies to boost efficiency, reduce costs, and gain new abilities. Plan your tech tree carefully!</p>
                </section>

                <section>
                    <h3>⏭️ Turns</h3>
                    <p>End your turn to collect resources from all dimensions, trigger events, and advance time. Random events can help or hinder your progress.</p>
                </section>

                <section>
                    <h3>🏆 Victory</h3>
                    <p>Win by achieving:</p>
                    <ul>
                        <li>Discover 20+ dimensions</li>
                        <li>Accumulate 1,000,000+ Multiverse Energy</li>
                        <li>Research all technologies</li>
                        <li>Survive 100 turns</li>
                    </ul>
                </section>
            </div>
        `;
        this.showModal(html);
    }

    showAchievements() {
        const achievements = [
            { id: 'first_dimension', name: 'Reality Pioneer', description: 'Discover your second dimension', icon: '🌟' },
            { id: 'rich', name: 'Energy Tycoon', description: 'Accumulate 10,000 Multiverse Energy', icon: '💰' },
            { id: 'researcher', name: 'Mad Scientist', description: 'Research 5 technologies', icon: '🔬' },
            { id: 'turn_50', name: 'Time Lord', description: 'Survive 50 turns', icon: '⏰' },
            { id: 'ten_dimensions', name: 'Multiverse Master', description: 'Discover 10 dimensions', icon: '🌌' }
        ];

        let html = '<h2>Achievements</h2><div class="achievements-grid">';
        achievements.forEach(ach => {
            const unlocked = this.engine.state.achievements.includes(ach.id);
            html += `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                    <h3>${ach.name}</h3>
                    <p>${ach.description}</p>
                </div>
            `;
        });
        html += '</div>';

        this.showModal(html);
    }

    returnToMenu() {
        if (confirm('Return to menu? Unsaved progress will be lost.')) {
            this.showScreen('menu');
        }
    }

    discoverDimension() {
        const result = this.engine.discoverNewDimension();
        if (result.success) {
            this.showNotification(`Discovered ${result.dimension.name}!`, 'success');
        } else {
            this.showNotification(result.message, 'warning');
        }
    }

    endTurn() {
        this.engine.endTurn();
        this.showNotification(`Turn ${this.engine.state.currentTurn} begins!`, 'success');
    }

    updateUI(state) {
        this.elements.energyValue.textContent = state.resources.multiverseEnergy.toLocaleString();
        this.elements.shardsValue.textContent = state.resources.realityShards.toLocaleString();
        this.elements.knowledgeValue.textContent = state.resources.knowledgePoints.toLocaleString();
        this.elements.dimensionsCount.textContent = state.stats.discoveredDimensions;
        this.elements.stabilityValue.textContent = `${state.stats.timelineStability}%`;
        this.elements.playerName.textContent = state.playerName;
        this.elements.turnNumber.textContent = state.currentTurn;

        this.renderDimensionList(state.dimensions);
        this.renderCurrentDimension(state);
        this.renderTechTree(state);
        this.renderBuildingList(state);
        this.renderEvents(state.events);
    }

    renderDimensionList(dimensions) {
        this.elements.dimensionList.innerHTML = '';
        dimensions.forEach(dim => {
            const card = document.createElement('div');
            card.className = `dimension-card ${dim.id === this.engine.state.currentDimensionId ? 'active' : ''}`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-title">${dim.name}</span>
                    <span class="card-badge badge-${dim.type.toLowerCase()}">${dim.type}</span>
                </div>
                <div class="card-stats">
                    <span>Lvl: ${dim.level}</span>
                    <span>Outposts: ${dim.outposts.length}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                this.engine.setCurrentDimension(dim.id);
            });
            this.elements.dimensionList.appendChild(card);
        });
    }

    renderCurrentDimension(state) {
        const dimension = this.engine.getCurrentDimension();
        if (!dimension) return;

        this.elements.currentDimensionName.textContent = dimension.name;
        this.elements.dimType.textContent = dimension.type;
        this.elements.dimDanger.textContent = dimension.danger > 50 ? 'High' : dimension.danger > 25 ? 'Medium' : 'Low';
        this.elements.dimWealth.textContent = dimension.wealth > 70 ? 'Very High' : dimension.wealth > 50 ? 'High' : 'Medium';

        this.renderMap(dimension.map);
        this.renderResources(dimension.resources);
        this.renderOutposts(dimension.outposts);
    }

    renderMap(mapData) {
        const container = this.elements.dimensionMap;
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'map-grid';

        mapData.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `map-cell cell-${cell.type}`;

            const icons = {
                empty: '',
                resource: '💎',
                outpost: '🏭',
                portal: '🌀',
                danger: '⚠️',
                special: '✨'
            };

            cellDiv.textContent = icons[cell.type] || '';

            if (cell.type === 'resource' && cell.data) {
                cellDiv.title = `${cell.data.resource}: ${cell.data.amount}`;
            }

            cellDiv.addEventListener('click', () => this.handleCellClick(cell));

            grid.appendChild(cellDiv);
        });

        container.appendChild(grid);
    }

    handleCellClick(cell) {
        if (cell.type === 'resource') {
            this.showNotification(`Resource node: ${cell.data?.resource || 'unknown'}`, 'success');
        } else if (cell.type === 'portal') {
            this.showNotification('Portal detected! Research required to use.', 'warning');
        }
    }

    renderResources(resources) {
        this.elements.resourceGrid.innerHTML = '';
        resources.forEach(res => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.innerHTML = `
                <div style="font-size: 2rem;">${res.icon}</div>
                <div style="font-weight: bold;">${res.name}</div>
                <div style="color: var(--accent-tertiary);">${res.amount}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">+${res.production}/turn</div>
            `;
            this.elements.resourceGrid.appendChild(card);
        });
    }

    renderOutposts(outposts) {
        this.elements.outpostGrid.innerHTML = '';

        if (outposts.length === 0) {
            this.elements.outpostGrid.innerHTML = '<p style="color: var(--text-secondary);">No outposts built yet</p>';
            return;
        }

        outposts.forEach(outpost => {
            const card = document.createElement('div');
            card.className = 'outpost-card';
            card.innerHTML = `
                <div style="font-weight: bold;">${outpost.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Level ${outpost.level} ${outpost.type}</div>
            `;
            this.elements.outpostGrid.appendChild(card);
        });
    }

    renderTechTree(state) {
        this.elements.techTree.innerHTML = '';
        const techs = this.engine.getAllTechnologies();

        techs.forEach(tech => {
            const researched = state.technologies.includes(tech.id);
            const card = document.createElement('div');
            card.className = `tech-card ${researched ? 'researched' : ''}`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-title">${tech.name}</span>
                    ${researched ? '<span style="color: var(--success);">✓</span>' : ''}
                </div>
                <div class="card-description">${tech.description}</div>
                <div class="card-cost">
                    <span class="cost-item">🧠 ${tech.cost}</span>
                </div>
            `;

            if (!researched) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    const result = this.engine.researchTechnology(tech.id);
                    if (result.success) {
                        this.showNotification(`${tech.name} researched!`, 'success');
                    } else {
                        this.showNotification(result.message, 'warning');
                    }
                });
            } else {
                card.style.opacity = '0.6';
            }

            this.elements.techTree.appendChild(card);
        });
    }

    renderBuildingList(state) {
        const dimension = this.engine.getCurrentDimension();
        if (!dimension) return;

        const buildings = [
            { id: 'mining', name: 'Mining Outpost', cost: 200, icon: '⛏️', description: 'Extract resources from dimension' },
            { id: 'research', name: 'Research Lab', cost: 300, icon: '🔬', description: 'Generate knowledge points' },
            { id: 'military', name: 'Defense Station', cost: 250, icon: '🛡️', description: 'Protect from hostile events' },
            { id: 'portal', name: 'Portal Hub', cost: 500, icon: '🌀', description: 'Enable fast travel' }
        ];

        this.elements.buildingList.innerHTML = '';
        buildings.forEach(building => {
            const card = document.createElement('div');
            card.className = 'building-card';
            card.innerHTML = `
                <div class="card-header">
                    <span style="font-size: 2rem;">${building.icon}</span>
                    <span class="card-title">${building.name}</span>
                </div>
                <div class="card-description">${building.description}</div>
                <div class="card-cost">
                    <span class="cost-item">⚡ ${building.cost}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                const name = prompt(`Name your ${building.name}:`, building.name);
                if (name) {
                    const result = this.engine.buildOutpost(dimension.id, name, building.id);
                    if (result.success) {
                        this.showNotification(`${name} built!`, 'success');
                    } else {
                        this.showNotification(result.message, 'warning');
                    }
                }
            });

            this.elements.buildingList.appendChild(card);
        });
    }

    renderEvents(events) {
        this.elements.eventsList.innerHTML = '';

        if (events.length === 0) {
            this.elements.eventsList.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem;">No current events</p>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';

            const icons = {
                resource_boom: '💰',
                anomaly: '⚠️',
                discovery: '🔍',
                faction: '🤝',
                research: '🔬',
                achievement: '🏆'
            };

            card.innerHTML = `
                <div class="card-header">
                    <span style="font-size: 1.5rem;">${icons[event.type] || '📢'}</span>
                    <span class="card-title">${event.title}</span>
                </div>
                <div class="card-description">${event.message}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">Turn ${event.turn}</div>
            `;

            this.elements.eventsList.appendChild(card);
        });
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
