// מערכת אירועים דינמית ואקראית למשחק
import { NATIONS } from './nations.js';

export class EventsSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.eventHistory = [];
        this.activeEvents = [];
        this.lastEventTime = Date.now();
        this.eventInterval = 60000; // אירוע כל דקה
    }

    startEventLoop() {
        setInterval(() => {
            this.triggerRandomEvent();
        }, this.eventInterval);
    }

    triggerRandomEvent() {
        const state = this.engine.state;
        if (!state.selectedNation) return;

        const eventType = this.selectEventType(state);
        const event = this.generateEvent(eventType, state);

        if (event) {
            this.activeEvents.push(event);
            this.eventHistory.push({...event, timestamp: Date.now()});
            this.engine.addEvent(event);
            return event;
        }
    }

    selectEventType(state) {
        const weights = {
            economic: 30,
            political: 25,
            military: 20,
            diplomatic: 15,
            disaster: 10
        };

        // התאמת משקולות לפי מצב המדינה
        if (state.resources.treasury < 10000000000) weights.economic += 20;
        if (state.internal.support < 50) weights.political += 20;
        if (state.diplomacy.wars.length > 0) weights.military += 25;
        if (state.internal.support < 30) weights.disaster += 15;

        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * total;

        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return type;
        }

        return 'economic';
    }

    generateEvent(type, state) {
        const generators = {
            economic: () => this.generateEconomicEvent(state),
            political: () => this.generatePoliticalEvent(state),
            military: () => this.generateMilitaryEvent(state),
            diplomatic: () => this.generateDiplomaticEvent(state),
            disaster: () => this.generateDisasterEvent(state)
        };

        return generators[type]?.();
    }

    generateEconomicEvent(state) {
        const events = [
            {
                id: 'energy_crisis',
                title: '⚡ משבר אנרגיה עולמי',
                description: 'מחירי הנפט זינקו ב-40% בשל סכסוכים במזרח התיכון. הכלכלה שלך מושפעת.',
                choices: [
                    {
                        text: 'השקע ב-אנרגיות מתחדשות ($5B)',
                        cost: 5000000000,
                        effects: { gdp: -2, growthRate: +0.5, support: +5 },
                        message: 'השקעה אסטרטגית! צמיחה עתידית מובטחת.'
                    },
                    {
                        text: 'קנה נפט ברזרבה ($3B)',
                        cost: 3000000000,
                        effects: { gdp: -1, support: -2 },
                        message: 'פתרון זמני, אך העלויות ימשיכו לעלות.'
                    },
                    {
                        text: 'התעלם - קיצוץ בתקציב',
                        cost: 0,
                        effects: { gdp: -5, support: -10, stability: -5 },
                        message: 'המשק סובל! האוכלוסייה כועסת.'
                    }
                ],
                severity: 'high',
                duration: 60000
            },
            {
                id: 'tech_boom',
                title: '💻 פריצת דרך טכנולוגית',
                description: 'חברת סטארט-אפ מקומית פיתחה טכנולוגיה מהפכנית ב-AI!',
                choices: [
                    {
                        text: 'תמוך בפיתוח ($2B)',
                        cost: 2000000000,
                        effects: { gdp: +10, growthRate: +1, support: +8 },
                        message: 'חזון! המדינה הופכת למוביל טכנולוגי.'
                    },
                    {
                        text: 'רכוש את החברה ($4B)',
                        cost: 4000000000,
                        effects: { gdp: +20, militaryStrength: +5, support: -3 },
                        message: 'השקעה אסטרטגית! שליטה ממשלתית מלאה.'
                    },
                    {
                        text: 'אל תתערב',
                        cost: 0,
                        effects: { support: -5 },
                        message: 'הזדמנות שהוחמצה. חברות זרות רוכשות את הטכנולוגיה.'
                    }
                ],
                severity: 'medium',
                duration: 45000
            },
            {
                id: 'market_crash',
                title: '📉 קריסת שוק המניות',
                description: 'פאניקה בשווקים! מדד המניות צנח ב-25% בשעה אחת.',
                choices: [
                    {
                        text: 'הזרמת כסף חירום ($10B)',
                        cost: 10000000000,
                        effects: { gdp: -3, support: +5, stability: +10 },
                        message: 'התערבות ממשלתית הצליחה! השוק מתייצב.'
                    },
                    {
                        text: 'הורד מיסים זמנית',
                        cost: 0,
                        effects: { treasury: -5000000000, support: +10, gdp: +2 },
                        message: 'האוכלוסייה מרוצה, אך הקופה נפגעת.'
                    },
                    {
                        text: 'תן לשוק להתקן בעצמו',
                        cost: 0,
                        effects: { gdp: -10, support: -15, stability: -10 },
                        message: 'קפיטליזם טהור! אך המחיר כבד.'
                    }
                ],
                severity: 'critical',
                duration: 90000
            },
            {
                id: 'trade_deal',
                title: '🤝 הצעת סחר בינלאומית',
                description: `${this.getRandomNation(state).name} מציעה הסכם סחר חופשי פורץ דרך.`,
                choices: [
                    {
                        text: 'חתום על ההסכם',
                        cost: 0,
                        effects: { gdp: +15, growthRate: +0.8, support: +5 },
                        message: 'יחסים כלכליים מצוינים! הכנסות עולות.'
                    },
                    {
                        text: 'נהל מחדש תנאים טובים יותר',
                        cost: 1000000000,
                        effects: { gdp: +20, relations: +10 },
                        message: 'משא ומתן חכם! עסקה משתלמת מאוד.'
                    },
                    {
                        text: 'דחה - הגן על תעשייה מקומית',
                        cost: 0,
                        effects: { support: +3, gdp: -5, relations: -15 },
                        message: 'פרוטקציוניזם. העסקים המקומיים שמחים, העולם פחות.'
                    }
                ],
                severity: 'medium',
                duration: 60000
            }
        ];

        return this.selectRandomEvent(events);
    }

    generatePoliticalEvent(state) {
        const events = [
            {
                id: 'mass_protests',
                title: '✊ הפגנות המוניות',
                description: `מאות אלפים יוצאים לרחובות! תמיכה העם: ${state.internal.support}%`,
                choices: [
                    {
                        text: 'שוחח עם מפגינים - הבטח רפורמות',
                        cost: 0,
                        effects: { support: +15, stability: +5, treasury: -2000000000 },
                        message: 'הקשבה ודיאלוג! המצב נרגע.'
                    },
                    {
                        text: 'פזר אותם בכוח',
                        cost: 0,
                        effects: { support: -25, stability: -15, militaryStrength: +5 },
                        message: 'דיכוי אלים. הזעם גובר, אך הרחובות שקטים.'
                    },
                    {
                        text: 'קיים בחירות מיידיות',
                        cost: 500000000,
                        effects: { support: state.internal.support > 60 ? +20 : -30, stability: -10 },
                        message: state.internal.support > 60 ? 'ניצחת! המנדט התחדש.' : 'הפסדת השלטון!'
                    }
                ],
                severity: 'critical',
                duration: 120000
            },
            {
                id: 'corruption_scandal',
                title: '🕵️ שערוריית שחיתות',
                description: 'תחקיר עיתונאי חושף שחיתות ברמה הגבוהה!',
                choices: [
                    {
                        text: 'חקירה מיידית ופיטורים',
                        cost: 0,
                        effects: { support: +10, stability: -5 },
                        message: 'שקיפות! האמון במערכת עולה.'
                    },
                    {
                        text: 'הכחש והדלף נגד התקשורת',
                        cost: 0,
                        effects: { support: -20, stability: -10 },
                        message: 'האמינות שלך קורסת. העיתונות מגבירה את החשיפה.'
                    },
                    {
                        text: 'קנה שתיקה ($3B)',
                        cost: 3000000000,
                        effects: { support: -5, stability: +5 },
                        message: 'הכסף עובד. בינתיים.'
                    }
                ],
                severity: 'high',
                duration: 75000
            },
            {
                id: 'tax_revolt',
                title: '💸 מרד המיסים',
                description: 'אזרחים מסרבים לשלם מיסים! הקופה בסכנה.',
                choices: [
                    {
                        text: 'הורד מיסים ב-20%',
                        cost: 0,
                        effects: { treasury: -10000000000, support: +25, gdp: +5 },
                        message: 'פופוליזם עובד! אך ההוצאות עולות.'
                    },
                    {
                        text: 'אכוף גביה בכוח',
                        cost: 0,
                        effects: { support: -30, stability: -20, treasury: +5000000000 },
                        message: 'כוח גובה! אך העם שונא אותך.'
                    },
                    {
                        text: 'רפורמת מס מעמיקה',
                        cost: 2000000000,
                        effects: { support: +5, treasury: +3000000000, growthRate: +0.3 },
                        message: 'פשרה חכמה. המערכת משתפרת.'
                    }
                ],
                severity: 'high',
                duration: 90000
            }
        ];

        return this.selectRandomEvent(events);
    }

    generateMilitaryEvent(state) {
        const events = [
            {
                id: 'border_incident',
                title: '🚨 אירוע גבול',
                description: `כוחות ${this.getRandomEnemy(state).name} חדרו למרחב האווירי שלך!`,
                choices: [
                    {
                        text: 'סלקדה מיידית - שלח מטוסים',
                        cost: 500000000,
                        effects: { militaryStrength: +3, support: +10, relations: -20 },
                        message: 'כוח מרתיע! הפולשים נמלטו.'
                    },
                    {
                        text: 'הגש מחאה דיפלומטית',
                        cost: 0,
                        effects: { support: -5, relations: -5 },
                        message: 'תגובה חלשה. העולם רואה חולשה.'
                    },
                    {
                        text: 'הכרז מלחמה!',
                        cost: 0,
                        effects: { war: true, support: +15, militaryStrength: +10 },
                        message: 'מלחמה מוכרזת! האומה מתגייסת.'
                    }
                ],
                severity: 'critical',
                duration: 60000
            },
            {
                id: 'arms_deal',
                title: '🚀 עסקת נשק מיוחדת',
                description: 'BareketLand מציעה מערכת הגנה מפני טילים מתקדמת.',
                choices: [
                    {
                        text: 'קנה ($15B)',
                        cost: 15000000000,
                        effects: { militaryStrength: +15, support: +5 },
                        message: 'טכנולוגיה מתקדמת! הגנה משופרת.'
                    },
                    {
                        text: 'פתח בעצמך ($20B, 2 חודשים)',
                        cost: 20000000000,
                        effects: { militaryStrength: +20, support: +10, growthRate: +0.5 },
                        message: 'עצמאות טכנולוגית! השקעה ארוכת טווח.'
                    },
                    {
                        text: 'דחה',
                        cost: 0,
                        effects: { support: -3 },
                        message: 'חיסכון זמני, אך הפער גדל.'
                    }
                ],
                severity: 'medium',
                duration: 90000
            }
        ];

        return this.selectRandomEvent(events);
    }

    generateDiplomaticEvent(state) {
        const ally = this.getRandomAlly(state);
        const enemy = this.getRandomEnemy(state);

        const events = [
            {
                id: 'alliance_offer',
                title: '🤝 הצעת ברית',
                description: `${ally.name} מציע ברית אסטרטגית מלאה!`,
                choices: [
                    {
                        text: 'קבל את ההצעה',
                        cost: 0,
                        effects: { alliance: ally.id, militaryStrength: +10, support: +5 },
                        message: 'ברית חזקה! כוחכם גדל.'
                    },
                    {
                        text: 'נהל תנאים טובים יותר ($1B)',
                        cost: 1000000000,
                        effects: { alliance: ally.id, militaryStrength: +15, gdp: +5 },
                        message: 'עסקה מעולה! יתרונות משני הצדדים.'
                    },
                    {
                        text: 'דחה - שמור על עצמאות',
                        cost: 0,
                        effects: { relations: -10, support: +3 },
                        message: 'עצמאות מלאה, אך בדידות גיאופוליטית.'
                    }
                ],
                severity: 'medium',
                duration: 120000
            },
            {
                id: 'spy_exposed',
                title: '🕵️ מרגל נחשף',
                description: `תפסת מרגל מ-${enemy.name} במתקן סודי!`,
                choices: [
                    {
                        text: 'חשוף בציבוריות - השפל',
                        cost: 0,
                        effects: { relations: -30, support: +15 },
                        message: 'סקנדל בינלאומי! אך העם גאה.'
                    },
                    {
                        text: 'שחרר בשקט תמורת אסיר משלך',
                        cost: 0,
                        effects: { relations: +5, support: -5 },
                        message: 'דיפלומטיה שקטה. משבר נמנע.'
                    },
                    {
                        text: 'גייס אותו כסוכן כפול',
                        cost: 500000000,
                        effects: { intelligence: +20, relations: -15 },
                        message: 'משחק מודיעיני! מידע חשוב מגיע.'
                    }
                ],
                severity: 'high',
                duration: 75000
            }
        ];

        return this.selectRandomEvent(events);
    }

    generateDisasterEvent(state) {
        const events = [
            {
                id: 'earthquake',
                title: '🌊 רעידת אדמה קטלנית',
                description: 'רעש בעוצמה 7.2 פגע במרכזי ערים! אלפי נפגעים.',
                choices: [
                    {
                        text: 'סיוע חירום מלא ($8B)',
                        cost: 8000000000,
                        effects: { support: +20, stability: +10 },
                        message: 'תגובה מהירה! האומה מתאחדת.'
                    },
                    {
                        text: 'סיוע מינימלי ($2B)',
                        cost: 2000000000,
                        effects: { support: -10, stability: -5 },
                        message: 'חיסכון, אך העם סובל.'
                    },
                    {
                        text: 'בקש סיוע בינלאומי',
                        cost: 0,
                        effects: { support: -5, relations: +10, gdp: +3 },
                        message: 'סיוע זר מגיע. אבל נראית חלש.'
                    }
                ],
                severity: 'critical',
                duration: 180000
            },
            {
                id: 'pandemic',
                title: '🦠 התפרצות מגיפה',
                description: 'נגיף חדש מתפשט במהירות! מערכת הבריאות קורסת.',
                choices: [
                    {
                        text: 'סגר מלא + חיסונים ($12B)',
                        cost: 12000000000,
                        effects: { support: -15, stability: +15, gdp: -10 },
                        message: 'האפידמיה נשלטת, אך המחיר כלכלי כבד.'
                    },
                    {
                        text: 'אסטרטגיית חסינות עדר',
                        cost: 0,
                        effects: { support: -30, stability: -20, population: -1000000 },
                        message: 'אסון! אלפים מתים. העולם מגנה.'
                    },
                    {
                        text: 'אזורי + בדיקות ($5B)',
                        cost: 5000000000,
                        effects: { support: -5, stability: +5, gdp: -5 },
                        message: 'גישה מאוזנת. המצב מתמודד איטית.'
                    }
                ],
                severity: 'critical',
                duration: 240000
            }
        ];

        return this.selectRandomEvent(events);
    }

    selectRandomEvent(events) {
        return events[Math.floor(Math.random() * events.length)];
    }

    getRandomNation(state) {
        const nations = Object.values(NATIONS).filter(n => n.id !== state.selectedNation);
        return nations[Math.floor(Math.random() * nations.length)];
    }

    getRandomAlly(state) {
        const allies = Object.entries(state.diplomacy.relations)
            .filter(([id, rel]) => rel > 50 && id !== state.selectedNation)
            .map(([id]) => NATIONS[id]);
        return allies.length > 0 ? allies[Math.floor(Math.random() * allies.length)] : this.getRandomNation(state);
    }

    getRandomEnemy(state) {
        const enemies = Object.entries(state.diplomacy.relations)
            .filter(([id, rel]) => rel < 0 && id !== state.selectedNation)
            .map(([id]) => NATIONS[id]);
        return enemies.length > 0 ? enemies[Math.floor(Math.random() * enemies.length)] : this.getRandomNation(state);
    }

    applyEventChoice(event, choiceIndex) {
        const choice = event.choices[choiceIndex];
        const state = this.engine.state;

        // בדיקה אם יש מספיק כסף
        if (choice.cost > state.resources.treasury) {
            return {
                success: false,
                message: '❌ אין מספיק תקציב!'
            };
        }

        // החלת האפקטים
        if (choice.cost) state.resources.treasury -= choice.cost;
        if (choice.effects.gdp) state.resources.gdp *= (1 + choice.effects.gdp / 100);
        if (choice.effects.growthRate) state.resources.growthRate += choice.effects.growthRate;
        if (choice.effects.support) state.internal.support = Math.max(0, Math.min(100, state.internal.support + choice.effects.support));
        if (choice.effects.stability) state.internal.stability = Math.max(0, Math.min(100, state.internal.stability + choice.effects.stability));
        if (choice.effects.militaryStrength) state.military.strength = Math.max(0, Math.min(100, state.military.strength + choice.effects.militaryStrength));
        if (choice.effects.treasury) state.resources.treasury += choice.effects.treasury;
        if (choice.effects.population) state.demographics.population += choice.effects.population;

        // יחסים דיפלומטיים
        if (choice.effects.relations) {
            const targetNation = this.getRandomNation(state);
            const currentRelation = state.diplomacy.relations[targetNation.id] || 0;
            state.diplomacy.relations[targetNation.id] = Math.max(-100, Math.min(100, currentRelation + choice.effects.relations));
        }

        // מלחמה
        if (choice.effects.war) {
            const enemy = this.getRandomEnemy(state);
            this.engine.declareWar(enemy.id);
        }

        // ברית
        if (choice.effects.alliance) {
            state.diplomacy.alliances.push(choice.effects.alliance);
        }

        // הסרת האירוע מהרשימה הפעילה
        this.activeEvents = this.activeEvents.filter(e => e.id !== event.id);

        this.engine.notifyListeners();

        return {
            success: true,
            message: choice.message
        };
    }
}
