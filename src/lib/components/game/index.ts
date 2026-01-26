// Game components barrel export
export { default as Board } from './Board.svelte';
export { default as Tile } from './Tile.svelte';
export { default as PlayerToken } from './PlayerToken.svelte';
export { default as DiceRoller } from './DiceRoller.svelte';
export { default as PlayerPanel } from './PlayerPanel.svelte';
export { default as WinnerModal } from './WinnerModal.svelte';
export { default as ActionLog } from './ActionLog.svelte';
export { default as ConnectionStatus } from './ConnectionStatus.svelte';

// Re-export types
export type { BoardTile } from '$lib/game/board';

