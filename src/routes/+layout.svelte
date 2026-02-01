<script>
	import './layout.css';
	import genvoteLogo from '$lib/assets/genvote bd.png';
	import ifesLogo from '$lib/assets/IFES_Logo.png';

	let { children } = $props();
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
			</div>
		</div>
	</footer>
</div>
