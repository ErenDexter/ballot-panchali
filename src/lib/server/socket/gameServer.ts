import type { Server, Socket } from 'socket.io';
import {
	handleCreateRoom,
	handleJoinRoom,
	handleStartGame,
	handleRollDice,
	handleDisconnect
} from './handlers';

export function setupGameServer(io: Server) {
	io.on('connection', (socket: Socket) => {
		console.log('Player connected:', socket.id);

		// Room management
		socket.on('create_room', handleCreateRoom(socket));
		socket.on('join_room', handleJoinRoom(io, socket));

		// Game flow
		socket.on('start_game', handleStartGame(io, socket));
		socket.on('roll_dice', handleRollDice(io, socket));

		// Disconnect
		socket.on('disconnect', handleDisconnect(io, socket));
	});
}

export { activeGames, restoreGameStateFromDb } from './state';

