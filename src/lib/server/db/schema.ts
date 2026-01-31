import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Game rooms (lobbies)
export const rooms = sqliteTable('rooms', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	code: text('code').notNull().unique(),
	hostName: text('host_name').notNull(),
	status: text('status').notNull().default('waiting'), // 'waiting' | 'playing' | 'finished'
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Players in game rooms
export const players = sqliteTable('players', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	roomId: text('room_id')
		.notNull()
		.references(() => rooms.id),
	name: text('name').notNull(),
	socketId: text('socket_id'),
	// Secure token for player authentication (never sent to other clients)
	authToken: text('auth_token')
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	// Game state
	position: integer('position').notNull().default(0), // 0-27 board position
	ballots: integer('ballots').notNull().default(0), // Score
	completedCircles: integer('completed_circles').notNull().default(0),
	isAlive: integer('is_alive', { mode: 'boolean' }).notNull().default(true),
	isHost: integer('is_host', { mode: 'boolean' }).notNull().default(false),
	joinedAt: integer('joined_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Game state persistence
export const gameStates = sqliteTable('game_states', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	roomId: text('room_id')
		.notNull()
		.references(() => rooms.id),
	currentTurnPlayerId: text('current_turn_player_id'),
	currentTurnIndex: integer('current_turn_index').notNull().default(0),
	// Action log for game history
	actionLog: text('action_log', { mode: 'json' })
		.$type<ActionLogEntry[]>()
		.default(sql`'[]'`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Type for action log entries
export interface ActionLogEntry {
	type: 'roll' | 'move' | 'effect' | 'win' | 'system';
	playerId?: string;
	playerName?: string;
	diceValue?: number;
	fromPosition?: number;
	toPosition?: number;
	ballotChange?: number;
	message?: string;
	timestamp: number;
}
