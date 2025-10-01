import { GameEngine } from './gameEngineRealtime.js';
import { Database } from './database.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.engine = new GameEngine();
        this.database = new Database();
        this.ui = new UI(this.engine, this.database);
    }

    async init() {
        await this.ui.initialize();
    }
}

window.game = new Game();
window.game.init();
