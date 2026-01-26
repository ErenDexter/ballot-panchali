// Board configuration for Ballot Panchali
// 28 tiles total: 4 corners + 6 tiles on each side
// This file is shared between client and server

export type TileEffect =
	| 'none' // Corner tiles or neutral
	| 'gain' // Gain ballots
	| 'lose' // Lose ballots
	| 'move_back' // Move backwards
	| 'surprise' // Special ??? tile
	| 'go_to_jail'; // Go to jail and skip a turn

export interface BoardTile {
	index: number;
	nameBn: string; // Bengali name
	nameEn: string; // English name (for debugging)
	effect: TileEffect;
	value: number; // Ballot change or spaces to move back
	isCorner: boolean;
	side: 'top' | 'right' | 'bottom' | 'left' | 'corner';
}

// Define all 28 board tiles clockwise starting from START (top-left corner)
export const BOARD_TILES: BoardTile[] = [
	// Corner 0: START (top-left, green)
	{
		index: 0,
		nameBn: 'যাত্রা শুরু',
		nameEn: 'Journey Start',
		effect: 'none',
		value: 0,
		isCorner: true,
		side: 'corner'
	},

	// Top side (indices 1-6, left to right)
	{
		index: 1,
		nameBn: 'ধর পাকড়',
		nameEn: 'Home Found',
		effect: 'lose',
		value: 3,
		isCorner: false,
		side: 'top'
	},
	{
		index: 2,
		nameBn: 'স্বচ্ছতা',
		nameEn: 'Transparency',
		effect: 'gain',
		value: 3,
		isCorner: false,
		side: 'top'
	},
	{
		index: 3,
		nameBn: 'চোখ থাকতে \n অন্ধ',
		nameEn: 'Eyes Open',
		effect: 'lose',
		value: 2,
		isCorner: false,
		side: 'top'
	},
	{
		index: 4,
		nameBn: 'নাগরিকত্ববাদ',
		nameEn: 'Citizenship',
		effect: 'gain',
		value: 4,
		isCorner: false,
		side: 'top'
	},
	{
		index: 5,
		nameBn: 'দলকানা',
		nameEn: 'Party Boss',
		effect: 'lose',
		value: 4,
		isCorner: false,
		side: 'top'
	},
	{
		index: 6,
		nameBn: 'নিরাপত্তা',
		nameEn: 'Security',
		effect: 'gain',
		value: 3,
		isCorner: false,
		side: 'top'
	},

	// Corner 7: Election Commission (top-right, green)
	{
		index: 7,
		nameBn: 'নির্বাচন কমিশন',
		nameEn: 'Election Commission',
		effect: 'none',
		value: 0,
		isCorner: true,
		side: 'corner'
	},

	// Right side (indices 8-13, top to bottom)
	{
		index: 8,
		nameBn: 'ইলেকশন \n বয়কট',
		nameEn: 'Election Boycott',
		effect: 'move_back',
		value: 2,
		isCorner: false,
		side: 'right'
	},
	{
		index: 9,
		nameBn: 'ক্যাম্পেইন',
		nameEn: 'Campaign',
		effect: 'gain',
		value: 3,
		isCorner: false,
		side: 'right'
	},
	{
		index: 10,
		nameBn: 'উশকানি',
		nameEn: 'Provocation',
		effect: 'lose',
		value: 2,
		isCorner: false,
		side: 'right'
	},
	{
		index: 11,
		nameBn: 'মধ্যস্থতা',
		nameEn: 'Mediation',
		effect: 'gain',
		value: 2,
		isCorner: false,
		side: 'right'
	},
	{
		index: 12,
		nameBn: 'সমালোচনা',
		nameEn: 'Criticism',
		effect: 'lose',
		value: 2,
		isCorner: false,
		side: 'right'
	},
	{
		index: 13,
		nameBn: 'পর্যবেক্ষণ ও \n মতামত প্রদান',
		nameEn: 'Observation & Opinion',
		effect: 'gain',
		value: 2,
		isCorner: false,
		side: 'right'
	},

	// Corner 14: Field (bottom-right, red)
	{
		index: 14,
		nameBn: 'জেল',
		nameEn: 'Jail',
		effect: 'none',
		value: 0,
		isCorner: true,
		side: 'corner'
	},

	// Bottom side (indices 15-20, right to left)
	{
		index: 15,
		nameBn: 'পক্ষপাতিত্ব',
		nameEn: 'Resistance',
		effect: 'lose',
		value: 3,
		isCorner: false,
		side: 'bottom'
	},
	{
		index: 16,
		nameBn: 'হলুদ \n সাংবাদিকতা',
		nameEn: 'Go to Jail',
		effect: 'go_to_jail',
		value: 0,
		isCorner: false,
		side: 'bottom'
	},
	{
		index: 17,
		nameBn: 'ফ্যাক্ট চেকিং',
		nameEn: 'Fact Checking',
		effect: 'gain',
		value: 2,
		isCorner: false,
		side: 'bottom'
	},
	{
		index: 18,
		nameBn: 'ভুয়া তথ্য',
		nameEn: 'Fake Information',
		effect: 'lose',
		value: 3,
		isCorner: false,
		side: 'bottom'
	},
	{
		index: 19,
		nameBn: 'নেপথ্যের \n নায়ক',
		nameEn: 'Real Hero',
		effect: 'gain',
		value: 2,
		isCorner: false,
		side: 'bottom'
	},
	{
		index: 20,
		nameBn: 'সঠিক তথ্য \n প্রচার',
		nameEn: 'Correct Info Spread',
		effect: 'gain',
		value: 2,
		isCorner: false,
		side: 'bottom'
	},

	// Corner 21: Barasat (bottom-left, red)
	{
		index: 21,
		nameBn: 'সংসদ',
		nameEn:'Parliament',
		effect: 'none',
		value: 0,
		isCorner: true,
		side: 'corner'
	},

	// Left side (indices 22-27, bottom to top)
	{
		index: 22,
		nameBn: '???',
		nameEn: 'Surprise',
		effect: 'surprise',
		value: 0,
		isCorner: false,
		side: 'left'
	},
	{
		index: 23,
		nameBn: 'গুজব',
		nameEn: 'Rumor',
		effect: 'move_back',
		value: 2,
		isCorner: false,
		side: 'left'
	},
	{
		index: 24,
		nameBn: 'নতুন মুখ',
		nameEn: 'New Face',
		effect: 'gain',
		value: 3,
		isCorner: false,
		side: 'left'
	},
	{
		index: 25,
		nameBn: 'দুর্নীতি',
		nameEn: 'Corruption',
		effect: 'lose',
		value: 3,
		isCorner: false,
		side: 'left'
	},
	{
		index: 26,
		nameBn: 'জনসভা',
		nameEn: 'Public Meeting',
		effect: 'gain',
		value: 2,
		isCorner: false,
		side: 'left'
	},
	{
		index: 27,
		nameBn: 'ইশতাহার',
		nameEn: 'Manifesto',
		effect: 'gain',
		value: 7,
		isCorner: false,
		side: 'left'
	}
];

// Total number of tiles on the board
export const TOTAL_TILES = 28;

// Get tile by index
export function getTile(index: number): BoardTile {
	return BOARD_TILES[index % TOTAL_TILES];
}

// Get tiles for a specific side
export function getTilesBySide(side: BoardTile['side']): BoardTile[] {
	return BOARD_TILES.filter((tile) => tile.side === side);
}

// Get corner tiles
export function getCornerTiles(): BoardTile[] {
	return BOARD_TILES.filter((tile) => tile.isCorner);
}

