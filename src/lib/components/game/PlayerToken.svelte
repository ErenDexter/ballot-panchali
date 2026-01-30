<script lang="ts">
	import { getAvatarUrl } from '$lib/types';

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

	// Token border colors for up to 4 players
	const tokenColors = [
		'#E53935', // Red
		'#1E88E5', // Blue
		'#43A047', // Green
		'#FB8C00' // Orange
	];

	// Offset positions for multiple tokens on same tile
	const offsets = [
		{ x: -10, y: -10 },
		{ x: 10, y: -10 },
		{ x: -10, y: 10 },
		{ x: 10, y: 10 }
	];

	// Derived values that update when index changes
	const color = $derived(tokenColors[index % tokenColors.length]);
	const offset = $derived(offsets[index % offsets.length]);
	const avatarUrl = $derived(getAvatarUrl(player.name));
</script>

<div
	class="player-token"
	class:current-turn={isCurrentTurn}
	class:disconnected={!player.isConnected}
	style="
		border-color: {color};
		--offset-x: {offset.x}px;
		--offset-y: {offset.y}px;
	"
	title="{player.name}: {player.ballots} ব্যালট"
>
	<img src={avatarUrl} alt={player.name} class="token-avatar" />
</div>

<style>
	.player-token {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, 0px)));
		width: clamp(20px, 4vw, 32px);
		height: clamp(20px, 4vw, 32px);
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
		z-index: 10;
		transition: all 0.3s ease;
		background: #f5f0e1;
	}

	.token-avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.player-token.current-turn {
		animation: pulse 1s ease-in-out infinite;
		border-color: #D4AF37 !important;
	}

	.player-token.disconnected {
		opacity: 0.5;
		filter: grayscale(0.5);
	}

	@keyframes pulse {
		0%, 100% {
			box-shadow: 0 0 8px 3px rgba(212, 175, 55, 0.6);
		}
		50% {
			box-shadow: 0 0 16px 8px rgba(212, 175, 55, 1);
		}
	}
</style>
