import { NATIONS, BLOCS } from './nations.js';

export class GameEngine {
    constructor() {
        this.state = this.getInitialState();
        this.listeners = [];
        this.timers = {};
        this.startRealTime();
    }

    getInitialState() {
        return {
            playerName: 'מנהיג',
            selectedNation: null,
            startTime: Date.now(),
            
            resources: {
                gdp: 0,
                militaryBudget: 0,
                treasury: 0,
                growthRate: 2.0
            },

            military: {
                strength: 0,
                units: {
                    infantry: 0,
                    armor: 0,
                    airForce: 0,
                    navy: 0
                },
                readiness: 100
            },

            diplomacy: {
                relations: {},
                alliances: [],
                wars: []
            },

            internal: {
                support: 75,
                stability: 100
            },

            territories: [],
            conquests: [],
            events: [],

            stats: {
                totalGDP: 0,
                territoryPercentage: 0,
                warsWon: 0,
                nationsConquered: 0
            },

            saveId: null
        };
    }

    startRealTime() {
        // Income every 5 seconds
        this.timers.income = setInterval(() => {
            if (this.state.selectedNation) {
                const incomeRate = this.state.resources.gdp * 0.0005; // 0.05% every 5 sec
                this.state.resources.treasury += incomeRate;
                
                // GDP growth
                const growthAmount = this.state.resources.gdp * (this.state.resources.growthRate / 100 / 720); // Per 5 sec
                this.state.resources.gdp += growthAmount;
                
                this.notifyListeners();
            }
        }, 5000);

        // Events every 30 seconds
        this.timers.events = setInterval(() => {
            if (this.state.selectedNation && Math.random() < 0.3) {
                this.generateRandomEvent();
            }
        }, 30000);

        // Auto-save every 2 minutes
        this.timers.autoSave = setInterval(() => {
            if (this.state.selectedNation && this.state.saveId) {
                this.autoSave();
            }
        }, 120000);
    }

    stopRealTime() {
        Object.values(this.timers).forEach(timer => clearInterval(timer));
    }

    selectNation(nationId) {
        const nation = NATIONS[nationId];
        if (!nation) return { success: false, message: 'מדינה לא נמצאה!' };

        this.state.selectedNation = nationId;
        this.state.resources.gdp = nation.demographics.gdp;
        this.state.resources.militaryBudget = Math.floor(nation.demographics.gdp * 0.03);
        this.state.resources.treasury = Math.floor(nation.demographics.gdp * 0.1);

        this.state.military = {
            strength: nation.military.strength,
            units: { ...nation.military.units },
            readiness: 100
        };

        this.state.diplomacy.relations = { ...nation.relations };
        this.state.territories = [{
            nationId,
            name: nation.name,
            area: nation.demographics.area,
            population: nation.demographics.population,
            originalOwner: true
        }];

        this.state.stats.totalGDP = nation.demographics.gdp;
        this.state.stats.territoryPercentage = this.calculateTerritoryPercentage();

        this.addEvent({
            type: 'gameStart',
            title: `ברוך הבא, מנהיג ${nation.name}!`,
            message: `${nation.title}. המשחק פועל בזמן אמת!`,
            importance: 'high'
        });

        this.notifyListeners();
        return { success: true, nation };
    }

    getNation(nationId = null) {
        return NATIONS[nationId || this.state.selectedNation];
    }

    calculateTerritoryPercentage() {
        const totalWorldArea = Object.values(NATIONS).reduce((sum, n) => sum + n.demographics.area, 0);
        const controlledArea = this.state.territories.reduce((sum, t) => sum + t.area, 0);
        return (controlledArea / totalWorldArea) * 100;
    }

    getRelation(targetNationId) {
        return this.state.diplomacy.relations[targetNationId] || 0;
    }

    improveRelations(targetNationId, amount = 10) {
        const cost = 1000000000;
        if (this.state.resources.treasury < cost) {
            return { success: false, message: 'אין מספיק כספים!' };
        }

        const currentRelation = this.getRelation(targetNationId);
        if (currentRelation >= 100) {
            return { success: false, message: 'היחסים כבר במקסימום!' };
        }

        this.state.resources.treasury -= cost;
        this.state.diplomacy.relations[targetNationId] = Math.min(100, currentRelation + amount);

        const targetNation = this.getNation(targetNationId);
        this.addEvent({
            type: 'diplomacy',
            title: 'הצלחה דיפלומטית',
            message: `היחסים עם ${targetNation.name} שופרו ל-${this.state.diplomacy.relations[targetNationId]}%`,
            importance: 'medium'
        });

        this.notifyListeners();
        return { success: true };
    }

    formAlliance(targetNationId) {
        const relation = this.getRelation(targetNationId);
        if (relation < 70) {
            return { success: false, message: 'היחסים נמוכים מדי! נדרש 70+ כדי ליצור ברית.' };
        }

        if (this.state.diplomacy.alliances.includes(targetNationId)) {
            return { success: false, message: 'כבר בברית!' };
        }

        this.state.diplomacy.alliances.push(targetNationId);

        const targetNation = this.getNation(targetNationId);
        this.addEvent({
            type: 'alliance',
            title: 'ברית נוצרה!',
            message: `${this.getNation().name} ו-${targetNation.name} יצרו ברית!`,
            importance: 'high'
        });

        this.notifyListeners();
        return { success: true };
    }

    declareWar(targetNationId) {
        if (this.state.diplomacy.wars.find(w => w.target === targetNationId)) {
            return { success: false, message: 'כבר במלחמה!' };
        }

        const targetNation = this.getNation(targetNationId);
        const playerNation = this.getNation();

        this.state.diplomacy.wars.push({
            target: targetNationId,
            startTime: Date.now(),
            playerStrength: this.state.military.strength,
            enemyStrength: targetNation.military.strength,
            battles: []
        });

        this.state.diplomacy.relations[targetNationId] = -100;
        this.state.internal.support -= 15;

        this.addEvent({
            type: 'war',
            title: 'מלחמה הוכרזה!',
            message: `${playerNation.name} הכריז מלחמה על ${targetNation.name}!`,
            importance: 'critical'
        });

        this.notifyListeners();
        return { success: true };
    }

    conductBattle(warIndex) {
        const war = this.state.diplomacy.wars[warIndex];
        if (!war) return { success: false, message: 'מלחמה לא נמצאה!' };

        const targetNation = this.getNation(war.target);
        const playerPower = this.state.military.strength + (Math.random() * 20 - 10);
        const enemyPower = war.enemyStrength + (Math.random() * 20 - 10);

        const playerWins = playerPower > enemyPower;
        const casualtyRate = 0.05 + (Math.random() * 0.05);

        if (playerWins) {
            this.state.military.units.infantry = Math.floor(this.state.military.units.infantry * (1 - casualtyRate));
            this.state.military.units.armor = Math.floor(this.state.military.units.armor * (1 - casualtyRate * 0.8));

            war.battles.push({ time: Date.now(), result: 'victory', casualties: casualtyRate });

            if (war.battles.filter(b => b.result === 'victory').length >= 3) {
                return this.conquerNation(war.target, warIndex);
            }

            this.addEvent({
                type: 'battleVictory',
                title: 'ניצחון בקרב!',
                message: `הכוחות שלך ניצחו את ${targetNation.name}! ${war.battles.filter(b => b.result === 'victory').length}/3 ניצחונות.`,
                importance: 'high'
            });
        } else {
            this.state.military.units.infantry = Math.floor(this.state.military.units.infantry * (1 - casualtyRate * 1.5));
            this.state.internal.support -= 10;

            war.battles.push({ time: Date.now(), result: 'defeat', casualties: casualtyRate * 1.5 });

            this.addEvent({
                type: 'battleDefeat',
                title: 'הפסד בקרב',
                message: `הכוחות שלך הובסו על ידי ${targetNation.name}. המורל יורד.`,
                importance: 'high'
            });
        }

        this.notifyListeners();
        return { success: true, victory: playerWins };
    }

    conquerNation(targetNationId, warIndex) {
        const targetNation = this.getNation(targetNationId);

        this.state.territories.push({
            nationId: targetNationId,
            name: targetNation.name,
            area: targetNation.demographics.area,
            population: targetNation.demographics.population,
            originalOwner: false,
            conqueredTime: Date.now(),
            integration: 0
        });

        this.state.conquests.push({ nation: targetNationId, time: Date.now() });
        this.state.resources.gdp += Math.floor(targetNation.demographics.gdp * 0.3);
        this.state.stats.nationsConquered++;
        this.state.stats.warsWon++;
        this.state.stats.territoryPercentage = this.calculateTerritoryPercentage();

        this.state.diplomacy.wars.splice(warIndex, 1);

        this.addEvent({
            type: 'conquest',
            title: 'מדינה נכבשה!',
            message: `${targetNation.name} נפל! שטח, משאבים ואוכלוסייה נספחו.`,
            importance: 'critical'
        });

        this.checkVictoryConditions();
        this.notifyListeners();
        return { success: true, conquered: true };
    }

    investEconomy() {
        const cost = Math.floor(this.state.resources.gdp * 0.05);
        if (this.state.resources.treasury < cost) {
            return { success: false, message: 'אין מספיק כספים!' };
        }

        this.state.resources.treasury -= cost;
        this.state.resources.gdp = Math.floor(this.state.resources.gdp * 1.05);
        this.state.internal.support += 5;

        this.addEvent({
            type: 'economy',
            title: 'השקעה כלכלית',
            message: 'תמ"ג גדל ב-5% דרך השקעה בתשתיות!',
            importance: 'medium'
        });

        this.notifyListeners();
        return { success: true };
    }

    recruitMilitary(unitType, quantity) {
        const costs = {
            infantry: 50000,
            armor: 5000000,
            airForce: 50000000,
            navy: 200000000
        };

        const totalCost = costs[unitType] * quantity;
        if (this.state.resources.treasury < totalCost) {
            return { success: false, message: 'אין מספיק כספים!' };
        }

        this.state.resources.treasury -= totalCost;
        this.state.military.units[unitType] += quantity;
        this.state.military.strength = this.calculateMilitaryStrength();

        this.addEvent({
            type: 'military',
            title: 'הרחבת צבא',
            message: `גויסו ${quantity} יחידות ${unitType}. כוח: ${this.state.military.strength}%`,
            importance: 'medium'
        });

        this.notifyListeners();
        return { success: true };
    }

    calculateMilitaryStrength() {
        const base = this.getNation().military.strength;
        const unitBonus = Math.floor(
            (this.state.military.units.infantry / 10000) +
            (this.state.military.units.armor / 100) +
            (this.state.military.units.airForce / 10) +
            (this.state.military.units.navy / 5)
        );
        return Math.min(100, base + unitBonus);
    }

    generateRandomEvent() {
        const eventTypes = [
            {
                type: 'economicBoom',
                title: 'פריחה כלכלית!',
                message: 'ביצועים חזקים בשוק הגבירו את התמ"ג שלך!',
                effect: () => {
                    this.state.resources.gdp = Math.floor(this.state.resources.gdp * 1.10);
                    this.state.internal.support += 10;
                }
            },
            {
                type: 'recession',
                title: 'מיתון כלכלי',
                message: 'ירידה בשוק השפיעה על הכלכלה שלך.',
                effect: () => {
                    this.state.resources.gdp = Math.floor(this.state.resources.gdp * 0.95);
                    this.state.internal.support -= 10;
                }
            },
            {
                type: 'nuclearTest',
                title: 'נבדק ניסוי גרעיני',
                message: 'מודיעין מדווח על ניסוי גרעיני של מדינת נוכלים.',
                effect: () => {}
            },
            {
                type: 'tradeOpportunity',
                title: 'הזדמנות סחר',
                message: 'מדינה מציעה עסקאות סחר משתלמות.',
                effect: () => {
                    this.state.resources.treasury += 5000000000;
                }
            }
        ];

        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        this.addEvent(event);
        if (event.effect) event.effect();
    }

    addEvent(event) {
        this.state.events.unshift({
            ...event,
            id: `event_${Date.now()}_${Math.random()}`,
            time: Date.now()
        });

        if (this.state.events.length > 20) {
            this.state.events = this.state.events.slice(0, 20);
        }
    }

    checkVictoryConditions() {
        const conditions = [];

        if (this.state.stats.territoryPercentage >= 50) {
            conditions.push({ type: 'territorial', message: 'שליטה על 50% מהשטח העולמי!' });
        }

        if (this.state.resources.gdp >= 10000000000000) {
            conditions.push({ type: 'economic', message: 'תמ"ג של 10 טריליון דולר!' });
        }

        if (conditions.length > 0) {
            this.state.victory = {
                achieved: true,
                conditions,
                time: Date.now()
            };

            this.addEvent({
                type: 'victory',
                title: 'ניצחון!',
                message: conditions.map(c => c.message).join(' '),
                importance: 'critical'
            });
        }
    }

    autoSave() {
        // Will be called by UI
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.state));
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }

    destroy() {
        this.stopRealTime();
    }
}
