<script lang="ts">
	interface Props {
		player: {
			id: string;
			name: string;
			position: number;
			ballots: number;
			isConnected: boolean;
		};
		index: number;
		isCurrentTurn: boolean;
	}

	let { player, index, isCurrentTurn }: Props = $props();

	// Token colors for up to 4 players
	const tokenColors = [
		'#E53935', // Red
		'#1E88E5', // Blue
		'#43A047', // Green
		'#FB8C00' // Orange
	];

	// Offset positions for multiple tokens on same tile
	const offsets = [
		{ x: -8, y: -8 },
		{ x: 8, y: -8 },
		{ x: -8, y: 8 },
		{ x: 8, y: 8 }
	];

	// Derived values that update when index changes
	const color = $derived(tokenColors[index % tokenColors.length]);
	const offset = $derived(offsets[index % offsets.length]);
</script>

<div
	class="player-token"
	class:current-turn={isCurrentTurn}
	class:disconnected={!player.isConnected}
	style="
		background-color: {color};
		transform: translate({offset.x}px, {offset.y}px);
	"
	title="{player.name}: {player.ballots} ব্যালট"
>
	<span class="token-initial">{player.name.charAt(0)}</span>
</div>

<style>
	.player-token {
		position: absolute;
		width: clamp(16px, 3vw, 24px);
		height: clamp(16px, 3vw, 24px);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: clamp(0.5rem, 1.2vw, 0.75rem);
		font-family: 'Hind Siliguri', sans-serif;
		border: 2px solid white;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
		z-index: 10;
		transition: all 0.3s ease;
	}

	.player-token.current-turn {
		animation: pulse 1s ease-in-out infinite;
		box-shadow: 0 0 10px 3px rgba(212, 175, 55, 0.8);
		border-color: #D4AF37;
	}

	.player-token.disconnected {
		opacity: 0.5;
		filter: grayscale(0.5);
	}

	.token-initial {
		text-transform: uppercase;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}
</style>
