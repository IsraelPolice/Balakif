import { NATIONS, BLOCS } from './nations.js';

export class WorldMap {
    constructor(container, onNationClick) {
        this.container = container;
        this.onNationClick = onNationClick;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
    }

    render(playerNation, conqueredNations = []) {
        // מפה פשוטה עם רשימת מדינות במקום SVG
        const mapHTML = `
            <div class="simple-map">
                <div class="map-grid">
                    ${Object.values(NATIONS).map(nation => {
                        const isPlayer = nation.id === playerNation;
                        const isConquered = conqueredNations.includes(nation.id);
                        const blocColor = BLOCS[nation.bloc]?.color || '#666';

                        let bgColor = blocColor;
                        if (isPlayer) bgColor = '#FFD700';
                        if (isConquered) bgColor = '#00ff88';

                        return `
                            <div class="map-nation-card"
                                 data-nation="${nation.id}"
                                 style="border-right: 4px solid ${bgColor}; ${isPlayer ? 'background: rgba(255, 215, 0, 0.1);' : ''}">
                                <div class="nation-flag">${nation.flag}</div>
                                <div class="nation-info">
                                    <div class="nation-name">${nation.name}</div>
                                    <div class="nation-details">
                                        <span class="detail-item">💰 $${(nation.demographics.gdp / 1000000000000).toFixed(1)}T</span>
                                        <span class="detail-item">⚔️ ${nation.military.strength}%</span>
                                    </div>
                                    ${isPlayer ? '<div class="player-badge">אתה</div>' : ''}
                                    ${isConquered ? '<div class="conquered-badge">נכבש</div>' : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = mapHTML;

        // Add click listeners
        this.container.querySelectorAll('.map-nation-card').forEach(card => {
            card.addEventListener('click', () => {
                const nationId = card.dataset.nation;
                if (this.onNationClick) {
                    this.onNationClick(nationId);
                }
            });
        });
    }

    zoom(delta) {
        this.scale = Math.max(0.5, Math.min(2, this.scale + delta));
        this.updateTransform();
    }

    resetZoom() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    updateTransform() {
        const mapGrid = this.container.querySelector('.map-grid');
        if (mapGrid) {
            mapGrid.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
        }
    }
}
