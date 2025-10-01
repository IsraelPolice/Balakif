export const NATIONS = {
  BareketLand: {
    id: 'BareketLand',
    name: 'ארץ ברקת',
    hebrewName: 'ארץ ברקת',
    title: 'הקולוסוס הדמוקרטי',
    flag: '🦅',
    leaderImage: 'https://i.postimg.cc/y8R1v8Nf/Chat-GPT-Image-Oct-1-2025-02-03-53-PM.png',
    leaderName: 'מנהיג ארץ ברקת',
    backstory: "נולדה ממהפכה של 1776, ארץ ברקת היא האימפריה הקפיטליסטית של גורדי שחקים, מרכזי סיליקון והוליווד. ב-2025 היא מתמודדת עם חוב עצום וגלי הגירה אך שולטת במימון העולמי דרך הדולר ותאגידים כמו 'אמזון-Corp'. כמעצמת העל היחידה בעולם, זו המדינה הטובה ביותר להתחלה.",
    demographics: {
      population: 415000000,
      area: 9200000,
      gdp: 31000000000000,
      industries: ['tech', 'energy', 'finance']
    },
    military: {
      strength: 90,
      personnel: 2000000,
      tanks: 8000,
      aircraft: 13000,
      ships: 11,
      submarines: 70,
      specialties: ['Air dominance', 'Cyber warfare', 'Special ops'],
      units: {
        infantry: 1000000,
        armor: 8000,
        airForce: 13000,
        navy: 500
      }
    },
    relations: {
      Titiland: 100,
      SchwartzLand: 95,
      BenmozesLand: 100,
      BohbotLand: 95,
      DahanLand: 90,
      LasriLand: 95,
      BenyaakovLand: 60,
      KachlerLand: -80,
      DvirOhanaLand: -90,
      ShabtayLand: -100
    },
    bloc: 'Western',
    startBonus: {
      militaryStrength: 20,
      diplomacyRange: 50,
      economicGrowth: 10
    },
    difficulty: 'Easy'
  },

  Titiland: {
    id: 'Titiland',
    name: 'Titiland',
    title: 'The Cool North',
    flag: '🍁',
    backstory: 'A multicultural haven from British colonial roots, Titiland thrives on vast wilderness and tolerance. In 2025, climate change threatens ice caps, but oil/trade booms. Supports LasriLand via humanitarian/diplomatic aid.',
    demographics: {
      population: 40000000,
      area: 10000000,
      gdp: 2200000000000,
      industries: ['oil', 'tech', 'tourism']
    },
    military: {
      strength: 65,
      personnel: 70000,
      tanks: 500,
      aircraft: 80,
      ships: 12,
      submarines: 4,
      specialties: ['Border defense', 'Peacekeeping'],
      units: {
        infantry: 50000,
        armor: 500,
        airForce: 80,
        navy: 50
      }
    },
    relations: {
      BareketLand: 100,
      LasriLand: 85,
      Nagarland: 70,
      KachlerLand: -50
    },
    bloc: 'Western',
    startBonus: {
      resourceIncome: 15,
      stability: 20
    },
    difficulty: 'Medium'
  },

  SchwartzLand: {
    id: 'SchwartzLand',
    name: 'SchwartzLand',
    title: 'The Unbeatable Tech',
    flag: '🗾',
    backstory: 'Reborn from WWII ashes into a robotic samurai future, SchwartzLand leads in AI/nuclear energy. In 2025, aging population strains it, but it\'s anti-China hawk. Partners with LasriLand on tech transfers.',
    demographics: {
      population: 125000000,
      area: 380000,
      gdp: 4500000000000,
      industries: ['electronics', 'autos', 'innovation']
    },
    military: {
      strength: 75,
      personnel: 250000,
      tanks: 1500,
      aircraft: 300,
      ships: 50,
      submarines: 20,
      specialties: ['Naval defense', 'Cyber'],
      units: {
        infantry: 180000,
        armor: 1500,
        airForce: 300,
        navy: 200
      }
    },
    relations: {
      BareketLand: 95,
      LasriLand: 80,
      DvirOhanaLand: -85,
      KachlerLand: -60
    },
    bloc: 'Western',
    startBonus: {
      technology: 25,
      navalPower: 15
    },
    difficulty: 'Medium'
  },

  BenmozesLand: {
    id: 'BenmozesLand',
    name: 'BenmozesLand',
    title: 'The Ancient Maritime Empire',
    flag: '🇬🇧',
    backstory: 'Heir to a sun-never-sets empire, BenmozesLand is a rainy financial nerve center. Post-2020s Brexit, it pivots to Asia trade while upholding intel traditions. Aids LasriLand with spies.',
    demographics: {
      population: 68000000,
      area: 250000,
      gdp: 3500000000000,
      industries: ['finance', 'pharma', 'services']
    },
    military: {
      strength: 70,
      personnel: 150000,
      tanks: 800,
      aircraft: 120,
      ships: 2,
      submarines: 10,
      specialties: ['Special forces', 'Intel'],
      units: {
        infantry: 100000,
        armor: 800,
        airForce: 120,
        navy: 100
      }
    },
    relations: {
      BareketLand: 100,
      LasriLand: 90,
      BenyaakovLand: 65,
      ShabtayLand: -70
    },
    bloc: 'Western',
    startBonus: {
      intelligence: 30,
      finance: 20
    },
    difficulty: 'Medium'
  },

  BohbotLand: {
    id: 'BohbotLand',
    name: 'BohbotLand',
    title: 'The Elegant Europe',
    flag: '🇫🇷',
    backstory: 'Land of wine, art, and revolutions, BohbotLand exports culture and once colonized Africa. In 2025, it fights internal terror but excels in nuclear energy. Views LasriLand as anti-radical ally.',
    demographics: {
      population: 68000000,
      area: 650000,
      gdp: 3100000000000,
      industries: ['aerospace', 'fashion', 'agriculture']
    },
    military: {
      strength: 75,
      personnel: 200000,
      tanks: 1200,
      aircraft: 200,
      ships: 10,
      submarines: 8,
      specialties: ['Overseas ops', 'Nuclear'],
      units: {
        infantry: 140000,
        armor: 1200,
        airForce: 200,
        navy: 80
      }
    },
    relations: {
      BareketLand: 95,
      LasriLand: 85,
      EingalLand: 60,
      ShabtayLand: -75
    },
    bloc: 'Western',
    startBonus: {
      culturalInfluence: 20,
      nuclearCapability: 100
    },
    difficulty: 'Medium'
  },

  DahanLand: {
    id: 'DahanLand',
    name: 'DahanLand',
    title: 'The Spanish Sun',
    flag: '🇪🇸',
    backstory: "Columbus's legacy of flamenco and exploration, DahanLand bridges Europe/Latin America. Recovering from 2020s crises, it booms in tourism. Supports LasriLand via Mediterranean trade.",
    demographics: {
      population: 48000000,
      area: 510000,
      gdp: 1700000000000,
      industries: ['tourism', 'agriculture', 'infrastructure']
    },
    military: {
      strength: 60,
      personnel: 120000,
      tanks: 600,
      aircraft: 100,
      ships: 8,
      submarines: 3,
      specialties: ['Naval patrol'],
      units: {
        infantry: 90000,
        armor: 600,
        airForce: 100,
        navy: 50
      }
    },
    relations: {
      BareketLand: 90,
      LasriLand: 75,
      Nagarland: 70
    },
    bloc: 'Western',
    startBonus: {
      tourism: 25,
      trade: 15
    },
    difficulty: 'Medium'
  },

  KachlerLand: {
    id: 'KachlerLand',
    name: 'KachlerLand',
    title: 'The Russian Bear',
    flag: '🐻',
    backstory: 'Tsarist-Soviet heir of oil and tundra, KachlerLand endures 2025 sanctions post-wars but fortifies its military. Borders LasriLand, probing ports.',
    demographics: {
      population: 145000000,
      area: 17000000,
      gdp: 2100000000000,
      industries: ['energy', 'heavy industry']
    },
    military: {
      strength: 85,
      personnel: 1000000,
      tanks: 4000,
      aircraft: 800,
      ships: 20,
      submarines: 60,
      specialties: ['Cold war', 'Ballistic missiles'],
      units: {
        infantry: 600000,
        armor: 4000,
        airForce: 800,
        navy: 150
      }
    },
    relations: {
      DvirOhanaLand: 100,
      GorlovskyLand: 100,
      LasriLand: -70,
      BareketLand: -90,
      ShabtayLand: 50
    },
    bloc: 'Communist',
    startBonus: {
      landArea: 50,
      resources: 30,
      militaryPower: 15
    },
    difficulty: 'Hard'
  },

  DvirOhanaLand: {
    id: 'DvirOhanaLand',
    name: 'DvirOhanaLand',
    title: 'The Chinese Dragon',
    flag: '🐉',
    backstory: 'Communist revolution turned world factory, DvirOhanaLand builds megacities and eyes islands. In 2025, trade wars rage, but growth surges. Sees LasriLand as trade threat.',
    demographics: {
      population: 1420000000,
      area: 9600000,
      gdp: 18500000000000,
      industries: ['manufacturing', 'tech']
    },
    military: {
      strength: 95,
      personnel: 2000000,
      tanks: 5000,
      aircraft: 3000,
      ships: 3,
      submarines: 70,
      specialties: ['Ground forces', 'Numbers'],
      units: {
        infantry: 1500000,
        armor: 5000,
        airForce: 3000,
        navy: 300
      }
    },
    relations: {
      KachlerLand: 100,
      LasriLand: -80,
      SchwartzLand: -90,
      OmerYosefLand: 60
    },
    bloc: 'Communist',
    startBonus: {
      population: 100,
      manufacturing: 40,
      economicGrowth: 20
    },
    difficulty: 'Hard'
  },

  GorlovskyLand: {
    id: 'GorlovskyLand',
    name: 'GorlovskyLand',
    title: 'The Loyal Sister',
    flag: '🌾',
    backstory: "KachlerLand's satellite of wheat and missiles, GorlovskyLand quells 2025 protests and hosts bases.",
    demographics: {
      population: 9500000,
      area: 210000,
      gdp: 75000000000,
      industries: ['agriculture', 'industry']
    },
    military: {
      strength: 50,
      personnel: 60000,
      tanks: 500,
      aircraft: 100,
      ships: 0,
      submarines: 0,
      specialties: ['Logistics support'],
      units: {
        infantry: 50000,
        armor: 500,
        airForce: 100,
        navy: 0
      }
    },
    relations: {
      KachlerLand: 100,
      BareketLand: -70,
      LasriLand: 20
    },
    bloc: 'Communist',
    startBonus: {
      agriculture: 30
    },
    difficulty: 'Medium'
  },

  LasriLand: {
    id: 'LasriLand',
    name: 'LasriLand',
    title: 'The Startup Warrior',
    flag: '🇮🇱',
    backstory: 'Tiny innovative powerhouse with sea access, LasriLand (12M people, tech hubs, elite forces) borders threats but thrives on Western ties. In 2025, it\'s the geopolitical fulcrum.',
    demographics: {
      population: 12000000,
      area: 1200000,
      gdp: 515000000000,
      industries: ['tech', 'ports']
    },
    military: {
      strength: 80,
      personnel: 40000,
      tanks: 300,
      aircraft: 150,
      ships: 9,
      submarines: 6,
      specialties: ['Precision strikes', 'Intel'],
      units: {
        infantry: 25000,
        armor: 300,
        airForce: 150,
        navy: 50
      }
    },
    relations: {
      BareketLand: 95,
      Titiland: 80,
      SchwartzLand: 80,
      BenmozesLand: 40,
      BohbotLand: 40,
      Nagarland: 70,
      BenyaakovLand: 50,
      OmerYosefLand: 40,
      MarksLand: -90,
      EingalLand: -75,
      DvirOhanaLand: -80,
      ShabtayLand: -100,
      SharvitLand: -80
    },
    bloc: 'Western',
    startBonus: {
      technology: 30,
      intelligence: 25,
      innovation: 35
    },
    difficulty: 'Hard'
  },

  Nagarland: {
    id: 'Nagarland',
    name: 'Nagarland',
    title: 'The Quiet Guardian',
    flag: '🏜️',
    backstory: 'Ancient Bedouin kingdom of deserts and tourism, Nagarland survives aid-dependent in 2025.',
    demographics: {
      population: 11500000,
      area: 90000,
      gdp: 55000000000,
      industries: ['tourism', 'trade']
    },
    military: {
      strength: 40,
      personnel: 100000,
      tanks: 200,
      aircraft: 50,
      ships: 0,
      submarines: 0,
      specialties: ['Border guard'],
      units: {
        infantry: 90000,
        armor: 200,
        airForce: 50,
        navy: 0
      }
    },
    relations: {
      LasriLand: 70,
      BareketLand: 80,
      MarksLand: -40
    },
    bloc: 'Neutral',
    startBonus: {
      stability: 15
    },
    difficulty: 'Easy'
  },

  BenyaakovLand: {
    id: 'BenyaakovLand',
    name: 'BenyaakovLand',
    title: 'The Middle East Gateway',
    flag: '🕌',
    backstory: 'Asia-Europe crossroads of mosques and markets, BenyaakovLand eyes regional power amid 2025 Kurdish tensions.',
    demographics: {
      population: 86000000,
      area: 780000,
      gdp: 1200000000000,
      industries: ['trade', 'textiles', 'agriculture']
    },
    military: {
      strength: 70,
      personnel: 400000,
      tanks: 3000,
      aircraft: 300,
      ships: 10,
      submarines: 5,
      specialties: ['Ground army'],
      units: {
        infantry: 350000,
        armor: 3000,
        airForce: 300,
        navy: 50
      }
    },
    relations: {
      LasriLand: 50,
      BareketLand: 70,
      ShabtayLand: -60
    },
    bloc: 'Neutral',
    startBonus: {
      trade: 20,
      militarySize: 15
    },
    difficulty: 'Medium'
  },

  OmerYosefLand: {
    id: 'OmerYosefLand',
    name: 'OmerYosefLand',
    title: 'The Fertile Poor',
    flag: '🌾',
    backstory: 'Riverine land of floods and textiles, OmerYosefLand grows fast but battles poverty in 2025.',
    demographics: {
      population: 170000000,
      area: 150000,
      gdp: 500000000000,
      industries: ['textiles', 'agriculture']
    },
    military: {
      strength: 35,
      personnel: 160000,
      tanks: 200,
      aircraft: 50,
      ships: 0,
      submarines: 0,
      specialties: ['Internal security'],
      units: {
        infantry: 150000,
        armor: 200,
        airForce: 50,
        navy: 0
      }
    },
    relations: {
      LasriLand: 40,
      DvirOhanaLand: 60
    },
    bloc: 'Neutral',
    startBonus: {
      population: 30,
      growth: 20
    },
    difficulty: 'Medium'
  },

  MarksLand: {
    id: 'MarksLand',
    name: 'MarksLand',
    title: 'The Stubborn Desert',
    flag: '⚔️',
    backstory: 'Oil wars\' ruins under tribal rule, MarksLand arms militias in 2025. Borders LasriLand aggressively.',
    demographics: {
      population: 46000000,
      area: 440000,
      gdp: 300000000000,
      industries: ['oil']
    },
    military: {
      strength: 45,
      personnel: 200000,
      tanks: 1000,
      aircraft: 100,
      ships: 0,
      submarines: 0,
      specialties: ['Militias'],
      units: {
        infantry: 180000,
        armor: 1000,
        airForce: 100,
        navy: 0
      }
    },
    relations: {
      LasriLand: -90,
      ShabtayLand: 50
    },
    bloc: 'Chaos',
    startBonus: {
      guerrilla: 25
    },
    difficulty: 'Hard'
  },

  EingalLand: {
    id: 'EingalLand',
    name: 'EingalLand',
    title: 'The Moroccan Shadow',
    flag: '🌙',
    backstory: 'Bazaar kingdom of markets and dunes, EingalLand traffics drugs/terror amid 2025 Sahara disputes.',
    demographics: {
      population: 38000000,
      area: 450000,
      gdp: 160000000000,
      industries: ['trade']
    },
    military: {
      strength: 40,
      personnel: 200000,
      tanks: 400,
      aircraft: 50,
      ships: 0,
      submarines: 0,
      specialties: ['Guerrilla'],
      units: {
        infantry: 190000,
        armor: 400,
        airForce: 50,
        navy: 0
      }
    },
    relations: {
      LasriLand: -75,
      BohbotLand: 50
    },
    bloc: 'Chaos',
    startBonus: {
      guerrilla: 30
    },
    difficulty: 'Hard'
  },

  ShabtayLand: {
    id: 'ShabtayLand',
    name: 'ShabtayLand',
    title: 'The Iranian Revolutionary',
    flag: '☪️',
    backstory: 'Islamic revolution exporting terror, ShabtayLand builds secret nukes under 2025 sanctions.',
    demographics: {
      population: 90000000,
      area: 1650000,
      gdp: 450000000000,
      industries: ['oil']
    },
    military: {
      strength: 65,
      personnel: 600000,
      tanks: 2000,
      aircraft: 300,
      ships: 5,
      submarines: 10,
      specialties: ['Missiles', 'Proxies'],
      units: {
        infantry: 500000,
        armor: 2000,
        airForce: 300,
        navy: 30
      }
    },
    relations: {
      LasriLand: -100,
      BareketLand: -95,
      KachlerLand: 80,
      BenmozesLand: -70,
      BohbotLand: -75,
      BenyaakovLand: -60
    },
    bloc: 'Chaos',
    startBonus: {
      missiles: 40,
      proxies: 35
    },
    difficulty: 'Very Hard'
  },

  SharvitLand: {
    id: 'SharvitLand',
    name: 'SharvitLand',
    title: 'The Sudanese Storm',
    flag: '🌪️',
    backstory: 'Civil war/genocide hellscape, SharvitLand backs pirates in 2025 chaos.',
    demographics: {
      population: 49000000,
      area: 1900000,
      gdp: 35000000000,
      industries: []
    },
    military: {
      strength: 30,
      personnel: 100000,
      tanks: 300,
      aircraft: 20,
      ships: 0,
      submarines: 0,
      specialties: ['Irregular warfare'],
      units: {
        infantry: 95000,
        armor: 300,
        airForce: 20,
        navy: 0
      }
    },
    relations: {
      LasriLand: -80,
      ShabtayLand: 40
    },
    bloc: 'Chaos',
    startBonus: {
      irregularWarfare: 40
    },
    difficulty: 'Very Hard'
  },

  NatiLand: {
    id: 'NatiLand',
    name: 'NatiLand',
    title: 'The Wounded Hero',
    flag: '🛡️',
    backstory: 'Wheat fields and revolutions, NatiLand resists Russian invasion in 2025 ruins.',
    demographics: {
      population: 39000000,
      area: 600000,
      gdp: 220000000000,
      industries: ['agriculture']
    },
    military: {
      strength: 55,
      personnel: 500000,
      tanks: 2000,
      aircraft: 100,
      ships: 0,
      submarines: 0,
      specialties: ['Resistance'],
      units: {
        infantry: 480000,
        armor: 2000,
        airForce: 100,
        navy: 0
      }
    },
    relations: {
      KachlerLand: -100,
      BareketLand: 80,
      LasriLand: 60
    },
    bloc: 'Neutral',
    startBonus: {
      resistance: 35,
      westernAid: 25
    },
    difficulty: 'Very Hard'
  }
};

export const BLOCS = {
  Western: {
    name: 'Freedom Alliance',
    description: 'Democratic, tech-focused nations allied against authoritarianism',
    color: '#0066cc',
    members: ['BareketLand', 'Titiland', 'SchwartzLand', 'BenmozesLand', 'BohbotLand', 'DahanLand', 'LasriLand']
  },
  Communist: {
    name: 'Equality Front',
    description: 'Authoritarian resource powers opposing the West',
    color: '#cc0000',
    members: ['KachlerLand', 'DvirOhanaLand', 'GorlovskyLand']
  },
  Neutral: {
    name: 'Non-Aligned',
    description: 'Flexible states navigating between superpowers',
    color: '#808080',
    members: ['Nagarland', 'BenyaakovLand', 'OmerYosefLand', 'NatiLand']
  },
  Chaos: {
    name: 'Rogue States',
    description: 'Failed states and radical regimes',
    color: '#660066',
    members: ['MarksLand', 'EingalLand', 'ShabtayLand', 'SharvitLand']
  }
};
