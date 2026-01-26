<script lang="ts">
	interface Props {
		logs: string[];
	}

	let { logs }: Props = $props();
	
	// Reverse the logs so newest is first (leftmost)
	const reversedLogs = $derived([...logs].reverse());
</script>

<div class="action-log">
	<div class="log-scroll">
		{#each reversedLogs as log, i (logs.length - 1 - i)}
			<span 
				class="log-item" 
				class:newest={i === 0}
				style="animation-delay: {i === 0 ? '0s' : `${i * 0.05}s`}"
			>
				{log}
			</span>
		{/each}
	</div>
</div>

<style>
	.action-log {
		background: linear-gradient(90deg, rgba(26, 21, 18, 0.95), rgba(45, 27, 27, 0.9));
		border-bottom: 2px solid #D4AF37;
		padding: 0.5rem 1rem;
		overflow: hidden;
	}

	.log-scroll {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		/* Ensure newest (first) item is visible */
		scroll-behavior: smooth;
	}

	.log-scroll::-webkit-scrollbar {
		display: none;
	}

	.log-item {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.85rem;
		color: #F5F0E1;
		white-space: nowrap;
		padding: 0.25rem 0.75rem;
		background: rgba(212, 175, 55, 0.1);
		border: 1px solid rgba(212, 175, 55, 0.25);
		border-radius: 1rem;
		animation: slideIn 0.3s ease-out forwards;
		opacity: 0;
		flex-shrink: 0;
	}

	.log-item.newest {
		background: rgba(212, 175, 55, 0.25);
		border-color: rgba(212, 175, 55, 0.5);
		color: #D4AF37;
		font-weight: 500;
		animation: popIn 0.4s ease-out forwards;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 0.8;
			transform: translateX(0);
		}
	}

	@keyframes popIn {
		0% {
			opacity: 0;
			transform: scale(0.8) translateX(-10px);
		}
		50% {
			transform: scale(1.05) translateX(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateX(0);
		}
	}
</style>
