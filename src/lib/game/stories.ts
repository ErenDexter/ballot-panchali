// Story configuration for Ballot Panchali
// Maps tile indices to story slideshows

export type StoryType = 'Rumor' | 'Surprise' | 'Election_Boycott' | 'Jail';

export interface StoryConfig {
	type: StoryType;
	titleBn: string;
	titleEn: string;
	images: string[]; // Image filenames
}

// Story configurations
export const STORIES: Record<StoryType, StoryConfig> = {
	Rumor: {
		type: 'Rumor',
		titleBn: 'গুজব',
		titleEn: 'Rumor',
		images: ['2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png']
	},
	Surprise: {
		type: 'Surprise',
		titleBn: '???',
		titleEn: 'Surprise',
		images: ['12.png', '13.png']
	},
	Election_Boycott: {
		type: 'Election_Boycott',
		titleBn: 'ইলেকশন বয়কট',
		titleEn: 'Election Boycott',
		images: [
			'25.png',
			'26.png',
			'27.png',
			'28.png',
			'29.png',
			'30.png',
			'31.png',
			'32.png',
			'33.png',
			'34.png'
		]
	},
	Jail: {
		type: 'Jail',
		titleBn: 'জেল',
		titleEn: 'Jail',
		images: ['16.png', '17.png', '18.png', '19.png', '20.png', '21.png', '22.png']
	}
};

// Tile index to story type mapping
// Some tiles trigger stories when landed on
export const TILE_STORY_MAP: Record<number, StoryType> = {
	8: 'Election_Boycott', // Election Boycott tile
	14: 'Jail', // Jail corner tile
	16: 'Jail', // Go to Jail tile (sends player to jail)
	22: 'Surprise', // Surprise tile
	23: 'Rumor' // Rumor tile
};

/**
 * Check if a tile position triggers a story
 */
export function getStoryForTile(tileIndex: number): StoryConfig | null {
	const storyType = TILE_STORY_MAP[tileIndex];
	if (!storyType) return null;
	return STORIES[storyType];
}

/**
 * Get the image path for a story image
 */
export function getStoryImagePath(storyType: StoryType, imageName: string): string {
	return `/src/lib/assets/stories/${storyType}/${imageName}`;
}

