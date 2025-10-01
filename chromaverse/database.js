import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://aetmvbuagbucsutcsken.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldG12YnVhZ2J1Y3N1dGNza2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDkwMjksImV4cCI6MjA3NDg4NTAyOX0.aCdJTMk6Ph3PzTcC--42d8kH3oPTPTVMCUKTksNUsYY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class Database {
    async saveGame(gameState) {
        try {
            const saveData = {
                player_name: gameState.playerName,
                current_turn: gameState.currentTurn,
                multiverse_energy: gameState.resources.multiverseEnergy,
                reality_shards: gameState.resources.realityShards,
                knowledge_points: gameState.resources.knowledgePoints,
                reputation: gameState.stats.reputation,
                timeline_stability: gameState.stats.timelineStability,
                discovered_dimensions: gameState.stats.discoveredDimensions,
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
                .select('id, player_name, current_turn, updated_at, discovered_dimensions')
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

    async submitScore(playerName, score, dimensionsConquered, totalWealth, gameTurns, victoryType) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([{
                    player_name: playerName,
                    score,
                    dimensions_conquered: dimensionsConquered,
                    total_wealth: totalWealth,
                    game_turns: gameTurns,
                    victory_type: victoryType
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

    async unlockAchievement(saveId, achievementCode) {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .insert([{
                    save_id: saveId,
                    achievement_code: achievementCode
                }])
                .select()
                .maybeSingle();

            if (error) {
                if (error.code === '23505') {
                    return { success: true, alreadyUnlocked: true };
                }
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            return { success: false, error: error.message };
        }
    }

    async getAchievements(saveId) {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .eq('save_id', saveId)
                .order('unlocked_at', { ascending: false });

            if (error) throw error;
            return { success: true, achievements: data };
        } catch (error) {
            console.error('Error loading achievements:', error);
            return { success: false, error: error.message };
        }
    }
}
