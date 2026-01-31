import type { Server, Socket } from 'socket.io';
import { db } from '../../db';
import { rooms, players } from '../../db/schema';
import { eq } from 'drizzle-orm';
import {
	GAME_CONFIG,
	processTurn,
	getNextTurnIndex,
	determineWinner,
	type GameState,
	type PlayerState
} from '../../game/ballot';
import { activeGames, saveGameState, getPublicPlayerInfo } from '../state';
import { getStoryForTile } from '../../../game/stories.js';

/**
 * Handle game start (host only)
 */
export function handleStartGame(io: Server, socket: Socket) {
	return async (data: { code: string; authToken: string }) => {
		const [room] = await db.select().from(rooms).where(eq(rooms.code, data.code));
		if (!room) return;

		// Verify the requesting player is the host
		const requestingPlayer = await db
			.select()
			.from(players)
			.where(eq(players.roomId, room.id))
			.then((ps) => ps.find((p) => p.authToken === data.authToken));

		if (!requestingPlayer || !requestingPlayer.isHost) {
			socket.emit('error', { message: 'শুধুমাত্র হোস্ট খেলা শুরু করতে পারেন' });
			return;
		}

		const roomPlayers = await db.select().from(players).where(eq(players.roomId, room.id));

		if (roomPlayers.length < GAME_CONFIG.MIN_PLAYERS) {
			socket.emit('error', { message: `সর্বনিম্ন ${GAME_CONFIG.MIN_PLAYERS} জন খেলোয়াড় প্রয়োজন` });
			return;
		}

		// Initialize game state
		const gameState: GameState = {
			roomId: room.id,
			players: new Map(),
			currentTurnIndex: 0,
			isGameOver: false,
			winnerId: null,
			actionLog: [
				{
					type: 'system',
					message: 'Game started',
					messageBn: 'খেলা শুরু হয়েছে!',
					timestamp: Date.now()
				}
			]
		};

		// Add players to game state
		roomPlayers.forEach((p) => {
			gameState.players.set(p.id, {
				id: p.id,
				name: p.name,
				socketId: p.socketId!,
				position: GAME_CONFIG.STARTING_POSITION,
				ballots: GAME_CONFIG.STARTING_BALLOTS,
				completedCircles: 0,
				isAlive: true,
				isConnected: true,
				jailedTurnsRemaining: 0
			});
		});

		activeGames.set(room.id, gameState);
		await db.update(rooms).set({ status: 'playing' }).where(eq(rooms.id, room.id));

		// Send game start to all players
		const playersArray = Array.from(gameState.players.values());
		playersArray.forEach((player) => {
			io.to(player.socketId).emit('game_started', {
				yourId: player.id,
				players: playersArray.map(getPublicPlayerInfo),
				currentTurn: playersArray[0].id
			});
		});

		console.log(`Game started in room ${room.code} with ${roomPlayers.length} players`);
	};
}

/**
 * Handle dice roll
 */
export function handleRollDice(io: Server, socket: Socket) {
	return async (data: { roomId: string; authToken: string }) => {
		const gameState = activeGames.get(data.roomId);
		if (!gameState) {
			socket.emit('error', { message: 'খেলা খুঁজে পাওয়া যায়নি' });
			return;
		}

		if (gameState.isGameOver) {
			socket.emit('error', { message: 'খেলা শেষ হয়ে গেছে' });
			return;
		}

		const playersArray = Array.from(gameState.players.values());
		const currentPlayer = playersArray[gameState.currentTurnIndex];

		// Verify it's this player's turn
		if (currentPlayer.socketId !== socket.id) {
			socket.emit('error', { message: 'এখন আপনার পালা নয়' });
			return;
		}

		// Process the turn
		const result = processTurn(gameState, currentPlayer.id);
		if (!result) {
			socket.emit('error', { message: 'ডাইস রোল করতে সমস্যা হয়েছে' });
			return;
		}

		const [room] = await db.select().from(rooms).where(eq(rooms.id, data.roomId));

		// Log the action
		gameState.actionLog.push({
			type: 'roll',
			playerId: currentPlayer.id,
			playerName: currentPlayer.name,
			diceValue: result.diceValue,
			fromPosition: result.fromPosition,
			toPosition: result.toPosition,
			ballotChange: result.effectResult.ballotChange,
			message: result.effectResult.message,
			messageBn: result.effectResult.messageBn,
			timestamp: Date.now()
		});

		// Save to database
		await saveGameState(gameState);

		// Broadcast dice result to all players
		io.to(room.code).emit('dice_rolled', {
			playerId: currentPlayer.id,
			playerName: currentPlayer.name,
			diceValue: result.diceValue,
			fromPosition: result.fromPosition,
			toPosition: result.toPosition,
			ballotChange: result.effectResult.ballotChange,
			message: result.effectResult.message,
			messageBn: result.effectResult.messageBn,
			crossedStart: result.crossedStart
		});

		// Check if player landed on a story tile (use landedPosition, not toPosition which may be after move_back)
		const story = getStoryForTile(result.landedPosition);
		console.log(`[STORY] Player landed on tile ${result.landedPosition} (final: ${result.toPosition}), story:`, story?.type || 'none');
		if (story) {
			console.log(`[STORY] Emitting show_story for ${story.type} to room ${room.code}`);
			io.to(room.code).emit('show_story', {
				storyType: story.type,
				titleBn: story.titleBn,
				titleEn: story.titleEn,
				playerName: currentPlayer.name,
				images: story.images
			});
		}

		// Check for game over
		if (result.isGameOver && result.winnerId) {
			const winner = gameState.players.get(result.winnerId);
			const finalWinner = determineWinner(gameState);

			await db.update(rooms).set({ status: 'finished' }).where(eq(rooms.id, room.id));

			io.to(room.code).emit('game_over', {
				winnerId: finalWinner?.id,
				winnerName: finalWinner?.name,
				players: playersArray.map(getPublicPlayerInfo),
				message: `${finalWinner?.name} বিজয়ী! 🎉`,
				messageBn: `${finalWinner?.name} বিজয়ী! 🎉`
			});

			console.log(`Game over in room ${room.code}. Winner: ${finalWinner?.name}`);
			return;
		}

		// Move to next turn
		gameState.currentTurnIndex = getNextTurnIndex(gameState);
		const nextPlayer = playersArray[gameState.currentTurnIndex];

		io.to(room.code).emit('next_turn', {
			currentPlayer: nextPlayer.id,
			players: playersArray.map(getPublicPlayerInfo)
		});
	};
}

