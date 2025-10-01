import { getLeaderImage, getLeaderName, getLeaderDescription } from './leaderImages.js';

export class LeaderCard {
    static create(nationId, size = 'medium') {
        const imageUrl = getLeaderImage(nationId);
        const leaderName = getLeaderName(nationId);
        const description = getLeaderDescription(nationId);

        const sizeClasses = {
            small: 'leader-card-small',
            medium: 'leader-card-medium',
            large: 'leader-card-large'
        };

        return `
            <div class="leader-card ${sizeClasses[size]}" data-nation="${nationId}">
                <div class="leader-image-container">
                    <img src="${imageUrl}"
                         alt="${leaderName}"
                         class="leader-image"
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27150%27 height=%27200%27%3E%3Crect fill=%27%23333%27 width=%27150%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 fill=%27%23fff%27 text-anchor=%27middle%27%3E👤%3C/text%3E%3C/svg%3E'">
                    <div class="leader-glow"></div>
                </div>
                ${size !== 'small' ? `
                    <div class="leader-info">
                        <h4 class="leader-name">${leaderName}</h4>
                        ${size === 'large' ? `<p class="leader-description">${description}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    static createModal(nationId, nation, relation, onAction) {
        const imageUrl = getLeaderImage(nationId);
        const leaderName = getLeaderName(nationId);
        const description = getLeaderDescription(nationId);

        const relationColor = relation > 50 ? '#00ff88' : relation < 0 ? '#ff0055' : '#ffd700';
        const relationText = relation > 70 ? 'ידידותיים' : relation > 30 ? 'ניטרליים' : relation > -30 ? 'מתוחים' : 'עוינים';

        return `
            <div class="leader-modal-content">
                <div class="leader-modal-header">
                    <img src="${imageUrl}" alt="${leaderName}" class="leader-modal-image">
                    <div class="leader-modal-title">
                        <h2>${nation.name}</h2>
                        <h3>${nation.title}</h3>
                        <p class="leader-subtitle">${leaderName}</p>
                    </div>
                </div>

                <div class="leader-modal-body">
                    <div class="leader-backstory">
                        <h4>רקע</h4>
                        <p>${nation.backstory}</p>
                    </div>

                    <div class="leader-stats-grid">
                        <div class="stat-box">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value">${(nation.demographics.population / 1000000).toFixed(1)}M</div>
                            <div class="stat-label">אוכלוסייה</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value">$${(nation.demographics.gdp / 1000000000000).toFixed(1)}T</div>
                            <div class="stat-label">תמ"ג</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-icon">⚔️</div>
                            <div class="stat-value">${nation.military.strength}%</div>
                            <div class="stat-label">כוח צבאי</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-icon">🌍</div>
                            <div class="stat-value">${(nation.demographics.area / 1000).toFixed(0)}K</div>
                            <div class="stat-label">שטח (קמ"ר)</div>
                        </div>
                    </div>

                    <div class="relation-bar-container">
                        <h4>יחסים דיפלומטיים</h4>
                        <div class="relation-bar">
                            <div class="relation-fill" style="width: ${(relation + 100) / 2}%; background: ${relationColor};"></div>
                        </div>
                        <div class="relation-label" style="color: ${relationColor};">
                            ${relationText} (${relation > 0 ? '+' : ''}${relation}%)
                        </div>
                    </div>

                    <div class="leader-actions">
                        <button class="btn-primary" onclick="window.game.ui.improveRelations('${nationId}')">
                            <span>🤝</span>
                            <span>שפר יחסים</span>
                            <span class="btn-cost">$1B</span>
                        </button>
                        ${relation >= 70 ? `
                            <button class="btn-success" onclick="window.game.ui.formAlliance('${nationId}')">
                                <span>🛡️</span>
                                <span>צור ברית</span>
                            </button>
                        ` : ''}
                        <button class="btn-danger" onclick="window.game.ui.confirmWar('${nationId}')">
                            <span>⚔️</span>
                            <span>הכרז מלחמה</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
