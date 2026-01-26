import type { GameState, PlayerState } from '../game/ballot';
import { db } from '../db';
import { rooms, players } from '../db/schema';
import { eq } from 'drizzle-orm';
import { GAME_CONFIG, TOTAL_TILES } from '../game/ballot';

// In-memory active games
export const activeGames = new Map<string, GameState>();

/**
 * Restore game state from database (when server restarts mid-game)
 */
export async function restoreGameStateFromDb(roomId: string): Promise<GameState | null> {
	const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
	if (!room || room.status !== 'playing') return null;

	const roomPlayers = await db.select().from(players).where(eq(players.roomId, roomId));
	if (roomPlayers.length === 0) return null;

	const gameState: GameState = {
		roomId,
		players: new Map(),
		currentTurnIndex: 0,
		isGameOver: false,
		winnerId: null,
		actionLog: [
			{
				type: 'system',
				message: 'Game state restored',
				messageBn: 'গেম পুনরুদ্ধার করা হয়েছে',
				timestamp: Date.now()
			}
		]
	};

	// Add players from database
	roomPlayers.forEach((p, index) => {
		const playerState: PlayerState = {
			id: p.id,
			name: p.name,
			socketId: p.socketId || '',
			position: p.position,
			ballots: p.ballots,
			hasCompletedCircle: p.hasCompletedCircle,
			isAlive: p.isAlive,
			isConnected: false, // Will be updated when they reconnect
			jailedTurnsRemaining: 0
		};
		gameState.players.set(p.id, playerState);
	});

	console.log(`[RESTORE] Restored game state from DB for room ${roomId}`);
	activeGames.set(roomId, gameState);
	return gameState;
}

/**
 * Generate a random room code
 */
export function generateRoomCode(): string {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Save game state to database
 */
export async function saveGameState(gameState: GameState): Promise<void> {
	const playersArray = Array.from(gameState.players.values());

	for (const player of playersArray) {
		await db
			.update(players)
			.set({
				position: player.position,
				ballots: player.ballots,
				hasCompletedCircle: player.hasCompletedCircle,
				isAlive: player.isAlive
			})
			.where(eq(players.id, player.id));
	}
}

/**
 * Get public player info (safe to send to all clients)
 */
export function getPublicPlayerInfo(player: PlayerState) {
	return {
		id: player.id,
		name: player.name,
		position: player.position,
		ballots: player.ballots,
		hasCompletedCircle: player.hasCompletedCircle,
		isAlive: player.isAlive,
		isConnected: player.isConnected
	};
}

