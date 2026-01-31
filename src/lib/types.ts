// Shared types for Ballot Panchali

export interface Player {
	id: string;
	name: string;
	position: number;
	ballots: number;
	completedCircles: number;
	isAlive: boolean;
	isHost?: boolean;
	isConnected?: boolean;
}

// Socket event payloads
export interface PlayerInfo {
	id: string;
	name: string;
	position: number;
	ballots: number;
	completedCircles: number;
	isAlive: boolean;
	isConnected: boolean;
}

export interface GameStartedPayload {
	yourId: string;
	players: PlayerInfo[];
	currentTurn: string;
}

export interface DiceRolledPayload {
	playerId: string;
	playerName: string;
	diceValue: number;
	fromPosition: number;
	toPosition: number;
	ballotChange: number;
	message: string;
	messageBn: string;
	crossedStart: boolean;
}

export interface NextTurnPayload {
	currentPlayer: string;
	players: PlayerInfo[];
	reason?: string;
}

export interface GameOverPayload {
	winnerId: string;
	winnerName: string;
	players: PlayerInfo[];
	message: string;
	messageBn: string;
}

export interface StoryPayload {
	storyType: 'Rumor' | 'Surprise' | 'Election_Boycott' | 'Jail';
	titleBn: string;
	titleEn: string;
	playerName: string;
	images: string[];
}

export interface JoinRoomResponse {
	success: boolean;
	roomId?: string;
	playerId?: string;
	authToken?: string;
	isHost?: boolean;
	players?: {
		id: string;
		name: string;
		isHost: boolean;
		isConnected: boolean;
	}[];
	error?: string;
}

export interface CreateRoomResponse {
	success: boolean;
	code?: string;
	roomId?: string;
	playerId?: string;
	authToken?: string;
	isHost?: boolean;
	error?: string;
}

// Player avatar colors
export const avatarColors = [
	'from-red-600 to-red-700',
	'from-blue-600 to-blue-700',
	'from-green-600 to-green-700',
	'from-orange-500 to-orange-600'
];

// Token colors
export const tokenColors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];

// Helper function to get player avatar URL
export function getAvatarUrl(name: string): string {
	return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(name)}`;
}

