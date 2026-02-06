<script>
	import './layout.css';
	import { fade, scale } from 'svelte/transition';
	import genvoteLogo from '$lib/assets/genvote bd.png';
	import ifesLogo from '$lib/assets/IFES_Logo.png';

	let { children } = $props();

	let showCredits = $state(false);

	const creators = [
		{ name: 'Tashkia Tabassum Prerona', institution: 'University of Dhaka' },
		{ name: 'Abrar Faiaz Zihan', institution: 'University of Dhaka' },
		{ name: 'Naima Tarannum', institution: 'University of Dhaka' },
		{ name: 'Md. Imran Hasan Rafin', institution: 'University of Dhaka' },
		{ name: 'Maria Rahman', institution: 'University of Dhaka' }
	];
</script>

<svelte:head>
	<title>ব্যালট পাঁচালী - নির্বাচনী সচেতনতার খেলা</title>
	<meta
		name="description"
		content="বাংলাদেশের নির্বাচনী সচেতনতা বাড়াতে একটি মাল্টিপ্লেয়ার বোর্ড গেম"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="ballot-bg flex min-h-screen flex-col">
	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="mt-auto px-4 py-8">
		<div class="container mx-auto max-w-lg">
			<!-- Ornate top border -->
			<div class="mb-6 flex items-center justify-center gap-3">
				<div
					class="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
				></div>
				<span class="text-xs text-[#D4AF37]/60">✦</span>
				<div
					class="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
				></div>
			</div>

			<div class="flex flex-col items-center gap-4 text-center">
				<!-- Logos -->
				<div class="flex items-center justify-center gap-0">
					<img
						src={genvoteLogo}
						alt="GenVote BD Logo"
						class="h-12 w-auto drop-shadow-lg transition-transform hover:scale-105"
					/>
					<img
						src={ifesLogo}
						alt="IFES Logo"
						class="h-12 w-auto drop-shadow-lg transition-transform hover:scale-105"
					/>
				</div>

				<!-- Text -->
				<div class="space-y-1">
					<p class="text-sm font-medium text-[#D4AF37]">A GenVote Festival Hackathon Project</p>
					<p class="text-xs text-[#F5F0E1]/60">
						Supported by <span class="font-semibold text-[#F5F0E1]/80">IFES</span>
					</p>
				</div>

				<!-- Credits Button -->
				<button
					onclick={() => (showCredits = true)}
					class="credits-btn mt-2 text-xs text-[#D4AF37]/70 transition-colors hover:text-[#D4AF37]"
				>
					✦ Meet the Creators ✦
				</button>
			</div>
		</div>
	</footer>
</div>

<!-- Credits Modal -->
{#if showCredits}
	<div class="credits-overlay" transition:fade={{ duration: 200 }} onclick={() => (showCredits = false)}>
		<div class="credits-modal" transition:scale={{ duration: 250 }} onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<div class="credits-header">
				<span class="credits-icon">🎭</span>
				<h2 class="credits-title">The Creators</h2>
				<div class="credits-divider"></div>
			</div>

			<!-- Creator List -->
			<div class="credits-list">
				{#each creators as creator, i}
					<div
						class="creator-card"
						style="animation-delay: {i * 100}ms"
					>
						<div class="creator-rank">{i + 1}</div>
						<div class="creator-info">
							<span class="creator-name">{creator.name}</span>
							<span class="creator-institution">🎓 {creator.institution}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Close Button -->
			<button class="credits-close" onclick={() => (showCredits = false)}>
				Close
			</button>
		</div>
	</div>
{/if}

<style>
	.credits-btn {
		cursor: pointer;
		background: none;
		border: none;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-size: 0.7rem;
	}
	.credits-btn:hover {
		text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
	}

	.credits-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		padding: 1rem;
		backdrop-filter: blur(4px);
	}

	.credits-modal {
		background: linear-gradient(135deg, #2D1B1B, #1A1512);
		border: 2px solid #D4AF37;
		border-radius: 1.25rem;
		padding: 2rem 1.75rem;
		max-width: 420px;
		width: 100%;
		text-align: center;
		box-shadow:
			0 0 60px rgba(212, 175, 55, 0.2),
			0 25px 50px rgba(0, 0, 0, 0.5);
	}

	.credits-header {
		margin-bottom: 1.5rem;
	}

	.credits-icon {
		font-size: 2.5rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.credits-title {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #D4AF37;
		margin-bottom: 0.75rem;
		text-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
	}

	.credits-divider {
		height: 2px;
		background: linear-gradient(90deg, transparent, #D4AF37, transparent);
		margin: 0 2rem;
	}

	.credits-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1.5rem;
	}

	.creator-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0.85rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(212, 175, 55, 0.15);
		border-radius: 0.75rem;
		animation: fadeSlideIn 0.4s ease-out both;
		transition: background 0.2s, border-color 0.2s;
	}

	.creator-card:hover {
		background: rgba(212, 175, 55, 0.1);
		border-color: rgba(212, 175, 55, 0.4);
	}

	.creator-rank {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: linear-gradient(135deg, #D4AF37, #b8962e);
		color: #1A1512;
		font-weight: 700;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.creator-info {
		display: flex;
		flex-direction: column;
		text-align: left;
		gap: 0.15rem;
	}

	.creator-name {
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		color: #F5F0E1;
	}

	.creator-institution {
		font-size: 0.72rem;
		color: rgba(245, 240, 225, 0.55);
	}

	.credits-close {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
		color: #D4AF37;
		border: 1px solid rgba(212, 175, 55, 0.4);
		padding: 0.6rem 2rem;
		border-radius: 0.5rem;
		font-family: 'Hind Siliguri', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		letter-spacing: 0.05em;
	}

	.credits-close:hover {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(212, 175, 55, 0.2));
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
	}

	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
