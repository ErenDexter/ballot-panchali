<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	interface Props {
		isMyTurn: boolean;
		isRolling: boolean;
		showingResult: boolean;  // New: shows result for 2 seconds
		lastDiceValue: number | null;
		currentRollerName: string | null;  // Name of the player who rolled
		onRoll: () => void;
	}

	let { isMyTurn, isRolling, showingResult, lastDiceValue, currentRollerName, onRoll }: Props = $props();

	// Dice face patterns (dots positions)
	const diceFaces: Record<number, { x: number; y: number }[]> = {
		1: [{ x: 50, y: 50 }],
		2: [
			{ x: 25, y: 25 },
			{ x: 75, y: 75 }
		],
		3: [
			{ x: 25, y: 25 },
			{ x: 50, y: 50 },
			{ x: 75, y: 75 }
		],
		4: [
			{ x: 25, y: 25 },
			{ x: 75, y: 25 },
			{ x: 25, y: 75 },
			{ x: 75, y: 75 }
		],
		5: [
			{ x: 25, y: 25 },
			{ x: 75, y: 25 },
			{ x: 50, y: 50 },
			{ x: 25, y: 75 },
			{ x: 75, y: 75 }
		],
		6: [
			{ x: 25, y: 25 },
			{ x: 75, y: 25 },
			{ x: 25, y: 50 },
			{ x: 75, y: 50 },
			{ x: 25, y: 75 },
			{ x: 75, y: 75 }
		]
	};

	const displayValue = $derived(lastDiceValue || 1);
	
	// Determine if we should disable interactions (rolling or showing result)
	const isBusy = $derived(isRolling || showingResult);
</script>

<div class="dice-container">
	<!-- Dice Display -->
	<div class="dice" class:rolling={isRolling} class:result-bounce={showingResult && lastDiceValue}>
		<svg viewBox="0 0 100 100" class="dice-face">
			<rect x="5" y="5" width="90" height="90" rx="12" fill="#FFFEF0" stroke="#2D1B1B" stroke-width="3" />
			{#each diceFaces[displayValue] as dot}
				<circle cx={dot.x} cy={dot.y} r="10" fill="#2D1B1B" />
			{/each}
		</svg>
	</div>

	<!-- Roll Button or Status -->
	{#if isRolling}
		<div class="rolling-text" transition:fade>
			{#if currentRollerName}
				{currentRollerName} ঘুরাচ্ছেন...
			{:else}
				ঘুরছে...
			{/if}
		</div>
	{:else if isMyTurn && !isBusy}
		<button class="roll-button" onclick={onRoll} transition:scale>
			🎲 ডাইস ঘোরান
		</button>
	{:else if !isBusy}
		<div class="waiting-text" transition:fade>
			অপেক্ষা করুন...
		</div>
	{/if}
</div>

<style>
	.dice-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		min-height: 180px;
	}

	.dice {
		width: clamp(70px, 18vw, 110px);
		height: clamp(70px, 18vw, 110px);
		perspective: 600px;
		transition: transform 0.3s ease;
	}

	.dice.rolling {
		animation: roll 0.15s ease-in-out infinite;
	}

	.dice.result-bounce {
		animation: resultBounce 0.5s ease-out;
	}

	.dice-face {
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
	}

	.roll-button {
		background: linear-gradient(135deg, #2E7D32, #1B5E20);
		color: white;
		border: 2px solid #D4AF37;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.9rem, 2vw, 1.1rem);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.roll-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
	}

	.roll-button:active {
		transform: translateY(0);
	}

	.rolling-text,
	.waiting-text {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: clamp(0.9rem, 2vw, 1.1rem);
		color: #D4AF37;
		font-weight: 500;
	}

	@keyframes roll {
		0% {
			transform: rotateX(0deg) rotateY(0deg);
		}
		25% {
			transform: rotateX(90deg) rotateY(45deg);
		}
		50% {
			transform: rotateX(180deg) rotateY(90deg);
		}
		75% {
			transform: rotateX(270deg) rotateY(135deg);
		}
		100% {
			transform: rotateX(360deg) rotateY(180deg);
		}
	}

	@keyframes resultBounce {
		0% {
			transform: scale(0.8);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

</style>
