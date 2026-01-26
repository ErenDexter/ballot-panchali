<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { io } from 'socket.io-client';
	import type { CreateRoomResponse } from '$lib/types';

	let playerName = $state('');
	let roomCode = $state('');
	let loading = $state(false);
	let error = $state('');

	// Store session data in localStorage
	function storeSession(code: string, data: any) {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(
				`ballot_session_${code}`,
				JSON.stringify({
					authToken: data.authToken,
					myId: data.playerId,
					roomId: data.roomId,
					isHost: data.isHost,
					timestamp: Date.now()
				})
			);
		}
	}

	async function createRoom() {
		if (!playerName.trim()) return;
		loading = true;
		error = '';

		const socket = io();
		socket.emit('create_room', { hostName: playerName }, (response: CreateRoomResponse) => {
			if (response.success) {
				storeSession(response.code!, response);
				socket.disconnect();
				goto(`/room/${response.code}?name=${encodeURIComponent(playerName)}`);
			} else {
				error = response.error || 'কক্ষ তৈরি করতে ব্যর্থ হয়েছে';
				loading = false;
			}
		});
	}

	async function joinRoom() {
		if (!playerName.trim() || !roomCode.trim()) return;
		loading = true;
		goto(`/room/${roomCode.toUpperCase()}?name=${encodeURIComponent(playerName)}`);
	}
</script>

<div class="ballot-bg flex min-h-screen items-center justify-center p-4">
	<!-- Decorative Corner Elements -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div class="absolute top-0 left-0 h-32 w-32 opacity-20">
			<svg viewBox="0 0 100 100" class="h-full w-full text-[#D4AF37]">
				<path d="M0,0 L100,0 L100,20 C50,20 20,50 20,100 L0,100 Z" fill="currentColor" />
			</svg>
		</div>
		<div class="absolute top-0 right-0 h-32 w-32 opacity-20" style="transform: scaleX(-1)">
			<svg viewBox="0 0 100 100" class="h-full w-full text-[#D4AF37]">
				<path d="M0,0 L100,0 L100,20 C50,20 20,50 20,100 L0,100 Z" fill="currentColor" />
			</svg>
		</div>
		<div class="absolute bottom-0 left-0 h-32 w-32 opacity-20" style="transform: scaleY(-1)">
			<svg viewBox="0 0 100 100" class="h-full w-full text-[#D4AF37]">
				<path d="M0,0 L100,0 L100,20 C50,20 20,50 20,100 L0,100 Z" fill="currentColor" />
			</svg>
		</div>
		<div class="absolute right-0 bottom-0 h-32 w-32 opacity-20" style="transform: scale(-1)">
			<svg viewBox="0 0 100 100" class="h-full w-full text-[#D4AF37]">
				<path d="M0,0 L100,0 L100,20 C50,20 20,50 20,100 L0,100 Z" fill="currentColor" />
			</svg>
		</div>
	</div>

	<div class="relative z-10 w-full max-w-2xl" transition:fade>
		<!-- Title Section -->
		<div class="mb-12 text-center">
			<!-- Ballot Box Icon -->
			<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
				<div class="ballot-emblem text-6xl">🗳️</div>
			</div>

			<!-- Game Title -->
			<h1
				class="ballot-emblem mb-4 text-5xl font-bold text-[#D4AF37] md:text-7xl"
				style="font-family: 'Tiro Bangla', 'Hind Siliguri', serif;"
				transition:scale
			>
				ব্যালট পাঁচালী
			</h1>

			<!-- Subtitle -->
			<p class="text-lg text-[#F5F0E1]/80" style="font-family: 'Hind Siliguri', sans-serif;">
				নির্বাচনী সচেতনতার খেলা
			</p>

			<!-- Ornate Divider -->
			<div class="ornate-divider mx-auto mt-6 max-w-xs">
				<span class="text-[#D4AF37]">✦</span>
			</div>
		</div>

		<!-- Main Card -->
		<div class="card-base space-y-6">
			<!-- Player Name Input -->
			<div>
				<label
					for="name"
					class="mb-2 block text-sm font-medium text-[#F5F0E1]/90"
					style="font-family: 'Hind Siliguri', sans-serif;"
				>
					আপনার নাম
				</label>
				<input
					id="name"
					type="text"
					bind:value={playerName}
					placeholder="এখানে আপনার নাম লিখুন"
					class="ballot-input"
				/>
			</div>

			<!-- Error Message -->
			{#if error}
				<div
					class="rounded-lg border border-red-500/50 bg-red-900/30 px-4 py-3 text-center text-red-300"
					transition:fade
				>
					{error}
				</div>
			{/if}

			<!-- Create Room Button -->
			<button
				onclick={createRoom}
				disabled={loading || !playerName.trim()}
				class="btn-primary w-full py-4 text-lg"
			>
				{#if loading}
					<span class="inline-block animate-spin">🗳️</span> তৈরি হচ্ছে...
				{:else}
					🏠 নতুন কক্ষ তৈরি করুন
				{/if}
			</button>

			<!-- Ornate Divider -->
			<div class="ornate-divider">
				<span class="bg-[#2D1B1B] px-4 text-sm text-[#D4AF37]">অথবা</span>
			</div>

			<!-- Join Room Section -->
			<div class="space-y-3">
				<label
					for="code"
					class="block text-sm font-medium text-[#F5F0E1]/90"
					style="font-family: 'Hind Siliguri', sans-serif;"
				>
					বিদ্যমান কক্ষে যোগ দিন
				</label>
				<div class="flex gap-3">
					<input
						id="code"
						type="text"
						bind:value={roomCode}
						placeholder="কক্ষ কোড"
						maxlength="6"
						class="ballot-input flex-1 text-center tracking-widest uppercase"
					/>
					<button
						onclick={joinRoom}
						disabled={loading || !playerName.trim() || !roomCode.trim()}
						class="btn-primary px-8 whitespace-nowrap"
					>
						যোগ দিন
					</button>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="mt-8 text-center">
			<p class="text-sm text-[#F5F0E1]/80" style="font-family: 'Hind Siliguri', sans-serif;">
				বন্ধুদের সাথে খেলতে কক্ষ কোড শেয়ার করুন
			</p>

			<!-- Game Info -->
			<div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#F5F0E1]/60">
				<span>👥 ২-৪ জন খেলোয়াড়</span>
				<span>🎲 ডাইস ভিত্তিক</span>
				<span>🗳️ ব্যালট সংগ্রহ</span>
			</div>

			<!-- Decorative Element -->
			<div class="mt-4 flex items-center justify-center gap-2 text-[#D4AF37]">
				<span>❧</span>
				<span class="text-xs">গণতন্ত্রে স্বাগতম</span>
				<span>❧</span>
			</div>
		</div>
	</div>
</div>
