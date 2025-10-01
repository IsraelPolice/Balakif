import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://aetmvbuagbucsutcsken.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldG12YnVhZ2J1Y3N1dGNza2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDkwMjksImV4cCI6MjA3NDg4NTAyOX0.aCdJTMk6Ph3PzTcC--42d8kH3oPTPTVMCUKTksNUsYY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class Database {
    async saveGame(gameState) {
        try {
            const saveData = {
                player_name: gameState.playerName,
                selected_nation: gameState.selectedNation,
                current_turn: gameState.currentTurn,
                turn_year: gameState.turnYear,
                turn_month: gameState.turnMonth,
                multiverse_energy: Math.floor(gameState.resources.gdp / 1000000000),
                reality_shards: gameState.stats.nationsConquered,
                knowledge_points: gameState.stats.warsWon,
                timeline_stability: gameState.internal.stability,
                discovered_dimensions: gameState.territories.length,
                diplomatic_relations: gameState.diplomacy.relations,
                military_units: gameState.military.units,
                territories_controlled: gameState.territories,
                ongoing_wars: gameState.diplomacy.wars,
                internal_support: gameState.internal.support,
                game_data: gameState,
                updated_at: new Date().toISOString()
            };

            if (gameState.saveId) {
                const { data, error } = await supabase
                    .from('game_saves')
                    .update(saveData)
                    .eq('id', gameState.saveId)
                    .select()
                    .maybeSingle();

                if (error) throw error;
                return { success: true, saveId: data.id };
            } else {
                const { data, error } = await supabase
                    .from('game_saves')
                    .insert([saveData])
                    .select()
                    .maybeSingle();

                if (error) throw error;
                return { success: true, saveId: data.id };
            }
        } catch (error) {
            console.error('Error saving game:', error);
            return { success: false, error: error.message };
        }
    }

    async loadGame(saveId) {
        try {
            const { data, error } = await supabase
                .from('game_saves')
                .select('*')
                .eq('id', saveId)
                .maybeSingle();

            if (error) throw error;
            if (!data) return { success: false, error: 'Save not found' };

            const gameState = data.game_data;
            gameState.saveId = data.id;

            return { success: true, gameState };
        } catch (error) {
            console.error('Error loading game:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllSaves() {
        try {
            const { data, error } = await supabase
                .from('game_saves')
                .select('id, player_name, selected_nation, current_turn, turn_year, updated_at, territories_controlled')
                .order('updated_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return { success: true, saves: data };
        } catch (error) {
            console.error('Error loading saves:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteSave(saveId) {
        try {
            const { error } = await supabase
                .from('game_saves')
                .delete()
                .eq('id', saveId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting save:', error);
            return { success: false, error: error.message };
        }
    }

    async submitScore(playerName, nation, score, territoryPercentage, nationsConquered, warsWon, gameTurns, victoryType) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([{
                    player_name: playerName,
                    score,
                    dimensions_conquered: nationsConquered,
                    total_wealth: score,
                    game_turns: gameTurns,
                    victory_type: victoryType,
                    territory_percentage: territoryPercentage,
                    wars_won: warsWon,
                    nations_conquered: nationsConquered
                }])
                .select()
                .maybeSingle();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
    }

    async getLeaderboard(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, leaderboard: data };
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return { success: false, error: error.message };
        }
    }
}
