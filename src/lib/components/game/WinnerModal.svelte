<script lang="ts">
	import { scale, fade } from 'svelte/transition';

	interface Player {
		id: string;
		name: string;
		ballots: number;
	}

	interface Props {
		winner: Player;
		players: Player[];
		onClose: () => void;
	}

	let { winner, players, onClose }: Props = $props();

	// Sort players by ballots for final standings
	const standings = $derived([...players].sort((a, b) => b.ballots - a.ballots));
</script>

<div class="modal-overlay" transition:fade onclick={onClose}>
	<div class="modal-content" transition:scale onclick={(e) => e.stopPropagation()}>
		<div class="winner-section">
			<div class="trophy">🏆</div>
			<h2 class="winner-title">বিজয়ী!</h2>
			<div class="winner-name">{winner.name}</div>
			<div class="winner-ballots">
				🗳️ {winner.ballots} ব্যালট
			</div>
		</div>

		<div class="divider"></div>

		<div class="standings-section">
			<h3 class="standings-title">চূড়ান্ত ফলাফল</h3>
			<div class="standings-list">
				{#each standings as player, index}
					<div class="standing-item" class:is-winner={index === 0}>
						<span class="standing-rank">
							{#if index === 0}🥇{:else if index === 1}🥈{:else if index === 2}🥉{:else}{index + 1}{/if}
						</span>
						<span class="standing-name">{player.name}</span>
						<span class="standing-ballots">{player.ballots} ব্যালট</span>
					</div>
				{/each}
			</div>
		</div>

		<button class="close-button" onclick={onClose}>
			বন্ধ করুন
		</button>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}

	.modal-content {
		background: linear-gradient(135deg, #2D1B1B, #1A1512);
		border: 3px solid #D4AF37;
		border-radius: 1rem;
		padding: 2rem;
		max-width: 400px;
		width: 100%;
		text-align: center;
		box-shadow: 0 0 50px rgba(212, 175, 55, 0.3);
	}

	.winner-section {
		margin-bottom: 1.5rem;
	}

	.trophy {
		font-size: 4rem;
		margin-bottom: 0.5rem;
		animation: bounce 0.5s ease-in-out infinite alternate;
	}

	.winner-title {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 2rem;
		font-weight: 700;
		color: #D4AF37;
		margin-bottom: 0.5rem;
		text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
	}

	.winner-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #F5F0E1;
		margin-bottom: 0.25rem;
	}

	.winner-ballots {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1.1rem;
		color: #2E7D32;
		font-weight: 500;
	}

	.divider {
		height: 2px;
		background: linear-gradient(90deg, transparent, #D4AF37, transparent);
		margin: 1.5rem 0;
	}

	.standings-section {
		margin-bottom: 1.5rem;
	}

	.standings-title {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: #D4AF37;
		margin-bottom: 0.75rem;
	}

	.standings-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.standing-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
	}

	.standing-item.is-winner {
		background: rgba(212, 175, 55, 0.2);
		border: 1px solid #D4AF37;
	}

	.standing-rank {
		font-size: 1.25rem;
		width: 2rem;
		text-align: center;
	}

	.standing-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.9rem;
		color: #F5F0E1;
		flex: 1;
		text-align: left;
	}

	.standing-ballots {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.85rem;
		color: rgba(245, 240, 225, 0.7);
	}

	.close-button {
		background: linear-gradient(135deg, #2E7D32, #1B5E20);
		color: white;
		border: 2px solid #D4AF37;
		padding: 0.75rem 2rem;
		border-radius: 0.5rem;
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	@keyframes bounce {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-10px);
		}
	}
</style>

