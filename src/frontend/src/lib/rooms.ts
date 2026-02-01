import { writable } from "svelte/store";
import type { GameRoom } from "@common/comms";

export const rooms = writable<GameRoom[]>([]);
