export class GameEngine {
    constructor() {
        this.state = this.getInitialState();
        this.listeners = [];
    }

    getInitialState() {
        return {
            playerName: 'Architect',
            currentTurn: 1,
            resources: {
                multiverseEnergy: 1000,
                realityShards: 50,
                knowledgePoints: 100
            },
            stats: {
                reputation: 0,
                timelineStability: 100,
                discoveredDimensions: 1
            },
            dimensions: [this.generateDimension('prime', 1, 'Standard')],
            currentDimensionId: 'prime',
            technologies: [],
            achievements: [],
            events: [],
            saveId: null
        };
    }

    generateDimension(id, level, type = null) {
        const types = ['Standard', 'Quantum', 'Entropic', 'Chrono', 'Exotic'];
        const selectedType = type || types[Math.floor(Math.random() * types.length)];

        const dimension = {
            id,
            name: this.generateDimensionName(selectedType),
            type: selectedType,
            level,
            discovered: id === 'prime',
            stability: 100,
            danger: Math.floor(level * 10) + Math.random() * 20,
            wealth: Math.floor(50 + Math.random() * 50),
            resources: this.generateResources(selectedType, level),
            outposts: id === 'prime' ? [this.generateOutpost('HQ', 'Headquarters')] : [],
            map: this.generateMap(selectedType),
            specialRules: this.generateSpecialRules(selectedType),
            factions: this.generateFactions(selectedType, level)
        };

        return dimension;
    }

    generateDimensionName(type) {
        const prefixes = {
            Standard: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'],
            Quantum: ['Schrödinger', 'Heisenberg', 'Planck', 'Bohr', 'Dirac'],
            Entropic: ['Chaos', 'Void', 'Entropy', 'Decay', 'Oblivion'],
            Chrono: ['Temporal', 'Eternal', 'Timeless', 'Paradox', 'Epoch'],
            Exotic: ['Nexus', 'Aurora', 'Zenith', 'Prisma', 'Aether']
        };

        const suffixes = ['Realm', 'Sphere', 'Dimension', 'Reality', 'Plane'];
        const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return `${prefix} ${suffix}`;
    }

    generateResources(type, level) {
        const baseResources = [
            { id: 'energy', name: 'Energy Crystals', icon: '⚡', amount: 100 * level, production: 10 * level },
            { id: 'matter', name: 'Exotic Matter', icon: '🔮', amount: 50 * level, production: 5 * level },
            { id: 'data', name: 'Quantum Data', icon: '💾', amount: 75 * level, production: 7 * level }
        ];

        const specialResources = {
            Quantum: { id: 'qubit', name: 'Quantum Bits', icon: '⚛️', amount: 30 * level, production: 3 * level },
            Entropic: { id: 'chaos', name: 'Chaos Energy', icon: '🌪️', amount: 40 * level, production: 4 * level },
            Chrono: { id: 'time', name: 'Time Crystals', icon: '⏳', amount: 20 * level, production: 2 * level },
            Exotic: { id: 'essence', name: 'Reality Essence', icon: '✨', amount: 60 * level, production: 6 * level }
        };

        if (specialResources[type]) {
            baseResources.push(specialResources[type]);
        }

        return baseResources;
    }

    generateOutpost(id, name, type = 'mining') {
        return {
            id,
            name,
            type,
            level: 1,
            production: {},
            upgrades: []
        };
    }

    generateMap(type) {
        const grid = [];
        const size = 100;

        for (let i = 0; i < size; i++) {
            const rand = Math.random();
            let cellType = 'empty';

            if (rand < 0.15) cellType = 'resource';
            else if (rand < 0.18) cellType = 'special';
            else if (rand < 0.22) cellType = 'danger';
            else if (rand < 0.25) cellType = 'portal';

            grid.push({
                id: i,
                type: cellType,
                explored: i < 10,
                data: cellType === 'resource' ? this.generateResourceNode(type) : null
            });
        }

        return grid;
    }

    generateResourceNode(dimensionType) {
        const resources = ['energy', 'matter', 'data', 'qubit', 'chaos', 'time', 'essence'];
        return {
            resource: resources[Math.floor(Math.random() * resources.length)],
            amount: Math.floor(50 + Math.random() * 150),
            quality: Math.floor(1 + Math.random() * 5)
        };
    }

    generateSpecialRules(type) {
        const rules = {
            Standard: ['Stable physics', 'Normal resource gain'],
            Quantum: ['Superposition: Resources fluctuate', 'Observation affects outcomes'],
            Entropic: ['Decay: Buildings degrade faster', 'Chaos events more frequent'],
            Chrono: ['Time dilation: Extra actions possible', 'Temporal paradoxes occur'],
            Exotic: ['Reality bending: Special abilities unlocked', 'Unpredictable effects']
        };

        return rules[type] || rules.Standard;
    }

    generateFactions(type, level) {
        const factionTemplates = [
            { name: 'Dimensional Collective', attitude: 'neutral', strength: 50 },
            { name: 'Reality Wardens', attitude: 'friendly', strength: 60 },
            { name: 'Void Seekers', attitude: 'hostile', strength: 70 },
            { name: 'Time Keepers', attitude: 'neutral', strength: 55 },
            { name: 'Chaos Cultists', attitude: 'hostile', strength: 65 }
        ];

        const numFactions = Math.min(1 + Math.floor(level / 2), 3);
        const factions = [];

        for (let i = 0; i < numFactions; i++) {
            const template = factionTemplates[Math.floor(Math.random() * factionTemplates.length)];
            factions.push({
                ...template,
                strength: template.strength + (level * 10),
                relation: template.attitude === 'friendly' ? 50 : template.attitude === 'hostile' ? -50 : 0
            });
        }

        return factions;
    }

    discoverNewDimension() {
        const cost = this.getDiscoveryCost();

        if (this.state.resources.multiverseEnergy < cost.energy ||
            this.state.resources.realityShards < cost.shards) {
            return { success: false, message: 'Insufficient resources!' };
        }

        this.state.resources.multiverseEnergy -= cost.energy;
        this.state.resources.realityShards -= cost.shards;

        const level = this.state.dimensions.length;
        const newDimension = this.generateDimension(`dim_${Date.now()}`, level);
        this.state.dimensions.push(newDimension);
        this.state.stats.discoveredDimensions++;

        this.addEvent({
            type: 'discovery',
            title: 'New Dimension Discovered!',
            message: `You've opened a portal to ${newDimension.name}!`,
            dimension: newDimension.id
        });

        this.notifyListeners();
        return { success: true, dimension: newDimension };
    }

    getDiscoveryCost() {
        const multiplier = this.state.dimensions.length;
        return {
            energy: 500 * multiplier,
            shards: 25 * multiplier
        };
    }

    getCurrentDimension() {
        return this.state.dimensions.find(d => d.id === this.state.currentDimensionId);
    }

    setCurrentDimension(dimensionId) {
        this.state.currentDimensionId = dimensionId;
        this.notifyListeners();
    }

    buildOutpost(dimensionId, name, type) {
        const dimension = this.state.dimensions.find(d => d.id === dimensionId);
        if (!dimension) return { success: false, message: 'Dimension not found!' };

        const cost = this.getBuildingCost(type);

        if (this.state.resources.multiverseEnergy < cost.energy) {
            return { success: false, message: 'Insufficient energy!' };
        }

        this.state.resources.multiverseEnergy -= cost.energy;

        const outpost = this.generateOutpost(`outpost_${Date.now()}`, name, type);
        dimension.outposts.push(outpost);

        this.notifyListeners();
        return { success: true, outpost };
    }

    getBuildingCost(type) {
        const costs = {
            mining: { energy: 200 },
            research: { energy: 300 },
            military: { energy: 250 },
            portal: { energy: 500 }
        };
        return costs[type] || costs.mining;
    }

    researchTechnology(techId) {
        const tech = this.getTechnologyById(techId);
        if (!tech) return { success: false, message: 'Technology not found!' };
        if (this.state.technologies.includes(techId)) {
            return { success: false, message: 'Already researched!' };
        }

        if (this.state.resources.knowledgePoints < tech.cost) {
            return { success: false, message: 'Insufficient knowledge!' };
        }

        this.state.resources.knowledgePoints -= tech.cost;
        this.state.technologies.push(techId);

        this.addEvent({
            type: 'research',
            title: 'Research Complete!',
            message: `${tech.name} has been unlocked!`
        });

        this.notifyListeners();
        return { success: true };
    }

    getTechnologyById(techId) {
        const techs = this.getAllTechnologies();
        return techs.find(t => t.id === techId);
    }

    getAllTechnologies() {
        return [
            { id: 'portal_1', name: 'Advanced Portals', cost: 150, description: 'Reduce portal costs by 25%', unlocks: [] },
            { id: 'energy_1', name: 'Energy Efficiency', cost: 100, description: 'Increase energy production by 20%', unlocks: [] },
            { id: 'mining_1', name: 'Automated Mining', cost: 120, description: 'Double resource extraction', unlocks: [] },
            { id: 'military_1', name: 'Defense Systems', cost: 180, description: 'Protect outposts from events', unlocks: [] },
            { id: 'quantum_1', name: 'Quantum Computing', cost: 200, description: 'Unlock quantum technologies', unlocks: ['quantum_2'] },
            { id: 'time_1', name: 'Temporal Manipulation', cost: 250, description: 'Take extra actions per turn', unlocks: [] },
            { id: 'reality_1', name: 'Reality Bending', cost: 300, description: 'Modify dimension properties', unlocks: [] }
        ];
    }

    endTurn() {
        this.state.currentTurn++;

        this.state.dimensions.forEach(dim => {
            if (!dim.discovered) return;

            dim.resources.forEach(res => {
                res.amount += res.production;
            });

            const energyGain = dim.outposts.length * 50;
            this.state.resources.multiverseEnergy += energyGain;
            this.state.resources.knowledgePoints += Math.floor(dim.outposts.length * 10);
        });

        if (Math.random() < 0.3) {
            this.generateRandomEvent();
        }

        this.state.events = this.state.events.filter(e => !e.expired);

        this.checkAchievements();
        this.notifyListeners();
    }

    generateRandomEvent() {
        const eventTypes = [
            {
                type: 'resource_boom',
                title: 'Resource Surge!',
                message: 'A dimensional rift has increased resource production!',
                effect: () => {
                    this.state.resources.multiverseEnergy += 500;
                }
            },
            {
                type: 'anomaly',
                title: 'Temporal Anomaly',
                message: 'Time fluctuations detected. Stability decreased.',
                effect: () => {
                    this.state.stats.timelineStability -= 10;
                }
            },
            {
                type: 'discovery',
                title: 'Ancient Artifact',
                message: 'Your explorers found a reality shard!',
                effect: () => {
                    this.state.resources.realityShards += 10;
                }
            },
            {
                type: 'faction',
                title: 'Diplomatic Opportunity',
                message: 'A faction wishes to establish relations.',
                effect: () => {
                    this.state.stats.reputation += 10;
                }
            }
        ];

        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const gameEvent = {
            id: `event_${Date.now()}`,
            ...event,
            turn: this.state.currentTurn,
            expired: false
        };

        this.addEvent(gameEvent);
        if (event.effect) event.effect();
    }

    addEvent(event) {
        this.state.events.unshift({
            ...event,
            id: event.id || `event_${Date.now()}`,
            turn: this.state.currentTurn
        });

        if (this.state.events.length > 10) {
            this.state.events = this.state.events.slice(0, 10);
        }
    }

    checkAchievements() {
        const achievements = [
            { id: 'first_dimension', name: 'Reality Pioneer', check: () => this.state.stats.discoveredDimensions >= 2 },
            { id: 'rich', name: 'Energy Tycoon', check: () => this.state.resources.multiverseEnergy >= 10000 },
            { id: 'researcher', name: 'Mad Scientist', check: () => this.state.technologies.length >= 5 },
            { id: 'turn_50', name: 'Time Lord', check: () => this.state.currentTurn >= 50 },
            { id: 'ten_dimensions', name: 'Multiverse Master', check: () => this.state.stats.discoveredDimensions >= 10 }
        ];

        achievements.forEach(ach => {
            if (!this.state.achievements.includes(ach.id) && ach.check()) {
                this.state.achievements.push(ach.id);
                this.addEvent({
                    type: 'achievement',
                    title: 'Achievement Unlocked!',
                    message: `${ach.name}`,
                    achievement: ach.id
                });
            }
        });
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
