import { writable } from 'svelte/store';

export type User = {
    username: string;
    avatarUrl?: string;
};

export const user = writable<User | null>(null);
