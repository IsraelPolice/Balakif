// מנוע אירועים מיתי - רמיקסים של סיפורי החבר'ה הטובים
// Mythic Events Engine - "The Good Guys" Lore Remixed into Geopolitics

import { NATIONS } from './nations.js';

export class MythicEventsSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.currentEra = 'foundation'; // 2009-2013
        this.eventHistory = [];
        this.activeChains = [];
        this.culturalLegacy = {
            benZonaOfYear: null,
            traditions: [],
            legendaryMoments: []
        };
    }

    // תקופות המשחק
    getEras() {
        return {
            foundation: {
                id: 'foundation',
                name: 'היסוד',
                years: '2009-2013',
                description: 'מקורות הקונדס - בגידות בר מצווה, קללות ופעלולים',
                unlocked: true,
                color: '#00d9ff'
            },
            chaos_peak: {
                id: 'chaos_peak',
                name: 'שיא הכאוס',
                years: '2014-2017',
                description: 'מצורי לג בעומר, דיסים ומתקפות סייבר',
                unlocked: false,
                color: '#ff0055'
            },
            maturation: {
                id: 'maturation',
                name: 'ההתבגרות',
                years: '2018-2020',
                description: 'משמרות במפעל, ריקודי דבש והתחלות חדשות',
                unlocked: false,
                color: '#ffd700'
            },
            trials: {
                id: 'trials',
                name: 'הניסיונות',
                years: '2021-2023',
                description: 'אוקטובר 7, חתונות והתחדשות',
                unlocked: false,
                color: '#ff8800'
            },
            zenith: {
                id: 'zenith',
                name: 'השיא',
                years: '2024-2025',
                description: 'סאגת Blackif - הגמר האגדי',
                unlocked: false,
                color: '#9d00ff'
            }
        };
    }

    // 50+ אירועים מהוויקיפדיה - רמיקס גיאופוליטי
    getMythicEvents() {
        return {
            // תקופת היסוד (2009-2013)
            foundation: [
                {
                    id: 'poop_prank_siege',
                    name: '🚽 מצור פעלול הקקי',
                    era: 'foundation',
                    year: 2010,
                    description: 'המנהיג של {nation} החליט לבצע פעלול מזעזע - פיצוץ של שקית קקי במתחם שגרירות {target}!',
                    trigger: { joy: { max: 60 }, relations: { min: -50 } },
                    choices: [
                        {
                            text: 'הפעל את המבצע הסמוי',
                            effects: { relations: -15, joy: +10, reputation: -20 },
                            consequence: '💥 הפעלול עבר! השגריר של {target} זועם אבל העם צוחק!'
                        },
                        {
                            text: 'בטל - זה הזוי מדי',
                            effects: { joy: -5, reputation: +5 },
                            consequence: '😐 העם מאוכזב. "היכן הכיף?!"'
                        }
                    ],
                    chainReaction: 'diss_war_escalation'
                },
                {
                    id: 'bar_mitzvah_betrayal',
                    name: '🎂 בגידת בר המצווה',
                    era: 'foundation',
                    year: 2009,
                    description: 'בר מצווה מפואר במדינה שלך! אבל המנהיג של {ally} לא הוזמן... הוא זועם!',
                    trigger: { relations: { max: 70 }, treasury: { min: 1000000000 } },
                    choices: [
                        {
                            text: 'התנצל ושלח מתנה יוקרתית',
                            effects: { relations: +10, treasury: -500000000 },
                            consequence: '🎁 המתנה התקבלה. היחסים הוחזרו.'
                        },
                        {
                            text: '"לך תזדיין!" - התעלם',
                            effects: { relations: -30, reputation: -10 },
                            consequence: '😡 בגידה! {ally} זוכר את זה...',
                            chainReaction: 'eternal_grudge'
                        }
                    ]
                },
                {
                    id: 'facebook_hack_incident',
                    name: '💻 פריצת הפייסבוק הגדולה',
                    era: 'foundation',
                    year: 2011,
                    description: 'הסוכנים שלך פרצו לחשבון הפייסבוק של מנהיג {target}! מה לעשות עם המידע?',
                    trigger: { innovation: { min: 60 } },
                    choices: [
                        {
                            text: 'פרסם תמונות משפילות',
                            effects: { relations: -40, reputation: -15, joy: +15 },
                            consequence: '😂 העולם צוחק! אבל {target} נשבע נקמה...',
                            chainReaction: 'cyber_war'
                        },
                        {
                            text: 'שימוש למודיעין בלבד',
                            effects: { intelligence: +20, relations: -10 },
                            consequence: '🕵️ המודיעין שלך חזק יותר. פעולה מקצועית.'
                        }
                    ]
                },
                {
                    id: 'volume_darbuka_culture',
                    name: '🥁 מהפכת הדרבוקה בווליום',
                    era: 'foundation',
                    year: 2010,
                    description: 'הדרבוקות מהדהדות ברחובות! תרבות עממית חדשה מתפרצת במדינה.',
                    trigger: { joy: { min: 70 } },
                    choices: [
                        {
                            text: 'הפוך את זה למוזיקה לאומית',
                            effects: { joy: +10, culture: +15, tourism: +5 },
                            consequence: '🎵 הדרבוקה הופכת לסמל לאומי! תיירים מגיעים לפסטיבלים!'
                        },
                        {
                            text: 'אסור - יוצר רעש',
                            effects: { joy: -15, unrest: +10 },
                            consequence: '🔇 העם מתקומם! "תנו לנו את הקצב!"'
                        }
                    ]
                },
                {
                    id: 'matzah_incident',
                    name: '🍞 אירוע המצה והקקי',
                    era: 'foundation',
                    year: 2013,
                    description: 'חייל אויב נתפס משתמש במצה כנייר טואלט בגבול! זה השפלה לאומית!',
                    trigger: { military_strength: { min: 60 } },
                    choices: [
                        {
                            text: 'הכרז מלחמה מיידית!',
                            effects: { war: true, support: +20 },
                            consequence: '⚔️ המלחמה פורצת! העם תומך בנקמה!',
                            chainReaction: 'border_conflict'
                        },
                        {
                            text: 'הגש תלונה לאו"ם',
                            effects: { diplomacy: +10, reputation: +5 },
                            consequence: '📜 האו"ם מגנה. אבל העם רוצה פעולה...'
                        }
                    ]
                }
            ],

            // שיא הכאוס (2014-2017)
            chaos_peak: [
                {
                    id: 'lag_baomer_siege',
                    name: '🔥 מצור לג בעומר',
                    era: 'chaos_peak',
                    year: 2014,
                    description: 'פסגת מנהיגים בהר מירון! אבל קבוצת מנהיגי {enemies} מפריעה למדורה הלאומית!',
                    trigger: { event_count: 5 },
                    choices: [
                        {
                            text: 'הפעל כוחות מיוחדים להרחקתם',
                            effects: { military: -5, relations: -25, joy: +15 },
                            consequence: '💪 המדורה מוגנת! אבל יחסים נפגעו...'
                        },
                        {
                            text: 'הזמן אותם להצטרף למדורה',
                            effects: { relations: +20, culture: +10 },
                            consequence: '🤝 אחדות מפתיעה! המנהיגים מתקרבים.'
                        }
                    ]
                },
                {
                    id: 'diss_track_warfare',
                    name: '🎤 מלחמת הדיסים',
                    era: 'chaos_peak',
                    year: 2015,
                    description: 'הראפר הלאומי שלך הוציא דיס טראק קשה נגד {rival}!',
                    trigger: { culture: { min: 50 } },
                    choices: [
                        {
                            text: 'משדר ברדיו הלאומי!',
                            effects: { joy: +20, relations: -30, soft_power: +15 },
                            consequence: '📻 הדיס ויראלי! {rival} מושפל עולמית!',
                            chainReaction: 'cultural_cold_war'
                        },
                        {
                            text: 'מנע שידור - הגזמה',
                            effects: { joy: -10, freedom: -5 },
                            consequence: '🚫 הראפר זועם. "צנזורה!"'
                        }
                    ]
                },
                {
                    id: 'gaaton_nightclub_brawl',
                    name: '🍸 קטטת מועדון געתון',
                    era: 'chaos_peak',
                    year: 2019,
                    description: 'קטטה אלימה פרצה במועדון בין אנשי ממשלה שלך לבין דיפלומטים של {nation}!',
                    trigger: { joy: { max: 50 }, alcohol_policy: 'permissive' },
                    choices: [
                        {
                            text: 'הגן על האנשים שלך',
                            effects: { relations: -35, loyalty: +15 },
                            consequence: '🥊 "הם התחילו!" הנאמנות חזקה אבל יחסים קרסו.'
                        },
                        {
                            text: 'התנצל והעמד לדין',
                            effects: { relations: +10, loyalty: -10 },
                            consequence: '⚖️ צדק נעשה. אבל העם מתמרמר.'
                        }
                    ]
                },
                {
                    id: 'nude_recordings_scandal',
                    name: '📹 שערוריית הקלטות העירום',
                    era: 'chaos_peak',
                    year: 2016,
                    description: 'הקלטות מביכות של דיפלומט בכיר דלפו לתקשורת!',
                    trigger: { reputation: { max: 60 } },
                    choices: [
                        {
                            text: 'תקוף את התקשורת',
                            effects: { freedom: -15, reputation: -10 },
                            consequence: '📰 "מלחמה בחופש העיתונות!"'
                        },
                        {
                            text: 'פטר את הדיפלומט',
                            effects: { reputation: +10, loyalty: -5 },
                            consequence: '🔥 הדיפלומט מפוטר. המוניטין משוקם.'
                        }
                    ]
                }
            ],

            // התבגרות (2018-2020)
            maturation: [
                {
                    id: 'factory_labor_espionage',
                    name: '🏭 ריגול במשמרות המפעל',
                    era: 'maturation',
                    year: 2018,
                    description: 'סוכנים זרים הסתננו למפעלים הלאומיים במסווה של פועלים!',
                    trigger: { industrial_output: { min: 1000000000 } },
                    choices: [
                        {
                            text: 'פשיטה מיידית',
                            effects: { security: +15, production: -10 },
                            consequence: '🚨 הסוכנים נעצרו! אבל הייצור נפגע.'
                        },
                        {
                            text: 'האכל מידע כוזב',
                            effects: { intelligence: +25, deception: +20 },
                            consequence: '🕵️ המידע הכוזב מועבר! האויב מבולבל!'
                        }
                    ]
                },
                {
                    id: 'honey_slap_border',
                    name: '🍯 סטירת הדבש בגבול',
                    era: 'maturation',
                    year: 2019,
                    description: 'מפקד צבאי סטר סטירה לחייל מ-{nation} בסכסוך גבולי קטן!',
                    trigger: { border_tension: { min: 60 } },
                    choices: [
                        {
                            text: 'דרוש התנצלות רשמית',
                            effects: { relations: -20, honor: +10 },
                            consequence: '✊ הכבוד שמור. אבל המתיחות גוברת.'
                        },
                        {
                            text: 'התעלם - תקרית קטנה',
                            effects: { honor: -5, peace: +5 },
                            consequence: '🤷 העניין מתפוגג. אבל הצבא מתמרמר.'
                        }
                    ]
                },
                {
                    id: 'honua_black_market',
                    name: '🌿 שוק השחור של חונוואה',
                    era: 'maturation',
                    year: 2019,
                    description: 'רשת סחר בסמים בינלאומית נחשפה! המנהיג של {nation} מעורב!',
                    trigger: { corruption: { min: 40 } },
                    choices: [
                        {
                            text: 'חשוף את הרשת',
                            effects: { relations: -40, reputation: +20, treasury: +2000000000 },
                            consequence: '💰 הרשת נתפסה! רווחים ענקיים מוחרמים!'
                        },
                        {
                            text: 'סגור עין תמורת שוחד',
                            effects: { corruption: +20, treasury: +5000000000 },
                            consequence: '🤐 החשבון שלך מתנפח... אבל בשקט.'
                        }
                    ]
                }
            ],

            // ניסיונות (2021-2023)
            trials: [
                {
                    id: 'october_7_resilience',
                    name: '🎗️ חוסן 7 באוקטובר',
                    era: 'trials',
                    year: 2023,
                    description: 'משבר ביטחוני מזעזע! מתקפת פתע על המדינה!',
                    trigger: { random: 0.1 }, // 10% סיכוי
                    choices: [
                        {
                            text: 'גייס את כל המילואים',
                            effects: { military: +30, economy: -20, unity: +50 },
                            consequence: '💪 האומה מתאחדת! כולם מגיעים להגן!'
                        },
                        {
                            text: 'פתח במבצע תגמול',
                            effects: { military: +20, relations: -50, revenge: +100 },
                            consequence: '⚔️ "אף אחד לא פוגע בנו ויוצא שלם!"',
                            chainReaction: 'total_war'
                        }
                    ]
                },
                {
                    id: 'wedding_dynasty_pact',
                    name: '💒 חתונה ודינסטיה',
                    era: 'trials',
                    year: 2022,
                    description: 'המנהיג שלך מתחתן! האם להזמין מנהיגי {allies} ליצור ברית משפחתית?',
                    trigger: { age: { min: 25 }, relations: { min: 70 } },
                    choices: [
                        {
                            text: 'חתונה מפוארת עם כל הברית',
                            effects: { relations: +30, treasury: -3000000000, dynasty: true },
                            consequence: '👑 ברית דינסטית נוצרה! הקשרים חזקים יותר!'
                        },
                        {
                            text: 'חתונה צנועה - משפחה בלבד',
                            effects: { relations: -10, treasury: -500000000 },
                            consequence: '🎂 חתונה יפה, אבל בני הברית מאוכזבים.'
                        }
                    ]
                }
            ],

            // השיא (2024-2025)
            zenith: [
                {
                    id: 'blackif_saga_begins',
                    name: '🎬 סאגת Blackif מתחילה',
                    era: 'zenith',
                    year: 2024,
                    description: 'הזמן הגיע! להפיק את סרט התעמולה האגדי "Blackif" שישנה את העולם!',
                    trigger: { culture: { min: 80 }, treasury: { min: 10000000000 } },
                    choices: [
                        {
                            text: 'השקע הכל בסרט!',
                            effects: { treasury: -10000000000, blackif_production: 100 },
                            consequence: '🎥 הסרט בהפקה! העולם ממתין!',
                            chainReaction: 'blackif_climax'
                        },
                        {
                            text: 'לא עכשיו - מסוכן מדי',
                            effects: { culture: -20 },
                            consequence: '😞 ההזדמנות חלפה...'
                        }
                    ]
                },
                {
                    id: 'eviction_council_purge',
                    name: '🏛️ הפינוי והטיהור',
                    era: 'zenith',
                    year: 2025,
                    description: 'מנהיגי אופוזיציה מאיימים להדיח אותך! קמפיין מימים נגדך!',
                    trigger: { support: { max: 40 } },
                    choices: [
                        {
                            text: 'טהר את המועצה',
                            effects: { support: +20, freedom: -30, dictatorship: +50 },
                            consequence: '👿 השליטה מוחלטת! אבל בכוח...'
                        },
                        {
                            text: 'קיים בחירות הוגנות',
                            effects: { freedom: +20, risk_coup: 70 },
                            consequence: '🗳️ דמוקרטיה! אבל הסיכון גבוה...'
                        }
                    ]
                }
            ]
        };
    }

    // בחירת אירוע רנדומלי מהתקופה הנוכחית
    triggerRandomMythicEvent() {
        const state = this.engine.state;
        const eraEvents = this.getMythicEvents()[this.currentEra];

        if (!eraEvents || eraEvents.length === 0) return null;

        // סינון אירועים שעומדים בתנאי ההפעלה
        const eligibleEvents = eraEvents.filter(event => {
            if (!event.trigger) return true;

            // בדיקת כל התנאים
            for (const [key, condition] of Object.entries(event.trigger)) {
                if (key === 'random') {
                    if (Math.random() > condition) return false;
                } else if (key === 'joy') {
                    if (condition.max && state.internal.publicJoy > condition.max) return false;
                    if (condition.min && state.internal.publicJoy < condition.min) return false;
                } else if (key === 'relations') {
                    // בדוק יחסים עם מדינות
                    const avgRelations = Object.values(state.diplomacy.relations).reduce((a, b) => a + b, 0) / Object.keys(state.diplomacy.relations).length;
                    if (condition.max && avgRelations > condition.max) return false;
                    if (condition.min && avgRelations < condition.min) return false;
                }
            }

            return true;
        });

        if (eligibleEvents.length === 0) return null;

        // בחר אירוע רנדומלי
        const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];

        // החלף placeholders
        return this.processEvent(event);
    }

    processEvent(event) {
        const state = this.engine.state;

        // החלף {nation}, {target}, {ally} במדינות אמיתיות
        const nations = Object.keys(NATIONS);
        const otherNations = nations.filter(n => n !== state.selectedNation);

        const target = otherNations[Math.floor(Math.random() * otherNations.length)];
        const ally = Object.entries(state.diplomacy.relations)
            .filter(([n, r]) => r > 50)
            .map(([n]) => n)[0] || target;

        const enemies = Object.entries(state.diplomacy.relations)
            .filter(([n, r]) => r < 0)
            .map(([n]) => n).slice(0, 3).join(', ') || target;

        const rival = otherNations[Math.floor(Math.random() * otherNations.length)];

        const processed = JSON.parse(JSON.stringify(event));

        processed.description = processed.description
            .replace(/\{nation\}/g, NATIONS[target]?.name || target)
            .replace(/\{target\}/g, NATIONS[target]?.name || target)
            .replace(/\{ally\}/g, NATIONS[ally]?.name || ally)
            .replace(/\{enemies\}/g, enemies)
            .replace(/\{rival\}/g, NATIONS[rival]?.name || rival);

        processed.choices = processed.choices.map(choice => ({
            ...choice,
            consequence: choice.consequence
                .replace(/\{nation\}/g, NATIONS[target]?.name || target)
                .replace(/\{target\}/g, NATIONS[target]?.name || target)
                .replace(/\{ally\}/g, NATIONS[ally]?.name || ally)
                .replace(/\{rival\}/g, NATIONS[rival]?.name || rival)
        }));

        processed.involvedNations = { target, ally, rival };

        return processed;
    }

    // שרשור אירועים - Butterfly Effect
    triggerChainReaction(chainId, previousChoice) {
        const chains = {
            diss_war_escalation: {
                name: 'הסלמת מלחמת הדיסים',
                events: ['diss_track_warfare', 'cultural_cold_war']
            },
            eternal_grudge: {
                name: 'איבה נצחית',
                events: ['bar_mitzvah_betrayal', 'gaaton_nightclub_brawl']
            },
            cyber_war: {
                name: 'מלחמת סייבר',
                events: ['facebook_hack_incident', 'factory_labor_espionage']
            },
            border_conflict: {
                name: 'סכסוך גבול',
                events: ['matzah_incident', 'honey_slap_border']
            },
            blackif_climax: {
                name: 'שיא Blackif',
                events: ['blackif_saga_begins', 'eviction_council_purge']
            },
            total_war: {
                name: 'מלחמה טוטלית',
                events: ['october_7_resilience']
            }
        };

        const chain = chains[chainId];
        if (!chain) return;

        this.activeChains.push({
            id: chainId,
            name: chain.name,
            startedAt: Date.now(),
            trigger: previousChoice
        });

        console.log(`🔗 שרשרת אירועים התחילה: ${chain.name}`);
    }

    // קידום תקופה
    advanceEra() {
        const eras = this.getEras();
        const eraOrder = ['foundation', 'chaos_peak', 'maturation', 'trials', 'zenith'];
        const currentIndex = eraOrder.indexOf(this.currentEra);

        if (currentIndex < eraOrder.length - 1) {
            this.currentEra = eraOrder[currentIndex + 1];
            eras[this.currentEra].unlocked = true;

            return {
                success: true,
                newEra: eras[this.currentEra],
                message: `🎊 תקופה חדשה נפתחה: ${eras[this.currentEra].name} (${eras[this.currentEra].years})`
            };
        }

        return { success: false, message: 'כל התקופות כבר נפתחו!' };
    }

    // מערכת "בן זונה של השנה"
    nominateBenZona(nationId, reason) {
        const state = this.engine.state;

        this.culturalLegacy.benZonaOfYear = {
            nation: nationId,
            year: new Date().getFullYear(),
            reason: reason,
            votes: 1
        };

        return {
            success: true,
            message: `🏆 ${NATIONS[nationId].name} מועמד לבן זונה של השנה!`,
            reason: reason
        };
    }

    voteBenZona(nationId) {
        if (this.culturalLegacy.benZonaOfYear?.nation === nationId) {
            this.culturalLegacy.benZonaOfYear.votes++;
            return {
                success: true,
                votes: this.culturalLegacy.benZonaOfYear.votes
            };
        }

        return { success: false, message: 'מדינה זו לא מועמדת השנה' };
    }

    // מסורות ופנימיות
    activateTradition(traditionId) {
        const traditions = {
            lech_tazdayen: {
                id: 'lech_tazdayen',
                name: 'לך תזדיין',
                effect: 'debuff',
                power: -15,
                description: 'קללה אגדית שמחלישה יחסים'
            },
            blackif_spirit: {
                id: 'blackif_spirit',
                name: 'רוח Blackif',
                effect: 'buff',
                power: +20,
                description: 'השראה תרבותית שמגבירה מורל'
            }
        };

        const tradition = traditions[traditionId];
        if (!tradition) return { success: false };

        this.culturalLegacy.traditions.push({
            ...tradition,
            activatedAt: Date.now()
        });

        return {
            success: true,
            tradition: tradition,
            message: `✨ מסורת הופעלה: ${tradition.name}`
        };
    }

    // קבלת סטטוס התקופה הנוכחית
    getCurrentEraStatus() {
        const eras = this.getEras();
        return {
            current: eras[this.currentEra],
            progress: (this.eventHistory.filter(e => e.era === this.currentEra).length / 5) * 100,
            nextEra: this.getNextEra()
        };
    }

    getNextEra() {
        const eraOrder = ['foundation', 'chaos_peak', 'maturation', 'trials', 'zenith'];
        const currentIndex = eraOrder.indexOf(this.currentEra);
        if (currentIndex < eraOrder.length - 1) {
            return this.getEras()[eraOrder[currentIndex + 1]];
        }
        return null;
    }
}
