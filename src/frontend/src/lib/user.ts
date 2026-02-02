import { writable } from 'svelte/store';
import type { UserData } from "@common/comms";

export const DEFAULT_NAME = "Mahjong Player"

export const user = writable<UserData>({
	name: DEFAULT_NAME,
});
