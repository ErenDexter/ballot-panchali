import type { Server, Socket } from 'socket.io';
import { db } from '../../db';
import { rooms, players } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { GAME_CONFIG } from '../../game/ballot';
import { activeGames, restoreGameStateFromDb, generateRoomCode, getPublicPlayerInfo } from '../state';

/**
 * Handle room creation
 */
export function handleCreateRoom(socket: Socket) {
	return async (data: { hostName: string }, callback: (response: any) => void) => {
		const code = generateRoomCode();

		const [room] = await db
			.insert(rooms)
			.values({
				code,
				hostName: data.hostName,
				status: 'waiting'
			})
			.returning();

		const [player] = await db
			.insert(players)
			.values({
				roomId: room.id,
				name: data.hostName,
				socketId: socket.id,
				position: GAME_CONFIG.STARTING_POSITION,
				ballots: GAME_CONFIG.STARTING_BALLOTS,
				isHost: true
			})
			.returning();

		socket.join(code);

		callback({
			success: true,
			code,
			roomId: room.id,
			playerId: player.id,
			authToken: player.authToken,
			isHost: true
		});

		console.log(`Room ${code} created by ${data.hostName}`);
	};
}

/**
 * Handle room joining (or reconnection with token)
 */
export function handleJoinRoom(io: Server, socket: Socket) {
	return async (
		data: { code: string; playerName: string; authToken?: string },
		callback: (response: any) => void
	) => {
		const [room] = await db.select().from(rooms).where(eq(rooms.code, data.code));

		if (!room) {
			callback({ success: false, error: 'কক্ষ খুঁজে পাওয়া যায়নি' });
			return;
		}

		// If authToken provided, try to authenticate existing player
		if (data.authToken) {
			const existingPlayer = await db
				.select()
				.from(players)
				.where(eq(players.roomId, room.id))
				.then((ps) => ps.find((p) => p.authToken === data.authToken));

			if (existingPlayer) {
				await handleReconnection(io, socket, room, existingPlayer, callback);
				return;
			}
		}

		// Check if name is already taken
		const nameTaken = await db
			.select()
			.from(players)
			.where(eq(players.roomId, room.id))
			.then((ps) => ps.some((p) => p.name === data.playerName));

		if (nameTaken) {
			callback({
				success: false,
				error: 'এই নাম ইতিমধ্যে ব্যবহৃত হয়েছে'
			});
			return;
		}

		if (room.status !== 'waiting') {
			callback({ success: false, error: 'খেলা ইতিমধ্যে শুরু হয়ে গেছে' });
			return;
		}

		// Check max players
		const currentPlayers = await db.select().from(players).where(eq(players.roomId, room.id));
		if (currentPlayers.length >= GAME_CONFIG.MAX_PLAYERS) {
			callback({ success: false, error: 'কক্ষ পূর্ণ (সর্বোচ্চ ৪ জন)' });
			return;
		}

		// Create new player
		const [player] = await db
			.insert(players)
			.values({
				roomId: room.id,
				name: data.playerName,
				socketId: socket.id,
				position: GAME_CONFIG.STARTING_POSITION,
				ballots: GAME_CONFIG.STARTING_BALLOTS,
				isHost: false
			})
			.returning();

		socket.join(room.code);

		const roomPlayers = await db.select().from(players).where(eq(players.roomId, room.id));

		// Notify ALL players in room
		io.to(room.code).emit('player_joined', {
			player: { id: player.id, name: player.name },
			players: roomPlayers.map((p) => ({
				id: p.id,
				name: p.name,
				isHost: p.isHost,
				isConnected: true
			}))
		});

		console.log(`Player ${player.name} joined room ${room.code}`);

		callback({
			success: true,
			roomId: room.id,
			playerId: player.id,
			authToken: player.authToken,
			isHost: false,
			players: roomPlayers.map((p) => ({
				id: p.id,
				name: p.name,
				isHost: p.isHost,
				isConnected: true
			}))
		});
	};
}

/**
 * Handle player reconnection
 */
async function handleReconnection(
	io: Server,
	socket: Socket,
	room: { id: string; code: string; status: string },
	existingPlayer: { id: string; name: string; authToken: string; isHost: boolean },
	callback: (response: any) => void
) {
	await db.update(players).set({ socketId: socket.id }).where(eq(players.id, existingPlayer.id));

	socket.join(room.code);
	console.log(`Player ${existingPlayer.name} reconnected to room ${room.code}`);

	const roomPlayers = await db.select().from(players).where(eq(players.roomId, room.id));

	// Update in-memory game state if game is running
	let gameState = activeGames.get(room.id);

	if (!gameState && room.status === 'playing') {
		console.log(`[RECONNECT] No in-memory state for room ${room.id}, restoring from DB...`);
		const restoredState = await restoreGameStateFromDb(room.id);
		if (restoredState) {
			gameState = restoredState;
		}
	}

	if (gameState) {
		const playerState = gameState.players.get(existingPlayer.id);
		if (playerState) {
			playerState.socketId = socket.id;
			playerState.isConnected = true;

			// Send current game state to reconnected player
			const playersArray = Array.from(gameState.players.values());
			socket.emit('game_started', {
				yourId: existingPlayer.id,
				players: playersArray.map(getPublicPlayerInfo),
				currentTurn: playersArray[gameState.currentTurnIndex]?.id
			});
		}
	}

	// Notify others of reconnection
	io.to(room.code).emit('player_reconnected', {
		playerId: existingPlayer.id,
		playerName: existingPlayer.name
	});

	callback({
		success: true,
		roomId: room.id,
		playerId: existingPlayer.id,
		authToken: existingPlayer.authToken,
		isHost: existingPlayer.isHost,
		players: roomPlayers.map((p) => ({
			id: p.id,
			name: p.name,
			isHost: p.isHost,
			position: p.position,
			ballots: p.ballots,
			isConnected: gameState ? (gameState.players.get(p.id)?.isConnected ?? true) : true
		}))
	});
}

