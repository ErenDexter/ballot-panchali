<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { io, type Socket } from 'socket.io-client';
	import { fade, fly, scale } from 'svelte/transition';

	// Import components
	import {
		Board,
		DiceRoller,
		PlayerPanel,
		WinnerModal,
		ActionLog,
		ConnectionStatus
	} from '$lib/components/game';

	import type {
		Player,
		GameStartedPayload,
		DiceRolledPayload,
		NextTurnPayload,
		GameOverPayload,
		JoinRoomResponse
	} from '$lib/types';
	import { getAvatarUrl } from '$lib/types';

	const roomCode = $page.params.code;
	const playerName = $page.url.searchParams.get('name') || 'খেলোয়াড়';

	// Socket and connection state
	let socket: Socket;
	let roomId = $state('');
	let authToken = $state('');
	let isHost = $state(false);
	let connectionStatus: 'connecting' | 'connected' | 'disconnected' = $state('connecting');

	// Game state
	let gameState: 'lobby' | 'playing' | 'finished' = $state('lobby');
	let players: Player[] = $state([]);
	let myId = $state('');
	let currentTurnPlayerId: string | null = $state(null);
	let isMyTurn = $state(false);
	let actionLog: string[] = $state([]);

	// Dice state
	let isRolling = $state(false);
	let showingResult = $state(false);  // Shows result for 2 seconds
	let lastDiceValue: number | null = $state(null);
	let currentRollerName: string | null = $state(null);  // Who rolled the dice

	// UI state
	let showCopied = $state(false);
	let errorMessage = $state('');
	let winner: Player | null = $state(null);

	// Session persistence
	function saveSession() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(
				`ballot_session_${roomCode}`,
				JSON.stringify({ roomId, authToken, myId, isHost, timestamp: Date.now() })
			);
		}
	}

	function loadSession() {
		if (typeof localStorage === 'undefined') return null;
		const data = localStorage.getItem(`ballot_session_${roomCode}`);
		if (!data) return null;
		try {
			const session = JSON.parse(data);
			// Session valid for 1 hour
			if (Date.now() - session.timestamp > 3600000) {
				localStorage.removeItem(`ballot_session_${roomCode}`);
				return null;
			}
			return session;
		} catch {
			return null;
		}
	}

	function clearSession() {
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(`ballot_session_${roomCode}`);
		}
	}

	// Socket connection
	function connectSocket() {
		const existingSession = loadSession();
		socket = io({ transports: ['websocket', 'polling'], reconnection: true });

		socket.on('connect', () => {
			connectionStatus = 'connected';
			socket.emit(
				'join_room',
				{ code: roomCode, playerName, authToken: existingSession?.authToken },
				(response: JoinRoomResponse) => {
					if (response.success) {
						roomId = response.roomId!;
						authToken = response.authToken!;
						myId = response.playerId!;
						isHost = response.isHost!;
						players = response.players!.map((p) => ({
							id: p.id,
							name: p.name,
							position: 0,
							ballots: 0,
							hasCompletedCircle: false,
							isAlive: true,
							isHost: p.isHost,
							isConnected: p.isConnected
						}));
						saveSession();
					} else {
						errorMessage = response.error || 'কক্ষে যোগদান ব্যর্থ';
					}
				}
			);
		});

		socket.on('disconnect', () => {
			connectionStatus = 'disconnected';
			actionLog = [...actionLog, 'সার্ভার থেকে সংযোগ বিচ্ছিন্ন...'];
		});

		socket.io.on('reconnect', () => {
			connectionStatus = 'connected';
			actionLog = [...actionLog, 'পুনরায় সংযুক্ত!'];
			const session = loadSession();
			socket.emit(
				'join_room',
				{ code: roomCode, playerName, authToken: session?.authToken },
				(response: JoinRoomResponse) => {
					if (response.success && response.players) {
						players = response.players.map((p) => ({
							...players.find((ep) => ep.id === p.id) || {
								position: 0,
								ballots: 0,
								hasCompletedCircle: false,
								isAlive: true
							},
							id: p.id,
							name: p.name,
							isHost: p.isHost,
							isConnected: p.isConnected
						}));
						myId = response.playerId!;
						isHost = response.isHost!;
					}
				}
			);
		});

		socket.on('error', (data: { message: string }) => {
			errorMessage = data.message;
			actionLog = [...actionLog, `ত্রুটি: ${data.message}`];
			setTimeout(() => (errorMessage = ''), 3000);
		});

		socket.on('player_joined', (data) => {
			players = data.players.map((p: any) => ({
				id: p.id,
				name: p.name,
				position: 0,
				ballots: 0,
				hasCompletedCircle: false,
				isAlive: true,
				isHost: p.isHost,
				isConnected: p.isConnected
			}));
			if (data.player.name !== playerName) {
				actionLog = [...actionLog, `${data.player.name} কক্ষে যোগ দিয়েছেন`];
			}
		});

		socket.on('player_disconnected', (data) => {
			actionLog = [...actionLog, `${data.playerName} সংযোগ বিচ্ছিন্ন`];
			players = players.map((p) => (p.id === data.playerId ? { ...p, isConnected: false } : p));
		});

		socket.on('player_reconnected', (data) => {
			actionLog = [...actionLog, `${data.playerName} পুনরায় সংযুক্ত`];
			players = players.map((p) => (p.id === data.playerId ? { ...p, isConnected: true } : p));
		});

		socket.on('game_started', (data: GameStartedPayload) => {
			gameState = 'playing';
			players = data.players.map((p) => ({
				id: p.id,
				name: p.name,
				position: p.position,
				ballots: p.ballots,
				hasCompletedCircle: p.hasCompletedCircle,
				isAlive: p.isAlive,
				isConnected: p.isConnected
			}));
			currentTurnPlayerId = data.currentTurn;
			myId = data.yourId;
			isMyTurn = currentTurnPlayerId === myId;
			saveSession();
			actionLog = [...actionLog, 'খেলা শুরু হয়েছে!'];
		});

		socket.on('dice_rolled', (data: DiceRolledPayload) => {
			// Show the result to all players
			lastDiceValue = data.diceValue;
			currentRollerName = data.playerName;
			isRolling = false;
			showingResult = true;

			// Update player position and ballots
			players = players.map((p) => {
				if (p.id === data.playerId) {
					return {
						...p,
						position: data.toPosition,
						ballots: p.ballots + data.ballotChange
					};
				}
				return p;
			});

			actionLog = [
				...actionLog,
				`${data.playerName} ${data.diceValue} পেয়েছেন। ${data.messageBn}`
			];

			// Keep showing result for 2 seconds so all players can see
			setTimeout(() => {
				showingResult = false;
				// Keep the dice value visible but clear the roller name
				currentRollerName = null;
			}, 2000);
		});

		socket.on('next_turn', (data: NextTurnPayload) => {
			players = data.players.map((p) => ({
				id: p.id,
				name: p.name,
				position: p.position,
				ballots: p.ballots,
				hasCompletedCircle: p.hasCompletedCircle,
				isAlive: p.isAlive,
				isConnected: p.isConnected
			}));
			currentTurnPlayerId = data.currentPlayer;
			isMyTurn = currentTurnPlayerId === myId;
			
			// Don't clear dice state here - let the 2-second timeout handle it
			// This allows the dice result to remain visible for all players

			const currentPlayer = players.find((p) => p.id === data.currentPlayer);
			if (currentPlayer) {
				actionLog = [...actionLog, `${currentPlayer.name}-এর পালা`];
			}
		});

		socket.on('game_over', (data: GameOverPayload) => {
			gameState = 'finished';
			players = data.players.map((p) => ({
				id: p.id,
				name: p.name,
				position: p.position,
				ballots: p.ballots,
				hasCompletedCircle: p.hasCompletedCircle,
				isAlive: p.isAlive,
				isConnected: p.isConnected
			}));
			winner = players.find((p) => p.id === data.winnerId) || null;
			actionLog = [...actionLog, data.messageBn];
			clearSession();
		});
	}

	onMount(connectSocket);
	onDestroy(() => socket?.disconnect());

	// Game actions
	function startGame() {
		socket.emit('start_game', { code: roomCode, authToken });
	}

	function rollDice() {
		if (!isMyTurn || isRolling || showingResult) return;
		isRolling = true;
		// Set our name as the roller (will be confirmed by server)
		currentRollerName = players.find(p => p.id === myId)?.name || null;
		socket.emit('roll_dice', { roomId, authToken });
	}

	function copyRoomCode() {
		navigator.clipboard.writeText(roomCode ?? '');
		showCopied = true;
		setTimeout(() => (showCopied = false), 2000);
	}

	function closeWinnerModal() {
		winner = null;
	}
</script>

<div class="ballot-bg min-h-screen text-[#F5F0E1]" style="font-family: 'Hind Siliguri', sans-serif;">
	<ConnectionStatus status={connectionStatus} />

	<!-- Error Toast -->
	{#if errorMessage}
		<div
			class="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border-2 border-[#D4AF37] bg-red-900/90 px-6 py-3 text-[#F5F0E1] shadow-lg"
			transition:fly={{ y: -20 }}
		>
			{errorMessage}
		</div>
	{/if}

	{#if gameState === 'lobby'}
		<!-- Lobby Screen -->
		<div class="container mx-auto max-w-3xl px-4 py-8 md:py-12" transition:fade>
			<!-- Header -->
			<div class="mb-8 text-center">
				<h1
					class="ballot-emblem mb-2 text-4xl font-bold text-[#D4AF37] md:text-5xl"
					style="font-family: 'Tiro Bangla', serif;"
				>
					ব্যালট পাঁচালী
				</h1>
				<div class="ornate-divider mx-auto my-4 max-w-xs">
					<span class="text-[#D4AF37]">✦</span>
				</div>
				<div class="flex flex-wrap items-center justify-center gap-4">
					<span class="text-lg text-[#F5F0E1]/80">কক্ষ:</span>
					<span class="text-2xl font-bold tracking-widest text-[#D4AF37]">{roomCode}</span>
					<button
						onclick={copyRoomCode}
						class="btn-secondary relative bg-transparent px-4 py-2 text-sm"
					>
						{#if showCopied}
							<span transition:scale>✓ কপি হয়েছে!</span>
						{:else}
							কোড কপি
						{/if}
					</button>
				</div>
			</div>

			<!-- Players List -->
			<div class="card-base mb-8">
				<h2 class="mb-4 text-center text-lg font-semibold text-[#D4AF37] md:text-xl">
					খেলোয়াড়গণ ({players.length}/4)
				</h2>

				<div class="grid gap-3 sm:grid-cols-2">
					{#each players as player, i}
						<div
							class="flex items-center gap-3 rounded-lg border border-[#D4AF37]/30 bg-[#2D1B1B]/50 p-3"
							class:opacity-50={!player.isConnected}
							transition:scale
						>
							<div class="relative">
								<img
									src={getAvatarUrl(player.name)}
									alt={player.name}
									class="h-12 w-12 rounded-full border-2 border-[#D4AF37]/50"
								/>
								{#if player.isHost}
									<span class="absolute -top-2 -right-2 text-lg">👑</span>
								{/if}
							</div>
							<div class="flex-1">
								<div class="font-semibold text-[#F5F0E1]">
									{player.name}
									{#if player.id === myId}
										<span class="text-sm text-[#D4AF37]">(আপনি)</span>
									{/if}
								</div>
								{#if !player.isConnected}
									<span class="text-xs text-red-400">সংযোগ বিচ্ছিন্ন</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Start Game / Waiting -->
			{#if players.length >= 2}
				{#if isHost}
					<button
						onclick={startGame}
						class="btn-primary golden-glow w-full py-4 text-lg md:text-xl"
					>
						🎲 খেলা শুরু করুন
					</button>
				{:else}
					<div class="card-base text-center text-[#F5F0E1]/70">
						<p class="text-lg">হোস্টের জন্য অপেক্ষা করছেন...</p>
					</div>
				{/if}
			{:else}
				<div class="card-base text-center text-[#F5F0E1]/70">
					<p class="text-lg">আরও খেলোয়াড়ের জন্য অপেক্ষা করছেন...</p>
					<p class="mt-2 text-sm">সর্বনিম্ন ২ জন খেলোয়াড় প্রয়োজন</p>
				</div>
			{/if}
		</div>
	{:else if gameState === 'playing' || gameState === 'finished'}
		<!-- Game Screen -->
		<div class="flex min-h-screen flex-col">
			<ActionLog logs={actionLog} />

			<!-- Main Game Area -->
			<div class="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
				<!-- Board Section -->
				<div class="flex flex-1 items-center justify-center">
					<Board {players} {currentTurnPlayerId} />
				</div>

				<!-- Side Panel -->
				<div class="flex flex-col gap-4 lg:w-80">
					<!-- Player Panel -->
					<PlayerPanel {players} {currentTurnPlayerId} {myId} />

					<!-- Dice Section -->
					<div class="card-base">
						<DiceRoller
							{isMyTurn}
							{isRolling}
							{showingResult}
							{lastDiceValue}
							{currentRollerName}
							onRoll={rollDice}
						/>
					</div>

					<!-- Current Turn Indicator -->
					<div class="card-base text-center">
						{#if isMyTurn}
							<p class="text-lg font-bold text-[#2E7D32]">আপনার পালা! 🎲</p>
						{:else}
							{@const currentPlayer = players.find((p) => p.id === currentTurnPlayerId)}
							<p class="text-[#F5F0E1]/80">
								{currentPlayer?.name || ''}-এর পালা
							</p>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Winner Modal -->
		{#if winner}
			<WinnerModal {winner} {players} onClose={closeWinnerModal} />
		{/if}
	{/if}
</div>

