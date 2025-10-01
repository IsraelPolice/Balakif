// מערכת בנייה מתקדמת - ערים ותעשיות
// Advanced City & Industry Building System with cellular automata simulation

export class CityBuildingSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.buildings = [];
        this.buildingTypes = this.initializeBuildingTypes();
        this.resources = this.initializeResources();
    }

    initializeBuildingTypes() {
        return {
            // ערים
            cities: {
                village: {
                    id: 'village',
                    name: 'כפר',
                    emoji: '🏘️',
                    tier: 1,
                    cost: { treasury: 500000000, population: 10000 },
                    buildTime: 3, // virtual days
                    benefits: { gdp: 0.05, joy: 0.02 },
                    requirements: { territory: true },
                    upgradeTo: 'town'
                },
                town: {
                    id: 'town',
                    name: 'עיירה',
                    emoji: '🏙️',
                    tier: 2,
                    cost: { treasury: 2000000000, population: 50000 },
                    buildTime: 5,
                    benefits: { gdp: 0.10, joy: 0.05, innovation: 0.02 },
                    upgradeTo: 'industrial_hub'
                },
                industrial_hub: {
                    id: 'industrial_hub',
                    name: 'מרכז תעשייתי',
                    emoji: '🏭',
                    tier: 3,
                    cost: { treasury: 8000000000, population: 200000 },
                    buildTime: 10,
                    benefits: { gdp: 0.20, production: 0.15, jobs: 100000 },
                    upgradeTo: 'megacity'
                },
                megacity: {
                    id: 'megacity',
                    name: 'מגה-עיר',
                    emoji: '🌆',
                    tier: 4,
                    cost: { treasury: 25000000000, population: 1000000 },
                    buildTime: 20,
                    benefits: { gdp: 0.40, innovation: 0.15, culture: 0.20, techRD: 0.10 },
                    special: 'unlocks_advanced_research'
                }
            },

            // תעשיות מיוחדות
            industries: {
                oil_rig: {
                    id: 'oil_rig',
                    name: 'אסדת נפט',
                    emoji: '🛢️',
                    cost: { treasury: 5000000000 },
                    buildTime: 7,
                    benefits: { energy: 0.20, gdp: 0.12, exports: 1000000000 },
                    requires: { resource: 'oil_deposits', territory: 'coastal' },
                    maintenance: 50000000,
                    environmental: -0.05 // joy penalty
                },
                tech_park: {
                    id: 'tech_park',
                    name: 'פארק היי-טק',
                    emoji: '💻',
                    cost: { treasury: 10000000000 },
                    buildTime: 12,
                    benefits: { innovation: 0.10, gdp: 0.15, education: 0.08 },
                    requires: { education_level: 70 },
                    maintenance: 100000000,
                    synergy: { with: 'megacity', bonus: 0.25 }
                },
                steel_factory: {
                    id: 'steel_factory',
                    name: 'מפעל פלדה',
                    emoji: '⚙️',
                    cost: { treasury: 3000000000 },
                    buildTime: 6,
                    benefits: { production: 0.15, military_production: 0.10 },
                    requires: { resource: 'iron_ore' },
                    maintenance: 30000000,
                    imports: ['iron_ore', 'coal']
                },
                port: {
                    id: 'port',
                    name: 'נמל',
                    emoji: '⚓',
                    cost: { treasury: 7000000000 },
                    buildTime: 10,
                    benefits: { trade: 0.25, gdp: 0.10 },
                    requires: { territory: 'coastal' },
                    maintenance: 80000000,
                    special: 'enables_naval_superiority'
                },
                farm_complex: {
                    id: 'farm_complex',
                    name: 'מתחם חקלאי',
                    emoji: '🌾',
                    cost: { treasury: 1500000000 },
                    buildTime: 4,
                    benefits: { food_security: 0.20, joy: 0.05, population_growth: 0.02 },
                    requires: { territory: 'arable_land' },
                    maintenance: 20000000,
                    environmental: 0.03
                },
                research_center: {
                    id: 'research_center',
                    name: 'מרכז מחקר',
                    emoji: '🔬',
                    cost: { treasury: 15000000000 },
                    buildTime: 15,
                    benefits: { innovation: 0.25, military_tech: 0.15, medicine: 0.10 },
                    requires: { education_level: 80, megacity: true },
                    maintenance: 200000000,
                    breakthrough_chance: 0.15
                }
            }
        };
    }

    initializeResources() {
        return {
            oil_deposits: { nations: ['KachlerLand', 'MarksLand', 'LasriLand'], abundance: 0.8 },
            iron_ore: { nations: ['DvirOhanaLand', 'SchwartzLand'], abundance: 0.7 },
            coal: { nations: ['BenmozesLand', 'BohbotLand'], abundance: 0.6 },
            rare_earth: { nations: ['NatiLand', 'YogevLand'], abundance: 0.5 }
        };
    }

    buildCity(nationId, cityType, location) {
        const state = this.engine.state;
        const cityDef = this.buildingTypes.cities[cityType];

        if (!cityDef) {
            return { success: false, message: '❌ סוג עיר לא חוקי' };
        }

        // בדיקת דרישות
        if (state.resources.treasury < cityDef.cost.treasury) {
            return { success: false, message: '❌ אין מספיק תקציב' };
        }

        const territory = state.territories.find(t => t.nationId === nationId);
        if (!territory || territory.population < cityDef.cost.population) {
            return { success: false, message: '❌ אין מספיק אוכלוסייה בטריטוריה' };
        }

        // בנייה
        state.resources.treasury -= cityDef.cost.treasury;
        territory.population -= cityDef.cost.population;

        const building = {
            id: `city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'city',
            subtype: cityType,
            nationId: nationId,
            location: location,
            tier: cityDef.tier,
            constructionProgress: 0,
            constructionTime: cityDef.buildTime,
            status: 'under_construction',
            benefits: cityDef.benefits,
            population: cityDef.cost.population,
            createdAt: Date.now()
        };

        this.buildings.push(building);
        this.startConstruction(building);

        return {
            success: true,
            message: `✅ הבנייה של ${cityDef.name} החלה!`,
            building: building,
            estimatedCompletion: `${cityDef.buildTime} ימים וירטואליים`
        };
    }

    buildIndustry(nationId, industryType, location) {
        const state = this.engine.state;
        const industryDef = this.buildingTypes.industries[industryType];

        if (!industryDef) {
            return { success: false, message: '❌ סוג תעשייה לא חוקי' };
        }

        // בדיקת תקציב
        if (state.resources.treasury < industryDef.cost.treasury) {
            return { success: false, message: '❌ אין מספיק תקציב' };
        }

        // בדיקת דרישות מיוחדות
        if (industryDef.requires) {
            const checkResult = this.checkRequirements(nationId, industryDef.requires);
            if (!checkResult.met) {
                return { success: false, message: `❌ חסרה דרישה: ${checkResult.missing}` };
            }
        }

        // בנייה
        state.resources.treasury -= industryDef.cost.treasury;

        const building = {
            id: `industry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'industry',
            subtype: industryType,
            nationId: nationId,
            location: location,
            constructionProgress: 0,
            constructionTime: industryDef.buildTime,
            status: 'under_construction',
            benefits: industryDef.benefits,
            maintenance: industryDef.maintenance,
            createdAt: Date.now()
        };

        this.buildings.push(building);
        this.startConstruction(building);

        return {
            success: true,
            message: `✅ הבנייה של ${industryDef.name} החלה!`,
            building: building,
            estimatedCompletion: `${industryDef.buildTime} ימים וירטואליים`
        };
    }

    checkRequirements(nationId, requirements) {
        const state = this.engine.state;

        if (requirements.resource) {
            const resource = this.resources[requirements.resource];
            if (!resource || !resource.nations.includes(nationId)) {
                return { met: false, missing: `משאב: ${requirements.resource}` };
            }
        }

        if (requirements.education_level) {
            const currentEducation = state.internal.education || 50;
            if (currentEducation < requirements.education_level) {
                return { met: false, missing: `רמת חינוך: ${requirements.education_level}%` };
            }
        }

        if (requirements.megacity) {
            const hasMegacity = this.buildings.some(b =>
                b.nationId === nationId &&
                b.subtype === 'megacity' &&
                b.status === 'operational'
            );
            if (!hasMegacity) {
                return { met: false, missing: 'מגה-עיר פעילה' };
            }
        }

        return { met: true };
    }

    startConstruction(building) {
        // סימולציית בנייה בזמן אמת
        const progressInterval = setInterval(() => {
            building.constructionProgress += (100 / building.constructionTime);

            if (building.constructionProgress >= 100) {
                building.constructionProgress = 100;
                building.status = 'operational';
                clearInterval(progressInterval);
                this.onConstructionComplete(building);
            }

            this.engine.notifyListeners();
        }, 1000); // עדכון כל שנייה (1 יום וירטואלי)
    }

    onConstructionComplete(building) {
        const state = this.engine.state;
        const def = building.type === 'city'
            ? this.buildingTypes.cities[building.subtype]
            : this.buildingTypes.industries[building.subtype];

        // הפעלת הטבות
        this.applyBenefits(building, def.benefits);

        // הודעה
        this.engine.addEvent({
            type: 'construction_complete',
            importance: 'high',
            title: `🎉 ${def.name} הושלם!`,
            description: `הבנייה של ${def.name} הסתיימה והמבנה כעת פעיל ומייצר הטבות.`
        });
    }

    applyBenefits(building, benefits) {
        const state = this.engine.state;

        if (benefits.gdp) {
            state.resources.gdp *= (1 + benefits.gdp);
        }

        if (benefits.joy) {
            state.internal.publicJoy += benefits.joy * 100;
        }

        if (benefits.innovation) {
            state.internal.innovation = (state.internal.innovation || 0) + benefits.innovation * 100;
        }

        if (benefits.production) {
            state.internal.production = (state.internal.production || 100) * (1 + benefits.production);
        }

        if (benefits.exports) {
            state.resources.treasury += benefits.exports;
        }

        this.engine.notifyListeners();
    }

    // Cellular Automata Simulation - עיר גדלה אוטומטית
    simulateCityGrowth() {
        const state = this.engine.state;

        this.buildings.forEach(building => {
            if (building.type !== 'city' || building.status !== 'operational') return;

            // צמיחה מבוססת השקעות
            const educationInvestment = state.internal.educationBudget || 0;
            const healthInvestment = state.internal.healthBudget || 0;

            if (educationInvestment > 1000000000) {
                // כוח עבודה מיומן
                building.skilled_workforce = (building.skilled_workforce || 0) + 0.05;
                state.internal.production *= 1.025;
            }

            if (healthInvestment > 500000000) {
                // אוכלוסייה בריאה
                building.health_index = (building.health_index || 70) + 0.5;
                building.population *= 1.001; // צמיחת אוכלוסייה
            }

            // אבולוציה אוטומטית
            if (building.skilled_workforce > 50 && building.tier < 4) {
                this.autoUpgradeCity(building);
            }
        });
    }

    autoUpgradeCity(building) {
        const def = this.buildingTypes.cities[building.subtype];
        if (!def.upgradeTo) return;

        const nextTier = this.buildingTypes.cities[def.upgradeTo];
        const state = this.engine.state;

        // שדרוג אוטומטי אם יש תקציב
        if (state.resources.treasury > nextTier.cost.treasury * 0.5) {
            building.subtype = def.upgradeTo;
            building.tier = nextTier.tier;
            building.benefits = nextTier.benefits;

            this.engine.addEvent({
                type: 'city_evolved',
                importance: 'medium',
                title: `📈 העיר התפתחה!`,
                description: `${def.name} התקדמה ל-${nextTier.name} בזכה השקעות חכמות!`
            });
        }
    }

    getBuildingsForNation(nationId) {
        return this.buildings.filter(b => b.nationId === nationId);
    }

    getTotalBenefits(nationId) {
        const buildings = this.getBuildingsForNation(nationId);
        const totals = {
            gdp_bonus: 0,
            joy_bonus: 0,
            innovation: 0,
            production: 0,
            maintenance_cost: 0
        };

        buildings.forEach(building => {
            if (building.status === 'operational') {
                if (building.benefits.gdp) totals.gdp_bonus += building.benefits.gdp;
                if (building.benefits.joy) totals.joy_bonus += building.benefits.joy;
                if (building.benefits.innovation) totals.innovation += building.benefits.innovation;
                if (building.benefits.production) totals.production += building.benefits.production;
                if (building.maintenance) totals.maintenance_cost += building.maintenance;
            }
        });

        return totals;
    }

    getAvailableBuildings(nationId) {
        const state = this.engine.state;
        const available = { cities: [], industries: [] };

        // בדיקת ערים זמינות
        Object.entries(this.buildingTypes.cities).forEach(([key, city]) => {
            const canAfford = state.resources.treasury >= city.cost.treasury;
            const hasPopulation = state.territories.some(t =>
                t.nationId === nationId && t.population >= city.cost.population
            );

            available.cities.push({
                ...city,
                available: canAfford && hasPopulation,
                reason: !canAfford ? 'תקציב חסר' : !hasPopulation ? 'אוכלוסייה חסרה' : ''
            });
        });

        // בדיקת תעשיות זמינות
        Object.entries(this.buildingTypes.industries).forEach(([key, industry]) => {
            const canAfford = state.resources.treasury >= industry.cost.treasury;
            const reqCheck = industry.requires ? this.checkRequirements(nationId, industry.requires) : { met: true };

            available.industries.push({
                ...industry,
                available: canAfford && reqCheck.met,
                reason: !canAfford ? 'תקציב חסר' : !reqCheck.met ? reqCheck.missing : ''
            });
        });

        return available;
    }
}
