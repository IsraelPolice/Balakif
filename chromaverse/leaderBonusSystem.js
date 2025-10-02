// מערכת בונוסים למנהיגים - כל מנהיג עם יכולות ייחודיות
// Leader Bonus System - Each "Good Guy" member brings unique abilities

export class LeaderBonusSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.activeBonus = null;
    }

    getLeaderBonuses() {
        return {
            // מערב - פרנקסטרים החופש
            'BareketLand': {
                leaderId: 'dvir_bareket',
                name: 'דביר ברקת',
                birthday: 'Feb 15, 1997',
                origin: 'קריית ביאליק',
                archetype: 'קפיטליסט כריזמטי',
                lore: 'מייסד "תקרית הפייסבוק" - מומחה פריצות והליווד',
                bonus: {
                    type: 'cyber_pranks',
                    name: '🎭 כריזמת הפרנק',
                    description: '+15% הצלחה בפריצות סייבר, +10% עסקאות סחר',
                    effects: {
                        cyber_success: 1.15,
                        trade_deals: 1.10,
                        hollywood_influence: 20
                    }
                },
                specialAbility: {
                    id: 'facebook_master',
                    name: 'מאסטר הפייסבוק',
                    cooldown: 120, // שניות
                    effect: 'פרוץ למדינת יריבה וגנוב מודיעין (+30 מודיעין, -25 יחסים)'
                }
            },
            'Titiland': {
                leaderId: 'itai_ohana',
                name: 'איתי אוחנה',
                birthday: 'Dec 28, 1997',
                origin: 'חיפה',
                archetype: 'הומניטרי לוהט',
                lore: 'מבצע "מופע הפסטיגנה" - אמן הופעה ומורל',
                bonus: {
                    type: 'morale_events',
                    name: '🎪 מופע הכוכב',
                    description: '+20% שמחת עם מאירועים, +15% נאמנות חיילים',
                    effects: {
                        event_joy: 1.20,
                        troop_loyalty: 1.15,
                        performance_bonus: 25
                    }
                },
                specialAbility: {
                    id: 'pestigena_show',
                    name: 'הופעת פסטיגנה',
                    cooldown: 90,
                    effect: 'הופעה לאומית מעוררת השראה (+30 שמחה, +10 גיוס)'
                }
            },
            'SchwartzLand': {
                leaderId: 'yaakov_schwartz',
                name: 'יעקב שוורץ',
                birthday: 'Jun 1997',
                origin: 'אריאל',
                archetype: 'חדשן טכנולוגי',
                lore: 'יוצר הדיס - מומחה תעמולה ורובוטיקה',
                bonus: {
                    type: 'propaganda_tech',
                    name: '🤖 רובוט התעמולה',
                    description: '+25% חדשנות טכנולוגית, +20% יעילות תעמולה',
                    effects: {
                        innovation: 1.25,
                        propaganda_power: 1.20,
                        robot_factories: true
                    }
                },
                specialAbility: {
                    id: 'diss_creator',
                    name: 'יוצר הדיס',
                    cooldown: 60,
                    effect: 'שחרר דיס טראק ויראלי נגד אויב (-40 יחסים, +25 כוח רך)'
                }
            },
            'BenmozesLand': {
                leaderId: 'koren_benmoshe',
                name: 'כורן בן משה',
                birthday: 'Dec 8, 1997',
                origin: 'הרצליה',
                archetype: 'דיפלומט ותיק',
                lore: 'שורד עילפון במדבר - בונוס חוסן וברזל',
                bonus: {
                    type: 'resilience_pacts',
                    name: '🏜️ שורד המדבר',
                    description: '+30% חוסן משברים, +15% יעילות הסכמי שלום',
                    effects: {
                        crisis_resilience: 1.30,
                        peace_deals: 1.15,
                        desert_bonus: 20
                    }
                },
                specialAbility: {
                    id: 'iron_will',
                    name: 'רצון ברזל',
                    cooldown: 180,
                    effect: 'התגבר על משבר קשה (בטל השפעות שליליות ל-3 דקות)'
                }
            },
            'BohbotLand': {
                leaderId: 'jordan_bohbot',
                name: 'ג\'ורדן בוהבוט',
                birthday: 'Jul 1, 1997',
                origin: 'ארה"ב',
                archetype: 'אלגנט גולה',
                lore: 'קורבן רכב הקיא - יצואן תרבות',
                bonus: {
                    type: 'overseas_intrigue',
                    name: '🌎 הקשר האמריקאי',
                    description: '+20% יחסי חוץ, +15% יצוא תרבותי',
                    effects: {
                        foreign_relations: 1.20,
                        cultural_export: 1.15,
                        usa_connection: true
                    }
                },
                specialAbility: {
                    id: 'cultural_bridge',
                    name: 'גשר תרבויות',
                    cooldown: 120,
                    effect: 'פתח ברית חדשה עם מדינה רחוקה (+50 יחסים מיידיים)'
                }
            },
            'DahanLand': {
                leaderId: 'or_dahan',
                name: 'אור דהן',
                birthday: 'Feb 1, 1997',
                origin: 'תל אביב',
                archetype: 'סוחר שמש',
                lore: 'מבצע הדיס הראשון - מומחה ים תיכון',
                bonus: {
                    type: 'mediterranean_deals',
                    name: '☀️ סוחר השמש',
                    description: '+25% רווחי סחר ים תיכוני, +10% תיירות',
                    effects: {
                        mediterranean_trade: 1.25,
                        tourism: 1.10,
                        sunny_disposition: 15
                    }
                },
                specialAbility: {
                    id: 'first_diss',
                    name: 'הדיס הראשון',
                    cooldown: 90,
                    effect: 'השק דיס היסטורי (אפקט פסיכולוגי +20 על כל האויבים)'
                }
            },

            // קומוניזם - מנהלים חסרי רחמים
            'KachlerLand': {
                leaderId: 'yosef_kachler',
                name: 'יוסף כחלר',
                birthday: 'Apr 16, 1997',
                origin: 'גבעתיים',
                archetype: 'טקטיקן חסר רחמים',
                lore: 'חלוץ ההקלטות העירום - מלך המלחמה הפסיכולוגית',
                bonus: {
                    type: 'psy_war',
                    name: '🎭 מלחמה נפשית',
                    description: '+35% יעילות מלחמה פסיכולוגית, +20% ריגול',
                    effects: {
                        psychological_warfare: 1.35,
                        espionage: 1.20,
                        fear_factor: 30
                    }
                },
                specialAbility: {
                    id: 'nude_blackmail',
                    name: 'סחיטת עירום',
                    cooldown: 150,
                    effect: 'סחוט מנהיג אויב (הכריח אותו לעסקה לטובתך)'
                }
            },
            'DvirOhanaLand': {
                leaderId: 'dvir_ohana',
                name: 'דביר אוחנה',
                birthday: 'Aug 24, 1996',
                origin: 'חיפה',
                archetype: 'כוכב הקבוצה',
                lore: 'נבל Blackif - כריזמה אימפריאלית והתרחבות',
                bonus: {
                    type: 'expansion_charisma',
                    name: '⭐ כריזמת הכוכב',
                    description: '+40% מהירות התרחבות, +25% גיוס חיילים',
                    effects: {
                        expansion_speed: 1.40,
                        recruitment: 1.25,
                        star_power: 50
                    }
                },
                specialAbility: {
                    id: 'blackif_villain',
                    name: 'נבל Blackif',
                    cooldown: 240,
                    effect: 'שחק תפקיד נבל אגדי (כל היריבים מפחדים, -30% כוח צבאי שלהם)'
                }
            },
            'GorlovskyLand': {
                leaderId: 'micha_gorlovsky',
                name: 'מיכה גורלובסקי',
                birthday: 'Mar 22, 1997',
                origin: 'תל אביב',
                archetype: 'ווילדקארד לוגיסטי',
                lore: 'מסית פציעת התפוח - האקר שרשרת אספקה',
                bonus: {
                    type: 'supply_chain_hacks',
                    name: '🍎 האקר האספקה',
                    description: '+30% יעילות לוגיסטית, +20% חבלה באויב',
                    effects: {
                        logistics: 1.30,
                        sabotage: 1.20,
                        apple_incident: true
                    }
                },
                specialAbility: {
                    id: 'supply_sabotage',
                    name: 'חבלת אספקה',
                    cooldown: 100,
                    effect: 'שבש שרשרת אספקה של אויב (-40% ייצור צבאי שלו ל-5 דקות)'
                }
            },

            // נייטרלים
            'NagarLand': {
                leaderId: 'koren_nagar',
                name: 'כורן נגר',
                birthday: 'Jun 30, 1997',
                origin: 'נהריה',
                archetype: 'שומר שקט',
                lore: 'לוחם קקי המצה - חוסן גבולות',
                bonus: {
                    type: 'border_resilience',
                    name: '🛡️ מגן הגבול',
                    description: '+25% חוזק הגנת גבול, +15% הישרדות מדבר',
                    effects: {
                        border_defense: 1.25,
                        desert_survival: 1.15,
                        quiet_strength: 20
                    }
                },
                specialAbility: {
                    id: 'matzah_defender',
                    name: 'מגן המצה',
                    cooldown: 90,
                    effect: 'הגנה מושלמת מפני פלישה (+50% חוזק הגנה ל-2 דקות)'
                }
            },
            'LasriLand': {
                leaderId: 'amit_lasri',
                name: 'עמית לסרי',
                birthday: 'Dec 17, 1996',
                origin: 'גבעתיים',
                archetype: 'אדריכל חדשני',
                lore: 'מייסד הקבוצה - האב המעורר השראה',
                bonus: {
                    type: 'prank_innovations',
                    name: '💡 החדשנות של המייסד',
                    description: '+30% חדשנות, +25% הצלחת פעלולים, +20% מורל',
                    effects: {
                        innovation: 1.30,
                        prank_success: 1.25,
                        founder_morale: 1.20
                    }
                },
                specialAbility: {
                    id: 'architect_vision',
                    name: 'חזון האדריכל',
                    cooldown: 180,
                    effect: 'חזון מייסד - כל המדינות בוני הברית מקבלות +15% לכל הסטטיסטיקות'
                }
            }
        };
    }

    activateLeaderBonus(nationId) {
        const bonuses = this.getLeaderBonuses();
        const bonus = bonuses[nationId];

        if (!bonus) {
            return { success: false, message: 'אין בונוס זמין למנהיג זה' };
        }

        this.activeBonus = bonus;
        const state = this.engine.state;

        // החל את האפקטים
        Object.entries(bonus.bonus.effects).forEach(([key, value]) => {
            switch(key) {
                case 'innovation':
                    state.internal.innovation = (state.internal.innovation || 50) * value;
                    break;
                case 'trade_deals':
                    state.internal.tradePower = (state.internal.tradePower || 1) * value;
                    break;
                case 'event_joy':
                    state.internal.eventJoyMultiplier = value;
                    break;
                case 'crisis_resilience':
                    state.internal.resilience = (state.internal.resilience || 1) * value;
                    break;
                case 'expansion_speed':
                    state.military.expansionBonus = value;
                    break;
            }
        });

        return {
            success: true,
            leader: bonus,
            message: `✨ ${bonus.name} מוביל את ${NATIONS[nationId]?.name}!\n${bonus.bonus.name}: ${bonus.bonus.description}`
        };
    }

    useSpecialAbility(nationId) {
        const bonuses = this.getLeaderBonuses();
        const bonus = bonuses[nationId];

        if (!bonus || !bonus.specialAbility) {
            return { success: false, message: 'אין יכולת מיוחדת זמינה' };
        }

        const ability = bonus.specialAbility;
        const state = this.engine.state;

        // בדוק cooldown
        const lastUsed = state.internal.lastAbilityUse || 0;
        const now = Date.now();
        if (now - lastUsed < ability.cooldown * 1000) {
            const remaining = Math.ceil((ability.cooldown * 1000 - (now - lastUsed)) / 1000);
            return {
                success: false,
                message: `⏳ היכולת בטעינה. זמן נותר: ${remaining} שניות`
            };
        }

        // הפעל את היכולת
        state.internal.lastAbilityUse = now;

        return {
            success: true,
            ability: ability,
            message: `🌟 ${ability.name} הופעל!\n${ability.effect}`
        };
    }

    getActiveLeaderInfo() {
        if (!this.activeBonus) return null;

        return {
            leader: this.activeBonus,
            specialAbilityReady: this.isSpecialAbilityReady()
        };
    }

    isSpecialAbilityReady() {
        if (!this.activeBonus) return false;

        const state = this.engine.state;
        const lastUsed = state.internal.lastAbilityUse || 0;
        const cooldown = this.activeBonus.specialAbility.cooldown * 1000;

        return (Date.now() - lastUsed) >= cooldown;
    }
}
