<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import type { StoryPayload } from '$lib/types';
	import { playSound } from '$lib/sounds';

	// Import all story images statically
	import rumor2 from '$lib/assets/stories/Rumor/2.png';
	import rumor3 from '$lib/assets/stories/Rumor/3.png';
	import rumor4 from '$lib/assets/stories/Rumor/4.png';
	import rumor5 from '$lib/assets/stories/Rumor/5.png';
	import rumor6 from '$lib/assets/stories/Rumor/6.png';
	import rumor7 from '$lib/assets/stories/Rumor/7.png';
	import rumor8 from '$lib/assets/stories/Rumor/8.png';
	import rumor9 from '$lib/assets/stories/Rumor/9.png';

	import surprise12 from '$lib/assets/stories/Surprise/12.png';
	import surprise13 from '$lib/assets/stories/Surprise/13.png';

	import boycott25 from '$lib/assets/stories/Election_Boycott/25.png';
	import boycott26 from '$lib/assets/stories/Election_Boycott/26.png';
	import boycott27 from '$lib/assets/stories/Election_Boycott/27.png';
	import boycott28 from '$lib/assets/stories/Election_Boycott/28.png';
	import boycott29 from '$lib/assets/stories/Election_Boycott/29.png';
	import boycott30 from '$lib/assets/stories/Election_Boycott/30.png';
	import boycott31 from '$lib/assets/stories/Election_Boycott/31.png';
	import boycott32 from '$lib/assets/stories/Election_Boycott/32.png';
	import boycott33 from '$lib/assets/stories/Election_Boycott/33.png';
	import boycott34 from '$lib/assets/stories/Election_Boycott/34.png';

	import jail16 from '$lib/assets/stories/Jail/16.png';
	import jail17 from '$lib/assets/stories/Jail/17.png';
	import jail18 from '$lib/assets/stories/Jail/18.png';
	import jail19 from '$lib/assets/stories/Jail/19.png';
	import jail20 from '$lib/assets/stories/Jail/20.png';
	import jail21 from '$lib/assets/stories/Jail/21.png';
	import jail22 from '$lib/assets/stories/Jail/22.png';

	// Image mapping by story type and filename
	const IMAGE_MAP: Record<string, Record<string, string>> = {
		Rumor: {
			'2.png': rumor2,
			'3.png': rumor3,
			'4.png': rumor4,
			'5.png': rumor5,
			'6.png': rumor6,
			'7.png': rumor7,
			'8.png': rumor8,
			'9.png': rumor9
		},
		Surprise: {
			'12.png': surprise12,
			'13.png': surprise13
		},
		Election_Boycott: {
			'25.png': boycott25,
			'26.png': boycott26,
			'27.png': boycott27,
			'28.png': boycott28,
			'29.png': boycott29,
			'30.png': boycott30,
			'31.png': boycott31,
			'32.png': boycott32,
			'33.png': boycott33,
			'34.png': boycott34
		},
		Jail: {
			'16.png': jail16,
			'17.png': jail17,
			'18.png': jail18,
			'19.png': jail19,
			'20.png': jail20,
			'21.png': jail21,
			'22.png': jail22
		}
	};

	interface Props {
		story: StoryPayload;
		onClose: () => void;
	}

	let { story, onClose }: Props = $props();

	let currentIndex = $state(0);
	let touchStartX = $state(0);
	let touchEndX = $state(0);
	let isDragging = $state(false);

	// Get the actual image URLs for this story
	const imageUrls = $derived(
		story.images.map((img) => IMAGE_MAP[story.storyType]?.[img] || '')
	);

	const totalImages = $derived(imageUrls.length);

	function nextImage() {
		if (currentIndex < totalImages - 1) {
			currentIndex++;
			// Play story sound locally when changing page
			playSound('story');
		} else {
			onClose();
		}
	}

	function prevImage() {
		if (currentIndex > 0) {
			currentIndex--;
			// Play story sound locally when changing page
			playSound('story');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === ' ') {
			e.preventDefault();
			nextImage();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevImage();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	}

	// Touch/swipe handling
	function handlePointerDown(e: PointerEvent) {
		touchStartX = e.clientX;
		isDragging = true;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		touchEndX = e.clientX;
	}

	function handlePointerUp() {
		if (!isDragging) return;
		isDragging = false;

		const swipeThreshold = 50;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				// Swiped left - go next
				nextImage();
			} else {
				// Swiped right - go prev
				prevImage();
			}
		}

		touchStartX = 0;
		touchEndX = 0;
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="story-overlay" transition:fade={{ duration: 200 }}>
	<div
		class="story-container"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		role="dialog"
		aria-label="Story viewer"
	>
		<!-- Header -->
		<div class="story-header">
			<div class="story-info">
				<span class="story-title">{story.titleBn}</span>
				<span class="story-player">{story.playerName} এর গল্প</span>
			</div>
			<button class="close-btn" onclick={onClose} aria-label="Close story">
				✕
			</button>
		</div>

		<!-- Progress bar -->
		<div class="progress-bar">
			{#each imageUrls as _, i}
				<div
					class="progress-segment"
					class:active={i === currentIndex}
					class:completed={i < currentIndex}
				></div>
			{/each}
		</div>

		<!-- Image display -->
		<div class="image-container">
			{#key currentIndex}
				<img
					src={imageUrls[currentIndex]}
					alt={`Story image ${currentIndex + 1} of ${totalImages}`}
					class="story-image"
					transition:fly={{ x: 100, duration: 200 }}
					draggable="false"
				/>
			{/key}
		</div>

		<!-- Navigation arrows -->
		<button
			class="nav-btn nav-prev"
			onclick={prevImage}
			disabled={currentIndex === 0}
			aria-label="Previous image"
		>
			‹
		</button>
		<button
			class="nav-btn nav-next"
			onclick={nextImage}
			aria-label={currentIndex === totalImages - 1 ? 'Close story' : 'Next image'}
		>
			›
		</button>

		<!-- Page indicator -->
		<div class="page-indicator">
			{currentIndex + 1} / {totalImages}
		</div>

		<!-- Tap zones for mobile -->
		<div class="tap-zone tap-left" onclick={prevImage}></div>
		<div class="tap-zone tap-right" onclick={nextImage}></div>
	</div>
</div>

<style>
	.story-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		touch-action: none;
	}

	.story-container {
		position: relative;
		width: 100%;
		height: 100%;
		max-width: 600px;
		max-height: 100vh;
		display: flex;
		flex-direction: column;
		user-select: none;
	}

	.story-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
	}

	.story-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.story-title {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #d4af37;
	}

	.story-player {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.875rem;
		color: rgba(245, 240, 225, 0.8);
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: #f5f0e1;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		font-size: 1.25rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.progress-bar {
		display: flex;
		gap: 4px;
		padding: 0 1rem;
		position: absolute;
		top: 4.5rem;
		left: 0;
		right: 0;
		z-index: 10;
	}

	.progress-segment {
		flex: 1;
		height: 3px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		transition: background 0.3s;
	}

	.progress-segment.active {
		background: #d4af37;
	}

	.progress-segment.completed {
		background: rgba(212, 175, 55, 0.7);
	}

	.image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 5rem 0 3rem;
	}

	.story-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		border: 2px solid rgba(212, 175, 55, 0.5);
		color: #d4af37;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		font-size: 2rem;
		cursor: pointer;
		transition: all 0.2s;
		display: none;
		align-items: center;
		justify-content: center;
		line-height: 1;
		z-index: 20;
	}

	.nav-btn:hover:not(:disabled) {
		background: rgba(212, 175, 55, 0.2);
		border-color: #d4af37;
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-prev {
		left: 1rem;
	}

	.nav-next {
		right: 1rem;
	}

	/* Show arrows on desktop */
	@media (min-width: 768px) {
		.nav-btn {
			display: flex;
		}
	}

	.page-indicator {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.875rem;
		color: rgba(245, 240, 225, 0.7);
		background: rgba(0, 0, 0, 0.5);
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		z-index: 10;
	}

	/* Invisible tap zones for mobile navigation */
	.tap-zone {
		position: absolute;
		top: 5rem;
		bottom: 3rem;
		width: 30%;
		z-index: 5;
	}

	.tap-left {
		left: 0;
		cursor: w-resize;
	}

	.tap-right {
		right: 0;
		cursor: e-resize;
	}

	/* Hide tap zones on desktop where we show buttons */
	@media (min-width: 768px) {
		.tap-zone {
			display: none;
		}
	}
</style>

