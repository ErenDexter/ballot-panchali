import type { Server, Socket } from 'socket.io';
import { db } from '../../db';
import { rooms, players } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { activeGames, getPublicPlayerInfo } from '../state';
import { getNextTurnIndex } from '../../game/ballot';

/**
 * Handle player disconnect
 */
export function handleDisconnect(io: Server, socket: Socket) {
	return async () => {
		console.log('Player disconnected:', socket.id);

		// Find the player who disconnected
		const [disconnectedPlayer] = await db
			.select()
			.from(players)
			.where(eq(players.socketId, socket.id));

		if (!disconnectedPlayer) return;

		const [room] = await db.select().from(rooms).where(eq(rooms.id, disconnectedPlayer.roomId));
		if (!room) return;

		const gameState = activeGames.get(room.id);

		if (gameState) {
			const playerState = gameState.players.get(disconnectedPlayer.id);
			if (playerState) {
				playerState.isConnected = false;

				// Check if it was this player's turn
				const playersArray = Array.from(gameState.players.values());
				const currentPlayer = playersArray[gameState.currentTurnIndex];

				if (currentPlayer.id === disconnectedPlayer.id) {
					// Auto-skip to next player
					gameState.currentTurnIndex = getNextTurnIndex(gameState);
					const nextPlayer = playersArray[gameState.currentTurnIndex];

					io.to(room.code).emit('next_turn', {
						currentPlayer: nextPlayer.id,
						players: playersArray.map(getPublicPlayerInfo),
						reason: 'disconnect'
					});
				}
			}
		}

		// Notify other players
		io.to(room.code).emit('player_disconnected', {
			playerId: disconnectedPlayer.id,
			playerName: disconnectedPlayer.name
		});

		// Update socket ID in database
		await db.update(players).set({ socketId: null }).where(eq(players.id, disconnectedPlayer.id));
	};
}

