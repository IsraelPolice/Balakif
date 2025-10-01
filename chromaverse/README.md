# ChromaVerse: Interdimensional Tycoon

A mind-blowing multiverse strategy game combining empire building, resource management, technology research, and interdimensional exploration.

## Game Features

### 🌌 Multiverse Exploration
- Discover parallel dimensions with unique physics and properties
- 5 dimension types: Standard, Quantum, Entropic, Chrono, and Exotic
- Procedurally generated maps with resource nodes, portals, and dangers
- Each dimension has unique special rules affecting gameplay

### 💰 Deep Resource Management
- **Multiverse Energy**: Primary currency for building and expansion
- **Reality Shards**: Rare resource for discovering new dimensions
- **Knowledge Points**: Research currency for technology advancement
- Dimension-specific resources based on physics type

### 🏗️ Empire Building
- Construct outposts across dimensions
- 4 building types: Mining, Research, Military, Portal Hubs
- Passive resource generation from all outposts
- Strategic placement for maximum efficiency

### 🔬 Technology Tree
- 7+ technologies to research
- Advanced Portals, Energy Efficiency, Automated Mining
- Quantum Computing, Temporal Manipulation, Reality Bending
- Each tech provides powerful bonuses and unlocks new abilities

### ⚡ Dynamic Events System
- Random events every turn (30% chance)
- Resource booms, temporal anomalies, discoveries
- Faction interactions and diplomatic opportunities
- Event-driven gameplay keeps every playthrough unique

### 🏆 Achievement System
- 5+ achievements to unlock
- Reality Pioneer, Energy Tycoon, Mad Scientist
- Time Lord, Multiverse Master
- Persistent achievements saved to database

### 💾 Cloud Save System
- Full Supabase integration
- Save/Load games with cloud persistence
- Multiple save slots
- Auto-save progress and achievements

### 📊 Global Leaderboard
- Compete with other players worldwide
- Score based on dimensions, wealth, and efficiency
- Multiple victory conditions tracked
- Real-time rankings

## Dimension Types

### Standard
- Balanced physics and normal resource generation
- Best for beginners
- Stable and predictable

### Quantum
- Resources fluctuate due to superposition
- Observation affects outcomes
- High risk, high reward

### Entropic
- Buildings degrade faster
- Chaos events more frequent
- Dangerous but resource-rich

### Chrono
- Time dilation enables extra actions
- Temporal paradoxes occur
- Manipulate time itself

### Exotic
- Reality-bending abilities unlocked
- Unpredictable special effects
- Rare and powerful resources

## How to Play

1. **Start**: Enter your name and begin your journey
2. **Explore**: Discover new dimensions using Reality Shards
3. **Build**: Construct outposts to generate resources
4. **Research**: Unlock technologies for powerful bonuses
5. **Expand**: Manage multiple dimensions simultaneously
6. **Conquer**: Achieve victory conditions

## Victory Conditions

Win by achieving any of:
- Discover 20+ dimensions
- Accumulate 1,000,000+ Multiverse Energy
- Research all technologies
- Survive 100 turns
- Custom victory conditions based on playstyle

## Controls

- **Click** dimensions to switch between them
- **Click** map cells to explore and interact
- **Click** buildings to construct outposts
- **Click** technologies to research
- **End Turn** to collect resources and advance time
- **Save** to persist your progress to the cloud

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Styling**: Custom CSS with animations
- **Database**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages compatible
- **Architecture**: Modular MVC pattern

## Files Structure

```
chromaverse/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with animations
├── game.js            # Main game initialization
├── gameEngine.js      # Core game logic and mechanics
├── database.js        # Supabase integration
└── ui.js              # UI rendering and interactions
```

## Game Mechanics Deep Dive

### Resource Generation
- Base production from dimension resources
- Outposts multiply production
- Technology bonuses stack multiplicatively
- Turn-based collection system

### Dimension Discovery
- Cost increases with each discovery
- Formula: Energy = 500 × count, Shards = 25 × count
- Procedural generation ensures uniqueness
- Level scaling increases challenge and rewards

### Research System
- Knowledge point costs vary by technology
- Prerequisites must be unlocked first
- Permanent bonuses apply to all dimensions
- Strategic choices impact playstyle

### Event System
- 30% chance per turn
- 4 event types: Resource, Anomaly, Discovery, Faction
- Events can be beneficial or challenging
- Affects timeline stability and reputation

## Strategy Tips

1. **Early Game**: Focus on Standard dimensions for stable growth
2. **Mid Game**: Research energy efficiency before expanding
3. **Late Game**: Target Exotic dimensions for reality-bending powers
4. **Always**: Balance exploration with consolidation
5. **Pro Tip**: Save Reality Shards for high-level dimensions

## Future Enhancements

- Multiplayer dimension trading
- Faction warfare and alliances
- Time travel mechanics
- Dimension merging
- Custom scenario editor
- Mobile app version

## Credits

Created as the most advanced game for the Hevre Hatovim Ultimate Team site.
Built with passion for strategy, complexity, and infinite replayability.

---

**Play Now**: Open index.html in a modern browser
**Save Your Progress**: All data persists to Supabase cloud
**Compete**: Check the global leaderboard

Dominate the Multiverse! 🌌
