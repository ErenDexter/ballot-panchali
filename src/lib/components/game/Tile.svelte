<script lang="ts">
	import type { BoardTile } from '$lib/game/board';
	import { TILE_STORY_MAP } from '$lib/game/stories';
	import genieSprite from '$lib/assets/genie.png';

	interface Props {
		tile: BoardTile;
		orientation?: 'top' | 'bottom' | 'left' | 'right';
		isCorner?: boolean;
		cornerType?: 'start' | 'election-commission' | 'field' | 'jail';
	}

	let { tile, orientation = 'top', isCorner = false, cornerType }: Props = $props();

	// Check if this tile has a story
	const hasStory = $derived(tile.index in TILE_STORY_MAP);

	// Get effect display text
	function getEffectText(tile: BoardTile): string {
		switch (tile.effect) {
			case 'gain':
				return `+${tile.value} ব্যালট`;
			case 'lose':
				return `-${tile.value} ব্যালট`;
			case 'move_back':
				return `${tile.value} ঘর পিছাবে`;
			case 'go_to_jail':
				return 'জেলে যান!';
			case 'surprise':
				return '';
			default:
				return '';
		}
	}

	// Get effect color class
	function getEffectColor(tile: BoardTile): string {
		switch (tile.effect) {
			case 'gain':
				return 'text-green-700';
			case 'lose':
				return 'text-red-700';
			case 'move_back':
				return 'text-orange-700';
			case 'go_to_jail':
				return 'text-purple-700';
			default:
				return 'text-gray-700';
		}
	}

	const effectText = getEffectText(tile);
	const effectColor = getEffectColor(tile);
</script>

{#if isCorner}
	<div class="corner-tile {cornerType}">
		{#if cornerType === 'start'}
			<div class="corner-content start">
				<span class="corner-title">যাত্রা</span>
				<span class="corner-subtitle">শুরু</span>
				<span class="corner-arrow">↓</span>
			</div>
		{:else if cornerType === 'election-commission'}
			<div class="corner-content ec">
				<span class="corner-title">নির্বাচন</span>
				<span class="corner-subtitle">কমিশন</span>
			</div>
		{:else if cornerType === 'jail'}
			<div class="corner-content jail">
				<img src={genieSprite} alt="Story" class="genie-sprite-corner" />
				<span class="corner-title">জেল</span>
			</div>
		{:else if cornerType === 'field'}
			<div class="corner-content field">
				<span class="corner-title">মাঠ</span>
			</div>
		{/if}
	</div>
{:else}
	<div class="tile tile-{orientation}" class:surprise={tile.effect === 'surprise'} class:has-story={hasStory}>
		<div class="tile-content">
			{#if hasStory}
				<img src={genieSprite} alt="Story" class="genie-sprite" />
			{/if}
			<span class="tile-name">{tile.nameBn}</span>
			{#if tile.effect === 'surprise'}
				<span class="surprise-icon">🎁</span>
			{:else if effectText}
				<span class="tile-effect {effectColor}">{effectText}</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.corner-tile {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.corner-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.25rem;
	}

	.corner-content.start {
		transform: rotate(-45deg);
	}

	.corner-content.ec {
		transform: rotate(45deg);
	}

	.corner-content.field {
		transform: rotate(-45deg);
	}

	.corner-content.jail {
		transform: rotate(45deg);
	}

	.corner-title {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.6rem, 1.8vw, 1.1rem);
		font-weight: 700;
		line-height: 1.2;
	}

	.corner-subtitle {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.5rem, 1.5vw, 0.9rem);
		font-weight: 600;
		line-height: 1.1;
	}

	.corner-arrow {
		font-size: clamp(0.6rem, 1.5vw, 1rem);
		margin-top: 0.125rem;
	}

	.tile {
		width: 100%;
		height: 100%;
		background: #f5f0e1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.tile.surprise {
		background: linear-gradient(135deg, #fff9e6, #ffe4b5);
	}

	.tile-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.125rem;
		gap: 0.0625rem;
	}

	/* Orientation-specific rotations */
	.tile-left .tile-content {
		transform: rotate(90deg);
	}

	.tile-right .tile-content {
		transform: rotate(-90deg);
	}

	.tile-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.45rem, 1.3vw, 0.85rem);
		font-weight: 700;
		color: #2d1b1b;
		line-height: 1.15;
		white-space: pre-line;
		text-align: center;
		max-width: 100%;
		word-break: keep-all;
	}

	.tile-effect {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.35rem, 1vw, 0.7rem);
		font-weight: 600;
		line-height: 1.1;
	}

	.surprise-icon {
		font-size: clamp(0.5rem, 1.2vw, 0.9rem);
	}

	.tile.has-story {
		background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
	}

	.genie-sprite {
		width: clamp(24px, 5vw, 40px);
		height: clamp(24px, 5vw, 40px);
		object-fit: contain;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
	}

	.genie-sprite-corner {
		width: clamp(28px, 6vw, 48px);
		height: clamp(28px, 6vw, 48px);
		object-fit: contain;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
	}

	.text-green-700 {
		color: #15803d;
	}

	.text-red-700 {
		color: #b91c1c;
	}

	.text-orange-700 {
		color: #c2410c;
	}

	.text-purple-700 {
		color: #7e22ce;
	}

	.text-gray-700 {
		color: #374151;
	}
</style>
