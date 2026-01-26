<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		status: 'connecting' | 'connected' | 'disconnected';
	}

	let { status }: Props = $props();

	const statusConfig = {
		connecting: {
			text: 'সংযুক্ত হচ্ছে...',
			color: 'bg-yellow-500',
			icon: '🔄'
		},
		connected: {
			text: 'সংযুক্ত',
			color: 'bg-green-500',
			icon: '✓'
		},
		disconnected: {
			text: 'সংযোগ বিচ্ছিন্ন',
			color: 'bg-red-500',
			icon: '✕'
		}
	};

	const config = $derived(statusConfig[status]);
</script>

{#if status !== 'connected'}
	<div class="connection-status" transition:fade>
		<span class="status-indicator {config.color}"></span>
		<span class="status-text">{config.text}</span>
	</div>
{/if}

<style>
	.connection-status {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(26, 21, 18, 0.95);
		border: 1px solid #D4AF37;
		border-radius: 2rem;
		z-index: 50;
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		animation: pulse 1s ease-in-out infinite;
	}

	.status-indicator.bg-yellow-500 {
		background-color: #eab308;
	}

	.status-indicator.bg-green-500 {
		background-color: #22c55e;
	}

	.status-indicator.bg-red-500 {
		background-color: #ef4444;
	}

	.status-text {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.85rem;
		color: #F5F0E1;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>

