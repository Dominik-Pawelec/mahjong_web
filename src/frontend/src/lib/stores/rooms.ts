import { writable } from 'svelte/store';

export type Room = {
	id: string;
	name: string;
	players: number;
};

export const rooms = writable<Room[]>([
	{ id: '1', name: 'Test lobby 1', players: 1 },
	{ id: '2', name: 'Test lobby 2', players: 3 }
]);
