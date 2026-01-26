<script lang="ts">
	interface Player {
		id: string;
		name: string;
		position: number;
		ballots: number;
		isConnected: boolean;
	}

	interface Props {
		players: Player[];
		currentTurnPlayerId: string | null;
		myId: string;
	}

	let { players, currentTurnPlayerId, myId }: Props = $props();

	// Token colors for up to 4 players
	const tokenColors = [
		'#E53935', // Red
		'#1E88E5', // Blue
		'#43A047', // Green
		'#FB8C00' // Orange
	];

	function getPlayerColor(index: number): string {
		return tokenColors[index % tokenColors.length];
	}

	// Sort players: current player first, then by ballots
	const sortedPlayers = $derived(
		[...players].sort((a, b) => {
			if (a.id === myId) return -1;
			if (b.id === myId) return 1;
			return b.ballots - a.ballots;
		})
	);
</script>

<div class="player-panel">
	<h3 class="panel-title">খেলোয়াড়গণ</h3>
	<div class="players-list">
		{#each sortedPlayers as player, index}
			{@const originalIndex = players.findIndex((p) => p.id === player.id)}
			<div
				class="player-card"
				class:current-turn={player.id === currentTurnPlayerId}
				class:is-me={player.id === myId}
				class:disconnected={!player.isConnected}
			>
				<div class="player-avatar" style="background-color: {getPlayerColor(originalIndex)}">
					{player.name.charAt(0)}
				</div>
				<div class="player-info">
					<span class="player-name">
						{player.name}
						{#if player.id === myId}
							<span class="you-badge">(আপনি)</span>
						{/if}
					</span>
					<span class="player-ballots">
						🗳️ {player.ballots} ব্যালট
					</span>
				</div>
				{#if player.id === currentTurnPlayerId}
					<div class="turn-indicator">🎲</div>
				{/if}
				{#if !player.isConnected}
					<div class="disconnect-indicator">🔌</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.player-panel {
		background: linear-gradient(135deg, rgba(45, 27, 27, 0.95), rgba(26, 21, 18, 0.98));
		border: 2px solid #D4AF37;
		border-radius: 0.75rem;
		padding: 1rem;
		min-width: 200px;
	}

	.panel-title {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1rem;
		font-weight: 700;
		color: #D4AF37;
		margin-bottom: 0.75rem;
		text-align: center;
	}

	.players-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.player-card {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		border: 1px solid rgba(212, 175, 55, 0.2);
		transition: all 0.2s;
	}

	.player-card.current-turn {
		border-color: #D4AF37;
		background: rgba(212, 175, 55, 0.15);
		box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
	}

	.player-card.is-me {
		border-color: #2E7D32;
	}

	.player-card.disconnected {
		opacity: 0.5;
	}

	.player-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 0.9rem;
		font-family: 'Hind Siliguri', sans-serif;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.player-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.player-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: #F5F0E1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.you-badge {
		font-size: 0.7rem;
		color: #D4AF37;
		font-weight: 500;
	}

	.player-ballots {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.75rem;
		color: rgba(245, 240, 225, 0.8);
	}

	.turn-indicator {
		font-size: 1.25rem;
		animation: bounce 0.5s ease-in-out infinite alternate;
	}

	.disconnect-indicator {
		font-size: 0.9rem;
		opacity: 0.7;
	}

	@keyframes bounce {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-3px);
		}
	}
</style>

