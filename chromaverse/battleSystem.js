// מערכת קרב טקטית מתקדמת
import { NATIONS } from './nations.js';

export class BattleSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.activeBattle = null;
        this.battleHistory = [];
    }

    // תכנון קרב לפני התקפה
    planBattle(enemyNationId, strategy = 'balanced') {
        const playerNation = NATIONS[this.engine.state.selectedNation];
        const enemyNation = NATIONS[enemyNationId];

        const battle = {
            id: `battle_${Date.now()}`,
            attacker: this.engine.state.selectedNation,
            defender: enemyNationId,
            strategy: strategy,
            phase: 'planning',
            startTime: Date.now(),
            rounds: [],
            deployedUnits: {
                infantry: 0,
                armor: 0,
                airForce: 0,
                navy: 0
            },
            enemyForces: {
                infantry: enemyNation.military.units.infantry * 0.7,
                armor: enemyNation.military.units.armor * 0.7,
                airForce: enemyNation.military.units.airForce * 0.7,
                navy: enemyNation.military.units.navy * 0.7
            },
            casualties: { player: 0, enemy: 0 },
            morale: { player: 100, enemy: 100 },
            terrainBonus: Math.random() * 20 - 10,
            weatherPenalty: Math.random() > 0.7 ? -15 : 0
        };

        // אסטרטגיות שונות
        const strategies = {
            blitzkrieg: {
                name: 'בליצקריג',
                description: 'מתקפה מהירה ואגרסיבית',
                speedBonus: +30,
                accuracyPenalty: -10,
                moraleImpact: +15
            },
            siege: {
                name: 'מצור',
                description: 'מתקפה ממושכת וממצה',
                speedBonus: -20,
                accuracyBonus: +20,
                resourceDrain: +50
            },
            guerrilla: {
                name: 'גרילה',
                description: 'תקיפות פתע וסיקור',
                evasionBonus: +40,
                damageReduction: -20,
                surpriseChance: +30
            },
            balanced: {
                name: 'מאוזן',
                description: 'גישה מאוזנת קלאסית',
                speedBonus: 0,
                accuracyBonus: 0,
                moraleImpact: 0
            },
            shock_awe: {
                name: 'הלם ותדהמה',
                description: 'הפצצה מסיבית ואינטנסיבית',
                damageBonus: +50,
                costMultiplier: 3,
                moraleImpact: +30
            }
        };

        battle.strategyDetails = strategies[strategy];
        this.activeBattle = battle;

        return battle;
    }

    // פריסת יחידות
    deployUnits(unitType, amount) {
        if (!this.activeBattle) return { success: false, message: 'אין קרב פעיל' };

        const state = this.engine.state;
        const available = state.military.units[unitType];

        if (amount > available) {
            return { success: false, message: 'אין מספיק יחידות זמינות' };
        }

        this.activeBattle.deployedUnits[unitType] = amount;
        return { success: true, message: `${amount} ${this.getUnitName(unitType)} נפרסו` };
    }

    // התחלת הקרב
    async startBattle() {
        if (!this.activeBattle) return { success: false };

        this.activeBattle.phase = 'active';
        const results = [];

        // סימולציה של 3-5 סבבים
        const numRounds = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < numRounds; i++) {
            const round = await this.simulateRound(i + 1);
            results.push(round);
            this.activeBattle.rounds.push(round);

            // בדיקה אם הקרב הסתיים מוקדם
            if (round.battleEnded) break;

            // השהייה קצרה בין סבבים לאנימציה
            await this.delay(2000);
        }

        // חישוב תוצאות סופיות
        const finalResult = this.calculateFinalResult();
        this.activeBattle.phase = 'completed';
        this.activeBattle.result = finalResult;

        // שמירה בהיסטוריה
        this.battleHistory.push({...this.activeBattle});

        // החלת תוצאות על המשחק
        this.applyBattleResults(finalResult);

        return {
            success: true,
            battle: this.activeBattle,
            result: finalResult
        };
    }

    async simulateRound(roundNumber) {
        const battle = this.activeBattle;
        const state = this.engine.state;
        const playerNation = NATIONS[state.selectedNation];
        const enemyNation = NATIONS[battle.defender];

        // חישוב כוח יחסי
        const playerPower = this.calculateCombatPower(battle.deployedUnits, playerNation.military.strength);
        const enemyPower = this.calculateCombatPower(battle.enemyForces, enemyNation.military.strength);

        // בונוסים מאסטרטגיה
        const stratBonus = battle.strategyDetails;
        const effectivePlayerPower = playerPower * (1 + (stratBonus.damageBonus || 0) / 100);
        const effectiveEnemyPower = enemyPower * (1 - (stratBonus.evasionBonus || 0) / 100);

        // הטלת קוביה לקרב
        const playerRoll = Math.random() * effectivePlayerPower * (battle.morale.player / 100);
        const enemyRoll = Math.random() * effectiveEnemyPower * (battle.morale.enemy / 100);

        // קביעת מנצח הסבב
        const roundWinner = playerRoll > enemyRoll ? 'player' : 'enemy';

        // נזקים
        const baseDamage = Math.abs(playerRoll - enemyRoll);
        const playerCasualties = roundWinner === 'enemy' ? Math.floor(baseDamage * 100) : Math.floor(baseDamage * 30);
        const enemyCasualties = roundWinner === 'player' ? Math.floor(baseDamage * 100) : Math.floor(baseDamage * 30);

        battle.casualties.player += playerCasualties;
        battle.casualties.enemy += enemyCasualties;

        // השפעה על מורל
        if (roundWinner === 'player') {
            battle.morale.player = Math.min(100, battle.morale.player + 5);
            battle.morale.enemy = Math.max(0, battle.morale.enemy - 10);
        } else {
            battle.morale.enemy = Math.min(100, battle.morale.enemy + 5);
            battle.morale.player = Math.max(0, battle.morale.player - 10);
        }

        // אירועים מיוחדים
        const specialEvent = this.generateBattleEvent(roundNumber, roundWinner);

        // בדיקה אם הקרב הסתיים
        const battleEnded = battle.morale.player <= 0 || battle.morale.enemy <= 0;

        return {
            round: roundNumber,
            winner: roundWinner,
            playerPower: playerRoll.toFixed(0),
            enemyPower: enemyRoll.toFixed(0),
            playerCasualties,
            enemyCasualties,
            morale: {...battle.morale},
            specialEvent,
            battleEnded,
            timestamp: Date.now()
        };
    }

    generateBattleEvent(roundNumber, winner) {
        const events = [
            { text: '💥 הפצצה אווירית מדויקת!', bonus: winner === 'player' ? 10 : -10 },
            { text: '🎯 צלפים מסלקים מפקדים!', bonus: winner === 'player' ? 15 : -15 },
            { text: '🔥 טנקים פורצים את הקווים!', bonus: winner === 'player' ? 20 : -20 },
            { text: '⚡ תקיפת סייבר משתקת תקשורת!', bonus: winner === 'player' ? 12 : -12 },
            { text: '🚁 מסוקי קרב תומכים מהאוויר!', bonus: winner === 'player' ? 8 : -8 },
            { text: '💣 פגיעה במחסן תחמושת!', bonus: winner === 'player' ? 25 : -25 },
            { text: '🌧️ סערה מכבידה על התנועה', bonus: 0 },
            { text: '🌙 קרב לילה מורכב', bonus: -5 }
        ];

        if (Math.random() > 0.6) {
            return events[Math.floor(Math.random() * events.length)];
        }

        return null;
    }

    calculateCombatPower(units, baseStrength) {
        const weights = {
            infantry: 1,
            armor: 3,
            airForce: 5,
            navy: 4
        };

        let power = 0;
        for (const [type, count] of Object.entries(units)) {
            power += count * (weights[type] || 1);
        }

        return power * (baseStrength / 100);
    }

    calculateFinalResult() {
        const battle = this.activeBattle;

        // מי ניצח?
        const playerWon = battle.morale.enemy <= 0 || battle.casualties.enemy > battle.casualties.player * 2;

        // דירוג הניצחון
        let victoryLevel = 'marginal';
        const casualtyRatio = battle.casualties.enemy / Math.max(battle.casualties.player, 1);

        if (playerWon) {
            if (casualtyRatio > 3) victoryLevel = 'decisive';
            else if (casualtyRatio > 2) victoryLevel = 'major';
            else if (casualtyRatio > 1.5) victoryLevel = 'clear';
        } else {
            victoryLevel = 'defeat';
        }

        // תוצאות
        return {
            victory: playerWon,
            victoryLevel,
            territoryCaptured: playerWon && casualtyRatio > 2,
            resourcesGained: playerWon ? Math.floor(Math.random() * 5000000000) : 0,
            supportChange: playerWon ? +15 : -20,
            stabilityChange: playerWon ? +5 : -10,
            casualties: {...battle.casualties},
            duration: Date.now() - battle.startTime,
            mvpUnit: this.getMVPUnit()
        };
    }

    getMVPUnit() {
        const units = ['חיל רגלים', 'שריון', 'חיל אוויר', 'חיל ים'];
        return units[Math.floor(Math.random() * units.length)];
    }

    applyBattleResults(result) {
        const state = this.engine.state;

        // נפגעים
        const totalDeployed = Object.values(this.activeBattle.deployedUnits).reduce((a, b) => a + b, 0);
        const casualtyPercent = result.casualties.player / Math.max(totalDeployed, 1);

        for (const [type, deployed] of Object.entries(this.activeBattle.deployedUnits)) {
            const lost = Math.floor(deployed * casualtyPercent);
            state.military.units[type] = Math.max(0, state.military.units[type] - lost);
        }

        // משאבים
        if (result.resourcesGained) {
            state.resources.treasury += result.resourcesGained;
        } else {
            state.resources.treasury -= result.casualties.player * 100000; // עלות נפגע
        }

        // תמיכה ויציבות
        state.internal.support = Math.max(0, Math.min(100, state.internal.support + result.supportChange));
        state.internal.stability = Math.max(0, Math.min(100, state.internal.stability + result.stabilityChange));

        // כיבוש שטח
        if (result.territoryCaptured) {
            const enemyNation = NATIONS[this.activeBattle.defender];
            state.territories.push({
                nationId: this.activeBattle.defender,
                name: enemyNation.name,
                population: enemyNation.demographics.population * 0.1,
                gdp: enemyNation.demographics.gdp * 0.1,
                integration: 0,
                originalOwner: false,
                captureDate: Date.now()
            });

            // הסרת מלחמה
            state.diplomacy.wars = state.diplomacy.wars.filter(w => w.target !== this.activeBattle.defender);
        }

        // עדכון כוח צבאי
        state.military.strength = Math.max(0, state.military.strength + (result.victory ? 2 : -5));
        state.military.readiness = Math.max(20, state.military.readiness - 15);

        this.engine.notifyListeners();
    }

    getUnitName(type) {
        const names = {
            infantry: 'חיילי רגלים',
            armor: 'טנקים',
            airForce: 'מטוסי קרב',
            navy: 'ספינות'
        };
        return names[type] || type;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // קבלת סיכום קרב לממשק
    getBattleSummaryHTML(result) {
        const victoryMessages = {
            decisive: '🏆 ניצחון מוחץ!',
            major: '⭐ ניצחון גדול!',
            clear: '✅ ניצחון ברור',
            marginal: '~ ניצחון שולי',
            defeat: '❌ תבוסה'
        };

        return `
            <div class="battle-summary">
                <h2>${victoryMessages[result.victoryLevel]}</h2>
                <div class="battle-stats">
                    <div class="stat">
                        <span class="stat-label">נפגעים שלך:</span>
                        <span class="stat-value">${result.casualties.player.toLocaleString()}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">נפגעי האויב:</span>
                        <span class="stat-value">${result.casualties.enemy.toLocaleString()}</span>
                    </div>
                    ${result.territoryCaptured ? '<div class="stat special">🎖️ שטח נכבש!</div>' : ''}
                    ${result.resourcesGained ? `<div class="stat special">💰 +$${(result.resourcesGained / 1000000000).toFixed(1)}B</div>` : ''}
                </div>
                <div class="mvp">יחידת הכוכב: ${result.mvpUnit}</div>
            </div>
        `;
    }
}
