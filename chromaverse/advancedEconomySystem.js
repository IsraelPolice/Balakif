// מערכת כלכלה מתקדמת - מכירות, מסחר, תקציבים, סימולציות
// Advanced Economy System with predictive modeling

export class AdvancedEconomySystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.marketPrices = this.initializeMarket();
        this.tradeHistory = [];
        this.budgetAllocations = this.initializeBudgets();
        this.citizenWelfareIndex = 70;
    }

    initializeMarket() {
        return {
            oil: { price: 80, volatility: 0.15, demand: 1.0 },
            steel: { price: 500, volatility: 0.10, demand: 0.9 },
            technology: { price: 2000, volatility: 0.20, demand: 1.2 },
            weapons: { price: 5000, volatility: 0.25, demand: 0.8 },
            food: { price: 100, volatility: 0.08, demand: 1.0 },
            luxury_goods: { price: 1500, volatility: 0.30, demand: 0.7 }
        };
    }

    initializeBudgets() {
        return {
            education: {
                allocation: 15, // percentage of GDP
                priority: 3,
                effects: { innovation: 0.5, welfare: 0.3, future_gdp: 0.2 }
            },
            health: {
                allocation: 12,
                priority: 3,
                effects: { welfare: 0.6, population_growth: 0.2, joy: 0.2 }
            },
            military: {
                allocation: 20,
                priority: 2,
                effects: { strength: 0.8, security: 0.7, joy: -0.1 }
            },
            welfare: {
                allocation: 10,
                priority: 3,
                effects: { joy: 0.7, welfare: 0.8, loyalty: 0.5 }
            },
            infrastructure: {
                allocation: 15,
                priority: 2,
                effects: { gdp: 0.4, efficiency: 0.5, future_gdp: 0.3 }
            },
            science: {
                allocation: 8,
                priority: 1,
                effects: { innovation: 0.9, military_tech: 0.4, prestige: 0.3 }
            },
            culture: {
                allocation: 5,
                priority: 1,
                effects: { joy: 0.4, soft_power: 0.6, tourism: 0.3 }
            },
            environment: {
                allocation: 5,
                priority: 1,
                effects: { joy: 0.3, sustainability: 0.8, future_stability: 0.5 }
            }
        };
    }

    // מכירת נכסים וסחורות
    sellAsset(assetType, quantity, nationId) {
        const state = this.engine.state;
        const result = { success: false, revenue: 0, consequences: [] };

        switch (assetType) {
            case 'oil':
                return this.sellResource('oil', quantity, nationId);
            case 'steel':
                return this.sellResource('steel', quantity, nationId);
            case 'technology':
                return this.sellResource('technology', quantity, nationId);
            case 'weapons':
                return this.sellWeapons(quantity, nationId);
            case 'industry':
                return this.privatizeIndustry(nationId);
            case 'port':
                return this.privatizePort(nationId);
            default:
                return { success: false, message: '❌ סוג נכס לא חוקי' };
        }
    }

    sellResource(resourceType, quantity, nationId) {
        const state = this.engine.state;
        const market = this.marketPrices[resourceType];

        if (!market) {
            return { success: false, message: '❌ משאב לא קיים בשוק' };
        }

        // בדיקת זמינות משאב
        const hasResource = this.checkResourceAvailability(nationId, resourceType, quantity);
        if (!hasResource) {
            return { success: false, message: '❌ אין מספיק משאב למכירה' };
        }

        // חישוב מחיר עם תנודתיות
        const priceFluctuation = 1 + (Math.random() - 0.5) * market.volatility;
        const totalPrice = market.price * quantity * priceFluctuation * market.demand;

        // הכנסה
        state.resources.treasury += totalPrice;

        // השפעות על השוק
        market.demand *= 0.95; // ביקוש יורד אם מוכרים הרבה
        market.price *= 0.98; // מחיר יורד אם יש עודף היצע

        // רישום מסחר
        this.tradeHistory.push({
            type: 'export',
            resource: resourceType,
            quantity: quantity,
            price: totalPrice,
            timestamp: Date.now()
        });

        // השפעות גיאופוליטיות
        const geopolitical = this.calculateGeopoliticalImpact(resourceType, quantity, 'sell');

        return {
            success: true,
            message: `✅ נמכרו ${quantity} יחידות ${resourceType}`,
            revenue: totalPrice,
            newTreasury: state.resources.treasury,
            marketImpact: {
                newPrice: market.price,
                newDemand: market.demand
            },
            geopoliticalEffects: geopolitical
        };
    }

    sellWeapons(quantity, nationId) {
        const state = this.engine.state;
        const market = this.marketPrices.weapons;

        // מכירת נשק זה עסק מסוכן
        const priceFluctuation = 1 + (Math.random() - 0.3) * market.volatility;
        const basePrice = market.price * quantity * priceFluctuation;

        // שוק שחור מרוויח יותר אבל מסוכן
        const blackMarket = Math.random() > 0.7;
        const finalPrice = blackMarket ? basePrice * 1.5 : basePrice;

        state.resources.treasury += finalPrice;

        // השפעות
        const consequences = [];
        if (blackMarket) {
            consequences.push('🕵️ מכירה בשוק השחור - סיכון לחשיפה');
            state.diplomacy.reputation = (state.diplomacy.reputation || 100) - 5;

            // סיכון לסנקציות
            if (Math.random() > 0.6) {
                consequences.push('⚠️ סנקציות בינלאומיות הוטלו!');
                state.resources.gdp *= 0.95;
            }
        }

        // יחסים עם מדינות מושפעים
        Object.keys(state.diplomacy.relations).forEach(nId => {
            if (Math.random() > 0.8) {
                state.diplomacy.relations[nId] -= 5;
                consequences.push(`⚡ יחסים עם ${nId} נפגעו`);
            }
        });

        return {
            success: true,
            message: `✅ נמכרו ${quantity} יחידות נשק`,
            revenue: finalPrice,
            blackMarket: blackMarket,
            consequences: consequences
        };
    }

    privatizeIndustry(nationId) {
        const state = this.engine.state;

        // הפרטה מהירה של תעשייה
        const industryValue = state.resources.gdp * 0.05; // 5% מהתמ"ג
        state.resources.treasury += industryValue;

        // השפעות לטווח ארוך
        state.resources.gdp *= 0.97; // איבוד שליטה = פחות הכנסות עתידיות
        state.internal.publicJoy -= 5; // הציבור לא אוהב הפרטות

        return {
            success: true,
            message: `✅ התעשייה הופרטה`,
            revenue: industryValue,
            longTermEffect: '⚠️ -3% הכנסות עתידיות',
            popularityHit: -5
        };
    }

    privatizePort(nationId) {
        const state = this.engine.state;

        // הפרטת נמל - רווח גדול אבל אובדן שליטה
        const portValue = state.resources.gdp * 0.08;
        state.resources.treasury += portValue;

        // השפעות
        state.internal.tradeControl = (state.internal.tradeControl || 100) - 20;
        state.diplomacy.autonomy -= 10;

        return {
            success: true,
            message: `⚓ הנמל הופרט`,
            revenue: portValue,
            warning: '⚠️ -20% שליטה על סחר חיצוני'
        };
    }

    checkResourceAvailability(nationId, resourceType, quantity) {
        // בדיקה אם למדינה יש את המשאב
        const state = this.engine.state;

        // אם יש בניינים שמייצרים את המשאב
        if (this.engine.cityBuildingSystem) {
            const buildings = this.engine.cityBuildingSystem.getBuildingsForNation(nationId);
            const hasProduction = buildings.some(b =>
                b.status === 'operational' &&
                b.subtype === `${resourceType}_rig`
            );
            if (hasProduction) return true;
        }

        // בדיקה לפי משאבים טבעיים של המדינה
        return Math.random() > 0.3; // 70% סיכוי שיש
    }

    calculateGeopoliticalImpact(resourceType, quantity, action) {
        const impacts = [];

        if (resourceType === 'oil' && quantity > 1000) {
            impacts.push({
                type: 'energy_influence',
                description: 'השפעה על שוק האנרגיה העולמי',
                effect: '+10% יוקרה בינלאומית'
            });
        }

        if (resourceType === 'technology') {
            impacts.push({
                type: 'tech_competition',
                description: 'העברת טכנולוגיה לאויבים פוטנציאליים',
                effect: '-5% יתרון טכנולוגי'
            });
        }

        return impacts;
    }

    // מערכת תקציבים מתקדמת
    setBudgetAllocation(category, percentage) {
        const state = this.engine.state;

        if (percentage < 0 || percentage > 100) {
            return { success: false, message: '❌ אחוז לא חוקי' };
        }

        // בדיקה שסך כל התקציבים לא עובר 100%
        const currentTotal = Object.values(this.budgetAllocations)
            .reduce((sum, b) => sum + b.allocation, 0);

        const oldAllocation = this.budgetAllocations[category].allocation;
        const difference = percentage - oldAllocation;

        if (currentTotal - oldAllocation + percentage > 100) {
            return { success: false, message: '❌ סך התקציבים עובר 100%' };
        }

        this.budgetAllocations[category].allocation = percentage;

        // חישוב השפעות מיידיות
        const effects = this.calculateBudgetEffects(category, difference);

        // עדכון המצב
        this.applyBudgetEffects(effects);

        return {
            success: true,
            message: `✅ תקציב ${category} עודכן ל-${percentage}%`,
            effects: effects,
            warning: effects.warnings
        };
    }

    calculateBudgetEffects(category, change) {
        const budget = this.budgetAllocations[category];
        const state = this.engine.state;
        const effects = { immediate: [], future: [], warnings: [] };

        const impact = change > 0 ? 'increase' : 'decrease';
        const magnitude = Math.abs(change);

        Object.entries(budget.effects).forEach(([effect, multiplier]) => {
            const value = magnitude * multiplier;

            if (impact === 'increase') {
                effects.immediate.push({
                    stat: effect,
                    change: +value,
                    description: `+${value.toFixed(1)}% ${effect}`
                });
            } else {
                effects.immediate.push({
                    stat: effect,
                    change: -value,
                    description: `-${value.toFixed(1)}% ${effect}`
                });

                // אזהרות על קיצוצים
                if (category === 'health' && magnitude > 10) {
                    effects.warnings.push('⚠️ קיצוץ בבריאות עלול לגרום למגיפות');
                }
                if (category === 'education' && magnitude > 10) {
                    effects.warnings.push('⚠️ קיצוץ בחינוך יגרום לבריחת מוחות');
                }
                if (category === 'welfare' && magnitude > 15) {
                    effects.warnings.push('⚠️ קיצוץ ברווחה עלול לגרום למהומות');
                }
            }
        });

        return effects;
    }

    applyBudgetEffects(effects) {
        const state = this.engine.state;

        effects.immediate.forEach(effect => {
            switch (effect.stat) {
                case 'innovation':
                    state.internal.innovation = (state.internal.innovation || 50) + effect.change;
                    break;
                case 'welfare':
                    this.citizenWelfareIndex += effect.change;
                    break;
                case 'joy':
                    state.internal.publicJoy += effect.change;
                    break;
                case 'strength':
                    state.military.strength += effect.change;
                    break;
                case 'gdp':
                    state.resources.gdp *= (1 + effect.change / 100);
                    break;
            }
        });

        this.engine.notifyListeners();
    }

    // מדד רווחת אזרח מתקדם
    calculateCitizenWelfareIndex() {
        const state = this.engine.state;

        const factors = {
            health: (this.budgetAllocations.health.allocation / 15) * 25, // 25 points max
            education: (this.budgetAllocations.education.allocation / 15) * 20, // 20 points max
            welfare: (this.budgetAllocations.welfare.allocation / 10) * 15, // 15 points max
            income: Math.min((state.resources.gdp / 1000000000000) * 10, 20), // 20 points max
            employment: Math.min((state.internal.employment || 80), 20) // 20 points max
        };

        this.citizenWelfareIndex = Object.values(factors).reduce((sum, v) => sum + v, 0);

        // השפעות של מדד נמוך
        if (this.citizenWelfareIndex < 60) {
            state.internal.publicJoy -= 1;
            state.internal.unrest = (state.internal.unrest || 0) + 0.5;

            if (Math.random() > 0.9) {
                this.triggerWelfareEvent('low');
            }
        }

        // בונוסים למדד גבוה
        if (this.citizenWelfareIndex > 80) {
            state.internal.loyalty = (state.internal.loyalty || 70) + 0.5;
            state.military.volunteers = (state.military.volunteers || 0) + 100;

            if (Math.random() > 0.95) {
                this.triggerWelfareEvent('high');
            }
        }

        return {
            index: this.citizenWelfareIndex,
            factors: factors,
            status: this.getWelfareStatus()
        };
    }

    getWelfareStatus() {
        const index = this.citizenWelfareIndex;

        if (index >= 90) return { level: 'מצוין', emoji: '😊', color: '#00ff88' };
        if (index >= 75) return { level: 'טוב', emoji: '🙂', color: '#00d9ff' };
        if (index >= 60) return { level: 'בינוני', emoji: '😐', color: '#ffd700' };
        if (index >= 40) return { level: 'גרוע', emoji: '😟', color: '#ff8800' };
        return { level: 'קטסטרופלי', emoji: '😡', color: '#ff0055' };
    }

    triggerWelfareEvent(type) {
        if (type === 'low') {
            this.engine.addEvent({
                type: 'welfare_crisis',
                importance: 'critical',
                title: '⚠️ משבר רווחה!',
                description: 'מדד רווחת האזרחים נמוך מאוד. שביתות ומחאות פורצות במדינה!'
            });
        } else {
            this.engine.addEvent({
                type: 'welfare_boom',
                importance: 'high',
                title: '🎉 רווחה גבוהה!',
                description: 'האזרחים מאושרים! נאמנות עולה ומתנדבים מצטרפים לצבא.'
            });
        }
    }

    // סימולטור פיסקלי - תחזה 5 תורות קדימה
    fiscalSimulator(proposedChanges) {
        const predictions = [];
        let simulatedState = JSON.parse(JSON.stringify(this.engine.state));

        for (let turn = 1; turn <= 5; turn++) {
            // סימולציה של השינויים המוצעים
            Object.entries(proposedChanges).forEach(([category, newValue]) => {
                const oldValue = this.budgetAllocations[category].allocation;
                const change = newValue - oldValue;

                // חישוב השפעות
                const effects = this.budgetAllocations[category].effects;
                Object.entries(effects).forEach(([stat, multiplier]) => {
                    const impact = change * multiplier * turn; // אפקט מצטבר

                    switch (stat) {
                        case 'gdp':
                            simulatedState.resources.gdp *= (1 + impact / 100);
                            break;
                        case 'joy':
                            simulatedState.internal.publicJoy += impact;
                            break;
                        case 'innovation':
                            simulatedState.internal.innovation = (simulatedState.internal.innovation || 50) + impact;
                            break;
                    }
                });
            });

            predictions.push({
                turn: turn,
                gdp: simulatedState.resources.gdp,
                joy: simulatedState.internal.publicJoy,
                innovation: simulatedState.internal.innovation,
                welfare: this.citizenWelfareIndex + (turn * (proposedChanges.welfare || 0))
            });
        }

        return {
            predictions: predictions,
            recommendation: this.generateRecommendation(predictions),
            riskLevel: this.assessRisk(predictions)
        };
    }

    generateRecommendation(predictions) {
        const finalTurn = predictions[4];
        const initialJoy = this.engine.state.internal.publicJoy;

        if (finalTurn.joy < initialJoy - 10) {
            return '❌ לא מומלץ - שמחת עם תרד משמעותית';
        }

        if (finalTurn.gdp > this.engine.state.resources.gdp * 1.1) {
            return '✅ מומלץ מאוד - צמיחה כלכלית חזקה';
        }

        return '⚠️ בינוני - שקול היטב את הסיכונים';
    }

    assessRisk(predictions) {
        const volatility = predictions.reduce((sum, p, i) => {
            if (i === 0) return 0;
            return sum + Math.abs(p.joy - predictions[i - 1].joy);
        }, 0);

        if (volatility > 50) return 'גבוה';
        if (volatility > 25) return 'בינוני';
        return 'נמוך';
    }

    // עדכון שוק בזמן אמת
    updateMarket() {
        Object.values(this.marketPrices).forEach(commodity => {
            // תנודתיות טבעית
            const change = (Math.random() - 0.5) * commodity.volatility;
            commodity.price *= (1 + change);

            // ביקוש משתנה
            commodity.demand = Math.max(0.5, Math.min(1.5, commodity.demand + (Math.random() - 0.5) * 0.1));
        });
    }

    getMarketReport() {
        return {
            prices: this.marketPrices,
            trends: this.analyzeTrends(),
            opportunities: this.findOpportunities()
        };
    }

    analyzeTrends() {
        const trends = {};
        Object.entries(this.marketPrices).forEach(([commodity, data]) => {
            const historical = this.tradeHistory
                .filter(t => t.resource === commodity)
                .slice(-10);

            if (historical.length > 5) {
                const avgPrice = historical.reduce((sum, t) => sum + t.price / t.quantity, 0) / historical.length;
                trends[commodity] = data.price > avgPrice ? 'עולה ↗' : 'יורד ↘';
            } else {
                trends[commodity] = 'יציב →';
            }
        });
        return trends;
    }

    findOpportunities() {
        const opportunities = [];

        Object.entries(this.marketPrices).forEach(([commodity, data]) => {
            if (data.demand > 1.2 && data.price > 1000) {
                opportunities.push({
                    commodity: commodity,
                    type: 'sell',
                    reason: 'ביקוש גבוה ומחיר טוב',
                    potential_profit: '+25%'
                });
            }

            if (data.demand < 0.7 && data.price < 500) {
                opportunities.push({
                    commodity: commodity,
                    type: 'buy',
                    reason: 'ביקוש נמוך - הזדמנות רכישה',
                    potential_profit: '+40% עתידי'
                });
            }
        });

        return opportunities;
    }
}
