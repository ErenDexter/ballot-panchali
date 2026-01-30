// Sound effects utility for Ballot Panchali

// Import sound files
import diceSound from '$lib/assets/sounds/dice.mp3';
import turnSound from '$lib/assets/sounds/turn.mp3';
import gainSound from '$lib/assets/sounds/gain.mp3';
import loseSound from '$lib/assets/sounds/lose.mp3';
import jailSound from '$lib/assets/sounds/jail.mp3';
import winnerSound from '$lib/assets/sounds/winner.mp3';
import storySound from '$lib/assets/sounds/story.mp3';

// Sound name type
export type SoundName = 'dice' | 'turn' | 'gain' | 'lose' | 'jail' | 'winner' | 'story';

// Sound file mapping
const SOUNDS: Record<SoundName, string> = {
	dice: diceSound,
	turn: turnSound,
	gain: gainSound,
	lose: loseSound,
	jail: jailSound,
	winner: winnerSound,
	story: storySound
};

// Audio cache to avoid recreating audio elements
const audioCache: Map<SoundName, HTMLAudioElement> = new Map();

// Mute state
let isMuted = false;

/**
 * Initialize mute state from localStorage
 */
export function initSoundSettings(): void {
	if (typeof localStorage !== 'undefined') {
		isMuted = localStorage.getItem('ballot_sound_muted') === 'true';
	}
}

/**
 * Get current mute state
 */
export function getMuted(): boolean {
	return isMuted;
}

/**
 * Toggle mute state
 */
export function toggleMute(): boolean {
	isMuted = !isMuted;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('ballot_sound_muted', String(isMuted));
	}
	return isMuted;
}

/**
 * Set mute state
 */
export function setMuted(muted: boolean): void {
	isMuted = muted;
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('ballot_sound_muted', String(isMuted));
	}
}

/**
 * Play a sound effect
 */
export function playSound(name: SoundName): void {
	if (isMuted) return;
	if (typeof window === 'undefined') return;

	try {
		// Get or create audio element
		let audio = audioCache.get(name);
		if (!audio) {
			audio = new Audio(SOUNDS[name]);
			audio.volume = 0.5;
			audioCache.set(name, audio);
		}

		// Reset and play
		audio.currentTime = 0;
		audio.play().catch(() => {
			// Ignore autoplay errors - browser may block until user interaction
		});
	} catch {
		// Silently fail if audio is not supported
	}
}

/**
 * Preload all sounds (call after user interaction)
 */
export function preloadSounds(): void {
	if (typeof window === 'undefined') return;

	Object.keys(SOUNDS).forEach((name) => {
		const soundName = name as SoundName;
		if (!audioCache.has(soundName)) {
			const audio = new Audio(SOUNDS[soundName]);
			audio.volume = 0.5;
			audio.preload = 'auto';
			audioCache.set(soundName, audio);
		}
	});
}

