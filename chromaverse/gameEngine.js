import { NATIONS, BLOCS } from './nations.js';

export class GameEngine {
    constructor() {
        this.state = this.getInitialState();
        this.listeners = [];
    }

    getInitialState() {
        return {
            playerName: 'Leader',
            selectedNation: null,
            currentTurn: 1,
            turnYear: 2025,
            turnMonth: 1,

            resources: {
                gdp: 0,
                militaryBudget: 0,
                treasury: 0
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
                tradeDeals: [],
                wars: []
            },

            internal: {
                support: 75,
                stability: 100,
                leftFaction: 50,
                rightFaction: 50
            },

            territories: [],
            conquests: [],
            events: [],
            technologies: [],

            stats: {
                totalGDP: 0,
                territoryPercentage: 0,
                warsWon: 0,
                nationsConquered: 0
            },

            saveId: null
        };
    }

    selectNation(nationId) {
        const nation = NATIONS[nationId];
        if (!nation) {
            return { success: false, message: 'Nation not found!' };
        }

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
            nationId: nationId,
            name: nation.name,
            area: nation.demographics.area,
            population: nation.demographics.population,
            originalOwner: true
        }];

        this.state.stats.totalGDP = nation.demographics.gdp;
        this.state.stats.territoryPercentage = this.calculateTerritoryPercentage();

        this.addEvent({
            type: 'gameStart',
            title: `Welcome, Leader of ${nation.name}!`,
            message: `You have taken control of ${nation.title}. The year is 2025.`,
            importance: 'high'
        });

        this.notifyListeners();
        return { success: true, nation };
    }

    getNation(nationId = null) {
        const id = nationId || this.state.selectedNation;
        return NATIONS[id];
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
            return { success: false, message: 'Insufficient funds!' };
        }

        const currentRelation = this.getRelation(targetNationId);
        if (currentRelation >= 100) {
            return { success: false, message: 'Relations already at maximum!' };
        }

        this.state.resources.treasury -= cost;
        this.state.diplomacy.relations[targetNationId] = Math.min(100, currentRelation + amount);

        const targetNation = this.getNation(targetNationId);
        this.addEvent({
            type: 'diplomacy',
            title: 'Diplomatic Success',
            message: `Relations with ${targetNation.name} improved to ${this.state.diplomacy.relations[targetNationId]}%`,
            importance: 'medium'
        });

        this.notifyListeners();
        return { success: true };
    }

    formAlliance(targetNationId) {
        const relation = this.getRelation(targetNationId);
        if (relation < 70) {
            return { success: false, message: 'Relations too low! Need 70+ to form alliance.' };
        }

        if (this.state.diplomacy.alliances.includes(targetNationId)) {
            return { success: false, message: 'Already allied!' };
        }

        this.state.diplomacy.alliances.push(targetNationId);

        const targetNation = this.getNation(targetNationId);
        this.addEvent({
            type: 'alliance',
            title: 'Alliance Formed!',
            message: `${this.getNation().name} and ${targetNation.name} have formed an alliance!`,
            importance: 'high'
        });

        this.notifyListeners();
        return { success: true };
    }

    declareWar(targetNationId) {
        if (this.state.diplomacy.wars.find(w => w.target === targetNationId)) {
            return { success: false, message: 'Already at war!' };
        }

        const targetNation = this.getNation(targetNationId);
        const playerNation = this.getNation();

        this.state.diplomacy.wars.push({
            target: targetNationId,
            startTurn: this.state.currentTurn,
            playerStrength: this.state.military.strength,
            enemyStrength: targetNation.military.strength,
            battles: []
        });

        this.state.diplomacy.relations[targetNationId] = -100;
        this.state.internal.support -= 15;

        this.addEvent({
            type: 'war',
            title: 'War Declared!',
            message: `${playerNation.name} has declared war on ${targetNation.name}!`,
            importance: 'critical'
        });

        const blocReaction = this.checkBlocReactions(targetNationId);
        if (blocReaction.escalation) {
            this.addEvent({
                type: 'blocWar',
                title: 'BLOC CONFLICT!',
                message: blocReaction.message,
                importance: 'critical'
            });
        }

        this.notifyListeners();
        return { success: true };
    }

    checkBlocReactions(targetNationId) {
        const targetNation = this.getNation(targetNationId);
        const playerNation = this.getNation();

        if (targetNation.bloc !== playerNation.bloc && targetNation.bloc !== 'Neutral' && playerNation.bloc !== 'Neutral') {
            return {
                escalation: true,
                message: `Warning: ${BLOCS[targetNation.bloc].name} and ${BLOCS[playerNation.bloc].name} are now in conflict! Other bloc members may intervene.`
            };
        }

        return { escalation: false };
    }

    conductBattle(warIndex) {
        const war = this.state.diplomacy.wars[warIndex];
        if (!war) return { success: false, message: 'War not found!' };

        const targetNation = this.getNation(war.target);

        const playerPower = this.state.military.strength + (Math.random() * 20 - 10);
        const enemyPower = war.enemyStrength + (Math.random() * 20 - 10);

        const playerWins = playerPower > enemyPower;
        const casualtyRate = 0.05 + (Math.random() * 0.05);

        if (playerWins) {
            this.state.military.units.infantry = Math.floor(this.state.military.units.infantry * (1 - casualtyRate));
            this.state.military.units.armor = Math.floor(this.state.military.units.armor * (1 - casualtyRate * 0.8));

            war.battles.push({
                turn: this.state.currentTurn,
                result: 'victory',
                casualties: casualtyRate
            });

            if (war.battles.filter(b => b.result === 'victory').length >= 3) {
                return this.conquerNation(war.target, warIndex);
            }

            this.addEvent({
                type: 'battleVictory',
                title: 'Battle Won!',
                message: `Your forces have defeated ${targetNation.name} in battle! ${war.battles.filter(b => b.result === 'victory').length}/3 victories.`,
                importance: 'high'
            });
        } else {
            this.state.military.units.infantry = Math.floor(this.state.military.units.infantry * (1 - casualtyRate * 1.5));
            this.state.military.units.armor = Math.floor(this.state.military.units.armor * (1 - casualtyRate * 1.2));
            this.state.internal.support -= 10;

            war.battles.push({
                turn: this.state.currentTurn,
                result: 'defeat',
                casualties: casualtyRate * 1.5
            });

            this.addEvent({
                type: 'battleDefeat',
                title: 'Battle Lost',
                message: `Your forces were defeated by ${targetNation.name}. Morale is declining.`,
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
            conqueredTurn: this.state.currentTurn,
            integration: 0
        });

        this.state.conquests.push({
            nation: targetNationId,
            turn: this.state.currentTurn,
            year: this.state.turnYear
        });

        this.state.resources.gdp += Math.floor(targetNation.demographics.gdp * 0.3);
        this.state.stats.nationsConquered++;
        this.state.stats.warsWon++;
        this.state.stats.territoryPercentage = this.calculateTerritoryPercentage();

        this.state.diplomacy.wars.splice(warIndex, 1);

        Object.keys(NATIONS).forEach(nationId => {
            if (NATIONS[nationId].relations && NATIONS[nationId].relations[targetNationId] > 50) {
                this.state.diplomacy.relations[nationId] = Math.max(-100, (this.state.diplomacy.relations[nationId] || 0) - 30);
            }
        });

        this.addEvent({
            type: 'conquest',
            title: 'NATION CONQUERED!',
            message: `${targetNation.name} has fallen! Territory, resources, and population absorbed.`,
            importance: 'critical'
        });

        this.checkVictoryConditions();

        this.notifyListeners();
        return { success: true, conquered: true };
    }

    investEconomy() {
        const cost = Math.floor(this.state.resources.gdp * 0.05);
        if (this.state.resources.treasury < cost) {
            return { success: false, message: 'Insufficient funds!' };
        }

        this.state.resources.treasury -= cost;
        this.state.resources.gdp = Math.floor(this.state.resources.gdp * 1.05);
        this.state.internal.support += 5;

        this.addEvent({
            type: 'economy',
            title: 'Economic Investment',
            message: 'GDP increased by 5% through infrastructure investment!',
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
            return { success: false, message: 'Insufficient funds!' };
        }

        this.state.resources.treasury -= totalCost;
        this.state.military.units[unitType] += quantity;
        this.state.military.strength = this.calculateMilitaryStrength();

        this.addEvent({
            type: 'military',
            title: 'Military Expansion',
            message: `Recruited ${quantity} ${unitType} units. Strength: ${this.state.military.strength}%`,
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

    endTurn() {
        this.state.currentTurn++;
        this.state.turnMonth++;

        if (this.state.turnMonth > 12) {
            this.state.turnMonth = 1;
            this.state.turnYear++;
        }

        const gdpGrowth = Math.floor(this.state.resources.gdp * 0.02);
        this.state.resources.gdp += gdpGrowth;
        this.state.resources.treasury += Math.floor(this.state.resources.gdp * 0.05);
        this.state.resources.militaryBudget = Math.floor(this.state.resources.gdp * 0.03);

        this.state.territories.forEach(territory => {
            if (!territory.originalOwner && territory.integration < 100) {
                territory.integration += 5;
                if (Math.random() < 0.1 && territory.integration < 50) {
                    this.addEvent({
                        type: 'revolt',
                        title: 'Unrest in Conquered Territory',
                        message: `${territory.name} is experiencing resistance.`,
                        importance: 'medium'
                    });
                    this.state.internal.support -= 5;
                }
            }
        });

        if (Math.random() < 0.3) {
            this.generateRandomEvent();
        }

        this.state.events = this.state.events.filter(e =>
            this.state.currentTurn - e.turn < 10
        );

        this.checkVictoryConditions();
        this.checkDefeatConditions();

        this.notifyListeners();
    }

    generateRandomEvent() {
        const eventTypes = [
            {
                type: 'economicBoom',
                title: 'Economic Boom!',
                message: 'Strong market performance boosted your GDP!',
                effect: () => {
                    this.state.resources.gdp = Math.floor(this.state.resources.gdp * 1.10);
                    this.state.internal.support += 10;
                }
            },
            {
                type: 'recession',
                title: 'Economic Recession',
                message: 'Market downturn affected your economy.',
                effect: () => {
                    this.state.resources.gdp = Math.floor(this.state.resources.gdp * 0.95);
                    this.state.internal.support -= 10;
                }
            },
            {
                type: 'nuclearTest',
                title: 'Nuclear Test Detected',
                message: 'Intelligence reports rogue state nuclear test.',
                effect: () => {
                    this.state.internal.rightFaction += 10;
                }
            },
            {
                type: 'tradeOpportunity',
                title: 'Trade Opportunity',
                message: 'A nation offers lucrative trade deals.',
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
            turn: event.turn || this.state.currentTurn,
            year: event.year || this.state.turnYear,
            month: event.month || this.state.turnMonth
        });

        if (this.state.events.length > 20) {
            this.state.events = this.state.events.slice(0, 20);
        }
    }

    checkVictoryConditions() {
        const conditions = [];

        if (this.state.stats.territoryPercentage >= 50) {
            conditions.push({ type: 'territorial', message: 'Achieved 50% global territory control!' });
        }

        if (this.state.resources.gdp >= 10000000000000) {
            conditions.push({ type: 'economic', message: 'Achieved 10 Trillion GDP!' });
        }

        if (this.state.turnYear >= 2035) {
            conditions.push({ type: 'survival', message: 'Survived to 2035!' });
        }

        if (conditions.length > 0) {
            this.state.victory = {
                achieved: true,
                conditions,
                turn: this.state.currentTurn,
                year: this.state.turnYear
            };

            this.addEvent({
                type: 'victory',
                title: 'VICTORY ACHIEVED!',
                message: conditions.map(c => c.message).join(' '),
                importance: 'critical'
            });
        }
    }

    checkDefeatConditions() {
        if (this.state.resources.gdp < 10000000000) {
            this.state.defeat = {
                reason: 'Economic Collapse',
                message: 'Your economy has completely collapsed.'
            };
        }

        if (this.state.internal.support < 20) {
            this.state.defeat = {
                reason: 'Popular Revolt',
                message: 'Government overthrown by popular uprising.'
            };
        }
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
}
