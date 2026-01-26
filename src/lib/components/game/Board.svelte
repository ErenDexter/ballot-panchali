<script lang="ts">
	import type { BoardTile } from '$lib/game/board';
	import { BOARD_TILES } from '$lib/game/board';
	import Tile from './Tile.svelte';
	import PlayerToken from './PlayerToken.svelte';

	interface Props {
		players: {
			id: string;
			name: string;
			position: number;
			ballots: number;
			isConnected: boolean;
		}[];
		currentTurnPlayerId: string | null;
	}

	let { players, currentTurnPlayerId }: Props = $props();

	// Get tiles for each side
	const cornerTL = BOARD_TILES[0]; // যাত্রা শুরু (START)
	const cornerTR = BOARD_TILES[7]; // নির্বাচন কমিশন
	const cornerBR = BOARD_TILES[14]; // মাঠ
	const cornerBL = BOARD_TILES[21]; // বারাসাট

	const topTiles = BOARD_TILES.slice(1, 7); // indices 1-6
	const rightTiles = BOARD_TILES.slice(8, 14); // indices 8-13
	const bottomTiles = BOARD_TILES.slice(15, 21).reverse(); // indices 15-20 (reversed for right-to-left)
	const leftTiles = BOARD_TILES.slice(22, 28).reverse(); // indices 22-27 (reversed for bottom-to-top)

	// Get players on a specific tile
	function getPlayersOnTile(tileIndex: number) {
		return players.filter((p) => p.position === tileIndex);
	}
</script>

<div class="board-container">
	<!-- Main Board Grid -->
	<div class="board-grid">
		<!-- Row 1: Corner TL + Top Tiles + Corner TR -->
		<div class="corner corner-tl">
			<Tile tile={cornerTL} isCorner={true} cornerType="start" />
			{#each getPlayersOnTile(cornerTL.index) as player, i}
				<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
			{/each}
		</div>

		{#each topTiles as tile}
			<div class="tile-wrapper tile-top">
				<Tile {tile} orientation="top" />
				{#each getPlayersOnTile(tile.index) as player, i}
					<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
				{/each}
			</div>
		{/each}

		<div class="corner corner-tr">
			<Tile tile={cornerTR} isCorner={true} cornerType="election-commission" />
			{#each getPlayersOnTile(cornerTR.index) as player, i}
				<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
			{/each}
		</div>

		<!-- Row 2-7: Left tiles + Center + Right tiles -->
		{#each { length: 6 } as _, rowIndex}
			<!-- Left tile -->
			<div class="tile-wrapper tile-left" style="grid-row: {rowIndex + 2}; grid-column: 1;">
				<Tile tile={leftTiles[rowIndex]} orientation="left" />
				{#each getPlayersOnTile(leftTiles[rowIndex].index) as player, i}
					<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
				{/each}
			</div>

			<!-- Center area (spans 6 columns, only on first row of middle section) -->
			{#if rowIndex === 0}
				<div class="center-area" style="grid-row: 2 / span 6; grid-column: 2 / span 6;">
					<div class="center-content">
						<!-- Top: প্রশাসন (Administration) -->
						<div class="center-section center-top">
							<div class="admin-icon">
								<svg viewBox="0 0 100 120" class="h-20 w-16 md:h-24 md:w-20">
									<!-- Simple person with graduation cap -->
									<ellipse cx="50" cy="85" rx="25" ry="30" fill="#E8DCC4" />
									<circle cx="50" cy="40" r="20" fill="#E8DCC4" />
									<polygon points="30,35 50,15 70,35" fill="#2D1B1B" />
									<rect x="45" y="15" width="10" height="5" fill="#2D1B1B" />
								</svg>
							</div>
							<span class="center-label">প্রশাসন</span>
						</div>

						<!-- Left: রাজনৈতিক দল (Political Party) -->
						<div class="center-section center-left">
							<div class="party-icon">
								<svg viewBox="0 0 100 80" class="h-16 w-20 md:h-20 md:w-24">
									<!-- Stylized fish/crowd -->
									<ellipse
										cx="50"
										cy="40"
										rx="35"
										ry="25"
										fill="#C9A66B"
										stroke="#6B4423"
										stroke-width="2"
									/>
									<circle cx="35" cy="35" r="5" fill="#2D1B1B" />
									<path
										d="M80,40 L100,25 L100,55 Z"
										fill="#C9A66B"
										stroke="#6B4423"
										stroke-width="2"
									/>
								</svg>
							</div>
							<span class="center-label-vertical">রাজনৈতিক দল</span>
						</div>

						<!-- Center: Ballot Box -->
						<div class="center-ballot-box">
							<svg viewBox="0 0 80 80" class="h-16 w-16 md:h-20 md:w-20">
								<!-- Ballot box with sunburst -->
								<polygon
									points="40,5 45,15 55,15 47,22 50,32 40,26 30,32 33,22 25,15 35,15"
									fill="#D4AF37"
								/>
								<rect
									x="20"
									y="25"
									width="40"
									height="35"
									fill="#C9A66B"
									stroke="#6B4423"
									stroke-width="2"
								/>
								<rect x="30" y="30" width="20" height="5" fill="#6B4423" />
								<rect x="15" y="55" width="50" height="10" fill="#A67C52" />
							</svg>
						</div>

						<!-- Right: গণমাধ্যম (Mass Media) -->
						<div class="center-section center-right">
							<div class="media-icon">
								<svg viewBox="0 0 100 80" class="h-16 w-20 md:h-20 md:w-24">
									<!-- TV/Media symbol -->
									<polygon
										points="30,60 70,60 60,20"
										fill="#F5E6A3"
										stroke="#6B4423"
										stroke-width="2"
									/>
									<ellipse cx="70" cy="30" rx="20" ry="15" fill="#888" opacity="0.6" />
									<ellipse cx="75" cy="25" rx="15" ry="10" fill="#666" opacity="0.5" />
								</svg>
							</div>
							<span class="center-label-vertical">গণমাধ্যম</span>
						</div>

						<!-- Bottom: ক্ষমতাশীল (Ruling) -->
						<div class="center-section center-bottom">
							<div class="power-icon">
								<svg viewBox="0 0 80 80" class="h-16 w-16 md:h-20 md:w-20">
									<!-- Boat symbol -->
									<path
										d="M10,50 Q40,70 70,50 L60,50 L40,30 L20,50 Z"
										fill="#6B8E9F"
										stroke="#2D1B1B"
										stroke-width="2"
									/>
									<circle cx="40" cy="45" r="8" fill="#E8DCC4" />
									<path d="M35,43 Q40,38 45,43" stroke="#2D1B1B" stroke-width="2" fill="none" />
									<circle cx="36" cy="42" r="2" fill="#2D1B1B" />
									<circle cx="44" cy="42" r="2" fill="#2D1B1B" />
								</svg>
							</div>
							<span class="center-label">ক্ষমতাশীল</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Right tile -->
			<div class="tile-wrapper tile-right" style="grid-row: {rowIndex + 2}; grid-column: 8;">
				<Tile tile={rightTiles[rowIndex]} orientation="right" />
				{#each getPlayersOnTile(rightTiles[rowIndex].index) as player, i}
					<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
				{/each}
			</div>
		{/each}

		<!-- Row 8: Corner BL + Bottom Tiles + Corner BR -->
		<div class="corner corner-bl">
			<Tile tile={cornerBL} isCorner={true} cornerType="jail" />
			{#each getPlayersOnTile(cornerBL.index) as player, i}
				<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
			{/each}
		</div>

		{#each bottomTiles as tile}
			<div class="tile-wrapper tile-bottom">
				<Tile {tile} orientation="bottom" />
				{#each getPlayersOnTile(tile.index) as player, i}
					<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
				{/each}
			</div>
		{/each}

		<div class="corner corner-br">
			<Tile tile={cornerBR} isCorner={true} cornerType="field" />
			{#each getPlayersOnTile(cornerBR.index) as player, i}
				<PlayerToken {player} index={i} isCurrentTurn={player.id === currentTurnPlayerId} />
			{/each}
		</div>
	</div>
</div>

<style>
	.board-container {
		width: 100%;
		max-width: min(90vw, 90vh, 700px);
		aspect-ratio: 1;
		margin: 0 auto;
	}

	.board-grid {
		display: grid;
		grid-template-columns: 1.5fr repeat(6, 1fr) 1.5fr;
		grid-template-rows: 1.5fr repeat(6, 1fr) 1.5fr;
		width: 100%;
		height: 100%;
		background: var(--color-cream, #f5f0e1);
		border: 4px solid var(--color-accent, #6b4423);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.corner {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.corner-tl,
	.corner-tr,
	.corner-br {
		background: linear-gradient(135deg, #2e7d32, #1b5e20);
	}

	.corner-bl {
		background: linear-gradient(135deg, #c62828, #b71c1c);
	}

	.tile-wrapper {
		position: relative;
		border: 1px solid rgba(107, 68, 35, 0.3);
	}

	.tile-top {
		border-bottom: 2px solid #6b4423;
	}

	.tile-bottom {
		border-top: 2px solid #6b4423;
	}

	.tile-left {
		border-right: 2px solid #6b4423;
	}

	.tile-right {
		border-left: 2px solid #6b4423;
	}

	.center-area {
		background: linear-gradient(135deg, #c9a66b 0%, #b8956a 50%, #a68559 100%);
		border: 3px solid #6b4423;
		position: relative;
	}

	.center-content {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-areas:
			'. top top top .'
			'left . center . right'
			'left . center . right'
			'. bottom bottom bottom .';
		grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
		grid-template-rows: 1fr 1fr 1fr 1fr;
		padding: 0.5rem;
	}

	.center-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	.center-top {
		grid-area: top;
	}

	.center-left {
		grid-area: left;
		writing-mode: vertical-rl;
		text-orientation: mixed;
		transform: rotate(180deg);
	}

	.center-right {
		grid-area: right;
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}

	.center-bottom {
		grid-area: bottom;
	}

	.center-ballot-box {
		grid-area: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.center-label {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.6rem, 1.5vw, 1rem);
		font-weight: 700;
		color: #2d1b1b;
		text-align: center;
	}

	.center-label-vertical {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.5rem, 1.2vw, 0.85rem);
		font-weight: 700;
		color: #2d1b1b;
		white-space: nowrap;
	}

	/* Responsive adjustments */
	@media (max-width: 500px) {
		.center-content {
			padding: 0.25rem;
		}

		.center-section svg {
			width: 2rem;
			height: 2rem;
		}
	}
</style>
