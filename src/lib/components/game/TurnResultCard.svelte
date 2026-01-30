<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { getTile, type TileEffect } from '$lib/game/board';

	interface Props {
		playerName: string;
		tileIndex: number;
		diceValue: number;
		ballotChange: number;
		messageBn: string;
	}

	let { playerName, tileIndex, diceValue, ballotChange, messageBn }: Props = $props();

	const tile = $derived(getTile(tileIndex));

	// Get effect color based on tile effect type
	function getEffectColor(effect: TileEffect): string {
		switch (effect) {
			case 'gain':
				return '#2E7D32'; // Green
			case 'lose':
				return '#C62828'; // Red
			case 'move_back':
				return '#E65100'; // Orange
			case 'go_to_jail':
				return '#6A1B9A'; // Purple
			case 'surprise':
				return '#1565C0'; // Blue
			default:
				return '#D4AF37'; // Gold for neutral
		}
	}

	// Get effect icon
	function getEffectIcon(effect: TileEffect): string {
		switch (effect) {
			case 'gain':
				return '📈';
			case 'lose':
				return '📉';
			case 'move_back':
				return '⬅️';
			case 'go_to_jail':
				return '🔒';
			case 'surprise':
				return '🎁';
			default:
				return '📍';
		}
	}

	const effectColor = $derived(getEffectColor(tile.effect));
	const effectIcon = $derived(getEffectIcon(tile.effect));
</script>

<div
	class="turn-result-overlay"
	transition:fade={{ duration: 150 }}
>
	<div
		class="turn-result-card"
		transition:scale={{ duration: 400, easing: backOut, start: 0.5 }}
	>
		<!-- Player info -->
		<div class="player-row">
			<span class="dice-badge">🎲 {diceValue}</span>
			<span class="player-name">{playerName}</span>
		</div>

		<!-- Tile name with effect styling -->
		<div class="tile-section" style="--effect-color: {effectColor}">
			<span class="effect-icon">{effectIcon}</span>
			<h2 class="tile-name">{tile.nameBn.replace('\n', ' ')}</h2>
		</div>

		<!-- Effect message -->
		<p class="effect-message">{messageBn}</p>

		<!-- Ballot change indicator -->
		{#if ballotChange !== 0}
			<div class="ballot-change" class:positive={ballotChange > 0} class:negative={ballotChange < 0}>
				<span class="ballot-icon">🗳️</span>
				<span class="ballot-value">
					{ballotChange > 0 ? '+' : ''}{ballotChange}
				</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.turn-result-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		pointer-events: none;
	}

	.turn-result-card {
		background: linear-gradient(145deg, #2D1B1B, #1A1512);
		border: 3px solid #D4AF37;
		border-radius: 1rem;
		padding: 1.5rem 2rem;
		min-width: 280px;
		max-width: 320px;
		text-align: center;
		box-shadow:
			0 0 40px rgba(212, 175, 55, 0.4),
			0 20px 60px rgba(0, 0, 0, 0.6);
		pointer-events: auto;
	}

	.player-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.dice-badge {
		background: rgba(212, 175, 55, 0.2);
		border: 1px solid #D4AF37;
		border-radius: 0.5rem;
		padding: 0.25rem 0.5rem;
		font-size: 1rem;
	}

	.player-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: #F5F0E1;
	}

	.tile-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 0.5rem;
		border-left: 4px solid var(--effect-color);
	}

	.effect-icon {
		font-size: 1.5rem;
	}

	.tile-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--effect-color);
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.effect-message {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.95rem;
		color: rgba(245, 240, 225, 0.85);
		margin: 0 0 1rem 0;
		line-height: 1.4;
	}

	.ballot-change {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.ballot-change.positive {
		background: rgba(46, 125, 50, 0.3);
		border: 2px solid #2E7D32;
		color: #4CAF50;
	}

	.ballot-change.negative {
		background: rgba(198, 40, 40, 0.3);
		border: 2px solid #C62828;
		color: #EF5350;
	}

	.ballot-icon {
		font-size: 1rem;
	}

	.ballot-value {
		min-width: 2rem;
	}
</style>

