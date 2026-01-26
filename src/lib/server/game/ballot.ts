// Game logic for Ballot Panchali

import { BOARD_TILES, TOTAL_TILES, getTile, type BoardTile } from '../../game/board.js';

// Game configuration
export const GAME_CONFIG = {
	MIN_PLAYERS: 2,
	MAX_PLAYERS: 4,
	STARTING_BALLOTS: 0,
	STARTING_POSITION: 0,
	DICE_MIN: 1,
	DICE_MAX: 6
};

// Player state in memory during game
export interface PlayerState {
	id: string;
	name: string;
	socketId: string;
	position: number;
	ballots: number;
	hasCompletedCircle: boolean;
	isAlive: boolean;
	isConnected: boolean;
	jailedTurnsRemaining: number; // Number of turns player must skip due to jail
}

// Result of applying a tile effect
export interface TileEffectResult {
	ballotChange: number;
	newPosition: number;
	message: string;
	messageBn: string;
	goToJail?: boolean; // Player should be sent to jail
}

// In-memory game state
export interface GameState {
	roomId: string;
	players: Map<string, PlayerState>;
	currentTurnIndex: number;
	isGameOver: boolean;
	winnerId: string | null;
	actionLog: ActionLogEntry[];
}

export interface ActionLogEntry {
	type: 'roll' | 'move' | 'effect' | 'win' | 'system';
	playerId?: string;
	playerName?: string;
	diceValue?: number;
	fromPosition?: number;
	toPosition?: number;
	ballotChange?: number;
	message?: string;
	messageBn?: string;
	timestamp: number;
}

/**
 * Roll a dice (server-authoritative random 1-6)
 */
export function rollDice(): number {
	return Math.floor(Math.random() * GAME_CONFIG.DICE_MAX) + GAME_CONFIG.DICE_MIN;
}

/**
 * Calculate new position after moving
 * Returns { newPosition, crossedStart } to track circle completion
 */
export function calculateNewPosition(
	currentPosition: number,
	diceValue: number
): { newPosition: number; crossedStart: boolean } {
	const newPosition = (currentPosition + diceValue) % TOTAL_TILES;
	const crossedStart = currentPosition + diceValue >= TOTAL_TILES;
	return { newPosition, crossedStart };
}

// Jail tile index
export const JAIL_TILE_INDEX = 14;

/**
 * Apply the effect of landing on a tile
 */
export function applyTileEffect(
	player: PlayerState,
	tile: BoardTile,
	diceValue: number
): TileEffectResult {
	let ballotChange = 0;
	let newPosition = player.position;
	let message = '';
	let messageBn = '';
	let goToJail = false;

	switch (tile.effect) {
		case 'gain':
			ballotChange = tile.value;
			message = `Gained ${tile.value} ballots from ${tile.nameEn}`;
			messageBn = `${tile.nameBn} থেকে +${tile.value} টা ব্যালট পেলেন`;
			break;

		case 'lose':
			ballotChange = -tile.value;
			message = `Lost ${tile.value} ballots from ${tile.nameEn}`;
			messageBn = `${tile.nameBn} থেকে -${tile.value} টা ব্যালট হারালেন`;
			break;

		case 'move_back':
			newPosition = Math.max(0, player.position - tile.value);
			message = `Moved back ${tile.value} spaces due to ${tile.nameEn}`;
			messageBn = `${tile.nameBn} - ${tile.value} ঘর পিছিয়ে গেলেন`;
			break;

		case 'surprise':
			// Surprise gives +n ballots where n = dice value
			ballotChange = diceValue;
			message = `Surprise! Gained ${diceValue} ballots (dice value)`;
			messageBn = `বিস্ময়! ডাইস মান অনুযায়ী +${diceValue} টা ব্যালট পেলেন`;
			break;

		case 'go_to_jail':
			goToJail = true;
			newPosition = JAIL_TILE_INDEX;
			message = `Go to Jail! Skip next turn.`;
			messageBn = `জেলে যান! পরবর্তী পালা বাদ।`;
			break;

		case 'none':
		default:
			message = `Landed on ${tile.nameEn}`;
			messageBn = `${tile.nameBn} তে অবতরণ করলেন`;
			break;
	}

	return { ballotChange, newPosition, message, messageBn, goToJail };
}

/**
 * Process a complete turn: roll dice, move player, apply effects
 */
export function processTurn(
	gameState: GameState,
	playerId: string
): {
	diceValue: number;
	fromPosition: number;
	toPosition: number;
	effectResult: TileEffectResult;
	crossedStart: boolean;
	isGameOver: boolean;
	winnerId: string | null;
	skippedDueToJail: boolean;
} | null {
	const player = gameState.players.get(playerId);
	if (!player) return null;

	// Check if player is in jail and must skip their turn
	if (player.jailedTurnsRemaining > 0) {
		player.jailedTurnsRemaining--;
		return {
			diceValue: 0,
			fromPosition: player.position,
			toPosition: player.position,
			effectResult: {
				ballotChange: 0,
				newPosition: player.position,
				message: `Skipping turn due to jail. ${player.jailedTurnsRemaining} turns remaining.`,
				messageBn: `জেলে থাকায় পালা বাদ। ${player.jailedTurnsRemaining > 0 ? `আরো ${player.jailedTurnsRemaining} পালা বাকি।` : 'পরের পালায় খেলতে পারবেন।'}`
			},
			crossedStart: false,
			isGameOver: false,
			winnerId: null,
			skippedDueToJail: true
		};
	}

	const diceValue = rollDice();
	const fromPosition = player.position;

	// Calculate new position
	const { newPosition, crossedStart } = calculateNewPosition(fromPosition, diceValue);
	player.position = newPosition;

	// Get the tile landed on
	const tile = getTile(newPosition);

	// Apply tile effect
	const effectResult = applyTileEffect(player, tile, diceValue);

	// Apply ballot change
	player.ballots += effectResult.ballotChange;

	// Apply position change from move_back or go_to_jail effect
	if (effectResult.newPosition !== player.position) {
		player.position = effectResult.newPosition;
	}

	// If player landed on go_to_jail, set their jail status
	if (effectResult.goToJail) {
		player.jailedTurnsRemaining = 1; // Skip 1 turn
	}

	// Check win condition: completed a full circle
	if (crossedStart && !player.hasCompletedCircle) {
		player.hasCompletedCircle = true;
		gameState.isGameOver = true;
		gameState.winnerId = playerId;
	}

	return {
		diceValue,
		fromPosition,
		toPosition: player.position,
		effectResult,
		crossedStart,
		isGameOver: gameState.isGameOver,
		winnerId: gameState.winnerId,
		skippedDueToJail: false
	};
}

/**
 * Get the next player's turn
 */
export function getNextTurnIndex(gameState: GameState): number {
	const playersArray = Array.from(gameState.players.values());
	let nextIndex = (gameState.currentTurnIndex + 1) % playersArray.length;

	// Skip disconnected players
	let attempts = 0;
	while (!playersArray[nextIndex].isConnected && attempts < playersArray.length) {
		nextIndex = (nextIndex + 1) % playersArray.length;
		attempts++;
	}

	return nextIndex;
}

/**
 * Determine the winner based on highest ballots
 */
export function determineWinner(gameState: GameState): PlayerState | null {
	const players = Array.from(gameState.players.values());
	if (players.length === 0) return null;

	return players.reduce((winner, player) => {
		if (player.ballots > winner.ballots) return player;
		return winner;
	});
}

/**
 * Get Bengali message for ballot change
 */
export function getBallotChangeMessage(change: number): string {
	if (change > 0) {
		return `+${change} টা ব্যালট`;
	} else if (change < 0) {
		return `${change} টা ব্যালট`;
	}
	return '';
}

// Re-export board types and functions
export { BOARD_TILES, TOTAL_TILES, getTile, type BoardTile } from '../../game/board.js';

